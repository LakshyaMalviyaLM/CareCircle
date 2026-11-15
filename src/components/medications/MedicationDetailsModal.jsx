import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Button from '../common/Button';
import {
  Pill,
  Clock,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { useCare } from '../../context/CareContext';

export default function MedicationDetailsModal({
  isOpen,
  onClose,
  medication,
  onEdit,
  onDelete
}) {
  const { toggleMedicationStatus } = useCare();

  if (!medication) return null;

  const isTaken = medication.status === 'taken';
  const isMissed = medication.status === 'missed';
  const pillsRemaining = medication.pillsRemaining ?? medication.pills_remaining ?? 30;
  const totalPills = medication.totalPills ?? medication.total_pills ?? 30;
  const refillPercent = Math.round((pillsRemaining / totalPills) * 100);
  const needsRefill = pillsRemaining <= 5 || medication.needsRefill;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Medication Clinical Profile"
      subtitle={`${medication.name} ${medication.dosage} (${medication.form || medication.route_or_form || 'Tablet'})`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Top Header Card */}
        <div className="p-4 rounded-2xl bg-[#EAF3FC]/70 border border-blue-200/60 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#142B4A] text-white flex items-center justify-center shadow-sm">
              <Pill className="w-6 h-6 text-[#13A89E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#142B4A]">{medication.name}</h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white text-[#142B4A] border border-blue-200">
                  {medication.dosage}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {medication.form || medication.route_or_form || 'Tablet'} • {medication.frequency}
              </p>
            </div>
          </div>

          <Badge
            variant={isTaken ? 'success' : isMissed ? 'danger' : 'warning'}
            size="md"
          >
            {isTaken ? 'Taken Today' : isMissed ? 'Skipped' : 'Pending Dose'}
          </Badge>
        </div>

        {/* Schedule & Timing */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#13A89E]" /> Daily Schedule
            </span>
            <p className="font-bold text-slate-800">
              {medication.timeScheduled || medication.scheduled_times?.[0] || '08:00 AM'} ({medication.timeSlot || 'Morning'})
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#13A89E]" /> Therapy Dates
            </span>
            <p className="font-bold text-slate-800">
              From: {medication.start_date || medication.startDate || 'Active'}
              {medication.end_date || medication.endDate ? ` to ${medication.end_date || medication.endDate}` : ' (Continuous)'}
            </p>
          </div>
        </div>

        {/* Instructions & Purpose */}
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-700 block">Indication / Purpose:</span>
            <p className="text-slate-600">{medication.purpose || 'Prescribed for daily health maintenance.'}</p>
          </div>

          <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 space-y-1 text-slate-700">
            <span className="font-bold text-[#0F8C83] block flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Administration Guidelines:
            </span>
            <p className="italic">{medication.instructions || 'Take with water as directed by your clinician.'}</p>
          </div>

          {medication.doctor && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Prescribing Clinician: <strong className="text-slate-800">{medication.doctor || medication.prescribing_doctor}</strong></span>
            </div>
          )}
        </div>

        {/* Supply & Refill Progress */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Pharmacy Supply:</span>
            <span className={`font-extrabold ${needsRefill ? 'text-amber-700' : 'text-slate-700'}`}>
              {pillsRemaining} of {totalPills} doses remaining
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                needsRefill ? 'bg-amber-500' : 'bg-[#13A89E]'
              }`}
              style={{ width: `${refillPercent}%` }}
            />
          </div>
          {needsRefill && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 pt-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Low supply warning: Contact pharmacy for refill.</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isTaken ? (
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                onClick={() => {
                  toggleMedicationStatus(medication.id, 'pending');
                  onClose();
                }}
              >
                Reset to Pending
              </Button>
            ) : (
              <>
                <Button
                  variant="accent"
                  size="sm"
                  icon={CheckCircle2}
                  onClick={() => {
                    toggleMedicationStatus(medication.id, 'taken');
                    onClose();
                  }}
                  className="font-bold"
                >
                  Mark as Taken
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  icon={XCircle}
                  onClick={() => {
                    toggleMedicationStatus(medication.id, 'missed');
                    onClose();
                  }}
                  className="text-rose-700 hover:bg-rose-50 border-rose-200"
                >
                  Skip Dose
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Edit}
              onClick={() => {
                onClose();
                onEdit(medication);
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
                onDelete(medication);
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
