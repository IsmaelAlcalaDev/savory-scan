
-- Aplicar promoción a Pizza Margherita
-- Primero obtenemos el ID de la Pizza Margherita
WITH pizza_margherita AS (
  SELECT d.id as dish_id, r.id as restaurant_id
  FROM dishes d
  JOIN restaurants r ON r.id = d.restaurant_id
  WHERE d.name = 'Pizza Margherita' 
  AND r.slug = 'pizzeria-bella-napoli'
  LIMIT 1
)
INSERT INTO promotions (
  restaurant_id,
  title,
  description,
  discount_type,
  discount_value,
  discount_label,
  valid_from,
  valid_until,
  applicable_dishes,
  applicable_sections,
  applies_to_entire_menu,
  is_active,
  conditions
)
SELECT 
  pm.restaurant_id,
  'Oferta Especial Margherita',
  'Pizza Margherita con 20% de descuento. ¡La clásica italiana a precio especial!',
  'percentage'::discount_type,
  20.00,
  '20% OFF',
  '2024-01-01 00:00:00'::timestamp with time zone,
  '2024-12-31 23:59:59'::timestamp with time zone,
  jsonb_build_array(pm.dish_id),
  '[]'::jsonb,
  false,
  true,
  'Válido hasta fin de año. No acumulable con otras ofertas.'
FROM pizza_margherita pm;
