import { supabase, isSupabaseConfigured } from './supabase';
import appointmentService from './appointmentService';

const isValidUuid = (id) =>
  Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

const LOCAL_DOCTORS_KEY = 'carecircle_doctors_directory_cache';

const defaultDoctorsList = [
  {
    id: 'doc-1',
    name: 'Dr. Robert Miller, MD, FACC',
    specialty: 'Cardiology & Cardiovascular Care',
    clinic_name: 'St. Jude Heart & Vascular Institute',
    phone: '(555) 342-8901',
    emergency_phone: '(555) 342-9911',
    email: 'dr.miller@stjudeheart.org',
    address: '450 Mercy Parkway, Suite 300, Minneapolis, MN',
    office_hours: 'Mon - Thu: 08:30 AM - 04:30 PM',
    telehealth_available: true,
    rating: 4.9,
    avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=260',
    notes: 'Primary cardiologist managing hypertension, beta blockers, and annual echocardiograms.'
  },
  {
    id: 'doc-2',
    name: 'Dr. Eleanor Vance, MD',
    specialty: 'Geriatric Medicine & Senior Wellness',
    clinic_name: 'Metro Senior Health Center',
    phone: '(555) 789-2341',
    emergency_phone: '(555) 789-9911',
    email: 'e.vance@metroseniorcare.org',
    address: '120 Oakridge Blvd, Building B, Minneapolis, MN',
    office_hours: 'Mon - Fri: 09:00 AM - 05:00 PM',
    telehealth_available: true,
    rating: 5.0,
    avatar_url: 'https://images.unsplash.com/photo-1594824813583-0599c9641753?auto=format&fit=crop&q=80&w=260',
    notes: 'Geriatric specialist overseeing multi-morbidity medication reviews and mobility assessments.'
  },
  {
    id: 'doc-3',
    name: 'Dr. Sanjay Mehta, MD, FACE',
    specialty: 'Endocrinology & Diabetes Management',
    clinic_name: 'Twin Cities Endocrine Specialists',
    phone: '(555) 456-1123',
    emergency_phone: '(555) 456-9922',
    email: 'smehta@tcdiabetes.com',
    address: '880 Health Science Center, Suite 104, St. Paul, MN',
    office_hours: 'Tue, Wed, Fri: 08:00 AM - 03:30 PM',
    telehealth_available: true,
    rating: 4.8,
    avatar_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=260',
    notes: 'Supervises continuous glucose monitoring, Metformin titration, and HbA1c testing cycles.'
  },
  {
    id: 'doc-4',
    name: 'Dr. Sophia Chen, MD, PhD',
    specialty: 'Neurology & Cognitive Health',
    clinic_name: 'Northstar Neurological Associates',
    phone: '(555) 671-8890',
    emergency_phone: '(555) 671-9944',
    email: 'schen@northstarneuro.org',
    address: '300 University Avenue, 5th Floor, Minneapolis, MN',
    office_hours: 'Mon, Wed, Thu: 09:00 AM - 04:00 PM',
    telehealth_available: false,
    rating: 4.9,
    avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=260',
    notes: 'Cognitive baseline evaluations, memory retention tracking, and peripheral neuropathy care.'
  }
];

export const doctorService = {
  // 1. Fetch doctor directory for patient
  async getDoctors(patientId) {
    if (isSupabaseConfigured && isValidUuid(patientId)) {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .eq('patient_id', patientId)
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          return { data, error: null };
        }
      } catch (err) {
        console.warn('Error fetching doctors from Supabase:', err.message);
      }
    }

    // Local cached fallback
    try {
      const stored = localStorage.getItem(LOCAL_DOCTORS_KEY);
      if (stored) {
        return { data: JSON.parse(stored), error: null };
      }
    } catch {
      // ignore
    }

    return { data: defaultDoctorsList, error: null };
  },

  // 2. Add doctor to directory
  async addDoctor(patientId, doctorData) {
    const newDoc = {
      id: `doc-${Date.now()}`,
      patient_id: patientId,
      name: doctorData.name,
      specialty: doctorData.specialty,
      clinic_name: doctorData.clinic_name || doctorData.clinicName || 'Specialist Clinic',
      phone: doctorData.phone || '(555) 000-0000',
      emergency_phone: doctorData.emergency_phone || doctorData.phone,
      email: doctorData.email || '',
      address: doctorData.address || '',
      office_hours: doctorData.office_hours || 'Mon - Fri: 09:00 AM - 05:00 PM',
      telehealth_available: Boolean(doctorData.telehealth_available),
      rating: 5.0,
      avatar_url: doctorData.avatar_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=260',
      notes: doctorData.notes || 'Added to personal care team.'
    };

    if (isSupabaseConfigured && isValidUuid(patientId)) {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .insert({
            patient_id: patientId,
            name: newDoc.name,
            specialty: newDoc.specialty,
            clinic_name: newDoc.clinic_name,
            phone: newDoc.phone,
            emergency_phone: newDoc.emergency_phone,
            email: newDoc.email,
            address: newDoc.address,
            office_hours: newDoc.office_hours,
            telehealth_available: newDoc.telehealth_available,
            avatar_url: newDoc.avatar_url,
            notes: newDoc.notes
          })
          .select()
          .single();

        if (!error && data) {
          return { data, error: null };
        }
      } catch (err) {
        console.warn('Failed to insert doctor into Supabase:', err.message);
      }
    }

    // Local fallback update
    try {
      const { data: currentDocs } = await this.getDoctors(patientId);
      const updated = [newDoc, ...currentDocs];
      localStorage.setItem(LOCAL_DOCTORS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    return { data: newDoc, error: null };
  },

  // 3. Request consultation with a doctor (creates appointment record)
  async requestConsultation({
    patientId,
    doctorId,
    doctorName,
    specialty,
    preferredDate,
    timeSlot = '10:00 AM',
    mode = 'In-Person Clinic', // 'In-Person Clinic' | 'Telehealth Video' | 'Home Visit'
    reason = 'Routine follow-up',
    notes = '',
    requestedBy = 'Sarah Jenkins'
  }) {
    const formattedNotes = `Mode: ${mode}. Consultation Request: ${reason}. Notes: ${notes || 'None'}`;

    // Delegate appointment creation to appointmentService
    const appointmentResult = await appointmentService.createAppointment({
      patient_id: patientId,
      doctor_name: doctorName,
      specialty: specialty || 'Specialist Consultation',
      appointment_date: preferredDate,
      appointment_time: timeSlot,
      location: mode.includes('Telehealth') ? 'CareCircle Telehealth Portal' : 'Clinic Consultation Suite',
      notes: formattedNotes,
      status: 'Upcoming'
    }, requestedBy);

    return appointmentResult;
  }
};

export default doctorService;
