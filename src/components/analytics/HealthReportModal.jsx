import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import {
  FileText,
  Printer,
  Copy,
  Check,
  HeartPulse,
  Activity,
  Droplet,
  Scale,
  Thermometer,
  Info,
  Calendar
} from 'lucide-react';
import vitalsService from '../../services/vitalsService';

export default function HealthReportModal({ isOpen, onClose, patient, logs = [] }) {
  const [copied, setCopied] = useState(false);
  const report = vitalsService.calculateVitalsReport(logs);

  const handleCopyText = () => {
    const text = `
=== CARECIRCLE HEALTH VITALS SUMMARY REPORT ===
Patient: ${patient?.name || 'Patient'}
Tracking Window: ${report.dateSpan}
Total Recorded Sessions: ${report.totalRecords} (Manually Logged)

1. BLOOD PRESSURE:
   - Average: ${report.bp.avgSystolic}/${report.bp.avgDiastolic} mmHg
   - Range: ${report.bp.min} to ${report.bp.max}
   - Latest: ${report.bp.latest}

2. RESTING HEART RATE:
   - Average: ${report.heartRate.avg} BPM
   - Range: ${report.heartRate.min} - ${report.heartRate.max} BPM
   - Latest: ${report.heartRate.latest} BPM

3. BLOOD GLUCOSE:
   - Fasting Average: ${report.bloodSugar.avgFasting} mg/dL
   - Post-Meal Average: ${report.bloodSugar.avgPostPrandial} mg/dL
   - Latest: ${report.bloodSugar.latest} mg/dL (${report.bloodSugar.latestContext})

4. BODY WEIGHT:
   - Current: ${report.weight.current} ${report.weight.unit}
   - Net Change in Period: ${report.weight.change >= 0 ? `+${report.weight.change}` : report.weight.change} ${report.weight.unit}
   - Period Average: ${report.weight.avg} ${report.weight.unit}

5. BODY TEMPERATURE:
   - Average: ${report.temperature.avg} ${report.temperature.unit}
   - Latest: ${report.temperature.latest} ${report.temperature.unit}

CLINICAL DISCLAIMER:
These health vitals are self-reported manual entries recorded for personal routine tracking and caregiver coordination. They do not constitute automated medical diagnoses or treatment modifications. Consult your attending physician for clinical interpretations.
===============================================
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Health Vitals Clinical Summary"
      subtitle="Comprehensive observational tracking report for physician review"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 print:p-0">
        {/* Report Header Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#142B4A] to-[#1E3E6B] text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#13A89E] text-[10px] font-extrabold uppercase tracking-wider text-white">
                  CareCircle Health Dossier
                </span>
                <span className="text-xs text-slate-300">• Manual Biometrics Log</span>
              </div>
              <h3 className="text-xl font-bold mt-1.5">{patient?.name || 'Eleanor Vance'}</h3>
              <p className="text-xs text-slate-300">
                DOB: {patient?.age ? `${patient.age} years old` : 'Elderly Patient'} • Medical Record: EV-88902
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between text-right border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
              <div className="flex items-center gap-1.5 text-xs text-teal-300 font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                <span>{report.dateSpan}</span>
              </div>
              <span className="text-[11px] text-slate-300 mt-1">
                {report.totalRecords} Sessions Logged
              </span>
            </div>
          </div>
        </div>

        {/* 5 Vitals Metric Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* 1. Blood Pressure */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                Blood Pressure
              </span>
              <span className="text-[11px] font-bold text-slate-400">mmHg</span>
            </div>
            <div className="text-xl font-black text-[#142B4A]">
              {report.bp.avgSystolic}/{report.bp.avgDiastolic}
              <span className="text-xs font-semibold text-slate-400 ml-1.5">Period Mean</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 space-y-0.5 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Observed Range:</span>
                <span className="font-semibold text-slate-700">{report.bp.min} – {report.bp.max}</span>
              </div>
              <div className="flex justify-between">
                <span>Latest Reading:</span>
                <span className="font-bold text-[#142B4A]">{report.bp.latest}</span>
              </div>
            </div>
          </div>

          {/* 2. Heart Rate */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-600" />
                Resting Heart Rate
              </span>
              <span className="text-[11px] font-bold text-slate-400">BPM</span>
            </div>
            <div className="text-xl font-black text-[#142B4A]">
              {report.heartRate.avg}
              <span className="text-xs font-semibold text-slate-400 ml-1.5">Average BPM</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 space-y-0.5 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Observed Range:</span>
                <span className="font-semibold text-slate-700">{report.heartRate.min} – {report.heartRate.max} BPM</span>
              </div>
              <div className="flex justify-between">
                <span>Latest Reading:</span>
                <span className="font-bold text-[#142B4A]">{report.heartRate.latest} BPM</span>
              </div>
            </div>
          </div>

          {/* 3. Blood Glucose */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-amber-500" />
                Blood Glucose
              </span>
              <span className="text-[11px] font-bold text-slate-400">mg/dL</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center py-1">
              <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-200/50">
                <span className="text-[10px] text-amber-800 font-bold uppercase block">Fasting Mean</span>
                <span className="text-lg font-black text-amber-950">{report.bloodSugar.avgFasting}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] text-slate-600 font-bold uppercase block">Post-Meal Mean</span>
                <span className="text-lg font-black text-slate-800">{report.bloodSugar.avgPostPrandial}</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
              <span>Latest Glucose:</span>
              <span className="font-bold text-amber-900">{report.bloodSugar.latest} mg/dL ({report.bloodSugar.latestContext})</span>
            </div>
          </div>

          {/* 4. Weight & Body Temperature */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-blue-500" />
                Weight & Temp
              </span>
              <span className="text-[11px] font-bold text-slate-400">Biometrics</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">Weight Trend</span>
                <span className="text-base font-black text-[#142B4A]">
                  {report.weight.current} {report.weight.unit}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Delta: {report.weight.change >= 0 ? `+${report.weight.change}` : report.weight.change} {report.weight.unit}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-orange-500" />
                  Temperature
                </span>
                <span className="text-base font-black text-[#142B4A]">
                  {report.temperature.latest} {report.temperature.unit}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Mean: {report.temperature.avg} {report.temperature.unit}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Observational Summary Narrative */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-[#142B4A] mb-1">
            <FileText className="w-4 h-4 text-[#13A89E]" />
            <span>Observational Summary</span>
          </div>
          <p>{report.observationalSummary}</p>
        </div>

        {/* Clinical Disclaimer */}
        <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-2.5 text-xs text-blue-950">
          <Info className="w-4 h-4 text-[#13A89E] shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Physician Consultation Note:</strong> All biometrics listed above were manually entered by the patient or authorized caregivers using home monitoring equipment. CareCircle does not provide automated diagnoses, clinical classifications, or prescription dosage recommendations. Please share this log with your medical care team.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={handlePrint}
              className="text-xs font-semibold"
            >
              Print Report
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={copied ? Check : Copy}
              onClick={handleCopyText}
              className="text-xs font-semibold"
            >
              {copied ? 'Summary Copied!' : 'Copy Text Summary'}
            </Button>
          </div>

          <Button type="button" variant="accent" size="sm" onClick={onClose} className="font-bold">
            Close Report
          </Button>
        </div>
      </div>
    </Modal>
  );
}
