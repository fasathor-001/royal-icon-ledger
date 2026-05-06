// src/components/InstallPrompt.jsx
//
// Detects platform and shows the right install instructions.
// Listens for the beforeinstallprompt event (Android/Chrome) for one-tap install.
// Falls back to manual instructions for iOS and others.

import React, { useEffect, useState } from 'react';
import { Download, X, Share, Plus, ChevronRight, Smartphone, Monitor, Check } from 'lucide-react';

const DISMISS_KEY = 'install-prompt-dismissed';
const REMIND_LATER_KEY = 'install-prompt-remind-later';

// Detect platform
function detectPlatform() {
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /android/.test(ua);
  const isMobile = isIOS || isAndroid;
  const isChrome = /chrome/.test(ua) && !/edge/.test(ua);
  const isSafari = /safari/.test(ua) && !/chrome/.test(ua);
  const isFirefox = /firefox/.test(ua);

  if (isIOS) return 'ios';
  if (isAndroid) return 'android';
  if (!isMobile && isChrome) return 'desktop-chrome';
  if (!isMobile && isSafari) return 'desktop-safari';
  if (!isMobile && isFirefox) return 'desktop-firefox';
  return 'other';
}

// Detect if app is already installed (PWA mode)
function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [showFullModal, setShowFullModal] = useState(false);
  const [platform, setPlatform] = useState('other');
  const [installEvent, setInstallEvent] = useState(null);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isInstalled()) return; // Already installed, don't show

    setPlatform(detectPlatform());

    // Check if user has dismissed forever
    const dismissedForever = localStorage.getItem(DISMISS_KEY);
    if (dismissedForever) return;

    // Check if user said "remind later" recently (within 24h)
    const remindLater = localStorage.getItem(REMIND_LATER_KEY);
    if (remindLater) {
      const remindTime = parseInt(remindLater, 10);
      if (Date.now() - remindTime < 24 * 60 * 60 * 1000) return;
    }

    // Listen for installable event (Android/Chrome desktop)
    const handler = (e) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Listen for installed event
    const installedHandler = () => {
      setInstalled(true);
      setShow(false);
      localStorage.setItem(DISMISS_KEY, 'true');
    };
    window.addEventListener('appinstalled', installedHandler);

    // Show after a short delay so it doesn't interrupt initial load
    const timer = setTimeout(() => setShow(true), 2500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
      clearTimeout(timer);
    };
  }, []);

  const triggerNativeInstall = async () => {
    if (!installEvent) return;
    setInstalling(true);
    installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      setShow(false);
      localStorage.setItem(DISMISS_KEY, 'true');
    }
    setInstallEvent(null);
    setInstalling(false);
  };

  const dismissForever = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setShow(false);
    setShowFullModal(false);
  };

  const remindLater = () => {
    localStorage.setItem(REMIND_LATER_KEY, Date.now().toString());
    setShow(false);
    setShowFullModal(false);
  };

  if (!show && !showFullModal) return null;
  if (installed) return null;

  return (
    <>
      <style>{`
        @keyframes ipSlideUp { from { opacity: 0; transform: translate(-50%, 30px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes ipFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .ip-banner { animation: ipSlideUp 400ms ease; }
        .ip-modal-overlay { animation: ipFadeIn 200ms ease; }
        .ip-btn-primary { background: #D97757; color: #0A0908; padding: 11px 18px; font-weight: 600; border-radius: 4px; font-size: 13px; cursor: pointer; transition: all 150ms; border: none; display: inline-flex; align-items: center; gap: 6px; }
        .ip-btn-primary:hover { background: #E08868; }
        .ip-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .ip-btn-secondary { background: transparent; color: #B0A898; padding: 11px 14px; font-size: 13px; cursor: pointer; border: none; border-radius: 4px; transition: all 150ms; }
        .ip-btn-secondary:hover { color: #E8E2D5; background: #14110E; }
        .ip-step { display: flex; align-items: flex-start; gap: 12px; padding: 14px; background: #14110E; border: 1px solid #26221C; border-radius: 4px; }
        .ip-step-num { background: #1A1410; color: #D97757; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* Floating banner */}
      {show && !showFullModal && (
        <div
          className="ip-banner"
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1A1410',
            border: '1px solid #3A2A1E',
            boxShadow: '0 8px 32px rgba(217, 119, 87, 0.3), 0 0 0 1px rgba(217, 119, 87, 0.2)',
            padding: '14px 16px',
            borderRadius: '8px',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontFamily: 'Inter, system-ui, sans-serif',
            color: '#E8E2D5',
            maxWidth: '95vw',
            width: '420px',
          }}
        >
          <div style={{
            background: '#D97757',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Download size={18} style={{ color: '#0A0908' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>Install Royal Ledger</div>
            <div style={{ fontSize: '12px', color: '#B0A898' }}>
              {platform === 'ios' || platform === 'android' ? 'Add to your home screen' : 'Install as desktop app'}
            </div>
          </div>
          <button onClick={() => setShowFullModal(true)} className="ip-btn-primary">
            How
          </button>
          <button
            onClick={remindLater}
            style={{ background: 'transparent', border: 'none', color: '#8B8478', cursor: 'pointer', padding: '6px', display: 'flex' }}
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Full modal with instructions */}
      {showFullModal && (
        <div
          className="ip-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 9, 8, 0.85)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: 'Inter, system-ui, sans-serif',
            color: '#E8E2D5',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowFullModal(false); }}
        >
          <div
            style={{
              background: '#0A0908',
              border: '1px solid #26221C',
              borderRadius: '8px',
              maxWidth: '480px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '32px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600, color: '#D97757', marginBottom: '8px' }}>
                  Install
                </div>
                <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '28px', fontWeight: 300, lineHeight: 1.2 }}>
                  Get the <span style={{ fontStyle: 'italic', color: '#D97757' }}>full app</span>
                </h2>
              </div>
              <button
                onClick={() => setShowFullModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#8B8478', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '14px', color: '#B0A898', lineHeight: 1.6, marginBottom: '24px' }}>
              Install Ledger as an app on your device. It opens full-screen, works offline, and lives on your home screen like any other app.
            </p>

            {/* Native install button if available (Android/Chrome desktop) */}
            {installEvent && (platform === 'android' || platform === 'desktop-chrome') && (
              <div style={{ marginBottom: '24px', padding: '20px', background: '#1A1410', border: '1px solid #D97757', borderRadius: '6px' }}>
                <div style={{ fontWeight: 600, marginBottom: '6px' }}>One-tap install available</div>
                <div style={{ fontSize: '13px', color: '#B0A898', marginBottom: '14px' }}>
                  Your browser supports direct install. No menu hunting required.
                </div>
                <button
                  onClick={triggerNativeInstall}
                  disabled={installing}
                  className="ip-btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {installing ? 'Installing…' : <>Install now <ChevronRight size={16} /></>}
                </button>
              </div>
            )}

            {/* Platform-specific instructions */}
            <PlatformInstructions platform={platform} />

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #26221C' }}>
              <button onClick={remindLater} className="ip-btn-secondary" style={{ flex: 1 }}>
                Remind me later
              </button>
              <button onClick={dismissForever} className="ip-btn-secondary" style={{ flex: 1 }}>
                Don't show again
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PlatformInstructions({ platform }) {
  if (platform === 'ios') {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Smartphone size={16} style={{ color: '#D97757' }} />
          <span style={{ fontWeight: 600, fontSize: '14px' }}>On iPhone or iPad</span>
        </div>
        <p style={{ fontSize: '12px', color: '#8B8478', marginBottom: '14px' }}>
          You're using Safari. iOS only allows installing PWAs through Safari, not Chrome or other browsers.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="ip-step">
            <div className="ip-step-num">1</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                Tap the <Share size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', margin: '0 2px' }} /> Share button
              </div>
              <div style={{ fontSize: '12px', color: '#B0A898' }}>
                It's at the bottom of Safari (square with arrow pointing up)
              </div>
            </div>
          </div>
          <div className="ip-step">
            <div className="ip-step-num">2</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Scroll down and tap "Add to Home Screen"</div>
              <div style={{ fontSize: '12px', color: '#B0A898' }}>
                You'll see a list of options — keep scrolling if you don't see it
              </div>
            </div>
          </div>
          <div className="ip-step">
            <div className="ip-step-num">3</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Tap "Add"</div>
              <div style={{ fontSize: '12px', color: '#B0A898' }}>
                Ledger will appear on your home screen with its own icon
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (platform === 'android') {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Smartphone size={16} style={{ color: '#D97757' }} />
          <span style={{ fontWeight: 600, fontSize: '14px' }}>On Android</span>
        </div>
        <p style={{ fontSize: '12px', color: '#8B8478', marginBottom: '14px' }}>
          Use Chrome for the easiest install.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="ip-step">
            <div className="ip-step-num">1</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Tap the three-dot menu</div>
              <div style={{ fontSize: '12px', color: '#B0A898' }}>
                Top-right corner of Chrome
              </div>
            </div>
          </div>
          <div className="ip-step">
            <div className="ip-step-num">2</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Tap "Install app" or "Add to Home screen"</div>
              <div style={{ fontSize: '12px', color: '#B0A898' }}>
                The exact wording depends on your Android version
              </div>
            </div>
          </div>
          <div className="ip-step">
            <div className="ip-step-num">3</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Tap "Install" to confirm</div>
              <div style={{ fontSize: '12px', color: '#B0A898' }}>
                Ledger appears in your app drawer and home screen
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (platform === 'desktop-chrome') {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Monitor size={16} style={{ color: '#D97757' }} />
          <span style={{ fontWeight: 600, fontSize: '14px' }}>On Chrome (desktop)</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="ip-step">
            <div className="ip-step-num">1</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Look at the address bar</div>
              <div style={{ fontSize: '12px', color: '#B0A898' }}>
                On the right side, you'll see a small monitor icon with a download arrow
              </div>
            </div>
          </div>
          <div className="ip-step">
            <div className="ip-step-num">2</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Click that icon, then "Install"</div>
              <div style={{ fontSize: '12px', color: '#B0A898' }}>
                A small popup will confirm — click Install
              </div>
            </div>
          </div>
          <div className="ip-step">
            <div className="ip-step-num">3</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Done — Ledger opens in its own window</div>
              <div style={{ fontSize: '12px', color: '#B0A898' }}>
                It also appears in your Start Menu / Dock for quick access
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (platform === 'desktop-safari') {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Monitor size={16} style={{ color: '#D97757' }} />
          <span style={{ fontWeight: 600, fontSize: '14px' }}>On Mac Safari</span>
        </div>
        <p style={{ fontSize: '12px', color: '#8B8478', marginBottom: '14px' }}>
          Safari 17+ supports installing web apps on macOS Sonoma and later.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="ip-step">
            <div className="ip-step-num">1</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Click File menu in Safari</div>
            </div>
          </div>
          <div className="ip-step">
            <div className="ip-step-num">2</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Choose "Add to Dock…"</div>
            </div>
          </div>
          <div className="ip-step">
            <div className="ip-step-num">3</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Click "Add"</div>
              <div style={{ fontSize: '12px', color: '#B0A898' }}>
                Ledger will appear in your Dock and Launchpad
              </div>
            </div>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: '#8B8478', marginTop: '14px', padding: '12px', background: '#14110E', borderRadius: '4px' }}>
          On older macOS or other browsers, just bookmark this page. It still works the same — just opens in a tab.
        </p>
      </div>
    );
  }

  // Firefox or other
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <Monitor size={16} style={{ color: '#D97757' }} />
        <span style={{ fontWeight: 600, fontSize: '14px' }}>Your browser</span>
      </div>
      <p style={{ fontSize: '13px', color: '#B0A898', lineHeight: 1.6, marginBottom: '14px' }}>
        Your current browser doesn't fully support installing web apps. You have two options:
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="ip-step">
          <div className="ip-step-num">1</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Open this site in Chrome or Edge</div>
            <div style={{ fontSize: '12px', color: '#B0A898' }}>
              Then come back to this prompt — install will work properly
            </div>
          </div>
        </div>
        <div className="ip-step">
          <div className="ip-step-num">2</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Or just bookmark the page</div>
            <div style={{ fontSize: '12px', color: '#B0A898' }}>
              Press Ctrl+D (or Cmd+D on Mac). Works fine, just opens in a tab.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
