-- =============================================================
-- Migration 014: Fix Marketing Source Aggregation
--
-- Problem: The aggregate_daily_analytics function only counted
--          category_view and product_view events for marketing
--          sources, but the VisitTracker sends page_view events
--          with the source metadata. So UTM-tagged visits were
--          logged but never aggregated into daily summaries.
--
-- Fix:     Add page_view to the event_type filter in the
--          marketing source aggregation query.
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
      (jsonb_array_elements(e.metadata->'items_json')->>'product_id')::UUID AS product_id,
      COUNT(*) AS checkouts
    FROM public.analytics_events e
    WHERE e.created_at >= v_start AND e.created_at < v_end
      AND e.event_type = 'checkout_success'
    GROUP BY product_id
  )
  INSERT INTO public.daily_analytics_summary
    (summary_date, metric_type, metric_key, metric_data)
  SELECT
    p_date,
    'product_performance',
    pv.product_id::TEXT,
    jsonb_build_object(
      'views',       pv.views,
      'add_to_cart', COALESCE(pc.carts, 0),
      'checkouts',   COALESCE(pch.checkouts, 0)
    )
  FROM product_views pv
  LEFT JOIN product_carts pc ON pc.product_id = pv.product_id
  LEFT JOIN product_checkouts pch ON pch.product_id = pv.product_id
  ON CONFLICT (summary_date, metric_type, metric_key)
  DO UPDATE SET metric_data = EXCLUDED.metric_data, updated_at = NOW();

  -- E. Funnel KPIs
  INSERT INTO public.daily_analytics_summary
    (summary_date, metric_type, metric_key, metric_data)
  SELECT
    p_date,
    'funnel_kpis',
    'global',
    jsonb_build_object(
      'views',       COALESCE((SELECT COUNT(*) FROM public.analytics_events e WHERE e.created_at >= v_start AND e.created_at < v_end AND e.event_type = 'page_view'), 0),
      'add_to_cart', COALESCE((SELECT COUNT(*) FROM public.analytics_events e WHERE e.created_at >= v_start AND e.created_at < v_end AND e.event_type = 'add_to_cart'), 0),
      'checkouts',   COALESCE((SELECT COUNT(*) FROM public.analytics_events e WHERE e.created_at >= v_start AND e.created_at < v_end AND e.event_type = 'checkout_success'), 0),
      'buyers',      COALESCE((SELECT COUNT(DISTINCT e.session_hash) FROM public.analytics_events e WHERE e.created_at >= v_start AND e.created_at < v_end AND e.event_type = 'checkout_success'), 0)
    )
  ON CONFLICT (summary_date, metric_type, metric_key)
  DO UPDATE SET metric_data = EXCLUDED.metric_data, updated_at = NOW();

  -- F. Temporal Peak
  INSERT INTO public.daily_analytics_summary
    (summary_date, metric_type, metric_key, metric_data)
  SELECT
    p_date,
    'temporal_peak',
    'global',
    jsonb_build_object(
      'peak_hour',        mode_stats.hour,
      'peak_hour_orders', mode_stats.cnt,
      'hourly_breakdown', hourly_agg.breakdown
    )
  FROM (
    SELECT
      EXTRACT(HOUR FROM e.created_at)::INT AS hour,
      COUNT(*) AS cnt
    FROM public.analytics_events e
    WHERE e.created_at >= v_start AND e.created_at < v_end
      AND e.event_type = 'checkout_success'
    GROUP BY EXTRACT(HOUR FROM e.created_at)
    ORDER BY cnt DESC
    LIMIT 1
  ) mode_stats
  CROSS JOIN LATERAL (
    SELECT jsonb_object_agg(
      lpad(EXTRACT(HOUR FROM e.created_at)::TEXT, 2, '0'),
      COUNT(*)
    ) AS breakdown
    FROM public.analytics_events e
    WHERE e.created_at >= v_start AND e.created_at < v_end
      AND e.event_type = 'checkout_success'
    GROUP BY EXTRACT(HOUR FROM e.created_at)
  ) hourly_agg
  ON CONFLICT (summary_date, metric_type, metric_key)
  DO UPDATE SET metric_data = EXCLUDED.metric_data, updated_at = NOW();

END;
$$;

GRANT EXECUTE ON FUNCTION aggregate_daily_analytics(DATE) TO anon;
