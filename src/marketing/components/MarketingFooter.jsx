// src/marketing/components/MarketingFooter.jsx

import React from 'react';
import { Link } from 'react-router-dom';

export default function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="m-footer">
      <div className="m-wrap">

        {/* Grid */}
        <div className="m-footer-grid">

          {/* Brand column */}
          <div>
            <Link to="/" style={{ textDecoration: 'none', marginBottom: '16px', display: 'inline-block' }}>
              <span className="m-display" style={{ fontSize: '20px', color: '#E8E2D5', fontWeight: 400 }}>Royal-Icon </span>
              <span className="m-display" style={{ fontSize: '20px', color: '#D97757', fontStyle: 'italic', fontWeight: 300 }}>Ledger</span>
            </Link>
            <p style={{ fontSize: '13px', color: '#3A3028', lineHeight: 1.7, maxWidth: '280px', marginBottom: '20px', marginTop: '4px' }}>
              A financial operating system for variable-income earners, traders, freelancers, and self-employed professionals.
            </p>
            <div className="m-badge m-badge-orange">Private Beta</div>
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
            ].map(({ label, path }) => (
              <Link key={path} to={path} className="m-footer-link" style={{ textDecoration: 'none' }}>
                {label}
              </Link>
            ))}
            {/* Hard link to app — exits marketing React tree */}
            <a
              href="/app"
              className="m-footer-link"
              style={{ textDecoration: 'none', display: 'block', marginTop: '4px' }}
            >
              Open App →
            </a>
          </div>

          {/* Legal column */}
          <div>
            <div className="m-footer-col-title">Legal</div>
            <p style={{ fontSize: '13px', color: '#3A3028', lineHeight: 1.65 }}>
              Royal-Icon Ledger does not provide financial advice. This is a personal financial management tool.
            </p>
          </div>

        </div>

        {/* Bottom bar */}
        <hr className="m-divider" style={{ marginBottom: '28px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#3A3028' }}>
            © {year} Royal-Icon Ledger. All rights reserved.
          </span>
          <span style={{ fontSize: '12px', color: '#3A3028' }}>
            Built for people who earn differently.
          </span>
        </div>

      </div>
    </footer>
  );
}
