-- =============================================================
-- Migration 002: Storage Buckets + Admin RLS Policies
-- Run this AFTER 001_initial_schema.sql
-- =============================================================

-- =============================================================
-- PART 1 — Storage Buckets
-- =============================================================
-- Each category gets a public bucket so images are served
-- directly via URL without auth tokens.
-- (Run via Supabase Dashboard SQL Editor as project owner)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('main-bedroom', 'main-bedroom', TRUE, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/avif']::text[]),
  ('kids-bedroom', 'kids-bedroom', TRUE, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/avif']::text[]),
  ('salons',       'salons',       TRUE, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/avif']::text[]),
  ('salle-a-manger','salle-a-manger',TRUE, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/avif']::text[]),
  ('matelas',      'matelas',      TRUE, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/avif']::text[]),
  ('horloges',     'horloges',     TRUE, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/avif']::text[]),
  ('armoires',     'armoires',     TRUE, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/avif']::text[])
ON CONFLICT (id) DO NOTHING;

-- Public read access for all buckets (anyone can view images)
CREATE POLICY "Public read bucket objects"
  ON storage.objects FOR SELECT
  USING (bucket_id IN (
    'main-bedroom','kids-bedroom','salons','salle-a-manger',
    'matelas','horloges','armoires'
  ));

-- Allow authenticated uploads (dashboard / admin users)
CREATE POLICY "Authenticated upload to catalogue buckets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN (
      'main-bedroom','kids-bedroom','salons','salle-a-manger',
      'matelas','horloges','armoires'
    )
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated update bucket objects"
  ON storage.objects FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete bucket objects"
  ON storage.objects FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================================
-- PART 2 — Admin RLS Policies (INSERT / UPDATE / DELETE)
-- Allows the Supabase Dashboard (authenticated) to manage data
-- =============================================================

-- Categories
CREATE POLICY "Authenticated insert categories"
  ON categories FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update categories"
  ON categories FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete categories"
  ON categories FOR DELETE
  USING (auth.role() = 'authenticated');

-- Products
CREATE POLICY "Authenticated insert products"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update products"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete products"
  ON products FOR DELETE
  USING (auth.role() = 'authenticated');

-- Wilayas
CREATE POLICY "Authenticated insert wilayas"
  ON wilayas FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update wilayas"
  ON wilayas FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete wilayas"
  ON wilayas FOR DELETE
  USING (auth.role() = 'authenticated');

-- Promo Codes
CREATE POLICY "Authenticated insert promo_codes"
  ON promo_codes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update promo_codes"
  ON promo_codes FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete promo_codes"
  ON promo_codes FOR DELETE
  USING (auth.role() = 'authenticated');

-- FAQs
CREATE POLICY "Authenticated insert faqs"
  ON faqs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update faqs"
  ON faqs FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete faqs"
  ON faqs FOR DELETE
  USING (auth.role() = 'authenticated');

-- Site Settings
CREATE POLICY "Authenticated insert site_settings"
  ON site_settings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update site_settings"
  ON site_settings FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete site_settings"
  ON site_settings FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================================
-- PART 3 — Example UPDATE queries for the SQL Editor
-- (Run these after uploading images to Storage)
-- =============================================================
-- Replace the placeholder local paths with Storage URLs:
--
-- UPDATE products
-- SET images = ARRAY[
--   'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/matelas/Mattresses.jpg',
--   'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/matelas/Mattresses-2.jpg',
--   'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/matelas/Mattresses-3.jpg'
-- ],
-- primary_image = 'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/matelas/Mattresses.jpg'
-- WHERE category_id = (SELECT id FROM categories WHERE slug = 'matelas-literie');
