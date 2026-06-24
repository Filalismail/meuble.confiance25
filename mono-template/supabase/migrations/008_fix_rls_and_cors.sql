-- =============================================================
-- Migration 008: Security Fixes from Audit Report
-- Run this AFTER 007_analytics_rollup.sql
--
-- Fixes:
--   H1: Restrict promo_codes SELECT to authenticated users
--   H2: Revoke anon EXECUTE on apply_promo_code RPC
--   M1: Lock down ip_rate_limits table with RLS
--   L3: Revoke anon EXECUTE on check_ip_rate_limit RPC
-- =============================================================

-- =============================================================
-- H1: Restrict promo_codes SELECT to authenticated users only
-- =============================================================
DROP POLICY IF EXISTS "Public read promo_codes" ON promo_codes;
CREATE POLICY "Admin only read promo_codes"
  ON promo_codes FOR SELECT
  USING (auth.role() = 'authenticated');

-- =============================================================
-- H2: Revoke anon EXECUTE on apply_promo_code
--      (server action uses service_role key, not anon)
-- =============================================================
REVOKE EXECUTE ON FUNCTION apply_promo_code(TEXT, NUMERIC) FROM anon;

-- =============================================================
-- M1: Lock down ip_rate_limits table
--      Only the check_ip_rate_limit RPC (called server-side)
--      should touch this table via service_role
-- =============================================================
ALTER TABLE ip_rate_limits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No direct client access" ON ip_rate_limits;
CREATE POLICY "No direct client access"
  ON ip_rate_limits
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- =============================================================
-- L3: Revoke anon EXECUTE on check_ip_rate_limit
--      Only server-side code (actions.ts) calls this via
--      supabaseAdmin with service_role key
-- =============================================================
REVOKE EXECUTE ON FUNCTION check_ip_rate_limit(TEXT, INT, INT) FROM anon;

-- =============================================================
-- Verify no other functions have unnecessary anon EXECUTE grants
-- (cleanup: none of our functions should be callable by anon)
-- =============================================================
REVOKE EXECUTE ON FUNCTION cleanup_ip_rate_limits() FROM anon;
