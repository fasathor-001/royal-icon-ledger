# The Open Ledger — Deployment Guide

Your personal finance dashboard, ready to deploy on Cloudflare Pages.

## What you have

- `App.jsx` — Main component, with `localStorage` already wired up
- `main.jsx` — React entry point
- `index.html` — HTML shell
- `index.css` — Tailwind imports
- `tailwind.config.js` — Tailwind config

## Step 1: Install Node.js (if you don't have it)

Download the LTS version from https://nodejs.org. After install, verify in Terminal/PowerShell:

```bash
node --version
```

## Step 2: Create the Vite project

In your Terminal/PowerShell:

```bash
npm create vite@latest my-finance-app -- --template react
cd my-finance-app
npm install
npm install lucide-react recharts
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

## Step 3: Replace the default files

Copy these files from this download into your project, replacing what's there:

| Copy this file       | Into this location in your project |
|----------------------|-----------------------------------|
| `App.jsx`            | `src/App.jsx`                     |
| `main.jsx`           | `src/main.jsx`                    |
| `index.css`          | `src/index.css`                   |
| `index.html`         | `index.html` (root)               |
| `tailwind.config.js` | `tailwind.config.js` (root)       |

## Step 4: Test locally

```bash
npm run dev
```

Open the URL it prints (usually http://localhost:5173). Confirm the app loads, you can add expenses, take snapshots, etc.

## Step 5: Build for production

```bash
npm run build
```

This creates a `dist/` folder. That's what you deploy.

## Step 6: Deploy to Cloudflare Pages

### Option A — Drag and drop (quickest)

1. Go to https://dash.cloudflare.com and sign up (free)
2. Sidebar → **Workers & Pages** → **Create** → **Pages** → **Upload assets**
3. Name your project (e.g., `my-ledger`)
4. Drag your `dist/` folder onto the upload area
5. Click **Deploy site**
6. You'll get a URL like `my-ledger.pages.dev`

### Option B — GitHub auto-deploy (best for ongoing updates)

1. Create a free GitHub account if needed
2. Create a new empty repo on github.com
3. In your project folder:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/my-finance-app.git
git push -u origin main
```

4. In Cloudflare → Workers & Pages → Create → Pages → **Connect to Git**
5. Authorize GitHub, pick your repo
6. Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
7. **Save and Deploy**

Every `git push` from now on auto-deploys in 1–2 minutes.

## Important notes

**Privacy.** Your data lives only in your browser's localStorage. Nothing goes to Cloudflare or any server. Use the same browser/device to maintain continuity. Clearing browser data wipes your records.

**Custom domain.** Free `*.pages.dev` URL forever. To use your own domain, buy one from Cloudflare Registrar (no markup) and add it in your project's Custom Domains tab.

**Cost.** Free tier: 500 builds/month, unlimited bandwidth. You will not hit limits.

**Backups.** Since data is browser-local, consider exporting periodically. (Future addition: an export-to-JSON button.)

## Troubleshooting

**Tailwind classes not applying:** Make sure `tailwind.config.js` content array points to `./src/**/*.{js,jsx}`.

**Build fails on Cloudflare:** Check that `lucide-react` and `recharts` are in your package.json dependencies, not devDependencies.

**Blank screen after deploy:** Open browser DevTools console. Most likely a missing import or wrong file path.
