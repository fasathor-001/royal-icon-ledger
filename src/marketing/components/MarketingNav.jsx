// src/marketing/components/MarketingNav.jsx
//
// Fixed navigation bar with React Router NavLink for active-state detection.
// Mobile drawer uses the same NavLink pattern.
// "Open App" is a hard navigation to /app (full page → app shell).

import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Product',      path: '/product' },
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'For Who',      path: '/for-who' },
  { label: 'Security',     path: '/security' },
  { label: 'Investors',    path: '/investors' },
  { label: 'About',        path: '/about' },
];

// NavLink className helper — applies .active when route matches
const navLinkClass = ({ isActive }) =>
  `m-nav-link${isActive ? ' active' : ''}`;

const drawerLinkClass = ({ isActive }) =>
  `m-drawer-link${isActive ? ' active' : ''}`;

export default function MarketingNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawer when viewport grows past mobile breakpoint
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 960) setDrawerOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Hard navigation to /app — exits the marketing React tree entirely
  const openApp = () => {
    setDrawerOpen(false);
    window.location.href = 'https://app.royalicon.net';
  };

  return (
    <>
      {/* ── Top nav bar ── */}
      <nav className="m-nav" style={{ borderBottomColor: scrolled ? '#26221C' : '#1A1610' }}>
        <div className="m-nav-inner">

          {/* Brand — NavLink to / with exact match */}
          <NavLink
            to="/"
            className="m-nav-brand"
            style={{ textDecoration: 'none' }}
          >
            <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '22px', fontWeight: 400, color: '#E8E2D5' }}>
              Royal-Icon
            </span>
            <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '22px', fontWeight: 400, fontStyle: 'italic', color: '#D97757' }}>
              {' '}Ledger
            </span>
          </NavLink>

          {/* Desktop nav links */}
          <div className="m-nav-links">
            {NAV_LINKS.map(({ label, path }) => (
              <NavLink
                key={path}
                to={path}
                className={navLinkClass}
                style={{ textDecoration: 'none' }}
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="m-nav-actions">
            <button className="m-nav-open-app" onClick={openApp}>
              Open App
            </button>
            <NavLink
              to="/early-access"
              className="m-btn m-btn-primary m-btn-sm"
              style={{ textDecoration: 'none' }}
            >
              Request Access
            </NavLink>
          </div>

          {/* Hamburger */}
          <button
            className="m-hamburger"
            onClick={() => setDrawerOpen(o => !o)}
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={drawerOpen}
          >
            <span className="m-hamburger-bar" style={{
              width: drawerOpen ? '20px' : '24px',
              transform: drawerOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none',
            }} />
            <span className="m-hamburger-bar" style={{ width: '20px', opacity: drawerOpen ? 0 : 1 }} />
            <span className="m-hamburger-bar" style={{
              width: drawerOpen ? '20px' : '16px',
              transform: drawerOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
            }} />
          </button>

        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      <div
        className={`m-drawer${drawerOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {NAV_LINKS.map(({ label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={drawerLinkClass}
            style={{ textDecoration: 'none' }}
            onClick={() => setDrawerOpen(false)}
          >
            {label}
          </NavLink>
        ))}
        <div className="m-drawer-actions">
          <NavLink
            to="/early-access"
            className="m-btn m-btn-primary"
            style={{ textDecoration: 'none', justifyContent: 'center', width: '100%' }}
            onClick={() => setDrawerOpen(false)}
          >
            Request Early Access
          </NavLink>
          <button
            className="m-nav-open-app"
            style={{ width: '100%', textAlign: 'center', padding: '12px' }}
            onClick={openApp}
          >
            Open App
          </button>
        </div>
      </div>
    </>
  );
}
