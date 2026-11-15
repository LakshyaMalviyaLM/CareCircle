-- ==============================================================================
-- CareCircle - Migration: 20261115000003_medicine_refill_inventory.sql
-- Medicine Refill Management, Inventory Tracking & Automated Consistent Deductions
-- ==============================================================================

-- 1. EXTEND MEDICATIONS TABLE WITH INVENTORY FIELDS
ALTER TABLE public.medications
    ADD COLUMN IF NOT EXISTS initial_quantity INT DEFAULT 30 CHECK (initial_quantity >= 0),
    ADD COLUMN IF NOT EXISTS current_quantity INT DEFAULT 30 CHECK (current_quantity >= 0),
    ADD COLUMN IF NOT EXISTS units TEXT DEFAULT 'tablets',
    ADD COLUMN IF NOT EXISTS refill_threshold INT DEFAULT 5 CHECK (refill_threshold >= 0),
    ADD COLUMN IF NOT EXISTS expiry_date DATE,
    ADD COLUMN IF NOT EXISTS last_refill_date TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- 2. BACKFILL AND SYNC EXISTING MEDICATIONS
UPDATE public.medications
SET
    current_quantity = COALESCE(pills_remaining, current_quantity, 30),
    initial_quantity = COALESCE(total_pills, initial_quantity, 30),
    refill_threshold = COALESCE(refill_threshold, 5),
    units = COALESCE(units, LOWER(route_or_form), 'tablets'),
    expiry_date = COALESCE(expiry_date, CURRENT_DATE + INTERVAL '180 days'),
    last_refill_date = COALESCE(last_refill_date, created_at, timezone('utc'::text, now()))
WHERE current_quantity IS NULL OR initial_quantity IS NULL OR units IS NULL;

-- 3. EXTEND REFILL_LOGS TABLE WITH INVENTORY METADATA
ALTER TABLE public.refill_logs
    ADD COLUMN IF NOT EXISTS units TEXT DEFAULT 'tablets',
    ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- 4. FUNCTION: DEDUCT INVENTORY ON DOSE LOG TAKEN (AND PREVENT DUPLICATES)
CREATE OR REPLACE FUNCTION public.handle_dose_inventory_deduction()
RETURNS TRIGGER AS $$
DECLARE
    med_rec RECORD;
    caregiver_rec RECORD;
    new_qty INT;
BEGIN
    -- Scenario A: Dose marked as 'taken' (Insert or Update from non-taken)
    IF (TG_OP = 'INSERT' AND NEW.status = 'taken') OR
       (TG_OP = 'UPDATE' AND OLD.status != 'taken' AND NEW.status = 'taken') THEN

        -- Fetch current medication inventory
        SELECT id, name, patient_id, current_quantity, initial_quantity, refill_threshold, units
        INTO med_rec
        FROM public.medications
        WHERE id = NEW.medication_id
        FOR UPDATE;

        IF FOUND THEN
            -- Calculate new quantity (cannot drop below 0)
            new_qty := GREATEST(0, COALESCE(med_rec.current_quantity, 0) - 1);

            -- Update medication inventory consistently
            UPDATE public.medications
            SET
                current_quantity = new_qty,
                pills_remaining = new_qty,
                updated_at = timezone('utc'::text, now())
            WHERE id = NEW.medication_id;

            -- Check if inventory has fallen to or below refill threshold
            IF new_qty <= med_rec.refill_threshold THEN
                -- Insert low-stock notification for patient
                INSERT INTO public.notifications (
                    patient_id,
                    title,
                    message,
                    type,
                    is_read,
                    created_at
                ) VALUES (
                    med_rec.patient_id,
                    'Low Stock Alert: ' || med_rec.name,
                    med_rec.name || ' is running low (' || new_qty || ' ' || med_rec.units || ' remaining). Refill threshold is ' || med_rec.refill_threshold || '.',
                    CASE WHEN new_qty = 0 THEN 'danger' ELSE 'warning' END,
                    false,
                    timezone('utc'::text, now())
                );

                -- Also notify all active caregivers in the patient's Care Circle
                FOR caregiver_rec IN
                    SELECT user_id FROM public.care_circle_members
                    WHERE patient_id = med_rec.patient_id AND status = 'active'
                LOOP
                    INSERT INTO public.notifications (
                        patient_id,
                        title,
                        message,
                        type,
                        is_read,
                        created_at
                    ) VALUES (
                        caregiver_rec.user_id,
                        'Caregiver Notice: ' || med_rec.name || ' Low Stock',
                        'Patient prescription for ' || med_rec.name || ' has reached ' || new_qty || ' ' || med_rec.units || '. Please coordinate refill.',
                        CASE WHEN new_qty = 0 THEN 'danger' ELSE 'warning' END,
                        false,
                        timezone('utc'::text, now())
                    );
                END LOOP;
            END IF;
        END IF;

    -- Scenario B: Dose reverted from 'taken' to 'pending' or 'missed' (Reset / Undo)
    ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'taken' AND NEW.status != 'taken') THEN
        SELECT id, current_quantity, initial_quantity
        INTO med_rec
        FROM public.medications
        WHERE id = NEW.medication_id
        FOR UPDATE;

        IF FOUND THEN
            new_qty := LEAST(COALESCE(med_rec.initial_quantity, 100), COALESCE(med_rec.current_quantity, 0) + 1);

            UPDATE public.medications
            SET
                current_quantity = new_qty,
                pills_remaining = new_qty,
                updated_at = timezone('utc'::text, now())
            WHERE id = NEW.medication_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. ATTACH TRIGGER TO DOSE_LOGS
DROP TRIGGER IF EXISTS trg_dose_inventory_deduction ON public.dose_logs;
CREATE TRIGGER trg_dose_inventory_deduction
AFTER INSERT OR UPDATE OF status ON public.dose_logs
FOR EACH ROW
EXECUTE FUNCTION public.handle_dose_inventory_deduction();

-- 6. INDEXES FOR INVENTORY SURVEILLANCE
CREATE INDEX IF NOT EXISTS idx_medications_current_qty ON public.medications(patient_id, current_quantity);
CREATE INDEX IF NOT EXISTS idx_medications_expiry_date ON public.medications(patient_id, expiry_date);
CREATE INDEX IF NOT EXISTS idx_refill_logs_med_date ON public.refill_logs(medication_id, refilled_at DESC);

-- 7. REALTIME PUBLICATION
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'refill_logs') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.refill_logs;
    END IF;
END $$;
