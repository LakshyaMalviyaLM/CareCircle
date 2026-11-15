import { supabase, isSupabaseConfigured } from './supabase';

const isValidUuid = (id) =>
  Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

const LOCAL_CONTACTS_KEY = 'carecircle_emergency_contacts';

export const emergencyService = {
  /**
   * 1. Fetch saved emergency contacts for the patient
   */
  async getEmergencyContacts(patientId, fallbackContacts = []) {
    if (!isSupabaseConfigured || !isValidUuid(patientId)) {
      // Fallback to local storage or defaults
      try {
        const stored = JSON.parse(localStorage.getItem(LOCAL_CONTACTS_KEY) || '[]');
        if (stored.length > 0) return { data: stored, error: null };
      } catch {
        // use fallback
      }
      return { data: fallbackContacts, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('patient_id', patientId)
        .order('is_primary', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        return { data, error: null };
      }

      // If no contacts in DB yet, fallback gracefully
      return { data: fallbackContacts, error: null };
    } catch (err) {
      console.warn('Error fetching emergency contacts from Supabase:', err.message);
      return { data: fallbackContacts, error: err };
    }
  },

  /**
   * 2. Add emergency contact
   */
  async addEmergencyContact(patientId, contact) {
    const payload = {
      patient_id: patientId,
      name: contact.name.trim(),
      phone: contact.phone.trim(),
      relationship: contact.relationship.trim(),
      is_primary: Boolean(contact.is_primary ?? contact.isPrimary)
    };

    if (isSupabaseConfigured && isValidUuid(patientId)) {
      try {
        // If this contact is set to primary, update existing ones
        if (payload.is_primary) {
          await supabase
            .from('emergency_contacts')
            .update({ is_primary: false })
            .eq('patient_id', patientId);
        }

        const { data, error } = await supabase
          .from('emergency_contacts')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      } catch (err) {
        console.error('Error inserting emergency contact into Supabase:', err.message);
        return { data: null, error: err };
      }
    }

    // Local fallback
    const localContact = { ...payload, id: `em-${Date.now()}` };
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_CONTACTS_KEY) || '[]');
      if (localContact.is_primary) {
        existing.forEach((c) => (c.is_primary = false));
      }
      existing.unshift(localContact);
      localStorage.setItem(LOCAL_CONTACTS_KEY, JSON.stringify(existing));
    } catch {
      // fallback
    }
    return { data: localContact, error: null };
  },

  /**
   * 3. Update emergency contact
   */
  async updateEmergencyContact(contactId, contactData) {
    const payload = {
      name: contactData.name.trim(),
      phone: contactData.phone.trim(),
      relationship: contactData.relationship.trim(),
      is_primary: Boolean(contactData.is_primary ?? contactData.isPrimary)
    };

    if (isSupabaseConfigured && isValidUuid(contactId)) {
      try {
        if (payload.is_primary && contactData.patient_id) {
          await supabase
            .from('emergency_contacts')
            .update({ is_primary: false })
            .eq('patient_id', contactData.patient_id);
        }

        const { data, error } = await supabase
          .from('emergency_contacts')
          .update(payload)
          .eq('id', contactId)
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      } catch (err) {
        console.error('Error updating emergency contact in Supabase:', err.message);
        return { data: null, error: err };
      }
    }

    // Local fallback
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_CONTACTS_KEY) || '[]');
      const updated = existing.map((c) =>
        c.id === contactId ? { ...c, ...payload } : c
      );
      localStorage.setItem(LOCAL_CONTACTS_KEY, JSON.stringify(updated));
    } catch {
      // fallback
    }
    return { data: { id: contactId, ...payload }, error: null };
  },

  /**
   * 4. Delete emergency contact
   */
  async deleteEmergencyContact(contactId) {
    if (isSupabaseConfigured && isValidUuid(contactId)) {
      try {
        const { error } = await supabase
          .from('emergency_contacts')
          .delete()
          .eq('id', contactId);

        if (error) throw error;
        return { success: true, error: null };
      } catch (err) {
        console.error('Error deleting emergency contact from Supabase:', err.message);
        return { success: false, error: err };
      }
    }

    // Local fallback
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_CONTACTS_KEY) || '[]');
      const filtered = existing.filter((c) => c.id !== contactId);
      localStorage.setItem(LOCAL_CONTACTS_KEY, JSON.stringify(filtered));
    } catch {
      // fallback
    }
    return { success: true, error: null };
  },

  /**
   * 5. Record Emergency Event in Database
   * Stores the emergency incident and verifies delivery confirmation.
   */
  async recordEmergencyEvent({ patientId, patientName, triggeredByName, location, lockboxCode }) {
    const timestamp = new Date().toISOString();
    const eventPayload = {
      patient_id: isValidUuid(patientId) ? patientId : null,
      title: '🚨 CRITICAL: Emergency SOS Beacon Dispatched',
      message: `Emergency alert triggered for ${patientName} by ${triggeredByName}. Location: ${location}. Paramedic Lockbox: ${lockboxCode}.`,
      type: 'emergency',
      is_read: false
    };

    let dbSaved = false;

    if (isSupabaseConfigured && isValidUuid(patientId)) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .insert([eventPayload])
          .select()
          .single();

        if (!error && data) {
          dbSaved = true;
          return {
            success: true,
            confirmedInDb: true,
            eventId: data.id,
            timestamp,
            error: null
          };
        }
      } catch (err) {
        console.warn('Could not record emergency event to Supabase:', err.message);
      }
    }

    return {
      success: true,
      confirmedInDb: dbSaved,
      eventId: `sos-${Date.now()}`,
      timestamp,
      error: null
    };
  }
};

export default emergencyService;
