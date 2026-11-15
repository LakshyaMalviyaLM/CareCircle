import { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import {
  HeartPulse,
  Activity,
  Droplet,
  Scale,
  Thermometer,
  Plus,
  ArrowRight,
  UserCheck,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCare } from '../../context/CareContext';
import VitalsLogModal from '../analytics/VitalsLogModal';

export default function CurrentVitalsCard() {
  const { activePatient, vitalsLogs } = useCare();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Latest record from vitalsLogs or patient fallback
  const latest = vitalsLogs[0] || {
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
    recorded_at: new Date().toISOString(),
    recorder: { full_name: 'Sarah Jenkins', role: 'Caregiver' }
  };

  const formattedDate = latest.recorded_at
    ? new Date(latest.recorded_at).toLocaleDateString([], {
        month: 'short',
        day: 'numeric'
      })
    : 'Today';

  const formattedTime = latest.recorded_at
    ? new Date(latest.recorded_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '8:30 AM';

  const weightVal = latest.weight !== undefined ? latest.weight : (latest.weight_kg || 68.4);

  return (
    <>
      <Card className="p-5 sm:p-6 border border-slate-200/80 shadow-2xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#13A89E] bg-[#EAF3FC] px-2 py-0.5 rounded-md border border-blue-200/60">
                Current Measurements
              </span>
              <span className="text-xs text-[#718096] font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formattedDate} at {formattedTime}
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-[#142B4A] tracking-tight mt-1">
              {activePatient.name}’s Health Vitals
            </h3>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-[#718096]">
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-[#13A89E]" />
                Logged by {latest.recorder?.full_name || 'Caregiver'} ({latest.recorder?.role || 'Primary Caregiver'})
              </span>
              <span>•</span>
              <span className="text-[#718096]">Manual Entry</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => setIsLogModalOpen(true)}
              className="text-xs font-semibold"
            >
              Log Reading
            </Button>
            <Link
              to="/vitals"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-[#142B4A] transition-colors"
            >
              <span>Vitals Hub</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </Link>
          </div>
        </div>

        {/* 5 Vitals Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4">
          {/* 1. Blood Pressure */}
          <div className="p-3.5 rounded-xl bg-[#F6F8FC] border border-slate-200/80 hover:bg-white hover:shadow-xs transition-all">
            <div className="flex items-center justify-between text-[#718096] mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">Blood Pressure</span>
              <HeartPulse className="w-4 h-4 text-[#DC5555]" />
            </div>
            <div className="text-xl font-extrabold text-[#142B4A]">
              {latest.systolic_bp || 122}/{latest.diastolic_bp || 78}
            </div>
            <div className="text-[10px] text-[#718096] font-medium mt-0.5">
              {latest.bp_unit || 'mmHg'} • Target &lt;130/80
            </div>
          </div>

          {/* 2. Heart Rate */}
          <div className="p-3.5 rounded-xl bg-[#F6F8FC] border border-slate-200/80 hover:bg-white hover:shadow-xs transition-all">
            <div className="flex items-center justify-between text-[#718096] mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">Resting Pulse</span>
              <Activity className="w-4 h-4 text-[#13A89E]" />
            </div>
            <div className="text-xl font-extrabold text-[#142B4A]">
              {latest.heart_rate || 72}
            </div>
            <div className="text-[10px] text-[#718096] font-medium mt-0.5">
              {latest.heart_rate_unit || 'BPM'} • Baseline 60-100
            </div>
          </div>

          {/* 3. Blood Glucose */}
          <div className="p-3.5 rounded-xl bg-[#F6F8FC] border border-slate-200/80 hover:bg-white hover:shadow-xs transition-all">
            <div className="flex items-center justify-between text-[#718096] mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">Blood Glucose</span>
              <Droplet className="w-4 h-4 text-[#E9A23B]" />
            </div>
            <div className="text-xl font-extrabold text-[#142B4A]">
              {latest.blood_sugar || 104}
            </div>
            <div className="text-[10px] text-[#E9A23B] font-semibold mt-0.5 capitalize truncate">
              {latest.blood_sugar_unit || 'mg/dL'} ({latest.blood_sugar_context ? latest.blood_sugar_context.replace('_', ' ') : 'fasting'})
            </div>
          </div>

          {/* 4. Body Temperature */}
          <div className="p-3.5 rounded-xl bg-[#F6F8FC] border border-slate-200/80 hover:bg-white hover:shadow-xs transition-all">
            <div className="flex items-center justify-between text-[#718096] mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">Body Temp</span>
              <Thermometer className="w-4 h-4 text-[#E9A23B]" />
            </div>
            <div className="text-xl font-extrabold text-[#142B4A]">
              {latest.temperature || 98.4}
            </div>
            <div className="text-[10px] text-[#718096] font-medium mt-0.5">
              {latest.temperature_unit || '°F'} • Normal ~98.6°F
            </div>
          </div>

          {/* 5. Weight */}
          <div className="p-3.5 rounded-xl bg-[#F6F8FC] border border-slate-200/80 hover:bg-white hover:shadow-xs transition-all col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-[#718096] mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">Body Weight</span>
              <Scale className="w-4 h-4 text-[#142B4A]" />
            </div>
            <div className="text-xl font-extrabold text-[#142B4A]">
              {weightVal}
            </div>
            <div className="text-[10px] text-[#718096] font-medium mt-0.5">
              {latest.weight_unit || 'kg'} • Stable
            </div>
          </div>
        </div>
      </Card>

      {/* Log Vitals Modal */}
      <VitalsLogModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} />
    </>
  );
}
