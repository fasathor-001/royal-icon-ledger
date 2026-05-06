// src/marketing/pages/About.jsx

import React from 'react';

export default function About({ navigate }) {
  return (
    <div>
      <div className="m-nav-spacer" />

      {/* ── Header ── */}
      <section className="m-section-sm" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-md">
          <div className="m-label" style={{ marginBottom: '16px' }}>About</div>
          <h1 className="m-display" style={{ fontSize: 'clamp(36px, 5vw, 60px)', color: '#E8E2D5', marginBottom: '24px' }}>
            Built for people the system left out.
          </h1>
          <div style={{ fontSize: '15px', color: '#B0A898', maxWidth: '520px', lineHeight: 1.95 }}>
            <p style={{ margin: '0 0 16px' }}>
              Most financial tools were built on the same assumption.
            </p>
            <p style={{ margin: '0 0 16px' }}>
              That people are already disciplined.
            </p>
            <p style={{ margin: '0 0 16px', color: '#8B8478' }}>
              That income is predictable.<br />
              That habits are consistent.<br />
              That planning is straightforward.
            </p>
            <p style={{ margin: '0 0 16px' }}>
              For most people, none of that is true.
            </p>
            <p style={{ margin: 0, color: '#8B8478' }}>
              And when the system fails, people blame themselves.
            </p>
          </div>
        </div>
      </section>

      {/* ── Problem / Insight ── */}
      <section className="m-section">
        <div className="m-wrap-md">

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'start', marginBottom: '72px' }} className="about-grid">
            <div>
              <div className="m-label" style={{ marginBottom: '20px' }}>The Problem</div>
              <div className="m-display" style={{ fontSize: 'clamp(22px, 3vw, 32px)', color: '#E8E2D5', lineHeight: 1.3, marginBottom: '24px' }}>
                The system doesn't match reality.
              </div>
              <p style={{ fontSize: '15px', color: '#B0A898', lineHeight: 1.85, marginBottom: '14px' }}>
                Most apps assume you earn the same amount every month.
                That you plan everything in advance.
                That you already have consistent habits.
              </p>
              <p style={{ fontSize: '15px', color: '#B0A898', lineHeight: 1.85, marginBottom: '14px' }}>
                Income changes. Expenses shift. Plans break.
              </p>
              <p style={{ fontSize: '15px', color: '#B0A898', lineHeight: 1.85 }}>
                And when the system fails,{' '}
                <span style={{ color: '#E8E2D5', fontStyle: 'italic' }}>people blame themselves.</span>
              </p>
            </div>
            <div>
              <div className="m-label" style={{ marginBottom: '20px' }}>The Insight</div>
              <div className="m-card-warm" style={{ padding: '28px' }}>
                <p className="m-display" style={{ fontSize: '21px', color: '#E8E2D5', lineHeight: 1.45, marginBottom: '20px', fontStyle: 'italic' }}>
                  "The problem isn't the user. It's the system."
                </p>
                <p style={{ fontSize: '14px', color: '#8B8478', lineHeight: 1.75 }}>
                  If a system only works when everything is perfect, it doesn't work.
                  People don't need another tool that records what already happened.
                </p>
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #3A2A1E' }}>
                  <p style={{ fontSize: '14px', color: '#B0A898', lineHeight: 1.85 }}>
                    They need a system that helps them make better decisions before it happens.<br />
                    One that holds the structure they don't have yet.<br />
                    One that builds discipline — rather than assuming it.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── The Approach ── */}
          <div style={{ marginBottom: '72px' }}>
            <div className="m-label" style={{ marginBottom: '24px' }}>The Approach</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }} className="about-grid">
              <div className="m-card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '11px', color: '#5C5648', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Not</div>
                {[
                  'Reminders to stay disciplined',
                  'Tracking what already happened',
                  'A tool built for perfect planners',
                ].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#5C5648', flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', color: '#8B8478' }}>{item}</span>
                  </div>
                ))}
              </div>
              <div className="m-card" style={{ padding: '24px', borderColor: '#2A3A1E' }}>
                <div style={{ fontSize: '11px', color: '#D97757', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>But</div>
                {[
                  'Structure that holds decisions in place',
                  'A system that adapts to your stage',
                  'Discipline built in — not assumed',
                ].map(item => (
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

          {/* ── What We Believe ── */}
          <div>
            <div className="m-label" style={{ marginBottom: '28px' }}>What we believe</div>
            {[
              'Structure creates discipline — not the other way around.',
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

      {/* ── Founder's Note ── */}
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
                Students.<br />
                Early-stage earners.<br />
                Freelancers.<br />
                Traders.<br />
                Entrepreneurs.<br />
                Anyone building from scratch.
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
              That shift — from tracking to structure, from reaction to intention — is what the system is built around.
            </p>

            <p style={{ fontSize: '15px', color: '#B0A898', lineHeight: 1.85 }}>
              It doesn't matter whether you're managing a first allowance or a complex income structure.
              The system starts where you are and builds from there.
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
                <div style={{ fontSize: '12px', color: '#5C5648', marginTop: '3px' }}>Building financial systems for people the market left out.</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Who It's For + Closing (merged Sections 5 & 6) ── */}
      <section className="m-section-sm" style={{ background: '#0F0D0A', borderTop: '1px solid #1A1610', borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-sm" style={{ textAlign: 'center' }}>
          <div className="m-label" style={{ marginBottom: '20px' }}>Who It's For</div>
          <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: '#E8E2D5', marginBottom: '20px' }}>
            For people who want{' '}
            <em style={{ color: '#D97757', fontStyle: 'italic' }}>control</em>
            {' '}— not just clarity.
          </h2>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', margin: '28px 0', padding: '28px 0', borderTop: '1px solid #1A1610', borderBottom: '1px solid #1A1610' }}>
            {['Students', 'Allowance earners', 'Irregular income', 'Early-stage earners'].map((label, i, arr) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', color: '#B0A898', fontWeight: 300 }}>{label}</span>
                {i < arr.length - 1 && <span style={{ color: '#26221C', fontSize: '12px' }}>·</span>}
              </div>
            ))}
          </div>

          <p className="m-body" style={{ marginBottom: '12px' }}>
            And anyone who feels traditional financial tools don't fit how their money actually works.
          </p>
          <p style={{ fontSize: '16px', fontWeight: 500, color: '#E8E2D5', lineHeight: 1.6, marginBottom: 0 }}>
            It doesn't assume discipline.
            <br />
            <em style={{ color: '#D97757', fontStyle: 'italic' }}>It builds it.</em>
          </p>
        </div>
      </section>

      {/* ── Company info ── */}
      <section className="m-section-sm">
        <div className="m-wrap-md">
          <div className="m-grid-3">
            {[
              { label: 'Stage',      value: 'Private beta',            sub: 'Working product, invite-based access' },
              { label: 'Category',   value: 'Financial system',         sub: 'Built for variable and irregular income' },
              { label: 'Philosophy', value: 'Discipline is a system',   sub: 'Structure creates the habit — not the other way around' },
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

      {/* ── CTA ── */}
      <section className="m-section-sm" style={{ borderTop: '1px solid #1A1610' }}>
        <div className="m-wrap-sm" style={{ textAlign: 'center' }}>
          <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#E8E2D5', marginBottom: '12px' }}>
            Start building your system.
          </h2>
          <p className="m-body" style={{ marginBottom: '28px' }}>
            Apply for early access. Private beta. Invite-only.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button className="m-btn m-btn-primary" onClick={() => navigate('/early-access')}>
              Apply for Early Access
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
