
-- Insertar promociones activas para cada restaurante
INSERT INTO public.promotions (
  restaurant_id,
  title,
  description,
  discount_type,
  discount_value,
  discount_label,
  valid_from,
  valid_until,
  conditions,
  promo_code,
  is_active
) VALUES
-- Promoción para restaurante 1
(1, 'Menú del día especial', 'Disfruta de nuestro menú del día con descuento especial de lunes a viernes', 'percentage', 15, '15% OFF', NOW(), NOW() + INTERVAL '30 days', 'Válido de lunes a viernes. No acumulable con otras ofertas.', 'MENU15', true),

-- Promoción para restaurante 2  
(2, 'Happy Hour 2x1', 'Dos bebidas por el precio de una en nuestro happy hour', 'buy_x_get_y', NULL, '2x1 Bebidas', NOW(), NOW() + INTERVAL '15 days', 'Válido de 17:00 a 19:00h. Solo bebidas alcohólicas.', 'HAPPY2X1', true),

-- Promoción para restaurante 3
(3, 'Descuento familia', 'Descuento especial para familias con niños', 'percentage', 20, '20% OFF', NOW(), NOW() + INTERVAL '45 days', 'Válido para mesas de 4 o más personas con al menos 1 menor de 12 años.', 'FAMILIA20', true),

-- Promoción para restaurante 4
(4, 'Cena romántica', 'Menú especial para parejas con postre incluido', 'fixed_amount', 5, '5€ descuento', NOW(), NOW() + INTERVAL '20 days', 'Válido solo para cenas. Reserva previa necesaria.', 'ROMANCE5', true),

-- Promoción para restaurante 5
(5, 'Almuerzo ejecutivo', 'Menú ejecutivo con precio especial', 'percentage', 10, '10% OFF', NOW(), NOW() + INTERVAL '60 days', 'De lunes a viernes de 12:00 a 15:00h.', 'EJECUTIVO10', true);

-- Insertar 3 eventos más para La Taberna del Puerto (restaurant_id = 1)
INSERT INTO public.events (
  restaurant_id,
  name,
  description,
  event_date,
  start_time,
  end_time,
  category,
  is_free,
  entry_price,
  requires_reservation,
  available_seats,
  contact_for_reservations,
  age_restriction,
  dress_code,
  tags,
  is_active
) VALUES
(1, 'Noche de Flamenco', 'Espectáculo de flamenco auténtico con guitarra en vivo y baile tradicional. Una experiencia única para disfrutar de la cultura española.', 
 CURRENT_DATE + INTERVAL '5 days', '21:00', '23:30', 'Música y Espectáculos', false, 15.00, true, 40, 
 'Reservas: 912 345 678', 'all_ages', 'smart_casual', '["flamenco", "música en vivo", "cultura española"]', true),

(1, 'Cata de Vinos Rioja', 'Degustación de los mejores vinos de La Rioja acompañados de tapas gourmet. Incluye maridaje con jamón ibérico y quesos artesanales.', 
 CURRENT_DATE + INTERVAL '8 days', '19:30', '21:30', 'Gastronomía', false, 25.00, true, 25, 
 'Reservas: 912 345 678', 'over_18', 'casual', '["vino", "degustación", "tapas", "rioja"]', true),

(1, 'Torneo de Mus', 'Campeonato de mus tradicional con premios para los ganadores. Incluye cena ligera y bebida durante el torneo.', 
 CURRENT_DATE + INTERVAL '12 days', '18:00', '22:00', 'Entretenimiento', false, 8.00, true, 32, 
 'Reservas: 912 345 678', 'adults_only', 'casual', '["mus", "juegos", "torneo", "tradición"]', true);
