import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import VitalsLogModal from '../components/analytics/VitalsLogModal';
import EditVitalsModal from '../components/analytics/EditVitalsModal';
import HealthReportModal from '../components/analytics/HealthReportModal';
import ConfirmModal from '../components/common/ConfirmModal';
import { useCare } from '../context/CareContext';
import voiceService from '../services/voiceService';
import {
  HeartPulse,
  Activity,
  Plus,
  Volume2,
  Trash2,
  Edit,
  Scale,
  Droplet,
  Thermometer,
  Info,
  Calendar,
  FileText,
  Filter,
  UserCheck
} from 'lucide-react';

export default function VitalsPage() {
  const {
    activePatient,
    vitalsHistory,
    vitalsLogs,
    deleteVitals,
    preferredLanguage,
    setPreferredLanguage
  } = useCare();

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [activeChartTab, setActiveChartTab] = useState('bp'); // 'bp' | 'glucose' | 'heart' | 'temp' | 'weight'
  const [dateFilter, setDateFilter] = useState('14d'); // '7d' | '14d' | '30d' | '90d' | 'all' | 'custom'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [filterContext, setFilterContext] = useState('all'); // 'all' | 'fasting' | 'post_prandial'

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Latest vitals data for top KPI cards
  const latestVitals = vitalsLogs[0] || {
    systolic_bp: 122,
    diastolic_bp: 78,
    bp_unit: 'mmHg',
    heart_rate: 72,
    heart_rate_unit: 'bpm',
    blood_sugar: 104,
    blood_sugar_unit: 'mg/dL',
    blood_sugar_context: 'fasting',
    weight: 68.4,
    weight_unit: 'kg',
    temperature: 98.4,
    temperature_unit: '°F',
    recorded_at: new Date().toISOString()
  };

  // Filtered vitals logs based on Date Range and Glucose Context
  const filteredLogs = useMemo(() => {
    let result = [...vitalsLogs];

    // Date range filter
    const nowTime = new Date().getTime();
    if (dateFilter === '7d') {
      const cutoff = nowTime - 7 * 24 * 60 * 60 * 1000;
      result = result.filter(item => new Date(item.recorded_at).getTime() >= cutoff);
    } else if (dateFilter === '14d') {
      const cutoff = nowTime - 14 * 24 * 60 * 60 * 1000;
      result = result.filter(item => new Date(item.recorded_at).getTime() >= cutoff);
    } else if (dateFilter === '30d') {
      const cutoff = nowTime - 30 * 24 * 60 * 60 * 1000;
      result = result.filter(item => new Date(item.recorded_at).getTime() >= cutoff);
    } else if (dateFilter === '90d') {
      const cutoff = nowTime - 90 * 24 * 60 * 60 * 1000;
      result = result.filter(item => new Date(item.recorded_at).getTime() >= cutoff);
    } else if (dateFilter === 'custom') {
      if (customStart) {
        const startMs = new Date(customStart).getTime();
        result = result.filter(item => new Date(item.recorded_at).getTime() >= startMs);
      }
      if (customEnd) {
        const endMs = new Date(customEnd).getTime() + 24 * 60 * 60 * 1000 - 1;
        result = result.filter(item => new Date(item.recorded_at).getTime() <= endMs);
      }
    }

    // Context filter
    if (filterContext !== 'all') {
      result = result.filter(item => item.blood_sugar_context === filterContext);
    }

    return result;
  }, [vitalsLogs, dateFilter, customStart, customEnd, filterContext]);

  // Prepare chart series from filtered logs (chronological order)
  const chartData = useMemo(() => {
    if (filteredLogs.length > 0) {
      return [...filteredLogs]
        .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at))
        .map((item) => ({
          name: new Date(item.recorded_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          time: new Date(item.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rawDate: item.recorded_at,
          systolic: item.systolic_bp || 120,
          diastolic: item.diastolic_bp || 80,
          glucose: item.blood_sugar || 104,
          heartRate: item.heart_rate || 72,
          weight: item.weight !== undefined ? item.weight : (item.weight_kg !== undefined ? item.weight_kg : 68.4),
          temperature: item.temperature || 98.4
        }));
    }

    // Fallback to vitalsHistory
    return (vitalsHistory && vitalsHistory.length > 0 ? vitalsHistory : []).map((item, idx) => ({
      name: item.time || item.date || `Day ${idx + 1}`,
      systolic: item.systolic || 120,
      diastolic: item.diastolic || 80,
      glucose: item.glucose || 104,
      heartRate: item.heartRate || 72,
      weight: item.weight || 68.4,
      temperature: item.temperature || 98.4
    }));
  }, [filteredLogs, vitalsHistory]);

  const handleSpeakVitals = () => {
    setIsSpeaking(true);
    voiceService.readVitalsSummary(
      {
        bloodPressure: `${latestVitals.systolic_bp || 122}/${latestVitals.diastolic_bp || 78}`,
        heartRate: latestVitals.heart_rate || 72,
        bloodGlucose: latestVitals.blood_sugar || 104,
        temperature: latestVitals.temperature || 98.4
      },
      preferredLanguage
    );
    setTimeout(() => setIsSpeaking(false), 5000);
  };

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return;
    setDeleting(true);
    try {
      await deleteVitals(recordToDelete.id);
      setIsDeleteConfirmOpen(false);
      setRecordToDelete(null);
    } catch (err) {
      console.error('Failed to delete vital record:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#13A89E] uppercase tracking-wider">
              Health Surveillance & Biometrics
            </span>
            <span className="text-xs text-slate-400">• Manual Routine Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight mt-1">
            Health Vitals Tracker
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manually recorded blood pressure, heart rate, blood glucose, weight, and temperature for{' '}
            <span className="font-semibold text-slate-700">{activePatient.name}</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Language Toggle for Senior Guidance */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setPreferredLanguage('en-US')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                preferredLanguage === 'en-US' ? 'bg-white text-[#142B4A] shadow-xs' : 'text-slate-500'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setPreferredLanguage('hi-IN')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                preferredLanguage === 'hi-IN' ? 'bg-[#13A89E] text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Voice Narration Button */}
          <button
            onClick={handleSpeakVitals}
            title="Read vitals summary aloud"
            className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-[#13A89E] text-white border-transparent animate-pulse shadow-xs'
                : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">Voice Summary</span>
          </button>

          {/* View Health Report Summary */}
          <Button
            variant="outline"
            size="md"
            icon={FileText}
            onClick={() => setIsReportModalOpen(true)}
            className="font-bold border-slate-300 hover:bg-slate-50 text-slate-700"
          >
            Health Report
          </Button>

          {/* Log New Vitals Button */}
          <Button
            variant="accent"
            size="md"
            icon={Plus}
            onClick={() => setIsLogModalOpen(true)}
            className="font-bold shadow-sm"
          >
            Log New Vitals
          </Button>
        </div>
      </div>

      {/* 5 TOP SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. Blood Pressure */}
        <Card className="p-4 border-l-4 border-l-[#DC5555] hover:shadow-md transition-shadow bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">Blood Pressure</span>
            <span className="p-1.5 bg-rose-50 rounded-lg text-[#DC5555]">
              <HeartPulse className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-extrabold text-[#142B4A]">
              {latestVitals.systolic_bp || 122}/{latestVitals.diastolic_bp || 78}
              <span className="text-xs font-semibold text-[#718096] ml-1">mmHg</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#16A37B] border border-emerald-200">
                Target: &lt; 130/80
              </span>
              <span className="text-[10px] text-[#718096]">Manual Entry</span>
            </div>
          </div>
        </Card>

        {/* 2. Resting Heart Rate */}
        <Card className="p-4 border-l-4 border-l-[#13A89E] hover:shadow-md transition-shadow bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">Resting Pulse</span>
            <span className="p-1.5 bg-teal-50 rounded-lg text-[#13A89E]">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-extrabold text-[#142B4A]">
              {latestVitals.heart_rate || 72}
              <span className="text-xs font-semibold text-[#718096] ml-1">BPM</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#16A37B] border border-emerald-200">
                60 - 100 Baseline
              </span>
              <span className="text-[10px] text-[#718096]">Resting</span>
            </div>
          </div>
        </Card>

        {/* 3. Blood Glucose */}
        <Card className="p-4 border-l-4 border-l-[#E9A23B] hover:shadow-md transition-shadow bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">Blood Glucose</span>
            <span className="p-1.5 bg-amber-50 rounded-lg text-[#E9A23B]">
              <Droplet className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-extrabold text-[#142B4A]">
              {latestVitals.blood_sugar || 104}
              <span className="text-xs font-semibold text-[#718096] ml-1">mg/dL</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-[#E9A23B] border border-amber-200 capitalize">
                {latestVitals.blood_sugar_context ? latestVitals.blood_sugar_context.replace('_', ' ') : 'Fasting'}
              </span>
              <span className="text-[10px] text-[#718096]">Target: 70-130</span>
            </div>
          </div>
        </Card>

        {/* 4. Body Temperature */}
        <Card className="p-4 border-l-4 border-l-orange-500 hover:shadow-md transition-shadow bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">Body Temp</span>
            <span className="p-1.5 bg-orange-50 rounded-lg text-orange-600">
              <Thermometer className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-extrabold text-[#142B4A]">
              {latestVitals.temperature || 98.4}
              <span className="text-xs font-semibold text-[#718096] ml-1">{latestVitals.temperature_unit || '°F'}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200">
                Baseline ~98.6°
              </span>
              <span className="text-[10px] text-[#718096]">Oral Temp</span>
            </div>
          </div>
        </Card>

        {/* 5. Body Weight */}
        <Card className="p-4 border-l-4 border-l-[#142B4A] hover:shadow-md transition-shadow bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">Body Weight</span>
            <span className="p-1.5 bg-blue-50 rounded-lg text-[#142B4A]">
              <Scale className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-extrabold text-[#142B4A]">
              {latestVitals.weight !== undefined ? latestVitals.weight : (latestVitals.weight_kg || 68.4)}
              <span className="text-xs font-semibold text-[#718096] ml-1">{latestVitals.weight_unit || 'kg'}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#142B4A] border border-blue-200">
                Stable Range
              </span>
              <span className="text-[10px] text-[#718096]">Weekly Track</span>
            </div>
          </div>
        </Card>
      </div>

      {/* INTERACTIVE RECHARTS & DATE FILTERING SECTION */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#142B4A]">Biometric Trend Analysis</h3>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {chartData.length} Data Points
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Visual monitoring trajectory for patient routine and caregiver coordination
            </p>
          </div>

          {/* Chart View Switcher (5 Tabs) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
            {[
              { id: 'bp', label: 'Blood Pressure' },
              { id: 'glucose', label: 'Blood Glucose' },
              { id: 'heart', label: 'Heart Rate' },
              { id: 'temp', label: 'Temperature' },
              { id: 'weight', label: 'Weight' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveChartTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeChartTab === tab.id
                    ? 'bg-white text-[#142B4A] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 pb-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Time Range:
            </span>
            {[
              { id: '7d', label: '7 Days' },
              { id: '14d', label: '14 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: 'all', label: 'All Records' },
              { id: 'custom', label: 'Custom' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setDateFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  dateFilter === f.id
                    ? 'bg-[#13A89E] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2 py-1 border border-slate-200 rounded-lg text-xs font-medium"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2 py-1 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
          )}
        </div>

        {/* Dynamic Recharts Chart */}
        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            {activeChartTab === 'bp' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#142B4A',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <ReferenceLine y={120} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Target Systolic 120', fill: '#10B981', fontSize: 10 }} />
                <ReferenceLine y={80} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Target Diastolic 80', fill: '#10B981', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="systolic"
                  name="Systolic BP (mmHg)"
                  stroke="#F43F5E"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#F43F5E' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  name="Diastolic BP (mmHg)"
                  stroke="#0284C7"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0284C7' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : activeChartTab === 'glucose' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#142B4A',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <ReferenceLine y={100} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Fasting Target 100', fill: '#10B981', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="glucose"
                  name="Blood Glucose (mg/dL)"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#F59E0B' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : activeChartTab === 'heart' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#142B4A',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <ReferenceLine y={72} stroke="#13A89E" strokeDasharray="3 3" label={{ value: 'Resting Baseline', fill: '#13A89E', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  name="Heart Rate (BPM)"
                  stroke="#13A89E"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#13A89E' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : activeChartTab === 'temp' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#142B4A',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <ReferenceLine y={98.6} stroke="#F97316" strokeDasharray="3 3" label={{ value: 'Normal Baseline 98.6°F', fill: '#F97316', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Body Temperature (°F)"
                  stroke="#EA580C"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#EA580C' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#142B4A',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Weight (kg)"
                  stroke="#6366F1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#6366F1' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-slate-400 text-center mt-3 italic">
          * Graphs are visual tracking representations of manually logged entries and should not be used as standalone medical diagnostics.
        </p>
      </Card>

      {/* DATE-WISE RECORDS TABLE */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#142B4A]">Historical Vitals Records</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {filteredLogs.length} Records
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Manual entries recorded by {activePatient.name} and authorized family caregivers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 font-semibold">Glucose:</span>
            <select
              value={filterContext}
              onChange={(e) => setFilterContext(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium focus:ring-1 focus:ring-[#13A89E] outline-none"
            >
              <option value="all">All Timings</option>
              <option value="fasting">Fasting Only</option>
              <option value="post_prandial">Post-Meal Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-3">Recorded At</th>
                <th className="py-3 px-3">Blood Pressure</th>
                <th className="py-3 px-3">Heart Rate</th>
                <th className="py-3 px-3">Blood Sugar</th>
                <th className="py-3 px-3">Temperature</th>
                <th className="py-3 px-3">Weight</th>
                <th className="py-3 px-3">Recorded By</th>
                <th className="py-3 px-3">Notes & Method</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    No vitals found for the selected time filter. Click "Log New Vitals" above to add a manual measurement.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-500 whitespace-nowrap">
                      <div>
                        {new Date(log.recorded_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.recorded_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>

                    {/* BP */}
                    <td className="py-3 px-3 font-bold text-[#142B4A] whitespace-nowrap">
                      {log.systolic_bp}/{log.diastolic_bp}{' '}
                      <span className="text-[10px] font-normal text-slate-400">{log.bp_unit || 'mmHg'}</span>
                    </td>

                    {/* Heart Rate */}
                    <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap">
                      {log.heart_rate} <span className="text-[10px] font-normal text-slate-400">{log.heart_rate_unit || 'bpm'}</span>
                    </td>

                    {/* Blood Sugar */}
                    <td className="py-3 px-3 font-bold text-amber-900 whitespace-nowrap">
                      {log.blood_sugar} <span className="text-[10px] font-normal text-slate-400">{log.blood_sugar_unit || 'mg/dL'}</span>
                      <div className="text-[10px] font-semibold text-amber-700 capitalize">
                        {log.blood_sugar_context ? log.blood_sugar_context.replace('_', ' ') : 'fasting'}
                      </div>
                    </td>

                    {/* Temperature */}
                    <td className="py-3 px-3 font-semibold text-orange-950 whitespace-nowrap">
                      {log.temperature || '98.4'} <span className="text-[10px] font-normal text-slate-400">{log.temperature_unit || '°F'}</span>
                    </td>

                    {/* Weight */}
                    <td className="py-3 px-3 font-medium text-slate-700 whitespace-nowrap">
                      {log.weight !== undefined ? log.weight : (log.weight_kg || '68.4')}{' '}
                      <span className="text-[10px] font-normal text-slate-400">{log.weight_unit || 'kg'}</span>
                    </td>

                    {/* Recorded By */}
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      <div className="font-semibold text-slate-700 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-[#13A89E]" />
                        <span>{log.recorder?.full_name || 'Sarah Jenkins'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {log.recorder?.role || 'Caregiver'}
                      </span>
                    </td>

                    {/* Notes & Method */}
                    <td className="py-3 px-3 text-slate-500 max-w-xs">
                      <div className="truncate" title={log.notes}>
                        {log.notes || 'Routine measurement'}
                      </div>
                      <span className="text-[10px] text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-sm inline-block mt-0.5">
                        {log.measurement_method || 'Manual Home Reading'}
                      </span>
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setRecordToEdit(log);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-[#13A89E] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit record"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setRecordToDelete(log);
                            setIsDeleteConfirmOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Prominent Clinical Disclaimer */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-[#13A89E] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Important Clinical Tracking Disclaimer:</strong> CareCircle biometrics surveillance is designed for personal routine monitoring and caregiver coordination. All recorded values are manually entered. They do not constitute automated medical diagnoses, clinical condition classifications, or prescription dosage modifications. In the event of acute chest discomfort, severe shortness of breath, dizziness, or medical emergencies, press Emergency SOS or contact emergency medical personnel (911/112) immediately.
        </p>
      </div>

      {/* Log Vitals Modal */}
      <VitalsLogModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} />

      {/* Edit Vitals Modal */}
      <EditVitalsModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setRecordToEdit(null);
        }}
        record={recordToEdit}
      />

      {/* Health Report Summary Modal */}
      <HealthReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        patient={activePatient}
        logs={filteredLogs}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setRecordToDelete(null);
        }}
        onConfirm={handleDeleteRecord}
        title="Delete Vitals Record?"
        message="Are you sure you want to delete this vital log? This action cannot be undone and will update the tracking history."
        confirmText="Confirm Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
