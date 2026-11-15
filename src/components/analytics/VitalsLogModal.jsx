import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { AlertCircle, CheckCircle2, HeartPulse, Droplet, Activity, Scale, Thermometer, Info } from 'lucide-react';
import { useCare } from '../../context/CareContext';

export default function VitalsLogModal({ isOpen, onClose }) {
  const { recordVitals } = useCare();

  const [formData, setFormData] = useState({
    systolic: '120',
    diastolic: '80',
    glucose: '104',
    glucoseContext: 'fasting',
    heartRate: '72',
    weight: '68.4',
    weightUnit: 'kg',
    temperature: '98.4',
    temperatureUnit: '°F',
    measurementMethod: 'Manual Home Device',
    notes: 'Routine manual measurement after resting.',
    recordedAt: new Date().toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await recordVitals({
        systolic_bp: Number(formData.systolic) || 120,
        diastolic_bp: Number(formData.diastolic) || 80,
        bp_unit: 'mmHg',
        blood_sugar: Number(formData.glucose) || 104,
        blood_sugar_unit: 'mg/dL',
        blood_sugar_context: formData.glucoseContext,
        heart_rate: Number(formData.heartRate) || 72,
        heart_rate_unit: 'bpm',
        weight: Number(formData.weight) || 68.4,
        weight_unit: formData.weightUnit,
        temperature: Number(formData.temperature) || 98.4,
        temperature_unit: formData.temperatureUnit,
        measurement_method: formData.measurementMethod,
        notes: formData.notes.trim(),
        recorded_at: new Date(formData.recordedAt).toISOString()
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error('Failed to log vitals:', err);
      setError(err.message || 'Could not save vitals measurement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Daily Health Vitals"
      subtitle="Manually enter blood pressure, heart rate, blood glucose, weight, and temperature"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Vitals recorded successfully and added to tracking timeline.</span>
          </div>
        )}

        {/* Date and Time */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Measurement Date & Time
          </label>
          <input
            type="datetime-local"
            value={formData.recordedAt}
            onChange={(e) => setFormData({ ...formData, recordedAt: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
          />
        </div>

        {/* 1. Blood Pressure (Systolic & Diastolic) */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <HeartPulse className="w-4 h-4 text-rose-500" />
            <label className="text-xs font-bold text-slate-700 uppercase">
              Blood Pressure (mmHg) *
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                required
                min="60"
                max="240"
                placeholder="Systolic (e.g. 120)"
                value={formData.systolic}
                onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Systolic (Upper)</span>
            </div>

            <div>
              <input
                type="number"
                required
                min="40"
                max="160"
                placeholder="Diastolic (e.g. 80)"
                value={formData.diastolic}
                onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Diastolic (Lower)</span>
            </div>
          </div>
        </div>

        {/* 2. Heart Rate & Body Temperature */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Heart Rate */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Activity className="w-4 h-4 text-teal-600" />
              <label className="text-xs font-bold text-slate-700 uppercase">
                Heart Rate (BPM) *
              </label>
            </div>
            <input
              type="number"
              required
              min="40"
              max="220"
              placeholder="72"
              value={formData.heartRate}
              onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Resting pulse in beats/min</span>
          </div>

          {/* Temperature */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <label className="text-xs font-bold text-slate-700 uppercase">
                Body Temperature *
              </label>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                required
                min="90"
                max="110"
                placeholder="98.4"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
              />
              <select
                value={formData.temperatureUnit}
                onChange={(e) => setFormData({ ...formData, temperatureUnit: e.target.value })}
                className="px-2 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-[#13A89E] outline-none"
              >
                <option value="°F">°F</option>
                <option value="°C">°C</option>
              </select>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Standard baseline ~98.6°F</span>
          </div>
        </div>

        {/* 3. Blood Glucose & Timing Context */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Droplet className="w-4 h-4 text-amber-500" />
              <label className="text-xs font-bold text-slate-700 uppercase">
                Blood Glucose (mg/dL) *
              </label>
            </div>
            <input
              type="number"
              required
              min="30"
              max="500"
              placeholder="104"
              value={formData.glucose}
              onChange={(e) => setFormData({ ...formData, glucose: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Glucose Context
            </label>
            <select
              value={formData.glucoseContext}
              onChange={(e) => setFormData({ ...formData, glucoseContext: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none bg-white font-medium"
            >
              <option value="fasting">Fasting (Morning before meal)</option>
              <option value="post_prandial">Post-Prandial (2h after meal)</option>
              <option value="random">Random / Bedtime</option>
              <option value="bedtime">Bedtime</option>
            </select>
          </div>
        </div>

        {/* 4. Weight & Measurement Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Scale className="w-4 h-4 text-blue-500" />
              <label className="text-xs font-bold text-slate-700 uppercase">
                Weight
              </label>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                min="20"
                max="300"
                placeholder="68.4"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
              />
              <select
                value={formData.weightUnit}
                onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                className="px-2 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-[#13A89E] outline-none"
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Measurement Method
            </label>
            <select
              value={formData.measurementMethod}
              onChange={(e) => setFormData({ ...formData, measurementMethod: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none bg-white font-medium"
            >
              <option value="Manual Home Device">Manual Home Device</option>
              <option value="Upper Arm Digital Cuff">Upper Arm Digital Cuff</option>
              <option value="Fingertip Glucometer">Fingertip Glucometer</option>
              <option value="Digital Oral Thermometer">Digital Oral Thermometer</option>
              <option value="Doctor Office Reading">Doctor Office Reading</option>
            </select>
          </div>
        </div>

        {/* Clinical Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Notes / Observations
          </label>
          <textarea
            rows="2"
            placeholder="e.g. Measured after 10 minutes resting. Feeling well."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
          />
        </div>

        {/* Disclaimer Alert */}
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 flex items-start gap-2.5 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Manual Tracking Notice:</strong> All values are manually entered by patients or authorized caregivers. These charts are for tracking routines only and do not constitute clinical diagnoses or medical instructions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="accent" loading={loading} className="font-bold">
            Save Vitals Record
          </Button>
        </div>
      </form>
    </Modal>
  );
}
