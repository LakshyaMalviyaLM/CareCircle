import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import emailService, { getEmailConfig, saveEmailConfig } from '../../services/emailService';
import { useCare } from '../../context/CareContext';
import { useAuth } from '../../context/AuthContext';
import {
  Mail,
  Send,
  Bell,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Settings,
  Pill,
  Calendar,
  Clock,
  Sparkles,
  Key,
  ShieldAlert,
  Info,
  RefreshCw,
  Trash2
} from 'lucide-react';

export default function EmailNotificationHub() {
  const { activePatient, medications, appointments } = useCare();
  const { user, profile } = useAuth();

  const [config, setConfig] = useState(getEmailConfig());
  const [showConfigInputs, setShowConfigInputs] = useState(false);
  const [customServiceId, setCustomServiceId] = useState(config.serviceId);
  const [customTemplateId, setCustomTemplateId] = useState(config.templateId);
  const [customPublicKey, setCustomPublicKey] = useState(config.publicKey);
  const [configSaved, setConfigSaved] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState(emailService.getPreferences());
  const [recipientEmail, setRecipientEmail] = useState(
    preferences.recipientEmail || user?.email || 'caregiver@example.com'
  );
  const [prefSaveSuccess, setPrefSaveSuccess] = useState(false);

  // Sending status
  const [sendingType, setSendingType] = useState(null); // 'test' | 'upcoming_med' | 'missed_med' | 'appointment' | null
  const [lastResult, setLastResult] = useState(null); // { success: boolean, message: string }

  // History audit log
  const [history, setHistory] = useState(emailService.getHistory());

  // Form selections for demos
  const [selectedMedId, setSelectedMedId] = useState(medications[0]?.id || '');
  const [selectedAptId, setSelectedAptId] = useState(appointments[0]?.id || '');

  useEffect(() => {
    setConfig(getEmailConfig());
    setHistory(emailService.getHistory());
  }, []);

  useEffect(() => {
    if (!selectedMedId && medications.length > 0) {
      setSelectedMedId(medications[0].id);
    }
  }, [medications, selectedMedId]);

  useEffect(() => {
    if (!selectedAptId && appointments.length > 0) {
      setSelectedAptId(appointments[0].id);
    }
  }, [appointments, selectedAptId]);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    saveEmailConfig({
      serviceId: customServiceId,
      templateId: customTemplateId,
      publicKey: customPublicKey
    });
    setConfig(getEmailConfig());
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    const updated = {
      ...preferences,
      recipientEmail: recipientEmail.trim()
    };
    emailService.savePreferences(updated);
    setPreferences(updated);
    setPrefSaveSuccess(true);
    setTimeout(() => setPrefSaveSuccess(false), 2000);
  };

  const updateHistoryState = () => {
    setHistory(emailService.getHistory());
  };

  // 1. Send Test Email
  const handleSendTest = async () => {
    setSendingType('test');
    setLastResult(null);

    const result = await emailService.sendTestEmail({
      toEmail: recipientEmail,
      toName: profile?.full_name || 'Caregiver'
    });

    setSendingType(null);
    updateHistoryState();

    if (result.success) {
      setLastResult({
        success: true,
        message: `✓ Test email confirmed and delivered to ${recipientEmail} via EmailJS.`
      });
    } else {
      setLastResult({
        success: false,
        message: `✗ Transmission failed: ${result.error}`
      });
    }
  };

  // 2. Send Upcoming Medication Reminder
  const handleSendUpcomingMed = async () => {
    const med = medications.find((m) => m.id === selectedMedId) || medications[0];
    if (!med) return;

    setSendingType('upcoming_med');
    setLastResult(null);

    const result = await emailService.sendUpcomingMedicationReminder({
      toEmail: recipientEmail,
      toName: profile?.full_name || 'Caregiver',
      patientName: activePatient.name,
      medicationName: med.name,
      dosage: med.dosage,
      scheduledTime: med.timeScheduled || '08:00 AM',
      timeSlot: med.timeSlot || 'Morning',
      instructions: med.instructions
    });

    setSendingType(null);
    updateHistoryState();

    if (result.success) {
      setLastResult({
        success: true,
        message: `✓ Upcoming dose reminder for ${med.name} confirmed and delivered to ${recipientEmail}.`
      });
    } else {
      setLastResult({
        success: false,
        message: `✗ Transmission failed: ${result.error}`
      });
    }
  };

  // 3. Send Missed Medication Alert
  const handleSendMissedMed = async () => {
    const med = medications.find((m) => m.id === selectedMedId) || medications[0];
    if (!med) return;

    setSendingType('missed_med');
    setLastResult(null);

    const result = await emailService.sendMissedMedicationAlert({
      toEmail: recipientEmail,
      toName: profile?.full_name || 'Caregiver',
      patientName: activePatient.name,
      medicationName: med.name,
      dosage: med.dosage,
      scheduledTime: med.timeScheduled || '08:00 AM',
      instructions: med.instructions
    });

    setSendingType(null);
    updateHistoryState();

    if (result.success) {
      setLastResult({
        success: true,
        message: `✓ High-priority missed dose alert for ${med.name} confirmed and delivered to ${recipientEmail}.`
      });
    } else {
      setLastResult({
        success: false,
        message: `✗ Transmission failed: ${result.error}`
      });
    }
  };

  // 4. Send Doctor Appointment Reminder
  const handleSendAppointmentReminder = async () => {
    const apt = appointments.find((a) => a.id === selectedAptId) || appointments[0];
    if (!apt) return;

    setSendingType('appointment');
    setLastResult(null);

    const result = await emailService.sendUpcomingAppointmentReminder({
      toEmail: recipientEmail,
      toName: profile?.full_name || 'Caregiver',
      patientName: activePatient.name,
      doctorName: apt.doctor || apt.doctor_name || 'Clinician',
      specialty: apt.specialty,
      date: apt.displayDate || apt.date,
      time: apt.time || '10:00 AM',
      facility: apt.facility || apt.location,
      notes: apt.notes
    });

    setSendingType(null);
    updateHistoryState();

    if (result.success) {
      setLastResult({
        success: true,
        message: `✓ Appointment reminder for ${apt.doctor || 'Doctor Visit'} confirmed and delivered to ${recipientEmail}.`
      });
    } else {
      setLastResult({
        success: false,
        message: `✗ Transmission failed: ${result.error}`
      });
    }
  };

  const handleClearHistory = () => {
    emailService.clearHistory();
    setHistory([]);
  };

  return (
    <div className="space-y-6">
      {/* Top Integration Status Banner */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#13A89E] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#142B4A]">EmailJS Notification Engine</h3>
                <Badge variant={config.isConfigured ? 'success' : 'warning'} size="sm">
                  {config.isConfigured ? 'Configured & Active' : 'Credentials Needed'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated clinical dispatch for medication reminders, missed dose alerts, and doctor visits
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowConfigInputs(!showConfigInputs)}
            className="text-xs font-bold text-[#13A89E] hover:underline flex items-center gap-1 self-start sm:self-center cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            {showConfigInputs ? 'Hide Credentials' : 'Configure EmailJS Keys'}
          </button>
        </div>

        {/* Collapsible Credentials Form */}
        {showConfigInputs && (
          <form onSubmit={handleSaveConfig} className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#142B4A] uppercase tracking-wider">
                EmailJS Credentials (Environment or Override)
              </span>
              <span className="text-[11px] text-slate-500">Public credentials only (never private keys)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service ID (VITE_EMAILJS_SERVICE_ID)</label>
                <input
                  type="text"
                  placeholder="e.g. service_carecircle"
                  value={customServiceId}
                  onChange={(e) => setCustomServiceId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#13A89E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Template ID (VITE_EMAILJS_TEMPLATE_ID)</label>
                <input
                  type="text"
                  placeholder="e.g. template_carecircle"
                  value={customTemplateId}
                  onChange={(e) => setCustomTemplateId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#13A89E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Public Key / User ID (VITE_EMAILJS_PUBLIC_KEY)</label>
                <input
                  type="text"
                  placeholder="e.g. user_abc123xyz"
                  value={customPublicKey}
                  onChange={(e) => setCustomPublicKey(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#13A89E]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <p className="text-[11px] text-slate-500">
                Values are read from <code className="font-bold">.env</code> by default, or saved in local storage for quick testing.
              </p>
              <Button variant="accent" size="sm" type="submit" className="font-bold">
                {configSaved ? 'Saved! ✓' : 'Save EmailJS Keys'}
              </Button>
            </div>
          </form>
        )}

        {/* Live Delivery Result Alert */}
        {lastResult && (
          <div
            className={`mt-4 p-4 rounded-2xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
              lastResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {lastResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 leading-relaxed">
              <strong>{lastResult.success ? 'Delivery Confirmed:' : 'Transmission Error:'}</strong>{' '}
              <span>{lastResult.message}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Grid: Dispatch Actions & Email Notification Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Dispatch Actions (Test Email, Upcoming Med, Missed Dose, Doctor Appointment) */}
        <Card className="p-6 space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#142B4A]">Trigger Email Notifications</h3>
              <p className="text-xs text-slate-500">Verify end-to-end delivery of each notification category</p>
            </div>
            <span className="text-xs font-bold text-[#13A89E] uppercase tracking-wider">Live Triggers</span>
          </div>

          {/* Action 1: Test Email */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Verification
                </span>
                <h4 className="text-sm font-bold text-[#142B4A]">1. System Test Email</h4>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={Send}
                disabled={sendingType === 'test'}
                onClick={handleSendTest}
                className="font-bold text-xs"
              >
                {sendingType === 'test' ? 'Sending...' : 'Send Test Email'}
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Sends an explicit <code className="font-bold">[TEST EMAIL]</code> to verify that EmailJS can reach your inbox.
            </p>
          </div>

          {/* Action 2: Upcoming Medication Reminder */}
          <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/60 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                  Dose Routine
                </span>
                <h4 className="text-sm font-bold text-[#142B4A]">2. Upcoming Medication Reminder</h4>
              </div>
              <Button
                variant="accent"
                size="sm"
                icon={Pill}
                disabled={sendingType === 'upcoming_med'}
                onClick={handleSendUpcomingMed}
                className="font-bold text-xs"
              >
                {sendingType === 'upcoming_med' ? 'Sending...' : 'Send Dose Reminder'}
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <label className="text-slate-600 font-semibold shrink-0">Select Medication:</label>
              <select
                value={selectedMedId}
                onChange={(e) => setSelectedMedId(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 flex-1 truncate"
              >
                {medications.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.dosage} ({m.timeScheduled || '08:00 AM'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action 3: Missed Medication Notification */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  High Priority
                </span>
                <h4 className="text-sm font-bold text-rose-950">3. Missed Dose Critical Alert</h4>
              </div>
              <Button
                variant="danger"
                size="sm"
                icon={AlertTriangle}
                disabled={sendingType === 'missed_med'}
                onClick={handleSendMissedMed}
                className="font-bold text-xs"
              >
                {sendingType === 'missed_med' ? 'Sending...' : 'Send Missed Alert'}
              </Button>
            </div>
            <p className="text-xs text-rose-800">
              Dispatched to family caregivers when a scheduled dose is skipped or past due, notifying them of required action.
            </p>
          </div>

          {/* Action 4: Upcoming Doctor Appointment Reminder */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/60 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Clinical Visit
                </span>
                <h4 className="text-sm font-bold text-[#142B4A]">4. Doctor Visit Reminder</h4>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={Calendar}
                disabled={sendingType === 'appointment'}
                onClick={handleSendAppointmentReminder}
                className="font-bold text-xs"
              >
                {sendingType === 'appointment' ? 'Sending...' : 'Send Visit Reminder'}
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <label className="text-slate-600 font-semibold shrink-0">Select Visit:</label>
              <select
                value={selectedAptId}
                onChange={(e) => setSelectedAptId(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 flex-1 truncate"
              >
                {appointments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.doctor || a.doctor_name} • {a.specialty} ({a.displayDate || a.date})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Right: Email Notification Preferences & Background Scheduling Notice */}
        <div className="space-y-6">
          <Card className="p-6 space-y-5">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#142B4A]">Email Notification Preferences</h3>
                <p className="text-xs text-slate-500">Configure alert rules for caregivers and family</p>
              </div>
              <Badge variant="primary" size="sm">Preferences</Badge>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-4">
              {/* Recipient Email Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Primary Delivery Inbox *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="caregiver@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2 divide-y divide-slate-100">
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Upcoming Dose Reminders</h4>
                    <p className="text-[11px] text-slate-500">Alerts 30 minutes before a scheduled prescription</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.upcomingMeds}
                    onChange={(e) => setPreferences({ ...preferences, upcomingMeds: e.target.checked })}
                    className="w-4 h-4 text-[#13A89E] rounded focus:ring-[#13A89E] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Missed Medication Critical Alerts</h4>
                    <p className="text-[11px] text-slate-500">High-priority warning when a dose is skipped or unrecorded</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.missedDoses}
                    onChange={(e) => setPreferences({ ...preferences, missedDoses: e.target.checked })}
                    className="w-4 h-4 text-[#13A89E] rounded focus:ring-[#13A89E] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Doctor Appointment Reminders</h4>
                    <p className="text-[11px] text-slate-500">Notification 24 hours prior to specialist consultations</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.upcomingAppointments}
                    onChange={(e) => setPreferences({ ...preferences, upcomingAppointments: e.target.checked })}
                    className="w-4 h-4 text-[#13A89E] rounded focus:ring-[#13A89E] cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <Button variant="accent" size="sm" type="submit" className="font-bold">
                  {prefSaveSuccess ? 'Preferences Saved! ✓' : 'Save Notification Preferences'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Background Scheduling Architectural Notice */}
          <Card className="p-5 bg-gradient-to-br from-white to-blue-50/60 border border-blue-200/70 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#142B4A]">
              <Info className="w-4 h-4 text-[#13A89E]" />
              <span>Background Scheduling Architecture</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              CareCircle does not rely on your browser tab being open for automated background reminders. In-app events trigger immediate EmailJS dispatches. For automated offline cron dispatches, CareCircle connects via Supabase Edge Function triggers.
            </p>
          </Card>
        </div>
      </div>

      {/* Feature 6: Notification Status and Failures Audit Log */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#13A89E]" />
              <h3 className="text-base font-bold text-[#142B4A]">Notification Status & Failure Audit Log</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified transmission history confirming real delivery and service error reporting
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-xs font-semibold text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <Mail className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
            <p className="text-sm font-medium mt-2">No email notification events recorded yet.</p>
            <p className="text-xs text-slate-400 mt-0.5">Click "Send Test Email" above to test the integration.</p>
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="text-[11px] font-bold text-slate-400 uppercase bg-slate-50 border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Notification Category</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Sent Timestamp</th>
                  <th className="py-3 px-4">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => {
                  const isDelivered = item.status === 'delivered';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            item.type === 'test'
                              ? 'default'
                              : item.type === 'missed_medication'
                              ? 'danger'
                              : item.type === 'upcoming_medication'
                              ? 'accent'
                              : 'primary'
                          }
                          size="sm"
                        >
                          {item.type === 'test'
                            ? '[TEST EMAIL]'
                            : item.type === 'missed_medication'
                            ? 'Missed Dose Alert'
                            : item.type === 'upcoming_medication'
                            ? 'Dose Reminder'
                            : 'Appointment Reminder'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#142B4A] max-w-xs truncate">
                        {item.subject}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {item.recipientEmail}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })},{' '}
                        {new Date(item.sentAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 px-4">
                        {isDelivered ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Delivered (Confirmed by EmailJS)
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-800 border border-rose-200">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              Delivery Failed
                            </span>
                            {item.error && (
                              <p className="text-[10px] text-rose-600 truncate max-w-xs" title={item.error}>
                                {item.error}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
