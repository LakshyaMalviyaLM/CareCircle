import React, { useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import RequestConsultationModal from '../components/doctors/RequestConsultationModal';
import AddDoctorModal from '../components/doctors/AddDoctorModal';
import { useCare } from '../context/CareContext';
import {
  Stethoscope,
  Phone,
  Mail,
  Building2,
  Calendar,
  Clock,
  Video,
  Plus,
  Search,
  ShieldCheck
} from 'lucide-react';

export default function DoctorConnectPage() {
  const { doctors, appointments, activePatient } = useCare();

  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'consultations'
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [targetDoctor, setTargetDoctor] = useState(null);
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);

  // Extract unique specialties for filtering
  const specialties = ['All', ...new Set(doctors.map((d) => d.specialty.split(' ')[0]))];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(search.toLowerCase()) ||
      (doc.clinic_name && doc.clinic_name.toLowerCase().includes(search.toLowerCase()));

    const matchesSpecialty =
      selectedSpecialty === 'All' ? true : doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());

    return matchesSearch && matchesSpecialty;
  });

  const upcomingConsultations = appointments.filter(
    (a) => a.status === 'Upcoming' || a.status === 'Scheduled'
  );

  const pastConsultations = appointments.filter(
    (a) => a.status === 'Completed' || a.status === 'Past'
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#13A89E] uppercase tracking-wider">
              Clinical Team & Telehealth
            </span>
            <span className="text-xs text-slate-400">• {doctors.length} Attending Physicians</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight mt-1">
            Doctor Connect
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Physician directory, direct clinic hotlines, and appointment scheduling for {activePatient.name}.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            variant="outline"
            size="md"
            icon={Calendar}
            onClick={() => {
              setTargetDoctor(doctors[0] || null);
              setIsRequestModalOpen(true);
            }}
            className="font-bold border-teal-300 text-teal-900 bg-teal-50 hover:bg-teal-100"
          >
            Request Visit
          </Button>

          <Button
            variant="accent"
            size="md"
            icon={Plus}
            onClick={() => setIsAddDoctorOpen(true)}
            className="font-bold shadow-sm"
          >
            Add Physician
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'directory'
              ? 'border-[#13A89E] text-[#142B4A]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Physician Directory ({doctors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('consultations')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'consultations'
              ? 'border-[#13A89E] text-[#142B4A]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Consultations & Visits ({appointments.length})</span>
          {upcomingConsultations.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#13A89E] text-white text-[10px] font-extrabold">
              {upcomingConsultations.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: PHYSICIAN DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Search & Specialty Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="relative flex-1 md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search physician name, specialty, clinic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {specialties.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSpecialty === spec
                      ? 'bg-[#142B4A] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredDoctors.map((doc) => (
              <Card key={doc.id} className="p-6 transition-all hover:shadow-md flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Doctor Profile Header */}
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        doc.avatar_url ||
                        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=260'
                      }
                      alt={doc.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-2xs shrink-0"
                    />

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-base text-[#142B4A] leading-tight truncate">
                          {doc.name}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Certified
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-[#13A89E]">{doc.specialty}</p>

                      <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{doc.clinic_name}</span>
                      </p>
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.office_hours || 'Mon - Fri 9am-5pm'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {doc.telehealth_available ? (
                        <span className="text-teal-700 font-semibold flex items-center gap-1">
                          <Video className="w-3.5 h-3.5 text-[#13A89E]" /> Video Telehealth
                        </span>
                      ) : (
                        <span className="text-slate-500">In-Clinic Only</span>
                      )}
                    </div>
                  </div>

                  {doc.notes && (
                    <p className="text-xs text-slate-500 italic bg-blue-50/30 p-2.5 rounded-xl border border-blue-50">
                      "{doc.notes}"
                    </p>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${doc.phone}`}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                      title="Direct Phone Call"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{doc.phone}</span>
                    </a>

                    {doc.email && (
                      <a
                        href={`mailto:${doc.email}`}
                        className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                        title="Send Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <Button
                    variant="accent"
                    size="sm"
                    icon={Calendar}
                    onClick={() => {
                      setTargetDoctor(doc);
                      setIsRequestModalOpen(true);
                    }}
                    className="shadow-2xs font-bold"
                  >
                    Request Visit
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CONSULTATIONS & APPOINTMENTS HISTORY */}
      {activeTab === 'consultations' && (
        <div className="space-y-6">
          {/* Upcoming Consultations */}
          <Card className="p-6">
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#142B4A]">Upcoming Scheduled Consultations</h3>
                <p className="text-xs text-slate-500">Confirmed dates with attending clinicians.</p>
              </div>

              <Button
                variant="accent"
                size="sm"
                icon={Plus}
                onClick={() => {
                  setTargetDoctor(doctors[0] || null);
                  setIsRequestModalOpen(true);
                }}
              >
                Schedule New Visit
              </Button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {upcomingConsultations.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-medium mt-2">No upcoming consultations scheduled.</p>
                </div>
              ) : (
                upcomingConsultations.map((apt) => (
                  <div
                    key={apt.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 p-2.5 rounded-xl transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#13A89E] shrink-0">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#142B4A]">{apt.doctorName || apt.doctor}</h4>
                        <p className="text-xs font-semibold text-[#13A89E]">{apt.specialty}</p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {apt.appointmentDate || apt.date} at {apt.appointmentTime || apt.time}
                          </span>
                          <span>•</span>
                          <span>{apt.location || 'Clinic Suite'}</span>
                        </p>
                      </div>
                    </div>

                    <span className="self-start sm:self-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                      Confirmed Upcoming
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Past Consultations */}
          <Card className="p-6">
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#142B4A]">Completed Visits History</h3>
              <p className="text-xs text-slate-500">Historical records and clinical follow-up advice.</p>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {pastConsultations.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No past consultation logs found.
                </div>
              ) : (
                pastConsultations.map((apt) => (
                  <div key={apt.id} className="py-3.5 flex items-center justify-between text-xs text-slate-600">
                    <div>
                      <strong className="text-slate-800 font-bold block">{apt.doctorName || apt.doctor}</strong>
                      <span className="text-slate-500">{apt.specialty} • {apt.appointmentDate || apt.date}</span>
                    </div>
                    <span className="text-slate-400 italic">{apt.notes || 'Routine checkup completed'}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Emergency Physician Hotline Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-900 to-[#142B4A] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 font-bold text-[10px] tracking-wide border border-emerald-400/30">
              URGENT CLINICAL INQUIRY
            </span>
          </div>
          <h4 className="text-base font-extrabold text-white">Need Urgent Physician Advice?</h4>
          <p className="text-xs text-slate-300">
            Reach Dr. Robert Miller's hospital triage line for non-emergency clinical concerns.
          </p>
        </div>

        <a
          href="tel:(555)342-9911"
          className="px-4 py-2.5 rounded-xl bg-white text-[#142B4A] hover:bg-slate-100 font-extrabold text-xs flex items-center gap-2 shadow-sm shrink-0 transition-transform active:scale-95"
        >
          <Phone className="w-4 h-4 text-emerald-600" />
          <span>Call Physician Hotline (555) 342-9911</span>
        </a>
      </div>

      {/* Modals */}
      <RequestConsultationModal
        isOpen={isRequestModalOpen}
        onClose={() => {
          setIsRequestModalOpen(false);
          setTargetDoctor(null);
        }}
        targetDoctor={targetDoctor}
      />

      <AddDoctorModal
        isOpen={isAddDoctorOpen}
        onClose={() => setIsAddDoctorOpen(false)}
      />
    </div>
  );
}
