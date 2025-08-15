
-- Crear una promoción de prueba para el restaurante ID 2
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
  is_active
) VALUES (
  2,
  'Descuento 20%',
  'Descuento del 20% en platos seleccionados',
  'percentage',
  20,
  '-20%',
  NOW() - INTERVAL '1 day',  -- Válida desde ayer
  NOW() + INTERVAL '30 days', -- Válida por 30 días
  '[7, 8]',  -- IDs de platos específicos (Pizza Margherita y Pizza Quattro Stagioni)
  '[]',      -- No aplicar por secciones
  false,     -- No aplicar a todo el menú
  true       -- Promoción activa
);
