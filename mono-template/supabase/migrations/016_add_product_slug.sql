ALTER TABLE products ADD COLUMN slug TEXT;

UPDATE products SET slug = lower(regexp_replace(regexp_replace(regexp_replace(
  translate(name_fr,
    'àâäåæçèéêëìíîïòóôöøùúüÀÂÄÅÆÇÈÉÊËÌÍÎÏÒÓÔÖØÙÚÜ',
    'aaaaaaceeeeiiiioooooouuuAAAAAACEEEEIIIIOOOOOOUUU'),
  '[^a-zA-Z0-9]+', '-', 'g'),
  '^-|-$', '', 'g'),
  '^-|-$', '', 'g'));

ALTER TABLE products ALTER COLUMN slug SET NOT NULL;
ALTER TABLE products ADD CONSTRAINT products_slug_key UNIQUE (slug);
CREATE INDEX idx_products_slug ON products (slug);

CREATE TABLE product_slug_redirects (
  old_slug     TEXT PRIMARY KEY,
  new_slug     TEXT NOT NULL,
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_redirects_new_slug ON product_slug_redirects(new_slug);
CREATE INDEX idx_redirects_product_id ON product_slug_redirects(product_id);
