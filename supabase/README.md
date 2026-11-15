# CareCircle Supabase Database Setup & Security Guide

This guide walks you through setting up the relational PostgreSQL database for CareCircle on [Supabase](https://supabase.com).

---

## 1. Migration File Location
The schema migration is located at:
- [supabase/migrations/20261115000000_carecircle_schema.sql](file:///d:/Projects/CareCircle/supabase/migrations/20261115000000_carecircle_schema.sql)

Optional test seed data is available at:
- [supabase/seed.sql](file:///d:/Projects/CareCircle/supabase/seed.sql)

---

## 2. Tables Created

| Table | Purpose | Primary Key | Foreign Keys |
| :--- | :--- | :--- | :--- |
| **`profiles`** | Senior and caregiver profile data extending `auth.users` | `id (UUID)` | `auth.users(id)` |
| **`care_circle`** | Role-based caregiver mapping and access delegation | `id (UUID)` | `patient_id -> profiles(id)`<br>`member_id -> profiles(id)` |
| **`medications`** | Daily prescription and supplement inventory | `id (UUID)` | `patient_id -> profiles(id)` |
| **`dose_logs`** | Dose administration tracking (*taken, pending, missed*) | `id (UUID)` | `medication_id -> medications(id)`<br>`patient_id -> profiles(id)`<br>`recorded_by -> profiles(id)` |
| **`appointments`** | Clinic visits, specialists, and rides | `id (UUID)` | `patient_id -> profiles(id)` |
| **`emergency_contacts`** | EMS, hospital, and family emergency contacts | `id (UUID)` | `patient_id -> profiles(id)` |
| **`notifications`** | Alert queue for dose reminders and SOS beacons | `id (UUID)` | `patient_id -> profiles(id)` |

---

## 3. How to Execute in Supabase SQL Editor

1. Open your project on the [Supabase Dashboard](https://supabase.com/dashboard).
2. Click on the **SQL Editor** tab (terminal icon `>_` on the left navigation bar).
3. Click **New Query** (or `+`).
4. Copy the entire contents of [`supabase/migrations/20261115000000_carecircle_schema.sql`](file:///d:/Projects/CareCircle/supabase/migrations/20261115000000_carecircle_schema.sql).
5. Paste it into the SQL Editor window.
6. Click the green **Run** button (or press `Ctrl + Enter` / `Cmd + Enter`).
7. You will see `Success. No rows returned`. All 7 tables, indexes, triggers, and RLS policies are now active!
8. *(Optional)* To populate sample test data, open another query tab, paste [`supabase/seed.sql`](file:///d:/Projects/CareCircle/supabase/seed.sql), and click **Run**.

---

## 4. Row Level Security (RLS) & Access Rules

All 7 tables have **Row Level Security (RLS) enabled** by default.

A secure `SECURITY DEFINER` function `has_patient_access(target_patient_id, required_role)` controls access:

1. **Patients**:
   - Have full access to view, edit, and log their own medical records, prescriptions, and dose logs.
2. **Caregivers in Care Circle**:
   - **`admin`**: Full management rights (invite members, modify prescriptions, cancel appointments, delete logs).
   - **`editor`**: Can log doses, schedule visits, update adherence logs, and record daily vitals.
   - **`viewer`**: Read-only access to view schedules and health charts.
3. **Unauthorized Users**:
   - Strictly blocked from reading or writing patient rows.
4. **Automated Auth Trigger**:
   - When a user signs up via Supabase Auth (`supabase.auth.signUp()`), the `on_auth_user_created` trigger automatically provisions their profile in `public.profiles`.

---

## 5. Security Notice: Service-Role Key Handling

> [!CAUTION]
> **NEVER** expose the Supabase `service_role` key in frontend code (`.env`, `vite.config.js`, or any client React bundle).

- In frontend files, **ONLY** use:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY` (public, protected by Row Level Security)
- The `anon` key respects all RLS policies and validates the user's JWT from `supabase.auth.getUser()`.
- The `service_role` key bypasses all Row Level Security and is intended solely for server-side environments, edge functions, or backend migrations.
