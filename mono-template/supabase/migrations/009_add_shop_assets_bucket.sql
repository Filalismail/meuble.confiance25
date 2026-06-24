-- =============================================================
-- Migration 009: Create shop-assets bucket + update RLS
-- Run this AFTER 008_fix_rls_and_cors.sql
-- =============================================================

-- Create the shared shop-assets bucket for admin image uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('shop-assets', 'shop-assets', TRUE, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/avif']::text[])
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage RLS policies that have hardcoded bucket lists
DROP POLICY IF EXISTS "Public read bucket objects" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload to catalogue buckets" ON storage.objects;

-- Recreate with shop-assets included
CREATE POLICY "Public read bucket objects"
  ON storage.objects FOR SELECT
  USING (bucket_id IN (
    'main-bedroom','kids-bedroom','salons','salle-a-manger',
    'matelas','horloges','armoires','shop-assets'
  ));

CREATE POLICY "Authenticated upload to catalogue buckets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN (
      'main-bedroom','kids-bedroom','salons','salle-a-manger',
      'matelas','horloges','armoires','shop-assets'
    )
    AND auth.role() = 'authenticated'
  );
