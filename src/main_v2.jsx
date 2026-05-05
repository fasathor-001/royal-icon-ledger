// src/main_v2.jsx
//
// Entry point with Supabase auth + cloud sync.
//
// Routing (React Router v6 — BrowserRouter):
//   /app   → AppShell (existing AppV2 dashboard + PWA update banner)
//   /*     → MarketingSite (public marketing website)
//
// PWA start_url is /app?source=pwa — installed PWA launches the dashboard.
// All other paths render the marketing site with full nested routing.

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import AppV2 from './App_v2.jsx';
import MarketingSite from './marketing/MarketingSite.jsx';
import './index.css';

// ── App shell: existing dashboard + PWA update banner ──────────
function AppShell() {
  const [updateReady, setUpdateReady] = useState(false);
  const [updateSW, setUpdateSW]       = useState(null);

  useEffect(() => {
    const fn = registerSW({
      onNeedRefresh()  { setUpdateReady(true); },
      onOfflineReady() {},
    });
    setUpdateSW(() => fn);
  }, []);

  return (
    <>
      <AppV2 />
      {updateReady && (
        <div style={{
          position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
          background: '#D97757', color: '#0A0908', padding: '14px 20px', borderRadius: '6px',
          zIndex: 9999, display: 'flex', alignItems: 'center', gap: '14px',
          fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14px', fontWeight: 500,
          maxWidth: '90vw',
        }}>
          <span>New version available</span>
          <button
            onClick={() => updateSW?.(true)}
            style={{ background: '#0A0908', color: '#E8E2D5', border: 'none', padding: '8px 14px', borderRadius: '4px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
          >
            Update
          </button>
          <button
            onClick={() => setUpdateReady(false)}
            style={{ background: 'transparent', color: '#0A0908', border: 'none', fontSize: '18px', cursor: 'pointer', opacity: 0.6, lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}

// ── Root: BrowserRouter with top-level route split ─────────────
function Root() {
  // On my.royalledger.app, every path that isn't /app redirects to /app
  const isAppSubdomain = window.location.hostname === 'my.royalledger.app';

  return (
    <BrowserRouter>
      <Routes>
        {/* App dashboard — auth-gated, PWA target */}
        <Route path="/app"   element={<AppShell />} />
        {/* /login is an alias — AppShell shows LoginPage when no session */}
        <Route path="/login" element={<AppShell />} />

        {/* On app subdomain: catch-all redirects to /login */}
        {isAppSubdomain
          ? <Route path="/*" element={<Navigate to="/login" replace />} />
          : <Route path="/*" element={<MarketingSite />} />
        }
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
