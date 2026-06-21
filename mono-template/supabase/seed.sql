-- =============================================================
-- Phase 2: Seed Data — "Thika 25"
-- Run this AFTER 001_initial_schema.sql
-- =============================================================

-- ---------------------------
-- 1. Categories
-- ---------------------------
INSERT INTO categories (slug, name_ar, name_fr, image, gradient, sort_order) VALUES
  ('chambres-a-coucher-principales', 'غرف نوم أساسية', 'Chambres à Coucher Principales', 'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/main-bedroom/main-bedroom.jpg', 'from-[#F5F0EB] to-[#E8DFD3]', 1),
  ('chambres-a-coucher-enfants',     'غرف نوم أطفال',   'Chambres à Coucher Enfants',     'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/kids-bedroom/kids-bedroom.jpg', 'from-[#EDF1F5] to-[#D6E0E8]', 2),
  ('salons',                          'صالونات',         'Salons',                          'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salons/salons.jpg', 'from-[#F0EDE8] to-[#DFD9D0]', 3),
  ('salle-a-manger',                  'طاولة الأكل',     'Salle à manger',                  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salle-a-manger/salle-a-manger.jpg', 'from-[#EFE7DE] to-[#DACCC0]', 4),
  ('matelas-literie',                 'أفرشة',           'Matelas & Literie',               'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/matelas/matelas.jpg', 'from-[#F4F0ED] to-[#E3DCD4]', 5),
  ('horloges-murales',                'ساعات حائط',      'Horloges Murales',                'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/horloges/horloges.jpg', 'from-[#E8E6E4] to-[#D2CEC8]', 6),
  ('armoires-dressings',              'الخزائن',          'Armoires & Dressings',            'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/armoires/armoires.jpg', 'from-[#EFECE7] to-[#DBD4CA]', 7);

-- ---------------------------
-- 2. Products with options_config JSONB
-- ---------------------------

-- Helper: base_price = lowest option price, price_addon = option price - base_price
-- Group naming is fully dynamic in the JSONB (label_ar / label_fr / options[])

-- === Chambres à Coucher Principales ===
WITH cat AS (SELECT id FROM categories WHERE slug = 'chambres-a-coucher-principales')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'سرير كينغ فاخر', 'Lit King Size Luxe',
  'سرير كينغ سايز من الخشب الصلب مع لوح رأسي مبطن. تشطيب فاخر وراحة مطلقة لنوم هانئ.',
  'Lit king size en bois massif avec tête de lit capitonnée. Finition premium, confort absolu pour vos nuits.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/main-bedroom/main-bedroom.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/main-bedroom/main-bedroom.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/main-bedroom/main-bedroom.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/main-bedroom/main-bedroom.jpg'],
  45000,
  '{
    "dimensions": {
      "label_ar": "الأبعاد",
      "label_fr": "Dimensions",
      "options": [
        {"val": "180x200", "price_addon": 0},
        {"val": "200x200", "price_addon": 6750}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'chambres-a-coucher-principales')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'خزانة كلاسيكية', 'Armoire Classique',
  'خزانة 3 أبواب من الخشب الصلب مع مرآة مدمجة. تصميم كلاسيكي خالد.',
  'Armoire 3 portes en bois massif avec miroir intégré. Design classique intemporel.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/armoires/armoires.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/armoires/armoires.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/armoires/armoires.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/armoires/armoires.jpg'],
  38000,
  '{
    "finish": {
      "label_ar": "اللون",
      "label_fr": "Finition",
      "options": [
        {"name_ar": "أبيض", "name_fr": "Blanc", "price_addon": 0},
        {"name_ar": "بلوط", "name_fr": "Chêne", "price_addon": 5700},
        {"name_ar": "جوز", "name_fr": "Noyer", "price_addon": 11400}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'chambres-a-coucher-principales')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'طاولة جانبية', 'Table de Chevet',
  'طاولة جانبية بسيطة مع درج. مثالية بجانب سريرك.',
  'Table de chevet minimaliste avec tiroir. Parfaite pour accompagner votre lit.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/main-bedroom/main-bedroom.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/main-bedroom/main-bedroom.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/main-bedroom/main-bedroom.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/main-bedroom/main-bedroom.jpg'],
  12000,
  '{
    "finish": {
      "label_ar": "اللون",
      "label_fr": "Finition",
      "options": [
        {"name_ar": "أبيض", "name_fr": "Blanc", "price_addon": 0},
        {"name_ar": "بلوط فاتح", "name_fr": "Chêne clair", "price_addon": 1800}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'chambres-a-coucher-principales')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'كومود عصري', 'Commode Moderne',
  'كومود 4 أدراج بتصميم أنيق. مثالية لترتيب ملابسك بأناقة.',
  'Commode 4 tiroirs au design épuré. Idéale pour ranger vos vêtements avec style.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/main-bedroom/main-bedroom.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/main-bedroom/main-bedroom.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/main-bedroom/main-bedroom.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/main-bedroom/main-bedroom.jpg'],
  22000,
  '{
    "finish": {
      "label_ar": "اللون",
      "label_fr": "Finition",
      "options": [
        {"name_ar": "أبيض مطفي", "name_fr": "Blanc mat", "price_addon": 0},
        {"name_ar": "رمادي", "name_fr": "Gris", "price_addon": 3300}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'chambres-a-coucher-principales')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'مرآة أرضية', 'Miroir Sur Pied',
  'مرآة أرضية كبيرة بإطار خشبي. تضفي إضاءة على غرفتك.',
  'Grand miroir sur pied avec cadre en bois. Apporte de la lumière à votre chambre.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/main-bedroom/main-bedroom.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/main-bedroom/main-bedroom.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/main-bedroom/main-bedroom.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/main-bedroom/main-bedroom.jpg'],
  15000,
  '{
    "finish": {
      "label_ar": "لون الإطار",
      "label_fr": "Teinte cadre",
      "options": [
        {"name_ar": "خشب فاتح", "name_fr": "Bois clair", "price_addon": 0},
        {"name_ar": "خشب غامق", "name_fr": "Bois foncé", "price_addon": 2250}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'chambres-a-coucher-principales')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'طاولة زينة أنيقة', 'Coiffeuse Élégante',
  'طاولة زينة بمرآة مضيئة وتخزين مدمج. الفخامة في كل يوم.',
  'Coiffeuse avec miroir lumineux et rangements intégrés. Le luxe au quotidien.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/main-bedroom/main-bedroom.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/main-bedroom/main-bedroom.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/main-bedroom/main-bedroom.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/main-bedroom/main-bedroom.jpg'],
  28000,
  '{
    "finish": {
      "label_ar": "اللون",
      "label_fr": "Finition",
      "options": [
        {"name_ar": "بيضاء", "name_fr": "Blanche", "price_addon": 0},
        {"name_ar": "ذهبية", "name_fr": "Dorée", "price_addon": 4200}
      ]
    }
  }'::JSONB);

-- === Chambres à Coucher Enfants ===
WITH cat AS (SELECT id FROM categories WHERE slug = 'chambres-a-coucher-enfants')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'سرير طابقين', 'Lit Superposé',
  'سرير طابقين من الخشب الصلب آمن. مثالي لطفلين.',
  'Lit superposé en bois massif sécurisé. Parfait pour deux enfants.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/kids-bedroom/kids-bedroom.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/kids-bedroom/kids-bedroom.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/kids-bedroom/kids-bedroom.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/kids-bedroom/kids-bedroom.jpg'],
  32000,
  '{
    "finish": {
      "label_ar": "اللون",
      "label_fr": "Finition",
      "options": [
        {"name_ar": "خشب طبيعي", "name_fr": "Bois naturel", "price_addon": 0},
        {"name_ar": "أبيض", "name_fr": "Blanc", "price_addon": 4800},
        {"name_ar": "أزرق", "name_fr": "Bleu", "price_addon": 9600}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'chambres-a-coucher-enfants')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'مكتب طفل', 'Bureau Enfant',
  'مكتب مريح مع تخزين للأطفال. يعزز التركيز.',
  'Bureau ergonomique avec rangements pour enfants. Favorise la concentration.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/kids-bedroom/kids-bedroom.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/kids-bedroom/kids-bedroom.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/kids-bedroom/kids-bedroom.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/kids-bedroom/kids-bedroom.jpg'],
  18000,
  '{
    "finish": {
      "label_ar": "اللون",
      "label_fr": "Finition",
      "options": [
        {"name_ar": "أبيض", "name_fr": "Blanc", "price_addon": 0},
        {"name_ar": "أزرق", "name_fr": "Bleu", "price_addon": 2700},
        {"name_ar": "وردي", "name_fr": "Rose", "price_addon": 5400}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'chambres-a-coucher-enfants')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'خزانة أطفال', 'Armoire Enfant',
  'خزانة بابين مرحة وملونة لغرفة أطفالك.',
  'Armoire 2 portes ludique et colorée pour la chambre de vos enfants.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/kids-bedroom/kids-bedroom.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/kids-bedroom/kids-bedroom.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/kids-bedroom/kids-bedroom.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/kids-bedroom/kids-bedroom.jpg'],
  25000,
  '{
    "finish": {
      "label_ar": "اللون",
      "label_fr": "Finition",
      "options": [
        {"name_ar": "أبيض", "name_fr": "Blanc", "price_addon": 0},
        {"name_ar": "أزرق سماوي", "name_fr": "Bleu ciel", "price_addon": 3750}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'chambres-a-coucher-enfants')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'رفوف ترفيهية', 'Étagère Ludique',
  'رفوف قابلة للتعديل على شكل لعبة. رتب الألعاب والكتب بمرح.',
  'Étagère modulable en forme de jeu. Rangez jouets et livres avec amusement.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/kids-bedroom/kids-bedroom.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/kids-bedroom/kids-bedroom.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/kids-bedroom/kids-bedroom.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/kids-bedroom/kids-bedroom.jpg'],
  14000,
  '{
    "finish": {
      "label_ar": "النمط",
      "label_fr": "Style",
      "options": [
        {"name_ar": "متعدد الألوان", "name_fr": "Multicolore", "price_addon": 0},
        {"name_ar": "خشب + أبيض", "name_fr": "Bois + Blanc", "price_addon": 2100}
      ]
    }
  }'::JSONB);

-- === Salons ===
WITH cat AS (SELECT id FROM categories WHERE slug = 'salons')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'أريكة 3 مقاعد', 'Canapé 3 Places',
  'أريكة 3 مقاعد من القماش الفاخر. مقاعد مريحة وتصميم عصري.',
  'Canapé 3 places en tissu premium. Assises confortables et design contemporain.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salons/salons.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salons/salons.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salons/salons.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salons/salons.jpg'],
  55000,
  '{
    "color": {
      "label_ar": "اللون",
      "label_fr": "Couleur",
      "options": [
        {"name_ar": "رمادي فاتح", "name_fr": "Gris clair", "price_addon": 0},
        {"name_ar": "بيج", "name_fr": "Beige", "price_addon": 8250},
        {"name_ar": "أزرق ليلي", "name_fr": "Bleu nuit", "price_addon": 16500}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'salons')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'طاولة وسط', 'Table Basse',
  'طاولة وسط بتصميم من الزجاج المقوى والمعدن. أناقة وعصرية.',
  'Table basse design en verre trempé et métal. Élégance et modernité.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salons/salons.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salons/salons.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salons/salons.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salons/salons.jpg'],
  25000,
  '{
    "finish": {
      "label_ar": "لون الإطار",
      "label_fr": "Finition métal",
      "options": [
        {"name_ar": "أسود", "name_fr": "Noir", "price_addon": 0},
        {"name_ar": "ذهبي", "name_fr": "Doré", "price_addon": 3750},
        {"name_ar": "فضي", "name_fr": "Argent", "price_addon": 7500}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'salons')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'كرسي نادي', 'Fauteuil Club',
  'كرسي نادي من الجلد الصناعي. راحة وأناقة رجعية.',
  'Fauteuil club en cuir synthétique. Confort et style rétro chic.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salons/salons.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salons/salons.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salons/salons.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salons/salons.jpg'],
  22000,
  '{
    "color": {
      "label_ar": "اللون",
      "label_fr": "Couleur",
      "options": [
        {"name_ar": "بني", "name_fr": "Marron", "price_addon": 0},
        {"name_ar": "أسود", "name_fr": "Noir", "price_addon": 3300},
        {"name_ar": "كريمي", "name_fr": "Crème", "price_addon": 6600}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'salons')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'مريديان', 'Méridienne',
  'مريديان بتصميم أنيق للاسترخاء. مثالية للقراءة أو القيلولة.',
  'Méridienne design pour se détendre. Parfaite pour lire ou sieste.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salons/salons.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salons/salons.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salons/salons.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salons/salons.jpg'],
  30000,
  '{
    "color": {
      "label_ar": "اللون",
      "label_fr": "Couleur",
      "options": [
        {"name_ar": "بيج", "name_fr": "Beige", "price_addon": 0},
        {"name_ar": "رمادي", "name_fr": "Gris", "price_addon": 4500},
        {"name_ar": "أخضر", "name_fr": "Vert", "price_addon": 9000}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'salons')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'مكتبة', 'Bibliothèque',
  'مكتبة من الخشب الصلب 5 أرفف. رتب كتبك وديكوراتك.',
  'Bibliothèque en bois massif 5 étagères. Rangez livres et décorations.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salons/salons.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salons/salons.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salons/salons.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salons/salons.jpg'],
  40000,
  '{
    "finish": {
      "label_ar": "نوع الخشب",
      "label_fr": "Type de bois",
      "options": [
        {"name_ar": "بلوط", "name_fr": "Chêne", "price_addon": 0},
        {"name_ar": "جوز", "name_fr": "Noyer", "price_addon": 6000},
        {"name_ar": "أبيض", "name_fr": "Blanc", "price_addon": 12000}
      ]
    }
  }'::JSONB);

-- === Salle à manger ===
WITH cat AS (SELECT id FROM categories WHERE slug = 'salle-a-manger')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'طاولة مستديرة 6 أشخاص', 'Table Ronde 6 Pers.',
  'طاولة مستديرة قابلة للتمديد من الخشب الصلب. تتسع لـ 6 أشخاص.',
  'Table ronde extensible en bois massif. Jusqu''à 6 convives.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salle-a-manger/salle-a-manger.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salle-a-manger/salle-a-manger.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salle-a-manger/salle-a-manger.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salle-a-manger/salle-a-manger.jpg'],
  42000,
  '{
    "material": {
      "label_ar": "المادة",
      "label_fr": "Matériau",
      "options": [
        {"name_ar": "خشب صلب", "name_fr": "Bois massif", "price_addon": 0},
        {"name_ar": "زجاج", "name_fr": "Verre", "price_addon": 6300}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'salle-a-manger')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'كرسي طاولة الأكل', 'Chaise de Salle à Manger',
  'كرسي أنيق ومريح لغرفة الطعام. متوفر كطقم 4 قطع.',
  'Chaise élégante et confortable pour votre salle à manger. Lot de 4 disponible.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salle-a-manger/salle-a-manger.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salle-a-manger/salle-a-manger.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salle-a-manger/salle-a-manger.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salle-a-manger/salle-a-manger.jpg'],
  8500,
  '{
    "finish": {
      "label_ar": "اللون",
      "label_fr": "Finition",
      "options": [
        {"name_ar": "بيضاء", "name_fr": "Blanche", "price_addon": 0},
        {"name_ar": "سوداء", "name_fr": "Noire", "price_addon": 1275},
        {"name_ar": "خشب", "name_fr": "Bois", "price_addon": 2550}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'salle-a-manger')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'بوفيه منخفض', 'Buffet Bas',
  'بوفيه منخفض بابين مع تخزين. مثالي للأواني ومفارش المائدة.',
  'Buffet bas 2 portes avec rangements. Idéal pour vaisselle et linge de table.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salle-a-manger/salle-a-manger.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salle-a-manger/salle-a-manger.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salle-a-manger/salle-a-manger.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salle-a-manger/salle-a-manger.jpg'],
  35000,
  '{
    "finish": {
      "label_ar": "نوع الخشب",
      "label_fr": "Type de bois",
      "options": [
        {"name_ar": "بلوط", "name_fr": "Chêne", "price_addon": 0},
        {"name_ar": "أبيض", "name_fr": "Blanc", "price_addon": 5250}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'salle-a-manger')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'واجهة زجاجية', 'Vitrine',
  'واجهة زجاجية خشبية بأبواب زجاجية. اعرض أطباقك الجميلة.',
  'Vitrine en bois avec portes vitrées. Exposez votre belle vaisselle.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salle-a-manger/salle-a-manger.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salle-a-manger/salle-a-manger.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salle-a-manger/salle-a-manger.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/salle-a-manger/salle-a-manger.jpg'],
  38000,
  '{
    "finish": {
      "label_ar": "نوع الخشب",
      "label_fr": "Type de bois",
      "options": [
        {"name_ar": "بلوط", "name_fr": "Chêne", "price_addon": 0},
        {"name_ar": "جوز", "name_fr": "Noyer", "price_addon": 5700}
      ]
    }
  }'::JSONB);

-- === Matelas & Literie ===
WITH cat AS (SELECT id FROM categories WHERE slug = 'matelas-literie')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'فراش سميك 25 سم', 'Matelas Épais 25cm',
  'فراش 25 سم من إسفنج الذاكرة. دعم مثالي وراحة مطلقة.',
  'Matelas 25cm en mousse à mémoire de forme. Soutien parfait et confort absolu.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/matelas/matelas.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/matelas/matelas.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/matelas/matelas.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/matelas/matelas.jpg'],
  28000,
  '{
    "dimensions": {
      "label_ar": "المقاس",
      "label_fr": "Dimensions",
      "options": [
        {"val": "90x190", "price_addon": 0},
        {"val": "140x190", "price_addon": 4200},
        {"val": "160x200", "price_addon": 8400}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'matelas-literie')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'وسادة طبية', 'Oreiller Ergonomique',
  'وسادة طبية من إسفنج الذاكرة. لنوم خالٍ من الألم.',
  'Oreiller ergonomique en mousse à mémoire de forme. Pour des nuits sans douleur.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/matelas/matelas.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/matelas/matelas.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/matelas/matelas.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/matelas/matelas.jpg'],
  4500,
  '{
    "dimensions": {
      "label_ar": "المقاس",
      "label_fr": "Taille",
      "options": [
        {"name_ar": "عادي", "name_fr": "Standard", "price_addon": 0},
        {"name_ar": "كبير", "name_fr": "Grand", "price_addon": 675}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'matelas-literie')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'لحاف دافئ', 'Couette Chaude',
  'لحاف من الألياف الدقيقة دافئ جداً. خفيف ودافئ لفصل الشتاء.',
  'Couette en microfibre ultra-chaude. Légèreté et chaleur pour l''hiver.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/matelas/matelas.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/matelas/matelas.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/matelas/matelas.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/matelas/matelas.jpg'],
  12000,
  '{
    "dimensions": {
      "label_ar": "المقاس",
      "label_fr": "Taille",
      "options": [
        {"name_ar": "مزدوج", "name_fr": "Double", "price_addon": 0},
        {"name_ar": "كوين", "name_fr": "Queen", "price_addon": 1800},
        {"name_ar": "كينغ", "name_fr": "King", "price_addon": 3600}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'matelas-literie')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'غطاء فراش', 'Protège-Matelas',
  'غطاء فراش مقاوم للماء وقابل للتنفس. نظافة ومتانة.',
  'Protège-matelas imperméable et respirant. Hygiène et durabilité.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/matelas/matelas.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/matelas/matelas.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/matelas/matelas.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/matelas/matelas.jpg'],
  6000,
  '{
    "dimensions": {
      "label_ar": "المقاس",
      "label_fr": "Dimensions",
      "options": [
        {"val": "90x190", "price_addon": 0},
        {"val": "140x190", "price_addon": 900},
        {"val": "160x200", "price_addon": 1800}
      ]
    }
  }'::JSONB);

-- === Horloges Murales ===
WITH cat AS (SELECT id FROM categories WHERE slug = 'horloges-murales')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'ساعة حائط تصميم', 'Horloge Murale Design',
  'ساعة حائط بتصميم عصري من المعدن. لإطلالة عصرية في منزلك.',
  'Horloge murale design en métal. Style contemporain pour votre intérieur.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/horloges/horloges.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/horloges/horloges.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/horloges/horloges.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/horloges/horloges.jpg'],
  15000,
  '{
    "finish": {
      "label_ar": "اللون",
      "label_fr": "Couleur",
      "options": [
        {"name_ar": "سوداء", "name_fr": "Noire", "price_addon": 0},
        {"name_ar": "ذهبية", "name_fr": "Dorée", "price_addon": 2250},
        {"name_ar": "فضية", "name_fr": "Argentée", "price_addon": 4500}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'horloges-murales')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'ساعة كلاسيكية', 'Horloge Vintage',
  'ساعة كلاسيكية بندولية. سحر القديم في منزلك.',
  'Horloge vintage à balancier. Le charme de l''ancien dans votre maison.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/horloges/horloges.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/horloges/horloges.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/horloges/horloges.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/horloges/horloges.jpg'],
  12000,
  '{
    "finish": {
      "label_ar": "لون الخشب",
      "label_fr": "Teinte bois",
      "options": [
        {"name_ar": "خشب غامق", "name_fr": "Bois foncé", "price_addon": 0},
        {"name_ar": "خشب فاتح", "name_fr": "Bois clair", "price_addon": 1800}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'horloges-murales')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'ساعة عصرية', 'Horloge Moderne',
  'ساعة حائط بسيطة. نقاء الخطوط وأناقة هادئة.',
  'Horloge murale minimaliste. Pureté des lignes et élégance discrète.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/horloges/horloges.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/horloges/horloges.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/horloges/horloges.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/horloges/horloges.jpg'],
  18000,
  '{
    "finish": {
      "label_ar": "اللون",
      "label_fr": "Couleur",
      "options": [
        {"name_ar": "بيضاء", "name_fr": "Blanche", "price_addon": 0},
        {"name_ar": "سوداء", "name_fr": "Noire", "price_addon": 2700}
      ]
    }
  }'::JSONB);

-- === Armoires & Dressings ===
WITH cat AS (SELECT id FROM categories WHERE slug = 'armoires-dressings')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'خزانة 3 أبواب', 'Armoire 3 Portes',
  'خزانة 3 أبواب منزلقة من الخشب الصلب. سعة تخزين كبيرة.',
  'Armoire 3 portes coulissantes en bois massif. Grande capacité de rangement.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/armoires/armoires.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/armoires/armoires.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/armoires/armoires.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/armoires/armoires.jpg'],
  45000,
  '{
    "finish": {
      "label_ar": "اللون",
      "label_fr": "Finition",
      "options": [
        {"name_ar": "أبيض", "name_fr": "Blanc", "price_addon": 0},
        {"name_ar": "بلوط", "name_fr": "Chêne", "price_addon": 6750},
        {"name_ar": "رمادي", "name_fr": "Gris", "price_addon": 13500}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'armoires-dressings')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'غرفة ملابس كاملة', 'Dressing Complet',
  'غرفة ملابس كاملة حسب الطلب مع أرفف وشماعات وأدراج.',
  'Dressing complet sur mesure avec étagères, penderies et tiroirs.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/armoires/armoires.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/armoires/armoires.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/armoires/armoires.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/armoires/armoires.jpg'],
  85000,
  '{
    "dimensions": {
      "label_ar": "المقاس",
      "label_fr": "Taille",
      "options": [
        {"name_ar": "عادي", "name_fr": "Standard", "price_addon": 0},
        {"name_ar": "كبير", "name_fr": "Grand", "price_addon": 12750}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'armoires-dressings')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'خزانة ذات أدراج', 'Commode 5 Tiroirs',
  'خزانة 5 أدراج بتصميم عصري. تخزين أنيق لملابسك.',
  'Commode 5 tiroirs design moderne. Rangement élégant pour vos vêtements.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/armoires/armoires.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/armoires/armoires.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/armoires/armoires.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/armoires/armoires.jpg'],
  28000,
  '{
    "finish": {
      "label_ar": "اللون",
      "label_fr": "Finition",
      "options": [
        {"name_ar": "أبيض", "name_fr": "Blanc", "price_addon": 0},
        {"name_ar": "بلوط", "name_fr": "Chêne", "price_addon": 4200}
      ]
    }
  }'::JSONB);

WITH cat AS (SELECT id FROM categories WHERE slug = 'armoires-dressings')
INSERT INTO products (category_id, name_ar, name_fr, description_ar, description_fr, primary_image, images, base_price, options_config) VALUES
((SELECT id FROM cat), 'معلقة ملابس', 'Penderie Suspendue',
  'معلقة ملابس معدنية. حل عملي للمساحات الصغيرة.',
  'Penderie suspendue en métal. Solution pratique pour petits espaces.',
  'https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/armoires/armoires.jpg',
  ARRAY['https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/armoires/armoires.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/armoires/armoires.jpg','https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public/armoires/armoires.jpg'],
  18000,
  '{
    "finish": {
      "label_ar": "اللون",
      "label_fr": "Couleur",
      "options": [
        {"name_ar": "سوداء", "name_fr": "Noire", "price_addon": 0},
        {"name_ar": "بيضاء", "name_fr": "Blanche", "price_addon": 2700}
      ]
    }
  }'::JSONB);

-- ---------------------------
-- 3. Wilayas (58 Algerian wilayas)
-- ---------------------------
INSERT INTO wilayas (id, name_ar, name_fr, shipping_home_fee, shipping_desk_fee) VALUES
(1,  'أدرار',        'Adrar',            800, 0),
(2,  'الشلف',        'Chlef',            800, 0),
(3,  'الأغواط',      'Laghouat',         800, 0),
(4,  'أم البواقي',   'Oum El Bouaghi',   800, 0),
(5,  'باتنة',        'Batna',            800, 0),
(6,  'بجاية',        'Béjaïa',           800, 0),
(7,  'بسكرة',        'Biskra',           800, 0),
(8,  'بشار',         'Béchar',           800, 0),
(9,  'البليدة',      'Blida',            800, 0),
(10, 'البويرة',      'Bouira',           800, 0),
(11, 'تمنراست',      'Tamanrasset',      800, 0),
(12, 'تبسة',         'Tébessa',          800, 0),
(13, 'تلمسان',       'Tlemcen',          800, 0),
(14, 'تيارت',        'Tiaret',           800, 0),
(15, 'تيزي وزو',     'Tizi Ouzou',       800, 0),
(16, 'الجزائر',      'Alger',            800, 0),
(17, 'الجلفة',       'Djelfa',           800, 0),
(18, 'جيجل',         'Jijel',            800, 0),
(19, 'سطيف',         'Sétif',            800, 0),
(20, 'سعيدة',        'Saïda',            800, 0),
(21, 'سكيكدة',       'Skikda',           800, 0),
(22, 'سيدي بلعباس',  'Sidi Bel Abbès',   800, 0),
(23, 'عنابة',        'Annaba',           800, 0),
(24, 'قالمة',        'Guelma',           800, 0),
(25, 'قسنطينة',      'Constantine',      800, 0),
(26, 'المدية',       'Médéa',            800, 0),
(27, 'مستغانم',      'Mostaganem',       800, 0),
(28, 'المسيلة',      'M''Sila',          800, 0),
(29, 'معسكر',        'Mascara',          800, 0),
(30, 'ورقلة',        'Ouargla',          800, 0),
(31, 'وهران',        'Oran',             800, 0),
(32, 'البيض',        'El Bayadh',        800, 0),
(33, 'إليزي',        'Illizi',           800, 0),
(34, 'برج بوعريريج', 'Bordj Bou Arréridj',800, 0),
(35, 'بومرداس',      'Boumerdès',        800, 0),
(36, 'الطارف',       'El Tarf',          800, 0),
(37, 'تندوف',        'Tindouf',          800, 0),
(38, 'تسمسيلت',      'Tissemsilt',       800, 0),
(39, 'الوادي',       'El Oued',          800, 0),
(40, 'خنشلة',        'Khenchela',        800, 0),
(41, 'سوق أهراس',    'Souk Ahras',       800, 0),
(42, 'تيبازة',       'Tipaza',           800, 0),
(43, 'ميلة',         'Mila',             800, 0),
(44, 'عين الدفلى',   'Aïn Defla',        800, 0),
(45, 'النعامة',      'Naâma',            800, 0),
(46, 'عين تموشنت',   'Aïn Témouchent',   800, 0),
(47, 'غرداية',       'Ghardaïa',         800, 0),
(48, 'غليزان',       'Relizane',         800, 0),
(49, 'تيميمون',      'Timimoun',         800, 0),
(50, 'برج باجي مختار','Bordj Badji Mokhtar',800, 0),
(51, 'أولاد جلال',   'Ouled Djellal',    800, 0),
(52, 'بني عباس',     'Béni Abbès',       800, 0),
(53, 'عين صالح',     'In Salah',         800, 0),
(54, 'عين قزام',     'In Guezzam',       800, 0),
(55, 'تقرت',         'Touggourt',        800, 0),
(56, 'جانت',         'Djanet',           800, 0),
(57, 'المغير',       'El M''Ghair',      800, 0),
(58, 'المنيعة',      'El Meniaa',        800, 0);

-- ---------------------------
-- 4. Promo Codes
-- ---------------------------
INSERT INTO promo_codes (code, discount_percentage, is_active) VALUES
  ('77', 10, TRUE);

-- ---------------------------
-- 5. FAQs
-- ---------------------------
INSERT INTO faqs (question_ar, question_fr, answer_ar, answer_fr, sort_order) VALUES
  ('ما هي مدة التوصيل؟', 'Quels sont vos délais de livraison ?',
   'نقوم بالتوصيل في غضون 5 إلى 10 أيام عمل في جميع أنحاء الجزائر. يتم إرسال خدمة التتبع عند الشحن.',
   'Nous livrons sous 5 à 10 jours ouvrés dans toute l''Algérie. Un service de suivi vous est envoyé dès l''expédition.',
   1),
  ('هل تقدمون توصيل مجاني؟', 'Proposez-vous la livraison gratuite ?',
   'نعم، التوصيل مجاني للطلبات التي تزيد عن 50,000 دينار جزائري.',
   'Oui, la livraison est gratuite pour toute commande supérieure à 50 000 DA.',
   2),
  ('هل يمكنني إرجاع المنتج؟', 'Puis-je retourner un produit ?',
   'لديك 14 يومًا لإرجاع المنتج بحالة جيدة. رسوم الإرجاع مجانية.',
   'Vous disposez de 14 jours pour retourner un produit en parfait état. Les frais de retour sont offerts.',
   3),
  ('ما هي طرق الدفع المتاحة؟', 'Quels moyens de paiement acceptez-vous ?',
   'نقبل الدفع بالبطاقة البنكية والتحويل البنكي والدفع عند الاستلام.',
   'Nous acceptons les paiements par carte bancaire, virement bancaire et paiement à la livraison.',
   4),
  ('هل أنتم موجودون في قسنطينة؟', 'Êtes-vous basés à Constantine ?',
   'نعم، صالة العرض الرئيسية لدينا في قسنطينة. يمكنكم زيارتنا بموعد مسبق.',
   'Oui, notre showroom principal se trouve à Constantine. Vous pouvez nous rendre visite sur rendez-vous.',
   5);

-- ---------------------------
-- 6. Site Settings
-- ---------------------------
INSERT INTO site_settings (key, value_ar, value_fr, description) VALUES
  ('shop_name', 'ثقة 25', 'Thika 25', 'Nom de la boutique / اسم المتجر'),
  ('shop_tagline', 'أثاث فاخر للمنزل العصري', 'Ameublement de luxe pour la maison moderne', 'Slogan / شعار'),
  ('contact_phone', '0550 00 00 00', '0550 00 00 00', 'Téléphone / رقم الهاتف'),
  ('contact_whatsapp', '213550000000', '213550000000', 'WhatsApp number / رقم الواتساب'),
  ('delivery_threshold', '50000', '50000', 'Seuil livraison gratuite / حد التوصيل المجاني'),
  ('delivery_threshold_label_ar', 'توصيل مجاني للطلبات فوق 50,000 د.ج', 'Livraison gratuite dès 50 000 DA', 'Texte seuil / نص الحد');
