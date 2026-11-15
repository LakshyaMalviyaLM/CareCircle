import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { AlertCircle, Plus } from 'lucide-react';
import { useCare } from '../../context/CareContext';

export default function AddMedicationModal({ isOpen, onClose }) {
  const { addMedication } = useCare();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const defaultExp = new Date();
  defaultExp.setFullYear(defaultExp.getFullYear() + 1);

  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    form: 'Tablet',
    units: 'tablets',
    frequency: 'Once daily',
    timeSlot: 'Morning',
    timeScheduled: '08:00 AM',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    purpose: '',
    instructions: '',
    doctor: '',
    initialQuantity: 30,
    currentQuantity: 30,
    refillThreshold: 5,
    expiryDate: defaultExp.toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.dosage.trim()) {
      setError('Medication name and dosage strength are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const currentQty = Number(formData.currentQuantity) || 30;
      const initialQty = Number(formData.initialQuantity) || 30;
      const threshold = Number(formData.refillThreshold) || 5;

      await addMedication({
        ...formData,
        currentQuantity: currentQty,
        current_quantity: currentQty,
        initialQuantity: initialQty,
        initial_quantity: initialQty,
        pillsRemaining: currentQty,
        pills_remaining: currentQty,
        totalPills: initialQty,
        total_pills: initialQty,
        units: formData.units.toLowerCase(),
        refillThreshold: threshold,
        refill_threshold: threshold,
        expiryDate: formData.expiryDate || null,
        expiry_date: formData.expiryDate || null,
        needsRefill: currentQty <= threshold
      });

      onClose();
      // Reset form
      setFormData({
        name: '',
        dosage: '',
        form: 'Tablet',
        units: 'tablets',
        frequency: 'Once daily',
        timeSlot: 'Morning',
        timeScheduled: '08:00 AM',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        purpose: '',
        instructions: '',
        doctor: '',
        initialQuantity: 30,
        currentQuantity: 30,
        refillThreshold: 5,
        expiryDate: defaultExp.toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Failed to add medication:', err);
      setError(err.message || 'Failed to save medication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Medication"
      subtitle="Enter prescription details, administration timing, and inventory stock tracking"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Medication Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lisinopril, Metformin"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Dosage Strength *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 10 mg, 500 mg, 2 puffs"
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Form / Route
            </label>
            <select
              value={formData.form}
              onChange={(e) => setFormData({ ...formData, form: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none bg-white font-medium"
            >
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Softgel Capsule">Softgel Capsule</option>
              <option value="Liquid">Liquid Solution</option>
              <option value="Inhaler">Inhaler / Puff</option>
              <option value="Chewable">Chewable</option>
              <option value="Injection">Injection / Pen</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Inventory Units
            </label>
            <select
              value={formData.units}
              onChange={(e) => setFormData({ ...formData, units: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none bg-white font-medium"
            >
              <option value="tablets">Tablets</option>
              <option value="capsules">Capsules</option>
              <option value="softgels">Softgels</option>
              <option value="bottles">Bottles</option>
              <option value="puffs">Puffs</option>
              <option value="chewables">Chewables</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Frequency
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none bg-white font-medium"
            >
              <option value="Once daily">Once daily</option>
              <option value="Twice daily">Twice daily</option>
              <option value="Three times daily">Three times daily</option>
              <option value="Every 4 hours">Every 4 hours</option>
              <option value="As needed (PRN)">As needed (PRN)</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Time of Day Slot
            </label>
            <select
              value={formData.timeSlot}
              onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none bg-white font-medium"
            >
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="Bedtime">Bedtime / Night</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Scheduled Time
            </label>
            <input
              type="text"
              placeholder="e.g. 08:00 AM"
              value={formData.timeScheduled}
              onChange={(e) => setFormData({ ...formData, timeScheduled: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>
        </div>

        {/* Inventory Stock Parameters */}
        <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70 space-y-3">
          <span className="text-xs font-bold text-[#142B4A] uppercase tracking-wider block">
            Inventory Stock Tracking
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Current Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.currentQuantity}
                onChange={(e) => setFormData({ ...formData, currentQuantity: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Bottle / Initial Qty
              </label>
              <input
                type="number"
                min="1"
                value={formData.initialQuantity}
                onChange={(e) => setFormData({ ...formData, initialQuantity: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Refill Threshold
              </label>
              <input
                type="number"
                min="1"
                placeholder="5"
                value={formData.refillThreshold}
                onChange={(e) => setFormData({ ...formData, refillThreshold: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Batch Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] bg-white"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Prescribing Physician
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. Robert Miller"
              value={formData.doctor}
              onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Primary Purpose / Condition
            </label>
            <input
              type="text"
              placeholder="e.g. Hypertension, Blood Sugar"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Special Instructions / Dietary Guidelines
          </label>
          <textarea
            rows="2"
            placeholder="e.g. Take with breakfast. Avoid grapefruit. Drink full 8oz water."
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="accent" size="md" type="submit" disabled={loading} icon={Plus}>
            {loading ? 'Saving Prescription...' : 'Save Prescription'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
