// src/components/WeeklyPulseBanner.jsx
//
// Shown every Sunday in the Command tab, and on-demand via "Check pulse" button.
// Shows: week # of 4, total spent vs weekly pace, envelopes over 75% flagged,
// and a one-line verdict: On pace / Slow down / Critical.

import React, { useState, useMemo } from 'react';
import { Activity, X, AlertTriangle, Check, ChevronDown } from 'lucide-react';
import { makeFmt } from '../lib/currency';

function getWeekInfo() {
  const now = new Date();
  const day = now.getDate();
  const weekNum = Math.ceil(day / 7);           // 1–5 (use 4 for display cap)
  const weekOfMonth = Math.min(weekNum, 4);
  const dayOfWeek = now.getDay();               // 0=Sun
  const isSunday = dayOfWeek === 0;

  // Start of current week (Sunday)
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  // Start of current month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return { weekOfMonth, isSunday, weekStartTs: weekStart.getTime(), monthStartTs: monthStart.getTime() };
}

export default function WeeklyPulseBanner({ data, stats, forceShow, onDismiss }) {
  const fmt = makeFmt(data.currency);
  const { weekOfMonth, isSunday, weekStartTs, monthStartTs } = getWeekInfo();
  const [dismissed, setDismissed] = useState(false);

  const shouldShow = forceShow || (isSunday && !dismissed);
  if (!shouldShow) return null;

  const dismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  const envelopes = data.envelopes || [];
  // Use actual days in the month for a more accurate weekly pace
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const weeksInMonth = daysInMonth / 7;
  const weeklyBudget = (data.spendingBudget || 0) / weeksInMonth;

  // Spending this week
  const weekImpulses = (data.impulses || []).filter(i => i.timestamp >= weekStartTs);
  const weekSpent = weekImpulses.reduce((s, i) => s + i.amount, 0);

  // Month-to-date spending
  const monthImpulses = (data.impulses || []).filter(i => i.timestamp >= monthStartTs);

  // Per-envelope this week
  const envelopeWeekData = envelopes.map(env => {
    const weekEnvSpent = weekImpulses
      .filter(i => i.envelopeId === env.id)
      .reduce((s, i) => s + i.amount, 0);
    const weekPace = (env.cap || 0) / weeksInMonth;
    const pct = weekPace > 0 ? (weekEnvSpent / weekPace) * 100 : 0;
    return { ...env, weekEnvSpent, weekPace, pct };
  }).filter(e => e.weekPace > 0);

  const overPace = envelopeWeekData.filter(e => e.pct >= 100);
  const nearPace = envelopeWeekData.filter(e => e.pct >= 75 && e.pct < 100);

  // Verdict
  const overallPct = weeklyBudget > 0 ? (weekSpent / weeklyBudget) * 100 : 0;
  let verdict, verdictColor, verdictBg;
  if (overallPct >= 100 || overPace.length >= 2) {
    verdict = 'Critical';
    verdictColor = '#C56B5A';
    verdictBg = '#3A2620';
  } else if (overallPct >= 75 || overPace.length >= 1 || nearPace.length >= 2) {
    verdict = 'Slow down';
    verdictColor = '#D97757';
    verdictBg = '#2A1E10';
  } else {
    verdict = 'On pace';
    verdictColor = '#7FA068';
    verdictBg = '#1A2A18';
  }

  return (
    <div
      className="card-warm"
      style={{ borderColor: verdictColor + '60', padding: '20px' }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={15} style={{ color: verdictColor }} />
          <span className="label" style={{ color: verdictColor }}>Weekly Pulse — Week {weekOfMonth} of 4</span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="pill"
            style={{ background: verdictBg, color: verdictColor, fontWeight: 700, fontSize: '12px', padding: '4px 12px', borderRadius: '999px' }}
          >
            {verdict}
          </div>
          <button onClick={dismiss} style={{ background: 'transparent', border: 'none', color: '#5C5648', cursor: 'pointer', padding: '2px' }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <div className="label mb-1" style={{ color: '#5C5648' }}>Spent this week</div>
          <div className="display text-xl" style={{ fontWeight: 300, color: overallPct >= 100 ? '#C56B5A' : '#E8E2D5' }}>{fmt(weekSpent)}</div>
        </div>
        <div>
          <div className="label mb-1" style={{ color: '#5C5648' }}>Weekly pace</div>
          <div className="display text-xl" style={{ fontWeight: 300 }}>{fmt(weeklyBudget)}</div>
        </div>
        <div>
          <div className="label mb-1" style={{ color: '#5C5648' }}>Remaining</div>
          <div className="display text-xl" style={{ fontWeight: 300, color: weeklyBudget - weekSpent < 0 ? '#C56B5A' : '#7FA068' }}>
            {fmt(Math.max(0, weeklyBudget - weekSpent))}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress mb-4" style={{ height: '5px' }}>
        <div className="progress-fill" style={{ width: Math.min(100, overallPct) + '%', background: verdictColor }} />
      </div>

      {/* Envelope flags */}
      {(overPace.length > 0 || nearPace.length > 0) && (
        <div className="space-y-1">
          {overPace.map(e => (
            <div key={e.id} className="flex items-center justify-between text-xs" style={{ color: '#C56B5A' }}>
              <span><AlertTriangle size={10} className="inline mr-1" />{e.name}</span>
              <span className="mono">{fmt(e.weekEnvSpent)} / {fmt(e.weekPace)} ({Math.round(e.pct)}%)</span>
            </div>
          ))}
          {nearPace.map(e => (
            <div key={e.id} className="flex items-center justify-between text-xs" style={{ color: '#D97757' }}>
              <span><AlertTriangle size={10} className="inline mr-1" />{e.name}</span>
              <span className="mono">{fmt(e.weekEnvSpent)} / {fmt(e.weekPace)} ({Math.round(e.pct)}%)</span>
            </div>
          ))}
        </div>
      )}

      {overPace.length === 0 && nearPace.length === 0 && envelopes.length > 0 && (
        <div className="flex items-center gap-2 text-xs" style={{ color: '#7FA068' }}>
          <Check size={11} />
          <span>All envelopes within weekly pace</span>
        </div>
      )}
    </div>
  );
}
