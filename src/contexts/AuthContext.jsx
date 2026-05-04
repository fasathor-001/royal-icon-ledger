// src/contexts/AuthContext.jsx
//
// Auth state, login/logout, magic link, password reset.
// Personal use only — no registration flow exposed.
// Session expires after 7 days of inactivity (configured via Supabase dashboard).

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  // Check URL immediately so recovery/invite form shows before any async events fire
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    return (
      hash.includes('type=recovery') || hash.includes('type=invite') ||
      params.get('type') === 'recovery' || params.get('type') === 'invite'
    );
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return;
    }

    // Restore session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
      // Invite link: Supabase auto-signs the user in (SIGNED_IN event) but they
      // still need to set a password — intercept before routing to the main app.
      if (event === 'SIGNED_IN' && window.location.hash.includes('type=invite')) {
        setIsPasswordRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setAuthError(error.message); return false; }
    return true;
  };

  const signUp = async (email, password) => {
    setAuthError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) { setAuthError(error.message); return false; }
    return true;
  };

  const sendMagicLink = async (email) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) { setAuthError(error.message); return false; }
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const resetPassword = async (email) => {
    setAuthError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) { setAuthError(error.message); return false; }
    return true;
  };

  const updatePassword = async (newPassword) => {
    setAuthError(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { setAuthError(error.message); return false; }
    setIsPasswordRecovery(false);
    return true;
  };

  // Resend the confirmation email for an unconfirmed signup.
  // Called from the "check your email" screen if the user didn't receive it.
  const resendConfirmation = async (email) => {
    setAuthError(null);
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) { setAuthError(error.message); return false; }
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, authError, setAuthError, login, signUp, sendMagicLink, logout, resetPassword, updatePassword, resendConfirmation, isPasswordRecovery }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
