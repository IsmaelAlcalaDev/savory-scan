
-- Actualizar la tabla cuisine_types con iconos apropiados
UPDATE cuisine_types SET icon = '🍕' WHERE slug = 'italiana' OR slug = 'pizza';
UPDATE cuisine_types SET icon = '🥘' WHERE slug = 'española' OR slug = 'espanola';
UPDATE cuisine_types SET icon = '🌮' WHERE slug = 'mexicana';
UPDATE cuisine_types SET icon = '🍜' WHERE slug = 'asiatica' OR slug = 'china' OR slug = 'japonesa';
UPDATE cuisine_types SET icon = '🍔' WHERE slug = 'americana' OR slug = 'hamburguesas';
UPDATE cuisine_types SET icon = '🥗' WHERE slug = 'saludable' OR slug = 'vegetariana';
UPDATE cuisine_types SET icon = '🥖' WHERE slug = 'francesa';
UPDATE cuisine_types SET icon = '🍛' WHERE slug = 'india' OR slug = 'hindu';
UPDATE cuisine_types SET icon = '🧀' WHERE slug = 'mediterranea';
UPDATE cuisine_types SET icon = '🍖' WHERE slug = 'argentina' OR slug = 'parrilla';
UPDATE cuisine_types SET icon = '🐟' WHERE slug = 'mariscos' OR slug = 'pescado';
UPDATE cuisine_types SET icon = '🍰' WHERE slug = 'postres' OR slug = 'dulces';
UPDATE cuisine_types SET icon = '☕' WHERE slug = 'cafe' OR slug = 'desayuno';
UPDATE cuisine_types SET icon = '🥙' WHERE slug = 'arabe' OR slug = 'turca';
UPDATE cuisine_types SET icon = '🍺' WHERE slug = 'bar' OR slug = 'tapas';

-- Si no hay datos específicos, agregar algunos iconos por defecto basados en nombres comunes
UPDATE cuisine_types SET icon = '🍽️' WHERE icon IS NULL OR icon = '';
