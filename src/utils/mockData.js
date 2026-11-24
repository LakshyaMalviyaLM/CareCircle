// Mock data for CareCircle Elderly Care & Medication Management Platform

export const initialPatients = [
  {
    id: 'pat-1',
    name: 'Eleanor Vance',
    preferredName: 'Ellie',
    age: 82,
    gender: 'Female',
    dateOfBirth: '1944-04-12',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    bloodType: 'O+',
    primaryCondition: 'Hypertension & Type 2 Diabetes',
    allergies: ['Penicillin', 'Sulfa Drugs'],
    primaryDoctor: {
      name: 'Dr. Robert Miller, MD',
      specialty: 'Cardiologist',
      clinic: 'St. Jude Health Pavilion',
      phone: '(555) 342-8901'
    },
    emergencyContact: {
      name: 'Sarah Jenkins',
      relationship: 'Daughter & Primary Caregiver',
      phone: '(555) 782-9012'
    },
    homeAddress: '742 Evergreen Terrace, Springfield, OR',
    lockboxCode: '4821',
    preferredHospital: 'Springfield Memorial Hospital (Level 1 Trauma)',
    vitals: {
      bloodPressure: '122/78 mmHg',
      heartRate: '72 bpm',
      bloodGlucose: '108 mg/dL',
      temperature: '98.4 °F',
      spO2: '98%',
      weight: '64 kg',
      lastUpdated: 'Today, 8:15 AM'
    }
  },
  {
    id: 'pat-2',
    name: 'Arthur Vance',
    preferredName: 'Artie',
    age: 85,
    gender: 'Male',
    dateOfBirth: '1941-09-28',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
    bloodType: 'A-',
    primaryCondition: 'Mild Cognitive Impairment & Osteoarthritis',
    allergies: ['Aspirin', 'Iodine Contrast'],
    primaryDoctor: {
      name: 'Dr. Evelyn Chen, MD',
      specialty: 'Geriatrician',
      clinic: 'Mercy Eldercare Center',
      phone: '(555) 234-9811'
    },
    emergencyContact: {
      name: 'Sarah Jenkins',
      relationship: 'Daughter & Primary Caregiver',
      phone: '(555) 782-9012'
    },
    homeAddress: '742 Evergreen Terrace, Springfield, OR',
    lockboxCode: '4821',
    preferredHospital: 'Springfield Memorial Hospital (Level 1 Trauma)',
    vitals: {
      bloodPressure: '130/84 mmHg',
      heartRate: '68 bpm',
      bloodGlucose: '96 mg/dL',
      temperature: '98.6 °F',
      spO2: '97%',
      weight: '76 kg',
      lastUpdated: 'Yesterday, 6:00 PM'
    }
  }
];

export const initialMedications = [
  {
    id: 'med-1',
    patientId: 'pat-1',
    name: 'Lisinopril',
    brandName: 'Prinivil',
    dosage: '10 mg',
    form: 'Tablet',
    units: 'tablets',
    pillColor: 'bg-amber-100 text-amber-800 border-amber-300',
    frequency: 'Once daily',
    timeSlot: 'Morning',
    timeScheduled: '08:00 AM',
    purpose: 'Blood Pressure Control',
    instructions: 'Take with a full glass of water, with or after breakfast.',
    doctor: 'Dr. Robert Miller',
    status: 'taken', // 'taken', 'pending', 'missed'
    takenAt: '08:15 AM',
    initialQuantity: 30,
    currentQuantity: 18,
    pillsRemaining: 18,
    totalPills: 30,
    refillThreshold: 5,
    expiryDate: '2027-05-15',
    lastRefillDate: '2026-10-18T10:30:00Z',
    needsRefill: false
  },
  {
    id: 'med-2',
    patientId: 'pat-1',
    name: 'Metformin ER',
    brandName: 'Glucophage XR',
    dosage: '500 mg',
    form: 'Tablet',
    units: 'tablets',
    pillColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    frequency: 'Twice daily',
    timeSlot: 'Morning',
    timeScheduled: '08:00 AM',
    purpose: 'Type 2 Blood Glucose Regulation',
    instructions: 'Take with food to minimize stomach discomfort.',
    doctor: 'Dr. Evelyn Chen',
    status: 'taken',
    takenAt: '08:15 AM',
    initialQuantity: 60,
    currentQuantity: 24,
    pillsRemaining: 24,
    totalPills: 60,
    refillThreshold: 10,
    expiryDate: '2026-11-28', // Expiring soon (< 15 days)
    lastRefillDate: '2026-10-10T09:15:00Z',
    needsRefill: false
  },
  {
    id: 'med-3',
    patientId: 'pat-1',
    name: 'CoQ10 + Vitamin D3',
    brandName: 'CardioSupport',
    dosage: '2000 IU',
    form: 'Softgel Capsule',
    units: 'capsules',
    pillColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    frequency: 'Daily with meal',
    timeSlot: 'Afternoon',
    timeScheduled: '01:00 PM',
    purpose: 'Cardiovascular & Bone Health',
    instructions: 'Take after lunch.',
    doctor: 'Dr. Evelyn Chen',
    status: 'pending',
    takenAt: null,
    initialQuantity: 30,
    currentQuantity: 12,
    pillsRemaining: 12,
    totalPills: 30,
    refillThreshold: 5,
    expiryDate: '2027-03-20',
    lastRefillDate: '2026-10-01T14:20:00Z',
    needsRefill: false
  },
  {
    id: 'med-4',
    patientId: 'pat-1',
    name: 'Atorvastatin',
    brandName: 'Lipitor',
    dosage: '20 mg',
    form: 'Tablet',
    units: 'tablets',
    pillColor: 'bg-sky-100 text-sky-800 border-sky-300',
    frequency: 'Once daily at bedtime',
    timeSlot: 'Evening',
    timeScheduled: '06:30 PM',
    purpose: 'Cholesterol & Plaque Reduction',
    instructions: 'Avoid grapefruit juice while taking this medication.',
    doctor: 'Dr. Robert Miller',
    status: 'pending',
    takenAt: null,
    initialQuantity: 30,
    currentQuantity: 4, // Low stock (<= 5)
    pillsRemaining: 4,
    totalPills: 30,
    refillThreshold: 5,
    expiryDate: '2027-04-10',
    lastRefillDate: '2026-09-28T11:00:00Z',
    needsRefill: true
  },
  {
    id: 'med-5',
    patientId: 'pat-1',
    name: 'Melatonin',
    brandName: 'SleepWell Gentle',
    dosage: '3 mg',
    form: 'Chewable',
    units: 'chewables',
    pillColor: 'bg-purple-100 text-purple-800 border-purple-300',
    frequency: 'Nightly',
    timeSlot: 'Bedtime',
    timeScheduled: '09:30 PM',
    purpose: 'Sleep Support & Circadian Rhythm',
    instructions: 'Take 30 minutes before lights out.',
    doctor: 'Dr. Evelyn Chen',
    status: 'pending',
    takenAt: null,
    initialQuantity: 30,
    currentQuantity: 21,
    pillsRemaining: 21,
    totalPills: 30,
    refillThreshold: 5,
    expiryDate: '2027-09-15',
    lastRefillDate: '2026-10-22T16:45:00Z',
    needsRefill: false
  },
  {
    id: 'med-6',
    patientId: 'pat-1',
    name: 'Amlodipine',
    brandName: 'Norvasc',
    dosage: '5 mg',
    form: 'Tablet',
    units: 'tablets',
    pillColor: 'bg-rose-100 text-rose-800 border-rose-300',
    frequency: 'Once daily',
    timeSlot: 'Morning',
    timeScheduled: '08:00 AM',
    purpose: 'Calcium Channel Blocker / BP',
    instructions: 'Monitor for any ankle swelling.',
    doctor: 'Dr. Robert Miller',
    status: 'missed',
    takenAt: null,
    initialQuantity: 30,
    currentQuantity: 9,
    pillsRemaining: 9,
    totalPills: 30,
    refillThreshold: 5,
    expiryDate: '2027-01-30',
    lastRefillDate: '2026-10-05T08:30:00Z',
    needsRefill: false
  },
  {
    id: 'med-7',
    patientId: 'pat-1',
    name: 'Omeprazole DR',
    brandName: 'Prilosec',
    dosage: '20 mg',
    form: 'Capsule',
    units: 'capsules',
    pillColor: 'bg-red-100 text-red-800 border-red-300',
    frequency: 'Once daily before breakfast',
    timeSlot: 'Morning',
    timeScheduled: '07:30 AM',
    purpose: 'Acid Reflux & Gastric Protection',
    instructions: 'Swallow whole with water 30 minutes prior to eating.',
    doctor: 'Dr. Evelyn Chen',
    status: 'pending',
    takenAt: null,
    initialQuantity: 30,
    currentQuantity: 0, // Out of stock!
    pillsRemaining: 0,
    totalPills: 30,
    refillThreshold: 5,
    expiryDate: '2027-08-10',
    lastRefillDate: '2026-09-15T10:00:00Z',
    needsRefill: true
  }
];

export const initialAppointments = [
  {
    id: 'apt-1',
    patientId: 'pat-1',
    doctor: 'Dr. Robert Miller, MD',
    specialty: 'Cardiovascular Checkup & Echo',
    facility: 'St. Jude Health Pavilion, Suite 402',
    date: '2026-11-20',
    displayDate: 'Thursday, Nov 20',
    time: '10:30 AM',
    type: 'In-Clinic',
    telehealthLink: null,
    status: 'Upcoming',
    notes: 'Bring current blood pressure log and last 3 weeks glucose logs.',
    transportNeeded: true,
    caregiverAssigned: 'Sarah Jenkins'
  },
  {
    id: 'apt-2',
    patientId: 'pat-1',
    doctor: 'Dr. Evelyn Chen, MD',
    specialty: 'Comprehensive Geriatric Review',
    facility: 'Mercy Eldercare Center',
    date: '2026-11-28',
    displayDate: 'Friday, Nov 28',
    time: '02:00 PM',
    type: 'Telehealth',
    telehealthLink: 'https://carecircle.telehealth.live/visit/78921',
    status: 'Upcoming',
    notes: 'Review medication tolerance, sleep patterns, and physical therapy mobility score.',
    transportNeeded: false,
    caregiverAssigned: 'Sarah Jenkins'
  },
  {
    id: 'apt-3',
    patientId: 'pat-1',
    doctor: 'Dr. Samuel Marcus, OD',
    specialty: 'Annual Diabetic Retinopathy Exam',
    facility: 'Valley Eye Associates, 2nd Floor',
    date: '2026-12-05',
    displayDate: 'Friday, Dec 5',
    time: '11:15 AM',
    type: 'In-Clinic',
    telehealthLink: null,
    status: 'Scheduled',
    notes: 'Pupil dilation expected; designated driver required for return trip.',
    transportNeeded: true,
    caregiverAssigned: 'David Vance'
  },
  {
    id: 'apt-4',
    patientId: 'pat-1',
    doctor: 'Dr. Robert Miller, MD',
    specialty: 'Post-Adjustment Vitals & EKG',
    facility: 'St. Jude Health Pavilion',
    date: '2026-10-18',
    displayDate: 'Oct 18, 2026',
    time: '09:00 AM',
    type: 'In-Clinic',
    telehealthLink: null,
    status: 'Completed',
    notes: 'EKG was normal. Decreased Lisinopril from 20mg to 10mg.',
    transportNeeded: false,
    caregiverAssigned: 'Sarah Jenkins'
  }
];

export const initialCareCircle = [
  {
    id: 'care-1',
    name: 'Sarah Jenkins',
    role: 'Primary Caregiver & Daughter',
    category: 'Family',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    phone: '(555) 782-9012',
    email: 'sarah.jenkins@carecircle.app',
    relationship: 'Daughter',
    permissions: 'Full Admin Access',
    activeStatus: 'Online now',
    location: '1.2 miles away',
    isEmergencyContact: true
  },
  {
    id: 'care-2',
    name: 'David Vance',
    role: 'Secondary Caregiver & Son',
    category: 'Family',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    phone: '(555) 492-3810',
    email: 'david.vance@workmail.com',
    relationship: 'Son',
    permissions: 'Can Edit Schedules',
    activeStatus: 'Active 2h ago',
    location: 'Seattle, WA',
    isEmergencyContact: true
  },
  {
    id: 'care-3',
    name: 'Nurse Lisa Morales, RN',
    role: 'Visiting Home Health Nurse',
    category: 'Healthcare',
    avatar: 'https://images.unsplash.com/photo-1594824813589-9430c5e7b51f?auto=format&fit=crop&q=80&w=200',
    phone: '(555) 612-4091',
    email: 'l.morales@springfieldvna.org',
    relationship: 'Visiting Nurse (Tue & Thu)',
    permissions: 'Log Vitals & Clinical Notes',
    activeStatus: 'Scheduled today 2 PM',
    location: 'On duty',
    isEmergencyContact: false
  },
  {
    id: 'care-4',
    name: 'Dr. Robert Miller, MD',
    role: 'Primary Cardiologist',
    category: 'Physician',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
    phone: '(555) 342-8901',
    email: 'r.miller@stjudehealth.org',
    relationship: 'Physician of Record',
    permissions: 'View Medical Logs',
    activeStatus: 'Available via portal',
    location: 'St. Jude Health',
    isEmergencyContact: false
  },
  {
    id: 'care-5',
    name: 'Marcus Bell',
    role: 'Physical Mobility Therapist',
    category: 'Support',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    phone: '(555) 890-1204',
    email: 'm.bell@agilityphysio.com',
    relationship: 'Mobility Coach',
    permissions: 'View Care Notes',
    activeStatus: 'Visit tomorrow',
    location: 'Agility Care Clinic',
    isEmergencyContact: false
  }
];

export const initialTimeline = [
  {
    id: 'time-1',
    timestamp: '8:15 AM today',
    author: 'Sarah Jenkins',
    authorRole: 'Daughter',
    action: 'Logged Morning Medications',
    description: 'Administered Lisinopril 10mg and Metformin 500mg with oatmeal & fresh blueberries.',
    iconType: 'medication',
    status: 'success'
  },
  {
    id: 'time-2',
    timestamp: '8:20 AM today',
    author: 'Automated Device (Omron Connect)',
    authorRole: 'Smart Sensor',
    action: 'Vitals Synced',
    description: 'Blood pressure recorded at 122/78 mmHg. Pulse: 72 bpm. Normal parameters.',
    iconType: 'vitals',
    status: 'info'
  },
  {
    id: 'time-3',
    timestamp: 'Yesterday, 5:45 PM',
    author: 'Nurse Lisa Morales, RN',
    authorRole: 'Visiting Nurse',
    action: 'Home Visit Note Added',
    description: 'Eleanor was energetic, completed 20 minutes of gentle hall walking. No ankle edema observed.',
    iconType: 'visit',
    status: 'success'
  },
  {
    id: 'time-4',
    timestamp: 'Yesterday, 2:10 PM',
    author: 'Dr. Robert Miller, MD',
    authorRole: 'Cardiologist',
    action: 'Prescription Refill Requested',
    description: 'Sent 90-day supply refill request for Atorvastatin 20mg to CVS Pharmacy #4092.',
    iconType: 'prescription',
    status: 'warning'
  },
  {
    id: 'time-5',
    timestamp: '2 days ago',
    author: 'David Vance',
    authorRole: 'Son',
    action: 'Transport Scheduled',
    description: 'Confirmed wheelchair-accessible medical transport for Nov 20 cardiology visit.',
    iconType: 'calendar',
    status: 'info'
  }
];

export const weeklyAdherenceData = [
  { day: 'Mon', adherence: 100, taken: 5, missed: 0, pending: 0 },
  { day: 'Tue', adherence: 100, taken: 5, missed: 0, pending: 0 },
  { day: 'Wed', adherence: 80, taken: 4, missed: 1, pending: 0 },
  { day: 'Thu', adherence: 100, taken: 5, missed: 0, pending: 0 },
  { day: 'Fri', adherence: 100, taken: 5, missed: 0, pending: 0 },
  { day: 'Sat', adherence: 80, taken: 4, missed: 1, pending: 0 },
  { day: 'Sun (Today)', adherence: 92, taken: 2, missed: 1, pending: 3 }
];

export const vitalsTrendData = [
  { time: 'Nov 9', systolic: 128, diastolic: 82, glucose: 112, heartRate: 74, temperature: 98.6, weight: 68.6 },
  { time: 'Nov 10', systolic: 124, diastolic: 80, glucose: 105, heartRate: 71, temperature: 98.4, weight: 68.5 },
  { time: 'Nov 11', systolic: 126, diastolic: 81, glucose: 118, heartRate: 75, temperature: 98.5, weight: 68.5 },
  { time: 'Nov 12', systolic: 121, diastolic: 79, glucose: 102, heartRate: 70, temperature: 98.3, weight: 68.4 },
  { time: 'Nov 13', systolic: 125, diastolic: 80, glucose: 110, heartRate: 73, temperature: 98.5, weight: 68.5 },
  { time: 'Nov 14', systolic: 120, diastolic: 78, glucose: 104, heartRate: 69, temperature: 98.4, weight: 68.4 },
  { time: 'Nov 15 (Today)', systolic: 122, diastolic: 78, glucose: 108, heartRate: 72, temperature: 98.4, weight: 68.4 }
];

export const emergencyHotlines = [
  {
    id: 'hot-1',
    title: 'Call Emergency Services',
    number: '112',
    description: "India's Emergency Response Support",
    primary: true
  },
  {
    id: 'hot-2',
    title: 'Springfield Memorial ER Hotline',
    number: '(555) 911-0400',
    description: 'Direct dispatch line to hospital receiving unit; reference Patient ID: EV-88902.',
    primary: false
  },
  {
    id: 'hot-3',
    title: 'Poison Control Center',
    number: '1-800-222-1222',
    description: '24/7 expert assistance on accidental overdoses, toxic ingestion or pill mixups.',
    primary: false
  },
  {
    id: 'hot-4',
    title: '24/7 Elder Helpline & Crisis Link',
    number: '1-800-677-1116',
    description: 'State eldercare rapid support & emergency crisis coordination.',
    primary: false
  }
];
