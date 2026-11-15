import Card from '../common/Card';
import Badge from '../common/Badge';
import {
  MapPin,
  KeyRound,
  Siren,
  Phone
} from 'lucide-react';
import { useCare } from '../../context/CareContext';

export default function EmergencyQuickCard() {
  const { activePatient, setIsSosModalOpen, isSosActive, emergencyContacts } = useCare();

  const primaryContact = emergencyContacts.find(c => c.is_primary) || emergencyContacts[0];

  return (
    <Card
      className={`p-6 border transition-all ${
        isSosActive
          ? 'border-[#DC5555] bg-rose-50/70 shadow-md shadow-rose-950/10'
          : 'border-slate-200/80 bg-white'
      }`}
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-[#DC5555] flex items-center justify-center">
            <Siren className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#142B4A]">Emergency SOS Center</h3>
            <p className="text-xs text-[#718096]">Rapid family & responder broadcast</p>
          </div>
        </div>

        <Badge variant={isSosActive ? 'danger' : 'default'} size="sm">
          {isSosActive ? 'BEACON ACTIVE' : 'Standby'}
        </Badge>
      </div>

      <div className="space-y-4 mt-4">
        {/* Address & Access Code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#F6F8FC] border border-slate-200/80 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#DC5555] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#172B4D] block">Home Address:</span>
              <span className="text-[#718096] text-[11px] leading-tight block truncate max-w-[130px]">
                {activePatient.homeAddress}
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#F6F8FC] border border-slate-200/80 flex items-start gap-2">
            <KeyRound className="w-4 h-4 text-[#E9A23B] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#172B4D] block">Lockbox Code:</span>
              <span className="font-mono font-bold text-xs text-[#172B4D] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                {activePatient.lockboxCode}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Contact Bar */}
        {primaryContact && (
          <div className="p-3 rounded-xl bg-[#F6F8FC] border border-slate-200/80 flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#718096] tracking-wider block">
                Primary Contact
              </span>
              <p className="text-xs font-bold text-[#142B4A] truncate">{primaryContact.name}</p>
              <p className="text-[11px] text-[#718096]">{primaryContact.relationship} • {primaryContact.phone}</p>
            </div>
            <a
              href={`tel:${primaryContact.phone}`}
              className="p-2 rounded-xl bg-[#EAF3FC] text-[#142B4A] hover:bg-[#D8EAFC] transition-colors shrink-0"
              title="Call primary contact"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* SOS Action Button */}
        <button
          onClick={() => setIsSosModalOpen(true)}
          className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
            isSosActive
              ? 'bg-[#DC5555] hover:bg-rose-700 text-white animate-pulse'
              : 'bg-[#DC5555] hover:bg-rose-700 text-white active:scale-95'
          }`}
        >
          <Siren className="w-4 h-4" />
          <span>{isSosActive ? 'MANAGE ACTIVE SOS BEACON' : 'TRIGGER EMERGENCY SOS'}</span>
        </button>
      </div>
    </Card>
  );
}
