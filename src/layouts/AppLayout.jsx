import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import SosModal from '../components/emergency/SosModal';
import VoiceAccessibilityBar from '../components/accessibility/VoiceAccessibilityBar';
import { useCare } from '../context/CareContext';
import { AlertOctagon, PhoneCall } from 'lucide-react';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isSosModalOpen, setIsSosModalOpen, isSosActive, clearEmergencySos, activePatient } = useCare();

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex text-[#172B4D] font-sans">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-68 transition-all">
        {/* Top Navbar */}
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Global Emergency Banner if SOS is active */}
        {isSosActive && (
          <div className="bg-[#DC5555] text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg z-20 animate-pulse">
            <div className="flex items-center gap-3">
              <AlertOctagon className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-sm font-black tracking-wide">EMERGENCY SOS BROADCAST ACTIVE</p>
                <p className="text-xs text-rose-100">
                  Critical alert dispatched for {activePatient.name}. Responders and family contacts notified.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="tel:911"
                className="bg-white text-[#DC5555] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-50 flex items-center gap-1.5 shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Call 911
              </a>
              <button
                onClick={clearEmergencySos}
                className="bg-black/30 hover:bg-black/50 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
              >
                Deactivate Alert
              </button>
            </div>
          </div>
        )}

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 sm:pb-28 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 py-4 px-6 text-center text-xs text-[#718096] bg-white/60">
          <p>© 2026 CareCircle Health Systems. Dignified Elderly Care & Medication Safety Platform.</p>
        </footer>
      </div>

      {/* Global SOS Modal Dialog */}
      <SosModal isOpen={isSosModalOpen} onClose={() => setIsSosModalOpen(false)} />

      {/* Senior Voice Accessibility Toolbar */}
      <VoiceAccessibilityBar />
    </div>
  );
}
