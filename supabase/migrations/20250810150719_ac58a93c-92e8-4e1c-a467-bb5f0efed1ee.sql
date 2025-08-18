
-- Add a flag column to the languages table
ALTER TABLE public.languages 
ADD COLUMN flag character varying(10);

-- Update existing records with flag emojis
UPDATE public.languages 
SET flag = CASE 
  WHEN code = 'es' THEN '🇪🇸'
  WHEN code = 'en' THEN '🇺🇸' 
  WHEN code = 'fr' THEN '🇫🇷'
  WHEN code = 'pt' THEN '🇧🇷'
  WHEN code = 'it' THEN '🇮🇹'
  ELSE '🏳️'
END;
