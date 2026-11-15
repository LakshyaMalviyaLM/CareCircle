import React from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Button from '../common/Button';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
  Video,
  FileText,
  Car,
  CheckCircle2,
  Edit,
  Trash2,
  XCircle,
  ExternalLink,
  Bell
} from 'lucide-react';
import { useCare } from '../../context/CareContext';

export default function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment,
  onEdit,
  onDelete
}) {
  const { updateAppointment } = useCare();

  if (!appointment) return null;

  const isTelehealth = appointment.type === 'Telehealth' || Boolean(appointment.telehealthLink);
  const isCompleted = appointment.status === 'Completed';
  const isCancelled = appointment.status === 'Cancelled';
  const reminder = appointment.reminder;

  const handleStatusChange = async (newStatus) => {
    try {
      await updateAppointment(appointment.id, {
        ...appointment,
        status: newStatus
      });
      onClose();
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Appointment Details"
      subtitle={`${appointment.doctor || 'Doctor Visit'} • ${appointment.specialty}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Top Header Card */}
        <div className="p-4 rounded-2xl bg-[#EAF3FC]/80 border border-blue-200/60 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#142B4A] text-white flex items-center justify-center shadow-sm">
              <Stethoscope className="w-6 h-6 text-[#13A89E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#142B4A]">
                  {appointment.doctor || appointment.doctor_name}
                </h3>
              </div>
              <p className="text-xs font-semibold text-[#13A89E] mt-0.5">
                {appointment.specialty}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <Badge
              variant={
                isCompleted
                  ? 'success'
                  : isCancelled
                  ? 'danger'
                  : 'primary'
              }
              size="md"
            >
              {appointment.status}
            </Badge>

            {reminder?.text && !isCompleted && !isCancelled && (
              <Badge variant={reminder.badgeVariant || 'accent'} size="sm">
                <Bell className="w-3 h-3" />
                {reminder.text}
              </Badge>
            )}
          </div>
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#13A89E]" /> Scheduled Date
            </span>
            <p className="font-bold text-slate-800">
              {appointment.displayFullDate || appointment.displayDate || appointment.date}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#13A89E]" /> Visit Time
            </span>
            <p className="font-bold text-slate-800">
              {appointment.time || '10:00 AM'}
            </p>
          </div>
        </div>

        {/* Location / Telehealth */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            {isTelehealth ? (
              <Video className="w-4 h-4 text-[#13A89E]" />
            ) : (
              <MapPin className="w-4 h-4 text-[#13A89E]" />
            )}
            {isTelehealth ? 'Telehealth Consultation' : 'In-Clinic Facility & Address'}
          </span>

          <p className="text-slate-700 pl-5">
            {appointment.facility || appointment.location || 'Medical Clinic'}
          </p>

          {isTelehealth && appointment.telehealthLink && (
            <div className="pt-2 pl-5">
              <a
                href={appointment.telehealthLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#13A89E] hover:bg-[#0F8C83] text-white text-xs font-bold transition-all shadow-xs"
              >
                <Video className="w-3.5 h-3.5" />
                Join Video Call <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          )}
        </div>

        {/* Preparation Notes */}
        {appointment.notes && (
          <div className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-100 text-xs space-y-1">
            <span className="font-bold text-[#0F8C83] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Clinical Notes & Preparation
            </span>
            <p className="text-slate-700 leading-relaxed italic pl-5">
              {appointment.notes}
            </p>
          </div>
        )}

        {/* Transportation Arrangement */}
        <div className="p-3.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-800 block">Senior Ride Coordination</span>
              <span className="text-slate-500 text-[11px]">
                {appointment.transportNeeded
                  ? `Active: Family driver assigned (${appointment.caregiverAssigned || 'Sarah Jenkins'}).`
                  : 'No special transport required for this appointment.'}
              </span>
            </div>
          </div>
          <Badge variant={appointment.transportNeeded ? 'warning' : 'default'} size="sm">
            {appointment.transportNeeded ? 'Ride Needed' : 'Self / Arranged'}
          </Badge>
        </div>

        {/* Actions Footer */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isCompleted && (
              <Button
                variant="accent"
                size="sm"
                icon={CheckCircle2}
                onClick={() => handleStatusChange('Completed')}
                className="font-bold"
              >
                Mark Completed
              </Button>
            )}

            {!isCancelled && !isCompleted && (
              <Button
                variant="outline"
                size="sm"
                icon={XCircle}
                onClick={() => handleStatusChange('Cancelled')}
                className="text-rose-700 hover:bg-rose-50 border-rose-200"
              >
                Cancel Visit
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Edit}
              onClick={() => {
                onClose();
                onEdit(appointment);
              }}
            >
              Edit
            </Button>

            <Button
              variant="dangerOutline"
              size="sm"
              icon={Trash2}
              onClick={() => {
                onClose();
                onDelete(appointment);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
