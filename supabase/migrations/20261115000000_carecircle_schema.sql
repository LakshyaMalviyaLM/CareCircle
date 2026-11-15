-- ==============================================================================
-- CareCircle - Elderly Care & Medication Management Platform
-- PostgreSQL Database Schema & Security Migration for Supabase
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLES & ROW LEVEL SECURITY ENABLING
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table 1: profiles
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    date_of_birth DATE,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'caregiver' CHECK (role IN ('patient', 'caregiver', 'family_member', 'doctor', 'nurse', 'admin')),
    avatar_url TEXT,
    blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    primary_condition TEXT,
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    home_address TEXT,
    lockbox_code TEXT,
    preferred_hospital TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users for seniors, family caregivers, and clinical providers.';

-- ------------------------------------------------------------------------------
-- Table 2: care_circle
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.care_circle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL,
    permission_role TEXT NOT NULL DEFAULT 'editor' CHECK (permission_role IN ('admin', 'editor', 'viewer')),
    is_emergency_contact BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_patient_member UNIQUE (patient_id, member_id),
    CONSTRAINT prevent_self_care CHECK (patient_id <> member_id)
);
ALTER TABLE public.care_circle ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.care_circle IS 'Defines access control and familial/medical relationships for each elderly patient.';

-- ------------------------------------------------------------------------------
-- Table 3: medications
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    scheduled_times TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    instructions TEXT,
    route_or_form TEXT DEFAULT 'Tablet',
    purpose TEXT,
    prescribing_doctor TEXT,
    pills_remaining INT DEFAULT 30 CHECK (pills_remaining >= 0),
    total_pills INT DEFAULT 30 CHECK (total_pills >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.medications IS 'Prescriptions, supplements, and timing instructions for patients.';

-- ------------------------------------------------------------------------------
-- Table 4: dose_logs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dose_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('taken', 'pending', 'missed', 'skipped')),
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    notes TEXT
);
ALTER TABLE public.dose_logs ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.dose_logs IS 'Real-time record of medication adherence and dose administration logs.';

-- ------------------------------------------------------------------------------
-- Table 5: appointments
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    appointment_date TIMESTAMPTZ NOT NULL,
    location TEXT,
    telehealth_link TEXT,
    notes TEXT,
    transport_needed BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Scheduled', 'Completed', 'Cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.appointments IS 'Medical visits, transport coordination, and clinical review notes.';

-- ------------------------------------------------------------------------------
-- Table 6: emergency_contacts
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    relationship TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.emergency_contacts IS 'Paramedic, physician, and family emergency contacts for rapid dispatch.';

-- ------------------------------------------------------------------------------
-- Table 7: notifications
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('medication', 'vitals', 'appointment', 'emergency', 'refill', 'general')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.notifications IS 'Notification queue for medication alerts, refill warnings, and SOS beacons.';

-- ==============================================================================
-- 3. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

CREATE INDEX IF NOT EXISTS idx_care_circle_patient ON public.care_circle(patient_id);
CREATE INDEX IF NOT EXISTS idx_care_circle_member ON public.care_circle(member_id);
CREATE INDEX IF NOT EXISTS idx_care_circle_lookup ON public.care_circle(patient_id, member_id, permission_role);

CREATE INDEX IF NOT EXISTS idx_medications_patient ON public.medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_medications_active ON public.medications(patient_id, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_dose_logs_patient_scheduled ON public.dose_logs(patient_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_dose_logs_medication ON public.dose_logs(medication_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_status ON public.dose_logs(patient_id, status);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_date ON public.appointments(patient_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(patient_id, status);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_patient ON public.emergency_contacts(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_patient_read ON public.notifications(patient_id, is_read, created_at DESC);

-- ==============================================================================
-- 4. AUTOMATED TRIGGERS & FUNCTIONS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_medications_updated_at
    BEFORE UPDATE ON public.medications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Automatically creates profile when a user registers via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        role,
        avatar_url,
        phone
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'caregiver'),
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'phone'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_auth_user();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) HELPER FUNCTIONS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.has_patient_access(
    target_patient_id UUID,
    required_role TEXT DEFAULT 'viewer'
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT (
        auth.uid() = target_patient_id
        OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.care_circle cc
            WHERE cc.patient_id = target_patient_id
              AND cc.member_id = auth.uid()
              AND (
                  required_role = 'viewer'
                  OR (required_role = 'editor' AND cc.permission_role IN ('admin', 'editor'))
                  OR (required_role = 'admin' AND cc.permission_role = 'admin')
              )
        )
    );
$$;

COMMENT ON FUNCTION public.has_patient_access IS 'Central security function determining whether auth.uid() has viewer/editor/admin access to a patient.';

-- ==============================================================================
-- 6. SECURE RLS POLICIES
-- ==============================================================================

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

DROP POLICY IF EXISTS "care_circle_select" ON public.care_circle;
DROP POLICY IF EXISTS "care_circle_insert" ON public.care_circle;
DROP POLICY IF EXISTS "care_circle_update" ON public.care_circle;
DROP POLICY IF EXISTS "care_circle_delete" ON public.care_circle;

DROP POLICY IF EXISTS "medications_select" ON public.medications;
DROP POLICY IF EXISTS "medications_insert" ON public.medications;
DROP POLICY IF EXISTS "medications_update" ON public.medications;
DROP POLICY IF EXISTS "medications_delete" ON public.medications;

DROP POLICY IF EXISTS "dose_logs_select" ON public.dose_logs;
DROP POLICY IF EXISTS "dose_logs_insert" ON public.dose_logs;
DROP POLICY IF EXISTS "dose_logs_update" ON public.dose_logs;
DROP POLICY IF EXISTS "dose_logs_delete" ON public.dose_logs;

DROP POLICY IF EXISTS "appointments_select" ON public.appointments;
DROP POLICY IF EXISTS "appointments_insert" ON public.appointments;
DROP POLICY IF EXISTS "appointments_update" ON public.appointments;
DROP POLICY IF EXISTS "appointments_delete" ON public.appointments;

DROP POLICY IF EXISTS "emergency_contacts_select" ON public.emergency_contacts;
DROP POLICY IF EXISTS "emergency_contacts_insert" ON public.emergency_contacts;
DROP POLICY IF EXISTS "emergency_contacts_update" ON public.emergency_contacts;
DROP POLICY IF EXISTS "emergency_contacts_delete" ON public.emergency_contacts;

DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete" ON public.notifications;

-- ------------------------------------------------------------------------------
-- profiles policies
-- ------------------------------------------------------------------------------
CREATE POLICY "profiles_select_policy"
    ON public.profiles
    FOR SELECT
    USING (
        auth.uid() = id
        OR public.has_patient_access(id, 'viewer')
        OR EXISTS (
            SELECT 1 FROM public.care_circle cc
            WHERE (cc.patient_id = id AND cc.member_id = auth.uid())
               OR (cc.member_id = id AND cc.patient_id = auth.uid())
               OR (cc.member_id = id AND cc.patient_id IN (
                   SELECT patient_id FROM public.care_circle WHERE member_id = auth.uid()
               ))
        )
    );

CREATE POLICY "profiles_update_own"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- care_circle policies
-- ------------------------------------------------------------------------------
CREATE POLICY "care_circle_select"
    ON public.care_circle
    FOR SELECT
    USING (
        auth.uid() = patient_id
        OR auth.uid() = member_id
        OR public.has_patient_access(patient_id, 'viewer')
    );

CREATE POLICY "care_circle_insert"
    ON public.care_circle
    FOR INSERT
    WITH CHECK (
        public.has_patient_access(patient_id, 'admin')
    );

CREATE POLICY "care_circle_update"
    ON public.care_circle
    FOR UPDATE
    USING (
        public.has_patient_access(patient_id, 'admin')
    )
    WITH CHECK (
        public.has_patient_access(patient_id, 'admin')
    );

CREATE POLICY "care_circle_delete"
    ON public.care_circle
    FOR DELETE
    USING (
        public.has_patient_access(patient_id, 'admin')
        OR auth.uid() = member_id
    );

-- ------------------------------------------------------------------------------
-- medications policies
-- ------------------------------------------------------------------------------
CREATE POLICY "medications_select"
    ON public.medications
    FOR SELECT
    USING (
        public.has_patient_access(patient_id, 'viewer')
    );

CREATE POLICY "medications_insert"
    ON public.medications
    FOR INSERT
    WITH CHECK (
        public.has_patient_access(patient_id, 'editor')
    );

CREATE POLICY "medications_update"
    ON public.medications
    FOR UPDATE
    USING (
        public.has_patient_access(patient_id, 'editor')
    )
    WITH CHECK (
        public.has_patient_access(patient_id, 'editor')
    );

CREATE POLICY "medications_delete"
    ON public.medications
    FOR DELETE
    USING (
        public.has_patient_access(patient_id, 'admin')
    );

-- ------------------------------------------------------------------------------
-- dose_logs policies
-- ------------------------------------------------------------------------------
CREATE POLICY "dose_logs_select"
    ON public.dose_logs
    FOR SELECT
    USING (
        public.has_patient_access(patient_id, 'viewer')
    );

CREATE POLICY "dose_logs_insert"
    ON public.dose_logs
    FOR INSERT
    WITH CHECK (
        public.has_patient_access(patient_id, 'editor')
    );

CREATE POLICY "dose_logs_update"
    ON public.dose_logs
    FOR UPDATE
    USING (
        public.has_patient_access(patient_id, 'editor')
    )
    WITH CHECK (
        public.has_patient_access(patient_id, 'editor')
    );

CREATE POLICY "dose_logs_delete"
    ON public.dose_logs
    FOR DELETE
    USING (
        public.has_patient_access(patient_id, 'admin')
    );

-- ------------------------------------------------------------------------------
-- appointments policies
-- ------------------------------------------------------------------------------
CREATE POLICY "appointments_select"
    ON public.appointments
    FOR SELECT
    USING (
        public.has_patient_access(patient_id, 'viewer')
    );

CREATE POLICY "appointments_insert"
    ON public.appointments
    FOR INSERT
    WITH CHECK (
        public.has_patient_access(patient_id, 'editor')
    );

CREATE POLICY "appointments_update"
    ON public.appointments
    FOR UPDATE
    USING (
        public.has_patient_access(patient_id, 'editor')
    )
    WITH CHECK (
        public.has_patient_access(patient_id, 'editor')
    );

CREATE POLICY "appointments_delete"
    ON public.appointments
    FOR DELETE
    USING (
        public.has_patient_access(patient_id, 'admin')
    );

-- ------------------------------------------------------------------------------
-- emergency_contacts policies
-- ------------------------------------------------------------------------------
CREATE POLICY "emergency_contacts_select"
    ON public.emergency_contacts
    FOR SELECT
    USING (
        public.has_patient_access(patient_id, 'viewer')
    );

CREATE POLICY "emergency_contacts_insert"
    ON public.emergency_contacts
    FOR INSERT
    WITH CHECK (
        public.has_patient_access(patient_id, 'editor')
    );

CREATE POLICY "emergency_contacts_update"
    ON public.emergency_contacts
    FOR UPDATE
    USING (
        public.has_patient_access(patient_id, 'editor')
    )
    WITH CHECK (
        public.has_patient_access(patient_id, 'editor')
    );

CREATE POLICY "emergency_contacts_delete"
    ON public.emergency_contacts
    FOR DELETE
    USING (
        public.has_patient_access(patient_id, 'admin')
    );

-- ------------------------------------------------------------------------------
-- notifications policies
-- ------------------------------------------------------------------------------
CREATE POLICY "notifications_select"
    ON public.notifications
    FOR SELECT
    USING (
        public.has_patient_access(patient_id, 'viewer')
    );

CREATE POLICY "notifications_insert"
    ON public.notifications
    FOR INSERT
    WITH CHECK (
        public.has_patient_access(patient_id, 'editor')
    );

CREATE POLICY "notifications_update"
    ON public.notifications
    FOR UPDATE
    USING (
        public.has_patient_access(patient_id, 'viewer')
    )
    WITH CHECK (
        public.has_patient_access(patient_id, 'viewer')
    );

CREATE POLICY "notifications_delete"
    ON public.notifications
    FOR DELETE
    USING (
        public.has_patient_access(patient_id, 'admin')
    );
