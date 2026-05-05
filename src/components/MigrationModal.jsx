// src/components/MigrationModal.jsx
//
// One-time migration prompt shown on first login when localStorage data exists.
// User can import existing data to cloud, or start fresh (local data preserved).

import React, { useState } from 'react';
import { ArrowRight, Check, X, Database, AlertTriangle } from 'lucide-react';
import { importLocalToCloud } from '../lib/dataLayer';

const STORAGE_KEY = 'open-trader-finance-v2';

const fmt = (n) => (n || 0).toLocaleString();

export default function MigrationModal({ user, onMigrated, onSkip }) {
  const [status, setStatus] = useState('idle'); // idle | migrating | done | error

  const localRaw = (() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
  })();

  if (!localRaw) {
    onSkip();
    return null;
  }

  const summary = {
    expenses: localRaw.expenses?.length || 0,
    snapshots: localRaw.snapshots?.length || 0,
    impulses: localRaw.impulses?.length || 0,
    pnl: localRaw.tradingPnLHistory?.length || 0,
  };

  const migrate = async () => {
    setStatus('migrating');
    const ok = await importLocalToCloud(user.id, localRaw);
    if (ok) {
      setStatus('done');
      setTimeout(() => {
        // Clear localStorage after successful migration
        try { localStorage.removeItem(STORAGE_KEY); } catch {}
        onMigrated(localRaw);
      }, 1200);
    } else {
      setStatus('error');
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(10, 9, 8, 0.95)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#0A0908', border: '1px solid #3A2A1E',
          borderRadius: '6px', maxWidth: '520px', width: '100%', padding: '36px',
        }}
      >
        {status === 'done' ? (
          <div className="text-center">
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1A3018', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Check size={24} style={{ color: '#7FA068' }} />
            </div>
            <div className="display text-2xl mb-2" style={{ fontStyle: 'italic', fontWeight: 300 }}>Imported.</div>
            <p className="text-sm" style={{ color: '#8B8478' }}>Your data is now in the cloud.</p>
          </div>
        ) : (
          <>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#1A1410', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Database size={20} style={{ color: '#D97757' }} />
            </div>

            <h2 className="display text-2xl mb-2" style={{ fontWeight: 300 }}>
              Import existing data?
            </h2>
            <p className="text-sm mb-6" style={{ color: '#8B8478', lineHeight: 1.6 }}>
              We found data in this browser. Import it to your cloud account so it's available on all your devices.
            </p>

            {/* Summary */}
            <div className="card p-4 mb-6">
              <div className="label mb-3" style={{ color: '#5C5648' }}>Found in this browser</div>
              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  { label: 'expenses', val: summary.expenses },
                  { label: 'snapshots', val: summary.snapshots },
                  { label: 'impulses', val: summary.impulses },
                  { label: 'P&L months', val: summary.pnl },
                ].map(item => (
                  <div key={item.label}>
                    <div className="mono text-xl" style={{ color: '#E8E2D5' }}>{fmt(item.val)}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#5C5648' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 text-sm mb-4" style={{ color: '#C56B5A' }}>
                <AlertTriangle size={14} />
                Import failed. Check your connection and try again.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={migrate}
                disabled={status === 'migrating'}
                className="btn flex-1 p-3"
                style={{
                  background: '#D97757', color: '#0A0908', borderRadius: '4px',
                  fontWeight: 600, fontSize: '14px',
                  opacity: status === 'migrating' ? 0.7 : 1,
                  cursor: status === 'migrating' ? 'not-allowed' : 'pointer',
                }}
              >
                {status === 'migrating' ? 'Importing…' : <>Import to cloud <ArrowRight size={14} className="inline ml-1" /></>}
              </button>
              <button
                onClick={onSkip}
                disabled={status === 'migrating'}
                className="btn p-3"
                style={{ color: '#8B8478', fontSize: '13px', background: 'transparent' }}
              >
                Start fresh
              </button>
            </div>

            <p className="text-xs mt-3" style={{ color: '#5C5648', lineHeight: 1.5 }}>
              "Start fresh" keeps your local data in this browser but doesn't upload it. You can always export it manually from Settings → Data &amp; Sync.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
