// src/marketing/pages/About.jsx

import React from 'react';

const BELIEFS = [
  {
    heading: 'People fail financially because they are unstructured.',
    body: 'Not careless. Not irresponsible. Unstructured. When income is variable, fixed-income financial logic breaks down entirely. The problem is architectural, not behavioural.',
  },
  {
    heading: 'Systems beat willpower — every time.',
    body: 'Budgeting advice tells you to spend less. Royal-Icon Ledger builds the infrastructure that makes it structurally difficult to spend out of sequence. The system replaces the instruction.',
  },
  {
    heading: 'The household is the foundation.',
    body: 'Every financial decision — trading, investing, business — should be made from a position of household security. Buffer first. Everything else second. This is not conservative. This is correct.',
  },
  {
    heading: 'Variable income is not a problem. It is a different type of income.',
    body: 'Freelancers, traders, and business owners are not broken versions of salaried employees. They need financial tools that understand their reality — not tools that assume a fixed monthly paycheck.',
  },
  {
    heading: 'Discipline requires infrastructure, not inspiration.',
    body: 'You cannot motivate yourself into financial discipline indefinitely. You can build systems that enforce it. Royal-Icon Ledger is not a motivational tool. It is a structural one.',
  },
];

export default function About({ navigate }) {
  return (
    <div>
      <div className="m-nav-spacer" />

      {/* Header */}
      <section className="m-section-sm" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-md">
          <div className="m-label" style={{ marginBottom: '16px' }}>About</div>
          <h1 className="m-display" style={{ fontSize: 'clamp(36px, 5vw, 60px)', color: '#E8E2D5', marginBottom: '20px' }}>
            Why this exists.
          </h1>
          <p className="m-body" style={{ fontSize: '17px', maxWidth: '540px' }}>
            Royal-Icon Ledger was built by someone who needed it — and couldn't find it anywhere else.
          </p>
        </div>
      </section>

      {/* Origin story */}
      <section className="m-section">
        <div className="m-wrap-md">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'start', marginBottom: '72px' }} className="about-grid">
            <div>
              <div className="m-label" style={{ marginBottom: '20px' }}>The origin</div>
              <div className="m-display" style={{ fontSize: 'clamp(22px, 3vw, 32px)', color: '#E8E2D5', lineHeight: 1.3, marginBottom: '24px' }}>
                Variable income and a family to protect. No tool that understood both.
              </div>
              <p style={{ fontSize: '15px', color: '#8B8478', lineHeight: 1.8, marginBottom: '16px' }}>
                Most personal finance tools are designed for predictability. A salary that arrives on the same day every month. A fixed mortgage. Predictable expenses. That is not the reality for millions of freelancers, traders, and business owners.
              </p>
              <p style={{ fontSize: '15px', color: '#8B8478', lineHeight: 1.8 }}>
                Royal-Icon Ledger was built to answer one question: what does a financial system look like when the income isn't fixed — but the responsibilities are?
              </p>
            </div>
            <div>
              <div className="m-label" style={{ marginBottom: '20px' }}>The solution</div>
              <div className="m-card-warm" style={{ padding: '28px' }}>
                <p className="m-display" style={{ fontSize: '22px', color: '#E8E2D5', lineHeight: 1.4, marginBottom: '20px', fontStyle: 'italic' }}>
                  "A financial operating system — not a tracker."
                </p>
                <p style={{ fontSize: '14px', color: '#5C5648', lineHeight: 1.7 }}>
                  Budget apps track what happened. Spreadsheets require manual work every month. Neither provides a system that runs automatically, allocates income on receipt, and enforces discipline structurally.
                </p>
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #3A2A1E' }}>
                  <p style={{ fontSize: '14px', color: '#8B8478', lineHeight: 1.7 }}>
                    Royal-Icon Ledger is that system. It runs in the background. It enforces the rules. It protects the household. It tracks the business. It compounds the wealth.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Core beliefs */}
          <div>
            <div className="m-label" style={{ marginBottom: '32px' }}>What we believe</div>
            {BELIEFS.map((belief, i) => (
              <div key={i} style={{
                padding: '28px 0',
                borderBottom: i < BELIEFS.length - 1 ? '1px solid #1A1610' : 'none',
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start',
              }} className="belief-grid">
                <h3 className="m-display" style={{ fontSize: 'clamp(18px, 2.5vw, 26px)', color: '#E8E2D5', lineHeight: 1.3 }}>
                  {belief.heading}
                </h3>
                <p style={{ fontSize: '14px', color: '#8B8478', lineHeight: 1.75 }}>{belief.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .about-grid  { grid-template-columns: 1fr !important; gap: 32px !important; }
          .belief-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
        }
      `}</style>

      {/* Category positioning */}
      <section className="m-section-sm" style={{ background: '#0F0D0A', borderTop: '1px solid #1A1610', borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-sm" style={{ textAlign: 'center' }}>
          <div className="m-label" style={{ marginBottom: '20px' }}>The category</div>
          <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: '#E8E2D5', marginBottom: '20px' }}>
            A{' '}
            <em style={{ color: '#D97757', fontStyle: 'italic' }}>financial operating system</em>
            <br />
            for variable-income earners.
          </h2>
          <p className="m-body" style={{ marginBottom: '0' }}>
            Not a budgeting app. Not a tracker. Not a spreadsheet replacement.
            <br />
            A system that runs, allocates, enforces, and compounds — in the background of your life.
          </p>
        </div>
      </section>

      {/* Company info */}
      <section className="m-section-sm">
        <div className="m-wrap-md">
          <div className="m-grid-3">
            {[
              { label: 'Stage', value: 'Private beta', sub: 'Working product, invite-based access' },
              { label: 'Category', value: 'Financial OS', sub: 'Variable-income earners globally' },
              { label: 'Philosophy', value: 'Structure over willpower', sub: 'Systems beat motivation, always' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="m-card" style={{ padding: '28px 24px' }}>
                <div className="m-label" style={{ marginBottom: '12px' }}>{label}</div>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#E8E2D5', marginBottom: '8px', letterSpacing: '-0.01em' }}>{value}</div>
                <div style={{ fontSize: '13px', color: '#5C5648' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="m-section-sm" style={{ borderTop: '1px solid #1A1610' }}>
        <div className="m-wrap-sm" style={{ textAlign: 'center' }}>
          <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#E8E2D5', marginBottom: '20px' }}>
            Interested in what we're building?
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button className="m-btn m-btn-primary" onClick={() => navigate('/early-access')}>
              Request Early Access
            </button>
            <button className="m-btn m-btn-outline" onClick={() => navigate('/investors')}>
              Investor Overview →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
