ALTER TABLE products ADD COLUMN sort_order INT NOT NULL DEFAULT 0;
CREATE INDEX idx_products_category_sort ON products (category_id, sort_order);

UPDATE products p
SET sort_order = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY created_at) - 1 AS rn
  FROM products
) sub
WHERE p.id = sub.id;
