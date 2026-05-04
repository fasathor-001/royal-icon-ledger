# Onboarding Wizard — Integration Guide

You're adding a 6-step welcome flow that shows on first launch.

## Step 1: Place the file

Download `Onboarding.jsx` and place it at:

```
src/components/Onboarding.jsx
```

If the `src/components/` folder doesn't exist yet, create it.

## Step 2: Three small edits to App.jsx

### Edit A: Add the import at the top of App.jsx

Find the existing imports near the top of `App.jsx`. They look something like:

```javascript
import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet, Shield, ...
} from 'lucide-react';
import { ... } from 'recharts';
```

Add this line right after them:

```javascript
import Onboarding from './components/Onboarding';
```

### Edit B: Add the onboarding state to the main app

Find the main `OpenFinanceApp()` function. Near the top, you'll see:

```javascript
function OpenFinanceApp() {
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('command');
```

Add a new state line right after `const [tab, setTab] = useState('command');`:

```javascript
  const [showOnboarding, setShowOnboarding] = useState(false);
```

### Edit C: Decide when to show onboarding

Find the second `useEffect` in the main app (the one that saves data). It looks like:

```javascript
  useEffect(() => {
    if (loading) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }, [data, loading]);
```

Right after that useEffect, add a new one:

```javascript
  // Show onboarding on first load if setup is not complete
  useEffect(() => {
    if (loading) return;
    if (!data.setupComplete && data.expenses.length === 0) {
      setShowOnboarding(true);
    }
  }, [loading, data.setupComplete, data.expenses.length]);
```

### Edit D: Render the onboarding overlay

Find the main return of `OpenFinanceApp()`. It starts with:

```javascript
  return (
    <div className="min-h-screen" style={{ background: '#0A0908', color: '#E8E2D5', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
```

**Right before that `return (` line**, add:

```javascript
  if (showOnboarding) {
    return <Onboarding data={data} setData={setData} onComplete={() => setShowOnboarding(false)} />;
  }
```

So the full structure becomes:

```javascript
  if (showOnboarding) {
    return <Onboarding data={data} setData={setData} onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen" style={{ background: '#0A0908', ...
```

## Step 3: Add a "Re-run setup" button in Rules tab

Find the `Rules` function (search for `function Rules({ data, stats, setData })`).

Find this section near the bottom:

```javascript
      {/* Reset */}
      <section className="card p-6">
        <h3 className="font-medium mb-2">Reset everything</h3>
```

Right BEFORE that "Reset everything" section, add:

```javascript
      {/* Re-run onboarding */}
      <section className="card p-6">
        <h3 className="font-medium mb-2">Re-run setup wizard</h3>
        <p className="text-sm mb-4" style={{ color: '#8B8478' }}>
          Walk through the welcome flow again. Won't delete any existing data.
        </p>
        <button
          className="btn px-4 py-2 text-sm"
          style={{ color: '#D97757', border: '1px solid #3A2A1E', borderRadius: '3px' }}
          onClick={() => setData(d => ({ ...d, setupComplete: false, expenses: [] }))}
        >
          Re-run onboarding
        </button>
        <p className="text-xs mt-2" style={{ color: '#5C5648' }}>
          Note: This clears your expenses so the wizard can re-add them. Snapshots, P&L, and other data stay intact.
        </p>
      </section>
```

## Step 4: Test

```bash
npm run dev
```

Since you've already set up your data, the onboarding won't trigger automatically — that's correct behavior. To test it:

1. Go to **Rules** tab → scroll to "Re-run setup wizard" → click "Re-run onboarding"
2. The 6-step wizard should take over the screen
3. Walk through it: Welcome → Income type → Expenses → Spending → Buffer → Summary
4. Hit "Open the dashboard" at the end
5. You should be back in the main app with your new numbers reflected everywhere

## Step 5: Build and deploy

```bash
npm run build
```

Push to GitHub or drag `dist/` to Cloudflare.

## Important note

When you re-run onboarding, your existing **expenses are cleared** so the wizard can build fresh ones. Your snapshots, trading P&L, allocations, and impulses are NOT touched. This is intentional — you can refresh the foundation without losing your historical record.
