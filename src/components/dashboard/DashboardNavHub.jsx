import { Link } from 'react-router-dom';
import Card from '../common/Card';
import {
  Pill,
  HeartPulse,
  Calendar,
  Users2,
  TrendingUp,
  ShieldAlert,
  Stethoscope,
  Settings,
  ArrowRight
} from 'lucide-react';
import { useCare } from '../../context/CareContext';

export default function DashboardNavHub() {
  const {
    medications,
    appointments,
    careMembers,
    vitalsLogs,
    emergencyContacts,
    doctors
  } = useCare();

  const navItems = [
    {
      title: 'Medications',
      subtitle: `${medications.length} Prescriptions`,
      to: '/medications',
      icon: Pill,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      hoverBorder: 'hover:border-teal-300'
    },
    {
      title: 'Health Vitals',
      subtitle: `${vitalsLogs.length} Recorded Logs`,
      to: '/vitals',
      icon: HeartPulse,
      color: 'text-rose-500',
      bg: 'bg-rose-50',
      hoverBorder: 'hover:border-rose-300'
    },
    {
      title: 'Appointments',
      subtitle: `${appointments.filter(a => a.status === 'Upcoming').length} Upcoming Visits`,
      to: '/appointments',
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      hoverBorder: 'hover:border-blue-300'
    },
    {
      title: 'Care Circle',
      subtitle: `${careMembers?.length || 4} Connected Members`,
      to: '/care-circle',
      icon: Users2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      hoverBorder: 'hover:border-emerald-300'
    },
    {
      title: 'Analytics',
      subtitle: 'Routine Adherence',
      to: '/analytics',
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      hoverBorder: 'hover:border-purple-300'
    },
    {
      title: 'Emergency SOS',
      subtitle: `${emergencyContacts?.length || 3} Fast Responders`,
      to: '/emergency',
      icon: ShieldAlert,
      color: 'text-red-600',
      bg: 'bg-red-50',
      hoverBorder: 'hover:border-red-300'
    },
    {
      title: 'Doctor Connect',
      subtitle: `${doctors?.length || 3} Physicians`,
      to: '/doctors',
      icon: Stethoscope,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      hoverBorder: 'hover:border-indigo-300'
    },
    {
      title: 'Settings',
      subtitle: 'Preferences & Security',
      to: '/settings',
      icon: Settings,
      color: 'text-slate-600',
      bg: 'bg-slate-100',
      hoverBorder: 'hover:border-slate-300'
    }
  ];

  return (
    <Card className="p-5 sm:p-6 border border-slate-200/80">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-[#142B4A]">CareCircle Module Hub</h3>
          <p className="text-xs text-slate-400">Direct interactive access to all healthcare modules</p>
        </div>
        <span className="text-xs font-semibold text-slate-400">8 Modules Active</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-4">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              to={item.to}
              className={`p-3 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-all flex flex-col items-center text-center group shadow-2xs ${item.hoverBorder}`}
            >
              <div
                className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-2 group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#142B4A] group-hover:text-[#13A89E] transition-colors">
                {item.title}
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                {item.subtitle}
              </span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
