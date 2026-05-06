// src/lib/dataLayer.js
//
// All Supabase data operations. Single table strategy: one row per user
// with a JSONB `data` column. Simple, RLS-isolated, CRUD-only.
//
// Table schema (run in Supabase SQL editor):
//   See INTEGRATION.md for full SQL.

import { supabase, isSupabaseConfigured } from './supabase';

const TABLE = 'user_data';

// Load the user's data blob from Supabase.
// Returns the parsed data object, or null if not found / not configured.
export async function loadData(userId) {
  if (!isSupabaseConfigured || !supabase || !userId) return null;

  const { data, error } = await supabase
    .from(TABLE)
    .select('data, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[dataLayer] loadData error:', error.message);
    return null;
  }

  return data ? { ...data.data, _syncedAt: data.updated_at } : null;
}

// Save the user's data blob to Supabase (upsert).
// Debounce at the call site — this fires a real network request.
export async function saveData(userId, appData) {
  if (!isSupabaseConfigured || !supabase || !userId) return;

  // Strip internal sync metadata before storing
  const { _syncedAt, ...cleanData } = appData;

  const { error } = await supabase
    .from(TABLE)
    .upsert(
      { user_id: userId, data: cleanData, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('[dataLayer] saveData error:', error.message);
    throw error;
  }
}

// Classify a Supabase/network error so the caller can decide retry vs abort.
// Returns: 'network' | 'auth' | 'rls' | 'unknown'
export function classifyError(err) {
  if (!err) return 'unknown';
  if (typeof navigator !== 'undefined' && !navigator.onLine) return 'network';
  const msg = (err.message || '').toLowerCase();
  const code = String(err.code || '');
  if (
    msg.includes('jwt') || msg.includes('not authenticated') ||
    msg.includes('invalid_grant') || msg.includes('refresh_token_not_found')
  ) return 'auth';
  if (code === '42501' || msg.includes('row-level security') || msg.includes('permission denied'))
    return 'rls';
  if (
    msg.includes('failed to fetch') || msg.includes('networkerror') ||
    msg.includes('network error') || code === 'PGRST301' || msg.includes('load failed')
  ) return 'network';
  return 'unknown';
}

// Version-aware save.
// 1. Reads the current cloud _version from JSONB.
// 2. If local _version < cloud _version → returns { ok: false, conflict: true, cloudVersion }.
// 3. Otherwise upserts and returns { ok: true }.
// Throws on network / auth / RLS errors — caller handles retry.
export async function saveDataVersioned(userId, appData) {
  if (!isSupabaseConfigured || !supabase || !userId)
    throw new Error('supabase_not_configured');

  const localVersion = appData._version || 1;

  // Read cloud version
  const { data: row, error: readErr } = await supabase
    .from(TABLE)
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();

  if (readErr) throw readErr;

  if (row?.data) {
    const cloudVersion = row.data._version || 1;
    if (localVersion < cloudVersion) {
      return { ok: false, conflict: true, cloudVersion };
    }
  }

  // Safe to write
  const { _syncedAt, _localModifiedAt, ...cleanData } = appData;
  const { error: writeErr } = await supabase
    .from(TABLE)
    .upsert(
      { user_id: userId, data: cleanData, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );

  if (writeErr) throw writeErr;
  return { ok: true };
}

// Conflict resolution: server wins if its timestamp is newer.
// Returns the data to use.
export function resolveConflict(localData, remoteData) {
  if (!remoteData) return localData;
  if (!localData) return remoteData;

  const localTs = localData._syncedAt ? new Date(localData._syncedAt).getTime() : 0;
  const remoteTs = remoteData._syncedAt ? new Date(remoteData._syncedAt).getTime() : 0;

  return remoteTs >= localTs ? remoteData : localData;
}

// Import a local data object into Supabase (used during migration).
// Always overwrites whatever is in the cloud.
export async function importLocalToCloud(userId, localData) {
  if (!isSupabaseConfigured || !supabase || !userId) return false;

  const { _syncedAt, ...cleanData } = localData;

  const { error } = await supabase
    .from(TABLE)
    .upsert(
      { user_id: userId, data: cleanData, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('[dataLayer] importLocalToCloud error:', error.message);
    return false;
  }
  return true;
}

// Delete all data for a user (wipe). Used for testing / account reset.
// SAAS-MIGRATION: scope this to a specific user's workspace when multi-tenant.
export async function deleteData(userId) {
  if (!isSupabaseConfigured || !supabase || !userId) return;
  await supabase.from(TABLE).delete().eq('user_id', userId);
}

// ─── INVITE CODES ────────────────────────────────────────────────────────────

// Called during signup (anon context).
// First checks early_access_leads.invite_code (admin-sent codes via the dashboard).
// Falls back to the invite_codes table / use_invite_code RPC for legacy manual codes.
export async function validateAndClaimInviteCode(code, email) {
  if (!isSupabaseConfigured || !supabase) return false;
  const normCode  = code.trim().toUpperCase();
  const normEmail = email.trim().toLowerCase();

  // ── Primary path: admin-sent invite codes stored in early_access_leads ──
  const { data: leadValid, error: leadErr } = await supabase.rpc(
    'validate_lead_invite_code',
    { p_code: normCode, p_email: normEmail },
  );
  if (!leadErr && leadValid === true) return true;
  if (leadErr) console.warn('[dataLayer] validate_lead_invite_code:', leadErr.message);

  // ── Fallback: legacy invite_codes table (manually created codes) ──
  const { data, error } = await supabase.rpc('use_invite_code', {
    p_code:  normCode,
    p_email: normEmail,
  });
  if (error) { console.warn('[dataLayer] use_invite_code fallback:', error.message); return false; }
  return data === true;
}

// Admin — reset an accidentally-burned code back to unused so it can be re-sent.
// Only works for authenticated owners (Supabase RLS enforced on invite_codes table).
export async function resetInviteCode(id) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase
    .from('invite_codes')
    .update({ used: false, used_by_email: null })
    .eq('id', id);
  if (error) { console.error('[dataLayer] resetInviteCode:', error.message); return false; }
  return true;
}

// Authenticated — list all codes for the owner's management panel.
export async function getInviteCodes() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('invite_codes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('[dataLayer] getInviteCodes:', error.message); return []; }
  return data;
}

// Generate a new invite code. Optional emailRestriction ties it to one address.
export async function createInviteCode(emailRestriction = null) {
  if (!isSupabaseConfigured || !supabase) return null;
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const { data, error } = await supabase
    .from('invite_codes')
    .insert({ code, email: emailRestriction || null })
    .select()
    .single();
  if (error) { console.error('[dataLayer] createInviteCode:', error.message); return null; }
  return data;
}

export async function deleteInviteCode(id) {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.from('invite_codes').delete().eq('id', id);
}

// ─── ACCESS REQUESTS ─────────────────────────────────────────────────────────

// Called by unauthenticated users to request access.
export async function submitAccessRequest(email, message) {
  if (!isSupabaseConfigured || !supabase) return false;
  const cleanEmail   = email.trim().toLowerCase();
  const cleanMessage = message?.trim() || null;

  const { error } = await supabase
    .from('access_requests')
    .insert({ email: cleanEmail, message: cleanMessage });
  if (error) { console.error('[dataLayer] submitAccessRequest:', error.message); return false; }

  // Fire admin notification (best-effort — don't block on it)
  supabase.functions
    .invoke('notify-lead', {
      body: {
        record: {
          type:       'access_request',
          email:      cleanEmail,
          message:    cleanMessage,
          created_at: new Date().toISOString(),
        },
      },
    })
    .then(({ error: fnErr, data }) => {
      if (fnErr) console.warn('[dataLayer] notify-lead (access request):', fnErr.message);
      else console.log('[dataLayer] notify-lead results:', data);
    })
    .catch(err => console.warn('[dataLayer] notify-lead (network):', err));

  return true;
}

// Authenticated — list all requests for the owner.
export async function getAccessRequests() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('access_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('[dataLayer] getAccessRequests:', error.message); return []; }
  return data;
}

// Approve: generates a code tied to that email and marks request as approved.
export async function approveAccessRequest(requestId, email) {
  if (!isSupabaseConfigured || !supabase) return null;
  const code = await createInviteCode(email);
  if (!code) return null;
  await supabase.from('access_requests').update({ status: 'approved' }).eq('id', requestId);
  return code.code;
}

export async function rejectAccessRequest(id) {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.from('access_requests').update({ status: 'rejected' }).eq('id', id);
}

// ─── PUSH SUBSCRIPTIONS ──────────────────────────────────────────────────────
//
// Run in Supabase to add new columns to push_subscriptions:
//   alter table push_subscriptions add column if not exists timezone_offset float default 2;
//   alter table push_subscriptions add column if not exists morning_time text default '08:00';
//   alter table push_subscriptions add column if not exists evening_time text default '18:00';
//   alter table push_subscriptions add column if not exists timezone_iana text;

// Save or update the user's push subscription and notification preferences.
export async function savePushSubscription(userId, subscription, prefs) {
  if (!isSupabaseConfigured || !supabase || !userId) return false;

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: userId,
        subscription,
        daily_enabled: prefs.dailyEnabled,
        weekly_enabled: prefs.weeklyEnabled,
        monthly_enabled: prefs.monthlyEnabled,
        preferred_time: prefs.preferredTime,
        timezone_offset: prefs.timezoneOffset,
        timezone_iana:   prefs.timezoneIana ?? null,
        morning_time: prefs.morningTime,
        evening_time: prefs.eveningTime,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) { console.error('[dataLayer] savePushSubscription:', error.message); return false; }
  return true;
}

// Remove the user's push subscription (they disabled notifications).
export async function deletePushSubscription(userId) {
  if (!isSupabaseConfigured || !supabase || !userId) return;
  await supabase.from('push_subscriptions').delete().eq('user_id', userId);
}

// Load subscription + prefs so the Settings tab can show current state.
export async function getPushSubscription(userId) {
  if (!isSupabaseConfigured || !supabase || !userId) return null;
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) { console.error('[dataLayer] getPushSubscription:', error.message); return null; }
  return data;
}

// Update only the preference columns without touching the subscription object.
export async function updatePushPreferences(userId, prefs) {
  if (!isSupabaseConfigured || !supabase || !userId) return false;
  const { error } = await supabase
    .from('push_subscriptions')
    .update({
      daily_enabled: prefs.dailyEnabled,
      weekly_enabled: prefs.weeklyEnabled,
      monthly_enabled: prefs.monthlyEnabled,
      preferred_time: prefs.preferredTime,
      timezone_offset: prefs.timezoneOffset,
      timezone_iana:   prefs.timezoneIana ?? null,
      morning_time: prefs.morningTime,
      evening_time: prefs.eveningTime,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
  if (error) { console.error('[dataLayer] updatePushPreferences:', error.message); return false; }
  return true;
}

// Queue an instant notification event (drawdown / override / stage change).
// The cron worker processes these every hour.
//
// Run this SQL in Supabase first:
//   create table if not exists notification_queue (
//     id uuid default gen_random_uuid() primary key,
//     user_id uuid references auth.users not null,
//     type text not null,
//     payload jsonb default '{}',
//     created_at timestamptz default now(),
//     sent_at timestamptz
//   );
//   alter table notification_queue enable row level security;
//   create policy "insert own" on notification_queue for insert with check (auth.uid() = user_id);
export async function queueNotification(userId, type, payload = {}) {
  if (!isSupabaseConfigured || !supabase || !userId) return;
  await supabase.from('notification_queue').insert({ user_id: userId, type, payload });
}
