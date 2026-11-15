import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { User, Phone, HeartHandshake, AlertCircle, Shield } from 'lucide-react';
import { useCare } from '../../context/CareContext';

export default function AddEmergencyContactModal({ isOpen, onClose }) {
  const { addEmergencyContact } = useCare();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: 'Family Member',
    is_primary: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Please provide both a contact name and phone number.');
      return;
    }

    setLoading(true);

    try {
      await addEmergencyContact({
        ...formData,
        name: formData.name.trim(),
        phone: formData.phone.trim()
      });

      onClose();
      setFormData({
        name: '',
        phone: '',
        relationship: 'Family Member',
        is_primary: false
      });
    } catch (err) {
      console.error('Error adding emergency contact:', err);
      setError(err.message || 'Failed to add emergency contact.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Emergency Contact"
      subtitle="Save an immediate family responder or attending physician"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Contact Full Name *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Sarah Jenkins, Dr. Miller"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Phone Number *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              required
              placeholder="(555) 234-5678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Relationship
          </label>
          <select
            value={formData.relationship}
            onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none bg-white font-medium"
          >
            <option value="Daughter / Primary Caregiver">Daughter / Primary Caregiver</option>
            <option value="Son">Son</option>
            <option value="Spouse">Spouse / Partner</option>
            <option value="Attending Physician">Attending Physician / Doctor</option>
            <option value="Home Health Nurse">Home Health Nurse</option>
            <option value="Neighbor / Close Friend">Neighbor / Close Friend</option>
          </select>
        </div>

        {/* Primary Contact Toggle */}
        <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 flex items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-rose-950 block">Set as Primary Emergency Contact?</span>
            <span className="text-[11px] text-rose-700">First contact phoned during an emergency dispatch</span>
          </div>
          <input
            type="checkbox"
            checked={formData.is_primary}
            onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
            className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500 cursor-pointer"
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" size="md" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Emergency Contact'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
