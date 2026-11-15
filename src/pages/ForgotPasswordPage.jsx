import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabaseProjectRef } from '../services/supabase';
import {
  HeartPulse,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  ExternalLink,
  Info
} from 'lucide-react';
import Button from '../components/common/Button';

export default function ForgotPasswordPage() {
  const { requestPasswordReset, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      await requestPasswordReset(cleanEmail);
      setSubmitted(true);
      setSubmittedEmail(cleanEmail);
    } catch (err) {
      console.error('Password reset request error:', err);
      const rawMessage = err.message || '';

      // If rate limit reached, notify clearly
      if (rawMessage.toLowerCase().includes('rate limit')) {
        setErrorMessage(
          'Supabase email rate limit reached (free tier allows ~3 emails/hour). Please wait a few minutes or configure custom SMTP in Supabase.'
        );
      } else {
        // According to OWASP & Requirement 13: do not expose whether an email is registered
        // If Supabase returns success or standard user_not_found, show generic safe success
        setSubmitted(true);
        setSubmittedEmail(cleanEmail);
      }
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
          Reset Your Password
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-[#718096] max-w-sm mx-auto">
          Enter your registered email address to receive a secure Supabase password recovery link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xs border border-slate-200/80 rounded-2xl">
          {/* Missing Keys Banner */}
          {!isConfigured && (
            <div className="mb-6 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block">Supabase Keys Missing</strong>
                <span>Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are defined in .env.</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block text-rose-900">Request Notice</span>
                <span className="text-rose-700 leading-relaxed">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Success State (Does not leak user existence) */}
          {submitted ? (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-emerald-950">Recovery Email Dispatched</h4>
                    <p className="mt-1 text-emerald-800 leading-relaxed">
                      If an account exists for <strong className="text-emerald-950 font-bold">{submittedEmail}</strong>, a password recovery email has been requested from Supabase.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/80 text-[11px] text-emerald-800 space-y-1">
                  <p className="font-semibold text-emerald-900">• Please check your inbox and spam folder.</p>
                  <p className="font-semibold text-emerald-900">• The recovery link will redirect you securely to reset your password.</p>
                </div>
              </div>

              {/* Supabase Dashboard Helpful Notice */}
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#142B4A]">
                  <Info className="w-3.5 h-3.5 text-[#13A89E]" />
                  <span>Supabase Email Notice</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Supabase free-tier sends emails via their built-in mail service (limit ~3/hr). For production scale, configure your custom SMTP provider under{' '}
                  <a
                    href={`https://supabase.com/dashboard/project/${supabaseProjectRef || 'kvzovehlvnuplhgurbjp'}/auth/providers`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#13A89E] font-bold underline inline-flex items-center gap-0.5"
                  >
                    <span>Supabase Email Settings</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  .
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                  }}
                  className="w-full text-xs font-semibold"
                >
                  Send to a different email address
                </Button>

                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#142B4A] hover:bg-[#1E3E6B] text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Login</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Forgot Password Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Account Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="caregiver@carecircle.app"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#13A89E] focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  We'll send a password recovery link to this email address.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading || !isConfigured}
                className="w-full font-bold shadow-md shadow-navy-950/20"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending Recovery Link...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Send Password Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#142B4A] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Security Trust Badge */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted with Supabase PKCE Authentication Security</span>
        </div>
      </div>
    </div>
  );
}
