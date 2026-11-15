import React, { useState } from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import MedicationDetailsModal from '../medications/MedicationDetailsModal';
import {
  Pill,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Eye,
  XCircle,
  Volume2
} from 'lucide-react';
import { useCare } from '../../context/CareContext';
import { useNavigate } from 'react-router-dom';
import voiceService from '../../services/voiceService';

export default function MedicationScheduleCard({ onAddClick }) {
  const { medications, toggleMedicationStatus, deleteMedication, preferredLanguage } = useCare();
  const [selectedSlot, setSelectedSlot] = useState('All');
  const [detailMed, setDetailMed] = useState(null);
  const [speakingMedId, setSpeakingMedId] = useState(null);
  const navigate = useNavigate();

  const slots = ['All', 'Morning', 'Afternoon', 'Evening', 'Bedtime'];

  const filteredMeds = selectedSlot === 'All'
    ? medications
    : medications.filter(m => (m.timeSlot || '').toLowerCase() === selectedSlot.toLowerCase());

  return (
    <>
      <Card className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#EAF3FC] text-[#142B4A] flex items-center justify-center">
                <Pill className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-[#142B4A]">Today's Medication Schedule</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Tap a dose to record administration in real-time.
            </p>
          </div>

          {/* Slot Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {slots.map(slot => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSlot === slot
                    ? 'bg-[#142B4A] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Medication List */}
        <div className="divide-y divide-slate-100 mt-2">
          {filteredMeds.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Pill className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <p className="text-sm font-medium mt-2">No medications scheduled for this period.</p>
            </div>
          ) : (
            filteredMeds.map((med) => {
              const isTaken = med.status === 'taken';
              const isMissed = med.status === 'missed';
              const isPending = med.status === 'pending';

              return (
                <div
                  key={med.id}
                  className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50/70 rounded-xl px-2.5 -mx-2.5"
                >
                  {/* Left pill details */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                        isTaken
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                          : isMissed
                          ? 'bg-rose-100 border-rose-300 text-rose-700'
                          : 'bg-[#EAF3FC] border-blue-200 text-[#142B4A]'
                      }`}
                    >
                      <Pill className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[#142B4A]">{med.name}</h4>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {med.dosage}
                        </span>
                        <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                          {med.timeSlot} ({med.timeScheduled})
                        </span>
                        {med.needsRefill && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Refill Soon ({med.pillsRemaining} left)
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <span className="font-medium text-slate-600">{med.purpose}</span>
                        <span>•</span>
                        <span className="italic">{med.instructions}</span>
                      </p>

                      {isTaken && (
                        <p className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Taken at {med.takenAt}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {/* Voice Read Instructions */}
                    <button
                      onClick={() => {
                        setSpeakingMedId(med.id);
                        voiceService.readMedicationInstructions(med, preferredLanguage);
                        setTimeout(() => setSpeakingMedId(null), 4000);
                      }}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        speakingMedId === med.id
                          ? 'bg-[#13A89E] text-white border-transparent animate-pulse'
                          : 'text-[#13A89E] hover:bg-teal-50 border-teal-100'
                      }`}
                      title={`Listen to instructions (${preferredLanguage === 'hi-IN' ? 'हिंदी' : 'English'})`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {/* View Details Button */}
                    <button
                      onClick={() => setDetailMed(med)}
                      className="p-1.5 text-slate-400 hover:text-[#142B4A] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {isTaken ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Completed
                        </span>
                        <button
                          onClick={() => toggleMedicationStatus(med.id, 'pending')}
                          title="Undo and set back to pending"
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleMedicationStatus(med.id, 'missed')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isMissed
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700'
                          }`}
                        >
                          {isMissed ? 'Flagged Missed' : 'Skip Dose'}
                        </button>

                        <button
                          onClick={() => toggleMedicationStatus(med.id, 'taken')}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#13A89E] hover:bg-[#0F8C83] text-white shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark as Taken
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Medication Details Modal for Dashboard */}
      <MedicationDetailsModal
        isOpen={Boolean(detailMed)}
        onClose={() => setDetailMed(null)}
        medication={detailMed}
        onEdit={() => {
          setDetailMed(null);
          navigate('/medications');
        }}
        onDelete={(m) => {
          if (window.confirm(`Are you sure you want to delete ${m.name}?`)) {
            deleteMedication(m.id);
            setDetailMed(null);
          }
        }}
      />
    </>
  );
}
