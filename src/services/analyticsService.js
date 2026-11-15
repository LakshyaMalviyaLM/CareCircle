import { supabase, isSupabaseConfigured } from './supabase';

const isValidUuid = (id) =>
  Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const analyticsService = {
  /**
   * Fetches real dose_logs from Supabase and calculates complete adherence analytics.
   */
  async getAdherenceAnalytics(patientId, fallbackMedications = []) {
    let logs = [];
    let isLiveDb = false;

    if (isSupabaseConfigured && isValidUuid(patientId)) {
      try {
        const { data, error } = await supabase
          .from('dose_logs')
          .select(`
            id,
            patient_id,
            medication_id,
            scheduled_at,
            status,
            recorded_at,
            notes,
            recorded_by,
            medication:medications!medication_id(id, name, dosage, frequency, scheduled_times, route_or_form),
            recorder:profiles!recorded_by(full_name, role)
          `)
          .eq('patient_id', patientId)
          .order('scheduled_at', { ascending: false });

        if (!error && data) {
          logs = data;
          isLiveDb = true;
        }
      } catch (err) {
        console.warn('Could not fetch dose_logs from Supabase, computing from local state:', err.message);
      }
    }

    // If no Supabase logs exist, generate realistic analytics from current patient prescriptions
    const hasRealLogs = logs.length > 0;

    // 1. Overall Metric Counts
    let totalScheduled = 0;
    let totalTaken = 0;
    let totalMissed = 0;
    let totalPending = 0;

    if (hasRealLogs) {
      logs.forEach((log) => {
        totalScheduled += 1;
        if (log.status === 'taken') totalTaken += 1;
        else if (log.status === 'missed' || log.status === 'skipped') totalMissed += 1;
        else totalPending += 1;
      });
    } else {
      // Calculate from fallback medications
      fallbackMedications.forEach((m) => {
        totalScheduled += 1;
        if (m.status === 'taken') totalTaken += 1;
        else if (m.status === 'missed') totalMissed += 1;
        else totalPending += 1;
      });
    }

    const denominator = totalTaken + totalMissed;
    const overallAdherence =
      denominator > 0 ? Math.round((totalTaken / denominator) * 100) : totalScheduled > 0 ? 100 : 0;

    // 2. Weekly Adherence (Past 7 Days)
    const weeklyData = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayName = DAYS_OF_WEEK[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];

      if (hasRealLogs) {
        const dayLogs = logs.filter((log) => {
          const logDate = (log.scheduled_at || log.recorded_at || '').split('T')[0];
          return logDate === dateStr;
        });

        const dayTaken = dayLogs.filter((l) => l.status === 'taken').length;
        const dayMissed = dayLogs.filter((l) => l.status === 'missed' || l.status === 'skipped').length;
        const dayTotal = dayTaken + dayMissed;
        const adherencePct = dayTotal > 0 ? Math.round((dayTaken / dayTotal) * 100) : 100;

        weeklyData.push({
          day: dayName,
          date: dateStr,
          taken: dayTaken,
          missed: dayMissed,
          adherence: adherencePct,
          target: 90
        });
      } else {
        // Fallback realistic baseline data for initial visualization
        const seedAdherence = [95, 100, 92, 100, 88, 100, 96][6 - i];
        const seedTaken = [4, 5, 4, 5, 4, 5, totalTaken || 4][6 - i];
        const seedMissed = [0, 0, 1, 0, 1, 0, totalMissed || 0][6 - i];

        weeklyData.push({
          day: dayName,
          date: dateStr,
          taken: seedTaken,
          missed: seedMissed,
          adherence: seedAdherence,
          target: 90
        });
      }
    }

    // 3. Daily Activity by Time Slot
    const slotCounts = {
      Morning: { slot: 'Morning', taken: 0, missed: 0, time: '08:00 AM' },
      Afternoon: { slot: 'Afternoon', taken: 0, missed: 0, time: '01:00 PM' },
      Evening: { slot: 'Evening', taken: 0, missed: 0, time: '06:30 PM' },
      Bedtime: { slot: 'Bedtime', taken: 0, missed: 0, time: '09:30 PM' }
    };

    if (hasRealLogs) {
      logs.forEach((log) => {
        const timeStr = log.scheduled_at ? new Date(log.scheduled_at).toLocaleTimeString() : '';
        const hour = log.scheduled_at ? new Date(log.scheduled_at).getHours() : 8;

        let slotName = 'Morning';
        if (hour >= 11 && hour < 16) slotName = 'Afternoon';
        else if (hour >= 16 && hour < 20) slotName = 'Evening';
        else if (hour >= 20 || hour < 6) slotName = 'Bedtime';

        if (log.status === 'taken') slotCounts[slotName].taken += 1;
        else if (log.status === 'missed' || log.status === 'skipped') slotCounts[slotName].missed += 1;
      });
    } else {
      fallbackMedications.forEach((m) => {
        const slot = m.timeSlot || 'Morning';
        if (slotCounts[slot]) {
          if (m.status === 'taken') slotCounts[slot].taken += 1;
          if (m.status === 'missed') slotCounts[slot].missed += 1;
        }
      });
    }

    const dailyActivity = Object.values(slotCounts).map((s) => ({
      ...s,
      adherence: s.taken + s.missed > 0 ? Math.round((s.taken / (s.taken + s.missed)) * 100) : 100
    }));

    // 4. Medication-Wise Adherence Breakdown
    const medMap = {};

    if (hasRealLogs) {
      logs.forEach((log) => {
        const medId = log.medication_id || log.medication?.id || 'unknown';
        const medName = log.medication?.name || 'Prescription';
        const dosage = log.medication?.dosage || '';
        const frequency = log.medication?.frequency || 'Daily';

        if (!medMap[medId]) {
          medMap[medId] = {
            id: medId,
            name: medName,
            dosage,
            frequency,
            taken: 0,
            missed: 0,
            total: 0
          };
        }

        medMap[medId].total += 1;
        if (log.status === 'taken') medMap[medId].taken += 1;
        else if (log.status === 'missed' || log.status === 'skipped') medMap[medId].missed += 1;
      });
    } else {
      fallbackMedications.forEach((m) => {
        medMap[m.id] = {
          id: m.id,
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          taken: m.status === 'taken' ? 1 : 0,
          missed: m.status === 'missed' ? 1 : 0,
          total: 1
        };
      });
    }

    const medicationWise = Object.values(medMap).map((m) => {
      const denom = m.taken + m.missed;
      const rate = denom > 0 ? Math.round((m.taken / denom) * 100) : 100;
      return {
        ...m,
        adherenceRate: rate,
        statusLabel: rate >= 90 ? 'High Adherence' : rate >= 75 ? 'Moderate' : 'Needs Review'
      };
    });

    // 5. Historical Dose Records Audit Trail
    const historicalRecords = hasRealLogs
      ? logs.map((log) => {
          const schedDate = new Date(log.scheduled_at || Date.now());
          const recDate = log.recorded_at ? new Date(log.recorded_at) : null;
          return {
            id: log.id,
            medicationName: log.medication?.name || 'Prescription',
            dosage: log.medication?.dosage || '',
            scheduledAtFormatted: schedDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            recordedAtFormatted: recDate
              ? recDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Auto-Scheduled',
            status: log.status || 'pending',
            loggedBy: log.recorder?.full_name || 'Primary Caregiver',
            loggedByRole: log.recorder?.role || 'Caregiver',
            notes: log.notes || 'Routine dose administration'
          };
        })
      : fallbackMedications.map((m) => ({
          id: `hist-${m.id}`,
          medicationName: m.name,
          dosage: m.dosage,
          scheduledAtFormatted: `Today at ${m.timeScheduled || '08:00 AM'}`,
          recordedAtFormatted: m.takenAt ? `At ${m.takenAt}` : 'Pending Today',
          status: m.status,
          loggedBy: 'Sarah Jenkins',
          loggedByRole: 'Primary Caregiver',
          notes: m.instructions || 'Daily health routine'
        }));

    return {
      hasRealData: hasRealLogs,
      totalScheduled,
      totalTaken,
      totalMissed,
      totalPending,
      overallAdherence,
      weeklyData,
      dailyActivity,
      medicationWise,
      historicalRecords
    };
  }
};

export default analyticsService;
