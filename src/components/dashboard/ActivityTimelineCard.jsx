import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import {
  Clock,
  Pill,
  Activity,
  Calendar,
  FileText,
  AlertTriangle,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { useCare } from '../../context/CareContext';

export default function ActivityTimelineCard() {
  const { timeline } = useCare();

  const getIcon = (type, status) => {
    switch (type) {
      case 'medication':
        return <Pill className="w-4 h-4 text-emerald-600" />;
      case 'vitals':
        return <Activity className="w-4 h-4 text-blue-600" />;
      case 'visit':
        return <UserCheck className="w-4 h-4 text-teal-600" />;
      case 'prescription':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-slate-500" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'medication':
        return 'bg-emerald-50 border-emerald-200';
      case 'vitals':
        return 'bg-blue-50 border-blue-200';
      case 'visit':
        return 'bg-teal-50 border-teal-200';
      case 'prescription':
        return 'bg-amber-50 border-amber-200';
      case 'emergency':
        return 'bg-rose-100 border-rose-300';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-[#142B4A]">Family Activity Timeline</h3>
          <p className="text-xs text-slate-500">Live caregiver logging & clinical updates</p>
        </div>
        <Badge variant="primary" size="sm">
          Live Sync
        </Badge>
      </div>

      <div className="relative pl-6 space-y-6 mt-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {timeline.slice(0, 5).map((item) => (
          <div key={item.id} className="relative group">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 bg-white ${getIconBg(
                item.iconType
              )}`}
            >
              {getIcon(item.iconType, item.status)}
            </div>

            {/* Event Content */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#142B4A]">{item.action}</span>
                <span className="text-[11px] font-medium text-slate-400 shrink-0">
                  {item.timestamp}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
                <span className="font-semibold text-slate-600">{item.author}</span>
                <span>•</span>
                <span>{item.authorRole}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
