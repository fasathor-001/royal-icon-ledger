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
            Royal-Icon Ledger gives every unit of income a role — before you spend it.
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
              onClick={() => navigate('/how-it-works')}
            >
              See how it works
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
          PRODUCT PREVIEW
      ════════════════════════════════════════════ */}
      <section style={{ background: '#0A0908', borderBottom: '1px solid #1A1610', padding: '0 24px 64px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Browser chrome */}
          <div style={{ background: '#0F0D0A', border: '1px solid #26221C', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
            <div style={{ background: '#14110E', borderBottom: '1px solid #1A1610', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2A2420' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2A2420' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2A2420' }} />
              <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#3A3028', fontFamily: "'JetBrains Mono', monospace" }}>
                app.royalicon.net
              </div>
            </div>
            <img
              src="/app-preview.png"
              alt="Royal-Icon Ledger Command Dashboard"
              style={{ width: '100%', display: 'block' }}
            />
          </div>
          <p style={{ textAlign: 'center', fontSize: '11px', color: '#3A3028', marginTop: '14px', letterSpacing: '0.06em' }}>
            ACTUAL PRODUCT · PRIVATE BETA · LIVE DATA
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          POSITIONING STRIP
      ════════════════════════════════════════════ */}
      <section className="m-section-xs" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
            {[
              'A system, not a spreadsheet replacement.',
              'Designed for control, not just tracking.',
              'Built for real-world income patterns.',
            ].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#5C5648' }}>
                <span style={{ color: '#D97757', fontSize: '10px' }}>◆</span>
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
          HOW IT WORKS
      ════════════════════════════════════════════ */}
      <section className="m-section" style={{ background: '#0F0D0A', borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap">
          <div className="m-section-header">
            <Label>How It Works</Label>
            <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: '#E8E2D5' }}>
              Structure before{' '}
              <em style={{ color: '#D97757', fontStyle: 'italic' }}>spending.</em>
            </h2>
          </div>
          <div className="m-grid-4">
            {[
              { num: '01', title: 'Plan',     body: 'Define what your money should do before it arrives.' },
              { num: '02', title: 'Allocate', body: 'Assign every income unit to a purpose — not just categories.' },
              { num: '03', title: 'Execute',  body: 'Spend, save, or invest with structure already in place.' },
              { num: '04', title: 'Track',    body: 'See what\'s working — and what needs adjusting.' },
            ].map(({ num, title, body }) => (
              <div key={num} className="m-card" style={{ padding: '32px 24px' }}>
                <div className="m-mono" style={{ fontSize: '11px', color: '#3A3028', marginBottom: '16px', letterSpacing: '0.1em' }}>{num}</div>
                <h3 className="m-display" style={{ fontSize: '22px', color: '#E8E2D5', marginBottom: '12px' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: '#5C5648', lineHeight: 1.65 }}>{body}</p>
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
          FAQ
      ════════════════════════════════════════════ */}
      <section className="m-section" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-sm">
          <Label>Common questions</Label>
          <h2 className="m-display" style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', color: '#E8E2D5', marginBottom: '40px' }}>
            Answered <em style={{ color: '#D97757', fontStyle: 'italic' }}>honestly.</em>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              {
                q: 'How is this different from YNAB, Mint, or other budget apps?',
                a: 'Budget apps track what already happened. Royal-Icon Ledger controls decisions before they happen. Income is allocated automatically on arrival. Spending has limits enforced by the system — not your willpower. It is not a tracker. It is an operating system.',
              },
              {
                q: 'Does it work on mobile?',
                a: 'Yes. Royal-Icon Ledger is a Progressive Web App (PWA). Install it on your iPhone or Android home screen and it works exactly like a native app — including offline. No App Store required.',
              },
              {
                q: 'Do I need to connect my bank account?',
                a: 'No. The system works without bank access. You log income and spending manually — which actually improves financial awareness. Bank feed integration is on the roadmap.',
              },
              {
                q: 'What does it cost?',
                a: 'Beta access is completely free. A free tier (local device, all core modules) and a Pro tier (cloud sync, multi-device, push notifications) are planned for public launch. Pricing will be set during the closed beta phase. No payment is required at any stage of early access.',
              },
              {
                q: 'Which countries and currencies are supported?',
                a: 'The system is currency-agnostic — it works with any currency. It has been built and tested primarily in South Africa but is designed for global use. Multi-currency display improvements are on the roadmap.',
              },
              {
                q: 'Is my financial data private?',
                a: 'Completely. Your data is never sold, shared, or used for any purpose other than running your system. Cloud sync uses Supabase with Row Level Security — only your authenticated session can access your records. Your PIN never leaves your device. See the Security page for full details.',
              },
            ].map(({ q, a }, i, arr) => (
              <div key={i} style={{ padding: '24px 0', borderBottom: i < arr.length - 1 ? '1px solid #1A1610' : 'none' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#E8E2D5', marginBottom: '10px', lineHeight: 1.4 }}>{q}</div>
                <p style={{ fontSize: '14px', color: '#5C5648', lineHeight: 1.75 }}>{a}</p>
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
