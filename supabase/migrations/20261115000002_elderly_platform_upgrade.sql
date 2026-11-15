-- ==============================================================================
-- CareCircle - Comprehensive Elderly Healthcare Platform Upgrade
-- PostgreSQL Migration: Vitals, Refill Logs, Doctor Directory, Health Profiles
-- ==============================================================================

-- 1. EXTEND PROFILES TABLE WITH PERSONAL HEALTH PROFILE FIELDS
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS medical_history TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS existing_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS advance_directives TEXT,
ADD COLUMN IF NOT EXISTS emergency_notes TEXT,
ADD COLUMN IF NOT EXISTS weight_kg NUMERIC,
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';

-- 2. CREATE VITALS_LOGS TABLE
CREATE TABLE IF NOT EXISTS public.vitals_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    systolic_bp INT,
    diastolic_bp INT,
    heart_rate INT,
    blood_sugar NUMERIC,
    blood_sugar_context TEXT DEFAULT 'fasting' CHECK (blood_sugar_context IN ('fasting', 'post_prandial', 'random', 'bedtime')),
    weight_kg NUMERIC,
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT
);

ALTER TABLE public.vitals_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_vitals_patient_recorded ON public.vitals_logs(patient_id, recorded_at DESC);

-- RLS FOR VITALS_LOGS
CREATE POLICY "Authorized members can view vitals"
ON public.vitals_logs FOR SELECT
TO authenticated
USING (
    patient_id = auth.uid() OR
    public.has_patient_access(patient_id, 'viewer')
);

CREATE POLICY "Authorized members can insert vitals"
ON public.vitals_logs FOR INSERT
TO authenticated
WITH CHECK (
    patient_id = auth.uid() OR
    public.has_patient_access(patient_id, 'editor')
);

CREATE POLICY "Authorized members can update vitals"
ON public.vitals_logs FOR UPDATE
TO authenticated
USING (
    patient_id = auth.uid() OR
    public.has_patient_access(patient_id, 'editor')
);

CREATE POLICY "Authorized admins can delete vitals"
ON public.vitals_logs FOR DELETE
TO authenticated
USING (
    patient_id = auth.uid() OR
    public.has_patient_access(patient_id, 'admin')
);

-- 3. CREATE REFILL_LOGS TABLE
CREATE TABLE IF NOT EXISTS public.refill_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quantity_added INT NOT NULL CHECK (quantity_added > 0),
    pharmacy_name TEXT,
    rx_number TEXT,
    refilled_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    refilled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    cost NUMERIC,
    notes TEXT
);

ALTER TABLE public.refill_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_refill_medication ON public.refill_logs(medication_id);
CREATE INDEX IF NOT EXISTS idx_refill_patient ON public.refill_logs(patient_id, refilled_at DESC);

-- RLS FOR REFILL_LOGS
CREATE POLICY "Authorized members can view refills"
ON public.refill_logs FOR SELECT
TO authenticated
USING (
    patient_id = auth.uid() OR
    public.has_patient_access(patient_id, 'viewer')
);

CREATE POLICY "Authorized members can record refills"
ON public.refill_logs FOR INSERT
TO authenticated
WITH CHECK (
    patient_id = auth.uid() OR
    public.has_patient_access(patient_id, 'editor')
);

-- 4. CREATE DOCTORS DIRECTORY TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    clinic_name TEXT,
    phone TEXT,
    emergency_phone TEXT,
    email TEXT,
    address TEXT,
    office_hours TEXT,
    telehealth_available BOOLEAN NOT NULL DEFAULT false,
    rating NUMERIC DEFAULT 5.0,
    avatar_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_doctors_patient ON public.doctors(patient_id);

-- RLS FOR DOCTORS
CREATE POLICY "Authorized members can view doctors"
ON public.doctors FOR SELECT
TO authenticated
USING (
    patient_id = auth.uid() OR
    public.has_patient_access(patient_id, 'viewer')
);

CREATE POLICY "Authorized members can add doctors"
ON public.doctors FOR INSERT
TO authenticated
WITH CHECK (
    patient_id = auth.uid() OR
    public.has_patient_access(patient_id, 'editor')
);

CREATE POLICY "Authorized members can update doctors"
ON public.doctors FOR UPDATE
TO authenticated
USING (
    patient_id = auth.uid() OR
    public.has_patient_access(patient_id, 'editor')
);

CREATE POLICY "Authorized admins can delete doctors"
ON public.doctors FOR DELETE
TO authenticated
USING (
    patient_id = auth.uid() OR
    public.has_patient_access(patient_id, 'admin')
);

-- 5. REALTIME REPLICATION CONFIGURATION
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'vitals_logs') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.vitals_logs;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'refill_logs') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.refill_logs;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'doctors') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.doctors;
    END IF;
END $$;
