import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { AlertCircle, CheckCircle2, HeartPulse, Droplet, Activity, Scale, Thermometer, Info } from 'lucide-react';
import { useCare } from '../../context/CareContext';

function EditVitalsForm({ record, onClose }) {
  const { updateVitals } = useCare();

  const [formData, setFormData] = useState(() => {
    const recDate = record?.recorded_at ? new Date(record.recorded_at).toISOString().slice(0, 16) : '';
    return {
      systolic: record?.systolic_bp || '',
      diastolic: record?.diastolic_bp || '',
      glucose: record?.blood_sugar || '',
      glucoseContext: record?.blood_sugar_context || 'fasting',
      heartRate: record?.heart_rate || '',
      weight: record?.weight !== undefined ? record.weight : (record?.weight_kg !== undefined ? record.weight_kg : ''),
      weightUnit: record?.weight_unit || 'kg',
      temperature: record?.temperature || '98.4',
      temperatureUnit: record?.temperature_unit || '°F',
      measurementMethod: record?.measurement_method || 'Manual Home Device',
      notes: record?.notes || '',
      recordedAt: recDate
    };
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!record) return;

    setLoading(true);
    setError('');

    try {
      await updateVitals(record.id, {
        systolic_bp: Number(formData.systolic) || record.systolic_bp,
        diastolic_bp: Number(formData.diastolic) || record.diastolic_bp,
        blood_sugar: Number(formData.glucose) || record.blood_sugar,
        blood_sugar_context: formData.glucoseContext,
        heart_rate: Number(formData.heartRate) || record.heart_rate,
        weight: formData.weight !== '' ? Number(formData.weight) : null,
        weight_unit: formData.weightUnit,
        temperature: formData.temperature !== '' ? Number(formData.temperature) : null,
        temperature_unit: formData.temperatureUnit,
        measurement_method: formData.measurementMethod,
        notes: formData.notes.trim(),
        recorded_at: formData.recordedAt ? new Date(formData.recordedAt).toISOString() : record.recorded_at
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 800);
    } catch (err) {
      console.error('Failed to update vitals:', err);
      setError(err.message || 'Could not update vitals measurement.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
          <span>Record updated and synced successfully.</span>
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

      {/* 1. Blood Pressure */}
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
              placeholder="Systolic"
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
              placeholder="Diastolic"
              value={formData.diastolic}
              onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Diastolic (Lower)</span>
          </div>
        </div>
      </div>

      {/* 2. Heart Rate & Temperature */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            value={formData.heartRate}
            onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
          />
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Thermometer className="w-4 h-4 text-orange-500" />
            <label className="text-xs font-bold text-slate-700 uppercase">
              Body Temperature
            </label>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              min="90"
              max="110"
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
        </div>
      </div>

      {/* 3. Blood Glucose & Context */}
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
            <option value="fasting">Fasting</option>
            <option value="post_prandial">Post-Prandial (2h)</option>
            <option value="random">Random / Bedtime</option>
            <option value="bedtime">Bedtime</option>
          </select>
        </div>
      </div>

      {/* 4. Weight */}
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
          <input
            type="text"
            value={formData.measurementMethod}
            onChange={(e) => setFormData({ ...formData, measurementMethod: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
          Notes / Observations
        </label>
        <textarea
          rows="2"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
        />
      </div>

      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
        <Info className="w-4 h-4 text-[#13A89E] shrink-0 mt-0.5" />
        <p className="text-[11px]">
          Updating this entry will preserve the patient audit history and adjust personal trend graphs.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="accent" loading={loading} className="font-bold">
          Update Vitals Record
        </Button>
      </div>
    </form>
  );
}

export default function EditVitalsModal({ isOpen, onClose, record }) {
  if (!record) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Vitals Record"
      subtitle="Modify or correct previously logged health measurements"
      maxWidth="max-w-lg"
    >
      <EditVitalsForm key={record.id} record={record} onClose={onClose} />
    </Modal>
  );
}
