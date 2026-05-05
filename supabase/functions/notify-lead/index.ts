// supabase/functions/notify-lead/index.ts
//
// Triggered by a Supabase Database Webhook on INSERT to early_access_leads.
// Sends an email notification via Resend.
//
// Required secrets (set via: supabase secrets set KEY=value):
//   RESEND_API_KEY   — from resend.com
//   NOTIFY_EMAIL     — where to send alerts (e.g. hello@royalicon.net)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_URL = 'https://api.resend.com/emails';

serve(async (req: Request) => {
  try {
    // Supabase webhooks send the record as JSON in the body
    const body = await req.json();

    // Handle both direct payload and Supabase webhook envelope
    const record = body?.record ?? body;

    const name       = record?.name       ?? 'Unknown';
    const email      = record?.email      ?? 'unknown';
    const country    = record?.country    ?? '—';
    const incomeType = record?.income_type ?? '—';
    const interest   = record?.interest   ?? '—';
    const createdAt  = record?.created_at
      ? new Date(record.created_at).toLocaleString('en-GB', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' }) + ' UTC'
      : 'just now';

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const NOTIFY_EMAIL   = Deno.env.get('NOTIFY_EMAIL') ?? 'hello@royalicon.net';

    if (!RESEND_API_KEY) {
      console.error('[notify-lead] RESEND_API_KEY is not set.');
      return new Response('Missing RESEND_API_KEY', { status: 500 });
    }

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
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    'Royal-Icon Ledger <onboarding@resend.dev>',
        to:      [NOTIFY_EMAIL],
        subject: `New lead: ${name} (${incomeType})`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[notify-lead] Resend error:', err);
      return new Response('Resend failed', { status: 500 });
    }

    console.log(`[notify-lead] Notified for lead: ${email}`);
    return new Response('OK', { status: 200 });

  } catch (err) {
    console.error('[notify-lead] Unexpected error:', err);
    return new Response('Internal error', { status: 500 });
  }
});
