// src/components/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import {
  RefreshCw, Users, Clock, CheckCircle, XCircle,
  Mail, Lock, Search, Send, FileText, AlertTriangle, X, KeyRound, Hash,
  ChevronDown, ChevronUp, Trash2, ShieldOff, ShieldCheck, UserCheck,
  Square, CheckSquare, MinusSquare, Inbox, Download, UserPlus, Bell,
  Settings, Activity,
} from 'lucide-react';

const ADMIN_EMAILS = ['hello@royalledger.app', 'fasathor@gmail.com'];
const FILTERS = ['All', 'Pending', 'Active', 'Invited', 'Suspended', 'Blocked', 'Rejected'];

const FILTER_META = {
  All:       { color: '#B0A898', bg: 'rgba(139,132,120,0.12)' },
  Pending:   { color: '#D97757', bg: 'rgba(217,119,87,0.12)'  },
  Active:    { color: '#7FA068', bg: 'rgba(127,160,104,0.12)' },
  Invited:   { color: '#B89968', bg: 'rgba(184,153,104,0.12)' },
  Suspended: { color: '#B89968', bg: 'rgba(184,153,104,0.12)' },
  Blocked:   { color: '#C56B5A', bg: 'rgba(197,107,90,0.12)'  },
  Rejected:  { color: '#8B8478', bg: 'rgba(92,86,72,0.12)'    },
};

const NAV_ITEMS = [
  { id: 'users',    label: 'Users',              icon: Users    },
  { id: 'pin',      label: 'PIN Reset Requests', icon: KeyRound },
  { id: 'activity', label: 'Activity Logs',       icon: Activity },
  { id: 'settings', label: 'System Settings',     icon: Settings, disabled: true },
];

const ACTION_META = {
  invite:             { label: 'Sent invite to',          color: '#7FA068' },
  bulk_invite:        { label: 'Bulk invite',             color: '#7FA068' },
  status_change:      { label: 'Status changed',          color: '#B89968' },
  bulk_status_change: { label: 'Bulk status change',      color: '#B89968' },
  bulk_delete:        { label: 'Bulk deleted users',      color: '#C56B5A' },
  delete:             { label: 'Deleted lead',            color: '#C56B5A' },
  approve_pin_reset:  { label: 'Approved PIN reset for',  color: '#7FA068' },
  dismiss_pin_reset:  { label: 'Dismissed PIN reset for', color: '#8B8478' },
  data_reset:         { label: 'Reset app data for',      color: '#C56B5A' },
  note:               { label: 'Added note to',           color: '#B0A898' },
};

const DEFAULT_MESSAGE = (name) =>
`Hi ${name || 'there'},

You've been selected for early access to Royal Ledger.

Royal Ledger is a financial system designed for people with variable income — freelancers, traders, contractors, and anyone who doesn't earn the same every month.

You can now access the platform here:
https://royalledger.app

Let us know if you have any questions.

— Royal Ledger Team`;

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'RL-' + Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

// ── Country name → ISO-3166-1 alpha-2 code ───────────────────────────────────
const COUNTRY_CODES = {
  'nigeria': 'NG', 'south africa': 'ZA', 'ghana': 'GH', 'kenya': 'KE',
  'ethiopia': 'ET', 'tanzania': 'TZ', 'uganda': 'UG', 'rwanda': 'RW',
  'zimbabwe': 'ZW', 'zambia': 'ZM', 'senegal': 'SN', 'cameroon': 'CM',
  'ivory coast': 'CI', "côte d'ivoire": 'CI', 'mozambique': 'MZ',
  'botswana': 'BW', 'namibia': 'NA', 'malawi': 'MW', 'angola': 'AO',
  'egypt': 'EG', 'morocco': 'MA', 'tunisia': 'TN', 'algeria': 'DZ',
  'united states': 'US', 'usa': 'US', 'united kingdom': 'GB', 'uk': 'GB',
  'canada': 'CA', 'australia': 'AU', 'india': 'IN', 'germany': 'DE',
  'france': 'FR', 'netherlands': 'NL', 'uae': 'AE', 'united arab emirates': 'AE',
  'singapore': 'SG', 'new zealand': 'NZ', 'ireland': 'IE',
};

function countryDisplay(raw) {
  if (!raw) return '—';
  const trimmed = raw.trim();
  if (!trimmed) return '—';
  // Already looks like a 2–3 letter code
  if (trimmed.length <= 3) return trimmed.toUpperCase();
  return COUNTRY_CODES[trimmed.toLowerCase()] || trimmed;
}

// ── Income type labels ────────────────────────────────────────────────────────
const INCOME_META = {
  fixed:      { short: 'Fixed',       full: 'Fixed salary' },
  variable:   { short: 'Variable',    full: 'Variable income' },
  trader:     { short: 'Trader',      full: 'Trader / Investor' },
  freelancer: { short: 'Freelancer',  full: 'Freelancer / Contractor' },
  family:     { short: 'Family',      full: 'Family / Household' },
  other:      { short: 'Other',       full: 'Business / Other' },
};

function incomeDisplay(raw, variant = 'short') {
  if (!raw) return '—';
  return INCOME_META[raw]?.[variant] || raw;
}

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    pending:   { bg: 'rgba(217,119,87,0.15)',  color: '#D97757', label: 'Pending'   },
    invited:   { bg: 'rgba(184,153,104,0.15)', color: '#B89968', label: 'Invited'   },
    active:    { bg: 'rgba(127,160,104,0.15)', color: '#7FA068', label: 'Active'    },
    suspended: { bg: 'rgba(184,153,104,0.15)', color: '#B89968', label: 'Suspended' },
    rejected:  { bg: 'rgba(92,86,72,0.20)',    color: '#B0A898', label: 'Rejected'  },
    blocked:   { bg: 'rgba(197,107,90,0.15)',  color: '#C56B5A', label: 'Blocked'   },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: '999px',
      fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em',
      textTransform: 'uppercase', background: s.bg, color: s.color,
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, subtitle, count, color, active, onClick }) {
  const isPending = label === 'Pending';
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? `${color}0D` : isPending && count > 0 ? 'rgba(217,119,87,0.04)' : '#0F0D0A',
        border: `1px solid ${active ? color : isPending && count > 0 ? 'rgba(217,119,87,0.25)' : '#26221C'}`,
        borderRadius: '8px', padding: '16px 18px',
        display: 'flex', flexDirection: 'column', gap: '8px',
        cursor: 'pointer', textAlign: 'left', width: '100%',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = color; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = isPending && count > 0 ? 'rgba(217,119,87,0.25)' : '#26221C'; } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Icon size={12} color={color} />
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: active ? color : '#8B8478' }}>
            {label}
          </span>
        </div>
        {isPending && count > 0 && (
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D97757', display: 'inline-block', flexShrink: 0 }} />
        )}
      </div>
      <span style={{ fontSize: '30px', fontWeight: 300, color: active ? color : count > 0 ? color : '#5C5648', lineHeight: 1, fontFamily: 'Georgia, serif' }}>
        {count}
      </span>
      <span style={{ fontSize: '10px', color: '#5C5648', lineHeight: 1.3 }}>{subtitle}</span>
    </button>
  );
}

// ── Meta item ─────────────────────────────────────────────────────────────────

function MetaItem({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A4038' }}>
        {label}
      </span>
      <span style={{ fontSize: '12px', color: '#8B8478' }}>{value || '—'}</span>
    </div>
  );
}

// ── Inline action button ───────────────────────────────────────────────────────

function ActionBtn({ label, active, color, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '5px 12px', borderRadius: '5px', fontSize: '11px',
        fontWeight: active ? 600 : 400,
        border: `1px solid ${active ? color : '#26221C'}`,
        background: active ? `${color}18` : 'transparent',
        color: active ? color : '#8B8478',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.12s',
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.borderColor = active ? color : '#26221C'; e.currentTarget.style.color = active ? color : '#8B8478'; } }}
    >
      {label}
    </button>
  );
}

// ── Bulk action bar ───────────────────────────────────────────────────────────

function BulkActionBar({ count, onActivate, onSuspend, onBlock, onDelete, onInvite, processing, confirmDelete, onConfirmDelete, onCancelDelete, onClearSelection }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10,
      background: '#0D1209', border: '1px solid #2A4A20',
      borderRadius: '7px', padding: '10px 14px',
      display: 'flex', alignItems: 'center', gap: '10px',
      flexWrap: 'wrap', marginBottom: '10px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    }}>
      <span style={{ fontSize: '11px', fontWeight: 700, color: '#7FA068', minWidth: 'max-content', letterSpacing: '0.04em' }}>
        {count} selected
      </span>
      <div style={{ width: '1px', height: '16px', background: '#1E3018', flexShrink: 0 }} />
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
        <button onClick={onInvite} disabled={processing} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '4px', border: '1px solid #1E3A2A', background: 'rgba(127,160,104,0.08)', color: '#7FA068', fontSize: '11px', fontWeight: 600, cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.5 : 1 }}
          onMouseEnter={e => { if (!processing) e.currentTarget.style.background = 'rgba(127,160,104,0.18)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(127,160,104,0.08)'; }}>
          <Send size={10} /> Invite
        </button>
        <button onClick={onActivate} disabled={processing} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '4px', border: '1px solid #2A4A20', background: 'rgba(127,160,104,0.1)', color: '#7FA068', fontSize: '11px', fontWeight: 600, cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.5 : 1 }}>
          <UserCheck size={10} /> Activate
        </button>
        <button onClick={onSuspend} disabled={processing} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '4px', border: '1px solid #3A2A1E', background: 'rgba(184,153,104,0.1)', color: '#B89968', fontSize: '11px', fontWeight: 600, cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.5 : 1 }}>
          <ShieldOff size={10} /> Suspend
        </button>
        <button onClick={onBlock} disabled={processing} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '4px', border: '1px solid #3A1818', background: 'rgba(197,107,90,0.1)', color: '#C56B5A', fontSize: '11px', fontWeight: 600, cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.5 : 1 }}>
          <Lock size={10} /> Block
        </button>
        {confirmDelete ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#B0A898' }}>Delete {count}?</span>
            <button onClick={onConfirmDelete} disabled={processing} style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #4A1020', background: 'rgba(197,107,90,0.18)', color: '#C56B5A', fontSize: '11px', fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.5 : 1 }}>
              {processing ? 'Deleting…' : 'Confirm delete'}
            </button>
            <button onClick={onCancelDelete} style={{ fontSize: '11px', color: '#8B8478', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
          </div>
        ) : (
          <button onClick={onDelete} disabled={processing} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '4px', border: '1px solid #26221C', background: 'transparent', color: '#8B8478', fontSize: '11px', fontWeight: 600, cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.5 : 1 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#C56B5A'; e.currentTarget.style.color = '#C56B5A'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#26221C'; e.currentTarget.style.color = '#8B8478'; }}>
            <Trash2 size={10} /> Delete
          </button>
        )}
      </div>
      <button onClick={onClearSelection} style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 6px', background: 'none', border: 'none', color: '#5C5648', fontSize: '10px', cursor: 'pointer' }} title="Clear selection">
        <X size={10} /> Clear
      </button>
    </div>
  );
}

// ── Note editor ───────────────────────────────────────────────────────────────

function NoteEditor({ lead, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(lead.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('early_access_leads')
        .update({ notes: draft.trim() || null })
        .eq('id', lead.id);
      if (error) throw error;
      onSave(lead.id, draft.trim() || null);
      setEditing(false);
    } catch (err) {
      console.error('[AdminDashboard] saveNote:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <FileText size={11} style={{ color: '#4A4038', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {lead.notes
            ? <span style={{ fontSize: '12px', color: '#8B8478', lineHeight: 1.6 }}>{lead.notes}</span>
            : <span style={{ fontSize: '12px', color: '#26221C', fontStyle: 'italic' }}>No notes</span>
          }
        </div>
        <button
          onClick={() => { setDraft(lead.notes || ''); setEditing(true); }}
          style={{ fontSize: '11px', color: '#5C5648', background: 'none', border: '1px solid #26221C', borderRadius: '3px', cursor: 'pointer', flexShrink: 0, padding: '2px 8px', transition: 'color 0.12s, border-color 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B8478'; e.currentTarget.style.color = '#B0A898'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#26221C'; e.currentTarget.style.color = '#5C5648'; }}
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div>
      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        rows={3}
        autoFocus
        placeholder="Add internal notes…"
        style={{
          width: '100%', background: '#0A0908', border: '1px solid #5C5648',
          borderRadius: '4px', padding: '8px 10px', fontSize: '12px',
          color: '#E8E2D5', resize: 'vertical', lineHeight: 1.5,
          boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none',
        }}
      />
      <div style={{ display: 'flex', gap: '8px', marginTop: '6px', justifyContent: 'flex-end' }}>
        <button onClick={() => setEditing(false)} style={{ fontSize: '11px', color: '#8B8478', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving} style={{ fontSize: '11px', color: '#7FA068', background: 'none', border: '1px solid #2A4A20', borderRadius: '4px', cursor: saving ? 'not-allowed' : 'pointer', padding: '4px 10px', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving…' : 'Save note'}
        </button>
      </div>
    </div>
  );
}

// ── Invite code manager ───────────────────────────────────────────────────────

function InviteCodeManager({ lead, onCodeSave }) {
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
    const code = generateInviteCode();
    try {
      const { error } = await supabase
        .from('early_access_leads')
        .update({ invite_code: code })
        .eq('id', lead.id);
      if (error) throw error;
      onCodeSave(lead.id, code);
    } catch (err) {
      console.error('[AdminDashboard] generateCode:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
      <Hash size={11} style={{ color: '#4A4038', flexShrink: 0 }} />
      <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5C5648' }}>
        Invite Code
      </span>
      {lead.invite_code
        ? <span style={{ fontSize: '12px', color: '#B0A898', fontFamily: 'monospace', letterSpacing: '0.1em', background: '#141210', padding: '2px 8px', borderRadius: '3px', border: '1px solid #26221C' }}>{lead.invite_code}</span>
        : <span style={{ fontSize: '12px', color: '#26221C', fontStyle: 'italic' }}>None assigned</span>
      }
      <button onClick={generate} disabled={generating} style={{ fontSize: '11px', color: '#D97757', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', opacity: generating ? 0.5 : 1 }}>
        {generating ? '…' : lead.invite_code ? 'Regenerate' : 'Generate'}
      </button>
    </div>
  );
}

// ── Invite modal ──────────────────────────────────────────────────────────────

function InviteModal({ lead, onClose, onSent }) {
  const [message, setMessage] = useState(DEFAULT_MESSAGE(lead.name));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    setSending(true);
    setError(null);
    try {
      const inviteCode = generateInviteCode();
      const fullMessage = `${message}\n\nYour invite code: ${inviteCode}`;
      const { error: fnError } = await supabase.functions.invoke('send-invite', {
        body: { name: lead.name, email: lead.email, message: fullMessage },
      });
      if (fnError) throw new Error(fnError.message || 'Edge Function error');
      // Upsert — creates the row if it doesn't exist yet, updates if it does
      const { data: upserted, error: dbError } = await supabase
        .from('early_access_leads')
        .upsert({
          email:      lead.email.trim().toLowerCase(),
          name:       lead.name || lead.email.split('@')[0],
          status:     'invited',
          invited_at: new Date().toISOString(),
          invite_code: inviteCode,
        }, { onConflict: 'email', ignoreDuplicates: false })
        .select('id, email, invite_code');
      if (dbError) throw dbError;
      if (!upserted || upserted.length === 0) {
        throw new Error(`DB upsert returned no rows for ${lead.email} — check Supabase RLS policies.`);
      }
      onSent(lead.id ?? lead.email, inviteCode);
    } catch (err) {
      console.error('[AdminDashboard] sendInvite:', err);
      setError(err.message || 'Failed to send. Check the browser console.');
      setSending(false);
    }
  };

  return createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,9,8,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0F1209', border: '1px solid #2A4A20', borderRadius: '8px', maxWidth: '520px', width: '100%', padding: '28px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#8B8478', padding: '4px' }}>
          <X size={14} />
        </button>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7FA068', marginBottom: '8px' }}>Send Invite</div>
          <div style={{ fontSize: '15px', color: '#E8E2D5', fontWeight: 500 }}>{lead.name || lead.email}</div>
          {lead.name && <div style={{ fontSize: '12px', color: '#8B8478', marginTop: '2px' }}>{lead.email}</div>}
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B8478', display: 'block', marginBottom: '8px' }}>Message</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={11} style={{ width: '100%', background: '#0A0908', border: '1px solid #26221C', borderRadius: '4px', padding: '12px', fontSize: '13px', color: '#E8E2D5', fontFamily: 'monospace', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box', outline: 'none' }} />
          <div style={{ fontSize: '11px', color: '#5C5648', marginTop: '5px' }}>A unique invite code is appended automatically.</div>
        </div>
        {error && <div style={{ background: '#1A0E0A', border: '1px solid #4A2018', borderRadius: '4px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#C56B5A', lineHeight: 1.5 }}>{error}</div>}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 18px', background: 'none', border: '1px solid #26221C', borderRadius: '5px', color: '#B0A898', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSend} disabled={sending} style={{ padding: '9px 18px', background: '#7FA068', border: 'none', borderRadius: '5px', color: '#0A0908', fontSize: '13px', fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Send size={13} />
            {sending ? 'Sending…' : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Bulk invite modal ─────────────────────────────────────────────────────────

function BulkInviteModal({ leads, onClose, onAllSent }) {
  const [message, setMessage] = useState(DEFAULT_MESSAGE('everyone'));
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(null); // { done, total, current }
  const [results, setResults] = useState([]);      // [{ email, ok, error }]
  const [done, setDone] = useState(false);
  const cancelRef = React.useRef(false);

  const handleSend = async () => {
    cancelRef.current = false;
    setSending(true);
    setResults([]);
    setProgress({ done: 0, total: leads.length, current: leads[0]?.email });

    const sent = [];
    for (let i = 0; i < leads.length; i++) {
      if (cancelRef.current) break;
      const lead = leads[i];
      setProgress({ done: i, total: leads.length, current: lead.email });
      const inviteCode = generateInviteCode();
      const personalised = `Hi ${lead.name || 'there'},\n\n${message.replace(/^Hi (everyone|there),\n\n/i, '')}`;
      const fullMessage = `${personalised}\n\nYour invite code: ${inviteCode}`;
      try {
        const { error: fnError } = await supabase.functions.invoke('send-invite', {
          body: { name: lead.name, email: lead.email, message: fullMessage },
        });
        if (fnError) throw new Error(fnError.message || 'Edge Function error');
        const { data: upserted, error: dbErr } = await supabase
          .from('early_access_leads')
          .upsert({
            email:       lead.email.trim().toLowerCase(),
            name:        lead.name || lead.email.split('@')[0],
            status:      'invited',
            invited_at:  new Date().toISOString(),
            invite_code: inviteCode,
          }, { onConflict: 'email', ignoreDuplicates: false })
          .select('id');
        if (dbErr) throw dbErr;
        if (!upserted || upserted.length === 0) throw new Error('DB upsert matched 0 rows — check RLS policies');
        sent.push({ id: lead.id, email: lead.email, name: lead.name, inviteCode, ok: true });
        setResults(prev => [...prev, { email: lead.email, ok: true }]);
      } catch (err) {
        sent.push({ id: lead.id, email: lead.email, name: lead.name, ok: false, error: err.message });
        setResults(prev => [...prev, { email: lead.email, ok: false, error: err.message }]);
      }
    }

    setProgress({ done: leads.length, total: leads.length, current: null });
    setSending(false);
    setDone(true);
    onAllSent(sent);
  };

  const successCount = results.filter(r => r.ok).length;
  const failCount    = results.filter(r => !r.ok).length;

  return createPortal(
    <div onClick={done || sending ? undefined : onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,9,8,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0F1209', border: '1px solid #2A4A20', borderRadius: '8px', maxWidth: '560px', width: '100%', padding: '28px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        {!sending && !done && (
          <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#8B8478', padding: '4px' }}>
            <X size={14} />
          </button>
        )}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7FA068', marginBottom: '8px' }}>Bulk Invite</div>
          <div style={{ fontSize: '15px', color: '#E8E2D5', fontWeight: 500 }}>Send invites to {leads.length} {leads.length === 1 ? 'user' : 'users'}</div>
          <div style={{ fontSize: '12px', color: '#8B8478', marginTop: '4px' }}>
            {leads.map(l => l.email).slice(0, 4).join(', ')}{leads.length > 4 ? ` +${leads.length - 4} more` : ''}
          </div>
        </div>

        {/* Message editor — only before sending */}
        {!sending && !done && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B8478', display: 'block', marginBottom: '8px' }}>Message Template</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={10} style={{ width: '100%', background: '#0A0908', border: '1px solid #26221C', borderRadius: '4px', padding: '12px', fontSize: '13px', color: '#E8E2D5', fontFamily: 'monospace', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box', outline: 'none' }} />
              <div style={{ fontSize: '11px', color: '#5C5648', marginTop: '5px' }}>Each email is personalised with the recipient's name. A unique invite code is appended automatically.</div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{ padding: '9px 18px', background: 'none', border: '1px solid #26221C', borderRadius: '5px', color: '#B0A898', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSend} style={{ padding: '9px 18px', background: '#7FA068', border: 'none', borderRadius: '5px', color: '#0A0908', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Send size={13} /> Send {leads.length} Invite{leads.length !== 1 ? 's' : ''}
              </button>
            </div>
          </>
        )}

        {/* Sending progress */}
        {sending && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite', color: '#7FA068', margin: '0 auto 12px' }} />
            <div style={{ fontSize: '14px', color: '#E8E2D5', fontWeight: 500, marginBottom: '4px' }}>
              Sending {progress?.done + 1} of {progress?.total}…
            </div>
            <div style={{ fontSize: '12px', color: '#8B8478', marginBottom: '16px' }}>{progress?.current}</div>
            {/* progress bar */}
            <div style={{ height: '3px', background: '#1A1610', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#7FA068', borderRadius: '2px', transition: 'width 0.3s', width: `${((progress?.done || 0) / (progress?.total || 1)) * 100}%` }} />
            </div>
            <div style={{ marginTop: '16px', textAlign: 'left' }}>
              {results.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0', fontSize: '12px', color: r.ok ? '#7FA068' : '#C56B5A' }}>
                  {r.ok ? <CheckCircle size={10} /> : <XCircle size={10} />}
                  {r.email}
                  {!r.ok && <span style={{ fontSize: '11px', color: '#8B8478' }}>— {r.error}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Done summary */}
        {done && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              {failCount === 0
                ? <CheckCircle size={18} color="#7FA068" />
                : <AlertTriangle size={18} color="#D97757" />
              }
              <div>
                <div style={{ fontSize: '14px', color: '#E8E2D5', fontWeight: 500 }}>
                  {successCount} invite{successCount !== 1 ? 's' : ''} sent{failCount > 0 ? `, ${failCount} failed` : ''}
                </div>
                <div style={{ fontSize: '12px', color: '#8B8478', marginTop: '2px' }}>
                  {failCount > 0 ? 'Check the failed entries below and retry individually.' : 'All done — users will receive their invite emails shortly.'}
                </div>
              </div>
            </div>
            {failCount > 0 && (
              <div style={{ background: '#100A08', border: '1px solid #3A1810', borderRadius: '5px', padding: '10px 12px', marginBottom: '16px' }}>
                {results.filter(r => !r.ok).map((r, i) => (
                  <div key={i} style={{ fontSize: '12px', color: '#C56B5A', padding: '3px 0' }}>
                    {r.email} — {r.error}
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{ padding: '9px 18px', background: '#7FA068', border: 'none', borderRadius: '5px', color: '#0A0908', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Done</button>
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}

// ── Lead row ──────────────────────────────────────────────────────────────────

function LeadRow({ lead, selected, onToggleSelect, onUpdateStatus, onInvite, onNoteSave, onCodeSave, onDelete, onLogAction }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState(null); // null | 'ok' | 'no_user' | 'error'
  const [hovered, setHovered] = useState(false);

  const handleDataReset = async () => {
    setResetting(true);
    setResetResult(null);
    try {
      const { data: result, error } = await supabase.rpc('admin_reset_user_data', {
        p_email: lead.email.trim().toLowerCase(),
      });
      if (error) throw error;
      setResetResult(result === 'no_auth_user' ? 'no_user' : 'ok');
      if (onLogAction) onLogAction('data_reset', lead.email);
    } catch (err) {
      console.error('[AdminDashboard] dataReset:', err);
      setResetResult('error');
    } finally {
      setResetting(false);
      setConfirmReset(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const { data: deleted, error } = await supabase
        .from('early_access_leads')
        .delete()
        .eq('id', lead.id)
        .select('id');
      if (error) throw error;
      if (!deleted || deleted.length === 0) {
        throw new Error('Delete blocked — run rls-fix-migration.sql in Supabase.');
      }
      onDelete(lead.id);
    } catch (err) {
      console.error('[AdminDashboard] deleteLead:', err);
      setDeleteError(err.message || 'Delete failed.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const isSuspended = lead.status === 'suspended';
  const isBlocked   = lead.status === 'blocked';

  const rowBg = selected
    ? 'rgba(127,160,104,0.06)'
    : hovered && !expanded
      ? '#121009'
      : '#0F0D0A';

  const rowBorder = selected ? '#2A4A20' : hovered && !expanded ? '#4A4038' : '#26221C';

  return (
    <div
      style={{ background: rowBg, border: `1px solid ${rowBorder}`, borderRadius: '7px', overflow: 'hidden', transition: 'border-color 0.12s, background 0.12s' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Collapsed header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 14px' }}>

        {/* Checkbox */}
        <div
          onClick={e => { e.stopPropagation(); onToggleSelect(lead.id); }}
          style={{ flexShrink: 0, color: selected ? '#7FA068' : '#4A4038', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.12s' }}
          onMouseEnter={e => { if (!selected) e.currentTarget.style.color = '#8B8478'; }}
          onMouseLeave={e => { if (!selected) e.currentTarget.style.color = '#4A4038'; }}
        >
          {selected ? <CheckSquare size={14} /> : <Square size={14} />}
        </div>

        {/* Expand area */}
        <div onClick={() => setExpanded(e => !e)} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0, cursor: 'pointer', userSelect: 'none' }}>
          <div style={{ flexShrink: 0, color: expanded ? '#8B8478' : '#4A4038', transition: 'color 0.12s' }}>
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </div>

          {/* Identity */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#E8E2D5', whiteSpace: 'nowrap' }}>
                {lead.name || '—'}
              </span>
              <span style={{ fontSize: '12px', color: '#8B8478', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
                {lead.email}
              </span>
              {lead.invite_code && (
                <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: '#4A4038', background: '#141210', border: '1px solid #1E1C18', padding: '1px 5px', borderRadius: '3px', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                  {lead.invite_code}
                </span>
              )}
            </div>
            <div style={{ fontSize: '10px', color: '#4A4038', marginTop: '2px' }}>
              {[
                lead.country    ? countryDisplay(lead.country)         : null,
                lead.income_type ? incomeDisplay(lead.income_type, 'short') : null,
                fmt(lead.created_at),
              ].filter(v => v && v !== '—').join(' · ')}
            </div>
          </div>
        </div>

        {/* Right: badge + quick actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <StatusBadge status={lead.status} />

          {lead.status !== 'active' && lead.status !== 'blocked' && (
            <button
              onClick={() => onInvite(lead)}
              title={lead.status === 'invited' ? 'Resend invite' : 'Send invite'}
              style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 9px', borderRadius: '4px', border: '1px solid #2A4A20', background: 'transparent', color: '#7FA068', fontSize: '10px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.12s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(127,160,104,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Send size={9} />
              {lead.status === 'invited' ? 'Resend' : 'Invite'}
            </button>
          )}

          {isSuspended
            ? (
              <button onClick={() => onUpdateStatus(lead.id, 'active')} title="Lift suspension" style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 9px', borderRadius: '4px', border: '1px solid #2A4A20', background: 'transparent', color: '#7FA068', fontSize: '10px', cursor: 'pointer' }}>
                <ShieldCheck size={9} /> Unsuspend
              </button>
            )
            : (!isBlocked && lead.status !== 'rejected' && (
              <button onClick={() => onUpdateStatus(lead.id, 'suspended')} title="Suspend" style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 9px', borderRadius: '4px', border: '1px solid #3A2A1E', background: 'transparent', color: '#B89968', fontSize: '10px', cursor: 'pointer' }}>
                <ShieldOff size={9} /> Suspend
              </button>
            ))
          }

          {isBlocked
            ? <button onClick={() => onUpdateStatus(lead.id, 'pending')} style={{ padding: '3px 9px', borderRadius: '4px', border: '1px solid #2A4A20', background: 'transparent', color: '#7FA068', fontSize: '10px', cursor: 'pointer' }}>Unblock</button>
            : <button onClick={() => onUpdateStatus(lead.id, 'blocked')} style={{ padding: '3px 9px', borderRadius: '4px', border: '1px solid #3A1818', background: 'transparent', color: '#C56B5A', fontSize: '10px', cursor: 'pointer' }}>Block</button>
          }
        </div>
      </div>

      {/* ── Expanded panel ── */}
      {expanded && (
        <div style={{ borderTop: '1px solid #1A1610', padding: '16px 18px 16px 42px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#0C0A08' }}>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <MetaItem label="Country"  value={countryDisplay(lead.country)} />
            <MetaItem label="Income"   value={incomeDisplay(lead.income_type, 'full')} />
            <MetaItem label="Joined"   value={fmt(lead.created_at)} />
            {lead.invited_at   && <MetaItem label="Invited"   value={fmt(lead.invited_at)} />}
            {lead.activated_at && <MetaItem label="Activated" value={fmt(lead.activated_at)} />}
            {lead.suspended_at && <MetaItem label="Suspended" value={fmt(lead.suspended_at)} />}
            {lead.rejected_at  && <MetaItem label="Rejected"  value={fmt(lead.rejected_at)} />}
            {lead.blocked_at   && <MetaItem label="Blocked"   value={fmt(lead.blocked_at)} />}
          </div>

          {lead.interest && (
            <div style={{ paddingTop: '14px', borderTop: '1px solid #1A1610' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A4038', marginBottom: '6px' }}>Why interested</div>
              <div style={{ fontSize: '13px', color: '#8B8478', lineHeight: 1.65 }}>{lead.interest}</div>
            </div>
          )}

          <div style={{ paddingTop: '14px', borderTop: '1px solid #1A1610' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A4038', marginBottom: '8px' }}>Internal notes</div>
            <NoteEditor lead={lead} onSave={onNoteSave} />
          </div>

          <div style={{ paddingTop: '14px', borderTop: '1px solid #1A1610' }}>
            <InviteCodeManager lead={lead} onCodeSave={onCodeSave} />
          </div>

          <div style={{ paddingTop: '14px', borderTop: '1px solid #1A1610', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <ActionBtn label="Reject" active={lead.status === 'rejected'} color="#D97757" disabled={lead.status === 'rejected'} onClick={() => onUpdateStatus(lead.id, 'rejected')} />
            <ActionBtn
              label={lead.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
              active={lead.status === 'suspended'}
              color="#B89968"
              disabled={false}
              onClick={() => onUpdateStatus(lead.id, lead.status === 'suspended' ? 'active' : 'suspended')}
            />
            {lead.status !== 'pending' && (
              <ActionBtn label="Reset to pending" active={false} color="#8B8478" disabled={false} onClick={() => onUpdateStatus(lead.id, 'pending')} />
            )}

            <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>

              {/* ── Data reset feedback ── */}
              {resetResult === 'ok' && (
                <div style={{ fontSize: '10px', color: '#7FA068', background: 'rgba(127,160,104,0.08)', border: '1px solid #2A4A20', borderRadius: '3px', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={9} /> App data wiped — user will re-onboard on next login.
                </div>
              )}
              {resetResult === 'no_user' && (
                <div style={{ fontSize: '10px', color: '#B89968', background: 'rgba(184,153,104,0.08)', border: '1px solid #3A2A1E', borderRadius: '3px', padding: '3px 8px' }}>
                  No auth account found for this email — nothing to reset.
                </div>
              )}
              {resetResult === 'error' && (
                <div style={{ fontSize: '10px', color: '#C56B5A', background: 'rgba(197,107,90,0.08)', border: '1px solid #4A1020', borderRadius: '3px', padding: '3px 8px' }}>
                  Reset failed — run admin-reset-user-data.sql in Supabase first.
                </div>
              )}
              {deleteError && (
                <div style={{ fontSize: '10px', color: '#C56B5A', background: 'rgba(197,107,90,0.08)', border: '1px solid #4A1020', borderRadius: '3px', padding: '3px 8px', maxWidth: '260px', lineHeight: 1.4 }}>
                  {deleteError}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                {/* Reset app data */}
                {confirmReset ? (
                  <>
                    <span style={{ fontSize: '11px', color: '#B0A898' }}>Wipe all data for {lead.name || lead.email}?</span>
                    <button onClick={handleDataReset} disabled={resetting} style={{ padding: '3px 10px', borderRadius: '4px', border: '1px solid #4A1020', background: 'rgba(197,107,90,0.15)', color: '#C56B5A', fontSize: '11px', fontWeight: 600, cursor: resetting ? 'default' : 'pointer', opacity: resetting ? 0.6 : 1 }}>
                      {resetting ? 'Resetting…' : 'Confirm reset'}
                    </button>
                    <button onClick={() => setConfirmReset(false)} style={{ fontSize: '11px', color: '#8B8478', background: 'none', border: 'none', cursor: 'pointer', padding: '3px' }}>Cancel</button>
                  </>
                ) : (
                  <button
                    onClick={() => { setConfirmReset(true); setResetResult(null); }}
                    title="Wipe this user's app data — they will re-onboard on next login"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '4px', border: '1px solid #26221C', background: 'transparent', color: '#5C5648', fontSize: '11px', cursor: 'pointer', transition: 'all 0.12s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#B89968'; e.currentTarget.style.color = '#B89968'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#26221C'; e.currentTarget.style.color = '#5C5648'; }}
                  >
                    <RefreshCw size={10} /> Reset app data
                  </button>
                )}

                {/* Delete lead */}
                {confirmDelete ? (
                  <>
                    <span style={{ fontSize: '11px', color: '#B0A898' }}>Delete {lead.name || lead.email}?</span>
                    <button onClick={handleDelete} disabled={deleting} style={{ padding: '3px 10px', borderRadius: '4px', border: '1px solid #4A1020', background: 'rgba(197,107,90,0.15)', color: '#C56B5A', fontSize: '11px', fontWeight: 600, cursor: deleting ? 'default' : 'pointer', opacity: deleting ? 0.6 : 1 }}>
                      {deleting ? 'Deleting…' : 'Confirm delete'}
                    </button>
                    <button onClick={() => { setConfirmDelete(false); setDeleteError(null); }} style={{ fontSize: '11px', color: '#8B8478', background: 'none', border: 'none', cursor: 'pointer', padding: '3px' }}>Cancel</button>
                  </>
                ) : (
                  <button
                    onClick={() => { setConfirmDelete(true); setDeleteError(null); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '4px', border: '1px solid #26221C', background: 'transparent', color: '#5C5648', fontSize: '11px', cursor: 'pointer', transition: 'all 0.12s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#C56B5A'; e.currentTarget.style.color = '#C56B5A'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#26221C'; e.currentTarget.style.color = '#5C5648'; }}
                  >
                    <Trash2 size={10} /> Delete lead
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, iconColor = '#8B8478', title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <Icon size={14} color={iconColor} />
          <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#E8E2D5', margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
        </div>
        {subtitle && <p style={{ fontSize: '11px', color: '#5C5648', lineHeight: 1.5, margin: 0 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function RefreshBtn({ onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#5C5648', background: 'transparent', border: '1px solid #1E1C18', borderRadius: '4px', padding: '5px 10px', cursor: loading ? 'not-allowed' : 'pointer', flexShrink: 0, transition: 'color 0.12s, border-color 0.12s' }}
      onMouseEnter={e => { e.currentTarget.style.color = '#8B8478'; e.currentTarget.style.borderColor = '#26221C'; }}
      onMouseLeave={e => { e.currentTarget.style.color = '#5C5648'; e.currentTarget.style.borderColor = '#1E1C18'; }}>
      <RefreshCw size={10} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
      Refresh
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

// ── Pagination bar ────────────────────────────────────────────────────────────
function PaginationBar({ page, pageSize, total, onPrev, onNext, itemLabel = 'items' }) {
  if (total === 0) return null;
  const from  = page * pageSize + 1;
  const to    = Math.min((page + 1) * pageSize, total);
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0 4px', borderTop: '1px solid #1A1610', marginTop: '12px' }}>
      <span style={{ fontSize: '10px', color: '#5C5648' }}>
        Showing {from}–{to} of {total} {itemLabel}
      </span>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={onPrev}
          disabled={page === 0}
          style={{ fontSize: '11px', padding: '4px 11px', borderRadius: '4px', border: '1px solid #26221C', background: 'none', color: page === 0 ? '#2A2520' : '#8B8478', cursor: page === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.12s' }}
          onMouseEnter={e => { if (page > 0) { e.currentTarget.style.borderColor = '#5C5648'; e.currentTarget.style.color = '#B0A898'; } }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#26221C'; e.currentTarget.style.color = page === 0 ? '#2A2520' : '#8B8478'; }}
        >
          ← Prev
        </button>
        <span style={{ fontSize: '11px', color: '#4A4038', padding: '4px 8px', lineHeight: 1.5 }}>
          {page + 1} / {pages}
        </span>
        <button
          onClick={onNext}
          disabled={to >= total}
          style={{ fontSize: '11px', padding: '4px 11px', borderRadius: '4px', border: '1px solid #26221C', background: 'none', color: to >= total ? '#2A2520' : '#8B8478', cursor: to >= total ? 'not-allowed' : 'pointer', transition: 'all 0.12s' }}
          onMouseEnter={e => { if (to < total) { e.currentTarget.style.borderColor = '#5C5648'; e.currentTarget.style.color = '#B0A898'; } }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#26221C'; e.currentTarget.style.color = to >= total ? '#2A2520' : '#8B8478'; }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard({ user }) {
  const [leads, setLeads]                         = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState(null);
  const [activeFilter, setActiveFilter]           = useState('All');
  const [searchQuery, setSearchQuery]             = useState('');
  const [inviteTarget, setInviteTarget]           = useState(null);
  const [pinResets, setPinResets]                 = useState([]);
  const [pinResetsLoading, setPinResetsLoading]   = useState(false);
  const [accessReqs, setAccessReqs]               = useState([]);
  const [accessReqsLoading, setAccessReqsLoading] = useState(false);
  const [selectedIds, setSelectedIds]             = useState(new Set());
  const [bulkProcessing, setBulkProcessing]       = useState(false);
  const [bulkConfirmDelete, setBulkConfirmDelete] = useState(false);
  const [activeTab, setActiveTab]                 = useState('users');
  const [activityLogs, setActivityLogs]           = useState([]);
  const [activityLoading, setActivityLoading]     = useState(false);
  const [bulkInviteOpen, setBulkInviteOpen]       = useState(false);
  const [leadsPage, setLeadsPage]                 = useState(0);
  const [pinResetsPage, setPinResetsPage]         = useState(0);
  const [activityPage, setActivityPage]           = useState(0);

  const USERS_PAGE_SIZE    = 50;
  const PIN_PAGE_SIZE      = 25;
  const ACTIVITY_PAGE_SIZE = 30;

  const isAdmin = !!(user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));

  const fetchLeads = useCallback(async () => {
    if (!isAdmin || !supabase) return;
    setLoading(true); setError(null);
    try {
      const { data, error: err } = await supabase
        .from('early_access_leads').select('*').order('created_at', { ascending: false });
      if (err) throw err;
      setLeads(data || []);
    } catch (err) {
      console.error('[AdminDashboard] fetchLeads:', err);
      setError(err.message || 'Failed to load leads.');
    } finally { setLoading(false); }
  }, [isAdmin]);

  const fetchPinResets = useCallback(async () => {
    if (!isAdmin || !supabase) return;
    setPinResetsLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('pin_reset_requests').select('*').order('created_at', { ascending: false });
      if (!err) setPinResets(data || []);
    } catch {} finally { setPinResetsLoading(false); }
  }, [isAdmin]);

  const fetchAccessReqs = useCallback(async () => {
    if (!isAdmin || !supabase) return;
    setAccessReqsLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('access_requests').select('*').order('created_at', { ascending: false });
      if (!err) setAccessReqs(data || []);
    } catch {} finally { setAccessReqsLoading(false); }
  }, [isAdmin]);

  const deleteAccessReq = async (id) => {
    if (!supabase) return;
    try {
      const { error: err } = await supabase.from('access_requests').delete().eq('id', id);
      if (err) throw err;
      setAccessReqs(prev => prev.filter(r => r.id !== id));
    } catch (err) { console.error('[AdminDashboard] deleteAccessReq:', err); }
  };

  const fetchActivityLogs = useCallback(async () => {
    if (!isAdmin || !supabase) return;
    setActivityLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('admin_actions').select('*').order('created_at', { ascending: false }).limit(200);
      if (!err) setActivityLogs(data || []);
    } catch {} finally { setActivityLoading(false); }
  }, [isAdmin]);

  const logAdminAction = useCallback(async (action, targetEmail, metadata = {}) => {
    if (!supabase || !user?.email) return;
    try {
      const { data: newRow } = await supabase
        .from('admin_actions')
        .insert({ admin_email: user.email, target_email: targetEmail, action, metadata })
        .select().single();
      if (newRow) setActivityLogs(prev => [newRow, ...prev]);
    } catch (err) { console.warn('[AdminDashboard] logAction:', err.message); }
  }, [user?.email]);

  const approvePinReset = async (id) => {
    if (!supabase) return;
    try {
      await supabase.from('pin_reset_requests')
        .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: user?.email })
        .eq('id', id);
      setPinResets(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
      const req = pinResets.find(r => r.id === id);
      logAdminAction('approve_pin_reset', req?.user_email);
    } catch (err) { console.error('[AdminDashboard] approvePinReset:', err); }
  };

  const dismissPinReset = async (id) => {
    if (!supabase) return;
    try {
      await supabase.from('pin_reset_requests')
        .update({ status: 'dismissed', reviewed_at: new Date().toISOString(), reviewed_by: user?.email })
        .eq('id', id);
      setPinResets(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r));
      const req = pinResets.find(r => r.id === id);
      logAdminAction('dismiss_pin_reset', req?.user_email);
    } catch (err) { console.error('[AdminDashboard] dismissPinReset:', err); }
  };

  useEffect(() => {
    if (isAdmin && supabase) { fetchLeads(); fetchPinResets(); fetchAccessReqs(); fetchActivityLogs(); }
    else setLoading(false);
  }, [isAdmin, fetchLeads]);

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!supabase) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ textAlign: 'center' }}>
          <XCircle size={28} color="#D97757" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#D97757', fontSize: '14px', fontWeight: 600 }}>Supabase not configured</p>
          <p style={{ color: '#8B8478', fontSize: '12px', marginTop: '4px' }}>Check environment variables.</p>
        </div>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#5C5648', fontSize: '13px' }}>Access restricted.</p>
      </div>
    );
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const counts = {
    total:     leads.length,
    pending:   leads.filter(l => l.status === 'pending').length,
    active:    leads.filter(l => l.status === 'active').length,
    invited:   leads.filter(l => l.status === 'invited').length,
    suspended: leads.filter(l => l.status === 'suspended').length,
    rejected:  leads.filter(l => l.status === 'rejected').length,
    blocked:   leads.filter(l => l.status === 'blocked').length,
  };

  const q = searchQuery.toLowerCase().trim();
  const visible = leads.filter(l => {
    const matchFilter = activeFilter === 'All' || l.status === activeFilter.toLowerCase();
    const matchSearch = !q || (l.name || '').toLowerCase().includes(q) || (l.email || '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  // Paged slices
  const pagedLeads        = visible.slice(leadsPage * USERS_PAGE_SIZE, (leadsPage + 1) * USERS_PAGE_SIZE);
  const pagedPinResets    = pinResets.slice(pinResetsPage * PIN_PAGE_SIZE, (pinResetsPage + 1) * PIN_PAGE_SIZE);
  const pagedActivityLogs = activityLogs.slice(activityPage * ACTIVITY_PAGE_SIZE, (activityPage + 1) * ACTIVITY_PAGE_SIZE);

  // Select-all operates across ALL filtered leads (not just current page)
  const visibleIds          = visible.map(l => l.id);
  const allVisibleSelected  = visibleIds.length > 0 && visibleIds.every(id => selectedIds.has(id));
  const someVisibleSelected = visibleIds.some(id => selectedIds.has(id)) && !allVisibleSelected;

  const toggleSelectAll = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allVisibleSelected) visibleIds.forEach(id => next.delete(id));
      else visibleIds.forEach(id => next.add(id));
      return next;
    });
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const sendActivationEmail = useCallback(async (lead) => {
    if (!supabase || !lead?.email) return;
    const firstName = (lead.name || '').split(' ')[0] || 'there';
    const body =
`Hi ${firstName},

Your Royal Ledger account has been activated. You can now log in and start using the platform:

https://royalledger.app

If you have any questions, just reply to this email.

— Royal Ledger Team`;
    try {
      await supabase.functions.invoke('send-invite', {
        body: { name: lead.name, email: lead.email, message: body, subject: 'Your Royal Ledger account is now active' },
      });
    } catch (err) {
      console.warn('[AdminDashboard] sendActivationEmail:', err.message);
    }
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const updateStatus = async (id, status) => {
    const now = new Date().toISOString();
    const patch = { status };
    if (status === 'rejected')  patch.rejected_at  = now;
    if (status === 'blocked')   patch.blocked_at   = now;
    if (status === 'suspended') patch.suspended_at = now;
    if (status === 'active')    patch.activated_at = now;
    try {
      const { error: err } = await supabase.from('early_access_leads').update(patch).eq('id', id);
      if (err) throw err;
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
      const lead = leads.find(l => l.id === id);
      logAdminAction('status_change', lead?.email, { status, name: lead?.name });
      if (status === 'active' && lead) sendActivationEmail(lead);
    } catch (err) { console.error('[AdminDashboard] updateStatus:', err); }
  };

  const handleBulkAction = async (status) => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    setBulkProcessing(true);
    const now = new Date().toISOString();
    const patch = { status };
    if (status === 'rejected')  patch.rejected_at  = now;
    if (status === 'blocked')   patch.blocked_at   = now;
    if (status === 'suspended') patch.suspended_at = now;
    if (status === 'active')    patch.activated_at = now;
    try {
      const { error: err } = await supabase.from('early_access_leads').update(patch).in('id', ids);
      if (err) throw err;
      setLeads(prev => prev.map(l => selectedIds.has(l.id) ? { ...l, ...patch } : l));
      const activatedLeads = leads.filter(l => ids.includes(l.id));
      const emails = activatedLeads.map(l => l.email);
      logAdminAction('bulk_status_change', null, { status, count: ids.length, emails });
      setSelectedIds(new Set());
      // Send activation emails in background (fire-and-forget per user)
      if (status === 'active') {
        activatedLeads.forEach(lead => sendActivationEmail(lead));
      }
    } catch (err) { console.error('[AdminDashboard] bulkAction:', err); }
    finally { setBulkProcessing(false); }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    setBulkProcessing(true);
    try {
      const { data: deleted, error: err } = await supabase
        .from('early_access_leads').delete().in('id', ids).select('id');
      if (err) throw err;
      if (!deleted || deleted.length === 0)
        throw new Error('Delete blocked by RLS — run rls-fix-migration.sql in Supabase SQL editor.');
      const deletedSet = new Set(deleted.map(r => r.id));
      const emails = leads.filter(l => deletedSet.has(l.id)).map(l => l.email);
      logAdminAction('bulk_delete', null, { count: deleted.length, emails });
      setLeads(prev => prev.filter(l => !deletedSet.has(l.id)));
      setSelectedIds(new Set()); setBulkConfirmDelete(false);
    } catch (err) {
      console.error('[AdminDashboard] bulkDelete:', err);
      setError(err.message || 'Bulk delete failed.');
      setBulkConfirmDelete(false);
    } finally { setBulkProcessing(false); }
  };

  const handleInviteSent = (idOrEmail, inviteCode) => {
    // id may be undefined if table pk isn't 'id' — fall back to matching by email
    const lead = leads.find(l => l.id === idOrEmail || l.email === idOrEmail);
    setLeads(prev => prev.map(l =>
      (l.id === idOrEmail || l.email === idOrEmail)
        ? { ...l, status: 'invited', invited_at: new Date().toISOString(), invite_code: inviteCode }
        : l
    ));
    logAdminAction('invite', lead?.email, { invite_code: inviteCode, name: lead?.name });
    setInviteTarget(null);
  };

  const handleBulkInviteAllSent = (sent) => {
    // Update local state for each successfully sent invite — match by id or email
    const now = new Date().toISOString();
    setLeads(prev => prev.map(l => {
      const s = sent.find(s => s.ok && (s.id === l.id || s.email === l.email));
      return s ? { ...l, status: 'invited', invited_at: now, invite_code: s.inviteCode } : l;
    }));
    setSelectedIds(new Set());
    const successEmails = sent.filter(s => s.ok).map(s => s.email);
    if (successEmails.length > 0) {
      logAdminAction('bulk_invite', null, { count: successEmails.length, emails: successEmails });
    }
  };

  const handleNoteSave  = (id, notes)       => setLeads(prev => prev.map(l => l.id === id ? { ...l, notes } : l));
  const handleCodeSave  = (id, invite_code) => setLeads(prev => prev.map(l => l.id === id ? { ...l, invite_code } : l));
  const handleDelete    = (id) => {
    const lead = leads.find(l => l.id === id);
    setLeads(prev => prev.filter(l => l.id !== id));
    setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    if (lead) logAdminAction('delete', lead.email, { name: lead.name });
  };

  const selectedCount     = selectedIds.size;
  const pendingPinResets  = pinResets.filter(r => r.status === 'pending');
  const pendingAccessReqs = accessReqs.filter(r => !r.status || r.status === 'pending');

  const exportCSV = () => {
    const rows = [
      ['Name', 'Email', 'Status', 'Country', 'Income type', 'Joined', 'Invite code'],
      ...leads.map(l => [l.name || '', l.email || '', l.status || '', l.country || '', l.income_type || '', fmt(l.created_at), l.invite_code || '']),
    ];
    const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: `royal-ledger-users-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click(); URL.revokeObjectURL(url);
  };

  // ── Shared button styles ──────────────────────────────────────────────────
  const headerBtnBase = {
    display: 'flex', alignItems: 'center', gap: '5px',
    padding: '6px 12px', borderRadius: '5px', fontSize: '11px',
    cursor: 'pointer', transition: 'all 0.12s', fontFamily: 'inherit',
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '32px 20px 60px', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Global header ── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5C5648', marginBottom: '6px' }}>
          Royal Ledger
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 300, color: '#E8E2D5', fontFamily: 'Georgia, serif', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
          Admin Control Panel
        </h1>
        <p style={{ color: '#5C5648', fontSize: '12px', margin: 0 }}>
          Manage users, access, invites, and recovery requests.
        </p>
      </div>

      {/* ── Priority banner: pending PIN resets ── */}
      {pendingPinResets.length > 0 && (
        <div style={{ background: 'rgba(217,119,87,0.06)', border: '1px solid rgba(217,119,87,0.22)', borderRadius: '7px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={13} color="#D97757" />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#D97757', marginBottom: '1px' }}>
                {pendingPinResets.length} PIN reset {pendingPinResets.length === 1 ? 'request needs' : 'requests need'} review
              </div>
              <div style={{ fontSize: '11px', color: '#B0A898' }}>
                These users are locked out and waiting for approval.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('pin')}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 13px', borderRadius: '5px', border: '1px solid rgba(217,119,87,0.35)', background: 'rgba(217,119,87,0.09)', color: '#D97757', fontSize: '11px', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
          >
            Review requests →
          </button>
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div className="admin-layout" style={{ display: 'flex', alignItems: 'flex-start' }}>

        {/* ── Left sidebar ── */}
        <nav
          className="admin-sidebar"
          style={{
            width: '172px',
            flexShrink: 0,
            marginRight: '28px',
            borderRight: '1px solid #1A1610',
            paddingRight: '20px',
          }}
        >
          <div
            className="nav-section-label"
            style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#26221C', padding: '0 14px', marginBottom: '8px' }}
          >
            Admin
          </div>

          {NAV_ITEMS.map((item, idx) => {
            const isActive = activeTab === item.id && !item.disabled;
            const badge    = item.id === 'pin' ? pendingPinResets.length : 0;
            const showDivider = idx === 1; // separator before disabled items

            return (
              <React.Fragment key={item.id}>
                {showDivider && (
                  <div className="nav-divider" style={{ height: '1px', background: '#1A1610', margin: '8px 14px' }} />
                )}
                <div className="nav-item-wrapper" style={{ position: 'relative', marginBottom: '1px' }}>
                  {/* Active left-border indicator */}
                  {isActive && (
                    <div
                      className="active-indicator"
                      style={{ position: 'absolute', left: 0, top: '7px', bottom: '7px', width: '2px', background: '#D97757', borderRadius: '1px' }}
                    />
                  )}
                  <button
                    className={[
                      'nav-btn',
                      isActive   ? 'nav-btn-active'   : '',
                      item.disabled ? 'nav-btn-disabled' : '',
                    ].join(' ').trim()}
                    onClick={() => { if (!item.disabled) setActiveTab(item.id); }}
                    disabled={item.disabled}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '7px 12px 7px 14px',
                      borderRadius: '5px', border: 'none',
                      background: isActive ? 'rgba(217,119,87,0.06)' : 'transparent',
                      color: item.disabled ? '#2A2520' : isActive ? '#E8E2D5' : '#8B8478',
                      cursor: item.disabled ? 'default' : 'pointer',
                      fontSize: '12px', textAlign: 'left',
                      transition: 'background 0.12s, color 0.12s',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={e => {
                      if (!item.disabled && !isActive) {
                        e.currentTarget.style.background = 'rgba(232,226,213,0.03)';
                        e.currentTarget.style.color = '#B0A898';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!item.disabled && !isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#8B8478';
                      }
                    }}
                  >
                    <item.icon size={12} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, lineHeight: 1.3, textAlign: 'left' }}>{item.label}</span>
                    {badge > 0 && !item.disabled && (
                      <span style={{ fontSize: '10px', fontWeight: 700, background: '#D97757', color: '#0A0908', borderRadius: '999px', padding: '0 5px', lineHeight: '16px', minWidth: '16px', textAlign: 'center', flexShrink: 0 }}>
                        {badge}
                      </span>
                    )}
                    {item.disabled && (
                      <span style={{ fontSize: '9px', color: '#1E1C18', letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>
                        soon
                      </span>
                    )}
                  </button>
                </div>
              </React.Fragment>
            );
          })}
        </nav>

        {/* ── Right content area ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ════════════════════ USERS TAB ════════════════════ */}
          {activeTab === 'users' && (
            <>
              {/* Tab action row */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '7px', marginBottom: '20px' }}>
                <button
                  onClick={exportCSV}
                  disabled={leads.length === 0}
                  title="Export users as CSV"
                  style={{ ...headerBtnBase, background: 'transparent', border: '1px solid #26221C', color: '#8B8478', opacity: leads.length === 0 ? 0.4 : 1, cursor: leads.length === 0 ? 'not-allowed' : 'pointer' }}
                  onMouseEnter={e => { if (leads.length > 0) { e.currentTarget.style.borderColor = '#8B8478'; e.currentTarget.style.color = '#B0A898'; } }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#26221C'; e.currentTarget.style.color = '#8B8478'; }}
                >
                  <Download size={11} /> Export
                </button>
                <button
                  onClick={() => setInviteTarget({ name: null, email: '' })}
                  style={{ ...headerBtnBase, background: 'transparent', border: '1px solid #2A4A20', color: '#7FA068', fontWeight: 500 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(127,160,104,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <UserPlus size={11} /> Invite user
                </button>
                <button
                  onClick={() => { fetchLeads(); fetchAccessReqs(); }}
                  disabled={loading}
                  title="Refresh"
                  style={{ ...headerBtnBase, background: 'transparent', border: '1px solid #26221C', color: '#8B8478', opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = '#8B8478'; e.currentTarget.style.color = '#B0A898'; } }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#26221C'; e.currentTarget.style.color = '#8B8478'; }}
                >
                  <RefreshCw size={11} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                  Refresh
                </button>
              </div>

              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '20px' }}>
                {[
                  { key: 'pending',   label: 'Pending',   subtitle: 'waiting review',     icon: Clock,       color: '#D97757' },
                  { key: 'active',    label: 'Active',     subtitle: 'using the system',   icon: CheckCircle, color: '#7FA068' },
                  { key: 'invited',   label: 'Invited',    subtitle: 'access sent',         icon: Mail,        color: '#B89968' },
                  { key: 'suspended', label: 'Suspended',  subtitle: 'temporarily paused', icon: ShieldOff,   color: '#B89968' },
                  { key: 'blocked',   label: 'Blocked',    subtitle: 'restricted',          icon: Lock,        color: '#C56B5A' },
                  { key: 'rejected',  label: 'Rejected',   subtitle: 'declined',            icon: XCircle,     color: '#8B8478' },
                ].map(({ key, label, subtitle, icon, color }) => (
                  <StatCard
                    key={key}
                    icon={icon}
                    label={label}
                    subtitle={subtitle}
                    count={counts[key]}
                    color={color}
                    active={activeFilter === label}
                    onClick={() => { setActiveFilter(label); setSelectedIds(new Set()); }}
                  />
                ))}
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: '#1A1610', marginBottom: '16px' }} />

              {/* Search + filter row */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '160px' }}>
                  <Search size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#4A4038', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    placeholder="Search name or email…"
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setLeadsPage(0); }}
                    style={{ width: '100%', background: '#0F0D0A', border: '1px solid #26221C', borderRadius: '5px', padding: '7px 10px 7px 28px', fontSize: '12px', color: '#E8E2D5', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.12s' }}
                    onFocus={e => e.target.style.borderColor = '#5C5648'}
                    onBlur={e => e.target.style.borderColor = '#26221C'}
                  />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(''); setLeadsPage(0); }} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#5C5648', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}>
                      <X size={11} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {FILTERS.map(f => {
                    const isActive = activeFilter === f;
                    const meta     = FILTER_META[f];
                    const cnt      = f !== 'All' ? counts[f.toLowerCase()] : null;
                    return (
                      <button
                        key={f}
                        onClick={() => { setActiveFilter(f); setSelectedIds(new Set()); setLeadsPage(0); }}
                        style={{ padding: '4px 11px', borderRadius: '999px', fontSize: '11px', fontWeight: isActive ? 700 : 400, border: `1px solid ${isActive ? meta.color : '#1E1C18'}`, background: isActive ? meta.bg : 'transparent', color: isActive ? meta.color : '#8B8478', cursor: 'pointer', transition: 'all 0.12s', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = '#26221C'; e.currentTarget.style.color = '#B0A898'; } }}
                        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = '#1E1C18'; e.currentTarget.style.color = '#8B8478'; } }}
                      >
                        {f}
                        {cnt != null && cnt > 0 && (
                          <span style={{ fontSize: '10px', background: isActive ? `${meta.color}30` : '#1A1810', color: isActive ? meta.color : '#5C5648', borderRadius: '999px', padding: '0 5px', fontWeight: 700, lineHeight: '16px' }}>
                            {cnt}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {(activeFilter !== 'All' || searchQuery) && (
                    <button
                      onClick={() => { setActiveFilter('All'); setSearchQuery(''); setSelectedIds(new Set()); setLeadsPage(0); }}
                      style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '11px', border: '1px solid #1E1C18', background: 'transparent', color: '#5C5648', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#8B8478'; e.currentTarget.style.borderColor = '#26221C'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#5C5648'; e.currentTarget.style.borderColor = '#1E1C18'; }}
                    >
                      <X size={9} /> Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Bulk action bar */}
              {selectedCount > 0 && (
                <BulkActionBar
                  count={selectedCount}
                  processing={bulkProcessing}
                  confirmDelete={bulkConfirmDelete}
                  onInvite={() => setBulkInviteOpen(true)}
                  onActivate={() => handleBulkAction('active')}
                  onSuspend={() => handleBulkAction('suspended')}
                  onBlock={() => handleBulkAction('blocked')}
                  onDelete={() => setBulkConfirmDelete(true)}
                  onConfirmDelete={handleBulkDelete}
                  onCancelDelete={() => setBulkConfirmDelete(false)}
                  onClearSelection={() => { setSelectedIds(new Set()); setBulkConfirmDelete(false); }}
                />
              )}

              {/* User list */}
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '24px 0', color: '#5C5648' }}>
                  <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '13px' }}>Loading users…</span>
                </div>
              ) : error ? (
                <div style={{ background: '#140809', border: '1px solid #4A1020', borderRadius: '6px', padding: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertTriangle size={14} color="#D97757" />
                  <div>
                    <div style={{ color: '#D97757', fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>Failed to load users</div>
                    <div style={{ color: '#B0A898', fontSize: '12px' }}>{error}</div>
                  </div>
                </div>
              ) : visible.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 24px' }}>
                  <Users size={22} style={{ margin: '0 auto 12px', color: '#26221C' }} />
                  {q || activeFilter !== 'All' ? (
                    <>
                      <p style={{ fontSize: '14px', color: '#8B8478', fontWeight: 500, marginBottom: '4px' }}>No matching users</p>
                      <p style={{ fontSize: '12px', color: '#5C5648' }}>Try clearing the search or changing the filter.</p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: '14px', color: '#8B8478', fontWeight: 500, marginBottom: '4px' }}>No users yet</p>
                      <p style={{ fontSize: '12px', color: '#5C5648' }}>Early access leads will appear here when people submit the form.</p>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div
                    onClick={toggleSelectAll}
                    style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 14px', cursor: 'pointer', color: '#4A4038', userSelect: 'none', borderRadius: '4px' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#8B8478'}
                    onMouseLeave={e => e.currentTarget.style.color = '#4A4038'}
                  >
                    {allVisibleSelected
                      ? <CheckSquare size={13} color="#7FA068" />
                      : someVisibleSelected
                        ? <MinusSquare size={13} color="#7FA068" />
                        : <Square size={13} />
                    }
                    <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {allVisibleSelected ? `Deselect all ${visible.length}` : `Select all ${visible.length}`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {pagedLeads.map(lead => (
                      <LeadRow
                        key={lead.id}
                        lead={lead}
                        selected={selectedIds.has(lead.id)}
                        onToggleSelect={toggleSelect}
                        onUpdateStatus={updateStatus}
                        onInvite={setInviteTarget}
                        onNoteSave={handleNoteSave}
                        onCodeSave={handleCodeSave}
                        onDelete={handleDelete}
                        onLogAction={logAdminAction}
                      />
                    ))}
                  </div>

                  <PaginationBar
                    page={leadsPage}
                    pageSize={USERS_PAGE_SIZE}
                    total={visible.length}
                    onPrev={() => setLeadsPage(p => Math.max(0, p - 1))}
                    onNext={() => setLeadsPage(p => p + 1)}
                    itemLabel="users"
                  />
                </div>
              )}

              {/* Access Requests */}
              <div style={{ marginTop: '36px', borderTop: '1px solid #1A1610', paddingTop: '24px' }}>
                <SectionHeader
                  icon={Inbox}
                  iconColor={pendingAccessReqs.length > 0 ? '#7FA068' : '#5C5648'}
                  title={`Access Requests${pendingAccessReqs.length > 0 ? ` · ${pendingAccessReqs.length} pending` : ''}`}
                  subtitle="From the in-app login page — people without an invite code. Send them one to grant access."
                  action={<RefreshBtn onClick={fetchAccessReqs} loading={accessReqsLoading} />}
                />

                {accessReqs.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#4A4038', padding: '8px 0' }}>No access requests yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {accessReqs.map(req => {
                      const isPending  = !req.status || req.status === 'pending';
                      const isApproved = req.status === 'approved';
                      const badgeColor = isApproved ? '#7FA068' : isPending ? '#D97757' : '#8B8478';
                      const badgeBg    = isApproved ? 'rgba(127,160,104,0.12)' : isPending ? 'rgba(217,119,87,0.12)' : 'rgba(92,86,72,0.12)';
                      return (
                        <div key={req.id} style={{ background: '#0F0D0A', border: `1px solid ${isPending ? '#2E2218' : '#1A1610'}`, borderRadius: '6px', padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '13px', color: '#E8E2D5', fontWeight: 500, marginBottom: '2px' }}>{req.email}</div>
                              <div style={{ fontSize: '10px', color: '#5C5648', marginBottom: req.message ? '8px' : 0 }}>{fmt(req.created_at)}</div>
                              {req.message && <div style={{ fontSize: '12px', color: '#8B8478', lineHeight: 1.55 }}>{req.message}</div>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                              <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '999px', background: badgeBg, color: badgeColor }}>
                                {req.status || 'pending'}
                              </span>
                              {isPending && (
                                <button
                                  onClick={() => setInviteTarget({ name: null, email: req.email })}
                                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#7FA068', background: 'none', border: '1px solid #2A4A20', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontWeight: 600, transition: 'background 0.12s' }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(127,160,104,0.08)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                >
                                  <Send size={9} /> Send invite
                                </button>
                              )}
                              <button
                                onClick={() => deleteAccessReq(req.id)}
                                title="Delete request"
                                style={{ display: 'flex', alignItems: 'center', padding: '4px 7px', borderRadius: '4px', border: '1px solid #26221C', background: 'none', color: '#5C5648', cursor: 'pointer', transition: 'all 0.12s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C56B5A'; e.currentTarget.style.color = '#C56B5A'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#26221C'; e.currentTarget.style.color = '#5C5648'; }}
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer totals */}
              <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid #141210', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: '#1E1C18' }}>
                  {counts.total} total · {counts.pending} pending · {counts.active} active
                </span>
                <span style={{ fontSize: '10px', color: '#1E1C18' }}>Royal Ledger Admin</span>
              </div>
            </>
          )}

          {/* ════════════════════ PIN RESET TAB ════════════════════ */}
          {activeTab === 'pin' && (
            <>
              <SectionHeader
                icon={KeyRound}
                iconColor={pendingPinResets.length > 0 ? '#D97757' : '#5C5648'}
                title={`PIN Reset Requests${pendingPinResets.length > 0 ? ` · ${pendingPinResets.length} pending` : ''}`}
                subtitle="Users who've forgotten their PIN. Approve to force re-setup on their next login."
                action={<RefreshBtn onClick={fetchPinResets} loading={pinResetsLoading} />}
              />

              {pinResetsLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '24px 0', color: '#5C5648' }}>
                  <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '13px' }}>Loading requests…</span>
                </div>
              ) : pinResets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <KeyRound size={22} style={{ margin: '0 auto 12px', color: '#26221C' }} />
                  <p style={{ fontSize: '14px', color: '#8B8478', fontWeight: 500, marginBottom: '4px' }}>No PIN reset requests</p>
                  <p style={{ fontSize: '12px', color: '#5C5648' }}>Requests appear here when users submit a PIN reset from the app.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pagedPinResets.map(req => {
                    const isPending  = req.status === 'pending';
                    const isApproved = req.status === 'approved';
                    const badgeColor = isPending ? '#D97757' : isApproved ? '#7FA068' : '#8B8478';
                    const badgeBg    = isPending ? 'rgba(217,119,87,0.12)' : isApproved ? 'rgba(127,160,104,0.12)' : 'rgba(92,86,72,0.12)';
                    return (
                      <div key={req.id} style={{ background: '#0F0D0A', border: `1px solid ${isPending ? '#2E1E18' : '#1A1610'}`, borderRadius: '6px', padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', color: '#E8E2D5', fontWeight: 500, marginBottom: '2px' }}>{req.user_email}</div>
                            <div style={{ fontSize: '10px', color: '#5C5648', marginBottom: req.reason ? '6px' : 0 }}>{fmt(req.created_at)}</div>
                            {req.reason && <div style={{ fontSize: '12px', color: '#8B8478', lineHeight: 1.55 }}>{req.reason}</div>}
                            {req.reviewed_at && (
                              <div style={{ fontSize: '10px', color: '#4A4038', marginTop: '6px' }}>
                                Reviewed {fmt(req.reviewed_at)} by {req.reviewed_by}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '999px', background: badgeBg, color: badgeColor }}>
                              {req.status}
                            </span>
                            {isPending && (
                              <>
                                <button
                                  onClick={() => approvePinReset(req.id)}
                                  style={{ fontSize: '11px', color: '#7FA068', background: 'none', border: '1px solid #2A4A20', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontWeight: 600, transition: 'background 0.12s' }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(127,160,104,0.08)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => dismissPinReset(req.id)}
                                  style={{ fontSize: '11px', color: '#8B8478', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                  Dismiss
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <PaginationBar
                    page={pinResetsPage}
                    pageSize={PIN_PAGE_SIZE}
                    total={pinResets.length}
                    onPrev={() => setPinResetsPage(p => Math.max(0, p - 1))}
                    onNext={() => setPinResetsPage(p => p + 1)}
                    itemLabel="requests"
                  />
                </div>
              )}
            </>
          )}

          {/* ════════════════════ ACTIVITY LOGS TAB ════════════════════ */}
          {activeTab === 'activity' && (
            <>
              <SectionHeader
                icon={Activity}
                iconColor="#B0A898"
                title="Activity Logs"
                subtitle="Every admin action — invites, status changes, deletions, PIN approvals."
                action={<RefreshBtn onClick={fetchActivityLogs} loading={activityLoading} />}
              />

              {activityLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '24px 0', color: '#8B8478' }}>
                  <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '13px' }}>Loading logs…</span>
                </div>
              ) : activityLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <Activity size={22} style={{ margin: '0 auto 12px', color: '#26221C' }} />
                  <p style={{ fontSize: '14px', color: '#8B8478', fontWeight: 500, marginBottom: '4px' }}>No activity yet</p>
                  <p style={{ fontSize: '12px', color: '#8B8478' }}>Admin actions will appear here as you invite, approve, and manage users.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {pagedActivityLogs.map((log, idx) => {
                    const meta     = ACTION_META[log.action] || { label: log.action, color: '#B0A898' };
                    const isLast   = idx === pagedActivityLogs.length - 1;
                    const ts       = log.created_at
                      ? new Date(log.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : '—';

                    // Build description
                    let description = meta.label;
                    if (log.target_email) description += ` ${log.target_email}`;
                    if (log.action === 'status_change' && log.metadata?.status) {
                      description = `Changed ${log.target_email} → ${log.metadata.status}`;
                    }
                    if (log.action === 'bulk_status_change') {
                      description = `Bulk set ${log.metadata?.count || '?'} users → ${log.metadata?.status}`;
                    }
                    if (log.action === 'bulk_delete') {
                      description = `Deleted ${log.metadata?.count || '?'} users`;
                    }
                    if (log.action === 'bulk_invite') {
                      description = `Sent bulk invite to ${log.metadata?.count || '?'} users`;
                    }

                    return (
                      <div key={log.id} style={{ display: 'flex', gap: '14px', paddingBottom: isLast ? 0 : '16px', position: 'relative' }}>
                        {/* Timeline line */}
                        {!isLast && (
                          <div style={{ position: 'absolute', left: '11px', top: '22px', bottom: 0, width: '1px', background: '#1A1610' }} />
                        )}
                        {/* Dot */}
                        <div style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', background: `${meta.color}18`, border: `1px solid ${meta.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: meta.color }} />
                        </div>
                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0, paddingBottom: '8px' }}>
                          <div style={{ fontSize: '13px', color: '#E8E2D5', lineHeight: 1.4, marginBottom: '3px' }}>
                            {description}
                          </div>
                          {log.metadata?.name && log.action === 'invite' && (
                            <div style={{ fontSize: '11px', color: '#8B8478', marginBottom: '2px' }}>
                              {log.metadata.name}
                              {log.metadata.invite_code && (
                                <span style={{ marginLeft: '8px', fontFamily: 'monospace', fontSize: '10px', color: '#8B8478', background: '#141210', padding: '1px 6px', borderRadius: '3px', border: '1px solid #26221C' }}>
                                  {log.metadata.invite_code}
                                </span>
                              )}
                            </div>
                          )}
                          {log.action === 'bulk_status_change' && log.metadata?.emails?.length > 0 && (
                            <div style={{ fontSize: '11px', color: '#8B8478', marginBottom: '2px' }}>
                              {log.metadata.emails.slice(0, 3).join(', ')}{log.metadata.emails.length > 3 ? ` +${log.metadata.emails.length - 3} more` : ''}
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '10px', color: '#8B8478' }}>{ts}</span>
                            {log.admin_email && (
                              <>
                                <span style={{ fontSize: '10px', color: '#4A4038' }}>·</span>
                                <span style={{ fontSize: '10px', color: '#8B8478' }}>{log.admin_email}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <PaginationBar
                    page={activityPage}
                    pageSize={ACTIVITY_PAGE_SIZE}
                    total={activityLogs.length}
                    onPrev={() => setActivityPage(p => Math.max(0, p - 1))}
                    onNext={() => setActivityPage(p => p + 1)}
                    itemLabel="log entries"
                  />
                </div>
              )}
            </>
          )}

        </div>{/* end content area */}
      </div>{/* end two-column layout */}

      {/* Invite modal */}
      {inviteTarget && (
        <InviteModal
          lead={inviteTarget}
          onClose={() => setInviteTarget(null)}
          onSent={handleInviteSent}
        />
      )}

      {/* Bulk invite modal */}
      {bulkInviteOpen && (
        <BulkInviteModal
          leads={leads.filter(l => selectedIds.has(l.id))}
          onClose={() => setBulkInviteOpen(false)}
          onAllSent={(sent) => { handleBulkInviteAllSent(sent); setBulkInviteOpen(false); }}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* ── Mobile: sidebar becomes horizontal scrollable pills ── */
        @media (max-width: 640px) {
          .admin-layout {
            flex-direction: column !important;
          }
          .admin-sidebar {
            width: 100% !important;
            margin-right: 0 !important;
            border-right: none !important;
            padding-right: 0 !important;
            border-bottom: 1px solid #1A1610;
            padding-bottom: 10px;
            margin-bottom: 20px;
            display: flex !important;
            flex-direction: row !important;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            gap: 5px;
            align-items: center;
            scrollbar-width: none;
          }
          .admin-sidebar::-webkit-scrollbar { display: none; }
          .nav-section-label { display: none !important; }
          .nav-divider { display: none !important; }
          .nav-item-wrapper {
            position: static !important;
            margin-bottom: 0 !important;
            flex-shrink: 0;
          }
          .active-indicator { display: none !important; }
          .nav-btn {
            white-space: nowrap !important;
            border-radius: 999px !important;
            border: 1px solid #1E1C18 !important;
            width: auto !important;
            padding: 5px 14px !important;
            flex-shrink: 0;
          }
          .nav-btn-active {
            border-color: #D97757 !important;
            background: rgba(217,119,87,0.08) !important;
            color: #D97757 !important;
          }
          .nav-btn-disabled {
            opacity: 0.35 !important;
          }
        }
      `}</style>
    </div>
  );
}
