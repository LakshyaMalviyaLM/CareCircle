import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HeartPulse, AlertTriangle, KeyRound, ExternalLink } from 'lucide-react';

export default function ProtectedRoute() {
  const { user, loading, isConfigured } = useAuth();
  const location = useLocation();

  // If Supabase credentials are missing or invalid, display clear configuration message
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-amber-200 p-8 text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#142B4A]">Supabase Configuration Required</h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              CareCircle requires your Supabase project credentials to manage real clinical data and authentication.
            </p>
          </div>

          <div className="text-left bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2 font-mono">
            <p className="text-slate-400 font-sans font-bold uppercase text-[10px]">Add to your .env file:</p>
            <div className="text-slate-800 break-all">VITE_SUPABASE_URL=https://...supabase.co</div>
            <div className="text-slate-800 break-all">VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...</div>
          </div>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#142B4A] hover:bg-[#1E3E6B] text-white text-xs font-bold transition-all shadow-sm"
          >
            <KeyRound className="w-4 h-4 text-[#13A89E]" />
            <span>Open Supabase Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </a>
        </div>
      </div>
    );
  }

  // Loading state while checking active session
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center p-4 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#13A89E] to-teal-300 flex items-center justify-center shadow-lg shadow-teal-900/20 animate-pulse">
          <HeartPulse className="w-9 h-9 text-white stroke-[2.5]" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-[#142B4A]">CareCircle Security Check</h3>
          <p className="text-xs text-slate-400">Verifying authenticated session...</p>
        </div>
      </div>
    );
  }

  // Private route redirect if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
