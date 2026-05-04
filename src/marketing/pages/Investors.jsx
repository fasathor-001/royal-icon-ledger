// src/marketing/pages/Investors.jsx
//
// Investor-facing overview.
// Honest positioning: no fabricated traction, no inflated claims.

import React from 'react';

const ROADMAP = [
  { phase: 'Phase 1 — Now',       label: 'Private Beta',      desc: 'Working product. Invite-based access. Early user feedback in progress. Core system complete.', done: true },
  { phase: 'Phase 2 — Near-term', label: 'Closed Beta',       desc: 'Structured early-access rollout. User interviews. Product refinement based on real usage patterns.', done: false },
  { phase: 'Phase 3 — Growth',    label: 'Public Launch',     desc: 'Open access with subscription pricing. Referral-based growth. Partnership with financial educators.', done: false },
  { phase: 'Phase 4 — Scale',     label: 'Platform Expansion',desc: 'Multi-currency. API integrations with banking data. Community and accountability features.', done: false },
];

const WHY_NOW = [
  {
    title: 'Freelance workforce is growing',
    body: 'The global freelance population is growing faster than any employment category. These earners are underserved by every major financial product on the market.',
  },
  {
    title: 'Trading accessibility has democratised risk',
    body: 'More individuals are trading than ever before. Without financial operating systems designed for volatile income, household risk is rising alongside trading activity.',
  },
  {
    title: 'The "budget app" category is saturated — and wrong',
    body: 'The existing tools all solve the same problem: tracking. None of them solve allocation, discipline enforcement, or stage-based progression. The category gap is structural.',
  },
  {
    title: 'Mobile-first, offline-first, global',
    body: 'Royal-Icon Ledger was built PWA-first, works offline, and supports multiple currencies. This is not a product designed for one market.',
  },
];

export default function Investors({ navigate }) {
  return (
    <div>
      <div className="m-nav-spacer" />

      {/* Header */}
      <section className="m-section-sm" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-md">
          <div className="m-label" style={{ marginBottom: '16px' }}>Investors</div>
          <h1 className="m-display" style={{ fontSize: 'clamp(36px, 5vw, 60px)', color: '#E8E2D5', marginBottom: '20px' }}>
            A new category.
            <br />
            <em style={{ color: '#D97757', fontStyle: 'italic' }}>Early.</em>
          </h1>
          <p className="m-body" style={{ fontSize: '17px', maxWidth: '520px', marginBottom: '32px' }}>
            Royal-Icon Ledger is creating a new product category: the financial operating system for variable-income earners. This is an overview for investors and strategic partners.
          </p>
          <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', padding: '10px 16px', background: '#14110E', border: '1px solid #26221C', borderRadius: '4px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7FA068' }} />
            <span style={{ fontSize: '13px', color: '#8B8478' }}>Working product · Private beta · Invite-based access</span>
          </div>
        </div>
      </section>

      {/* Market problem */}
      <section className="m-section" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-md">
          <div className="m-section-header">
            <div className="m-label" style={{ marginBottom: '16px' }}>The problem</div>
            <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 46px)', color: '#E8E2D5', marginBottom: '16px' }}>
              A large population with
              <br />
              <em style={{ color: '#D97757', fontStyle: 'italic' }}>no adequate financial tools</em>.
            </h2>
          </div>

          <div className="m-grid-2" style={{ marginBottom: '48px' }}>
            {[
              {
                num: '~1.57B',
                label: 'Freelancers globally',
                sub: 'World Bank estimate — growing faster than traditional employment',
              },
              {
                num: '~500M',
                label: 'Retail traders worldwide',
                sub: 'Post-2020 surge with no financial OS designed for them',
              },
              {
                num: '$0',
                label: 'Revenue from existing "budget" apps',
                sub: 'None of them solve allocation, stage progression, or trading/household separation',
                accent: true,
              },
              {
                num: 'Category zero',
                label: 'Financial OS for variable-income earners',
                sub: 'This product category does not yet exist in the market',
                accent: true,
              },
            ].map(({ num, label, sub, accent }) => (
              <div key={label} className={accent ? 'm-card-warm' : 'm-card'} style={{ padding: '32px 28px' }}>
                <div className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: accent ? '#D97757' : '#E8E2D5', marginBottom: '10px' }}>
                  {num}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#E8E2D5', marginBottom: '6px' }}>{label}</div>
                <div style={{ fontSize: '13px', color: '#5C5648', lineHeight: 1.55 }}>{sub}</div>
              </div>
            ))}
          </div>

          <div className="m-card" style={{ padding: '32px', background: '#0F0D0A' }}>
            <p style={{ fontSize: '16px', color: '#8B8478', lineHeight: 1.8 }}>
              The personal finance market is served almost entirely by tools designed for fixed-income earners: expense trackers, savings apps, and budgeting tools built around the assumption of a stable monthly salary.
              Freelancers, traders, business owners, and gig workers — who together represent hundreds of millions of people globally — are trying to use tools that were not designed for them.
              The result is financial fragility disguised as bad behaviour.
            </p>
          </div>
        </div>
      </section>

      {/* Category positioning */}
      <section className="m-section" style={{ background: '#0F0D0A', borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-md">
          <div className="m-section-header">
            <div className="m-label" style={{ marginBottom: '16px' }}>Category</div>
            <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#E8E2D5', marginBottom: '16px' }}>
              We are not building
              <br />
              another budget app.
            </h2>
            <p className="m-body" style={{ maxWidth: '520px' }}>
              Royal-Icon Ledger is a financial operating system. The distinction matters structurally, not just for marketing.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px' }} className="category-grid">
            {[
              { label: 'Budget apps', desc: 'Track spending after it happens. Passive, reactive, rearview.', color: '#3A3028' },
              { label: 'Savings apps', desc: 'Round up and auto-save. Useful but narrow. No allocation architecture.', color: '#3A3028' },
              { label: 'Financial OS', desc: 'Allocates income on receipt. Enforces decisions before they happen. Runs in stages. Protects the household first.', color: '#D97757', highlight: true },
            ].map(({ label, desc, color, highlight }) => (
              <div key={label} className={highlight ? 'm-card-warm' : 'm-card-flat'} style={{ padding: '28px 24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color, marginBottom: '16px' }}>{label}</div>
                <p style={{ fontSize: '14px', color: highlight ? '#E8E2D5' : '#5C5648', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why now */}
      <section className="m-section" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-md">
          <div className="m-section-header">
            <div className="m-label" style={{ marginBottom: '16px' }}>Why now</div>
            <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#E8E2D5' }}>
              Four converging tailwinds.
            </h2>
          </div>
          <div className="m-grid-2">
            {WHY_NOW.map(({ title, body }) => (
              <div key={title} className="m-card" style={{ padding: '28px 24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#E8E2D5', marginBottom: '12px', lineHeight: 1.4 }}>{title}</h3>
                <p style={{ fontSize: '13px', color: '#5C5648', lineHeight: 1.7 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product status */}
      <section className="m-section" style={{ background: '#0F0D0A', borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-md">
          <div className="m-section-header">
            <div className="m-label" style={{ marginBottom: '16px' }}>Product status</div>
            <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#E8E2D5' }}>
              Working product.
              <br />
              <em style={{ color: '#D97757', fontStyle: 'italic' }}>Private beta.</em>
            </h2>
          </div>

          <div className="m-grid-2" style={{ marginBottom: '40px' }}>
            {[
              { label: 'Core system', items: ['Stage-based allocation engine', 'Buffer reserve system', 'Spending Gate with 24h hold', 'Impulse tracking and analytics'] },
              { label: 'Advanced modules', items: ['Trading P&L with drawdown protocols', 'Envelope budgeting system', 'PIN field protection', 'Cloud sync with offline fallback'] },
              { label: 'Infrastructure', items: ['PWA — installable on any device', 'Supabase auth and sync', 'Push notifications', 'Multi-currency support'] },
              { label: 'Status', items: ['Working product: ✓', 'Private beta: ✓', 'Early user feedback: in progress', 'Traction: early stage'] },
            ].map(({ label, items }) => (
              <div key={label} className="m-card" style={{ padding: '24px' }}>
                <div className="m-label" style={{ marginBottom: '14px' }}>{label}</div>
                {items.map((item, i) => (
                  <div key={i} style={{ fontSize: '13px', color: '#8B8478', padding: '6px 0', borderBottom: i < items.length - 1 ? '1px solid #1A1610' : 'none', lineHeight: 1.5 }}>
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="m-card-warm" style={{ padding: '24px 28px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '16px', flexShrink: 0, marginTop: '2px' }}>⚠️</div>
            <p style={{ fontSize: '13px', color: '#8B8478', lineHeight: 1.7 }}>
              <strong style={{ color: '#E8E2D5' }}>Honest statement: </strong>
              Royal-Icon Ledger is in early private beta. We are not claiming thousands of users, revenue, partnerships, or regulatory approval. We are a working product with a clear category, an honest problem statement, and a team focused on building the right thing.
            </p>
          </div>
        </div>
      </section>

      {/* Business model */}
      <section className="m-section" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-md">
          <div className="m-label" style={{ marginBottom: '16px' }}>Business model</div>
          <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#E8E2D5', marginBottom: '40px' }}>
            SaaS subscription.
            <br />
            Clear unit economics.
          </h2>
          <div className="m-grid-3">
            {[
              { tier: 'Core', price: 'Free tier', desc: 'Local-only, offline, no sync. Acquires users at zero cost.' },
              { tier: 'Pro', price: 'Subscription', desc: 'Cloud sync, push notifications, multi-device, sessions. Primary revenue tier.' },
              { tier: 'Business', price: 'Future tier', desc: 'Multi-user household, shared envelopes, accountant access, API.' },
            ].map(({ tier, price, desc }) => (
              <div key={tier} className="m-card" style={{ padding: '28px 24px' }}>
                <div className="m-label" style={{ marginBottom: '10px' }}>{tier}</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#D97757', marginBottom: '12px' }}>{price}</div>
                <p style={{ fontSize: '13px', color: '#5C5648', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: '#3A3028', marginTop: '20px' }}>
            * Exact pricing not yet finalised. Pricing research will be conducted during closed beta phase.
          </p>
        </div>
      </section>

      {/* Roadmap */}
      <section className="m-section" style={{ background: '#0F0D0A', borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-md">
          <div className="m-section-header">
            <div className="m-label" style={{ marginBottom: '16px' }}>Roadmap</div>
            <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#E8E2D5' }}>Four phases to scale.</h2>
          </div>
          <div className="m-timeline">
            {ROADMAP.map((item, i) => (
              <div key={i} className="m-timeline-item">
                <div className="m-timeline-dot" style={{ background: item.done ? '#7FA068' : '#3A3028', boxShadow: `0 0 0 1px ${item.done ? '#7FA068' : '#3A3028'}` }} />
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: item.done ? '#7FA068' : '#5C5648', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{item.phase}</div>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#E8E2D5', marginBottom: '8px' }}>{item.label}</h3>
                <p style={{ fontSize: '14px', color: '#5C5648', lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="m-section">
        <div className="m-wrap-sm" style={{ textAlign: 'center' }}>
          <div className="m-label" style={{ marginBottom: '16px' }}>Get in touch</div>
          <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#E8E2D5', marginBottom: '20px' }}>
            Interested in the opportunity?
          </h2>
          <p className="m-body" style={{ marginBottom: '36px' }}>
            We're open to conversations with investors and strategic partners who understand the variable-income market.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="m-btn m-btn-primary m-btn-lg"
              onClick={() => navigate('/early-access')}
            >
              Request Investor Deck
            </button>
            <button className="m-btn m-btn-outline m-btn-lg" onClick={() => navigate('/about')}>
              About the project →
            </button>
          </div>
          <p style={{ marginTop: '16px', fontSize: '12px', color: '#3A3028' }}>
            Please use the early access form and select your interest type. We'll respond to investor inquiries directly.
          </p>
        </div>
      </section>

      <style>{`
        @media (max-width: 640px) {
          .category-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
