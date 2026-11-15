import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  CalendarDays,
  Users2,
  ActivitySquare,
  Settings,
  HeartPulse,
  ShieldAlert,
  AlertTriangle,
  LogOut,
  Stethoscope,
  ShoppingBag,
  X
} from 'lucide-react';
import { useCare } from '../../context/CareContext';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { activePatient, medications, appointments, setIsSosModalOpen, isSosActive } = useCare();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pendingMedsCount = medications.filter((m) => m.status === 'pending').length;
  const upcomingAptsCount = appointments.filter((a) => a.status === 'Upcoming').length;
  const lowStockCount = medications.filter((m) => {
    const qty = Number(m.current_quantity ?? m.currentQuantity ?? 0);
    const threshold = Number(m.refill_threshold ?? m.refillThreshold ?? 5);
    return qty <= threshold;
  }).length;

  const currentSearch = location.search;
  const isRefillsActive = location.pathname === '/medications' && currentSearch.includes('tab=refills');
  const isMedicationsActive = location.pathname === '/medications' && !currentSearch.includes('tab=refills');

  const navItems = [
    {
      name: 'Overview',
      path: '/',
      icon: LayoutDashboard,
      badge: null,
      isActive: location.pathname === '/'
    },
    {
      name: 'Medications',
      path: '/medications',
      icon: Pill,
      badge: pendingMedsCount > 0 ? `${pendingMedsCount}` : null,
      badgeColor: 'bg-amber-100 text-amber-900',
      isActive: isMedicationsActive
    },
    {
      name: 'Medicine Refills',
      path: '/medications?tab=refills',
      icon: ShoppingBag,
      badge: lowStockCount > 0 ? `${lowStockCount}` : null,
      badgeColor: 'bg-rose-100 text-rose-800',
      isActive: isRefillsActive
    },
    {
      name: 'Health Vitals',
      path: '/vitals',
      icon: HeartPulse,
      badge: null,
      isActive: location.pathname === '/vitals'
    },
    {
      name: 'Appointments',
      path: '/appointments',
      icon: CalendarDays,
      badge: upcomingAptsCount > 0 ? `${upcomingAptsCount}` : null,
      badgeColor: 'bg-[#EAF3FC] text-[#142B4A]',
      isActive: location.pathname === '/appointments'
    },
    {
      name: 'Doctor Connect',
      path: '/doctors',
      icon: Stethoscope,
      badge: null,
      isActive: location.pathname === '/doctors'
    },
    {
      name: 'Care Circle',
      path: '/care-circle',
      icon: Users2,
      badge: null,
      isActive: location.pathname === '/care-circle'
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: ActivitySquare,
      badge: null,
      isActive: location.pathname === '/analytics'
    },
    {
      name: 'Emergency',
      path: '/emergency',
      icon: ShieldAlert,
      badge: isSosActive ? 'ALERT' : null,
      isEmergency: true,
      isActive: location.pathname === '/emergency'
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      badge: null,
      isActive: location.pathname === '/settings'
    }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Sign out error:', err);
      navigate('/login');
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#0B192C]/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 lg:w-68 bg-[#142B4A] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-[#1E3E6B]/60 shadow-xl lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar navigation"
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#13A89E] flex items-center justify-center shadow-md shadow-teal-950/30">
                <HeartPulse className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">
                    CareCircle
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#13A89E]/20 text-[#13A89E] border border-[#13A89E]/30">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-medium">Elderly Care & Vitals</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cared-For Patient Quick Summary Pill */}
          <div className="p-2.5 mx-3 my-2.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <img
                src={activePatient.avatar}
                alt={activePatient.name}
                className="w-9 h-9 rounded-full object-cover border border-[#13A89E] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-teal-300 font-bold tracking-wider uppercase">
                    Active Patient
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A37B] animate-pulse" />
                </div>
                <h4 className="text-xs font-bold text-white truncate">{activePatient.name}</h4>
                <p className="text-[10px] text-slate-300 truncate">
                  {activePatient.age} yrs • Blood {activePatient.bloodType}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links with Refined Spacing & Alignment */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                    item.isEmergency
                      ? item.isActive
                        ? 'bg-[#DC5555] text-white shadow-xs font-semibold'
                        : isSosActive
                        ? 'bg-rose-500/30 text-rose-200 border border-rose-500/50 animate-pulse'
                        : 'text-rose-300 hover:bg-rose-900/30 hover:text-rose-100'
                      : item.isActive
                      ? 'bg-[#13A89E] text-white shadow-xs font-semibold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                    <span className="truncate">{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        item.isEmergency
                          ? 'bg-[#DC5555] text-white'
                          : item.badgeColor || 'bg-white/20 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Compact SOS Action & User Profile */}
        <div className="p-3 border-t border-white/10 space-y-2 bg-[#0B192C]/90 shrink-0">
          {/* Compact SOS Button */}
          <button
            onClick={() => setIsSosModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold bg-[#DC5555] hover:bg-rose-700 active:scale-95 text-white transition-all shadow-xs cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>EMERGENCY SOS</span>
          </button>

          {/* User Profile Card */}
          <div className="p-2 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={
                    profile?.avatar_url ||
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'
                  }
                  alt={profile?.full_name || 'Caregiver'}
                  className="w-7 h-7 rounded-full object-cover border border-[#13A89E]/50 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">
                    {profile?.full_name || user?.user_metadata?.full_name || 'Caregiver'}
                  </p>
                  <p className="text-[10px] text-slate-300 truncate">
                    {user?.email || 'caregiver@carecircle.health'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-300" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
