
-- Add size variants for Pizza Margarita
INSERT INTO dish_variants (dish_id, name, price, is_default, display_order)
SELECT 
  d.id,
  'Pequeña (25cm)' as name,
  d.base_price - 2 as price,
  false as is_default,
  1 as display_order
FROM dishes d 
WHERE d.name = 'Pizza Margarita'
AND NOT EXISTS (
  SELECT 1 FROM dish_variants dv WHERE dv.dish_id = d.id AND dv.name = 'Pequeña (25cm)'
);

INSERT INTO dish_variants (dish_id, name, price, is_default, display_order)
SELECT 
  d.id,
  'Mediana (30cm)' as name,
  d.base_price as price,
  true as is_default,
  2 as display_order
FROM dishes d 
WHERE d.name = 'Pizza Margarita'
AND NOT EXISTS (
  SELECT 1 FROM dish_variants dv WHERE dv.dish_id = d.id AND dv.name = 'Mediana (30cm)'
);

INSERT INTO dish_variants (dish_id, name, price, is_default, display_order)
SELECT 
  d.id,
  'Grande (35cm)' as name,
  d.base_price + 3 as price,
  false as is_default,
  3 as display_order
FROM dishes d 
WHERE d.name = 'Pizza Margarita'
AND NOT EXISTS (
  SELECT 1 FROM dish_variants dv WHERE dv.dish_id = d.id AND dv.name = 'Grande (35cm)'
);
