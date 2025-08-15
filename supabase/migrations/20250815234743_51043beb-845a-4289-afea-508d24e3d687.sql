
-- Primero, eliminamos el tipo de dieta "Sin lactosa" que no tiene mucho valor
DELETE FROM diet_types WHERE slug = 'lactose_free';

-- Agregamos las nuevas columnas para porcentajes y categoría
ALTER TABLE diet_types 
ADD COLUMN min_percentage INTEGER DEFAULT 0,
ADD COLUMN max_percentage INTEGER DEFAULT 100,
ADD COLUMN category VARCHAR(50);

-- Eliminamos los registros existentes para recrearlos con la nueva estructura
DELETE FROM diet_types;

-- Creamos las nuevas opciones de dieta con porcentajes
-- Vegetariano
INSERT INTO diet_types (name, slug, icon, category, min_percentage, max_percentage) VALUES
('20%+ Vegetariano', 'vegetarian_20', '🌱', 'vegetarian', 20, 49),
('50%+ Vegetariano', 'vegetarian_50', '🌿', 'vegetarian', 50, 79),
('Especializado Vegetariano', 'vegetarian_80', '🌳', 'vegetarian', 80, 100);

-- Vegano
INSERT INTO diet_types (name, slug, icon, category, min_percentage, max_percentage) VALUES
('20%+ Vegano', 'vegan_20', '🌱', 'vegan', 20, 49),
('50%+ Vegano', 'vegan_50', '🥬', 'vegan', 50, 79),
('Especializado Vegano', 'vegan_80', '🌿', 'vegan', 80, 100);

-- Sin gluten
INSERT INTO diet_types (name, slug, icon, category, min_percentage, max_percentage) VALUES
('20%+ Sin Gluten', 'gluten_free_20', '🌾', 'gluten_free', 20, 49),
('50%+ Sin Gluten', 'gluten_free_50', '🚫🌾', 'gluten_free', 50, 79),
('Especializado Sin Gluten', 'gluten_free_80', '✅🌾', 'gluten_free', 80, 100);

-- Saludable
INSERT INTO diet_types (name, slug, icon, category, min_percentage, max_percentage) VALUES
('20%+ Saludable', 'healthy_20', '💚', 'healthy', 20, 49),
('50%+ Saludable', 'healthy_50', '🥗', 'healthy', 50, 79),
('Especializado Saludable', 'healthy_80', '💪', 'healthy', 80, 100);
