-- ==============================================================================
-- CareCircle - Sample Demo Seed Data (Optional)
-- Run this AFTER 20261115000000_carecircle_schema.sql has executed
-- ==============================================================================

-- Create demo UUIDs for mock accounts
DO $$
DECLARE
    patient_uuid UUID := 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    caregiver_uuid UUID := 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e';
    doctor_uuid UUID := 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f';
    med1_uuid UUID := gen_random_uuid();
    med2_uuid UUID := gen_random_uuid();
BEGIN
    -- 1. Insert Demo Profiles
    INSERT INTO public.profiles (
        id, full_name, email, date_of_birth, phone, role,
        avatar_url, blood_type, primary_condition, allergies,
        home_address, lockbox_code, preferred_hospital
    ) VALUES 
    (
        patient_uuid,
        'Eleanor Vance',
        'eleanor.vance@demo.carecircle.app',
        '1944-04-12',
        '(555) 342-1092',
        'patient',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
        'O+',
        'Hypertension & Type 2 Diabetes',
        ARRAY['Penicillin', 'Sulfa Drugs'],
        '742 Evergreen Terrace, Springfield, OR',
        '4821',
        'Springfield Memorial Hospital (Level 1 Trauma)'
    ),
    (
        caregiver_uuid,
        'Sarah Jenkins',
        'sarah.jenkins@demo.carecircle.app',
        '1978-08-22',
        '(555) 782-9012',
        'caregiver',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
        'O+',
        NULL,
        ARRAY[]::TEXT[],
        NULL,
        NULL,
        NULL
    ),
    (
        doctor_uuid,
        'Dr. Robert Miller, MD',
        'r.miller@demo.stjudehealth.org',
        '1965-02-14',
        '(555) 342-8901',
        'doctor',
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
        'A+',
        NULL,
        ARRAY[]::TEXT[],
        NULL,
        NULL,
        NULL
    )
    ON CONFLICT (id) DO NOTHING;

    -- 2. Link Care Circle (Sarah has Admin permissions for Eleanor)
    INSERT INTO public.care_circle (
        patient_id, member_id, relationship, permission_role, is_emergency_contact
    ) VALUES 
    (
        patient_uuid, caregiver_uuid, 'Daughter & Primary Caregiver', 'admin', true
    ),
    (
        patient_uuid, doctor_uuid, 'Primary Cardiologist', 'editor', false
    )
    ON CONFLICT (patient_id, member_id) DO NOTHING;

    -- 3. Insert Demo Prescriptions
    INSERT INTO public.medications (
        id, patient_id, name, dosage, frequency, scheduled_times,
        start_date, instructions, route_or_form, purpose, prescribing_doctor,
        pills_remaining, total_pills
    ) VALUES
    (
        med1_uuid,
        patient_uuid,
        'Lisinopril',
        '10 mg',
        'Once daily',
        ARRAY['08:00'],
        CURRENT_DATE - INTERVAL '60 days',
        'Take with a full glass of water with or after breakfast.',
        'Tablet',
        'Blood Pressure Control',
        'Dr. Robert Miller, MD',
        18,
        30
    ),
    (
        med2_uuid,
        patient_uuid,
        'Metformin ER',
        '500 mg',
        'Twice daily',
        ARRAY['08:00', '19:00'],
        CURRENT_DATE - INTERVAL '90 days',
        'Take with food to minimize GI distress.',
        'Tablet',
        'Type 2 Blood Glucose Regulation',
        'Dr. Evelyn Chen, MD',
        24,
        60
    )
    ON CONFLICT (id) DO NOTHING;

    -- 4. Insert Dose Logs
    INSERT INTO public.dose_logs (
        medication_id, patient_id, scheduled_at, status, recorded_by, recorded_at, notes
    ) VALUES
    (
        med1_uuid,
        patient_uuid,
        timezone('utc'::text, now() - INTERVAL '3 hours'),
        'taken',
        caregiver_uuid,
        timezone('utc'::text, now() - INTERVAL '3 hours'),
        'Administered with breakfast.'
    ),
    (
        med2_uuid,
        patient_uuid,
        timezone('utc'::text, now() - INTERVAL '3 hours'),
        'taken',
        caregiver_uuid,
        timezone('utc'::text, now() - INTERVAL '3 hours'),
        'Administered with food.'
    );

    -- 5. Insert Upcoming Appointments
    INSERT INTO public.appointments (
        patient_id, doctor_name, specialty, appointment_date, location,
        notes, transport_needed, status
    ) VALUES
    (
        patient_uuid,
        'Dr. Robert Miller, MD',
        'Cardiovascular Checkup & Echo',
        timezone('utc'::text, now() + INTERVAL '5 days'),
        'St. Jude Health Pavilion, Suite 402',
        'Bring past 3 weeks blood pressure and blood glucose logs.',
        true,
        'Upcoming'
    );

    -- 6. Insert Emergency Contacts
    INSERT INTO public.emergency_contacts (
        patient_id, name, phone, relationship, is_primary
    ) VALUES
    (
        patient_uuid,
        'Sarah Jenkins',
        '(555) 782-9012',
        'Daughter & Primary Caregiver',
        true
    ),
    (
        patient_uuid,
        'Emergency Medical Services (EMS)',
        '911',
        'First Responders',
        false
    );

    -- 7. Insert Notifications
    INSERT INTO public.notifications (
        patient_id, title, message, type, is_read
    ) VALUES
    (
        patient_uuid,
        'Dose Taken: Lisinopril 10mg',
        'Sarah Jenkins logged morning dose on time.',
        'medication',
        false
    ),
    (
        patient_uuid,
        'Upcoming Cardiology Visit',
        'Dr. Robert Miller scheduled for Thursday.',
        'appointment',
        true
    );
END $$;
