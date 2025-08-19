
-- Actualizar los slugs de establishment_types para que estén en español y sean SEO-friendly
UPDATE establishment_types 
SET slug = CASE 
    WHEN name = 'Restaurante' THEN 'restaurante'
    WHEN name = 'Bar' THEN 'bar'
    WHEN name = 'Cafetería' THEN 'cafeteria'
    WHEN name = 'Pizzería' THEN 'pizzeria'
    WHEN name = 'Heladería' THEN 'heladeria'
    WHEN name = 'Panadería' THEN 'panaderia'
    WHEN name = 'Pastelería' THEN 'pasteleria'
    WHEN name = 'Marisquería' THEN 'marisqueria'
    WHEN name = 'Asador' THEN 'asador'
    WHEN name = 'Taberna' THEN 'taberna'
    WHEN name = 'Gastrobar' THEN 'gastrobar'
    WHEN name = 'Cervecería' THEN 'cerveceria'
    WHEN name = 'Tapería' THEN 'taperia'
    WHEN name = 'Chiringuito' THEN 'chiringuito'
    WHEN name = 'Food Truck' THEN 'food-truck'
    WHEN name = 'Buffet' THEN 'buffet'
    WHEN name = 'Autoservicio' THEN 'autoservicio'
    WHEN name = 'Take Away' THEN 'take-away'
    WHEN name = 'Delivery' THEN 'delivery'
    WHEN name = 'Comida Rápida' THEN 'comida-rapida'
    ELSE LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), 'ñ', 'n'), 'á', 'a'))
END;
