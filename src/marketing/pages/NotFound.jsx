// src/marketing/pages/NotFound.jsx
// Branded 404 page — shown for any unknown marketing route.

import React from 'react';

export default function NotFound({ navigate }) {
  return (
    <div>
      <div className="m-nav-spacer" />

      <section style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>

          <div className="m-mono" style={{ fontSize: '11px', color: '#3A3028', letterSpacing: '0.18em', marginBottom: '24px' }}>
            404
          </div>

          <h1 className="m-display" style={{ fontSize: 'clamp(32px, 5vw, 52px)', color: '#E8E2D5', marginBottom: '20px', lineHeight: 1.2 }}>
            This page doesn't{' '}
            <em style={{ color: '#D97757', fontStyle: 'italic' }}>exist.</em>
          </h1>

          <p style={{ fontSize: '16px', color: '#5C5648', lineHeight: 1.75, marginBottom: '40px' }}>
            But your financial structure can. You may have followed a broken link — here's where to go instead.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '40px', textAlign: 'left' }}>
            {[
              { label: 'Home',         path: '/' },
              { label: 'Product',      path: '/product' },
              { label: 'How It Works', path: '/how-it-works' },
              { label: 'Early Access', path: '/early-access' },
              { label: 'Investors',    path: '/investors' },
            ].map(({ label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: '#14110E', border: '1px solid #26221C',
                  borderRadius: '4px', padding: '12px 16px',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'border-color 150ms',
                }}
              >
                <span style={{ color: '#D97757', fontSize: '13px' }}>→</span>
                <span style={{ fontSize: '14px', color: '#E8E2D5', fontWeight: 500 }}>{label}</span>
              </button>
            ))}
          </div>

          <p style={{ fontSize: '12px', color: '#3A3028' }}>
            If you think something is broken,{' '}
            <a href="mailto:hello@royalicon.net" style={{ color: '#5C5648', textDecoration: 'none' }}>
              let us know
            </a>.
          </p>

        </div>
      </section>
    </div>
  );
}
