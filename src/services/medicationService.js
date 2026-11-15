import { supabase, isSupabaseConfigured } from './supabase';

const isValidUuid = (id) =>
  Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

export const medicationService = {
  // 1. Fetch all medications belonging to a patient
  async getMedications(patientId) {
    if (!isSupabaseConfigured || !isValidUuid(patientId)) {
      return { data: [], error: null };
    }

    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching medications from Supabase:', error.message);
      return { data: [], error };
    }
  },

  // 2. Add new medication to database
  async addMedication(medData) {
    if (!isSupabaseConfigured || !isValidUuid(medData.patient_id)) {
      return { data: null, error: null };
    }

    try {
      const currentQty = Number(
        medData.current_quantity ?? medData.currentQuantity ?? medData.pills_remaining ?? medData.pillsRemaining ?? 30
      );
      const initialQty = Number(
        medData.initial_quantity ?? medData.initialQuantity ?? medData.total_pills ?? medData.totalPills ?? 30
      );
      const unitsVal = (medData.units || medData.route_or_form || medData.form || 'tablets').toLowerCase();
      const thresholdVal = Number(medData.refill_threshold ?? medData.refillThreshold ?? 5);

      const payload = {
        patient_id: medData.patient_id,
        name: medData.name,
        dosage: medData.dosage,
        frequency: medData.frequency || 'Once daily',
        scheduled_times: Array.isArray(medData.scheduled_times)
          ? medData.scheduled_times
          : [medData.timeScheduled || '08:00 AM'],
        start_date: medData.start_date || new Date().toISOString().split('T')[0],
        end_date: medData.end_date || null,
        instructions: medData.instructions || '',
        route_or_form: medData.route_or_form || medData.form || 'Tablet',
        units: unitsVal,
        purpose: medData.purpose || '',
        prescribing_doctor: medData.prescribing_doctor || medData.doctor || '',
        current_quantity: currentQty,
        initial_quantity: initialQty,
        pills_remaining: currentQty,
        total_pills: initialQty,
        refill_threshold: thresholdVal,
        expiry_date: medData.expiry_date || medData.expiryDate || null,
        last_refill_date: medData.last_refill_date || medData.lastRefillDate || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('medications')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error inserting medication into Supabase:', error.message);
      return { data: null, error };
    }
  },

  // 3. Update existing medication
  async updateMedication(medId, medData) {
    if (!isSupabaseConfigured || !isValidUuid(medId)) {
      return { data: null, error: null };
    }

    try {
      const currentQty = medData.current_quantity !== undefined || medData.currentQuantity !== undefined
        ? Number(medData.current_quantity ?? medData.currentQuantity)
        : medData.pills_remaining !== undefined || medData.pillsRemaining !== undefined
        ? Number(medData.pills_remaining ?? medData.pillsRemaining)
        : undefined;

      const initialQty = medData.initial_quantity !== undefined || medData.initialQuantity !== undefined
        ? Number(medData.initial_quantity ?? medData.initialQuantity)
        : medData.total_pills !== undefined || medData.totalPills !== undefined
        ? Number(medData.total_pills ?? medData.totalPills)
        : undefined;

      const payload = {
        name: medData.name,
        dosage: medData.dosage,
        frequency: medData.frequency,
        scheduled_times: Array.isArray(medData.scheduled_times)
          ? medData.scheduled_times
          : medData.timeScheduled
          ? [medData.timeScheduled]
          : undefined,
        start_date: medData.start_date || medData.startDate,
        end_date: medData.end_date !== undefined ? medData.end_date : medData.endDate,
        instructions: medData.instructions,
        route_or_form: medData.route_or_form || medData.form,
        purpose: medData.purpose,
        prescribing_doctor: medData.prescribing_doctor || medData.doctor
      };

      if (medData.units) payload.units = medData.units.toLowerCase();
      if (medData.refill_threshold !== undefined || medData.refillThreshold !== undefined) {
        payload.refill_threshold = Number(medData.refill_threshold ?? medData.refillThreshold);
      }
      if (medData.expiry_date !== undefined || medData.expiryDate !== undefined) {
        payload.expiry_date = medData.expiry_date || medData.expiryDate;
      }
      if (medData.last_refill_date || medData.lastRefillDate) {
        payload.last_refill_date = medData.last_refill_date || medData.lastRefillDate;
      }

      if (currentQty !== undefined) {
        payload.current_quantity = currentQty;
        payload.pills_remaining = currentQty;
      }
      if (initialQty !== undefined) {
        payload.initial_quantity = initialQty;
        payload.total_pills = initialQty;
      }

      // Remove undefined keys
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      const { data, error } = await supabase
        .from('medications')
        .update(payload)
        .eq('id', medId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating medication in Supabase:', error.message);
      return { data: null, error };
    }
  },

  // 4. Delete medication
  async deleteMedication(medId) {
    if (!isSupabaseConfigured || !isValidUuid(medId)) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', medId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting medication from Supabase:', error.message);
      return { success: false, error };
    }
  },

  // 5. Fetch dose logs for today to prevent duplicates and calculate adherence
  async getTodayDoseLogs(patientId) {
    if (!isSupabaseConfigured || !isValidUuid(patientId)) {
      return { data: [], error: null };
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from('dose_logs')
        .select('*')
        .eq('patient_id', patientId)
        .gte('scheduled_at', today.toISOString())
        .lt('scheduled_at', tomorrow.toISOString())
        .order('scheduled_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching today dose logs:', error.message);
      return { data: [], error };
    }
  },

  // 6. Record dose log (with duplicate check!)
  async recordDose({ medicationId, patientId, scheduledAt, status, recordedBy, notes }) {
    if (!isSupabaseConfigured || !isValidUuid(medicationId) || !isValidUuid(patientId)) {
      return { data: null, error: null };
    }

    try {
      const scheduledDate = new Date(scheduledAt || Date.now());
      // Window for same dose: +/- 30 minutes of scheduled time on same day
      const startWindow = new Date(scheduledDate.getTime() - 30 * 60 * 1000).toISOString();
      const endWindow = new Date(scheduledDate.getTime() + 30 * 60 * 1000).toISOString();

      // Check for existing dose log for this medication around the same scheduled time
      const { data: existingLogs } = await supabase
        .from('dose_logs')
        .select('id, status')
        .eq('medication_id', medicationId)
        .gte('scheduled_at', startWindow)
        .lte('scheduled_at', endWindow)
        .limit(1);

      if (existingLogs && existingLogs.length > 0) {
        const existing = existingLogs[0];
        // If already recorded with exact same status, prevent duplicate insert!
        if (existing.status === status) {
          return { data: existing, isDuplicate: true, error: null };
        }

        // If status changed (e.g. from skipped to taken), update the existing record
        const { data: updated, error: updateErr } = await supabase
          .from('dose_logs')
          .update({
            status,
            recorded_at: new Date().toISOString(),
            recorded_by: isValidUuid(recordedBy) ? recordedBy : null,
            notes: notes || `Status updated to ${status}`
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateErr) throw updateErr;
        return { data: updated, isDuplicate: false, error: null };
      }

      // No existing record -> insert new dose_logs row
      const payload = {
        medication_id: medicationId,
        patient_id: patientId,
        scheduled_at: scheduledDate.toISOString(),
        status,
        recorded_by: isValidUuid(recordedBy) ? recordedBy : null,
        recorded_at: new Date().toISOString(),
        notes: notes || `Recorded via CareCircle`
      };

      const { data, error } = await supabase
        .from('dose_logs')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      // Note: Inventory deduction is handled consistently by PostgreSQL trigger
      // (trg_dose_inventory_deduction) on dose_logs or synchronized via CareContext,
      // avoiding duplicate or desynchronized manual deductions.

      return { data, isDuplicate: false, error: null };
    } catch (error) {
      console.error('Error recording dose log in Supabase:', error.message);
      return { data: null, isDuplicate: false, error };
    }
  }
};

export default medicationService;
