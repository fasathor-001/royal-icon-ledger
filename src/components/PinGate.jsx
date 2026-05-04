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
export function usePinGate(pin) {
  const [pending, setPending] = useState(null);
  const [val, setVal] = useState('');
  const [error, setError] = useState(false);

  const attempt = (action) => {
    if (!pin) { action(); return; }
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

  const gate = pending ? (
    <PinGateInline val={val} setVal={setVal} onConfirm={confirm} onCancel={cancel} error={error} />
  ) : null;

  return { attempt, gate, active: !!pending };
}

// For section-level editing — unlocks all fields in a section for 60s after PIN
export function useSectionPin(pin) {
  const [unlocked, setUnlocked] = useState(false);
  const [pending, setPending] = useState(false);
  const [val, setVal] = useState('');
  const [error, setError] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // When pin changes (user sets/clears it), reset unlock state
  useEffect(() => { setUnlocked(false); }, [pin]);

  const requestUnlock = () => {
    if (!pin || unlocked) return;
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

  const gate = pending ? (
    <PinGateInline val={val} setVal={setVal} onConfirm={confirm} onCancel={cancel} error={error} />
  ) : null;

  // locked = PIN is set but not yet unlocked for this session
  const locked = !!pin && !unlocked;

  return { unlocked, locked, requestUnlock, gate };
}

// For list rows — tracks which row's gate is open by key
export function usePinRowGate(pin) {
  const [row, setRow] = useState(null); // { key, action, val, error }

  const attemptRow = (key, action) => {
    if (!pin) { action(); return; }
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

  const gateFor = (key) => row?.key === key ? (
    <PinGateInline
      val={row.val}
      setVal={v => setRow(r => ({ ...r, val: v }))}
      onConfirm={confirm}
      onCancel={cancel}
      error={row.error}
    />
  ) : null;

  return { attemptRow, gateFor, activeKey: row?.key };
}
