import { Navigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabaseEnvDiagnostics } from '../../services/supabase';
import { HeartPulse, AlertTriangle, KeyRound, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';

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

          {/* Real-time Environment Diagnostics */}
          <div className="text-left bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2.5">
            <p className="text-slate-400 font-sans font-bold uppercase text-[10px] tracking-wider">
              Environment Variables Status
            </p>
            <div className="flex items-center justify-between font-mono py-1 border-b border-slate-100">
              <span className="text-slate-700 font-semibold">VITE_SUPABASE_URL</span>
              {supabaseEnvDiagnostics.hasUrl ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Detected
                </span>
              ) : (
                <span className="text-rose-600 font-bold flex items-center gap-1 text-[11px]">
                  <XCircle className="w-3.5 h-3.5 text-rose-500" /> Missing
                </span>
              )}
            </div>
            <div className="flex items-center justify-between font-mono py-1">
              <span className="text-slate-700 font-semibold">VITE_SUPABASE_PUBLISHABLE_KEY</span>
              {supabaseEnvDiagnostics.hasKey ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Detected
                </span>
              ) : (
                <span className="text-rose-600 font-bold flex items-center gap-1 text-[11px]">
                  <XCircle className="w-3.5 h-3.5 text-rose-500" /> Missing
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              Accepted keys: <code className="text-slate-700">VITE_SUPABASE_PUBLISHABLE_KEY</code> or <code className="text-slate-700">VITE_SUPABASE_ANON_KEY</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-left text-xs text-slate-700 space-y-1.5">
            <strong className="block text-[#142B4A] font-bold">Vercel Deployment Checklist:</strong>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600">
              <li>In Vercel, open <strong>Project Settings ➔ Environment Variables</strong>.</li>
              <li>Ensure variables are checked for the <strong>Production</strong> environment.</li>
              <li>Ensure values do not have surrounding quotation marks.</li>
              <li>Trigger a fresh deployment (git push or Deploy without build cache).</li>
            </ol>
          </div>

          <div className="space-y-2 pt-1">
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
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
            >
              Go to Login Page
            </Link>
          </div>
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
