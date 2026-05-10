-- notification-queue-migration.sql
-- Creates the notification_queue table that queueNotification() in src/lib/dataLayer.js writes to.
-- Without this table, any call to queueNotification() (PIN override, stage change, drawdown)
-- causes a CORS-failed POST in the browser console because PostgREST returns an error
-- response without proper CORS headers when the table doesn't exist.
--
-- Run this once in the Supabase SQL Editor.
-- Safe to re-run — uses CREATE TABLE IF NOT EXISTS and idempotent grants.

create table if not exists notification_queue (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  type text not null,                 -- 'override' | 'stage_change' | 'drawdown'
  payload jsonb default '{}',         -- type-specific context (item, newStage, etc.)
  created_at timestamptz default now(),
  sent_at timestamptz                 -- null until cron worker dispatches the notification
);

-- RLS: users can insert their own queue entries; nothing else.
-- The cron worker uses the service_role key to read/update sent_at, bypassing RLS.
alter table notification_queue enable row level security;

drop policy if exists "insert own" on notification_queue;
create policy "insert own" on notification_queue for insert
  with check (auth.uid() = user_id);

grant insert on notification_queue to authenticated;

-- Useful index for the cron worker scanning unsent entries.
create index if not exists notification_queue_sent_at_idx
  on notification_queue (sent_at)
  where sent_at is null;
