// src/marketing/pages/EarlyAccess.jsx
//
// Early access application — 3-step form wired to Supabase.
//
// ──────────────────────────────────────────────────────────────────
// REQUIRED SQL — run once in Supabase SQL editor:
//   See supabase/early-access-schema.sql
// ──────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

// ── Data ─────────────────────────────────────────────────────────────────────

const COUNTRIES = [
  { code: '',      name: 'Select your country…',         disabled: true },
  // ── Africa (primary market) ──
  { code: 'NG',    name: '🇳🇬  Nigeria' },
  { code: 'ZA',    name: '🇿🇦  South Africa' },
  { code: 'GH',    name: '🇬🇭  Ghana' },
  { code: 'KE',    name: '🇰🇪  Kenya' },
  { code: 'TZ',    name: '🇹🇿  Tanzania' },
  { code: 'UG',    name: '🇺🇬  Uganda' },
  { code: 'RW',    name: '🇷🇼  Rwanda' },
  { code: 'ET',    name: '🇪🇹  Ethiopia' },
  { code: 'ZW',    name: '🇿🇼  Zimbabwe' },
  { code: 'ZM',    name: '🇿🇲  Zambia' },
  { code: 'BW',    name: '🇧🇼  Botswana' },
  { code: 'NA',    name: '🇳🇦  Namibia' },
  { code: 'MW',    name: '🇲🇼  Malawi' },
  { code: 'MZ',    name: '🇲🇿  Mozambique' },
  { code: 'AO',    name: '🇦🇴  Angola' },
  { code: 'SN',    name: '🇸🇳  Senegal' },
  { code: 'CM',    name: '🇨🇲  Cameroon' },
  { code: 'CI',    name: "🇨🇮  Côte d'Ivoire" },
  { code: 'EG',    name: '🇪🇬  Egypt' },
  { code: 'MA',    name: '🇲🇦  Morocco' },
  { code: 'TN',    name: '🇹🇳  Tunisia' },
  { code: 'DZ',    name: '🇩🇿  Algeria' },
  // ── Global ──
  { code: 'GB',    name: '🇬🇧  United Kingdom' },
  { code: 'US',    name: '🇺🇸  United States' },
  { code: 'CA',    name: '🇨🇦  Canada' },
  { code: 'AU',    name: '🇦🇺  Australia' },
  { code: 'AE',    name: '🇦🇪  United Arab Emirates' },
  { code: 'SG',    name: '🇸🇬  Singapore' },
  { code: 'IN',    name: '🇮🇳  India' },
  { code: 'DE',    name: '🇩🇪  Germany' },
  { code: 'FR',    name: '🇫🇷  France' },
  { code: 'NL',    name: '🇳🇱  Netherlands' },
  { code: 'IE',    name: '🇮🇪  Ireland' },
  { code: 'NZ',    name: '🇳🇿  New Zealand' },
  { code: 'OTHER', name: '🌍  Other' },
];

const INCOME_TYPES = [
  { id: 'variable',   label: 'Variable income',         sub: 'Income that changes month to month' },
  { id: 'trader',     label: 'Trader / Investor',       sub: 'Trading or investment income' },
  { id: 'freelancer', label: 'Freelancer / Contractor', sub: 'Project or retainer-based income' },
  { id: 'fixed',      label: 'Fixed salary',            sub: 'Stable monthly income, side income, or managing a household' },
  { id: 'family',     label: 'Family / Household',      sub: 'Managing shared finances or as sole earner' },
  { id: 'other',      label: 'Business owner / Other',  sub: 'Self-employed, mixed income types' },
];

const INCOME_SITUATIONS = [
  { id: '',                label: 'Select your primary situation…', disabled: true },
  { id: 'allowance',       label: 'Allowance / Support' },
  { id: 'salary',          label: 'Salary' },
  { id: 'freelance_gigs',  label: 'Freelance / Gigs' },
  { id: 'business',        label: 'Business income' },
  { id: 'trading',         label: 'Trading income' },
  { id: 'mixed',           label: 'Hybrid' },
];

const REFERRAL_SOURCES = [
  { id: '',           label: 'Select an option…',           disabled: true },
  { id: 'twitter_x',  label: 'Twitter / X' },
  { id: 'instagram',  label: 'Instagram' },
  { id: 'tiktok',     label: 'TikTok' },
  { id: 'linkedin',   label: 'LinkedIn' },
  { id: 'youtube',    label: 'YouTube' },
  { id: 'google',     label: 'Google Search' },
  { id: 'friend',     label: 'Friend or colleague' },
  { id: 'whatsapp',   label: 'WhatsApp group or community' },
  { id: 'podcast',    label: 'Podcast or newsletter' },
  { id: 'other',      label: 'Other' },
];

const STEP_LABELS = ['About you', 'Your finances', 'Final details'];

// ── Sub-components ────────────────────────────────────────────────────────────

function StepProgress({ current }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
        {STEP_LABELS.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1, height: '3px', borderRadius: '2px',
              background: i < current ? '#D97757' : '#1A1610',
              transition: 'background 0.35s ease',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5C5648' }}>
          Step {current} of {STEP_LABELS.length}
        </span>
        <span style={{ fontSize: '12px', color: '#8B8478' }}>
          {STEP_LABELS[current - 1]}
        </span>
      </div>
    </div>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ fontSize: '12px', color: '#C56B5A', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
      <span>⚠</span> {msg}
    </div>
  );
}

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
        <div style={{ fontSize: '12px', color: '#8B8478', marginTop: '2px' }}>{option.sub}</div>
      </div>
    </div>
  );
}

function NavButtons({ onBack, onNext, nextLabel = 'Continue →', submitting = false }) {
  return (
    <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
      {onBack && (
        <button
          type="button"
          className="m-btn m-btn-outline"
          style={{ flexShrink: 0 }}
          onClick={onBack}
          disabled={submitting}
        >
          ← Back
        </button>
      )}
      <button
        type={onNext ? 'button' : 'submit'}
        className="m-btn m-btn-primary m-btn-lg"
        style={{ flex: 1, justifyContent: 'center', opacity: submitting ? 0.7 : 1 }}
        onClick={onNext}
        disabled={submitting}
      >
        {nextLabel}
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EarlyAccess({ navigate }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', country: '',
    incomeType: '', incomeSituation: '',
    referralSource: '', interest: '',
  });
  const [step, setStep]               = useState(1);
  const [errors, setErrors]           = useState({});
  const [submitted, setSubmitted]     = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }));
  };

  // ── Per-step validation ───────────────────────────────────────────────────
  const validators = {
    1: () => {
      const e = {};
      if (!form.name.trim())  e.name  = 'Please enter your full name.';
      if (!form.email.trim()) e.email = 'Please enter your email address.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
        e.email = 'Please enter a valid email address.';
      if (!form.country)      e.country = 'Please select your country or location.';
      return e;
    },
    2: () => {
      const e = {};
      if (!form.incomeType)      e.incomeType      = 'Please select the option that best fits you.';
      if (!form.incomeSituation) e.incomeSituation = 'Please select your primary income situation.';
      return e;
    },
    3: () => {
      const e = {};
      if (!form.referralSource) e.referralSource = 'Please let us know how you heard about us.';
      return e;
    },
  };

  const handleNext = () => {
    const errs = validators[step]();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setErrors({});
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validators[3]();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setSubmitError(null);

    if (supabase) {
      const payload = {
        name:             form.name.trim(),
        email:            form.email.trim().toLowerCase(),
        country:          form.country         || null,
        phone:            form.phone.trim()    || null,
        income_type:      form.incomeType      || null,
        income_situation: form.incomeSituation || null,
        referral_source:  form.referralSource  || null,
        interest:         form.interest.trim() || null,
      };

      const { error } = await supabase.from('early_access_leads').insert(payload);

      if (error) {
        console.error('[EarlyAccess] Supabase insert error:', error.code, error.message, error);

        // Duplicate email — treat as success (don't reveal who's signed up)
        if (error.code === '23505') { setSubmitting(false); setSubmitted(true); return; }

        if (error.code === '42P01') {
          setSubmitError('Service setup in progress. Please email us at support@royalledger.app to join the list.');
          setSubmitting(false); return;
        }
        if (error.code === '42501' || error.message?.toLowerCase().includes('row-level security')) {
          setSubmitError('Submission temporarily unavailable. Please email support@royalledger.app.');
          setSubmitting(false); return;
        }
        setSubmitError('Something went wrong. Please try again or email us at support@royalledger.app.');
        setSubmitting(false); return;
      }

      // Best-effort admin notification (Telegram / email) — don't block on this
      supabase.functions
        .invoke('notify-lead', {
          body: { record: { ...payload, created_at: new Date().toISOString() } },
        })
        .then(({ error: fnErr, data }) => {
          if (fnErr) console.warn('[EarlyAccess] notify-lead error:', fnErr.message);
          else if (data?.results) data.results.forEach(r => {
            if (!r.ok) console.warn(`[EarlyAccess] notify-lead ${r.service}:`, r.error);
          });
        })
        .catch(err => console.warn('[EarlyAccess] notify-lead (network):', err));

    } else {
      // Local dev fallback — simulate a network delay
      await new Promise(r => setTimeout(r, 700));
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div>
        <div className="m-nav-spacer" />
        <section style={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '80px 24px',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '520px' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#0F1A0E', border: '1px solid #1E3018',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', margin: '0 auto 28px',
            }}>✓</div>
            <h1 className="m-display" style={{ fontSize: 'clamp(32px, 5vw, 52px)', color: '#E8E2D5', marginBottom: '20px' }}>
              Application received.
            </h1>
            <p style={{ fontSize: '16px', color: '#B0A898', lineHeight: 1.75, marginBottom: '8px' }}>
              Your request has been submitted, {form.name.split(' ')[0]}.
            </p>
            <p style={{ fontSize: '15px', color: '#8B8478', lineHeight: 1.75, marginBottom: '12px' }}>
              We review applications in stages to maintain the quality and intent of the system.
            </p>
            <p style={{ fontSize: '15px', color: '#8B8478', lineHeight: 1.75, marginBottom: '36px' }}>
              If accepted, you'll receive access via <strong style={{ color: '#E8E2D5' }}>{form.email}</strong>.
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

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="m-nav-spacer" />

      {/* Page header */}
      <section className="m-section-sm" style={{ borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-sm">
          <div className="m-label" style={{ marginBottom: '16px' }}>Application</div>
          <h1 className="m-display" style={{ fontSize: 'clamp(36px, 5vw, 60px)', color: '#E8E2D5', marginBottom: '20px' }}>
            Apply for{' '}
            <em style={{ color: '#D97757', fontStyle: 'italic' }}>early access</em>.
          </h1>
          <p className="m-body" style={{ fontSize: '16px', marginBottom: '12px' }}>
            Royal Ledger is not open to everyone yet.
          </p>
          <p style={{ fontSize: '14px', color: '#8B8478', lineHeight: 1.7, maxWidth: '480px' }}>
            Access is released in stages to ensure the system remains intentional, stable, and focused.
          </p>
        </div>
      </section>

      {/* ── Expectation ── */}
      <section style={{ padding: '48px 24px', borderBottom: '1px solid #1A1610', background: '#0F0D0A' }}>
        <div className="m-wrap-sm">
          <div className="m-label" style={{ marginBottom: '14px' }}>What this is</div>
          <h2 className="m-display" style={{ fontSize: 'clamp(22px, 3vw, 34px)', color: '#E8E2D5', marginBottom: '16px' }}>
            This is not a typical signup.
          </h2>
          <p style={{ fontSize: '15px', color: '#B0A898', lineHeight: 1.75, marginBottom: '12px', maxWidth: '500px' }}>
            You're not creating an account. You're applying for access to a system designed to help you build control over your money.
          </p>
          <p style={{ fontSize: '14px', color: '#8B8478', lineHeight: 1.7, maxWidth: '480px' }}>
            We review each application to ensure the product reaches people it's built for.
          </p>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section style={{ padding: '48px 24px', borderBottom: '1px solid #1A1610' }}>
        <div className="m-wrap-sm">
          <div className="m-label" style={{ marginBottom: '14px' }}>Who this is for</div>
          <p style={{ fontSize: '15px', color: '#B0A898', lineHeight: 1.75, marginBottom: '24px', maxWidth: '500px' }}>
            Royal Ledger is designed for people whose financial reality doesn't fit traditional systems.
          </p>
          <div>
            {[
              'You want control over your money',
              'Your income or habits feel inconsistent',
              'You\'re willing to follow a structured system',
            ].map((item, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid #1A1610' : 'none' }}>
                <span style={{ color: '#D97757', fontSize: '13px', flexShrink: 0 }}>→</span>
                <span style={{ fontSize: '14px', color: '#E8E2D5', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '14px', color: '#B0A898', lineHeight: 1.7, marginTop: '20px' }}>
            Royal Ledger is built for people who have income but don't feel fully in control yet.
          </p>
          <p style={{ fontSize: '14px', color: '#8B8478', lineHeight: 1.7, marginTop: '12px', fontStyle: 'italic' }}>
            You don't need to be disciplined already. You need to be willing to start.
          </p>
        </div>
      </section>

      {/* ── What to expect ── */}
      <section style={{ padding: '48px 24px', borderBottom: '1px solid #1A1610', background: '#0F0D0A' }}>
        <div className="m-wrap-sm">
          <div className="m-label" style={{ marginBottom: '14px' }}>What to expect</div>
          <div>
            {[
              'Your application is reviewed',
              'If accepted, you\'ll receive access in stages',
              'You\'ll start in Foundation mode',
              'The system expands as your structure builds',
            ].map((item, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid #1A1610' : 'none' }}>
                <span style={{ color: '#D97757', fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>→</span>
                <span style={{ fontSize: '14px', color: '#B0A898', lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '14px', color: '#8B8478', lineHeight: 1.7, marginTop: '24px', fontStyle: 'italic' }}>
            You don't switch systems. You grow into it.
          </p>
        </div>
      </section>

      {/* Multi-step form */}
      <section className="m-section">
        <div className="m-wrap-xs">
          <form onSubmit={handleSubmit} noValidate>
            <StepProgress current={step} />

            {/* ─────────────── STEP 1: About you ─────────────────── */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#E8E2D5', marginBottom: '4px' }}>About you</div>
                  <div style={{ fontSize: '13px', color: '#5C5648' }}>Tell us a bit about your current situation.</div>
                </div>

                {/* Full name */}
                <div>
                  <label className="m-field-label" htmlFor="ea-name">Full name</label>
                  <input
                    id="ea-name" type="text" className="m-input"
                    placeholder="Your full name"
                    value={form.name} onChange={e => set('name', e.target.value)}
                    autoComplete="name"
                  />
                  <FieldError msg={errors.name} />
                </div>

                {/* Email */}
                <div>
                  <label className="m-field-label" htmlFor="ea-email">Email address</label>
                  <input
                    id="ea-email" type="email" className="m-input"
                    placeholder="you@domain.com"
                    value={form.email} onChange={e => set('email', e.target.value)}
                    autoComplete="email"
                  />
                  <FieldError msg={errors.email} />
                </div>

                {/* Phone — optional */}
                <div>
                  <label className="m-field-label" htmlFor="ea-phone">
                    WhatsApp / Phone{' '}
                    <span style={{ color: '#5C5648', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    id="ea-phone" type="tel" className="m-input"
                    placeholder="+234 800 000 0000"
                    value={form.phone} onChange={e => set('phone', e.target.value)}
                    autoComplete="tel"
                  />
                  <div style={{ fontSize: '11px', color: '#4A4038', marginTop: '6px' }}>
                    Optional — if you prefer communication outside email.
                  </div>
                </div>

                {/* Country — required select */}
                <div>
                  <label className="m-field-label" htmlFor="ea-country">Where are you based?</label>
                  <select
                    id="ea-country" className="m-input ea-select"
                    value={form.country} onChange={e => set('country', e.target.value)}
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code} disabled={!!c.disabled}>{c.name}</option>
                    ))}
                  </select>
                  <FieldError msg={errors.country} />
                </div>

                <NavButtons onNext={handleNext} />
              </div>
            )}

            {/* ─────────────── STEP 2: Your finances ─────────────── */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#E8E2D5', marginBottom: '4px' }}>Your finances</div>
                  <div style={{ fontSize: '13px', color: '#5C5648' }}>
                    This helps us understand how the system should fit your stage.
                  </div>
                </div>

                {/* Income profile — radio */}
                <div>
                  <label className="m-field-label" style={{ marginBottom: '10px', display: 'block' }}>
                    Income profile
                  </label>
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
                  <FieldError msg={errors.incomeType} />
                </div>

                {/* Primary income situation — select */}
                <div>
                  <label className="m-field-label" htmlFor="ea-situation">How do you currently receive money?</label>
                  <select
                    id="ea-situation" className="m-input ea-select"
                    value={form.incomeSituation} onChange={e => set('incomeSituation', e.target.value)}
                  >
                    {INCOME_SITUATIONS.map(s => (
                      <option key={s.id} value={s.id} disabled={!!s.disabled}>{s.label}</option>
                    ))}
                  </select>
                  <FieldError msg={errors.incomeSituation} />
                </div>

                <NavButtons onBack={handleBack} onNext={handleNext} />
              </div>
            )}

            {/* ─────────────── STEP 3: Final details ─────────────── */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#E8E2D5', marginBottom: '4px' }}>Anything else</div>
                  <div style={{ fontSize: '13px', color: '#5C5648' }}>
                    Optional, but useful if there's context we should know.
                  </div>
                </div>

                {/* Referral source — required select */}
                <div>
                  <label className="m-field-label" htmlFor="ea-referral">How did you hear about Royal Ledger?</label>
                  <select
                    id="ea-referral" className="m-input ea-select"
                    value={form.referralSource} onChange={e => set('referralSource', e.target.value)}
                  >
                    {REFERRAL_SOURCES.map(s => (
                      <option key={s.id} value={s.id} disabled={!!s.disabled}>{s.label}</option>
                    ))}
                  </select>
                  <div style={{ fontSize: '11px', color: '#4A4038', marginTop: '6px' }}>
                    Helps us understand what's working.
                  </div>
                  <FieldError msg={errors.referralSource} />
                </div>

                {/* Why interested — optional */}
                <div>
                  <label className="m-field-label" htmlFor="ea-interest">
                    Anything else you'd like us to know?{' '}
                    <span style={{ color: '#5C5648', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea
                    id="ea-interest" className="m-input m-textarea"
                    placeholder="Your financial situation, what you're hoping Royal Ledger helps with, or anything else…"
                    value={form.interest} onChange={e => set('interest', e.target.value)}
                  />
                </div>

                {/* Submit error */}
                {submitError && (
                  <div style={{
                    background: '#1A0E0A', border: '1px solid #4A2018', borderRadius: '4px',
                    padding: '12px 16px', fontSize: '13px', color: '#C56B5A', lineHeight: 1.6,
                  }}>
                    {submitError}
                  </div>
                )}

                <NavButtons
                  onBack={handleBack}
                  nextLabel={submitting ? 'Submitting…' : 'Submit Application'}
                  submitting={submitting}
                />

                <p style={{ fontSize: '12px', color: '#5C5648', textAlign: 'center', lineHeight: 1.7 }}>
                  We don't share your data. Your information is used only to review your application and manage access.
                </p>
              </div>
            )}
          </form>

          {/* ── Pricing signal ──────────────────────────────────── */}
          <div style={{ marginTop: '48px', paddingTop: '40px', borderTop: '1px solid #1A1610' }}>
            <div className="m-label" style={{ marginBottom: '16px' }}>What does it cost?</div>
            <div className="ea-pricing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div style={{ background: '#14110E', border: '1px solid #26221C', borderRadius: '4px', padding: '16px 18px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#8B8478', textTransform: 'uppercase', marginBottom: '8px' }}>Core — Free</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#E8E2D5', marginBottom: '6px' }}>Always free</div>
                <div style={{ fontSize: '12px', color: '#5C5648', lineHeight: 1.6 }}>Local device. All core modules. Offline-first. No sync.</div>
              </div>
              <div style={{ background: '#1A1008', border: '1px solid #3A2010', borderRadius: '4px', padding: '16px 18px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#D97757', textTransform: 'uppercase', marginBottom: '8px' }}>Pro — Coming soon</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#E8E2D5', marginBottom: '6px' }}>Subscription</div>
                <div style={{ fontSize: '12px', color: '#8B8478', lineHeight: 1.6 }}>Cloud sync, multi-device, push notifications. Pricing set during beta.</div>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#5C5648', lineHeight: 1.6 }}>
              Beta access is free. No payment required at any stage of the early access programme.
            </p>
          </div>

          {/* ── What to expect ──────────────────────────────────── */}
          <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid #1A1610' }}>
            <div className="m-label" style={{ marginBottom: '20px' }}>What to expect</div>
            {[
              { icon: '📬', text: 'We review every application personally.' },
              { icon: '⏱',  text: 'Response time: within 1–2 weeks of submission.' },
              { icon: '🔑', text: 'Selected applicants receive an invite code via email.' },
              { icon: '💼', text: 'Investor inquiries are handled separately — mention it in your note.' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 0', borderBottom: '1px solid #1A1610' }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: '13px', color: '#8B8478', lineHeight: 1.6 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        /* Custom chevron arrow on <select> */
        .ea-select {
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235C5648' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px !important;
          cursor: pointer;
        }
        .ea-select option          { background: #141210; color: #E8E2D5; }
        .ea-select option:disabled { color: #4A4038; }
        @media (max-width: 480px) {
          .ea-pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
