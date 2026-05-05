// src/marketing/MarketingSite.jsx
//
// Marketing site shell — nested React Router routes.
// All internal navigation uses useNavigate(); pages receive it as a prop
// so page content requires zero changes.
//
// Scroll restoration: ScrollToTop resets position on every route change.

import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './marketing.css';
import MarketingNav    from './components/MarketingNav';
import MarketingFooter from './components/MarketingFooter';
import Home        from './pages/Home';
import Product     from './pages/Product';
import HowItWorks  from './pages/HowItWorks';
import ForWho      from './pages/ForWho';
import Security    from './pages/Security';
import Investors   from './pages/Investors';
import EarlyAccess from './pages/EarlyAccess';
import About       from './pages/About';
import Privacy     from './pages/Privacy';
import NotFound    from './pages/NotFound';

// ── Scroll to top on every route change ────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

// ── Page titles per route ───────────────────────────────────────
const PAGE_TITLES = {
  '/':             'Royal Ledger — Financial OS for Variable-Income Earners',
  '/product':      'Product — Royal Ledger',
  '/how-it-works': 'How It Works — Royal Ledger',
  '/for-who':      'For Who — Royal Ledger',
  '/security':     'Security & Privacy — Royal Ledger',
  '/investors':    'Investors — Royal Ledger',
  '/early-access': 'Get Early Access — Royal Ledger',
  '/about':        'About — Royal Ledger',
  '/privacy':      'Privacy Policy — Royal Ledger',
};

function TitleSync() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = PAGE_TITLES[pathname] ?? PAGE_TITLES['/'];
  }, [pathname]);
  return null;
}

// ── Shell: nav + routes + footer ───────────────────────────────
// Pages still receive `navigate` as a prop so their content is untouched.
// We source it once here from useNavigate() and pass it down.
function MarketingShell() {
  const navigate = useNavigate();

  return (
    <div className="m-root" style={{ background: '#0A0908', minHeight: '100vh', color: '#E8E2D5' }}>
      <ScrollToTop />
      <TitleSync />
      <MarketingNav />
      <main>
        <Routes>
          <Route path="/"             element={<Home        navigate={navigate} />} />
          <Route path="/product"      element={<Product     navigate={navigate} />} />
          <Route path="/how-it-works" element={<HowItWorks  navigate={navigate} />} />
          <Route path="/for-who"      element={<ForWho      navigate={navigate} />} />
          <Route path="/security"     element={<Security    navigate={navigate} />} />
          <Route path="/investors"    element={<Investors   navigate={navigate} />} />
          <Route path="/early-access" element={<EarlyAccess navigate={navigate} />} />
          <Route path="/about"        element={<About       navigate={navigate} />} />
          <Route path="/privacy"      element={<Privacy     navigate={navigate} />} />
          {/* 404 — branded not-found page */}
          <Route path="*"             element={<NotFound    navigate={navigate} />} />
        </Routes>
      </main>
      <MarketingFooter />
    </div>
  );
}

export default function MarketingSite() {
  return <MarketingShell />;
}
