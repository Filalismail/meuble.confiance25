-- Migration 010: Add promo_code column to orders table
-- Needed to enforce per-promo-code phone reuse restriction

ALTER TABLE orders
ADD COLUMN promo_code TEXT NOT NULL DEFAULT '';
