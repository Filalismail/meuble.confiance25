-- =============================================================
-- Migration 018: Atomic create_order function
--
-- Creates a single RPC function that atomically:
--   1. Validates wilaya and calculates delivery fee
--   2. Applies promo code (if provided) with FOR UPDATE lock
--   3. Inserts the order
--   4. Returns success/error with order_id
--
-- This bypasses PostgREST schema cache issues and ensures
-- promo codes are NEVER consumed if the order insert fails.
-- =============================================================

CREATE OR REPLACE FUNCTION create_order(
  p_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_order_id              UUID;
  v_customer_first_name   TEXT := p_data->>'customer_first_name';
  v_customer_last_name    TEXT := p_data->>'customer_last_name';
  v_email                 TEXT := COALESCE(p_data->>'email', '');
  v_phone                 TEXT := p_data->>'phone';
  v_wilaya_id             INT  := (p_data->>'wilaya_id')::INT;
  v_delivery_type         TEXT := p_data->>'delivery_type';
  v_order_note            TEXT := COALESCE(p_data->>'order_note', '');
  v_items_json            JSONB := COALESCE(p_data->'items_json', '[]'::JSONB);
  v_subtotal              NUMERIC := (p_data->>'subtotal')::NUMERIC;
  v_promo_code            TEXT := COALESCE(p_data->>'promo_code', '');
  v_discount              NUMERIC := 0;
  v_delivery_fee          NUMERIC;
  v_final_total           NUMERIC;
  v_free_delivery_threshold NUMERIC;
  v_wilaya_home_fee       NUMERIC;
  v_wilaya_desk_fee       NUMERIC;
  v_promo_rec             RECORD;
  v_promo_used            BOOLEAN := false;
  v_promo_error           TEXT;
  v_phone_normalized      TEXT;
BEGIN
  -- ── Normalize phone ─────────────────────────────────────
  v_phone_normalized := regexp_replace(v_phone, '\D', '', 'g');
  IF LENGTH(v_phone_normalized) >= 9 THEN
    v_phone_normalized := '0' || RIGHT(v_phone_normalized, 9);
  END IF;
  IF LENGTH(v_phone_normalized) < 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Numéro de téléphone invalide');
  END IF;

  -- ── Look up wilaya ──────────────────────────────────────
  SELECT shipping_home_fee, shipping_desk_fee
    INTO v_wilaya_home_fee, v_wilaya_desk_fee
  FROM public.wilayas
  WHERE id = v_wilaya_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Wilaya invalide');
  END IF;

  v_delivery_fee := CASE v_delivery_type
    WHEN 'home' THEN v_wilaya_home_fee
    ELSE v_wilaya_desk_fee
  END;

  -- ── Free delivery threshold ─────────────────────────────
  SELECT COALESCE(NULLIF(value_fr, '')::NUMERIC, 50000)
    INTO v_free_delivery_threshold
  FROM public.site_settings
  WHERE key = 'delivery_threshold';

  IF v_subtotal >= v_free_delivery_threshold THEN
    v_delivery_fee := 0;
  END IF;

  -- ── Apply promo code (if provided) ──────────────────────
  IF v_promo_code != '' THEN
    -- Check phone has not already used this promo
    IF EXISTS (
      SELECT 1 FROM public.orders
      WHERE phone_number = v_phone_normalized
        AND promo_code = v_promo_code
        AND status != 'cancelled'
    ) THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Ce numéro de téléphone a déjà utilisé ce code promo.'
      );
    END IF;

    -- Lock and validate promo row
    SELECT discount_percentage, is_active, current_uses, max_uses
      INTO v_promo_rec
    FROM public.promo_codes
    WHERE code = v_promo_code
    FOR UPDATE;

    IF NOT FOUND THEN
      v_promo_error := 'Code promo introuvable';
    ELSIF NOT v_promo_rec.is_active THEN
      v_promo_error := 'Code promo désactivé';
    ELSIF v_promo_rec.current_uses >= v_promo_rec.max_uses THEN
      v_promo_error := 'Code promo déjà épuisé';
    ELSE
      v_discount := ROUND(v_promo_rec.discount_percentage * v_subtotal / 100);
      UPDATE public.promo_codes
        SET current_uses = current_uses + 1
      WHERE code = v_promo_code;
      v_promo_used := true;
    END IF;
  END IF;

  -- ── Compute final total ─────────────────────────────────
  v_final_total := v_subtotal - v_discount + v_delivery_fee;

  -- ── Insert order ────────────────────────────────────────
  INSERT INTO public.orders (
    customer_first_name, customer_last_name, email, phone_number,
    wilaya_id, delivery_type, order_note, items_json,
    subtotal, discount_applied, delivery_fee, final_total,
    status, promo_code
  ) VALUES (
    v_customer_first_name, v_customer_last_name, v_email, v_phone_normalized,
    v_wilaya_id, v_delivery_type, v_order_note, v_items_json,
    v_subtotal, v_discount, v_delivery_fee, v_final_total,
    'pending', CASE WHEN v_promo_used THEN v_promo_code ELSE '' END
  )
  RETURNING id INTO v_order_id;

  -- ── Return success ──────────────────────────────────────
  RETURN jsonb_build_object(
    'success',        true,
    'order_id',       v_order_id,
    'discount_applied', v_discount,
    'delivery_fee',   v_delivery_fee,
    'final_total',    v_final_total
  );
END;
$$;

-- Revoke anon/public access (only callable by service_role / authenticated)
REVOKE ALL ON FUNCTION create_order FROM PUBLIC, anon;
