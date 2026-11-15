import { useState } from 'react';
import { useCare } from '../context/CareContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import PatientProfileCard from '../components/dashboard/PatientProfileCard';
import MedicationScheduleCard from '../components/dashboard/MedicationScheduleCard';
import MedicineStockInventoryCard from '../components/dashboard/MedicineStockInventoryCard';
import AdherenceChartCard from '../components/dashboard/AdherenceChartCard';
import AppointmentsListCard from '../components/dashboard/AppointmentsListCard';
import ActivityTimelineCard from '../components/dashboard/ActivityTimelineCard';
import RecentNotificationsCard from '../components/dashboard/RecentNotificationsCard';
import EmergencyQuickCard from '../components/dashboard/EmergencyQuickCard';
import CurrentVitalsCard from '../components/dashboard/CurrentVitalsCard';
import DashboardNavHub from '../components/dashboard/DashboardNavHub';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import AddMedicationModal from '../components/medications/AddMedicationModal';
import AddAppointmentModal from '../components/appointments/AddAppointmentModal';
import RecordRefillModal from '../components/medications/RecordRefillModal';
import VoiceAssistantModal from '../components/accessibility/VoiceAssistantModal';
import { calculateStockMetrics } from '../services/refillService';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Plus,
  Calendar,
  ShieldAlert,
  Mic,
  Siren,
  ShoppingBag,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  const {
    activePatient,
    medications,
    setIsSosModalOpen,
    isSosActive,
    clearEmergencySos,
    emergencyEventDetails,
    dataLoading
  } = useCare();
  const { user, profile } = useAuth();

  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [isAddAptOpen, setIsAddAptOpen] = useState(false);
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
  const [refillTargetMed, setRefillTargetMed] = useState(null);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);

  // Dynamic user name and role calculation
  const greetingName =
    profile?.full_name?.split(' ')[0] ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    'Caregiver';

  // Real-time dose statistics derived from medications
  const takenCount = medications.filter((m) => m.status === 'taken').length;
  const pendingCount = medications.filter((m) => m.status === 'pending').length;
  const missedCount = medications.filter((m) => m.status === 'missed').length;
  const totalCount = medications.length;

  // Real adherence calculation
  const denominator = takenCount + missedCount;
  const adherenceRate =
    denominator > 0
      ? Math.round((takenCount / denominator) * 100)
      : totalCount > 0
      ? 100
      : 0;

  // Next pending medication calculation
  const nextPendingMed = medications.find((m) => m.status === 'pending') || null;
  const firstMissedMed = medications.find((m) => m.status === 'missed') || null;

  // Real inventory surveillance metrics
  const inventoryAlerts = medications
    .map((m) => ({ med: m, metrics: calculateStockMetrics(m) }))
    .filter(
      (x) => x.metrics.isOutOfStock || x.metrics.isLowStock || x.metrics.isExpiringSoon
    );

  const outOfStockMeds = inventoryAlerts.filter((x) => x.metrics.isOutOfStock);
  const lowStockMeds = inventoryAlerts.filter((x) => x.metrics.isLowStock);
  const expiringSoonMeds = inventoryAlerts.filter((x) => x.metrics.isExpiringSoon);

  if (dataLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Active Emergency SOS Alert Banner */}
      {isSosActive && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#DC5555] text-white border border-rose-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Siren className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white text-[#DC5555] px-2 py-0.5 rounded">
                  CRITICAL ALERT
                </span>
                <span className="text-xs text-rose-100 font-medium">
                  Incident Recorded{' '}
                  {emergencyEventDetails?.timestamp
                    ? `at ${emergencyEventDetails.timestamp}`
                    : 'Just now'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-1">
                Emergency SOS Beacon Broadcasting for {activePatient.name}
              </h3>
              <p className="text-xs text-rose-100 mt-0.5">
                Care circle responders alerted with home address ({activePatient.homeAddress || 'Registered Residence'})
                and lockbox code ({activePatient.lockboxCode || 'Secured'}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            <Link to="/emergency">
              <button className="px-4 py-2 rounded-xl bg-white text-[#DC5555] hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer shadow-xs">
                View Emergency Hub
              </button>
            </Link>
            <button
              onClick={clearEmergencySos}
              className="px-4 py-2 rounded-xl bg-black/40 hover:bg-black/60 text-white text-xs font-bold border border-white/30 transition-colors cursor-pointer"
            >
              Mark Safe / Deactivate
            </button>
          </div>
        </div>
      )}

      {/* Patient Greeting and Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider uppercase text-[#13A89E] bg-[#EAF3FC] px-2.5 py-1 rounded-md border border-blue-200/60">
              Morning Care Briefing
            </span>
            <span className="text-xs text-[#718096]">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight mt-1.5">
            Good morning, {greetingName}.
          </h1>
          <p className="text-sm text-[#718096] mt-1">
            Here is <span className="font-semibold text-[#172B4D]">{activePatient.name}’s</span>{' '}
            active health plan, medication schedule, inventory levels, and vitals overview.
          </p>
        </div>

        {/* Action Quick Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="accent"
            size="md"
            icon={Mic}
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="text-xs font-bold shadow-xs"
          >
            Voice Assistant
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={ShoppingBag}
            onClick={() => {
              setRefillTargetMed(medications[0] || null);
              setIsRefillModalOpen(true);
            }}
            className="text-xs font-semibold text-amber-900 border-amber-300 bg-amber-50 hover:bg-amber-100"
          >
            Record Refill
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={Plus}
            onClick={() => setIsAddMedOpen(true)}
            className="text-xs font-semibold"
          >
            Add Prescription
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={Calendar}
            onClick={() => setIsAddAptOpen(true)}
            className="text-xs font-semibold"
          >
            Book Visit
          </Button>
          <Button
            variant="danger"
            size="md"
            icon={ShieldAlert}
            onClick={() => setIsSosModalOpen(true)}
            className="text-xs font-bold shadow-xs"
          >
            SOS Beacon
          </Button>
        </div>
      </div>

      {/* Voice Assistant Senior Accessible Hero Card */}
      <div className="p-5 rounded-2xl bg-[#142B4A] text-white shadow-xs border border-[#1E3E6B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#13A89E] hover:bg-[#0F8C83] text-white flex items-center justify-center shrink-0 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-white/10"
            title="Tap to speak with CareCircle Voice Assistant"
            aria-label="Activate Voice Assistant Microphone"
          >
            <Mic className="w-6 h-6 text-white animate-pulse" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#13A89E] text-white px-2 py-0.5 rounded">
                VOICE ASSISTANT
              </span>
              <span className="text-xs text-teal-200 font-medium">• English & हिन्दी</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
              Hands-Free Senior Voice Commands
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Speak: <span className="text-teal-200 font-medium">“Show today's medicines”</span>, <span className="text-teal-200 font-medium">“Read my schedule”</span>, or <span className="text-teal-200 font-medium">“Show health vitals”</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="px-4 py-2 rounded-xl bg-white text-[#142B4A] hover:bg-slate-100 text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            Open Voice Assistant
          </button>
        </div>
      </div>

      {/* Low-Stock & Inventory Notification Alert Banner */}
      {inventoryAlerts.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-[#E9A23B]" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                  INVENTORY ALERT
                </span>
                <span className="text-xs font-bold text-amber-950">
                  {inventoryAlerts.length} Prescription{inventoryAlerts.length > 1 ? 's' : ''} Require Refill Attention
                </span>
              </div>

              {/* Medicine Chips */}
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                {outOfStockMeds.map(({ med }) => (
                  <span
                    key={med.id}
                    className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-rose-100 text-[#DC5555] border border-rose-300"
                  >
                    {med.name}: 0 remaining (Out of Stock)
                  </span>
                ))}
                {lowStockMeds.map(({ med, metrics }) => (
                  <span
                    key={med.id}
                    className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300"
                  >
                    {med.name}: {metrics.currentQuantity} {metrics.units} left (~{metrics.daysRemaining} days)
                  </span>
                ))}
                {expiringSoonMeds.map(({ med, metrics }) => (
                  <span
                    key={med.id}
                    className="text-xs font-medium px-2.5 py-0.5 rounded-lg bg-orange-100 text-orange-900 border border-orange-300"
                  >
                    {med.name}: Expiring in {metrics.daysUntilExpiry}d
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setRefillTargetMed(inventoryAlerts[0]?.med || null);
                setIsRefillModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#E9A23B] hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Restock Now</span>
            </button>

            <Link
              to="/medications?tab=refills"
              className="px-3 py-2 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <span>Manage Refills</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Patient Profile Summary Card */}
      <PatientProfileCard />

      {/* Real Dynamic Stat KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doses Taken */}
        <StatCard
          title="Doses Taken Today"
          value={takenCount}
          subvalue={`of ${totalCount} prescribed`}
          icon={CheckCircle2}
          iconColor="text-[#16A37B]"
          iconBg="bg-emerald-50"
          trend={totalCount > 0 && takenCount === totalCount ? '100% completed' : `${takenCount} of ${totalCount} taken`}
          trendType={takenCount > 0 ? 'up' : 'neutral'}
          badgeText={takenCount > 0 ? 'Routine on schedule' : 'Awaiting first dose'}
        />

        {/* Pending Doses */}
        <StatCard
          title="Pending Doses"
          value={pendingCount}
          subvalue={pendingCount > 0 ? `${pendingCount} dose${pendingCount > 1 ? 's' : ''} due today` : 'All doses completed'}
          icon={Clock}
          iconColor="text-[#142B4A]"
          iconBg="bg-[#EAF3FC]"
          trendType={pendingCount > 0 ? 'neutral' : 'up'}
          badgeText={
            nextPendingMed
              ? `Next: ${nextPendingMed.name} (${nextPendingMed.timeSlot || nextPendingMed.scheduledTime || 'Scheduled'})`
              : 'Daily schedule clear'
          }
        />

        {/* Missed / Skipped Doses */}
        <StatCard
          title="Missed / Skipped"
          value={missedCount}
          subvalue={missedCount > 0 ? `${missedCount} dose${missedCount > 1 ? 's' : ''} skipped` : 'Zero missed doses'}
          icon={AlertCircle}
          iconColor={missedCount > 0 ? 'text-[#DC5555]' : 'text-[#718096]'}
          iconBg={missedCount > 0 ? 'bg-rose-50' : 'bg-slate-100'}
          trend={missedCount > 0 ? `${missedCount} dose flagged` : 'Clean record'}
          trendType={missedCount > 0 ? 'down' : 'up'}
          badgeText={firstMissedMed ? `Skipped: ${firstMissedMed.name}` : 'Perfect adherence'}
        />

        {/* Adherence Rate */}
        <StatCard
          title="Adherence Rate"
          value={`${adherenceRate}%`}
          subvalue={totalCount > 0 ? `${adherenceRate}% today's adherence` : 'No doses scheduled'}
          icon={TrendingUp}
          iconColor={adherenceRate >= 80 ? 'text-[#13A89E]' : 'text-[#E9A23B]'}
          iconBg={adherenceRate >= 80 ? 'bg-[#E6F7F6]' : 'bg-amber-50'}
          trend={adherenceRate >= 90 ? 'High adherence' : adherenceRate >= 70 ? 'Moderate adherence' : 'Action needed'}
          trendType={adherenceRate >= 80 ? 'up' : 'down'}
          badgeText={
            adherenceRate >= 90
              ? 'Optimal (≥90%)'
              : adherenceRate >= 70
              ? 'Moderate'
              : 'Action Required'
          }
        />
      </div>

      {/* Real-Time Health Vitals Biometrics Card */}
      <CurrentVitalsCard />

      {/* Interactive Navigation to All Modules */}
      <DashboardNavHub />

      {/* Main Grid: 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Medication Schedule, Remaining Stock & Adherence (Spans 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Medication Schedule */}
          <MedicationScheduleCard onAddClick={() => setIsAddMedOpen(true)} />

          {/* Remaining Medicine Stock & Inventory Summary Card */}
          <MedicineStockInventoryCard onAddMedication={() => setIsAddMedOpen(true)} />

          {/* 7-Day Adherence Chart */}
          <AdherenceChartCard />
        </div>

        {/* Right Column: Emergency, Appointments, Notifications, Care Circle Activity */}
        <div className="space-y-6">
          {/* Emergency SOS Quick Card */}
          <EmergencyQuickCard />

          {/* Upcoming Appointments Card */}
          <AppointmentsListCard onAddClick={() => setIsAddAptOpen(true)} />

          {/* Smart Notifications & Care Alerts */}
          <RecentNotificationsCard />

          {/* Family Care Circle Activity Timeline */}
          <ActivityTimelineCard />
        </div>
      </div>

      {/* Application Modals */}
      <AddMedicationModal isOpen={isAddMedOpen} onClose={() => setIsAddMedOpen(false)} />
      <AddAppointmentModal isOpen={isAddAptOpen} onClose={() => setIsAddAptOpen(false)} />
      <RecordRefillModal
        isOpen={isRefillModalOpen}
        onClose={() => {
          setIsRefillModalOpen(false);
          setRefillTargetMed(null);
        }}
        targetMedication={refillTargetMed}
      />
      <VoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
      />
    </div>
  );
}
