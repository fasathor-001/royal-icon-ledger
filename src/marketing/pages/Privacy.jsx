// src/marketing/pages/Privacy.jsx
// Plain-language privacy policy. No legal jargon.

import React from 'react';

const SECTIONS = [
  {
    title: 'What we collect',
    body: [
      'When you apply for early access, we collect your name, email address, country, and income profile. You provide this voluntarily.',
      'When you use the app, your financial data (income events, allocations, spending records, buffer progress) is stored locally on your device by default. If you enable cloud sync, this data is stored in our database under your authenticated account.',
      'We do not collect payment information during beta. No credit card is ever required for early access.',
    ],
  },
  {
    title: 'What we do not collect',
    body: [
      'We do not collect advertising identifiers or track you across other websites.',
      'We do not use your financial data for analytics, profiling, or any purpose beyond running your personal system.',
      'We do not record behavioural patterns for machine learning or AI training.',
      'Your PIN is never collected or transmitted. It lives only on your device.',
    ],
  },
  {
    title: 'How we use your data',
    body: [
      'Early access applications are used to review and invite users to the beta. Your email is used only to send your invite and, if you opt in, product updates.',
      'Cloud-synced financial data is used only to sync your system across your own devices. It is not read, analysed, or used by us for any other purpose.',
      'We may contact you via email with product updates, changes to this policy, or your account status. You can unsubscribe from non-essential emails at any time.',
    ],
  },
  {
    title: 'Who we share your data with',
    body: [
      'Nobody. We do not sell, rent, or share your personal or financial data with any third party.',
      'We use Supabase as our database and authentication provider. Your data is stored in their infrastructure under your authenticated account with Row Level Security — only your session can access your records.',
      'We use Cloudflare for hosting and basic analytics (privacy-preserving, no cookies, no fingerprinting). Cloudflare does not receive your financial data.',
    ],
  },
  {
    title: 'Data security',
    body: [
      'All data in transit is encrypted via HTTPS. Cloud-stored data uses Supabase Row Level Security — no other user or query can access your records.',
      'Your financial data is stored locally first. Cloud sync is optional and requires authentication.',
      'Sessions are device-level and can be revoked at any time from Account Settings.',
    ],
  },
  {
    title: 'Your rights',
    body: [
      'You can export all your data at any time from Settings → Data & Sync.',
      'You can delete your account and all associated data by contacting support@royalledger.app. We will process deletion requests within 14 days.',
      'You can request a copy of any personal data we hold about you by emailing support@royalledger.app.',
    ],
  },
  {
    title: 'Cookies',
    body: [
      'The marketing website (royalledger.app) uses no advertising or tracking cookies.',
      'The app uses a session cookie for authentication. This is essential and cannot be disabled without breaking sign-in.',
      'Cloudflare analytics uses no cookies and does not fingerprint visitors.',
    ],
  },
  {
    title: 'Changes to this policy',
    body: [
      'If we make material changes to how we handle your data, we will notify you by email before the change takes effect.',
      'This policy was last updated: May 2025.',
    ],
  },
];

export default function Privacy({ navigate }) {
  return (
    <div>
      <div className="m-nav-spacer" />

      {/* Header */}
      <section className="m-section-sm" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-md">
          <div className="m-label" style={{ marginBottom: '16px' }}>Legal</div>
          <h1 className="m-display" style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', color: '#E8E2D5', marginBottom: '20px' }}>
            Privacy Policy
          </h1>
          <p className="m-body" style={{ fontSize: '16px', maxWidth: '520px' }}>
            Plain language. No legal jargon. This is what we collect, what we do with it, and what we don't.
          </p>
          <div style={{ marginTop: '20px', display: 'inline-flex', gap: '8px', alignItems: 'center', padding: '10px 16px', background: '#14110E', border: '1px solid #26221C', borderRadius: '4px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7FA068' }} />
            <span style={{ fontSize: '13px', color: '#B0A898' }}>Last updated: May 2025</span>
          </div>
        </div>
      </section>

      {/* Core commitments strip */}
      <section className="m-section-xs" style={{ background: '#0F0D0A', borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
            {[
              'No data selling',
              'No advertising',
              'No tracking cookies',
              'No profiling',
              'Export anytime',
            ].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#8B8478' }}>
                <span style={{ color: '#7FA068' }}>✓</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="m-section">
        <div className="m-wrap-sm">
          {SECTIONS.map(({ title, body }, i) => (
            <div key={i} style={{ marginBottom: '48px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#E8E2D5', marginBottom: '16px', letterSpacing: '-0.01em' }}>
                {i + 1}. {title}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {body.map((para, j) => (
                  <p key={j} style={{ fontSize: '14px', color: '#B0A898', lineHeight: 1.8 }}>
                    {para}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {/* Contact */}
          <div style={{ borderTop: '1px solid #1A1610', paddingTop: '40px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#E8E2D5', marginBottom: '16px' }}>
              {SECTIONS.length + 1}. Questions
            </h2>
            <p style={{ fontSize: '14px', color: '#B0A898', lineHeight: 1.8, marginBottom: '16px' }}>
              If you have any questions about this policy or how your data is handled, contact us directly:
            </p>
            <a href="mailto:support@royalledger.app" style={{ fontSize: '14px', color: '#D97757', textDecoration: 'none' }}>
              support@royalledger.app
            </a>
          </div>
        </div>
      </section>

      {/* Back home */}
      <section className="m-section-sm" style={{ borderTop: '1px solid #1A1610' }}>
        <div className="m-wrap-sm" style={{ textAlign: 'center' }}>
          <button className="m-btn m-btn-outline" onClick={() => navigate('/')}>← Back to home</button>
        </div>
      </section>
    </div>
  );
}
