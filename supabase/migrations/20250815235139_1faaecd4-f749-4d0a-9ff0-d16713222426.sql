
-- Add the missing columns to diet_types table
ALTER TABLE diet_types 
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS min_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_percentage INTEGER DEFAULT 100;

-- Update existing records or insert new ones with the percentage-based structure
-- First, clear existing data
DELETE FROM diet_types;

-- Insert new diet type options with percentages
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
