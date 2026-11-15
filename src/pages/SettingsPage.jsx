import { useState } from 'react';
import { useCare } from '../context/CareContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import EmailNotificationHub from '../components/notifications/EmailNotificationHub';
import {
  Settings,
  User,
  Bell,
  Eye,
  Volume2,
  Shield,
  Smartphone,
  Save,
  Check,
  Type,
  Lock,
  Download,
  Mail,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export default function SettingsPage() {
  const { activePatient, isLargeText, setIsLargeText } = useCare();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('email'); // Default to email to spotlight EmailJS
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings states
  const [highContrast, setHighContrast] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [voiceReminders, setVoiceReminders] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsAppDigest, setWhatsAppDigest] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#13A89E] uppercase tracking-wider">
              System Configuration & Delivery
            </span>
            <Badge variant="primary" size="sm">
              Caregiver Portal
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight mt-1">
            Settings & Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage EmailJS automated alerts, elderly accessibility controls, and patient parameters.
          </p>
        </div>

        {activeTab === 'general' && (
          <Button
            variant="accent"
            size="md"
            icon={Save}
            onClick={handleSave}
            className="font-bold self-start sm:self-center"
          >
            {saveSuccess ? 'Changes Saved! ✓' : 'Save Preferences'}
          </Button>
        )}
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs">
        <button
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'email'
              ? 'bg-[#142B4A] text-white shadow-xs'
              : 'text-slate-600 hover:text-[#142B4A] hover:bg-slate-100'
          }`}
        >
          <Mail className="w-4 h-4 text-[#13A89E]" />
          <span>Email Notifications (EmailJS)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#13A89E]/20 text-[#13A89E] font-bold">
            Live
          </span>
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'general'
              ? 'bg-[#142B4A] text-white shadow-xs'
              : 'text-slate-600 hover:text-[#142B4A] hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>General & Accessibility</span>
        </button>
      </div>

      {/* Tab 1: Email Notification Hub */}
      {activeTab === 'email' && (
        <div className="animate-in fade-in duration-200">
          <EmailNotificationHub />
        </div>
      )}

      {/* Tab 2: General & Accessibility Settings */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Left Column (Spans 2 cols): Settings Forms */}
          <div className="lg:col-span-2 space-y-6">
          {/* Elderly Accessibility Section */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#13A89E] flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#142B4A]">Elderly Accessibility & Visual Comfort</h3>
                <p className="text-xs text-slate-500">Optimized for senior legibility, large tap targets, and audible guidance</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Large Text Booster */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-start gap-3">
                  <Type className="w-5 h-5 text-[#13A89E] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[#142B4A]">Large Typography Mode (A+)</h4>
                    <p className="text-xs text-slate-500">Increases default text size across all dashboards and schedules for senior clarity.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLargeText}
                    onChange={(e) => setIsLargeText(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#13A89E]"></div>
                </label>
              </div>

              {/* Spoken Medication Reminders */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-start gap-3">
                  <Volume2 className="w-5 h-5 text-[#13A89E] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[#142B4A]">Voice Guidance & Chimes</h4>
                    <p className="text-xs text-slate-500">Plays an audible voice announcement when a dose is due (e.g. "Time for your morning blood pressure pill").</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={voiceReminders}
                    onChange={(e) => setVoiceReminders(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#13A89E]"></div>
                </label>
              </div>

              {/* High Contrast Mode */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#13A89E] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[#142B4A]">High Contrast Card Borders</h4>
                    <p className="text-xs text-slate-500">Sharpen borders and badge outlines for enhanced depth and visual separation.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#13A89E]"></div>
                </label>
              </div>
            </div>
          </Card>

          {/* Notifications Channels */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#142B4A] flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#142B4A]">Caregiver Alert Channels</h3>
                <p className="text-xs text-slate-500">Automated dispatch triggers to keep family informed</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">SMS Missed Dose Alerts</h4>
                  <p className="text-xs text-slate-500">Sends text message to Sarah if a dose remains unconfirmed 45 minutes past due.</p>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="w-4 h-4 text-[#13A89E] rounded focus:ring-[#13A89E]"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">WhatsApp Daily Family Recap</h4>
                  <p className="text-xs text-slate-500">Broadcasts an 8:00 PM summary of adherence and vitals to the Vance Family Group.</p>
                </div>
                <input
                  type="checkbox"
                  checked={whatsAppDigest}
                  onChange={(e) => setWhatsAppDigest(e.target.checked)}
                  className="w-4 h-4 text-[#13A89E] rounded focus:ring-[#13A89E]"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Urgent SOS Phone Push</h4>
                  <p className="text-xs text-slate-500">Bypasses Do-Not-Disturb on caregiver smartphones during an emergency trigger.</p>
                </div>
                <input
                  type="checkbox"
                  checked={pushNotifs}
                  onChange={(e) => setPushNotifs(e.target.checked)}
                  className="w-4 h-4 text-[#13A89E] rounded focus:ring-[#13A89E]"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Managed Patient & Caregiver Profiles */}
        <div className="space-y-6">
          {/* Active Patient Card */}
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-[#142B4A]">Patient Profile Info</h3>
            <div className="flex items-center gap-4">
              <img
                src={activePatient.avatar}
                alt={activePatient.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200"
              />
              <div>
                <h4 className="text-base font-bold text-[#142B4A]">{activePatient.name}</h4>
                <p className="text-xs text-slate-500">Born {activePatient.dateOfBirth} ({activePatient.age} yrs)</p>
                <Badge variant="accent" size="sm" className="mt-1">
                  Blood {activePatient.bloodType}
                </Badge>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Lockbox Code:</span>
                <span className="font-mono font-bold text-slate-800">{activePatient.lockboxCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Primary Doctor:</span>
                <span className="font-semibold text-slate-800">{activePatient.primaryDoctor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Primary Clinic:</span>
                <span className="font-semibold text-slate-800">{activePatient.primaryDoctor.clinic}</span>
              </div>
            </div>
          </Card>

          {/* Primary Caregiver Card */}
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-[#142B4A]">Logged-in User Account</h3>
            <div className="flex items-center gap-3">
              <img
                src={profile?.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'}
                alt={profile?.full_name || 'Caregiver'}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <h4 className="text-sm font-bold text-[#142B4A]">
                  {profile?.full_name || user?.user_metadata?.full_name || 'CareCircle User'}
                </h4>
                <p className="text-xs text-[#13A89E] font-semibold capitalize">
                  {profile?.role ? profile.role.replace('_', ' ') : 'Primary Caregiver'}
                </p>
              </div>
            </div>
            <div className="text-xs space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p><strong>Email:</strong> {user?.email || 'user@example.com'}</p>
              <p><strong>Phone:</strong> {profile?.phone || 'Not provided'}</p>
              <p><strong>Status:</strong> Active & Authenticated via Supabase</p>
            </div>
          </Card>

          {/* Cloud Sync Status */}
          <Card className="p-5 bg-gradient-to-br from-white to-blue-50/50 border border-blue-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#142B4A]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Encrypted Cloud Sync Active</span>
            </div>
            <p className="text-[11px] text-slate-500">
              HIPAA compliant data synchronization active across 3 registered caregiver smartphones.
            </p>
          </Card>
        </div>
      </div>
    )}
    </div>
  );
}
