// src/components/PinGate.jsx
//
// PIN gate UI components and hooks.
//
// All hooks read PIN configuration from PinContext — no arguments needed
// at callsites.  The app wraps its main content in:
//   <PinContext.Provider value={{ pin, pinHash, email }}>
//
// Hooks:
//   usePinGate()      — gate a single action (button, confirm, etc.)
//   useSectionPin()   — gate a whole editable section (unlocks for 60s)
//   usePinRowGate()   — gate individual rows in a list
//
// When no PIN exists (usePinActive() === false):
//   All structural actions are BLOCKED.  A "PIN required" notice is shown
//   directing the user to set up their PIN.  Actions never pass through silently.
//
// Brute-force protection:
//   After 5 failed attempts the gate locks for 30 seconds.
//   The countdown is shown and "Forgot PIN?" remains accessible during lockout.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePinVerify, usePinActive, usePinConfig } from './PinContext';
import { supabase } from '../lib/supabase';

// ── Constants ─────────────────────────────────────────────────────────────────
const MAX_ATTEMPTS    = 5;
const LOCK_MS         = 30_000; // 30 seconds

// ── Shared styles ─────────────────────────────────────────────────────────────
const gateStyle = {
  background: '#1A1410', border: '1px solid #3A2A1E',
  borderRadius: '4px', padding: '12px 16px', marginTop: '8px',
};
const inputStyle = {
  background: '#0A0908', border: '1px solid #26221C', padding: '8px 12px',
  fontFamily: 'JetBrains Mono, monospace', color: '#E8E2D5',
  borderRadius: '3px', width: '100px', fontSize: '14px',
  letterSpacing: '0.3em', outline: 'none',
};
const linkStyle = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  fontSize: '11px', color: '#8B8478', padding: '0', textDecoration: 'underline',
  textDecorationColor: '#5C5648',
};

// ── No-PIN notice ─────────────────────────────────────────────────────────────
function NoPinNotice({ onClose }) {
  return (
    <div style={{ ...gateStyle, borderColor: '#3A2618', background: '#110D08' }}>
      <div style={{ fontSize: '11px', color: '#C56B5A', marginBottom: '5px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        PIN required
      </div>
      <div style={{ fontSize: '13px', color: '#B0A898', lineHeight: 1.6 }}>
        This action requires a PIN. Set up your PIN in Account Settings to continue.
      </div>
      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onClose && (
          <button onClick={onClose} style={linkStyle}>Dismiss</button>
        )}
      </div>
    </div>
  );
}

// ── Forgot PIN flow ───────────────────────────────────────────────────────────
// Inline replacement for the PIN input when the user clicks "Forgot PIN?".
// Submits a pin_reset_requests row and shows a confirmation.
// The pending action is NOT executed — the gate stays closed.
function ForgotPinFlow({ email, onClose }) {
  const [reason,     setReason]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [error,      setError]      = useState(null);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      if (!supabase) throw new Error('offline');
      const { error: err } = await supabase
        .from('pin_reset_requests')
        .insert({ user_email: (email || '').toLowerCase(), reason: reason.trim() || null });
      if (err) throw err;
      setDone(true);
    } catch (err) {
      if (err.message === 'offline') {
        setError('No connection. Email hello@royalledger.app to request a PIN reset.');
      } else {
        setError('Failed to submit. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div style={{ ...gateStyle, borderColor: '#2A4A20', background: '#0A0E08' }}>
        <div style={{ fontSize: '11px', color: '#7FA068', marginBottom: '5px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Request sent
        </div>
        <div style={{ fontSize: '13px', color: '#B0A898', lineHeight: 1.6 }}>
          PIN reset request sent. Royal Ledger support will review it and let you know.
        </div>
        <div style={{ marginTop: '10px' }}>
          <button onClick={onClose} style={linkStyle}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...gateStyle, borderColor: '#3A2618', background: '#110D08' }}>
      <div style={{ fontSize: '11px', color: '#D97757', marginBottom: '5px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        Forgot PIN?
      </div>
      <div style={{ fontSize: '12px', color: '#B0A898', marginBottom: '10px', lineHeight: 1.55 }}>
        Submit a reset request. An admin will approve it and you'll be prompted to set a new PIN.
      </div>
      <textarea
        value={reason}
        onChange={e => setReason(e.target.value)}
        placeholder="Reason (optional)…"
        rows={2}
        style={{
          width: '100%', background: '#0A0908', border: '1px solid #26221C',
          borderRadius: '3px', padding: '8px 10px', fontSize: '12px',
          color: '#E8E2D5', resize: 'none', fontFamily: 'inherit',
          outline: 'none', boxSizing: 'border-box', marginBottom: '10px',
        }}
      />
      {error && (
        <div style={{ fontSize: '12px', color: '#C56B5A', marginBottom: '8px', lineHeight: 1.4 }}>
          {error}
        </div>
      )}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            background: submitting ? '#26221C' : '#D97757', color: submitting ? '#8B8478' : '#0A0908',
            padding: '7px 14px', borderRadius: '3px', fontWeight: 600,
            fontSize: '12px', border: 'none', cursor: submitting ? 'default' : 'pointer',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Sending…' : 'Send request'}
        </button>
        <button onClick={onClose} disabled={submitting} style={linkStyle}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Lockout notice ────────────────────────────────────────────────────────────
function LockoutNotice({ seconds, onForgotPin }) {
  return (
    <div style={{ ...gateStyle, borderColor: '#3A2618', background: '#110D08' }}>
      <div style={{ fontSize: '11px', color: '#C56B5A', marginBottom: '5px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        Too many attempts
      </div>
      <div style={{ fontSize: '13px', color: '#B0A898', lineHeight: 1.6 }}>
        Too many incorrect attempts. Try again in{' '}
        <span style={{ color: '#D97757', fontFamily: 'JetBrains Mono, monospace' }}>{seconds}s</span>.
      </div>
      {onForgotPin && (
        <div style={{ marginTop: '10px' }}>
          <button onClick={onForgotPin} style={linkStyle}>Forgot PIN?</button>
        </div>
      )}
    </div>
  );
}

// ── PIN input inline ──────────────────────────────────────────────────────────
export function PinGateInline({ val, setVal, onConfirm, onCancel, error, loading, onForgotPin }) {
  return (
    <div style={gateStyle}>
      <div style={{ fontSize: '11px', color: '#8B8478', marginBottom: '6px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        Enter PIN to confirm
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="password" maxLength={6} value={val} autoFocus
          onChange={e => setVal(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyDown={e => e.key === 'Enter' && !loading && onConfirm()}
          placeholder="••••"
          style={inputStyle}
          disabled={loading}
        />
        <button
          onClick={onConfirm}
          disabled={loading}
          style={{
            background: loading ? '#8B8478' : '#D97757', color: '#0A0908',
            padding: '8px 16px', borderRadius: '3px', fontWeight: 600,
            fontSize: '12px', border: 'none', cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Verifying…' : 'Confirm'}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          style={{ background: 'transparent', color: '#B0A898', padding: '8px 12px', fontSize: '12px', border: 'none', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
      {error && (
        <div style={{ color: '#C56B5A', fontSize: '12px', marginTop: '6px' }}>
          Incorrect PIN. Try again.
        </div>
      )}
      {onForgotPin && (
        <div style={{ marginTop: '8px' }}>
          <button onClick={onForgotPin} style={linkStyle}>Forgot PIN?</button>
        </div>
      )}
    </div>
  );
}

// ── Internal: lockout timer hook ──────────────────────────────────────────────
// Returns { lockCountdown, onFailure, resetLockout }
// onFailure() increments the counter and arms the lock at attempt #5.
function useLockout() {
  const [failCount,   setFailCount]   = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null); // timestamp ms
  const [countdown,   setCountdown]   = useState(0);

  useEffect(() => {
    if (!lockedUntil) return;
    const tick = () => {
      const rem = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (rem <= 0) {
        setLockedUntil(null);
        setFailCount(0);
        setCountdown(0);
      } else {
        setCountdown(rem);
      }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [lockedUntil]);

  // Called after each wrong PIN
  const onFailure = useCallback((currentCount) => {
    const next = currentCount + 1;
    setFailCount(next);
    if (next >= MAX_ATTEMPTS) {
      setLockedUntil(Date.now() + LOCK_MS);
      setCountdown(Math.ceil(LOCK_MS / 1000));
    }
    return next;
  }, []);

  const resetLockout = useCallback(() => {
    setFailCount(0);
    setLockedUntil(null);
    setCountdown(0);
  }, []);

  return { failCount, countdown, isLocked: countdown > 0, onFailure, resetLockout };
}

// ── usePinGate — gate a single action ────────────────────────────────────────
// Usage:
//   const { attempt, gate, active } = usePinGate();
//   <button onClick={() => attempt(() => doThing())}>Do thing</button>
//   {gate}
export function usePinGate() {
  const verify  = usePinVerify();
  const hasPin  = usePinActive();
  const { email } = usePinConfig();

  const [pending,   setPending]   = useState(null);   // action fn waiting for PIN
  const [noPin,     setNoPin]     = useState(false);
  const [forgotPin, setForgotPin] = useState(false);
  const [val,       setVal]       = useState('');
  const [error,     setError]     = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { failCount, countdown, isLocked, onFailure, resetLockout } = useLockout();

  const attempt = (action) => {
    if (!hasPin) { setNoPin(true); return; }
    setPending(() => action);
    setVal(''); setError(false);
  };

  const confirm = async () => {
    if (verifying || isLocked) return;
    setVerifying(true);
    try {
      const ok = await verify(val);
      if (ok) {
        const fn = pending;
        setPending(null); setVal(''); setError(false); resetLockout();
        fn?.();
      } else {
        onFailure(failCount);
        setError(true); setVal('');
      }
    } finally {
      setVerifying(false);
    }
  };

  const cancel = () => {
    setPending(null); setVal(''); setError(false); setForgotPin(false);
  };

  const openForgot = () => { setForgotPin(true); };
  const closeForgot = () => { setForgotPin(false); cancel(); };

  const gate = noPin ? (
    <NoPinNotice onClose={() => setNoPin(false)} />
  ) : !pending ? null : forgotPin ? (
    <ForgotPinFlow email={email} onClose={closeForgot} />
  ) : isLocked ? (
    <LockoutNotice seconds={countdown} onForgotPin={openForgot} />
  ) : (
    <PinGateInline
      val={val} setVal={setVal}
      onConfirm={confirm} onCancel={cancel}
      error={error} loading={verifying}
      onForgotPin={openForgot}
    />
  );

  return { attempt, gate, active: !!pending || noPin };
}

// ── useSectionPin — gate an entire editable section ──────────────────────────
// Usage:
//   const { locked, requestUnlock, gate, unlocked } = useSectionPin();
//   Renders a lock button when locked; shows PIN inline when unlocking.
//   Automatically re-locks after 60 seconds.
export function useSectionPin() {
  const verify  = usePinVerify();
  const hasPin  = usePinActive();
  const { email } = usePinConfig();

  const [unlocked,   setUnlocked]   = useState(false);
  const [pending,    setPending]    = useState(false); // true | 'nopin'
  const [forgotPin,  setForgotPin]  = useState(false);
  const [val,        setVal]        = useState('');
  const [error,      setError]      = useState(false);
  const [verifying,  setVerifying]  = useState(false);
  const timerRef = useRef(null);
  const { failCount, countdown, isLocked, onFailure, resetLockout } = useLockout();

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);
  useEffect(() => { setUnlocked(false); setPending(false); setForgotPin(false); }, [hasPin]);

  const requestUnlock = () => {
    if (unlocked) return;
    if (!hasPin) { setPending('nopin'); setVal(''); setError(false); return; }
    setPending(true); setVal(''); setError(false);
  };

  const confirm = async () => {
    if (verifying || isLocked) return;
    setVerifying(true);
    try {
      const ok = await verify(val);
      if (ok) {
        setUnlocked(true);
        setPending(false); setVal(''); setError(false); resetLockout();
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setUnlocked(false), 60_000);
      } else {
        onFailure(failCount);
        setError(true); setVal('');
      }
    } finally {
      setVerifying(false);
    }
  };

  const cancel = () => { setPending(false); setVal(''); setError(false); setForgotPin(false); };

  const openForgot  = () => { setForgotPin(true); };
  const closeForgot = () => { setForgotPin(false); cancel(); };

  const gate = pending === 'nopin' ? (
    <NoPinNotice onClose={() => setPending(false)} />
  ) : !pending ? null : forgotPin ? (
    <ForgotPinFlow email={email} onClose={closeForgot} />
  ) : isLocked ? (
    <LockoutNotice seconds={countdown} onForgotPin={openForgot} />
  ) : (
    <PinGateInline
      val={val} setVal={setVal}
      onConfirm={confirm} onCancel={cancel}
      error={error} loading={verifying}
      onForgotPin={openForgot}
    />
  );

  // Always locked until the user successfully enters their PIN.
  const locked = !unlocked;

  return { unlocked, locked, requestUnlock, gate };
}

// ── usePinRowGate — gate individual rows in a list ───────────────────────────
// Usage:
//   const { attemptRow, gateFor } = usePinRowGate();
//   <button onClick={() => attemptRow(item.id, () => deleteItem(item.id))}>Delete</button>
//   {gateFor(item.id)}
export function usePinRowGate() {
  const verify  = usePinVerify();
  const hasPin  = usePinActive();
  const { email } = usePinConfig();

  const [row,       setRow]       = useState(null);   // { key, action, val, error }
  const [noPinKey,  setNoPinKey]  = useState(null);
  const [forgotKey, setForgotKey] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const { failCount, countdown, isLocked, onFailure, resetLockout } = useLockout();

  const attemptRow = (key, action) => {
    if (!hasPin) { setNoPinKey(key); return; }
    setRow({ key, action, val: '', error: false });
    setForgotKey(null);
  };

  const confirm = async () => {
    if (!row || verifying || isLocked) return;
    setVerifying(true);
    try {
      const ok = await verify(row.val);
      if (ok) {
        const fn = row.action;
        setRow(null); resetLockout();
        fn?.();
      } else {
        onFailure(failCount);
        setRow(r => ({ ...r, val: '', error: true }));
      }
    } finally {
      setVerifying(false);
    }
  };

  const cancel = () => { setRow(null); setForgotKey(null); };

  const gateFor = (key) => {
    if (noPinKey === key) {
      return <NoPinNotice onClose={() => setNoPinKey(null)} />;
    }
    if (row?.key === key) {
      if (forgotKey === key) {
        return <ForgotPinFlow email={email} onClose={() => { setForgotKey(null); cancel(); }} />;
      }
      if (isLocked) {
        return <LockoutNotice seconds={countdown} onForgotPin={() => setForgotKey(key)} />;
      }
      return (
        <PinGateInline
          val={row.val}
          setVal={v => setRow(r => ({ ...r, val: v }))}
          onConfirm={confirm}
          onCancel={cancel}
          error={row.error}
          loading={verifying}
          onForgotPin={() => setForgotKey(key)}
        />
      );
    }
    return null;
  };

  return { attemptRow, gateFor, activeKey: row?.key ?? noPinKey ?? null };
}
