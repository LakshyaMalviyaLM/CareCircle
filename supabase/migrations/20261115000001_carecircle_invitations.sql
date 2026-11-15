-- ==============================================================================
-- CareCircle Migration: Invitations & Activity Timeline Sync
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.care_circle_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    invited_name TEXT,
    relationship TEXT NOT NULL,
    permission_role TEXT NOT NULL DEFAULT 'editor' CHECK (permission_role IN ('admin', 'editor', 'viewer')),
    invite_code TEXT NOT NULL UNIQUE,
    is_emergency_contact BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.care_circle_invitations ENABLE ROW LEVEL SECURITY;

-- Invitations RLS Policies
DROP POLICY IF EXISTS "care_circle_invitations_select" ON public.care_circle_invitations;
CREATE POLICY "care_circle_invitations_select"
    ON public.care_circle_invitations
    FOR SELECT
    USING (
        auth.uid() = patient_id
        OR auth.uid() = created_by
        OR public.has_patient_access(patient_id, 'viewer')
        OR auth.jwt() ->> 'email' = invited_email
    );

DROP POLICY IF EXISTS "care_circle_invitations_insert" ON public.care_circle_invitations;
CREATE POLICY "care_circle_invitations_insert"
    ON public.care_circle_invitations
    FOR INSERT
    WITH CHECK (
        public.has_patient_access(patient_id, 'admin')
    );

DROP POLICY IF EXISTS "care_circle_invitations_update" ON public.care_circle_invitations;
CREATE POLICY "care_circle_invitations_update"
    ON public.care_circle_invitations
    FOR UPDATE
    USING (
        public.has_patient_access(patient_id, 'admin')
        OR auth.jwt() ->> 'email' = invited_email
    );

-- Enable Realtime publication for care_circle and dose_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.care_circle;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dose_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
