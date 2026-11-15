import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Stethoscope, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCare } from '../../context/CareContext';

export default function AddDoctorModal({ isOpen, onClose }) {
  const { addDoctor } = useCare();

  const [formData, setFormData] = useState({
    name: '',
    specialty: 'Cardiology',
    clinic_name: '',
    phone: '',
    emergency_phone: '',
    email: '',
    address: '',
    office_hours: 'Mon - Fri: 09:00 AM - 05:00 PM',
    telehealth_available: true,
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Please provide the doctor’s name and phone number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addDoctor(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setFormData({
          name: '',
          specialty: 'Cardiology',
          clinic_name: '',
          phone: '',
          emergency_phone: '',
          email: '',
          address: '',
          office_hours: 'Mon - Fri: 09:00 AM - 05:00 PM',
          telehealth_available: true,
          notes: ''
        });
      }, 1000);
    } catch (err) {
      console.error('Failed to add doctor:', err);
      setError(err.message || 'Could not save physician to directory.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Physician to Directory"
      subtitle="Connect specialist doctor details and clinic emergency contacts"
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
            <span>Doctor saved to patient directory!</span>
          </div>
        )}

        {/* Name and Specialty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Doctor Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Robert Miller, MD"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Medical Specialty *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Geriatric Medicine, Cardiology"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>
        </div>

        {/* Clinic and Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Clinic or Hospital Name
            </label>
            <input
              type="text"
              placeholder="e.g. St. Jude Heart Institute"
              value={formData.clinic_name}
              onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Clinic Phone Number *
            </label>
            <input
              type="tel"
              required
              placeholder="(555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>
        </div>

        {/* Email and Office Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Doctor / Clinic Email
            </label>
            <input
              type="email"
              placeholder="doctor@clinic.org"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Office Hours
            </label>
            <input
              type="text"
              placeholder="Mon - Fri: 09:00 AM - 05:00 PM"
              value={formData.office_hours}
              onChange={(e) => setFormData({ ...formData, office_hours: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>
        </div>

        {/* Clinic Address */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Clinic Physical Address
          </label>
          <input
            type="text"
            placeholder="120 Health Ave, Suite 300, City, State"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
          />
        </div>

        {/* Telehealth Toggle */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <input
            type="checkbox"
            id="telehealth-check"
            checked={formData.telehealth_available}
            onChange={(e) =>
              setFormData({ ...formData, telehealth_available: e.target.checked })
            }
            className="w-4 h-4 text-[#13A89E] rounded focus:ring-[#13A89E]"
          />
          <label htmlFor="telehealth-check" className="text-xs font-medium text-slate-700 cursor-pointer">
            Supports Online Telehealth Consultations (Video / Phone Reviews)
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="accent" loading={loading} icon={Stethoscope}>
            Save to Directory
          </Button>
        </div>
      </form>
    </Modal>
  );
}
