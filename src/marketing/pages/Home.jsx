// src/marketing/pages/Home.jsx

import React from 'react';

/* ── Reusable section label ── */
function Label({ children, color }) {
  return (
    <div className="m-label" style={{ marginBottom: '16px', color: color || '#8B8478' }}>
      {children}
    </div>
  );
}

/* ── Feature card ── */
function FeatureCard({ icon, title, what, why }) {
  return (
    <div className="m-card" style={{ padding: '32px 28px' }}>
      <div style={{ fontSize: '22px', marginBottom: '16px' }}>{icon}</div>
      <h3 className="m-display" style={{ fontSize: '24px', color: '#E8E2D5', marginBottom: '10px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '14px', color: '#E8E2D5', lineHeight: 1.6, marginBottom: '10px' }}>
        {what}
      </p>
      <p style={{ fontSize: '13px', color: '#8B8478', lineHeight: 1.6 }}>
        {why}
      </p>
    </div>
  );
}

/* ── Who card ── */
function WhoCard({ mark, title, pain, outcome }) {
  return (
    <div className="m-card" style={{ padding: '28px 24px' }}>
      <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em', color: '#5C5648', textTransform: 'uppercase', marginBottom: '14px' }}>{mark}</div>
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#E8E2D5', marginBottom: '10px', letterSpacing: '-0.01em' }}>
        {title}
      </h3>
      <p style={{ fontSize: '13px', color: '#8B8478', lineHeight: 1.65, marginBottom: '10px' }}>
        {pain}
      </p>
      <p style={{ fontSize: '13px', color: '#B0A898', lineHeight: 1.65 }}>
        {outcome}
      </p>
    </div>
  );
}

export default function Home({ navigate }) {
  return (
    <div>
      <div className="m-nav-spacer" />

      {/* ════════════════════════════════════════════
          1. HERO
      ════════════════════════════════════════════ */}
      <section className="m-hero" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-md">
          <div className="m-fade-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#D97757' }} />
              <span className="m-label-orange">Private Beta — Now Accepting Applications</span>
            </div>
          </div>

          <h1 className="m-display m-fade-up-2" style={{ fontSize: 'clamp(48px, 7vw, 82px)', color: '#E8E2D5', marginBottom: '28px' }}>
            Personal finance
            <br />
            for the{' '}
            <em style={{ color: '#D97757', fontStyle: 'italic' }}>disciplined.</em>
          </h1>

          <p className="m-body m-fade-up-3" style={{ fontSize: '18px', maxWidth: '560px', marginBottom: '8px', color: '#B0A898' }}>
            You don't need perfect habits to start.
            Follow the system — discipline builds over time.
          </p>
          <p className="m-body m-fade-up-3" style={{ fontSize: '16px', maxWidth: '520px', marginBottom: '20px', color: '#8B8478' }}>
            For students, allowance earners, and anyone whose income
            doesn't arrive on a fixed schedule.
          </p>

          <p className="m-fade-up-3" style={{ fontSize: '15px', maxWidth: '480px', marginBottom: '14px', color: '#B0A898', lineHeight: 1.75 }}>
            If managing money has felt inconsistent or overwhelming, this is where you start.
          </p>
          <p className="m-fade-up-3" style={{ fontSize: '14px', maxWidth: '440px', marginBottom: '20px', color: '#5C5648', lineHeight: 1.65, borderLeft: '2px solid #26221C', paddingLeft: '16px' }}>
            Your money stays in your bank.<br />
            Royal Ledger gives it structure.
          </p>

          <p className="m-fade-up-3" style={{ fontSize: '15px', maxWidth: '500px', marginBottom: '8px', color: '#B0A898', lineHeight: 1.75 }}>
            Royal Ledger is built for people who have income but don't feel fully in control yet.
          </p>
          <p className="m-fade-up-3" style={{ fontSize: '14px', maxWidth: '480px', marginBottom: '40px', color: '#8B8478', lineHeight: 1.7 }}>
            It gives your money structure — without needing perfect habits.
          </p>

          <div className="m-fade-up-3" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="m-btn m-btn-primary m-btn-lg"
              onClick={() => navigate('/early-access')}
            >
              Apply for Early Access
            </button>
            <button
              className="m-btn m-btn-outline m-btn-lg"
              onClick={() => navigate('/how-it-works')}
            >
              See how it works
            </button>
          </div>

          <div style={{ marginTop: '36px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {['Working product', 'Private beta', 'Invite-only access', 'No credit card'].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#5C5648' }}>
                <span style={{ color: '#7FA068' }}>✓</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product preview ── */}
      <section style={{ background: '#0A0908', borderBottom: '1px solid #1A1610', padding: '0 24px 64px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ background: '#0F0D0A', border: '1px solid #26221C', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
            <div style={{ background: '#14110E', borderBottom: '1px solid #1A1610', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2A2420' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2A2420' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2A2420' }} />
              <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#5C5648', fontFamily: "'JetBrains Mono', monospace" }}>
                my.royalledger.app
              </div>
            </div>
            <img
              src="/app-preview.png"
              alt="Royal Ledger Dashboard"
              style={{ width: '100%', display: 'block' }}
            />
          </div>
          <p style={{ textAlign: 'center', fontSize: '11px', color: '#5C5648', marginTop: '14px', letterSpacing: '0.06em' }}>
            ACTUAL PRODUCT · PRIVATE BETA · LIVE DATA
          </p>
        </div>
      </section>

      {/* ── Positioning strip ── */}
      <section className="m-section-xs" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
            {[
              'A system, not a habit tracker.',
              'Built for every stage — from first income to full control.',
              'Discipline is built in. Not assumed.',
            ].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#8B8478' }}>
                <span style={{ color: '#D97757', fontSize: '10px' }}>◆</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          2. FOUNDATION
      ════════════════════════════════════════════ */}
      <section className="m-section" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-sm">
          <Label>Foundation</Label>
          <div className="m-display" style={{ fontSize: 'clamp(30px, 4vw, 46px)', color: '#E8E2D5', lineHeight: 1.2, marginBottom: '32px' }}>
            Everyone starts{' '}
            <em style={{ color: '#D97757', fontStyle: 'italic' }}>somewhere.</em>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
            {[
              { text: 'Foundation is where the system begins. No experience needed, no financial history required.', muted: false },
              { text: 'You track what you spend. You build savings. You set your first goal.', muted: true },
              { text: 'The system holds the structure — so you don\'t have to carry it alone.', muted: true },
              { text: 'As your consistency builds, more of the system opens.', muted: false },
            ].map((line, i) => (
              <p key={i} style={{
                fontSize: '17px',
                color: line.muted ? '#8B8478' : '#E8E2D5',
                lineHeight: 1.7,
                padding: '14px 0',
                borderBottom: i < 3 ? '1px solid #1A1610' : 'none',
              }}>
                {line.text}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          HOW IT STARTS
      ════════════════════════════════════════════ */}
      <section style={{ padding: '60px 24px', borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-sm">
          <div className="home-how-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
            <div>
              <Label>How It Starts</Label>
              <h2 className="m-display" style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', color: '#E8E2D5', lineHeight: 1.2 }}>
                You don't start with everything.
                <br />
                <em style={{ color: '#D97757', fontStyle: 'italic' }}>You start with clarity.</em>
              </h2>
            </div>
            <div>
              {[
                'Enter your income',
                'List your fixed expenses',
                'See what\'s actually left',
              ].map((step, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '14px 0',
                  borderBottom: i < 2 ? '1px solid #1A1610' : 'none',
                }}>
                  <span style={{ fontSize: '11px', color: '#5C5648', fontFamily: "'JetBrains Mono', monospace", minWidth: '20px' }}>0{i + 1}</span>
                  <span style={{ fontSize: '15px', color: '#E8E2D5', lineHeight: 1.5 }}>{step}</span>
                </div>
              ))}
              <p style={{ fontSize: '13px', color: '#8B8478', marginTop: '20px', lineHeight: 1.65 }}>
                That's where control begins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          3. GROWTH
      ════════════════════════════════════════════ */}
      <section className="m-section" style={{ background: '#0F0D0A', borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap">
          <div className="m-section-header">
            <Label>Growth</Label>
            <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: '#E8E2D5' }}>
              The system grows{' '}
              <em style={{ color: '#D97757', fontStyle: 'italic' }}>with you.</em>
            </h2>
          </div>
          <div className="m-grid-4">
            {[
              {
                num: '01',
                title: 'Foundation',
                body: 'Track spending. Build savings. Set your first goal. The system starts where you are.',
              },
              {
                num: '02',
                title: 'Progress',
                body: 'Consistency is recognised. Your stage advances. The system responds to how you use it.',
              },
              {
                num: '03',
                title: 'Structure',
                body: 'Allocation and planning become available. Every income event gets a purpose before it\'s spent.',
              },
              {
                num: '04',
                title: 'Full Control',
                body: 'The complete system. Income allocated automatically. Financial structure running in the background.',
              },
            ].map(({ num, title, body }) => (
              <div key={num} className="m-card" style={{ padding: '32px 24px' }}>
                <div className="m-mono" style={{ fontSize: '11px', color: '#5C5648', marginBottom: '16px', letterSpacing: '0.1em' }}>{num}</div>
                <h3 className="m-display" style={{ fontSize: '22px', color: '#E8E2D5', marginBottom: '12px' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: '#8B8478', lineHeight: 1.65 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          4. DISCIPLINE SYSTEM
      ════════════════════════════════════════════ */}
      <section className="m-section" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap">
          <div className="m-section-header">
            <Label>The Discipline Layer</Label>
            <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#E8E2D5', marginBottom: '14px' }}>
              Built to protect{' '}
              <em style={{ color: '#D97757', fontStyle: 'italic' }}>your decisions.</em>
            </h2>
            <p className="m-body" style={{ maxWidth: '480px' }}>
              Not just what you spend — but how you decide.
              The system introduces friction where it matters most.
            </p>
          </div>

          <div className="m-grid-4">
            <FeatureCard
              icon="🚦"
              title="Spending Gate"
              what="Every discretionary purchase above your threshold triggers a mandatory hold before it can proceed."
              why="The pause is the discipline. Most decisions that feel urgent at night feel different the next morning. The gate gives your future self a vote."
            />
            <FeatureCard
              icon="🛡"
              title="Buffer Reserve"
              what="A dedicated reserve built and protected by stage rules. The system directs income here before anything else."
              why="Not a savings account. A commitment. The buffer is protected first — so you don't have to choose between discipline and circumstance."
            />
            <FeatureCard
              icon="⚖"
              title="Profit Allocator"
              what="When income arrives, the system allocates it automatically based on your current stage and rules."
              why="Allocation removes the moment of decision. The money is already spoken for — there is no opportunity to override it in the moment."
            />
            <FeatureCard
              icon="🧠"
              title="Impulse Log"
              what="A record of every spending impulse — what you bought, what you paused, what you decided against."
              why="Patterns become visible over time. That visibility is more powerful than willpower. The log builds self-knowledge the system can act on."
            />
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <button className="m-btn m-btn-ghost" onClick={() => navigate('/product')}>
              View the full system →
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          5. WHY IT'S DIFFERENT
      ════════════════════════════════════════════ */}
      <section className="m-section" style={{ background: '#0F0D0A', borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-sm">
          <Label>Different By Design</Label>
          <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 46px)', color: '#E8E2D5', marginBottom: '32px', lineHeight: 1.15 }}>
            Other apps record what happened.
            <br />
            <em style={{ color: '#D97757', fontStyle: 'italic' }}>This one shapes what does.</em>
          </h2>

          <div className="home-compare-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', marginBottom: '32px' }}>
            {[
              {
                label: 'Other apps',
                accent: false,
                items: [
                  'Shows you what you already spent',
                  'Assumes stable, predictable income',
                  'Requires existing financial habits',
                  'No friction on impulsive decisions',
                  'Same experience at every stage',
                ],
              },
              {
                label: 'Royal Ledger',
                accent: true,
                items: [
                  'Controls decisions before money leaves',
                  'Built for irregular and variable income',
                  'Foundation mode for users starting from scratch',
                  'Spending Gate — a pause before every major purchase',
                  'Stage-based system that advances with your discipline',
                ],
              },
            ].map(({ label, items, accent }) => (
              <div key={label} className={accent ? 'm-card-warm' : 'm-card-flat'} style={{ padding: '28px 24px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: accent ? '#D97757' : '#5C5648', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>{label}</div>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < items.length - 1 ? '1px solid #1A1610' : 'none' }}>
                    <span style={{ color: accent ? '#7FA068' : '#5C5648', fontSize: '13px', flexShrink: 0 }}>{accent ? '✓' : '—'}</span>
                    <span style={{ fontSize: '13px', color: accent ? '#E8E2D5' : '#8B8478', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '28px', paddingTop: '28px', borderTop: '1px solid #1A1610' }}>
            <p style={{ fontSize: '14px', color: '#8B8478', lineHeight: 1.75, marginBottom: '6px' }}>
              Most finance apps track what already happened. Royal Ledger structures what happens next.
            </p>
            <p style={{ fontSize: '13px', color: '#5C5648', lineHeight: 1.7 }}>
              Your money doesn't need a new place to live. It needs direction.
            </p>
          </div>

          <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #1A1610', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', color: '#8B8478', lineHeight: 1.75, fontStyle: 'italic' }}>
              Most people don't fail because they lack discipline.<br />
              They fail because they never had structure.
            </p>
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="m-section" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap">
          <div className="m-section-header">
            <Label>Built For</Label>
            <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#E8E2D5' }}>
              People who are still{' '}
              <em style={{ color: '#D97757', fontStyle: 'italic' }}>building</em>
              {' '}the foundation.
            </h2>
          </div>

          <div className="m-grid-4">
            <WhoCard
              mark="01"
              title="Students"
              pain="Managing an allowance or part-time income with no financial system in place."
              outcome="Foundation mode starts where you are — spending awareness, a savings goal, and structure from day one."
            />
            <WhoCard
              mark="02"
              title="Allowance earners"
              pain="Income without structure. No framework for what to save, spend, or protect."
              outcome="The system provides the structure your income doesn't come with."
            />
            <WhoCard
              mark="03"
              title="Irregular income"
              pain="Freelancers, contractors, and gig workers whose income arrives unpredictably."
              outcome="Structure that holds regardless of how income arrives — or how much."
            />
            <WhoCard
              mark="04"
              title="Early-stage earners"
              pain="First real income, but no clear direction for where it goes or how to build from it."
              outcome="A system that adapts as your income and discipline develop over time."
            />
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button className="m-btn m-btn-ghost" onClick={() => navigate('/for-who')}>
              See all user profiles →
            </button>
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section className="m-section-xs" style={{ background: '#0F0D0A', borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
            {[
              { icon: '🔒', label: 'PIN-protected fields' },
              { icon: '☁',  label: 'Secure cloud sync' },
              { icon: '📴', label: 'Offline-first' },
              { icon: '📦', label: 'Export and backup' },
              { icon: '🚫', label: 'No ads. No data selling.' },
            ].map(({ icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px' }}>{icon}</span>
                <span style={{ fontSize: '12px', color: '#5C5648', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="m-section" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-sm">
          <Label>Common questions</Label>
          <h2 className="m-display" style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', color: '#E8E2D5', marginBottom: '40px' }}>
            Answered <em style={{ color: '#D97757', fontStyle: 'italic' }}>honestly.</em>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              {
                q: 'Do I need financial experience to use this?',
                a: 'No. Foundation mode is the entry point — it starts with spending awareness, a savings target, and your first goal. The system is designed to build the habit, not assume you already have one. You begin with what you have and build from there.',
              },
              {
                q: 'How is this different from YNAB, Mint, or other budget apps?',
                a: 'Budget apps show you what you already spent. Royal Ledger controls decisions before they happen. Income is allocated automatically on arrival. Spending has structure enforced by the system — not willpower. It is not a tracker. It is a system that grows with your discipline.',
              },
              {
                q: 'Does it work on mobile?',
                a: 'Yes. Royal Ledger is a Progressive Web App (PWA). Install it on your iPhone or Android home screen and it works exactly like a native app — including offline. No App Store required.',
              },
              {
                q: 'Do I need to connect my bank account?',
                a: 'No. The system works without bank access. You log income and spending manually — which improves financial awareness rather than reducing it. Bank feed integration is on the roadmap.',
              },
              {
                q: 'What does it cost?',
                a: 'Beta access is free. A free tier (local device, all core modules) and a Pro tier (cloud sync, multi-device, push notifications) are planned for public launch. Pricing will be set during the closed beta phase. No payment is required at any stage of early access.',
              },
              {
                q: 'Is my financial data private?',
                a: 'Completely. Your data is never sold, shared, or used for any purpose other than running your system. Cloud sync uses Supabase with Row Level Security — only your authenticated session can access your records. Your PIN never leaves your device.',
              },
            ].map(({ q, a }, i, arr) => (
              <div key={i} style={{ padding: '24px 0', borderBottom: i < arr.length - 1 ? '1px solid #1A1610' : 'none' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#E8E2D5', marginBottom: '10px', lineHeight: 1.4 }}>{q}</div>
                <p style={{ fontSize: '14px', color: '#8B8478', lineHeight: 1.75 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          6. CTA
      ════════════════════════════════════════════ */}
      <section className="m-section">
        <div className="m-wrap-sm" style={{ textAlign: 'center' }}>
          <Label>Early Access</Label>
          <h2 className="m-display" style={{ fontSize: 'clamp(32px, 5vw, 56px)', color: '#E8E2D5', marginBottom: '20px' }}>
            Start building{' '}
            <em style={{ color: '#D97757', fontStyle: 'italic' }}>your system.</em>
          </h2>
          <p className="m-body" style={{ marginBottom: '36px' }}>
            Private beta. Invite-only. Applications reviewed personally.
          </p>
          <button
            className="m-btn m-btn-primary m-btn-lg"
            onClick={() => navigate('/early-access')}
          >
            Apply for Early Access
          </button>
          <p style={{ marginTop: '16px', fontSize: '13px', color: '#8B8478', fontWeight: 500 }}>
            No subscriptions. No pressure. Just structure.
          </p>
          <p style={{ marginTop: '8px', fontSize: '12px', color: '#5C5648' }}>
            No credit card required at any stage.
          </p>
        </div>
      </section>

      <style>{`
        @media (max-width: 600px) {
          .home-compare-grid { grid-template-columns: 1fr !important; gap: 8px !important; }
          .home-how-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
      `}</style>
    </div>
  );
}
