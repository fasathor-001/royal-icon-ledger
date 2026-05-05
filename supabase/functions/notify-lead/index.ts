// supabase/functions/notify-lead/index.ts
//
// Triggered by a Supabase Database Webhook on INSERT to early_access_leads.
// Sends a Telegram message AND an email via Resend.
//
// Required secrets (set via: supabase secrets set KEY=value):
//   TELEGRAM_BOT_TOKEN  — from @BotFather on Telegram
//   TELEGRAM_CHAT_ID    — your personal chat ID (see setup instructions)
//   RESEND_API_KEY      — from resend.com (optional — email skipped if missing)
//   NOTIFY_EMAIL        — where to send email alerts (optional)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_URL  = 'https://api.resend.com/emails';
const TELEGRAM_URL = (token: string) =>
  `https://api.telegram.org/bot${token}/sendMessage`;

// ── Telegram ──────────────────────────────────────────────────────────────────
async function sendTelegram(token: string, chatId: string, text: string): Promise<void> {
  const res = await fetch(TELEGRAM_URL(token), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id:    chatId,
      text,
      parse_mode: 'HTML',
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('[notify-lead] Telegram error:', err);
  } else {
    console.log('[notify-lead] Telegram notification sent.');
  }
}

// ── Resend email ──────────────────────────────────────────────────────────────
async function sendEmail(
  apiKey: string,
  toEmail: string,
  name: string,
  email: string,
  country: string,
  incomeType: string,
  interest: string,
  createdAt: string,
): Promise<void> {
  const html = `
    <div style="font-family:Inter,sans-serif;background:#0A0908;color:#E8E2D5;padding:32px;border-radius:6px;max-width:540px;">
      <div style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#5C5648;margin-bottom:8px;">Royal-Icon Ledger</div>
      <h1 style="font-size:22px;font-weight:400;margin:0 0 24px;color:#E8E2D5;">New early access application</h1>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#5C5648;width:130px;">Name</td><td style="color:#E8E2D5;font-weight:500;">${name}</td></tr>
        <tr><td style="padding:8px 0;color:#5C5648;">Email</td><td><a href="mailto:${email}" style="color:#D97757;text-decoration:none;">${email}</a></td></tr>
        <tr><td style="padding:8px 0;color:#5C5648;">Country</td><td style="color:#E8E2D5;">${country}</td></tr>
        <tr><td style="padding:8px 0;color:#5C5648;">Income type</td><td style="color:#E8E2D5;">${incomeType}</td></tr>
        <tr><td style="padding:8px 0;color:#5C5648;">Submitted</td><td style="color:#8B8478;font-size:12px;">${createdAt}</td></tr>
      </table>

      ${interest && interest !== '—' ? `
      <div style="margin-top:20px;padding:16px;background:#14110E;border:1px solid #26221C;border-radius:4px;">
        <div style="font-size:11px;color:#5C5648;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Why they're interested</div>
        <p style="font-size:14px;color:#8B8478;line-height:1.6;margin:0;">${interest}</p>
      </div>` : ''}

      <div style="margin-top:24px;padding-top:20px;border-top:1px solid #26221C;">
        <a href="https://supabase.com/dashboard/project/_/editor" style="font-size:12px;color:#5C5648;">View in Supabase →</a>
      </div>
    </div>
  `;

  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      from:    'Royal-Icon Ledger <onboarding@resend.dev>',
      to:      [toEmail],
      subject: `New lead: ${name} (${incomeType})`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[notify-lead] Resend error:', err);
  } else {
    console.log(`[notify-lead] Email sent to ${toEmail}`);
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  try {
    const body = await req.json();
    const record = body?.record ?? body;

    const name       = record?.name        ?? 'Unknown';
    const email      = record?.email       ?? 'unknown';
    const country    = record?.country     ?? '—';
    const incomeType = record?.income_type ?? '—';
    const interest   = record?.interest    ?? '—';
    const createdAt  = record?.created_at
      ? new Date(record.created_at).toLocaleString('en-GB', {
          timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short',
        }) + ' UTC'
      : 'just now';

    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID   = Deno.env.get('TELEGRAM_CHAT_ID');
    const RESEND_API_KEY     = Deno.env.get('RESEND_API_KEY');
    const NOTIFY_EMAIL       = Deno.env.get('NOTIFY_EMAIL');

    const tasks: Promise<void>[] = [];

    // ── Send Telegram notification ───────────────────────────────────────────
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const msg = [
        `🟠 <b>New Early Access Lead</b>`,
        ``,
        `👤 <b>${name}</b>`,
        `📧 ${email}`,
        `🌍 ${country}`,
        `💼 ${incomeType}`,
        `🕐 ${createdAt}`,
        interest && interest !== '—' ? `\n💬 <i>${interest}</i>` : '',
      ].filter(Boolean).join('\n');

      tasks.push(sendTelegram(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, msg));
    } else {
      console.warn('[notify-lead] Telegram secrets not set — skipping Telegram.');
    }

    // ── Send email via Resend (optional) ─────────────────────────────────────
    if (RESEND_API_KEY && NOTIFY_EMAIL) {
      tasks.push(sendEmail(RESEND_API_KEY, NOTIFY_EMAIL, name, email, country, incomeType, interest, createdAt));
    } else {
      console.warn('[notify-lead] Resend secrets not set — skipping email.');
    }

    await Promise.all(tasks);

    return new Response('OK', { status: 200 });

  } catch (err) {
    console.error('[notify-lead] Unexpected error:', err);
    return new Response('Internal error', { status: 500 });
  }
});
