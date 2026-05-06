import React, { useState, useEffect, useRef } from 'react';

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

// Shown when a structural action is attempted but no PIN has been assigned yet
function NoPinNotice({ onClose }) {
  return (
    <div style={{ ...gateStyle, borderColor: '#3A2618', background: '#110D08' }}>
      <div style={{ fontSize: '11px', color: '#C56B5A', marginBottom: '5px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        PIN required
      </div>
      <div style={{ fontSize: '13px', color: '#8B8478', lineHeight: 1.6 }}>
        This action requires a PIN. No PIN has been assigned to your account yet.
        Contact your administrator to receive one.
      </div>
      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <a
          href="mailto:hello@royalledger.app"
          style={{ fontSize: '12px', color: '#D97757', textDecoration: 'none' }}
        >
          hello@royalledger.app
        </a>
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

export function PinGateInline({ val, setVal, onConfirm, onCancel, error }) {
  return (
    <div style={gateStyle}>
      <div style={{ fontSize: '11px', color: '#5C5648', marginBottom: '6px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        Enter PIN to confirm
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="password" maxLength={4} value={val} autoFocus
          onChange={e => setVal(e.target.value.replace(/\D/g, '').slice(0, 4))}
          onKeyDown={e => e.key === 'Enter' && onConfirm()}
          placeholder="••••"
          style={inputStyle}
        />
        <button
          onClick={onConfirm}
          style={{ background: '#D97757', color: '#0A0908', padding: '8px 16px', borderRadius: '3px', fontWeight: 600, fontSize: '12px', border: 'none', cursor: 'pointer' }}
        >
          Confirm
        </button>
        <button
          onClick={onCancel}
          style={{ background: 'transparent', color: '#8B8478', padding: '8px 12px', fontSize: '12px', border: 'none', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
      {error && <div style={{ color: '#C56B5A', fontSize: '12px', marginTop: '6px' }}>Incorrect PIN</div>}
    </div>
  );
}

// For single actions (reset, apply, unlock)
// No PIN → blocks the action and shows contact-admin notice (never silently passes through)
export function usePinGate(pin) {
  const [pending, setPending] = useState(null);
  const [noPin, setNoPin] = useState(false);
  const [val, setVal] = useState('');
  const [error, setError] = useState(false);

  const attempt = (action) => {
    if (!pin) {
      setNoPin(true);   // block + show notice
      return;
    }
    setPending(() => action);
    setVal(''); setError(false);
  };

  const confirm = () => {
    if (val === pin) {
      const fn = pending;
      setPending(null); setVal(''); setError(false);
      fn?.();
    } else {
      setError(true); setVal('');
    }
  };

  const cancel = () => { setPending(null); setVal(''); setError(false); };

  const gate = noPin ? (
    <NoPinNotice onClose={() => setNoPin(false)} />
  ) : pending ? (
    <PinGateInline val={val} setVal={setVal} onConfirm={confirm} onCancel={cancel} error={error} />
  ) : null;

  return { attempt, gate, active: !!pending || noPin };
}

// For section-level editing — unlocks all fields in a section for 60s after PIN
// No PIN → section stays locked, shows contact-admin notice on unlock attempt
export function useSectionPin(pin) {
  const [unlocked, setUnlocked] = useState(false);
  const [pending, setPending] = useState(false); // true = PIN input open, 'nopin' = no-pin notice
  const [val, setVal] = useState('');
  const [error, setError] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // When pin changes (admin assigns or clears it), reset unlock state
  useEffect(() => { setUnlocked(false); setPending(false); }, [pin]);

  const requestUnlock = () => {
    if (unlocked) return;
    if (!pin) {
      setPending('nopin');
      setVal('');
      setError(false);
      return;
    }
    setPending(true);
    setVal('');
    setError(false);
  };

  const confirm = () => {
    if (val === pin) {
      setUnlocked(true);
      setPending(false);
      setVal('');
      setError(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setUnlocked(false), 60000);
    } else {
      setError(true);
      setVal('');
    }
  };

  const cancel = () => { setPending(false); setVal(''); setError(false); };

  const gate = pending === 'nopin' ? (
    <NoPinNotice onClose={() => setPending(false)} />
  ) : pending ? (
    <PinGateInline val={val} setVal={setVal} onConfirm={confirm} onCancel={cancel} error={error} />
  ) : null;

  // locked = not yet unlocked (regardless of whether a PIN exists)
  // Without this change, !pin would make locked=false, bypassing all protection
  const locked = !unlocked;

  return { unlocked, locked, requestUnlock, gate };
}

// For list rows — tracks which row's gate is open by key
// No PIN → blocks the action and shows contact-admin notice in that row
export function usePinRowGate(pin) {
  const [row, setRow] = useState(null);   // { key, action, val, error } — PIN input open
  const [noPinKey, setNoPinKey] = useState(null); // key of row that hit no-pin wall

  const attemptRow = (key, action) => {
    if (!pin) {
      setNoPinKey(key);   // block + show notice in that row
      return;
    }
    setRow({ key, action, val: '', error: false });
  };

  const confirm = () => {
    if (row.val === pin) {
      const fn = row.action;
      setRow(null);
      fn?.();
    } else {
      setRow(r => ({ ...r, val: '', error: true }));
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
      />
    );
    return null;
  };

  return { attemptRow, gateFor, activeKey: row?.key ?? noPinKey ?? null };
}
