import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import {
  HeartPulse,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import Button from '../components/common/Button';

export default function ResetPasswordPage() {
  const { updateUserPassword, session, isRecoveryMode, setRecoverySession } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Verify and establish recovery session from URL or existing auth state
  useEffect(() => {
    let isMounted = true;

    async function checkRecoverySession() {
      setVerifyingSession(true);
      try {
        // A. Parse tokens from hash or search (e.g. #access_token=...&refresh_token=...&type=recovery)
        const fullUrl = window.location.href;
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#\/?/, '').replace(/^[^?#]*[?#]/, ''));
        const searchParams = new URLSearchParams(window.location.search);

        // Fallback manual hash fragment parsing if standard URLSearchParams doesn't capture embedded tokens
        let accessToken = searchParams.get('access_token') || hashParams.get('access_token');
        let refreshToken = searchParams.get('refresh_token') || hashParams.get('refresh_token');
        let type = searchParams.get('type') || hashParams.get('type');

        if (!accessToken && fullUrl.includes('access_token=')) {
          const matchAccess = fullUrl.match(/access_token=([^&]+)/);
          const matchRefresh = fullUrl.match(/refresh_token=([^&]+)/);
          const matchType = fullUrl.match(/type=([^&]+)/);
          if (matchAccess) accessToken = decodeURIComponent(matchAccess[1]);
          if (matchRefresh) refreshToken = decodeURIComponent(matchRefresh[1]);
          if (matchType) type = decodeURIComponent(matchType[1]);
        }

        // B. If recovery tokens exist in URL, establish session with Supabase
        if (accessToken && refreshToken) {
          console.info('[Supabase Auth] Found tokens in URL, setting recovery session');
          try {
            await setRecoverySession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            if (isMounted) {
              setHasValidSession(true);
              setVerifyingSession(false);
              return;
            }
          } catch (tokenErr) {
            console.warn('[Supabase Auth] Failed to set session from URL tokens:', tokenErr);
          }
        }

        // C. Check active Supabase session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (isMounted) {
          if (currentSession?.user || isRecoveryMode) {
            setHasValidSession(true);
          } else {
            setHasValidSession(false);
          }
        }
      } catch (err) {
        console.error('Error verifying recovery session:', err);
        if (isMounted) setHasValidSession(false);
      } finally {
        if (isMounted) setVerifyingSession(false);
      }
    }

    checkRecoverySession();

    return () => {
      isMounted = false;
    };
  }, [isRecoveryMode, setRecoverySession]);

  const passwordTooShort = password.length > 0 && password.length < 6;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const isFormValid = password.length >= 6 && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setLoading(true);

    try {
      // Calls supabase.auth.updateUser({ password: newPassword }) securely
      await updateUserPassword(password);
      setSuccessMessage('Your password has been successfully updated! Redirecting to login...');

      // Redirect user to login page after brief confirmation
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2500);
    } catch (err) {
      console.error('Password update error:', err);
      setErrorMessage(err.message || 'Failed to update password. Please try requesting a new reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#172B4D]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#142B4A] text-white shadow-md shadow-navy-900/20 mb-3 border border-[#1E3E6B]">
          <HeartPulse className="w-8 h-8 text-[#13A89E] stroke-[2.4]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight">
          Create New Password
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-[#718096] max-w-sm mx-auto">
          Choose a strong, secure password for your CareCircle account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xs border border-slate-200/80 rounded-2xl">
          {/* Verifying Session Loading State */}
          {verifyingSession ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#13A89E] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">Verifying secure recovery token...</p>
            </div>
          ) : !hasValidSession && !successMessage ? (
            /* Expired / Missing Recovery Token Banner */
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-amber-950">Recovery Link Expired or Invalid</h4>
                    <p className="mt-1 text-amber-800 leading-relaxed">
                      To protect your account, Supabase password reset links expire after a short period or once used.
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-amber-700 pt-1 border-t border-amber-200">
                  Please request a fresh reset link below.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/forgot-password"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#142B4A] hover:bg-[#1E3E6B] text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4 text-[#13A89E]" />
                  <span>Request New Reset Link</span>
                </Link>

                <Link
                  to="/login"
                  className="w-full py-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold text-center transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : successMessage ? (
            /* Success State */
            <div className="space-y-5 py-4 text-center animate-in fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#142B4A]">Password Reset Complete!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  {successMessage}
                </p>
              </div>
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#142B4A] hover:bg-[#1E3E6B] text-white text-xs font-bold transition-all shadow-sm"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#13A89E]" />
              </Link>
            </div>
          ) : (
            /* Password Reset Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password * (min 6 characters)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#13A89E] font-mono transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordTooShort && (
                  <p className="text-[11px] text-amber-600 font-semibold mt-1">
                    Password must be at least 6 characters.
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#13A89E] font-mono transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordsMismatch && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">
                    Passwords do not match.
                  </p>
                )}
                {confirmPassword && !passwordsMismatch && password.length >= 6 && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Passwords match!
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading || !isFormValid}
                  className="w-full font-bold shadow-md shadow-navy-950/20"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving New Password...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Update Password & Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </div>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#142B4A]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel and return to Login</span>
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Security Trust Badge */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Passwords are encrypted using bcrypt inside PostgreSQL</span>
        </div>
      </div>
    </div>
  );
}
