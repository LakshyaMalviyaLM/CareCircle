import React, { useState } from 'react';
import { useCare } from '../context/CareContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import AddEmergencyContactModal from '../components/emergency/AddEmergencyContactModal';
import EditEmergencyContactModal from '../components/emergency/EditEmergencyContactModal';
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  KeyRound,
  Hospital,
  AlertTriangle,
  Siren,
  FileBadge,
  Phone,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Radio,
  Clock,
  UserCheck
} from 'lucide-react';
import { emergencyHotlines } from '../utils/mockData';

export default function EmergencyPage() {
  const {
    activePatient,
    setIsSosModalOpen,
    isSosActive,
    clearEmergencySos,
    emergencyContacts,
    deleteEmergencyContact,
    emergencyEventDetails
  } = useCare();

  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Accessible Emergency Command Hero Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl text-white shadow-md transition-all ${
          isSosActive
            ? 'bg-[#DC5555] border-4 border-white shadow-rose-950/40 animate-pulse'
            : 'bg-[#DC5555] border border-rose-700'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-xs">
              <Siren className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full text-white">
                  Rapid Emergency Center
                </span>
                {isSosActive && (
                  <span className="text-xs font-extrabold bg-white text-rose-800 px-3 py-1 rounded-full animate-bounce">
                    🚨 SOS BEACON ACTIVE
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight mt-1.5 text-white">
                Emergency & Medical SOS Hub
              </h1>
              <p className="text-xs sm:text-sm text-red-100 mt-1 max-w-xl font-medium">
                Rapid emergency broadcast for family responders, lockbox entry authorization, and vital clinical ID for {activePatient.name}.
              </p>
            </div>
          </div>

          {/* Large, Easily Accessible SOS Trigger Button & Call Emergency Services */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <a
              href="tel:112"
              className="min-h-[64px] px-6 py-4 rounded-2xl bg-slate-950 hover:bg-black text-white font-extrabold text-sm sm:text-base border-2 border-white/20 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2.5"
            >
              <PhoneCall className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Call Emergency Services (112)</span>
            </a>
            {isSosActive ? (
              <button
                onClick={clearEmergencySos}
                className="w-full sm:w-auto min-h-[64px] px-8 py-4 rounded-2xl bg-white hover:bg-rose-50 text-rose-800 font-black text-lg shadow-xl transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-3"
              >
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span>DEACTIVATE / MARK SAFE</span>
              </button>
            ) : (
              <button
                onClick={() => setIsSosModalOpen(true)}
                className="w-full sm:w-auto min-h-[68px] px-8 py-4 rounded-2xl bg-white hover:bg-rose-50 text-rose-700 font-black text-xl shadow-2xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-3 border-4 border-rose-300"
              >
                <ShieldAlert className="w-8 h-8 text-rose-600 animate-pulse" />
                <span>TRIGGER EMERGENCY SOS</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-time Confirmation Note */}
        {isSosActive && emergencyEventDetails?.isConfirmed && (
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center gap-2 text-xs font-bold text-white">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>
              Emergency broadcast verified and stored in database at {emergencyEventDetails.timestamp}. Family care circle notified.
            </span>
          </div>
        )}
      </div>

      {/* Section: Saved Emergency Contacts with Full Management */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-rose-600" />
              <h2 className="text-lg font-bold text-[#142B4A]">Saved Emergency Contacts</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Primary family responders and clinical contacts alerted during emergency dispatch
            </p>
          </div>

          <Button
            variant="danger"
            size="md"
            icon={Plus}
            onClick={() => setIsAddContactOpen(true)}
            className="font-bold self-start sm:self-center text-xs"
          >
            Add Emergency Contact
          </Button>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {emergencyContacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 ${
                contact.is_primary
                  ? 'bg-rose-50/60 border-rose-300 shadow-xs'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <Badge variant={contact.is_primary ? 'danger' : 'default'} size="sm">
                    {contact.is_primary ? 'Primary Contact' : 'Alternate Responder'}
                  </Badge>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedContact(contact);
                        setIsEditContactOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                      title="Edit Contact"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${contact.name} from emergency contacts?`)) {
                          deleteEmergencyContact(contact.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                      title="Delete Contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#142B4A] mt-2">{contact.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{contact.relationship}</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <a
                  href={`tel:${contact.phone.replace(/[^0-9]/g, '')}`}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call {contact.phone}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Grid: Medical ID Card + Paramedic Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medical ID Card (Spans 2 cols) */}
        <Card className="p-6 lg:col-span-2 space-y-5 border-2 border-slate-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <FileBadge className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#142B4A]">Emergency Medical ID & Clinical Alert</h3>
                <p className="text-xs text-slate-500">Critical reference for EMS paramedics and emergency room staff</p>
              </div>
            </div>
            <Badge variant="danger" size="sm">
              Critical ID
            </Badge>
          </div>

          {/* Patient Overview Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Patient Name</span>
              <span className="text-base font-bold text-[#142B4A]">{activePatient.name}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Blood Type</span>
              <span className="text-base font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded w-fit block mt-0.5">
                {activePatient.bloodType}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Date of Birth</span>
              <span className="text-sm font-semibold text-slate-700">{activePatient.dateOfBirth} (82 yrs)</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block">DNR Status</span>
              <span className="text-xs font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 block mt-0.5">
                Full Resuscitation
              </span>
            </div>
          </div>

          {/* Severe Allergies */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Severe Drug Allergies & Contraindications</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {activePatient.allergies.map((allergy, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-white text-rose-700 border border-rose-300 font-bold text-xs shadow-2xs"
                >
                  ⚠ {allergy}
                </span>
              ))}
            </div>
          </div>

          {/* Diagnosed Conditions & Surgical Notes */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Primary Diagnoses:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-[#142B4A] block">1. Essential Hypertension</span>
                <span className="text-slate-500 text-[11px]">Under Lisinopril 10mg daily regimen.</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-[#142B4A] block">2. Type 2 Diabetes Mellitus</span>
                <span className="text-slate-500 text-[11px]">Managed with Metformin ER 500mg BID. Non-insulin.</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Paramedic Access & Home Instructions */}
        <Card className="p-6 space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-[#142B4A]">First Responder Access</h3>
            <p className="text-xs text-slate-500">Quick property entry instructions</p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Home Address */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <MapPin className="w-4 h-4 text-[#13A89E]" />
                <span>Residential Address:</span>
              </div>
              <p className="text-slate-900 font-medium pl-5 text-sm">{activePatient.homeAddress}</p>
            </div>

            {/* Lockbox Code */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>Paramedic Lockbox Code:</span>
              </div>
              <div className="pl-5 pt-1">
                <span className="font-mono text-2xl font-black text-amber-950 bg-white px-3 py-1 rounded-lg border border-amber-300 shadow-2xs inline-block">
                  {activePatient.lockboxCode}
                </span>
                <p className="text-[11px] text-amber-800 mt-1">Mounted on front porch railing to the left of the door.</p>
              </div>
            </div>

            {/* Receiving Hospital */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#142B4A]">
                <Hospital className="w-4 h-4 text-blue-600" />
                <span>Preferred Emergency Department:</span>
              </div>
              <p className="text-slate-700 font-medium pl-5 text-xs">{activePatient.preferredHospital}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Emergency Phone Hotline Directory */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#142B4A]">Emergency Calling Directory</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {emergencyHotlines.map((hotline) => (
            <Card key={hotline.id} className="p-5 flex flex-col justify-between space-y-3 border-slate-200">
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant={hotline.primary ? 'danger' : 'default'} size="sm">
                    {hotline.primary ? 'Primary 112' : 'Hotline'}
                  </Badge>
                  <PhoneCall className={`w-4 h-4 ${hotline.primary ? 'text-red-600' : 'text-slate-400'}`} />
                </div>
                <h4 className="text-sm font-bold text-[#142B4A] mt-2.5">{hotline.title}</h4>
                {hotline.primary && (
                  <p className="text-xs font-bold text-rose-700 mt-1">
                    Emergency Number: {hotline.number}
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  {hotline.primary ? `Description: ${hotline.description}` : hotline.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <a
                  href={`tel:${hotline.number.replace(/[^0-9]/g, '')}`}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    hotline.primary
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-red-900/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-[#142B4A]'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{hotline.primary ? 'Call Emergency Services' : `Call ${hotline.number}`}</span>
                </a>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Modals */}
      <AddEmergencyContactModal
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
      />

      <EditEmergencyContactModal
        isOpen={isEditContactOpen}
        onClose={() => {
          setIsEditContactOpen(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
      />
    </div>
  );
}
