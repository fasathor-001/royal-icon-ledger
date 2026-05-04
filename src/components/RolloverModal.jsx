// src/components/RolloverModal.jsx
//
// Auto-triggered on first visit of a new month when the previous month
// hasn't been rolled over yet. Shows what happened to each envelope
// (swept / rolled / reset) and executes the sweep to buffer on confirm.

import React, { useMemo } from 'react';
import { Check, X, ArrowRight, Repeat, Sparkles } from 'lucide-react';
import { makeFmt } from '../lib/currency';

function getPreviousMonth() {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return {
    key: `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`,
    label: prev.toLocaleString('en', { month: 'long', year: 'numeric' }),
    start: prev.getTime(),
    end: new Date(now.getFullYear(), now.getMonth(), 1).getTime() - 1,
  };
}

export default function RolloverModal({ data, setData, onClose }) {
  const fmt = makeFmt(data.currency);
  const prevMonth = getPreviousMonth();

  const rolloverItems = useMemo(() => {
    const envelopes = data.envelopes || [];
    return envelopes.map(env => {
      const spent = (data.impulses || [])
        .filter(i => i.timestamp >= prevMonth.start && i.timestamp <= prevMonth.end && i.envelopeId === env.id)
        .reduce((s, i) => s + i.amount, 0);
      const unspent = Math.max(0, env.cap - spent);
      const overspent = Math.max(0, spent - env.cap);
      return { ...env, spent, unspent, overspent, pct: env.cap > 0 ? (spent / env.cap) * 100 : 0 };
    });
  }, [data.envelopes, data.impulses, prevMonth.start, prevMonth.end]);

  const swept = rolloverItems.filter(e => e.rolloverMode === 'sweep');
  const rolled = rolloverItems.filter(e => e.rolloverMode === 'roll');
  const reset = rolloverItems.filter(e => e.rolloverMode === 'reset');
  const totalSwept = swept.reduce((s, e) => s + e.unspent, 0);

  const confirm = () => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    setData(d => ({
      ...d,
      buffer: d.buffer + totalSwept,
      lastEnvelopeRollover: prevMonth.key,
      envelopeRolloverHistory: [
        ...(d.envelopeRolloverHistory || []),
        {
          month: prevMonth.key,
          timestamp: Date.now(),
          summary: rolloverItems,
          totalSwept,
        },
      ],
    }));
    onClose();
  };

  const actionLabel = (env) => {
    if (env.rolloverMode === 'sweep') {
      return env.unspent > 0
        ? { text: `Sweep ${fmt(env.unspent)} → buffer`, color: '#7FA068' }
        : { text: 'Nothing to sweep', color: '#5C5648' };
    }
    if (env.rolloverMode === 'roll') {
      return env.unspent > 0
        ? { text: `Roll over ${fmt(env.unspent)}`, color: '#B89968' }
        : { text: 'Nothing to roll', color: '#5C5648' };
    }
    return { text: 'Reset to zero', color: '#8B8478' };
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(10, 9, 8, 0.92)',
        backdropFilter: 'blur(6px)',
        zIndex: 9998,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '20px', overflow: 'auto',
      }}
    >
      <div
        style={{
          background: '#0A0908', border: '1px solid #26221C', borderRadius: '6px',
          maxWidth: '640px', width: '100%', marginTop: '60px', padding: '32px',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="label mb-1" style={{ color: '#D97757' }}>Month-end rollover</div>
            <h2 className="display text-3xl" style={{ fontWeight: 300 }}>
              <span style={{ fontStyle: 'italic' }}>{prevMonth.label}</span> closed.
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#5C5648', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Summary line */}
        <div className="card-warm p-4 mb-6 flex items-center gap-3">
          <Repeat size={16} style={{ color: '#D97757', flexShrink: 0 }} />
          <p className="text-sm" style={{ color: '#E8E2D5', lineHeight: 1.6 }}>
            {totalSwept > 0 && <><strong style={{ color: '#7FA068' }}>{fmt(totalSwept)}</strong> swept from {swept.filter(e => e.unspent > 0).map(e => e.name).join(', ')} to Buffer. </>}
            {rolled.filter(e => e.unspent > 0).length > 0 && <><strong style={{ color: '#B89968' }}>{rolled.filter(e => e.unspent > 0).map(e => e.name).join(', ')}</strong> carried forward. </>}
            {reset.length > 0 && <><strong style={{ color: '#8B8478' }}>{reset.map(e => e.name).join(', ')}</strong> reset.</>}
          </p>
        </div>

        {/* Envelope breakdown */}
        <div className="space-y-2 mb-6">
          {rolloverItems.map(env => {
            const action = actionLabel(env);
            const barColor = env.pct >= 100 ? '#C56B5A' : env.pct >= 80 ? '#D97757' : env.pct >= 50 ? '#B89968' : '#7FA068';
            return (
              <div key={env.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-sm">{env.name}</span>
                    {env.overspent > 0 && (
                      <span className="text-xs ml-2" style={{ color: '#C56B5A' }}>({fmt(env.overspent)} over)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="mono text-xs" style={{ color: '#8B8478' }}>{fmt(env.spent)} / {fmt(env.cap)}</span>
                    <ArrowRight size={12} style={{ color: '#5C5648' }} />
                    <span className="text-xs font-medium" style={{ color: action.color }}>{action.text}</span>
                  </div>
                </div>
                <div className="progress" style={{ height: '4px' }}>
                  <div className="progress-fill" style={{ width: Math.min(100, env.pct) + '%', background: barColor }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Buffer preview */}
        {totalSwept > 0 && (
          <div className="card p-4 mb-6 flex items-center gap-3" style={{ borderColor: '#2A3A1E' }}>
            <Sparkles size={14} style={{ color: '#7FA068' }} />
            <div className="flex-1 text-sm">
              <span style={{ color: '#8B8478' }}>Buffer after sweep: </span>
              <span className="mono" style={{ color: '#7FA068' }}>{fmt((data.buffer || 0) + totalSwept)}</span>
              <span style={{ color: '#5C5648' }}> (+{fmt(totalSwept)})</span>
            </div>
          </div>
        )}

        {/* Confirm */}
        <button
          onClick={confirm}
          className="btn w-full p-4"
          style={{ background: '#D97757', color: '#0A0908', borderRadius: '4px', fontWeight: 600, fontSize: '14px' }}
        >
          <Check size={14} className="inline mr-2" />
          Confirm and continue →
        </button>
        <p className="text-xs text-center mt-3" style={{ color: '#5C5648' }}>
          Applies envelope sweeps and marks {prevMonth.label} as rolled over.
        </p>
      </div>
    </div>
  );
}
