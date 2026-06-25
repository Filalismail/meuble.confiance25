-- =============================================================
-- Migration 007: Daily Analytics Rollup & Aggregation
-- Run this AFTER 006_analytics.sql
-- =============================================================

-- =============================================================
-- 1. Daily Summary Table
-- =============================================================
CREATE TABLE IF NOT EXISTS daily_analytics_summary (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary_date  DATE NOT NULL,
  metric_type   TEXT NOT NULL,
  metric_key    TEXT NOT NULL,
  metric_data   JSONB NOT NULL DEFAULT '{}'::JSONB,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_summary_unique
  ON daily_analytics_summary (summary_date, metric_type, metric_key);

CREATE INDEX IF NOT EXISTS idx_daily_summary_date
  ON daily_analytics_summary (summary_date DESC);

-- =============================================================
-- 2. RLS — Complete lockdown
-- =============================================================
ALTER TABLE daily_analytics_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny all to all roles on daily summary"
  ON daily_analytics_summary
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- =============================================================
-- 3. Aggregation function
-- =============================================================
CREATE OR REPLACE FUNCTION aggregate_daily_analytics(
  p_date DATE DEFAULT (CURRENT_DATE - INTERVAL '1 day')::DATE
)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_start TIMESTAMPTZ := p_date::TIMESTAMPTZ;
  v_end   TIMESTAMPTZ := (p_date + 1)::TIMESTAMPTZ;
BEGIN

  -- A. Marketing Sources
  INSERT INTO public.daily_analytics_summary
    (summary_date, metric_type, metric_key, metric_data)
  SELECT
    p_date,
    'marketing_source',
    COALESCE(e.metadata->>'source', 'direct'),
    jsonb_build_object('total_visitors', COUNT(DISTINCT e.session_hash))
  FROM public.analytics_events e
  WHERE e.created_at >= v_start AND e.created_at < v_end
    AND e.event_type IN ('page_view', 'category_view', 'product_view')
  GROUP BY COALESCE(e.metadata->>'source', 'direct')
  ON CONFLICT (summary_date, metric_type, metric_key)
  DO UPDATE SET metric_data = EXCLUDED.metric_data, updated_at = NOW();

  -- B. Geo & Shipping Demand
  INSERT INTO public.daily_analytics_summary
    (summary_date, metric_type, metric_key, metric_data)
  SELECT
    p_date,
    'geo_demand',
    'wilaya_' || (e.metadata->>'wilaya_id'),
    jsonb_build_object(
      'total_orders',     COUNT(*),
      'total_revenue',    COALESCE(SUM((e.metadata->>'cart_value')::numeric), 0),
      'shipping_home',    COUNT(*) FILTER (WHERE e.metadata->>'shipping_type' = 'home'),
      'shipping_desk',    COUNT(*) FILTER (WHERE e.metadata->>'shipping_type' = 'desk'),
      'avg_order_value',  COALESCE(AVG((e.metadata->>'cart_value')::numeric), 0)
    )
  FROM public.analytics_events e
  WHERE e.created_at >= v_start AND e.created_at < v_end
    AND e.event_type = 'checkout_success'
  GROUP BY e.metadata->>'wilaya_id'
  ON CONFLICT (summary_date, metric_type, metric_key)
  DO UPDATE SET metric_data = EXCLUDED.metric_data, updated_at = NOW();

  -- D. Product Performance
  WITH product_views AS (
    SELECT e.product_id, COUNT(*) AS views
    FROM public.analytics_events e
    WHERE e.created_at >= v_start AND e.created_at < v_end
      AND e.event_type = 'product_view'
      AND e.product_id IS NOT NULL
    GROUP BY e.product_id
  ),
  product_carts AS (
    SELECT e.product_id, COUNT(*) AS carts
    FROM public.analytics_events e
    WHERE e.created_at >= v_start AND e.created_at < v_end
      AND e.event_type = 'add_to_cart'
      AND e.product_id IS NOT NULL
    GROUP BY e.product_id
  ),
  product_checkouts AS (
    SELECT
      (item->>'product_id')::UUID AS product_id,
      COUNT(*) AS checkouts
    FROM public.analytics_events e,
      LATERAL jsonb_array_elements(e.metadata->'items_json') AS item
    WHERE e.created_at >= v_start AND e.created_at < v_end
      AND e.event_type = 'checkout_success'
    GROUP BY (item->>'product_id')::UUID
  )
  INSERT INTO public.daily_analytics_summary
    (summary_date, metric_type, metric_key, metric_data)
  SELECT
    p_date,
    'product_performance',
    COALESCE(v.product_id::TEXT, c.product_id::TEXT, ch.product_id::TEXT),
    jsonb_build_object(
      'views',     COALESCE(v.views, 0),
      'add_to_cart', COALESCE(c.carts, 0),
      'checkouts', COALESCE(ch.checkouts, 0),
      'conversion_rate_view_to_cart',
        CASE WHEN COALESCE(v.views, 0) > 0
          THEN ROUND(COALESCE(c.carts, 0)::numeric / v.views * 100, 2)
          ELSE 0 END
    )
  FROM product_views v
  FULL OUTER JOIN product_carts c ON v.product_id = c.product_id
  FULL OUTER JOIN product_checkouts ch ON COALESCE(v.product_id, c.product_id) = ch.product_id
  ON CONFLICT (summary_date, metric_type, metric_key)
  DO UPDATE SET metric_data = EXCLUDED.metric_data, updated_at = NOW();

  -- E. Funnel KPIs
  WITH funnel AS (
    SELECT
      COUNT(DISTINCT CASE WHEN event_type = 'product_view'     THEN session_hash END) AS viewers,
      COUNT(DISTINCT CASE WHEN event_type = 'add_to_cart'      THEN session_hash END) AS adders,
      COUNT(DISTINCT CASE WHEN event_type = 'checkout_attempt' THEN session_hash END) AS attempters,
      COUNT(DISTINCT CASE WHEN event_type = 'checkout_success' THEN session_hash END) AS buyers
    FROM public.analytics_events
    WHERE created_at >= v_start AND created_at < v_end
  )
  INSERT INTO public.daily_analytics_summary
    (summary_date, metric_type, metric_key, metric_data)
  SELECT
    p_date,
    'funnel_kpis',
    'cart_abandonment',
    jsonb_build_object(
      'unique_viewers',          funnel.viewers,
      'unique_add_to_cart',      funnel.adders,
      'unique_checkout_attempt', funnel.attempters,
      'unique_buyers',           funnel.buyers,
      'abandonment_rate',
        CASE WHEN funnel.adders > 0
          THEN ROUND((funnel.adders - funnel.buyers)::numeric / funnel.adders * 100, 2)
          ELSE 0 END
    )
  FROM funnel
  ON CONFLICT (summary_date, metric_type, metric_key)
  DO UPDATE SET metric_data = EXCLUDED.metric_data, updated_at = NOW();

  -- F. Temporal Peak
  INSERT INTO public.daily_analytics_summary
    (summary_date, metric_type, metric_key, metric_data)
  SELECT
    p_date,
    'temporal_peak',
    'rush_hour',
    jsonb_build_object(
      'peak_hour', COALESCE(
        (SELECT EXTRACT(HOUR FROM created_at)::INT
         FROM public.analytics_events
         WHERE created_at >= v_start AND created_at < v_end
           AND event_type = 'checkout_success'
         GROUP BY EXTRACT(HOUR FROM created_at)
         ORDER BY COUNT(*) DESC
         LIMIT 1),
        -1
      ),
      'peak_hour_orders', COALESCE(
        (SELECT COUNT(*)
         FROM public.analytics_events
         WHERE created_at >= v_start AND created_at < v_end
           AND event_type = 'checkout_success'
         GROUP BY EXTRACT(HOUR FROM created_at)
         ORDER BY COUNT(*) DESC
         LIMIT 1),
        0
      ),
      'hourly_breakdown', (
        SELECT COALESCE(jsonb_object_agg(
          EXTRACT(HOUR FROM created_at)::TEXT,
          COUNT(*)
        ), '{}'::jsonb)
        FROM public.analytics_events
        WHERE created_at >= v_start AND created_at < v_end
          AND event_type = 'checkout_success'
        GROUP BY EXTRACT(HOUR FROM created_at)
      )
    )
  ON CONFLICT (summary_date, metric_type, metric_key)
  DO UPDATE SET metric_data = EXCLUDED.metric_data, updated_at = NOW();
END;
$$;

-- =============================================================
-- 4. Updated cleanup: purge raw events older than 14 days
-- =============================================================
CREATE OR REPLACE FUNCTION cleanup_analytics()
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.analytics_events
  WHERE created_at < NOW() - INTERVAL '14 days';
END;
$$;

-- =============================================================
-- 5. Nightly maintenance: aggregate yesterday + purge old
-- =============================================================
CREATE OR REPLACE FUNCTION nightly_analytics_maintenance()
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  PERFORM public.aggregate_daily_analytics((CURRENT_DATE - INTERVAL '1 day')::DATE);
  PERFORM public.cleanup_analytics();
END;
$$;
