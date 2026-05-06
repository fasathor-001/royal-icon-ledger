// src/marketing/pages/About.jsx

import React from 'react';

export default function About({ navigate }) {
  return (
    <div>
      <div className="m-nav-spacer" />

      {/* Header */}
      <section className="m-section-sm" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-md">
          <div className="m-label" style={{ marginBottom: '16px' }}>About</div>
          <h1 className="m-display" style={{ fontSize: 'clamp(36px, 5vw, 60px)', color: '#E8E2D5', marginBottom: '24px' }}>
            Financial tools were built for a world that no longer exists.
          </h1>
          <div style={{ fontSize: '15px', color: '#B0A898', maxWidth: '520px', lineHeight: 1.95 }}>
            <p style={{ margin: '0 0 16px' }}>
              They assume predictable income.<br />
              Fixed cycles.<br />
              Stable patterns.
            </p>
            <p style={{ margin: '0 0 16px' }}>
              But millions of people don't operate that way.
            </p>
            <p style={{ margin: '0 0 16px', color: '#8B8478' }}>
              Freelancers.<br />
              Traders.<br />
              Entrepreneurs.<br />
              Side-income earners.
            </p>
            <p style={{ margin: '0 0 16px' }}>
              Their income is irregular.<br />
              Their decisions are constant.<br />
              And the margin for error is smaller.
            </p>
            <p style={{ margin: 0, color: '#8B8478' }}>
              Yet the systems they rely on haven't changed.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem / The Shift */}
      <section className="m-section">
        <div className="m-wrap-md">

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'start', marginBottom: '72px' }} className="about-grid">
            <div>
              <div className="m-label" style={{ marginBottom: '20px' }}>The Problem</div>
              <div className="m-display" style={{ fontSize: 'clamp(22px, 3vw, 32px)', color: '#E8E2D5', lineHeight: 1.3, marginBottom: '24px' }}>
                Most people don't have a money problem. They have a structure problem.
              </div>
              <p style={{ fontSize: '15px', color: '#B0A898', lineHeight: 1.85, marginBottom: '14px' }}>
                Income comes in. Spending happens. Decisions are made in the moment.
              </p>
              <p style={{ fontSize: '15px', color: '#B0A898', lineHeight: 1.85, marginBottom: '14px' }}>
                By the time money is tracked, it's already gone.
              </p>
              <p style={{ fontSize: '15px', color: '#B0A898', lineHeight: 1.85 }}>
                This isn't a behaviour issue.{' '}
                <span style={{ color: '#E8E2D5', fontStyle: 'italic' }}>It's the wrong system.</span>
              </p>
            </div>
            <div>
              <div className="m-label" style={{ marginBottom: '20px' }}>The Shift</div>
              <div className="m-card-warm" style={{ padding: '28px' }}>
                <p className="m-display" style={{ fontSize: '21px', color: '#E8E2D5', lineHeight: 1.45, marginBottom: '20px', fontStyle: 'italic' }}>
                  "Structure before money is spent — not visibility after."
                </p>
                <p style={{ fontSize: '14px', color: '#8B8478', lineHeight: 1.75 }}>
                  Not by adding more tracking. Not by offering better reports. But by introducing structure before money moves.
                </p>
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #3A2A1E' }}>
                  <p style={{ fontSize: '14px', color: '#B0A898', lineHeight: 1.85 }}>
                    Every unit assigned a role before it's used.<br />
                    Decisions made intentionally — not reactively.<br />
                    Control that exists regardless of how income arrives.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What It Is */}
          <div style={{ marginBottom: '72px' }}>
            <div className="m-label" style={{ marginBottom: '24px' }}>What it is</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }} className="about-grid">
              <div className="m-card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '11px', color: '#5C5648', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Not</div>
                {['A budgeting app', 'An expense tracker'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#5C5648', flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', color: '#8B8478' }}>{item}</span>
                  </div>
                ))}
              </div>
              <div className="m-card" style={{ padding: '24px', borderColor: '#2A3A1E' }}>
                <div style={{ fontSize: '11px', color: '#D97757', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>But</div>
                {['A planning system', 'An allocation framework', 'A control layer'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#7FA068', flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', color: '#B0A898' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ fontSize: '14px', color: '#8B8478', lineHeight: 1.7 }}>
              Royal Ledger changes how money is handled — not just how it's recorded.
            </p>
          </div>

          {/* What We Believe */}
          <div>
            <div className="m-label" style={{ marginBottom: '28px' }}>What we believe</div>
            {[
              'Money should be structured before it is spent.',
              'Income should not determine control.',
              'Clarity should not depend on consistency.',
            ].map((line, i, arr) => (
              <div key={i} style={{
                padding: '20px 0',
                borderBottom: i < arr.length - 1 ? '1px solid #1A1610' : 'none',
              }}>
                <p style={{ fontSize: 'clamp(16px, 2vw, 21px)', color: '#E8E2D5', lineHeight: 1.5, margin: 0, fontWeight: 300 }}>{line}</p>
              </div>
            ))}
          </div>

          {/* Transition */}
          <div style={{ marginTop: '64px', paddingTop: '48px', borderTop: '1px solid #1A1610', maxWidth: '400px' }}>
            <p style={{ fontSize: '15px', color: '#8B8478', lineHeight: 1.85, margin: 0 }}>
              This is the thinking behind Royal Ledger.
            </p>
            <p style={{ fontSize: '15px', color: '#5C5648', lineHeight: 1.85, margin: '6px 0 0' }}>
              And the reason it was built.
            </p>
          </div>

        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>

      {/* Founder's Note */}
      <section className="m-section" style={{ borderTop: '1px solid #1A1610', borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-sm">
          <div className="m-label" style={{ marginBottom: '40px' }}>Founder's Note</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <p style={{ fontSize: '16px', color: '#E8E2D5', lineHeight: 1.85, fontWeight: 400 }}>
              This started with a problem I couldn't solve with anything on the market.
            </p>

            <p style={{ fontSize: '16px', color: '#B0A898', lineHeight: 1.85 }}>
              My income changed every month. My responsibilities didn't.
            </p>

            <p style={{ fontSize: '15px', color: '#B0A898', lineHeight: 1.85 }}>
              Every financial tool I tried was built for a different kind of person — someone with a fixed salary, predictable cycles, and income that arrived on schedule.
            </p>

            <p style={{ fontSize: '15px', color: '#B0A898', lineHeight: 1.85 }}>
              That assumption breaks down for anyone operating outside that model.
            </p>

            <div style={{ padding: '20px 0', borderTop: '1px solid #1A1610', borderBottom: '1px solid #1A1610' }}>
              <p style={{ fontSize: '15px', color: '#B0A898', lineHeight: 2, margin: 0 }}>
                Freelancers.<br />
                Traders.<br />
                Entrepreneurs.<br />
                Side-income earners.
              </p>
            </div>

            <p style={{ fontSize: '15px', color: '#B0A898', lineHeight: 1.85 }}>
              For people like us, income doesn't arrive on a timetable — and decisions can't be made on averages.
            </p>

            <p style={{ fontSize: '15px', color: '#B0A898', lineHeight: 1.85 }}>
              Yet every tool available still treated us like broken versions of salaried employees.
            </p>

            <p style={{ fontSize: '15px', color: '#B0A898', lineHeight: 1.85 }}>
              That gap is what led to Royal Ledger.
            </p>

            <p style={{ fontSize: '15px', color: '#B0A898', lineHeight: 1.85 }}>
              The goal was never to build another budgeting app. Those already exist. They solve a different problem — they tell you what you already spent. What I needed was something that answered an earlier question:
            </p>

            {/* Pull quote */}
            <div style={{ margin: '8px 0', padding: '28px 32px', background: '#0F0D0A', border: '1px solid #26221C', borderLeft: '3px solid #D97757', borderRadius: '2px' }}>
              <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(20px, 3vw, 26px)', color: '#E8E2D5', fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>
                "What should this money do — before I use it?"
              </p>
            </div>

            <p style={{ fontSize: '15px', color: '#B0A898', lineHeight: 1.85 }}>
              That shift — from tracking to allocation, from reaction to intention — is what the system is built around.
            </p>

            <p style={{ fontSize: '15px', color: '#B0A898', lineHeight: 1.85 }}>
              It introduces structure before money moves.<br />
              Not visibility after the fact.
            </p>

            <p style={{ fontSize: '15px', color: '#E8E2D5', lineHeight: 1.85 }}>
              This is not about managing money better.
            </p>

            <p style={{ fontSize: '15px', color: '#B0A898', lineHeight: 1.85 }}>
              It is about introducing structure where none exists —<br />
              and giving people control in a system that was never designed for them.
            </p>

            {/* Signature */}
            <div style={{ marginTop: '16px', paddingTop: '32px', borderTop: '1px solid #1A1610', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: '#14110E', border: '1px solid #26221C',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '15px', color: '#D97757', fontStyle: 'italic', letterSpacing: '0.02em' }}>FA</span>
              </div>
              <div>
                <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '19px', color: '#E8E2D5', fontStyle: 'italic' }}>— Amb. Frank A.</div>
                <div style={{ fontSize: '13px', color: '#8B8478', marginTop: '2px' }}>Founder, Royal Ledger</div>
                <div style={{ fontSize: '12px', color: '#5C5648', marginTop: '3px' }}>Building financial systems for variable-income earners.</div>
              </div>
            </div>

          </div>
        </div>
      </section>

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
              { label: 'Stage',      value: 'Private beta',          sub: 'Working product, invite-based access' },
              { label: 'Category',   value: 'Financial OS',           sub: 'Variable-income earners globally' },
              { label: 'Philosophy', value: 'Structure over willpower', sub: 'Systems beat motivation, always' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="m-card" style={{ padding: '28px 24px' }}>
                <div className="m-label" style={{ marginBottom: '12px' }}>{label}</div>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#E8E2D5', marginBottom: '8px', letterSpacing: '-0.01em' }}>{value}</div>
                <div style={{ fontSize: '13px', color: '#8B8478' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="m-section-sm" style={{ borderTop: '1px solid #1A1610' }}>
        <div className="m-wrap-sm" style={{ textAlign: 'center' }}>
          <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#E8E2D5', marginBottom: '12px' }}>
            Get early access.
          </h2>
          <p className="m-body" style={{ marginBottom: '28px' }}>
            Be part of the first rollout.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button className="m-btn m-btn-primary" onClick={() => navigate('/early-access')}>
              Get Early Access →
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
