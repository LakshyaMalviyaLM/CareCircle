import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useCare } from '../../context/CareContext';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
  Video,
  FileText,
  Car,
  AlertCircle
} from 'lucide-react';

const COMMON_SPECIALTIES = [
  'Primary Care / Geriatrician',
  'Cardiology',
  'Neurology',
  'Endocrinology',
  'Ophthalmology',
  'Orthopedics',
  'Physical Therapy',
  'Pulmonology',
  'Nephrology',
  'General Dentistry'
];

export default function AddAppointmentModal({ isOpen, onClose }) {
  const { addAppointment } = useCare();

  const [formData, setFormData] = useState({
    doctor: '',
    specialty: 'Primary Care / Geriatrician',
    facility: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    type: 'In-Clinic',
    telehealthLink: '',
    notes: '',
    transportNeeded: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.doctor.trim()) {
      setError('Doctor name is required.');
      return;
    }

    if (!formData.specialty.trim()) {
      setError('Medical specialty or visit purpose is required.');
      return;
    }

    if (!formData.date) {
      setError('Appointment date is required.');
      return;
    }

    setLoading(true);

    try {
      await addAppointment({
        ...formData,
        doctor: formData.doctor.trim(),
        specialty: formData.specialty.trim(),
        facility: formData.facility.trim(),
        notes: formData.notes.trim(),
        telehealthLink: formData.telehealthLink.trim()
      });

      onClose();
      // Reset form
      setFormData({
        doctor: '',
        specialty: 'Primary Care / Geriatrician',
        facility: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        type: 'In-Clinic',
        telehealthLink: '',
        notes: '',
        transportNeeded: false
      });
    } catch (err) {
      console.error('Error adding appointment:', err);
      setError(err.message || 'Failed to schedule appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Doctor Visit"
      subtitle="Book a clinical consultation, therapy session, or specialist review"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Doctor Name & Specialty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Doctor / Clinician Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Robert Miller, MD"
                value={formData.doctor}
                onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Specialty / Department *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Stethoscope className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                list="specialties-list"
                placeholder="e.g. Cardiology"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
              />
              <datalist id="specialties-list">
                {COMMON_SPECIALTIES.map((spec) => (
                  <option key={spec} value={spec} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        {/* Date, Time & Visit Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Visit Date *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Scheduled Time *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Clock className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="10:00 AM"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Visit Modality
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none bg-white"
            >
              <option value="In-Clinic">In-Clinic Consultation</option>
              <option value="Telehealth">Telehealth Video Call</option>
              <option value="Home Visit">In-Home Clinical Visit</option>
            </select>
          </div>
        </div>

        {/* Location or Telehealth Link */}
        {formData.type === 'Telehealth' ? (
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Telehealth Video Link
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Video className="w-4 h-4" />
              </div>
              <input
                type="url"
                placeholder="https://meet.google.com/xyz or telehealth provider link"
                value={formData.telehealthLink}
                onChange={(e) => setFormData({ ...formData, telehealthLink: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Hospital / Clinic Facility & Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="e.g. St. Jude Heart Center, Suite 402, 100 Main St"
                value={formData.facility}
                onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Preparation Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Clinical Notes & Prep Instructions
          </label>
          <div className="relative">
            <textarea
              rows="2"
              placeholder="e.g. Fast 8 hours prior. Bring recent blood glucose & pressure logs. Questions to ask Dr. Miller."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>
        </div>

        {/* Transportation Checkbox */}
        <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-900 block">Senior Transportation Needed?</span>
              <span className="text-[11px] text-amber-700">Flag for family caregiver driver assignment</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={formData.transportNeeded}
            onChange={(e) => setFormData({ ...formData, transportNeeded: e.target.checked })}
            className="w-5 h-5 text-[#13A89E] rounded focus:ring-[#13A89E] cursor-pointer"
          />
        </div>

        {/* Form Actions */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" disabled={loading}>
            {loading ? 'Scheduling...' : 'Confirm Appointment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
