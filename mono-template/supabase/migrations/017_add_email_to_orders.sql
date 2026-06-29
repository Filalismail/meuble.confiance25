-- Migration 017: Add email column to orders table
-- Needed to capture customer email during checkout

ALTER TABLE orders
ADD COLUMN email TEXT NOT NULL DEFAULT '';
