// src/marketing/pages/EarlyAccess.jsx
//
// Early access lead capture form — wired to Supabase.
//
// ──────────────────────────────────────────────────────────────────
// REQUIRED SQL (run once in your Supabase SQL editor):
//
// CREATE TABLE early_access_leads (
//   id             uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
//   created_at     timestamptz   DEFAULT now() NOT NULL,
//   name           text          NOT NULL,
//   email          text          NOT NULL UNIQUE,
//   country        text,
//   income_type    text          CHECK (income_type IN (
//                                  'fixed','variable','trader','freelancer','family','other'
//                                )),
//   interest       text,
//   status         text          DEFAULT 'pending' CHECK (status IN ('pending','invited','rejected'))
// );
//
// ALTER TABLE early_access_leads ENABLE ROW LEVEL SECURITY;
//
// -- Allow public INSERT (no auth required for signups)
// CREATE POLICY "public_can_submit_early_access"
//   ON early_access_leads FOR INSERT
//   TO anon, authenticated
//   WITH CHECK (true);
//
// -- No SELECT/UPDATE/DELETE policy for anon users intentionally.
// -- Admin access via Supabase dashboard or service-role key only.
// ──────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

const INCOME_TYPES = [
  { id: 'variable',    label: 'Variable income',          sub: 'Income that changes month to month' },
  { id: 'trader',      label: 'Trader / Investor',        sub: 'Trading or investment income' },
  { id: 'freelancer',  label: 'Freelancer / Contractor',  sub: 'Project or retainer-based income' },
  { id: 'fixed',       label: 'Fixed salary',             sub: 'Stable monthly income, side income, or managing a household' },
  { id: 'family',      label: 'Family / Household',       sub: 'Managing shared finances or as sole earner' },
  { id: 'other',       label: 'Business owner / Other',   sub: 'Self-employed, mixed income types' },
];

function RadioOpt({ option, selected, onSelect }) {
  return (
    <div
      className={`m-radio-opt${selected ? ' sel' : ''}`}
      onClick={() => onSelect(option.id)}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect(option.id)}
    >
      <div className="m-radio-circle" />
      <div>
        <div style={{ fontSize: '14px', color: '#E8E2D5', fontWeight: selected ? 500 : 400 }}>{option.label}</div>
        <div style={{ fontSize: '12px', color: '#5C5648', marginTop: '2px' }}>{option.sub}</div>
      </div>
    </div>
  );
}

export default function EarlyAccess({ navigate }) {
  const [form, setForm] = useState({ name: '', email: '', country: '', incomeType: '', interest: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())      e.name       = 'Please enter your name.';
    if (!form.email.trim())     e.email      = 'Please enter your email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email address.';
    if (!form.incomeType)       e.incomeType = 'Please select your income profile.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setSubmitError(null);

    // ─── Supabase insert ──────────────────────────────────────────
    if (supabase) {
      const payload = {
        name:        form.name.trim(),
        email:       form.email.trim().toLowerCase(),
        country:     form.country.trim() || null,
        income_type: form.incomeType,
        interest:    form.interest.trim() || null,
      };

      const { error } = await supabase.from('early_access_leads').insert(payload);

      if (error) {
        // Always log the real error so it's visible in the browser console
        console.error('[EarlyAccess] Supabase insert error:', error.code, error.message, error);

        // Duplicate email — treat as success so we don't leak who's already signed up
        if (error.code === '23505') {
          setSubmitting(false);
          setSubmitted(true);
          return;
        }

        // Table does not exist — schema hasn't been applied yet
        if (error.code === '42P01') {
          setSubmitError('Service setup in progress. Please email us directly at hello@royalledger.app to join the early access list.');
          setSubmitting(false);
          return;
        }

        // RLS policy blocking insert
        if (error.code === '42501' || error.message?.toLowerCase().includes('row-level security')) {
          setSubmitError('Submission temporarily unavailable. Please email hello@royalledger.app to join early access.');
          setSubmitting(false);
          return;
        }

        setSubmitError('Something went wrong. Please try again or email us at hello@royalledger.app.');
        setSubmitting(false);
        return;
      }

      // ── Fire admin notification (best-effort — don't block on it) ──
      // Calls the notify-lead Edge Function directly so Telegram/email
      // alerts fire immediately without needing a Database Webhook.
      supabase.functions
        .invoke('notify-lead', {
          body: { record: { ...payload, created_at: new Date().toISOString() } },
        })
        .then(({ error: fnErr, data }) => {
          if (fnErr) {
            console.warn('[EarlyAccess] notify-lead invocation error:', fnErr.message);
          } else {
            console.log('[EarlyAccess] notify-lead results:', data);
            if (data?.results) {
              data.results.forEach(r => {
                if (!r.ok) console.warn(`[EarlyAccess] notify-lead ${r.service} failed:`, r.error);
              });
            }
          }
        })
        .catch(err => console.warn('[EarlyAccess] notify-lead (network):', err));

    } else {
      // Supabase not configured — local dev fallback
      await new Promise(r => setTimeout(r, 600));
    }
    // ─────────────────────────────────────────────────────────────

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div>
        <div className="m-nav-spacer" />
        <section style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: '520px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#0F1A0E', border: '1px solid #1E3018', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 28px' }}>
              ✓
            </div>
            <h1 className="m-display" style={{ fontSize: 'clamp(32px, 5vw, 52px)', color: '#E8E2D5', marginBottom: '20px' }}>
              Application received.
            </h1>
            <p style={{ fontSize: '16px', color: '#8B8478', lineHeight: 1.75, marginBottom: '8px' }}>
              Thank you, {form.name.split(' ')[0]}.
            </p>
            <p style={{ fontSize: '16px', color: '#8B8478', lineHeight: 1.75, marginBottom: '36px' }}>
              We'll contact you at <strong style={{ color: '#E8E2D5' }}>{form.email}</strong> when your invite is ready.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button className="m-btn m-btn-primary" onClick={() => navigate('/')}>Back to home</button>
              <button className="m-btn m-btn-outline" onClick={() => navigate('/product')}>Explore the product →</button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <div className="m-nav-spacer" />

      {/* Header */}
      <section className="m-section-sm" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-sm">
          <div className="m-label" style={{ marginBottom: '16px' }}>Early Access</div>
          <h1 className="m-display" style={{ fontSize: 'clamp(36px, 5vw, 60px)', color: '#E8E2D5', marginBottom: '20px' }}>
            Get{' '}
            <em style={{ color: '#D97757', fontStyle: 'italic' }}>early access</em>.
          </h1>
          <p className="m-body" style={{ fontSize: '16px', marginBottom: '12px' }}>
            Built for people who don't earn the same every month.
          </p>
          <p style={{ fontSize: '13px', color: '#D97757', fontWeight: 500, marginBottom: '8px' }}>
            Limited early rollout.
          </p>
          <p style={{ fontSize: '13px', color: '#3A3028' }}>
            No spam. No noise. We'll only reach out when access opens.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="m-section">
        <div className="m-wrap-xs">
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Name */}
              <div>
                <label className="m-field-label" htmlFor="ea-name">Your name</label>
                <input
                  id="ea-name"
                  type="text"
                  className="m-input"
                  placeholder="Full name"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  autoComplete="name"
                />
                {errors.name && <div style={{ fontSize: '12px', color: '#C56B5A', marginTop: '6px' }}>{errors.name}</div>}
              </div>

              {/* Email */}
              <div>
                <label className="m-field-label" htmlFor="ea-email">Email address</label>
                <input
                  id="ea-email"
                  type="email"
                  className="m-input"
                  placeholder="you@domain.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  autoComplete="email"
                />
                {errors.email && <div style={{ fontSize: '12px', color: '#C56B5A', marginTop: '6px' }}>{errors.email}</div>}
              </div>

              {/* Country */}
              <div>
                <label className="m-field-label" htmlFor="ea-country">Country <span style={{ color: '#3A3028' }}>(optional)</span></label>
                <input
                  id="ea-country"
                  type="text"
                  className="m-input"
                  placeholder="South Africa, Nigeria, UAE, UK…"
                  value={form.country}
                  onChange={e => set('country', e.target.value)}
                  autoComplete="country-name"
                />
              </div>

              {/* Income type */}
              <div>
                <label className="m-field-label">Income profile</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {INCOME_TYPES.map(opt => (
                    <RadioOpt
                      key={opt.id}
                      option={opt}
                      selected={form.incomeType === opt.id}
                      onSelect={val => set('incomeType', val)}
                    />
                  ))}
                </div>
                {errors.incomeType && <div style={{ fontSize: '12px', color: '#C56B5A', marginTop: '8px' }}>{errors.incomeType}</div>}
              </div>

              {/* Why interested */}
              <div>
                <label className="m-field-label" htmlFor="ea-interest">Why are you interested? <span style={{ color: '#3A3028' }}>(optional)</span></label>
                <textarea
                  id="ea-interest"
                  className="m-input m-textarea"
                  placeholder="Tell us briefly about your financial situation and what you're hoping Royal Ledger can help with…"
                  value={form.interest}
                  onChange={e => set('interest', e.target.value)}
                />
              </div>

              {/* Submit */}
              <div style={{ paddingTop: '8px' }}>
                {submitError && (
                  <div style={{ background: '#1A0E0A', border: '1px solid #4A2018', borderRadius: '4px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#C56B5A', lineHeight: 1.6 }}>
                    {submitError}
                  </div>
                )}
                <button
                  type="submit"
                  className="m-btn m-btn-primary m-btn-lg"
                  style={{ width: '100%', justifyContent: 'center', opacity: submitting ? 0.7 : 1 }}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting…' : 'Submit Application'}
                </button>
                <p style={{ fontSize: '14px', color: '#5C5648', marginTop: '20px', textAlign: 'center', fontWeight: 500 }}>
                  No subscriptions. No noise. Just control.
                </p>
                <p style={{ fontSize: '12px', color: '#3A3028', marginTop: '8px', textAlign: 'center', lineHeight: 1.6 }}>
                  No credit card required. We'll contact you when your invite is ready.
                  <br />
                  We do not sell or share your information.
                </p>
              </div>

            </div>
          </form>

          {/* Pricing signal */}
          <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid #1A1610' }}>
            <div className="m-label" style={{ marginBottom: '16px' }}>What does it cost?</div>
            <div className="ea-pricing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div style={{ background: '#14110E', border: '1px solid #26221C', borderRadius: '4px', padding: '16px 18px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#5C5648', textTransform: 'uppercase', marginBottom: '8px' }}>Core — Free</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#E8E2D5', marginBottom: '6px' }}>Always free</div>
                <div style={{ fontSize: '12px', color: '#3A3028', lineHeight: 1.6 }}>Local device. All core modules. Offline-first. No sync.</div>
              </div>
              <div style={{ background: '#1A1008', border: '1px solid #3A2010', borderRadius: '4px', padding: '16px 18px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#D97757', textTransform: 'uppercase', marginBottom: '8px' }}>Pro — Coming soon</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#E8E2D5', marginBottom: '6px' }}>Subscription</div>
                <div style={{ fontSize: '12px', color: '#5C5648', lineHeight: 1.6 }}>Cloud sync, multi-device, push notifications. Pricing set during beta.</div>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#3A3028', lineHeight: 1.6 }}>
              Beta access is free. No payment required at any stage of the early access programme.
            </p>
          </div>

          {/* Sidebar info */}
          <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid #1A1610' }}>
            <div className="m-label" style={{ marginBottom: '20px' }}>What to expect</div>
            {[
              { icon: '📬', text: 'We review every application personally.' },
              { icon: '⏱', text: 'Response time: within 1–2 weeks of submission.' },
              { icon: '🔑', text: 'Selected applicants receive an invite code via email.' },
              { icon: '💼', text: 'Investor inquiries are handled separately — please mention it in your note.' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 0', borderBottom: '1px solid #1A1610' }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: '13px', color: '#5C5648', lineHeight: 1.6 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 480px) {
          .ea-pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
