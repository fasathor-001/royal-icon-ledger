// src/components/RitualCard.jsx
//
// "Daily Checkpoints" card in the Command tab.
// Checkboxes auto-reset: morning/purchase/log → daily, pulse → weekly, review → monthly.
// Session-dismissible (collapsed state survives page reload via localStorage).

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, X, Check, Sun, ShoppingCart, Clock, BarChart3, Calendar } from 'lucide-react';

const RITUAL_KEY = 'ritual-state-v1';

function getWeekKey() {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
}

function getMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadRitualState() {
  try {
    const stored = localStorage.getItem(RITUAL_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
}

function saveRitualState(state) {
  try { localStorage.setItem(RITUAL_KEY, JSON.stringify(state)); } catch {}
}

const RITUALS = [
  {
    id: 'morning',
    label: 'Morning check (30s)',
    sub: 'Command tab glance',
    icon: Sun,
    color: '#D97757',
    resetPer: 'day',
  },
  {
    id: 'beforePurchase',
    label: 'Before purchase',
    sub: 'Run Spending Gate',
    icon: ShoppingCart,
    color: '#B89968',
    resetPer: 'day',
  },
  {
    id: 'afterPurchase',
    label: 'After purchase',
    sub: 'Quick Log',
    icon: Clock,
    color: '#8B8478',
    resetPer: 'day',
  },
  {
    id: 'sundayPulse',
    label: 'Sunday',
    sub: 'Weekly Pulse check',
    icon: BarChart3,
    color: '#5B7FB8',
    resetPer: 'week',
  },
  {
    id: 'monthEnd',
    label: 'Month-end',
    sub: 'Monthly Review + Snapshot',
    icon: Calendar,
    color: '#7FA068',
    resetPer: 'month',
  },
];

export default function RitualCard({ setTab }) {
  const [collapsed, setCollapsed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ritual-collapsed') || 'false'); } catch { return false; }
  });
  const [dismissed, setDismissed] = useState(false);

  const [checks, setChecks] = useState(() => loadRitualState());

  if (dismissed) return null;

  const toggleCollapsed = (val) => {
    setCollapsed(val);
    try { localStorage.setItem('ritual-collapsed', JSON.stringify(val)); } catch {}
  };

  const isChecked = (ritual) => {
    const stored = checks[ritual.id];
    if (!stored) return false;
    const key = ritual.resetPer === 'day' ? getTodayKey()
      : ritual.resetPer === 'week' ? getWeekKey()
      : getMonthKey();
    return stored === key;
  };

  const toggle = (ritual) => {
    const key = ritual.resetPer === 'day' ? getTodayKey()
      : ritual.resetPer === 'week' ? getWeekKey()
      : getMonthKey();
    const next = { ...checks, [ritual.id]: isChecked(ritual) ? null : key };
    setChecks(next);
    saveRitualState(next);
  };

  const doneCount = RITUALS.filter(r => isChecked(r)).length;

  const handleAction = (id) => {
    if (id === 'morning' || id === 'beforePurchase' || id === 'afterPurchase') {
      // nothing — they navigate themselves
    }
    if (id === 'sundayPulse') {
      window.dispatchEvent(new CustomEvent('show-weekly-pulse'));
    }
    if (id === 'monthEnd') {
      setTab('review');
    }
  };

  return (
    <div
      className="card"
      style={{ borderColor: '#26221C' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer"
        onClick={() => toggleCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: doneCount === RITUALS.length ? '#2A3A1E' : '#1A1410',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {doneCount === RITUALS.length
              ? <Check size={14} style={{ color: '#7FA068' }} />
              : <span className="text-xs font-bold mono" style={{ color: '#D97757' }}>{doneCount}/{RITUALS.length}</span>
            }
          </div>
          <div>
            <div className="font-medium text-sm">Daily Checkpoints</div>
            <div className="text-xs" style={{ color: '#5C5648' }}>
              {doneCount === RITUALS.length ? 'All done today' : `${RITUALS.length - doneCount} remaining`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {collapsed ? <ChevronDown size={14} style={{ color: '#5C5648' }} /> : <ChevronUp size={14} style={{ color: '#5C5648' }} />}
          <button
            onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
            style={{ background: 'transparent', border: 'none', color: '#5C5648', cursor: 'pointer', padding: '4px', lineHeight: 1 }}
            title="Dismiss for this session"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="border-t" style={{ borderColor: '#26221C' }}>
          {RITUALS.map((r, i) => {
            const Icon = r.icon;
            const done = isChecked(r);
            return (
              <div
                key={r.id}
                className="flex items-center gap-4 px-5 py-3 border-b last:border-0"
                style={{ borderColor: '#1A1816' }}
              >
                <button
                  onClick={() => toggle(r)}
                  style={{
                    width: '22px', height: '22px', borderRadius: '4px', flexShrink: 0,
                    border: `1.5px solid ${done ? r.color : '#3A3028'}`,
                    background: done ? r.color + '20' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {done && <Check size={12} style={{ color: r.color }} />}
                </button>
                <Icon size={13} style={{ color: done ? r.color : '#5C5648', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: done ? '#5C5648' : '#E8E2D5', textDecoration: done ? 'line-through' : 'none' }}>
                    {r.label}
                  </div>
                  <div className="text-xs" style={{ color: '#5C5648' }}>{r.sub}</div>
                </div>
                <span className="label text-right" style={{ color: '#3A3028', fontSize: '9px' }}>
                  {r.resetPer === 'day' ? 'DAILY' : r.resetPer === 'week' ? 'WEEKLY' : 'MONTHLY'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
