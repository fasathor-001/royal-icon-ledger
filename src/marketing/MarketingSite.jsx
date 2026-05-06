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

// ── Per-route meta ─────────────────────────────────────────────
const BASE_URL = 'https://royalledger.app';
const OG_IMAGE = `${BASE_URL}/og-image.png`;

const PAGE_META = {
  '/': {
    title:       'Royal Ledger — Financial OS for Variable-Income Earners',
    description: 'Give every unit a role — before you spend it. Built for freelancers, traders, and anyone with unpredictable income.',
  },
  '/product': {
    title:       'Product — Royal Ledger',
    description: 'Envelopes, buffers, trading P&L, PIN gate, cloud sync — every module built for variable income.',
  },
  '/how-it-works': {
    title:       'How It Works — Royal Ledger',
    description: 'Income arrives. You allocate. You spend from envelopes. Month closes. Repeat — with full visibility at every step.',
  },
  '/for-who': {
    title:       'Who Royal Ledger Is For',
    description: 'Freelancers, traders, gig workers, business owners — Royal Ledger is built for people whose income never looks the same twice.',
  },
  '/security': {
    title:       'Security & Privacy — Royal Ledger',
    description: 'Your data stays yours. Row-level security, offline-first storage, no ads, no tracking, full export.',
  },
  '/investors': {
    title:       'Investors — Royal Ledger',
    description: '1.57B freelancers. 500M traders. No financial OS built for them. Royal Ledger is the category.',
  },
  '/early-access': {
    title:       'Get Early Access — Royal Ledger',
    description: 'Apply for early access to Royal Ledger — the financial OS built for variable-income earners.',
  },
  '/about': {
    title:       'About — Royal Ledger',
    description: 'Why Royal Ledger exists, who built it, and the belief that drove it: the money was always there.',
  },
  '/privacy': {
    title:       'Privacy Policy — Royal Ledger',
    description: 'How Royal Ledger handles your data.',
  },
};

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`) ||
           document.querySelector(`meta[property="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(name.startsWith('og:') || name.startsWith('twitter:') ? 'property' : 'name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function HeadSync() {
  const { pathname } = useLocation();
  useEffect(() => {
    const meta = PAGE_META[pathname] ?? PAGE_META['/'];
    const url  = `${BASE_URL}${pathname}`;
    document.title = meta.title;
    setMeta('description',         meta.description);
    setMeta('og:title',            meta.title);
    setMeta('og:description',      meta.description);
    setMeta('og:url',              url);
    setMeta('og:image',            OG_IMAGE);
    setMeta('twitter:title',       meta.title);
    setMeta('twitter:description', meta.description);
    setMeta('twitter:image',       OG_IMAGE);
    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = url;
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
      <HeadSync />
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
