
-- Clean up old diet types and create user-friendly options
DELETE FROM diet_types;

-- Insert new diet types with intuitive names and logical percentage ranges
INSERT INTO diet_types (name, slug, category, min_percentage, max_percentage, icon) VALUES
-- Vegetarian options
('Opciones vegetarianas', 'opciones-vegetarianas', 'vegetarian', 15, 40, '🥬'),
('Menú vegetariano amplio', 'menu-vegetariano-amplio', 'vegetarian', 40, 70, '🌱'),
('Restaurante vegetariano', 'restaurante-vegetariano', 'vegetarian', 70, 100, '🌿'),

-- Vegan options  
('Opciones veganas', 'opciones-veganas', 'vegan', 10, 30, '🌱'),
('Menú vegano amplio', 'menu-vegano-amplio', 'vegan', 30, 60, '🌿'),
('Restaurante vegano', 'restaurante-vegano', 'vegan', 60, 100, '🥗'),

-- Gluten Free options
('Opciones sin gluten', 'opciones-sin-gluten', 'gluten_free', 20, 45, '🌾'),
('Menú sin gluten amplio', 'menu-sin-gluten-amplio', 'gluten_free', 45, 75, '✅'),
('Restaurante sin gluten', 'restaurante-sin-gluten', 'gluten_free', 75, 100, '🚫'),

-- Healthy options
('Opciones saludables', 'opciones-saludables', 'healthy', 25, 50, '💚'),
('Menú saludable amplio', 'menu-saludable-amplio', 'healthy', 50, 80, '🥗'),
('Restaurante saludable', 'restaurante-saludable', 'healthy', 80, 100, '🌟');
