// src/contexts/AuthContext.jsx
//
// Auth state, login/logout, magic link, password reset.
// Personal use only — no registration flow exposed.
// Session expires after 7 days of inactivity (configured via Supabase dashboard).
//
// PKCE flow — how reset detection works (read before editing this file):
//
//   Supabase sends a reset link that redirects back as:
//     https://your-app.com?type=recovery&code=xxx       ← ideal, type= preserved
//     https://your-app.com?code=xxx                     ← happens when Supabase
//                                                          dashboard Redirect URL
//                                                          doesn't match our redirectTo
//
//   Three-layer detection (each layer is a fallback for the one above):
//
//   Layer 1 — URL type param (hash or query):
//     Works when Supabase preserves ?type=recovery from our redirectTo URL.
//     Most reliable when the Supabase dashboard Redirect URL allowlist includes
//     a wildcard pattern like https://your-app.com/** or https://your-app.com*.
//
//   Layer 2 — PKCE code-verifier in localStorage (the KEY fix):
//     supabase-js stores the verifier as "<base64>/<redirectType>" before sending
//     the reset email. The redirectType is 'recovery' for password resets.
//     storageKey = 'sb-auth-token' (set in supabase.js) so the key is always
//     'sb-auth-token-code-verifier'. We read this synchronously at import time,
//     before GoTrueClient._initialize()'s async chain removes it (GoTrueClient.js
//     line 1483: removeItemAsync runs before _notifyAllSubscribers at line 1496).
//     This layer handles the case where ?type= is missing from the URL.
//
//   Layer 3 — onAuthStateChange SIGNED_IN event:
//     PASSWORD_RECOVERY is unreliable in PKCE mode (supabase/auth#1948) — the
//     library often fires SIGNED_IN instead. We check URL type= again there as a
//     belt-and-suspenders measure for late-arriving auth state changes.
//
//   Cross-device / expired links:
//     If the verifier isn't in localStorage (different browser, different device),
//     the code exchange fails silently and the user lands with no session.
//     SetNewPasswordPage detects sessionMissing and shows a "request new link" form.

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

// ── Layer 1 + 2: Synchronous URL + localStorage inspection ───────────────────
// Runs once at import time so the state initialiser gets the right value before
// any render. Must be synchronous — async detection is too late to set initial state.
function detectRecoveryFromUrl() {
  const hash   = window.location.hash;
  const params = new URLSearchParams(window.location.search);
  const type   = params.get('type') || '';

  // Layer 1a — implicit / old flow: type in hash fragment
  if (hash.includes('type=recovery') || hash.includes('type=invite')) return true;

  // Layer 1b — PKCE flow: type= preserved from our redirectTo query param
  if (type === 'recovery' || type === 'invite') return true;

  // Layer 2 — PKCE localStorage verifier (most reliable fallback).
  // The verifier is stored when resetPasswordForEmail() is called and removed
  // after the code exchange. Reading it here (synchronously, at import time)
  // guarantees it's still present — the async _initialize() chain hasn't had
  // a chance to remove it yet (JS microtasks queue behind this synchronous eval).
  // Format: "<codeVerifier>/<redirectType>"  e.g. "abc123.../recovery"
  if (params.get('code')) {
    try {
      const raw = localStorage.getItem('sb-auth-token-code-verifier');
      if (raw) {
        const redirectType = raw.split('/')[1]; // 'recovery' | 'invite' | 'magiclink' | ''
        if (redirectType === 'recovery' || redirectType === 'invite') return true;
      }
    } catch (_) { /* localStorage unavailable (private mode, quota, etc.) */ }
  }

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
    //
    // Critical timing fix: supabase-js fires PASSWORD_RECOVERY (and SIGNED_IN for
    // invite links) inside a setTimeout(fn, 0) in GoTrueClient._initialize().
    // That macrotask fires AFTER getSession() resolves (a microtask chain).
    // If we call setAuthLoading(false) immediately in the .then(), React re-renders
    // with authLoading=false before isPasswordRecovery is true — showing the wrong
    // page for a split second (or permanently if the user navigates away).
    //
    // Fix: when a PKCE code is present in the URL, defer setAuthLoading(false) by
    // one macrotask via setTimeout(fn, 0). Supabase's PASSWORD_RECOVERY setTimeout
    // was registered first (during _initialize()), so it runs first in the macrotask
    // queue → isPasswordRecovery=true is set BEFORE authLoading becomes false.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      const hasPkceCode = new URLSearchParams(window.location.search).get('code');
      if (hasPkceCode) {
        // Defer by one macrotask so PASSWORD_RECOVERY / SIGNED_IN event fires first
        setTimeout(() => setAuthLoading(false), 0);
      } else {
        setAuthLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (event === 'PASSWORD_RECOVERY') {
        // PKCE fallback: code was present but type wasn't detected synchronously
        setIsPasswordRecovery(true);
      }

      // Invite / recovery via SIGNED_IN event:
      // Some supabase-js versions (or cross-device flows where the code verifier
      // is missing from storage) fire SIGNED_IN instead of PASSWORD_RECOVERY.
      // Check the URL's type param so we still land on the right page.
      if (event === 'SIGNED_IN') {
        const hash   = window.location.hash;
        const params = new URLSearchParams(window.location.search);
        if (
          hash.includes('type=invite')    || params.get('type') === 'invite' ||
          hash.includes('type=recovery')  || params.get('type') === 'recovery'
        ) {
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
    // emailRedirectTo ensures the confirmation link always points to the live app,
    // even if Supabase's Site URL is still set to a dev/localhost URL.
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) { setAuthError(error.message); return false; }
    return true;
  };

  const sendMagicLink = async (email) => {
    setAuthError(null);
    // emailRedirectTo: same reason as signUp — don't rely on the Site URL setting.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) { setAuthError(error.message); return false; }
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const resetPassword = async (email) => {
    setAuthError(null);
    // Embed ?type=recovery so Layer 1b of detectRecoveryFromUrl() fires on return.
    // Supabase appends ?code=xxx to the redirectTo URL, giving:
    //   https://your-app.com?type=recovery&code=xxx   (PKCE)
    //   https://your-app.com?type=recovery#access_token=...  (implicit fallback)
    //
    // IMPORTANT — Supabase dashboard configuration:
    //   The Redirect URL allowlist must include a wildcard pattern so the query
    //   param is preserved. Add one of these in Authentication → URL Configuration:
    //     https://your-app.com**          (matches any path/query on the domain)
    //   Without a wildcard, Supabase falls back to the Site URL (drops ?type=recovery).
    //   Layer 2 (localStorage verifier) handles that case automatically for same-browser
    //   flows, but adding the wildcard keeps Layer 1b working as the primary signal.
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
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: window.location.origin },
    });
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
