-- =============================================================
-- Migration 004: Security hardening — RLS, rate limiting, storage
-- Run this AFTER 002_storage_and_admin.sql
-- =============================================================

-- =============================================================
-- 1. Orders RLS — restrict SELECT to authenticated only
--    (no user auth yet; only service_role / dashboard can read)
-- =============================================================
DROP POLICY IF EXISTS "Public read own orders" ON orders;
CREATE POLICY "Admin only read orders"
  ON orders FOR SELECT
  USING (auth.role() = 'authenticated');

-- =============================================================
-- 2. Rate limiting trigger on orders
--    Max 3 orders per phone number per 5 minutes
-- =============================================================
CREATE OR REPLACE FUNCTION check_order_rate()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM orders
    WHERE phone_number = NEW.phone_number
      AND created_at > NOW() - INTERVAL '5 minutes'
  ) >= 3 THEN
    RAISE EXCEPTION 'Too many orders from this phone number. Please wait.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_order_rate ON orders;
CREATE TRIGGER enforce_order_rate
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION check_order_rate();

-- =============================================================
-- 3. Storage upload RLS — add MIME extension check
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
  );

-- =============================================================
-- 4. Storage update RLS — add MIME extension check
-- =============================================================
DROP POLICY IF EXISTS "Authenticated update bucket objects" ON storage.objects;
CREATE POLICY "Authenticated update bucket objects"
  ON storage.objects FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (
    auth.role() = 'authenticated'
    AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'avif')
  );
