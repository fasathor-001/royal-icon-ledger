// src/marketing/pages/Product.jsx

import React, { useState } from 'react';

const MODULES = [
  {
    id: 'command',
    icon: '⌘',
    title: 'Command Dashboard',
    subtitle: 'Your financial command center',
    what: 'A single screen showing your current stage, buffer progress, net worth, and actionable alerts. Everything you need to know — nothing you don\'t.',
    why: 'Variable-income management requires a control tower, not a spreadsheet. Command tells you where you are, what needs action, and whether the household is safe — at a glance.',
    points: ['Stage progression indicator', 'Buffer health at a glance', 'Net worth tracking', 'Pending decisions & alerts', 'Weekly pulse check-in'],
  },
  {
    id: 'gate',
    icon: '🚦',
    title: 'Spending Gate',
    subtitle: 'The first line of financial defence',
    what: 'Any discretionary purchase above your configured threshold triggers a mandatory 24-hour hold before it can be approved or rejected.',
    why: 'The gate separates impulse from intention. Most purchases that feel urgent at 11pm feel optional at 11am. The gate gives your future self a vote.',
    points: ['Configurable threshold', '24-hour hold period', 'Approve or reject with full history', 'Spending category awareness', 'Monthly impulse analytics'],
  },
  {
    id: 'budget',
    icon: '📬',
    title: 'Envelope Budgeting',
    subtitle: 'Money with a purpose',
    what: 'Assign every rand to an envelope before you spend it — groceries, family, transport, personal. Each envelope has its own cap, block mode, and rollover rule.',
    why: 'Envelope budgeting is the oldest and most effective budgeting method. Royal Ledger brings it into the digital era with rollover logic, hard blocks, and PIN overrides.',
    points: ['Custom envelopes with icons', 'Soft warning / hard block / PIN override modes', 'Roll-over, reset, or sweep-to-buffer at month end', 'Smart setup suggestions', 'Monthly review flow'],
  },
  {
    id: 'buffer',
    icon: '🛡',
    title: 'Buffer Reserve System',
    subtitle: 'The family safety net — built systematically',
    what: 'A dedicated reserve account tracked by the system. Stage rules determine how much of each income event goes to buffer. Protection mode activates automatically when the buffer drops.',
    why: 'An emergency fund alone isn\'t enough. You need rules for building it, rules for protecting it, and rules for when to prioritise it over everything else. The buffer system provides all three.',
    points: ['Stage-based allocation rules', 'Configurable target (months of salary)', 'Automatic protection mode when buffer drops', 'Buffer protect threshold (separate from target)', 'Progress tracking with stage benchmarks'],
  },
  {
    id: 'allocator',
    icon: '⚖',
    title: 'Profit Allocator',
    subtitle: 'Income goes to work immediately',
    what: 'When income arrives, the allocator computes the split automatically based on your current stage: Stage 1 goes 100% to buffer; Stage 3 splits four ways across buffer, long-term, trading, and lifestyle.',
    why: 'Without automatic allocation rules, income events become discretionary decisions — and discretionary decisions get made based on mood. The allocator removes the decision entirely.',
    points: ['Four configurable stage rules', 'Stage 1: 100% buffer', 'Stage 1.5: 70% buffer / 30% long-term', 'Stage 2: 80% buffer / 20% long-term', 'Stage 3: 50/30/20/0 — full waterfall'],
  },
  {
    id: 'trading',
    icon: '📊',
    title: 'Trading P&L',
    subtitle: 'The business, kept separate',
    what: 'Log monthly P&L from trading activity. Track capital, high-water mark, drawdown zones, and year-to-date performance — completely isolated from household finances.',
    why: 'Trading capital and family capital must never mix. Drawdown protocols enforce position-size reductions automatically. Business losses stay in the business.',
    points: ['Monthly P&L log', 'Drawdown protocol: caution / defensive / stop zones', 'High-water mark tracking', 'YTD performance', 'Win rate and average win/loss analytics'],
  },
  {
    id: 'stages',
    icon: '📈',
    title: 'Stage System',
    subtitle: 'A progression, not just a tracker',
    what: 'Royal Ledger places you in one of four stages based on your buffer level, and advances you automatically as the buffer grows. Each stage has different allocation rules.',
    why: 'Financial progress isn\'t linear. The stage system reflects this — protecting the household first, then growing long-term, then enabling lifestyle. Sequence matters.',
    points: ['Stage 1: Crisis floor (6 months)', 'Stage 1.5: Comfort zone (12 months)', 'Stage 2: Fortified (target months)', 'Stage 3: Full waterfall — wealth compounds', 'Automatic stage advancement'],
  },
  {
    id: 'sync',
    icon: '☁',
    title: 'Cloud Sync',
    subtitle: 'Your data, everywhere you need it',
    what: 'Secure, real-time cloud sync across devices. All data is backed by Supabase with Row Level Security. Offline-first architecture means the app works without a connection.',
    why: 'Financial data must be available when you need it — not just on your main device. Cloud sync with offline fallback ensures your system never goes dark.',
    points: ['Real-time sync across devices', 'Offline-first — works without internet', 'Row Level Security (your data is yours)', 'Sync status visible at all times', 'Manual retry on failure'],
  },
  {
    id: 'notifications',
    icon: '🔔',
    title: 'Push Notifications',
    subtitle: 'Your system speaks first',
    what: 'Configurable daily, weekly, and monthly push notifications keep you accountable. Reminders for reviews, budget checks, and system updates delivered directly to your device.',
    why: 'A financial system that requires you to remember to check it will fail. Push notifications close the loop — you get notified, not surprised.',
    points: ['Daily check-in reminders', 'Weekly pulse summaries', 'Monthly review prompts', 'Configurable timing', 'Timezone-aware scheduling'],
  },
  {
    id: 'pin',
    icon: '🔐',
    title: 'PIN Protection',
    subtitle: 'Discipline infrastructure',
    what: 'Sensitive fields — balances, allocator rules, high-water marks — can be PIN-locked. A 4-digit PIN gates the ability to edit critical financial inputs.',
    why: 'The biggest risk in a finance app isn\'t a hacker. It\'s yourself on a bad day, editing numbers to feel better. PIN protection makes meaningful changes require deliberate action.',
    points: ['Field-level PIN locking', 'Section-level PIN gates', 'Override PIN for urgent access', 'Trading day emotional guard', 'Change PIN anytime via Settings'],
  },
];

export default function Product({ navigate }) {
  const [activeId, setActiveId] = useState(null);

  return (
    <div>
      <div className="m-nav-spacer" />

      {/* Header */}
      <section className="m-section-sm" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-md">
          <div className="m-label" style={{ marginBottom: '16px' }}>Product</div>
          <h1 className="m-display" style={{ fontSize: 'clamp(36px, 5vw, 60px)', color: '#E8E2D5', marginBottom: '20px' }}>
            Every module.{' '}
            <em style={{ color: '#D97757', fontStyle: 'italic' }}>One system.</em>
          </h1>
          <p className="m-body" style={{ fontSize: '17px', maxWidth: '540px' }}>
            Royal Ledger is not a collection of features. It's a financial operating system — each module connected, each decision informed by the same underlying rules.
          </p>
        </div>
      </section>

      {/* Module list */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="m-wrap">
          <div style={{ marginTop: '0' }}>
            {MODULES.map((mod, i) => (
              <div
                key={mod.id}
                style={{
                  borderBottom: '1px solid #1A1610',
                  cursor: 'pointer',
                }}
                onClick={() => setActiveId(activeId === mod.id ? null : mod.id)}
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
                      fontSize: '18px', flexShrink: 0,
                    }}>
                      {mod.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#E8E2D5', letterSpacing: '-0.01em' }}>{mod.title}</div>
                      <div style={{ fontSize: '13px', color: '#5C5648', marginTop: '2px' }}>{mod.subtitle}</div>
                    </div>
                  </div>
                  <div style={{ color: activeId === mod.id ? '#D97757' : '#3A3028', fontSize: '18px', flexShrink: 0, transform: activeId === mod.id ? 'rotate(45deg)' : 'none', transition: 'all 200ms' }}>+</div>
                </div>

                {/* Expanded panel */}
                {activeId === mod.id && (
                  <div style={{ paddingBottom: '32px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }} className="product-expand-grid">
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5C5648', marginBottom: '12px' }}>What It Does</div>
                        <p style={{ fontSize: '15px', color: '#E8E2D5', lineHeight: 1.7, marginBottom: '20px' }}>{mod.what}</p>
                        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5C5648', marginBottom: '12px' }}>Why It Matters</div>
                        <p style={{ fontSize: '14px', color: '#8B8478', lineHeight: 1.7 }}>{mod.why}</p>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5C5648', marginBottom: '12px' }}>Capabilities</div>
                        {mod.points.map((pt, j) => (
                          <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0', borderBottom: j < mod.points.length - 1 ? '1px solid #1A1610' : 'none' }}>
                            <span style={{ color: '#D97757', flexShrink: 0, fontSize: '13px', marginTop: '1px' }}>→</span>
                            <span style={{ fontSize: '13px', color: '#8B8478', lineHeight: 1.5 }}>{pt}</span>
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

      {/* CTA */}
      <section className="m-section-sm" style={{ background: '#0F0D0A', borderTop: '1px solid #1A1610' }}>
        <div className="m-wrap-sm" style={{ textAlign: 'center' }}>
          <h2 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#E8E2D5', marginBottom: '20px' }}>
            Ready to put it to work?
          </h2>
          <p className="m-body" style={{ marginBottom: '32px' }}>
            Royal Ledger is in private beta. Apply for early access today.
          </p>
          <button className="m-btn m-btn-primary m-btn-lg" onClick={() => navigate('/early-access')}>
            Get Early Access
          </button>
        </div>
      </section>
    </div>
  );
}
