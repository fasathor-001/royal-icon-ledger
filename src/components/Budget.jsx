// src/components/Budget.jsx
//
// Advanced envelope budgeting system.
// - Each envelope has a name, monthly cap, block mode, and rollover mode
// - Spending Gate integrates: purchases get tagged to envelope, gate enforces rules
// - Month-end auto-rollover: reset / roll forward / sweep to buffer
// - Smart suggestion engine for first-time setup based on user's expenses

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { usePinGate, usePinRowGate, useSectionPin } from './PinGate';
import {
  Wallet, Plus, X, Edit2, Check, AlertTriangle, Lock, Unlock,
  ArrowRight, Shield, Repeat, Zap, ShoppingCart, Coffee, Home,
  Users, Heart, Sparkles, Briefcase, Settings, Info
} from 'lucide-react';
import { makeFmt, getCurrency } from '../lib/currency';

// ── InfoPopover ───────────────────────────────────────────────────────────────
function InfoPopover({ label, children, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          color: '#D97757', fontWeight: 600, letterSpacing: '0.04em',
          fontSize: 12, background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', padding: 0,
        }}
      >
        <Info size={13} /> {label}
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          ...(align === 'right' ? { right: 0 } : { left: 0 }),
          top: 'calc(100% + 8px)',
          zIndex: 200, width: 320, maxWidth: 'calc(100vw - 32px)',
          background: '#1A1410', border: '1px solid #3A2A1E', borderRadius: 4,
          padding: '12px 14px', lineHeight: 1.7, fontSize: 12, color: '#B0A898',
          boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─────────────── ICONS & PRESETS ───────────────
const ENVELOPE_ICONS = {
  groceries: ShoppingCart,
  food: Coffee,
  transport: Briefcase,
  family: Users,
  wife: Heart,
  personal: Sparkles,
  household: Home,
  emergency: Shield,
  other: Wallet,
};

const BLOCK_MODES = {
  soft: { label: 'Soft warning', desc: 'Shows warning but allows the purchase', color: '#B89968' },
  hard: { label: 'Hard block', desc: 'Refuses purchase when over budget', color: '#C56B5A' },
  pin: { label: 'PIN override', desc: 'Hard block with 4-digit PIN to override', color: '#5B7FB8' },
};

const ROLLOVER_MODES = {
  reset: { label: 'Reset', desc: 'Use it or lose it — fresh budget each month', color: '#B0A898' },
  roll: { label: 'Roll over', desc: 'Unspent amount carries to next month', color: '#B89968' },
  sweep: { label: 'Sweep to buffer', desc: 'Unspent goes to your savings buffer', color: '#7FA068' },
};

// ─────────────── SMART SUGGESTION ENGINE ───────────────
function suggestEnvelopes(expenses, spendingBudget) {
  const suggestions = [];

  // Always suggest these baseline envelopes for someone with dependents
  // Allocate based on spending budget proportionally

  const hasChildExpense = expenses.some(e =>
    e.category === 'Childcare/Kids' ||
    /child|kid|school|baby|daycare/i.test(e.name)
  );
  const hasFamilySupport = expenses.some(e =>
    e.category === 'Family support' ||
    /parent|mother|father|family support/i.test(e.name)
  );

  // Distribute budget across envelopes based on family situation
  const total = spendingBudget;

  if (hasChildExpense || hasFamilySupport) {
    // Family-focused split for sole earner with dependents
    suggestions.push({
      name: 'Groceries',
      icon: 'groceries',
      cap: Math.round(total * 0.30),
      blockMode: 'soft',
      rolloverMode: 'reset',
      isEssential: true,
    });
    suggestions.push({
      name: 'Family & Kids',
      icon: 'family',
      cap: Math.round(total * 0.20),
      blockMode: 'soft',
      rolloverMode: 'roll',
      isEssential: true,
    });
    suggestions.push({
      name: 'Partner',
      icon: 'wife',
      cap: Math.round(total * 0.15),
      blockMode: 'soft',
      rolloverMode: 'roll',
      isEssential: false,
    });
    suggestions.push({
      name: 'Eating Out',
      icon: 'food',
      cap: Math.round(total * 0.10),
      blockMode: 'hard',
      rolloverMode: 'sweep',
      isEssential: false,
    });
    suggestions.push({
      name: 'Personal',
      icon: 'personal',
      cap: Math.round(total * 0.10),
      blockMode: 'hard',
      rolloverMode: 'sweep',
      isEssential: false,
    });
    suggestions.push({
      name: 'Household',
      icon: 'household',
      cap: Math.round(total * 0.10),
      blockMode: 'soft',
      rolloverMode: 'roll',
      isEssential: true,
    });
    suggestions.push({
      name: 'Emergency Buffer',
      icon: 'emergency',
      cap: Math.round(total * 0.05),
      blockMode: 'soft',
      rolloverMode: 'sweep',
      isEssential: false,
    });
  } else {
    // Simpler split for single person
    suggestions.push({
      name: 'Groceries',
      icon: 'groceries',
      cap: Math.round(total * 0.40),
      blockMode: 'soft',
      rolloverMode: 'reset',
      isEssential: true,
    });
    suggestions.push({
      name: 'Eating Out',
      icon: 'food',
      cap: Math.round(total * 0.15),
      blockMode: 'hard',
      rolloverMode: 'sweep',
      isEssential: false,
    });
    suggestions.push({
      name: 'Personal',
      icon: 'personal',
      cap: Math.round(total * 0.20),
      blockMode: 'hard',
      rolloverMode: 'sweep',
      isEssential: false,
    });
    suggestions.push({
      name: 'Household',
      icon: 'household',
      cap: Math.round(total * 0.15),
      blockMode: 'soft',
      rolloverMode: 'roll',
      isEssential: true,
    });
    suggestions.push({
      name: 'Emergency Buffer',
      icon: 'emergency',
      cap: Math.round(total * 0.10),
      blockMode: 'soft',
      rolloverMode: 'sweep',
      isEssential: false,
    });
  }

  return suggestions.map((s, i) => ({
    id: 'env_' + Date.now() + '_' + i,
    ...s,
  }));
}

// ─────────────── MAIN BUDGET TAB ───────────────
export default function Budget({ data, setData, stats }) {
  const fmt = makeFmt(data.currency);
  const [view, setView] = useState('overview'); // overview | setup | edit
  const [editingEnvelope, setEditingEnvelope] = useState(null);

  // Sort: Discretionary envelope always first, others follow in original order
  const envelopes = [...(data.envelopes || [])].sort((a, b) =>
    (b.isDiscretionary ? 1 : 0) - (a.isDiscretionary ? 1 : 0)
  );
  const isSetup = envelopes.length > 0;

  // Get current month's spending per envelope
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();

  const envelopeSpending = useMemo(() => {
    const spending = {};
    envelopes.forEach(env => { spending[env.id] = 0; });

    // Sum up impulses tagged to envelopes this month
    (data.impulses || []).forEach(imp => {
      if (imp.timestamp >= monthStart && imp.envelopeId && spending[imp.envelopeId] !== undefined) {
        spending[imp.envelopeId] += imp.amount;
      }
    });

    return spending;
  }, [data.impulses, envelopes, monthStart]);

  const totalAllocated = envelopes.reduce((s, e) => s + (e.cap || 0), 0);
  const totalSpent = Object.values(envelopeSpending).reduce((s, v) => s + v, 0);
  const totalRemaining = totalAllocated - totalSpent;

  if (!isSetup) {
    return <BudgetSetup data={data} setData={setData} stats={stats} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
          <h1 className="display text-4xl" style={{ fontWeight: 300 }}>
            Your <span style={{ fontStyle: 'italic', color: '#D97757' }}>budget</span>
          </h1>
          <InfoPopover label="How does this work?">
            <p style={{ marginBottom: 6 }}>
              <strong style={{ color: '#E8E2D5' }}>Envelopes</strong> are spending buckets for your variable expenses — groceries, petrol, kids. Each one has a cap and its own rules.
            </p>
            <p style={{ marginBottom: 6 }}>
              <strong style={{ color: '#E8E2D5' }}>Fixed bills</strong> (rent, insurance, phone) don't need envelopes — they're automatic payments you can't control day-to-day.
            </p>
            <p style={{ marginBottom: 6 }}>
              <strong style={{ color: '#E8E2D5' }}>Tip:</strong> Go to <strong style={{ color: '#D97757' }}>Setup & Salary</strong> and click the ✉ envelope icon on any variable expense to auto-create its envelope here — and set Reset, Rollover, or Sweep right there.
            </p>
            <p style={{ marginBottom: 6 }}>When you log a purchase, tag it to an envelope. The app tracks your spending and enforces your rules.</p>
            <p><strong style={{ color: '#E8E2D5' }}>Spending</strong> envelope defaults to Rollover — unused money carries into next month. Switch to Sweep to move it to your buffer instead.</p>
          </InfoPopover>
        </div>
        <p style={{ color: '#B0A898', fontSize: '15px', maxWidth: '650px' }}>
          {envelopes.length} envelopes · {fmt(totalAllocated)} total allocated · {fmt(data.spendingBudget)} spending limit. Each envelope has its own rules.
        </p>
      </div>

      {/* Summary cards — 2-col on mobile, 3-col on sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="card p-4">
          <div className="label mb-2" style={{ color: '#8B8478' }}>Allocated</div>
          <div className="display text-xl" style={{ fontWeight: 300 }}>{fmt(totalAllocated)}</div>
        </div>
        <div className="card p-4">
          <div className="label mb-2" style={{ color: '#8B8478' }}>Spent</div>
          <div className="display text-xl" style={{ fontWeight: 300, color: '#D97757' }}>{fmt(totalSpent)}</div>
        </div>
        <div className="card p-4 col-span-2 sm:col-span-1">
          <div className="label mb-2" style={{ color: '#8B8478' }}>Remaining</div>
          <div className="display text-xl" style={{ fontWeight: 300, color: totalRemaining < 0 ? '#C56B5A' : '#7FA068' }}>
            {fmt(totalRemaining)}
          </div>
        </div>
      </div>

      {/* Envelopes list */}
      <section className="card p-7">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="display text-2xl">Envelopes</h2>
          <button
            onClick={() => setView('setup')}
            className="btn px-3 py-1.5 text-xs"
            style={{ background: '#14110E', color: '#B0A898', border: '1px solid #26221C', borderRadius: '3px' }}
          >
            <Settings size={12} className="inline mr-1" /> Manage
          </button>
        </div>

        <div className="space-y-3">
          {envelopes.map(env => (
            <EnvelopeRow
              key={env.id}
              envelope={env}
              spent={envelopeSpending[env.id] || 0}
              dayOfMonth={dayOfMonth}
              daysInMonth={daysInMonth}
              onEdit={() => { setEditingEnvelope(env); setView('edit'); }}
              currency={data.currency}
            />
          ))}
        </div>
      </section>

      {/* Month-end actions */}
      <MonthEndActions data={data} setData={setData} envelopes={envelopes} envelopeSpending={envelopeSpending} />

      {/* Setup/edit modal */}
      {view === 'setup' && (
        <BudgetManager
          data={data}
          setData={setData}
          onClose={() => setView('overview')}
        />
      )}

      {view === 'edit' && editingEnvelope && (
        <EnvelopeEditor
          envelope={editingEnvelope}
          data={data}
          setData={setData}
          onClose={() => { setView('overview'); setEditingEnvelope(null); }}
        />
      )}
    </div>
  );
}

// ─────────────── ENVELOPE ROW ───────────────
function EnvelopeRow({ envelope, spent, dayOfMonth, daysInMonth, onEdit, currency }) {
  const fmt = makeFmt(currency);
  const cap = envelope.cap || 1;
  const remaining = cap - spent;
  const pct = Math.min(100, (spent / cap) * 100);
  const projected = (spent / Math.max(1, dayOfMonth)) * daysInMonth;
  const overBudget = spent > cap;

  let barColor = '#7FA068'; // green
  if (pct >= 100) barColor = '#C56B5A';
  else if (pct >= 80) barColor = '#D97757';
  else if (pct >= 50) barColor = '#B89968';

  const Icon = ENVELOPE_ICONS[envelope.icon] || Wallet;
  const blockMode = BLOCK_MODES[envelope.blockMode] || BLOCK_MODES.soft;
  const rolloverMode = ROLLOVER_MODES[envelope.rolloverMode] || ROLLOVER_MODES.reset;

  return (
    <div
      className="card p-5"
      style={{
        cursor: 'pointer',
        borderColor: overBudget ? '#3A2620' : '#26221C',
        background: overBudget ? '#1F1410' : '#14110E',
      }}
      onClick={onEdit}
    >
      <div className="flex items-center gap-3 mb-3">
        <Icon size={16} style={{ color: barColor, flexShrink: 0 }} />
        <div className="flex-1" style={{ minWidth: 0 }}>
          <div className="font-medium text-sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {envelope.isDiscretionary ? 'Spending' : envelope.name}
          </div>
          <div className="text-xs flex gap-2 mt-0.5 flex-wrap" style={{ color: '#8B8478' }}>
            <span>{blockMode.label}</span>
            <span>·</span>
            <span>{rolloverMode.label}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="mono text-sm" style={{ color: overBudget ? '#C56B5A' : '#E8E2D5' }}>
            {fmt(spent)} / {fmt(cap)}
          </div>
          <div className="text-xs mt-0.5" style={{ color: '#B0A898' }}>
            {overBudget ? `${fmt(spent - cap)} over` : `${fmt(remaining)} left`}
          </div>
        </div>
      </div>

      <div className="progress mb-2">
        <div className="progress-fill" style={{ width: pct + '%', background: barColor }} />
      </div>

      <div className="flex justify-between text-xs items-center flex-wrap gap-1" style={{ color: '#8B8478' }}>
        <span style={{ flexShrink: 0 }}>Day {dayOfMonth} of {daysInMonth}</span>
        <VelocityAlert spent={spent} cap={cap} projected={projected} overBudget={overBudget} blockMode={envelope.blockMode} currency={currency} />
      </div>
    </div>
  );
}

// ─────────────── VELOCITY ALERT ───────────────
function VelocityAlert({ spent, cap, projected, overBudget, blockMode, currency }) {
  const fmt = makeFmt(currency);
  if (overBudget) {
    const isBlocked = blockMode === 'hard' || blockMode === 'pin';
    if (isBlocked) {
      return (
        <span
          className="pill"
          style={{ background: '#26221C', color: '#B0A898', fontSize: '10px', padding: '2px 8px' }}
        >
          ⊘ Blocked — cap reached
        </span>
      );
    }
    return (
      <span
        className="pill"
        style={{ background: '#3A1A18', color: '#C56B5A', fontSize: '10px', padding: '2px 8px' }}
      >
        Over budget — overspent {fmt(spent - cap)}
      </span>
    );
  }

  const pct = cap > 0 ? (spent / cap) * 100 : 0;

  if (pct >= 75 || projected > cap) {
    const overspendProjected = Math.max(0, projected - cap);
    if (overspendProjected > 0) {
      return (
        <span
          className="pill"
          style={{ background: '#2A1E0E', color: '#D97757', fontSize: '10px', padding: '2px 8px' }}
        >
          Over pace — projected overspend {fmt(overspendProjected)}
        </span>
      );
    }
    return (
      <span
        className="pill"
        style={{ background: '#2A1E0E', color: '#D97757', fontSize: '10px', padding: '2px 8px' }}
      >
        {Math.round(pct)}% used — watch your pace
      </span>
    );
  }

  return (
    <span
      className="pill"
      style={{ background: '#182416', color: '#7FA068', fontSize: '10px', padding: '2px 8px' }}
    >
      On pace — projected end: {fmt(projected)} / {fmt(cap)}
    </span>
  );
}

// ─────────────── BUDGET SETUP (FIRST TIME) ───────────────
function BudgetSetup({ data, setData, stats }) {
  const fmt = makeFmt(data.currency);
  const [step, setStep] = useState('intro'); // intro | review | done
  const [envelopes, setEnvelopes] = useState([]);

  const generateSuggestions = () => {
    const suggested = suggestEnvelopes(data.expenses || [], data.spendingBudget || 5000);
    setEnvelopes(suggested);
    setStep('review');
  };

  const updateEnvelope = (id, updates) => {
    setEnvelopes(envs => envs.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const removeEnvelope = (id) => {
    setEnvelopes(envs => envs.filter(e => e.id !== id));
  };

  const addCustom = () => {
    setEnvelopes(envs => [...envs, {
      id: 'env_' + Date.now(),
      name: 'New envelope',
      icon: 'other',
      cap: 0,
      blockMode: 'soft',
      rolloverMode: 'reset',
      isEssential: false,
    }]);
  };

  const total = envelopes.reduce((s, e) => s + (Number(e.cap) || 0), 0);
  const targetBudget = data.spendingBudget || 0;
  const diff = total - targetBudget;

  const finalize = () => {
    setData(d => ({
      ...d,
      envelopes: envelopes.filter(e => e.name && e.cap > 0),
    }));
    setStep('done');
  };

  if (step === 'intro') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="display text-4xl mb-2" style={{ fontWeight: 300 }}>
            Set up your <span style={{ fontStyle: 'italic', color: '#D97757' }}>budget</span>
          </h1>
          <p style={{ color: '#B0A898', fontSize: '15px', maxWidth: '650px' }}>
            Envelope budgeting splits your monthly spending money into named buckets. Each bucket has rules — soft warning, hard block, or PIN override when you exceed it. The system enforces what you commit to.
          </p>
        </div>

        <div className="card-warm p-7">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <div className="label mb-2" style={{ color: '#8B8478' }}>Your spending budget</div>
              <div className="display text-3xl" style={{ fontWeight: 300, color: '#D97757' }}>{fmt(data.spendingBudget || 0)}</div>
              <div className="text-xs mt-1" style={{ color: '#B0A898' }}>per month</div>
            </div>
            <div>
              <div className="label mb-2" style={{ color: '#8B8478' }}>Will be split into</div>
              <div className="display text-3xl" style={{ fontWeight: 300 }}>~7 envelopes</div>
              <div className="text-xs mt-1" style={{ color: '#B0A898' }}>based on your situation</div>
            </div>
            <div>
              <div className="label mb-2" style={{ color: '#8B8478' }}>Auto-suggested using</div>
              <div className="display text-3xl" style={{ fontWeight: 300 }}>{(data.expenses || []).length}</div>
              <div className="text-xs mt-1" style={{ color: '#B0A898' }}>existing expense entries</div>
            </div>
          </div>

          <p className="text-sm mb-6" style={{ color: '#E8E2D5', lineHeight: 1.6 }}>
            I'll suggest envelopes based on your expenses (which include family support and dependents). You'll review, adjust, and confirm. Each envelope gets a smart default rule — essentials get soft warnings, discretionary spending gets hard blocks.
          </p>

          <button onClick={generateSuggestions} className="btn px-5 py-3" style={{ background: '#D97757', color: '#0A0908', borderRadius: '4px', fontWeight: 600, fontSize: '14px' }}>
            Generate envelopes <ArrowRight size={14} className="inline ml-2" />
          </button>
        </div>

        <div className="card p-6">
          <h3 className="display text-xl mb-3">How envelopes work</h3>
          <div className="space-y-3 text-sm" style={{ color: '#B0A898', lineHeight: 1.6 }}>
            <div>
              <strong style={{ color: '#E8E2D5' }}>Each purchase gets tagged to an envelope.</strong> When you log an impulse or run the spending gate, you pick which envelope it comes from.
            </div>
            <div>
              <strong style={{ color: '#E8E2D5' }}>Each envelope has its own rules:</strong>
              <ul className="mt-2 space-y-1 ml-4">
                <li>• <span style={{ color: '#B89968' }}>Soft warning</span> — shows you're over but allows the purchase (good for groceries)</li>
                <li>• <span style={{ color: '#C56B5A' }}>Hard block</span> — gate refuses purchases over budget (good for personal/dining)</li>
                <li>• <span style={{ color: '#5B7FB8' }}>PIN override</span> — hard block with a 4-digit code to bypass (your safety valve)</li>
              </ul>
            </div>
            <div>
              <strong style={{ color: '#E8E2D5' }}>At month-end, each envelope handles unspent money:</strong>
              <ul className="mt-2 space-y-1 ml-4">
                <li>• <span style={{ color: '#B0A898' }}>Reset</span> — use it or lose it</li>
                <li>• <span style={{ color: '#B89968' }}>Roll over</span> — carries to next month</li>
                <li>• <span style={{ color: '#7FA068' }}>Sweep</span> — unspent goes to your buffer (the wealth-building option)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="display text-3xl mb-2" style={{ fontWeight: 300 }}>
            Review your <span style={{ fontStyle: 'italic', color: '#D97757' }}>envelopes</span>
          </h1>
          <p style={{ color: '#B0A898', fontSize: '15px' }}>
            Adjust caps, change rules, add or remove envelopes. Total should match your spending budget.
          </p>
        </div>

        {/* Total tracker */}
        <div
          className={diff === 0 ? 'card-warm p-5' : 'card p-5'}
          style={{
            borderColor: diff === 0 ? '#7FA068' : Math.abs(diff) < targetBudget * 0.05 ? '#3A2A1E' : '#3A2620',
          }}
        >
          <div className="flex items-baseline justify-between">
            <div>
              <div className="label mb-1" style={{ color: '#8B8478' }}>Total allocated</div>
              <div className="display text-3xl" style={{ fontWeight: 300, color: diff === 0 ? '#7FA068' : diff > 0 ? '#C56B5A' : '#D97757' }}>
                {fmt(total)}
              </div>
            </div>
            <div className="text-right">
              <div className="label mb-1" style={{ color: '#8B8478' }}>Target</div>
              <div className="mono">{fmt(targetBudget)}</div>
              {diff !== 0 && (
                <div className="text-xs mt-1" style={{ color: diff > 0 ? '#C56B5A' : '#D97757' }}>
                  {diff > 0 ? `${fmt(diff)} over` : `${fmt(-diff)} under`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Envelopes list */}
        <div className="space-y-2">
          {envelopes.map(env => (
            <EnvelopeEditCard
              key={env.id}
              envelope={env}
              onUpdate={(updates) => updateEnvelope(env.id, updates)}
              onRemove={() => removeEnvelope(env.id)}
              currency={data.currency}
            />
          ))}
        </div>

        <button
          onClick={addCustom}
          className="btn w-full p-3"
          style={{ background: 'transparent', border: '1px dashed #3A2A1E', color: '#B0A898', borderRadius: '4px', fontSize: '13px' }}
        >
          <Plus size={14} className="inline mr-2" /> Add custom envelope
        </button>

        <div className="flex gap-3">
          <button onClick={() => setStep('intro')} className="btn px-4 py-3" style={{ color: '#B0A898', background: 'transparent' }}>← Back</button>
          <button
            onClick={finalize}
            disabled={envelopes.length === 0 || total === 0}
            className="btn px-5 py-3"
            style={{
              background: '#D97757',
              color: '#0A0908',
              borderRadius: '4px',
              fontWeight: 600,
              fontSize: '14px',
              opacity: envelopes.length === 0 || total === 0 ? 0.5 : 1,
              cursor: envelopes.length === 0 || total === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <Check size={14} className="inline mr-2" /> Confirm envelopes
          </button>
        </div>

        {Math.abs(diff) > targetBudget * 0.05 && (
          <p className="text-xs" style={{ color: '#8B8478' }}>
            Tip: Total doesn't match your {fmt(targetBudget)} budget. Adjust individual caps or your spending budget in Setup.
          </p>
        )}
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="card-warm p-8 text-center">
        <Check size={32} style={{ color: '#7FA068' }} className="mx-auto mb-4" />
        <div className="display text-3xl mb-2" style={{ fontStyle: 'italic', fontWeight: 300 }}>Budget configured.</div>
        <p style={{ color: '#B0A898', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
          From now on, when you log a purchase, you'll pick which envelope it comes from. The system will track and enforce your rules.
        </p>
        <button
          onClick={() => setView('overview')}
          className="btn px-5 py-3 mt-6"
          style={{ background: '#D97757', color: '#0A0908', borderRadius: '4px', fontWeight: 600 }}
        >
          View my envelopes →
        </button>
      </div>
    );
  }
}

// ─────────────── ENVELOPE EDIT CARD ───────────────
function EnvelopeEditCard({ envelope, onUpdate, onRemove, locked, onClickLocked, currency }) {
  const fmt = makeFmt(currency);
  return (
    <div className="card p-5">
      <div className="flex gap-3 items-start">
        <div className="flex-1 space-y-3">
          <input
            type="text"
            value={envelope.name}
            onChange={locked ? undefined : (e) => onUpdate({ name: e.target.value })}
            onClick={() => locked && onClickLocked?.()}
            className="input-text w-full"
            placeholder="Envelope name"
            readOnly={!!locked}
            style={{ cursor: locked ? 'pointer' : undefined, opacity: locked ? 0.65 : 1 }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <div className="label mb-1" style={{ color: '#8B8478' }}>Cap</div>
              <input
                type="number"
                value={envelope.cap}
                onChange={locked ? undefined : (e) => onUpdate({ cap: Number(e.target.value) || 0 })}
                onClick={() => locked && onClickLocked?.()}
                className="input"
                readOnly={!!locked}
                style={{ cursor: locked ? 'pointer' : undefined, opacity: locked ? 0.65 : 1 }}
              />
            </div>
            <div>
              <div className="label mb-1" style={{ color: '#8B8478' }}>Block mode</div>
              <select
                value={envelope.blockMode}
                onChange={locked ? undefined : (e) => onUpdate({ blockMode: e.target.value })}
                onClick={() => locked && onClickLocked?.()}
                className="input-text"
                disabled={!!locked}
                style={{ cursor: locked ? 'pointer' : undefined, opacity: locked ? 0.65 : 1 }}
              >
                {Object.entries(BLOCK_MODES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="label mb-1" style={{ color: '#8B8478' }}>Rollover</div>
              <select
                value={envelope.rolloverMode}
                onChange={locked ? undefined : (e) => onUpdate({ rolloverMode: e.target.value })}
                onClick={() => locked && onClickLocked?.()}
                className="input-text"
                disabled={!!locked}
                style={{ cursor: locked ? 'pointer' : undefined, opacity: locked ? 0.65 : 1 }}
              >
                {Object.entries(ROLLOVER_MODES)
                  .filter(([k]) => !envelope.isDiscretionary || k !== 'reset')
                  .map(([k, v]) => (
                    <option key={k} value={k}>{v.label}{envelope.isDiscretionary && k === 'roll' ? ' (default)' : ''}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>
        <button onClick={locked ? onClickLocked : onRemove} className="btn p-2" style={{ color: '#8B8478', opacity: locked ? 0.4 : 1 }}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

// ─────────────── ENVELOPE EDITOR (modal-style) ───────────────
function EnvelopeEditor({ envelope, data, setData, onClose }) {
  const fmt = makeFmt(data.currency);
  const [edited, setEdited] = useState(envelope);
  const { attempt: attemptDelete, gate: deleteGate } = usePinGate(data.overridePin);
  const { locked, requestUnlock, gate: fieldGate } = useSectionPin(data.overridePin);

  const save = () => {
    setData(d => ({
      ...d,
      envelopes: d.envelopes.map(e => e.id === envelope.id ? edited : e),
    }));
    onClose();
  };

  const remove = () => {
    setData(d => ({
      ...d,
      envelopes: d.envelopes.filter(e => e.id !== envelope.id),
    }));
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(10, 9, 8, 0.85)',
        zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '20px', backdropFilter: 'blur(4px)', overflowY: 'auto',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card p-6" style={{ maxWidth: '500px', width: '100%', marginTop: '20px', marginBottom: '20px' }}>
        <div className="flex justify-between items-baseline mb-5">
          <h2 className="display text-2xl">Edit envelope</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#B0A898', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
        {fieldGate}
        <EnvelopeEditCard
          envelope={edited}
          locked={locked}
          onClickLocked={requestUnlock}
          onUpdate={(updates) => setEdited(e => ({ ...e, ...updates }))}
          onRemove={() => {}}
          currency={data.currency}
        />
        {deleteGate}
        <div className="flex justify-between mt-5">
          <button onClick={() => attemptDelete(remove)} className="btn px-4 py-2" style={{ color: '#C56B5A', border: '1px solid #3A2620', borderRadius: '3px', fontSize: '13px' }}>
            Delete
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn px-4 py-2" style={{ color: '#B0A898', fontSize: '13px' }}>Cancel</button>
            <button onClick={locked ? requestUnlock : save} className="btn px-4 py-2" style={{ background: locked ? '#26221C' : '#D97757', color: locked ? '#5B7FB8' : '#0A0908', borderRadius: '3px', fontWeight: 600, fontSize: '13px', border: locked ? '1px solid #1E2A3A' : 'none' }}>
              {locked ? <><Lock size={12} className="inline mr-1" /> Unlock to save</> : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────── BUDGET MANAGER (full management) ───────────────
function BudgetManager({ data, setData, onClose }) {
  const fmt = makeFmt(data.currency);
  const { symbol: currencySymbol } = getCurrency(data.currency);
  const { attemptRow: attemptDeleteRow, gateFor: deleteGateFor } = usePinRowGate(data.overridePin);
  const { attempt: attemptReset, gate: resetGate } = usePinGate(data.overridePin);
  const { locked, requestUnlock, gate: fieldGate } = useSectionPin(data.overridePin);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(10, 9, 8, 0.85)',
        zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '20px', backdropFilter: 'blur(4px)', overflow: 'auto',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card p-7" style={{ maxWidth: '700px', width: '100%', marginTop: '16px' }}>
        <div className="flex justify-between items-baseline mb-5">
          <h2 className="display text-2xl">Manage envelopes</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#B0A898', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center justify-between mb-5">
          <p className="text-sm" style={{ color: '#B0A898' }}>
            Edit existing envelopes, change caps and rules, or rebuild from scratch.
          </p>
          {data.overridePin && (
            locked ? (
              <button onClick={requestUnlock} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#5B7FB8', background: 'transparent', border: '1px solid #1E2A3A', borderRadius: '3px', padding: '3px 9px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <Lock size={10} /> Locked · click to edit
              </button>
            ) : (
              <span style={{ fontSize: '11px', color: '#7FA068' }}>✓ Unlocked 60s</span>
            )
          )}
        </div>
        {fieldGate}

        <div className="space-y-2">
          {data.envelopes.map(env => (
            <div key={env.id}>
              <EnvelopeEditCard
                envelope={env}
                locked={locked}
                onClickLocked={requestUnlock}
                onUpdate={(updates) => setData(d => ({
                  ...d,
                  envelopes: d.envelopes.map(e => e.id === env.id ? { ...e, ...updates } : e),
                }))}
                onRemove={() => attemptDeleteRow(env.id, () => setData(d => ({
                  ...d,
                  envelopes: d.envelopes.filter(e => e.id !== env.id),
                })))}
                currency={data.currency}
              />
              {deleteGateFor(env.id)}
            </div>
          ))}
        </div>

        <button
          onClick={locked ? requestUnlock : () => setData(d => ({
            ...d,
            envelopes: [...(d.envelopes || []), {
              id: 'env_' + Date.now(),
              name: 'New envelope',
              icon: 'other',
              cap: 0,
              blockMode: 'soft',
              rolloverMode: 'reset',
              isEssential: false,
            }],
          }))}
          className="btn w-full p-3 mt-3"
          style={{ background: 'transparent', border: '1px dashed #3A2A1E', color: '#B0A898', borderRadius: '4px', fontSize: '13px' }}
        >
          <Plus size={14} className="inline mr-2" /> Add envelope
        </button>

        <div className="mt-6 pt-5 border-t" style={{ borderColor: '#26221C' }}>
          <button
            onClick={() => attemptReset(() => { setData(d => ({ ...d, envelopes: [] })); onClose(); })}
            className="btn px-4 py-2 text-sm"
            style={{ color: '#C56B5A', border: '1px solid #3A2620', borderRadius: '3px' }}
          >
            Reset all envelopes
          </button>
          {resetGate}
        </div>
      </div>
    </div>
  );
}

// ─────────────── MONTH-END ACTIONS ───────────────
function MonthEndActions({ data, setData, envelopes, envelopeSpending }) {
  const fmt = makeFmt(data.currency);
  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const isMonthEnd = dayOfMonth >= daysInMonth - 2; // last 3 days
  const lastRollover = data.lastEnvelopeRollover;
  const thisMonth = now.toISOString().slice(0, 7);
  const alreadyRolledOver = lastRollover === thisMonth;

  // Calculate what would happen on rollover
  const rolloverSummary = envelopes.map(env => {
    const spent = envelopeSpending[env.id] || 0;
    const unspent = Math.max(0, env.cap - spent);
    return {
      ...env,
      spent,
      unspent,
      action: env.rolloverMode,
    };
  });

  const totalSweep = rolloverSummary
    .filter(e => e.action === 'sweep')
    .reduce((s, e) => s + e.unspent, 0);

  const performRollover = () => {
    let bufferAddition = 0;
    rolloverSummary.forEach(env => {
      if (env.action === 'sweep') bufferAddition += env.unspent;
    });

    setData(d => ({
      ...d,
      buffer: d.buffer + bufferAddition,
      lastEnvelopeRollover: thisMonth,
      envelopeRolloverHistory: [
        ...(d.envelopeRolloverHistory || []),
        {
          month: thisMonth,
          timestamp: Date.now(),
          summary: rolloverSummary,
          totalSwept: bufferAddition,
        },
      ],
    }));
  };

  if (!isMonthEnd && !alreadyRolledOver) return null;

  return (
    <section className="card-warm p-6">
      <div className="flex items-center gap-2 mb-3">
        <Repeat size={16} style={{ color: '#D97757' }} />
        <h2 className="display text-xl">Month-end rollover</h2>
      </div>

      {alreadyRolledOver ? (
        <p className="text-sm" style={{ color: '#7FA068' }}>
          ✓ You've already rolled over for {thisMonth}. Next rollover available next month.
        </p>
      ) : (
        <>
          <p className="text-sm mb-4" style={{ color: '#B0A898' }}>
            End of month is approaching. Apply rollover rules to wrap up this month and start fresh.
          </p>

          {totalSweep > 0 && (
            <div className="card-warm p-4 mb-4">
              <div className="label mb-1" style={{ color: '#7FA068' }}>Will sweep to buffer</div>
              <div className="display text-2xl" style={{ color: '#7FA068', fontWeight: 300 }}>{fmt(totalSweep)}</div>
              <div className="text-xs mt-1" style={{ color: '#B0A898' }}>From envelopes set to sweep mode</div>
            </div>
          )}

          <button
            onClick={performRollover}
            className="btn px-5 py-3"
            style={{ background: '#D97757', color: '#0A0908', borderRadius: '4px', fontWeight: 600, fontSize: '14px' }}
          >
            Apply rollover →
          </button>
        </>
      )}
    </section>
  );
}
