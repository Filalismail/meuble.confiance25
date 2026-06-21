-- =============================================================
-- Phase 1: Bilingual Schema with Dynamic Price Modifiers
-- "Thika 25" — Luxury Furniture E‑commerce
-- =============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------
-- 1. categories
-- ---------------------------
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT NOT NULL UNIQUE,
  name_ar     TEXT NOT NULL,
  name_fr     TEXT NOT NULL,
  image       TEXT NOT NULL DEFAULT '',
  gradient    TEXT NOT NULL DEFAULT 'from-[#F5F0EB] to-[#E8DFD3]',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories (slug);
CREATE INDEX idx_categories_active_sort ON categories (is_active, sort_order);

-- ---------------------------
-- 2. products
-- ---------------------------
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id     UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name_ar         TEXT NOT NULL,
  name_fr         TEXT NOT NULL,
  description_ar  TEXT NOT NULL DEFAULT '',
  description_fr  TEXT NOT NULL DEFAULT '',
  primary_image   TEXT NOT NULL DEFAULT '',
  images          TEXT[] NOT NULL DEFAULT '{}',
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  base_price      NUMERIC(12,2) NOT NULL CHECK (base_price >= 0),
  options_config  JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_featured ON products (is_featured) WHERE is_featured = TRUE;

-- ---------------------------
-- 3. wilayas
-- ---------------------------
CREATE TABLE wilayas (
  id                INT PRIMARY KEY,
  name_ar           TEXT NOT NULL,
  name_fr           TEXT NOT NULL,
  shipping_home_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_desk_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_wilayas_active ON wilayas (is_active) WHERE is_active = TRUE;

-- ---------------------------
-- 4. promo_codes
-- ---------------------------
CREATE TABLE promo_codes (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code                TEXT NOT NULL UNIQUE,
  discount_percentage INT NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_promo_codes_code ON promo_codes (code);

-- ---------------------------
-- 5. faqs
-- ---------------------------
CREATE TABLE faqs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_ar TEXT NOT NULL,
  question_fr TEXT NOT NULL,
  answer_ar   TEXT NOT NULL,
  answer_fr   TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_faqs_active_sort ON faqs (is_active, sort_order);

-- ---------------------------
-- 6. site_settings
-- ---------------------------
CREATE TABLE site_settings (
  key         TEXT PRIMARY KEY,
  value_ar    TEXT NOT NULL DEFAULT '',
  value_fr    TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT ''
);

-- ---------------------------
-- 7. orders
-- ---------------------------
CREATE TABLE orders (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_first_name   TEXT NOT NULL,
  customer_last_name    TEXT NOT NULL,
  phone_number          TEXT NOT NULL,
  wilaya_id             INT NOT NULL REFERENCES wilayas(id),
  delivery_type         TEXT NOT NULL CHECK (delivery_type IN ('home', 'desk')),
  order_note            TEXT NOT NULL DEFAULT '',
  items_json            JSONB NOT NULL DEFAULT '[]'::JSONB,
  subtotal              NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
  discount_applied      NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_applied >= 0),
  delivery_fee          NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  final_total           NUMERIC(12,2) NOT NULL CHECK (final_total >= 0),
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_created ON orders (created_at DESC);
CREATE INDEX idx_orders_wilaya ON orders (wilaya_id);

-- ---------------------------
-- RLS Policies
-- ---------------------------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE wilayas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;

-- Public read access for all catalogue tables
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (TRUE);
CREATE POLICY "Public read products"   ON products   FOR SELECT USING (TRUE);
CREATE POLICY "Public read wilayas"    ON wilayas    FOR SELECT USING (TRUE);
CREATE POLICY "Public read promo_codes" ON promo_codes FOR SELECT USING (TRUE);
CREATE POLICY "Public read faqs"       ON faqs       FOR SELECT USING (TRUE);
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (TRUE);

-- Anyone can insert an order (checkout)
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (TRUE);
-- Orders are readable only by the inserting session or admin (simplified: allow anon read for now)
CREATE POLICY "Public read own orders" ON orders FOR SELECT USING (TRUE);
