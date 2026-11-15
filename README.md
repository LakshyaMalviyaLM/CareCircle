# CareCircle — Elderly Healthcare & Medication Management Platform

CareCircle is a comprehensive, production-grade elderly healthcare management platform designed to empower seniors and family caregivers with medication safety, health vitals monitoring, voice accessibility, and rapid emergency coordination.

---

## 🌟 Key Features

1. **Personal Health Profile**
   - Detailed clinical profile including blood group, allergies, existing conditions, medical history, home address, and emergency notes.
   - Paramedic lockbox code access for designated family members and emergency responders.

2. **Medicine Refill & Inventory Management**
   - Live inventory tracking with real-time stock deduction on recorded doses.
   - Low-stock alerts, expiry surveillance, and refill logs.
   - Stock status indicators: *In Stock*, *Low Stock*, *Out of Stock*, *Expiring Soon*.

3. **Health Vitals Tracking**
   - Manual tracking for Blood Pressure (systolic/diastolic), Heart Rate, Blood Sugar (fasting/post-prandial/random), Body Temperature, and Weight.
   - Interactive historical trends and analytics powered by Recharts.
   - Health report generation with clinical disclaimer clarity.

4. **Voice Accessibility Assistant**
   - Browser-native Web Speech API (STT) supporting voice navigation and inquiry commands in English and Hindi.
   - SpeechSynthesis (TTS) reading medication schedules aloud.
   - Accessible typography, high-contrast modes, and graceful fallbacks for browsers without speech recognition.

5. **Care Circle Family Collaboration**
   - Granular role-based access control (*Admin*, *Editor*, *Viewer*).
   - Secure invite-code generator (`CC-XXXXXX`) with time-limited redemption.
   - Real-time dose logging synchronization across family caregivers.

6. **Doctor Directory & Consultations**
   - Dedicated clinical directory for attending physicians and specialists.
   - Contact hotlines, office hours, and consultation request logging.

7. **Smart Notification Center**
   - Missed dose notifications, low-stock warnings, and appointment reminders.
   - Optional automated email alerts via EmailJS.

8. **Emergency & Medical SOS Hub**
   - 5-second countdown beacon with immediate family alert broadcast.
   - Direct 911 one-touch dialing shortcut and attended physician contact.
   - Prominent disclaimer clarifying that automated 911 dispatch is not claimed.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS v4
- **Routing:** React Router v7 (`HashRouter` for zero-configuration static hosting)
- **Data Visualization:** Recharts
- **Icons:** Lucide React
- **Backend & Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication:** Supabase GoTrue Auth (Session persistence, JWT, Password recovery)
- **Email Service:** EmailJS (Optional)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- npm, pnpm, or yarn
- A [Supabase](https://supabase.com) account & project

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/CareCircle.git

# Navigate to project directory
cd CareCircle

# Install dependencies
npm install
```

### 3. Environment Setup
Copy the example environment configuration template:
```bash
cp .env.example .env
```

Open `.env` and fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-key

# Optional: EmailJS configuration for automated alerts
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### 4. Database Setup (Supabase)
Apply the SQL migrations located in `supabase/migrations/` sequentially in your Supabase SQL Editor:
1. `20261115000000_carecircle_schema.sql` (Base schema & RLS policies)
2. `20261115000001_carecircle_invitations.sql` (Care Circle invitations & Realtime)
3. `20261115000002_elderly_platform_upgrade.sql` (Health profile, vitals logs, doctors)
4. `20261115000003_medicine_refill_inventory.sql` (Inventory tracking & deduction trigger)
5. `20261115000004_health_vitals.sql` (Time-series vitals & Recharts integration)

### 5. Running Locally
```bash
# Start development server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 🔒 Security & Privacy

- **Row Level Security (RLS):** 100% of database tables enforce granular PostgreSQL RLS policies.
- **Client Key Isolation:** Only public anonymous keys are loaded by the frontend. No `service_role` keys or database credentials are ever bundled or committed.
- **Password Hygiene:** Zero plaintext password handling or storage. Authentication is fully delegated to Supabase Auth.
- **Safety Disclaimers:** Clarified in accordance with healthcare application standards — not a replacement for professional emergency services or clinical diagnosis.

---

## 📄 License
This project is private and proprietary.
