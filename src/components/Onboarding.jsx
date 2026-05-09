// src/components/Onboarding.jsx
//
// 10-step welcome flow shown on first launch.
// Sets up currency, timezone, income type, expenses, spending budget,
// buffer target, starting balances, PIN (mandatory, hashed), and notifications.

import React, { useState, useRef } from 'react';
import {
  Heart, ArrowRight, Check, X, Plus, Wallet, Shield,
  Briefcase, Sparkles, Users, Bell, Lock, TrendingUp, Landmark, Info, Mail,
} from 'lucide-react';
import { CURRENCIES, makeFmt, getCurrency, flagUrl } from '../lib/currency';
import { TIMEZONES, offsetLabel, normalizeTimezone } from '../lib/timezones';
import { hashPin } from '../lib/pinHash';

const SUGGESTED_EXPENSES = [
  { name: 'Rent / Bond',         category: 'Housing',         placeholder: '0', fixed: true  },
  { name: 'Utilities',           category: 'Utilities',       placeholder: '0'               },
  { name: 'Groceries',           category: 'Food',            placeholder: '0', variable: true },
  { name: 'Transport / Fuel',    category: 'Transportation',  placeholder: '0', variable: true },
  { name: 'Phone / Internet',    category: 'Subscriptions',   placeholder: '0'               },
  { name: 'Insurance',           category: 'Insurance',       placeholder: '0'               },
  { name: 'School / Childcare',  category: 'Childcare/Kids',  placeholder: '0'               },
  { name: 'Family support',      category: 'Family support',  placeholder: '0', variable: true },
];

// ── Smart envelope defaults ──────────────────────────────────────────────────
// Case-insensitive partial-match keywords used to pre-toggle envelope tracking.
const ENVELOPE_ON_KEYWORDS  = ['groceries', 'food', 'transport', 'petrol', 'fuel', 'family', 'kids', 'household'];
const ENVELOPE_OFF_KEYWORDS = ['rent', 'bond', 'mortgage', 'insurance', 'school', 'phone'];

function getDefaultEnvelopeTracking(name) {
  const lower = name.toLowerCase();
  if (ENVELOPE_OFF_KEYWORDS.some(k => lower.includes(k))) return false;
  if (ENVELOPE_ON_KEYWORDS.some(k => lower.includes(k))) return true;
  return false; // unknown expense — default off
}

// TIMEZONES is imported from src/lib/timezones.js (13-entry curated IANA list).

function InfoPopover({ label, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: '12px', color: '#B0A898', fontWeight: 600, letterSpacing: '0.05em',
          background: '#14110E', border: '1px solid #26221C', borderRadius: '4px',
          padding: '8px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        }}
      >
        <Info size={13} style={{ color: '#D97757', flexShrink: 0 }} /> {label}
      </button>
      {open && (
        <div style={{
          position: 'absolute', left: 0, top: 'calc(100% + 6px)',
          zIndex: 200, width: 320, maxWidth: 'calc(100vw - 48px)',
          background: '#14110E', border: '1px solid #26221C', borderRadius: '4px',
          padding: '14px 16px', fontSize: '13px', color: '#8B8478', lineHeight: 1.7,
          boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function Onboarding({ data, setData, onComplete, userEmail = '' }) {
  const [step, setStep] = useState(1);

  // ── Existing step state ──────────────────────────────────────────────────
  const [selectedCurrency, setSelectedCurrency] = useState(data.currency ?? 'ZAR');
  const [incomeType, setIncomeType] = useState(null);
  const [expenseValues, setExpenseValues] = useState({});
  const [customExpenses, setCustomExpenses] = useState([]);
  const [spendingBudget, setSpendingBudget] = useState('');
  const [bufferReserve, setBufferReserve] = useState('');
  const [bufferMonths, setBufferMonths] = useState(null);
  const [timezoneOffset, setTimezoneOffset] = useState(() => Math.round(-(new Date().getTimezoneOffset()) / 60));
  const [timezoneIana, setTimezoneIana] = useState(() => {
    const detectedOffset = Math.round(-(new Date().getTimezoneOffset()) / 60);
    const { iana } = normalizeTimezone(detectedOffset, data.currency ?? 'ZAR');
    return iana; // null if ambiguous — user must click a tile to set it explicitly
  });
  const [morningTime, setMorningTime] = useState('08:00');
  const [eveningTime, setEveningTime] = useState('18:00');

  // ── New step state (Step 8: balances, Step 9: PIN) ──────────────────────
  const [startingBuffer, setStartingBuffer] = useState(data.buffer ?? 0);
  const [startingTradingCapital, setStartingTradingCapital] = useState(data.tradingCapital ?? 0);
  const [startingLongTerm, setStartingLongTerm] = useState(data.longTerm ?? 0);
  const [pinValue, setPinValue] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');

  // ── Envelope tracking (Step 5) ───────────────────────────────────────────
  // keyed by suggested expense name; value: true/false
  // Initialised with smart defaults — variable categories pre-toggled on.
  const [envelopeTracking, setEnvelopeTracking] = useState(() => {
    const defaults = {};
    SUGGESTED_EXPENSES.forEach(s => {
      if (!s.fixed) defaults[s.name] = getDefaultEnvelopeTracking(s.name);
    });
    return defaults;
  });
  // keyed by suggested expense name; value: 'reset' | 'rollover' | 'sweep'
  const [envelopeMode, setEnvelopeMode] = useState({});
  // Gate shown when user tries to advance past Step 5 with untracked variable costs
  const [showEnvelopeGate, setShowEnvelopeGate] = useState(false);

  // ── Notification permission state (Step 10: Summary) ────────────────────
  const [notifStatus, setNotifStatus] = useState('idle'); // 'idle' | 'granted' | 'denied'

  // ── User-testing telemetry (console only, no external deps) ─────────────
  React.useEffect(() => { console.log('[rl] onboarding_start'); }, []);
  React.useEffect(() => { if (step === 5) console.log('[rl] step_5_enter'); }, [step]);

  const fmt = makeFmt(selectedCurrency);
  const currencySymbol = getCurrency(selectedCurrency).symbol;

  // Computed totals
  const expenseTotal = Object.values(expenseValues).reduce((s, v) => s + (Number(v) || 0), 0)
    + customExpenses.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const salary = expenseTotal + (Number(spendingBudget) || 0) + (Number(bufferReserve) || 0);
  const bufferTarget = salary * (bufferMonths || 18);

  const totalSteps = 10;

  const next = () => setStep(s => Math.min(s + 1, totalSteps));
  const back = () => setStep(s => Math.max(s - 1, 1));

  // ── Step 5 → 6 gate: remind user to set envelopes for variable costs ────
  const handleStep5Next = () => {
    const untrackedVariable = SUGGESTED_EXPENSES.filter(s =>
      s.variable &&
      (Number(expenseValues[s.name]) || 0) > 0 &&
      !envelopeTracking[s.name]
    );
    if (untrackedVariable.length > 0) {
      setShowEnvelopeGate(true);
    } else {
      console.log('[rl] step_5_exit');
      next();
    }
  };

  // ── finish() — writes all collected data in one setData call ─────────────
  const finish = async () => {
    // Convert expense values to expense records, and build linked envelopes
    const expenses = [];

    // Discretionary envelope — always created first from Stage 6 spending budget.
    // All spending logged without a specific envelope auto-routes here.
    // Defaults to 'roll' — unused money carries into next month, rewarding discipline.
    const newEnvelopes = [{
      id: 'env_discretionary',
      name: 'Discretionary',
      cap: Number(spendingBudget) || 0,
      blockMode: 'soft',
      rolloverMode: 'roll',
      icon: 'personal',
      isDiscretionary: true,
    }];

    SUGGESTED_EXPENSES.forEach(s => {
      const v = Number(expenseValues[s.name]) || 0;
      if (v > 0) {
        const expId = Date.now() + Math.random();
        const tracked = !!envelopeTracking[s.name];
        expenses.push({
          id: expId,
          name: s.name,
          amount: v,
          category: s.category,
          trackInEnvelope: tracked,
        });
        if (tracked) {
          newEnvelopes.push({
            id: `env_${expId}`,
            name: s.name,
            cap: v,
            blockMode: 'soft',
            rolloverMode: envelopeMode[s.name] || 'reset',
            icon: 'other',
            fromExpenseId: expId,
          });
        }
      }
    });

    customExpenses.forEach(c => {
      if (c.amount > 0 && c.name) {
        const expId = Date.now() + Math.random();
        const tracked = !!c.trackInEnvelope;
        expenses.push({
          id: expId,
          name: c.name,
          amount: Number(c.amount),
          category: c.category || 'Other',
          trackInEnvelope: tracked,
        });
        if (tracked) {
          newEnvelopes.push({
            id: `env_${expId}`,
            name: c.name,
            cap: Number(c.amount),
            blockMode: 'soft',
            rolloverMode: c.rolloverMode || 'reset',
            icon: 'other',
            fromExpenseId: expId,
          });
        }
      }
    });

    // Hash PIN before calling setData (await cannot be inside the updater callback)
    const newPinHash = await hashPin(pinValue.trim(), userEmail);

    setData(d => ({
      ...d,
      // ── Onboarding timestamp — written once, never overwritten ──
      // Used for time-based nudges and graduation timing.
      createdAt: d.createdAt || new Date().toISOString(),
      // ── Existing fields (unchanged) ──
      expenses,
      envelopes: [...(d.envelopes || []), ...newEnvelopes],
      currency: selectedCurrency,
      incomeType,
      spendingBudget: Number(spendingBudget) || 0,
      bufferReserve: Number(bufferReserve) || 0,
      bufferTargetMonths: bufferMonths || 18,
      bufferProtectMonths: Math.max(1, (bufferMonths || 18) - 2),
      setupComplete: true,
      // Month the user first completed setup (YYYY-MM).
      // Used to suppress spurious "last month carried forward" on first month.
      setupMonth: d.setupMonth || (() => {
        const n = new Date();
        return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
      })(),
      mode: incomeType === 'foundation' ? 'foundation' : 'standard',
      notificationPreferences: {
        dailyEnabled: true,
        weeklyEnabled: true,
        monthlyEnabled: true,
        timezoneOffset,
        timezoneIana,
        morningTime,
        eveningTime,
      },
      // ── New fields (Step 8: starting balances) ──
      buffer: Number(startingBuffer) || 0,
      tradingCapital: Number(startingTradingCapital) || 0,
      longTerm: Number(startingLongTerm) || 0,
      // ── New fields (Step 9: PIN — hashed, user-owned) ──
      pinHash: newPinHash,
      overridePin: '', // clear any legacy plain-text PIN
    }));
    console.log('[rl] onboarding_complete');
    onComplete();
  };

  // ── skip() — unchanged ────────────────────────────────────────────────────
  const skip = () => {
    setData(d => ({ ...d, setupComplete: true }));
    onComplete();
  };

  // ── Notification permission request (Step 10) ─────────────────────────────
  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      setNotifStatus('denied');
      setData(d => ({ ...d, notificationPreferences: { ...d.notificationPreferences, permissionGranted: false, dailyEnabled: false, weeklyEnabled: false } }));
      return;
    }
    try {
      const result = await Notification.requestPermission();
      const granted = result === 'granted';
      setNotifStatus(granted ? 'granted' : 'denied');
      // Persist the actual permission result so the app respects it after onboarding
      setData(d => ({
        ...d,
        notificationPreferences: {
          ...d.notificationPreferences,
          permissionGranted: granted,
          dailyEnabled:   granted,
          weeklyEnabled:  granted,
          monthlyEnabled: granted,
        },
      }));
    } catch {
      setNotifStatus('denied');
    }
  };

  // ── Validation per step ───────────────────────────────────────────────────
  const pinIsValid = /^\d{4,6}$/.test(pinValue.trim()) && pinValue.trim() === pinConfirm.trim();

  const canAdvance = () => {
    if (step === 1)  return true;
    if (step === 2)  return true;                          // currency always has a default
    if (step === 3)  return true;                          // timezone always auto-detected
    if (step === 4)  return incomeType !== null;
    if (step === 5)  return expenseTotal > 0;
    if (step === 6)  return Number(spendingBudget) > 0;
    if (step === 7)  return incomeType === 'foundation' || bufferMonths !== null; // Foundation uses staged milestones, no picker needed
    if (step === 8)  return true;                          // starting balances — always ok
    if (step === 9)  return pinIsValid;                    // mandatory: 4–6 digits, must match confirm
    if (step === 10) return true;                          // summary
    return true;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0A0908',
        zIndex: 1000,
        overflow: 'auto',
        color: '#E8E2D5',
        fontFamily: 'Inter, system-ui, sans-serif',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .ob-display { font-family: 'Fraunces', Georgia, serif; font-weight: 400; }
        .ob-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }
        .ob-label { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 600; }
        .ob-input { background: #0A0908; border: 1px solid #26221C; padding: 11px 13px; font-family: 'JetBrains Mono', monospace; outline: none; color: #E8E2D5; border-radius: 3px; width: 100%; font-size: 14px; }
        .ob-input:focus { border-color: #D97757; }
        .ob-input-text { background: #0A0908; border: 1px solid #26221C; padding: 11px 13px; outline: none; color: #E8E2D5; border-radius: 3px; width: 100%; font-size: 14px; }
        .ob-input-text:focus { border-color: #D97757; }
        .ob-card { background: #14110E; border: 1px solid #26221C; border-radius: 4px; padding: 24px; transition: all 200ms; cursor: pointer; }
        .ob-card:hover { border-color: #3A2A1E; }
        .ob-card-selected { background: #1A1410; border-color: #D97757; box-shadow: 0 0 0 1px #D9775740; }
        .ob-btn-primary { background: #D97757; color: #0A0908; padding: 14px 24px; font-weight: 600; border-radius: 4px; font-size: 14px; cursor: pointer; transition: all 150ms; border: none; display: flex; align-items: center; gap: 8px; }
        .ob-btn-primary:hover:not(:disabled) { background: #E08868; }
        .ob-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .ob-btn-ghost { background: transparent; color: #B0A898; padding: 14px 24px; font-size: 14px; cursor: pointer; border: none; }
        .ob-btn-ghost:hover { color: #E8E2D5; }
        .ob-progress-dot { width: 8px; height: 8px; border-radius: 50%; transition: all 200ms; }
        .ob-input.ob-amount-input { width: 110px; text-align: right; }
        @keyframes obStepIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .ob-step { animation: obStepIn 280ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .ob-btn-primary { -webkit-tap-highlight-color: transparent; }
        .ob-btn-ghost { -webkit-tap-highlight-color: transparent; }
        @media (max-width: 480px) {
          .ob-input.ob-amount-input { width: 72px; }
          .ob-exp-name { min-width: 0; }
          .ob-hero { font-size: 36px !important; }
        }
      `}</style>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px', paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
        {/* Progress dots — auto-scales with totalSteps */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '48px' }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="ob-progress-dot"
              style={{ background: i + 1 <= step ? '#D97757' : '#26221C' }}
            />
          ))}
        </div>

        {/* Step content — keyed on step so the slide-in animation fires on every advance */}
        <div key={step} className="ob-step">

        {/* ── STEP 1: WELCOME ──────────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <Heart size={32} style={{ color: '#D97757', marginBottom: '24px' }} />
            <h1 className="ob-display ob-hero" style={{ fontSize: '48px', lineHeight: 1.1, marginBottom: '28px', fontWeight: 300 }}>
              Welcome to <span style={{ fontStyle: 'italic', color: '#D97757' }}>Royal Ledger</span>.
            </h1>
            <p style={{ fontSize: '17px', lineHeight: 1.85, color: '#E8E2D5', marginBottom: '16px' }}>
              If managing money has felt inconsistent or overwhelming, this is where you start.
            </p>
            <p style={{ fontSize: '16px', lineHeight: 1.85, color: '#B0A898', marginBottom: '16px' }}>
              You don't need perfect habits.<br />
              You don't need a plan.
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.85, color: '#8B8478', marginBottom: '24px' }}>
              We'll just look at your numbers and build from there.
            </p>
            <p style={{ fontSize: '13px', color: '#5C5648', lineHeight: 1.65, marginBottom: '32px' }}>
              This will only take a few minutes.
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button onClick={next} className="ob-btn-primary">
                Begin <ArrowRight size={16} />
              </button>
              <button onClick={skip} className="ob-btn-ghost">Skip setup</button>
            </div>
          </div>
        )}

        {/* ── STEP 2: CURRENCY ─────────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <div className="ob-label" style={{ color: '#D97757', marginBottom: '12px' }}>Step {step} of {totalSteps}</div>
            <h1 className="ob-display" style={{ fontSize: '36px', lineHeight: 1.2, marginBottom: '12px', fontWeight: 300 }}>
              Choose your <span style={{ fontStyle: 'italic', color: '#D97757' }}>currency</span>.
            </h1>
            <p style={{ color: '#B0A898', marginBottom: '32px', fontSize: '15px' }}>
              All amounts and symbols will use this currency. Choose carefully — this is locked after setup.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '40px' }}>
              {CURRENCIES.map(({ code, symbol, name, cc }) => {
                const active = selectedCurrency === code;
                return (
                  <button
                    key={code}
                    onClick={() => setSelectedCurrency(code)}
                    style={{
                      background: active ? '#1E1A10' : '#14110E',
                      border: `1px solid ${active ? '#D97757' : '#26221C'}`,
                      borderRadius: '8px',
                      padding: '16px 14px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 150ms',
                    }}
                  >
                    <img
                      src={flagUrl(cc)}
                      alt={name}
                      style={{ width: '36px', height: '27px', objectFit: 'cover', borderRadius: '3px', marginBottom: '8px', display: 'block' }}
                    />
                    <div style={{ fontSize: '16px', fontWeight: 700, color: active ? '#D97757' : '#E8E2D5', fontFamily: 'JetBrains Mono, monospace' }}>{symbol} {code}</div>
                    <div style={{ fontSize: '11px', color: '#8B8478', marginTop: '3px' }}>{name}</div>
                    {active && <div style={{ marginTop: '8px' }}><Check size={13} style={{ color: '#D97757' }} /></div>}
                  </button>
                );
              })}
            </div>
            <NavRow back={back} next={next} canAdvance={canAdvance()} />
          </div>
        )}

        {/* ── STEP 3: NOTIFICATION TIMING ──────────────────────────────────── */}
        {step === 3 && (
          <div>
            <div className="ob-label" style={{ color: '#D97757', marginBottom: '12px' }}>Step {step} of {totalSteps}</div>
            <Bell size={28} style={{ color: '#D97757', marginBottom: '16px' }} />
            <h1 className="ob-display" style={{ fontSize: '36px', lineHeight: 1.2, marginBottom: '12px', fontWeight: 300 }}>
              When should we <span style={{ fontStyle: 'italic', color: '#D97757' }}>remind</span> you?
            </h1>
            <p style={{ color: '#B0A898', marginBottom: '28px', fontSize: '15px' }}>
              Set your timezone and preferred times for morning and evening check-ins. You can change these later in Settings.
            </p>

            {/* Timezone */}
            <div style={{ marginBottom: '28px' }}>
              <div className="ob-label" style={{ color: '#8B8478', marginBottom: '10px' }}>Your timezone</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                {TIMEZONES.map(tz => {
                  const active = timezoneIana
                    ? timezoneIana === tz.iana
                    : timezoneOffset === tz.offset;
                  return (
                    <button
                      key={tz.iana}
                      onClick={() => { setTimezoneIana(tz.iana); setTimezoneOffset(tz.offset); }}
                      style={{
                        background: active ? '#1A1410' : '#14110E',
                        border: `1px solid ${active ? '#D97757' : '#26221C'}`,
                        borderRadius: '6px', padding: '10px 14px', cursor: 'pointer',
                        textAlign: 'left', transition: 'all 150ms',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: active ? '#D97757' : '#E8E2D5' }}>{tz.label}</div>
                        {active && <Check size={11} style={{ color: '#D97757', flexShrink: 0 }} />}
                      </div>
                      <div style={{ fontSize: '11px', color: '#8B8478', marginTop: '3px', fontFamily: 'JetBrains Mono, monospace' }}>
                        {offsetLabel(tz.offset)}{tz.hasDst ? ' · DST' : ''}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Morning & Evening times */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              <div>
                <div className="ob-label" style={{ color: '#8B8478', marginBottom: '8px' }}>Morning reminder</div>
                <input
                  type="time"
                  value={morningTime}
                  onChange={e => setMorningTime(e.target.value)}
                  className="ob-input"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
                <div style={{ fontSize: '11px', color: '#8B8478', marginTop: '6px' }}>Daily + Sunday morning check</div>
              </div>
              <div>
                <div className="ob-label" style={{ color: '#8B8478', marginBottom: '8px' }}>Evening reminder</div>
                <input
                  type="time"
                  value={eveningTime}
                  onChange={e => setEveningTime(e.target.value)}
                  className="ob-input"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
                <div style={{ fontSize: '11px', color: '#8B8478', marginTop: '6px' }}>End-of-day wrap-up</div>
              </div>
            </div>

            <NavRow back={back} next={next} canAdvance={canAdvance()} />
          </div>
        )}

        {/* ── STEP 4: INCOME TYPE ──────────────────────────────────────────── */}
        {step === 4 && (
          <div>
            <div className="ob-label" style={{ color: '#D97757', marginBottom: '12px' }}>Step {step} of {totalSteps}</div>
            <h1 className="ob-display" style={{ fontSize: '36px', lineHeight: 1.2, marginBottom: '12px', fontWeight: 300 }}>
              How does <span style={{ fontStyle: 'italic', color: '#D97757' }}>income</span> reach you?
            </h1>
            <p style={{ color: '#B0A898', marginBottom: '32px', fontSize: '15px' }}>
              This adjusts the system's defaults. Variable income needs a bigger buffer; fixed income needs less. You can update this later in Settings.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
              {[
                { id: 'foundation', icon: Sparkles, title: 'Foundation', desc: 'Allowance, student income, small gigs, or irregular money you\'re still learning to manage.', defaultMonths: 3,  badge: 'New to budgeting?' },
                { id: 'variable',   icon: Briefcase, title: 'Variable',   desc: 'Trading, freelance, commissions, business ownership. Some months great, some months tough.', defaultMonths: 18 },
                { id: 'fixed',      icon: Wallet,    title: 'Fixed',      desc: 'Salary, pension, regular employment. Same amount every month.', defaultMonths: 6 },
                { id: 'mixed',      icon: Users,     title: 'Mixed',      desc: 'Salary plus side hustle, or one partner stable + one variable.', defaultMonths: 9 },
              ].map(opt => {
                const Icon = opt.icon;
                const selected = incomeType === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      setIncomeType(opt.id);
                      if (bufferMonths === null) setBufferMonths(opt.defaultMonths);
                    }}
                    className={`ob-card ${selected ? 'ob-card-selected' : ''}`}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <Icon size={20} style={{ color: selected ? '#D97757' : '#B0A898', marginTop: '2px', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 500, fontSize: '16px' }}>{opt.title}</span>
                          {opt.badge && (
                            <span style={{ fontSize: '9px', color: '#7FA068', background: '#1A2A1E', border: '1px solid #2A4A2A', borderRadius: '999px', padding: '2px 7px', fontWeight: 600, letterSpacing: '0.06em' }}>
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <div style={{ color: '#B0A898', fontSize: '14px', lineHeight: 1.5 }}>{opt.desc}</div>
                      </div>
                      {selected && <Check size={18} style={{ color: '#D97757', marginLeft: 'auto', flexShrink: 0 }} />}
                    </div>
                  </div>
                );
              })}
            </div>

            <NavRow back={back} next={next} canAdvance={canAdvance()} />
          </div>
        )}

        {/* ── STEP 5: EXPENSES ─────────────────────────────────────────────── */}
        {step === 5 && (
          <div>
            <div className="ob-label" style={{ color: '#D97757', marginBottom: '12px' }}>Step {step} of {totalSteps}</div>
            <h1 className="ob-display" style={{ fontSize: '36px', lineHeight: 1.2, marginBottom: '12px', fontWeight: 300 }}>
              Your <span style={{ fontStyle: 'italic', color: '#D97757' }}>real</span> monthly expenses
            </h1>
            <p style={{ color: '#B0A898', marginBottom: '12px', fontSize: '15px', lineHeight: 1.7 }}>
              Add everything that costs you money.<br />
              Turn on tracking for categories you want to actively control month to month — like groceries, transport, or family spending.
            </p>
            <p style={{ fontSize: '13px', color: '#8B8478', lineHeight: 1.65, marginBottom: '8px' }}>
              You don't need to get this perfect.
            </p>
            <p style={{ fontSize: '14px', color: '#8B8478', lineHeight: 1.7, marginBottom: '6px', fontStyle: 'italic' }}>
              We're not trying to fix everything. We're just trying to see clearly first.
            </p>
            <p style={{ fontSize: '12px', color: '#5C5648', lineHeight: 1.65, marginBottom: '16px' }}>
              Most people don't fail because they lack discipline. They fail because they never had structure.
            </p>

            {/* How does this work? — floating popover */}
            <InfoPopover label="How does envelope tracking work?">
              <p style={{ margin: '0 0 8px' }}>
                <strong style={{ color: '#B0A898' }}>Fixed expenses</strong> (rent, insurance, phone) are predictable — no envelope needed. Just enter the amount.
              </p>
              <p style={{ margin: '0 0 8px' }}>
                <strong style={{ color: '#B0A898' }}>Variable expenses</strong> (groceries, transport, family support) can creep over budget. Tap the envelope icon to create a Budget envelope that tracks your spending against the cap you set here.
              </p>
              <p style={{ margin: '0 0 8px' }}>Once the envelope is on, pick what happens at the end of each month:</p>
              <p style={{ margin: '0 0 4px' }}>🔄 <strong style={{ color: '#B0A898' }}>Reset</strong> — cap starts fresh at full every month.</p>
              <p style={{ margin: '0 0 4px' }}>➕ <strong style={{ color: '#B0A898' }}>Rollover</strong> — unspent balance carries forward.</p>
              <p style={{ margin: 0 }}>💧 <strong style={{ color: '#B0A898' }}>Sweep</strong> — unspent balance moves to your Savings automatically.</p>
            </InfoPopover>

            <div style={{ background: '#1A1410', border: '1px solid #3A2A1E', borderRadius: '4px', padding: '16px', marginBottom: '24px' }}>
              <div className="ob-label" style={{ color: '#D97757', marginBottom: '8px' }}>Running total</div>
              <div className="ob-display" style={{ fontSize: '32px', fontWeight: 300 }}>{fmt(expenseTotal)}</div>
            </div>

            {/* Smart-default explanation */}
            <p style={{ fontSize: '12px', color: '#8B8478', marginBottom: '12px', lineHeight: 1.6 }}>
              We pre-selected variable expenses that are worth tracking in envelopes. Fixed bills stay off by default.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              {SUGGESTED_EXPENSES.map(item => {
                const hasValue = (Number(expenseValues[item.name]) || 0) > 0;
                const tracked = !!envelopeTracking[item.name];
                const mode = envelopeMode[item.name] || 'reset';
                const isFixed = !!item.fixed;
                return (
                  <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {/* Main row */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div className="ob-exp-name" style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.name}</span>
                          {item.variable && <span style={{ fontSize: '9px', color: '#D97757', background: '#2A1A0E', border: '1px solid #3A2A1E', borderRadius: '999px', padding: '1px 6px', letterSpacing: '0.08em', fontWeight: 600 }}>VARIABLE</span>}
                          {isFixed && <span style={{ fontSize: '9px', color: '#8B8478', background: '#14110E', border: '1px solid #26221C', borderRadius: '999px', padding: '1px 6px', letterSpacing: '0.08em', fontWeight: 600 }}>FIXED</span>}
                        </div>
                        <div style={{ fontSize: '11px', color: '#8B8478' }}>{item.category}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="ob-mono" style={{ color: '#8B8478' }}>{currencySymbol}</span>
                        <input
                          type="number"
                          placeholder={item.placeholder}
                          value={expenseValues[item.name] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExpenseValues(v => ({ ...v, [item.name]: val }));
                            // Auto-enable envelope for any non-fixed expense the moment a value is entered.
                            // Fixed expenses remain locked. Once on, clearing to 0 does NOT turn it off.
                            if (!item.fixed && (Number(val) || 0) > 0) {
                              setEnvelopeTracking(t => t[item.name] ? t : { ...t, [item.name]: true });
                            }
                          }}
                          className="ob-input ob-amount-input"
                        />
                      </div>
                      {/* Envelope toggle — locked for fixed expenses */}
                      {isFixed ? (
                        <div
                          title="Fixed bill — counted in your salary calculation, not tracked as an envelope"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '34px', height: '32px',
                            border: '1px solid #26221C', borderRadius: '3px',
                            opacity: 0.25, cursor: 'not-allowed', flexShrink: 0,
                          }}
                        >
                          <Mail size={14} color="#8B8478" />
                        </div>
                      ) : (
                        <button
                          onClick={() => setEnvelopeTracking(t => ({ ...t, [item.name]: !t[item.name] }))}
                          disabled={!hasValue}
                          title={tracked ? 'Remove Budget envelope' : 'Track in Budget envelope'}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '34px', height: '32px',
                            background: tracked ? '#1A2A1E' : 'transparent',
                            border: `1px solid ${tracked ? '#7FA068' : hasValue ? '#5C5648' : '#26221C'}`,
                            borderRadius: '3px',
                            cursor: hasValue ? 'pointer' : 'not-allowed',
                            opacity: hasValue ? 1 : 0.3,
                            transition: 'all 150ms',
                            flexShrink: 0,
                          }}
                        >
                          <Mail size={14} color={tracked ? '#7FA068' : '#8B8478'} />
                        </button>
                      )}
                    </div>
                    {/* Fixed bill helper text */}
                    {isFixed && (
                      <p style={{ fontSize: '11px', color: '#5C5648', margin: '0 0 2px 2px', lineHeight: 1.5 }}>
                        Fixed bill — counted in your salary calculation, not tracked as an envelope.
                      </p>
                    )}
                    {/* Month-end mode pills — shown only when envelope is active */}
                    {tracked && !isFixed && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', paddingLeft: '4px', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#5C5648', marginRight: '2px', letterSpacing: '0.05em' }}>Month-end:</span>
                        {[
                          { id: 'reset',    label: '🔄 Reset',    tip: 'Cap resets to full each month. Unspent balance disappears.' },
                          { id: 'roll',     label: '➕ Rollover', tip: 'Leftover carries into next month. Overspend is deducted.' },
                          { id: 'sweep',    label: '💧 Sweep',    tip: 'Leftover moves to your Buffer. Cap resets to full.' },
                        ].map(m => (
                          <button
                            key={m.id}
                            onClick={() => setEnvelopeMode(em => ({ ...em, [item.name]: m.id }))}
                            title={m.tip}
                            style={{
                              background: mode === m.id ? '#1A2A1E' : 'transparent',
                              border: `1px solid ${mode === m.id ? '#7FA068' : '#26221C'}`,
                              borderRadius: '999px',
                              padding: '3px 10px',
                              fontSize: '11px',
                              color: mode === m.id ? '#7FA068' : '#8B8478',
                              cursor: 'pointer',
                              fontFamily: 'Inter, sans-serif',
                              transition: 'all 120ms',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {customExpenses.map((c, i) => {
                const hasValue = (Number(c.amount) || 0) > 0;
                const cMode = c.rolloverMode || 'reset';
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {/* Main row */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Expense name"
                        value={c.name}
                        onChange={(e) => {
                          const updated = [...customExpenses];
                          updated[i] = { ...updated[i], name: e.target.value };
                          setCustomExpenses(updated);
                        }}
                        className="ob-input-text"
                        style={{ flex: 1, minWidth: 0 }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="ob-mono" style={{ color: '#8B8478' }}>{currencySymbol}</span>
                        <input
                          type="number"
                          value={c.amount}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = [...customExpenses];
                            // Auto-enable envelope when a value is first entered.
                            // Once on, clearing to 0 does NOT turn it off.
                            const shouldEnable = !updated[i].trackInEnvelope && (Number(val) || 0) > 0;
                            updated[i] = { ...updated[i], amount: val, ...(shouldEnable ? { trackInEnvelope: true } : {}) };
                            setCustomExpenses(updated);
                          }}
                          className="ob-input ob-amount-input"
                        />
                      </div>
                      {/* Envelope toggle */}
                      <button
                        onClick={() => {
                          const updated = [...customExpenses];
                          updated[i] = { ...updated[i], trackInEnvelope: !updated[i].trackInEnvelope };
                          setCustomExpenses(updated);
                        }}
                        disabled={!hasValue}
                        title={c.trackInEnvelope ? 'Remove Budget envelope' : 'Track in Budget envelope'}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: '34px', height: '32px',
                          background: c.trackInEnvelope ? '#1A2A1E' : 'transparent',
                          border: `1px solid ${c.trackInEnvelope ? '#7FA068' : hasValue ? '#5C5648' : '#26221C'}`,
                          borderRadius: '3px',
                          cursor: hasValue ? 'pointer' : 'not-allowed',
                          opacity: hasValue ? 1 : 0.3,
                          transition: 'all 150ms',
                          flexShrink: 0,
                        }}
                      >
                        <Mail size={14} color={c.trackInEnvelope ? '#7FA068' : '#8B8478'} />
                      </button>
                      <button
                        onClick={() => setCustomExpenses(customExpenses.filter((_, j) => j !== i))}
                        style={{ background: 'transparent', border: 'none', color: '#8B8478', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {/* Month-end mode pills */}
                    {c.trackInEnvelope && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', paddingLeft: '4px', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#5C5648', marginRight: '2px', letterSpacing: '0.05em' }}>Month-end:</span>
                        {[
                          { id: 'reset',    label: '🔄 Reset',    tip: 'Cap resets to full each month. Unspent balance disappears.' },
                          { id: 'roll',     label: '➕ Rollover', tip: 'Leftover carries into next month. Overspend is deducted.' },
                          { id: 'sweep',    label: '💧 Sweep',    tip: 'Leftover moves to your Buffer. Cap resets to full.' },
                        ].map(m => (
                          <button
                            key={m.id}
                            onClick={() => {
                              const updated = [...customExpenses];
                              updated[i] = { ...updated[i], rolloverMode: m.id };
                              setCustomExpenses(updated);
                            }}
                            title={m.tip}
                            style={{
                              background: cMode === m.id ? '#1A2A1E' : 'transparent',
                              border: `1px solid ${cMode === m.id ? '#7FA068' : '#26221C'}`,
                              borderRadius: '999px',
                              padding: '3px 10px',
                              fontSize: '11px',
                              color: cMode === m.id ? '#7FA068' : '#8B8478',
                              cursor: 'pointer',
                              fontFamily: 'Inter, sans-serif',
                              transition: 'all 120ms',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                onClick={() => setCustomExpenses([...customExpenses, { name: '', amount: '', category: 'Other', trackInEnvelope: false }])}
                style={{ background: 'transparent', border: '1px dashed #3A2A1E', color: '#B0A898', padding: '10px', borderRadius: '3px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px' }}
              >
                <Plus size={14} /> Add another expense
              </button>
            </div>

            {/* Envelope summary */}
            {Object.values(envelopeTracking).some(Boolean) || customExpenses.some(c => c.trackInEnvelope) ? (
              <div style={{ background: '#141F14', border: '1px solid #2A3E2A', borderRadius: '4px', padding: '12px 16px', marginBottom: '20px', fontSize: '12px', color: '#7FA068', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={13} color="#7FA068" />
                <span>
                  {[
                    ...SUGGESTED_EXPENSES.filter(s => envelopeTracking[s.name]),
                    ...customExpenses.filter(c => c.trackInEnvelope && c.name),
                  ].length} envelope{[
                    ...SUGGESTED_EXPENSES.filter(s => envelopeTracking[s.name]),
                    ...customExpenses.filter(c => c.trackInEnvelope && c.name),
                  ].length !== 1 ? 's' : ''} will be created in your Budget tab.
                </span>
              </div>
            ) : null}

            <NavRow back={back} next={handleStep5Next} canAdvance={canAdvance()} hint={!canAdvance() ? 'Add at least one expense to continue' : null} />

            {/* ── Envelope gate modal ── */}
            {showEnvelopeGate && (() => {
              const untracked = SUGGESTED_EXPENSES.filter(s =>
                s.variable &&
                (Number(expenseValues[s.name]) || 0) > 0 &&
                !envelopeTracking[s.name]
              );
              return (
                <div style={{
                  position: 'fixed', inset: 0, zIndex: 2000,
                  background: 'rgba(10,9,8,0.85)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '24px',
                }}>
                  <div style={{
                    background: '#14110E', border: '1px solid #3A2A1E',
                    borderRadius: '8px', padding: '28px 28px 24px',
                    maxWidth: '420px', width: '100%',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <Mail size={20} color="#D97757" />
                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: '#E8E2D5' }}>
                        Track variable costs?
                      </h3>
                    </div>
                    <p style={{ fontSize: '14px', color: '#B0A898', lineHeight: 1.6, marginBottom: '16px' }}>
                      These variable expenses have no envelope set. Without one, unspent money has nowhere to go — it just disappears at month-end with no record.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                      {untracked.map(s => (
                        <div key={s.name} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: '#1A1410', border: '1px solid #26221C',
                          borderRadius: '4px', padding: '10px 14px',
                        }}>
                          <span style={{ fontSize: '14px', color: '#E8E2D5' }}>{s.name}</span>
                          <span className="ob-mono" style={{ fontSize: '13px', color: '#B0A898' }}>
                            {currencySymbol} {Number(expenseValues[s.name]).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => setShowEnvelopeGate(false)}
                        style={{
                          flex: 1, background: '#D97757', color: '#0A0908',
                          border: 'none', borderRadius: '4px', padding: '12px',
                          fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        }}
                      >
                        <Mail size={14} /> Set envelopes
                      </button>
                      <button
                        onClick={() => { setShowEnvelopeGate(false); console.log('[rl] step_5_exit'); next(); }}
                        style={{
                          flex: 1, background: 'transparent', color: '#8B8478',
                          border: '1px solid #26221C', borderRadius: '4px', padding: '12px',
                          fontSize: '13px', cursor: 'pointer',
                        }}
                      >
                        Skip for now →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── STEP 6: SPENDING + BUFFER RESERVE ────────────────────────────── */}
        {step === 6 && (
          <div>
            <div className="ob-label" style={{ color: '#D97757', marginBottom: '12px' }}>Step {step} of {totalSteps}</div>
            <h1 className="ob-display" style={{ fontSize: '36px', lineHeight: 1.2, marginBottom: '12px', fontWeight: 300 }}>
              <span style={{ fontStyle: 'italic', color: '#D97757' }}>Spending</span>{incomeType === 'foundation' ? ' & savings' : ' & buffer reserve'}
            </h1>
            <p style={{ color: '#B0A898', marginBottom: '16px', fontSize: '15px' }}>
              {incomeType === 'foundation'
                ? 'Set a spending limit for the month. Any amount you choose to save on top goes straight into your savings.'
                : 'Two more numbers to complete your monthly salary. This helps you understand your structure — not restrict you.'}
            </p>
            <p style={{ fontSize: '13px', color: '#5C5648', lineHeight: 1.65, marginBottom: '24px' }}>
              Nothing is final here. You can adjust these anytime from Settings.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
              <div>
                <div className="ob-label" style={{ color: '#8B8478', marginBottom: '8px' }}>Monthly spending money</div>
                <p style={{ fontSize: '13px', color: '#B0A898', marginBottom: '6px' }}>
                  Eating out, fun, hobbies, anything discretionary. This is the money you can use freely each month. When it runs out, spending stops.
                </p>
                <p style={{ fontSize: '12px', color: '#5C5648', lineHeight: 1.6, marginBottom: '12px' }}>
                  This is for spending not already planned in your expenses above — eating out, entertainment, anything unstructured.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="ob-mono" style={{ fontSize: '18px', color: '#8B8478' }}>{currencySymbol}</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={spendingBudget}
                    onChange={(e) => setSpendingBudget(e.target.value)}
                    className="ob-input"
                    style={{ fontSize: '18px' }}
                  />
                </div>
                <p style={{ fontSize: '12px', color: '#8B8478', lineHeight: 1.6, marginTop: '8px', fontStyle: 'italic' }}>
                  Unused spending money rolls into next month — or you can sweep it to your buffer. It is never lost.
                </p>
              </div>

              <div>
                <div className="ob-label" style={{ color: '#8B8478', marginBottom: '8px' }}>
                  {incomeType === 'foundation' ? 'Monthly savings amount' : 'Buffer reserve from salary'}
                </div>
                <p style={{ fontSize: '13px', color: '#B0A898', marginBottom: '12px' }}>
                  {incomeType === 'foundation'
                    ? `A small amount to put into savings each month. Even ${currencySymbol} 50/month makes a difference.`
                    : `Each month, this amount goes from your salary into the buffer (in addition to trading profits). Even ${currencySymbol} 500/month adds up.`}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="ob-mono" style={{ fontSize: '18px', color: '#8B8478' }}>{currencySymbol}</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={bufferReserve}
                    onChange={(e) => setBufferReserve(e.target.value)}
                    className="ob-input"
                    style={{ fontSize: '18px' }}
                  />
                </div>
              </div>
            </div>

            {salary > 0 && (
              <div style={{ background: '#1A1410', border: '1px solid #3A2A1E', borderRadius: '4px', padding: '20px', marginBottom: '32px' }}>
                <div className="ob-label" style={{ color: '#D97757', marginBottom: '8px' }}>
                  {incomeType === 'foundation' ? 'Your money available' : 'Your monthly salary'}
                </div>
                <div className="ob-display" style={{ fontSize: '36px', fontWeight: 300, color: '#D97757' }}>{fmt(salary)}</div>
                <div style={{ fontSize: '13px', color: '#B0A898', marginTop: '8px' }}>
                  {fmt(expenseTotal)} expenses + {fmt(Number(spendingBudget) || 0)} spending + {fmt(Number(bufferReserve) || 0)} buffer reserve
                </div>
                <div style={{ fontSize: '12px', color: '#5C5648', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #3A2A1E', fontStyle: 'italic' }}>
                  Your money hasn't changed. Your visibility has.
                </div>
              </div>
            )}

            <NavRow back={back} next={next} canAdvance={canAdvance()} hint={!canAdvance() ? 'Set a spending budget to continue' : null} />
          </div>
        )}

        {/* ── STEP 7: BUFFER TARGET ────────────────────────────────────────── */}
        {step === 7 && (
          <div>
            <div className="ob-label" style={{ color: '#D97757', marginBottom: '12px' }}>Step {step} of {totalSteps}</div>

            {incomeType === 'foundation' ? (
              /* Foundation: staged journey — no picker, system advances the target automatically */
              <>
                <h1 className="ob-display" style={{ fontSize: '36px', lineHeight: 1.2, marginBottom: '12px', fontWeight: 300 }}>
                  Your <span style={{ fontStyle: 'italic', color: '#D97757' }}>savings journey</span> starts here.
                </h1>
                <p style={{ color: '#B0A898', marginBottom: '28px', fontSize: '15px', lineHeight: 1.7 }}>
                  Foundation works in milestones. You start with a 3-month goal — the system guides you to 6 months, then 12, then beyond.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                  {[
                    { months: 3,  label: 'Start here',       desc: `Build ${fmt(salary * 3)} — your first real cushion.`,           active: true  },
                    { months: 6,  label: 'Then this',        desc: `Grow to ${fmt(salary * 6)} — a solid emergency fund.`,           active: false },
                    { months: 12, label: 'Then graduate',    desc: `Reach ${fmt(salary * 12)} — unlock the full Royal Ledger system.`, active: false },
                  ].map((row, i) => (
                    <div key={row.months} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '16px',
                      background: row.active ? '#1A1410' : '#0F0D0A',
                      border: `1px solid ${row.active ? '#D97757' : '#1E1C18'}`,
                      borderRadius: '6px', padding: '14px 16px',
                      opacity: row.active ? 1 : 0.6,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: row.active ? '#D97757' : '#26221C',
                        color: row.active ? '#0A0908' : '#5C5648',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 700,
                      }}>
                        {i + 1}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: row.active ? '#E8E2D5' : '#8B8478', marginBottom: '2px' }}>
                          {row.months} months — {row.label}
                        </div>
                        <div style={{ fontSize: '13px', color: '#8B8478', lineHeight: 1.5 }}>{row.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#14110E', border: '1px solid #26221C', borderRadius: '4px', padding: '12px 16px', marginBottom: '28px', fontSize: '12px', color: '#8B8478', lineHeight: 1.6 }}>
                  The app will automatically advance your target as you hit each milestone — no manual changes needed.
                </div>

                <NavRow back={back} next={next} canAdvance={true} />
              </>
            ) : (
              /* Non-Foundation: manual picker for buffer size */
              <>
                <h1 className="ob-display" style={{ fontSize: '36px', lineHeight: 1.2, marginBottom: '12px', fontWeight: 300 }}>
                  How big should your <span style={{ fontStyle: 'italic', color: '#D97757' }}>buffer</span> be?
                </h1>
                <p style={{ color: '#B0A898', marginBottom: '32px', fontSize: '15px' }}>
                  The buffer is months of full salary, stored in cash. More buffer means more peace of mind, less trading desperation. Bigger buffer = more protection for the people who depend on you.
                </p>
                <p style={{ fontSize: '13px', color: '#8B8478', lineHeight: 1.65, marginBottom: '20px' }}>
                  You can change this later as your situation evolves.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {[
                    { months: 6,  label: '6 months',  amount: salary * 6,  desc: 'Standard emergency fund. Survives one bad quarter.', recommended: incomeType === 'fixed' },
                    { months: 12, label: '12 months', amount: salary * 12, desc: 'A whole year of runway. Comfortable for most situations.', recommended: incomeType === 'mixed' },
                    { months: 18, label: '18 months', amount: salary * 18, desc: 'Sole earner with dependents. Variable income. The fortified position.', recommended: incomeType === 'variable' },
                  ].map(opt => (
                    <div
                      key={opt.months}
                      onClick={() => setBufferMonths(opt.months)}
                      className={`ob-card ${bufferMonths === opt.months ? 'ob-card-selected' : ''}`}
                    >
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <Shield size={20} style={{ color: bufferMonths === opt.months ? '#D97757' : '#B0A898', marginTop: '2px', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '4px' }}>
                            <div style={{ fontWeight: 500, fontSize: '16px' }}>{opt.label}</div>
                            <div className="ob-mono" style={{ fontSize: '13px', color: '#B0A898' }}>{fmt(opt.amount)}</div>
                            {opt.recommended && <span style={{ background: '#1A2A14', color: '#7FA068', padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em' }}>RECOMMENDED</span>}
                          </div>
                          <div style={{ color: '#B0A898', fontSize: '14px', lineHeight: 1.5 }}>{opt.desc}</div>
                        </div>
                        {bufferMonths === opt.months && <Check size={18} style={{ color: '#D97757' }} />}
                      </div>
                    </div>
                  ))}
                </div>
                <NavRow back={back} next={next} canAdvance={canAdvance()} hint={!canAdvance() ? 'Choose a buffer size to continue' : null} />
              </>
            )}
          </div>
        )}

        {/* ── STEP 8: STARTING BALANCES (NEW) ──────────────────────────────── */}
        {step === 8 && (
          <div>
            <div className="ob-label" style={{ color: '#D97757', marginBottom: '12px' }}>Step {step} of {totalSteps}</div>
            <Landmark size={28} style={{ color: '#D97757', marginBottom: '16px' }} />
            <h1 className="ob-display" style={{ fontSize: '36px', lineHeight: 1.2, marginBottom: '12px', fontWeight: 300 }}>
              What do you have <span style={{ fontStyle: 'italic', color: '#D97757' }}>right now</span>?
            </h1>
            <p style={{ color: '#B0A898', marginBottom: '8px', fontSize: '15px' }}>
              Enter your current balances — not monthly income. These are the actual amounts sitting in your accounts today.
            </p>
            <p style={{ fontSize: '14px', color: '#8B8478', marginBottom: '6px', fontStyle: 'italic' }}>
              This is simply your starting point.
            </p>
            <p style={{ fontSize: '13px', color: '#5C5648', lineHeight: 1.65, marginBottom: '8px' }}>
              Nothing here needs to be impressive — it just needs to be real.
            </p>
            <p style={{ color: '#8B8478', marginBottom: '32px', fontSize: '13px' }}>
              Leave any field at 0 if it doesn't apply yet. You can update these anytime from the Command tab.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
              {/* Buffer / Savings balance */}
              <div>
                <div className="ob-label" style={{ color: '#8B8478', marginBottom: '8px' }}>
                  {incomeType === 'foundation' ? 'Savings account' : 'Buffer account'}
                </div>
                <p style={{ fontSize: '13px', color: '#B0A898', marginBottom: '12px' }}>
                  {incomeType === 'foundation'
                    ? 'Your current savings — whatever you have set aside right now. Zero is fine.'
                    : 'Your emergency / runway fund — ideally in a separate savings account.'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="ob-mono" style={{ fontSize: '18px', color: '#8B8478' }}>{currencySymbol}</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={startingBuffer || ''}
                    onChange={e => setStartingBuffer(e.target.value)}
                    className="ob-input"
                    style={{ fontSize: '18px' }}
                  />
                </div>
              </div>

              {/* Trading capital — hidden for fixed income and Foundation */}
              {incomeType !== 'fixed' && incomeType !== 'foundation' && (
                <div>
                  <div className="ob-label" style={{ color: '#8B8478', marginBottom: '8px' }}>Trading / investment capital</div>
                  <p style={{ fontSize: '13px', color: '#B0A898', marginBottom: '12px' }}>
                    Your active trading account or investment portfolio balance.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="ob-mono" style={{ fontSize: '18px', color: '#8B8478' }}>{currencySymbol}</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={startingTradingCapital || ''}
                      onChange={e => setStartingTradingCapital(e.target.value)}
                      className="ob-input"
                      style={{ fontSize: '18px' }}
                    />
                  </div>
                </div>
              )}

              {/* Long-term balance */}
              <div>
                <div className="ob-label" style={{ color: '#8B8478', marginBottom: '8px' }}>Long-term savings</div>
                <p style={{ fontSize: '13px', color: '#B0A898', marginBottom: '12px' }}>
                  Retirement annuity, unit trusts, property equity, or any long-horizon asset.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="ob-mono" style={{ fontSize: '18px', color: '#8B8478' }}>{currencySymbol}</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={startingLongTerm || ''}
                    onChange={e => setStartingLongTerm(e.target.value)}
                    className="ob-input"
                    style={{ fontSize: '18px' }}
                  />
                </div>
              </div>
            </div>

            {/* Live net worth preview */}
            {(Number(startingBuffer) || Number(startingTradingCapital) || Number(startingLongTerm)) > 0 && (
              <div style={{ background: '#1A1410', border: '1px solid #3A2A1E', borderRadius: '4px', padding: '20px', marginBottom: '32px' }}>
                <div className="ob-label" style={{ color: '#D97757', marginBottom: '8px' }}>
                  {incomeType === 'foundation' ? 'Starting savings total' : 'Starting net worth'}
                </div>
                <div className="ob-display" style={{ fontSize: '32px', fontWeight: 300, color: '#D97757' }}>
                  {fmt((Number(startingBuffer) || 0) + (Number(startingTradingCapital) || 0) + (Number(startingLongTerm) || 0))}
                </div>
              </div>
            )}

            <NavRow back={back} next={next} canAdvance={canAdvance()} />
          </div>
        )}

        {/* ── STEP 9: PIN SETUP — mandatory ─────────────────────────────────── */}
        {step === 9 && (
          <div>
            <div className="ob-label" style={{ color: '#D97757', marginBottom: '12px' }}>Step {step} of {totalSteps}</div>
            <Lock size={28} style={{ color: '#D97757', marginBottom: '16px' }} />
            <h1 className="ob-display" style={{ fontSize: '36px', lineHeight: 1.2, marginBottom: '12px', fontWeight: 300 }}>
              Set your security <span style={{ fontStyle: 'italic', color: '#D97757' }}>PIN</span>.
            </h1>
            <p style={{ color: '#B0A898', marginBottom: '8px', fontSize: '15px' }}>
              Royal Ledger uses your PIN to protect important structural changes.
            </p>
            <p style={{ color: '#8B8478', marginBottom: '32px', fontSize: '13px' }}>
              Choose 4–6 digits. Your PIN is hashed on this device — it cannot be recovered without a support reset.
            </p>

            <div style={{ maxWidth: '280px' }}>
              <div style={{ marginBottom: '16px' }}>
                <div className="ob-label" style={{ color: '#8B8478', marginBottom: '8px' }}>PIN (4–6 digits)</div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="••••"
                  value={pinValue}
                  onChange={e => setPinValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="ob-input"
                  style={{ fontSize: '24px', letterSpacing: '0.4em', textAlign: 'center' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div className="ob-label" style={{ color: '#8B8478', marginBottom: '8px' }}>Confirm PIN</div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="••••"
                  value={pinConfirm}
                  onChange={e => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="ob-input"
                  style={{ fontSize: '24px', letterSpacing: '0.4em', textAlign: 'center', borderColor: pinConfirm && pinValue !== pinConfirm ? '#C56B5A' : undefined }}
                />
              </div>
            </div>

            {/* Inline validation */}
            {pinValue.length > 0 && pinValue.length < 4 && (
              <p style={{ color: '#8B8478', fontSize: '12px', marginBottom: '12px' }}>Enter 4–6 digits.</p>
            )}
            {pinConfirm.length > 0 && pinValue !== pinConfirm && (
              <p style={{ color: '#C56B5A', fontSize: '12px', marginBottom: '12px' }}>PINs don't match.</p>
            )}
            {pinIsValid && (
              <p style={{ color: '#7FA068', fontSize: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={12} /> PIN set — keep it somewhere safe.
              </p>
            )}

            <div style={{ marginBottom: '24px' }} />

            <NavRow
              back={back}
              next={next}
              canAdvance={canAdvance()}
              hint={!canAdvance() ? 'Enter matching PINs of 4–6 digits to continue' : null}
            />
          </div>
        )}

        {/* ── STEP 10: SUMMARY + NOTIFICATIONS ─────────────────────────────── */}
        {step === 10 && (
          <div>
            <div className="ob-label" style={{ color: '#D97757', marginBottom: '12px' }}>Step {step} of {totalSteps}</div>
            <Check size={32} style={{ color: '#7FA068', marginBottom: '16px' }} />
            <h1 className="ob-display" style={{ fontSize: '36px', lineHeight: 1.2, marginBottom: '12px', fontWeight: 300 }}>
              You've set your <span style={{ fontStyle: 'italic', color: '#7FA068' }}>starting point</span>.
            </h1>
            <p style={{ color: '#B0A898', marginBottom: '32px', fontSize: '15px' }}>
              From here, the system begins to guide your decisions. You can update any of these later in Setup or Rules.
            </p>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: '#14110E', border: '1px solid #26221C', borderRadius: '4px', padding: '20px' }}>
                <div className="ob-label" style={{ color: '#8B8478', marginBottom: '8px' }}>Monthly Salary</div>
                <div className="ob-display" style={{ fontSize: '24px', fontWeight: 300, color: '#D97757' }}>{fmt(salary)}</div>
              </div>
              <div style={{ background: '#14110E', border: '1px solid #26221C', borderRadius: '4px', padding: '20px' }}>
                <div className="ob-label" style={{ color: '#8B8478', marginBottom: '8px' }}>Buffer Target</div>
                <div className="ob-display" style={{ fontSize: '24px', fontWeight: 300, color: '#7FA068' }}>{fmt(bufferTarget)}</div>
              </div>
              <div style={{ background: '#14110E', border: '1px solid #26221C', borderRadius: '4px', padding: '20px' }}>
                <div className="ob-label" style={{ color: '#8B8478', marginBottom: '8px' }}>Total Expenses</div>
                <div className="ob-display" style={{ fontSize: '24px', fontWeight: 300 }}>{fmt(expenseTotal)}</div>
              </div>
              <div style={{ background: '#14110E', border: '1px solid #26221C', borderRadius: '4px', padding: '20px' }}>
                <div className="ob-label" style={{ color: '#8B8478', marginBottom: '8px' }}>Income Type</div>
                <div className="ob-display" style={{ fontSize: '24px', fontWeight: 300, textTransform: 'capitalize' }}>{incomeType || 'Not set'}</div>
              </div>
              {(Number(startingBuffer) || Number(startingTradingCapital) || Number(startingLongTerm)) > 0 && (
                <div style={{ background: '#14110E', border: '1px solid #26221C', borderRadius: '4px', padding: '20px', gridColumn: 'span 2' }}>
                  <div className="ob-label" style={{ color: '#8B8478', marginBottom: '8px' }}>Starting Net Worth</div>
                  <div className="ob-display" style={{ fontSize: '24px', fontWeight: 300, color: '#D97757' }}>
                    {fmt((Number(startingBuffer) || 0) + (Number(startingTradingCapital) || 0) + (Number(startingLongTerm) || 0))}
                  </div>
                </div>
              )}
            </div>

            {/* Notification opt-in */}
            <div style={{ background: '#14110E', border: '1px solid #26221C', borderRadius: '4px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Bell size={18} style={{ color: '#D97757', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>Enable reminders</div>
                  <div style={{ fontSize: '13px', color: '#B0A898', marginBottom: '14px', lineHeight: 1.5 }}>
                    Get daily check-ins and monthly review reminders at the times you set.
                  </div>

                  {notifStatus === 'idle' && (
                    <button
                      onClick={handleEnableNotifications}
                      style={{
                        background: '#1A1410', border: '1px solid #D97757', color: '#D97757',
                        borderRadius: '4px', padding: '10px 18px', fontSize: '13px',
                        fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      <Bell size={14} /> Enable notifications
                    </button>
                  )}

                  {notifStatus === 'granted' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7FA068', fontSize: '13px', fontWeight: 500 }}>
                      <Check size={14} /> Notifications enabled
                    </div>
                  )}

                  {notifStatus === 'denied' && (
                    <div style={{ fontSize: '12px', color: '#8B8478', lineHeight: 1.5 }}>
                      Permission denied. You can enable this later in your browser settings.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* What happens next */}
            <div style={{ background: '#1A1410', border: '1px solid #3A2A1E', borderRadius: '4px', padding: '20px', marginBottom: '32px' }}>
              <div style={{ fontWeight: 500, marginBottom: '8px' }}>What happens next:</div>
              <ol style={{ color: '#B0A898', fontSize: '14px', lineHeight: 1.7, paddingLeft: '20px', margin: 0 }}>
                <li>Open a separate HYSA at a different bank for your buffer</li>
                <li>Set up auto-transfers on payday into bills, spending, and buffer</li>
                <li>Use the Spending Gate before any purchase over {currencySymbol} 50</li>
                <li>Take a Snapshot today — that's your starting line</li>
              </ol>
            </div>

            <button onClick={() => finish()} className="ob-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Open the dashboard <ArrowRight size={16} />
            </button>
          </div>
        )}

        </div>{/* /ob-step keyed wrapper */}
      </div>
    </div>
  );
}

function NavRow({ back, next, canAdvance, hint }) {
  return (
    <div>
      {hint && <p style={{ color: '#8B8478', fontSize: '12px', marginBottom: '12px' }}>{hint}</p>}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button onClick={back} className="ob-btn-ghost">← Back</button>
        <button onClick={next} disabled={!canAdvance} className="ob-btn-primary">
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
