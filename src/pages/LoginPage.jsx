import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabaseProjectRef, supabaseProjectUrl } from '../services/supabase';
import {
  HeartPulse,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Info,
  Database
} from 'lucide-react';
import Button from '../components/common/Button';

export default function LoginPage() {
  const { signIn, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorType, setErrorType] = useState(null); // 'invalid_credentials' | 'unconfirmed_email' | 'rate_limit' | 'generic'

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setErrorType(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      await signIn(cleanEmail, password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('Supabase Login Error details:', err);
      const rawMessage = err.message || err.error_description || '';
      const errorCode = err.code || '';
      const errorStatus = err.status || 0;

      // Accurately classify Supabase error responses instead of assuming incorrect password
      if (
        rawMessage.toLowerCase().includes('email not confirmed') ||
        errorCode === 'email_not_confirmed'
      ) {
        setErrorType('unconfirmed_email');
        setErrorMessage(
          'Email not confirmed. Supabase requires email verification before login.'
        );
      } else if (
        rawMessage.toLowerCase().includes('invalid login credentials') ||
        errorCode === 'invalid_credentials'
      ) {
        setErrorType('invalid_credentials');
        setErrorMessage(
          'Supabase rejected authentication: "Invalid login credentials".'
        );
      } else if (
        rawMessage.toLowerCase().includes('rate limit') ||
        errorStatus === 429
      ) {
        setErrorType('rate_limit');
        setErrorMessage(
          'Supabase rate limit reached. Please wait a few moments before trying again.'
        );
      } else if (
        rawMessage.toLowerCase().includes('api key') ||
        errorStatus === 401
      ) {
        setErrorType('api_key');
        setErrorMessage(
          'Supabase API key invalid. Please verify VITE_SUPABASE_PUBLISHABLE_KEY in .env.'
        );
      } else {
        setErrorType('generic');
        setErrorMessage(rawMessage || 'Authentication failed. Please verify your credentials.');
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
          Welcome to CareCircle
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-[#718096] max-w-sm mx-auto">
          Sign in to access real-time elderly medication management, vitals, and family care coordination.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xs border border-slate-200/80 rounded-2xl">
          {/* Detailed Error Diagnostic Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2.5 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block text-rose-900 text-sm">
                    {errorType === 'unconfirmed_email'
                      ? 'Email Confirmation Required'
                      : errorType === 'invalid_credentials'
                      ? 'Invalid Login Credentials (Supabase Response)'
                      : errorType === 'rate_limit'
                      ? 'Supabase Rate Limit Exceeded'
                      : 'Authentication Failed'}
                  </span>
                  <p className="text-rose-700 leading-relaxed mt-0.5">{errorMessage}</p>
                </div>
              </div>

              {/* Actionable guidance if Supabase returns Invalid Credentials */}
              {errorType === 'invalid_credentials' && (
                <div className="pt-2 border-t border-rose-200/80 text-[11px] text-rose-800 space-y-2 bg-white/70 p-3 rounded-xl">
                  <p className="font-bold text-rose-950">
                    Why does Supabase report this even with the correct password?
                  </p>
                  <ul className="list-disc pl-4 space-y-1.5 text-rose-800">
                    <li>
                      <strong>1. Unconfirmed Email (Most Likely):</strong> If <em>Confirm email</em> is enabled in your Supabase project, accounts cannot log in until confirmed.
                      <div className="mt-1">
                        <a
                          href="https://supabase.com/dashboard/project/kvzovehlvnuplhgurbjp/auth/providers"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-[#142B4A] underline hover:text-[#13A89E]"
                        >
                          <span>Open Supabase Auth Providers &rarr; Turn OFF "Confirm email"</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </li>
                    <li>
                      <strong>2. Account Not Yet Created:</strong> If your previous signup attempt failed (e.g. from the free-tier email rate limit), the user does not exist in Supabase yet.
                      <div className="mt-1">
                        <Link to="/signup" className="font-bold text-[#13A89E] underline">
                          Click here to Register New Account &rarr;
                        </Link>
                      </div>
                    </li>
                    <li>
                      <strong>3. Password Case-Sensitivity:</strong> Use the eye icon (<Eye className="w-3 h-3 inline" />) on the password field to verify no extra spaces or casing errors.
                    </li>
                  </ul>
                </div>
              )}

              {/* Actionable guidance if Email is unconfirmed */}
              {errorType === 'unconfirmed_email' && (
                <div className="pt-2 border-t border-rose-200/80 text-[11px] text-rose-800 space-y-1.5 bg-white/70 p-3 rounded-xl">
                  <p className="font-bold text-rose-950">How to bypass email confirmation:</p>
                  <p>
                    1. Go to your{' '}
                    <a
                      href="https://supabase.com/dashboard/project/kvzovehlvnuplhgurbjp/auth/providers"
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold underline text-[#142B4A]"
                    >
                      Supabase Providers Settings
                    </a>
                    .
                  </p>
                  <p>2. Select <strong>Email</strong>, turn <strong>Confirm email</strong> to <strong>OFF</strong>, and click <strong>Save</strong>.</p>
                  <p>3. Return here and sign in instantly!</p>
                </div>
              )}
            </div>
          )}

          {!isConfigured && (
            <div className="mb-6 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block">Supabase Keys Missing</strong>
                <span>Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) are defined.</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
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
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#13A89E] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#13A89E] focus:border-transparent transition-all font-mono"
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
                  <span>Signing In to Supabase...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          {/* Quick Demo Credentials & Supabase Verification */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100/80 text-xs text-slate-600">
              <span className="font-bold text-[#142B4A] block mb-1">New to CareCircle?</span>
              <p className="text-[11px] text-slate-500 mb-2">
                Click below to create a new caregiver or patient account. All data is securely stored in your Supabase database.
              </p>
              <Link
                to="/signup"
                className="w-full py-2 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[#142B4A] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>Create New Account</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#13A89E]" />
              </Link>
            </div>

            {/* Supabase Connected Project Reference Banner */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                Project Ref:
              </span>
              <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                {supabaseProjectRef || 'kvzovehlvnuplhgurbjp'}
              </span>
            </div>
          </div>
        </div>

        {/* Security Trust Badge */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Protected with PostgreSQL Row Level Security (RLS)</span>
        </div>
      </div>
    </div>
  );
}
