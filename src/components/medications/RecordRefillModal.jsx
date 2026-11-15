import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import {
  Pill,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Store,
  Calendar,
  FileText,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { useCare } from '../../context/CareContext';
import { calculateStockMetrics } from '../../services/refillService';

export default function RecordRefillModal({
  isOpen,
  onClose,
  targetMedication,
  onRefillRecorded
}) {
  const { medications, recordRefill } = useCare();

  const [selectedMedId, setSelectedMedId] = useState(
    targetMedication?.id || medications[0]?.id || ''
  );
  const [quantity, setQuantity] = useState(30);
  const [units, setUnits] = useState('tablets');
  const [pharmacyName, setPharmacyName] = useState('Walgreens Pharmacy');
  const [rxNumber, setRxNumber] = useState('');
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [refillDate, setRefillDate] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('Standard refill batch collected');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (targetMedication?.id) {
      setSelectedMedId(targetMedication.id);
      setUnits(targetMedication.units || targetMedication.form || 'tablets');
    } else if (!selectedMedId && medications.length > 0) {
      setSelectedMedId(medications[0].id);
      setUnits(medications[0].units || medications[0].form || 'tablets');
    }

    // Default dates
    const today = new Date().toISOString().split('T')[0];
    setRefillDate(today);

    // Default new expiry date to 1 year from now
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    setNewExpiryDate(oneYearLater.toISOString().split('T')[0]);
  }, [targetMedication, medications, selectedMedId, isOpen]);

  const activeMed =
    medications.find((m) => m.id === selectedMedId) || targetMedication || medications[0];
  const stockMetrics = activeMed ? calculateStockMetrics(activeMed) : null;
  const qtyNum = Number(quantity) || 0;
  const projectedRemaining = (stockMetrics?.currentQuantity || 0) + qtyNum;
  const projectedDaysRemaining = Math.max(
    0,
    Math.floor(projectedRemaining / (stockMetrics?.dosesPerDay || 1))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeMed) return;

    if (qtyNum <= 0) {
      setError('Please enter a valid refill quantity greater than 0.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const result = await recordRefill({
        medicationId: activeMed.id,
        quantityAdded: qtyNum,
        units: units.toLowerCase(),
        pharmacyName: pharmacyName.trim(),
        rxNumber: rxNumber.trim(),
        newExpiryDate: newExpiryDate || null,
        refillDate,
        cost: cost ? Number(cost) : null,
        notes: notes.trim()
      });

      setSuccess(true);
      if (onRefillRecorded) {
        onRefillRecorded(result);
      }

      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1200);
    } catch (err) {
      console.error('Failed to record refill:', err);
      setError(err.message || 'Could not record pharmacy refill.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Prescription Refill"
      subtitle="Restock medicine inventory, track pharmacy dispense history & notify caregivers"
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
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">
              Inventory refilled (+{quantity} {units}) and caregivers notified!
            </span>
          </div>
        )}

        {/* Prescription Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Prescription To Restock *
          </label>
          <select
            value={selectedMedId}
            onChange={(e) => {
              setSelectedMedId(e.target.value);
              const m = medications.find((x) => x.id === e.target.value);
              if (m?.units) setUnits(m.units);
            }}
            className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            required
          >
            {medications.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.dosage}) • {m.currentQuantity ?? m.pillsRemaining ?? 30}{' '}
                {m.units || 'units'} currently left
              </option>
            ))}
          </select>
        </div>

        {/* Refill Quantity & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Quantity Added *
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none font-bold"
            />
            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-1.5">
              {[30, 60, 90].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setQuantity(preset)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                    Number(quantity) === preset
                      ? 'bg-[#13A89E] text-white border-transparent'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Units
            </label>
            <select
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none bg-white font-medium"
            >
              <option value="tablets">Tablets</option>
              <option value="capsules">Capsules</option>
              <option value="softgels">Softgels</option>
              <option value="chewables">Chewables</option>
              <option value="bottles">Bottles / Liquid ml</option>
              <option value="puffs">Puffs / Inhalers</option>
              <option value="patches">Patches</option>
            </select>
          </div>
        </div>

        {/* Live Inventory Projection Preview Card */}
        {stockMetrics && (
          <div className="bg-gradient-to-r from-teal-50/60 to-blue-50/60 p-3.5 rounded-2xl border border-teal-100/80 flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Current Inventory
              </span>
              <span className="font-extrabold text-[#142B4A]">
                {stockMetrics.currentQuantity} {units}
              </span>
              <span className="text-[10px] text-slate-500 block">
                ({stockMetrics.daysRemaining} days left)
              </span>
            </div>

            <div className="flex items-center gap-1 text-[#13A89E] font-bold">
              <span>+{qtyNum}</span>
              <ArrowRight className="w-4 h-4" />
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-teal-700 block">
                Projected New Supply
              </span>
              <span className="font-black text-base text-teal-900">
                {projectedRemaining} {units}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block">
                (~{projectedDaysRemaining} days of supply)
              </span>
            </div>
          </div>
        )}

        {/* Pharmacy Name & Prescription Rx # */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Dispensing Pharmacy *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Walgreens, CVS, Clinic Outpatient"
              value={pharmacyName}
              onChange={(e) => setPharmacyName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Prescription Rx Number
            </label>
            <input
              type="text"
              placeholder="e.g. RX-948102"
              value={rxNumber}
              onChange={(e) => setRxNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Refill Date & New Expiry Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Date Refilled *
            </label>
            <input
              type="date"
              required
              value={refillDate}
              onChange={(e) => setRefillDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              New Batch Expiry Date
            </label>
            <input
              type="date"
              value={newExpiryDate}
              onChange={(e) => setNewExpiryDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>
        </div>

        {/* Cost & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Copay / Cost ($)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Refill Notes
            </label>
            <input
              type="text"
              placeholder="e.g. 90-day mail order, insurance approved"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="accent" loading={loading} icon={ShoppingBag}>
            Save Refill & Notify Caregivers
          </Button>
        </div>
      </form>
    </Modal>
  );
}
