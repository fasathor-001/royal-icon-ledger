import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, Loader, X } from 'lucide-react';
import {
  savePushSubscription,
  deletePushSubscription,
  updatePushPreferences,
} from '../lib/dataLayer';
import { TIMEZONES, offsetLabel, normalizeTimezone } from '../lib/timezones';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  return new Uint8Array([...atob(base64)].map((c) => c.charCodeAt(0)));
}

function detectEnv() {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone =
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
  const supportsPush = 'serviceWorker' in navigator && 'PushManager' in window;
  return { isIOS, isStandalone, supportsPush };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      aria-pressed={on}
      style={{
        width: 40, height: 22, borderRadius: 999, border: 'none', flexShrink: 0,
        background: on ? '#D97757' : '#26221C', cursor: 'pointer',
        position: 'relative', transition: 'background 200ms',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, width: 16, height: 16, borderRadius: '50%',
        left: on ? 21 : 3,
        background: on ? '#0A0908' : '#5C5648',
        transition: 'left 200ms',
      }} />
    </button>
  );
}

function IOSInstallGuide() {
  return (
    <div style={{
      background: '#12100D', border: '1px solid #3A2A1E',
      borderRadius: 6, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: '#1A1410', borderBottom: '1px solid #3A2A1E',
        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 20 }}>📲</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#E8E2D5' }}>
            Install the app first
          </div>
          <div style={{ fontSize: 12, color: '#8B8478', marginTop: 2 }}>
            iOS requires the app on your Home Screen before notifications can be enabled.
          </div>
        </div>
      </div>

      {/* Steps */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          {
            icon: '⬆️',
            label: 'Tap the Share button',
            desc: 'The box-with-arrow icon in Safari\'s toolbar at the bottom of the screen.',
          },
          {
            icon: '➕',
            label: 'Tap "Add to Home Screen"',
            desc: 'Scroll down in the share sheet if you don\'t see it immediately.',
          },
          {
            icon: '✅',
            label: 'Tap "Add" to confirm',
            desc: 'The app icon will appear on your Home Screen.',
          },
          {
            icon: '🏠',
            label: 'Open from your Home Screen',
            desc: 'Tap the Royal Ledger icon — not Safari. It must launch in full-screen mode.',
          },
          {
            icon: '🔔',
            label: 'Come back here',
            desc: 'Go to Settings → Notifications and tap "Enable push notifications".',
          },
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: '#26221C', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 16,
            }}>
              {step.icon}
            </div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#E8E2D5' }}>{step.label}</div>
              <div style={{ fontSize: 12, color: '#8B8478', marginTop: 2, lineHeight: 1.5 }}>
                {step.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div style={{
        borderTop: '1px solid #26221C', padding: '10px 18px',
        fontSize: 11, color: '#5C5648', letterSpacing: '0.03em',
      }}>
        Requires iOS 16.4 or later · Notifications work even when the app is closed
      </div>
    </div>
  );
}

function DeniedGuide() {
  // Detect browser for tailored instructions
  const ua = navigator.userAgent;
  const isEdge  = /Edg\//.test(ua);
  const isChrome = /Chrome\//.test(ua) && !isEdge;
  const isFirefox = /Firefox\//.test(ua);
  const isSafariDesktop = /Safari\//.test(ua) && !/Chrome/.test(ua) && !/Edg\//.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua);

  let steps = [];
  if (isIOS) {
    steps = [
      'Open iPhone Settings app',
      'Go to Notifications → Royal Ledger',
      'Enable Allow Notifications',
      'Return here and tap Enable',
    ];
  } else if (isEdge) {
    steps = [
      <>Click the <strong style={{ color: '#E8E2D5' }}>🔒 lock icon</strong> in the Edge address bar</>,
      <>Click <strong style={{ color: '#E8E2D5' }}>Permissions for this site</strong></>,
      <>Set <strong style={{ color: '#E8E2D5' }}>Notifications</strong> to <strong style={{ color: '#E8E2D5' }}>Allow</strong> <span style={{ color: '#5C5648' }}>(not Ask — Edge blocks the prompt in Ask mode)</span></>,
      <>Press <strong style={{ color: '#E8E2D5' }}>Ctrl + Shift + R</strong> to reload — notifications will activate automatically</>,
    ];
  } else if (isChrome) {
    steps = [
      <>Click the <strong style={{ color: '#E8E2D5' }}>🔒 lock icon</strong> in the Chrome address bar</>,
      <>Set <strong style={{ color: '#E8E2D5' }}>Notifications</strong> to <strong style={{ color: '#E8E2D5' }}>Allow</strong></>,
      <>Reload the page (<strong style={{ color: '#E8E2D5' }}>Ctrl + Shift + R</strong>) — notifications will activate automatically</>,
    ];
  } else if (isFirefox) {
    steps = [
      <>Click the <strong style={{ color: '#E8E2D5' }}>🔒 lock icon</strong> in the Firefox address bar</>,
      <>Click <strong style={{ color: '#E8E2D5' }}>Connection secure → More information</strong></>,
      <>Go to <strong style={{ color: '#E8E2D5' }}>Permissions → Send Notifications → Allow</strong></>,
      <>Reload the page, then click Enable</>,
    ];
  } else if (isSafariDesktop) {
    steps = [
      <>In the menu bar go to <strong style={{ color: '#E8E2D5' }}>Safari → Settings → Websites → Notifications</strong></>,
      <>Find <strong style={{ color: '#E8E2D5' }}>my.royalledger.app</strong> and set it to <strong style={{ color: '#E8E2D5' }}>Allow</strong></>,
      <>Reload the page, then click Enable</>,
    ];
  } else {
    steps = [
      'Click the lock icon in your browser address bar',
      'Find Notifications and set it to Allow',
      'Reload the page, then click Enable',
    ];
  }

  return (
    <div style={{
      background: '#160E0C', border: '1px solid #3A1E18', borderRadius: 6,
      padding: '16px 18px', fontSize: 13, marginBottom: 16,
    }}>
      <div style={{ color: '#C56B5A', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
        🔕 Notifications blocked by your browser
      </div>
      <div style={{ color: '#8B8478', lineHeight: 1.6, marginBottom: 10 }}>
        The browser is preventing the permission prompt from appearing. To fix it:
      </div>
      <ol style={{ color: '#8B8478', lineHeight: 2, paddingLeft: 18, fontSize: 13, margin: 0 }}>
        {steps.map((step, i) => <li key={i}>{step}</li>)}
      </ol>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function NotificationSettings({ user, data, setData }) {
  const prefs = data.notificationPreferences ?? {
    dailyEnabled: true,
    weeklyEnabled: true,
    monthlyEnabled: true,
    timezoneOffset: Math.round(-(new Date().getTimezoneOffset()) / 60),
    morningTime: '08:00',
    eveningTime: '18:00',
  };

  // push status: 'detecting' | 'needs-install' | 'idle' | 'loading' | 'subscribed' | 'denied' | 'unsupported' | 'no-vapid'
  const [pushStatus, setPushStatus] = useState('detecting');
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'error'

  // IANA timezone disambiguation
  // 'idle' → checking; 'resolved' → IANA known; 'needs-confirm' → show banner; 'dismissed' → hidden this session
  const [ianaStatus,    setIanaStatus]    = useState('idle');
  const [ianaCandidates, setIanaCandidates] = useState([]);
  const [pendingIana,   setPendingIana]   = useState('');

  useEffect(() => {
    if (!VAPID_PUBLIC_KEY) { setPushStatus('no-vapid'); return; }

    const { isIOS, isStandalone, supportsPush } = detectEnv();

    // iOS running in Safari (not installed) — must install first
    if (isIOS && !isStandalone) {
      setPushStatus('needs-install');
      return;
    }

    // Browser doesn't support Web Push at all
    if (!supportsPush) {
      setPushStatus('unsupported');
      return;
    }

    // Check existing permission + subscription
    if (Notification.permission === 'denied') {
      setPushStatus('denied');
      return;
    }

    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => {
        setPushStatus(sub ? 'subscribed' : 'idle');
      })
    );
  }, []);

  // On mount: if timezoneIana is already set → resolved; otherwise try to auto-map.
  useEffect(() => {
    if (prefs.timezoneIana) { setIanaStatus('resolved'); return; }

    const offset   = prefs.timezoneOffset ?? Math.round(-(new Date().getTimezoneOffset()) / 60);
    const currency = data?.currency ?? 'ZAR';
    const result   = normalizeTimezone(offset, currency);

    if (result.confident) {
      // Auto-write silently — no UI needed
      updatePrefsImmediate({ timezoneIana: result.iana });
      setIanaStatus('resolved');
    } else {
      setIanaCandidates(result.candidates);
      setPendingIana(result.candidates[0]?.iana ?? '');
      setIanaStatus('needs-confirm');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Internal helper used in the above effect (before updatePrefs is stable)
  function updatePrefsImmediate(patch) {
    const next = { ...prefs, ...patch };
    setData((d) => ({ ...d, notificationPreferences: next }));
  }

  const updatePrefs = (patch) => {
    const next = { ...prefs, ...patch };
    setData((d) => ({ ...d, notificationPreferences: next }));
    if (pushStatus === 'subscribed' && user) {
      setSaveStatus('saving');
      updatePushPreferences(user.id, next).then((ok) => {
        setSaveStatus(ok ? 'saved' : 'error');
        setTimeout(() => setSaveStatus(null), 2500);
      });
    }
  };

  const enable = async () => {
    setPushStatus('loading');
    try {
      // Some browsers (Edge) silently block the prompt — the Promise never resolves.
      // Race it against a 6 s timeout so the button doesn't stay stuck forever.
      const permission = await Promise.race([
        Notification.requestPermission(),
        new Promise((resolve) => setTimeout(() => resolve('timeout'), 6000)),
      ]);
      if (permission === 'denied' || permission === 'timeout') { setPushStatus('denied'); return; }
      if (permission !== 'granted') { setPushStatus('idle'); return; }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      if (user) {
        const ok = await savePushSubscription(user.id, sub.toJSON(), prefs);
        if (!ok) throw new Error('Supabase save failed');
      }
      setPushStatus('subscribed');
    } catch (err) {
      console.error('[NotificationSettings] enable:', err);
      setPushStatus('idle');
    }
  };

  const disable = async () => {
    setPushStatus('loading');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      if (user) await deletePushSubscription(user.id);
      setPushStatus('idle');
    } catch (err) {
      console.error('[NotificationSettings] disable:', err);
      setPushStatus('subscribed');
    }
  };

  const inputStyle = {
    background: '#0A0908', border: '1px solid #26221C', padding: '9px 12px',
    color: '#E8E2D5', borderRadius: 3, fontSize: 14, outline: 'none',
    fontFamily: 'JetBrains Mono, monospace',
  };

  const labelStyle = {
    fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
    fontWeight: 600, color: '#5C5648',
  };

  const isReady = pushStatus !== 'needs-install' && pushStatus !== 'unsupported' && pushStatus !== 'no-vapid';

  return (
    <div style={{ background: '#14110E', border: '1px solid #26221C', borderRadius: 4, padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Bell size={16} style={{ color: '#D97757' }} />
        <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 400, margin: 0 }}>
          Notifications
        </h2>
      </div>
      <p style={{ color: '#8B8478', fontSize: 14, marginBottom: 20, marginTop: 4 }}>
        Daily, weekly, and month-end push reminders — personalized to your real numbers.
      </p>

      {/* iOS install guide — replaces everything else */}
      {pushStatus === 'needs-install' && (
        <>
          <IOSInstallGuide />
          <p style={{ fontSize: 12, color: '#5C5648', marginTop: 14, lineHeight: 1.6 }}>
            You can configure your reminder preferences below. They'll be saved and applied once you enable notifications after installing.
          </p>
        </>
      )}

      {/* Denied guide */}
      {pushStatus === 'denied' && <DeniedGuide />}

      {/* Unsupported */}
      {pushStatus === 'unsupported' && (
        <div style={{ background: '#160E0C', border: '1px solid #3A1E18', borderRadius: 6, padding: '12px 16px', fontSize: 13, color: '#C56B5A', marginBottom: 16 }}>
          Push notifications are not supported in this browser. Try adding the app to your Home Screen and opening it from there.
        </div>
      )}

      {/* VAPID not configured */}
      {pushStatus === 'no-vapid' && (
        <div style={{ background: '#160E0C', border: '1px solid #3A1E18', borderRadius: 6, padding: '12px 16px', fontSize: 13, color: '#C56B5A', marginBottom: 16 }}>
          VAPID public key not configured. Add <code style={{ background: '#26221C', padding: '1px 5px', borderRadius: 3 }}>VITE_VAPID_PUBLIC_KEY</code> to your environment variables.
        </div>
      )}

      {/* Preferences — always visible (pre-configure before subscribing) */}
      <div style={{ marginTop: pushStatus === 'needs-install' ? 20 : 0, marginBottom: 20 }}>
        <div style={{ ...labelStyle, marginBottom: 8 }}>Reminder types</div>
        {[
          { key: 'dailyEnabled',   label: 'Daily reminder',            desc: 'Buffer status and spending pace — morning & evening' },
          { key: 'weeklyEnabled',  label: 'Weekly pulse (Sunday)',      desc: 'Morning & evening: spend progress and envelope pacing' },
          { key: 'monthlyEnabled', label: 'Month-end Checkpoint',       desc: 'Morning & evening nudge to review and sweep your numbers' },
        ].map(({ key, label, desc }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #1E1A16' }}>
            <div>
              <div style={{ fontSize: 14, color: '#E8E2D5' }}>{label}</div>
              <div style={{ fontSize: 12, color: '#5C5648', marginTop: 2 }}>{desc}</div>
            </div>
            <Toggle on={prefs[key]} onChange={(v) => updatePrefs({ [key]: v })} />
          </div>
        ))}
      </div>

      {/* Timezone */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ ...labelStyle, marginBottom: 8 }}>Timezone</div>

        {/* Disambiguation banner — shown when offset maps to multiple IANA zones */}
        {ianaStatus === 'needs-confirm' && (
          <div style={{
            background: '#12100D', border: '1px solid #3A2A1E',
            borderRadius: 6, padding: '14px 16px', marginBottom: 12,
          }}>
            <div style={{ fontSize: 13, color: '#D97757', fontWeight: 600, marginBottom: 6 }}>
              Confirm your timezone
            </div>
            <div style={{ fontSize: 12, color: '#8B8478', marginBottom: 12, lineHeight: 1.6 }}>
              Your offset ({offsetLabel(prefs.timezoneOffset ?? 0)}) matches more than one location.
              Pick yours so notifications arrive at the right time.
            </div>
            <select
              value={pendingIana}
              onChange={e => setPendingIana(e.target.value)}
              style={{ ...inputStyle, width: '100%', marginBottom: 10 }}
            >
              {ianaCandidates.map(tz => (
                <option key={tz.iana} value={tz.iana}>
                  {tz.label} ({offsetLabel(tz.offset)}{tz.hasDst ? ', DST' : ''})
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                disabled={!pendingIana}
                onClick={() => {
                  const tz = TIMEZONES.find(t => t.iana === pendingIana);
                  if (!tz) return;
                  updatePrefs({ timezoneIana: tz.iana, timezoneOffset: tz.offset });
                  setIanaStatus('resolved');
                }}
                style={{
                  background: pendingIana ? '#D97757' : '#26221C',
                  color: pendingIana ? '#0A0908' : '#5C5648',
                  border: 'none', borderRadius: 4, padding: '8px 16px',
                  fontSize: 13, fontWeight: 600,
                  cursor: pendingIana ? 'pointer' : 'not-allowed',
                }}
              >
                Confirm
              </button>
              <button
                onClick={() => setIanaStatus('dismissed')}
                style={{
                  background: 'transparent', border: '1px solid #26221C',
                  color: '#5C5648', borderRadius: 4, padding: '8px 14px',
                  fontSize: 13, cursor: 'pointer',
                }}
              >
                Later
              </button>
            </div>
          </div>
        )}

        {/* Main timezone selector — 13-entry curated IANA list */}
        <select
          value={prefs.timezoneIana ?? ''}
          onChange={e => {
            const tz = TIMEZONES.find(t => t.iana === e.target.value);
            if (tz) {
              updatePrefs({ timezoneIana: tz.iana, timezoneOffset: tz.offset });
              setIanaStatus('resolved');
            }
          }}
          style={{ ...inputStyle, width: '100%' }}
        >
          {/* Placeholder shown only when no IANA match in our list */}
          {!prefs.timezoneIana && (
            <option value="">— select your timezone —</option>
          )}
          {TIMEZONES.map(tz => (
            <option key={tz.iana} value={tz.iana}>
              {tz.label} ({offsetLabel(tz.offset)}{tz.hasDst ? ', DST' : ''})
            </option>
          ))}
        </select>
      </div>

      {/* Morning & Evening times */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: 24 }}>
        <div>
          <div style={{ ...labelStyle, marginBottom: 8 }}>Morning reminder</div>
          <input
            type="time"
            value={prefs.morningTime ?? '08:00'}
            onChange={e => updatePrefs({ morningTime: e.target.value })}
            style={inputStyle}
          />
          <div style={{ fontSize: 12, color: '#5C5648', marginTop: 6 }}>Daily & Sunday morning</div>
        </div>
        <div>
          <div style={{ ...labelStyle, marginBottom: 8 }}>Evening reminder</div>
          <input
            type="time"
            value={prefs.eveningTime ?? '18:00'}
            onChange={e => updatePrefs({ eveningTime: e.target.value })}
            style={inputStyle}
          />
          <div style={{ fontSize: 12, color: '#5C5648', marginTop: 6 }}>End-of-day wrap-up</div>
        </div>
      </div>

      {/* Save status */}
      {saveStatus === 'saved' && (
        <div style={{ fontSize: 12, color: '#7FA068', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Check size={12} /> Preferences saved
        </div>
      )}
      {saveStatus === 'error' && (
        <div style={{ fontSize: 12, color: '#C56B5A', marginBottom: 12 }}>
          Failed to save — check your connection.
        </div>
      )}

      {/* Enable / Disable button — only when app is ready to subscribe */}
      {pushStatus === 'subscribed' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#7FA068' }}>
            <Check size={14} /> Push notifications active
          </div>
          <button
            onClick={disable}
            style={{ background: 'transparent', border: '1px solid #3A2620', color: '#C56B5A', borderRadius: 3, padding: '7px 14px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <BellOff size={12} /> Disable
          </button>
        </div>
      )}

      {(pushStatus === 'idle' || pushStatus === 'loading') && (
        <button
          onClick={enable}
          disabled={pushStatus === 'loading'}
          style={{
            background: pushStatus === 'loading' ? '#26221C' : '#D97757',
            color: pushStatus === 'loading' ? '#5C5648' : '#0A0908',
            border: 'none', borderRadius: 3, padding: '11px 20px',
            fontWeight: 600, fontSize: 13, cursor: pushStatus === 'loading' ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 7,
          }}
        >
          {pushStatus === 'loading'
            ? <><Loader size={14} /> Enabling…</>
            : <><Bell size={14} /> Enable push notifications</>}
        </button>
      )}
    </div>
  );
}

// ── Persistent push prompt modal ──────────────────────────────────────────────
//
// Shows a bottom-sheet modal whenever the PWA is opened and notifications are
// not yet enabled. Tracks dismissals in localStorage and re-prompts on an
// escalating schedule: immediately → 1 day → 3 days → 7 days (repeating).
// Stops prompting if permission is denied or user has enabled.

const PROMPT_KEY = 'push-prompt-v1';

function getPromptState() {
  try {
    return JSON.parse(localStorage.getItem(PROMPT_KEY) || '{}');
  } catch { return {}; }
}

function savePromptState(patch) {
  const next = { ...getPromptState(), ...patch };
  localStorage.setItem(PROMPT_KEY, JSON.stringify(next));
}

function shouldShowPrompt() {
  const { lastDismissed, dismissCount = 0 } = getPromptState();
  if (!lastDismissed) return true; // never dismissed
  const daysSince = (Date.now() - lastDismissed) / (1000 * 60 * 60 * 24);
  // escalating schedule: immediately → 2d → 5d → 10d (repeating)
  const waitDays = dismissCount === 1 ? 2 : dismissCount === 2 ? 5 : 10;
  return daysSince >= waitDays;
}

export function PushPromptBanner({ user, data, setData }) {
  const prefs = data.notificationPreferences ?? {
    dailyEnabled: true, weeklyEnabled: true, monthlyEnabled: true, preferredTime: '08:00',
  };

  // 'hidden' | 'visible' | 'loading' | 'done' | 'denied'
  const [status, setStatus] = useState('hidden');

  useEffect(() => {
    if (!VAPID_PUBLIC_KEY) return;

    const { isIOS, isStandalone, supportsPush } = detectEnv();

    // iOS running in Safari (not installed as PWA) — push not supported until installed
    if (isIOS && !isStandalone) return;

    // Browser doesn't support Web Push at all
    if (!supportsPush) return;

    // Already granted or denied — nothing to ask
    if (Notification.permission === 'denied') return;
    if (Notification.permission === 'granted') return;

    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) return; // already subscribed
        if (shouldShowPrompt()) setStatus('visible');
      })
    );
  }, []);

  const dismiss = () => {
    const { dismissCount = 0 } = getPromptState();
    savePromptState({ lastDismissed: Date.now(), dismissCount: dismissCount + 1 });
    setStatus('hidden');
  };

  const enable = async () => {
    setStatus('loading');
    try {
      const permission = await Promise.race([
        Notification.requestPermission(),
        new Promise((resolve) => setTimeout(() => resolve('timeout'), 6000)),
      ]);
      if (permission === 'denied' || permission === 'timeout') {
        savePromptState({ lastDismissed: Date.now(), dismissCount: 99 }); // stop prompting
        setStatus('denied');
        return;
      }
      if (permission !== 'granted') { dismiss(); return; }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      if (user) {
        const ok = await savePushSubscription(user.id, sub.toJSON(), prefs);
        if (!ok) throw new Error('save failed');
      }
      savePromptState({ lastDismissed: null, dismissCount: 0 }); // clear on success
      setStatus('done');
    } catch (err) {
      console.error('[PushPromptBanner] enable:', err);
      dismiss();
    }
  };

  if (status === 'hidden') return null;

  // Success flash — auto-hides after 3s
  if (status === 'done') {
    setTimeout(() => setStatus('hidden'), 3000);
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{
          background: '#0F1A0E', border: '1px solid #2A4A2A', borderRadius: '12px 12px 0 0',
          padding: '20px 24px', width: '100%', maxWidth: 480,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Check size={18} style={{ color: '#7FA068', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#7FA068' }}>Notifications enabled</div>
            <div style={{ fontSize: 12, color: '#5C8A5C', marginTop: 2 }}>You'll receive daily reminders and alerts.</div>
          </div>
        </div>
      </div>
    );
  }

  // Denied — brief message
  if (status === 'denied') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        display: 'flex', alignItems: 'flex-end',
        background: 'rgba(0,0,0,0.6)',
      }} onClick={() => setStatus('hidden')}>
        <div style={{
          background: '#160E0C', border: '1px solid #3A1E18',
          borderRadius: '16px 16px 0 0', padding: '24px', width: '100%', maxWidth: 480, margin: '0 auto',
        }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#C56B5A', marginBottom: 8 }}>Notifications blocked</div>
          <div style={{ fontSize: 13, color: '#8B8478', lineHeight: 1.6, marginBottom: 16 }}>
            To enable: go to <strong style={{ color: '#E8E2D5' }}>Settings → Notifications → Royal Ledger</strong> and allow notifications.
          </div>
          <button onClick={() => setStatus('hidden')} style={{
            width: '100%', padding: '13px', background: '#26221C', border: 'none',
            borderRadius: 8, color: '#8B8478', fontSize: 14, cursor: 'pointer',
          }}>Got it</button>
        </div>
      </div>
    );
  }

  // Main modal (visible | loading)
  const loading = status === 'loading';
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      display: 'flex', alignItems: 'flex-end',
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#14110E', borderRadius: '20px 20px 0 0',
        border: '1px solid #26221C', borderBottom: 'none',
        padding: '28px 24px', width: '100%', maxWidth: 480, margin: '0 auto',
        paddingBottom: 'max(28px, env(safe-area-inset-bottom))',
      }}>
        {/* Handle bar */}
        <div style={{ width: 36, height: 4, background: '#3A3530', borderRadius: 2, margin: '0 auto 24px' }} />

        {/* Icon */}
        <div style={{
          width: 60, height: 60, borderRadius: '50%', background: '#1E1A10',
          border: '1px solid #3A2A1E', display: 'flex', alignItems: 'center',
          justifyContent: 'center', marginBottom: 20,
        }}>
          <Bell size={26} style={{ color: '#D97757' }} />
        </div>

        {/* Copy */}
        <div style={{ fontSize: 22, fontWeight: 700, color: '#E8E2D5', marginBottom: 8, fontFamily: 'Fraunces, Georgia, serif' }}>
          Stay on top of your money
        </div>
        <div style={{ fontSize: 14, color: '#8B8478', lineHeight: 1.7, marginBottom: 24 }}>
          Royal Ledger will send you:
        </div>

        {/* Benefit list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          {[
            { emoji: '☀️', label: 'Daily morning check', desc: 'Buffer status and spending pace' },
            { emoji: '📊', label: 'Sunday pulse', desc: 'Monthly spend progress and envelope pacing' },
            { emoji: '🔔', label: 'Month-end nudge', desc: 'Sweep summary and review reminder' },
          ].map(({ emoji, label, desc }) => (
            <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1.4 }}>{emoji}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#E8E2D5' }}>{label}</div>
                <div style={{ fontSize: 12, color: '#5C5648', marginTop: 1 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={enable}
          disabled={loading}
          style={{
            width: '100%', padding: '15px', marginBottom: 12,
            background: loading ? '#3A2A1E' : '#D97757',
            color: loading ? '#8B8478' : '#0A0908',
            border: 'none', borderRadius: 10, fontSize: 15,
            fontWeight: 700, cursor: loading ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 150ms',
          }}
        >
          {loading ? <><Loader size={16} /> Enabling…</> : <><Bell size={16} /> Enable Notifications</>}
        </button>

        <button
          onClick={dismiss}
          disabled={loading}
          style={{
            width: '100%', padding: '13px', background: 'none',
            border: '1px solid #26221C', borderRadius: 10,
            color: '#5C5648', fontSize: 14, cursor: loading ? 'default' : 'pointer',
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
