// src/marketing/pages/HowItWorks.jsx

import React from 'react';

const STEPS = [
  {
    num: '01',
    title: 'Enter your income',
    body: 'Input your monthly expenses, buffer target, and income type. The system computes your salary, your buffer thresholds, and your stage — automatically.',
    detail: 'Setup takes ten minutes. You enter your real expenses — rent, food, insurance, dependents. The system computes everything else: salary, tax reserve, buffer target, and the thresholds between stages.',
    accent: false,
  },
  {
    num: '02',
    title: 'The system allocates it',
    body: 'Every income event is split by your stage rules before you spend a cent. Buffer first. Then long-term. Then trading capital. Then lifestyle.',
    detail: 'You never decide in the moment. Stage 1 directs 100% of income to the buffer. Stage 3 runs a four-way split. The rules are yours — the decisions are automatic.',
    accent: false,
  },
  {
    num: '03',
    title: 'Spend within your limits',
    body: 'Your spending budget is pre-defined by your salary computation. The Spending Gate enforces it. Envelope budgets give every category its own cap.',
    detail: 'You don\'t need willpower. The system enforces the limits. Each spending envelope has its own cap, block mode, and rollover behaviour.',
    accent: false,
  },
  {
    num: '04',
    title: 'Impulses are gated',
    body: 'Discretionary purchases above your threshold go into a 24-hour hold. You approve, reject, or let them expire. Your impulse history is tracked over time.',
    detail: 'The gate doesn\'t block spending — it delays it. Most things you want at night, you don\'t need in the morning. The gate makes that gap structural, not aspirational.',
    accent: true,
  },
  {
    num: '05',
    title: 'Wealth compounds',
    body: 'Buffer builds. Long-term grows. Trading capital is protected by drawdown rules. Stage by stage, the household moves from fragile to fortified.',
    detail: 'The system tracks stage progression, buffer health, drawdown risk, and net worth over time. Every snapshot tells you whether the direction is right — without the anxiety of daily checking.',
    accent: false,
  },
];

export default function HowItWorks({ navigate }) {
  return (
    <div>
      <div className="m-nav-spacer" />

      {/* Header */}
      <section className="m-section-sm" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-md">
          <div className="m-label" style={{ marginBottom: '16px' }}>How It Works</div>
          <h1 className="m-display" style={{ fontSize: 'clamp(36px, 5vw, 60px)', color: '#E8E2D5', marginBottom: '20px' }}>
            One income.
            <br />
            <em style={{ color: '#D97757', fontStyle: 'italic' }}>Every rand allocated.</em>
            <br />
            Zero guesswork.
          </h1>
          <p className="m-body" style={{ fontSize: '17px', maxWidth: '520px' }}>
            The system does the thinking. You do the living. Here's how Royal-Icon Ledger works from first login to financial structure.
          </p>
        </div>
      </section>

      {/* Flow overview strip */}
      <section className="m-section-xs" style={{ background: '#0F0D0A', borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap">
          <div className="m-flow" style={{ justifyContent: 'center', gap: '8px' }}>
            {['Enter income', '→', 'System allocates', '→', 'Spend within limits', '→', 'Gate impulses', '→', 'Wealth compounds'].map((item, i) =>
              item === '→'
                ? <span key={i} className="m-flow-arrow" style={{ color: '#3A3028', fontSize: '16px' }}>→</span>
                : <div key={i} className="m-flow-node" style={{ padding: '10px 20px' }}>{item}</div>
            )}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="m-section">
        <div className="m-wrap-md">
          <div className="m-timeline">
            {STEPS.map((step, i) => (
              <div key={step.num} className="m-timeline-item">
                <div className="m-timeline-dot" style={{ background: step.accent ? '#D97757' : '#B89968' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }} className="how-step-grid">
                  {/* Left: main content */}
                  <div>
                    <div className="m-mono" style={{ fontSize: '11px', color: '#D97757', letterSpacing: '0.12em', marginBottom: '10px' }}>
                      Step {step.num}
                    </div>
                    <h2 className="m-display" style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: '#E8E2D5', marginBottom: '14px' }}>
                      {step.title}
                    </h2>
                    <p style={{ fontSize: '16px', color: '#8B8478', lineHeight: 1.7 }}>
                      {step.body}
                    </p>
                  </div>

                  {/* Right: detail card */}
                  <div className={step.accent ? 'm-card-warm' : 'm-card'} style={{ padding: '24px', marginTop: '4px' }}>
                    <p style={{ fontSize: '14px', color: '#8B8478', lineHeight: 1.75 }}>
                      {step.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 640px) {
          .how-step-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
        }
      `}</style>

      {/* Principle */}
      <section className="m-section-sm" style={{ background: '#0F0D0A', borderTop: '1px solid #1A1610', borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-sm" style={{ textAlign: 'center' }}>
          <h2 className="m-display" style={{ fontSize: 'clamp(26px, 4vw, 44px)', color: '#E8E2D5', marginBottom: '20px', lineHeight: 1.2 }}>
            "People are not failing because they are{' '}
            <em style={{ color: '#C56B5A', fontStyle: 'italic' }}>careless</em>.
            <br />
            They are failing because they are{' '}
            <em style={{ color: '#D97757', fontStyle: 'italic' }}>unstructured</em>."
          </h2>
          <p style={{ fontSize: '13px', color: '#3A3028', letterSpacing: '0.06em' }}>
            — The belief behind Royal-Icon Ledger
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="m-section-sm">
        <div className="m-wrap-sm" style={{ textAlign: 'center' }}>
          <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#E8E2D5', marginBottom: '20px' }}>
            The structure is ready.{' '}
            <em style={{ color: '#D97757', fontStyle: 'italic' }}>Are you?</em>
          </h2>
          <button className="m-btn m-btn-primary m-btn-lg" onClick={() => navigate('/early-access')}>
            Request Early Access
          </button>
        </div>
      </section>
    </div>
  );
}
