// supabase/functions/notify-lead/index.ts
//
// Handles two notification types:
//   type: 'lead'            — new early-access application from the marketing site
//   type: 'access_request'  — in-app "Request access" form submission
//
// Can be triggered two ways:
//   1. Called directly from the client (EarlyAccess.jsx / dataLayer.submitAccessRequest)
//   2. Supabase Database Webhook on INSERT to early_access_leads (optional belt-and-suspenders)
//
// Required secrets (set via: supabase secrets set KEY=value):
//   TELEGRAM_BOT_TOKEN  — from @BotFather on Telegram
//   TELEGRAM_CHAT_ID    — your personal chat ID (use @userinfobot to find it)
//   RESEND_API_KEY      — from resend.com (optional — email skipped if missing)
//   NOTIFY_EMAIL        — where to send email alerts (optional)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_URL   = 'https://api.resend.com/emails';
const TELEGRAM_URL = (token: string) =>
  `https://api.telegram.org/bot${token}/sendMessage`;

// ── Telegram ──────────────────────────────────────────────────────────────────
async function sendTelegram(token: string, chatId: string, text: string): Promise<void> {
  const res = await fetch(TELEGRAM_URL(token), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('[notify-lead] Telegram error:', err);
    throw new Error(`Telegram API error: ${err}`);
  }
  console.log('[notify-lead] Telegram notification sent.');
}

// ── Resend email ──────────────────────────────────────────────────────────────
async function sendEmail(
  apiKey: string,
  toEmail: string,
  subject: string,
  html: string,
): Promise<void> {
  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      from:    'Royal Ledger <hello@royalledger.app>',
      to:      [toEmail],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('[notify-lead] Resend error:', err);
    throw new Error(`Resend error: ${err}`);
  }
  console.log(`[notify-lead] Email sent to ${toEmail}`);
}

// ── Main handler ──────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const body   = await req.json();
    const record = body?.record ?? body;

    // Detect request type
    const isAccessRequest = record?.type === 'access_request';

    const email      = record?.email       ?? 'unknown';
    const name       = record?.name        ?? (isAccessRequest ? null : 'Unknown');
    const country    = record?.country     ?? '—';
    const incomeType = record?.income_type ?? '—';
    const message    = record?.message     ?? record?.interest ?? null;
    const createdAt  = record?.created_at
      ? new Date(record.created_at).toLocaleString('en-GB', {
          timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short',
        }) + ' UTC'
      : 'just now';

    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID   = Deno.env.get('TELEGRAM_CHAT_ID');
    const RESEND_API_KEY     = Deno.env.get('RESEND_API_KEY');
    const NOTIFY_EMAIL       = Deno.env.get('NOTIFY_EMAIL');

    const results: { service: string; ok: boolean; error?: string }[] = [];

    // ── Telegram ─────────────────────────────────────────────────────────────
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      let telegramMsg: string;

      if (isAccessRequest) {
        telegramMsg = [
          `🔑 <b>New Access Request</b>`,
          ``,
          `📧 ${email}`,
          `🕐 ${createdAt}`,
          message ? `\n💬 <i>${message}</i>` : '',
        ].filter(Boolean).join('\n');
      } else {
        telegramMsg = [
          `🟠 <b>New Early Access Lead</b>`,
          ``,
          name ? `👤 <b>${name}</b>` : '',
          `📧 ${email}`,
          country !== '—' ? `🌍 ${country}` : '',
          incomeType !== '—' ? `💼 ${incomeType}` : '',
          `🕐 ${createdAt}`,
          message && message !== '—' ? `\n💬 <i>${message}</i>` : '',
        ].filter(Boolean).join('\n');
      }

      try {
        await sendTelegram(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, telegramMsg);
        results.push({ service: 'telegram', ok: true });
      } catch (err) {
        results.push({ service: 'telegram', ok: false, error: String(err) });
      }
    } else {
      console.warn('[notify-lead] Telegram secrets not set — skipping. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID via: supabase secrets set');
      results.push({ service: 'telegram', ok: false, error: 'secrets_not_set' });
    }

    // ── Resend email ─────────────────────────────────────────────────────────
    if (RESEND_API_KEY && NOTIFY_EMAIL) {
      const subject = isAccessRequest
        ? `Access request: ${email}`
        : `New lead: ${name || email} (${incomeType})`;

      const html = isAccessRequest ? `
        <div style="font-family:Inter,sans-serif;background:#0A0908;color:#E8E2D5;padding:32px;border-radius:6px;max-width:540px;">
          <div style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#5C5648;margin-bottom:8px;">Royal Ledger</div>
          <h1 style="font-size:22px;font-weight:400;margin:0 0 24px;color:#E8E2D5;">New access request</h1>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:8px 0;color:#5C5648;width:130px;">Email</td><td><a href="mailto:${email}" style="color:#D97757;text-decoration:none;">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#5C5648;">Submitted</td><td style="color:#8B8478;font-size:12px;">${createdAt}</td></tr>
          </table>
          ${message ? `
          <div style="margin-top:20px;padding:16px;background:#14110E;border:1px solid #26221C;border-radius:4px;">
            <div style="font-size:11px;color:#5C5648;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Note</div>
            <p style="font-size:14px;color:#8B8478;line-height:1.6;margin:0;">${message}</p>
          </div>` : ''}
        </div>
      ` : `
        <div style="font-family:Inter,sans-serif;background:#0A0908;color:#E8E2D5;padding:32px;border-radius:6px;max-width:540px;">
          <div style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#5C5648;margin-bottom:8px;">Royal Ledger</div>
          <h1 style="font-size:22px;font-weight:400;margin:0 0 24px;color:#E8E2D5;">New early access application</h1>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            ${name ? `<tr><td style="padding:8px 0;color:#5C5648;width:130px;">Name</td><td style="color:#E8E2D5;font-weight:500;">${name}</td></tr>` : ''}
            <tr><td style="padding:8px 0;color:#5C5648;">Email</td><td><a href="mailto:${email}" style="color:#D97757;text-decoration:none;">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#5C5648;">Country</td><td style="color:#E8E2D5;">${country}</td></tr>
            <tr><td style="padding:8px 0;color:#5C5648;">Income type</td><td style="color:#E8E2D5;">${incomeType}</td></tr>
            <tr><td style="padding:8px 0;color:#5C5648;">Submitted</td><td style="color:#8B8478;font-size:12px;">${createdAt}</td></tr>
          </table>
          ${message && message !== '—' ? `
          <div style="margin-top:20px;padding:16px;background:#14110E;border:1px solid #26221C;border-radius:4px;">
            <div style="font-size:11px;color:#5C5648;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Why they're interested</div>
            <p style="font-size:14px;color:#8B8478;line-height:1.6;margin:0;">${message}</p>
          </div>` : ''}
        </div>
      `;

      try {
        await sendEmail(RESEND_API_KEY, NOTIFY_EMAIL, subject, html);
        results.push({ service: 'email', ok: true });
      } catch (err) {
        results.push({ service: 'email', ok: false, error: String(err) });
      }
    } else {
      console.warn('[notify-lead] Resend secrets not set — skipping email.');
      results.push({ service: 'email', ok: false, error: 'secrets_not_set' });
    }

    const allOk = results.every(r => r.ok);
    return new Response(
      JSON.stringify({ ok: allOk, results }),
      { status: allOk ? 200 : 207, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );

  } catch (err) {
    console.error('[notify-lead] Unexpected error:', err);
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});
