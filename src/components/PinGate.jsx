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
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import { usePinVerify, usePinActive } from './PinContext';

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

// ── No-PIN notice ─────────────────────────────────────────────────────────────
// Shown when a structural action is attempted but no PIN has been set up yet.
function NoPinNotice({ onClose }) {
  return (
    <div style={{ ...gateStyle, borderColor: '#3A2618', background: '#110D08' }}>
      <div style={{ fontSize: '11px', color: '#C56B5A', marginBottom: '5px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        PIN required
      </div>
      <div style={{ fontSize: '13px', color: '#8B8478', lineHeight: 1.6 }}>
        This action requires a PIN. Set up your PIN in Account Settings to continue.
      </div>
      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: 'transparent', color: '#5C5648', border: 'none', fontSize: '12px', cursor: 'pointer', padding: 0 }}
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

// ── PIN input inline ──────────────────────────────────────────────────────────
export function PinGateInline({ val, setVal, onConfirm, onCancel, error, loading }) {
  return (
    <div style={gateStyle}>
      <div style={{ fontSize: '11px', color: '#5C5648', marginBottom: '6px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
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
          style={{ background: loading ? '#5C5648' : '#D97757', color: '#0A0908', padding: '8px 16px', borderRadius: '3px', fontWeight: 600, fontSize: '12px', border: 'none', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? '…' : 'Confirm'}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          style={{ background: 'transparent', color: '#8B8478', padding: '8px 12px', fontSize: '12px', border: 'none', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
      {error && <div style={{ color: '#C56B5A', fontSize: '12px', marginTop: '6px' }}>Incorrect PIN. Try again.</div>}
    </div>
  );
}

// ── usePinGate — gate a single action ────────────────────────────────────────
// Usage:
//   const { attempt, gate, active } = usePinGate();
//   <button onClick={() => attempt(() => doThing())}>Do thing</button>
//   {gate}
export function usePinGate() {
  const verify  = usePinVerify();
  const hasPin  = usePinActive();

  const [pending,    setPending]    = useState(null);  // the action fn waiting for PIN
  const [noPin,      setNoPin]      = useState(false); // show no-pin notice
  const [val,        setVal]        = useState('');
  const [error,      setError]      = useState(false);
  const [verifying,  setVerifying]  = useState(false);

  const attempt = (action) => {
    if (!hasPin) { setNoPin(true); return; }
    setPending(() => action);
    setVal(''); setError(false);
  };

  const confirm = async () => {
    if (verifying) return;
    setVerifying(true);
    try {
      const ok = await verify(val);
      if (ok) {
        const fn = pending;
        setPending(null); setVal(''); setError(false);
        fn?.();
      } else {
        setError(true); setVal('');
      }
    } finally {
      setVerifying(false);
    }
  };

  const cancel = () => { setPending(null); setVal(''); setError(false); };

  const gate = noPin ? (
    <NoPinNotice onClose={() => setNoPin(false)} />
  ) : pending ? (
    <PinGateInline val={val} setVal={setVal} onConfirm={confirm} onCancel={cancel} error={error} loading={verifying} />
  ) : null;

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

  const [unlocked,   setUnlocked]   = useState(false);
  const [pending,    setPending]    = useState(false); // true | 'nopin'
  const [val,        setVal]        = useState('');
  const [error,      setError]      = useState(false);
  const [verifying,  setVerifying]  = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // Re-lock when PIN configuration changes (e.g. user sets up PIN)
  useEffect(() => { setUnlocked(false); setPending(false); }, [hasPin]);

  const requestUnlock = () => {
    if (unlocked) return;
    if (!hasPin) { setPending('nopin'); setVal(''); setError(false); return; }
    setPending(true); setVal(''); setError(false);
  };

  const confirm = async () => {
    if (verifying) return;
    setVerifying(true);
    try {
      const ok = await verify(val);
      if (ok) {
        setUnlocked(true);
        setPending(false); setVal(''); setError(false);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setUnlocked(false), 60000);
      } else {
        setError(true); setVal('');
      }
    } finally {
      setVerifying(false);
    }
  };

  const cancel = () => { setPending(false); setVal(''); setError(false); };

  const gate = pending === 'nopin' ? (
    <NoPinNotice onClose={() => setPending(false)} />
  ) : pending ? (
    <PinGateInline val={val} setVal={setVal} onConfirm={confirm} onCancel={cancel} error={error} loading={verifying} />
  ) : null;

  // Always locked until the user successfully enters their PIN.
  // (Previously: locked = !!pin && !unlocked, which let no-PIN users bypass.)
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

  const [row,       setRow]       = useState(null);   // { key, action, val, error }
  const [noPinKey,  setNoPinKey]  = useState(null);   // key of row that hit no-pin wall
  const [verifying, setVerifying] = useState(false);

  const attemptRow = (key, action) => {
    if (!hasPin) { setNoPinKey(key); return; }
    setRow({ key, action, val: '', error: false });
  };

  const confirm = async () => {
    if (!row || verifying) return;
    setVerifying(true);
    try {
      const ok = await verify(row.val);
      if (ok) {
        const fn = row.action;
        setRow(null);
        fn?.();
      } else {
        setRow(r => ({ ...r, val: '', error: true }));
      }
    } finally {
      setVerifying(false);
    }
  };

  const cancel = () => setRow(null);

  const gateFor = (key) => {
    if (noPinKey === key) return <NoPinNotice onClose={() => setNoPinKey(null)} />;
    if (row?.key === key) return (
      <PinGateInline
        val={row.val}
        setVal={v => setRow(r => ({ ...r, val: v }))}
        onConfirm={confirm}
        onCancel={cancel}
        error={row.error}
        loading={verifying}
      />
    );
    return null;
  };

  return { attemptRow, gateFor, activeKey: row?.key ?? noPinKey ?? null };
}
