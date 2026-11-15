import { supabase, isSupabaseConfigured } from './supabase';

const isValidUuid = (id) =>
  Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

const LOCAL_REFILLS_KEY = 'carecircle_refills_log_cache';

/**
 * Calculate detailed stock metrics & status indicators for a medicine
 */
export const calculateStockMetrics = (med) => {
  const currentQuantity = Number(
    med.currentQuantity ?? med.current_quantity ?? med.pillsRemaining ?? med.pills_remaining ?? 0
  );
  const initialQuantity = Math.max(
    currentQuantity,
    Number(med.initialQuantity ?? med.initial_quantity ?? med.totalPills ?? med.total_pills ?? 30)
  );
  const units = (med.units || med.route_or_form || med.form || 'tablets').toLowerCase();
  const refillThreshold = Number(med.refillThreshold ?? med.refill_threshold ?? 5);
  const frequency = (med.frequency || 'Once daily').toLowerCase();
  const expiryDate = med.expiryDate || med.expiry_date || null;
  const lastRefillDate = med.lastRefillDate || med.last_refill_date || null;

  // Calculate daily dose consumption with medical pattern boundaries
  let dosesPerDay = 1;
  if (frequency.includes('weekly') || frequency.includes('once a week')) {
    dosesPerDay = 1 / 7;
  } else if (frequency.includes('twice a week') || frequency.includes('2 times a week') || frequency.includes('2x/week')) {
    dosesPerDay = 2 / 7;
  } else if (frequency.includes('every other day') || frequency.includes('every 2 days') || frequency.includes('qod')) {
    dosesPerDay = 0.5;
  } else if (frequency.includes('every 4 hours') || frequency.includes('q4h')) {
    dosesPerDay = 6;
  } else if (frequency.includes('every 6 hours') || frequency.includes('q6h') || frequency.includes('four times') || /\b4\s*times\b/.test(frequency)) {
    dosesPerDay = 4;
  } else if (frequency.includes('every 8 hours') || frequency.includes('q8h') || frequency.includes('three times') || frequency.includes('thrice') || /\b3\s*times\b/.test(frequency)) {
    dosesPerDay = 3;
  } else if (frequency.includes('twice') || frequency.includes('every 12 hours') || frequency.includes('q12h') || /\b2\s*times\b/.test(frequency) || /\bbid\b/.test(frequency)) {
    dosesPerDay = 2;
  } else if (frequency.includes('once') || frequency.includes('daily') || /\bqd\b/.test(frequency)) {
    dosesPerDay = 1;
  }

  // Days of supply remaining
  const daysRemaining = Math.max(0, Math.floor(currentQuantity / (dosesPerDay || 1)));

  // Remaining supply percentage
  const percentage = initialQuantity > 0
    ? Math.min(100, Math.max(0, Math.round((currentQuantity / initialQuantity) * 100)))
    : 0;

  // Expiration calculations
  let daysUntilExpiry = null;
  let isExpiringSoon = false;
  let isExpired = false;

  if (expiryDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expiryDate);
    expDate.setHours(0, 0, 0, 0);

    const diffMs = expDate.getTime() - today.getTime();
    daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      isExpired = true;
      isExpiringSoon = true;
    } else if (daysUntilExpiry <= 30) {
      isExpiringSoon = true;
    }
  }

  // Status Indicators: Expired (Highest Priority) | Out of Stock | Low Stock | Expiring Soon | In Stock
  const isOutOfStock = currentQuantity <= 0;
  const isLowStock = !isOutOfStock && currentQuantity <= refillThreshold;
  const isInStock = !isOutOfStock && !isLowStock && !isExpiringSoon && !isExpired;

  let status = 'in_stock';
  let statusLabel = 'In Stock';
  let statusBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (isExpired) {
    status = 'expired';
    statusLabel = 'Expired';
    statusBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
  } else if (isOutOfStock) {
    status = 'out_of_stock';
    statusLabel = 'Out of Stock';
    statusBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
  } else if (isLowStock) {
    status = 'low_stock';
    statusLabel = 'Low Stock';
    statusBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
  } else if (isExpiringSoon) {
    status = 'expiring_soon';
    statusLabel = 'Expiring Soon';
    statusBadgeClass = 'bg-orange-100 text-orange-800 border-orange-300';
  }

  return {
    currentQuantity,
    initialQuantity,
    units,
    refillThreshold,
    dosesPerDay,
    daysRemaining,
    percentage,
    expiryDate,
    lastRefillDate,
    daysUntilExpiry,
    isOutOfStock,
    isLowStock,
    isExpiringSoon,
    isExpired,
    isInStock,
    status,
    statusLabel,
    statusBadgeClass
  };
};

export const refillService = {
  // 1. Get Refill History
  async getRefillHistory(patientId) {
    if (isSupabaseConfigured && isValidUuid(patientId)) {
      try {
        const { data, error } = await supabase
          .from('refill_logs')
          .select(`
            id,
            medication_id,
            patient_id,
            quantity_added,
            units,
            pharmacy_name,
            rx_number,
            refilled_at,
            expiry_date,
            refilled_by,
            cost,
            notes,
            medication:medications!medication_id(name, dosage, route_or_form, units),
            recorder:profiles!refilled_by(full_name, role)
          `)
          .eq('patient_id', patientId)
          .order('refilled_at', { ascending: false });

        if (!error && data) {
          return { data, error: null };
        }
      } catch (err) {
        console.warn('Error fetching refill logs from Supabase:', err.message);
      }
    }

    // Local cached refills fallback
    try {
      const stored = localStorage.getItem(LOCAL_REFILLS_KEY);
      if (stored) {
        return { data: JSON.parse(stored), error: null };
      }
    } catch {
      // ignore
    }

    // Baseline mock history
    const defaultHistory = [
      {
        id: 'refill-1',
        medication_id: 'med-1',
        medication: { name: 'Lisinopril', dosage: '10 mg', units: 'tablets' },
        quantity_added: 30,
        units: 'tablets',
        pharmacy_name: 'Walgreens Pharmacy #4192',
        rx_number: 'RX-982142',
        refilled_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        expiry_date: '2027-05-15',
        recorder: { full_name: 'Sarah Jenkins', role: 'Primary Caregiver' },
        notes: 'Monthly 30-day supply refill collected.'
      },
      {
        id: 'refill-2',
        medication_id: 'med-2',
        medication: { name: 'Metformin ER', dosage: '500 mg', units: 'tablets' },
        quantity_added: 60,
        units: 'tablets',
        pharmacy_name: 'CVS Pharmacy (Main St)',
        rx_number: 'RX-102941',
        refilled_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        expiry_date: '2026-11-28',
        recorder: { full_name: 'Sarah Jenkins', role: 'Primary Caregiver' },
        notes: '60 tablets (twice daily schedule).'
      },
      {
        id: 'refill-3',
        medication_id: 'med-4',
        medication: { name: 'Atorvastatin', dosage: '20 mg', units: 'tablets' },
        quantity_added: 30,
        units: 'tablets',
        pharmacy_name: 'Walgreens Pharmacy #4192',
        rx_number: 'RX-441209',
        refilled_at: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
        expiry_date: '2027-04-10',
        recorder: { full_name: 'Sarah Jenkins', role: 'Primary Caregiver' },
        notes: 'Cholesterol medication re-ordered.'
      }
    ];

    return { data: defaultHistory, error: null };
  },

  // 2. Record Refill and Update Stock in Database
  async recordRefill({
    medicationId,
    patientId,
    quantityAdded,
    units = 'tablets',
    pharmacyName = 'Community Pharmacy',
    rxNumber = '',
    newExpiryDate = null,
    refillDate = null,
    notes = '',
    cost = null,
    refilledBy = null
  }) {
    const qty = Number(quantityAdded) || 30;
    const effectiveRefillDate = refillDate ? new Date(refillDate).toISOString() : new Date().toISOString();

    if (isSupabaseConfigured && isValidUuid(medicationId) && isValidUuid(patientId)) {
      try {
        // A. Insert Refill Log
        const { data: refillRow, error: refillErr } = await supabase
          .from('refill_logs')
          .insert([
            {
              medication_id: medicationId,
              patient_id: patientId,
              quantity_added: qty,
              units,
              pharmacy_name: pharmacyName,
              rx_number: rxNumber,
              expiry_date: newExpiryDate || null,
              refilled_at: effectiveRefillDate,
              notes,
              cost,
              refilled_by: isValidUuid(refilledBy) ? refilledBy : null
            }
          ])
          .select(`
            id,
            medication_id,
            patient_id,
            quantity_added,
            units,
            pharmacy_name,
            rx_number,
            refilled_at,
            expiry_date,
            notes,
            medication:medications!medication_id(name, dosage, units)
          `)
          .single();

        if (refillErr) throw refillErr;

        // B. Increment current_quantity and pills_remaining on medication record
        const { data: currentMed } = await supabase
          .from('medications')
          .select('current_quantity, pills_remaining, initial_quantity, total_pills, units')
          .eq('id', medicationId)
          .single();

        const currentQty = currentMed?.current_quantity ?? currentMed?.pills_remaining ?? 0;
        const newRemaining = Math.max(0, currentQty + qty);
        const newInitial = Math.max(currentMed?.initial_quantity ?? currentMed?.total_pills ?? 30, newRemaining);

        const updatePayload = {
          current_quantity: newRemaining,
          pills_remaining: newRemaining,
          initial_quantity: newInitial,
          total_pills: newInitial,
          units: units || currentMed?.units || 'tablets',
          last_refill_date: effectiveRefillDate,
          updated_at: new Date().toISOString()
        };

        if (newExpiryDate) {
          updatePayload.expiry_date = newExpiryDate;
        }

        await supabase
          .from('medications')
          .update(updatePayload)
          .eq('id', medicationId);

        return { data: refillRow, newRemaining, error: null };
      } catch (err) {
        console.error('Error inserting refill in Supabase:', err);
      }
    }

    // Local fallback
    const localEntry = {
      id: `refill-${Date.now()}`,
      medication_id: medicationId,
      patient_id: patientId,
      quantity_added: qty,
      units,
      pharmacy_name: pharmacyName,
      rx_number: rxNumber,
      refilled_at: effectiveRefillDate,
      expiry_date: newExpiryDate,
      notes,
      cost,
      recorder: { full_name: 'Caregiver', role: 'Primary Caregiver' }
    };

    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_REFILLS_KEY) || '[]');
      existing.unshift(localEntry);
      localStorage.setItem(LOCAL_REFILLS_KEY, JSON.stringify(existing.slice(0, 50)));
    } catch {
      // ignore
    }

    return { data: localEntry, newRemaining: qty, error: null };
  }
};

export default refillService;
