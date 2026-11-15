import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useCare } from '../../context/CareContext';
import {
  Calendar,
  Clock,
  Stethoscope,
  MapPin,
  Video,
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

function EditAppointmentForm({ appointment, onClose }) {
  const { updateAppointment } = useCare();

  const [formData, setFormData] = useState(() => ({
    doctor: appointment?.doctor || appointment?.doctor_name || '',
    specialty: appointment?.specialty || '',
    facility: appointment?.facility || appointment?.location || '',
    date: appointment?.date || (appointment?.appointmentDate ? appointment.appointmentDate.split('T')[0] : ''),
    time: appointment?.time || '10:00 AM',
    type: appointment?.type || (appointment?.telehealthLink ? 'Telehealth' : 'In-Clinic'),
    telehealthLink: appointment?.telehealthLink || '',
    notes: appointment?.notes || '',
    transportNeeded: Boolean(appointment?.transportNeeded),
    status: appointment?.status || 'Upcoming'
  }));

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
      setError('Specialty is required.');
      return;
    }

    if (!formData.date) {
      setError('Appointment date is required.');
      return;
    }

    setLoading(true);

    try {
      await updateAppointment(appointment.id, {
        ...formData,
        doctor: formData.doctor.trim(),
        specialty: formData.specialty.trim(),
        facility: formData.facility.trim(),
        notes: formData.notes.trim(),
        telehealthLink: formData.telehealthLink.trim()
      });

      onClose();
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError(err.message || 'Failed to update appointment. Please try again.');
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

      {/* Status Selector */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-slate-700 block">Appointment Status</span>
          <span className="text-[11px] text-slate-500">Update current visit workflow</span>
        </div>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-[#13A89E]"
        >
          <option value="Upcoming">Upcoming / Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Doctor Name */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
          Attending Clinician *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Stethoscope className="w-4 h-4" />
          </div>
          <input
            type="text"
            required
            value={formData.doctor}
            onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
            className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
          />
        </div>
      </div>

      {/* Specialty */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
          Specialty / Purpose *
        </label>
        <select
          value={formData.specialty}
          onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
          className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none bg-white"
        >
          {COMMON_SPECIALTIES.map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </select>
      </div>

      {/* Date & Time Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Date *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Time
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Clock className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Appointment Format: In-Clinic vs Telehealth */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
          Consultation Format
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'In-Clinic' })}
            className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              formData.type === 'In-Clinic'
                ? 'bg-[#142B4A] text-white border-[#142B4A] shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>In-Clinic Visit</span>
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'Telehealth' })}
            className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              formData.type === 'Telehealth'
                ? 'bg-[#142B4A] text-white border-[#142B4A] shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Telehealth Call</span>
          </button>
        </div>
      </div>

      {/* Facility / Location */}
      {formData.type === 'In-Clinic' ? (
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Clinic or Medical Facility
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={formData.facility}
              onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
              className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Video Consultation URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Video className="w-4 h-4" />
            </div>
            <input
              type="url"
              value={formData.telehealthLink}
              onChange={(e) => setFormData({ ...formData, telehealthLink: e.target.value })}
              className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Preparation Notes */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
          Clinical Notes & Preparation Guidelines
        </label>
        <div className="relative">
          <textarea
            rows="2"
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

      {/* Actions */}
      <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
        <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" size="md" type="submit" disabled={loading}>
          {loading ? 'Saving Changes...' : 'Save Updates'}
        </Button>
      </div>
    </form>
  );
}

export default function EditAppointmentModal({ isOpen, onClose, appointment }) {
  if (!appointment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Doctor Appointment"
      subtitle={`Modify scheduled visit details with ${appointment.doctor || 'Doctor'}`}
      maxWidth="max-w-xl"
    >
      <EditAppointmentForm key={appointment.id} appointment={appointment} onClose={onClose} />
    </Modal>
  );
}
