import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCare } from '../context/CareContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import AddMedicationModal from '../components/medications/AddMedicationModal';
import EditMedicationModal from '../components/medications/EditMedicationModal';
import MedicationDetailsModal from '../components/medications/MedicationDetailsModal';
import RecordRefillModal from '../components/medications/RecordRefillModal';
import MedicineInventoryCard from '../components/medications/MedicineInventoryCard';
import ConfirmModal from '../components/common/ConfirmModal';
import { calculateStockMetrics } from '../services/refillService';
import voiceService from '../services/voiceService';
import {
  Pill,
  Plus,
  Search,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  RotateCcw,
  Trash2,
  Edit,
  Eye,
  XCircle,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  LayoutGrid,
  CalendarClock,
  ShoppingBag,
  Volume2,
  PackageCheck,
  History,
  Store,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function MedicationsPage() {
  const {
    activePatient,
    medications,
    toggleMedicationStatus,
    deleteMedication,
    refillLogs,
    preferredLanguage,
    setPreferredLanguage
  } = useCare();

  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const activeTab = urlTab === 'refills' || urlTab === 'schedule' ? urlTab : 'inventory';

  const handleTabChange = (newTab) => {
    setSearchParams(newTab === 'inventory' ? {} : { tab: newTab });
  };
  const [filter, setFilter] = useState('all');
  const [inventoryFilter, setInventoryFilter] = useState('all'); // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'expiring_soon'
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' | 'grid'
  const [speakingMedId, setSpeakingMedId] = useState(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRefillOpen, setIsRefillOpen] = useState(false);
  const [refillTargetMed, setRefillTargetMed] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [medToDelete, setMedToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Voice Instruction Reader
  const handleSpeakInstruction = (med) => {
    setSpeakingMedId(med.id);
    voiceService.readMedicationInstructions(med, preferredLanguage);
    setTimeout(() => {
      setSpeakingMedId(null);
    }, 4500);
  };

  // Stock Metrics for all medications
  const evaluatedMeds = medications.map((m) => ({
    med: m,
    metrics: calculateStockMetrics(m)
  }));

  const inStockMeds = evaluatedMeds.filter((x) => x.metrics.isInStock);
  const lowStockMeds = evaluatedMeds.filter((x) => x.metrics.isLowStock);
  const outOfStockMeds = evaluatedMeds.filter((x) => x.metrics.isOutOfStock);
  const expiringSoonMeds = evaluatedMeds.filter((x) => x.metrics.isExpiringSoon);

  // Inventory tab filtered list
  const filteredInventoryMeds = evaluatedMeds
    .filter(({ med, metrics }) => {
      if (inventoryFilter === 'in_stock') return metrics.isInStock;
      if (inventoryFilter === 'low_stock') return metrics.isLowStock;
      if (inventoryFilter === 'out_of_stock') return metrics.isOutOfStock;
      if (inventoryFilter === 'expiring_soon') return metrics.isExpiringSoon;
      return true;
    })
    .filter(({ med }) => {
      const q = search.toLowerCase();
      return (
        med.name.toLowerCase().includes(q) ||
        (med.purpose && med.purpose.toLowerCase().includes(q)) ||
        (med.doctor && med.doctor.toLowerCase().includes(q))
      );
    });

  // Daily Schedule tab filtered list
  const filteredScheduleMeds = medications.filter((m) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'pending'
        ? m.status === 'pending'
        : filter === 'taken'
        ? m.status === 'taken'
        : filter === 'refill'
        ? m.needsRefill || (m.currentQuantity ?? m.pillsRemaining ?? 30) <= 5
        : true;

    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.purpose && m.purpose.toLowerCase().includes(search.toLowerCase())) ||
      (m.doctor && m.doctor.toLowerCase().includes(search.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  // Time slot helper for schedule view
  const getTimeSlot = (med) => {
    const slot = (med.timeSlot || '').toLowerCase();
    const time = (med.timeScheduled || med.scheduled_times?.[0] || '').toLowerCase();

    if (
      slot.includes('morning') ||
      (time.includes('am') &&
        (time.startsWith('06') ||
          time.startsWith('07') ||
          time.startsWith('08') ||
          time.startsWith('09') ||
          time.startsWith('10') ||
          time.startsWith('11')))
    ) {
      return 'Morning';
    }
    if (
      slot.includes('afternoon') ||
      (time.includes('pm') &&
        (time.startsWith('12') ||
          time.startsWith('01') ||
          time.startsWith('02') ||
          time.startsWith('03') ||
          time.startsWith('04')))
    ) {
      return 'Afternoon';
    }
    if (
      slot.includes('evening') ||
      (time.includes('pm') &&
        (time.startsWith('05') ||
          time.startsWith('06') ||
          time.startsWith('07') ||
          time.startsWith('08')))
    ) {
      return 'Evening';
    }
    return 'Bedtime / Night';
  };

  const timeSlots = [
    {
      name: 'Morning',
      icon: Sunrise,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      range: '06:00 AM – 11:59 AM'
    },
    {
      name: 'Afternoon',
      icon: Sun,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
      range: '12:00 PM – 04:59 PM'
    },
    {
      name: 'Evening',
      icon: Sunset,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      range: '05:00 PM – 08:59 PM'
    },
    {
      name: 'Bedtime / Night',
      icon: Moon,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      range: '09:00 PM onwards'
    }
  ];

  const handleDeleteConfirm = async () => {
    if (!medToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteMedication(medToDelete.id);
      setIsDeleteConfirmOpen(false);
      setMedToDelete(null);
    } catch (err) {
      console.error('Failed to delete medication:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Render Single Medication Card for Dosage Schedule View
  const renderScheduleCard = (med) => {
    const isTaken = med.status === 'taken';
    const isMissed = med.status === 'missed';
    const metrics = calculateStockMetrics(med);
    const isSpeakingThis = speakingMedId === med.id;

    return (
      <Card
        key={med.id}
        className={`p-5 transition-all duration-200 border-l-4 bg-white h-full flex flex-col justify-between hover:border-slate-300 hover:shadow-xs ${
          isTaken
            ? 'border-l-[#16A37B]'
            : isMissed
            ? 'border-l-[#DC5555]'
            : metrics.isOutOfStock
            ? 'border-l-[#DC5555]'
            : metrics.isLowStock
            ? 'border-l-[#E9A23B]'
            : 'border-l-[#13A89E]'
        }`}
      >
        <div className="flex flex-col space-y-3.5">
          {/* Top row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                  isTaken
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                    : isMissed
                    ? 'bg-rose-100 border-rose-300 text-rose-700'
                    : 'bg-[#EAF3FC] border-blue-200 text-[#142B4A]'
                }`}
              >
                <Pill className="w-5 h-5 stroke-[2.2]" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-[#142B4A] text-base leading-tight">
                    {med.name}
                  </h3>
                  <Badge variant="primary" size="sm">
                    {med.dosage}
                  </Badge>
                  {metrics.isOutOfStock ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                      Out of Stock
                    </span>
                  ) : metrics.isLowStock ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-700" />
                      Refill: {metrics.currentQuantity} left
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-slate-700">
                    {med.purpose || 'Prescription'}
                  </span>
                  <span>•</span>
                  <span className="capitalize">{med.units || med.form || 'Tablets'}</span>
                  <span>•</span>
                  <span>{med.frequency}</span>
                </p>
              </div>
            </div>

            {/* Time & Audio */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleSpeakInstruction(med)}
                title={`Listen in ${preferredLanguage === 'hi-IN' ? 'Hindi (हिंदी)' : 'English'}`}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isSpeakingThis
                    ? 'bg-[#13A89E] text-white border-transparent animate-pulse shadow-xs'
                    : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                }`}
              >
                <Volume2 className="w-4 h-4" />
              </button>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-[#13A89E]" />
                  {med.timeScheduled || '08:00 AM'}
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">
                  {getTimeSlot(med)}
                </span>
              </div>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center justify-between gap-2">
            <span className="line-clamp-1 italic">
              <strong>Instructions:</strong> {med.instructions || 'Take as prescribed with water.'}
            </span>
            <span className="text-[11px] text-slate-400 shrink-0">
              Dr: {med.doctor || 'Attending Clinician'}
            </span>
          </div>

          {/* Supply progress */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
              <span>
                Remaining Inventory:{' '}
                <strong
                  className={
                    metrics.isOutOfStock
                      ? 'text-rose-600 font-bold'
                      : metrics.isLowStock
                      ? 'text-amber-700 font-bold'
                      : 'text-slate-700'
                  }
                >
                  {metrics.currentQuantity} {metrics.units}
                </strong>
              </span>
              <span>{metrics.percentage}% stock</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  metrics.isOutOfStock
                    ? 'bg-rose-500'
                    : metrics.isLowStock
                    ? 'bg-amber-500'
                    : 'bg-[#13A89E]'
                }`}
                style={{ width: `${metrics.percentage}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100/80">
            <div className="flex items-center gap-1.5 flex-wrap">
              {isTaken ? (
                <button
                  onClick={() => toggleMedicationStatus(med.id, 'pending')}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                  title="Undo and re-credit inventory"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => toggleMedicationStatus(med.id, 'taken')}
                    className="px-3 py-1.5 rounded-lg bg-[#13A89E] hover:bg-[#0F8C83] text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Taken</span>
                  </button>

                  <button
                    onClick={() => toggleMedicationStatus(med.id, 'missed')}
                    className="px-2.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-medium cursor-pointer transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5 inline mr-1" />
                    <span>Skip Dose</span>
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  setRefillTargetMed(med);
                  setIsRefillOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-amber-900 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Record new pharmacy restock / refill"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
                <span>Refill</span>
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setSelectedMed(med);
                  setIsDetailsOpen(true);
                }}
                className="p-1.5 text-slate-500 hover:text-[#142B4A] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="View Full Details"
              >
                <Eye className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setSelectedMed(med);
                  setIsEditOpen(true);
                }}
                className="p-1.5 text-slate-500 hover:text-[#13A89E] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                title="Edit Medication"
              >
                <Edit className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setMedToDelete(med);
                  setIsDeleteConfirmOpen(true);
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Delete Medication"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#13A89E] uppercase tracking-wider">
              Pharmacy & Stock Surveillance
            </span>
            <span className="text-xs text-[#718096]">• {medications.length} active prescriptions</span>
          </div>
          <h1 className="text-2xl font-bold text-[#142B4A] tracking-tight mt-1">
            Medicine Refill Management
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1 max-w-2xl">
            Inventory quantity tracking, automated dose deductions, stockout alarms, and pharmacy refill logs for {activePatient.name}.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          {/* Senior Voice Guidance Switch */}
          <div className="h-9 flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setPreferredLanguage('en-US')}
              className={`h-7 px-2.5 text-xs font-bold rounded-lg transition-all ${
                preferredLanguage === 'en-US'
                  ? 'bg-white text-[#142B4A] shadow-xs'
                  : 'text-[#718096]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setPreferredLanguage('hi-IN')}
              className={`h-7 px-2.5 text-xs font-bold rounded-lg transition-all ${
                preferredLanguage === 'hi-IN'
                  ? 'bg-[#13A89E] text-white shadow-xs'
                  : 'text-[#718096]'
              }`}
            >
              हिन्दी
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={ShoppingBag}
            onClick={() => {
              setRefillTargetMed(medications[0] || null);
              setIsRefillOpen(true);
            }}
            className="h-9 font-semibold border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100"
          >
            Record Refill
          </Button>

          <Button
            variant="accent"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddOpen(true)}
            className="h-9 font-bold shadow-xs"
          >
            Add Medication
          </Button>
        </div>
      </div>

      {/* Modern Segmented Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 w-fit overflow-x-auto max-w-full">
        <button
          onClick={() => handleTabChange('inventory')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'bg-white text-[#142B4A] shadow-xs'
              : 'text-[#718096] hover:text-[#172B4D] hover:bg-white/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Medicine Inventory Cards</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            lowStockMeds.length + outOfStockMeds.length > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-200/70 text-slate-700'
          }`}>
            {medications.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('schedule')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'bg-white text-[#142B4A] shadow-xs'
              : 'text-[#718096] hover:text-[#172B4D] hover:bg-white/50'
          }`}
        >
          <CalendarClock className="w-3.5 h-3.5" />
          <span>Daily Dosage Schedule</span>
        </button>

        <button
          onClick={() => handleTabChange('refills')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'refills'
              ? 'bg-white text-[#142B4A] shadow-xs'
              : 'text-[#718096] hover:text-[#172B4D] hover:bg-white/50'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Refill History Audit Trail</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/70 text-slate-700">
            {refillLogs.length}
          </span>
        </button>
      </div>

      {/* Critical Stock Alert Banner */}
      {outOfStockMeds.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-rose-950 animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-extrabold text-rose-900">
                CRITICAL: {outOfStockMeds.length} Prescription(s) Completely Out of Stock
              </h4>
              <p className="text-xs text-rose-800 mt-0.5">
                {outOfStockMeds.map((x) => x.med.name).join(', ')} currently have 0 units remaining.
                Immediate pharmacy refill required.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setRefillTargetMed(outOfStockMeds[0].med);
              setIsRefillOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            Refill Now
          </button>
        </div>
      )}

      {/* TAB 1: MEDICINE INVENTORY CARDS & STATUS INDICATORS */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top KPI Surveillance Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* In Stock */}
            <div
              onClick={() => setInventoryFilter('in_stock')}
              className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                inventoryFilter === 'in_stock'
                  ? 'ring-2 ring-[#13A89E] border-transparent shadow-xs'
                  : 'border-slate-200/80 hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">In Stock</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#16A37B] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-[#142B4A] mt-2">
                {inStockMeds.length}
              </div>
              <span className="text-[11px] text-[#718096] mt-0.5 block">Sufficient supply</span>
            </div>

            {/* Low Stock */}
            <div
              onClick={() => setInventoryFilter('low_stock')}
              className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                inventoryFilter === 'low_stock'
                  ? 'ring-2 ring-[#E9A23B] border-transparent shadow-xs'
                  : 'border-slate-200/80 hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Low Stock</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#E9A23B] flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-[#E9A23B] mt-2">
                {lowStockMeds.length}
              </div>
              <span className="text-[11px] text-[#718096] mt-0.5 block">&le; Threshold limit</span>
            </div>

            {/* Out of Stock */}
            <div
              onClick={() => setInventoryFilter('out_of_stock')}
              className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                inventoryFilter === 'out_of_stock'
                  ? 'ring-2 ring-[#DC5555] border-transparent shadow-xs'
                  : 'border-slate-200/80 hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Out of Stock</span>
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#DC5555] flex items-center justify-center">
                  <AlertOctagon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-[#DC5555] mt-2">
                {outOfStockMeds.length}
              </div>
              <span className="text-[11px] text-[#718096] mt-0.5 block">0 units left</span>
            </div>

            {/* Expiring Soon */}
            <div
              onClick={() => setInventoryFilter('expiring_soon')}
              className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                inventoryFilter === 'expiring_soon'
                  ? 'ring-2 ring-orange-400 border-transparent shadow-xs'
                  : 'border-slate-200/80 hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Expiring Soon</span>
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-[#142B4A] mt-2">
                {expiringSoonMeds.length}
              </div>
              <span className="text-[11px] text-[#718096] mt-0.5 block">&le; 30 days window</span>
            </div>
          </div>

          {/* Search & Filter Pill Controls */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: `All Inventory (${medications.length})` },
                { id: 'in_stock', label: `In Stock (${inStockMeds.length})` },
                { id: 'low_stock', label: `Low Stock (${lowStockMeds.length})` },
                { id: 'out_of_stock', label: `Out of Stock (${outOfStockMeds.length})` },
                { id: 'expiring_soon', label: `Expiring Soon (${expiringSoonMeds.length})` }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setInventoryFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    inventoryFilter === pill.id
                      ? 'bg-[#142B4A] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search prescription name, purpose..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Cards Grid */}
          {filteredInventoryMeds.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs space-y-3">
              <Pill className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">No Prescriptions Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No inventory records match the selected status filter or search query.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setInventoryFilter('all');
                  setSearch('');
                }}
              >
                Reset Inventory Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredInventoryMeds.map(({ med }) => (
                <MedicineInventoryCard
                  key={med.id}
                  medication={med}
                  onRefillClick={(target) => {
                    setRefillTargetMed(target);
                    setIsRefillOpen(true);
                  }}
                  onEditClick={(target) => {
                    setSelectedMed(target);
                    setIsEditOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DAILY DOSAGE SCHEDULE (Grouped by time slot) */}
      {activeTab === 'schedule' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Controls */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: `All (${medications.length})` },
                { id: 'pending', label: 'Pending Today' },
                { id: 'taken', label: 'Taken' },
                { id: 'refill', label: `Low Supply (${lowStockMeds.length})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    filter === tab.id
                      ? 'bg-[#142B4A] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search medications..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('grouped')}
                  title="Grouped by Time of Day"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grouped'
                      ? 'bg-white text-[#142B4A] shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <CalendarClock className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  title="Standard Grid"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-[#142B4A] shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {filteredScheduleMeds.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs space-y-3">
              <Pill className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">No Prescriptions Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active prescriptions found under this filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilter('all');
                  setSearch('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : viewMode === 'grouped' ? (
            <div className="space-y-6">
              {timeSlots.map((slot) => {
                const slotMeds = filteredScheduleMeds.filter((m) => getTimeSlot(m) === slot.name);
                if (slotMeds.length === 0) return null;
                const SlotIcon = slot.icon;

                return (
                  <div key={slot.name} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-xl border ${slot.color}`}>
                          <SlotIcon className="w-4 h-4" />
                        </div>
                        <h2 className="text-base font-bold text-[#142B4A]">{slot.name}</h2>
                        <span className="text-xs text-slate-400">({slot.range})</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        {slotMeds.length} dose{slotMeds.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {slotMeds.map(renderScheduleCard)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredScheduleMeds.map(renderScheduleCard)}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REFILL HISTORY & DISPENSE AUDIT TRAIL */}
      {activeTab === 'refills' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Historical Refills Table */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 rounded-xl text-[#13A89E] border border-teal-100">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#142B4A]">
                    Pharmacy Refill Audit Trail
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chronological ledger of dispensed medications, batches, and pharmacy collections.
                  </p>
                </div>
              </div>

              <Button
                variant="accent"
                size="sm"
                icon={ShoppingBag}
                onClick={() => {
                  setRefillTargetMed(medications[0] || null);
                  setIsRefillOpen(true);
                }}
              >
                Log New Refill
              </Button>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Refill Date</th>
                    <th className="py-3 px-4">Prescription</th>
                    <th className="py-3 px-4">Quantity Added</th>
                    <th className="py-3 px-4">Dispensing Pharmacy</th>
                    <th className="py-3 px-4">Rx Number</th>
                    <th className="py-3 px-4">Batch Expiry</th>
                    <th className="py-3 px-4">Recorded By</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {refillLogs.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-10 text-center text-slate-400">
                        No pharmacy refill history recorded yet. Use the "Record Refill" button to log restocked supplies.
                      </td>
                    </tr>
                  ) : (
                    refillLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-500 whitespace-nowrap">
                          {new Date(log.refilled_at || log.created_at).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#142B4A]">
                          <div className="flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5 text-[#13A89E]" />
                            <span>{log.medication?.name || 'Prescription Medication'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-emerald-700">
                          +{log.quantity_added} {log.units || 'tablets'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="flex items-center gap-1 text-slate-700 font-medium">
                            <Store className="w-3.5 h-3.5 text-slate-400" />
                            {log.pharmacy_name || 'Community Pharmacy'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          {log.rx_number || 'RX-STANDARD'}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-600">
                          {log.expiry_date
                            ? new Date(log.expiry_date).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {log.refilled_by_profile?.full_name || 'Sarah Jenkins'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate" title={log.notes}>
                          {log.notes || 'Routine restock batch'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Modals */}
      <AddMedicationModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />

      <EditMedicationModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedMed(null);
        }}
        medication={selectedMed}
      />

      <MedicationDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedMed(null);
        }}
        medication={selectedMed}
        onEdit={(med) => {
          setSelectedMed(med);
          setIsEditOpen(true);
        }}
        onDelete={(med) => {
          setMedToDelete(med);
          setIsDeleteConfirmOpen(true);
        }}
      />

      <RecordRefillModal
        isOpen={isRefillOpen}
        onClose={() => {
          setIsRefillOpen(false);
          setRefillTargetMed(null);
        }}
        targetMedication={refillTargetMed}
      />

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setMedToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Discontinue Medication?"
        message={`Are you sure you want to delete ${medToDelete?.name || 'this prescription'}? This will remove all scheduled doses and inventory records.`}
        confirmText="Confirm Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
