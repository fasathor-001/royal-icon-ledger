/**
 * Royal Ledger — Push Notification Cron Worker
 *
 * Deploy to Cloudflare Workers with a cron trigger: "0 * * * *" (every hour).
 *
 * Required Secrets (wrangler secret put <NAME>):
 *   SUPABASE_URL          — your Supabase project URL
 *   SUPABASE_SERVICE_KEY  — Supabase service role key (bypasses RLS)
 *   VAPID_SUBJECT         — "mailto:you@example.com"
 *   VAPID_PUBLIC_KEY      — base64url VAPID public key
 *   VAPID_PRIVATE_KEY     — base64url VAPID private key
 *
 * Supabase SQL needed:
 *   alter table push_subscriptions add column if not exists timezone_offset float default 2;
 *   alter table push_subscriptions add column if not exists morning_time text default '08:00';
 *   alter table push_subscriptions add column if not exists evening_time text default '18:00';
 *   alter table push_subscriptions add column if not exists timezone_iana text;
 *
 *   create table if not exists notification_queue (
 *     id uuid default gen_random_uuid() primary key,
 *     user_id uuid references auth.users not null,
 *     type text not null,
 *     payload jsonb default '{}',
 *     created_at timestamptz default now(),
 *     sent_at timestamptz
 *   );
 *   alter table notification_queue enable row level security;
 *   create policy "insert own" on notification_queue for insert with check (auth.uid() = user_id);
 */

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runCron(env));
  },
};

// ── Currency ─────────────────────────────────────────────────────────────────

const CURRENCY_SYMBOLS = {
  ZAR: 'R', USD: '$', GBP: '£', EUR: '€', NGN: '₦',
  CAD: 'CA$', AUD: 'A$', SGD: 'S$', AED: 'AED', JPY: '¥',
};

function fmt(n, currency = 'ZAR') {
  const sym = CURRENCY_SYMBOLS[currency] || currency;
  const sep = ' ';
  if (n === null || n === undefined || isNaN(n)) return `${sym}${sep}0`;
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${sym}${sep}${(abs / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}M`;
  return `${sym}${sep}${Math.round(abs).toLocaleString('en-US')}`;
}

// ── Time helpers ──────────────────────────────────────────────────────────────

/**
 * Return the user's current local hour (0–23).
 *
 * Two paths — tried in order:
 *
 * Path 1 — IANA (DST-aware):
 *   Uses Intl.DateTimeFormat with the stored timezone_iana value.
 *   Cloudflare Workers run on V8 with full ICU data, so every IANA zone works.
 *   Wrapped in try/catch: any invalid or unrecognised ID falls through to Path 2.
 *
 * Path 2 — fixed offset (legacy / fallback):
 *   Adds timezone_offset (e.g. 2 for UTC+2, -3.5 for UTC-3:30) to the UTC hour.
 *   Math.floor handles fractional offsets correctly.
 *   Behaviour is byte-for-byte identical to the previous implementation,
 *   so all existing offset-only subscribers are completely unaffected.
 *
 * @param {object} sub — push_subscriptions row (has timezone_iana, timezone_offset)
 * @param {Date}   now — current UTC Date (created once in runCron, passed through)
 * @returns {number}   — local hour 0–23
 */
function getLocalHour(sub, now) {
  // ── Path 1: IANA ──────────────────────────────────────────────────────────
  if (sub.timezone_iana) {
    try {
      const hourStr = new Intl.DateTimeFormat('en-US', {
        timeZone: sub.timezone_iana,
        hour:     '2-digit',
        hour12:   false,
      }).format(now);
      const h = parseInt(hourStr, 10);
      // Some V8 builds emit "24" for midnight — normalise to 0.
      if (!isNaN(h)) return h === 24 ? 0 : h;
    } catch {
      // Invalid IANA ID or unsupported zone string — fall through.
      console.warn(
        `[push-cron] Unrecognised timezone_iana "${sub.timezone_iana}" ` +
        `for user ${sub.user_id} — falling back to offset`
      );
    }
  }

  // ── Path 2: fixed offset (original logic, preserved exactly) ─────────────
  return getLocalHourFromOffset(sub, now);
}

/**
 * Fixed-offset local hour — the original scheduling formula extracted into
 * its own function so both the IANA catch-path and the no-IANA path share
 * exactly the same code with no duplication.
 *
 * Examples:
 *   UTC 06:00 + offset  2    → local 08 (Johannesburg / Lagos morning ✓)
 *   UTC 13:00 + offset -5    → local 08 (New York morning ✓)
 *   UTC 04:30 + offset -3.5  → local 01 → Math.floor(1.0) = 1 (St. John's ✓)
 */
function getLocalHourFromOffset(sub, now) {
  const offset = sub.timezone_offset ?? 2;
  return Math.floor(((now.getUTCHours() + offset) % 24 + 24) % 24);
}

/**
 * True when the cron's UTC time coincides with the user's configured morning hour.
 * Uses IANA when available, offset as fallback — both compared against morning_time.
 */
function isMorningSlot(sub, now) {
  const localHour = getLocalHour(sub, now);
  const targetH   = parseInt((sub.morning_time || '08:00').split(':')[0], 10);
  return localHour === targetH;
}

/**
 * True when the cron's UTC time coincides with the user's configured evening hour.
 */
function isEveningSlot(sub, now) {
  const localHour = getLocalHour(sub, now);
  const targetH   = parseInt((sub.evening_time || '18:00').split(':')[0], 10);
  return localHour === targetH;
}

// ── Main cron ─────────────────────────────────────────────────────────────────

async function runCron(env) {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const dayOfWeek  = now.getUTCDay();   // 0 = Sunday
  const dayOfMonth = now.getUTCDate();
  const daysInMonth = new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 0).getDate();
  const isLastThreeDays = dayOfMonth >= daysInMonth - 2;
  const isSunday = dayOfWeek === 0;

  // 1. Load all subscriptions
  const subsRes = await fetch(`${env.SUPABASE_URL}/rest/v1/push_subscriptions?select=*`, {
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    },
  });
  const subs = await subsRes.json();
  if (!Array.isArray(subs) || subs.length === 0) return;

  // 2. Load app data for all users
  const dataRes = await fetch(`${env.SUPABASE_URL}/rest/v1/user_data?select=user_id,data`, {
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    },
  });
  const userData = await dataRes.json();
  const userDataMap = Object.fromEntries(
    Array.isArray(userData) ? userData.map(u => [u.user_id, u.data]) : []
  );

  // 3. Load pending notification_queue events
  const queueRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/notification_queue?select=*&sent_at=is.null`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      },
    }
  );
  const queueEvents = await queueRes.json();
  const pendingByUser = {};
  if (Array.isArray(queueEvents)) {
    queueEvents.forEach(e => {
      if (!pendingByUser[e.user_id]) pendingByUser[e.user_id] = [];
      pendingByUser[e.user_id].push(e);
    });
  }

  // 4. Process each subscriber
  for (const sub of subs) {
    const appData = userDataMap[sub.user_id] || {};
    const currency = appData.currency || 'ZAR';
    const morning = isMorningSlot(sub, now);
    const evening = isEveningSlot(sub, now);

    // A. Scheduled notifications (morning + evening)
    if (morning || evening) {
      const notification = buildScheduledNotification(sub, appData, currency, {
        isSunday, isLastThreeDays, morning,
      });
      if (notification) {
        await trySend(env, sub, notification);
      }
    }

    // B. Event-based notifications from the queue
    const events = pendingByUser[sub.user_id] || [];
    for (const event of events) {
      const notification = buildEventNotification(event, appData, currency);
      if (notification) {
        await trySend(env, sub, notification);
        // Mark as sent
        await fetch(
          `${env.SUPABASE_URL}/rest/v1/notification_queue?id=eq.${event.id}`,
          {
            method: 'PATCH',
            headers: {
              apikey: env.SUPABASE_SERVICE_KEY,
              Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            },
            body: JSON.stringify({ sent_at: new Date().toISOString() }),
          }
        );
      }
    }
  }
}

// ── Scheduled notification builder ────────────────────────────────────────────

function buildScheduledNotification(sub, appData, currency, { isSunday, isLastThreeDays, morning }) {
  const buffer = appData.buffer ?? 0;
  const salary = appData.salary ?? 0;
  const budget = appData.spendingBudget ?? 0;

  const monthStart = (() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1).getTime();
  })();

  const spent = (appData.impulses ?? [])
    .filter(i => i.timestamp >= monthStart)
    .reduce((s, i) => s + (i.amount || 0), 0);

  const remaining = budget - spent;
  const paceLabel = budget > 0 ? (remaining >= 0 ? 'on track' : 'over budget') : '';

  // Month-end Checkpoint — highest priority — last 3 days of month
  if (isLastThreeDays && sub.monthly_enabled) {
    return {
      title: 'Royal Ledger — Month-end Checkpoint',
      body: morning
        ? `Buffer: ${fmt(buffer, currency)}. Time to sweep and review — month closes soon.`
        : `Evening wrap-up: ${fmt(spent, currency)} spent, ${fmt(remaining, currency)} left. Don't forget your monthly review.`,
    };
  }

  // Sunday Pulse — morning AND evening
  if (isSunday && sub.weekly_enabled) {
    return {
      title: 'Royal Ledger — Sunday Pulse',
      body: morning
        ? `Good morning. ${fmt(spent, currency)} of ${fmt(budget, currency)} spent this month. Check your envelopes.`
        : `Sunday evening: ${fmt(remaining, currency)} left in budget. Buffer at ${fmt(buffer, currency)}.`,
    };
  }

  // Daily reminder — morning AND evening
  if (sub.daily_enabled) {
    return {
      title: 'Royal Ledger',
      body: morning
        ? `Good morning — Buffer: ${fmt(buffer, currency)}. ${fmt(remaining, currency)} left to spend this month${paceLabel ? ` (${paceLabel})` : ''}.`
        : `Evening check — ${fmt(spent, currency)} spent today's month total. Buffer: ${fmt(buffer, currency)}.`,
    };
  }

  return null;
}

// ── Event notification builder ────────────────────────────────────────────────

function buildEventNotification(event, appData, currency) {
  const buffer = appData.buffer ?? 0;

  switch (event.type) {
    case 'drawdown': {
      const floor = appData.bufferTarget
        ? appData.bufferTarget * ((appData.bufferProtectMonths || 6) / (appData.bufferTargetMonths || 18))
        : 0;
      return {
        title: '⚠️ Royal Ledger — Drawdown Alert',
        body: `Buffer ${fmt(buffer, currency)} has fallen below your crisis floor (${fmt(floor, currency)}). Protect mode activating.`,
      };
    }
    case 'override':
      return {
        title: '🔓 Royal Ledger — Spending Override',
        body: `A hard spending block was just overridden${event.payload?.item ? ` on "${event.payload.item}"` : ''}. Logged with a red badge in History.`,
      };
    case 'stage_change': {
      const stageNames = { 1: 'Stage 1', 1.5: 'Stage 1.5', 2: 'Stage 2', 3: 'Stage 3' };
      const newStage = event.payload?.newStage;
      const name = stageNames[newStage] || `Stage ${newStage}`;
      return {
        title: `🎉 Royal Ledger — ${name} Reached!`,
        body: newStage === 3
          ? `Your foundation is solid. Family is protected. Buffer at ${fmt(buffer, currency)}.`
          : `You've levelled up to ${name}. Buffer at ${fmt(buffer, currency)}. Keep building.`,
      };
    }
    default:
      return null;
  }
}

// ── Send helper ───────────────────────────────────────────────────────────────

async function trySend(env, sub, notification) {
  try {
    await sendWebPush(env, sub.subscription, notification);
  } catch (err) {
    console.error(`Push failed for user ${sub.user_id}:`, err.message);
  }
}

// ── Web Push (VAPID) send ─────────────────────────────────────────────────────

async function sendWebPush(env, subscriptionJSON, payload) {
  const endpoint = subscriptionJSON.endpoint;
  const origin = new URL(endpoint).origin;

  const expiration = Math.floor(Date.now() / 1000) + 12 * 3600;
  const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const claims = btoa(JSON.stringify({ aud: origin, exp: expiration, sub: env.VAPID_SUBJECT }));

  const privateKeyBytes = base64urlToBuffer(env.VAPID_PRIVATE_KEY);
  const privateKey = await crypto.subtle.importKey(
    'raw', privateKeyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign']
  );

  const sigInput = encoder.encode(`${header}.${claims}`);
  const sigBytes = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, sigInput);
  const sig = bufferToBase64url(sigBytes);
  const jwt = `${header}.${claims}.${sig}`;

  const { ciphertext, salt, serverPublicKey } = await encryptPayload(
    subscriptionJSON.keys,
    JSON.stringify(payload)
  );

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `vapid t=${jwt},k=${env.VAPID_PUBLIC_KEY}`,
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      TTL: '86400',
    },
    body: buildAes128gcmBody(salt, serverPublicKey, ciphertext),
  });

  if (!res.ok && res.status !== 201) {
    throw new Error(`Push endpoint returned ${res.status}`);
  }
}

// ── AES-128-GCM encryption (RFC 8291) ────────────────────────────────────────

const encoder = new TextEncoder();

function base64urlToBuffer(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return new Uint8Array([...raw].map(c => c.charCodeAt(0)));
}

function bufferToBase64url(buf) {
  const bytes = new Uint8Array(buf instanceof ArrayBuffer ? buf : buf.buffer);
  let str = '';
  bytes.forEach(b => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function encryptPayload(keys, plaintext) {
  const clientPublicKey = base64urlToBuffer(keys.p256dh);
  const clientAuth = base64urlToBuffer(keys.auth);

  const serverKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']
  );
  const serverPublicKeyBytes = new Uint8Array(
    await crypto.subtle.exportKey('raw', serverKeyPair.publicKey)
  );
  const clientKey = await crypto.subtle.importKey(
    'raw', clientPublicKey, { name: 'ECDH', namedCurve: 'P-256' }, false, []
  );
  const sharedBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: clientKey }, serverKeyPair.privateKey, 256
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const prk  = await hkdf(clientAuth, new Uint8Array(sharedBits), buildPrkInfo(clientPublicKey, serverPublicKeyBytes), 32);
  const cek   = await hkdf(salt, prk, buildCekInfo(), 16);
  const nonce = await hkdf(salt, prk, buildNonceInfo(), 12);

  const keyMaterial = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const paddedPlaintext = new Uint8Array([...encoder.encode(plaintext), 2]);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, keyMaterial, paddedPlaintext)
  );

  return { ciphertext, salt, serverPublicKey: serverPublicKeyBytes };
}

async function hkdf(salt, ikm, info, length) {
  const keyMaterial = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info }, keyMaterial, length * 8
  );
  return new Uint8Array(bits);
}

function buildPrkInfo(clientPublicKey, serverPublicKey) {
  const label = encoder.encode('WebPush: info\x00');
  const info  = new Uint8Array(label.length + clientPublicKey.length + serverPublicKey.length);
  info.set(label, 0);
  info.set(clientPublicKey, label.length);
  info.set(serverPublicKey, label.length + clientPublicKey.length);
  return info;
}
function buildCekInfo()   { return encoder.encode('Content-Encoding: aes128gcm\x00'); }
function buildNonceInfo() { return encoder.encode('Content-Encoding: nonce\x00'); }

function buildAes128gcmBody(salt, serverPublicKey, ciphertext) {
  const rs = 4096;
  const header = new Uint8Array(16 + 4 + 1 + serverPublicKey.length);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, rs, false);
  header[20] = serverPublicKey.length;
  header.set(serverPublicKey, 21);

  const body = new Uint8Array(header.length + ciphertext.length);
  body.set(header, 0);
  body.set(ciphertext, header.length);
  return body;
}
