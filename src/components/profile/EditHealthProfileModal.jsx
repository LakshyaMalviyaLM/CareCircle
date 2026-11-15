import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import {
  Heart,
  Activity,
  AlertCircle,
  Plus,
  X,
  Hospital,
  Save,
  CheckCircle2,
  FileBadge
} from 'lucide-react';
import healthProfileService from '../../services/healthProfileService';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function EditHealthProfileModal({
  isOpen,
  onClose,
  patientId,
  initialData,
  onProfileUpdated
}) {
  const [formData, setFormData] = useState({
    blood_type: 'O+',
    primary_condition: '',
    allergies: [],
    existing_conditions: [],
    medical_history: [],
    home_address: '',
    lockbox_code: '',
    preferred_hospital: '',
    advance_directives: '',
    emergency_notes: '',
    weight_kg: 68.5
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newHistoryItem, setNewHistoryItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        blood_type: initialData.blood_type || initialData.bloodType || 'O+',
        primary_condition: initialData.primary_condition || initialData.primaryCondition || '',
        allergies: initialData.allergies || ['Penicillin', 'Sulfa Drugs'],
        existing_conditions: initialData.existing_conditions || [
          'Essential Hypertension (Stage 2)',
          'Type 2 Diabetes Mellitus',
          'Osteoarthritis (Bilateral Knees)'
        ],
        medical_history: initialData.medical_history || [
          'Total Hip Arthroplasty (Right) - 2021',
          'Cataract Surgery - 2019'
        ],
        home_address: initialData.home_address || initialData.homeAddress || '',
        lockbox_code: initialData.lockbox_code || initialData.lockboxCode || '',
        preferred_hospital: initialData.preferred_hospital || initialData.preferredHospital || '',
        advance_directives: initialData.advance_directives || '',
        emergency_notes: initialData.emergency_notes || '',
        weight_kg: initialData.weight_kg ?? initialData.weight ?? 68.5
      });
      setError('');
      setSuccess(false);
    }
  }, [initialData, isOpen]);

  // Tag helper handlers
  const handleAddAllergy = (e) => {
    e.preventDefault();
    if (!newAllergy.trim()) return;
    if (!formData.allergies.includes(newAllergy.trim())) {
      setFormData({ ...formData, allergies: [...formData.allergies, newAllergy.trim()] });
    }
    setNewAllergy('');
  };

  const handleRemoveAllergy = (item) => {
    setFormData({ ...formData, allergies: formData.allergies.filter((a) => a !== item) });
  };

  const handleAddCondition = (e) => {
    e.preventDefault();
    if (!newCondition.trim()) return;
    if (!formData.existing_conditions.includes(newCondition.trim())) {
      setFormData({
        ...formData,
        existing_conditions: [...formData.existing_conditions, newCondition.trim()]
      });
    }
    setNewCondition('');
  };

  const handleRemoveCondition = (item) => {
    setFormData({
      ...formData,
      existing_conditions: formData.existing_conditions.filter((c) => c !== item)
    });
  };

  const handleAddHistory = (e) => {
    e.preventDefault();
    if (!newHistoryItem.trim()) return;
    setFormData({
      ...formData,
      medical_history: [...formData.medical_history, newHistoryItem.trim()]
    });
    setNewHistoryItem('');
  };

  const handleRemoveHistory = (idx) => {
    setFormData({
      ...formData,
      medical_history: formData.medical_history.filter((_, i) => i !== idx)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { data, error: updateErr } = await healthProfileService.updateHealthProfile(
        patientId,
        formData
      );
      if (updateErr) throw updateErr;

      setSuccess(true);
      if (onProfileUpdated) {
        onProfileUpdated(data || formData);
      }
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to update health profile:', err);
      setError(err.message || 'Could not save health profile updates.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personal Health Profile & Clinical Parameters"
      subtitle="Comprehensive medical history, known allergies, blood group, and emergency access directives"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">Health profile updated and persisted to database!</span>
          </div>
        )}

        {/* 1. Core Biomarkers & Conditions */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#142B4A] uppercase tracking-wider">
            <Heart className="w-4 h-4 text-rose-600" />
            <span>Core Biomarkers & Primary Condition</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group *</label>
              <select
                value={formData.blood_type}
                onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#13A89E]"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    Blood {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Body Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                placeholder="68.5"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#13A89E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Diagnosis</label>
              <input
                type="text"
                placeholder="e.g. Hypertension & Dementia"
                value={formData.primary_condition}
                onChange={(e) => setFormData({ ...formData, primary_condition: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#13A89E]"
              />
            </div>
          </div>
        </div>

        {/* 2. Known Allergies */}
        <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-950 uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Drug & Environmental Allergies</span>
            </div>
            <span className="text-[11px] text-rose-700 font-medium">Critical safety warnings</span>
          </div>

          {/* Current Allergy Badges */}
          <div className="flex flex-wrap gap-1.5">
            {formData.allergies.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No known drug allergies reported.</span>
            ) : (
              formData.allergies.map((allg) => (
                <span
                  key={allg}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-xs font-bold text-rose-800 shadow-2xs"
                >
                  <span>{allg}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAllergy(allg)}
                    className="text-rose-400 hover:text-rose-700 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Add Allergy Input */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="e.g. Aspirin, Latex, Peanuts"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddAllergy(e);
                }
              }}
              className="flex-1 px-3 py-1.5 text-xs border border-rose-200 rounded-xl bg-white focus:ring-2 focus:ring-rose-500"
            />
            <Button type="button" variant="outline" size="sm" onClick={handleAddAllergy} className="text-xs font-bold shrink-0">
              <Plus className="w-3 h-3 mr-1" /> Add Allergy
            </Button>
          </div>
        </div>

        {/* 3. Existing Medical Conditions & Chronic Diagnoses */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#142B4A] uppercase tracking-wider">
              <Activity className="w-4 h-4 text-[#13A89E]" />
              <span>Existing Medical Conditions</span>
            </div>
            <span className="text-[11px] text-slate-500">Active diagnoses</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {formData.existing_conditions.map((cond) => (
              <span
                key={cond}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-2xs"
              >
                <span>{cond}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCondition(cond)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="e.g. Chronic Kidney Disease, Glaucoma"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCondition(e);
                }
              }}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#13A89E]"
            />
            <Button type="button" variant="outline" size="sm" onClick={handleAddCondition} className="text-xs font-bold shrink-0">
              <Plus className="w-3 h-3 mr-1" /> Add Condition
            </Button>
          </div>
        </div>

        {/* 4. Past Medical History (Surgeries & Hospitalizations) */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#142B4A] uppercase tracking-wider">
              <FileBadge className="w-4 h-4 text-[#142B4A]" />
              <span>Medical & Surgical History</span>
            </div>
            <span className="text-[11px] text-slate-500">Chronological past events</span>
          </div>

          <div className="space-y-1.5">
            {formData.medical_history.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs"
              >
                <span className="text-slate-700 font-medium">{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveHistory(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="e.g. Appendectomy - 2012"
              value={newHistoryItem}
              onChange={(e) => setNewHistoryItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddHistory(e);
                }
              }}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#13A89E]"
            />
            <Button type="button" variant="outline" size="sm" onClick={handleAddHistory} className="text-xs font-bold shrink-0">
              <Plus className="w-3 h-3 mr-1" /> Add Record
            </Button>
          </div>
        </div>

        {/* 5. Emergency Information & Access Directives */}
        <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/70 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#142B4A] uppercase tracking-wider">
            <Hospital className="w-4 h-4 text-[#13A89E]" />
            <span>Emergency Access & Clinical Directives</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lockbox Entry Code</label>
              <input
                type="text"
                placeholder="4829"
                value={formData.lockbox_code}
                onChange={(e) => setFormData({ ...formData, lockbox_code: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#13A89E]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Hospital Facility</label>
              <input
                type="text"
                placeholder="e.g. Springfield Memorial Hospital"
                value={formData.preferred_hospital}
                onChange={(e) => setFormData({ ...formData, preferred_hospital: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#13A89E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Residence Home Address</label>
            <input
              type="text"
              placeholder="742 Evergreen Terrace, Springfield"
              value={formData.home_address}
              onChange={(e) => setFormData({ ...formData, home_address: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#13A89E]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Advance Directives & DNR Orders</label>
            <textarea
              rows={2}
              placeholder="e.g. Full Code / DNR orders on file. Medical Power of Attorney held by Sarah Jenkins."
              value={formData.advance_directives}
              onChange={(e) => setFormData({ ...formData, advance_directives: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#13A89E]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Responder First Instructions</label>
            <textarea
              rows={2}
              placeholder="e.g. Ambulates with cane. Hard of hearing in left ear; speak loudly from the front."
              value={formData.emergency_notes}
              onChange={(e) => setFormData({ ...formData, emergency_notes: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#13A89E]"
            />
          </div>
        </div>

        {/* Modal Controls */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="accent" size="md" type="submit" disabled={loading} icon={Save} className="font-bold">
            {loading ? 'Saving Health Profile...' : 'Save Health Profile'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
