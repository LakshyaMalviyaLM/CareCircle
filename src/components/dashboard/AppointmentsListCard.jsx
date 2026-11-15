import React, { useState } from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import AppointmentDetailsModal from '../appointments/AppointmentDetailsModal';
import EditAppointmentModal from '../appointments/EditAppointmentModal';
import ConfirmModal from '../common/ConfirmModal';
import {
  CalendarDays,
  Clock,
  MapPin,
  Video,
  ChevronRight,
  Car,
  Bell,
  Stethoscope,
  Plus,
  Eye,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useCare } from '../../context/CareContext';
import { Link, useNavigate } from 'react-router-dom';

export default function AppointmentsListCard({ onAddClick }) {
  const { appointments, deleteAppointment } = useCare();
  const navigate = useNavigate();

  const [selectedApt, setSelectedApt] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [aptToDelete, setAptToDelete] = useState(null);

  const now = new Date();
  const upcomingList = appointments
    .filter((a) => {
      if (a.status === 'Completed' || a.status === 'Cancelled') return false;
      if (a.appointmentDate) {
        const d = new Date(a.appointmentDate);
        return isNaN(d.getTime()) || d.getTime() >= now.getTime() - 24 * 60 * 60 * 1000;
      }
      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.appointmentDate || a.date || 0).getTime();
      const timeB = new Date(b.appointmentDate || b.date || 0).getTime();
      const safeA = isNaN(timeA) ? 0 : timeA;
      const safeB = isNaN(timeB) ? 0 : timeB;
      return safeA - safeB;
    });

  const nextAppointment = upcomingList[0] || null;
  const otherUpcoming = upcomingList.slice(1, 3);

  const handleDeleteConfirm = async () => {
    if (!aptToDelete) return;
    try {
      await deleteAppointment(aptToDelete.id);
      setIsDeleteOpen(false);
      setAptToDelete(null);
    } catch (err) {
      console.error('Failed to delete appointment:', err);
    }
  };

  return (
    <>
      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EAF3FC] text-[#142B4A] flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#142B4A]">Doctor Appointments</h3>
              <p className="text-xs text-slate-500">Upcoming clinical visits & therapy</p>
            </div>
          </div>

          <Link
            to="/appointments"
            className="text-xs font-semibold text-[#13A89E] hover:text-[#0F8C83] flex items-center gap-1"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Next Appointment Spotlight / Feature Card */}
        {nextAppointment ? (
          <div className="mt-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#142B4A] to-[#1E3E6B] text-white shadow-sm relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-teal-400/10 blur-xl pointer-events-none" />

              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/15 text-teal-300 border border-teal-300/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-teal-300" /> Next Upcoming Visit
                </span>

                {/* Reminder Indicator Badge */}
                {nextAppointment.reminder?.text && (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      nextAppointment.reminder.urgency === 'high'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : nextAppointment.reminder.urgency === 'medium'
                        ? 'bg-amber-400 text-amber-950'
                        : 'bg-teal-500 text-white'
                    }`}
                  >
                    <Bell className="w-3 h-3" />
                    {nextAppointment.reminder.text}
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-extrabold text-white leading-tight">
                    {nextAppointment.doctor || nextAppointment.doctor_name}
                  </h4>
                  <p className="text-xs text-teal-200 font-semibold mt-0.5">
                    {nextAppointment.specialty}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedApt(nextAppointment);
                    setIsDetailsOpen(true);
                  }}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Date & Time Row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-200 mt-3 pt-3 border-t border-white/10">
                <span className="flex items-center gap-1 font-semibold text-white">
                  <Calendar className="w-3.5 h-3.5 text-teal-300" />
                  {nextAppointment.displayDate || nextAppointment.date}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-teal-300" />
                  {nextAppointment.time || '10:00 AM'}
                </span>
                {nextAppointment.facility && (
                  <span className="flex items-center gap-1 text-slate-300 truncate max-w-full">
                    <MapPin className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                    {nextAppointment.facility}
                  </span>
                )}
              </div>

              {/* Telehealth or Transport notice */}
              {nextAppointment.telehealthLink ? (
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-teal-200 flex items-center gap-1">
                    <Video className="w-3.5 h-3.5" /> Video Visit
                  </span>
                  <a
                    href={nextAppointment.telehealthLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 rounded-lg bg-[#13A89E] hover:bg-[#0F8C83] text-white text-xs font-bold transition-all shadow-xs"
                  >
                    Join Video
                  </a>
                </div>
              ) : nextAppointment.transportNeeded ? (
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-amber-200 bg-amber-400/10 px-2 py-1 rounded-md border border-amber-300/20">
                  <Car className="w-3.5 h-3.5 text-amber-300" />
                  <span>Ride coordination active with caregiver</span>
                </div>
              ) : null}
            </div>

            {/* Other Following Appointments */}
            {otherUpcoming.length > 0 && (
              <div className="divide-y divide-slate-100 mt-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider py-1">
                  Following Visits
                </div>
                {otherUpcoming.map((apt) => (
                  <div
                    key={apt.id}
                    className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2 -mx-2 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedApt(apt);
                      setIsDetailsOpen(true);
                    }}
                  >
                    <div>
                      <h5 className="text-xs font-bold text-[#142B4A]">
                        {apt.doctor || apt.doctor_name}
                      </h5>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {apt.specialty}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span className="font-semibold text-slate-700">
                          {apt.displayDate || apt.date}
                        </span>
                        <span>•</span>
                        <span>{apt.time}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge
                        variant={apt.type === 'Telehealth' ? 'accent' : 'primary'}
                        size="sm"
                      >
                        {apt.type === 'Telehealth' ? 'Telehealth' : 'In-Clinic'}
                      </Badge>
                      {apt.reminder?.text && (
                        <span className="text-[10px] font-bold text-teal-700">
                          {apt.reminder.text}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400">
            <CalendarDays className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
            <p className="text-sm font-medium mt-2">No upcoming appointments scheduled.</p>
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={onAddClick}
                className="text-xs"
              >
                Book Appointment
              </Button>
            </div>
          </div>
        )}

        {/* Footer Link / Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={onAddClick}
            className="text-xs font-semibold"
          >
            Book Visit
          </Button>

          <Link to="/appointments">
            <Button variant="secondary" size="sm" className="text-xs font-semibold">
              Manage All & Rides
            </Button>
          </Link>
        </div>
      </Card>

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedApt(null);
        }}
        appointment={selectedApt}
        onEdit={(apt) => {
          setSelectedApt(apt);
          setIsEditOpen(true);
        }}
        onDelete={(apt) => {
          setAptToDelete(apt);
          setIsDeleteOpen(true);
        }}
      />

      {/* Edit Modal */}
      <EditAppointmentModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedApt(null);
        }}
        appointment={selectedApt}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setAptToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Appointment"
        message={`Are you sure you want to delete the scheduled appointment with ${
          aptToDelete?.doctor || aptToDelete?.doctor_name || 'this doctor'
        }?`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
