import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import {
  Calendar,
  Video,
  Building2,
  Home,
  Phone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCare } from '../../context/CareContext';

export default function RequestConsultationModal({
  isOpen,
  onClose,
  targetDoctor,
  onConsultationRequested
}) {
  const { doctors, requestConsultation } = useCare();

  const [selectedDoctorId, setSelectedDoctorId] = useState(
    targetDoctor?.id || doctors[0]?.id || ''
  );
  const [preferredDate, setPreferredDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [consultationMode, setConsultationMode] = useState('In-Person Clinic');
  const [reason, setReason] = useState('Routine 3-Month Follow-up & Medication Review');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (targetDoctor?.id) {
      setSelectedDoctorId(targetDoctor.id);
    } else if (!selectedDoctorId && doctors.length > 0) {
      setSelectedDoctorId(doctors[0].id);
    }

    // Default preferred date to 7 days from today
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const yyyy = nextWeek.getFullYear();
    const mm = String(nextWeek.getMonth() + 1).padStart(2, '0');
    const dd = String(nextWeek.getDate()).padStart(2, '0');
    setPreferredDate(`${yyyy}-${mm}-${dd}`);
  }, [targetDoctor, doctors, isOpen]);

  const activeDoc =
    doctors.find((d) => d.id === selectedDoctorId) || targetDoctor || doctors[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeDoc) return;

    setLoading(true);
    setError('');

    try {
      await requestConsultation({
        doctorId: activeDoc.id,
        doctorName: activeDoc.name,
        specialty: activeDoc.specialty,
        preferredDate,
        timeSlot,
        mode: consultationMode,
        reason,
        notes
      });

      setSuccess(true);
      if (onConsultationRequested) {
        onConsultationRequested();
      }

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to request consultation:', err);
      setError(err.message || 'Could not schedule doctor consultation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Doctor Consultation"
      subtitle="Schedule an appointment or telehealth review with your care team"
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
            <span>Consultation request submitted! Added to upcoming appointments.</span>
          </div>
        )}

        {/* Doctor Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Consulting Physician *
          </label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none bg-white font-medium"
            required
          >
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} — {doc.specialty}
              </option>
            ))}
          </select>
          {activeDoc && (
            <p className="text-[11px] text-slate-500 mt-1">
              Clinic: <strong>{activeDoc.clinic_name}</strong> • Phone: {activeDoc.phone}
            </p>
          )}
        </div>

        {/* Consultation Mode */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
            Consultation Mode *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'In-Person Clinic', label: 'In-Clinic', icon: Building2 },
              { id: 'Telehealth Video', label: 'Video Call', icon: Video },
              { id: 'Telephone', label: 'Phone Call', icon: Phone },
              { id: 'Home Visit', label: 'Home Visit', icon: Home }
            ].map((mode) => {
              const ModeIcon = mode.icon;
              const isSelected = consultationMode === mode.id;

              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setConsultationMode(mode.id)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#13A89E] bg-teal-50/70 text-[#142B4A] font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ModeIcon className={`w-4 h-4 ${isSelected ? 'text-[#13A89E]' : 'text-slate-400'}`} />
                  <span className="text-xs">{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date & Time Slot */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Preferred Date *
            </label>
            <input
              type="date"
              required
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Time Slot *
            </label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none bg-white font-medium"
            >
              <option value="09:00 AM">09:00 AM (Morning)</option>
              <option value="10:00 AM">10:00 AM (Morning)</option>
              <option value="11:30 AM">11:30 AM (Mid-Day)</option>
              <option value="02:00 PM">02:00 PM (Afternoon)</option>
              <option value="03:30 PM">03:30 PM (Afternoon)</option>
              <option value="04:30 PM">04:30 PM (Evening)</option>
            </select>
          </div>
        </div>

        {/* Reason for Consultation */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Reason for Visit / Chief Complaint *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Blood pressure titration, annual checkup, medication renewal"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Specific Symptoms / Questions for Doctor
          </label>
          <textarea
            rows="2"
            placeholder="e.g. Mild morning dizziness when standing. Also requesting lab order for HbA1c."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="accent" loading={loading} icon={Calendar}>
            Confirm Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
