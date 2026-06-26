-- =============================================================
-- Migration 012: Fix Rate Limit Accumulation
--
-- Problem: Check_ip_rate_limit had no cap on entries per IP.
--          An IP could accumulate unlimited entries, all within
--          the rolling window, causing multi-hour blocks.
--
-- Fix:     Replace check_ip_rate_limit so that it:
--          1. Purges entries outside the window for this IP
--          2. Counts remaining entries
--          3. Denies if at or over p_max_requests
--          4. Allows: inserts entry, then caps to p_max_requests
--
-- This guarantees no IP can ever accumulate more than
-- p_max_requests entries, and after p_window_seconds of
-- inactivity the IP has zero entries.
-- =============================================================

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
  PERFORM pg_advisory_xact_lock(hashtext('ip_rl_' || p_ip));

  -- 1. Purge entries outside the window for this IP
  DELETE FROM public.ip_rate_limits
  WHERE ip = p_ip
    AND created_at < NOW() - (p_window_seconds || ' seconds')::INTERVAL;

  -- 2. Count remaining (within window)
  SELECT COUNT(*) INTO v_count
  FROM public.ip_rate_limits
  WHERE ip = p_ip;

  -- 3. Deny if at or over limit
  IF v_count >= p_max_requests THEN
    v_result := jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'message', 'Trop de tentatives. Veuillez réessayer plus tard.'
    );
    RETURN v_result;
  END IF;

  -- 4. Log this request
  INSERT INTO public.ip_rate_limits (ip) VALUES (p_ip);

  -- 5. Cap at p_max_requests (keep only the newest entries per IP)
  DELETE FROM public.ip_rate_limits
  WHERE ip = p_ip
    AND id NOT IN (
      SELECT id FROM public.ip_rate_limits
      WHERE ip = p_ip
      ORDER BY created_at DESC
      LIMIT p_max_requests
    );

  v_result := jsonb_build_object(
    'allowed', true,
    'remaining', p_max_requests - v_count - 1,
    'message', NULL
  );
  RETURN v_result;
END;
$$;

