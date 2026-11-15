import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured, supabaseConfigError } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [authError, setAuthError] = useState(supabaseConfigError);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  // Fetch public.profiles row for the authenticated user
  const fetchProfile = useCallback(async (userId, userMetadata = {}) => {
    if (!isSupabaseConfigured || !userId) {
      setProfile(null);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching user profile:', error.message);
      }

      if (data) {
        setProfile(data);
        return data;
      }

      // If profile record is not yet created by trigger, create fallback from metadata
      const fallbackProfile = {
        id: userId,
        full_name: userMetadata?.full_name || 'CareCircle User',
        email: userMetadata?.email || '',
        role: userMetadata?.role || 'caregiver',
        avatar_url: userMetadata?.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
        phone: userMetadata?.phone || ''
      };
      setProfile(fallbackProfile);
      return fallbackProfile;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  }, []);

  // Initialize auth session and listen to auth state changes
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;

    async function initializeAuth() {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error fetching initial session:', error.message);
        }

        if (isMounted) {
          if (initialSession?.user) {
            setSession(initialSession);
            setUser(initialSession.user);
            await fetchProfile(initialSession.user.id, initialSession.user.user_metadata);
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    // Subscribe to Supabase auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, PASSWORD_RECOVERY)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;

      console.info(`[Supabase Auth] onAuthStateChange event: ${event}`);

      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }

      setSession(currentSession);
      const currentUser = currentSession?.user || null;
      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser.id, currentUser.user_metadata);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign In with real Supabase Auth
  const signIn = async (email, password) => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      throw new Error(supabaseConfigError);
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = typeof password === 'string' ? password : '';

    if (!cleanEmail) {
      const err = new Error('Please enter your email address.');
      setAuthError(err.message);
      throw err;
    }

    if (!cleanPassword) {
      const err = new Error('Please enter your password.');
      setAuthError(err.message);
      throw err;
    }

    console.info(`[Supabase Auth] Attempting signInWithPassword for: "${cleanEmail}"`);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (error) {
      console.warn('[Supabase Auth] signInWithPassword error:', {
        message: error.message,
        status: error.status,
        code: error.code,
        name: error.name
      });
      setAuthError(error.message);
      throw error;
    }

    if (data.user) {
      setUser(data.user);
      setSession(data.session);
      await fetchProfile(data.user.id, data.user.user_metadata);
    }

    return data;
  };

  // Sign Up with real Supabase Auth
  const signUp = async ({ email, password, fullName, role = 'caregiver', phone = '' }) => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      throw new Error(supabaseConfigError);
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = typeof password === 'string' ? password : '';

    if (!cleanEmail) {
      const err = new Error('Please enter an email address.');
      setAuthError(err.message);
      throw err;
    }

    if (cleanPassword.length < 6) {
      const err = new Error('Password must be at least 6 characters long.');
      setAuthError(err.message);
      throw err;
    }

    console.info(`[Supabase Auth] Attempting signUp for: "${cleanEmail}"`);

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: {
        data: {
          full_name: (fullName || '').trim(),
          role,
          phone: (phone || '').trim(),
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || 'User')}`
        }
      }
    });

    if (error) {
      console.warn('[Supabase Auth] signUp error:', {
        message: error.message,
        status: error.status,
        code: error.code
      });
      setAuthError(error.message);
      throw error;
    }

    if (data.user) {
      setUser(data.user);
      setSession(data.session);
      await fetchProfile(data.user.id, { full_name: fullName, role, phone });
    }

    return data;
  };

  // Sign Out
  const signOut = async () => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      setUser(null);
      setSession(null);
      setProfile(null);
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error.message);
      }
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };

  // 4. Request Password Reset Link (Sends Supabase recovery email)
  const requestPasswordReset = async (email) => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      throw new Error(supabaseConfigError);
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      const err = new Error('Please enter your registered email address.');
      setAuthError(err.message);
      throw err;
    }

    // Direct redirect to /reset-password (per requirement)
    const redirectTo = `${window.location.origin}/reset-password`;
    console.info(`[Supabase Auth] Requesting resetPasswordForEmail for: "${cleanEmail}" with redirect: "${redirectTo}"`);

    const { data, error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo
    });

    if (error) {
      console.warn('[Supabase Auth] resetPasswordForEmail error:', error.message);
      setAuthError(error.message);
      throw error;
    }

    return data;
  };

  // 5. Update User Password (Used on Reset Password page)
  const updateUserPassword = async (newPassword) => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      throw new Error(supabaseConfigError);
    }

    if (!newPassword || newPassword.length < 6) {
      const err = new Error('New password must be at least 6 characters long.');
      setAuthError(err.message);
      throw err;
    }

    console.info('[Supabase Auth] Calling supabase.auth.updateUser to set new password');

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.warn('[Supabase Auth] updateUser error:', error.message);
      setAuthError(error.message);
      throw error;
    }

    setIsRecoveryMode(false);
    return data;
  };

  // 6. Manually establish recovery session from URL tokens if needed
  const setRecoverySession = async ({ access_token, refresh_token }) => {
    if (!access_token || !refresh_token) return;
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token
      });
      if (error) throw error;
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        setIsRecoveryMode(true);
      }
      return data;
    } catch (err) {
      console.warn('[Supabase Auth] Error setting recovery session:', err.message);
      throw err;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.user_metadata);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        authError,
        isRecoveryMode,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        requestPasswordReset,
        updateUserPassword,
        setRecoverySession,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
