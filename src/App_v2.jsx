// src/App_v2.jsx
//
// Wraps the existing app with auth context and cloud sync layer.
// Handles: login page, session management, migration modal, sync indicator.
// The core OpenFinanceApp in App.jsx is untouched — this is purely additive.
//
// To activate: change main.jsx to import App_v2 instead of App.
// See INTEGRATION.md for full setup.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { loadData, saveData, saveDataVersioned, classifyError, validateAndClaimInviteCode, submitAccessRequest } from './lib/dataLayer';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import MigrationModal from './components/MigrationModal';
import OpenFinanceApp from './App';

// ─────────────── DEBOUNCE HOOK ───────────────
function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

// ─────────────── SYNC STATUS INDICATOR ───────────────
function SyncIndicator({ syncStatus, isOnline }) {
  const isRetry   = syncStatus?.startsWith?.('retry:');
  const isFailed  = syncStatus === 'failed' || syncStatus?.startsWith?.('failed');
  const isSyncing = syncStatus === 'syncing' || isRetry;
  const isSynced  = syncStatus === 'synced';
  const show = !isOnline || isSyncing || isFailed || isSynced;
  if (!show) return null;

  const color  = !isOnline ? '#B89968' : isFailed ? '#C56B5A' : isSynced ? '#7FA068' : '#D97757';
  const bg     = !isOnline ? '#1A1610' : isFailed ? '#3A2620' : isSynced ? '#0F1A0E' : '#14110E';
  const border = !isOnline ? '#3A2A1E40' : isFailed ? '#C56B5A40' : isSynced ? '#2A4A2A40' : '#26221C';

  const label = !isOnline
    ? 'Offline — saved locally'
    : isRetry
      ? `Syncing… retry ${syncStatus.slice(6)}`
      : isSyncing
        ? 'Syncing…'
        : isSynced
          ? 'Synced ✓'
          : syncStatus === 'failed:rls'
            ? 'Sync failed — permission error. Sign out and back in.'
            : 'Sync failed — data saved locally';

  return (
    <div style={{
      position: 'fixed', bottom: '20px', right: '20px',
      background: bg, border: `1px solid ${border}`,
      borderRadius: '4px', padding: '8px 14px',
      fontFamily: 'Inter, sans-serif', fontSize: '12px', color,
      zIndex: 9997, display: 'flex', alignItems: 'center', gap: '6px',
      transition: 'all 200ms',
    }}>
      {isSyncing && (
        <span style={{
          width: '7px', height: '7px', borderRadius: '50%', background: '#D97757',
          display: 'inline-block', animation: 'pulse 1.2s ease-in-out infinite',
        }} />
      )}
      {label}
    </div>
  );
}

// ─────────────── CONFLICT MODAL ───────────────
function ConflictModal({ localVersion, cloudVersion, localTs, cloudTs, onKeepLocal, onKeepCloud }) {
  const fmtAge = (ts) => {
    if (!ts) return 'unknown time';
    const mins = Math.round((Date.now() - ts) / 60000);
    if (mins < 2)  return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24)  return `${hrs} hr ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,9,8,0.92)',
      backdropFilter: 'blur(6px)', zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: '#0A0908', border: '1px solid #3A2A1E',
        borderRadius: '6px', maxWidth: '500px', width: '100%', padding: '36px',
        fontFamily: 'Inter, system-ui, sans-serif', color: '#E8E2D5',
      }}>
        <div style={{ fontSize: '22px', marginBottom: '12px' }}>⚠️</div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '24px', fontWeight: 300, marginBottom: '8px' }}>
          Data conflict
        </h2>
        <p style={{ color: '#B0A898', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
          This device has unsaved local changes. Choose which version to keep — the other will be discarded.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {[
            {
              label: 'This device',
              version: localVersion,
              ts: localTs,
              recommended: true,
              onClick: onKeepLocal,
              accentColor: '#D97757',
            },
            {
              label: 'Cloud copy',
              version: cloudVersion,
              ts: cloudTs,
              recommended: false,
              onClick: onKeepCloud,
              accentColor: '#5B7FB8',
            },
          ].map(opt => (
            <button key={opt.label} onClick={opt.onClick} style={{
              background: opt.recommended ? '#1A1410' : 'transparent',
              border: `1px solid ${opt.recommended ? opt.accentColor : '#26221C'}`,
              borderRadius: '6px', padding: '18px 16px', cursor: 'pointer',
              textAlign: 'left', transition: 'all 150ms',
            }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: opt.recommended ? opt.accentColor : '#E8E2D5', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {opt.label}
                {opt.recommended && (
                  <span style={{ fontSize: '9px', background: '#3A2A1E', color: '#D97757', padding: '2px 6px', borderRadius: '999px', letterSpacing: '0.05em', fontWeight: 700 }}>
                    NEWER
                  </span>
                )}
              </div>
              <div style={{ fontSize: '11px', color: '#8B8478', fontFamily: 'JetBrains Mono, monospace' }}>
                v{opt.version ?? '?'} · {fmtAge(opt.ts)}
              </div>
            </button>
          ))}
        </div>

        <p style={{ fontSize: '11px', color: '#5C5648', lineHeight: 1.5 }}>
          "This device" syncs local changes to cloud. "Cloud copy" loads the cloud version into this device.
        </p>
      </div>
    </div>
  );
}

// ─────────────── LOGIN PAGE ───────────────
function LoginPage() {
  const { login, signUp, sendMagicLink, resetPassword, resendConfirmation, authError, setAuthError } = useAuth();
  // modes: signin | signup | request | magic | reset
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [requestNote, setRequestNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentMessage, setSentMessage] = useState('');
  // Tracks the email used for signup so the resend button can reference it
  const [signupEmail, setSignupEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'error'

  const clearError = () => setAuthError(null);
  const switchMode = (m) => {
    setMode(m); clearError();
    setConfirmPassword(''); setInviteCode(''); setRequestNote('');
    setSent(false); setSignupEmail(''); setResendStatus('idle');
  };

  const handleResend = async () => {
    if (!signupEmail) return;
    setResendStatus('sending');
    const ok = await resendConfirmation(signupEmail);
    setResendStatus(ok ? 'sent' : 'error');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLoading(true);

    if (mode === 'signin') {
      await login(email, password);

    } else if (mode === 'signup') {
      if (password !== confirmPassword) {
        setAuthError('Passwords do not match.');
        setLoading(false); return;
      }
      if (!inviteCode.trim()) {
        setAuthError('An invite code is required to create an account.');
        setLoading(false); return;
      }

      // Claim the invite code. The RPC is idempotent: if this exact email
      // already claimed this code in a previous attempt, it returns true so
      // the user can re-submit without needing a fresh code.
      const valid = await validateAndClaimInviteCode(inviteCode, email);
      if (!valid) {
        setAuthError("Invite code not recognised or already used by a different account. Check for typos, or request a new code.");
        setLoading(false); return;
      }

      const ok = await signUp(email, password);
      if (ok) {
        setSignupEmail(email);
        setSentMessage('A confirmation link is on its way. Click it to activate your account.');
        setSent(true);
      }
      // If !ok, authError is set inside signUp() and shown in the form.
      // The code stays claimed so the user can retry without re-entering it.

    } else if (mode === 'request') {
      const ok = await submitAccessRequest(email, requestNote);
      if (ok) {
        setSentMessage("Request received. You'll get an invite code by email if approved.");
        setSent(true);
      } else {
        setAuthError('Could not submit request. Try again.');
      }

    } else if (mode === 'magic') {
      const ok = await sendMagicLink(email);
      if (ok) { setSentMessage('A magic link is on its way.'); setSent(true); }

    } else if (mode === 'reset') {
      const ok = await resetPassword(email);
      if (ok) { setSentMessage('Password reset link sent.'); setSent(true); }
    }

    setLoading(false);
  };

  const inputStyle = {
    background: '#0A0908', border: '1px solid #26221C', padding: '11px 13px',
    fontFamily: 'Inter, sans-serif', color: '#E8E2D5', borderRadius: '3px',
    width: '100%', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  };
  const monoInputStyle = { ...inputStyle, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' };
  const codeInputStyle = { ...inputStyle, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.3em', textTransform: 'uppercase', fontSize: '16px' };
  const labelStyle = {
    fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
    fontWeight: 600, color: '#8B8478', marginBottom: '6px', display: 'block',
  };
  const titles = { signin: 'Sign in', signup: 'Create account', request: 'Request access', magic: 'Magic link', reset: 'Reset password' };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0908' }}>
        <div style={{
          maxWidth: '420px', width: '100%', padding: '40px',
          background: '#14110E', border: '1px solid #26221C', borderRadius: '6px',
          fontFamily: 'Inter, system-ui, sans-serif', color: '#E8E2D5', textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: '26px', fontStyle: 'italic', fontWeight: 300, marginBottom: '12px' }}>
            {mode === 'request' ? 'Request submitted.' : 'Check your email.'}
          </div>
          <p style={{ color: '#B0A898', fontSize: '14px', lineHeight: 1.6 }}>
            {sentMessage}
          </p>
          <p style={{ color: '#8B8478', fontSize: '13px', marginTop: '8px' }}>
            Check your inbox and spam folder. The link expires after 24 hours.
          </p>

          {/* Resend button — only shown after a signup (not request / magic / reset) */}
          {mode === 'signup' && signupEmail && (
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #26221C' }}>
              <p style={{ color: '#8B8478', fontSize: '12px', marginBottom: '12px' }}>
                Didn't receive it?
              </p>
              {resendStatus === 'sent' ? (
                <p style={{ color: '#7FA068', fontSize: '13px' }}>
                  ✓ Confirmation email sent again — check your inbox.
                </p>
              ) : resendStatus === 'error' ? (
                <p style={{ color: '#C56B5A', fontSize: '13px' }}>
                  Couldn't resend. Try again in a moment.
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendStatus === 'sending'}
                  style={{
                    background: 'transparent', border: '1px solid #3A2A1E',
                    color: '#D97757', borderRadius: '3px', padding: '9px 18px',
                    fontSize: '13px', fontWeight: 500, cursor: resendStatus === 'sending' ? 'not-allowed' : 'pointer',
                    opacity: resendStatus === 'sending' ? 0.6 : 1,
                  }}
                >
                  {resendStatus === 'sending' ? 'Sending…' : 'Resend confirmation email'}
                </button>
              )}
            </div>
          )}

          <button onClick={() => switchMode('signin')}
            style={{ marginTop: '24px', background: 'transparent', border: 'none', color: '#B0A898', cursor: 'pointer', fontSize: '13px' }}>
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: '#0A0908', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        .auth-input:focus { border-color: #D97757 !important; }
      `}</style>

      <div style={{
        maxWidth: '420px', width: '100%', padding: '44px 40px',
        background: '#14110E', border: '1px solid #26221C', borderRadius: '6px', color: '#E8E2D5',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: '22px', fontWeight: 400, marginBottom: '4px' }}>
            Royal <span style={{ fontStyle: 'italic', color: '#D97757' }}>Ledger</span>
          </div>
          <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B8478', fontWeight: 600 }}>
            Financial OS for variable-income earners
          </div>
        </div>

        {/* Tabs: only shown on signin / signup */}
        {(mode === 'signin' || mode === 'signup') && (
          <div style={{ display: 'flex', marginBottom: '28px', borderBottom: '1px solid #26221C' }}>
            {[{ id: 'signin', label: 'Sign in' }, { id: 'signup', label: 'Create account' }].map(t => (
              <button key={t.id} onClick={() => switchMode(t.id)} style={{
                background: 'transparent', border: 'none',
                borderBottom: `2px solid ${mode === t.id ? '#D97757' : 'transparent'}`,
                color: mode === t.id ? '#D97757' : '#8B8478',
                padding: '10px 16px 10px 0', marginRight: '16px', marginBottom: '-1px',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 150ms',
              }}>{t.label}</button>
            ))}
          </div>
        )}

        {/* Sub-page header for non-tab modes */}
        {!['signin', 'signup'].includes(mode) && (
          <div style={{ marginBottom: '24px' }}>
            <button onClick={() => switchMode('signin')}
              style={{ background: 'transparent', border: 'none', color: '#8B8478', cursor: 'pointer', fontSize: '12px', padding: 0, marginBottom: '12px', display: 'block' }}>
              ← Back to sign in
            </button>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '24px', fontWeight: 300, margin: 0 }}>{titles[mode]}</h2>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Invite code — shown first so user knows they need one */}
          {mode === 'signup' && (
            <div>
              <label style={labelStyle}>Invite code</label>
              <input type="text" className="auth-input"
                value={inviteCode}
                onChange={e => { setInviteCode(e.target.value.toUpperCase()); clearError(); }}
                required placeholder="RL-XXXX" maxLength={10} autoComplete="off"
                style={codeInputStyle} />
              <div style={{ fontSize: '11px', color: '#8B8478', marginTop: '5px' }}>
                No code?{' '}
                <button type="button" onClick={() => switchMode('request')}
                  style={{ background: 'none', border: 'none', color: '#D97757', cursor: 'pointer', fontSize: '11px', padding: 0 }}>
                  Request access →
                </button>
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" className="auth-input"
              value={email}
              onChange={e => { setEmail(e.target.value); clearError(); }}
              required placeholder="you@example.com" style={inputStyle} />
            {mode === 'magic' && (
              <div style={{ fontSize: '12px', color: '#8B8478', marginTop: '5px' }}>We'll send a one-click login link.</div>
            )}
          </div>

          {/* Password */}
          {(mode === 'signin' || mode === 'signup') && (
            <div>
              <label style={labelStyle}>
                Password
                {mode === 'signup' && (
                  <span style={{ color: '#5C5648', letterSpacing: 'normal', textTransform: 'none', fontSize: '11px', fontWeight: 400 }}> (min. 8 characters)</span>
                )}
              </label>
              <input type="password" className="auth-input"
                value={password}
                onChange={e => { setPassword(e.target.value); clearError(); }}
                required minLength={8} placeholder="••••••••" style={monoInputStyle} />
            </div>
          )}

          {/* Confirm password */}
          {mode === 'signup' && (
            <div>
              <label style={labelStyle}>Confirm password</label>
              <input type="password" className="auth-input"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); clearError(); }}
                required minLength={8} placeholder="••••••••" style={monoInputStyle} />
            </div>
          )}

          {/* Request note */}
          {mode === 'request' && (
            <div>
              <label style={labelStyle}>
                Why do you want access?
                <span style={{ color: '#5C5648', letterSpacing: 'normal', textTransform: 'none', fontSize: '11px', fontWeight: 400 }}> (optional)</span>
              </label>
              <textarea className="auth-input"
                value={requestNote}
                onChange={e => { setRequestNote(e.target.value); clearError(); }}
                placeholder="Tell us a little about yourself…" rows={3}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
            </div>
          )}

          {authError && (
            <div style={{ fontSize: '13px', color: '#C56B5A', padding: '8px 12px', background: '#1A0E0C', border: '1px solid #3A2018', borderRadius: '3px' }}>
              {authError}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            background: '#D97757', color: '#0A0908', padding: '12px 20px',
            fontWeight: 600, borderRadius: '3px', fontSize: '13px', letterSpacing: '0.04em',
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, marginTop: '4px',
          }}>
            {loading ? 'Please wait…' : titles[mode]}
          </button>
        </form>

        {/* Footer links */}
        <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid #26221C', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {mode === 'signin' && (
            <>
              <button onClick={() => switchMode('magic')}
                style={{ background: 'transparent', border: 'none', color: '#B0A898', cursor: 'pointer', fontSize: '13px', textAlign: 'left', padding: 0 }}>
                Sign in with a magic link →
              </button>
              <button onClick={() => switchMode('reset')}
                style={{ background: 'transparent', border: 'none', color: '#8B8478', cursor: 'pointer', fontSize: '12px', textAlign: 'left', padding: 0 }}>
                Forgot password?
              </button>
            </>
          )}
          {mode === 'signup' && (
            <div style={{ fontSize: '12px', color: '#8B8478' }}>
              Already have an account?{' '}
              <button type="button" onClick={() => switchMode('signin')}
                style={{ background: 'none', border: 'none', color: '#B0A898', cursor: 'pointer', fontSize: '12px', padding: 0 }}>
                Sign in
              </button>
            </div>
          )}
          <a
            href="https://royalledger.app"
            style={{ fontSize: '11px', color: '#5C5648', textDecoration: 'none', marginTop: '4px', display: 'inline-block' }}
          >
            ← royalledger.app
          </a>
        </div>
      </div>
    </div>
  );
}

// ─────────────── SKELETON LOADING ───────────────
function SkeletonLoader() {
  return (
    <div className="min-h-screen" style={{ background: '#0A0908', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes shimmer { 0% { opacity: 0.4 } 50% { opacity: 0.8 } 100% { opacity: 0.4 } }
        .skel { background: #1A1610; border-radius: 3px; animation: shimmer 1.6s ease infinite; }
      `}</style>
      <div style={{ borderBottom: '1px solid #26221C', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="skel" style={{ width: '180px', height: '24px' }} />
        <div className="skel" style={{ width: '80px', height: '32px' }} />
      </div>
      <div style={{ borderBottom: '1px solid #26221C', padding: '0 24px', display: 'flex', gap: '28px' }}>
        {[120, 80, 70, 110, 90, 100, 70].map((w, i) => (
          <div key={i} className="skel" style={{ width: w, height: '14px', margin: '18px 0' }} />
        ))}
      </div>
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="skel" style={{ height: '120px', borderRadius: '4px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="skel" style={{ height: '80px', borderRadius: '4px' }} />)}
        </div>
        <div className="skel" style={{ height: '200px', borderRadius: '4px' }} />
      </div>
    </div>
  );
}

// ─────────────── SET NEW PASSWORD PAGE ───────────────
function SetNewPasswordPage() {
  const { updatePassword, authError, setAuthError, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  // Distinguish invite flow ("Create password") from recovery flow ("Set new password")
  const isInvite = window.location.hash.includes('type=invite');
  const pageTitle = isInvite ? 'Create your password' : 'Set new password';
  const buttonLabel = isInvite ? 'Create password' : 'Set new password';

  const inputStyle = {
    background: '#0A0908', border: '1px solid #26221C', padding: '11px 13px',
    fontFamily: 'JetBrains Mono, monospace', color: '#E8E2D5', borderRadius: '3px',
    width: '100%', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    letterSpacing: '0.12em',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    if (password !== confirm) { setAuthError('Passwords do not match.'); return; }
    setLoading(true);
    const ok = await updatePassword(password);
    if (ok) setDone(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0908', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;1,300&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap'); .auth-input:focus{border-color:#D97757!important}`}</style>
      <div style={{ maxWidth: '420px', width: '100%', padding: '44px 40px', background: '#14110E', border: '1px solid #26221C', borderRadius: '6px', color: '#E8E2D5' }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: '22px', fontWeight: 400, marginBottom: '4px' }}>
            Royal <span style={{ fontStyle: 'italic', color: '#D97757' }}>Ledger</span>
          </div>
        </div>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '26px', fontStyle: 'italic', fontWeight: 300, marginBottom: '12px' }}>Password updated.</div>
            <p style={{ color: '#B0A898', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>You're signed in. Taking you to the app…</p>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '26px', fontWeight: 300, marginBottom: '24px' }}>{pageTitle}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, color: '#8B8478', marginBottom: '6px' }}>
                  New password <span style={{ color: '#5C5648', letterSpacing: 'normal', textTransform: 'none', fontSize: '11px' }}>(min. 8 characters)</span>
                </div>
                <input type="password" className="auth-input" value={password}
                  onChange={e => { setPassword(e.target.value); setAuthError(null); }}
                  required minLength={8} placeholder="••••••••" style={inputStyle} />
              </div>
              <div>
                <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, color: '#8B8478', marginBottom: '6px' }}>Confirm password</div>
                <input type="password" className="auth-input" value={confirm}
                  onChange={e => { setConfirm(e.target.value); setAuthError(null); }}
                  required minLength={8} placeholder="••••••••" style={inputStyle} />
              </div>
              {authError && (
                <div style={{ fontSize: '13px', color: '#C56B5A', padding: '8px 12px', background: '#1A0E0C', border: '1px solid #3A2018', borderRadius: '3px' }}>
                  {authError}
                </div>
              )}
              <button type="submit" disabled={loading}
                style={{ background: '#D97757', color: '#0A0908', padding: '12px 20px', fontWeight: 600, borderRadius: '3px', fontSize: '13px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '4px' }}>
                {loading ? 'Please wait…' : buttonLabel}
              </button>
            </form>
            <button onClick={logout}
              style={{ marginTop: '20px', background: 'transparent', border: 'none', color: '#8B8478', cursor: 'pointer', fontSize: '12px', padding: 0 }}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────── AUTHENTICATED APP WRAPPER ───────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function AuthenticatedApp() {
  const { user, logout, updatePassword } = useAuth();

  const signOutOthers = useCallback(async () => {
    await supabase.auth.signOut({ scope: 'others' });
  }, []);

  const [cloudData, setCloudData]               = useState(null);
  const [cloudLoading, setCloudLoading]         = useState(true);
  const [syncStatus, setSyncStatus]             = useState('idle');
  const [lastSyncedAt, setLastSyncedAt]         = useState(null);
  const [showMigration, setShowMigration]       = useState(false);
  const [migrationChecked, setMigrationChecked] = useState(false);
  const [isNewUser, setIsNewUser]               = useState(false);

  // Conflict modal state
  const [showConflict, setShowConflict]         = useState(false);
  const [conflictLocalVer, setConflictLocalVer] = useState(null);
  const [conflictCloudVer, setConflictCloudVer] = useState(null);
  const [conflictLocalTs, setConflictLocalTs]   = useState(null);
  const [conflictCloudTs, setConflictCloudTs]   = useState(null);
  const conflictLocalRef  = useRef(null);
  const conflictRemoteRef = useRef(null);

  // Offline + pending sync
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const pendingSyncRef = useRef(null);

  // Force-update app data (used by conflict resolution)
  const forceDataUpdateRef = useRef(null);

  useEffect(() => {
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // When back online, flush pending sync
  useEffect(() => {
    if (isOnline && pendingSyncRef.current && user) {
      const pending = pendingSyncRef.current;
      pendingSyncRef.current = null;
      doSave(pending);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  // Load from cloud on login — detect conflict vs migration
  useEffect(() => {
    if (!user) return;
    loadData(user.id).then(remote => {
      const localRaw  = localStorage.getItem('open-trader-finance-v2');
      const localData = localRaw ? (() => { try { return JSON.parse(localRaw); } catch { return null; } })() : null;

      const localVersion = localData?._version || 0;
      const cloudVersion = remote?._version   || 0;
      const localTs = localData?._localModifiedAt || 0;
      const cloudTs = remote?._syncedAt ? new Date(remote._syncedAt).getTime() : 0;

      // Version-based conflict: local has uncommitted changes (higher local version)
      const hasVersionConflict = remote && localData && localVersion > cloudVersion && localTs > cloudTs + 30_000;

      if (hasVersionConflict) {
        conflictLocalRef.current  = localData;
        conflictRemoteRef.current = remote;
        setConflictLocalVer(localVersion);
        setConflictCloudVer(cloudVersion);
        setConflictLocalTs(localTs);
        setConflictCloudTs(cloudTs || null);
        setCloudData(remote); // load cloud into app while user decides
        setShowConflict(true);
      } else if (localData && !remote) {
        setShowMigration(true);
      } else if (!remote && !localData) {
        setIsNewUser(true);
      } else {
        setCloudData(remote);
        if (remote) setLastSyncedAt(Date.now()); // data loaded from cloud — show as synced
      }

      setCloudLoading(false);
      setMigrationChecked(true);
    });
  }, [user?.id]);

  // Core save function: version-aware, retry with exponential backoff, error classification
  const doSave = useCallback(async (data) => {
    if (!user) return;

    if (!navigator.onLine) {
      pendingSyncRef.current = data;
      return;
    }

    setSyncStatus('syncing');

    const MAX_ATTEMPTS = 3;
    const DELAYS = [1000, 2000, 4000];
    let lastErr = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const result = await saveDataVersioned(user.id, data);

        if (result.conflict) {
          // Cloud is ahead — load cloud data and show conflict modal
          const cloudData = await loadData(user.id);
          if (cloudData) {
            conflictLocalRef.current  = data;
            conflictRemoteRef.current = cloudData;
            setConflictLocalVer(data._version || 1);
            setConflictCloudVer(result.cloudVersion);
            setConflictLocalTs(data._localModifiedAt || Date.now());
            setConflictCloudTs(cloudData._syncedAt ? new Date(cloudData._syncedAt).getTime() : null);
            setShowConflict(true);
          }
          setSyncStatus('idle');
          return;
        }

        // ✓ Success
        setSyncStatus('synced');
        setLastSyncedAt(Date.now());
        // Write versioned data back to localStorage so it survives a crash
        try {
          localStorage.setItem('open-trader-finance-v2', JSON.stringify({
            ...data, _localModifiedAt: Date.now(),
          }));
        } catch {}
        setTimeout(() => setSyncStatus(s => s === 'synced' ? 'idle' : s), 3000);
        return;

      } catch (err) {
        lastErr = err;
        const errType = classifyError(err);

        if (errType === 'auth') {
          // Try session refresh once, then retry
          try {
            const { error: refreshErr } = await supabase.auth.refreshSession();
            if (refreshErr) throw refreshErr;
            continue; // immediate retry after refresh
          } catch {
            break; // auth broken — stop retrying
          }
        }

        if (errType === 'rls') break; // RLS errors won't fix themselves — stop

        if (attempt < MAX_ATTEMPTS) {
          setSyncStatus(`retry:${attempt}/${MAX_ATTEMPTS}`);
          await sleep(DELAYS[attempt - 1]);
        }
      }
    }

    // All attempts exhausted
    pendingSyncRef.current = data; // retry when back online
    const finalErrType = classifyError(lastErr);
    setSyncStatus(finalErrType === 'rls' ? 'failed:rls' : 'failed');
  }, [user?.id]);

  const debouncedSave = useDebounce(doSave, 2000);

  // Manual retry (exposed to Settings via onRetrySync prop)
  const handleRetrySync = useCallback(() => {
    if (pendingSyncRef.current) {
      doSave(pendingSyncRef.current);
      pendingSyncRef.current = null;
    }
  }, [doSave]);

  // Conflict resolution: keep local data
  const resolveKeepLocal = useCallback(async () => {
    const local = conflictLocalRef.current;
    if (!local) { setShowConflict(false); return; }
    // Bump version to be strictly ahead of cloud
    const bumped = { ...local, _version: (local._version || 1) + 1 };
    // Force the app to show local data
    if (forceDataUpdateRef.current) forceDataUpdateRef.current(bumped);
    setCloudData(bumped);
    setShowConflict(false);
    // Save to cloud (fire and forget — will retry if fails)
    if (user) doSave(bumped);
  }, [user?.id, doSave]);

  // Conflict resolution: keep cloud data
  const resolveKeepCloud = useCallback(() => {
    const remote = conflictRemoteRef.current;
    if (remote && forceDataUpdateRef.current) forceDataUpdateRef.current(remote);
    setCloudData(remote);
    setShowConflict(false);
  }, []);

  if (cloudLoading || !migrationChecked) return <SkeletonLoader />;

  return (
    <>
      {showConflict && (
        <ConflictModal
          localVersion={conflictLocalVer}
          cloudVersion={conflictCloudVer}
          localTs={conflictLocalTs}
          cloudTs={conflictCloudTs}
          onKeepLocal={resolveKeepLocal}
          onKeepCloud={resolveKeepCloud}
        />
      )}
      {showMigration && !showConflict && (
        <MigrationModal
          user={user}
          onMigrated={(imported) => { setCloudData(imported); setShowMigration(false); }}
          onSkip={() => { setIsNewUser(true); setShowMigration(false); }}
        />
      )}
      <OpenFinanceApp
        saveToCloud={debouncedSave}
        loadFromCloud={() => Promise.resolve(cloudData)}
        user={user}
        onLogout={logout}
        onChangePassword={updatePassword}
        onSignOutOthers={signOutOthers}
        isNewUser={isNewUser}
        syncStatus={syncStatus}
        isOnline={isOnline}
        lastSyncedAt={lastSyncedAt}
        onRetrySync={handleRetrySync}
        onRegisterForceUpdate={(fn) => { forceDataUpdateRef.current = fn; }}
      />
    </>
  );
}

// ─────────────── ROOT ───────────────
function AppRouter() {
  const { user, authLoading, isPasswordRecovery } = useAuth();
  if (authLoading) return <SkeletonLoader />;
  if (isPasswordRecovery) return <SetNewPasswordPage />;
  if (!user) return <LoginPage />;
  return <AuthenticatedApp />;
}

export default function AppV2() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
