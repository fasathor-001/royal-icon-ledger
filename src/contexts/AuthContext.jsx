// src/contexts/AuthContext.jsx
//
// Auth state, login/logout, magic link, password reset.
// Personal use only — no registration flow exposed.
// Session expires after 7 days of inactivity (configured via Supabase dashboard).
//
// PKCE flow note (supabase.js uses flowType: 'pkce'):
//   In PKCE mode Supabase redirects back as:
//     https://your-app.com?code=xxx              ← NO type= param
//   We embed ?type=recovery in the redirectTo URL so the app can detect it
//   synchronously on mount, before the async onAuthStateChange fires.
//   Fallback: if the code param is present with no type, we treat it as
//   recovery too (the only other case — invite — is handled separately).

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

// ── Synchronous URL inspection ────────────────────────────────────────────────
// Runs once at import time so the state initialiser always gets the right value
// regardless of render timing.
function detectRecoveryFromUrl() {
  const hash   = window.location.hash;
  const params = new URLSearchParams(window.location.search);
  const type   = params.get('type') || '';

  // Implicit / old flow: type=recovery or type=invite in the hash fragment
  if (hash.includes('type=recovery') || hash.includes('type=invite')) return true;

  // PKCE flow: type= is preserved from the redirectTo query param we embed
  if (type === 'recovery' || type === 'invite') return true;

  // PKCE flow fallback: code present but no type means Supabase already stripped
  // it — we check the onAuthStateChange event below to catch this case.
  return false;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Detect recovery/invite synchronously so the correct page renders immediately
  // before any async auth events fire (avoids a flash of the login page).
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(detectRecoveryFromUrl);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return;
    }

    // Restore session on load.
    // In PKCE mode detectSessionInUrl:true (set in supabase.js) means the client
    // already started exchanging the ?code param before this runs.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (event === 'PASSWORD_RECOVERY') {
        // PKCE fallback: code was present but type wasn't detected synchronously
        setIsPasswordRecovery(true);
      }

      // Invite link: Supabase auto-signs the user in (SIGNED_IN event) but they
      // still need to set a password — intercept before routing to the main app.
      if (event === 'SIGNED_IN') {
        const hash   = window.location.hash;
        const params = new URLSearchParams(window.location.search);
        if (hash.includes('type=invite') || params.get('type') === 'invite') {
          setIsPasswordRecovery(true);
        }
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
    // Embed ?type=recovery so the app can detect the returning URL synchronously
    // in PKCE mode (where Supabase redirects with ?code= and no type in the URL).
    // Supabase preserves existing query params in redirectTo, producing:
    //   https://your-app.com?type=recovery&code=xxx   (PKCE)
    //   https://your-app.com?type=recovery#access_token=...&type=recovery  (implicit)
    // Both are detected by detectRecoveryFromUrl() above.
    const redirectTo = `${window.location.origin}?type=recovery`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
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
