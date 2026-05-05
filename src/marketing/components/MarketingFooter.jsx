// src/marketing/components/MarketingFooter.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function MarketingFooter() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleStay = async (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setSaving(true);
    if (supabase) {
      await supabase.from('newsletter_subscribers').insert({ email: trimmed }).maybeSingle();
      // Ignore duplicate errors — treat as success either way
    }
    setSaving(false);
    setSubscribed(true);
  };

  return (
    <footer className="m-footer">
      <div className="m-wrap">

        {/* Grid */}
        <div className="m-footer-grid">

          {/* Brand column */}
          <div>
            <Link to="/" style={{ textDecoration: 'none', marginBottom: '16px', display: 'inline-block' }}>
              <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '22px', fontWeight: 400, color: '#E8E2D5' }}>Royal-Icon </span>
              <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '22px', fontWeight: 400, fontStyle: 'italic', color: '#D97757' }}>Ledger</span>
            </Link>
            <p style={{ fontSize: '13px', color: '#3A3028', lineHeight: 1.7, maxWidth: '240px', marginBottom: '20px', marginTop: '4px' }}>
              A financial operating system for variable-income earners globally.
            </p>
            <div className="m-badge m-badge-orange" style={{ marginBottom: '20px' }}>Private Beta</div>

            {/* Stay updated */}
            <div style={{ marginTop: '4px' }}>
              <div style={{ fontSize: '11px', color: '#3A3028', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Stay updated
              </div>
              {subscribed ? (
                <p style={{ fontSize: '12px', color: '#7FA068' }}>✓ You're on the list.</p>
              ) : (
                <form onSubmit={handleStay} style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                      flex: 1, minWidth: 0,
                      background: '#14110E', border: '1px solid #26221C',
                      borderRadius: '3px', padding: '7px 10px',
                      fontSize: '12px', color: '#E8E2D5',
                      outline: 'none', fontFamily: 'Inter, sans-serif',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      background: '#26221C', border: 'none', borderRadius: '3px',
                      padding: '7px 12px', fontSize: '12px', color: '#8B8478',
                      cursor: saving ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
                      fontFamily: 'Inter, sans-serif', opacity: saving ? 0.6 : 1,
                    }}
                  >
                    {saving ? '…' : 'Notify me'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Product column */}
          <div>
            <div className="m-footer-col-title">Product</div>
            {[
              { label: 'Features',      path: '/product' },
              { label: 'How It Works',  path: '/how-it-works' },
              { label: 'For Who',       path: '/for-who' },
              { label: 'Security',      path: '/security' },
            ].map(({ label, path }) => (
              <Link key={path} to={path} className="m-footer-link" style={{ textDecoration: 'none' }}>
                {label}
              </Link>
            ))}
          </div>

          {/* Company column */}
          <div>
            <div className="m-footer-col-title">Company</div>
            {[
              { label: 'About',         path: '/about' },
              { label: 'Investors',     path: '/investors' },
              { label: 'Early Access',  path: '/early-access' },
              { label: 'Privacy Policy', path: '/privacy' },
            ].map(({ label, path }) => (
              <Link key={path} to={path} className="m-footer-link" style={{ textDecoration: 'none' }}>
                {label}
              </Link>
            ))}
            <a
              href="https://app.royalicon.net"
              className="m-footer-link"
              style={{ textDecoration: 'none', display: 'block', marginTop: '4px' }}
            >
              Open App →
            </a>
          </div>

          {/* Contact & Legal column */}
          <div>
            <div className="m-footer-col-title">Contact</div>
            <a
              href="mailto:hello@royalicon.net"
              className="m-footer-link"
              style={{ textDecoration: 'none', display: 'block', marginBottom: '4px' }}
            >
              hello@royalicon.net
            </a>
            <a
              href="mailto:investors@royalicon.net"
              className="m-footer-link"
              style={{ textDecoration: 'none', display: 'block', marginBottom: '20px' }}
            >
              investors@royalicon.net
            </a>

            {/* Social */}
            <div className="m-footer-col-title" style={{ marginTop: '8px' }}>Follow</div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { label: 'X / Twitter', href: 'https://x.com/royaliconledger' },
                { label: 'LinkedIn',    href: 'https://linkedin.com/company/royal-icon-ledger' },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="m-footer-link"
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  {label}
                </a>
              ))}
            </div>

            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '12px', color: '#3A3028', lineHeight: 1.65 }}>
                Royal-Icon Ledger does not provide financial advice. This is a personal financial management tool.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <hr className="m-divider" style={{ marginBottom: '28px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#3A3028' }}>
            © {year} Royal-Icon Ledger. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/privacy" style={{ fontSize: '12px', color: '#3A3028', textDecoration: 'none' }}>Privacy Policy</Link>
            <span style={{ fontSize: '12px', color: '#3A3028' }}>Built for people who earn differently.</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
