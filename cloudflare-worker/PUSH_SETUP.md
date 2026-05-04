# Push Notification Setup

## 1. Generate VAPID keys (one-time)

```bash
npx web-push generate-vapid-keys
```

Copy the output:
- **Public Key** → paste into `.env.local` as `VITE_VAPID_PUBLIC_KEY=...`  
  Also needed as `VAPID_PUBLIC_KEY` secret in the Cloudflare Worker.
- **Private Key** → Cloudflare Worker secret `VAPID_PRIVATE_KEY` only. Never in the app.

---

## 2. Supabase — run this SQL

```sql
CREATE TABLE push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  daily_enabled  BOOLEAN DEFAULT true,
  weekly_enabled BOOLEAN DEFAULT true,
  monthly_enabled BOOLEAN DEFAULT true,
  preferred_time  TIME DEFAULT '08:00',
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS: users can only read/write their own row
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own row" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Service role bypass (for the Cloudflare Worker cron)
-- The cron uses the service role key, which bypasses RLS automatically.
```

---

## 3. Cloudflare Worker — deploy

```bash
# Install Wrangler
npm install -g wrangler
wrangler login

# Create the worker
wrangler init push-cron --no-bundle
# Copy push-cron.js into the worker directory

# Set secrets
wrangler secret put SUPABASE_URL          # https://xxx.supabase.co
wrangler secret put SUPABASE_SERVICE_KEY  # service_role key from Supabase → Settings → API
wrangler secret put VAPID_SUBJECT         # mailto:your@email.com
wrangler secret put VAPID_PUBLIC_KEY      # same public key from step 1
wrangler secret put VAPID_PRIVATE_KEY     # private key from step 1

# Set cron trigger in wrangler.toml:
# [triggers]
# crons = ["0 * * * *"]   ← runs every hour

wrangler deploy
```

---

## 4. iOS requirements

Push notifications on iPhone require:
1. iOS 16.4 or later
2. The app added to Home Screen via **Safari → Share → Add to Home Screen**
3. Opening the app **from the Home Screen icon** (not from Safari directly)
4. Tapping "Enable push notifications" in Settings → Notifications

Notifications arrive even when the app is in the background once subscribed.

---

## How it works

```
User taps "Enable push notifications"
  → browser requests Notification permission
  → subscribes to push via service worker (VAPID)
  → subscription object saved to Supabase push_subscriptions

Cloudflare Worker runs every hour (cron)
  → queries push_subscriptions WHERE preferred_time hour = current UTC hour
  → loads user_data for each user
  → builds personalized notification body from real data (buffer, spending, etc.)
  → sends encrypted Web Push (AES-128-GCM + ECDH, RFC 8291) directly to browser endpoint

Browser receives push
  → service worker wakes up, shows notification
  → user taps notification → app opens/focuses
```
