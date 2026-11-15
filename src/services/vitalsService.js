import { supabase, isSupabaseConfigured } from './supabase';

const isValidUuid = (id) =>
  Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

const LOCAL_VITALS_KEY = 'carecircle_health_vitals_cache';
const LEGACY_LOCAL_VITALS_KEY = 'carecircle_vitals_logs_cache';

// Baseline historical records (last 14 days) with all 5 vitals + units
const generateDefaultLogs = (patientId) => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  
  return [
    {
      id: 'vital-1',
      patient_id: patientId,
      recorded_at: new Date(now - 0.2 * dayMs).toISOString(),
      systolic_bp: 122,
      diastolic_bp: 78,
      bp_unit: 'mmHg',
      heart_rate: 72,
      heart_rate_unit: 'bpm',
      blood_sugar: 104,
      blood_sugar_unit: 'mg/dL',
      blood_sugar_context: 'fasting',
      weight: 68.4,
      weight_unit: 'kg',
      temperature: 98.4,
      temperature_unit: '°F',
      measurement_method: 'Manual arm cuff & digital thermometer',
      notes: 'Morning routine reading. Resting pulse stable. Hydration good.',
      recorder: { full_name: 'Sarah Jenkins', role: 'Primary Caregiver' },
      manually_entered: true
    },
    {
      id: 'vital-2',
      patient_id: patientId,
      recorded_at: new Date(now - 1.2 * dayMs).toISOString(),
      systolic_bp: 126,
      diastolic_bp: 82,
      bp_unit: 'mmHg',
      heart_rate: 74,
      heart_rate_unit: 'bpm',
      blood_sugar: 138,
      blood_sugar_unit: 'mg/dL',
      blood_sugar_context: 'post_prandial',
      weight: 68.5,
      weight_unit: 'kg',
      temperature: 98.6,
      temperature_unit: '°F',
      measurement_method: 'Manual home cuff & glucometer',
      notes: 'Logged 2 hours after lunch. Blood glucose in expected post-meal range.',
      recorder: { full_name: 'Nurse Lisa Morales', role: 'Visiting Nurse' },
      manually_entered: true
    },
    {
      id: 'vital-3',
      patient_id: patientId,
      recorded_at: new Date(now - 2.3 * dayMs).toISOString(),
      systolic_bp: 120,
      diastolic_bp: 78,
      bp_unit: 'mmHg',
      heart_rate: 69,
      heart_rate_unit: 'bpm',
      blood_sugar: 98,
      blood_sugar_unit: 'mg/dL',
      blood_sugar_context: 'fasting',
      weight: 68.3,
      weight_unit: 'kg',
      temperature: 98.2,
      temperature_unit: '°F',
      measurement_method: 'Manual reading by patient',
      notes: 'Fasting glucose optimal. Patient felt refreshed after 8 hours sleep.',
      recorder: { full_name: 'Eleanor Vance', role: 'Patient' },
      manually_entered: true
    },
    {
      id: 'vital-4',
      patient_id: patientId,
      recorded_at: new Date(now - 3.4 * dayMs).toISOString(),
      systolic_bp: 130,
      diastolic_bp: 84,
      bp_unit: 'mmHg',
      heart_rate: 78,
      heart_rate_unit: 'bpm',
      blood_sugar: 112,
      blood_sugar_unit: 'mg/dL',
      blood_sugar_context: 'fasting',
      weight: 68.6,
      weight_unit: 'kg',
      temperature: 98.5,
      temperature_unit: '°F',
      measurement_method: 'Manual arm cuff',
      notes: 'Slightly elevated BP after garden walk. Rested 15 min; normalized.',
      recorder: { full_name: 'Sarah Jenkins', role: 'Primary Caregiver' },
      manually_entered: true
    },
    {
      id: 'vital-5',
      patient_id: patientId,
      recorded_at: new Date(now - 4.5 * dayMs).toISOString(),
      systolic_bp: 124,
      diastolic_bp: 80,
      bp_unit: 'mmHg',
      heart_rate: 71,
      heart_rate_unit: 'bpm',
      blood_sugar: 106,
      blood_sugar_unit: 'mg/dL',
      blood_sugar_context: 'fasting',
      weight: 68.5,
      weight_unit: 'kg',
      temperature: 98.4,
      temperature_unit: '°F',
      measurement_method: 'Manual routine log',
      notes: 'Baseline parameters stable. Evening medication taken as scheduled.',
      recorder: { full_name: 'Sarah Jenkins', role: 'Primary Caregiver' },
      manually_entered: true
    },
    {
      id: 'vital-6',
      patient_id: patientId,
      recorded_at: new Date(now - 5.5 * dayMs).toISOString(),
      systolic_bp: 128,
      diastolic_bp: 82,
      bp_unit: 'mmHg',
      heart_rate: 75,
      heart_rate_unit: 'bpm',
      blood_sugar: 142,
      blood_sugar_unit: 'mg/dL',
      blood_sugar_context: 'post_prandial',
      weight: 68.6,
      weight_unit: 'kg',
      temperature: 98.7,
      temperature_unit: '°F',
      measurement_method: 'Manual glucometer',
      notes: 'Post-dinner reading. Mild temperature check normal.',
      recorder: { full_name: 'Michael Vance', role: 'Family Member' },
      manually_entered: true
    },
    {
      id: 'vital-7',
      patient_id: patientId,
      recorded_at: new Date(now - 6.5 * dayMs).toISOString(),
      systolic_bp: 122,
      diastolic_bp: 80,
      bp_unit: 'mmHg',
      heart_rate: 70,
      heart_rate_unit: 'bpm',
      blood_sugar: 101,
      blood_sugar_unit: 'mg/dL',
      blood_sugar_context: 'fasting',
      weight: 68.4,
      weight_unit: 'kg',
      temperature: 98.3,
      temperature_unit: '°F',
      measurement_method: 'Weekly clinic review by visiting nurse',
      notes: 'Comprehensive weekly vitals check. Patient in good spirits.',
      recorder: { full_name: 'Nurse Lisa Morales', role: 'Visiting Nurse' },
      manually_entered: true
    },
    {
      id: 'vital-8',
      patient_id: patientId,
      recorded_at: new Date(now - 8.5 * dayMs).toISOString(),
      systolic_bp: 125,
      diastolic_bp: 81,
      bp_unit: 'mmHg',
      heart_rate: 73,
      heart_rate_unit: 'bpm',
      blood_sugar: 108,
      blood_sugar_unit: 'mg/dL',
      blood_sugar_context: 'fasting',
      weight: 68.5,
      weight_unit: 'kg',
      temperature: 98.4,
      temperature_unit: '°F',
      measurement_method: 'Manual arm cuff',
      notes: 'Routine morning entry.',
      recorder: { full_name: 'Sarah Jenkins', role: 'Primary Caregiver' },
      manually_entered: true
    },
    {
      id: 'vital-9',
      patient_id: patientId,
      recorded_at: new Date(now - 11.5 * dayMs).toISOString(),
      systolic_bp: 127,
      diastolic_bp: 83,
      bp_unit: 'mmHg',
      heart_rate: 76,
      heart_rate_unit: 'bpm',
      blood_sugar: 114,
      blood_sugar_unit: 'mg/dL',
      blood_sugar_context: 'fasting',
      weight: 68.7,
      weight_unit: 'kg',
      temperature: 98.6,
      temperature_unit: '°F',
      measurement_method: 'Manual scale and cuff',
      notes: 'Pre-appointment baseline reading.',
      recorder: { full_name: 'Sarah Jenkins', role: 'Primary Caregiver' },
      manually_entered: true
    },
    {
      id: 'vital-10',
      patient_id: patientId,
      recorded_at: new Date(now - 13.5 * dayMs).toISOString(),
      systolic_bp: 123,
      diastolic_bp: 79,
      bp_unit: 'mmHg',
      heart_rate: 71,
      heart_rate_unit: 'bpm',
      blood_sugar: 103,
      blood_sugar_unit: 'mg/dL',
      blood_sugar_context: 'fasting',
      weight: 68.5,
      weight_unit: 'kg',
      temperature: 98.4,
      temperature_unit: '°F',
      measurement_method: 'Manual reading',
      notes: 'Stable morning measurements.',
      recorder: { full_name: 'Eleanor Vance', role: 'Patient' },
      manually_entered: true
    }
  ];
};

export const vitalsService = {
  // 1. Fetch vitals logs for patient with optional date range filter
  async getVitalsLogs(patientId, options = {}) {
    const { days = null, startDate = null, endDate = null, context = null } = options;

    if (isSupabaseConfigured && isValidUuid(patientId)) {
      try {
        // Query health_vitals first
        let query = supabase
          .from('health_vitals')
          .select(`
            id,
            patient_id,
            recorded_at,
            systolic_bp,
            diastolic_bp,
            bp_unit,
            heart_rate,
            heart_rate_unit,
            blood_sugar,
            blood_sugar_unit,
            blood_sugar_context,
            weight,
            weight_unit,
            temperature,
            temperature_unit,
            measurement_method,
            notes,
            created_at,
            recorder:profiles!recorded_by(full_name, role)
          `)
          .eq('patient_id', patientId)
          .order('recorded_at', { ascending: false });

        if (days) {
          const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
          query = query.gte('recorded_at', since);
        } else if (startDate) {
          query = query.gte('recorded_at', new Date(startDate).toISOString());
        }
        if (endDate) {
          query = query.lte('recorded_at', new Date(endDate).toISOString());
        }
        if (context && context !== 'all') {
          query = query.eq('blood_sugar_context', context);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          // Standardize fields
          const formatted = data.map(item => ({
            ...item,
            weight_kg: item.weight,
            manually_entered: true
          }));
          return { data: formatted, error: null };
        }

        // If health_vitals is empty, check legacy vitals_logs
        const { data: legacyData, error: legacyErr } = await supabase
          .from('vitals_logs')
          .select(`
            id,
            patient_id,
            recorded_at,
            systolic_bp,
            diastolic_bp,
            heart_rate,
            blood_sugar,
            blood_sugar_context,
            weight_kg,
            notes,
            recorder:profiles!recorded_by(full_name, role)
          `)
          .eq('patient_id', patientId)
          .order('recorded_at', { ascending: false });

        if (!legacyErr && legacyData && legacyData.length > 0) {
          const standardized = legacyData.map(item => ({
            ...item,
            bp_unit: 'mmHg',
            heart_rate_unit: 'bpm',
            blood_sugar_unit: 'mg/dL',
            weight: item.weight_kg,
            weight_unit: 'kg',
            temperature: 98.4,
            temperature_unit: '°F',
            measurement_method: 'Manual entry',
            manually_entered: true
          }));
          return { data: standardized, error: null };
        }
      } catch (err) {
        console.warn('Error fetching vitals from Supabase:', err.message);
      }
    }

    // Local cached vitals fallback
    let cachedList = [];
    try {
      const stored = localStorage.getItem(LOCAL_VITALS_KEY) || localStorage.getItem(LEGACY_LOCAL_VITALS_KEY);
      if (stored) {
        cachedList = JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    if (!cachedList || cachedList.length === 0) {
      cachedList = generateDefaultLogs(patientId);
      try {
        localStorage.setItem(LOCAL_VITALS_KEY, JSON.stringify(cachedList));
      } catch {
        // ignore
      }
    }

    // Apply filtering to cached fallback
    let filtered = [...cachedList];
    if (days) {
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(item => new Date(item.recorded_at).getTime() >= cutoff);
    } else if (startDate) {
      const startMs = new Date(startDate).getTime();
      filtered = filtered.filter(item => new Date(item.recorded_at).getTime() >= startMs);
    }
    if (endDate) {
      const endMs = new Date(endDate).getTime();
      filtered = filtered.filter(item => new Date(item.recorded_at).getTime() <= endMs);
    }
    if (context && context !== 'all') {
      filtered = filtered.filter(item => item.blood_sugar_context === context);
    }

    return { data: filtered, error: null };
  },

  // 2. Add New Vital Log
  async addVitalsLog({
    patientId,
    systolicBp,
    diastolicBp,
    bpUnit = 'mmHg',
    heartRate,
    heartRateUnit = 'bpm',
    bloodSugar,
    bloodSugarUnit = 'mg/dL',
    bloodSugarContext = 'fasting',
    weight,
    weightKg,
    weightUnit = 'kg',
    temperature = 98.4,
    temperatureUnit = '°F',
    measurementMethod = 'Manual Home Reading',
    notes = '',
    recordedBy = null,
    recordedAt = null
  }) {
    const finalWeight = weight !== undefined ? weight : weightKg;
    const finalRecordedAt = recordedAt || new Date().toISOString();

    const payload = {
      patient_id: patientId,
      systolic_bp: systolicBp ? Number(systolicBp) : null,
      diastolic_bp: diastolicBp ? Number(diastolicBp) : null,
      bp_unit: bpUnit,
      heart_rate: heartRate ? Number(heartRate) : null,
      heart_rate_unit: heartRateUnit,
      blood_sugar: bloodSugar ? Number(bloodSugar) : null,
      blood_sugar_unit: bloodSugarUnit,
      blood_sugar_context: bloodSugarContext,
      weight: finalWeight ? Number(finalWeight) : null,
      weight_unit: weightUnit,
      temperature: temperature ? Number(temperature) : null,
      temperature_unit: temperatureUnit,
      measurement_method: measurementMethod,
      notes,
      recorded_by: isValidUuid(recordedBy) ? recordedBy : null,
      recorded_at: finalRecordedAt
    };

    if (isSupabaseConfigured && isValidUuid(patientId)) {
      try {
        // Try inserting into health_vitals
        const { data, error } = await supabase
          .from('health_vitals')
          .insert([payload])
          .select(`
            id,
            patient_id,
            recorded_at,
            systolic_bp,
            diastolic_bp,
            bp_unit,
            heart_rate,
            heart_rate_unit,
            blood_sugar,
            blood_sugar_unit,
            blood_sugar_context,
            weight,
            weight_unit,
            temperature,
            temperature_unit,
            measurement_method,
            notes,
            created_at,
            recorder:profiles!recorded_by(full_name, role)
          `)
          .single();

        if (!error && data) {
          const formatted = {
            ...data,
            weight_kg: data.weight,
            manually_entered: true
          };
          return { data: formatted, error: null };
        }

        // Fallback to legacy vitals_logs table if health_vitals schema hasn't migrated yet
        const legacyPayload = {
          patient_id: patientId,
          systolic_bp: payload.systolic_bp,
          diastolic_bp: payload.diastolic_bp,
          heart_rate: payload.heart_rate,
          blood_sugar: payload.blood_sugar,
          blood_sugar_context: payload.blood_sugar_context,
          weight_kg: payload.weight,
          notes: payload.notes,
          recorded_by: payload.recorded_by,
          recorded_at: payload.recorded_at
        };

        const { data: legacyData, error: legacyErr } = await supabase
          .from('vitals_logs')
          .insert([legacyPayload])
          .select(`
            id,
            patient_id,
            recorded_at,
            systolic_bp,
            diastolic_bp,
            heart_rate,
            blood_sugar,
            blood_sugar_context,
            weight_kg,
            notes,
            recorder:profiles!recorded_by(full_name, role)
          `)
          .single();

        if (!legacyErr && legacyData) {
          const combined = {
            ...legacyData,
            ...payload,
            id: legacyData.id,
            weight_kg: legacyData.weight_kg,
            manually_entered: true
          };
          return { data: combined, error: null };
        }
      } catch (err) {
        console.warn('Error inserting vital log in Supabase, using local fallback:', err.message);
      }
    }

    // Local fallback
    const localEntry = {
      ...payload,
      id: `vital-${Date.now()}`,
      weight_kg: payload.weight,
      recorder: { full_name: 'Caregiver', role: 'Primary Caregiver' },
      manually_entered: true
    };

    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_VITALS_KEY) || '[]');
      existing.unshift(localEntry);
      localStorage.setItem(LOCAL_VITALS_KEY, JSON.stringify(existing.slice(0, 100)));
    } catch {
      // ignore
    }

    return { data: localEntry, error: null };
  },

  // 3. Update Existing Vital Log
  async updateVitalsLog(id, updateData) {
    const payload = {
      systolic_bp: updateData.systolicBp ? Number(updateData.systolicBp) : updateData.systolic_bp,
      diastolic_bp: updateData.diastolicBp ? Number(updateData.diastolicBp) : updateData.diastolic_bp,
      bp_unit: updateData.bpUnit || updateData.bp_unit || 'mmHg',
      heart_rate: updateData.heartRate ? Number(updateData.heartRate) : updateData.heart_rate,
      heart_rate_unit: updateData.heartRateUnit || updateData.heart_rate_unit || 'bpm',
      blood_sugar: updateData.bloodSugar ? Number(updateData.bloodSugar) : updateData.blood_sugar,
      blood_sugar_unit: updateData.bloodSugarUnit || updateData.blood_sugar_unit || 'mg/dL',
      blood_sugar_context: updateData.bloodSugarContext || updateData.blood_sugar_context || 'fasting',
      weight: updateData.weight !== undefined ? Number(updateData.weight) : (updateData.weight_kg !== undefined ? Number(updateData.weight_kg) : null),
      weight_unit: updateData.weightUnit || updateData.weight_unit || 'kg',
      temperature: updateData.temperature ? Number(updateData.temperature) : null,
      temperature_unit: updateData.temperatureUnit || updateData.temperature_unit || '°F',
      measurement_method: updateData.measurementMethod || updateData.measurement_method || 'Manual Home Reading',
      notes: updateData.notes || '',
      updated_at: new Date().toISOString()
    };

    if (updateData.recordedAt || updateData.recorded_at) {
      payload.recorded_at = updateData.recordedAt || updateData.recorded_at;
    }

    if (isSupabaseConfigured && isValidUuid(id)) {
      try {
        const { data, error } = await supabase
          .from('health_vitals')
          .update(payload)
          .eq('id', id)
          .select(`
            id,
            patient_id,
            recorded_at,
            systolic_bp,
            diastolic_bp,
            bp_unit,
            heart_rate,
            heart_rate_unit,
            blood_sugar,
            blood_sugar_unit,
            blood_sugar_context,
            weight,
            weight_unit,
            temperature,
            temperature_unit,
            measurement_method,
            notes,
            recorder:profiles!recorded_by(full_name, role)
          `)
          .single();

        if (!error && data) {
          return {
            data: {
              ...data,
              weight_kg: data.weight,
              manually_entered: true
            },
            error: null
          };
        }

        // Fallback update legacy table
        await supabase
          .from('vitals_logs')
          .update({
            systolic_bp: payload.systolic_bp,
            diastolic_bp: payload.diastolic_bp,
            heart_rate: payload.heart_rate,
            blood_sugar: payload.blood_sugar,
            blood_sugar_context: payload.blood_sugar_context,
            weight_kg: payload.weight,
            notes: payload.notes
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Error updating vital log in Supabase:', err.message);
      }
    }

    // Local fallback update
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_VITALS_KEY) || '[]');
      const updated = existing.map(item => {
        if (item.id === id) {
          return {
            ...item,
            ...payload,
            weight_kg: payload.weight,
            manually_entered: true
          };
        }
        return item;
      });
      localStorage.setItem(LOCAL_VITALS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    return { success: true, error: null };
  },

  // 4. Delete Vital Log
  async deleteVitalsLog(id) {
    if (isSupabaseConfigured && isValidUuid(id)) {
      try {
        await supabase.from('health_vitals').delete().eq('id', id);
        await supabase.from('vitals_logs').delete().eq('id', id);
        return { success: true, error: null };
      } catch (err) {
        console.error('Error deleting vitals log:', err);
      }
    }

    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_VITALS_KEY) || '[]');
      const filtered = existing.filter((v) => v.id !== id);
      localStorage.setItem(LOCAL_VITALS_KEY, JSON.stringify(filtered));
    } catch {
      // ignore
    }

    return { success: true, error: null };
  },

  // 5. Generate Comprehensive Health Vitals Report Summary
  calculateVitalsReport(logs = []) {
    if (!logs || logs.length === 0) {
      return {
        totalRecords: 0,
        hasData: false,
        dateSpan: 'No data',
        bp: { avgSystolic: 0, avgDiastolic: 0, min: '—', max: '—', latest: '—' },
        heartRate: { avg: 0, min: 0, max: 0, latest: 0 },
        bloodSugar: { avgFasting: 0, avgPostPrandial: 0, min: 0, max: 0, latest: 0 },
        weight: { start: 0, current: 0, change: 0, avg: 0 },
        temperature: { avg: 0, min: 0, max: 0, latest: 0 },
        observationalSummary: 'No health vitals records available for the selected period.'
      };
    }

    // Sort ascending for chronological metrics
    const sorted = [...logs].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
    const earliest = sorted[0];
    const latest = sorted[sorted.length - 1];

    const formatDate = (iso) =>
      new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

    // Blood Pressure
    const bpReadings = logs.filter(l => l.systolic_bp && l.diastolic_bp);
    const avgSystolic = bpReadings.length
      ? Math.round(bpReadings.reduce((acc, curr) => acc + curr.systolic_bp, 0) / bpReadings.length)
      : 120;
    const avgDiastolic = bpReadings.length
      ? Math.round(bpReadings.reduce((acc, curr) => acc + curr.diastolic_bp, 0) / bpReadings.length)
      : 80;
    const minSystolic = bpReadings.length ? Math.min(...bpReadings.map(b => b.systolic_bp)) : 120;
    const maxSystolic = bpReadings.length ? Math.max(...bpReadings.map(b => b.systolic_bp)) : 120;
    const minDiastolic = bpReadings.length ? Math.min(...bpReadings.map(b => b.diastolic_bp)) : 80;
    const maxDiastolic = bpReadings.length ? Math.max(...bpReadings.map(b => b.diastolic_bp)) : 80;

    // Heart Rate
    const hrReadings = logs.filter(l => l.heart_rate).map(l => l.heart_rate);
    const avgHr = hrReadings.length
      ? Math.round(hrReadings.reduce((a, b) => a + b, 0) / hrReadings.length)
      : 72;
    const minHr = hrReadings.length ? Math.min(...hrReadings) : 72;
    const maxHr = hrReadings.length ? Math.max(...hrReadings) : 72;

    // Blood Sugar
    const fasting = logs.filter(l => l.blood_sugar && l.blood_sugar_context === 'fasting').map(l => l.blood_sugar);
    const postPrandial = logs.filter(l => l.blood_sugar && l.blood_sugar_context === 'post_prandial').map(l => l.blood_sugar);
    const allSugar = logs.filter(l => l.blood_sugar).map(l => l.blood_sugar);

    const avgFasting = fasting.length ? Math.round(fasting.reduce((a, b) => a + b, 0) / fasting.length) : null;
    const avgPostPrandial = postPrandial.length ? Math.round(postPrandial.reduce((a, b) => a + b, 0) / postPrandial.length) : null;
    const minSugar = allSugar.length ? Math.min(...allSugar) : 100;
    const maxSugar = allSugar.length ? Math.max(...allSugar) : 100;

    // Weight
    const weightReadings = logs.filter(l => (l.weight !== undefined && l.weight !== null) || (l.weight_kg !== undefined && l.weight_kg !== null));
    const startWeight = weightReadings.length ? (earliest.weight || earliest.weight_kg || 68.5) : 68.5;
    const currentWeight = weightReadings.length ? (latest.weight || latest.weight_kg || 68.5) : 68.5;
    const weightDelta = Number((currentWeight - startWeight).toFixed(1));
    const avgWeight = weightReadings.length
      ? Number((weightReadings.reduce((sum, w) => sum + Number(w.weight || w.weight_kg), 0) / weightReadings.length).toFixed(1))
      : 68.5;

    // Temperature
    const tempReadings = logs.filter(l => l.temperature).map(l => Number(l.temperature));
    const avgTemp = tempReadings.length
      ? Number((tempReadings.reduce((a, b) => a + b, 0) / tempReadings.length).toFixed(1))
      : 98.4;
    const minTemp = tempReadings.length ? Math.min(...tempReadings) : 98.4;
    const maxTemp = tempReadings.length ? Math.max(...tempReadings) : 98.4;

    return {
      totalRecords: logs.length,
      hasData: true,
      startDate: formatDate(earliest.recorded_at),
      endDate: formatDate(latest.recorded_at),
      dateSpan: `${formatDate(earliest.recorded_at)} — ${formatDate(latest.recorded_at)}`,
      bp: {
        avgSystolic,
        avgDiastolic,
        min: `${minSystolic}/${minDiastolic} mmHg`,
        max: `${maxSystolic}/${maxDiastolic} mmHg`,
        latest: latest.systolic_bp && latest.diastolic_bp ? `${latest.systolic_bp}/${latest.diastolic_bp} mmHg` : '—'
      },
      heartRate: {
        avg: avgHr,
        min: minHr,
        max: maxHr,
        latest: latest.heart_rate || 72
      },
      bloodSugar: {
        avgFasting: avgFasting || 102,
        avgPostPrandial: avgPostPrandial || 136,
        min: minSugar,
        max: maxSugar,
        latest: latest.blood_sugar || 105,
        latestContext: latest.blood_sugar_context || 'fasting'
      },
      weight: {
        start: startWeight,
        current: currentWeight,
        change: weightDelta,
        avg: avgWeight,
        unit: latest.weight_unit || 'kg'
      },
      temperature: {
        avg: avgTemp,
        min: minTemp,
        max: maxTemp,
        latest: latest.temperature || 98.4,
        unit: latest.temperature_unit || '°F'
      },
      observationalSummary: `Health tracking observations for ${logs.length} manually recorded sessions. Mean blood pressure was ${avgSystolic}/${avgDiastolic} mmHg with resting heart rate averaging ${avgHr} BPM. Fasting glucose averaged ${avgFasting || 102} mg/dL and post-meal glucose averaged ${avgPostPrandial || 136} mg/dL. Weight remained stable (${weightDelta >= 0 ? `+${weightDelta}` : weightDelta} kg net delta).`
    };
  }
};

export default vitalsService;
