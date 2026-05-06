// src/components/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import {
  RefreshCw, Users, Clock, CheckCircle, XCircle,
  Mail, Lock, Search, Send, FileText, AlertTriangle, X, KeyRound, Hash,
} from 'lucide-react';

const ADMIN_EMAILS = ['hello@royalledger.app', 'fasathor@gmail.com'];
const FILTERS = ['All', 'Pending', 'Invited', 'Rejected', 'Blocked'];

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

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ── Small UI primitives ────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    pending:  { bg: 'rgba(217,119,87,0.15)',  color: '#D97757', label: 'Pending'  },
    invited:  { bg: 'rgba(127,160,104,0.15)', color: '#7FA068', label: 'Invited'  },
    rejected: { bg: 'rgba(92,86,72,0.20)',    color: '#8B8478', label: 'Rejected' },
    blocked:  { bg: 'rgba(197,107,90,0.15)',  color: '#C56B5A', label: 'Blocked'  },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: '999px',
      fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em',
      textTransform: 'uppercase', background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, count, color }) {
  return (
    <div style={{
      background: '#0F0D0A', border: '1px solid #26221C', borderRadius: '8px',
      padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        <Icon size={13} color={color} />
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5C5648' }}>
          {label}
        </span>
      </div>
      <span style={{ fontSize: '34px', fontWeight: 300, color, lineHeight: 1, fontFamily: 'Georgia, serif' }}>
        {count}
      </span>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3A3028' }}>
        {label}
      </span>
      <span style={{ fontSize: '12px', color: '#5C5648' }}>{value || '—'}</span>
    </div>
  );
}

function ActionBtn({ label, active, color, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '5px 13px', borderRadius: '5px', fontSize: '12px',
        fontWeight: active ? 600 : 400,
        border: `1px solid ${active ? color : '#26221C'}`,
        background: active ? `${color}1A` : 'transparent',
        color: active ? color : '#5C5648',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'all 0.13s',
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.borderColor = active ? color : '#26221C'; e.currentTarget.style.color = active ? color : '#5C5648'; } }}
    >
      {label}
    </button>
  );
}

// ── Notes inline editor ────────────────────────────────────────────────────────

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
        <FileText size={11} style={{ color: '#3A3028', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {lead.notes
            ? <span style={{ fontSize: '12px', color: '#5C5648', lineHeight: 1.6 }}>{lead.notes}</span>
            : <span style={{ fontSize: '12px', color: '#26221C', fontStyle: 'italic' }}>No notes</span>
          }
        </div>
        <button
          onClick={() => { setDraft(lead.notes || ''); setEditing(true); }}
          style={{ fontSize: '11px', color: '#3A3028', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: '0 2px' }}
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
          width: '100%', background: '#0A0908', border: '1px solid #3A3028',
          borderRadius: '4px', padding: '8px 10px', fontSize: '12px',
          color: '#E8E2D5', resize: 'vertical', lineHeight: 1.5,
          boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none',
        }}
      />
      <div style={{ display: 'flex', gap: '8px', marginTop: '6px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setEditing(false)}
          style={{ fontSize: '12px', color: '#5C5648', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            fontSize: '12px', color: '#7FA068', background: 'none',
            border: '1px solid #2A4A20', borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer',
            padding: '4px 10px', opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// ── Admin PIN manager (per lead) ───────────────────────────────────────────────

function PinManager({ lead, onPinSave }) {
  const [editing, setEditing] = useState(false);
  const [pin, setPin] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async (valueToSave) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('early_access_leads')
        .update({ assigned_pin: valueToSave || null })
        .eq('id', lead.id);
      if (error) throw error;
      onPinSave(lead.id, valueToSave || null);
      setEditing(false);
      setPin('');
    } catch (err) {
      console.error('[AdminDashboard] pinSave:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <KeyRound size={11} style={{ color: '#3A3028', flexShrink: 0 }} />
        <span style={{ fontSize: '12px', color: lead.assigned_pin ? '#7FA068' : '#3A3028' }}>
          {lead.assigned_pin ? `PIN assigned (${lead.assigned_pin})` : 'No PIN assigned'}
        </span>
        <button
          onClick={() => { setPin(''); setEditing(true); }}
          style={{ fontSize: '11px', color: '#5B7FB8', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {lead.assigned_pin ? 'Change' : 'Set PIN'}
        </button>
        {lead.assigned_pin && (
          <button
            onClick={() => save(null)}
            disabled={saving}
            style={{ fontSize: '11px', color: '#C56B5A', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', opacity: saving ? 0.5 : 1 }}
          >
            Clear
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <KeyRound size={11} style={{ color: '#5B7FB8', flexShrink: 0 }} />
      <input
        type="text"
        inputMode="numeric"
        maxLength={4}
        value={pin}
        onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
        placeholder="4 digits"
        autoFocus
        style={{
          width: '80px', background: '#0A0908', border: '1px solid #26221C',
          borderRadius: '4px', padding: '5px 8px', fontSize: '13px',
          color: '#E8E2D5', textAlign: 'center', letterSpacing: '0.3em', outline: 'none',
        }}
      />
      <button
        onClick={() => save(pin)}
        disabled={saving || pin.length !== 4}
        style={{ fontSize: '12px', color: '#7FA068', background: 'none', border: '1px solid #2A4A20', borderRadius: '4px', cursor: pin.length === 4 ? 'pointer' : 'not-allowed', padding: '4px 10px', opacity: (saving || pin.length !== 4) ? 0.5 : 1 }}
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
      <button
        onClick={() => { setEditing(false); setPin(''); }}
        style={{ fontSize: '12px', color: '#5C5648', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        Cancel
      </button>
    </div>
  );
}

// ── Invite code manager (per lead) ─────────────────────────────────────────────

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
      <Hash size={11} style={{ color: '#3A3028', flexShrink: 0 }} />
      <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3A3028' }}>
        Invite Code
      </span>
      {lead.invite_code
        ? <span style={{ fontSize: '12px', color: '#8B8478', fontFamily: 'monospace', letterSpacing: '0.08em' }}>{lead.invite_code}</span>
        : <span style={{ fontSize: '12px', color: '#26221C', fontStyle: 'italic' }}>None</span>
      }
      <button
        onClick={generate}
        disabled={generating}
        style={{ fontSize: '11px', color: '#D97757', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', opacity: generating ? 0.5 : 1 }}
      >
        {generating ? '…' : lead.invite_code ? 'Regenerate' : 'Generate'}
      </button>
    </div>
  );
}

// ── Invite modal ───────────────────────────────────────────────────────────────

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

      const { error: dbError } = await supabase
        .from('early_access_leads')
        .update({ status: 'invited', invited_at: new Date().toISOString(), invite_code: inviteCode })
        .eq('id', lead.id);
      if (dbError) throw dbError;

      onSent(lead.id, inviteCode);
    } catch (err) {
      console.error('[AdminDashboard] sendInvite:', err);
      setError(err.message || 'Failed to send. Check the browser console.');
      setSending(false);
    }
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10,9,8,0.9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0F1209', border: '1px solid #2A4A20',
          borderRadius: '8px', maxWidth: '520px', width: '100%',
          padding: '28px', position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#5C5648', padding: '4px' }}
        >
          <X size={14} />
        </button>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7FA068', marginBottom: '6px' }}>
            Send Invite Email
          </div>
          <div style={{ fontSize: '15px', color: '#E8E2D5', fontWeight: 500 }}>{lead.name}</div>
          <div style={{ fontSize: '12px', color: '#5C5648', marginTop: '2px' }}>{lead.email}</div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5C5648', display: 'block', marginBottom: '8px' }}>
            Message
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={11}
            style={{
              width: '100%', background: '#0A0908', border: '1px solid #26221C',
              borderRadius: '4px', padding: '12px', fontSize: '13px',
              color: '#E8E2D5', fontFamily: 'monospace', resize: 'vertical',
              lineHeight: 1.6, boxSizing: 'border-box', outline: 'none',
            }}
          />
          <div style={{ fontSize: '11px', color: '#3A3028', marginTop: '5px' }}>
            A unique invite code is appended automatically.
          </div>
        </div>

        {error && (
          <div style={{ background: '#1A0E0A', border: '1px solid #4A2018', borderRadius: '4px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#C56B5A', lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '9px 18px', background: 'none', border: '1px solid #26221C', borderRadius: '5px', color: '#8B8478', fontSize: '13px', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            style={{
              padding: '9px 18px', background: '#7FA068', border: 'none',
              borderRadius: '5px', color: '#0A0908', fontSize: '13px',
              fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer',
              opacity: sending ? 0.7 : 1,
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <Send size={13} />
            {sending ? 'Sending…' : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Lead row ───────────────────────────────────────────────────────────────────

function LeadRow({ lead, onUpdateStatus, onInvite, onNoteSave, onPinSave, onCodeSave }) {
  return (
    <div style={{ background: '#0F0D0A', border: '1px solid #26221C', borderRadius: '8px', padding: '20px' }}>

      {/* Top: name / email / badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#E8E2D5' }}>
              {lead.name || '—'}
            </span>
            {lead.invite_code && (
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#5C5648', background: '#1A1810', border: '1px solid #26221C', padding: '1px 6px', borderRadius: '3px' }}>
                {lead.invite_code}
              </span>
            )}
          </div>
          <span style={{ fontSize: '12px', color: '#5C5648', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Mail size={11} strokeWidth={1.5} />
            {lead.email || '—'}
          </span>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', paddingBottom: '14px', borderBottom: '1px solid #1A1610', marginBottom: '14px' }}>
        <MetaItem label="Country"  value={lead.country} />
        <MetaItem label="Income"   value={lead.income_type} />
        <MetaItem label="Joined"   value={fmt(lead.created_at)} />
        {lead.invited_at  && <MetaItem label="Invited"  value={fmt(lead.invited_at)} />}
        {lead.rejected_at && <MetaItem label="Rejected" value={fmt(lead.rejected_at)} />}
        {lead.blocked_at  && <MetaItem label="Blocked"  value={fmt(lead.blocked_at)} />}
      </div>

      {/* Interest */}
      {lead.interest && (
        <div style={{ paddingBottom: '14px', borderBottom: '1px solid #1A1610', marginBottom: '14px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3A3028', marginBottom: '4px' }}>
            Why interested
          </div>
          <div style={{ fontSize: '13px', color: '#5C5648', lineHeight: 1.6 }}>{lead.interest}</div>
        </div>
      )}

      {/* Notes */}
      <div style={{ paddingBottom: '14px', borderBottom: '1px solid #1A1610', marginBottom: '14px' }}>
        <NoteEditor lead={lead} onSave={onNoteSave} />
      </div>

      {/* PIN + Invite code */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '14px', borderBottom: '1px solid #1A1610', marginBottom: '14px' }}>
        <PinManager lead={lead} onPinSave={onPinSave} />
        <InviteCodeManager lead={lead} onCodeSave={onCodeSave} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Send invite (always available, re-sendable) */}
        <button
          onClick={() => onInvite(lead)}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '5px 13px', borderRadius: '5px',
            border: '1px solid #2A4A20', background: 'rgba(127,160,104,0.08)',
            color: '#7FA068', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Send size={11} />
          {lead.status === 'invited' ? 'Resend' : 'Send Invite'}
        </button>

        <ActionBtn
          label="Reject"
          active={lead.status === 'rejected'}
          color="#D97757"
          disabled={lead.status === 'rejected'}
          onClick={() => onUpdateStatus(lead.id, 'rejected')}
        />

        {lead.status === 'blocked'
          ? <ActionBtn label="Unblock" active={false} color="#7FA068" disabled={false} onClick={() => onUpdateStatus(lead.id, 'pending')} />
          : <ActionBtn label="Block"   active={false} color="#C56B5A" disabled={false} onClick={() => onUpdateStatus(lead.id, 'blocked')} />
        }

        {lead.status !== 'pending' && (
          <ActionBtn
            label="Reset to pending"
            active={false}
            color="#8B8478"
            disabled={false}
            onClick={() => onUpdateStatus(lead.id, 'pending')}
          />
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminDashboard({ user }) {
  // ── All hooks must be at top — before any conditional returns ──
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteTarget, setInviteTarget] = useState(null);

  const isAdmin = !!(user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));

  const fetchLeads = useCallback(async () => {
    if (!isAdmin || !supabase) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('early_access_leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (err) throw err;
      setLeads(data || []);
    } catch (err) {
      console.error('[AdminDashboard] fetchLeads:', err);
      setError(err.message || 'Failed to load leads.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && supabase) fetchLeads();
    else setLoading(false);
  }, [isAdmin, fetchLeads]);

  // ── Guard returns (after all hooks) ───────────────────────────────────────
  if (!supabase) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ textAlign: 'center' }}>
          <XCircle size={28} color="#D97757" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#D97757', fontSize: '14px', fontWeight: 600 }}>Supabase not configured</p>
          <p style={{ color: '#5C5648', fontSize: '12px', marginTop: '4px' }}>Check environment variables.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#3A3028', fontSize: '13px' }}>Access restricted.</p>
      </div>
    );
  }

  // ── Derived state ─────────────────────────────────────────────────────────
  const counts = {
    total:    leads.length,
    pending:  leads.filter(l => l.status === 'pending').length,
    invited:  leads.filter(l => l.status === 'invited').length,
    rejected: leads.filter(l => l.status === 'rejected').length,
    blocked:  leads.filter(l => l.status === 'blocked').length,
  };

  const q = searchQuery.toLowerCase().trim();
  const visible = leads.filter(l => {
    const matchFilter = activeFilter === 'All' || l.status === activeFilter.toLowerCase();
    const matchSearch = !q || (l.name || '').toLowerCase().includes(q) || (l.email || '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  // ── Actions ───────────────────────────────────────────────────────────────
  const updateStatus = async (id, status) => {
    const now = new Date().toISOString();
    const patch = { status };
    if (status === 'rejected') patch.rejected_at = now;
    if (status === 'blocked')  patch.blocked_at  = now;
    try {
      const { error: err } = await supabase.from('early_access_leads').update(patch).eq('id', id);
      if (err) throw err;
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
    } catch (err) {
      console.error('[AdminDashboard] updateStatus:', err);
    }
  };

  const handleInviteSent = (id, inviteCode) => {
    setLeads(prev => prev.map(l =>
      l.id === id ? { ...l, status: 'invited', invited_at: new Date().toISOString(), invite_code: inviteCode } : l
    ));
    setInviteTarget(null);
  };

  const handleNoteSave = (id, notes) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, notes } : l));
  };

  const handlePinSave = (id, assigned_pin) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, assigned_pin } : l));
  };

  const handleCodeSave = (id, invite_code) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, invite_code } : l));
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '36px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 300, color: '#E8E2D5', fontFamily: 'Georgia, serif', marginBottom: '4px' }}>
            Admin
          </h1>
          <p style={{ color: '#5C5648', fontSize: '12px' }}>
            {counts.total === 0 ? 'No leads yet' : `${counts.total} lead${counts.total !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <button
          onClick={fetchLeads}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', background: 'transparent',
            border: '1px solid #26221C', borderRadius: '6px',
            color: '#8B8478', fontSize: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '28px' }}>
        <StatCard icon={Clock}       label="Pending"  count={counts.pending}  color="#D97757" />
        <StatCard icon={CheckCircle} label="Invited"  count={counts.invited}  color="#7FA068" />
        <StatCard icon={XCircle}     label="Rejected" count={counts.rejected} color="#5C5648" />
        <StatCard icon={Lock}        label="Blocked"  count={counts.blocked}  color="#C56B5A" />
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={13} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#3A3028', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%', background: '#0F0D0A', border: '1px solid #26221C',
            borderRadius: '6px', padding: '9px 12px 9px 32px',
            fontSize: '13px', color: '#E8E2D5', boxSizing: 'border-box', outline: 'none',
          }}
        />
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {FILTERS.map(f => {
          const active = activeFilter === f;
          const cnt = f !== 'All' ? counts[f.toLowerCase()] : null;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '5px 14px', borderRadius: '999px', fontSize: '13px',
                border: `1px solid ${active ? '#D97757' : '#26221C'}`,
                background: active ? 'rgba(217,119,87,0.1)' : 'transparent',
                color: active ? '#D97757' : '#8B8478',
                fontWeight: active ? 600 : 400, cursor: 'pointer',
              }}
            >
              {f}
              {cnt != null && (
                <span style={{ marginLeft: '5px', fontSize: '11px', opacity: 0.7 }}>{cnt}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <p style={{ color: '#3A3028', fontSize: '13px', padding: '20px 0' }}>Loading leads…</p>
      ) : error ? (
        <div style={{ background: '#140809', border: '1px solid #4A1020', borderRadius: '6px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <AlertTriangle size={13} color="#D97757" />
            <span style={{ color: '#D97757', fontSize: '13px', fontWeight: 600 }}>Failed to load leads</span>
          </div>
          <p style={{ color: '#8B8478', fontSize: '12px' }}>{error}</p>
        </div>
      ) : visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#3A3028' }}>
          <Users size={26} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
          <p style={{ fontSize: '13px' }}>
            {q ? `No results for "${searchQuery}"` : `No ${activeFilter !== 'All' ? activeFilter.toLowerCase() + ' ' : ''}leads.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {visible.map(lead => (
            <LeadRow
              key={lead.id}
              lead={lead}
              onUpdateStatus={updateStatus}
              onInvite={setInviteTarget}
              onNoteSave={handleNoteSave}
              onPinSave={handlePinSave}
              onCodeSave={handleCodeSave}
            />
          ))}
        </div>
      )}

      {inviteTarget && (
        <InviteModal
          lead={inviteTarget}
          onClose={() => setInviteTarget(null)}
          onSent={handleInviteSent}
        />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
