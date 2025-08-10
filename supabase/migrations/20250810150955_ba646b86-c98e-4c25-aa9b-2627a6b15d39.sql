
-- 1) Añadir columna para URL de bandera (si no existe)
ALTER TABLE public.languages 
ADD COLUMN IF NOT EXISTS flag_url text;

-- 2) Rellenar con URLs de banderas (FlagCDN - SVG)
-- Nota: Usamos códigos de país estándar. Para 'en' usamos 'gb' (Reino Unido).
UPDATE public.languages 
SET flag_url = CASE 
  WHEN code = 'es' THEN 'https://flagcdn.com/es.svg'
  WHEN code = 'en' THEN 'https://flagcdn.com/gb.svg'
  WHEN code = 'fr' THEN 'https://flagcdn.com/fr.svg'
  WHEN code = 'pt' THEN 'https://flagcdn.com/pt.svg'
  WHEN code = 'it' THEN 'https://flagcdn.com/it.svg'
  WHEN code = 'de' THEN 'https://flagcdn.com/de.svg'
  WHEN code = 'ca' THEN 'https://flagcdn.com/es.svg'  -- Catalán: fallback a ES (no hay bandera regional en FlagCDN)
  ELSE 'https://flagcdn.com/un.svg' -- fallback genérico (ONU)
END;
