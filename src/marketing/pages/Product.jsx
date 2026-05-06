// src/marketing/pages/Product.jsx

import React, { useState } from 'react';

const STAGES = [
  {
    id: 'foundation',
    icon: '○',
    title: 'Foundation',
    subtitle: 'Where the system begins',
    what: 'You don\'t need financial experience or perfect habits to start. Foundation begins with three things: seeing where your money goes, building savings, and setting your first goal. Nothing more until you\'re ready for more.',
    why: 'Most financial tools assume you\'re already organised. Foundation doesn\'t. It holds the structure you don\'t have yet — so you build discipline through the system, not before it.',
    points: [
      'Spending log — see where money goes',
      'First savings goal — one clear target',
      'Spending awareness without complexity',
      'Structure in place from day one',
      'No configuration required to begin',
    ],
  },
  {
    id: 'build',
    icon: '◎',
    title: 'Build',
    subtitle: 'Structure takes shape',
    what: 'As you use the system, your habits begin to change. Spending becomes intentional. Decisions slow down. Patterns become visible — and something you can act on. You\'re not forcing discipline. You\'re following a system that creates it.',
    why: 'Discipline isn\'t a personality trait. It\'s a response to the right environment. The Build stage is where the environment starts working on your behalf — quietly, without pressure.',
    points: [
      'Spending Gate — a pause before major purchases',
      'Impulse log — decisions tracked over time',
      'Buffer begins to grow',
      'Stage progression recognised automatically',
      'Structural habits form without conscious effort',
    ],
  },
  {
    id: 'structure',
    icon: '◈',
    title: 'Structure',
    subtitle: 'Deeper control',
    what: 'Once the foundation is in place, the system expands. Money is no longer reactive — it\'s structured. You allocate with purpose, plan ahead, and protect what you\'ve built. The same system, now working at a deeper level.',
    why: 'Structure is not complexity. It\'s the difference between reacting to money and directing it. At this stage, every income event has a role before it arrives.',
    points: [
      'Envelope budgeting — money assigned before spent',
      'Profit allocator — income split automatically on arrival',
      'Buffer protection — system guards the reserve',
      'Monthly review and pulse check-in',
      'Planning ahead with real income data',
    ],
  },
  {
    id: 'full-system',
    icon: '◉',
    title: 'Full System',
    subtitle: 'Complete financial control',
    what: 'This is not a different product. It is the full version of the same system. Structured allocation. Long-term planning. Complete visibility. You didn\'t switch systems. You grew into it.',
    why: 'The full system is where discipline compounds. Every income event is allocated automatically. Every decision has a structure behind it. The system runs whether you\'re thinking about it or not.',
    points: [
      'Full profit allocator — four-way income split',
      'Long-term savings alongside buffer',
      'Stage 3 waterfall — wealth compounds automatically',
      'Complete financial visibility in one dashboard',
      'System operates in the background of your life',
    ],
  },
  {
    id: 'discipline',
    icon: '◆',
    title: 'The Discipline System',
    subtitle: 'What protects your decisions',
    what: 'Important decisions are not left to willpower. The system protects them. Spending is gated before it happens. Structural changes require confirmation. Key actions are intentional, not reactive.',
    why: 'The biggest risk in managing money is not external — it\'s yourself on a difficult day, overriding decisions you made when thinking clearly. The discipline system removes that option.',
    points: [
      'Spending Gate — mandatory hold before major purchases',
      'PIN-protected fields — structural changes require deliberate action',
      '24-hour review period on discretionary spend',
      'Impulse log — decisions tracked and visible over time',
      'The system enforces discipline — you follow it',
    ],
  },
  {
    id: 'why',
    icon: '→',
    title: 'Why This Works',
    subtitle: 'Built for real financial behaviour',
    what: 'Most financial tools assume stable income, consistent habits, and perfect planning. Royal Ledger does not. It is built for inconsistent income, early-stage earners, and real financial behaviour — where the starting point is imperfect and the path is not linear.',
    why: 'You don\'t need to be disciplined to start. You need a system that builds discipline for you. That is what Royal Ledger is.',
    points: [
      'No assumption of fixed or predictable income',
      'Foundation mode for users starting from scratch',
      'Stage-based — advances with your discipline',
      'Works for students, allowance earners, irregular income',
      'The system grows — you never start over',
    ],
  },
];

export default function Product({ navigate }) {
  const [activeId, setActiveId] = useState(null);

  return (
    <div>
      <div className="m-nav-spacer" />

      {/* ── Header ── */}
      <section className="m-section-sm" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-md">
          <div className="m-label" style={{ marginBottom: '16px' }}>Product</div>
          <h1 className="m-display" style={{ fontSize: 'clamp(36px, 5vw, 60px)', color: '#E8E2D5', marginBottom: '20px' }}>
            Built to grow{' '}
            <em style={{ color: '#D97757', fontStyle: 'italic' }}>with you.</em>
          </h1>
          <p className="m-body" style={{ fontSize: '17px', maxWidth: '540px', marginBottom: '12px' }}>
            Royal Ledger adapts to your stage — whether you're starting with a first income
            or managing a full financial structure.
          </p>
          <p style={{ fontSize: '14px', color: '#5C5648', maxWidth: '480px', lineHeight: 1.7 }}>
            Start simple. Build control. Grow into the full system.
            Every stage is the same product — just working at a deeper level.
          </p>
        </div>
      </section>

      {/* ── Stage accordion ── */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="m-wrap">
          <div style={{ marginTop: '0' }}>
            {STAGES.map((stage) => (
              <div
                key={stage.id}
                style={{ borderBottom: '1px solid #1A1610', cursor: 'pointer' }}
                onClick={() => setActiveId(activeId === stage.id ? null : stage.id)}
              >
                {/* Row header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '28px 0', gap: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                    <div style={{
                      width: 44, height: 44, background: '#14110E', border: '1px solid #26221C',
                      borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px', flexShrink: 0, color: '#8B8478',
                    }}>
                      {stage.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#E8E2D5', letterSpacing: '-0.01em' }}>{stage.title}</div>
                      <div style={{ fontSize: '13px', color: '#8B8478', marginTop: '2px' }}>{stage.subtitle}</div>
                    </div>
                  </div>
                  <div style={{
                    color: activeId === stage.id ? '#D97757' : '#5C5648',
                    fontSize: '18px', flexShrink: 0,
                    transform: activeId === stage.id ? 'rotate(45deg)' : 'none',
                    transition: 'all 200ms',
                  }}>+</div>
                </div>

                {/* Expanded panel */}
                {activeId === stage.id && (
                  <div style={{ paddingBottom: '32px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }} className="product-expand-grid">
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#8B8478', marginBottom: '12px' }}>
                          At This Stage
                        </div>
                        <p style={{ fontSize: '15px', color: '#E8E2D5', lineHeight: 1.7, marginBottom: '20px' }}>{stage.what}</p>
                        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#8B8478', marginBottom: '12px' }}>
                          Why It Matters
                        </div>
                        <p style={{ fontSize: '14px', color: '#B0A898', lineHeight: 1.7 }}>{stage.why}</p>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#8B8478', marginBottom: '12px' }}>
                          What Opens Up
                        </div>
                        {stage.points.map((pt, j) => (
                          <div key={j} style={{
                            display: 'flex', alignItems: 'flex-start', gap: '10px',
                            padding: '8px 0',
                            borderBottom: j < stage.points.length - 1 ? '1px solid #1A1610' : 'none',
                          }}>
                            <span style={{ color: '#D97757', flexShrink: 0, fontSize: '13px', marginTop: '1px' }}>→</span>
                            <span style={{ fontSize: '13px', color: '#B0A898', lineHeight: 1.5 }}>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 640px) {
          .product-expand-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── CTA ── */}
      <section className="m-section-sm" style={{ background: '#0F0D0A', borderTop: '1px solid #1A1610' }}>
        <div className="m-wrap-sm" style={{ textAlign: 'center' }}>
          <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#E8E2D5', marginBottom: '20px' }}>
            Start building your system.
          </h2>
          <p className="m-body" style={{ marginBottom: '32px' }}>
            Apply for early access. No noise. No guesswork. Just structure.
          </p>
          <button className="m-btn m-btn-primary m-btn-lg" onClick={() => navigate('/early-access')}>
            Apply for Early Access
          </button>
          <p style={{ marginTop: '14px', fontSize: '12px', color: '#5C5648' }}>
            Private beta. Invite-only. No credit card required.
          </p>
        </div>
      </section>
    </div>
  );
}
