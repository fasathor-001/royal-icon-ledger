// supabase/functions/send-invite/index.ts
//
// Sends a personalised invite email to an early-access lead via Resend.
//
// Required secret (already set for notify-lead — same key):
//   RESEND_API_KEY  — supabase secrets set RESEND_API_KEY=re_...

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Pre-flight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const { name, email, message, subject: customSubject } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'email is required' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } },
      );
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY secret not configured' }),
        { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
      );
    }

    const greeting = name ? `Hi ${name},` : 'Hi,';
    const body = message?.trim() || `${greeting}

You've been selected for early access to Royal Ledger.

Royal Ledger is a financial system designed for people with variable income — freelancers, traders, contractors, and anyone who doesn't earn the same every month.

You can now access the platform here:
https://royalledger.app

Let us know if you have any questions.

— Royal Ledger Team`;

    // Plain-text email
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    'Royal Ledger <hello@royalledger.app>',
        to:      [email],
        subject: customSubject || "You're invited to Royal Ledger",
        text:    body,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[send-invite] Resend error:', data);
      return new Response(
        JSON.stringify({ error: data?.message ?? 'Failed to send email', detail: data }),
        { status: res.status, headers: { ...CORS, 'Content-Type': 'application/json' } },
      );
    }

    console.log(`[send-invite] Email sent to ${email} — id: ${data.id}`);
    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );

  } catch (err) {
    console.error('[send-invite] Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});
