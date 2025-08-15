
-- Crear una promoción del 20% de descuento para la Pizza Margarita
-- Asumiendo que la Pizza Margarita tiene el ID 1 (ajustar según corresponda)
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
  is_active
) VALUES (
  1, -- ID del restaurante (ajustar según corresponda)
  '20% OFF Pizza Margarita',
  'Descuento especial en nuestra clásica Pizza Margarita',
  'percentage',
  20,
  '20% OFF',
  NOW(),
  NOW() + INTERVAL '30 days',
  '[1]'::jsonb, -- ID del plato Pizza Margarita (ajustar según corresponda)
  true
);
