import React, { useState } from 'react';
import { useCare } from '../context/CareContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import AddAppointmentModal from '../components/appointments/AddAppointmentModal';
import EditAppointmentModal from '../components/appointments/EditAppointmentModal';
import AppointmentDetailsModal from '../components/appointments/AppointmentDetailsModal';
import ConfirmModal from '../components/common/ConfirmModal';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  Video,
  Car,
  FileText,
  User,
  CheckCircle2,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Bell,
  Stethoscope,
  Calendar
} from 'lucide-react';

export default function AppointmentsPage() {
  const { activePatient, appointments, deleteAppointment, updateAppointment } = useCare();

  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'clinic' | 'telehealth'

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [aptToDelete, setAptToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Split into upcoming and past
  const now = new Date();
  const isPast = (apt) => {
    if (apt.status === 'Completed' || apt.status === 'Cancelled') return true;
    if (apt.appointmentDate) {
      const d = new Date(apt.appointmentDate);
      return !isNaN(d.getTime()) && d.getTime() < now.getTime() - 24 * 60 * 60 * 1000;
    }
    return false;
  };

  const upcomingApts = appointments.filter((a) => !isPast(a));
  const pastApts = appointments.filter((a) => isPast(a));

  const tabList =
    activeTab === 'upcoming'
      ? upcomingApts
      : activeTab === 'past'
      ? pastApts
      : appointments;

  // Filter & Search
  const filteredAppointments = tabList.filter((apt) => {
    const doctorStr = (apt.doctor || apt.doctor_name || '').toLowerCase();
    const specialtyStr = (apt.specialty || '').toLowerCase();
    const facilityStr = (apt.facility || apt.location || '').toLowerCase();
    const notesStr = (apt.notes || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      doctorStr.includes(q) ||
      specialtyStr.includes(q) ||
      facilityStr.includes(q) ||
      notesStr.includes(q);

    const matchesType =
      typeFilter === 'all'
        ? true
        : typeFilter === 'telehealth'
        ? apt.type === 'Telehealth' || Boolean(apt.telehealthLink)
        : apt.type !== 'Telehealth' && !apt.telehealthLink;

    return matchesSearch && matchesType;
  });

  const getDateParts = (apt) => {
    const raw = apt.appointmentDate || apt.date;
    const d = raw ? new Date(raw) : new Date();
    if (isNaN(d.getTime())) {
      return { day: 'Vis', date: '•', month: 'Appt' };
    }
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' })
    };
  };

  const handleDeleteConfirm = async () => {
    if (!aptToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteAppointment(aptToDelete.id);
      setIsDeleteOpen(false);
      setAptToDelete(null);
    } catch (err) {
      console.error('Failed to delete appointment:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleQuickComplete = async (apt) => {
    try {
      await updateAppointment(apt.id, {
        ...apt,
        status: 'Completed'
      });
    } catch (err) {
      console.error('Failed to mark complete:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#13A89E] uppercase tracking-wider">
              Clinical Schedule & Doctor Visits
            </span>
            <span className="text-xs text-slate-400">• {upcomingApts.length} upcoming visits</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight mt-1">
            Doctor & Therapy Appointments
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Coordinating specialist consultations, reminders, and clinic transportation for {activePatient.name}.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsAddOpen(true)}
          className="font-bold self-start sm:self-center shadow-sm"
        >
          Book Appointment
        </Button>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {[
            { id: 'upcoming', label: `Upcoming Visits (${upcomingApts.length})` },
            { id: 'past', label: `History & Completed (${pastApts.length})` },
            { id: 'all', label: `All Visits (${appointments.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#142B4A] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Modality Controls */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Search doctor, clinic, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:ring-2 focus:ring-[#13A89E]"
          >
            <option value="all">All Modalities</option>
            <option value="clinic">In-Clinic Only</option>
            <option value="telehealth">Telehealth Video</option>
          </select>
        </div>
      </div>

      {/* Appointment Cards List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card className="p-12 text-center text-slate-400">
            <CalendarDays className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
            <h4 className="text-base font-bold text-slate-700 mt-3">No appointments found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'No appointments match your search criteria. Try a different query.'
                : activeTab === 'upcoming'
                ? 'No upcoming appointments scheduled for this patient. Click "Book Appointment" to add one.'
                : 'No historical appointments recorded yet.'}
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={() => setIsAddOpen(true)}
              >
                Schedule New Visit
              </Button>
            </div>
          </Card>
        ) : (
          filteredAppointments.map((apt) => {
            const isTelehealth = apt.type === 'Telehealth' || Boolean(apt.telehealthLink);
            const isCompleted = apt.status === 'Completed';
            const isCancelled = apt.status === 'Cancelled';
            const dateParts = getDateParts(apt);
            const reminder = apt.reminder;

            return (
              <Card
                key={apt.id}
                className="p-5 sm:p-6 transition-all hover:border-slate-300 hover:shadow-xs rounded-2xl"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                  {/* Left Column: Date block and Clinical Visit Details */}
                  <div className="flex items-start gap-4 sm:gap-5 w-full">
                    {/* Date Badge Block */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#EAF3FC] text-[#142B4A] flex flex-col items-center justify-center shrink-0 border border-blue-200/60 shadow-2xs">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#13A89E]">
                        {dateParts.day}
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-[#142B4A] leading-none my-0.5">
                        {dateParts.date}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {dateParts.month}
                      </span>
                    </div>

                    {/* Visit Information */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-[#142B4A] truncate">
                          {apt.doctor || apt.doctor_name}
                        </h3>

                        <Badge
                          variant={isTelehealth ? 'accent' : 'primary'}
                          size="sm"
                        >
                          {isTelehealth ? (
                            <>
                              <Video className="w-3 h-3 text-[#13A89E]" /> Telehealth
                            </>
                          ) : (
                            'In-Clinic Visit'
                          )}
                        </Badge>

                        <Badge
                          variant={
                            isCompleted
                              ? 'success'
                              : isCancelled
                              ? 'danger'
                              : 'default'
                          }
                          size="sm"
                        >
                          {apt.status}
                        </Badge>

                        {/* Visual Reminder Indicator */}
                        {reminder?.text && !isCompleted && !isCancelled && (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                              reminder.badgeVariant === 'danger'
                                ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                                : reminder.badgeVariant === 'warning'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-teal-50 text-teal-800 border-teal-200'
                            }`}
                          >
                            <Bell className="w-3 h-3" />
                            {reminder.text}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-[#13A89E] flex items-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5" />
                        {apt.specialty}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {apt.time || '10:00 AM'}
                        </span>
                        {(apt.facility || apt.location) && (
                          <span className="flex items-center gap-1.5 text-slate-600 truncate max-w-xs sm:max-w-md">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {apt.facility || apt.location}
                          </span>
                        )}
                        {apt.caregiverAssigned && (
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            Caregiver: {apt.caregiverAssigned}
                          </span>
                        )}
                      </div>

                      {/* Clinical Preparation Notes */}
                      {apt.notes && (
                        <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Prep Notes:</strong> {apt.notes}
                          </span>
                        </div>
                      )}

                      {/* Senior Transportation Coordination */}
                      {apt.transportNeeded && (
                        <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
                          <Car className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            Transportation coordination active: Family driver assigned ({apt.caregiverAssigned || 'Sarah Jenkins'}).
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0 w-full sm:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {/* Telehealth Video Call link */}
                    {isTelehealth && apt.telehealthLink && (
                      <a
                        href={apt.telehealthLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#13A89E] hover:bg-[#0F8C83] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Call
                      </a>
                    )}

                    {/* Quick Complete Button */}
                    {!isCompleted && !isCancelled && (
                      <button
                        onClick={() => handleQuickComplete(apt)}
                        className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Mark Visit Completed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Done
                      </button>
                    )}

                    {/* View Details */}
                    <button
                      onClick={() => {
                        setSelectedApt(apt);
                        setIsDetailsOpen(true);
                      }}
                      className="p-2 text-slate-500 hover:text-[#142B4A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => {
                        setSelectedApt(apt);
                        setIsEditOpen(true);
                      }}
                      className="p-2 text-slate-500 hover:text-[#13A89E] hover:bg-teal-50 rounded-xl transition-colors cursor-pointer"
                      title="Edit Appointment"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        setAptToDelete(apt);
                        setIsDeleteOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete Appointment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Appointment Modal */}
      <AddAppointmentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      {/* Edit Appointment Modal */}
      <EditAppointmentModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedApt(null);
        }}
        appointment={selectedApt}
      />

      {/* View Appointment Details Modal */}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setAptToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Cancel & Delete Appointment"
        message={`Are you sure you want to delete the scheduled appointment with ${
          aptToDelete?.doctor || aptToDelete?.doctor_name || 'this doctor'
        }? This will remove it from the clinical calendar.`}
        confirmText="Yes, Delete Appointment"
        cancelText="Keep Appointment"
        loading={deleteLoading}
        variant="danger"
      />
    </div>
  );
}
