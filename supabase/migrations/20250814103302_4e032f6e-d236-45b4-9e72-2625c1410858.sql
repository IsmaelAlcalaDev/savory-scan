
-- Agregar la columna icon a la tabla platform_configs
ALTER TABLE platform_configs ADD COLUMN icon TEXT;

-- Migrar las URLs de logos desde icon_color a icon
-- Solo migrar valores que parecen URLs (contienen 'http' o 'supabase')
UPDATE platform_configs 
SET icon = icon_color,
    icon_color = CASE 
      WHEN platform_key = 'glovo' THEN '#FFD700'
      WHEN platform_key = 'ubereats' THEN '#00B956'
      WHEN platform_key = 'justeat' THEN '#FF8000'
      WHEN platform_key = 'deliveroo' THEN '#00CCBC'
      ELSE NULL
    END
WHERE icon_color IS NOT NULL 
  AND (icon_color LIKE '%http%' OR icon_color LIKE '%supabase%');

-- Para plataformas que solo tienen colores (no URLs), mantener el color en icon_color
UPDATE platform_configs 
SET icon_color = icon_color
WHERE icon_color IS NOT NULL 
  AND icon_color NOT LIKE '%http%' 
  AND icon_color NOT LIKE '%supabase%';
