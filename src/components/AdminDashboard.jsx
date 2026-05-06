import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RefreshCw, Users, Clock, CheckCircle, XCircle, Mail } from 'lucide-react';

const ADMIN_EMAILS = ['hello@royalledger.app', 'fasathor@gmail.com'];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function StatusBadge({ status }) {
  const styles = {
    pending: { background: 'rgba(217, 119, 87, 0.15)', color: '#D97757', label: 'Pending' },
    invited: { background: 'rgba(127, 160, 104, 0.15)', color: '#7FA068', label: 'Invited' },
    rejected: { background: 'rgba(92, 86, 72, 0.20)', color: '#8B8478', label: 'Rejected' },
  };
  const s = styles[status] || styles.pending;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        background: s.background,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, count, color }) {
  return (
    <div
      className="card p-6"
      style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon size={16} color={color} strokeWidth={2} />
        <span className="label" style={{ color: '#8B8478' }}>
          {label}
        </span>
      </div>
      <span
        className="display text-4xl"
        style={{ color: color, lineHeight: 1 }}
      >
        {count}
      </span>
    </div>
  );
}

const FILTERS = ['All', 'Pending', 'Invited', 'Rejected'];

export default function AdminDashboard({ user }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [updating, setUpdating] = useState(null);

  if (!supabase) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0A0908',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <div className="card p-6" style={{ maxWidth: '420px', textAlign: 'center' }}>
          <XCircle size={32} color="#D97757" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#E8E2D5', fontWeight: 600, marginBottom: '8px' }}>
            Supabase not configured
          </p>
          <p style={{ color: '#8B8478', fontSize: '14px' }}>
            The Supabase client is unavailable. Check your environment variables and
            the <code style={{ color: '#D97757' }}>src/lib/supabase.js</code> configuration.
          </p>
        </div>
      </div>
    );
  }

  if (!user?.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0A0908',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: '#5C5648', fontSize: '15px' }}>Access restricted.</p>
      </div>
    );
  }

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('early_access_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setLeads(data || []);
    } catch (err) {
      console.error('[AdminDashboard] Failed to fetch leads:', err);
      setError(err.message || 'Failed to load leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      const { error: updateError } = await supabase
        .from('early_access_leads')
        .update({ status })
        .eq('id', id);

      if (updateError) throw updateError;
      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? { ...lead, status } : lead))
      );
    } catch (err) {
      console.error('[AdminDashboard] Failed to update status:', err);
    } finally {
      setUpdating(null);
    }
  };

  const counts = {
    total: leads.length,
    pending: leads.filter((l) => l.status === 'pending').length,
    invited: leads.filter((l) => l.status === 'invited').length,
    rejected: leads.filter((l) => l.status === 'rejected').length,
  };

  const filteredLeads =
    activeFilter === 'All'
      ? leads
      : leads.filter(
          (l) => l.status === activeFilter.toLowerCase()
        );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0908',
        padding: '40px 24px',
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '40px',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 className="display text-4xl" style={{ color: '#E8E2D5', marginBottom: '6px' }}>
            Admin
          </h1>
          <p style={{ color: '#8B8478', fontSize: '14px' }}>
            {counts.total === 0
              ? 'No leads yet'
              : `${counts.total} lead${counts.total !== 1 ? 's' : ''} in early access`}
          </p>
        </div>
        <button
          onClick={fetchLeads}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid #26221C',
            borderRadius: '8px',
            color: '#8B8478',
            fontSize: '13px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#E8E2D5';
            e.currentTarget.style.borderColor = '#5C5648';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#8B8478';
            e.currentTarget.style.borderColor = '#26221C';
          }}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <StatCard icon={Clock} label="Pending" count={counts.pending} color="#D97757" />
        <StatCard icon={CheckCircle} label="Invited" count={counts.invited} color="#7FA068" />
        <StatCard icon={XCircle} label="Rejected" count={counts.rejected} color="#5C5648" />
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: '6px 16px',
                borderRadius: '999px',
                border: '1px solid',
                borderColor: isActive ? '#D97757' : '#26221C',
                background: isActive ? 'rgba(217, 119, 87, 0.12)' : 'transparent',
                color: isActive ? '#D97757' : '#8B8478',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {filter}
              {filter !== 'All' && (
                <span
                  style={{
                    marginLeft: '6px',
                    fontSize: '11px',
                    opacity: 0.7,
                  }}
                >
                  {counts[filter.toLowerCase()]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <p style={{ color: '#5C5648', fontSize: '14px', padding: '16px 0' }}>
          Loading leads…
        </p>
      ) : error ? (
        <div className="card p-6" style={{ borderColor: 'rgba(217, 119, 87, 0.3)' }}>
          <p style={{ color: '#D97757', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
            Error loading leads
          </p>
          <p style={{ color: '#8B8478', fontSize: '13px' }}>{error}</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            color: '#5C5648',
          }}
        >
          <Users size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p style={{ fontSize: '14px' }}>
            No {activeFilter !== 'All' ? activeFilter.toLowerCase() + ' ' : ''}leads yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredLeads.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              updating={updating === lead.id}
              onUpdateStatus={updateStatus}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function LeadRow({ lead, updating, onUpdateStatus }) {
  return (
    <div
      className="card p-6"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Top row: name / email / status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
          <span
            style={{
              color: '#E8E2D5',
              fontWeight: 600,
              fontSize: '15px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {lead.name || '—'}
          </span>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              color: '#8B8478',
              fontSize: '13px',
            }}
          >
            <Mail size={12} strokeWidth={1.5} />
            {lead.email || '—'}
          </span>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      {/* Meta row: country / income_type / interest / date */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        <MetaItem label="Country" value={lead.country} />
        <MetaItem label="Income" value={lead.income_type} />
        <MetaItem label="Interest" value={lead.interest} />
        <MetaItem label="Joined" value={formatDate(lead.created_at)} />
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          paddingTop: '4px',
          borderTop: '1px solid #26221C',
          flexWrap: 'wrap',
        }}
      >
        <ActionButton
          label="Invite"
          color="#7FA068"
          activeStatus="invited"
          currentStatus={lead.status}
          disabled={updating || lead.status === 'invited'}
          onClick={() => onUpdateStatus(lead.id, 'invited')}
        />
        <ActionButton
          label="Reject"
          color="#D97757"
          activeStatus="rejected"
          currentStatus={lead.status}
          disabled={updating || lead.status === 'rejected'}
          onClick={() => onUpdateStatus(lead.id, 'rejected')}
        />
        <ActionButton
          label="Reset"
          color="#8B8478"
          activeStatus="pending"
          currentStatus={lead.status}
          disabled={updating || lead.status === 'pending'}
          onClick={() => onUpdateStatus(lead.id, 'pending')}
        />
      </div>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span className="label" style={{ color: '#5C5648', fontSize: '10px' }}>
        {label}
      </span>
      <span style={{ color: '#8B8478', fontSize: '13px' }}>
        {value || '—'}
      </span>
    </div>
  );
}

function ActionButton({ label, color, activeStatus, currentStatus, disabled, onClick }) {
  const isActive = currentStatus === activeStatus;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '5px 14px',
        borderRadius: '6px',
        border: '1px solid',
        borderColor: isActive ? color : '#26221C',
        background: isActive ? `${color}1A` : 'transparent',
        color: isActive ? color : '#5C5648',
        fontSize: '12px',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = color;
          e.currentTarget.style.color = color;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = isActive ? color : '#26221C';
          e.currentTarget.style.color = isActive ? color : '#5C5648';
        }
      }}
    >
      {label}
    </button>
  );
}
