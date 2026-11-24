import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  KeyRound,
  AlertTriangle,
  X,
  CheckCircle2,
  Siren,
  Phone,
  Clock,
  Check
} from 'lucide-react';
import { useCare } from '../../context/CareContext';
import Button from '../common/Button';

export default function SosModal({ isOpen, onClose }) {
  const {
    activePatient,
    dispatchEmergencySos,
    isSosActive,
    clearEmergencySos,
    emergencyContacts,
    emergencyEventDetails
  } = useCare();

  const [countdown, setCountdown] = useState(5);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [dispatchConfirmed, setDispatchConfirmed] = useState(false);

  useEffect(() => {
    let timer;
    if (isCountingDown) {
      timer = setTimeout(() => {
        if (countdown > 1) {
          setCountdown((prev) => prev - 1);
        } else {
          dispatchEmergencySos();
          setIsCountingDown(false);
          setDispatchConfirmed(true);
          setCountdown(5);
        }
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [isCountingDown, countdown, dispatchEmergencySos]);

  const handleStartCountdown = () => {
    setIsCountingDown(true);
    setCountdown(5);
  };

  const handleCancelCountdown = () => {
    setIsCountingDown(false);
    setCountdown(5);
  };

  const handleDirectDispatch = () => {
    dispatchEmergencySos();
    setIsCountingDown(false);
    setDispatchConfirmed(true);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* High-Contrast Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isCountingDown) onClose();
        }}
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-rose-600 z-10 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        {/* Accessible High-Contrast Header */}
        <div className="bg-rose-700 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Siren className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <h3 id="sos-modal-title" className="text-xl font-black tracking-tight text-white">
                EMERGENCY SOS BEACON
              </h3>
              <p className="text-xs text-rose-100 font-medium">CareCircle Rapid Medical Dispatch System</p>
            </div>
          </div>
          {!isCountingDown && (
            <button
              onClick={onClose}
              aria-label="Close emergency modal"
              className="p-2 text-white hover:bg-white/20 rounded-xl cursor-pointer transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {isSosActive ? (
            /* Active Beacon State */
            <div className="space-y-4 text-center">
              <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-400 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <ShieldAlert className="w-9 h-9 animate-bounce text-rose-700" />
                </div>
                <h4 className="text-lg font-black text-rose-950">
                  🚨 EMERGENCY BEACON CURRENTLY BROADCASTING
                </h4>

                {/* Delivery confirmation verification */}
                <div className="p-2.5 rounded-xl bg-white border border-rose-200 text-xs font-semibold text-rose-900 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Emergency incident recorded in database at{' '}
                    {emergencyEventDetails?.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed max-w-sm mx-auto">
                  Alert sent for <strong>{activePatient.name}</strong>. Responders and care circle members have access to lockbox code and vital health records.
                </p>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      clearEmergencySos();
                      setDispatchConfirmed(false);
                      onClose();
                    }}
                    className="w-full font-black text-sm"
                  >
                    Mark Patient as Safe & Deactivate SOS
                  </Button>
                </div>
              </div>

              {/* Direct Calling options */}
              <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-2 text-left">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-black text-[#142B4A] text-sm">Call Emergency Services</span>
                  <span className="text-xs font-black bg-rose-600 text-white px-2.5 py-0.5 rounded-full">
                    Emergency Number: 112
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Description: India's Emergency Response Support
                </p>
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <a
                    href="tel:112"
                    className="py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <PhoneCall className="w-4 h-4 text-white" />
                    <span>Call Emergency Services</span>
                  </a>
                  <a
                    href={`tel:${emergencyContacts[0]?.phone || '112'}`}
                    className="py-3 px-3 rounded-xl border-2 border-slate-300 hover:bg-slate-100 text-[#142B4A] font-extrabold text-xs flex items-center justify-center gap-2 bg-white transition-colors truncate"
                  >
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Call Primary Contact</span>
                  </a>
                </div>
              </div>
            </div>
          ) : isCountingDown ? (
            /* 5-Second Countdown Screen */
            <div className="text-center py-6 space-y-5">
              <div
                aria-live="polite"
                className="w-28 h-28 mx-auto rounded-full bg-rose-50 border-4 border-rose-600 flex items-center justify-center text-rose-700 text-5xl font-black shadow-inner"
              >
                {countdown}
              </div>
              <div>
                <h4 className="text-2xl font-black text-[#142B4A]">
                  Broadcasting in {countdown} seconds...
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Alerting designated family responders and logging incident. Press Cancel if triggered by mistake.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleCancelCountdown}
                  className="w-full py-4 px-6 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-base shadow-md cursor-pointer transition-colors"
                >
                  CANCEL DISPATCH (I AM SAFE)
                </button>

                <button
                  onClick={handleDirectDispatch}
                  className="w-full py-2.5 text-xs font-bold text-rose-700 hover:underline cursor-pointer"
                >
                  Skip timer and send alert now &rarr;
                </button>
              </div>
            </div>
          ) : (
            /* Ready to Dispatch Screen */
            <div className="space-y-5">
              {/* Important Medical Disclaimer */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="block font-bold">Important Notice:</strong>
                  CareCircle records emergency incidents and alerts authorized care circle members. It does{' '}
                  <strong>NOT automatically call emergency services (112)</strong>. Call 112 directly if immediate life-saving medical help is needed.
                </div>
              </div>

              {/* Patient Emergency Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
                <img
                  src={activePatient.avatar}
                  alt={activePatient.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-300"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-base font-bold text-[#142B4A]">{activePatient.name}</h4>
                  <p className="text-xs text-slate-600">
                    Age {activePatient.age} • Blood Group {activePatient.bloodType} • {activePatient.primaryCondition}
                  </p>
                  <p className="text-[11px] font-bold text-rose-700 mt-0.5">
                    Allergies: {activePatient.allergies.join(', ')}
                  </p>
                </div>
              </div>

              {/* Location & Lockbox */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200">
                  <span className="text-[11px] font-bold text-[#142B4A] uppercase block flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#13A89E]" /> Home Address
                  </span>
                  <p className="text-slate-800 font-semibold mt-1 truncate">{activePatient.homeAddress}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
                  <span className="text-[11px] font-bold text-amber-900 uppercase block flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" /> Paramedic Lockbox
                  </span>
                  <p className="text-amber-950 font-mono font-black text-base mt-0.5">
                    {activePatient.lockboxCode}
                  </p>
                </div>
              </div>

              {/* Large, Easily Accessible SOS Confirmation Button */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleStartCountdown}
                  className="w-full min-h-[64px] py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black text-lg tracking-wide shadow-xl shadow-rose-900/30 flex items-center justify-center gap-3 transition-transform active:scale-98 cursor-pointer"
                >
                  <ShieldAlert className="w-7 h-7 text-white animate-pulse" />
                  <span>START 5-SECOND SOS BROADCAST</span>
                </button>

                {/* Direct Emergency Services (112) Calling Section */}
                <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-2 text-left">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-black text-[#142B4A] text-sm">Call Emergency Services</span>
                    <span className="text-xs font-black bg-rose-600 text-white px-2.5 py-0.5 rounded-full">
                      Emergency Number: 112
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Description: India's Emergency Response Support
                  </p>
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <a
                      href="tel:112"
                      className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-colors"
                    >
                      <PhoneCall className="w-4 h-4 text-white" />
                      <span>Call Emergency Services</span>
                    </a>
                    <a
                      href={`tel:${emergencyContacts[0]?.phone || '112'}`}
                      className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-50 text-[#142B4A] font-bold text-xs transition-colors truncate"
                    >
                      <Phone className="w-4 h-4 text-[#13A89E] shrink-0" />
                      <span className="truncate">Call {emergencyContacts[0]?.name || 'Caregiver'}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
