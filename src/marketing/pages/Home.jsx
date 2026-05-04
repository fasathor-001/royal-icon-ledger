// src/marketing/pages/Home.jsx

import React from 'react';

/* ── Reusable section label ── */
function Label({ children, color }) {
  return (
    <div className="m-label" style={{ marginBottom: '16px', color: color || '#5C5648' }}>
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
      <p style={{ fontSize: '13px', color: '#5C5648', lineHeight: 1.6 }}>
        {why}
      </p>
    </div>
  );
}

/* ── Who card ── */
function WhoCard({ emoji, title, pain, outcome }) {
  return (
    <div className="m-card" style={{ padding: '28px 24px' }}>
      <div style={{ fontSize: '20px', marginBottom: '12px' }}>{emoji}</div>
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#E8E2D5', marginBottom: '10px', letterSpacing: '-0.01em' }}>
        {title}
      </h3>
      <p style={{ fontSize: '13px', color: '#5C5648', lineHeight: 1.65, marginBottom: '10px' }}>
        {pain}
      </p>
      <p style={{ fontSize: '13px', color: '#8B8478', lineHeight: 1.65 }}>
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
          HERO
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
            The money was
            <br />
            always there.
            <br />
            The{' '}
            <em style={{ color: '#D97757', fontStyle: 'italic' }}>structure</em>
            {' '}wasn't.
          </h1>

          <p className="m-body m-fade-up-3" style={{ fontSize: '18px', maxWidth: '560px', marginBottom: '8px', color: '#8B8478' }}>
            Royal-Icon Ledger gives every rand a role — before you spend it.
          </p>
          <p className="m-body m-fade-up-3" style={{ fontSize: '18px', maxWidth: '560px', marginBottom: '40px', color: '#5C5648' }}>
            Built for freelancers, traders, and anyone with unpredictable income.
          </p>

          <div className="m-fade-up-3" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="m-btn m-btn-primary m-btn-lg"
              onClick={() => navigate('/early-access')}
            >
              Get Early Access
            </button>
            <button
              className="m-btn m-btn-outline m-btn-lg"
              onClick={() => navigate('/product')}
            >
              View Product →
            </button>
          </div>

          <div style={{ marginTop: '36px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {['Working product', 'Private beta', 'Invite-based access', 'No credit card'].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#3A3028' }}>
                <span style={{ color: '#7FA068' }}>✓</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          PROBLEM
      ════════════════════════════════════════════ */}
      <section className="m-section" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-sm">
          <Label>The Problem</Label>
          <div className="m-display" style={{ fontSize: 'clamp(30px, 4vw, 46px)', color: '#E8E2D5', lineHeight: 1.2, marginBottom: '32px' }}>
            You earn money.
            <br />
            But it{' '}
            <em style={{ color: '#C56B5A', fontStyle: 'italic' }}>disappears</em>.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
            {[
              { text: 'Not because you\'re careless — because there\'s no system.', muted: false },
              { text: 'Variable income is impossible to budget with fixed-income logic.', muted: true },
              { text: 'Most apps count what\'s already gone. That\'s not control — it\'s accounting.', muted: true },
              { text: 'Royal-Icon Ledger controls decisions before the money leaves.', muted: false },
            ].map((line, i) => (
              <p key={i} style={{
                fontSize: '17px',
                color: line.muted ? '#5C5648' : '#E8E2D5',
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
          SOLUTION
      ════════════════════════════════════════════ */}
      <section className="m-section" style={{ background: '#0F0D0A', borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap">
          <div style={{ maxWidth: '640px', marginBottom: '56px' }}>
            <Label>The System</Label>
            <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: '#E8E2D5', marginBottom: '16px' }}>
              Give every{' '}
              <em style={{ color: '#D97757', fontStyle: 'italic' }}>rand</em>
              {' '}a job
              <br />
              before you spend it.
            </h2>
            <p className="m-body" style={{ fontSize: '16px' }}>
              Royal-Icon Ledger allocates income automatically — to the right bucket, at the right stage, before you open your wallet.
            </p>
          </div>

          {/* Flow diagram */}
          <div style={{ marginBottom: '48px' }}>
            <div className="m-flow" style={{ gap: '6px' }}>
              {[
                { label: 'Income', accent: true },
                { arrow: true },
                { label: 'Tax Reserve' },
                { arrow: true },
                { label: 'Family Buffer' },
                { arrow: true },
                { label: 'Salary' },
                { arrow: true },
                { label: 'Spending Gate' },
                { arrow: true },
                { label: 'Long-Term' },
                { arrow: true },
                { label: 'Growth', accent: true },
              ].map((item, i) =>
                item.arrow
                  ? <span key={i} className="m-flow-arrow">→</span>
                  : <div key={i} className={`m-flow-node${item.accent ? ' accent' : ''}`}>{item.label}</div>
              )}
            </div>
          </div>

          {/* Three principles */}
          <div className="m-grid-3">
            {[
              {
                num: '01',
                title: 'Allocate first',
                body: 'Income enters and is split before you touch it. Buffer, tax, salary — each gets its share based on your stage rules.',
              },
              {
                num: '02',
                title: 'Spend within limits',
                body: 'Your spending budget is pre-defined. The Spending Gate enforces it in real time. No guesswork, no regret.',
              },
              {
                num: '03',
                title: 'Compound deliberately',
                body: 'Long-term and trading capital grow according to stage progression — not feelings.',
              },
            ].map(({ num, title, body }) => (
              <div key={num} className="m-card" style={{ padding: '28px 24px' }}>
                <div className="m-mono" style={{ fontSize: '11px', color: '#3A3028', marginBottom: '12px', letterSpacing: '0.1em' }}>{num}</div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#E8E2D5', marginBottom: '10px' }}>{title}</h3>
                <p style={{ fontSize: '13px', color: '#5C5648', lineHeight: 1.65 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════════ */}
      <section className="m-section" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap">
          <div className="m-section-header">
            <Label>What's Inside</Label>
            <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#E8E2D5', marginBottom: '14px' }}>
              Four systems.{' '}
              <em style={{ color: '#D97757', fontStyle: 'italic' }}>One discipline.</em>
            </h2>
            <p className="m-body" style={{ maxWidth: '480px' }}>
              Each feature solves a specific failure mode of variable-income management.
            </p>
          </div>

          <div className="m-grid-4">
            <FeatureCard
              icon="🚦"
              title="Spending Gate"
              what="A 24-hour hold on every discretionary purchase over your threshold."
              why="Your future self gets a vote before your impulse spends. Most purchases survive the gate — the ones that don't, shouldn't."
            />
            <FeatureCard
              icon="🛡"
              title="Buffer System"
              what="A precision family reserve with stage-based progression rules."
              why="Not a savings account — a discipline mechanism. Buffer first, everything else second. Protects the household from income volatility."
            />
            <FeatureCard
              icon="⚖"
              title="Profit Allocator"
              what="Every income event triggers an automatic split by your stage rules."
              why="Stage 1: 100% to buffer. Stage 3: four-way split. The system decides — not your mood, not your month."
            />
            <FeatureCard
              icon="🧠"
              title="Impulse Control"
              what="Track every purchase impulse: what you bought, what you held, what you returned."
              why="Over time, you see patterns in your own behaviour. That visibility is worth more than willpower."
            />
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <button className="m-btn m-btn-ghost" onClick={() => navigate('/product')}>
              View all product features →
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          WHY DIFFERENT
      ════════════════════════════════════════════ */}
      <section className="m-section" style={{ background: '#0F0D0A', borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-sm">
          <Label>Different By Design</Label>
          <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 46px)', color: '#E8E2D5', marginBottom: '32px', lineHeight: 1.15 }}>
            Budget apps are rearview mirrors.
            <br />
            <em style={{ color: '#D97757', fontStyle: 'italic' }}>This is a steering wheel.</em>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', marginBottom: '32px' }}>
            {[
              { label: 'Other apps',  items: ['Track spending after it happens', 'Fixed-income logic', 'Manual categorisation', 'No behavioural friction', 'No allocation system'] },
              { label: 'Royal-Icon Ledger', accent: true, items: ['Control decisions before they happen', 'Built for variable income', 'Automatic allocation by stage', 'Spending Gate + 24h hold', 'Stage-based progression system'] },
            ].map(({ label, items, accent }) => (
              <div key={label} className={accent ? 'm-card-warm' : 'm-card-flat'} style={{ padding: '28px 24px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: accent ? '#D97757' : '#3A3028', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>{label}</div>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < items.length - 1 ? '1px solid #1A1610' : 'none' }}>
                    <span style={{ color: accent ? '#7FA068' : '#3A3028', fontSize: '13px', flexShrink: 0 }}>{accent ? '✓' : '—'}</span>
                    <span style={{ fontSize: '13px', color: accent ? '#E8E2D5' : '#5C5648', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            {['A system, not a spreadsheet replacement.', 'Designed for control, not just tracking.', 'Built for real-world income patterns.'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#3A3028' }}>
                <span style={{ color: '#D97757' }}>—</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          WHO IT'S FOR
      ════════════════════════════════════════════ */}
      <section className="m-section" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap">
          <div className="m-section-header">
            <Label>Built For</Label>
            <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#E8E2D5' }}>
              People who don't earn the{' '}
              <em style={{ color: '#D97757', fontStyle: 'italic' }}>same way</em>
              {' '}every month.
            </h2>
          </div>

          <div className="m-grid-4">
            <WhoCard
              emoji="💼"
              title="Freelancers"
              pain="Income spikes don't become lifestyle inflation. Dry months don't become emergencies."
              outcome="Projects, retainers, and gaps — all handled by the same system."
            />
            <WhoCard
              emoji="📈"
              title="Traders"
              pain="The business and the household have completely different risk profiles."
              outcome="Separate trading capital, drawdown protocols, and P&L tracking — so business losses never reach the family."
            />
            <WhoCard
              emoji="🏢"
              title="Business owners"
              pain="Owner's salary is guessed, not computed. Business volatility bleeds into household finances."
              outcome="Your salary is calculated. Your buffer protects the household. The business stays separate."
            />
            <WhoCard
              emoji="⚡"
              title="Side hustlers"
              pain="Irregular payments feel like bonuses, not income — so they get spent like bonuses."
              outcome="Every top-up gets allocated before it becomes lifestyle spend."
            />
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button className="m-btn m-btn-ghost" onClick={() => navigate('/for-who')}>
              See all user profiles →
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          TRUST STRIP
      ════════════════════════════════════════════ */}
      <section className="m-section-xs" style={{ background: '#0F0D0A', borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
            {[
              { icon: '🔒', label: 'PIN-protected fields' },
              { icon: '☁', label: 'Secure cloud sync' },
              { icon: '📴', label: 'Offline-first' },
              { icon: '📦', label: 'Export & backup' },
              { icon: '🚫', label: 'No ads. No data selling.' },
            ].map(({ icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px' }}>{icon}</span>
                <span style={{ fontSize: '12px', color: '#3A3028', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CLOSING CTA
      ════════════════════════════════════════════ */}
      <section className="m-section">
        <div className="m-wrap-sm" style={{ textAlign: 'center' }}>
          <Label>Early Access</Label>
          <h2 className="m-display" style={{ fontSize: 'clamp(32px, 5vw, 56px)', color: '#E8E2D5', marginBottom: '20px' }}>
            Start building financial{' '}
            <em style={{ color: '#D97757', fontStyle: 'italic' }}>structure</em>
            {' '}today.
          </h2>
          <p className="m-body" style={{ marginBottom: '36px' }}>
            Royal-Icon Ledger is currently in private beta. We're accepting a limited number of early users who are serious about financial discipline.
          </p>
          <button
            className="m-btn m-btn-primary m-btn-lg"
            onClick={() => navigate('/early-access')}
          >
            Get Early Access
          </button>
          <p style={{ marginTop: '16px', fontSize: '12px', color: '#3A3028' }}>
            Invite-based access only. No credit card required.
          </p>
        </div>
      </section>

    </div>
  );
}
