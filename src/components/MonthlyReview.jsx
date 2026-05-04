// src/components/MonthlyReview.jsx
//
// End-of-month guided review.
// Three entry points:
//   1. Tab in navigation
//   2. Auto-popup on the 1st (or last day) of the month if not yet reviewed
//   3. Button on Command tab any time
//
// Generates a one-page summary, walks through end-of-month actions,
// and records the review so we know it's been done for that month.

import React, { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Wallet, Shield, Sparkles, Check, X,
  ArrowRight, Calendar, AlertTriangle, Target, BarChart3, Camera,
  PiggyBank, Briefcase, Heart, Award
} from 'lucide-react';

import { makeFmt } from '../lib/currency';

// ─────────────── REVIEW HELPERS ───────────────

// Get the "month being reviewed" — by default it's the current month
// (or the previous month if it's the first few days)
function getReviewMonth() {
  const now = new Date();
  const day = now.getDate();
  // If we're in the first 3 days of a month, review the previous month
  if (day <= 3) {
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return {
      year: prev.getFullYear(),
      month: prev.getMonth(),
      label: prev.toLocaleString('en', { month: 'long', year: 'numeric' }),
      key: `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`,
    };
  }
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
    label: now.toLocaleString('en', { month: 'long', year: 'numeric' }),
    key: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
  };
}

function buildReviewData(data, stats, reviewMonth) {
  const monthStart = new Date(reviewMonth.year, reviewMonth.month, 1).getTime();
  const monthEnd = new Date(reviewMonth.year, reviewMonth.month + 1, 0).getTime() + (24 * 60 * 60 * 1000) - 1;

  // Trading P&L for the month
  const monthPnL = (data.tradingPnLHistory || []).find(p => p.month === reviewMonth.key);
  const tradingProfit = monthPnL?.pnl || 0;

  // Spending this month
  const monthImpulses = (data.impulses || []).filter(i => i.timestamp >= monthStart && i.timestamp <= monthEnd);
  const totalSpent = monthImpulses.reduce((s, i) => s + i.amount, 0);

  // By envelope
  const envelopes = data.envelopes || [];
  const envelopePerformance = envelopes.map(env => {
    const spent = monthImpulses
      .filter(i => i.envelopeId === env.id)
      .reduce((s, i) => s + i.amount, 0);
    const unspent = Math.max(0, env.cap - spent);
    const overspent = Math.max(0, spent - env.cap);
    return {
      ...env,
      spent,
      unspent,
      overspent,
      pct: env.cap > 0 ? (spent / env.cap) * 100 : 0,
      onTarget: spent <= env.cap,
    };
  });

  const totalAllocated = envelopes.reduce((s, e) => s + (e.cap || 0), 0);
  const envelopesOnTarget = envelopePerformance.filter(e => e.onTarget).length;
  const envelopesOver = envelopePerformance.filter(e => !e.onTarget).length;
  const totalSweepable = envelopePerformance
    .filter(e => e.rolloverMode === 'sweep')
    .reduce((s, e) => s + e.unspent, 0);

  // Buffer change
  const snapshots = (data.snapshots || []).sort((a, b) => a.date.localeCompare(b.date));
  const monthStartSnapshot = snapshots.find(s => {
    const d = new Date(s.date);
    return d.getFullYear() === reviewMonth.year && d.getMonth() === reviewMonth.month && d.getDate() <= 5;
  });
  const monthEndSnapshot = [...snapshots].reverse().find(s => {
    const d = new Date(s.date);
    return d.getFullYear() === reviewMonth.year && d.getMonth() === reviewMonth.month;
  });
  const bufferStart = monthStartSnapshot?.buffer || 0;
  const bufferNow = data.buffer || 0;
  const bufferChange = bufferNow - bufferStart;

  // Income (salary + trading)
  const totalIncome = stats.salary + Math.max(0, tradingProfit);
  const savingsThisMonth = bufferChange + totalSweepable;
  const savingsRate = totalIncome > 0 ? (savingsThisMonth / totalIncome) * 100 : 0;

  // Stage progression
  const monthsToTarget = stats.salary > 0 && (stats.bufferTarget - bufferNow) > 0
    ? Math.ceil((stats.bufferTarget - bufferNow) / (data.bufferReserve + Math.max(0, tradingProfit * 0.7)))
    : 0;

  return {
    reviewMonth,
    tradingProfit,
    totalSpent,
    monthImpulses,
    envelopePerformance,
    totalAllocated,
    envelopesOnTarget,
    envelopesOver,
    totalSweepable,
    bufferStart,
    bufferNow,
    bufferChange,
    totalIncome,
    savingsThisMonth,
    savingsRate,
    monthsToTarget,
    stage: stats.stage,
    stats,
  };
}

// ─────────────── MAIN COMPONENT ───────────────
export default function MonthlyReview({ data, setData, stats, mode = 'tab', onClose }) {
  const fmt = makeFmt(data.currency);
  const reviewMonth = getReviewMonth();
  const review = useMemo(() => buildReviewData(data, stats, reviewMonth), [data, stats, reviewMonth.key]);

  const reviewedMonths = data.reviewedMonths || [];
  const alreadyReviewed = reviewedMonths.includes(reviewMonth.key);

  const [step, setStep] = useState(alreadyReviewed ? 'summary' : 'overview');
  const [actionsCompleted, setActionsCompleted] = useState({
    snapshot: false,
    pnl: !!(data.tradingPnLHistory || []).find(p => p.month === reviewMonth.key),
    rollover: !!data.lastEnvelopeRollover && data.lastEnvelopeRollover === reviewMonth.key,
  });

  const markReviewed = () => {
    setData(d => ({
      ...d,
      reviewedMonths: [...(d.reviewedMonths || []), reviewMonth.key],
    }));
    if (mode === 'modal' && onClose) onClose();
    else setStep('summary');
  };

  // ───── MODAL WRAPPER ─────
  const containerStyle = mode === 'modal' ? {
    position: 'fixed', inset: 0, background: 'rgba(10, 9, 8, 0.92)',
    backdropFilter: 'blur(6px)', zIndex: 9999,
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    padding: '20px', overflow: 'auto',
  } : {};

  const innerStyle = mode === 'modal' ? {
    background: '#0A0908',
    border: '1px solid #26221C',
    borderRadius: '6px',
    maxWidth: '760px',
    width: '100%',
    marginTop: '40px',
    padding: '32px',
  } : {};

  const Wrapper = ({ children }) => mode === 'modal' ? (
    <div style={containerStyle} onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}>
      <div style={innerStyle}>{children}</div>
    </div>
  ) : (
    <div className="space-y-6">{children}</div>
  );

  return (
    <Wrapper>
      {mode === 'modal' && (
        <div className="flex justify-between items-baseline mb-4">
          <div className="label" style={{ color: '#D97757' }}>Monthly Review</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8B8478', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
      )}

      <div>
        <h1 className="display text-4xl mb-2" style={{ fontWeight: 300 }}>
          {reviewMonth.label} <span style={{ fontStyle: 'italic', color: '#D97757' }}>review</span>
        </h1>
        <p style={{ color: '#8B8478', fontSize: '15px' }}>
          {alreadyReviewed
            ? "You've already reviewed this month. Here's the summary."
            : "Take 5 minutes. Look at what happened. Set up next month."}
        </p>
      </div>

      {/* === TOP-LINE METRICS === */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          icon={Wallet}
          label="Spent"
          value={fmt(review.totalSpent)}
          color="#D97757"
          subtitle={`of ${fmt(review.totalAllocated)} budget`}
        />
        <MetricCard
          icon={TrendingUp}
          label="Trading P&L"
          value={(review.tradingProfit >= 0 ? '+' : '') + fmt(review.tradingProfit)}
          color={review.tradingProfit >= 0 ? '#7FA068' : '#C56B5A'}
          subtitle={review.tradingProfit === 0 ? 'Not logged' : 'this month'}
        />
        <MetricCard
          icon={PiggyBank}
          label="Savings rate"
          value={review.savingsRate.toFixed(0) + '%'}
          color={review.savingsRate >= 20 ? '#7FA068' : review.savingsRate >= 10 ? '#B89968' : '#C56B5A'}
          subtitle="of income"
        />
        <MetricCard
          icon={Shield}
          label="Buffer change"
          value={(review.bufferChange >= 0 ? '+' : '') + fmt(review.bufferChange)}
          color={review.bufferChange >= 0 ? '#7FA068' : '#C56B5A'}
          subtitle="this month"
        />
      </div>

      {/* === ENVELOPE PERFORMANCE === */}
      {review.envelopePerformance.length > 0 && (
        <section className="card p-7">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="display text-2xl">Envelope performance</h2>
            <div className="text-sm" style={{ color: '#8B8478' }}>
              <span style={{ color: '#7FA068' }}>{review.envelopesOnTarget} on target</span>
              {review.envelopesOver > 0 && (
                <>
                  <span style={{ color: '#5C5648' }}> · </span>
                  <span style={{ color: '#C56B5A' }}>{review.envelopesOver} over</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {review.envelopePerformance
              .sort((a, b) => b.pct - a.pct)
              .map(env => (
                <div key={env.id}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-sm">{env.name}</span>
                      {env.onTarget ? (
                        <Check size={12} style={{ color: '#7FA068' }} />
                      ) : (
                        <AlertTriangle size={12} style={{ color: '#C56B5A' }} />
                      )}
                    </div>
                    <div className="text-xs mono" style={{ color: env.onTarget ? '#8B8478' : '#C56B5A' }}>
                      {fmt(env.spent)} / {fmt(env.cap)}
                      {env.unspent > 0 && env.rolloverMode === 'sweep' && (
                        <span style={{ color: '#7FA068' }}> · {fmt(env.unspent)} → buffer</span>
                      )}
                    </div>
                  </div>
                  <div className="progress">
                    <div
                      className="progress-fill"
                      style={{
                        width: Math.min(100, env.pct) + '%',
                        background: env.pct >= 100 ? '#C56B5A' : env.pct >= 80 ? '#D97757' : env.pct >= 50 ? '#B89968' : '#7FA068',
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>

          {review.totalSweepable > 0 && (
            <div className="mt-5 pt-5 border-t flex items-center justify-between" style={{ borderColor: '#26221C' }}>
              <div className="flex items-center gap-2">
                <Sparkles size={14} style={{ color: '#7FA068' }} />
                <span className="text-sm">Discipline reward</span>
              </div>
              <span className="display text-lg" style={{ color: '#7FA068', fontWeight: 300 }}>
                +{fmt(review.totalSweepable)} → buffer
              </span>
            </div>
          )}
        </section>
      )}

      {/* === BUFFER / STAGE PROGRESS === */}
      <section className="card p-7">
        <h2 className="display text-2xl mb-4">Stage progress</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <div className="label mb-2" style={{ color: '#5C5648' }}>Current buffer</div>
            <div className="display text-3xl" style={{ fontWeight: 300, color: '#D97757' }}>{fmt(review.bufferNow)}</div>
            <div className="text-xs mt-1" style={{ color: '#8B8478' }}>
              {review.stats.monthsCovered.toFixed(1)} months covered · Stage {review.stage}
            </div>
          </div>
          <div>
            <div className="label mb-2" style={{ color: '#5C5648' }}>Pace to fortified</div>
            <div className="display text-3xl" style={{ fontWeight: 300 }}>
              {review.monthsToTarget > 0 ? `~${review.monthsToTarget} mo` : 'Achieved'}
            </div>
            <div className="text-xs mt-1" style={{ color: '#8B8478' }}>
              At current monthly contribution rate
            </div>
          </div>
        </div>
        {(data.futureGoals || 0) > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: '#26221C' }}>
            <div className="flex items-center gap-2">
              <Award size={14} style={{ color: '#A06B8C' }} />
              <span className="text-sm" style={{ color: '#8B8478' }}>Future goals saved</span>
            </div>
            <span className="mono text-sm" style={{ color: '#A06B8C' }}>{fmt(data.futureGoals)}</span>
          </div>
        )}
      </section>

      {/* === END-OF-MONTH ACTIONS === */}
      {!alreadyReviewed && (
        <section className="card-warm p-7">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="display text-2xl">End-of-month actions</h2>
            <span className="label" style={{ color: '#D97757' }}>Do these now</span>
          </div>

          <div className="space-y-3">
            {/* Action 1: Log P&L */}
            <ActionRow
              done={actionsCompleted.pnl}
              icon={TrendingUp}
              title="Log this month's trading P&L"
              desc={actionsCompleted.pnl
                ? `Logged: ${review.tradingProfit >= 0 ? '+' : ''}${fmt(review.tradingProfit)}`
                : 'Without this, allocations and savings rate are incomplete'}
              actionLabel="Go to Trading P&L"
              onAction={() => {
                if (mode === 'modal' && onClose) onClose();
                window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'trading' }));
              }}
            />

            {/* Action 2: Apply rollover */}
            <ActionRow
              done={actionsCompleted.rollover}
              icon={Sparkles}
              title="Apply envelope rollover"
              desc={review.totalSweepable > 0
                ? `Sweep ${fmt(review.totalSweepable)} of unspent envelope money to your buffer`
                : 'No sweep eligible this month — but mark rollover applied'}
              actionLabel="Go to Budget"
              onAction={() => {
                if (mode === 'modal' && onClose) onClose();
                window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'budget' }));
              }}
            />

            {/* Action 3: Take snapshot */}
            <ActionRow
              done={actionsCompleted.snapshot}
              icon={Camera}
              title="Take a snapshot"
              desc="Record this month-end state for the historical chart"
              actionLabel="Take snapshot now"
              onAction={() => {
                const today = new Date().toISOString().slice(0, 10);
                const snapshot = {
                  date: today,
                  buffer: data.buffer,
                  tradingCapital: data.tradingCapital,
                  longTerm: data.longTerm,
                  totalAssets: stats.totalAssets,
                  salary: stats.salary,
                  monthsCovered: stats.monthsCovered,
                  stage: stats.stage,
                };
                setData(d => ({
                  ...d,
                  snapshots: [...(d.snapshots || []).filter(s => s.date !== today), snapshot]
                    .sort((a, b) => a.date.localeCompare(b.date)),
                  lastSnapshot: today,
                }));
                setActionsCompleted(a => ({ ...a, snapshot: true }));
              }}
            />
          </div>

          <div className="mt-6 pt-6 border-t" style={{ borderColor: '#3A2A1E' }}>
            <button
              onClick={markReviewed}
              className="btn px-5 py-3 w-full"
              style={{ background: '#D97757', color: '#0A0908', borderRadius: '4px', fontWeight: 600, fontSize: '14px' }}
            >
              <Check size={14} className="inline mr-2" /> Mark month as reviewed
            </button>
            <p className="text-xs text-center mt-2" style={{ color: '#5C5648' }}>
              Records that you've completed this month's review. Won't show this prompt again until next month.
            </p>
          </div>
        </section>
      )}

      {/* === TAKEAWAY === */}
      <section className="card-warm p-7">
        <div className="flex items-center gap-2 mb-3">
          <Award size={16} style={{ color: '#D97757' }} />
          <h2 className="display text-2xl">The takeaway</h2>
        </div>
        <p className="text-base" style={{ color: '#E8E2D5', lineHeight: 1.7 }}>
          {generateTakeaway(review)}
        </p>
      </section>
    </Wrapper>
  );
}

// ─────────────── HELPERS ───────────────

function MetricCard({ icon: Icon, label, value, color, subtitle }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} style={{ color }} />
        <span className="label" style={{ color: '#5C5648' }}>{label}</span>
      </div>
      <div className="display text-2xl mb-1" style={{ color, fontWeight: 300 }}>{value}</div>
      <div className="text-xs" style={{ color: '#5C5648' }}>{subtitle}</div>
    </div>
  );
}

function ActionRow({ done, icon: Icon, title, desc, actionLabel, onAction }) {
  return (
    <div
      className="card p-4 flex items-start gap-3"
      style={{
        borderColor: done ? '#2A3A1E' : '#26221C',
        background: done ? '#10180F' : '#14110E',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: done ? '#7FA068' : '#1A1410',
          flexShrink: 0,
        }}
      >
        {done ? <Check size={16} style={{ color: '#0A0908' }} /> : <Icon size={14} style={{ color: '#D97757' }} />}
      </div>
      <div style={{ flex: 1 }}>
        <div className="font-medium text-sm mb-0.5">{title}</div>
        <div className="text-xs" style={{ color: '#8B8478' }}>{desc}</div>
      </div>
      {!done && (
        <button
          onClick={onAction}
          className="btn px-3 py-1.5 text-xs"
          style={{ background: 'transparent', color: '#D97757', border: '1px solid #3A2A1E', borderRadius: '3px', flexShrink: 0 }}
        >
          {actionLabel} →
        </button>
      )}
    </div>
  );
}

function generateTakeaway(review) {
  const messages = [];

  // Savings rate
  if (review.savingsRate >= 30) {
    messages.push(`Saving ${review.savingsRate.toFixed(0)}% of income — exceptional discipline.`);
  } else if (review.savingsRate >= 20) {
    messages.push(`Saving ${review.savingsRate.toFixed(0)}% of income — at the target zone.`);
  } else if (review.savingsRate >= 10) {
    messages.push(`Saving ${review.savingsRate.toFixed(0)}% of income — building, but room to push higher.`);
  } else if (review.savingsRate > 0) {
    messages.push(`Saving ${review.savingsRate.toFixed(0)}% — barely treading water. Tighten an envelope to free up cash.`);
  } else {
    messages.push(`No savings this month. Either income was low or spending was high.`);
  }

  // Envelope discipline
  if (review.envelopesOnTarget === review.envelopePerformance.length && review.envelopePerformance.length > 0) {
    messages.push(`All ${review.envelopePerformance.length} envelopes stayed on target. That's the goal.`);
  } else if (review.envelopesOver > 0) {
    const overEnvs = review.envelopePerformance.filter(e => !e.onTarget).map(e => e.name).join(', ');
    messages.push(`Over budget on ${overEnvs} — review whether the cap is realistic or the spending pattern is.`);
  }

  // Sweep result
  if (review.totalSweepable > 0) {
    messages.push(`Discipline rewarded you with ${fmt(review.totalSweepable)} swept to buffer — that's automation working.`);
  }

  // Stage trajectory
  if (review.monthsToTarget > 0 && review.monthsToTarget < 100) {
    messages.push(`At this pace, you reach fortified buffer in ~${review.monthsToTarget} months.`);
  }

  return messages.join(' ');
}

// ─────────────── AUTO-POPUP HOOK ───────────────
// This is a separate exported hook so App.jsx can decide when to show the modal

export function useShouldShowReviewModal(data) {
  const reviewMonth = getReviewMonth();
  const reviewedMonths = data.reviewedMonths || [];
  const now = new Date();
  const day = now.getDate();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // Show on last 3 days of month OR first 3 days of next month
  const isReviewWindow = day >= lastDayOfMonth - 2 || day <= 3;
  const alreadyReviewed = reviewedMonths.includes(reviewMonth.key);

  return isReviewWindow && !alreadyReviewed && (data.expenses || []).length > 0;
}
