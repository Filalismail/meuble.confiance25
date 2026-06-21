-- =============================================================
-- Migration 006: Server-Side Analytics
-- Run this AFTER 005_advanced_security.sql
-- =============================================================

-- =============================================================
-- 1. Analytics Events Table
-- =============================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type    TEXT NOT NULL,
  product_id    UUID,
  category_slug TEXT,
  session_hash  TEXT NOT NULL,
  metadata      JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_event_type
  ON analytics_events (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at
  ON analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_session
  ON analytics_events (session_hash);
CREATE INDEX IF NOT EXISTS idx_analytics_product
  ON analytics_events (product_id) WHERE product_id IS NOT NULL;

-- =============================================================
-- 2. RLS — Complete lockdown
--    Frontend (anon + authenticated) cannot see, insert,
--    update, or delete. Only service_role bypasses RLS.
-- =============================================================
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny all to all roles"
  ON analytics_events
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- =============================================================
-- 3. Auto-cleanup: delete events older than 90 days
-- =============================================================
CREATE OR REPLACE FUNCTION cleanup_analytics()
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.analytics_events
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;
