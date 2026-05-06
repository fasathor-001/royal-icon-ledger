// src/components/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import {
  RefreshCw, Users, Clock, CheckCircle, XCircle,
  Mail, Lock, Search, Send, FileText, AlertTriangle, X, KeyRound, Hash,
  ChevronDown, ChevronUp, Trash2,
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

function LeadRow({ lead, onUpdateStatus, onInvite, onNoteSave, onCodeSave, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.from('early_access_leads').delete().eq('id', lead.id);
      if (error) throw error;
      onDelete(lead.id);
    } catch (err) {
      console.error('[AdminDashboard] deleteLead:', err);
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div style={{ background: '#0F0D0A', border: '1px solid #26221C', borderRadius: '8px', overflow: 'hidden' }}>

      {/* ── Compact header row — always visible ── */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}
      >
        {/* Chevron */}
        <div style={{ flexShrink: 0, color: '#3A3028' }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>

        {/* Name + email */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#E8E2D5', whiteSpace: 'nowrap' }}>
              {lead.name || '—'}
            </span>
            <span style={{ fontSize: '12px', color: '#5C5648', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {lead.email}
            </span>
            {lead.invite_code && (
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#5C5648', background: '#1A1810', border: '1px solid #26221C', padding: '1px 6px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
                {lead.invite_code}
              </span>
            )}
          </div>
          <div style={{ fontSize: '11px', color: '#3A3028', marginTop: '2px' }}>
            {lead.country}{lead.income_type ? ` · ${lead.income_type}` : ''} · {fmt(lead.created_at)}
          </div>
        </div>

        {/* Status + quick actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <StatusBadge status={lead.status} />
          <button
            onClick={() => onInvite(lead)}
            title={lead.status === 'invited' ? 'Resend invite' : 'Send invite'}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '4px', border: '1px solid #2A4A20', background: 'transparent', color: '#7FA068', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
          >
            <Send size={10} />
            {lead.status === 'invited' ? 'Resend' : 'Invite'}
          </button>
          {lead.status === 'blocked'
            ? <button onClick={() => onUpdateStatus(lead.id, 'pending')} style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #2A4A20', background: 'transparent', color: '#7FA068', fontSize: '11px', cursor: 'pointer' }}>Unblock</button>
            : <button onClick={() => onUpdateStatus(lead.id, 'blocked')} style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #3A1818', background: 'transparent', color: '#C56B5A', fontSize: '11px', cursor: 'pointer' }}>Block</button>
          }
        </div>
      </div>

      {/* ── Expanded detail panel ── */}
      {expanded && (
        <div style={{ borderTop: '1px solid #1A1610', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Meta */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <MetaItem label="Country"  value={lead.country} />
            <MetaItem label="Income"   value={lead.income_type} />
            <MetaItem label="Joined"   value={fmt(lead.created_at)} />
            {lead.invited_at  && <MetaItem label="Invited"  value={fmt(lead.invited_at)} />}
            {lead.rejected_at && <MetaItem label="Rejected" value={fmt(lead.rejected_at)} />}
            {lead.blocked_at  && <MetaItem label="Blocked"  value={fmt(lead.blocked_at)} />}
          </div>

          {/* Interest */}
          {lead.interest && (
            <div style={{ paddingTop: '10px', borderTop: '1px solid #1A1610' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3A3028', marginBottom: '4px' }}>Why interested</div>
              <div style={{ fontSize: '13px', color: '#5C5648', lineHeight: 1.6 }}>{lead.interest}</div>
            </div>
          )}

          {/* Notes */}
          <div style={{ paddingTop: '10px', borderTop: '1px solid #1A1610' }}>
            <NoteEditor lead={lead} onSave={onNoteSave} />
          </div>

          {/* Invite code */}
          <div style={{ paddingTop: '10px', borderTop: '1px solid #1A1610' }}>
            <InviteCodeManager lead={lead} onCodeSave={onCodeSave} />
          </div>

          {/* Actions */}
          <div style={{ paddingTop: '10px', borderTop: '1px solid #1A1610', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <ActionBtn label="Reject" active={lead.status === 'rejected'} color="#D97757" disabled={lead.status === 'rejected'} onClick={() => onUpdateStatus(lead.id, 'rejected')} />
            {lead.status !== 'pending' && (
              <ActionBtn label="Reset to pending" active={false} color="#8B8478" disabled={false} onClick={() => onUpdateStatus(lead.id, 'pending')} />
            )}

            {/* Delete — right-aligned, confirmation step */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {confirmDelete ? (
                <>
                  <span style={{ fontSize: '12px', color: '#8B8478' }}>Delete {lead.name || lead.email}?</span>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #4A1020', background: 'rgba(197,107,90,0.15)', color: '#C56B5A', fontSize: '12px', fontWeight: 600, cursor: deleting ? 'default' : 'pointer', opacity: deleting ? 0.6 : 1 }}
                  >
                    {deleting ? 'Deleting…' : 'Confirm delete'}
                  </button>
                  <button onClick={() => setConfirmDelete(false)} style={{ fontSize: '12px', color: '#5C5648', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>Cancel</button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '4px', border: '1px solid #26221C', background: 'transparent', color: '#5C5648', fontSize: '12px', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#C56B5A'; e.currentTarget.style.color = '#C56B5A'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#26221C'; e.currentTarget.style.color = '#5C5648'; }}
                >
                  <Trash2 size={11} /> Delete lead
                </button>
              )}
            </div>
          </div>
        </div>
      )}
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
  const [pinResets, setPinResets] = useState([]);
  const [pinResetsLoading, setPinResetsLoading] = useState(false);

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

  const fetchPinResets = useCallback(async () => {
    if (!isAdmin || !supabase) return;
    setPinResetsLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('pin_reset_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (!err) setPinResets(data || []);
    } catch {} finally {
      setPinResetsLoading(false);
    }
  }, [isAdmin]);

  const approvePinReset = async (id) => {
    if (!supabase) return;
    try {
      await supabase
        .from('pin_reset_requests')
        .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: user?.email })
        .eq('id', id);
      setPinResets(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    } catch (err) {
      console.error('[AdminDashboard] approvePinReset:', err);
    }
  };

  const dismissPinReset = async (id) => {
    if (!supabase) return;
    try {
      await supabase
        .from('pin_reset_requests')
        .update({ status: 'dismissed', reviewed_at: new Date().toISOString(), reviewed_by: user?.email })
        .eq('id', id);
      setPinResets(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r));
    } catch (err) {
      console.error('[AdminDashboard] dismissPinReset:', err);
    }
  };

  useEffect(() => {
    if (isAdmin && supabase) { fetchLeads(); fetchPinResets(); }
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

  const handleCodeSave = (id, invite_code) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, invite_code } : l));
  };

  const handleDelete = (id) => {
    setLeads(prev => prev.filter(l => l.id !== id));
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
              onCodeSave={handleCodeSave}
              onDelete={handleDelete}
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

      {/* ── PIN Reset Requests ─────────────────────────────────────────────── */}
      <div style={{ marginTop: '48px', borderTop: '1px solid #1A1610', paddingTop: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
              <KeyRound size={15} color="#D97757" />
              <h2 style={{ fontSize: '18px', fontWeight: 400, color: '#E8E2D5', fontFamily: 'Georgia, serif' }}>PIN Reset Requests</h2>
            </div>
            <p style={{ fontSize: '12px', color: '#5C5648' }}>Users submit these when they've forgotten their PIN. Approve to force re-setup on their next login.</p>
          </div>
          <button onClick={fetchPinResets} disabled={pinResetsLoading} style={{ fontSize: '12px', color: '#5C5648', background: 'transparent', border: '1px solid #26221C', borderRadius: '5px', padding: '6px 12px', cursor: 'pointer' }}>
            <RefreshCw size={11} style={{ display: 'inline', marginRight: '5px', animation: pinResetsLoading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>

        {pinResets.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#3A3028', padding: '16px 0' }}>No PIN reset requests.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pinResets.map(req => {
              const isPending  = req.status === 'pending';
              const isApproved = req.status === 'approved';
              return (
                <div key={req.id} style={{ background: '#0F0D0A', border: `1px solid ${isPending ? '#3A2A1E' : '#1A1A1A'}`, borderRadius: '7px', padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#E8E2D5', fontWeight: 500, marginBottom: '3px' }}>{req.user_email}</div>
                      <div style={{ fontSize: '11px', color: '#3A3028' }}>Submitted: {fmt(req.created_at)}</div>
                      {req.reason && (
                        <div style={{ fontSize: '12px', color: '#8B8478', marginTop: '6px', lineHeight: 1.5 }}>
                          Reason: {req.reason}
                        </div>
                      )}
                      {req.reviewed_at && (
                        <div style={{ fontSize: '11px', color: '#3A3028', marginTop: '4px' }}>
                          Reviewed {fmt(req.reviewed_at)} by {req.reviewed_by}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span style={{
                        fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                        padding: '3px 10px', borderRadius: '999px',
                        background: isPending ? 'rgba(217,119,87,0.12)' : isApproved ? 'rgba(127,160,104,0.12)' : 'rgba(92,86,72,0.18)',
                        color: isPending ? '#D97757' : isApproved ? '#7FA068' : '#5C5648',
                      }}>
                        {req.status}
                      </span>
                      {isPending && (
                        <>
                          <button
                            onClick={() => approvePinReset(req.id)}
                            style={{ fontSize: '12px', color: '#7FA068', background: 'none', border: '1px solid #2A4A20', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => dismissPinReset(req.id)}
                            style={{ fontSize: '12px', color: '#5C5648', background: 'none', border: 'none', cursor: 'pointer' }}
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
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
