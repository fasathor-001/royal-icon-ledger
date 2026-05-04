# Rebrand to Royal-Icon Ledger

## Step 1: Replace the icon files

Place these in your `public/` folder, replacing existing ones:

- `icon-192.png` (PWA icon)
- `icon-512.png` (PWA icon)
- `favicon.ico` (browser tab icon)
- `apple-touch-icon.png` (iOS home screen icon)

## Step 2: Update `index.html`

Find these lines and update them:

```html
<title>The Open Ledger</title>
```

Change to:

```html
<title>Royal-Icon Ledger</title>
```

Also update the description meta tag:

```html
<meta name="description" content="Royal-Icon Ledger — Personal finance for the disciplined" />
```

## Step 3: Update `vite.config.js`

In the PWA manifest section, change:

```javascript
manifest: {
  name: 'The Open Ledger',
  short_name: 'Ledger',
  description: 'Personal finance for variable income',
  // ...
}
```

To:

```javascript
manifest: {
  name: 'Royal-Icon Ledger',
  short_name: 'Royal Ledger',
  description: 'Personal finance for the disciplined',
  // ...
}
```

## Step 4: Update the header in App.jsx

Find this in App.jsx (in the main return):

```javascript
<h1 className="display text-2xl">
  The <span style={{ fontStyle: 'italic', color: '#D97757' }}>Open Ledger</span>.
</h1>
<span className="label hidden sm:inline" style={{ color: '#5C5648' }}>Your Numbers, Your System</span>
```

Replace with:

```javascript
<h1 className="display text-2xl">
  Royal-Icon <span style={{ fontStyle: 'italic', color: '#D97757' }}>Ledger</span>
</h1>
<span className="label hidden sm:inline" style={{ color: '#5C5648' }}>Personal finance for the disciplined</span>
```

## Step 5: Update Onboarding.jsx welcome screen

Find this in `src/components/Onboarding.jsx`:

```javascript
<h1 className="ob-display" style={{ fontSize: '48px', lineHeight: 1.1, marginBottom: '24px', fontWeight: 300 }}>
  Welcome to <span style={{ fontStyle: 'italic', color: '#D97757' }}>The Open Ledger</span>.
</h1>
```

Replace with:

```javascript
<h1 className="ob-display" style={{ fontSize: '48px', lineHeight: 1.1, marginBottom: '24px', fontWeight: 300 }}>
  Welcome to <span style={{ fontStyle: 'italic', color: '#D97757' }}>Royal-Icon Ledger</span>.
</h1>
```

## Step 6: Update InstallPrompt.jsx

Find any reference to "Ledger" or "Install Ledger" in `src/components/InstallPrompt.jsx` and change to "Royal-Icon Ledger".

Specifically the banner text:

```javascript
<div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>Install Ledger</div>
```

Change to:

```javascript
<div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>Install Royal-Icon Ledger</div>
```

## Step 7: Build and deploy

```bash
npm run build
```

Push to GitHub or drag `dist/` to Cloudflare. The new logo and name will appear everywhere.

## Optional: Custom Cloudflare domain

If you want `royal-icon-ledger.pages.dev` instead of `royal-ledger.pages.dev`:

1. Go to Cloudflare dashboard → your project → Settings
2. Click "Change project name"
3. New project name: `royal-icon-ledger`
4. Note: This changes your URL, so anyone with the old link will need the new one

Or buy a custom domain from Cloudflare Registrar (~$10/year for `.com`):
- Settings → Custom domains → Set up a domain
