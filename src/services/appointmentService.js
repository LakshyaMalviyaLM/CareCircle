import { supabase, isSupabaseConfigured } from './supabase';

const isValidUuid = (id) =>
  Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

/**
 * Combines date string (YYYY-MM-DD) and time string (HH:mm or hh:mm A) into ISO string.
 */
export const combineDateAndTime = (dateStr, timeStr = '10:00 AM') => {
  if (!dateStr) return new Date().toISOString();

  try {
    let hours = 10;
    let minutes = 0;

    if (timeStr) {
      const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?:\s*([APap][Mm]))?$/);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        const meridiem = match[3]?.toUpperCase();

        if (meridiem === 'PM' && hours < 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;
      }
    }

    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day, hours, minutes, 0);
    return isNaN(dateObj.getTime()) ? new Date().toISOString() : dateObj.toISOString();
  } catch {
    return new Date().toISOString();
  }
};

/**
 * Computes human-friendly reminder indicators (e.g. "Today", "Tomorrow", "In 3 days").
 */
export const getAppointmentReminder = (dateIso) => {
  if (!dateIso) return { label: 'Upcoming', urgency: 'default', text: 'Upcoming' };

  const target = new Date(dateIso);
  if (isNaN(target.getTime())) {
    return { label: 'Upcoming', urgency: 'default', text: 'Upcoming', diffDays: null, badgeVariant: 'default' };
  }

  const now = new Date();

  // Reset to midnight for day comparison
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = targetMidnight.getTime() - nowMidnight.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: 'Past',
      urgency: 'past',
      text: 'Completed / Past Date',
      diffDays,
      badgeVariant: 'default'
    };
  }

  if (diffDays === 0) {
    return {
      label: 'Today',
      urgency: 'high',
      text: '⚡ Happening Today',
      diffDays,
      badgeVariant: 'danger'
    };
  }

  if (diffDays === 1) {
    return {
      label: 'Tomorrow',
      urgency: 'medium',
      text: '⏰ Tomorrow',
      diffDays,
      badgeVariant: 'warning'
    };
  }

  if (diffDays <= 7) {
    return {
      label: `In ${diffDays} days`,
      urgency: 'soon',
      text: `📅 In ${diffDays} days`,
      diffDays,
      badgeVariant: 'accent'
    };
  }

  return {
    label: `In ${diffDays} days`,
    urgency: 'future',
    text: `Scheduled in ${Math.ceil(diffDays / 7)} weeks`,
    diffDays,
    badgeVariant: 'primary'
  };
};

/**
 * Normalizes an appointment record from Supabase to CareCircle frontend format.
 */
export const normalizeAppointment = (dbApt, fallbackCaregiver = 'Primary Caregiver') => {
  if (!dbApt) return null;

  const dateObj = new Date(dbApt.appointment_date || Date.now());
  const reminder = getAppointmentReminder(dbApt.appointment_date);

  // Extract YYYY-MM-DD for date inputs
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const rawDate = `${yyyy}-${mm}-${dd}`;

  // Format 12-hour time
  const timeFormatted = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    id: dbApt.id,
    patientId: dbApt.patient_id,
    doctor: dbApt.doctor_name,
    doctor_name: dbApt.doctor_name,
    specialty: dbApt.specialty,
    facility: dbApt.location || 'Clinic / Medical Office',
    location: dbApt.location || 'Clinic / Medical Office',
    appointmentDate: dbApt.appointment_date,
    date: rawDate,
    time: timeFormatted,
    displayDate: dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }),
    displayFullDate: dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    type: dbApt.telehealth_link ? 'Telehealth' : 'In-Clinic',
    telehealthLink: dbApt.telehealth_link || '',
    notes: dbApt.notes || '',
    transportNeeded: Boolean(dbApt.transport_needed),
    status: dbApt.status || 'Upcoming',
    caregiverAssigned: fallbackCaregiver,
    reminder,
    createdAt: dbApt.created_at
  };
};

export const appointmentService = {
  // 1. Fetch all appointments for a patient
  async getAppointments(patientId, fallbackCaregiver = 'Primary Caregiver') {
    if (!isSupabaseConfigured || !isValidUuid(patientId)) {
      return { data: [], error: null };
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      const normalized = (data || []).map((apt) =>
        normalizeAppointment(apt, fallbackCaregiver)
      );

      return { data: normalized, error: null };
    } catch (error) {
      console.error('Error fetching appointments from Supabase:', error.message);
      return { data: [], error };
    }
  },

  // 2. Add new doctor appointment
  async addAppointment(patientId, aptData) {
    if (!isSupabaseConfigured || !isValidUuid(patientId)) {
      return { data: null, error: null };
    }

    try {
      const appointmentDateIso =
        aptData.appointment_date ||
        combineDateAndTime(aptData.date, aptData.time);

      const payload = {
        patient_id: patientId,
        doctor_name: aptData.doctor_name || aptData.doctor,
        specialty: aptData.specialty,
        appointment_date: appointmentDateIso,
        location: aptData.location || aptData.facility || 'Clinic / Medical Office',
        telehealth_link: aptData.telehealth_link || aptData.telehealthLink || null,
        notes: aptData.notes || '',
        transport_needed: Boolean(aptData.transport_needed ?? aptData.transportNeeded),
        status: aptData.status || 'Upcoming'
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      return {
        data: normalizeAppointment(data, aptData.caregiverAssigned),
        error: null
      };
    } catch (error) {
      console.error('Error adding appointment to Supabase:', error.message);
      return { data: null, error };
    }
  },

  // 3. Update existing appointment
  async updateAppointment(aptId, aptData) {
    if (!isSupabaseConfigured || !isValidUuid(aptId)) {
      return { data: null, error: null };
    }

    try {
      const appointmentDateIso =
        aptData.appointment_date ||
        combineDateAndTime(aptData.date, aptData.time);

      const payload = {
        doctor_name: aptData.doctor_name || aptData.doctor,
        specialty: aptData.specialty,
        appointment_date: appointmentDateIso,
        location: aptData.location || aptData.facility,
        telehealth_link: aptData.telehealth_link || aptData.telehealthLink || null,
        notes: aptData.notes || '',
        transport_needed: Boolean(aptData.transport_needed ?? aptData.transportNeeded),
        status: aptData.status || 'Upcoming'
      };

      const { data, error } = await supabase
        .from('appointments')
        .update(payload)
        .eq('id', aptId)
        .select()
        .single();

      if (error) throw error;

      return {
        data: normalizeAppointment(data, aptData.caregiverAssigned),
        error: null
      };
    } catch (error) {
      console.error('Error updating appointment in Supabase:', error.message);
      return { data: null, error };
    }
  },

  // 4. Delete appointment
  async deleteAppointment(aptId) {
    if (!isSupabaseConfigured || !isValidUuid(aptId)) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', aptId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting appointment from Supabase:', error.message);
      return { success: false, error };
    }
  }
};

export default appointmentService;
