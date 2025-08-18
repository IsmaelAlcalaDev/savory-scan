
-- Primero agregar las nuevas columnas a la tabla diet_types
ALTER TABLE diet_types 
ADD COLUMN category VARCHAR(20) NOT NULL DEFAULT 'healthy',
ADD COLUMN min_percentage INTEGER NOT NULL DEFAULT 0,
ADD COLUMN max_percentage INTEGER NOT NULL DEFAULT 100;

-- Limpiar los datos existentes que no son compatibles
DELETE FROM diet_types;

-- Insertar los nuevos tipos de dieta con la estructura de porcentajes
INSERT INTO diet_types (name, slug, icon, category, min_percentage, max_percentage) VALUES
-- Categoría Vegetariano
('Opciones Vegetarianas', 'vegetarian-options', '🥬', 'vegetarian', 30, 100),
('Mayoría Vegetariana', 'mostly-vegetarian', '🌱', 'vegetarian', 70, 100),

-- Categoría Vegano
('Opciones Veganas', 'vegan-options', '🌿', 'vegan', 20, 100),
('Mayoría Vegana', 'mostly-vegan', '🥗', 'vegan', 60, 100),

-- Categoría Sin Gluten
('Opciones Sin Gluten', 'gluten-free-options', '🌾', 'gluten_free', 25, 100),
('Mayoría Sin Gluten', 'mostly-gluten-free', '🚫', 'gluten_free', 70, 100),

-- Categoría Saludable
('Opciones Saludables', 'healthy-options', '💚', 'healthy', 40, 100),
('Mayoría Saludable', 'mostly-healthy', '🥙', 'healthy', 80, 100);
