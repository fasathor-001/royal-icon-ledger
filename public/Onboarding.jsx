// src/components/Onboarding.jsx
//
// 6-step welcome flow shown on first launch.
// Sets up expenses, spending budget, buffer target, income type.

import React, { useState } from 'react';
import {
  Heart, ArrowRight, Check, X, Plus, Wallet, Shield,
  Briefcase, Sparkles, Users
} from 'lucide-react';

const CURRENCY_SYMBOL = 'R';

const fmt = (n) => {
  if (n === null || n === undefined || isNaN(n)) return CURRENCY_SYMBOL + '0';
  const sign = n < 0 ? '−' : '';
  const abs = Math.abs(n);
  if (abs >= 1000000) return sign + CURRENCY_SYMBOL + (abs / 1000000).toFixed(2) + 'M';
  if (abs >= 10000) return sign + CURRENCY_SYMBOL + Math.round(abs).toLocaleString();
  return sign + CURRENCY_SYMBOL + abs.toLocaleString(undefined, { maximumFractionDigits: 0 });
};

const SUGGESTED_EXPENSES = [
  { name: 'Rent / Bond',         category: 'Housing',         placeholder: '8000' },
  { name: 'Utilities',           category: 'Utilities',       placeholder: '1500' },
  { name: 'Groceries',           category: 'Food',            placeholder: '4000' },
  { name: 'Transport / Fuel',    category: 'Transportation',  placeholder: '2000' },
  { name: 'Phone / Internet',    category: 'Subscriptions',   placeholder: '800' },
  { name: 'Insurance',           category: 'Insurance',       placeholder: '1500' },
  { name: 'School / Childcare',  category: 'Childcare/Kids',  placeholder: '3000' },
  { name: 'Family support',      category: 'Family support',  placeholder: '5000' },
];

export default function Onboarding({ data, setData, onComplete }) {
  const [step, setStep] = useState(1);
  const [incomeType, setIncomeType] = useState(null);
  const [expenseValues, setExpenseValues] = useState({});
  const [customExpenses, setCustomExpenses] = useState([]);
  const [spendingBudget, setSpendingBudget] = useState('');
  const [bufferReserve, setBufferReserve] = useState('');
  const [bufferMonths, setBufferMonths] = useState(null);
  const [dependentSituation, setDependentSituation] = useState(null);

  // Computed totals
  const expenseTotal = Object.values(expenseValues).reduce((s, v) => s + (Number(v) || 0), 0)
    + customExpenses.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const salary = expenseTotal + (Number(spendingBudget) || 0) + (Number(bufferReserve) || 0);
  const bufferTarget = salary * (bufferMonths || 18);

  const totalSteps = 6;

  const next = () => setStep(s => Math.min(s + 1, totalSteps));
  const back = () => setStep(s => Math.max(s - 1, 1));

  const finish = () => {
    // Convert expense values to expense records
    const expenses = [];
    SUGGESTED_EXPENSES.forEach(s => {
      const v = Number(expenseValues[s.name]) || 0;
      if (v > 0) {
        expenses.push({
          id: Date.now() + Math.random(),
          name: s.name,
          amount: v,
          category: s.category,
        });
      }
    });
    customExpenses.forEach(c => {
      if (c.amount > 0 && c.name) {
        expenses.push({
          id: Date.now() + Math.random(),
          name: c.name,
          amount: Number(c.amount),
          category: c.category || 'Other',
        });
      }
    });

    setData(d => ({
      ...d,
      expenses,
      spendingBudget: Number(spendingBudget) || 0,
      bufferReserve: Number(bufferReserve) || 0,
      bufferTargetMonths: bufferMonths || 18,
      bufferProtectMonths: Math.max(1, (bufferMonths || 18) - 2),
      setupComplete: true,
    }));
    onComplete();
  };

  const skip = () => {
    setData(d => ({ ...d, setupComplete: true }));
    onComplete();
  };

  // Validation per step
  const canAdvance = () => {
    if (step === 1) return true;
    if (step === 2) return incomeType !== null;
    if (step === 3) return expenseTotal > 0;
    if (step === 4) return Number(spendingBudget) > 0;
    if (step === 5) return bufferMonths !== null;
    if (step === 6) return true;
    return true;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0A0908',
        zIndex: 1000,
        overflow: 'auto',
        color: '#E8E2D5',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .ob-display { font-family: 'Fraunces', Georgia, serif; font-weight: 400; }
        .ob-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }
        .ob-label { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 600; }
        .ob-input { background: #0A0908; border: 1px solid #26221C; padding: 11px 13px; font-family: 'JetBrains Mono', monospace; outline: none; color: #E8E2D5; border-radius: 3px; width: 100%; font-size: 14px; }
        .ob-input:focus { border-color: #D97757; }
        .ob-input-text { background: #0A0908; border: 1px solid #26221C; padding: 11px 13px; outline: none; color: #E8E2D5; border-radius: 3px; width: 100%; font-size: 14px; }
        .ob-input-text:focus { border-color: #D97757; }
        .ob-card { background: #14110E; border: 1px solid #26221C; border-radius: 4px; padding: 24px; transition: all 200ms; cursor: pointer; }
        .ob-card:hover { border-color: #3A2A1E; }
        .ob-card-selected { background: #1A1410; border-color: #D97757; box-shadow: 0 0 0 1px #D9775740; }
        .ob-btn-primary { background: #D97757; color: #0A0908; padding: 14px 24px; font-weight: 600; border-radius: 4px; font-size: 14px; cursor: pointer; transition: all 150ms; border: none; display: flex; align-items: center; gap: 8px; }
        .ob-btn-primary:hover:not(:disabled) { background: #E08868; }
        .ob-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .ob-btn-ghost { background: transparent; color: #8B8478; padding: 14px 24px; font-size: 14px; cursor: pointer; border: none; }
        .ob-btn-ghost:hover { color: #E8E2D5; }
        .ob-progress-dot { width: 8px; height: 8px; border-radius: 50%; transition: all 200ms; }
      `}</style>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '48px' }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="ob-progress-dot"
              style={{
                background: i + 1 <= step ? '#D97757' : '#26221C',
              }}
            />
          ))}
        </div>

        {/* STEP 1: WELCOME */}
        {step === 1 && (
          <div>
            <Heart size={32} style={{ color: '#D97757', marginBottom: '24px' }} />
            <h1 className="ob-display" style={{ fontSize: '48px', lineHeight: 1.1, marginBottom: '24px', fontWeight: 300 }}>
              Welcome to <span style={{ fontStyle: 'italic', color: '#D97757' }}>The Open Ledger</span>.
            </h1>
            <p style={{ fontSize: '17px', lineHeight: 1.7, color: '#E8E2D5', marginBottom: '20px' }}>
              This is a personal finance system built around three ideas:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <Wallet size={20} style={{ color: '#D97757', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>Pay yourself a salary</div>
                  <div style={{ color: '#8B8478', fontSize: '14px', lineHeight: 1.6 }}>
                    Whether your income is variable or fixed, you live on a steady predictable amount each month.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <Shield size={20} style={{ color: '#D97757', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>Build a buffer</div>
                  <div style={{ color: '#8B8478', fontSize: '14px', lineHeight: 1.6 }}>
                    A months-of-salary cushion that absorbs life's volatility — bad months, surprises, opportunities.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <Sparkles size={20} style={{ color: '#D97757', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>Protect what matters</div>
                  <div style={{ color: '#8B8478', fontSize: '14px', lineHeight: 1.6 }}>
                    Spending guards, impulse tracking, and clear stages turn willpower into automation.
                  </div>
                </div>
              </div>
            </div>
            <p style={{ color: '#8B8478', fontSize: '13px', marginBottom: '40px' }}>
              The next 5 minutes will set up your real numbers. You can change anything later.
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button onClick={next} className="ob-btn-primary">
                Begin <ArrowRight size={16} />
              </button>
              <button onClick={skip} className="ob-btn-ghost">Skip setup</button>
            </div>
          </div>
        )}

        {/* STEP 2: INCOME TYPE */}
        {step === 2 && (
          <div>
            <div className="ob-label" style={{ color: '#D97757', marginBottom: '12px' }}>Step 2 of 6</div>
            <h1 className="ob-display" style={{ fontSize: '36px', lineHeight: 1.2, marginBottom: '12px', fontWeight: 300 }}>
              How does <span style={{ fontStyle: 'italic', color: '#D97757' }}>income</span> reach you?
            </h1>
            <p style={{ color: '#8B8478', marginBottom: '32px', fontSize: '15px' }}>
              This adjusts the system's defaults. Variable income needs a bigger buffer; fixed income needs less.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
              {[
                { id: 'variable', icon: Briefcase, title: 'Variable', desc: 'Trading, freelance, commissions, business ownership. Some months great, some months tough.', defaultMonths: 18 },
                { id: 'fixed', icon: Wallet, title: 'Fixed', desc: 'Salary, pension, regular employment. Same amount every month.', defaultMonths: 6 },
                { id: 'mixed', icon: Users, title: 'Mixed', desc: 'Salary plus side hustle, or one partner stable + one variable.', defaultMonths: 9 },
              ].map(opt => {
                const Icon = opt.icon;
                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      setIncomeType(opt.id);
                      if (bufferMonths === null) setBufferMonths(opt.defaultMonths);
                    }}
                    className={`ob-card ${incomeType === opt.id ? 'ob-card-selected' : ''}`}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <Icon size={20} style={{ color: incomeType === opt.id ? '#D97757' : '#8B8478', marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 500, marginBottom: '4px', fontSize: '16px' }}>{opt.title}</div>
                        <div style={{ color: '#8B8478', fontSize: '14px', lineHeight: 1.5 }}>{opt.desc}</div>
                      </div>
                      {incomeType === opt.id && <Check size={18} style={{ color: '#D97757', marginLeft: 'auto' }} />}
                    </div>
                  </div>
                );
              })}
            </div>

            <NavRow back={back} next={next} canAdvance={canAdvance()} />
          </div>
        )}

        {/* STEP 3: EXPENSES */}
        {step === 3 && (
          <div>
            <div className="ob-label" style={{ color: '#D97757', marginBottom: '12px' }}>Step 3 of 6</div>
            <h1 className="ob-display" style={{ fontSize: '36px', lineHeight: 1.2, marginBottom: '12px', fontWeight: 300 }}>
              Your <span style={{ fontStyle: 'italic', color: '#D97757' }}>real</span> monthly expenses
            </h1>
            <p style={{ color: '#8B8478', marginBottom: '24px', fontSize: '15px' }}>
              Add what you actually spend each month. Skip any that don't apply. You can edit and add more later.
            </p>

            <div style={{ background: '#1A1410', border: '1px solid #3A2A1E', borderRadius: '4px', padding: '16px', marginBottom: '24px' }}>
              <div className="ob-label" style={{ color: '#D97757', marginBottom: '8px' }}>Running total</div>
              <div className="ob-display" style={{ fontSize: '32px', fontWeight: 300 }}>{fmt(expenseTotal)}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              {SUGGESTED_EXPENSES.map(item => (
                <div key={item.name} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: '#5C5648' }}>{item.category}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ob-mono" style={{ color: '#5C5648' }}>{CURRENCY_SYMBOL}</span>
                    <input
                      type="number"
                      placeholder={item.placeholder}
                      value={expenseValues[item.name] || ''}
                      onChange={(e) => setExpenseValues(v => ({ ...v, [item.name]: e.target.value }))}
                      className="ob-input"
                      style={{ width: '120px', textAlign: 'right' }}
                    />
                  </div>
                </div>
              ))}

              {customExpenses.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Expense name"
                    value={c.name}
                    onChange={(e) => {
                      const updated = [...customExpenses];
                      updated[i].name = e.target.value;
                      setCustomExpenses(updated);
                    }}
                    className="ob-input-text"
                    style={{ flex: 1 }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ob-mono" style={{ color: '#5C5648' }}>{CURRENCY_SYMBOL}</span>
                    <input
                      type="number"
                      value={c.amount}
                      onChange={(e) => {
                        const updated = [...customExpenses];
                        updated[i].amount = e.target.value;
                        setCustomExpenses(updated);
                      }}
                      className="ob-input"
                      style={{ width: '120px', textAlign: 'right' }}
                    />
                  </div>
                  <button
                    onClick={() => setCustomExpenses(customExpenses.filter((_, j) => j !== i))}
                    style={{ background: 'transparent', border: 'none', color: '#5C5648', cursor: 'pointer', padding: '4px' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              <button
                onClick={() => setCustomExpenses([...customExpenses, { name: '', amount: '', category: 'Other' }])}
                style={{ background: 'transparent', border: '1px dashed #3A2A1E', color: '#8B8478', padding: '10px', borderRadius: '3px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px' }}
              >
                <Plus size={14} /> Add another expense
              </button>
            </div>

            <NavRow back={back} next={next} canAdvance={canAdvance()} hint={!canAdvance() ? "Add at least one expense to continue" : null} />
          </div>
        )}

        {/* STEP 4: SPENDING + BUFFER RESERVE */}
        {step === 4 && (
          <div>
            <div className="ob-label" style={{ color: '#D97757', marginBottom: '12px' }}>Step 4 of 6</div>
            <h1 className="ob-display" style={{ fontSize: '36px', lineHeight: 1.2, marginBottom: '12px', fontWeight: 300 }}>
              <span style={{ fontStyle: 'italic', color: '#D97757' }}>Spending</span> & buffer reserve
            </h1>
            <p style={{ color: '#8B8478', marginBottom: '32px', fontSize: '15px' }}>
              Two more numbers to complete your monthly salary. These are what you take out of trading profits each month, on top of your expenses.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
              <div>
                <div className="ob-label" style={{ color: '#5C5648', marginBottom: '8px' }}>Monthly spending money</div>
                <p style={{ fontSize: '13px', color: '#8B8478', marginBottom: '12px' }}>
                  Eating out, fun, hobbies, anything discretionary. The empty-account-rule lives here — when this hits zero, spending stops for the month.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="ob-mono" style={{ fontSize: '18px', color: '#5C5648' }}>{CURRENCY_SYMBOL}</span>
                  <input
                    type="number"
                    placeholder="2000"
                    value={spendingBudget}
                    onChange={(e) => setSpendingBudget(e.target.value)}
                    className="ob-input"
                    style={{ fontSize: '18px' }}
                  />
                </div>
              </div>

              <div>
                <div className="ob-label" style={{ color: '#5C5648', marginBottom: '8px' }}>Buffer reserve from salary</div>
                <p style={{ fontSize: '13px', color: '#8B8478', marginBottom: '12px' }}>
                  Each month, this amount goes from your salary into the buffer (in addition to trading profits). Even {CURRENCY_SYMBOL}500/month adds up.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="ob-mono" style={{ fontSize: '18px', color: '#5C5648' }}>{CURRENCY_SYMBOL}</span>
                  <input
                    type="number"
                    placeholder="1000"
                    value={bufferReserve}
                    onChange={(e) => setBufferReserve(e.target.value)}
                    className="ob-input"
                    style={{ fontSize: '18px' }}
                  />
                </div>
              </div>
            </div>

            {salary > 0 && (
              <div style={{ background: '#1A1410', border: '1px solid #3A2A1E', borderRadius: '4px', padding: '20px', marginBottom: '32px' }}>
                <div className="ob-label" style={{ color: '#D97757', marginBottom: '8px' }}>Your monthly salary</div>
                <div className="ob-display" style={{ fontSize: '36px', fontWeight: 300, color: '#D97757' }}>{fmt(salary)}</div>
                <div style={{ fontSize: '13px', color: '#8B8478', marginTop: '8px' }}>
                  {fmt(expenseTotal)} expenses + {fmt(Number(spendingBudget) || 0)} spending + {fmt(Number(bufferReserve) || 0)} buffer reserve
                </div>
              </div>
            )}

            <NavRow back={back} next={next} canAdvance={canAdvance()} hint={!canAdvance() ? "Set a spending budget to continue" : null} />
          </div>
        )}

        {/* STEP 5: BUFFER TARGET */}
        {step === 5 && (
          <div>
            <div className="ob-label" style={{ color: '#D97757', marginBottom: '12px' }}>Step 5 of 6</div>
            <h1 className="ob-display" style={{ fontSize: '36px', lineHeight: 1.2, marginBottom: '12px', fontWeight: 300 }}>
              How big should your <span style={{ fontStyle: 'italic', color: '#D97757' }}>buffer</span> be?
            </h1>
            <p style={{ color: '#8B8478', marginBottom: '32px', fontSize: '15px' }}>
              The buffer is months of full salary, stored in cash. More buffer means more peace of mind, less trading desperation. Bigger buffer = more protection for the people who depend on you.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {[
                { months: 6,  label: '6 months',  amount: salary * 6,  desc: 'Standard emergency fund. Survives one bad quarter.', recommended: incomeType === 'fixed' },
                { months: 12, label: '12 months', amount: salary * 12, desc: 'A whole year of runway. Comfortable for most situations.', recommended: incomeType === 'mixed' },
                { months: 18, label: '18 months', amount: salary * 18, desc: 'Sole earner with dependents. Variable income. The fortified position.', recommended: incomeType === 'variable' },
              ].map(opt => (
                <div
                  key={opt.months}
                  onClick={() => setBufferMonths(opt.months)}
                  className={`ob-card ${bufferMonths === opt.months ? 'ob-card-selected' : ''}`}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <Shield size={20} style={{ color: bufferMonths === opt.months ? '#D97757' : '#8B8478', marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '4px' }}>
                        <div style={{ fontWeight: 500, fontSize: '16px' }}>{opt.label}</div>
                        <div className="ob-mono" style={{ fontSize: '13px', color: '#8B8478' }}>{fmt(opt.amount)}</div>
                        {opt.recommended && <span style={{ background: '#1A2A14', color: '#7FA068', padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em' }}>RECOMMENDED</span>}
                      </div>
                      <div style={{ color: '#8B8478', fontSize: '14px', lineHeight: 1.5 }}>{opt.desc}</div>
                    </div>
                    {bufferMonths === opt.months && <Check size={18} style={{ color: '#D97757' }} />}
                  </div>
                </div>
              ))}
            </div>

            <NavRow back={back} next={next} canAdvance={canAdvance()} hint={!canAdvance() ? "Choose a buffer size to continue" : null} />
          </div>
        )}

        {/* STEP 6: SUMMARY */}
        {step === 6 && (
          <div>
            <div className="ob-label" style={{ color: '#D97757', marginBottom: '12px' }}>Step 6 of 6</div>
            <Check size={32} style={{ color: '#7FA068', marginBottom: '16px' }} />
            <h1 className="ob-display" style={{ fontSize: '36px', lineHeight: 1.2, marginBottom: '12px', fontWeight: 300 }}>
              Your system is <span style={{ fontStyle: 'italic', color: '#7FA068' }}>set up</span>.
            </h1>
            <p style={{ color: '#8B8478', marginBottom: '32px', fontSize: '15px' }}>
              Here's what we've configured. You can change any of these later in Setup or Rules.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '32px' }}>
              <div style={{ background: '#14110E', border: '1px solid #26221C', borderRadius: '4px', padding: '20px' }}>
                <div className="ob-label" style={{ color: '#5C5648', marginBottom: '8px' }}>Monthly Salary</div>
                <div className="ob-display" style={{ fontSize: '24px', fontWeight: 300, color: '#D97757' }}>{fmt(salary)}</div>
              </div>
              <div style={{ background: '#14110E', border: '1px solid #26221C', borderRadius: '4px', padding: '20px' }}>
                <div className="ob-label" style={{ color: '#5C5648', marginBottom: '8px' }}>Buffer Target</div>
                <div className="ob-display" style={{ fontSize: '24px', fontWeight: 300, color: '#7FA068' }}>{fmt(bufferTarget)}</div>
              </div>
              <div style={{ background: '#14110E', border: '1px solid #26221C', borderRadius: '4px', padding: '20px' }}>
                <div className="ob-label" style={{ color: '#5C5648', marginBottom: '8px' }}>Total Expenses</div>
                <div className="ob-display" style={{ fontSize: '24px', fontWeight: 300 }}>{fmt(expenseTotal)}</div>
              </div>
              <div style={{ background: '#14110E', border: '1px solid #26221C', borderRadius: '4px', padding: '20px' }}>
                <div className="ob-label" style={{ color: '#5C5648', marginBottom: '8px' }}>Income Type</div>
                <div className="ob-display" style={{ fontSize: '24px', fontWeight: 300, textTransform: 'capitalize' }}>{incomeType || 'Not set'}</div>
              </div>
            </div>

            <div style={{ background: '#1A1410', border: '1px solid #3A2A1E', borderRadius: '4px', padding: '20px', marginBottom: '32px' }}>
              <div style={{ fontWeight: 500, marginBottom: '8px' }}>What happens next:</div>
              <ol style={{ color: '#8B8478', fontSize: '14px', lineHeight: 1.7, paddingLeft: '20px', margin: 0 }}>
                <li>Open a separate HYSA at a different bank for your buffer</li>
                <li>Set up auto-transfers on payday into bills, spending, and buffer</li>
                <li>Use the Spending Gate before any purchase over {CURRENCY_SYMBOL}50</li>
                <li>Take a Snapshot today — that's your starting line</li>
              </ol>
            </div>

            <button onClick={finish} className="ob-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Open the dashboard <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NavRow({ back, next, canAdvance, hint }) {
  return (
    <div>
      {hint && <p style={{ color: '#5C5648', fontSize: '12px', marginBottom: '12px' }}>{hint}</p>}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button onClick={back} className="ob-btn-ghost">← Back</button>
        <button onClick={next} disabled={!canAdvance} className="ob-btn-primary">
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
