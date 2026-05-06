import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Wallet, Shield, TrendingUp, TrendingDown, Lock, Unlock, Clock, Brain,
  Sparkles, Flame, Coffee, ShoppingBag, Smartphone, Package,
  Calendar, Check, X, Plus, AlertTriangle, Briefcase, PiggyBank,
  ArrowRight, Activity, Heart, Users, Home, Camera, Edit2, Save, Award, KeyRound,
  MoreHorizontal, LayoutGrid, BookOpen, History as HistoryIcon, Settings as SettingsIcon, Info, Mail,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import Onboarding from './components/Onboarding';
import NotificationSettings, { PushPromptBanner } from './components/NotificationSettings';
import InstallPrompt from './components/InstallPrompt';
import Budget from './components/Budget';
import MonthlyReview, { useShouldShowReviewModal } from './components/MonthlyReview';
import RolloverModal from './components/RolloverModal';
import RitualCard from './components/RitualCard';
import WeeklyPulseBanner from './components/WeeklyPulseBanner';
import AdminDashboard from './components/AdminDashboard';
import { usePinGate, usePinRowGate, useSectionPin } from './components/PinGate';
import { CURRENCIES, getCurrency, makeFmt } from './lib/currency';
import { getInviteCodes, createInviteCode, deleteInviteCode, resetInviteCode, getAccessRequests, approveAccessRequest, rejectAccessRequest, queueNotification, loadData, importLocalToCloud } from './lib/dataLayer';

const STORAGE_KEY = 'open-trader-finance-v2';

const defaultData = {
  // === EVERYTHING IS USER-EDITABLE ===

  // Salary structure (you input these, system computes salary)
  expenses: [], // [{id, name, amount, category}]
  spendingBudget: 0,
  bufferReserve: 0,

  // Buffer thresholds (you set these, OR they auto-calculate from salary)
  bufferTargetMonths: 18, // System will compute target from this × salary
  bufferProtectMonths: 16,

  // Profit allocator stage rules (fully editable)
  stageRules: {
    stage1: { bufferPct: 100, longTermPct: 0, tradingPct: 0, goalsPct: 0, lifestylePct: 0 },
    stage15: { bufferPct: 55, longTermPct: 30, tradingPct: 0, goalsPct: 15, lifestylePct: 0 },
    stage2: { bufferPct: 65, longTermPct: 20, tradingPct: 0, goalsPct: 15, lifestylePct: 0 },
    stage3: { bufferPct: 0, longTermPct: 30, tradingPct: 30, goalsPct: 20, lifestylePct: 20 },
  },
  stage1End: 0, // Will default to 6 months × salary
  stage15End: 0, // Will default to 12 months × salary
  taxReservePct: 25,

  // Account balances (current snapshots — you update these)
  buffer: 0,
  tradingCapital: 0,
  tradingCapitalHighWater: 0,
  longTerm: 0,
  futureGoals: 0,
  goals: [],
  bufferProtectActive: false,

  // Time-series snapshots (auto-recorded when you save)
  snapshots: [], // [{date, buffer, tradingCapital, longTerm, totalAssets, salary}]

  // Trading P&L history
  tradingPnLHistory: [], // [{month, pnl, id}]
  profitAllocations: [],

  // Impulse tracking
  impulses: [],
  pending: [],
  spendingGateThreshold: 50,

  // Metadata
  lastSnapshot: null,
  setupComplete: false,

  lastBackupDate: null,

  envelopes: [],
  lastEnvelopeRollover: null,
  envelopeRolloverHistory: [],
  reviewedMonths: [],

  // Profile
  displayName: '',

  // Feature 4: PIN override for pin-mode blocks
  overridePin: '',

  // Feature 5: Trading day emotional guard
  tradingGuardUntil: null,

  // Push notification preferences (synced to push_subscriptions table)
  notificationPreferences: {
    dailyEnabled: true,
    weeklyEnabled: true,
    monthlyEnabled: true,
    preferredTime: '08:00',
    timezoneIana: null,    // populated on first Onboarding or NotificationSettings save
  },

  // Currency
  currency: 'ZAR',

  // Income profile — set during onboarding, adjusts which features are shown
  // 'variable' | 'fixed' | 'mixed' | null (null = legacy users, defaults to showing everything)
  incomeType: null,
};

const EXPENSE_CATEGORIES = [
  'Housing', 'Utilities', 'Food', 'Transportation', 'Childcare/Kids',
  'Family support', 'Insurance', 'Healthcare', 'Subscriptions', 'Other'
];

const CATEGORIES = {
  food: { label: 'Food / Dining', icon: Coffee, color: '#D97757' },
  clothes: { label: 'Clothes', icon: ShoppingBag, color: '#A06B8C' },
  tech: { label: 'Tech', icon: Smartphone, color: '#5B7FB8' },
  online: { label: 'Online Shopping', icon: Package, color: '#7FA068' },
  family: { label: 'Family / Kids', icon: Users, color: '#B89968' },
  other: { label: 'Other', icon: Sparkles, color: '#8B8478' },
};

const TRIGGERS = ['Bored', 'Stressed', 'Tired', 'Won a trade', 'Lost a trade', 'Family pressure', 'Scrolling', 'Saw an ad'];

// ── Foundation Mode Language System ──────────────────────────────────────────
// Centralised copy overrides for users who chose Foundation income type.
// Only used when data.mode === 'foundation'. Standard users see none of this.
const foundationCopy = {
  salary:         'Income',
  monthlySalary:  'Money Available',      // balance input label (already wired)
  buffer:         'Savings',              // balance input label (already wired)
  setupAndSalary: 'Setup & Income',       // nav label
  setupDesc:      'Add every expense honestly. The system works out how much money you need each month.',
  incomeHelper:   'Includes allowance, support, and any money you receive',
  salaryCardLabel:'Money Available',
  salaryCardNote: 'Based on your monthly needs',
  gettingStartedStep1Desc: 'Setup & Income → add every fixed cost. Your money available and savings target compute from this.',
  gettingStartedStep1Action: 'Go to Setup & Income',
  notSetupBody:   'Go to <strong>Setup & Income</strong> and add your real monthly expenses. Everything else recalculates from there — your money available and your savings target.',
};

// ── Mobile bottom navigation ──────────────────────────────────────────────────
function MobileBottomNav({ tab, setTab, user, data }) {
  const [showMore, setShowMore] = useState(false);
  const showTrading = data?.incomeType !== 'fixed' && data?.mode !== 'foundation';

  const primary = [
    { id: 'command',  label: 'Home',    Icon: Home },
    { id: 'impulse',  label: 'Gate',    Icon: Shield },
    { id: 'budget',   label: 'Budget',  Icon: Wallet },
    ...(showTrading ? [{ id: 'trading', label: 'Trade', Icon: TrendingUp }] : []),
  ];

  const secondary = [
    { id: 'setup',   label: data?.mode === 'foundation' ? foundationCopy.setupAndSalary : 'Setup & Salary' },
    { id: 'profit', label: data?.mode === 'foundation' ? 'Money Allocator' : data.incomeType === 'fixed' ? 'Surplus Allocator' : 'Profit Allocator' },
    { id: 'history', label: 'History' },
    { id: 'rules',   label: 'Rules' },
    ...(user ? [{ id: 'settings', label: 'Settings' }] : []),
  ];

  const isSecondaryActive = secondary.some(t => t.id === tab);

  return (
    <>
      {/* More menu backdrop */}
      {showMore && (
        <div onClick={() => setShowMore(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
      )}

      {/* More menu sheet */}
      {showMore && (
        <div style={{
          position: 'fixed', bottom: 'calc(64px + env(safe-area-inset-bottom))',
          left: 0, right: 0, zIndex: 999,
          background: '#14110E', borderTop: '1px solid #26221C',
          padding: '6px 0 10px',
        }}>
          {secondary.map(({ id, label }) => (
            <button key={id} onClick={() => { setTab(id); setShowMore(false); }} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '13px 24px', fontSize: 15, background: 'none', border: 'none',
              cursor: 'pointer', color: tab === id ? '#D97757' : '#8B8478',
              borderLeft: tab === id ? '3px solid #D97757' : '3px solid transparent',
            }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Bottom bar — mobile-nav-bar class handles display:flex + hidden at sm+ */}
      <nav className="mobile-nav-bar" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 997,
        background: '#0A0908', borderTop: '1px solid #26221C',
        height: 64, paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {primary.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => { setTab(id); setShowMore(false); }} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer',
              color: active ? '#D97757' : '#5C5648',
              transition: 'color 150ms',
            }}>
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
            </button>
          );
        })}
        <button onClick={() => setShowMore(s => !s)} style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 3,
          background: 'none', border: 'none', cursor: 'pointer',
          color: (showMore || isSecondaryActive) ? '#D97757' : '#5C5648',
          transition: 'color 150ms',
        }}>
          <MoreHorizontal size={20} strokeWidth={(showMore || isSecondaryActive) ? 2.2 : 1.8} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>More</span>
        </button>
      </nav>
    </>
  );
}

function OpenFinanceApp({ saveToCloud, loadFromCloud, user, onLogout, onChangePassword, onSignOutOthers, isNewUser, syncStatus = 'idle', isOnline = true, lastSyncedAt = null, onRetrySync = null, onRegisterForceUpdate = null } = {}) {
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  // Version tracking — managed in sync layer, not in React state
  const versionRef = React.useRef(null);       // current local _version
  const skipNextSaveRef = React.useRef(false); // suppress save on initial data load
  const [tab, setTab] = useState('command');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRolloverModal, setShowRolloverModal] = useState(false);
  const [showWeeklyPulse, setShowWeeklyPulse] = useState(false);
  const [pinBannerDismissed, setPinBannerDismissed] = useState(false);
  const [showGraduationModal, setShowGraduationModal] = useState(false);
  const shouldAutoShow = useShouldShowReviewModal(data);

  useEffect(() => {
    const init = async () => {
      try {
        if (loadFromCloud) {
          const remote = await loadFromCloud();
          if (remote) {
            versionRef.current = remote._version || 0;
            skipNextSaveRef.current = true;
            setData({ ...defaultData, ...remote });
            setLoading(false);
            return;
          }
        }
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          versionRef.current = parsed._version || 0;
          skipNextSaveRef.current = true;
          setData({ ...defaultData, ...parsed });
        }
      } catch (e) {}
      finally { setLoading(false); }
    };
    init();
  }, []);

  useEffect(() => {
    if (loading) return;
    // Suppress the initial load trigger — data hasn't changed, just initialized
    if (skipNextSaveRef.current) { skipNextSaveRef.current = false; return; }
    // Increment version on every real change
    if (versionRef.current === null) versionRef.current = 0;
    versionRef.current += 1;
    const dataToSave = { ...data, _version: versionRef.current, _localModifiedAt: Date.now() };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave)); } catch (e) {}
    if (saveToCloud) saveToCloud(dataToSave);
  }, [data, loading]);
  
  // Register a callback so App_v2.jsx can force-load a specific data snapshot
  // (used by conflict resolution "keep local" path)
  useEffect(() => {
    if (!onRegisterForceUpdate) return;
    onRegisterForceUpdate((newData) => {
      versionRef.current = newData._version || versionRef.current || 1;
      skipNextSaveRef.current = true;
      setData({ ...defaultData, ...newData });
    });
  }, [onRegisterForceUpdate]);

  // Show onboarding for new users or when setup hasn't been completed
  useEffect(() => {
    if (loading) return;
    const noData = !data.setupComplete && data.expenses.length === 0;
    if (noData || isNewUser) setShowOnboarding(true);
  }, [loading, data.setupComplete, data.expenses.length, isNewUser]);
  
  // Auto-show monthly review modal during review window
  useEffect(() => {
	if (loading) return;
	if (shouldAutoShow && !showReviewModal) {
	// Delay slightly so it doesn't pop instantly
	const timer = setTimeout(() => setShowReviewModal(true), 1500);
	return () => clearTimeout(timer);
	}
  }, [shouldAutoShow, loading]);
  
  useEffect(() => {
    const handler = (e) => setTab(e.detail);
    window.addEventListener('navigate-tab', handler);
    return () => window.removeEventListener('navigate-tab', handler);
  }, []);

  // Feature 3: Auto-rollover detection — trigger modal on first visit of new month
  useEffect(() => {
    if (loading || !(data.envelopes?.length)) return;
    if (!data.lastEnvelopeRollover) return; // First-time user — no prior month to roll
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
    if (data.lastEnvelopeRollover < prevKey) {
      const t = setTimeout(() => setShowRolloverModal(true), 2000);
      return () => clearTimeout(t);
    }
  }, [loading, data.envelopes?.length, data.lastEnvelopeRollover]);

  // Feature 5: Auto-expire trading guard
  useEffect(() => {
    if (loading || !data.tradingGuardUntil) return;
    if (Date.now() > data.tradingGuardUntil) {
      setData(d => ({ ...d, tradingGuardUntil: null }));
    }
  }, [loading, data.tradingGuardUntil]);

  // Feature 1: Weekly pulse via custom event (from RitualCard)
  useEffect(() => {
    const handler = () => setShowWeeklyPulse(true);
    window.addEventListener('show-weekly-pulse', handler);
    return () => window.removeEventListener('show-weekly-pulse', handler);
  }, []);
  
  // Computed values — all derived from user input
  const stats = useMemo(() => {
    const totalExpenses = data.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const salary = totalExpenses + (Number(data.spendingBudget) || 0) + (Number(data.bufferReserve) || 0);
    const bufferTarget = salary * data.bufferTargetMonths;
    const bufferProtectThreshold = salary * data.bufferProtectMonths;

    // Auto-default stage thresholds if not set
    const stage1End = data.stage1End || (salary * 6);
    const stage15End = data.stage15End || (salary * 12);
    const stage2End = bufferTarget;

    // Determine current stage
    let stage = 1;
    if (data.bufferProtectActive) stage = 'protect';
    else if (data.buffer >= stage2End) stage = 3;
    else if (data.buffer >= stage15End) stage = 2;
    else if (data.buffer >= stage1End) stage = 1.5;

    // Buffer position in progression — independent of protect mode
    const progressStage = data.buffer >= stage2End ? 3
      : data.buffer >= stage15End ? 2
      : data.buffer >= stage1End ? 1.5
      : 1;

    const monthsCovered = salary > 0 ? data.buffer / salary : 0;

    let nextThreshold = bufferTarget;
    let progressPct = 100;
    if (stage === 1) { nextThreshold = stage1End; progressPct = stage1End > 0 ? (data.buffer / stage1End) * 100 : 0; }
    else if (stage === 1.5) { nextThreshold = stage15End; progressPct = ((data.buffer - stage1End) / (stage15End - stage1End)) * 100; }
    else if (stage === 2) { nextThreshold = stage2End; progressPct = ((data.buffer - stage15End) / (stage2End - stage15End)) * 100; }
    else if (stage === 'protect') {
      // Show the next stage milestone the user needs to reach, not the full target
      if (progressStage === 1)        { nextThreshold = stage1End;   progressPct = stage1End > 0 ? (data.buffer / stage1End) * 100 : 0; }
      else if (progressStage === 1.5) { nextThreshold = stage15End;  progressPct = ((data.buffer - stage1End) / (stage15End - stage1End)) * 100; }
      else if (progressStage === 2)   { nextThreshold = stage2End;   progressPct = ((data.buffer - stage15End) / (stage2End - stage15End)) * 100; }
      else                            { nextThreshold = bufferTarget; progressPct = bufferTarget > 0 ? (data.buffer / bufferTarget) * 100 : 0; }
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const thisMonthImpulses = data.impulses.filter(i => i.timestamp >= monthStart);
    const thisMonthSpend = thisMonthImpulses.reduce((s, i) => s + i.amount, 0);
    const spendingLeft = Math.max(0, (Number(data.spendingBudget) || 0) - thisMonthSpend);

    const totalAssets = data.buffer + data.tradingCapital + data.longTerm + (data.futureGoals || 0);
    const ytdPnL = data.tradingPnLHistory.reduce((s, h) => s + h.pnl, 0);
	
	// Drawdown calculation
	const highWater = Math.max(data.tradingCapitalHighWater || 0, data.tradingCapital || 0);
	const drawdownAmount = highWater - data.tradingCapital;
	const drawdownPct = highWater > 0 ? (drawdownAmount / highWater) * 100 : 0;

	let drawdownZone = 'normal';
	if (drawdownPct >= 30) drawdownZone = 'stop';
	else if (drawdownPct >= 20) drawdownZone = 'defensive';
	else if (drawdownPct >= 10) drawdownZone = 'caution';

    return {
      totalExpenses, salary, bufferTarget, bufferProtectThreshold,
      stage1End, stage15End, stage2End, stage, progressStage,
      monthsCovered, nextThreshold, progressPct,
      thisMonthSpend, thisMonthImpulses, spendingLeft,
      totalAssets, ytdPnL,
	  highWater, drawdownPct, drawdownZone,
      isSetup: data.expenses.length > 0 && data.spendingBudget > 0,
    };
  }, [data]);

  const fmt = makeFmt(data.currency);

  // Auto-manage buffer-protect mode
  useEffect(() => {
    if (loading || stats.salary === 0) return;
    const shouldActivate = data.buffer < stats.bufferProtectThreshold && !data.bufferProtectActive;
    const shouldDeactivate = data.bufferProtectActive && data.buffer >= stats.bufferTarget;
    if (shouldActivate) setData(d => ({ ...d, bufferProtectActive: true }));
    else if (shouldDeactivate) setData(d => ({ ...d, bufferProtectActive: false }));
  }, [data.buffer, stats.salary, loading]);
  
  // Auto-update high water mark when trading capital reaches a new peak (skip for fixed-income users)
  useEffect(() => {
    if (loading) return;
    if (data.incomeType === 'fixed') return;
    if (data.tradingCapital > (data.tradingCapitalHighWater || 0)) {
      setData(d => ({ ...d, tradingCapitalHighWater: d.tradingCapital }));
    }
  }, [data.tradingCapital, data.incomeType, loading]);

  // Stage-change celebration notification
  const prevStageRef = React.useRef(null);
  useEffect(() => {
    if (!user || prevStageRef.current === null) {
      prevStageRef.current = stats.stage;
      return;
    }
    const prev = prevStageRef.current;
    const curr = stats.stage;
    const stageOrder = [1, 1.5, 2, 3];
    const prevIdx = stageOrder.indexOf(prev);
    const currIdx = stageOrder.indexOf(curr);
    if (currIdx > prevIdx && currIdx >= 0 && prevIdx >= 0) {
      queueNotification(user.id, 'stage_change', { newStage: curr });
    }
    prevStageRef.current = curr;
  }, [stats.stage, user]);

  // Drawdown alert when buffer falls below crisis floor
  const drawdownSentRef = React.useRef(false);
  useEffect(() => {
    if (!user) return;
    const belowFloor = data.buffer < stats.bufferProtectThreshold && stats.bufferProtectThreshold > 0;
    if (belowFloor && !drawdownSentRef.current) {
      drawdownSentRef.current = true;
      queueNotification(user.id, 'drawdown', {});
    }
    if (!belowFloor) drawdownSentRef.current = false;
  }, [data.buffer, stats.bufferProtectThreshold, user]);

  const [snapshotFlash, setSnapshotFlash] = useState(false);

	const takeSnapshot = () => {
	  const today = new Date().toISOString().slice(0, 10);
	  const snapshot = {
		date: today,
		buffer: data.buffer,
		tradingCapital: data.tradingCapital,
		longTerm: data.longTerm,
		totalAssets: stats.totalAssets,
		salary: stats.salary,
		monthsCovered: stats.monthsCovered,
		stage: stats.stage,
	  };

	  setData(d => ({
		...d,
		snapshots: [...d.snapshots.filter(s => s.date !== today), snapshot].sort((a, b) => a.date.localeCompare(b.date)),
		lastSnapshot: today,
	  }));

	  // Auto-download backup
	  const updatedData = {
		...data,
		snapshots: [...data.snapshots.filter(s => s.date !== today), snapshot].sort((a, b) => a.date.localeCompare(b.date)),
		lastSnapshot: today,
		lastBackupDate: new Date().toISOString(),
	  };

	  const exportPayload = {
		version: 'open-trader-finance-v2',
		exportedAt: new Date().toISOString(),
		data: updatedData,
	  };
	  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
	  const url = URL.createObjectURL(blob);
	  const a = document.createElement('a');
	  a.href = url;
	  a.download = `ledger-backup-${today}.json`;
	  document.body.appendChild(a);
	  a.click();
	  document.body.removeChild(a);
	  URL.revokeObjectURL(url);

	  // Mark backup as done
	  setData(d => ({ ...d, lastBackupDate: new Date().toISOString() }));
    setSnapshotFlash(true);
    setTimeout(() => setSnapshotFlash(false), 3000);
	};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0908' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: '24px', fontStyle: 'italic', color: '#8B8478' }}>Loading…</div>
      </div>
    );
  }
  
  if (showOnboarding) {
    return <Onboarding data={data} setData={setData} onComplete={() => { setShowOnboarding(false); setTab('command'); }} />;
  }

  return (
    <div className="app-shell" style={{ background: '#0A0908', color: '#E8E2D5', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <InstallPrompt />
	  <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .display { font-family: 'Fraunces', Georgia, serif; font-weight: 400; }
        .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }
        .label { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 600; }
        .card { background: #14110E; border: 1px solid #26221C; border-radius: 4px; }
        .card-warm { background: #1A1410; border: 1px solid #3A2A1E; border-radius: 4px; }
        .input { background: #0A0908; border: 1px solid #26221C; padding: 11px 13px; font-family: 'JetBrains Mono', monospace; outline: none; color: #E8E2D5; border-radius: 3px; width: 100%; font-size: 14px; }
        .input:focus { border-color: #D97757; }
        .input-text { background: #0A0908; border: 1px solid #26221C; padding: 11px 13px; font-family: 'Inter', sans-serif; outline: none; color: #E8E2D5; border-radius: 3px; width: 100%; font-size: 14px; }
        .input-text:focus { border-color: #D97757; }
        .input-inline { background: transparent; border: none; border-bottom: 1px dashed #5C5648; padding: 4px 2px; font-family: 'JetBrains Mono', monospace; outline: none; color: #E8E2D5; font-size: 14px; width: 100%; }
        .input-inline:focus { border-bottom-color: #D97757; border-bottom-style: solid; }
        .btn { transition: all 150ms ease; cursor: pointer; }
        .btn-primary { background: #D97757; color: #0A0908; padding: 12px 20px; font-weight: 600; border-radius: 3px; font-size: 13px; letter-spacing: 0.04em; }
        .btn-primary:hover { background: #E08868; }
        .btn-ghost { background: transparent; color: #8B8478; padding: 12px 20px; font-weight: 500; font-size: 13px; }
        .btn-ghost:hover { color: #E8E2D5; }
        .btn-secondary { background: #14110E; color: #E8E2D5; border: 1px solid #26221C; padding: 10px 16px; font-weight: 500; border-radius: 3px; font-size: 13px; }
        .btn-secondary:hover { border-color: #D97757; }
        .pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 500; }
        .tab-btn { padding: 16px 0; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 200ms; border-bottom: 2px solid transparent; white-space: nowrap; }
        .tab-active { color: #D97757; border-bottom-color: #D97757; }
        .tab-inactive { color: #5C5648; }
        .tab-inactive:hover { color: #8B8478; }
        .stab-btn { padding: 9px 0; font-size: 13px; font-weight: 400; cursor: pointer; transition: color 200ms, border-color 200ms; border: none; border-bottom: 2px solid transparent; white-space: nowrap; background: transparent; color: #5C5648; }
        .stab-active { color: #D97757; border-bottom-color: #D97757; font-weight: 600; }
        .stab-inactive:hover { color: #8B8478; }
        .stab-danger.stab-active { color: #C56B5A; border-bottom-color: #C56B5A; }
        .progress { height: 6px; background: #26221C; border-radius: 999px; overflow: hidden; }
        .progress-fill { height: 100%; transition: width 800ms cubic-bezier(0.4, 0, 0.2, 1); border-radius: 999px; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .slide-up { animation: slideUp 400ms ease both; }
        .glow-warm { box-shadow: 0 0 0 1px #D9775740, 0 12px 40px #D9775720; }
        .app-shell { height: 100vh; height: 100dvh; display: flex; flex-direction: column; overflow: hidden; }
        .main-scroll { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; }
        .main-content { padding: 20px 16px; padding-bottom: calc(64px + env(safe-area-inset-bottom) + 16px); }
        @media (min-width: 640px) { .main-content { padding: 32px 20px 40px; } }
        .mobile-nav-bar { display: flex; }
        @media (min-width: 640px) { .mobile-nav-bar { display: none; } }
      `}</style>

      <header className="border-b" style={{ borderColor: '#26221C', background: '#0A0908', flexShrink: 0, zIndex: 10 }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between" style={{ padding: '14px 20px' }}>
          <div className="flex items-baseline gap-3">
            <h1 className="display" style={{ fontSize: 22 }}>
              Royal <span style={{ fontStyle: 'italic', color: '#D97757' }}>Ledger</span>
            </h1>
            <span className="label hidden sm:inline" style={{ color: '#5C5648' }}>Personal finance for the disciplined</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2" style={{ borderRight: '1px solid #26221C', paddingRight: '12px' }}>
                <span className="text-xs" style={{ color: '#5C5648' }}>{data.displayName || user.email}</span>
                <button onClick={() => setTab('settings')} className="btn px-2 py-1 text-xs" style={{ color: '#8B8478', border: '1px solid #26221C', borderRadius: '3px' }}>
                  Settings
                </button>
                <button
                  onClick={onLogout}
                  className="btn px-2 py-1 text-xs"
                  style={{ color: '#C56B5A', border: '1px solid #3A2620', borderRadius: '3px' }}
                  title="Sign out"
                >
                  Sign out
                </button>
              </div>
            )}
            <button onClick={takeSnapshot} className="btn-secondary btn flex items-center gap-2" title="Save current state to history" style={{ padding: '7px 12px', color: snapshotFlash ? '#7FA068' : undefined, borderColor: snapshotFlash ? '#2A4A2A' : undefined, transition: 'color 0.3s, border-color 0.3s' }}>
              {snapshotFlash ? <Check size={14} /> : <Camera size={14} />}
              <span className="hidden sm:inline">{snapshotFlash ? 'Saved!' : 'Snapshot'}</span>
            </button>
            <div className="text-right">
              <div className="label hidden sm:block" style={{ color: '#5C5648', fontSize: 9 }}>NET WORTH</div>
              <div className="mono" style={{ fontSize: 'clamp(13px, 3.5vw, 18px)', fontWeight: 600 }}>{fmt(stats.totalAssets)}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop tab nav — hidden on mobile, replaced by bottom bar */}
      <nav className="border-b hidden sm:block" style={{ borderColor: '#26221C', background: '#0A0908', flexShrink: 0 }}>
        <div className="max-w-6xl mx-auto px-5 flex gap-7 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {[
            { id: 'command', label: 'Command' },
            { id: 'setup', label: data.mode === 'foundation' ? foundationCopy.setupAndSalary : 'Setup & Salary' },
            { id: 'budget', label: 'Budget' },
            { id: 'profit', label: data.mode === 'foundation' ? 'Money Allocator' : data.incomeType === 'fixed' ? 'Surplus Allocator' : 'Profit Allocator' },
            ...(data.incomeType !== 'fixed' && data.mode !== 'foundation' ? [{ id: 'trading', label: 'Trading P&L' }] : []),
            { id: 'impulse', label: 'Impulse Control' },
            { id: 'history', label: 'History' },
            { id: 'rules', label: 'Rules' },
            ...(user ? [{ id: 'settings', label: 'Settings' }] : []),
            ...(['hello@royalledger.app', 'fasathor@gmail.com'].includes(user?.email?.toLowerCase()) ? [{ id: 'admin', label: 'Admin' }] : []),
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn ${tab === t.id ? 'tab-active' : 'tab-inactive'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* PIN protection nudge */}
      {!data.overridePin && !pinBannerDismissed && (
        <div style={{ background: '#1A1610', borderBottom: '1px solid #3A2A1E', flexShrink: 0 }}>
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3" style={{ padding: '8px 20px' }}>
            <div className="flex items-center gap-2 flex-wrap" style={{ minWidth: 0 }}>
              <KeyRound size={13} style={{ color: '#D97757', flexShrink: 0 }} />
              <span className="text-xs" style={{ color: '#8B8478', whiteSpace: 'nowrap' }}>No PIN set — fields unprotected.</span>
              <button
                onClick={() => setTab('settings')}
                style={{ color: '#D97757', fontSize: 12, textDecoration: 'underline', background: 'none', border: 'none', padding: 0, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Set PIN in Settings →
              </button>
            </div>
            <button onClick={() => setPinBannerDismissed(true)} style={{ color: '#5C5648', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      <div style={{ flexShrink: 0 }}>
        <PushPromptBanner user={user} data={data} setData={setData} />
      </div>

      <div className="main-scroll">
        <main className="max-w-6xl mx-auto slide-up main-content" key={tab}>
        {tab === 'command' && <Command data={data} stats={stats} setData={setData} setTab={setTab} takeSnapshot={takeSnapshot} showWeeklyPulse={showWeeklyPulse} setShowWeeklyPulse={setShowWeeklyPulse} onRequestGraduate={() => setShowGraduationModal(true)} />}
        {tab === 'setup' && <Setup data={data} stats={stats} setData={setData} />}
		{tab === 'budget' && <Budget data={data} setData={setData} stats={stats} />}
        {tab === 'profit' && <ProfitAllocator data={data} stats={stats} setData={setData} />}
        {tab === 'trading' && <TradingTab data={data} stats={stats} setData={setData} />}
        {tab === 'impulse' && <ImpulseTab data={data} stats={stats} setData={setData} user={user} />}
        {tab === 'history' && <History data={data} stats={stats} setData={setData} />}
		{tab === 'review' && <MonthlyReview data={data} setData={setData} stats={stats} mode="tab" />}
        {tab === 'rules' && <Rules data={data} stats={stats} setData={setData} user={user} />}
        {tab === 'settings' && <AccountSettings user={user} onLogout={onLogout} onChangePassword={onChangePassword} onSignOutOthers={onSignOutOthers} data={data} setData={setData} syncStatus={syncStatus} isOnline={isOnline} lastSyncedAt={lastSyncedAt} onRetrySync={onRetrySync} />}
        {tab === 'admin' && <AdminDashboard user={user} />}
        </main>
      </div>

      {/* Mobile bottom nav — only visible on small screens */}
      <MobileBottomNav tab={tab} setTab={setTab} user={user} data={data} />

    {showReviewModal && (
      <MonthlyReview
        data={data}
        setData={setData}
        stats={stats}
        mode="modal"
        onClose={() => setShowReviewModal(false)}
      />
    )}

    {showRolloverModal && (
      <RolloverModal
        data={data}
        setData={setData}
        onClose={() => setShowRolloverModal(false)}
      />
    )}

    {/* ── Foundation graduation modal ────────────────────────────────────────
        Uses createPortal to render directly into document.body — completely
        outside any CSS stacking context in the app tree.                    */}
    {showGraduationModal && createPortal(
      <div
        onClick={() => setShowGraduationModal(false)}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(10,9,8,0.88)',
          zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: '#0F1209',
            border: '1px solid #3A5A2A',
            borderRadius: '8px',
            maxWidth: '480px',
            width: '100%',
            padding: '32px',
            position: 'relative',
          }}
        >
          {/* Dismiss */}
          <button
            onClick={() => setShowGraduationModal(false)}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#5C5648', padding: '4px',
            }}
          >
            <X size={16} />
          </button>

          {/* Icon + headline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Sparkles size={18} style={{ color: '#7FA068', flexShrink: 0 }} />
            <div style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: '22px', fontWeight: 300,
              color: '#E8E2D5', lineHeight: 1.2,
            }}>
              You built a real foundation.
            </div>
          </div>

          {/* Body */}
          <p style={{ fontSize: '14px', color: '#8B8478', lineHeight: 1.65, marginBottom: '20px' }}>
            You've shown discipline by saving and building control. You're ready for the full Royal Ledger system.
          </p>

          {/* What's unlocked */}
          <div style={{
            background: '#0A0D0A',
            border: '1px solid #26221C',
            borderRadius: '6px',
            padding: '16px 18px',
            marginBottom: '24px',
          }}>
            <div style={{
              fontSize: '11px', color: '#5C5648',
              fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: '12px',
            }}>
              You now have access to
            </div>
            {[
              'Deeper income planning',
              'Full money allocation tools',
              'Long-term savings and buffer structure',
              'Complete Royal Ledger dashboard',
            ].map(item => (
              <div key={item} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '13px', color: '#A8C49A',
                marginBottom: '8px', lineHeight: 1.4,
              }}>
                <span style={{ color: '#7FA068', fontSize: '11px', flexShrink: 0 }}>✦</span>
                {item}
              </div>
            ))}
          </div>

          {/* CTA — mode switch happens here, after user reads the modal */}
          <button
            onClick={() => {
              setShowGraduationModal(false);
              setData(d => ({ ...d, mode: 'standard' }));
              sessionStorage.setItem('rl_grad_modal', '1');
              if (!localStorage.getItem('rl_welcome_dismissed')) {
                sessionStorage.setItem('rl_just_graduated', '1');
              }
            }}
            style={{
              width: '100%',
              background: '#7FA068', color: '#0A0908',
              border: 'none', borderRadius: '4px',
              padding: '13px 20px',
              fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.01em',
            }}
          >
            Explore Royal Ledger →
          </button>
        </div>
      </div>,
      document.body
    )}
  </div>
  );
}

// ── Foundation behavioural nudge ─────────────────────────────────────────────
// No date fields are written during onboarding, so nudges are driven purely
// by what the user has actually done: tracked spending, set a goal, hit the goal.
// Returns { message, cta, ctaAction } or null (for non-Foundation / all done).
function getFoundationNudge({ hasLoggedExpense, hasSavingsGoal, savingsProgress }) {
  if (!hasLoggedExpense) {
    return {
      message: 'Start with one small action: track your next expense.',
      cta: 'Track spending',
      ctaAction: 'budget',
    };
  }
  if (!hasSavingsGoal) {
    return {
      message: 'Good start. Now give your savings a purpose.',
      cta: 'Add goal',
      ctaAction: 'goal',
    };
  }
  if (savingsProgress < 1) {
    return {
      message: 'Keep going — small amounts add up.',
      cta: null,
      ctaAction: null,
    };
  }
  // Goal reached
  return {
    message: 'Goal reached — now set your next target.',
    cta: 'Set new goal',
    ctaAction: 'goal',
  };
}

/* ─────────────── COMMAND ─────────────── */
function Command({ data, stats, setData, setTab, takeSnapshot, showWeeklyPulse, setShowWeeklyPulse, onRequestGraduate }) {
  const fmt = makeFmt(data.currency);
  const isFoundation = data?.mode === 'foundation';
  const [balancesLocked, setBalancesLocked] = useState(!!data.overridePin);
  const [goalEditing, setGoalEditing] = useState(false);
  const [goalDraft, setGoalDraft] = useState({ name: '', target: '' });
  const [goalError, setGoalError] = useState('');
  const [upgradeDismissed, setUpgradeDismissed] = useState(false);
  const [showStabilizeMessage, setShowStabilizeMessage] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const showGraduationWelcome = !welcomeDismissed && !!sessionStorage.getItem('rl_just_graduated');
  const dismissWelcome = () => {
    sessionStorage.removeItem('rl_just_graduated');
    localStorage.setItem('rl_welcome_dismissed', '1');
    setWelcomeDismissed(true);
  };
  const prevModeRef = React.useRef(data?.mode);

  // Detect the exact moment Foundation → standard upgrade happens this session.
  // useRef holds the previous mode; when the transition fires, show the one-time
  // stabilization banner. Local state only — resets on page refresh, which is fine.
  React.useEffect(() => {
    if (prevModeRef.current === 'foundation' && data?.mode === 'standard') {
      // Modal is shown before the mode switch (triggered by the graduation card button).
      // If mode was changed without the modal (e.g. programmatically / edge case),
      // fall back to the stabilization banner — but only if modal wasn't already shown.
      if (!sessionStorage.getItem('rl_grad_modal')) {
        setShowStabilizeMessage(true);
      }
    }
    prevModeRef.current = data?.mode;
  }, [data?.mode]);

  const openGoalEditor = () => {
    setGoalDraft({
      name: data.savingsGoal?.name || '',
      target: data.savingsGoal?.target || '',
    });
    setGoalError('');
    setGoalEditing(true);
  };

  const saveGoal = () => {
    const name = goalDraft.name.trim();
    const target = Number(goalDraft.target);
    if (!name) { setGoalError('Goal name cannot be empty.'); return; }
    if (!target || target <= 0) { setGoalError('Target must be greater than 0.'); return; }
    setData(d => ({ ...d, savingsGoal: { name, target } }));
    setGoalEditing(false);
    setGoalError('');
  };
  const { attempt: attemptUnlock, gate: unlockGate } = usePinGate(data.overridePin);

  // ── Foundation nudge state (behavioural — no date fields available) ──────────
  const hasLoggedExpense =
    (data.impulses?.length > 0) ||
    (data.envelopes || []).some(e => (e.spent || 0) > 0);
  const hasSavingsGoal = !!data.savingsGoal?.name;
  const savingsProgress =
    data.savingsGoal?.target > 0 ? data.buffer / data.savingsGoal.target : 0;
  const foundationNudge = isFoundation
    ? getFoundationNudge({ hasLoggedExpense, hasSavingsGoal, savingsProgress })
    : null;

  // ── Foundation graduation trigger ─────────────────────────────────────────
  // Fires when user has meaningfully used the system. Two signals (either is enough):
  // 1. Savings goal reached (most explicit — they set a target and hit it)
  // 2. No goal set but has saved at least half a month's money available (organic growth)
  const goalReached = hasSavingsGoal && savingsProgress >= 1;
  const hasBuiltSavings = !hasSavingsGoal && hasLoggedExpense && stats.salary > 0 && data.buffer >= stats.salary * 0.5;
  const showUpgradePrompt = isFoundation && (goalReached || hasBuiltSavings);

  const stageInfo = {
    1: { name: 'Stage 1', title: 'Build the Floor', color: '#C56B5A', desc: data.incomeType === 'fixed' ? '100% of surplus to buffer.' : '100% of profits to buffer.' },
    1.5: { name: 'Stage 1.5', title: 'Grow the Cushion', color: '#D97757', desc: 'Long-term investing begins — split by your stage rules.' },
    2: { name: 'Stage 2', title: 'Reach Fortified', color: '#B89968', desc: 'Buffer priority — final push to target.' },
    3: { name: 'Stage 3', title: 'Full Waterfall', color: '#7FA068', desc: 'Full waterfall unlocked — trading, lifestyle, goals.' },
    'protect': { name: 'Protect Mode', title: 'Buffer Rebuilding', color: '#C56B5A', desc: '100% to buffer until rebuilt.' },
  }[stats.stage];

  const now = Date.now();
  const readyToDecide = data.pending.filter(p => p.status === 'pending' && (now - p.timestamp) >= 24 * 60 * 60 * 1000);
  const daysSinceBackup = data.lastBackupDate
  ? Math.floor((Date.now() - new Date(data.lastBackupDate).getTime()) / (1000 * 60 * 60 * 24))
  : null;
const needsBackup = daysSinceBackup === null || daysSinceBackup >= 7;

  if (!stats.isSetup) {
    return (
      <div className="card-warm p-8 text-center">
        <Edit2 size={32} style={{ color: '#D97757' }} className="mx-auto mb-4" />
        <div className="display text-3xl mb-3" style={{ fontWeight: 300 }}>Let's start with your numbers.</div>
        <p className="mb-6 max-w-md mx-auto" style={{ color: '#8B8478' }}
          dangerouslySetInnerHTML={{ __html: isFoundation
            ? foundationCopy.notSetupBody
            : 'Go to <strong style="color:#E8E2D5">Setup &amp; Salary</strong> and add your real monthly expenses. Everything else recalculates from there — your salary, your buffer target, your stage thresholds.'
          }}
        />
        <button onClick={() => setTab('setup')} className="btn btn-primary">Set up my numbers →</button>
      </div>
    );
  }

  // Feature 5: is trading guard active?
  const guardActive = data.tradingGuardUntil && Date.now() < data.tradingGuardUntil;

  return (
    <div className="space-y-6">

      {/* Post-upgrade stabilization banner — shown once, session only, after Foundation → standard */}
      {showStabilizeMessage && (
        <div style={{
          background: '#14110E',
          border: '1px solid #3A2A1E',
          borderRadius: '6px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
            <Check size={14} style={{ color: '#D97757', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#8B8478', lineHeight: 1.5 }}>
              You now have more control over your money.{' '}
              <span style={{ color: '#E8E2D5' }}>Take it one step at a time.</span>
            </span>
          </div>
          <button
            onClick={() => setShowStabilizeMessage(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5C5648', flexShrink: 0, padding: '2px' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Foundation → Standard one-time welcome card ────────────────────────
          Shown immediately after the graduation modal CTA is tapped.
          Dismissed permanently via localStorage so it never reappears.     */}
      {showGraduationWelcome && (
        <div style={{
          background: 'linear-gradient(135deg, #0F1A0E 0%, #0A0F09 100%)',
          border: '1px solid #2A4A20',
          borderRadius: '10px',
          padding: '28px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle glow accent */}
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: '180px', height: '180px',
            background: 'radial-gradient(circle, rgba(127,160,104,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Dismiss */}
          <button
            onClick={dismissWelcome}
            style={{
              position: 'absolute', top: '14px', right: '14px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#5C5648', padding: '4px', lineHeight: 1,
            }}
            aria-label="Dismiss welcome message"
          >
            <X size={15} />
          </button>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#162512', border: '1px solid #2A4A20',
            borderRadius: '20px', padding: '4px 12px',
            marginBottom: '16px',
          }}>
            <Award size={12} style={{ color: '#7FA068' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#7FA068', textTransform: 'uppercase' }}>
              Foundation Graduate
            </span>
          </div>

          {/* Headline */}
          <h2 style={{
            fontSize: 'clamp(20px, 4vw, 26px)',
            fontWeight: 300,
            color: '#E8E2D5',
            letterSpacing: '-0.02em',
            marginBottom: '10px',
            lineHeight: 1.2,
            fontFamily: 'Georgia, serif',
          }}>
            Welcome to Royal Ledger.
          </h2>

          {/* Subline */}
          <p style={{ fontSize: '14px', color: '#8B8478', lineHeight: 1.7, marginBottom: '20px', maxWidth: '420px' }}>
            You built discipline before you built wealth — and that's the harder part.
            The full system is now yours. Take it one layer at a time.
          </p>

          {/* Feature bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '22px' }}>
            {[
              'Full income structure with buffer management',
              'Profit allocator — stage-based waterfall system',
              'Long-term savings, goals, and net worth tracking',
              'Complete financial history and monthly snapshots',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#7FA068', fontSize: '10px', marginTop: '4px', flexShrink: 0 }}>✦</span>
                <span style={{ fontSize: '13px', color: '#A8C49A', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={dismissWelcome}
              style={{
                background: '#7FA068', color: '#0A0908',
                border: 'none', borderRadius: '5px',
                padding: '10px 20px', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                letterSpacing: '0.01em',
              }}
            >
              Start exploring →
            </button>
            <span style={{ fontSize: '12px', color: '#3A3028' }}>
              Everything is ready. No setup needed.
            </span>
          </div>
        </div>
      )}

      {/* Feature 1: Weekly Pulse Banner */}
      <WeeklyPulseBanner
        data={data}
        stats={stats}
        forceShow={showWeeklyPulse}
        onDismiss={() => setShowWeeklyPulse(false)}
      />

      {/* Feature 5: Trading Day Emotional Guard — standard users only */}
      {guardActive && !isFoundation && (
        <div
          className="card-warm p-4 flex items-center gap-3"
          style={{
            borderColor: '#D9775760',
            boxShadow: '0 0 0 1px #D9775730',
            animation: 'pulse-border 2s ease infinite',
          }}
        >
          <style>{`@keyframes pulse-border { 0%,100%{box-shadow:0 0 0 1px #D9775730} 50%{box-shadow:0 0 0 2px #D9775750} }`}</style>
          <AlertTriangle size={16} style={{ color: '#D97757', flexShrink: 0 }} />
          <div className="flex-1 text-sm">
            <span style={{ color: '#E8E2D5', fontWeight: 500 }}>Down trading day detected. Impulse risk elevated.</span>
            <span style={{ color: '#8B8478' }}> All discretionary purchases above {fmt(data.spendingGateThreshold)} require 24h sleep.</span>
          </div>
          <div className="text-xs" style={{ color: '#5C5648' }}>
            Expires {new Date(data.tradingGuardUntil).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )}

      {/* Feature 6: Daily Checkpoints Card */}
      <RitualCard setTab={setTab} />

      {/* Getting started — shown until first snapshot is taken */}
      {stats.isSetup && data.snapshots.length === 0 && (
        <div style={{ background: '#0F0D0A', border: '1px solid #26221C', borderRadius: '6px', padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#5C5648', fontWeight: 600, marginBottom: '4px' }}>Getting started</div>
              <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '20px', fontWeight: 300, color: '#E8E2D5' }}>
                Three steps to activate your system.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                num: '1',
                done: data.expenses.length > 0,
                title: 'Add your monthly expenses',
                desc: isFoundation ? foundationCopy.gettingStartedStep1Desc : 'Setup & Salary → add every fixed cost. Your salary and buffer target compute from this.',
                action: isFoundation ? foundationCopy.gettingStartedStep1Action : 'Go to Setup & Salary',
                tab: 'setup',
                color: '#D97757',
              },
              {
                num: '2',
                done: data.buffer > 0 || data.tradingCapital > 0 || data.longTerm > 0,
                title: 'Enter your current balances',
                desc: 'Command → Current balances → Unlock to edit → enter what you actually have right now.',
                action: null,
                color: '#7FA068',
              },
              {
                num: '3',
                done: data.snapshots.length > 0,
                title: 'Save your first snapshot',
                desc: 'Hit "Save snapshot" above. This locks in today as your financial starting point — your history begins here.',
                action: null,
                color: '#5B7FB8',
              },
            ].map((step) => (
              <div key={step.num} style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px',
                padding: '14px 16px', borderRadius: '4px',
                background: step.done ? '#0A0D0A' : '#14110E',
                border: `1px solid ${step.done ? '#1E3018' : '#26221C'}`,
                opacity: step.done ? 0.6 : 1,
              }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                  background: step.done ? '#7FA068' : '#1A1610',
                  border: `1px solid ${step.done ? '#7FA068' : step.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', color: step.done ? '#0A0908' : step.color, fontWeight: 700,
                }}>
                  {step.done ? '✓' : step.num}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', color: step.done ? '#5C5648' : '#E8E2D5', fontWeight: 500, marginBottom: '3px', textDecoration: step.done ? 'line-through' : 'none' }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#5C5648', lineHeight: 1.5 }}>{step.desc}</div>
                </div>
                {step.action && !step.done && (
                  <button
                    onClick={() => setTab(step.tab)}
                    style={{ background: 'transparent', border: `1px solid ${step.color}40`, borderRadius: '3px', padding: '5px 10px', fontSize: '11px', color: step.color, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    {step.action} →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Check Pulse button (shown when not Sunday) */}
      {!showWeeklyPulse && new Date().getDay() !== 0 && stats.isSetup && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowWeeklyPulse(true)}
            className="btn px-3 py-1.5 text-xs"
            style={{ color: '#5B7FB8', border: '1px solid #1E2A3A', borderRadius: '3px', background: 'transparent' }}
          >
            <Activity size={11} className="inline mr-1" /> Check pulse
          </button>
        </div>
      )}

		{stats.isSetup && needsBackup && (
	  <div className="card-warm p-4 flex items-center gap-3" style={{ borderColor: '#3A2620' }}>
		<AlertTriangle size={16} style={{ color: '#D97757', flexShrink: 0 }} />
		<div className="flex-1 text-sm">
		  <span style={{ color: '#E8E2D5' }}>
			{daysSinceBackup === null
			  ? "You haven't backed up your data yet."
			  : `It's been ${daysSinceBackup} days since your last backup.`}
		  </span>
		  <span style={{ color: '#8B8478' }}> Your data lives only in this browser — back it up regularly.</span>
		</div>
		<button onClick={() => setTab('rules')} className="btn px-3 py-1.5 text-xs" style={{ background: '#D97757', color: '#0A0908', borderRadius: '3px', fontWeight: 600 }}>
		  Back up
		</button>
	  </div>
	)}
	{stats.isSetup && data.incomeType !== 'fixed' && !isFoundation && stats.drawdownZone !== 'normal' && data.tradingCapital > 0 && (
	  <div className="card-warm p-4 flex items-center gap-3" style={{ borderColor: stats.drawdownZone === 'stop' ? '#C56B5A60' : '#D9775760' }}>
		<AlertTriangle size={16} style={{ color: stats.drawdownZone === 'stop' ? '#C56B5A' : '#D97757', flexShrink: 0 }} />
		<div className="flex-1 text-sm">
		  <span style={{ color: '#E8E2D5', fontWeight: 500 }}>
			{stats.drawdownZone === 'stop' ? 'Stop trading.' : stats.drawdownZone === 'defensive' ? 'Defensive zone.' : 'Caution zone.'}
		  </span>
		  <span style={{ color: '#8B8478' }}> Trading capital is {stats.drawdownPct.toFixed(1)}% below high water. {stats.drawdownZone === 'stop' ? 'Full pause and strategy review required.' : stats.drawdownZone === 'defensive' ? 'Reduce position sizes by 50%.' : 'Reduce position sizes by 25%.'}</span>
		</div>
		<button onClick={() => setTab('trading')} className="btn px-3 py-1.5 text-xs" style={{ background: stats.drawdownZone === 'stop' ? '#C56B5A' : '#D97757', color: '#0A0908', borderRadius: '3px', fontWeight: 600 }}>
		  Review
		</button>
	  </div>
	)}
      {/* Foundation graduation prompt — takes priority over nudge when triggered */}
      {showUpgradePrompt && !upgradeDismissed ? (
        <div style={{
          background: '#0F1209',
          border: '1px solid #3A5A2A',
          borderRadius: '6px',
          padding: '24px 24px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
            <Sparkles size={16} style={{ color: '#7FA068', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#E8E2D5', marginBottom: '4px' }}>
                You've built a strong foundation.
              </div>
              <p style={{ fontSize: '13px', color: '#8B8478', lineHeight: 1.6, margin: 0 }}>
                Ready for more control over your money? The full system unlocks income structuring, advanced planning, and the full Royal Ledger dashboard.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={onRequestGraduate}
              style={{
                background: '#7FA068', color: '#0A0908', border: 'none',
                borderRadius: '3px', padding: '10px 20px',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Continue with full system →
            </button>
            <button
              onClick={() => setUpgradeDismissed(true)}
              style={{
                background: 'transparent', color: '#5C5648',
                border: '1px solid #26221C', borderRadius: '3px',
                padding: '10px 16px', fontSize: '13px', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Stay in Foundation
            </button>
          </div>
        </div>
      ) : foundationNudge ? (
        /* Foundation behavioural nudge — one message, calm, no pressure */
        <div style={{
          background: '#0F1A0E',
          border: '1px solid #2A4A2A',
          borderRadius: '6px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
            <Sparkles size={14} style={{ color: '#7FA068', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#A8C49A', lineHeight: 1.5 }}>
              {foundationNudge.message}
            </span>
          </div>
          {foundationNudge.cta && (
            <button
              onClick={() => {
                if (foundationNudge.ctaAction === 'budget') setTab('budget');
                else if (foundationNudge.ctaAction === 'goal') openGoalEditor();
              }}
              style={{
                background: 'transparent',
                color: '#7FA068',
                border: '1px solid #2A4A2A',
                borderRadius: '3px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {foundationNudge.cta} →
            </button>
          )}
        </div>
      ) : null}

      {/* Stage banner — Foundation gets a simple savings card */}
      {isFoundation ? (
        <div className="card-warm p-7 glow-warm">
          {/* Savings balance */}
          <div className="label mb-2" style={{ color: '#7FA068' }}>Your Savings</div>
          <div className="display text-4xl mb-4" style={{ fontWeight: 300, color: '#7FA068' }}>
            {fmt(data.buffer)}
          </div>

          {/* Goal section — inline editor */}
          {goalEditing ? (
            <div style={{ borderTop: '1px solid #2A3E2A', paddingTop: '20px', marginTop: '4px' }}>
              <div className="label mb-3" style={{ color: '#5C5648' }}>
                {data.savingsGoal ? 'Edit goal' : 'Set a goal'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder="Goal name (e.g. Laptop, Emergency fund)"
                  value={goalDraft.name}
                  onChange={e => { setGoalDraft(d => ({ ...d, name: e.target.value })); setGoalError(''); }}
                  style={{
                    background: '#0A0908', border: '1px solid #26221C', borderRadius: '3px',
                    padding: '10px 12px', fontSize: '14px', color: '#E8E2D5',
                    outline: 'none', fontFamily: 'Inter, sans-serif', width: '100%',
                  }}
                  autoFocus
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px', color: '#5C5648', fontFamily: 'JetBrains Mono, monospace' }}>
                    {getCurrency(data.currency).symbol}
                  </span>
                  <input
                    type="number"
                    placeholder="Target amount"
                    value={goalDraft.target}
                    onChange={e => { setGoalDraft(d => ({ ...d, target: e.target.value })); setGoalError(''); }}
                    style={{
                      background: '#0A0908', border: '1px solid #26221C', borderRadius: '3px',
                      padding: '10px 12px', fontSize: '14px', color: '#E8E2D5',
                      outline: 'none', fontFamily: 'JetBrains Mono, monospace', flex: 1,
                    }}
                  />
                </div>
              </div>
              {goalError && (
                <p style={{ fontSize: '12px', color: '#C56B5A', marginBottom: '10px' }}>{goalError}</p>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={saveGoal}
                  style={{
                    background: '#7FA068', color: '#0A0908', border: 'none', borderRadius: '3px',
                    padding: '9px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Save goal
                </button>
                <button
                  onClick={() => { setGoalEditing(false); setGoalError(''); }}
                  style={{
                    background: 'transparent', color: '#5C5648', border: '1px solid #26221C',
                    borderRadius: '3px', padding: '9px 14px', fontSize: '13px', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : data.savingsGoal?.name ? (
            /* Goal exists — show progress */
            <div style={{ borderTop: '1px solid #2A3E2A', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <div className="label" style={{ color: '#5C5648', marginBottom: '2px' }}>Savings Goal</div>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: '#E8E2D5' }}>{data.savingsGoal.name}</div>
                </div>
                <button
                  onClick={openGoalEditor}
                  style={{
                    background: 'transparent', color: '#5C5648', border: '1px solid #26221C',
                    borderRadius: '3px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Edit goal
                </button>
              </div>
              {(() => {
                const pct = Math.min(100, Math.round((data.buffer / data.savingsGoal.target) * 100));
                return (
                  <>
                    <div className="progress mb-2">
                      <div className="progress-fill" style={{ width: pct + '%', background: '#7FA068' }} />
                    </div>
                    <div className="flex justify-between text-xs mono" style={{ color: '#8B8478' }}>
                      <span>{fmt(data.buffer)} of {fmt(data.savingsGoal.target)} · {pct}%</span>
                      <span>{data.buffer >= data.savingsGoal.target ? '🎉 Goal reached!' : `${fmt(data.savingsGoal.target - data.buffer)} to go`}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            /* No goal yet */
            <div style={{ borderTop: '1px solid #2A3E2A', paddingTop: '16px' }}>
              <p style={{ fontSize: '14px', color: '#5C5648', lineHeight: 1.6, marginBottom: '12px' }}>
                Set a goal for your savings — a laptop, emergency fund, or anything worth working toward.
              </p>
              <button
                onClick={openGoalEditor}
                style={{
                  background: 'transparent', color: '#7FA068', border: '1px solid #2A4A2A',
                  borderRadius: '3px', padding: '8px 16px', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}
              >
                + Add goal
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card-warm p-7 glow-warm">
          <div className="flex items-baseline justify-between mb-3">
            <div className="label" style={{ color: stageInfo.color }}>{stageInfo.name} — {stageInfo.title}</div>
            <div className="mono text-xs" style={{ color: '#8B8478' }}>{stats.monthsCovered.toFixed(1)} months stored</div>
          </div>
          <h2 className="display text-3xl mb-3" style={{ fontWeight: 300, lineHeight: 1.2 }}>
            {stats.stage === 3
              ? <>Foundation is <span style={{ fontStyle: 'italic', color: '#7FA068' }}>solid</span>. Family is protected.</>
              : <>Building toward <span style={{ fontStyle: 'italic', color: '#D97757' }}>{fmt(stats.nextThreshold)}</span>.</>
            }
          </h2>
          <p style={{ color: '#8B8478', fontSize: '14px', lineHeight: 1.6 }}>{stageInfo.desc}</p>
          {stats.stage !== 3 && (
            <>
              <div className="progress mt-5 mb-2">
                <div className="progress-fill" style={{ width: Math.min(100, stats.progressPct) + '%', background: stageInfo.color }} />
              </div>
              <div className="flex justify-between text-xs mono" style={{ color: '#8B8478' }}>
                <span>{fmt(data.buffer)} / {fmt(stats.nextThreshold)}</span>
                <span>{fmt(stats.nextThreshold - data.buffer)} to go</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Editable balance inputs */}
      <section className="card p-7">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="display text-2xl">Current balances</h2>
          <div className="flex items-center gap-3">
            {data.overridePin && (
              <button
                onClick={() => {
                  if (balancesLocked) attemptUnlock(() => setBalancesLocked(false));
                  else setBalancesLocked(true);
                }}
                className="btn flex items-center gap-1 text-xs"
                style={{ color: balancesLocked ? '#5C5648' : '#7FA068', border: '1px solid #26221C', borderRadius: '3px', padding: '4px 10px' }}
              >
                <Lock size={11} />
                {balancesLocked ? 'Unlock to edit' : 'Lock'}
              </button>
            )}
            <button onClick={takeSnapshot} className="btn-secondary btn flex items-center gap-2 text-xs">
              <Camera size={12} /> Save snapshot
            </button>
          </div>
        </div>
        {unlockGate}
        <p className="text-sm mb-5" style={{ color: '#8B8478' }}>
          Update these whenever you want. Hit "Save snapshot" to record this moment in your history.
        </p>
        <div className={`grid md:grid-cols-2 ${data.incomeType === 'fixed' || isFoundation ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-3`}>
          {data.incomeType !== 'fixed' && !isFoundation && (
            <BalanceInput
              label="Trading Capital"
              icon={Briefcase}
              color="#5B7FB8"
              value={data.tradingCapital}
              onChange={(v) => setData(d => ({ ...d, tradingCapital: v }))}
              readOnly={!!data.overridePin && balancesLocked}
              currency={data.currency}
            />
          )}
          <BalanceInput
            label={isFoundation ? 'Savings' : 'Family Buffer'}
            icon={Shield}
            color={isFoundation ? '#7FA068' : stageInfo.color}
            value={data.buffer}
            onChange={(v) => setData(d => ({ ...d, buffer: v }))}
            readOnly={!!data.overridePin && balancesLocked}
            currency={data.currency}
          />
          <BalanceInput
            label={isFoundation ? 'Money Available' : 'Monthly Salary'}
            icon={Wallet}
            color="#D97757"
            value={stats.salary}
            readOnly
            note={isFoundation ? 'For this month' : 'Auto-computed from expenses'}
            currency={data.currency}
          />
          <BalanceInput
            label="Long-term"
            icon={PiggyBank}
            color="#7FA068"
            value={data.longTerm}
            onChange={(v) => setData(d => ({ ...d, longTerm: v }))}
            readOnly={!!data.overridePin && balancesLocked}
            currency={data.currency}
          />
          <BalanceInput
            label="Future Goals"
            icon={Award}
            color="#A06B8C"
            value={data.futureGoals || 0}
            onChange={(v) => setData(d => ({ ...d, futureGoals: v }))}
            readOnly={!!data.overridePin && balancesLocked}
            note={(data.goals || []).length > 0 ? `${(data.goals || []).length} goal${(data.goals || []).length === 1 ? '' : 's'}` : 'Add goals in Setup'}
            currency={data.currency}
          />
        </div>
      </section>

      {/* Stage progression visual — hidden for Foundation */}
      {!isFoundation && <section className="card p-7">
        <h2 className="display text-2xl mb-2">Progression</h2>
        <p className="text-sm mb-5" style={{ color: '#8B8478' }}>
          Salary {fmt(stats.salary)}/month · Target {data.bufferTargetMonths} months ({fmt(stats.bufferTarget)})
        </p>
        <div className="space-y-3">
          <StageRow label="Stage 1" target={`${fmt(0)} → ${fmt(stats.stage1End)}`} subtitle="Crisis floor — 6 months · 100% to buffer" done={data.buffer >= stats.stage1End} active={stats.progressStage === 1} />
          <StageRow label="Stage 1.5" target={`${fmt(stats.stage1End)} → ${fmt(stats.stage15End)}`} subtitle="Comfort zone — long-term investing begins" done={data.buffer >= stats.stage15End} active={stats.progressStage === 1.5} />
          <StageRow label="Stage 2" target={`${fmt(stats.stage15End)} → ${fmt(stats.bufferTarget)}`} subtitle={`Fortified — ${data.bufferTargetMonths} months · buffer priority`} done={data.buffer >= stats.bufferTarget} active={stats.progressStage === 2} />
          <StageRow label="Stage 3" target="Full waterfall" subtitle="Trading · lifestyle · goals all active" done={false} active={stats.progressStage === 3} />
        </div>
      </section>}

      {/* Spending and trading */}
      <div className="grid md:grid-cols-2 gap-3">
        <section className="card p-6">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="display text-xl">Spending this month</h3>
            <div className="mono text-sm" style={{ color: stats.spendingLeft > 0 ? '#E8E2D5' : '#C56B5A' }}>
              {fmt(stats.spendingLeft)} left
            </div>
          </div>
          {(() => {
            const pct = data.spendingBudget > 0 ? stats.thisMonthSpend / data.spendingBudget : 0;
            const barColor = pct > 0.8 ? '#C56B5A' : pct > 0.5 ? '#D97757' : '#7FA068';
            const pctDisplay = Math.round(pct * 100);
            return (
              <>
                <div style={{ position: 'relative', marginBottom: '6px' }}>
                  <div className="progress">
                    <div className="progress-fill" style={{ width: Math.min(100, pct * 100) + '%', background: barColor }} />
                  </div>
                  <span className="mono" style={{
                    position: 'absolute', right: 0, top: '-18px',
                    fontSize: '11px', fontWeight: 700, color: barColor, letterSpacing: '0.03em',
                  }}>
                    {pctDisplay}%
                  </span>
                </div>
                <div className="flex justify-between text-xs mono" style={{ color: '#8B8478' }}>
                  <span>{fmt(stats.thisMonthSpend)} spent</span>
                  <span>Limit: {fmt(data.spendingBudget)}</span>
                </div>
              </>
            );
          })()}
        </section>

        {isFoundation ? (
          <section className="card p-6">
            <div className="label mb-3" style={{ color: '#7FA068' }}>Foundation tip</div>
            <p className="text-sm" style={{ color: '#8B8478', lineHeight: 1.7 }}>
              Use the <strong style={{ color: '#E8E2D5' }}>Budget</strong> tab to set spending envelopes for groceries, transport, and fun money. When you stick to them, the unspent rand sweeps into your Savings automatically at month-end.
            </p>
          </section>
        ) : (
          <section className="card p-6">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="display text-xl">Trading P&L (YTD)</h3>
              <div className="mono text-sm" style={{ color: stats.ytdPnL >= 0 ? '#7FA068' : '#C56B5A' }}>
                {stats.ytdPnL >= 0 ? '+' : ''}{fmt(stats.ytdPnL)}
              </div>
            </div>
            <p className="text-xs" style={{ color: '#8B8478' }}>
              {data.tradingPnLHistory.length === 0 ? 'Log monthly P&L to track over time.' : `Across ${data.tradingPnLHistory.length} months.`}
            </p>
          </section>
        )}
      </div>

      {/* Pending decisions */}
      {readyToDecide.length > 0 && (
        <section className="card-warm p-6 glow-warm">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} style={{ color: '#D97757' }} />
            <h3 className="display text-xl">Time to decide</h3>
          </div>
          <p className="text-sm mb-4" style={{ color: '#8B8478' }}>{readyToDecide.length} purchase{readyToDecide.length > 1 ? 's' : ''} cleared the 24h gate.</p>
          <div className="space-y-2">
            {readyToDecide.map(p => <PendingRow key={p.id} item={p} setData={setData} currency={data.currency} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function BalanceInput({ label, icon: Icon, color, value, onChange, readOnly, note, currency }) {
  const fmt = makeFmt(currency);
  const { symbol: currencySymbol } = getCurrency(currency);
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} style={{ color }} />
        <span className="label" style={{ color: '#5C5648' }}>{label}</span>
      </div>
      {readOnly ? (
        <>
          <div className="display text-2xl mb-1" style={{ color, fontWeight: 300 }}>{fmt(value)}</div>
          {note && <div className="text-xs" style={{ color: '#5C5648' }}>{note}</div>}
        </>
      ) : (
        <>
          <div className="flex items-baseline gap-1">
            <span className="display text-xl" style={{ color }}>{currencySymbol}</span>
            <input
              type="number"
              value={value || ''}
              onChange={(e) => onChange(Number(e.target.value) || 0)}
              placeholder="0"
              className="input-inline display text-2xl"
              style={{ color, fontFamily: 'Fraunces, serif', fontWeight: 300 }}
            />
          </div>
          <div className="text-xs mt-1" style={{ color: '#5C5648' }}>Click to edit</div>
        </>
      )}
    </div>
  );
}

function StageRow({ label, target, subtitle, done, active }) {
  const color = done ? '#7FA068' : active ? '#D97757' : '#5C5648';
  return (
    <div
      className="flex gap-4 pb-3 border-b last:border-0"
      style={{
        borderColor: '#26221C',
        ...(active && !done ? {
          background: 'rgba(217, 119, 87, 0.07)',
          borderLeft: '3px solid #D97757',
          paddingLeft: '12px',
          marginLeft: '-15px',
          paddingRight: '4px',
          borderRadius: '2px',
        } : {}),
      }}
    >
      <div className="display italic text-sm" style={{ color, minWidth: '90px' }}>{label}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm" style={{ color: active && !done ? '#E8E2D5' : undefined }}>{target}</span>
          {done && <Check size={12} style={{ color: '#7FA068' }} />}
          {active && !done && (
            <span className="pill" style={{ background: '#3A1E10', color: '#D97757', padding: '3px 10px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em' }}>
              CURRENT
            </span>
          )}
        </div>
        <p className="text-xs" style={{ color: '#8B8478' }}>{subtitle}</p>
      </div>
    </div>
  );
}

function PendingRow({ item, setData, currency }) {
  const fmt = makeFmt(currency);
  const [done, setDone] = useState(null); // 'skipped' | 'bought'

  if (done) {
    return (
      <div className="flex items-center gap-2 p-3 border" style={{ borderColor: '#26221C', borderRadius: '3px', color: done === 'bought' ? '#C56B5A' : '#7FA068', fontSize: 13 }}>
        <Check size={13} />
        <span><strong>{item.name}</strong> — {done === 'bought' ? `logged as ${fmt(item.amount)} spend` : 'skipped'}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 border" style={{ borderColor: '#26221C', borderRadius: '3px' }}>
      <div>
        <div className="font-medium text-sm">{item.name}</div>
        <div className="mono text-xs mt-0.5" style={{ color: '#8B8478' }}>{fmt(item.amount)}</div>
      </div>
      <div className="flex gap-2">
        <button className="btn px-3 py-1.5 text-xs" style={{ color: '#7FA068', border: '1px solid #2A3A1E', borderRadius: '3px' }}
          onClick={() => {
            setDone('skipped');
            setTimeout(() => setData(d => ({ ...d, pending: d.pending.map(i => i.id === item.id ? { ...i, status: 'cancelled' } : i) })), 1200);
          }}>
          Skip
        </button>
        <button className="btn px-3 py-1.5 text-xs" style={{ color: '#C56B5A', border: '1px solid #3A2620', borderRadius: '3px' }}
          onClick={() => {
            setDone('bought');
            setTimeout(() => setData(d => ({
              ...d,
              pending: d.pending.map(i => i.id === item.id ? { ...i, status: 'bought' } : i),
              impulses: [...d.impulses, { id: Date.now(), name: item.name, amount: item.amount, category: item.category, timestamp: Date.now(), wasGated: true }],
            })), 1200);
          }}>
          Buy
        </button>
      </div>
    </div>
  );
}

// ── InfoPopover ───────────────────────────────────────────────────────────────
// Floating info panel — renders in front of the page (z-index 200) rather than
// pushing content down. Click outside or re-click the trigger to close.
function InfoPopover({ label, children, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          color: '#D97757', fontWeight: 600, letterSpacing: '0.04em',
          fontSize: 12, background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', padding: 0,
        }}
      >
        <Info size={13} /> {label}
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          ...(align === 'right' ? { right: 0 } : { left: 0 }),
          top: 'calc(100% + 8px)',
          zIndex: 200, width: 320,
          background: '#1A1410', border: '1px solid #3A2A1E', borderRadius: 4,
          padding: '12px 14px', lineHeight: 1.7, fontSize: 12, color: '#8B8478',
          boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ─────────────── SETUP & SALARY ─────────────── */
function Setup({ data, stats, setData }) {
  const fmt = makeFmt(data.currency);
  const { symbol: currencySymbol } = getCurrency(data.currency);
  const isFoundation = data?.mode === 'foundation';
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', category: 'Housing' });
  const { locked, requestUnlock, gate } = useSectionPin(data.overridePin);

  const addExpense = () => {
    if (!newExpense.name || !newExpense.amount) return;
    setData(d => ({
      ...d,
      expenses: [...d.expenses, { id: Date.now(), name: newExpense.name, amount: Number(newExpense.amount), category: newExpense.category, trackInEnvelope: false }],
    }));
    setNewExpense({ name: '', amount: '', category: 'Housing' });
  };

  const updateExpense = (id, field, value) => {
    setData(d => {
      const expense = d.expenses.find(e => e.id === id);
      const parsed = field === 'amount' ? Number(value) || 0 : value;
      // Sync linked envelope if tracking
      const updatedEnvelopes = (d.envelopes || []).map(env =>
        env.fromExpenseId === id
          ? { ...env, [field === 'amount' ? 'cap' : 'name']: parsed }
          : env
      );
      return {
        ...d,
        expenses: d.expenses.map(e => e.id === id ? { ...e, [field]: parsed } : e),
        envelopes: updatedEnvelopes,
      };
    });
  };

  const removeExpense = (id) => {
    setData(d => ({
      ...d,
      expenses: d.expenses.filter(e => e.id !== id),
      // Remove linked envelope if it exists
      envelopes: (d.envelopes || []).filter(env => env.fromExpenseId !== id),
    }));
  };

  const toggleEnvelopeTracking = (expense) => {
    if (expense.trackInEnvelope) {
      // Uncheck — remove linked envelope
      setData(d => ({
        ...d,
        expenses: d.expenses.map(e => e.id === expense.id ? { ...e, trackInEnvelope: false } : e),
        envelopes: (d.envelopes || []).filter(env => env.fromExpenseId !== expense.id),
      }));
    } else {
      // Check — create linked envelope with default reset mode
      const newEnv = {
        id: `env_${expense.id}`,
        name: expense.name,
        cap: expense.amount,
        blockMode: 'soft',
        rolloverMode: 'reset',
        icon: 'other',
        fromExpenseId: expense.id,
      };
      setData(d => ({
        ...d,
        expenses: d.expenses.map(e => e.id === expense.id ? { ...e, trackInEnvelope: true } : e),
        envelopes: [...(d.envelopes || []).filter(env => env.fromExpenseId !== expense.id), newEnv],
      }));
    }
  };

  // Update rollover mode on the linked envelope for a given expense
  const setEnvelopeRolloverMode = (expenseId, mode) => {
    setData(d => ({
      ...d,
      envelopes: (d.envelopes || []).map(env =>
        env.fromExpenseId === expenseId ? { ...env, rolloverMode: mode } : env
      ),
    }));
  };

  // Group by category
  const byCategory = useMemo(() => {
    const groups = {};
    data.expenses.forEach(e => {
      if (!groups[e.category]) groups[e.category] = [];
      groups[e.category].push(e);
    });
    return groups;
  }, [data.expenses]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-4xl mb-2" style={{ fontWeight: 300 }}>
          Your <span style={{ fontStyle: 'italic', color: '#D97757' }}>real numbers</span>
        </h1>
        <p style={{ color: '#8B8478', fontSize: '15px', maxWidth: '650px' }}>
          {isFoundation
            ? foundationCopy.setupDesc
            : 'Add every monthly expense honestly. The system computes your salary and buffer target from your actual life, not assumptions.'}
        </p>
        {isFoundation && (
          <p style={{ fontSize: '12px', color: '#5C5648', marginTop: '6px', maxWidth: '520px' }}>
            💡 {foundationCopy.incomeHelper}
          </p>
        )}
        {data.overridePin && (
          <div className="flex items-center gap-2 mt-3">
            {locked ? (
              <button onClick={requestUnlock} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#5B7FB8', background: 'transparent', border: '1px solid #1E2A3A', borderRadius: '3px', padding: '3px 9px', cursor: 'pointer', letterSpacing: '0.05em' }}>
                <Lock size={11} /> Locked · click to edit
              </button>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#7FA068', letterSpacing: '0.05em' }}>
                <Unlock size={11} /> Unlocked for 60s
              </span>
            )}
            {gate}
          </div>
        )}
      </div>

      {/* Live calculation card */}
      <div className="card-warm p-7 glow-warm">
        <div className="grid md:grid-cols-3 gap-5">
          <div>
            <div className="label mb-2" style={{ color: '#D97757' }}>Total Expenses</div>
            <div className="display text-3xl" style={{ fontWeight: 300 }}>{fmt(stats.totalExpenses)}</div>
            <div className="text-xs mt-1" style={{ color: '#8B8478' }}>Bills auto-pay</div>
          </div>
          <div>
            <div className="label mb-2" style={{ color: '#D97757' }}>{isFoundation ? foundationCopy.salaryCardLabel : 'Monthly Salary'}</div>
            <div className="display text-3xl" style={{ fontWeight: 300, color: '#D97757' }}>{fmt(stats.salary)}</div>
            <div className="text-xs mt-1" style={{ color: '#8B8478' }}>{isFoundation ? foundationCopy.salaryCardNote : 'Expenses + spending + reserve'}</div>
          </div>
          <div>
            <div className="label mb-2" style={{ color: '#D97757' }}>Buffer Target</div>
            <div className="display text-3xl" style={{ fontWeight: 300, color: '#7FA068' }}>{fmt(stats.bufferTarget)}</div>
            <div className="text-xs mt-1" style={{ color: '#8B8478' }}>{data.bufferTargetMonths} months × {isFoundation ? 'money available' : 'salary'}</div>
          </div>
        </div>
      </div>

      {/* Expenses by category */}
      <section className="card p-7">
        <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
          <h2 className="display text-2xl">Monthly expenses</h2>
          <InfoPopover label="How does this work?">
            <p style={{ marginBottom: 6 }}>
              <strong style={{ color: '#E8E2D5' }}>Expenses</strong> tell the app your total monthly cost of living — used to calculate your {isFoundation ? 'savings target and money available' : 'buffer target and salary requirement'}.
            </p>
            <p style={{ marginBottom: 6 }}>
              <strong style={{ color: '#E8E2D5' }}>The envelope toggle</strong> (✉ icon) is for variable expenses you want to actively track and control day-to-day — groceries, petrol, family support. Fixed bills like rent don't need envelopes.
            </p>
            <p style={{ marginBottom: 6 }}>When you enable an envelope, pick the <strong style={{ color: '#E8E2D5' }}>month-end rule</strong>: 🔄 Reset (fresh each month), ➕ Rollover (carry leftover forward), or 💧 Sweep (unspent goes to your Buffer).</p>
            <p>The envelope stays in sync — edit the amount here and the cap updates automatically.</p>
          </InfoPopover>
        </div>
        <p className="text-sm mb-5" style={{ color: '#8B8478' }}>Add every monthly expense. Click the <strong style={{ color: '#E8E2D5' }}>✉ envelope</strong> on variable ones to track them in Budget, then set the month-end rule.</p>

        {Object.entries(byCategory).map(([cat, items]) => {
          const catTotal = items.reduce((s, i) => s + i.amount, 0);
          return (
            <div key={cat} className="mb-6 pb-5 border-b last:border-0 last:mb-0 last:pb-0" style={{ borderColor: '#26221C' }}>
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-medium text-sm">{cat}</h3>
                <span className="mono text-sm" style={{ color: '#8B8478' }}>{fmt(catTotal)}</span>
              </div>
              <div className="space-y-2">
                {items.map(e => {
                  // Find linked envelope to know current rolloverMode
                  const linkedEnv = (data.envelopes || []).find(env => env.fromExpenseId === e.id);
                  const envMode = linkedEnv?.rolloverMode || 'reset';
                  return (
                    <div key={e.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {/* Main row */}
                      <div className="flex items-center gap-3 group flex-wrap">
                        <input
                          type="text"
                          value={e.name}
                          onChange={locked ? undefined : (ev) => updateExpense(e.id, 'name', ev.target.value)}
                          onClick={() => locked && requestUnlock()}
                          className="input-text flex-1"
                          style={{ padding: '8px 12px', cursor: locked ? 'pointer' : undefined, opacity: locked ? 0.65 : 1, minWidth: 120 }}
                          readOnly={locked}
                        />
                        <input
                          type="number"
                          value={e.amount}
                          onChange={locked ? undefined : (ev) => updateExpense(e.id, 'amount', ev.target.value)}
                          onClick={() => locked && requestUnlock()}
                          className="input"
                          style={{ width: '110px', padding: '8px 12px', cursor: locked ? 'pointer' : undefined, opacity: locked ? 0.65 : 1 }}
                          readOnly={locked}
                        />
                        {/* Envelope toggle — Mail icon */}
                        <button
                          onClick={() => !locked && toggleEnvelopeTracking(e)}
                          title={e.trackInEnvelope ? 'Remove from Budget envelopes' : 'Track this in Budget envelopes'}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 34, height: 34,
                            background: e.trackInEnvelope ? '#0F1A0E' : 'transparent',
                            border: `1px solid ${e.trackInEnvelope ? '#2A4A2A' : '#26221C'}`,
                            borderRadius: 3,
                            cursor: locked ? 'not-allowed' : 'pointer',
                            opacity: locked ? 0.4 : 1,
                            transition: 'all 150ms',
                            flexShrink: 0,
                          }}
                        >
                          <Mail size={14} color={e.trackInEnvelope ? '#7FA068' : '#5C5648'} />
                        </button>
                        <button onClick={() => locked ? requestUnlock() : removeExpense(e.id)} className="btn p-2" style={{ color: '#5C5648', opacity: locked ? 0.4 : 1 }}>
                          <X size={14} />
                        </button>
                      </div>
                      {/* Month-end mode pills — shown when envelope is active */}
                      {e.trackInEnvelope && !locked && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingLeft: 2, paddingBottom: 4 }}>
                          <span style={{ fontSize: 10, color: '#3A3028', marginRight: 2, letterSpacing: '0.05em' }}>Month-end:</span>
                          {[
                            { id: 'reset', label: '🔄 Reset',    tip: 'Cap resets to full each month. Unspent balance disappears.' },
                            { id: 'roll',  label: '➕ Rollover', tip: 'Leftover carries into next month. Overspend is deducted.' },
                            { id: 'sweep', label: '💧 Sweep',    tip: 'Leftover moves to your Buffer. Cap resets to full.' },
                          ].map(m => (
                            <button
                              key={m.id}
                              onClick={() => setEnvelopeRolloverMode(e.id, m.id)}
                              title={m.tip}
                              style={{
                                background: envMode === m.id ? '#1A2A1E' : 'transparent',
                                border: `1px solid ${envMode === m.id ? '#7FA068' : '#26221C'}`,
                                borderRadius: 999,
                                padding: '3px 10px',
                                fontSize: 11,
                                color: envMode === m.id ? '#7FA068' : '#5C5648',
                                cursor: 'pointer',
                                fontFamily: 'Inter, sans-serif',
                                transition: 'all 120ms',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Add new expense */}
        <div className="mt-6 p-5 border" style={{ borderColor: '#3A2A1E', borderRadius: '3px', background: '#1A1410', opacity: locked ? 0.6 : 1 }}>
          <h4 className="label mb-3" style={{ color: '#D97757' }}>Add new expense</h4>
          <div className="grid md:grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              placeholder="Name (e.g., Rent)"
              value={newExpense.name}
              onChange={locked ? undefined : (e) => setNewExpense(p => ({ ...p, name: e.target.value }))}
              onClick={() => locked && requestUnlock()}
              className="input-text"
              readOnly={locked}
              style={{ cursor: locked ? 'pointer' : undefined }}
            />
            <input
              type="number"
              placeholder="Amount"
              value={newExpense.amount}
              onChange={locked ? undefined : (e) => setNewExpense(p => ({ ...p, amount: e.target.value }))}
              onClick={() => locked && requestUnlock()}
              className="input"
              readOnly={locked}
              style={{ cursor: locked ? 'pointer' : undefined }}
            />
            <select
              value={newExpense.category}
              onChange={locked ? undefined : (e) => setNewExpense(p => ({ ...p, category: e.target.value }))}
              onClick={() => locked && requestUnlock()}
              className="input-text"
              disabled={locked}
              style={{ cursor: locked ? 'pointer' : undefined, opacity: locked ? 0.65 : 1 }}
            >
              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={locked ? requestUnlock : addExpense} className="btn btn-primary" disabled={!locked && (!newExpense.name || !newExpense.amount)}>
            <Plus size={14} className="inline mr-1" /> Add
          </button>
        </div>
      </section>

      {/* Spending and reserve */}
      <section className="card p-7">
        <h2 className="display text-2xl mb-5">{isFoundation ? 'Spending & savings' : 'Spending & buffer reserve'}</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <div className="label mb-2" style={{ color: '#5C5648' }}>Monthly spending budget</div>
            <input type="number" className="input" value={data.spendingBudget || ''} placeholder="0"
              readOnly={locked} onClick={() => locked && requestUnlock()}
              onChange={locked ? undefined : (e) => setData(d => ({ ...d, spendingBudget: Number(e.target.value) || 0 }))}
              style={{ cursor: locked ? 'pointer' : undefined, opacity: locked ? 0.65 : 1 }} />
            <p className="text-xs mt-2" style={{ color: '#5C5648' }}>Discretionary spending money for the month. Be realistic.</p>
          </div>
          <div>
            <div className="label mb-2" style={{ color: '#5C5648' }}>{isFoundation ? 'Monthly savings contribution' : 'Buffer reserve from salary'}</div>
            <input type="number" className="input" value={data.bufferReserve || ''} placeholder="0"
              readOnly={locked} onClick={() => locked && requestUnlock()}
              onChange={locked ? undefined : (e) => setData(d => ({ ...d, bufferReserve: Number(e.target.value) || 0 }))}
              style={{ cursor: locked ? 'pointer' : undefined, opacity: locked ? 0.65 : 1 }} />
            <p className="text-xs mt-2" style={{ color: '#5C5648' }}>
              {isFoundation
                ? 'How much you set aside each month to build your savings.'
                : 'How much each month auto-feeds the buffer (in addition to trading profits).'}
            </p>
          </div>
        </div>
      </section>

      {/* Buffer settings */}
      <section className="card p-7">
        <h2 className="display text-2xl mb-2">{isFoundation ? 'Savings target' : 'Buffer target'}</h2>
        <p className="text-sm mb-5" style={{ color: '#8B8478' }}>
          {isFoundation
            ? 'How many months of expenses should your savings cover? Start with 3–6 months.'
            : 'How many months of salary should your buffer hold? Default is 18 for sole earners with dependents.'}
        </p>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <div className="label mb-2" style={{ color: '#5C5648' }}>Target months</div>
            <input type="number" className="input" value={data.bufferTargetMonths}
              readOnly={locked} onClick={() => locked && requestUnlock()}
              onChange={locked ? undefined : (e) => setData(d => ({ ...d, bufferTargetMonths: Number(e.target.value) || 6 }))}
              style={{ cursor: locked ? 'pointer' : undefined, opacity: locked ? 0.65 : 1 }} />
            <p className="text-xs mt-2" style={{ color: '#5C5648' }}>Target: {fmt(stats.bufferTarget)}</p>
          </div>
          <div>
            <div className="label mb-2" style={{ color: '#5C5648' }}>Protect threshold (months)</div>
            <input type="number" className="input" value={data.bufferProtectMonths}
              readOnly={locked} onClick={() => locked && requestUnlock()}
              onChange={locked ? undefined : (e) => setData(d => ({ ...d, bufferProtectMonths: Number(e.target.value) || 16 }))}
              style={{ cursor: locked ? 'pointer' : undefined, opacity: locked ? 0.65 : 1 }} />
            <p className="text-xs mt-2" style={{ color: '#5C5648' }}>Auto-rebuild triggers below: {fmt(stats.bufferProtectThreshold)}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─────────────── PROFIT / MONEY ALLOCATOR ─────────────── */
function ProfitAllocator({ data, stats, setData }) {
  const fmt = makeFmt(data.currency);
  const isFoundation = data?.mode === 'foundation';
  const [profit, setProfit] = useState('');
  const [step, setStep] = useState('input');
  const [allocation, setAllocation] = useState(null);
  const { attempt: attemptApply, gate: applyGate } = usePinGate(data.overridePin);

  const calculate = () => {
    const grossProfit = Number(profit) || 0;
    if (grossProfit <= 0) return;

    // Foundation: no tax deduction, 100% to Savings (buffer)
    if (isFoundation) {
      setAllocation({
        grossProfit,
        taxReserve: 0,
        netProfit: grossProfit,
        toBuffer: grossProfit,
        toLongTerm: 0,
        toTrading: 0,
        toGoals: 0,
        toLifestyle: 0,
        stage: null,
        isFoundation: true,
      });
      setStep('result');
      return;
    }

    const taxReserve = grossProfit * (data.taxReservePct / 100);
    const netProfit = grossProfit - taxReserve;

    let rule;
    if (stats.stage === 1 || stats.stage === 'protect') rule = data.stageRules.stage1;
    else if (stats.stage === 1.5) rule = data.stageRules.stage15;
    else if (stats.stage === 2) rule = data.stageRules.stage2;
    else rule = data.stageRules.stage3;

    const effectiveGoalsPct = (rule.goalsPct ?? 0) + (data.incomeType === 'fixed' ? (rule.tradingPct ?? 0) : 0);
    const toGoals = netProfit * (effectiveGoalsPct / 100);
    setAllocation({
      grossProfit,
      taxReserve,
      netProfit,
      toBuffer: netProfit * (rule.bufferPct / 100),
      toLongTerm: netProfit * (rule.longTermPct / 100),
      toTrading: netProfit * (rule.tradingPct / 100),
      toGoals,
      toLifestyle: netProfit * (rule.lifestylePct / 100),
      stage: stats.stage,
    });
    setStep('result');
  };

  const apply = () => {
    if (!allocation) return;
    // Capture all values from allocation before entering the setData updater.
    // This avoids any stale-closure risk when React defers the functional update.
    const toBuffer   = allocation.toBuffer   || 0;
    const toLongTerm = allocation.toLongTerm || 0;
    const toTrading  = allocation.toTrading  || 0;
    const toGoals    = allocation.toGoals    || 0;
    const snap       = { ...allocation };
    setData(d => ({
      ...d,
      buffer:       d.buffer + toBuffer,
      longTerm:     d.longTerm + toLongTerm,
      tradingCapital: d.tradingCapital + toTrading,
      futureGoals:  (d.futureGoals || 0) + Math.round(toGoals),
      profitAllocations: [...(d.profitAllocations || []), {
        id: Date.now(),
        timestamp: Date.now(),
        ...snap,
      }],
    }));
    setProfit(''); setAllocation(null); setStep('done');
  };

  const reset = () => { setProfit(''); setAllocation(null); setStep('input'); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-4xl mb-2" style={{ fontWeight: 300 }}>
          {isFoundation
            ? <>Money <span style={{ fontStyle: 'italic', color: '#7FA068' }}>Allocator</span></>
            : <>{data.incomeType === 'fixed' ? 'Surplus' : 'Profit'} <span style={{ fontStyle: 'italic', color: '#D97757' }}>waterfall</span></>
          }
        </h1>
        <p style={{ color: '#8B8478', fontSize: '15px', maxWidth: '650px' }}>
          {isFoundation
            ? 'Decide where extra money should go before you spend it.'
            : data.incomeType === 'fixed'
              ? 'Enter your extra income this month. The system reserves taxes first, then routes the rest based on your current stage.'
              : 'Enter your gross trading profit. The system reserves taxes first, then routes the rest based on your current stage.'}
        </p>
      </div>

      {/* Stage info card — hidden for Foundation (no stages, no tax) */}
      {!isFoundation && (
        <div className="card p-5">
          <div className="flex items-baseline justify-between mb-2">
            <div className="label" style={{ color: '#D97757' }}>Currently in Stage {stats.stage}</div>
            <div className="text-xs mono" style={{ color: '#8B8478' }}>{stats.monthsCovered.toFixed(1)} months stored</div>
          </div>
          <p className="text-sm" style={{ color: '#E8E2D5' }}>
            Tax reserve: {data.taxReservePct}% (edit in Rules tab) · Then current stage allocation applies.
          </p>
        </div>
      )}

      {step === 'input' && (() => {
        const liveGross = Number(profit) || 0;
        const liveTax   = isFoundation ? 0 : liveGross * (data.taxReservePct / 100);
        const liveNet   = liveGross - liveTax;
        let liveRule;
        if (stats.stage === 1 || stats.stage === 'protect') liveRule = data.stageRules.stage1;
        else if (stats.stage === 1.5) liveRule = data.stageRules.stage15;
        else if (stats.stage === 2)   liveRule = data.stageRules.stage2;
        else liveRule = data.stageRules.stage3;
        const liveRows = isFoundation ? [
          { label: 'To Savings', pct: 100, amt: liveGross, color: '#7FA068' },
        ] : [
          { label: 'Tax reserve',       pct: data.taxReservePct,          amt: liveTax,                                        color: '#8B8478' },
          { label: 'Family Buffer',     pct: liveRule.bufferPct,          amt: liveNet * (liveRule.bufferPct / 100),            color: '#D97757' },
          { label: 'Long-term',         pct: liveRule.longTermPct,        amt: liveNet * (liveRule.longTermPct / 100),          color: '#7FA068' },
          ...(data.incomeType !== 'fixed' ? [{ label: 'Trading Capital', pct: liveRule.tradingPct, amt: liveNet * (liveRule.tradingPct / 100), color: '#5B7FB8' }] : []),
          { label: 'Goals',             pct: (liveRule.goalsPct ?? 0) + (data.incomeType === 'fixed' ? (liveRule.tradingPct ?? 0) : 0), amt: liveNet * (((liveRule.goalsPct ?? 0) + (data.incomeType === 'fixed' ? (liveRule.tradingPct ?? 0) : 0)) / 100), color: '#A06B8C' },
          { label: 'Lifestyle',         pct: liveRule.lifestylePct,       amt: liveNet * (liveRule.lifestylePct / 100),         color: '#B89968' },
        ].filter(r => r.pct > 0);

        return (
          <div className="card-warm p-7">
            <div className="label mb-3" style={{ color: isFoundation ? '#7FA068' : '#D97757' }}>
              {isFoundation ? 'Extra money received' : data.incomeType === 'fixed' ? 'Extra income this month' : 'Gross trading profit this month'}
            </div>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <input type="number" className="input" placeholder="0" value={profit} onChange={(e) => setProfit(e.target.value)} style={{ fontSize: '18px' }} />
              </div>
              <button className="btn btn-primary" onClick={calculate} disabled={!Number(profit)}>
                {isFoundation ? 'Allocate money' : 'Allocate →'}
              </button>
            </div>
            {isFoundation
              ? <p className="text-xs mt-3" style={{ color: '#5C5648' }}>From a gift, allowance, support payment, refund, or debt repayment. All of it goes straight to your Savings.</p>
              : <p className="text-xs mt-3" style={{ color: '#5C5648' }}>Enter pre-tax profit. The system reserves {data.taxReservePct}% for taxes automatically.</p>
            }

            {liveGross > 0 && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #26221C' }}>
                <div className="label mb-3" style={{ color: '#5C5648' }}>Preview — where it goes</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {liveRows.map(row => (
                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '3px', height: '28px', borderRadius: '2px', background: row.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, fontSize: '13px', color: '#8B8478' }}>{row.label}</div>
                      <div style={{ fontSize: '11px', color: '#5C5648', fontFamily: 'JetBrains Mono, monospace' }}>{row.pct}%</div>
                      <div style={{ fontSize: '14px', color: '#E8E2D5', fontWeight: 500, fontFamily: 'JetBrains Mono, monospace', minWidth: '90px', textAlign: 'right' }}>{fmt(row.amt)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {step === 'result' && allocation && (
        <div className="space-y-4 slide-up">
          <div className="card-warm p-7 glow-warm">
            <div className="flex items-baseline justify-between mb-2">
              <div className="label" style={{ color: isFoundation ? '#7FA068' : '#D97757' }}>
                {isFoundation ? 'Where it goes' : 'Allocation breakdown'}
              </div>
              {!isFoundation && (
                <div className="text-xs mono" style={{ color: '#8B8478' }}>Stage {allocation.stage}</div>
              )}
            </div>
            <div className="display text-2xl" style={{ fontWeight: 300, fontStyle: 'italic' }}>
              {isFoundation
                ? <>{fmt(allocation.grossProfit)} → <span style={{ color: '#7FA068' }}>all to Savings</span></>
                : <>{data.incomeType === 'fixed' ? 'Income' : 'Gross'} {fmt(allocation.grossProfit)} → Net {fmt(allocation.netProfit)} after taxes</>
              }
            </div>
          </div>

          {!isFoundation && <AllocationBlock label="Tax Reserve" amount={allocation.taxReserve} color="#8B8478" icon={Lock} note={`${data.taxReservePct}% set aside. Move to a separate savings account for quarterly estimated taxes.`} isReserve currency={data.currency} />}
          {allocation.toBuffer > 0 && <AllocationBlock label={isFoundation ? 'To Savings' : 'To Family Buffer'} amount={allocation.toBuffer} color={isFoundation ? '#7FA068' : '#D97757'} icon={Shield} note={isFoundation ? 'Goes straight into your Savings balance.' : 'Protects family from trading volatility.'} currency={data.currency} />}
          {allocation.toLongTerm > 0 && <AllocationBlock label="Long-term Investing" amount={allocation.toLongTerm} color="#7FA068" icon={PiggyBank} note="Index funds / long-term investments. Family's future independence." currency={data.currency} />}
          {allocation.toTrading > 0 && data.incomeType !== 'fixed' && !isFoundation && <AllocationBlock label="Trading Capital" amount={allocation.toTrading} color="#5B7FB8" icon={Briefcase} note="Compound your edge." currency={data.currency} />}
          {allocation.toGoals > 0 && (
            <AllocationBlock
              label="To Future Goals"
              amount={allocation.toGoals}
              color="#A06B8C"
              icon={Award}
              note="Toward your named goals — business, vehicle, equipment, deposit."
              currency={data.currency}
            />
          )}
          {allocation.toLifestyle > 0 && <AllocationBlock label="Lifestyle" amount={allocation.toLifestyle} color="#B89968" icon={Sparkles} note="One-time bonus, not a salary baseline." currency={data.currency} />}

          <div className="flex gap-3">
            <button className="btn btn-primary flex-1" onClick={() => attemptApply(apply)}>Apply allocation</button>
            <button className="btn btn-ghost" onClick={reset}>Cancel</button>
          </div>
          {applyGate}
        </div>
      )}

      {step === 'done' && (
        <div className="card-warm p-8 text-center slide-up">
          <Check size={32} style={{ color: '#7FA068' }} className="mx-auto mb-4" />
          <div className="display text-3xl mb-2" style={{ fontStyle: 'italic', fontWeight: 300 }}>Done.</div>
          {isFoundation ? (
            <>
              <p style={{ color: '#8B8478', marginBottom: '8px' }}>
                Your Savings balance has been updated.
              </p>
              <p className="mono" style={{ color: '#7FA068', fontSize: '22px', fontWeight: 300 }}>
                {fmt(data.buffer)}
              </p>
            </>
          ) : (
            <p style={{ color: '#8B8478' }}>
              Don't forget to actually transfer the tax reserve to a separate account.
            </p>
          )}
          <button className="btn btn-primary mt-6" onClick={reset}>
            {isFoundation ? 'Allocate more money' : 'Allocate another'}
          </button>
        </div>
      )}

      {/* History */}
      {data.profitAllocations.length > 0 && (
        <section className="card p-6">
          <h2 className="display text-xl mb-4">Allocation history</h2>
          <div className="space-y-3">
            {data.profitAllocations.slice(-8).reverse().map(a => (
              <div key={a.id} className="flex items-center justify-between pb-3 border-b last:border-0" style={{ borderColor: '#26221C' }}>
                <div>
                  <div className="font-medium text-sm">
                    {a.isFoundation
                      ? <>Received {fmt(a.grossProfit)}</>
                      : <>Gross {fmt(a.grossProfit)} → Net {fmt(a.netProfit)}</>
                    }
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#8B8478' }}>
                    {new Date(a.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    {!a.isFoundation && a.stage !== undefined && <span className="ml-2" style={{ color: '#5C5648' }}>· Stage {a.stage}</span>}
                  </div>
                </div>
                <div className="flex gap-2 text-xs mono flex-wrap justify-end">
                  {!a.isFoundation && <span style={{ color: '#8B8478' }}>tax {fmt(a.taxReserve)}</span>}
                  {a.toBuffer > 0 && <span style={{ color: a.isFoundation ? '#7FA068' : '#D97757' }}>+{fmt(a.toBuffer)} {a.isFoundation ? 'savings' : 'buf'}</span>}
                  {a.toLongTerm > 0 && <span style={{ color: '#7FA068' }}>+{fmt(a.toLongTerm)} lt</span>}
                  {!a.isFoundation && a.toTrading > 0 && <span style={{ color: '#5B7FB8' }}>+{fmt(a.toTrading)} trd</span>}
                  {a.toGoals > 0 && <span style={{ color: '#A06B8C' }}>+{fmt(a.toGoals)} goals</span>}
                  {a.toLifestyle > 0 && <span style={{ color: '#B89968' }}>+{fmt(a.toLifestyle)} life</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function AllocationBlock({ label, amount, color, icon: Icon, note, isReserve, currency }) {
  const fmt = makeFmt(currency);
  return (
    <div className="card p-6" style={{ borderColor: color + '40', opacity: isReserve ? 0.85 : 1 }}>
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={16} style={{ color }} />
          <span className="label" style={{ color: '#5C5648' }}>{label}</span>
        </div>
        <div className="display text-3xl" style={{ color, fontWeight: 300 }}>{fmt(amount)}</div>
      </div>
      <p className="text-xs" style={{ color: '#8B8478', lineHeight: 1.5 }}>{note}</p>
    </div>
  );
}

/* ─────────────── TRADING ─────────────── */
function TradingTab({ data, stats, setData }) {
  const fmt = makeFmt(data.currency);
  const { attemptRow: attemptPnlRow, gateFor: pnlGateFor } = usePinRowGate(data.overridePin);
  const { attempt: attemptHwm, gate: hwmGate } = usePinGate(data.overridePin);
  const { locked, requestUnlock, gate: tradingFieldGate } = useSectionPin(data.overridePin);
  const [pnl, setPnl] = useState('');
  const [pnlMonth, setPnlMonth] = useState(new Date().toISOString().slice(0, 7));
  const [pnlLogged, setPnlLogged] = useState(null); // { month, value }

  const logPnL = () => {
    const value = Number(pnl);
    if (isNaN(value)) return;
    setData(d => {
      const guardUpdates = value < 0
        ? { tradingGuardUntil: Date.now() + 24 * 60 * 60 * 1000 }
        : { tradingGuardUntil: null };
      return {
        ...d,
        tradingPnLHistory: [...d.tradingPnLHistory.filter(h => h.month !== pnlMonth), { month: pnlMonth, pnl: value, id: Date.now() }],
        ...guardUpdates,
      };
    });
    setPnlLogged({ month: pnlMonth, value });
    setPnl('');
    setTimeout(() => setPnlLogged(null), 3000);
  };

  const removePnL = (month) => setData(d => ({ ...d, tradingPnLHistory: d.tradingPnLHistory.filter(h => h.month !== month) }));

  const sortedHistory = [...data.tradingPnLHistory].sort((a, b) => a.month.localeCompare(b.month));
  const winners = data.tradingPnLHistory.filter(h => h.pnl > 0);
  const losers = data.tradingPnLHistory.filter(h => h.pnl < 0);
  const winRate = data.tradingPnLHistory.length > 0 ? (winners.length / data.tradingPnLHistory.length) * 100 : 0;
  const avgWin = winners.length > 0 ? winners.reduce((s, h) => s + h.pnl, 0) / winners.length : 0;
  const avgLoss = losers.length > 0 ? losers.reduce((s, h) => s + h.pnl, 0) / losers.length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-4xl mb-2" style={{ fontWeight: 300 }}>
          Trading <span style={{ fontStyle: 'italic', color: '#5B7FB8' }}>P&L</span>
        </h1>
        <p style={{ color: '#8B8478', fontSize: '15px', maxWidth: '650px' }}>
          The business, kept separate. Volatility lives here so it doesn't reach your family's daily life.
        </p>
        {data.overridePin && (
          <div className="flex items-center gap-2 mt-3">
            {locked ? (
              <button onClick={requestUnlock} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#5B7FB8', background: 'transparent', border: '1px solid #1E2A3A', borderRadius: '3px', padding: '3px 9px', cursor: 'pointer', letterSpacing: '0.05em' }}>
                <Lock size={11} /> Locked · click to edit
              </button>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#7FA068', letterSpacing: '0.05em' }}>
                <Unlock size={11} /> Unlocked for 60s
              </span>
            )}
            {tradingFieldGate}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-5">
          <div className="label mb-2" style={{ color: '#5C5648' }}>Capital</div>
          <input type="number" className="input mt-1" value={data.tradingCapital}
            readOnly={locked} onClick={() => locked && requestUnlock()}
            onChange={locked ? undefined : (e) => setData(d => ({ ...d, tradingCapital: Number(e.target.value) || 0 }))}
            style={{ cursor: locked ? 'pointer' : undefined, opacity: locked ? 0.65 : 1 }} />
        </div>
        <div className="card p-5">
          <div className="label mb-2" style={{ color: '#5C5648' }}>YTD P&L</div>
          <div className="display text-2xl mt-1" style={{ color: stats.ytdPnL >= 0 ? '#7FA068' : '#C56B5A', fontWeight: 300 }}>
            {stats.ytdPnL >= 0 ? '+' : ''}{fmt(stats.ytdPnL)}
          </div>
        </div>
        <div className="card p-5">
          <div className="label mb-2" style={{ color: '#5C5648' }}>Win Rate</div>
          <div className="display text-2xl mt-1" style={{ fontWeight: 300 }}>{winRate.toFixed(0)}%</div>
          <div className="text-xs mt-0.5" style={{ color: '#8B8478' }}>{winners.length}W · {losers.length}L</div>
        </div>
        <div className="card p-5">
          <div className="label mb-2" style={{ color: '#5C5648' }}>Avg W/L</div>
          <div className="text-sm mono mt-1">
            <span style={{ color: '#7FA068' }}>+{fmt(avgWin)}</span>
            <span style={{ color: '#5C5648' }}> · </span>
            <span style={{ color: '#C56B5A' }}>{fmt(avgLoss)}</span>
          </div>
        </div>
      </div>

      {/* Drawdown Protocol */}
      <DrawdownProtocol data={data} stats={stats} setData={setData} onResetHwm={(action) => attemptHwm(action)} hwmGate={hwmGate} />

            <section className="card p-6">
        <h2 className="display text-2xl mb-5">Log monthly P&L</h2>
        <div className="grid md:grid-cols-3 gap-3 items-end">
          <div>
            <div className="label mb-2" style={{ color: '#5C5648' }}>Month</div>
            <input type="month" className="input-text" value={pnlMonth}
              readOnly={locked} onClick={() => locked && requestUnlock()}
              onChange={locked ? undefined : (e) => setPnlMonth(e.target.value)}
              style={{ cursor: locked ? 'pointer' : undefined, opacity: locked ? 0.65 : 1 }} />
          </div>
          <div>
            <div className="label mb-2" style={{ color: '#5C5648' }}>Net P&L</div>
            <input type="number" className="input" placeholder="0" value={pnl}
              readOnly={locked} onClick={() => locked && requestUnlock()}
              onChange={locked ? undefined : (e) => setPnl(e.target.value)}
              style={{ cursor: locked ? 'pointer' : undefined, opacity: locked ? 0.65 : 1 }} />
          </div>
          <button className="btn btn-primary" onClick={locked ? requestUnlock : logPnL} disabled={!locked && pnl === ''}>Log P&L</button>
        </div>
        {pnlLogged && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginTop: 12,
            background: pnlLogged.value >= 0 ? '#0F1A0E' : '#160E0C',
            border: `1px solid ${pnlLogged.value >= 0 ? '#2A4A2A' : '#3A1E18'}`,
            borderRadius: 4, padding: '10px 14px', fontSize: 13,
            color: pnlLogged.value >= 0 ? '#7FA068' : '#C56B5A',
          }}>
            <Check size={14} style={{ flexShrink: 0 }} />
            <span>
              <strong>{pnlLogged.month}</strong> P&L logged — {pnlLogged.value >= 0 ? '+' : ''}{fmt(pnlLogged.value)}
              {pnlLogged.value < 0 && <span style={{ color: '#8B8478', marginLeft: 8 }}>· 24h guard active</span>}
            </span>
          </div>
        )}
      </section>

      {sortedHistory.length > 0 && (
        <section className="card p-6">
          <h2 className="display text-2xl mb-5">P&L history</h2>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer>
              <BarChart data={sortedHistory} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid stroke="#26221C" strokeDasharray="2 4" />
                <XAxis dataKey="month" tick={{ fill: '#5C5648', fontSize: 11 }} stroke="#26221C" />
                <YAxis tick={{ fill: '#5C5648', fontSize: 11 }} stroke="#26221C" tickFormatter={(v) => { const sym = getCurrency(data.currency).symbol; return sym + ' ' + (Math.abs(v) >= 1000 ? (v/1000).toFixed(0)+'k' : v); }} />
                <Tooltip contentStyle={{ background: '#14110E', border: '1px solid #26221C', borderRadius: '3px', fontFamily: 'JetBrains Mono', fontSize: '12px' }} formatter={(v) => fmt(v)} />
                <ReferenceLine y={0} stroke="#5C5648" strokeWidth={1} />
                <Bar dataKey="pnl" radius={[2, 2, 0, 0]}>
                  {sortedHistory.map((entry, i) => <Cell key={i} fill={entry.pnl >= 0 ? '#7FA068' : '#C56B5A'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-2">
            {[...sortedHistory].reverse().map(h => (
              <div key={h.month}>
                <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#26221C' }}>
                  <span className="text-sm">{h.month}</span>
                  <div className="flex items-center gap-3">
                    <span className="mono text-sm" style={{ color: h.pnl >= 0 ? '#7FA068' : '#C56B5A' }}>
                      {h.pnl >= 0 ? '+' : ''}{fmt(h.pnl)}
                    </span>
                    <button className="btn" style={{ color: '#5C5648' }} onClick={() => attemptPnlRow(h.month, () => removePnL(h.month))}><X size={12} /></button>
                  </div>
                </div>
                {pnlGateFor(h.month)}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function DrawdownProtocol({ data, stats, setData, onResetHwm, hwmGate }) {
  const fmt = makeFmt(data.currency);
  const [hwmFlash, setHwmFlash] = useState(false);
  const zones = [
    { id: 'normal',    range: '0–9%',   label: 'Normal',     color: '#7FA068', desc: 'Full position sizes. Trade your plan.' },
    { id: 'caution',   range: '10–19%', label: 'Caution',    color: '#B89968', desc: 'Reduce position sizes by 25%. Review your last 10 trades for pattern issues.' },
    { id: 'defensive', range: '20–29%', label: 'Defensive',  color: '#D97757', desc: 'Reduce position sizes by 50%. Consider a week off. Review strategy assumptions.' },
    { id: 'stop',      range: '30%+',   label: 'Stop',       color: '#C56B5A', desc: 'Stop trading. Full pause required. Mandatory strategy review before resuming.' },
  ];

  const currentZone = zones.find(z => z.id === stats.drawdownZone);
  const recoveryNeeded = stats.drawdownPct > 0 ? (stats.drawdownPct / (100 - stats.drawdownPct)) * 100 : 0;

  return (
    <section className="card p-7 mt-6">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="display text-2xl">Drawdown Protocol</h2>
        <span className="label" style={{ color: '#5C5648' }}>Risk Management</span>
      </div>
      <p className="text-sm mb-6" style={{ color: '#8B8478' }}>
        Tracks how far your trading capital has dropped from its peak. The further you fall, the harder it is to recover. Rules change behavior before emotion does.
      </p>

      {/* Current state */}
      <div className="card-warm p-6 mb-5" style={{ borderColor: currentZone.color + '60' }}>
        <div className="flex items-baseline justify-between mb-3">
          <div className="label" style={{ color: currentZone.color }}>{currentZone.label} Zone</div>
          <div className="mono text-xs" style={{ color: '#8B8478' }}>{currentZone.range}</div>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mb-4">
          <div>
            <div className="label mb-2" style={{ color: '#5C5648' }}>High Water</div>
            <div className="display text-2xl" style={{ fontWeight: 300 }}>{fmt(stats.highWater)}</div>
          </div>
          <div>
            <div className="label mb-2" style={{ color: '#5C5648' }}>Current Drawdown</div>
            <div className="display text-2xl" style={{ fontWeight: 300, color: currentZone.color }}>
              {stats.drawdownPct.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="label mb-2" style={{ color: '#5C5648' }}>To Break Even</div>
            <div className="display text-2xl" style={{ fontWeight: 300 }}>
              {recoveryNeeded > 0 ? '+' + recoveryNeeded.toFixed(1) + '%' : '0%'}
            </div>
          </div>
        </div>
        <p className="text-sm" style={{ color: '#E8E2D5', lineHeight: 1.6 }}>
          {currentZone.desc}
        </p>
      </div>

      {/* All zones reference */}
      <div className="space-y-2">
        {zones.map(zone => (
          <div
            key={zone.id}
            className="flex items-center gap-4 p-3 rounded"
            style={{
              background: zone.id === stats.drawdownZone ? '#1A1410' : 'transparent',
              border: '1px solid ' + (zone.id === stats.drawdownZone ? zone.color + '40' : '#26221C'),
              opacity: zone.id === stats.drawdownZone ? 1 : 0.65,
            }}
          >
            <div style={{ width: '8px', height: '32px', background: zone.color, borderRadius: '2px' }} />
            <div className="mono text-sm" style={{ color: zone.color, minWidth: '70px' }}>{zone.range}</div>
            <div className="font-medium text-sm" style={{ minWidth: '90px' }}>{zone.label}</div>
            <div className="text-xs flex-1" style={{ color: '#8B8478' }}>{zone.desc}</div>
          </div>
        ))}
      </div>

      {/* Manual high water reset (rare cases) */}
      <div className="mt-6 pt-5 border-t" style={{ borderColor: '#26221C' }}>
        <div className="label mb-2" style={{ color: '#5C5648' }}>Override high water mark</div>
        <div className="flex gap-2 items-end">
          <input
            type="number"
            className="input"
            value={data.tradingCapitalHighWater || 0}
            onChange={(e) => setData(d => ({ ...d, tradingCapitalHighWater: Number(e.target.value) || 0 }))}
            style={{ maxWidth: '180px' }}
          />
          <button
            className="btn px-3 py-2 text-xs"
            style={{ color: hwmFlash ? '#7FA068' : '#8B8478', border: `1px solid ${hwmFlash ? '#2A4A2A' : '#26221C'}`, borderRadius: '3px', transition: 'color 0.3s, border-color 0.3s' }}
            onClick={() => onResetHwm?.(() => {
              setData(d => ({ ...d, tradingCapitalHighWater: d.tradingCapital }));
              setHwmFlash(true);
              setTimeout(() => setHwmFlash(false), 3000);
            })}
          >
            {hwmFlash ? '✓ Reset' : 'Reset to current'}
          </button>
        </div>
        {hwmGate}
        <p className="text-xs mt-2" style={{ color: '#5C5648' }}>
          The high water mark auto-updates when capital reaches a new peak. Only override if you intentionally withdrew funds (the drawdown calculation should ignore that).
        </p>
      </div>
    </section>
  );
};


/* ─────────────── IMPULSE ─────────────── */
function ImpulseTab({ data, stats, setData, user }) {
  const fmt = makeFmt(data.currency);
  const { symbol: currencySymbol } = getCurrency(data.currency);
  const isFoundation = data?.mode === 'foundation';
  const [view, setView] = useState('gate');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [trigger, setTrigger] = useState('');
  const [envelopeId, setEnvelopeId] = useState('');
  const [step, setStep] = useState('input');
  const [decision, setDecision] = useState(null);
  // Feature 4: PIN override state
  const [blockedEnv, setBlockedEnv] = useState(null);
  const [pinEntry, setPinEntry] = useState('');
  const [pinError, setPinError] = useState(false);
  const [pinStep, setPinStep] = useState(false); // show PIN input
  const [overrideUsed, setOverrideUsed] = useState(false);

  const amt = Number(amount) || 0;
  const hourlyRate = stats.salary / 160;
  const hours = (amt / hourlyRate).toFixed(1);
  const remaining = stats.spendingLeft - amt;

  // Feature 5: trading guard — enforce 24h sleep on >R100 discretionary
  const guardActive = data.tradingGuardUntil && Date.now() < data.tradingGuardUntil;

  const reset = () => {
    setName(''); setAmount(''); setCategory(''); setTrigger('');
    setEnvelopeId('');
    setStep('input'); setDecision(null);
    setBlockedEnv(null); setPinEntry(''); setPinError(false); setPinStep(false); setOverrideUsed(false);
  };

  const runGate = () => {
    if (!name || !amt) return;
    // Feature 5: force sleep on guard days for purchases above the gate threshold
    if (guardActive && amt >= data.spendingGateThreshold) { setStep('gate'); return; }
    if (amt >= data.spendingGateThreshold) setStep('gate');
    else { logImpulse(false, false); setDecision('logged-small'); setStep('decided'); }
  };

  // Compute envelope over-budget status for the selected envelope (display only — no blocking)
  const envelopeStatus = useMemo(() => {
    if (!envelopeId || !data.envelopes) return null;
    const env = data.envelopes.find(e => e.id === envelopeId);
    if (!env) return null;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const spent = (data.impulses || [])
      .filter(i => i.timestamp >= monthStart && i.envelopeId === envelopeId)
      .reduce((s, i) => s + i.amount, 0);
    return { env, spent, wouldBeOver: (spent + amt) > env.cap };
  }, [envelopeId, data.envelopes, data.impulses, amt]);

  const logImpulse = (gated, usedOverride = false) => {
    setData(d => ({
      ...d,
      impulses: [...d.impulses, {
        id: Date.now(),
        name,
        amount: amt,
        category: category || 'other',
        envelopeId: envelopeId || null,
        trigger,
        timestamp: Date.now(),
        wasGated: gated,
        overrideUsed: usedOverride || undefined,
        overrideAt: usedOverride ? Date.now() : undefined,
      }],
    }));
    if (usedOverride && user?.id) {
      queueNotification(user.id, 'override', { item: amount ? `${amount}` : undefined });
    }
  };

  const sleep = () => {
  setData(d => ({
    ...d,
    pending: [...d.pending, {
      id: Date.now(),
      name,
      amount: amt,
      category: category || 'other',
      envelopeId: envelopeId || null,
      timestamp: Date.now(),
      status: 'pending',
    }],
  }));
  setDecision('sleep'); setStep('decided');
};

  const buyAnyway = () => {
    if (envelopeStatus?.wouldBeOver) {
      const { env } = envelopeStatus;
      if (env.blockMode === 'hard') {
        setBlockedEnv(env);
        setDecision('blocked');
        setStep('decided');
        return;
      }
      if (env.blockMode === 'pin') {
        if (!data.overridePin) {
          setBlockedEnv(env);
          setDecision('blocked');
          setStep('decided');
          return;
        }
        setBlockedEnv(env);
        setPinStep(true);
        setPinEntry('');
        setPinError(false);
        return;
      }
    }
    logImpulse(true, overrideUsed);
    setDecision('bought');
    setStep('decided');
  };
  const cancel = () => { setDecision('cancelled'); setStep('decided'); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-4xl mb-2" style={{ fontWeight: 300 }}>
          Impulse <span style={{ fontStyle: 'italic', color: '#D97757' }}>control</span>
        </h1>
        <p style={{ color: '#8B8478', fontSize: '15px', maxWidth: '650px' }}>
          {isFoundation
            ? 'Pause before you spend. Every unplanned purchase runs through the gate first.'
            : "Same rules whether you're up or down. Your family's life shouldn't ride your trading P&L."}
        </p>
      </div>

      <div className="flex gap-2 border-b" style={{ borderColor: '#26221C' }}>
        {[
          { id: 'gate', label: 'Spending Gate' },
          { id: 'log', label: 'Quick Log' },
          { id: 'history', label: 'History & Triggers' },
        ].map(v => (
          <button key={v.id} onClick={() => { setView(v.id); reset(); }} className="btn px-4 py-3 text-xs font-medium"
            style={{ color: view === v.id ? '#D97757' : '#5C5648', borderBottom: '2px solid ' + (view === v.id ? '#D97757' : 'transparent'), marginBottom: '-1px' }}>
            {v.label}
          </button>
        ))}
      </div>

      {view === 'gate' && step === 'input' && (
        <div className="card p-7 space-y-5">
          <div>
            <div className="label mb-2" style={{ color: '#5C5648' }}>What is it?</div>
            <input className="input-text" placeholder="e.g., Tech upgrade…" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="label mb-2" style={{ color: '#5C5648' }}>Amount</div>
              <input type="number" className="input" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
			{(data.envelopes || []).length > 0 && (
			  <div>
				<div className="label mb-2" style={{ color: '#5C5648' }}>Envelope</div>
				<select className="input-text" value={envelopeId} onChange={(e) => setEnvelopeId(e.target.value)}>
				  <option value="">Select envelope…</option>
				  {data.envelopes.map(env => {
					const now = new Date();
					const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
					const spent = (data.impulses || [])
					  .filter(i => i.timestamp >= monthStart && i.envelopeId === env.id)
					  .reduce((s, i) => s + i.amount, 0);
					const remaining = env.cap - spent;
					return (
					  <option key={env.id} value={env.id}>
						{env.name} — {remaining >= 0 ? `${fmt(remaining)} left` : `${fmt(-remaining)} over`}
					  </option>
					);
				  })}
				</select>
			  </div>
			)}
            <div>
              <div className="label mb-2" style={{ color: '#5C5648' }}>Category</div>
              <select className="input-text" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Select…</option>
                {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-primary w-full" onClick={runGate} disabled={!name || !amt}>Run through the gate →</button>
        </div>
      )}

      {view === 'gate' && step === 'gate' && (
        <div className="space-y-4">
          <div className="card-warm p-7 glow-warm">
            <div className="label mb-3" style={{ color: '#D97757' }}>Pause and consider</div>
            <div className="display text-3xl mb-2" style={{ fontWeight: 300 }}>
              {fmt(amt)} <span className="text-xl" style={{ fontStyle: 'italic', color: '#8B8478' }}>for {name}</span>
            </div>
            {/* Envelope over-budget notice (informational only — enforced at Buy) */}
            {envelopeStatus?.wouldBeOver && (
              <div className="flex items-center gap-2 mt-3 text-sm" style={{ color: '#C56B5A' }}>
                <Lock size={13} />
                <span>
                  <strong>{envelopeStatus.env.name}</strong> envelope is over budget.
                  {envelopeStatus.env.blockMode === 'pin' && (data.overridePin ? ' PIN required to buy.' : ' No override PIN set — purchase will be blocked.')}
                  {envelopeStatus.env.blockMode === 'hard' && ' Hard block — purchase will be refused.'}
                </span>
              </div>
            )}
            {/* Trading guard notice */}
            {guardActive && amt >= data.spendingGateThreshold && !envelopeStatus?.wouldBeOver && (
              <div className="flex items-center gap-2 mt-3 text-sm" style={{ color: '#D97757' }}>
                <AlertTriangle size={13} />
                <span>Trading guard active — sleep on it is recommended.</span>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="card p-5">
              <Clock size={16} style={{ color: '#D97757' }} className="mb-3" />
              <div className="display text-2xl mb-1" style={{ fontWeight: 300 }}>{hours} hrs</div>
              <div className="text-xs" style={{ color: '#8B8478' }}>of work to earn this</div>
            </div>
            <div className="card p-5">
              <Wallet size={16} style={{ color: '#D97757' }} className="mb-3" />
              <div className="display text-2xl mb-1" style={{ color: remaining < 0 ? '#C56B5A' : '#E8E2D5', fontWeight: 300 }}>{fmt(Math.max(0, remaining))}</div>
              <div className="text-xs" style={{ color: '#8B8478' }}>left this month {remaining < 0 && '(over budget)'}</div>
            </div>
            <div className="card p-5">
              <TrendingUp size={16} style={{ color: '#D97757' }} className="mb-3" />
              <div className="display text-2xl mb-1" style={{ color: '#7FA068', fontWeight: 300 }}>{fmt(amt * Math.pow(1.07, 30))}</div>
              <div className="text-xs" style={{ color: '#8B8478' }}>in 30 years if invested</div>
            </div>
          </div>

          {/* PIN override entry */}
          {pinStep && (
            <div className="card p-5 space-y-3">
              <div className="label" style={{ color: '#5B7FB8' }}>Enter override PIN</div>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinEntry}
                onChange={e => { setPinEntry(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinError(false); }}
                className="input"
                placeholder="• • • •"
                style={{ letterSpacing: '0.4em', maxWidth: '120px', textAlign: 'center' }}
                autoFocus
              />
              {pinError && <div className="text-sm" style={{ color: '#C56B5A' }}>Incorrect. Purchase blocked.</div>}
              <div className="flex gap-2">
                <button
                  className="btn px-4 py-2"
                  style={{ background: '#5B7FB8', color: '#0A0908', borderRadius: '3px', fontWeight: 600, fontSize: '13px' }}
                  onClick={() => {
                    if (pinEntry === data.overridePin) {
                      setOverrideUsed(true);
                      setPinStep(false);
                      setBlockedEnv(null);
                      // Allow buy
                      logImpulse(true, true);
                      setDecision('bought');
                      setStep('decided');
                    } else {
                      setPinError(true);
                      setPinEntry('');
                    }
                  }}
                >
                  Confirm
                </button>
                <button
                  className="btn px-3 py-2"
                  style={{ color: '#8B8478', fontSize: '13px' }}
                  onClick={() => { setPinStep(false); setPinEntry(''); setPinError(false); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-3 pt-2" style={{ opacity: pinStep ? 0.3 : 1, pointerEvents: pinStep ? 'none' : undefined }}>
            <button className="btn p-5 text-left card" onClick={cancel} style={{ borderColor: '#3A4A2A' }}>
              <Check size={18} style={{ color: '#7FA068' }} className="mb-2" />
              <div className="font-medium mb-1">Skip it</div>
              <div className="text-xs" style={{ color: '#8B8478' }}>Don't need it.</div>
            </button>
            <button className="btn p-5 text-left card glow-warm" onClick={sleep}>
              <Clock size={18} style={{ color: '#D97757' }} className="mb-2" />
              <div className="font-medium mb-1">Sleep on it</div>
              <div className="text-xs" style={{ color: '#8B8478' }}>Decide tomorrow.</div>
            </button>
            <button className="btn p-5 text-left card" onClick={buyAnyway} style={{ borderColor: '#3A2620' }}>
              <Flame size={18} style={{ color: '#C56B5A' }} className="mb-2" />
              <div className="font-medium mb-1">Buy now</div>
              <div className="text-xs" style={{ color: '#8B8478' }}>I'm sure.</div>
            </button>
          </div>
        </div>
      )}

      {view === 'gate' && step === 'decided' && (
	  <div className="card-warm p-8 text-center">
		{decision === 'sleep' && <>
		  <Clock size={28} style={{ color: '#D97757' }} className="mx-auto mb-3" />
		  <div className="display text-3xl mb-2" style={{ fontStyle: 'italic', fontWeight: 300 }}>Sleeping on it.</div>
		  <p style={{ color: '#8B8478' }}>Find this in Command tomorrow.</p>
		</>}
		{decision === 'cancelled' && <>
		  <Check size={28} style={{ color: '#7FA068' }} className="mx-auto mb-3" />
		  <div className="display text-3xl mb-2" style={{ fontStyle: 'italic', fontWeight: 300 }}>Easy save.</div>
		  <p style={{ color: '#8B8478' }}>{fmt(amt)} stays where it belongs.</p>
		</>}
		{decision === 'bought' && <>
		  <Flame size={28} style={{ color: '#C56B5A' }} className="mx-auto mb-3" />
		  <div className="display text-3xl mb-2" style={{ fontStyle: 'italic', fontWeight: 300 }}>Logged.</div>
		  <p style={{ color: '#8B8478' }}>No judgment. Patterns build clarity.</p>
		</>}
		{decision === 'logged-small' && <>
		  <Check size={28} style={{ color: '#8B8478' }} className="mx-auto mb-3" />
		  <div className="display text-3xl mb-2" style={{ fontStyle: 'italic', fontWeight: 300 }}>Logged.</div>
		  <p style={{ color: '#8B8478' }}>Below gate threshold.</p>
		</>}
		{decision === 'blocked' && <>
		  <Lock size={28} style={{ color: '#C56B5A' }} className="mx-auto mb-3" />
		  <div className="display text-3xl mb-2" style={{ fontStyle: 'italic', fontWeight: 300, color: '#C56B5A' }}>Blocked.</div>
		  <p style={{ color: '#8B8478' }}>This envelope is over budget. Wait for next month, or move money from another envelope first.</p>
		</>}
		<button className="btn btn-primary mt-6" onClick={reset}>Done</button>
	  </div>
	)}
      {view === 'log' && <QuickLog data={data} setData={setData} />}
      {view === 'history' && <ImpulseHistory data={data} stats={stats} setData={setData} />}
    </div>
  );
}

function QuickLog({ data, setData }) {
  const fmt = makeFmt(data.currency);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [trigger, setTrigger] = useState('');
  const [logged, setLogged] = useState(null); // { name, amount } of last entry

  const log = () => {
    if (!name || !amount) return;
    const entry = { id: Date.now(), name, amount: Number(amount), category: category || 'other', trigger, timestamp: Date.now() };
    setData(d => ({ ...d, impulses: [...d.impulses, entry] }));
    setLogged({ name, amount: Number(amount) });
    setName(''); setAmount(''); setCategory(''); setTrigger('');
    setTimeout(() => setLogged(null), 3000);
  };

  return (
    <div className="card p-7 space-y-5">
      <p className="text-sm" style={{ color: '#8B8478' }}>Already bought it. Log without judgment.</p>
      <div>
        <div className="label mb-2" style={{ color: '#5C5648' }}>What did you buy?</div>
        <input className="input-text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="label mb-2" style={{ color: '#5C5648' }}>Amount</div>
          <input type="number" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <div className="label mb-2" style={{ color: '#5C5648' }}>Category</div>
          <select className="input-text" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select…</option>
            {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <div className="label mb-2" style={{ color: '#5C5648' }}>Trigger</div>
        <div className="flex flex-wrap gap-2">
          {TRIGGERS.map(t => (
            <button key={t} onClick={() => setTrigger(trigger === t ? '' : t)} className="pill btn"
              style={{
                background: trigger === t ? '#D97757' : '#0A0908',
                color: trigger === t ? '#0A0908' : '#8B8478',
                border: '1px solid ' + (trigger === t ? '#D97757' : '#26221C'),
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>
	  
      {logged && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#0F1A0E', border: '1px solid #2A4A2A',
          borderRadius: 4, padding: '10px 14px',
          fontSize: 13, color: '#7FA068',
          animation: 'fadeIn 0.2s ease',
        }}>
          <Check size={14} style={{ flexShrink: 0 }} />
          <span><strong style={{ color: '#A8D490' }}>{logged.name}</strong> — {fmt(logged.amount)} logged. No judgment.</span>
        </div>
      )}

      <button className="btn btn-primary w-full" onClick={log} disabled={!name || !amount}>Log it</button>
    </div>
  );
}

function ImpulseHistory({ data, stats, setData }) {
  const fmt = makeFmt(data.currency);
  const [overrideOnly, setOverrideOnly] = useState(false);
  const { attemptRow: attemptImpulseRow, gateFor: impulseGateFor } = usePinRowGate(data.overridePin);

  const removeImpulse = (id) => {
    setData(d => ({ ...d, impulses: d.impulses.filter(i => i.id !== id) }));
  };
  const triggerStats = useMemo(() => {
    const s = {};
    data.impulses.filter(i => i.trigger).forEach(i => {
      if (!s[i.trigger]) s[i.trigger] = { count: 0, total: 0 };
      s[i.trigger].count += 1;
      s[i.trigger].total += i.amount;
    });
    return Object.entries(s).sort((a, b) => b[1].total - a[1].total);
  }, [data.impulses]);

  const overrideCount = stats.thisMonthImpulses.filter(i => i.overrideUsed).length;
  const visibleImpulses = overrideOnly
    ? stats.thisMonthImpulses.filter(i => i.overrideUsed)
    : stats.thisMonthImpulses;

  const renderRow = (i) => (
    <div key={i.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#26221C' }}>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span>{i.name}</span>
          {i.overrideUsed && (
            <span style={{ background: '#3A1C1C', color: '#C56B5A', fontSize: '9px', padding: '2px 6px', borderRadius: '3px', fontWeight: 700, letterSpacing: '0.05em' }}>
              PIN OVERRIDE
            </span>
          )}
        </div>
        <div className="text-xs" style={{ color: '#5C5648' }}>
          {(CATEGORIES[i.category] || CATEGORIES.other).label}{i.trigger && ` · ${i.trigger}`}
          {i.overrideUsed && i.overrideAt && (
            <span style={{ color: '#5C5648' }}> · overridden {new Date(i.overrideAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="mono text-sm">{fmt(i.amount)}</span>
        <button
          onClick={() => attemptImpulseRow(i.id, () => removeImpulse(i.id))}
          className="btn p-1"
          style={{ color: '#5C5648', background: 'transparent', border: 'none', cursor: 'pointer' }}
          title="Delete entry"
        >
          <X size={14} />
        </button>
      </div>
      {impulseGateFor(i.id)}
    </div>
  );

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="display text-2xl">This month</h2>
          <div className="flex items-center gap-3">
            {overrideCount > 0 && (
              <button
                onClick={() => setOverrideOnly(v => !v)}
                style={{
                  fontSize: '11px', padding: '3px 8px', borderRadius: '3px', border: 'none', cursor: 'pointer',
                  background: overrideOnly ? '#3A1C1C' : '#1A1610',
                  color: overrideOnly ? '#C56B5A' : '#5C5648',
                  fontWeight: overrideOnly ? 700 : 400,
                }}
              >
                {overrideOnly ? '× PIN overrides only' : `PIN overrides (${overrideCount})`}
              </button>
            )}
            <div className="mono">{fmt(stats.thisMonthSpend)}</div>
          </div>
        </div>
        {visibleImpulses.length === 0 ? (
          <p className="text-sm" style={{ color: '#5C5648', fontStyle: 'italic' }}>
            {overrideOnly ? 'No PIN overrides this month.' : 'Nothing logged this month.'}
          </p>
        ) : (
          <div className="space-y-2">
            {visibleImpulses.slice().reverse().map(renderRow)}
          </div>
        )}
      </section>

      {triggerStats.length > 0 && (
        <section className="card p-6">
          <h2 className="display text-2xl mb-5">All triggers (all time)</h2>
          <div className="space-y-3">
            {triggerStats.map(([t, v]) => {
              const total = triggerStats.reduce((s, [_, x]) => s + x.total, 0);
              const pct = (v.total / total) * 100;
              return (
                <div key={t}>
                  <div className="flex justify-between mb-1.5">
                    <div>
                      <span className="font-medium text-sm">{t}</span>
                      <span className="text-xs ml-2" style={{ color: '#5C5648' }}>{v.count}×</span>
                    </div>
                    <span className="mono text-sm">{fmt(v.total)}</span>
                  </div>
                  <div className="progress">
                    <div className="progress-fill" style={{ width: pct + '%', background: '#D97757' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

/* ─────────────── HISTORY ─────────────── */
function History({ data, stats, setData }) {
  const fmt = makeFmt(data.currency);
  const sortedSnapshots = [...data.snapshots].sort((a, b) => a.date.localeCompare(b.date));
  const { attemptRow: attemptSnapshotRow, gateFor: snapshotGateFor } = usePinRowGate(data.overridePin);

  const removeSnapshot = (date) => {
    setData(d => ({ ...d, snapshots: d.snapshots.filter(s => s.date !== date) }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-4xl mb-2" style={{ fontWeight: 300 }}>
          Your <span style={{ fontStyle: 'italic', color: '#D97757' }}>history</span>
        </h1>
        <p style={{ color: '#8B8478', fontSize: '15px', maxWidth: '650px' }}>
          Snapshots show your financial position over time. Take a snapshot anytime — weekly, monthly, or whenever something significant changes.
        </p>
      </div>

      {sortedSnapshots.length === 0 ? (
        <div className="card-warm p-8 text-center">
          <Camera size={28} style={{ color: '#D97757' }} className="mx-auto mb-3" />
          <div className="display text-2xl mb-2" style={{ fontStyle: 'italic' }}>No snapshots yet.</div>
          <p className="text-sm max-w-md mx-auto" style={{ color: '#8B8478' }}>
            Hit the "Snapshot" button in the header to record your current state. Do this regularly to see your wealth grow over time.
          </p>
        </div>
      ) : (
        <>
          {/* Chart */}
          <section className="card p-6">
            <h2 className="display text-2xl mb-5">Net worth over time</h2>
            <div style={{ height: '320px' }}>
              <ResponsiveContainer>
                <AreaChart data={sortedSnapshots} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <defs>
                    <linearGradient id="bufferGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D97757" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#D97757" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ltGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7FA068" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#7FA068" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="trdGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5B7FB8" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#5B7FB8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#26221C" strokeDasharray="2 4" />
                  <XAxis dataKey="date" tick={{ fill: '#5C5648', fontSize: 11 }} stroke="#26221C" />
                  <YAxis tick={{ fill: '#5C5648', fontSize: 11 }} stroke="#26221C" tickFormatter={(v) => { const sym = getCurrency(data.currency).symbol; return sym + ' ' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v); }} />
                  <Tooltip contentStyle={{ background: '#14110E', border: '1px solid #26221C', borderRadius: '3px', fontFamily: 'JetBrains Mono', fontSize: '12px' }} formatter={(v) => fmt(v)} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="buffer" name="Buffer" stackId="1" stroke="#D97757" fill="url(#bufferGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="tradingCapital" name="Trading" stackId="1" stroke="#5B7FB8" fill="url(#trdGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="longTerm" name="Long-term" stackId="1" stroke="#7FA068" fill="url(#ltGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Snapshot list */}
          <section className="card p-6">
            <h2 className="display text-2xl mb-5">All snapshots</h2>
            <div className="space-y-3">
              {[...sortedSnapshots].reverse().map((s, i) => {
                const prev = sortedSnapshots[sortedSnapshots.length - 2 - i];
                const change = prev ? s.totalAssets - prev.totalAssets : 0;
                return (
                  <div key={s.date} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: '#26221C' }}>
                    <div>
                      <div className="font-medium text-sm">{new Date(s.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                      <div className="text-xs mt-1" style={{ color: '#8B8478' }}>
                        Buffer {fmt(s.buffer)} · Trading {fmt(s.tradingCapital)} · LT {fmt(s.longTerm)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="mono text-sm">{fmt(s.totalAssets)}</div>
                        {change !== 0 && (
                          <div className="text-xs mono" style={{ color: change > 0 ? '#7FA068' : '#C56B5A' }}>
                            {change > 0 ? '+' : ''}{fmt(change)}
                          </div>
                        )}
                      </div>
                      <button className="btn" style={{ color: '#5C5648' }} onClick={() => attemptSnapshotRow(s.date, () => removeSnapshot(s.date))}>
                        <X size={12} />
                      </button>
                    </div>
                    {snapshotGateFor(s.date)}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

/* ─────────────── RULES ─────────────── */
function AccessControlPanel() {
  const [codes, setCodes] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genEmail, setGenEmail] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [approvedCode, setApprovedCode] = useState(null);
  const [actionFlash, setActionFlash] = useState(null); // { msg, type: 'success'|'error' }

  const flashMsg = (msg, type = 'success') => {
    setActionFlash({ msg, type });
    setTimeout(() => setActionFlash(null), 3000);
  };

  useEffect(() => {
    Promise.all([
      getInviteCodes ? getInviteCodes() : Promise.resolve([]),
      getAccessRequests ? getAccessRequests() : Promise.resolve([]),
    ]).then(([c, r]) => { setCodes(c); setRequests(r); setLoading(false); });
  }, []);

  const refresh = () => {
    Promise.all([getInviteCodes(), getAccessRequests()]).then(([c, r]) => { setCodes(c); setRequests(r); });
  };

  const handleGenerate = async () => {
    const row = await createInviteCode(genEmail.trim() || null);
    if (row) { setGenEmail(''); refresh(); flashMsg('Invite code generated'); }
    else flashMsg('Failed to generate code', 'error');
  };

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    await deleteInviteCode(id);
    refresh();
    flashMsg('Code deleted');
  };

  const handleReset = async (id) => {
    await resetInviteCode(id);
    refresh();
    flashMsg('Code reset — ready to use again');
  };

  const handleApprove = async (req) => {
    const code = await approveAccessRequest(req.id, req.email);
    if (code) { setApprovedCode({ email: req.email, code }); refresh(); }
    else flashMsg('Failed to approve request', 'error');
  };

  const handleReject = async (id) => {
    await rejectAccessRequest(id);
    refresh();
    flashMsg('Request rejected');
  };

  const pending = requests.filter(r => r.status === 'pending');
  const activeCodes = codes.filter(c => !c.used);
  const usedCodes = codes.filter(c => c.used);

  const codePill = (code, id, extra = null) => (
    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: '#0A0908', border: '1px solid #26221C', borderRadius: '3px' }}>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', letterSpacing: '0.2em', color: '#E8E2D5', flex: 1 }}>{code}</span>
      {extra}
      <button onClick={() => handleCopy(code, id)} style={{ background: 'transparent', border: 'none', color: copiedId === id ? '#7FA068' : '#5C5648', cursor: 'pointer', fontSize: '11px', padding: '2px 6px' }}>
        {copiedId === id ? 'Copied!' : 'Copy'}
      </button>
      <button onClick={() => handleDelete(id)} style={{ background: 'transparent', border: 'none', color: '#C56B5A', cursor: 'pointer', fontSize: '11px', padding: '2px 6px' }}>
        Delete
      </button>
    </div>
  );

  if (loading) return <div style={{ color: '#5C5648', fontSize: '13px' }}>Loading…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Action flash */}
      {actionFlash && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', borderRadius: '4px', fontSize: '13px',
          background: actionFlash.type === 'error' ? '#160E0C' : '#0F1A0E',
          border: `1px solid ${actionFlash.type === 'error' ? '#3A1E18' : '#2A4A2A'}`,
          color: actionFlash.type === 'error' ? '#C56B5A' : '#7FA068',
        }}>
          <Check size={13} style={{ flexShrink: 0 }} />
          {actionFlash.msg}
        </div>
      )}

      {/* Approved code flash */}
      {approvedCode && (
        <div style={{ padding: '14px 16px', background: '#0D1A0D', border: '1px solid #2A4A2A', borderRadius: '4px' }}>
          <div style={{ fontSize: '13px', color: '#7FA068', fontWeight: 600, marginBottom: '4px' }}>✓ Invite code generated</div>
          <div style={{ fontSize: '12px', color: '#5C8A5C', marginBottom: '10px' }}>
            Send this code to <strong style={{ color: '#E8E2D5' }}>{approvedCode.email}</strong>
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '20px', letterSpacing: '0.3em', color: '#E8E2D5', marginBottom: '10px' }}>{approvedCode.code}</div>
          <div style={{ fontSize: '11px', color: '#D97757', background: '#1A1008', border: '1px solid #3A2A10', borderRadius: '3px', padding: '7px 10px', marginBottom: '10px', lineHeight: 1.5 }}>
            ⚠️ This code is locked to <strong>{approvedCode.email}</strong>. The user must register with that exact email address or the code will be rejected.
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => { navigator.clipboard.writeText(approvedCode.code); }} style={{ background: 'transparent', border: '1px solid #2A4A2A', color: '#7FA068', cursor: 'pointer', fontSize: '11px', padding: '4px 10px', borderRadius: '3px' }}>Copy code</button>
            <button onClick={() => setApprovedCode(null)} style={{ background: 'transparent', border: 'none', color: '#5C5648', cursor: 'pointer', fontSize: '11px', padding: '4px 6px' }}>Dismiss</button>
          </div>
        </div>
      )}

      {/* Pending requests */}
      {pending.length > 0 && (
        <div>
          <div className="label mb-3" style={{ color: '#D97757' }}>Access requests ({pending.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pending.map(r => (
              <div key={r.id} style={{ padding: '10px 12px', background: '#0A0908', border: '1px solid #3A2A1E', borderRadius: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#E8E2D5' }}>{r.email}</div>
                    {r.message && <div style={{ fontSize: '12px', color: '#8B8478', marginTop: '2px' }}>{r.message}</div>}
                    <div style={{ fontSize: '11px', color: '#3A3028', marginTop: '2px' }}>{new Date(r.created_at).toLocaleDateString(undefined)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => handleApprove(r)} style={{ background: '#1A3020', border: '1px solid #2A4A30', color: '#7FA068', borderRadius: '3px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer' }}>
                      Approve
                    </button>
                    <button onClick={() => handleReject(r.id)} style={{ background: 'transparent', border: '1px solid #3A2620', color: '#C56B5A', borderRadius: '3px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer' }}>
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {pending.length === 0 && <div style={{ fontSize: '13px', color: '#3A3028' }}>No pending access requests.</div>}

      {/* Generate code */}
      <div>
        <div className="label mb-2" style={{ color: '#5C5648' }}>Generate invite code</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="email" value={genEmail} placeholder="Restrict to email (optional)"
            onChange={e => setGenEmail(e.target.value)}
            style={{ flex: 1, background: '#0A0908', border: '1px solid #26221C', padding: '9px 12px', color: '#E8E2D5', borderRadius: '3px', fontSize: '13px', outline: 'none' }}
          />
          <button onClick={handleGenerate} style={{ background: '#D97757', color: '#0A0908', border: 'none', borderRadius: '3px', padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Generate
          </button>
        </div>
        <div style={{ fontSize: '11px', color: '#3A3028', marginTop: '5px' }}>Leave email blank for an open code anyone can use.</div>
      </div>

      {/* Active codes */}
      {activeCodes.length > 0 && (
        <div>
          <div className="label mb-2" style={{ color: '#5C5648' }}>Active codes ({activeCodes.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {activeCodes.map(c => codePill(c.code, c.id, c.email ? (
              <span style={{ fontSize: '11px', color: '#8B8478' }}>→ {c.email}</span>
            ) : null))}
          </div>
        </div>
      )}

      {/* Used codes */}
      {usedCodes.length > 0 && (
        <div>
          <div className="label mb-2" style={{ color: '#3A3028' }}>Used codes</div>
          <div style={{ fontSize: '11px', color: '#3A3028', marginBottom: '6px' }}>
            If a code was consumed by a failed signup, hit Reset to make it active again.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {usedCodes.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: '#0A0908', border: '1px solid #1E1C18', borderRadius: '3px', opacity: 0.7 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', letterSpacing: '0.2em', color: '#5C5648', flex: 1 }}>{c.code}</span>
                {c.used_by_email && (
                  <span style={{ fontSize: '11px', color: '#3A3028' }}>→ {c.used_by_email}</span>
                )}
                <button
                  onClick={() => handleReset(c.id)}
                  style={{ background: 'transparent', border: '1px solid #3A2A1E', color: '#D97757', borderRadius: '3px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Reset
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  style={{ background: 'transparent', border: 'none', color: '#C56B5A', cursor: 'pointer', fontSize: '11px', padding: '2px 6px' }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────── CLOUD SYNC PANEL ─────────────── */
function CloudSyncPanel({ user, data, setData, syncStatus, isOnline, lastSyncedAt, onRetrySync }) {
  const [uploadStatus, setUploadStatus] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState(null);

  const fmtAge = (ts) => {
    if (!ts) return null;
    const mins = Math.round((Date.now() - ts) / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24)  return `${hrs} hr ago`;
    return new Date(ts).toLocaleDateString(undefined);
  };

  // Build status label from syncStatus string
  const isFailed  = syncStatus === 'failed' || syncStatus?.startsWith?.('failed');
  const isSyncing = syncStatus === 'syncing' || syncStatus?.startsWith?.('retry:');
  const isSynced  = syncStatus === 'synced';

  const statusLabel = (() => {
    if (!user) return { text: 'Local only — not signed in', color: '#5C5648' };
    if (!isOnline) return { text: 'Offline — saved locally', color: '#B89968' };
    if (isSyncing) {
      const retryPart = syncStatus?.startsWith?.('retry:') ? ` (${syncStatus.slice(6)})` : '';
      return { text: `Syncing…${retryPart}`, color: '#D97757' };
    }
    if (isSynced) return { text: 'Synced ✓', color: '#7FA068' };
    if (isFailed) {
      const rlsError = syncStatus === 'failed:rls';
      return {
        text: rlsError ? 'Sync failed — permission error. Sign out and back in.' : 'Sync failed — data saved locally',
        color: '#C56B5A',
      };
    }
    return { text: lastSyncedAt ? 'Synced ✓' : 'Ready to sync', color: lastSyncedAt ? '#7FA068' : '#5C5648' };
  })();

  const handleUpload = async () => {
    if (!user) return;
    setUploadStatus('loading');
    const ok = await importLocalToCloud(user.id, data);
    setUploadStatus(ok ? 'done' : 'error');
    setTimeout(() => setUploadStatus(null), 3000);
  };

  const handleDownload = async () => {
    if (!user) return;
    setDownloadStatus('loading');
    const remote = await loadData(user.id);
    if (remote) {
      setData(d => ({ ...d, ...remote }));
      setDownloadStatus('done');
    } else {
      setDownloadStatus('error');
    }
    setTimeout(() => setDownloadStatus(null), 3000);
  };

  return (
    <section className="card p-6">
      <h2 className="display text-2xl mb-1">Cloud Sync</h2>
      <p className="text-sm mb-5" style={{ color: '#8B8478' }}>
        Your data syncs automatically when signed in. Use the manual controls below if needed.
      </p>

      {/* Status row */}
      <div className="flex items-center gap-2 mb-2">
        <div style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: statusLabel.color,
        }} />
        <span className="text-sm" style={{ color: statusLabel.color }}>{statusLabel.text}</span>
      </div>

      {/* Last synced timestamp */}
      <div className="text-xs mb-5" style={{ color: lastSyncedAt ? '#3A3028' : '#2A241E' }}>
        {lastSyncedAt ? `Last synced: ${fmtAge(lastSyncedAt)}` : 'Not yet synced'}
      </div>

      {/* Retry button — only when failed */}
      {isFailed && onRetrySync && (
        <button
          onClick={onRetrySync}
          style={{
            background: '#1A1610', border: '1px solid #D97757',
            color: '#D97757', borderRadius: '3px', padding: '8px 14px',
            fontSize: '13px', cursor: 'pointer', marginBottom: '16px', fontWeight: 600,
          }}
        >
          ↻ Retry Sync
        </button>
      )}

      {/* Manual controls */}
      {user && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleUpload}
            disabled={uploadStatus === 'loading' || !isOnline}
            style={{
              background: 'transparent', border: '1px solid #3A2A1E',
              color: uploadStatus === 'error' ? '#C56B5A' : uploadStatus === 'done' ? '#7FA068' : '#D97757',
              borderRadius: '3px', padding: '8px 14px', fontSize: '13px',
              cursor: (uploadStatus === 'loading' || !isOnline) ? 'not-allowed' : 'pointer',
              opacity: !isOnline ? 0.5 : 1,
            }}
          >
            {uploadStatus === 'loading' ? 'Uploading…' : uploadStatus === 'done' ? 'Uploaded ✓' : uploadStatus === 'error' ? 'Upload failed' : '↑ Upload local → cloud'}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloadStatus === 'loading' || !isOnline}
            style={{
              background: 'transparent', border: '1px solid #3A2A1E',
              color: downloadStatus === 'error' ? '#C56B5A' : downloadStatus === 'done' ? '#7FA068' : '#8B8478',
              borderRadius: '3px', padding: '8px 14px', fontSize: '13px',
              cursor: (downloadStatus === 'loading' || !isOnline) ? 'not-allowed' : 'pointer',
              opacity: !isOnline ? 0.5 : 1,
            }}
          >
            {downloadStatus === 'loading' ? 'Downloading…' : downloadStatus === 'done' ? 'Downloaded ✓' : downloadStatus === 'error' ? 'Download failed' : '↓ Download cloud → device'}
          </button>
        </div>
      )}

      <p className="text-xs mt-4" style={{ color: '#3A3028' }}>
        "Upload" overwrites cloud with this device's data. "Download" overwrites this device with the cloud copy.
      </p>
    </section>
  );
}

/* ─────────────── ACCOUNT SETTINGS ─────────────── */
const APP_VERSION = '1.0.0';

function AccountSettings({ user, onLogout, onChangePassword, onSignOutOthers, data, setData, syncStatus = 'idle', isOnline = true, lastSyncedAt = null, onRetrySync = null }) {
  const fmt = makeFmt(data.currency);
  const [sTab, setSTab] = useState('account'); // 'account' | 'sessions' | 'access' | 'setup' | 'danger'
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwStatus, setPwStatus] = useState(null);
  const [displayName, setDisplayName] = useState(data.displayName || '');
  const [nameSaved, setNameSaved] = useState(false);
  const [signOutOthersStatus, setSignOutOthersStatus] = useState(null);
  const { attempt: attemptOnboarding, gate: onboardingGate } = usePinGate(data.overridePin);
  const { attempt: attemptReset, gate: resetGate } = usePinGate(data.overridePin);

  // Override PIN flow
  const [changingPin, setChangingPin] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');
  const [currencyChanged, setCurrencyChanged] = useState(false);
  const [hoveredCurrency, setHoveredCurrency] = useState(null);

  const [pinSaved, setPinSaved] = useState(false);

  const submitPinChange = () => {
    if (data.overridePin && oldPin !== data.overridePin) { setPinChangeError('Incorrect current PIN.'); return; }
    if (newPin.length > 0 && newPin.length < 4) { setPinChangeError('PIN must be 4 digits.'); return; }
    const action = newPin ? 'updated' : 'removed';
    setData(d => ({ ...d, overridePin: newPin }));
    setChangingPin(false); setOldPin(''); setNewPin(''); setPinChangeError('');
    setPinSaved(action);
    setTimeout(() => setPinSaved(false), 3000);
  };

  const inputStyle = {
    background: '#0A0908', border: '1px solid #26221C', padding: '10px 13px',
    color: '#E8E2D5', borderRadius: '3px', fontSize: '14px', outline: 'none',
    width: '100%', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
  };
  const monoInput = { ...inputStyle, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setPwStatus('Passwords do not match.'); return; }
    if (newPassword.length < 8) { setPwStatus('Password must be at least 8 characters.'); return; }
    if (!onChangePassword) { setPwStatus('Password change is not available in local mode.'); return; }
    setPwStatus('loading');
    const ok = await onChangePassword(newPassword);
    if (ok) { setPwStatus('success'); setNewPassword(''); setConfirmPassword(''); setTimeout(() => setPwStatus(null), 4000); }
    else setPwStatus('Failed to update password. Try signing out and back in.');
  };

  const saveName = () => {
    setData(d => ({ ...d, displayName: displayName.trim() }));
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2500);
  };

  return (
    <div className="space-y-6">

      {/* Page header — title left · sync beside title · sign out far right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>

        {/* Title + email */}
        <div>
          <h1 className="display text-4xl mb-1" style={{ fontWeight: 300 }}>
            Account <span style={{ fontStyle: 'italic', color: '#D97757' }}>settings</span>
          </h1>
          {user && <p style={{ color: '#5C5648', fontSize: '13px' }}>{user.email}</p>}
        </div>

        {/* Sync status — 48px from title, contextual to Account tab only */}
        {user && (() => {
          const isRetry   = syncStatus?.startsWith?.('retry:');
          const isFailed  = syncStatus === 'failed' || syncStatus?.startsWith?.('failed');
          const isSyncing = syncStatus === 'syncing' || isRetry;
          let text  = lastSyncedAt ? '✓ Synced' : 'Not yet synced';
          let color = lastSyncedAt ? '#7FA068' : '#5C5648';
          if (!isOnline)                    { text = 'Offline'; color = '#B89968'; }
          else if (isSyncing)               { text = isRetry ? `Syncing… ${syncStatus.slice(6)}` : 'Syncing…'; color = '#D97757'; }
          else if (syncStatus === 'synced') { text = '✓ Synced'; color = '#7FA068'; }
          else if (isFailed)                { text = syncStatus === 'failed:rls' ? 'Sync error' : 'Sync failed'; color = '#C56B5A'; }

          const ageLabel = (() => {
            if (!lastSyncedAt) return null;
            const mins = Math.round((Date.now() - lastSyncedAt) / 60000);
            if (mins < 1)  return 'just now';
            if (mins < 60) return `${mins} min ago`;
            const hrs = Math.round(mins / 60);
            if (hrs < 24)  return `${hrs}h ago`;
            return new Date(lastSyncedAt).toLocaleDateString(undefined);
          })();

          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right', gap: '3px' }}>

              {/* Row 1: status dot + label + inline retry if failed */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: '12px', fontWeight: 500, color, letterSpacing: '0.01em' }}>
                  {text}
                </span>
                {isFailed && onRetrySync && (
                  <button
                    onClick={onRetrySync}
                    style={{
                      background: 'transparent', border: 'none', padding: 0,
                      fontSize: '11px', color: '#D97757', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', marginLeft: '2px',
                    }}
                  >
                    ↻ Retry
                  </button>
                )}
              </div>

              {/* Row 2: age label — only when relevant */}
              {ageLabel && !isFailed && (
                <div style={{ fontSize: '11px', color: '#3A3028', lineHeight: 1 }}>
                  {ageLabel}
                </div>
              )}

            </div>
          );
        })()}

        {/* Sign out — marginLeft: auto pushes it independently to the far right */}
        {user && onLogout && (
          <button
            onClick={onLogout}
            style={{
              marginLeft: 'auto', padding: '7px 14px', fontSize: '13px', fontWeight: 500,
              color: '#C56B5A', background: 'transparent',
              border: '1px solid #3A2620', borderRadius: '4px',
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 150ms',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <Activity size={13} />
            Sign out
          </button>
        )}

      </div>

      {/* Sub-tab strip — underline style, matches top nav rhythm */}
      <div style={{
        display: 'flex', gap: '20px', flexWrap: 'wrap',
        borderBottom: '1px solid #26221C',
      }}>
        {[
          { id: 'account',  label: 'Account' },
          { id: 'sessions', label: 'Sessions' },
          ...(user ? [{ id: 'access', label: 'Access' }] : []),
          { id: 'setup',    label: 'Data & Sync' },
          { id: 'danger',   label: 'Danger zone' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setSTab(t.id)}
            className={`stab-btn ${sTab === t.id ? `stab-active${t.id === 'danger' ? ' stab-danger' : ''}` : 'stab-inactive'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Account sub-tab ── */}
      {sTab === 'account' && (
        <div className="space-y-8">

          {/* ── Identity ─────────────────────────────────────────────── */}
          <div>
            <div style={{
              fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
              fontWeight: 700, color: '#3A3028', paddingBottom: '12px',
              borderBottom: '1px solid #1A1610', marginBottom: '16px',
            }}>Identity</div>
            <div className="space-y-4">

              {/* Profile */}
              <section className="card p-6">
                <h2 className="display text-2xl mb-4">Profile</h2>
                <div className="space-y-4" style={{ maxWidth: '420px' }}>
                  <div>
                    <div className="label mb-2" style={{ color: '#5C5648' }}>Display name</div>
                    <div className="flex gap-2">
                      <input type="text" value={displayName}
                        onChange={e => { setDisplayName(e.target.value); setNameSaved(false); }}
                        onKeyDown={e => e.key === 'Enter' && saveName()}
                        placeholder="How should we call you?" style={inputStyle} maxLength={40} />
                      <button onClick={saveName} disabled={displayName.trim() === (data.displayName || '')}
                        style={{
                          background: '#D97757', color: '#0A0908', padding: '10px 16px',
                          borderRadius: '3px', fontSize: '13px', fontWeight: 600, border: 'none',
                          whiteSpace: 'nowrap',
                          opacity: displayName.trim() === (data.displayName || '') ? 0.4 : 1,
                          cursor: displayName.trim() === (data.displayName || '') ? 'default' : 'pointer',
                        }}>
                        {nameSaved ? 'Saved ✓' : 'Save'}
                      </button>
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#5C5648' }}>Shown in the app header instead of your email.</div>
                  </div>
                  <div>
                    <div className="label mb-2" style={{ color: '#5C5648' }}>Email</div>
                    <div style={{ ...inputStyle, color: '#5C5648', background: '#0D0B09', cursor: 'default' }}>{user?.email}</div>
                    <div className="text-xs mt-1" style={{ color: '#3A3028' }}>Email cannot be changed here.</div>
                  </div>
                </div>
              </section>

              {/* Password */}
              <section className="card p-6">
                <h2 className="display text-2xl mb-1">Password</h2>
                <p className="text-sm mb-5" style={{ color: '#8B8478' }}>Update your login password. You'll stay signed in after changing it.</p>
                <form onSubmit={handleChangePassword} style={{ maxWidth: '420px' }}>
                  <div className="space-y-4">
                    <div>
                      <div className="label mb-2" style={{ color: '#5C5648' }}>New password <span style={{ letterSpacing: 'normal', textTransform: 'none', fontWeight: 400, fontSize: '11px', color: '#3A3028' }}>(min. 8 characters)</span></div>
                      <input type="password" className="auth-input" value={newPassword}
                        onChange={e => { setNewPassword(e.target.value); setPwStatus(null); }}
                        placeholder="••••••••" required minLength={8} style={monoInput} />
                    </div>
                    <div>
                      <div className="label mb-2" style={{ color: '#5C5648' }}>Confirm new password</div>
                      <input type="password" className="auth-input" value={confirmPassword}
                        onChange={e => { setConfirmPassword(e.target.value); setPwStatus(null); }}
                        placeholder="••••••••" required minLength={8} style={monoInput} />
                    </div>
                    {pwStatus && pwStatus !== 'loading' && pwStatus !== 'success' && (
                      <div style={{ fontSize: '13px', color: '#C56B5A', padding: '8px 12px', background: '#1A0E0C', border: '1px solid #3A2018', borderRadius: '3px' }}>{pwStatus}</div>
                    )}
                    {pwStatus === 'success' && (
                      <div style={{ fontSize: '13px', color: '#7FA068', padding: '8px 12px', background: '#0D1A0D', border: '1px solid #2A4A2A', borderRadius: '3px' }}>Password updated successfully.</div>
                    )}
                    <button type="submit" disabled={pwStatus === 'loading' || !newPassword || !confirmPassword}
                      style={{
                        background: '#D97757', color: '#0A0908', padding: '11px 20px', fontWeight: 600,
                        borderRadius: '3px', fontSize: '13px', border: 'none',
                        cursor: (pwStatus === 'loading' || !newPassword || !confirmPassword) ? 'not-allowed' : 'pointer',
                        opacity: (pwStatus === 'loading' || !newPassword || !confirmPassword) ? 0.6 : 1,
                      }}>
                      {pwStatus === 'loading' ? 'Updating…' : 'Update password'}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          </div>

          {/* ── Security ─────────────────────────────────────────────── */}
          <div>
            <div style={{
              fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
              fontWeight: 700, color: '#3A3028', paddingBottom: '12px',
              borderBottom: '1px solid #1A1610', marginBottom: '16px',
            }}>Security</div>
            <div className="space-y-4">

              {/* Override PIN */}
              <section className="card p-6">
                <div className="flex items-center gap-2 mb-2">
                  <KeyRound size={16} style={{ color: '#5B7FB8' }} />
                  <h2 className="display text-2xl">Override PIN</h2>
                </div>
                <p className="text-sm mb-4" style={{ color: '#8B8478' }}>
                  4-digit PIN that gates all sensitive edits and overrides hard blocks in the Spending Gate. Overrides are logged with a red badge in History.
                </p>

                {!data.overridePin ? (
                  <div>
                    <div className="label mb-2" style={{ color: '#5C5648' }}>Set PIN (4 digits)</div>
                    <div className="flex items-center gap-3">
                      <input
                        type="password" inputMode="numeric" maxLength={4} className="input" placeholder="••••"
                        value={newPin}
                        onChange={(e) => { setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinChangeError(''); }}
                        style={{ letterSpacing: '0.4em', maxWidth: '100px', textAlign: 'center' }}
                      />
                      <button
                        className="btn px-4 py-2 text-sm"
                        style={{ background: '#5B7FB8', color: '#0A0908', borderRadius: '3px', fontWeight: 600, opacity: newPin.length === 4 ? 1 : 0.5 }}
                        onClick={() => { if (newPin.length === 4) { setData(d => ({ ...d, overridePin: newPin })); setNewPin(''); } }}
                        disabled={newPin.length !== 4}
                      >
                        Set PIN
                      </button>
                    </div>
                    {pinChangeError && <p className="text-xs mt-2" style={{ color: '#C56B5A' }}>{pinChangeError}</p>}
                  </div>
                ) : changingPin ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div>
                        <div className="label mb-1" style={{ color: '#5C5648' }}>Current PIN</div>
                        <input type="password" inputMode="numeric" maxLength={4} className="input" placeholder="••••"
                          value={oldPin} onChange={(e) => { setOldPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinChangeError(''); }}
                          style={{ letterSpacing: '0.4em', maxWidth: '90px', textAlign: 'center' }} autoFocus />
                      </div>
                      <div>
                        <div className="label mb-1" style={{ color: '#5C5648' }}>New PIN (or blank to remove)</div>
                        <input type="password" inputMode="numeric" maxLength={4} className="input" placeholder="••••"
                          value={newPin} onChange={(e) => { setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinChangeError(''); }}
                          style={{ letterSpacing: '0.4em', maxWidth: '90px', textAlign: 'center' }} />
                      </div>
                    </div>
                    {pinChangeError && <p className="text-xs" style={{ color: '#C56B5A' }}>{pinChangeError}</p>}
                    <div className="flex gap-2">
                      <button className="btn px-4 py-2 text-sm" style={{ background: '#5B7FB8', color: '#0A0908', borderRadius: '3px', fontWeight: 600 }} onClick={submitPinChange}>Confirm</button>
                      <button className="btn px-3 py-2 text-sm" style={{ color: '#8B8478' }} onClick={() => { setChangingPin(false); setOldPin(''); setNewPin(''); setPinChangeError(''); }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 flex-wrap">
                    {pinSaved ? (
                      <span className="text-xs flex items-center gap-1" style={{ color: '#7FA068' }}>
                        <Check size={12} /> PIN {pinSaved} successfully
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: '#7FA068' }}>✓ PIN set</span>
                    )}
                    <button className="btn px-3 py-1 text-xs" style={{ color: '#5B7FB8', border: '1px solid #1E2A3A', borderRadius: '3px' }}
                      onClick={() => { setChangingPin(true); setOldPin(''); setNewPin(''); setPinChangeError(''); }}>
                      Change PIN
                    </button>
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* ── Preferences ──────────────────────────────────────────── */}
          <div>
            <div style={{
              fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
              fontWeight: 700, color: '#3A3028', paddingBottom: '12px',
              borderBottom: '1px solid #1A1610', marginBottom: '16px',
            }}>Preferences</div>
            <div className="space-y-4">

              {/* Currency */}
              <section className="card p-6">
                <h2 className="display text-2xl mb-1">Currency</h2>
                <p className="text-sm mb-5" style={{ color: '#8B8478' }}>
                  This only changes how amounts are displayed. It does not convert existing values.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
                  {CURRENCIES.map(({ code, symbol, name, flag }) => {
                    const active  = (data.currency ?? 'ZAR') === code;
                    const hovered = hoveredCurrency === code && !active;
                    return (
                      <button
                        key={code}
                        onMouseEnter={() => setHoveredCurrency(code)}
                        onMouseLeave={() => setHoveredCurrency(null)}
                        onClick={() => {
                          setData(d => ({ ...d, currency: code }));
                          setCurrencyChanged(true);
                          setTimeout(() => setCurrencyChanged(false), 2000);
                        }}
                        style={{
                          position: 'relative',
                          background: active ? '#231E12' : hovered ? '#0E0C0A' : '#080706',
                          border: `1px solid ${active ? '#D97757' : hovered ? '#2E2820' : '#1E1A16'}`,
                          borderRadius: 8, padding: '14px 12px', cursor: 'pointer',
                          textAlign: 'left', transition: 'background 150ms, border-color 150ms',
                        }}
                      >
                        {/* Active check mark */}
                        {active && (
                          <div style={{ position: 'absolute', top: 8, right: 8 }}>
                            <Check size={11} color="#D97757" />
                          </div>
                        )}

                        {/* Flag */}
                        <div style={{ fontSize: 22, lineHeight: 1, marginBottom: 8 }}>{flag}</div>

                        {/* Symbol + code */}
                        <div style={{
                          fontSize: 13, fontWeight: 700, marginBottom: 4,
                          color: active ? '#D97757' : '#6B6058',
                          fontFamily: 'JetBrains Mono, monospace',
                        }}>
                          {symbol} {code}
                        </div>

                        {/* Full currency name */}
                        <div style={{
                          fontSize: 10, lineHeight: 1.4,
                          color: active ? '#5C5648' : '#2E2820',
                        }}>
                          {name}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Inline confirmation — always rendered, fades in/out via opacity */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  marginTop: '14px', height: '16px',
                  fontSize: '12px', color: '#7FA068',
                  opacity: currencyChanged ? 1 : 0,
                  transition: 'opacity 350ms',
                  pointerEvents: 'none',
                }}>
                  <Check size={11} color="#7FA068" />
                  Currency updated
                </div>
              </section>

              {/* Notifications & timezone */}
              <NotificationSettings user={user} data={data} setData={setData} />

              {/* Income profile */}
              <section className="card p-6">
                <h2 className="display text-2xl mb-1">Income profile</h2>
                <p className="text-sm mb-5" style={{ color: '#8B8478' }}>Controls which features are visible. You can change this any time.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '480px' }}>
                  {[
                    { id: 'variable', title: 'Variable', desc: 'Trading, freelance, commissions, business. Includes Trading P&L tab.', icon: TrendingUp },
                    { id: 'fixed',    title: 'Fixed',    desc: 'Salary, pension, regular employment. Trading P&L tab hidden.', icon: Briefcase },
                    { id: 'mixed',    title: 'Mixed',    desc: 'Salary plus side hustle or trading. Includes Trading P&L tab.', icon: Users },
                  ].map(({ id, title, desc, icon: Icon }) => {
                    const active = (data.incomeType ?? 'variable') === id;
                    return (
                      <button key={id} onClick={() => setData(d => ({ ...d, incomeType: id }))} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '14px',
                        background: active ? '#1E1A10' : '#0A0908',
                        border: `1px solid ${active ? '#D97757' : '#26221C'}`,
                        borderRadius: '6px', padding: '14px 16px', cursor: 'pointer',
                        textAlign: 'left', transition: 'border-color 150ms',
                      }}>
                        <Icon size={18} style={{ color: active ? '#D97757' : '#5C5648', marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: active ? '#E8E2D5' : '#8B8478', marginBottom: '3px' }}>{title}</div>
                          <div style={{ fontSize: '12px', color: '#5C5648', lineHeight: 1.5 }}>{desc}</div>
                        </div>
                        {active && <Check size={16} style={{ color: '#D97757', marginLeft: 'auto', flexShrink: 0 }} />}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* ── Sessions sub-tab ── */}
      {sTab === 'sessions' && (
        <div className="space-y-5">
          <div>
            <div className="label mb-3" style={{ color: '#5C5648' }}>Current session</div>
            <div style={{
              background: '#0A0908', border: '1px solid #26221C', borderRadius: '6px',
              padding: '16px', display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: '#1A1610', border: '1px solid #2A2420',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Smartphone size={17} color="#D97757" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', color: '#E8E2D5', fontWeight: 500 }}>
                  This device
                  <span style={{
                    marginLeft: '8px', fontSize: '10px', padding: '2px 7px',
                    background: '#0D1A0D', border: '1px solid #2A4A2A',
                    color: '#7FA068', borderRadius: '20px', fontWeight: 600, letterSpacing: '0.1em',
                  }}>ACTIVE</span>
                </div>
                <div style={{ fontSize: '12px', color: '#5C5648', marginTop: '3px' }}>{user?.email}</div>
                {user?.last_sign_in_at && (
                  <div style={{ fontSize: '11px', color: '#3A3028', marginTop: '2px' }}>
                    Signed in {new Date(user.last_sign_in_at).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
              <button onClick={onLogout} style={{
                background: 'transparent', border: '1px solid #3A2620', color: '#C56B5A',
                borderRadius: '4px', padding: '8px 14px', fontSize: '13px', cursor: 'pointer',
                whiteSpace: 'nowrap', flexShrink: 0, fontWeight: 500,
              }}>
                Sign out
              </button>
            </div>
          </div>

          {onSignOutOthers && (
            <div>
              <div className="label mb-3" style={{ color: '#5C5648' }}>Other devices</div>
              <div style={{
                background: '#0A0908', border: '1px solid #26221C', borderRadius: '6px',
                padding: '16px', display: 'flex', alignItems: 'center', gap: '14px',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: '#1A1610', border: '1px solid #2A2420',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Users size={17} color="#8B8478" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', color: '#8B8478' }}>Any other signed-in sessions</div>
                  <div style={{ fontSize: '12px', color: '#3A3028', marginTop: '3px' }}>
                    {signOutOthersStatus === 'done' ? 'All other sessions have been signed out.' : 'Phones, tablets, or computers where you forgot to sign out.'}
                  </div>
                </div>
                {signOutOthersStatus !== 'done' ? (
                  <button
                    disabled={signOutOthersStatus === 'loading'}
                    onClick={async () => {
                      setSignOutOthersStatus('loading');
                      try { await onSignOutOthers(); setSignOutOthersStatus('done'); }
                      catch { setSignOutOthersStatus('error'); setTimeout(() => setSignOutOthersStatus(null), 3000); }
                    }}
                    style={{
                      background: 'transparent', border: '1px solid #3A2620',
                      color: signOutOthersStatus === 'loading' ? '#5C5648' : '#C56B5A',
                      borderRadius: '4px', padding: '8px 14px', fontSize: '13px',
                      cursor: signOutOthersStatus === 'loading' ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap', flexShrink: 0, fontWeight: 500,
                    }}>
                    {signOutOthersStatus === 'loading' ? 'Signing out…' : 'Sign out others'}
                  </button>
                ) : (
                  <span style={{ fontSize: '12px', color: '#7FA068', flexShrink: 0 }}>Done ✓</span>
                )}
                {signOutOthersStatus === 'error' && (
                  <span style={{ fontSize: '12px', color: '#C56B5A', flexShrink: 0 }}>Failed</span>
                )}
              </div>
            </div>
          )}

          <p className="text-xs" style={{ color: '#3A3028' }}>Sessions expire automatically after 7 days of inactivity.</p>
        </div>
      )}

      {/* ── Access sub-tab ── */}
      {sTab === 'access' && user && (
        <div className="space-y-5">
          <p className="text-sm" style={{ color: '#8B8478' }}>
            Generate invite codes to share with people you want to give access, or approve requests from people who applied.
          </p>
          <AccessControlPanel />
        </div>
      )}

      {/* ── Data & Sync sub-tab ── */}
      {sTab === 'setup' && (
        <div className="space-y-8">

          {/* ── Cloud Sync ─────────────────────────────────────── */}
          <div>
            <div style={{
              fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
              fontWeight: 700, color: '#3A3028', paddingBottom: '12px',
              borderBottom: '1px solid #1A1610', marginBottom: '16px',
            }}>Cloud Sync</div>
            <CloudSyncPanel user={user} data={data} setData={setData} syncStatus={syncStatus} isOnline={isOnline} lastSyncedAt={lastSyncedAt} onRetrySync={onRetrySync} />
          </div>

          {/* ── Backup ─────────────────────────────────────────── */}
          <div>
            <div style={{
              fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
              fontWeight: 700, color: '#3A3028', paddingBottom: '12px',
              borderBottom: '1px solid #1A1610', marginBottom: '16px',
            }}>Backup</div>
            <Backup data={data} setData={setData} />
          </div>

          {/* ── Setup ──────────────────────────────────────────── */}
          <div>
            <div style={{
              fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
              fontWeight: 700, color: '#3A3028', paddingBottom: '12px',
              borderBottom: '1px solid #1A1610', marginBottom: '16px',
            }}>Setup</div>
            <section className="card p-6">
              <h2 className="display text-2xl mb-1">Re-run setup wizard</h2>
              <p className="text-sm mb-4" style={{ color: '#8B8478' }}>
                Clears your current expense list and restarts the setup flow. Your buffer, snapshots, P&amp;L history, and rules are all preserved.
              </p>
              <button
                className="btn px-4 py-2 text-sm"
                style={{ color: '#D97757', border: '1px solid #3A2A1E', borderRadius: '3px' }}
                onClick={() => attemptOnboarding(() => setData(d => ({ ...d, setupComplete: false, expenses: [] })))}
              >
                Re-run setup wizard
              </button>
              {onboardingGate}
            </section>
          </div>
        </div>
      )}

      {/* ── Danger zone sub-tab ── */}
      {sTab === 'danger' && (
        <div className="space-y-4">
          {/* Warning banner */}
          <div style={{
            padding: '14px 16px', background: '#120A08', border: '1px solid #3A2018',
            borderRadius: '6px', display: 'flex', alignItems: 'flex-start', gap: '10px',
          }}>
            <AlertTriangle size={15} color="#C56B5A" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '13px', color: '#8B8478', lineHeight: 1.6 }}>
              Actions on this page are{' '}
              <strong style={{ color: '#C56B5A' }}>permanent and cannot be undone</strong>.
              {' '}Make sure you have exported a backup before proceeding.
            </div>
          </div>

          {/* Reset card */}
          <section className="card p-6" style={{ borderColor: '#3A2018', background: '#0E0805' }}>
            <h2 className="display text-2xl mb-1" style={{ color: '#C56B5A' }}>Reset all data</h2>
            <p className="text-sm mb-3" style={{ color: '#8B8478' }}>
              Wipes everything and returns the app to its initial state.
            </p>

            {/* What will be deleted */}
            <ul style={{
              margin: '0 0 20px 0', padding: '12px 14px', listStyle: 'none',
              background: '#0A0705', border: '1px solid #2A1510', borderRadius: '5px',
              fontSize: '12px', color: '#6B5E54', lineHeight: 1.8,
            }}>
              {[
                'All snapshots and P&L history',
                'Monthly impulse and expense records',
                'Envelope and budget settings',
                'Buffer and income configuration',
                'All custom rules and thresholds',
                'Override PIN and notification preferences',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#3A2018', fontSize: '10px' }}>▸</span>
                  {item}
                </li>
              ))}
            </ul>

            <button
              className="btn px-4 py-2 text-sm"
              style={{
                color: '#E8887A', border: '1px solid #5A2018',
                background: '#2A0E0A', borderRadius: '4px', fontWeight: 600,
              }}
              onClick={() => attemptReset(() => setData(defaultData))}
            >
              Reset all data
            </button>
            {resetGate}
          </section>
        </div>
      )}

      {/* ── App version ── */}
      <div style={{
        textAlign: 'center', fontSize: '11px', color: '#2A241E',
        paddingTop: '24px', letterSpacing: '0.05em',
      }}>
        Royal Ledger · v{APP_VERSION}
      </div>
    </div>
  );
}

function Rules({ data, stats, setData, user }) {
  const fmt = makeFmt(data.currency);
  const isFoundation = data?.mode === 'foundation';
  const { locked, requestUnlock, gate: fieldGate } = useSectionPin(data.overridePin);

  const updateRule = (stage, field, value) => {
    setData(d => ({
      ...d,
      stageRules: { ...d.stageRules, [stage]: { ...d.stageRules[stage], [field]: Number(value) || 0 } },
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-4xl mb-2" style={{ fontWeight: 300 }}>
          Your <span style={{ fontStyle: 'italic', color: '#D97757' }}>rules</span>
        </h1>
        <p style={{ color: '#8B8478', fontSize: '15px', maxWidth: '650px' }}>
          Every threshold and percentage in the system. Adjust them to match your situation.
        </p>
        {data.overridePin && (
          <div className="flex items-center gap-2 mt-3">
            {locked ? (
              <button onClick={requestUnlock} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#5B7FB8', background: 'transparent', border: '1px solid #1E2A3A', borderRadius: '3px', padding: '3px 9px', cursor: 'pointer', letterSpacing: '0.05em' }}>
                <Lock size={11} /> Locked · click to edit
              </button>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#7FA068', letterSpacing: '0.05em' }}>
                <Unlock size={11} /> Unlocked for 60s
              </span>
            )}
            {fieldGate}
          </div>
        )}
      </div>

      {/* Tax reserve — standard users only */}
      {!isFoundation && <section className="card p-6">
        <h2 className="display text-2xl mb-3">Tax reserve</h2>
        <p className="text-sm mb-4" style={{ color: '#8B8478' }}>Percentage of gross trading profit set aside for taxes before allocation. Talk to a tax advisor for your real rate.</p>
        <div className="grid md:grid-cols-3 gap-3 items-end">
          <div>
            <div className="label mb-2" style={{ color: '#5C5648' }}>Tax reserve %</div>
            <input type="number" className="input" value={data.taxReservePct}
              readOnly={locked} onClick={() => locked && requestUnlock()}
              onChange={locked ? undefined : (e) => setData(d => ({ ...d, taxReservePct: Number(e.target.value) || 0 }))}
              style={{ cursor: locked ? 'pointer' : undefined, opacity: locked ? 0.65 : 1 }} />
          </div>
        </div>
      </section>}

      {/* Stage rules — standard users only */}
      {!isFoundation && <section className="card p-7">
        <h2 className="display text-2xl mb-3">Profit allocation by stage</h2>
        <p className="text-sm mb-5" style={{ color: '#8B8478' }}>How net trading profit (after taxes) is split based on which stage you're in. Each row should add to 100%.</p>
        {[
          { key: 'stage1', label: 'Stage 1 (building floor)', desc: 'Below crisis floor — protect family first' },
          { key: 'stage15', label: 'Stage 1.5 (growing cushion)', desc: 'Floor reached — start long-term investing' },
          { key: 'stage2', label: 'Stage 2 (final push)', desc: 'Almost fortified — accelerate to target' },
          { key: 'stage3', label: 'Stage 3 (full waterfall)', desc: 'Buffer fully fortified — wealth-building mode' },
        ].map(s => {
          const rule = data.stageRules[s.key];
          const total = (rule.bufferPct || 0) + (rule.longTermPct || 0) + (rule.tradingPct || 0) + (rule.goalsPct ?? 0) + (rule.lifestylePct || 0);
          return (
            <div key={s.key} className="mb-6 pb-6 border-b last:border-0 last:mb-0 last:pb-0" style={{ borderColor: '#26221C' }}>
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="font-medium">{s.label}</h3>
                <span className="text-xs mono" style={{ color: total === 100 ? '#7FA068' : '#C56B5A' }}>{total}%</span>
              </div>
              <p className="text-xs mb-3" style={{ color: '#8B8478' }}>{s.desc}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <RuleInput label="Buffer %" value={rule.bufferPct} onChange={(v) => updateRule(s.key, 'bufferPct', v)} color="#D97757" locked={locked} onClickLocked={requestUnlock} />
                <RuleInput label="Long-term %" value={rule.longTermPct} onChange={(v) => updateRule(s.key, 'longTermPct', v)} color="#7FA068" locked={locked} onClickLocked={requestUnlock} />
                <RuleInput label="Trading %" value={rule.tradingPct} onChange={(v) => updateRule(s.key, 'tradingPct', v)} color="#5B7FB8" locked={locked} onClickLocked={requestUnlock} />
                <RuleInput label="Goals %" value={rule.goalsPct ?? 0} onChange={(v) => updateRule(s.key, 'goalsPct', v)} color="#A06B8C" locked={locked} onClickLocked={requestUnlock} />
                <RuleInput label="Lifestyle %" value={rule.lifestylePct} onChange={(v) => updateRule(s.key, 'lifestylePct', v)} color="#B89968" locked={locked} onClickLocked={requestUnlock} />
              </div>
              {(() => {
                const sum = (rule.bufferPct || 0) + (rule.longTermPct || 0) + (rule.tradingPct || 0) + (rule.goalsPct ?? 0) + (rule.lifestylePct || 0);
                return sum !== 100 ? (
                  <div style={{ fontSize: '11px', color: '#C56B5A', marginTop: '6px' }}>
                    ⚠ Percentages sum to {sum}% — should be 100%
                  </div>
                ) : null;
              })()}
            </div>
          );
        })}
      </section>}

      {/* Spending Gate */}
      <section className="card p-6">
        <h2 className="display text-2xl mb-3">Spending Gate threshold</h2>
        <p className="text-sm mb-4" style={{ color: '#8B8478' }}>Purchases at or above this amount trigger the full sleep-on-it gate.</p>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <div className="label mb-2" style={{ color: '#5C5648' }}>Threshold ({getCurrency(data.currency).symbol})</div>
            <input type="number" className="input" value={data.spendingGateThreshold}
              readOnly={locked} onClick={() => locked && requestUnlock()}
              onChange={locked ? undefined : (e) => setData(d => ({ ...d, spendingGateThreshold: Number(e.target.value) || 0 }))}
              style={{ cursor: locked ? 'pointer' : undefined, opacity: locked ? 0.65 : 1 }} />
          </div>
        </div>
      </section>

      {/* Future Goals */}
      <section className="card p-7">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="display text-2xl">Future goals</h2>
          <span className="label" style={{ color: '#5C5648' }}>Optional</span>
        </div>
        <p className="text-sm mb-5" style={{ color: '#8B8478' }}>
          Specific things you're saving toward — business, vehicle, equipment, property deposit, training. Each goal is a name and a target amount.
        </p>
        <div className="space-y-3 mb-4">
          {(data.goals || []).map(goal => {
            // Progress shows the shared goals pool vs each target — not per-goal tracking
            const progress = data.futureGoals && goal.target
              ? Math.min(100, (data.futureGoals / goal.target) * 100)
              : 0;
            return (
              <div key={goal.id} className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="text"
                    value={goal.name}
                    onChange={(e) => setData(d => ({ ...d, goals: d.goals.map(g => g.id === goal.id ? { ...g, name: e.target.value } : g) }))}
                    className="input flex-1"
                    placeholder="Goal name"
                    style={{ minWidth: 0 }}
                  />
                  <input
                    type="number"
                    value={goal.target}
                    onChange={(e) => setData(d => ({ ...d, goals: d.goals.map(g => g.id === goal.id ? { ...g, target: Number(e.target.value) || 0 } : g) }))}
                    className="input"
                    style={{ width: '130px' }}
                    placeholder="Target"
                  />
                  <button
                    onClick={() => setData(d => ({ ...d, goals: d.goals.filter(g => g.id !== goal.id) }))}
                    style={{ background: 'transparent', border: 'none', color: '#5C5648', cursor: 'pointer', padding: '4px' }}
                  >
                    <X size={14} />
                  </button>
                </div>
                {goal.target > 0 && (
                  <div>
                    <div style={{ height: '4px', background: '#1A1610', borderRadius: '2px', marginBottom: '4px' }}>
                      <div style={{ height: '4px', background: '#A06B8C', borderRadius: '2px', width: `${progress}%`, transition: 'width 300ms' }} />
                    </div>
                    <div className="flex justify-between text-xs" style={{ color: '#5C5648' }}>
                      <span>{progress.toFixed(0)}% of target <span style={{ color: '#3A3028' }}>(shared pool)</span></span>
                      <span className="mono">{fmt(data.futureGoals || 0)} / {fmt(goal.target)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button
          onClick={() => setData(d => ({ ...d, goals: [...(d.goals || []), { id: Date.now(), name: 'New goal', target: 0, createdAt: Date.now() }] }))}
          style={{ background: 'transparent', border: '1px dashed #3A2A1E', color: '#8B8478', borderRadius: '4px', fontSize: '13px', padding: '10px', width: '100%', cursor: 'pointer' }}
        >
          + Add goal
        </button>
        <p className="text-xs mt-3" style={{ color: '#3A3028' }}>
          The Future Goals balance on Command tab is your total saved. Goals here track individual targets against that total.
        </p>
      </section>

    </div>
  );
}

function Backup({ data, setData }) {
  const fmt = makeFmt(data.currency);
  const [importStatus, setImportStatus] = useState(null);
  const [copyStatus, setCopyStatus] = useState(null);
  const [importPending, setImportPending] = useState(null); // { incomingData, summary } awaiting confirm
  const fileInputRef = React.useRef(null);

	const exportData = () => {
	  const exportPayload = {
		version: 'open-trader-finance-v2',
		exportedAt: new Date().toISOString(),
		data: data,
	  };
	  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
	  const url = URL.createObjectURL(blob);
	  const a = document.createElement('a');
	  const dateStr = new Date().toISOString().slice(0, 10);
	  a.href = url;
	  a.download = `ledger-backup-${dateStr}.json`;
	  document.body.appendChild(a);
	  a.click();
	  document.body.removeChild(a);
	  URL.revokeObjectURL(url);
	  // Mark backup as done
	  setData(d => ({ ...d, lastBackupDate: new Date().toISOString() }));
	};

  const copyToClipboard = async () => {
    try {
      const exportPayload = {
        version: 'open-trader-finance-v2',
        exportedAt: new Date().toISOString(),
        data: data,
      };
      await navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
      setCopyStatus('success');
      setTimeout(() => setCopyStatus(null), 2500);
    } catch (e) {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus(null), 2500);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        // Support both wrapped exports and raw data
        const incomingData = parsed.data || parsed;

        if (!incomingData || typeof incomingData !== 'object') {
          throw new Error('Invalid file format');
        }

        setImportPending({
          incomingData,
          summary: {
            expenses: incomingData.expenses?.length || 0,
            snapshots: incomingData.snapshots?.length || 0,
            pnl: incomingData.tradingPnLHistory?.length || 0,
            impulses: incomingData.impulses?.length || 0,
          },
        });
      } catch (err) {
        setImportStatus('error');
        setTimeout(() => setImportStatus(null), 3500);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset so same file can be imported twice
  };

  const importFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        setImportStatus('error');
        setTimeout(() => setImportStatus(null), 3500);
        return;
      }
      const parsed = JSON.parse(text);
      const incomingData = parsed.data || parsed;

      if (!incomingData || typeof incomingData !== 'object') {
        throw new Error('Invalid clipboard content');
      }

      setImportPending({
        incomingData,
        summary: {
          expenses: incomingData.expenses?.length || 0,
          snapshots: incomingData.snapshots?.length || 0,
          pnl: incomingData.tradingPnLHistory?.length || 0,
          impulses: incomingData.impulses?.length || 0,
        },
      });
    } catch (e) {
      setImportStatus('error');
      setTimeout(() => setImportStatus(null), 3500);
    }
  };

  const confirmImport = () => {
    if (!importPending) return;
    setData({ ...defaultData, ...importPending.incomingData });
    setImportPending(null);
    setImportStatus('success');
    setTimeout(() => setImportStatus(null), 3500);
  };

  const cancelImport = () => {
    setImportPending(null);
  };

  // Calculate data summary
  const summary = {
    snapshots: data.snapshots?.length || 0,
    expenses: data.expenses?.length || 0,
    pnl: data.tradingPnLHistory?.length || 0,
    impulses: data.impulses?.length || 0,
    allocations: data.profitAllocations?.length || 0,
  };

  return (
    <section className="card-warm p-6">
      <div className="flex items-center gap-2 mb-2">
        <Save size={16} style={{ color: '#D97757' }} />
        <h2 className="display text-2xl">Backup & restore</h2>
      </div>
      <p className="text-sm mb-5" style={{ color: '#8B8478', lineHeight: 1.6 }}>
        Your data lives only in this browser. Export regularly so you don't lose your records if you switch devices, clear cookies, or your browser misbehaves.
        Recommended: export monthly, especially after taking a snapshot.
      </p>

      {/* Current data summary */}
      <div className="card p-4 mb-5">
        <div className="label mb-3" style={{ color: '#5C5648' }}>Currently stored</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          <div>
            <div className="mono text-lg">{summary.expenses}</div>
            <div className="text-xs" style={{ color: '#8B8478' }}>expenses</div>
          </div>
          <div>
            <div className="mono text-lg">{summary.snapshots}</div>
            <div className="text-xs" style={{ color: '#8B8478' }}>snapshots</div>
          </div>
          <div>
            <div className="mono text-lg">{summary.pnl}</div>
            <div className="text-xs" style={{ color: '#8B8478' }}>P&L months</div>
          </div>
          <div>
            <div className="mono text-lg">{summary.impulses}</div>
            <div className="text-xs" style={{ color: '#8B8478' }}>impulses</div>
          </div>
          <div>
            <div className="mono text-lg">{summary.allocations}</div>
            <div className="text-xs" style={{ color: '#8B8478' }}>allocations</div>
          </div>
        </div>
      </div>

      {/* Export buttons */}
      <div className="mb-5">
        <h3 className="font-medium text-sm mb-3">Export</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportData} className="btn btn-primary flex items-center gap-2">
            <Save size={14} /> Download as file
          </button>
          <button onClick={copyToClipboard} className="btn btn-secondary flex items-center gap-2">
            {copyStatus === 'success' ? <><Check size={14} /> Copied!</> : <>Copy to clipboard</>}
          </button>
        </div>
        {copyStatus === 'error' && (
          <p className="text-xs mt-2" style={{ color: '#C56B5A' }}>Couldn't copy. Use Download instead.</p>
        )}
      </div>

      {/* Import buttons */}
      <div className="pt-5 border-t" style={{ borderColor: '#3A2A1E' }}>
        <h3 className="font-medium text-sm mb-3">Restore from backup</h3>
        <p className="text-xs mb-3" style={{ color: '#8B8478' }}>
          Imports a previously exported file. <strong style={{ color: '#C56B5A' }}>Warning:</strong> This replaces all current data.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileImport}
            style={{ display: 'none' }}
          />
          <button onClick={handleImportClick} className="btn btn-secondary flex items-center gap-2" disabled={!!importPending}>
            Choose file…
          </button>
          <button onClick={importFromClipboard} className="btn btn-secondary flex items-center gap-2" disabled={!!importPending}>
            Paste from clipboard
          </button>
        </div>

        {/* Inline confirmation — replaces browser confirm() */}
        {importPending && (
          <div className="mt-4 p-4 rounded" style={{ background: '#140F0A', border: '1px solid #C56B5A40' }}>
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle size={15} style={{ color: '#C56B5A', flexShrink: 0, marginTop: '1px' }} />
              <div>
                <div className="text-sm font-medium mb-1" style={{ color: '#E8E2D5' }}>Replace all current data?</div>
                <div className="text-xs" style={{ color: '#8B8478', lineHeight: 1.6 }}>
                  This backup contains{' '}
                  <strong style={{ color: '#E8E2D5' }}>{importPending.summary.expenses}</strong> expenses,{' '}
                  <strong style={{ color: '#E8E2D5' }}>{importPending.summary.snapshots}</strong> snapshots,{' '}
                  <strong style={{ color: '#E8E2D5' }}>{importPending.summary.pnl}</strong> P&L records,{' '}
                  <strong style={{ color: '#E8E2D5' }}>{importPending.summary.impulses}</strong> impulses.
                  <br />Your current data will be permanently replaced.
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={confirmImport} className="btn btn-primary text-xs px-4 py-2" style={{ background: '#C56B5A', borderColor: '#C56B5A' }}>
                Yes, replace data
              </button>
              <button onClick={cancelImport} className="btn btn-secondary text-xs px-4 py-2">
                Cancel
              </button>
            </div>
          </div>
        )}

        {importStatus === 'success' && (
          <p className="text-sm mt-3 flex items-center gap-2" style={{ color: '#7FA068' }}>
            <Check size={14} /> Imported successfully.
          </p>
        )}
        {importStatus === 'error' && (
          <p className="text-sm mt-3 flex items-center gap-2" style={{ color: '#C56B5A' }}>
            <AlertTriangle size={14} /> Import failed. Check the file format.
          </p>
        )}
      </div>
    </section>
  );
}

function RuleInput({ label, value, onChange, color, locked, onClickLocked }) {
  return (
    <div>
      <div className="label mb-2" style={{ color: '#5C5648' }}>{label}</div>
      <input
        type="number" className="input"
        style={{ borderColor: color + '40', cursor: locked ? 'pointer' : undefined, opacity: locked ? 0.65 : 1 }}
        value={value}
        onChange={locked ? undefined : (e) => onChange(e.target.value)}
        readOnly={!!locked}
        onClick={locked ? onClickLocked : undefined}
      />
    </div>
  );
}

export default OpenFinanceApp;
