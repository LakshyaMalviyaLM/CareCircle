import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { User, Phone, AlertCircle, Trash2 } from 'lucide-react';
import { useCare } from '../../context/CareContext';

export default function EditEmergencyContactModal({ isOpen, onClose, contact }) {
  const { updateEmergencyContact, deleteEmergencyContact } = useCare();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: 'Family Member',
    is_primary: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        phone: contact.phone || '',
        relationship: contact.relationship || 'Family Member',
        is_primary: Boolean(contact.is_primary ?? contact.isPrimary)
      });
      setError('');
    }
  }, [contact]);

  if (!contact) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Please provide both contact name and phone number.');
      return;
    }

    setLoading(true);

    try {
      await updateEmergencyContact(contact.id, {
        ...formData,
        patient_id: contact.patient_id,
        name: formData.name.trim(),
        phone: formData.phone.trim()
      });

      onClose();
    } catch (err) {
      console.error('Error updating emergency contact:', err);
      setError(err.message || 'Failed to update contact.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to remove ${contact.name} from emergency contacts?`)) {
      setLoading(true);
      try {
        await deleteEmergencyContact(contact.id);
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to delete contact.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Emergency Contact"
      subtitle={`Update contact details for ${contact.name}`}
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

        <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleDelete}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Contact
          </button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Updates'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
