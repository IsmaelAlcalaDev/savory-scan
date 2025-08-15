
-- First, let's check if the diet_types table exists and add missing columns
-- Add the missing columns to diet_types table
ALTER TABLE diet_types 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'healthy',
ADD COLUMN IF NOT EXISTS min_percentage INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_percentage INTEGER NOT NULL DEFAULT 100;

-- Update existing records with appropriate categories based on their names
UPDATE diet_types 
SET category = CASE 
  WHEN name ILIKE '%vegetarian%' OR name ILIKE '%vegetariano%' THEN 'vegetarian'
  WHEN name ILIKE '%vegan%' OR name ILIKE '%vegano%' THEN 'vegan'
  WHEN name ILIKE '%gluten%' OR name ILIKE '%sin gluten%' THEN 'gluten_free'
  ELSE 'healthy'
END;

-- Insert some sample diet types if the table is empty
INSERT INTO diet_types (name, slug, category, min_percentage, max_percentage, icon) VALUES
('Vegetariano Básico', 'vegetariano-basico', 'vegetarian', 25, 49, '🥬'),
('Vegetariano Avanzado', 'vegetariano-avanzado', 'vegetarian', 50, 100, '🌱'),
('Vegano Básico', 'vegano-basico', 'vegan', 15, 29, '🌿'),
('Vegano Avanzado', 'vegano-avanzado', 'vegan', 30, 100, '🌱'),
('Sin Gluten Básico', 'sin-gluten-basico', 'gluten_free', 25, 49, '🌾'),
('Sin Gluten Completo', 'sin-gluten-completo', 'gluten_free', 50, 100, '✅'),
('Saludable Básico', 'saludable-basico', 'healthy', 30, 59, '💚'),
('Saludable Avanzado', 'saludable-avanzado', 'healthy', 60, 100, '🥗')
ON CONFLICT (slug) DO NOTHING;
