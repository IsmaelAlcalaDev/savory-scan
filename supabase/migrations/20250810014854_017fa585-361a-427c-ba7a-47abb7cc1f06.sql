
-- Add icon column to cuisine_types table
ALTER TABLE cuisine_types ADD COLUMN IF NOT EXISTS icon_emoji VARCHAR(10);

-- Update some common cuisine types with representative emojis
UPDATE cuisine_types SET icon_emoji = '🍕' WHERE name ILIKE '%pizza%' OR name ILIKE '%italiana%';
UPDATE cuisine_types SET icon_emoji = '🍣' WHERE name ILIKE '%sushi%' OR name ILIKE '%japonesa%';
UPDATE cuisine_types SET icon_emoji = '🌮' WHERE name ILIKE '%mexicana%' OR name ILIKE '%taco%';
UPDATE cuisine_types SET icon_emoji = '🥘' WHERE name ILIKE '%española%' OR name ILIKE '%paella%';
UPDATE cuisine_types SET icon_emoji = '🍜' WHERE name ILIKE '%china%' OR name ILIKE '%asiática%';
UPDATE cuisine_types SET icon_emoji = '🥗' WHERE name ILIKE '%saludable%' OR name ILIKE '%vegetariana%';
UPDATE cuisine_types SET icon_emoji = '🍔' WHERE name ILIKE '%hamburguesa%' OR name ILIKE '%americana%';
UPDATE cuisine_types SET icon_emoji = '🍰' WHERE name ILIKE '%postres%' OR name ILIKE '%dulces%';
UPDATE cuisine_types SET icon_emoji = '☕' WHERE name ILIKE '%café%' OR name ILIKE '%cafetería%';
UPDATE cuisine_types SET icon_emoji = '🥖' WHERE name ILIKE '%francesa%' OR name ILIKE '%panadería%';
UPDATE cuisine_types SET icon_emoji = '🍛' WHERE name ILIKE '%india%' OR name ILIKE '%curry%';
UPDATE cuisine_types SET icon_emoji = '🧆' WHERE name ILIKE '%árabe%' OR name ILIKE '%mediterránea%';
