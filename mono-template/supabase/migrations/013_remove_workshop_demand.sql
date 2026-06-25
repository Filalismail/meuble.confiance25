-- =============================================================
-- Migration 013: Remove workshop_demand analytics
--
-- Deletes all existing workshop_demand rows from
-- daily_analytics_summary and stops new ones from being
-- inserted (the code in the function was removed in 007).
-- =============================================================

DELETE FROM public.daily_analytics_summary
WHERE metric_type = 'workshop_demand';
