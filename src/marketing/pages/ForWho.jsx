// src/marketing/pages/ForWho.jsx

import React from 'react';

const SEGMENTS = [
  {
    emoji: '💼',
    title: 'Freelancers',
    tagline: 'Feast and famine — managed.',
    pain: 'A R30,000 month followed by a R6,000 month. A big client who pays late. A dry Q1. Freelance income is not unpredictable — it just requires a different financial architecture.',
    outcomes: [
      'Salary is computed from expenses, not guessed from last month\'s invoice',
      'Buffer absorbs lean months without lifestyle disruption',
      'Allocator ensures every large payment is distributed, not spent',
      'Spending Gate prevents feast-month lifestyle inflation',
    ],
    quote: 'The buffer is what makes a R6,000 month feel like a R18,000 month.',
  },
  {
    emoji: '📈',
    title: 'Traders & Investors',
    tagline: 'Business and household. Separate by design.',
    pain: 'A losing month in the market should not mean the family budget changes. Trading capital should have its own rules, its own risk protocols, and its own tracking — completely isolated from the household.',
    outcomes: [
      'Trading P&L tracked separately from household finances',
      'Drawdown protocols enforce position-size reductions automatically',
      'High-water mark tracking for capital protection',
      'Emotional guard activates on consecutive losing days',
      'Buffer protects the household regardless of trading performance',
    ],
    quote: 'When the market is red, the household is still green.',
  },
  {
    emoji: '🏢',
    title: 'Business Owners',
    tagline: 'Pay yourself correctly. Finally.',
    pain: 'Owner compensation in a small business is often the last priority — or worse, it\'s whatever is left over. Business volatility bleeds into household decisions. The line between business and personal finance is blurred.',
    outcomes: [
      'Salary computed from household expenses — not from business cashflow',
      'Buffer shields the household from business volatility',
      'Owner\'s salary is a structured, consistent extraction',
      'Profit allocator handles irregular business income distributions',
    ],
    quote: 'Your household expenses define your salary. The business funds it.',
  },
  {
    emoji: '⚡',
    title: 'Gig Workers',
    tagline: 'Irregular payments. Consistent structure.',
    pain: 'Gig income arrives in small, frequent, unpredictable amounts. Without a system, every payment feels like a bonus — which means it gets spent like one. The financial architecture most gig workers use is: earn it, spend it.',
    outcomes: [
      'Every income event is allocated on receipt — not on feeling',
      'Buffer builds incrementally from every small payment',
      'Spending Gate prevents small-payment spending sprees',
      'System handles daily, weekly, and monthly income variability',
    ],
    quote: 'The system doesn\'t care if you earned R500 or R5,000. It allocates both correctly.',
  },
  {
    emoji: '🏠',
    title: 'Salaried + Side Income',
    tagline: 'Your primary income is structured. Your side income shouldn\'t be wasted.',
    pain: 'You have a fixed salary and a growing side business or investment portfolio. The salary covers the basics — but irregular top-ups from the side income get spent without a system. Over five years, that\'s hundreds of thousands in unallocated value.',
    outcomes: [
      'Fixed income handles household baseline expenses',
      'Variable side income allocated to buffer, long-term, and goals',
      'Stage system applies to total wealth, not just salary',
      'Separate tracking for each income stream',
    ],
    quote: 'Side income should accelerate stage progression — not fund impulse spending.',
  },
  {
    emoji: '👨‍👩‍👧',
    title: 'Families & Sole Earners',
    tagline: 'One income. One family. No room for error.',
    pain: 'When you are the sole earner for a household with dependents, financial error has real consequences. A month without a plan is a month the family feels. There is no partner income to fall back on.',
    outcomes: [
      'Buffer target is set in months of salary — not an arbitrary number',
      'Family expenses drive the salary computation',
      'Protection mode activates when buffer drops below the safe threshold',
      'Weekly pulse tracks household financial health',
    ],
    quote: 'The buffer target is not a savings goal. It\'s the number of months your family is protected.',
  },
];

function SegmentCard({ segment, navigate }) {
  return (
    <div style={{ borderBottom: '1px solid #1A1610', paddingBottom: '64px', marginBottom: '64px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }} className="segment-grid">

        {/* Left */}
        <div>
          <div style={{ fontSize: '28px', marginBottom: '16px' }}>{segment.emoji}</div>
          <div className="m-label" style={{ marginBottom: '12px' }}>{segment.tagline}</div>
          <h2 className="m-display" style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', color: '#E8E2D5', marginBottom: '20px' }}>
            {segment.title}
          </h2>
          <p style={{ fontSize: '15px', color: '#8B8478', lineHeight: 1.75, marginBottom: '28px' }}>
            {segment.pain}
          </p>
          <div className="m-card" style={{ padding: '20px 24px' }}>
            <p style={{ fontSize: '18px', color: '#D97757', fontStyle: 'italic', lineHeight: 1.6, fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300 }}>
              "{segment.quote}"
            </p>
          </div>
        </div>

        {/* Right: outcomes */}
        <div>
          <div className="m-label" style={{ marginBottom: '20px' }}>How it helps</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {segment.outcomes.map((outcome, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px',
                padding: '16px 0',
                borderBottom: i < segment.outcomes.length - 1 ? '1px solid #1A1610' : 'none',
              }}>
                <span style={{ color: '#D97757', flexShrink: 0, marginTop: '2px', fontSize: '13px' }}>→</span>
                <span style={{ fontSize: '14px', color: '#E8E2D5', lineHeight: 1.65 }}>{outcome}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForWho({ navigate }) {
  return (
    <div>
      <div className="m-nav-spacer" />

      <style>{`
        @media (max-width: 768px) { .segment-grid { grid-template-columns: 1fr !important; gap: 32px !important; } }
      `}</style>

      {/* Header */}
      <section className="m-section-sm" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-md">
          <div className="m-label" style={{ marginBottom: '16px' }}>For Who</div>
          <h1 className="m-display" style={{ fontSize: 'clamp(36px, 5vw, 60px)', color: '#E8E2D5', marginBottom: '20px' }}>
            Built for people who earn{' '}
            <em style={{ color: '#D97757', fontStyle: 'italic' }}>differently</em>.
          </h1>
          <p className="m-body" style={{ fontSize: '17px', maxWidth: '520px' }}>
            Royal-Icon Ledger was not designed for someone with a stable monthly salary and a pension plan. It was designed for everyone else.
          </p>
        </div>
      </section>

      {/* Segments */}
      <section className="m-section">
        <div className="m-wrap">
          {SEGMENTS.map((seg) => (
            <SegmentCard key={seg.title} segment={seg} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="m-section-sm" style={{ background: '#0F0D0A', borderTop: '1px solid #1A1610' }}>
        <div className="m-wrap-sm" style={{ textAlign: 'center' }}>
          <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#E8E2D5', marginBottom: '20px' }}>
            Recognise yourself?
          </h2>
          <p className="m-body" style={{ marginBottom: '32px' }}>
            Apply for early access. Limited invites available.
          </p>
          <button className="m-btn m-btn-primary m-btn-lg" onClick={() => navigate('/early-access')}>
            Request Early Access
          </button>
        </div>
      </section>
    </div>
  );
}
