import { supabase, isSupabaseConfigured } from './supabase';

const isValidUuid = (id) =>
  Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

const LOCAL_HEALTH_PROFILE_KEY = 'carecircle_health_profile_cache';

export const healthProfileService = {
  // 1. Get health profile
  async getHealthProfile(patientId, fallbackPatient = null) {
    if (isSupabaseConfigured && isValidUuid(patientId)) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            email,
            date_of_birth,
            phone,
            role,
            avatar_url,
            blood_type,
            primary_condition,
            allergies,
            home_address,
            lockbox_code,
            preferred_hospital,
            medical_history,
            existing_conditions,
            advance_directives,
            emergency_notes,
            weight_kg,
            preferred_language
          `)
          .eq('id', patientId)
          .maybeSingle();

        if (!error && data) {
          return { data, error: null };
        }
      } catch (err) {
        console.warn('Error fetching health profile from Supabase:', err.message);
      }
    }

    // Local cached profile fallback
    try {
      const cached = localStorage.getItem(LOCAL_HEALTH_PROFILE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.id === patientId || !patientId) return { data: parsed, error: null };
      }
    } catch {
      // fallback
    }

    // Default structure from active patient
    const defaultProfile = {
      id: patientId || 'pat-1',
      full_name: fallbackPatient?.name || 'Eleanor Vance',
      blood_type: fallbackPatient?.bloodType || 'O+',
      allergies: fallbackPatient?.allergies || ['Penicillin', 'Sulfa Drugs'],
      primary_condition: fallbackPatient?.primaryCondition || 'Hypertension & Mild Cognitive Decline',
      existing_conditions: [
        'Essential Hypertension (Stage 2)',
        'Type 2 Diabetes Mellitus (Diet Controlled)',
        'Osteoarthritis of Bilateral Knees',
        'Mild Cognitive Impairment (Early Stage)'
      ],
      medical_history: [
        'Total Hip Arthroplasty (Right) - 2021',
        'Cataract Surgery (Both Eyes) - 2019',
        'Cholecystectomy - 2015',
        'No known adverse reactions to anesthesia'
      ],
      home_address: fallbackPatient?.homeAddress || '742 Evergreen Terrace, Springfield',
      lockbox_code: fallbackPatient?.lockboxCode || '4829',
      preferred_hospital: fallbackPatient?.preferredHospital || 'Springfield Memorial Hospital',
      advance_directives: 'Full Code / DNR Orders on file with Dr. Robert Miller. Medical Power of Attorney held by daughter Sarah Jenkins.',
      emergency_notes: 'Patient ambulates with a quad-cane. Keep clear pathways. Hard of hearing in left ear; speak clearly from the front.',
      weight_kg: 68.5,
      preferred_language: 'en'
    };

    return { data: defaultProfile, error: null };
  },

  // 2. Update health profile
  async updateHealthProfile(patientId, profileData) {
    const payload = {
      blood_type: profileData.blood_type || profileData.bloodType,
      allergies: Array.isArray(profileData.allergies) ? profileData.allergies : [],
      primary_condition: profileData.primary_condition || profileData.primaryCondition,
      existing_conditions: Array.isArray(profileData.existing_conditions) ? profileData.existing_conditions : [],
      medical_history: Array.isArray(profileData.medical_history) ? profileData.medical_history : [],
      home_address: profileData.home_address || profileData.homeAddress,
      lockbox_code: profileData.lockbox_code || profileData.lockboxCode,
      preferred_hospital: profileData.preferred_hospital || profileData.preferredHospital,
      advance_directives: profileData.advance_directives || profileData.advanceDirectives || '',
      emergency_notes: profileData.emergency_notes || profileData.emergencyNotes || '',
      weight_kg: Number(profileData.weight_kg ?? profileData.weight ?? 68.5),
      preferred_language: profileData.preferred_language || 'en'
    };

    if (isSupabaseConfigured && isValidUuid(patientId)) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', patientId)
          .select()
          .single();

        if (error) throw error;
        localStorage.setItem(LOCAL_HEALTH_PROFILE_KEY, JSON.stringify(data));
        return { data, error: null };
      } catch (err) {
        console.warn('Error updating profile in Supabase:', err.message);
      }
    }

    // Local fallback update
    const updated = { ...profileData, ...payload, id: patientId };
    try {
      localStorage.setItem(LOCAL_HEALTH_PROFILE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return { data: updated, error: null };
  }
};

export default healthProfileService;
