-- =============================================================
-- Migration 005: Advanced Security — Rate Limiting, Race
--               Conditions, Privilege Escalation, Path Traversal
-- Run this AFTER 004_security_fixes.sql
-- =============================================================

-- =============================================================
-- PART 1 — IP-Based Rate Limiting (In-DB, no Redis)
-- =============================================================

CREATE TABLE IF NOT EXISTS ip_rate_limits (
  id          BIGSERIAL PRIMARY KEY,
  ip          TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Speed up COUNT queries by IP + time window
CREATE INDEX IF NOT EXISTS idx_ip_rate_limits_ip_created
  ON ip_rate_limits (ip, created_at);

-- Auto-cleanup: delete rows older than 1 hour (runs probabilistically)
CREATE OR REPLACE FUNCTION cleanup_ip_rate_limits()
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.ip_rate_limits
  WHERE created_at < NOW() - INTERVAL '1 hour';
END;
$$;

CREATE OR REPLACE FUNCTION check_ip_rate_limit(
  p_ip              TEXT,
  p_window_seconds  INT DEFAULT 300,
  p_max_requests    INT DEFAULT 5
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_count INT;
  v_result jsonb;
BEGIN
  -- Serialize concurrent requests from the same IP
  -- Uses a transaction-level advisory keyed on a hash of the IP
  PERFORM pg_advisory_xact_lock(hashtext('ip_rl_' || p_ip));

  SELECT COUNT(*) INTO v_count
  FROM public.ip_rate_limits
  WHERE ip = p_ip
    AND created_at > NOW() - (p_window_seconds || ' seconds')::INTERVAL;

  IF v_count >= p_max_requests THEN
    v_result := jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'message', 'Trop de tentatives. Veuillez réessayer plus tard.'
    );
    RETURN v_result;
  END IF;

  -- Log this request
  INSERT INTO public.ip_rate_limits (ip) VALUES (p_ip);

  -- Opportunistic cleanup (~1% chance to keep table trim)
  IF random() < 0.01 THEN
    PERFORM cleanup_ip_rate_limits();
  END IF;

  v_result := jsonb_build_object(
    'allowed', true,
    'remaining', p_max_requests - v_count - 1,
    'message', NULL
  );
  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION check_ip_rate_limit(TEXT, INT, INT) TO anon;
GRANT EXECUTE ON FUNCTION cleanup_ip_rate_limits() TO anon;

-- =============================================================
-- PART 2 — Race Condition Fix: Promo Code with FOR UPDATE
-- =============================================================

-- Add usage tracking columns
ALTER TABLE promo_codes
  ADD COLUMN IF NOT EXISTS max_uses     INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS current_uses INT NOT NULL DEFAULT 0;

-- Enforce the invariant at DB level
ALTER TABLE promo_codes
  DROP CONSTRAINT IF EXISTS promo_codes_current_uses_check,
  ADD CONSTRAINT promo_codes_current_uses_check
    CHECK (current_uses >= 0 AND current_uses <= max_uses);

CREATE OR REPLACE FUNCTION apply_promo_code(
  p_code     TEXT,
  p_subtotal NUMERIC
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_rec       RECORD;
  v_discount  NUMERIC;
  v_result    jsonb;
BEGIN
  -- SELECT … FOR UPDATE locks the row, blocking concurrent readers
  SELECT discount_percentage, is_active, current_uses, max_uses
  INTO v_rec
  FROM public.promo_codes
  WHERE code = p_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false, 'error', 'Code promo introuvable'
    );
  END IF;

  IF NOT v_rec.is_active THEN
    RETURN jsonb_build_object(
      'valid', false, 'error', 'Code promo désactivé'
    );
  END IF;

  IF v_rec.current_uses >= v_rec.max_uses THEN
    RETURN jsonb_build_object(
      'valid', false, 'error', 'Code promo déjà épuisé'
    );
  END IF;

  -- Atomically increment the use counter while we still hold the lock
  UPDATE public.promo_codes
  SET current_uses = current_uses + 1
  WHERE code = p_code;

  v_discount := ROUND(v_rec.discount_percentage * p_subtotal / 100);

  RETURN jsonb_build_object(
    'valid',              true,
    'discount_percentage', v_rec.discount_percentage,
    'discount_amount',     v_discount
  );
END;
$$;

GRANT EXECUTE ON FUNCTION apply_promo_code(TEXT, NUMERIC) TO anon;

-- =============================================================
-- PART 3 — Privilege Escalation: Fix check_order_rate
--           (Add SET search_path + fully qualify tables)
-- =============================================================

CREATE OR REPLACE FUNCTION check_order_rate()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM public.orders
    WHERE phone_number = NEW.phone_number
      AND created_at > NOW() - INTERVAL '5 minutes'
  ) >= 3 THEN
    RAISE EXCEPTION 'Too many orders from this phone number. Please wait.';
  END IF;
  RETURN NEW;
END;
$$;

-- =============================================================
-- PART 4 — Storage Path Traversal Guard
-- =============================================================

DROP POLICY IF EXISTS "Authenticated upload to catalogue buckets" ON storage.objects;
CREATE POLICY "Authenticated upload to catalogue buckets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN (
      'main-bedroom','kids-bedroom','salons','salle-a-manger',
      'matelas','horloges','armoires'
    )
    AND auth.role() = 'authenticated'
    AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'avif')
    AND position('/' IN name) = 0
    AND position('..' IN name) = 0
    AND position('\' IN name) = 0
    AND length(name) BETWEEN 1 AND 255
  );

DROP POLICY IF EXISTS "Authenticated update bucket objects" ON storage.objects;
CREATE POLICY "Authenticated update bucket objects"
  ON storage.objects FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (
    auth.role() = 'authenticated'
    AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'avif')
    AND position('/' IN name) = 0
    AND position('..' IN name) = 0
    AND position('\' IN name) = 0
    AND length(name) BETWEEN 1 AND 255
  );
