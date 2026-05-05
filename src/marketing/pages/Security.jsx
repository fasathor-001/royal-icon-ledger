// src/marketing/pages/Security.jsx

import React from 'react';

const TRUST_ITEMS = [
  {
    icon: '🔒',
    title: 'Your data is yours',
    body: 'Royal-Icon Ledger does not aggregate, sell, or use your financial data for any purpose beyond running your system. Your records are private financial records — treated as such.',
    strong: true,
  },
  {
    icon: '🛡',
    title: 'Row-level security on every record',
    body: 'Cloud-synced data is protected by Supabase Row Level Security (RLS). Your financial records are accessible only by your authenticated session — not by other users, not by backend queries, and not by any third party.',
    strong: false,
  },
  {
    icon: '📴',
    title: 'Offline-first architecture',
    body: 'Royal-Icon Ledger is a Progressive Web App (PWA). All core functionality works without an internet connection. Your data is stored locally first, synced when online. A network outage never breaks your system.',
    strong: false,
  },
  {
    icon: '☁',
    title: 'Secure cloud sync',
    body: 'When online, your data syncs across devices via encrypted HTTPS connections. Sync status is visible at all times. Manual retry is available when sync fails. You are never left wondering whether your data is current.',
    strong: false,
  },
  {
    icon: '🔐',
    title: 'PIN protection for sensitive fields',
    body: 'Balances, allocator rules, trading figures, and high-water marks can be PIN-locked. A 4-digit PIN gates the ability to edit any critical financial input. Even on your own device, discipline requires friction.',
    strong: false,
  },
  {
    icon: '📦',
    title: 'Export and backup',
    body: 'Your data can be exported at any time. You are not locked in. You are not dependent on our servers staying online. Your financial records are yours — and you can take them with you.',
    strong: false,
  },
  {
    icon: '🚫',
    title: 'No advertising. No data selling.',
    body: 'Royal-Icon Ledger does not run advertisements. We do not sell your data to third parties. We do not share your financial information with anyone. The product is the service — not a data pipeline.',
    strong: true,
  },
  {
    icon: '👁',
    title: 'No tracking or profiling',
    body: 'We do not profile users based on spending behaviour. We do not send your financial patterns to analytics platforms. The only entity that analyses your financial data is you.',
    strong: false,
  },
];

const TECH_ITEMS = [
  { label: 'Data storage', value: 'Supabase (PostgreSQL) with Row Level Security' },
  { label: 'Authentication', value: 'Supabase Auth — email/password, JWT tokens' },
  { label: 'Transport', value: 'HTTPS only — all data in transit is encrypted' },
  { label: 'Offline storage', value: 'Browser localStorage + IndexedDB for PWA' },
  { label: 'Session management', value: 'Device-level sessions, viewable and revocable' },
  { label: 'PIN storage', value: 'Local only — PIN is never sent to any server' },
  { label: 'Data export', value: 'JSON export available from Settings at any time' },
  { label: 'Third-party SDKs', value: 'None that have access to financial data' },
];

export default function Security({ navigate }) {
  // navigate prop used in closing CTA
  return (
    <div>
      <div className="m-nav-spacer" />

      {/* Header */}
      <section className="m-section-sm" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-md">
          <div className="m-label" style={{ marginBottom: '16px' }}>Security & Privacy</div>
          <h1 className="m-display" style={{ fontSize: 'clamp(36px, 5vw, 60px)', color: '#E8E2D5', marginBottom: '20px' }}>
            Your financial records.
            <br />
            <em style={{ color: '#D97757', fontStyle: 'italic' }}>Treated as such.</em>
          </h1>
          <p className="m-body" style={{ fontSize: '17px', maxWidth: '520px' }}>
            We take a simple position: your financial data is private. It is not a product. It is not a signal. It is not a training set.
          </p>
        </div>
      </section>

      {/* Trust items */}
      <section className="m-section">
        <div className="m-wrap-md">
          <div className="m-section-header-sm">
            <div className="m-label" style={{ marginBottom: '16px' }}>Our commitments</div>
            <h2 className="m-display" style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', color: '#E8E2D5' }}>
              Eight principles. No exceptions.
            </h2>
          </div>

          <div>
            {TRUST_ITEMS.map((item, i) => (
              <div key={i} className="m-trust-row">
                <div className="m-trust-icon">{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '15px', fontWeight: 600,
                    color: item.strong ? '#E8E2D5' : '#E8E2D5',
                    marginBottom: '6px', letterSpacing: '-0.01em',
                  }}>
                    {item.title}
                    {item.strong && (
                      <span style={{ marginLeft: '10px', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D97757', verticalAlign: 'middle' }}>
                        ← Core
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '14px', color: '#5C5648', lineHeight: 1.7 }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical specs */}
      <section className="m-section-sm" style={{ background: '#0F0D0A', borderTop: '1px solid #1A1610', borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-md">
          <div className="m-section-header-sm">
            <div className="m-label" style={{ marginBottom: '16px' }}>Technical overview</div>
            <h2 className="m-display" style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: '#E8E2D5' }}>
              For those who want to know the specifics.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }} className="security-grid">
            {TECH_ITEMS.map(({ label, value }, i) => (
              <div key={i} className="m-card" style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#3A3028', marginBottom: '8px' }}>{label}</div>
                <div style={{ fontSize: '14px', color: '#E8E2D5', lineHeight: 1.5 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 640px) { .security-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Session control note */}
      <section className="m-section-sm" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-md">
          <div className="m-card-warm" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
              <div style={{ fontSize: '22px', flexShrink: 0 }}>🖥</div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#E8E2D5', marginBottom: '10px' }}>
                  You control your sessions
                </h3>
                <p style={{ fontSize: '14px', color: '#8B8478', lineHeight: 1.7, marginBottom: '16px' }}>
                  Royal-Icon Ledger provides a Sessions view in Account Settings. You can see every active device session and sign out of any or all of them remotely. If you ever lose access to a device, you can revoke it immediately.
                </p>
                <p style={{ fontSize: '13px', color: '#5C5648', lineHeight: 1.6 }}>
                  Your PIN is never stored on any server. It lives only on your device, and is never sent over the network.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* CTA */}
      <section className="m-section-sm">
        <div className="m-wrap-sm" style={{ textAlign: 'center' }}>
          <h2 className="m-display" style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', color: '#E8E2D5', marginBottom: '16px' }}>
            Your data. Your rules.{' '}
            <em style={{ color: '#D97757', fontStyle: 'italic' }}>Your system.</em>
          </h2>
          <p className="m-body" style={{ marginBottom: '32px' }}>
            Royal-Icon Ledger is built around one principle: your financial records are private. Apply for early access and take control.
          </p>
          <button className="m-btn m-btn-primary m-btn-lg" onClick={() => navigate('/early-access')}>
            Get Early Access
          </button>
        </div>
      </section>

    </div>
  );
}
