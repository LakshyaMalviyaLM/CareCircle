import { createClient } from '@supabase/supabase-js';

// Strip whitespace, newlines, and surrounding quotes if entered with quotes in .env or Vercel UI
const sanitizeEnvString = (val) => {
  if (!val || typeof val !== 'string') return '';
  let str = val.trim();
  if (
    (str.startsWith('"') && str.endsWith('"')) ||
    (str.startsWith("'") && str.endsWith("'"))
  ) {
    str = str.slice(1, -1).trim();
  }
  return str;
};

// Normalize URL (strip quotes, trim, ensure https:// protocol, remove trailing slashes)
const normalizeSupabaseUrl = (val) => {
  let url = sanitizeEnvString(val);
  if (!url) return '';

  // Auto-correct if user entered the Supabase dashboard URL instead of API URL
  // e.g. https://supabase.com/dashboard/project/kvzovehlvnuplhgurbjp
  const dashboardMatch = url.match(/(?:dashboard\/project|project)\/([a-z0-9]+)/i);
  if (dashboardMatch) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // Auto-correct if user entered bare project ref (e.g. kvzovehlvnuplhgurbjp)
  if (!url.includes('.') && /^[a-z0-9]{15,30}$/i.test(url)) {
    return `https://${url}.supabase.co`;
  }

  // Prepend https:// if protocol was omitted
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  // Strip trailing slashes
  return url.replace(/\/+$/, '');
};

// Resolves Supabase URL supporting all standard Vite & Vercel variable aliases
const resolveSupabaseUrl = () => {
  const candidates = [
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_PUBLIC_SUPABASE_URL,
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_URL
  ];

  for (const candidate of candidates) {
    const cleaned = normalizeSupabaseUrl(candidate);
    if (
      cleaned &&
      !cleaned.includes('placeholder') &&
      !cleaned.includes('your-project-id') &&
      !cleaned.includes('example.com')
    ) {
      return cleaned;
    }
  }
  return '';
};

// Resolves Supabase Publishable / Anon Key supporting all standard aliases
const resolveSupabaseKey = () => {
  const candidates = [
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    import.meta.env.VITE_SUPABASE_KEY,
    import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    import.meta.env.SUPABASE_ANON_KEY,
    import.meta.env.SUPABASE_KEY
  ];

  for (const candidate of candidates) {
    const cleaned = sanitizeEnvString(candidate);
    if (
      cleaned &&
      !cleaned.includes('placeholder') &&
      !cleaned.includes('your-supabase') &&
      !cleaned.includes('your_publishable') &&
      !cleaned.includes('your_key_here') &&
      cleaned.length >= 15
    ) {
      return cleaned;
    }
  }
  return '';
};

const rawUrl = resolveSupabaseUrl();
const rawKey = resolveSupabaseKey();

// Check if credentials are valid and present
export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  /^https?:\/\//i.test(rawUrl)
);

export const supabaseConfigError = !isSupabaseConfigured
  ? 'Supabase credentials are missing or invalid in your environment. Please define VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY).'
  : null;

// Diagnostics: check which specific variable is present
export const supabaseEnvDiagnostics = {
  hasUrl: Boolean(rawUrl),
  hasKey: Boolean(rawKey),
  urlPreview: rawUrl ? `${rawUrl.slice(0, 25)}...` : 'Not Defined',
  keyFormat: rawKey
    ? rawKey.startsWith('sb_publishable')
      ? 'Publishable Key (sb_publishable_...)'
      : rawKey.startsWith('eyJ')
      ? 'Standard JWT Anon Key (eyJ...)'
      : 'Custom Key'
    : 'Not Defined',
};

// Extract project reference for diagnostics
export const supabaseProjectRef =
  rawUrl.match(/https?:\/\/([a-z0-9-]+)\.supabase\.co/i)?.[1] || '';
export const supabaseProjectUrl = rawUrl;

// Safe client instantiation
export const supabase = isSupabaseConfigured
  ? createClient(rawUrl, rawKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient('https://placeholder-domain-never-called.supabase.co', 'placeholder-anon-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

// Ping live Supabase health endpoint to distinguish browser network/adblock blocks from server errors
export const pingSupabaseHealth = async () => {
  if (!rawUrl) {
    return { ok: false, error: 'Supabase URL is not configured in client environment.' };
  }
  try {
    const healthEndpoint = `${rawUrl}/auth/v1/health`;
    const res = await fetch(healthEndpoint, {
      method: 'GET',
      headers: rawKey ? { apikey: rawKey } : {},
    });
    if (res.ok) {
      const info = await res.json().catch(() => ({}));
      return { ok: true, data: info, endpoint: healthEndpoint };
    }
    return {
      ok: false,
      status: res.status,
      statusText: res.statusText,
      endpoint: healthEndpoint
    };
  } catch (err) {
    return {
      ok: false,
      error: err.message || 'Failed to fetch',
      endpoint: `${rawUrl}/auth/v1/health`
    };
  }
};

// Log active connection details in browser console for production diagnostics
if (typeof window !== 'undefined') {
  console.info('[CareCircle Supabase Initialized]', {
    endpoint: rawUrl || '(none)',
    hasKey: Boolean(rawKey),
    isConfigured: isSupabaseConfigured
  });
}

export default supabase;

