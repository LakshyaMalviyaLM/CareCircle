import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  ShieldAlert,
  Check,
  LogOut
} from 'lucide-react';
import { useCare } from '../../context/CareContext';
import { useAuth } from '../../context/AuthContext';
import NotificationCenterDrawer from '../notifications/NotificationCenterDrawer';

export default function Navbar({ onMenuClick }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const {
    patients,
    activePatientId,
    setActivePatientId,
    activePatient,
    searchQuery,
    setSearchQuery,
    notifications,
    setIsSosModalOpen,
    isSosActive,
    isLargeText,
    setIsLargeText
  } = useCare();

  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const patientDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(event.target)) {
        setIsPatientDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between transition-all">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 h-9 w-9 flex items-center justify-center text-[#172B4D] hover:text-[#142B4A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#718096]">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medications, inventory, appointments..."
            className="w-full h-9 pl-9 pr-9 text-xs bg-[#F6F8FC] border border-slate-200 rounded-xl text-[#172B4D] placeholder-[#718096] focus:outline-none focus:ring-2 focus:ring-[#13A89E]/40 focus:border-[#13A89E] focus:bg-white transition-all shadow-2xs"
          />
          <kbd className="absolute right-2.5 top-2 px-1.5 py-0.5 text-[9px] font-bold text-[#718096] bg-white border border-slate-200 rounded shadow-2xs">
            /
          </kbd>
        </div>
      </div>

      {/* Right Action Controls: All exactly h-9 aligned */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Patient Selector Dropdown */}
        <div className="relative" ref={patientDropdownRef}>
          <button
            onClick={() => setIsPatientDropdownOpen(!isPatientDropdownOpen)}
            className="h-9 flex items-center gap-2 px-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-[#F6F8FC] hover:bg-slate-100/80 transition-all text-left cursor-pointer"
            aria-expanded={isPatientDropdownOpen}
          >
            <img
              src={activePatient.avatar}
              alt={activePatient.name}
              className="w-6 h-6 rounded-full object-cover border border-[#13A89E]"
            />
            <div className="hidden md:block">
              <span className="block text-xs font-bold text-[#142B4A] leading-tight">
                {activePatient.name}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#718096]" />
          </button>

          {isPatientDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
                  Select Family Member
                </span>
              </div>
              {patients.map((pat) => (
                <button
                  key={pat.id}
                  onClick={() => {
                    setActivePatientId(pat.id);
                    setIsPatientDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-[#F6F8FC] transition-colors cursor-pointer ${
                    pat.id === activePatientId ? 'bg-[#EAF3FC]/80 font-bold' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={pat.avatar}
                      alt={pat.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="text-xs text-[#142B4A] font-bold leading-none">{pat.name}</p>
                      <p className="text-[10px] text-[#718096] mt-0.5">
                        Age {pat.age} • {pat.bloodType}
                      </p>
                    </div>
                  </div>
                  {pat.id === activePatientId && (
                    <Check className="w-4 h-4 text-[#13A89E]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Accessibility Font Size Toggle (A / A+) */}
        <button
          onClick={() => setIsLargeText(!isLargeText)}
          title={isLargeText ? 'Disable Large Text' : 'Enable Senior Accessible Text Size'}
          className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
            isLargeText
              ? 'bg-[#13A89E] text-white border-[#13A89E] shadow-2xs'
              : 'text-[#172B4D] hover:text-[#142B4A] bg-white border-slate-200 hover:bg-slate-50'
          }`}
          aria-label="Toggle text size"
        >
          <div className="flex items-center gap-0.5">
            <span className="text-[10px] font-bold leading-none">A</span>
            <span className="text-xs font-extrabold leading-none">A+</span>
          </div>
        </button>

        {/* Emergency SOS Quick Button */}
        <button
          onClick={() => setIsSosModalOpen(true)}
          className={`h-9 flex items-center gap-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
            isSosActive
              ? 'bg-[#DC5555] text-white animate-pulse'
              : 'bg-rose-50 hover:bg-rose-100 text-[#DC5555] border border-rose-200'
          }`}
          aria-label="Trigger SOS"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-[#DC5555]" />
          <span>SOS</span>
        </button>

        {/* Notification Center Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsNotifDropdownOpen(true)}
            className="h-9 w-9 flex items-center justify-center text-[#718096] hover:text-[#142B4A] hover:bg-slate-100 rounded-xl border border-slate-200 bg-white transition-colors relative cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#DC5555] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <NotificationCenterDrawer
            isOpen={isNotifDropdownOpen}
            onClose={() => setIsNotifDropdownOpen(false)}
          />
        </div>

        {/* User Profile Dropdown */}
        <div className="relative pl-1 border-l border-slate-200" ref={profileDropdownRef}>
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="h-9 flex items-center gap-2 px-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-expanded={isProfileDropdownOpen}
          >
            <img
              src={
                profile?.avatar_url ||
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'
              }
              alt={profile?.full_name || 'Caregiver'}
              className="w-7 h-7 rounded-full object-cover border border-slate-200"
            />
            <div className="hidden xl:block text-left">
              <span className="block text-xs font-bold text-[#142B4A] leading-tight">
                {profile?.full_name || user?.user_metadata?.full_name || 'Primary Caregiver'}
              </span>
              <span className="block text-[10px] text-[#13A89E] font-medium leading-tight capitalize">
                {profile?.role ? profile.role.replace('_', ' ') : 'Caregiver'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#718096] hidden xl:block" />
          </button>

          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-[#142B4A]">
                  {profile?.full_name || user?.user_metadata?.full_name || 'CareCircle User'}
                </p>
                <p className="text-[10px] text-[#718096] truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-[#13A89E] border border-teal-200">
                  {profile?.role || 'caregiver'}
                </span>
              </div>

              <a
                href="#/settings"
                onClick={() => setIsProfileDropdownOpen(false)}
                className="block px-4 py-2 text-xs text-[#172B4D] hover:bg-[#F6F8FC] hover:text-[#13A89E]"
              >
                Profile & Access Permissions
              </a>
              <a
                href="#/settings"
                onClick={() => setIsProfileDropdownOpen(false)}
                className="block px-4 py-2 text-xs text-[#172B4D] hover:bg-[#F6F8FC] hover:text-[#13A89E]"
              >
                Notification Preferences
              </a>

              <div className="border-t border-slate-100 my-1" />

              <div className="px-4 py-1.5 text-[11px] text-[#16A37B] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A37B] animate-pulse" />
                <span>Supabase Live Connected</span>
              </div>

              <div className="border-t border-slate-100 my-1" />

              <button
                onClick={async () => {
                  setIsProfileDropdownOpen(false);
                  await signOut();
                  navigate('/login');
                }}
                className="w-full text-left px-4 py-2 text-xs font-bold text-[#DC5555] hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
