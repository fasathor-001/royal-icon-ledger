// src/lib/analytics.js
//
// Minimal tester activity tracking for Royal Ledger.
// Purpose: verify real tester usage during the compensated testing phase.
// This is NOT marketing analytics — do not add event types without deliberate intent.
//
// Three event types only (enforced by DB check constraint):
//   login          — once per browser session when a user authenticates
//   app_open       — once per browser session when the app loads authenticated
//   activity_ping  — every 60 seconds when visible AND recently interacted with
//
// Silent fail contract: this module never throws, never shows UI errors,
// and never logs to console outside of import.meta.env.DEV.
//
// See admin/ADMIN_QUERIES.sql for inspection queries.

import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Insert a user activity event into user_activity_events.
 *
 * Silent fail: catches all errors. No-op when Supabase is not configured
 * (local-only dev mode where supabase client is null).
 *
 * @param {'login' | 'app_open' | 'activity_ping'} eventType
 */
export async function logEvent(eventType) {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    const { error } = await supabase
      .from('user_activity_events')
      .insert({ user_id: userId, event_type: eventType });

    if (error && import.meta.env.DEV) {
      console.debug('[analytics] logEvent error:', error.message);
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.debug('[analytics] logEvent threw:', err?.message);
    }
  }
}
