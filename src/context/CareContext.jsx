import { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import {
  initialPatients,
  initialMedications,
  initialAppointments,
  initialCareCircle,
  initialTimeline,
  weeklyAdherenceData,
  vitalsTrendData
} from '../utils/mockData';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { medicationService } from '../services/medicationService';
import appointmentService, { getAppointmentReminder, normalizeAppointment } from '../services/appointmentService';
import careCircleService from '../services/careCircleService';
import emergencyService from '../services/emergencyService';
import emailService from '../services/emailService';
import healthProfileService from '../services/healthProfileService';
import refillService from '../services/refillService';
import vitalsService from '../services/vitalsService';
import doctorService from '../services/doctorService';
import voiceService from '../services/voiceService';
import { useAuth } from './AuthContext';

const defaultEmergencyContacts = [
  {
    id: 'em-1',
    name: 'Sarah Jenkins',
    relationship: 'Daughter & Primary Caregiver',
    phone: '(555) 782-9012',
    is_primary: true
  },
  {
    id: 'em-2',
    name: 'Dr. Robert Miller, MD',
    relationship: 'Attending Cardiologist',
    phone: '(555) 342-8901',
    is_primary: false
  },
  {
    id: 'em-3',
    name: 'David Vance',
    relationship: 'Son / Family Responder',
    phone: '(555) 612-4491',
    is_primary: false
  }
];

const CareContext = createContext(null);

export function CareProvider({ children }) {
  const { user, profile } = useAuth();

  const [patients, setPatients] = useState(initialPatients);
  const [activePatientId, setActivePatientId] = useState('pat-1');
  const [medications, setMedications] = useState(initialMedications);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [careCircle, setCareCircle] = useState(initialCareCircle);
  const [timeline, setTimeline] = useState(initialTimeline);
  const [vitalsHistory, setVitalsHistory] = useState(vitalsTrendData);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isSosActive, setIsSosActive] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(isSupabaseConfigured);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState(defaultEmergencyContacts);
  const [emergencyEventDetails, setEmergencyEventDetails] = useState(null);
  const [preferredLanguage, setPreferredLanguage] = useState('en-US'); // 'en-US' | 'hi-IN'
  const [vitalsLogs, setVitalsLogs] = useState([]);
  const [refillLogs, setRefillLogs] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Dose Taken: Lisinopril 10mg',
      time: '8:15 AM',
      type: 'success',
      read: false
    },
    {
      id: 'notif-2',
      title: 'Refill Warning: Atorvastatin (4 days left)',
      time: '9:00 AM',
      type: 'warning',
      read: false
    },
    {
      id: 'notif-3',
      title: 'Upcoming Visit: Dr. Robert Miller (Nov 20)',
      time: 'Yesterday',
      type: 'info',
      read: true
    }
  ]);

  // Load live data from Supabase for the current authenticated user/patient
  const fetchSupabaseData = useCallback(async () => {
    if (!isSupabaseConfigured || !user) return;

    await Promise.resolve();
    setDataLoading(true);

    try {
      // 1. Fetch Medications from Supabase
      const { data: dbMeds, error: medsError } = await supabase
        .from('medications')
        .select('*')
        .order('created_at', { ascending: false });

      if (!medsError && dbMeds && dbMeds.length > 0) {
        // Map database records to UI structure with full inventory tracking
        const mappedMeds = dbMeds.map(m => {
          const currentQty = Number(m.current_quantity ?? m.pills_remaining ?? 30);
          const initialQty = Number(m.initial_quantity ?? m.total_pills ?? 30);
          const threshold = Number(m.refill_threshold ?? 5);
          const units = m.units || m.route_or_form || 'tablets';

          return {
            id: m.id,
            patientId: m.patient_id || 'pat-1',
            name: m.name,
            dosage: m.dosage,
            form: m.route_or_form || 'Tablet',
            units,
            frequency: m.frequency,
            timeSlot: m.scheduled_times?.[0] ? 'Scheduled' : 'Daily',
            timeScheduled: m.scheduled_times?.[0] || '08:00 AM',
            purpose: m.purpose || 'Prescription',
            instructions: m.instructions || 'Take as prescribed',
            doctor: m.prescribing_doctor || 'Clinician',
            status: 'pending',
            takenAt: null,
            currentQuantity: currentQty,
            current_quantity: currentQty,
            initialQuantity: initialQty,
            initial_quantity: initialQty,
            pillsRemaining: currentQty,
            pills_remaining: currentQty,
            totalPills: initialQty,
            total_pills: initialQty,
            refillThreshold: threshold,
            refill_threshold: threshold,
            expiryDate: m.expiry_date || null,
            expiry_date: m.expiry_date || null,
            lastRefillDate: m.last_refill_date || m.created_at,
            last_refill_date: m.last_refill_date || m.created_at,
            needsRefill: currentQty <= threshold
          };
        });
        setMedications(mappedMeds);
      }

      // 2. Fetch Appointments from Supabase
      if (user?.id) {
        const { data: dbApts, error: aptsError } = await appointmentService.getAppointments(
          user.id,
          profile?.full_name || 'Sarah Jenkins'
        );
        if (!aptsError && dbApts && dbApts.length > 0) {
          setAppointments(dbApts);
        } else {
          // Enrich fallback appointments with dynamic reminders
          setAppointments(prev =>
            prev.map(apt => ({
              ...apt,
              reminder: apt.reminder || getAppointmentReminder(apt.appointmentDate || apt.date)
            }))
          );
        }
      } else {
        const { data: dbApts } = await supabase
          .from('appointments')
          .select('*')
          .order('appointment_date', { ascending: true });

        if (dbApts && dbApts.length > 0) {
          const mappedApts = dbApts.map(a =>
            normalizeAppointment(a, profile?.full_name || 'Sarah Jenkins')
          );
          setAppointments(mappedApts);
        } else {
          setAppointments(prev =>
            prev.map(apt => ({
              ...apt,
              reminder: apt.reminder || getAppointmentReminder(apt.appointmentDate || apt.date)
            }))
          );
        }
      }

      // 3. Fetch Notifications from Supabase
      const { data: dbNotifs, error: notifsError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!notifsError && dbNotifs && dbNotifs.length > 0) {
        const mappedNotifs = dbNotifs.map(n => ({
          id: n.id,
          title: n.title,
          time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: n.type || 'info',
          read: Boolean(n.is_read)
        }));
        setNotifications(mappedNotifs);
      }

      // 4. Fetch Care Circle Members and Pending Invitations
      if (user?.id) {
        const { data: dbMembers } = await careCircleService.getCareCircleMembers(user.id);
        if (dbMembers && dbMembers.length > 0) {
          setCareCircle(dbMembers);
        }

        const { data: dbInvites } = await careCircleService.getPendingInvitations(user.id);
        if (dbInvites) {
          setPendingInvitations(dbInvites);
        }

        // 5. Fetch Activity Timeline from dose_logs and appointments
        const { data: dbTimeline } = await careCircleService.fetchActivityTimeline(user.id);
        if (dbTimeline && dbTimeline.length > 0) {
          setTimeline(prev => [
            ...dbTimeline,
            ...prev.filter(p => !p.id.startsWith('dose-event-'))
          ]);
        }

        // 6. Fetch Emergency Contacts
        const { data: emContacts } = await emergencyService.getEmergencyContacts(
          user.id,
          defaultEmergencyContacts
        );
        if (emContacts && emContacts.length > 0) {
          setEmergencyContacts(emContacts);
        }

        // 7. Fetch Health Profile
        const { data: healthProf } = await healthProfileService.getHealthProfile(user.id);
        if (healthProf) {
          setPatients(prev =>
            prev.map(p =>
              p.id === activePatientId
                ? {
                    ...p,
                    bloodType: healthProf.blood_type || p.bloodType,
                    primaryCondition: healthProf.primary_condition || p.primaryCondition,
                    allergies: healthProf.allergies?.length ? healthProf.allergies : p.allergies,
                    existing_conditions: healthProf.existing_conditions || p.existing_conditions,
                    medical_history: healthProf.medical_history || p.medical_history,
                    homeAddress: healthProf.home_address || p.homeAddress,
                    lockboxCode: healthProf.lockbox_code || p.lockboxCode,
                    advance_directives: healthProf.advance_directives || p.advance_directives,
                    emergency_notes: healthProf.emergency_notes || p.emergency_notes,
                    weight_kg: healthProf.weight_kg ?? p.weight_kg
                  }
                : p
            )
          );
        }
      }

      // 8. Fetch Vitals Logs, Refill Logs & Doctor Directory (works with user or fallback patient)
      const patientTargetId = activePatientId || user?.id || 'pat-1';
      const [vitalsRes, refillRes, doctorsRes] = await Promise.all([
        vitalsService.getVitalsLogs(patientTargetId),
        refillService.getRefillHistory(patientTargetId),
        doctorService.getDoctors(patientTargetId)
      ]);

      if (vitalsRes?.data && vitalsRes.data.length > 0) {
        setVitalsLogs(vitalsRes.data);
        const chartPoints = [...vitalsRes.data]
          .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at))
          .slice(-14)
          .map(v => ({
            name: new Date(v.recorded_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            time: new Date(v.recorded_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            date: new Date(v.recorded_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            systolic: v.systolic_bp || 120,
            diastolic: v.diastolic_bp || 80,
            glucose: v.blood_sugar || 105,
            heartRate: v.heart_rate || 72,
            weight: v.weight || v.weight_kg || 68.5,
            temperature: v.temperature || 98.4
          }));
        if (chartPoints.length > 0) setVitalsHistory(chartPoints);

        const latest = vitalsRes.data[0];
        setPatients(prev =>
          prev.map(p => {
            if (p.id === activePatientId || (!p.id && activePatientId === 'pat-1')) {
              return {
                ...p,
                vitals: {
                  ...p.vitals,
                  bloodPressure: `${latest.systolic_bp || 120}/${latest.diastolic_bp || 80} mmHg`,
                  heartRate: `${latest.heart_rate || 72} bpm`,
                  bloodGlucose: `${latest.blood_sugar || 105} mg/dL`,
                  weight: `${latest.weight || latest.weight_kg || 68.4} kg`,
                  temperature: `${latest.temperature || 98.4} °F`,
                  lastUpdated: new Date(latest.recorded_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
                }
              };
            }
            return p;
          })
        );
      }
      if (refillRes?.data) setRefillLogs(refillRes.data);
      if (doctorsRes?.data) setDoctors(docs => (doctorsRes.data.length ? doctorsRes.data : docs));

      setDbConnected(true);
    } catch (err) {
      console.warn('Could not sync live tables with Supabase, using local state:', err);
    } finally {
      setDataLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    fetchSupabaseData();

    if (!user?.id) return;

    // Realtime channel for live multi-user synchronization
    const subscription = careCircleService.subscribeToCareCircleUpdates(user.id, (table) => {
      console.info(`[Realtime Sync] Change detected on ${table}, refreshing CareCircle state`);
      fetchSupabaseData();
    });

    setIsRealtimeActive(true);

    return () => {
      subscription.unsubscribe();
      setIsRealtimeActive(false);
    };
  }, [fetchSupabaseData, user]);

  const activePatient = useMemo(() => {
    return patients.find(p => p.id === activePatientId) || patients[0] || initialPatients[0];
  }, [patients, activePatientId]);

  const patientMedications = useMemo(() => {
    if (user?.id) {
      const userMeds = medications.filter(m => m.patientId === user.id || m.patient_id === user.id);
      if (userMeds.length > 0) return userMeds;
    }
    return medications.filter(m => m.patientId === activePatientId || !m.patientId || m.patientId === 'pat-1');
  }, [medications, activePatientId, user]);

  const patientAppointments = useMemo(() => {
    if (user?.id) {
      const userApts = appointments.filter(a => a.patientId === user.id || a.patient_id === user.id);
      if (userApts.length > 0) return userApts;
    }
    return appointments.filter(a => a.patientId === activePatientId || !a.patientId || a.patientId === 'pat-1');
  }, [appointments, activePatientId, user]);

  // Medication action: mark as taken, pending, or missed (with duplicate prevention)
  const toggleMedicationStatus = async (id, newStatus) => {
    const targetMed = medications.find(m => m.id === id);
    if (!targetMed) return;

    // Duplicate prevention: If already marked with this exact status, notify and prevent duplicate action
    if (targetMed.status === newStatus && newStatus === 'taken') {
      console.info(`Dose already recorded as taken for ${targetMed.name}.`);
      return;
    }

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let calculatedRemaining = targetMed.currentQuantity ?? targetMed.pillsRemaining ?? 30;
    const threshold = targetMed.refillThreshold ?? targetMed.refill_threshold ?? 5;
    const units = targetMed.units || targetMed.form || 'tablets';

    if (newStatus === 'taken' && targetMed.status !== 'taken') {
      calculatedRemaining = Math.max(0, calculatedRemaining - 1);
    } else if (newStatus !== 'taken' && targetMed.status === 'taken') {
      const initialMax = targetMed.initialQuantity ?? targetMed.totalPills ?? 100;
      calculatedRemaining = Math.min(initialMax, calculatedRemaining + 1);
    }

    setMedications(prev =>
      prev.map(med => {
        if (med.id === id) {
          return {
            ...med,
            status: newStatus,
            takenAt: newStatus === 'taken' ? timeFormatted : null,
            currentQuantity: calculatedRemaining,
            current_quantity: calculatedRemaining,
            pillsRemaining: calculatedRemaining,
            pills_remaining: calculatedRemaining,
            needsRefill: calculatedRemaining <= threshold
          };
        }
        return med;
      })
    );

    const actionText =
      newStatus === 'taken'
        ? `Marked ${targetMed.name} as Taken (Stock: ${calculatedRemaining} ${units})`
        : newStatus === 'missed'
        ? `Flagged ${targetMed.name} as Skipped`
        : `Reset ${targetMed.name} to Pending`;

    const newTimelineItem = {
      id: `time-${now.getTime()}`,
      timestamp: 'Just now',
      author: profile?.full_name || 'Caregiver',
      authorRole: profile?.role === 'patient' ? 'Patient' : 'Caregiver',
      action: actionText,
      description: `${targetMed.dosage} ${targetMed.form} (${targetMed.timeSlot || 'Scheduled'}). Remaining inventory: ${calculatedRemaining} ${units}.`,
      iconType: 'medication',
      status: newStatus === 'taken' ? 'success' : newStatus === 'missed' ? 'danger' : 'info'
    };

    setTimeline(prev => [newTimelineItem, ...prev]);

    // Check low stock condition and notify caregivers
    if (newStatus === 'taken' && calculatedRemaining <= threshold) {
      const isOut = calculatedRemaining === 0;
      addNotification({
        title: isOut
          ? `Out of Stock: ${targetMed.name}`
          : `Low Stock Alert: ${targetMed.name}`,
        message: `${targetMed.name} has ${calculatedRemaining} ${units} remaining (threshold: ${threshold}). Care team notified to re-order.`,
        type: isOut ? 'danger' : 'warning',
        actionUrl: '/medications'
      });

      // Add Caregiver Notification into Activity Timeline
      setTimeline(prev => [
        {
          id: `time-stock-${now.getTime()}`,
          timestamp: 'Just now',
          author: 'CareCircle Safety Monitor',
          authorRole: 'Automated Pharmacy Agent',
          action: isOut ? 'Prescription Out of Stock' : 'Low Stock Caregiver Alert Dispatched',
          description: `Inventory for ${targetMed.name} reached ${calculatedRemaining} ${units}. Authorized family caregivers alerted for prescription refill.`,
          iconType: 'medication',
          status: isOut ? 'danger' : 'warning'
        },
        ...prev
      ]);
    }

    // Update inventory stock and record dose in Supabase
    if (isSupabaseConfigured && user) {
      await medicationService.recordDose({
        medicationId: id,
        patientId: user.id,
        scheduledAt: now.toISOString(),
        status: newStatus,
        recordedBy: user.id,
        notes: `Logged via CareCircle: ${actionText}`
      });

      // Verify if database trigger already updated current_quantity
      const { data: currentMed } = await supabase
        .from('medications')
        .select('current_quantity, pills_remaining')
        .eq('id', id)
        .maybeSingle();

      // If DB trigger did not adjust it (e.g. migration not applied), ensure accurate sync to calculatedRemaining
      if (currentMed && currentMed.current_quantity !== calculatedRemaining) {
        await supabase
          .from('medications')
          .update({
            current_quantity: calculatedRemaining,
            pills_remaining: calculatedRemaining,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      }
    }

    // Trigger automated missed dose alert if configured in notification preferences
    if (newStatus === 'missed') {
      try {
        const prefs = emailService.getPreferences();
        const targetEmail = prefs.recipientEmail || user?.email;
        if (prefs.enabled && prefs.missedDoses && targetEmail) {
          emailService.sendMissedMedicationAlert({
            toEmail: targetEmail,
            toName: profile?.full_name || 'Caregiver',
            patientName: activePatient.name,
            medicationName: targetMed.name,
            dosage: targetMed.dosage,
            scheduledTime: targetMed.scheduledTime || targetMed.timeSlot || 'Scheduled time',
            instructions: targetMed.instructions
          }).catch(err => {
            console.warn('Background missed dose email transmission caught:', err);
          });
        }
      } catch (err) {
        console.warn('Failed to dispatch missed dose notification:', err);
      }
    }
  };

  const addMedication = async (newMed) => {
    const tempId = `med-${Date.now()}`;
    const targetPatientId = user?.id || activePatientId;
    const medItem = {
      ...newMed,
      id: tempId,
      patientId: targetPatientId,
      patient_id: targetPatientId,
      status: 'pending',
      takenAt: null
    };

    setMedications(prev => [medItem, ...prev]);

    setTimeline(prev => [
      {
        id: `time-${Date.now()}`,
        timestamp: 'Just now',
        author: profile?.full_name || 'Caregiver',
        authorRole: 'Caregiver',
        action: `Added New Prescription: ${newMed.name}`,
        description: `${newMed.dosage} - ${newMed.instructions}`,
        iconType: 'prescription',
        status: 'success'
      },
      ...prev
    ]);

    // Persist to Supabase if logged in
    if (isSupabaseConfigured && user) {
      const res = await medicationService.addMedication({
        ...newMed,
        patient_id: user.id
      });
      if (res?.data?.id) {
        setMedications(prev => prev.map(m => (m.id === tempId ? { ...m, ...res.data, id: res.data.id, patientId: user.id, patient_id: user.id } : m)));
      }
    }
  };

  const updateMedication = async (id, updatedData) => {
    setMedications(prev =>
      prev.map(med => {
        if (med.id === id) {
          const remaining =
            updatedData.currentQuantity ??
            updatedData.current_quantity ??
            updatedData.pillsRemaining ??
            updatedData.pills_remaining ??
            med.currentQuantity ??
            30;
          const threshold =
            updatedData.refillThreshold ??
            updatedData.refill_threshold ??
            med.refillThreshold ??
            5;
          return {
            ...med,
            ...updatedData,
            form: updatedData.form || updatedData.route_or_form || med.form,
            currentQuantity: remaining,
            current_quantity: remaining,
            pillsRemaining: remaining,
            pills_remaining: remaining,
            refillThreshold: threshold,
            refill_threshold: threshold,
            needsRefill: remaining <= threshold
          };
        }
        return med;
      })
    );

    setTimeline(prev => [
      {
        id: `time-${Date.now()}`,
        timestamp: 'Just now',
        author: profile?.full_name || 'Caregiver',
        authorRole: 'Caregiver',
        action: `Updated Prescription: ${updatedData.name}`,
        description: `Dosage: ${updatedData.dosage}, ${updatedData.frequency}.`,
        iconType: 'prescription',
        status: 'info'
      },
      ...prev
    ]);

    if (isSupabaseConfigured && user) {
      await medicationService.updateMedication(id, updatedData);
    }
  };

  const deleteMedication = async (id) => {
    const targetMed = medications.find(m => m.id === id);
    setMedications(prev => prev.filter(m => m.id !== id));

    if (targetMed) {
      setTimeline(prev => [
        {
          id: `time-${Date.now()}`,
          timestamp: 'Just now',
          author: profile?.full_name || 'Caregiver',
          authorRole: 'Caregiver',
          action: `Discontinued Prescription: ${targetMed.name}`,
          description: `Removed ${targetMed.dosage} from schedule.`,
          iconType: 'prescription',
          status: 'warning'
        },
        ...prev
      ]);
    }

    if (isSupabaseConfigured && user) {
      await medicationService.deleteMedication(id);
    }
  };

  const addAppointment = async (newApt) => {
    const tempId = `apt-${Date.now()}`;
    const reminder = getAppointmentReminder(newApt.date);
    const aptItem = {
      ...newApt,
      id: tempId,
      patientId: user?.id || activePatientId,
      doctor: newApt.doctor || newApt.doctor_name,
      doctor_name: newApt.doctor || newApt.doctor_name,
      facility: newApt.facility || newApt.location || 'Clinic',
      location: newApt.facility || newApt.location || 'Clinic',
      status: newApt.status || 'Upcoming',
      reminder
    };

    setAppointments(prev => [aptItem, ...prev]);

    setTimeline(prev => [
      {
        id: `time-${Date.now()}`,
        timestamp: 'Just now',
        author: profile?.full_name || 'Caregiver',
        authorRole: 'Caregiver',
        action: `Booked Appointment with ${newApt.doctor || newApt.doctor_name}`,
        description: `${newApt.specialty} scheduled for ${newApt.displayDate || newApt.date} at ${newApt.time}.`,
        iconType: 'calendar',
        status: 'info'
      },
      ...prev
    ]);

    if (isSupabaseConfigured && user) {
      try {
        const { data, error } = await appointmentService.addAppointment(user.id, newApt);
        if (!error && data) {
          setAppointments(prev => prev.map(a => (a.id === tempId ? data : a)));
        }
      } catch (err) {
        console.warn('Appointment insert into Supabase deferred:', err);
      }
    }
  };

  const updateAppointment = async (aptId, updatedFields) => {
    const reminder = getAppointmentReminder(updatedFields.date || updatedFields.appointmentDate);
    setAppointments(prev =>
      prev.map(a =>
        a.id === aptId
          ? {
              ...a,
              ...updatedFields,
              doctor: updatedFields.doctor || updatedFields.doctor_name || a.doctor,
              facility: updatedFields.facility || updatedFields.location || a.facility,
              reminder
            }
          : a
      )
    );

    setTimeline(prev => [
      {
        id: `time-${Date.now()}`,
        timestamp: 'Just now',
        author: profile?.full_name || 'Caregiver',
        authorRole: 'Caregiver',
        action: `Updated Appointment (${updatedFields.doctor || 'Doctor Visit'})`,
        description: `Status updated to ${updatedFields.status || 'Scheduled'}.`,
        iconType: 'calendar',
        status: 'info'
      },
      ...prev
    ]);

    if (isSupabaseConfigured && user) {
      try {
        const { data, error } = await appointmentService.updateAppointment(aptId, updatedFields);
        if (!error && data) {
          setAppointments(prev => prev.map(a => (a.id === aptId ? data : a)));
        }
      } catch (err) {
        console.warn('Appointment update in Supabase deferred:', err);
      }
    }
  };

  const deleteAppointment = async (aptId) => {
    const target = appointments.find(a => a.id === aptId);
    setAppointments(prev => prev.filter(a => a.id !== aptId));

    setTimeline(prev => [
      {
        id: `time-${Date.now()}`,
        timestamp: 'Just now',
        author: profile?.full_name || 'Caregiver',
        authorRole: 'Caregiver',
        action: `Removed Appointment (${target?.doctor || 'Doctor Visit'})`,
        description: `Cancelled from clinical schedule.`,
        iconType: 'calendar',
        status: 'danger'
      },
      ...prev
    ]);

    if (isSupabaseConfigured && user) {
      try {
        await appointmentService.deleteAppointment(aptId);
      } catch (err) {
        console.warn('Appointment delete in Supabase deferred:', err);
      }
    }
  };

  const addCareMember = async (newMember) => {
    const tempId = `care-${Date.now()}`;
    const memberItem = {
      ...newMember,
      id: tempId,
      activeStatus: 'Invited recently'
    };
    setCareCircle(prev => [...prev, memberItem]);
  };

  const inviteCareMember = async (inviteData) => {
    const targetPatientId = user?.id || activePatientId;
    const { data: invite, error } = await careCircleService.createInvitation({
      patientId: targetPatientId,
      invitedEmail: inviteData.email,
      invitedName: inviteData.name,
      relationship: inviteData.relationship,
      permissionRole: inviteData.permissionRole,
      isEmergencyContact: inviteData.isEmergencyContact,
      createdById: user?.id
    });

    if (error) throw error;

    if (invite) {
      setPendingInvitations(prev => [invite, ...prev]);

      // Optimistically add member card with invited status
      const tempMember = {
        id: `invite-${invite.invite_code || Date.now()}`,
        name: inviteData.name || inviteData.email,
        role: inviteData.relationship || 'Invited Caregiver',
        relationship: inviteData.relationship,
        permissionRole: inviteData.permissionRole,
        permissions:
          inviteData.permissionRole === 'admin'
            ? 'Full Admin Access'
            : inviteData.permissionRole === 'viewer'
            ? 'View Only (Read-only)'
            : 'Can Edit Schedules & Log Meds',
        category: 'Family',
        phone: '(Invitation Pending)',
        email: inviteData.email,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        isEmergencyContact: Boolean(inviteData.isEmergencyContact),
        activeStatus: 'Invitation Sent',
        joinedAt: new Date().toISOString()
      };
      setCareCircle(prev => [...prev, tempMember]);

      setTimeline(prev => [
        {
          id: `time-${Date.now()}`,
          timestamp: 'Just now',
          author: profile?.full_name || 'Caregiver',
          authorRole: 'Caregiver',
          action: `Invited ${inviteData.name || inviteData.email}`,
          description: `Generated secure invite passcode ${invite.invite_code} with ${inviteData.permissionRole.toUpperCase()} permissions.`,
          iconType: 'visit',
          status: 'info'
        },
        ...prev
      ]);
    }

    return invite;
  };

  const acceptCareCircleInvite = async (inviteCode) => {
    const { success, invitation } = await careCircleService.acceptInvitation({
      inviteCode,
      userId: user?.id,
      userProfile: profile
    });

    if (success) {
      await fetchSupabaseData();
      setTimeline(prev => [
        {
          id: `time-${Date.now()}`,
          timestamp: 'Just now',
          author: profile?.full_name || 'New Member',
          authorRole: 'Caregiver',
          action: 'Joined Patient Care Circle',
          description: `Access granted via secure pass key.`,
          iconType: 'visit',
          status: 'success'
        },
        ...prev
      ]);
    }

    return invitation;
  };

  const updateCareMemberRole = async (circleId, newRole) => {
    setCareCircle(prev =>
      prev.map(m =>
        (m.circleId === circleId || m.id === circleId)
          ? {
              ...m,
              permissionRole: newRole,
              permissions:
                newRole === 'admin'
                  ? 'Full Admin Access'
                  : newRole === 'viewer'
                  ? 'View Only (Read-only)'
                  : 'Can Edit Schedules & Log Meds'
            }
          : m
      )
    );

    await careCircleService.updateMemberRole({ circleId, newRole });

    setTimeline(prev => [
      {
        id: `time-${Date.now()}`,
        timestamp: 'Just now',
        author: profile?.full_name || 'Caregiver',
        authorRole: 'Caregiver',
        action: 'Updated Caregiver Permissions',
        description: `Modified role authorization to ${newRole.toUpperCase()} in database.`,
        iconType: 'visit',
        status: 'info'
      },
      ...prev
    ]);
  };

  const removeCareMember = async (circleId) => {
    const target = careCircle.find(m => m.circleId === circleId || m.id === circleId);
    setCareCircle(prev => prev.filter(m => m.circleId !== circleId && m.id !== circleId));

    await careCircleService.removeMember(circleId);

    setTimeline(prev => [
      {
        id: `time-${Date.now()}`,
        timestamp: 'Just now',
        author: profile?.full_name || 'Caregiver',
        authorRole: 'Caregiver',
        action: `Removed Member from Care Circle`,
        description: `Revoked access for ${target?.name || 'Caregiver'}.`,
        iconType: 'emergency',
        status: 'danger'
      },
      ...prev
    ]);
  };

  const addVitalsRecord = (record) => {
    setVitalsHistory(prev => [...prev, record]);

    setPatients(prev =>
      prev.map(p => {
        if (p.id === activePatientId) {
          return {
            ...p,
            vitals: {
              ...p.vitals,
              bloodPressure: `${record.systolic}/${record.diastolic} mmHg`,
              heartRate: `${record.heartRate} bpm`,
              bloodGlucose: `${record.glucose} mg/dL`,
              lastUpdated: 'Just now'
            }
          };
        }
        return p;
      })
    );

    setTimeline(prev => [
      {
        id: `time-${Date.now()}`,
        timestamp: 'Just now',
        author: profile?.full_name || 'Caregiver',
        authorRole: 'Caregiver',
        action: 'Logged New Vitals Reading',
        description: `BP: ${record.systolic}/${record.diastolic} mmHg, Glucose: ${record.glucose} mg/dL, HR: ${record.heartRate} bpm.`,
        iconType: 'vitals',
        status: 'info'
      },
      ...prev
    ]);
  };

  const dispatchEmergencySos = async () => {
    setIsSosActive(true);
    setIsSosModalOpen(false);

    const result = await emergencyService.recordEmergencyEvent({
      patientId: user?.id || activePatient.id,
      patientName: activePatient.name,
      triggeredByName: profile?.full_name || 'Caregiver',
      location: activePatient.homeAddress,
      lockboxCode: activePatient.lockboxCode
    });

    setEmergencyEventDetails({
      isConfirmed: Boolean(result?.confirmedInDb),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      eventId: result?.eventId
    });

    setTimeline(prev => [
      {
        id: `time-${Date.now()}`,
        timestamp: 'RIGHT NOW',
        author: profile?.full_name || 'Caregiver',
        authorRole: 'Caregiver SOS Network',
        action: '🚨 Emergency SOS Beacon Dispatched',
        description: `Emergency alert stored for ${activePatient.name}. Authorized family responders notified.`,
        iconType: 'emergency',
        status: 'danger'
      },
      ...prev
    ]);

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: '🚨 CRITICAL: SOS Beacon Dispatched to Emergency Contacts!',
        time: 'Just now',
        type: 'danger',
        read: false
      },
      ...prev
    ]);
  };

  const clearEmergencySos = () => {
    setIsSosActive(false);
    setEmergencyEventDetails(null);
    setTimeline(prev => [
      {
        id: `time-${Date.now()}`,
        timestamp: 'Just now',
        author: profile?.full_name || 'Caregiver',
        authorRole: 'Caregiver',
        action: 'Emergency SOS Resolved',
        description: `Patient ${activePatient.name} marked safe. Emergency status deactivated.`,
        iconType: 'emergency',
        status: 'info'
      },
      ...prev
    ]);
  };

  const addEmergencyContact = async (contactData) => {
    const { data: newContact } = await emergencyService.addEmergencyContact(
      user?.id || activePatient.id,
      contactData
    );
    if (newContact) {
      if (newContact.is_primary) {
        setEmergencyContacts(prev => [newContact, ...prev.map(c => ({ ...c, is_primary: false }))]);
      } else {
        setEmergencyContacts(prev => [newContact, ...prev]);
      }
    }
  };

  const updateEmergencyContact = async (contactId, contactData) => {
    setEmergencyContacts(prev =>
      prev.map(c => {
        if (c.id === contactId) {
          return { ...c, ...contactData };
        }
        if (contactData.is_primary) {
          return { ...c, is_primary: false };
        }
        return c;
      })
    );
    await emergencyService.updateEmergencyContact(contactId, contactData);
  };

  const deleteEmergencyContact = async (contactId) => {
    setEmergencyContacts(prev => prev.filter(c => c.id !== contactId));
    await emergencyService.deleteEmergencyContact(contactId);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    if (isSupabaseConfigured && user) {
      supabase.from('notifications').update({ is_read: true }).eq('patient_id', user.id).then();
    }
  };

  const markNotificationRead = (notifId) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (notifId) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
  };

  const addNotification = (notif) => {
    const newNotif = {
      id: notif.id || `notif-${Date.now()}`,
      title: notif.title || 'New Care Alert',
      message: notif.message || '',
      time: notif.time || 'Just now',
      type: notif.type || 'info', // 'info' | 'warning' | 'danger' | 'success' | 'refill'
      read: false,
      actionUrl: notif.actionUrl || null
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Audible voice notification for elderly if warning or danger
    if (notif.type === 'danger' || notif.type === 'warning') {
      voiceService.speak(notif.title, { lang: preferredLanguage, rate: 0.9 });
    }
  };

  const updateHealthProfile = async (profileData) => {
    const targetId = user?.id || activePatientId;
    const res = await healthProfileService.updateHealthProfile(targetId, profileData);

    setPatients(prev =>
      prev.map(p =>
        p.id === activePatientId
          ? {
              ...p,
              bloodType: profileData.blood_type || p.bloodType,
              primaryCondition: profileData.primary_condition || p.primaryCondition,
              allergies: profileData.allergies || p.allergies,
              existing_conditions: profileData.existing_conditions || p.existing_conditions,
              medical_history: profileData.medical_history || p.medical_history,
              homeAddress: profileData.home_address || p.homeAddress,
              lockboxCode: profileData.lockbox_code || p.lockboxCode,
              advance_directives: profileData.advance_directives || p.advance_directives,
              emergency_notes: profileData.emergency_notes || p.emergency_notes,
              weight_kg: profileData.weight_kg ?? p.weight_kg
            }
          : p
      )
    );

    addNotification({
      title: 'Health Profile Updated',
      message: 'Medical history, allergies, and emergency directives updated.',
      type: 'info'
    });

    return res;
  };

  const recordRefillAction = async (refillData) => {
    const targetPatientId = user?.id || activePatientId;
    const qty = Number(refillData.quantityAdded || 30);
    const effectiveDate = refillData.refillDate || new Date().toISOString();

    const res = await refillService.recordRefill({
      ...refillData,
      patientId: targetPatientId,
      refilledBy: user?.id
    });

    let targetMedName = 'Prescription';
    let targetUnits = 'tablets';

    // Update medication state with full inventory parameters
    setMedications(prev =>
      prev.map(m => {
        if (m.id === refillData.medicationId) {
          targetMedName = m.name;
          targetUnits = refillData.units || m.units || 'tablets';
          const currentRemaining = m.currentQuantity ?? m.pillsRemaining ?? 30;
          const newRemaining = currentRemaining + qty;
          const newInitial = Math.max(m.initialQuantity ?? m.totalPills ?? 30, newRemaining);
          const threshold = m.refillThreshold ?? m.refill_threshold ?? 5;

          return {
            ...m,
            currentQuantity: newRemaining,
            current_quantity: newRemaining,
            pillsRemaining: newRemaining,
            pills_remaining: newRemaining,
            initialQuantity: newInitial,
            initial_quantity: newInitial,
            totalPills: newInitial,
            total_pills: newInitial,
            units: targetUnits,
            expiryDate: refillData.newExpiryDate || m.expiryDate || m.expiry_date,
            expiry_date: refillData.newExpiryDate || m.expiryDate || m.expiry_date,
            lastRefillDate: effectiveDate,
            last_refill_date: effectiveDate,
            needsRefill: newRemaining <= threshold
          };
        }
        return m;
      })
    );

    const { data: updatedRefills } = await refillService.getRefillHistory(targetPatientId);
    if (updatedRefills) setRefillLogs(updatedRefills);

    addNotification({
      title: `Pharmacy Refill Recorded: +${qty} ${targetUnits}`,
      message: `${targetMedName} inventory restocked from ${refillData.pharmacyName || 'Pharmacy'}.`,
      type: 'success',
      actionUrl: '/medications'
    });

    // Add Refill to Activity Timeline so caregivers see it immediately
    setTimeline(prev => [
      {
        id: `time-refill-${Date.now()}`,
        timestamp: 'Just now',
        author: profile?.full_name || 'Caregiver',
        authorRole: profile?.role === 'patient' ? 'Patient' : 'Caregiver',
        action: `Recorded Pharmacy Refill (+${qty} ${targetUnits})`,
        description: `Prescription for ${targetMedName} restocked at ${refillData.pharmacyName || 'Pharmacy'}. Rx: ${refillData.rxNumber || 'Standard'}.`,
        iconType: 'medication',
        status: 'success'
      },
      ...prev
    ]);

    return res;
  };

  const recordVitals = async (vitalsData) => {
    const targetPatientId = activePatientId || user?.id || 'pat-1';
    const res = await vitalsService.addVitalsLog({
      patientId: targetPatientId,
      systolicBp: vitalsData.systolic_bp || vitalsData.systolic,
      diastolicBp: vitalsData.diastolic_bp || vitalsData.diastolic,
      bpUnit: vitalsData.bp_unit || 'mmHg',
      heartRate: vitalsData.heart_rate || vitalsData.heartRate,
      heartRateUnit: vitalsData.heart_rate_unit || 'bpm',
      bloodSugar: vitalsData.blood_sugar || vitalsData.glucose,
      bloodSugarUnit: vitalsData.blood_sugar_unit || 'mg/dL',
      bloodSugarContext: vitalsData.blood_sugar_context || vitalsData.glucoseContext || 'fasting',
      weight: vitalsData.weight !== undefined ? vitalsData.weight : vitalsData.weight_kg,
      weightUnit: vitalsData.weight_unit || 'kg',
      temperature: vitalsData.temperature || 98.4,
      temperatureUnit: vitalsData.temperature_unit || '°F',
      measurementMethod: vitalsData.measurement_method || vitalsData.measurementMethod || 'Manual Home Entry',
      notes: vitalsData.notes || '',
      recordedBy: user?.id,
      recordedAt: vitalsData.recorded_at || vitalsData.recordedAt || new Date().toISOString()
    });

    const now = new Date();
    const newLog = res?.data || {
      id: `vital-${now.getTime()}`,
      patient_id: targetPatientId,
      recorded_at: now.toISOString(),
      systolic_bp: Number(vitalsData.systolic_bp || vitalsData.systolic) || 120,
      diastolic_bp: Number(vitalsData.diastolic_bp || vitalsData.diastolic) || 80,
      bp_unit: vitalsData.bp_unit || 'mmHg',
      heart_rate: Number(vitalsData.heart_rate || vitalsData.heartRate) || 72,
      heart_rate_unit: 'bpm',
      blood_sugar: Number(vitalsData.blood_sugar || vitalsData.glucose) || 105,
      blood_sugar_unit: 'mg/dL',
      blood_sugar_context: vitalsData.blood_sugar_context || 'fasting',
      weight: Number(vitalsData.weight || vitalsData.weight_kg) || 68.5,
      weight_kg: Number(vitalsData.weight || vitalsData.weight_kg) || 68.5,
      weight_unit: 'kg',
      temperature: Number(vitalsData.temperature) || 98.4,
      temperature_unit: vitalsData.temperature_unit || '°F',
      notes: vitalsData.notes || '',
      recorder: { full_name: profile?.full_name || 'Caregiver', role: profile?.role === 'patient' ? 'Patient' : 'Caregiver' },
      manually_entered: true
    };

    setVitalsLogs(prev => [newLog, ...prev]);

    const newChartPoint = {
      name: now.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      systolic: newLog.systolic_bp,
      diastolic: newLog.diastolic_bp,
      glucose: newLog.blood_sugar,
      heartRate: newLog.heart_rate,
      weight: newLog.weight || newLog.weight_kg,
      temperature: newLog.temperature
    };
    setVitalsHistory(prev => [...prev, newChartPoint]);

    setPatients(prev =>
      prev.map(p =>
        p.id === activePatientId || (!p.id && activePatientId === 'pat-1')
          ? {
              ...p,
              vitals: {
                ...p.vitals,
                bloodPressure: `${newLog.systolic_bp}/${newLog.diastolic_bp} mmHg`,
                heartRate: `${newLog.heart_rate} bpm`,
                bloodGlucose: `${newLog.blood_sugar} mg/dL`,
                weight: `${newLog.weight || newLog.weight_kg} kg`,
                temperature: `${newLog.temperature} °F`,
                lastUpdated: 'Just now'
              }
            }
          : p
      )
    );

    setTimeline(prev => [
      {
        id: `time-${now.getTime()}`,
        timestamp: 'Just now',
        author: profile?.full_name || 'Caregiver',
        authorRole: profile?.role === 'patient' ? 'Patient' : 'Caregiver',
        action: 'Logged Health Vitals (Manual)',
        description: `BP: ${newLog.systolic_bp}/${newLog.diastolic_bp} mmHg, Pulse: ${newLog.heart_rate} bpm, Glucose: ${newLog.blood_sugar} mg/dL, Temp: ${newLog.temperature}°F.`,
        iconType: 'vitals',
        status: 'info'
      },
      ...prev
    ]);

    addNotification({
      title: 'Health Vitals Logged',
      message: `BP ${newLog.systolic_bp}/${newLog.diastolic_bp} mmHg • Pulse ${newLog.heart_rate} bpm • Temp ${newLog.temperature}°F`,
      type: 'info'
    });

    return res;
  };

  const updateVitals = async (id, updatedData) => {
    const res = await vitalsService.updateVitalsLog(id, updatedData);
    const now = new Date();

    setVitalsLogs(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            systolic_bp: updatedData.systolic_bp ? Number(updatedData.systolic_bp) : item.systolic_bp,
            diastolic_bp: updatedData.diastolic_bp ? Number(updatedData.diastolic_bp) : item.diastolic_bp,
            heart_rate: updatedData.heart_rate ? Number(updatedData.heart_rate) : item.heart_rate,
            blood_sugar: updatedData.blood_sugar ? Number(updatedData.blood_sugar) : item.blood_sugar,
            blood_sugar_context: updatedData.blood_sugar_context || item.blood_sugar_context,
            weight: updatedData.weight !== undefined ? Number(updatedData.weight) : item.weight,
            weight_kg: updatedData.weight !== undefined ? Number(updatedData.weight) : item.weight_kg,
            temperature: updatedData.temperature ? Number(updatedData.temperature) : item.temperature,
            notes: updatedData.notes !== undefined ? updatedData.notes : item.notes,
            recorded_at: updatedData.recorded_at || item.recorded_at
          };
        }
        return item;
      })
    );

    setTimeline(prev => [
      {
        id: `time-${now.getTime()}`,
        timestamp: 'Just now',
        author: profile?.full_name || 'Caregiver',
        authorRole: profile?.role === 'patient' ? 'Patient' : 'Caregiver',
        action: 'Corrected Vitals Record',
        description: `Updated measurement record: BP ${updatedData.systolic_bp || '—'}/${updatedData.diastolic_bp || '—'} mmHg.`,
        iconType: 'vitals',
        status: 'info'
      },
      ...prev
    ]);

    addNotification({
      title: 'Vitals Record Corrected',
      message: 'A previously entered vitals measurement was adjusted.',
      type: 'info'
    });

    return res;
  };

  const deleteVitals = async (id) => {
    const res = await vitalsService.deleteVitalsLog(id);
    const now = new Date();

    setVitalsLogs(prev => prev.filter(item => item.id !== id));

    setTimeline(prev => [
      {
        id: `time-${now.getTime()}`,
        timestamp: 'Just now',
        author: profile?.full_name || 'Caregiver',
        authorRole: profile?.role === 'patient' ? 'Patient' : 'Caregiver',
        action: 'Removed Incorrect Vitals Record',
        description: 'Deleted vitals reading from patient tracking logs.',
        iconType: 'vitals',
        status: 'info'
      },
      ...prev
    ]);

    addNotification({
      title: 'Vitals Record Deleted',
      message: 'Vitals entry successfully removed from records.',
      type: 'info'
    });

    return res;
  };

  const addDoctorAction = async (doctorData) => {
    const targetPatientId = user?.id || activePatientId;
    const res = await doctorService.addDoctor(targetPatientId, doctorData);
    if (res?.data) {
      setDoctors(prev => [res.data, ...prev]);
    }
    return res;
  };

  const requestConsultationAction = async (requestData) => {
    const targetPatientId = user?.id || activePatientId;
    const res = await doctorService.requestConsultation({
      ...requestData,
      patientId: targetPatientId,
      requestedBy: profile?.full_name || 'Sarah Jenkins'
    });

    if (res?.data) {
      setAppointments(prev => [res.data, ...prev]);
    }

    addNotification({
      title: `Consultation Requested: ${requestData.doctorName}`,
      message: `Appointment requested for ${requestData.preferredDate} at ${requestData.timeSlot}.`,
      type: 'info'
    });

    return res;
  };

  return (
    <CareContext.Provider
      value={{
        patients,
        activePatientId,
        setActivePatientId,
        activePatient,
        medications: patientMedications,
        allMedications: medications,
        appointments: patientAppointments,
        careCircle,
        timeline,
        weeklyAdherenceData,
        vitalsHistory,
        searchQuery,
        setSearchQuery,
        isSosModalOpen,
        setIsSosModalOpen,
        isSosActive,
        dispatchEmergencySos,
        clearEmergencySos,
        toggleMedicationStatus,
        addMedication,
        updateMedication,
        deleteMedication,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        addCareMember,
        inviteCareMember,
        acceptCareCircleInvite,
        updateCareMemberRole,
        removeCareMember,
        pendingInvitations,
        isRealtimeActive,
        emergencyContacts,
        emergencyEventDetails,
        addEmergencyContact,
        updateEmergencyContact,
        deleteEmergencyContact,
        addVitalsRecord,
        isLargeText,
        setIsLargeText,
        notifications,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        updateHealthProfile,
        recordRefill: recordRefillAction,
        refillLogs,
        vitalsLogs,
        setVitalsLogs,
        recordVitals,
        updateVitals,
        deleteVitals,
        doctors,
        addDoctor: addDoctorAction,
        requestConsultation: requestConsultationAction,
        preferredLanguage,
        setPreferredLanguage,
        voiceService,
        dataLoading,
        dbConnected,
        fetchSupabaseData
      }}
    >
      <div className={isLargeText ? 'text-lg text-accessibility-mode' : ''}>
        {children}
      </div>
    </CareContext.Provider>
  );
}

export function useCare() {
  const context = useContext(CareContext);
  if (!context) {
    throw new Error('useCare must be used within a CareProvider');
  }
  return context;
}
