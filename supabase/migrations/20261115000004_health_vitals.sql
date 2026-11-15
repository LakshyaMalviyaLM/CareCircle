-- PostgreSQL Migration: Health Vitals Table with Patient RLS & Realtime
-- Migration: 20261115000004_health_vitals.sql

-- 1. CREATE HEALTH_VITALS TABLE
CREATE TABLE IF NOT EXISTS public.health_vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    systolic_bp INT,
    diastolic_bp INT,
    bp_unit TEXT NOT NULL DEFAULT 'mmHg',
    heart_rate INT,
    heart_rate_unit TEXT NOT NULL DEFAULT 'bpm',
    blood_sugar NUMERIC(5, 1),
    blood_sugar_unit TEXT NOT NULL DEFAULT 'mg/dL',
    blood_sugar_context TEXT NOT NULL DEFAULT 'fasting' CHECK (blood_sugar_context IN ('fasting', 'post_prandial', 'random', 'bedtime')),
    weight NUMERIC(5, 2),
    weight_unit TEXT NOT NULL DEFAULT 'kg',
    temperature NUMERIC(4, 1),
    temperature_unit TEXT NOT NULL DEFAULT '°F',
    measurement_method TEXT NOT NULL DEFAULT 'manual_entry',
    notes TEXT,
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. CREATE INDEXES FOR FAST TIME-SERIES AND PATIENT FILTERING
CREATE INDEX IF NOT EXISTS idx_health_vitals_patient_recorded ON public.health_vitals(patient_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_vitals_recorded_by ON public.health_vitals(recorded_by);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.health_vitals ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES FOR HEALTH_VITALS

-- Policy: Patients can view their own vitals; authorized caregivers (viewers/editors/admins) can view
CREATE POLICY "Authorized members can view health vitals"
ON public.health_vitals FOR SELECT
TO authenticated
USING (
    patient_id = auth.uid() OR
    public.has_patient_access(patient_id, 'viewer')
);

-- Policy: Patients can insert their own vitals; authorized caregivers with editor/admin role can insert
CREATE POLICY "Authorized members can insert health vitals"
ON public.health_vitals FOR INSERT
TO authenticated
WITH CHECK (
    patient_id = auth.uid() OR
    public.has_patient_access(patient_id, 'editor')
);

-- Policy: Patients can update their own vitals; authorized caregivers with editor/admin role can update
CREATE POLICY "Authorized members can update health vitals"
ON public.health_vitals FOR UPDATE
TO authenticated
USING (
    patient_id = auth.uid() OR
    public.has_patient_access(patient_id, 'editor')
);

-- Policy: Patients can delete their own vitals; authorized caregivers with admin role can delete
CREATE POLICY "Authorized members can delete health vitals"
ON public.health_vitals FOR DELETE
TO authenticated
USING (
    patient_id = auth.uid() OR
    public.has_patient_access(patient_id, 'admin')
);

-- 5. REALTIME REPLICATION
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'health_vitals'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.health_vitals;
    END IF;
END $$;

-- 6. MIGRATE DATA FROM VITALS_LOGS IF IT EXISTS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vitals_logs') THEN
        INSERT INTO public.health_vitals (
            id,
            patient_id,
            recorded_at,
            systolic_bp,
            diastolic_bp,
            heart_rate,
            blood_sugar,
            blood_sugar_context,
            weight,
            weight_unit,
            temperature,
            temperature_unit,
            notes,
            recorded_by
        )
        SELECT 
            vl.id,
            vl.patient_id,
            vl.recorded_at,
            vl.systolic_bp,
            vl.diastolic_bp,
            vl.heart_rate,
            vl.blood_sugar,
            COALESCE(vl.blood_sugar_context, 'fasting'),
            vl.weight_kg,
            'kg',
            98.4,
            '°F',
            vl.notes,
            vl.recorded_by
        FROM public.vitals_logs vl
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;
