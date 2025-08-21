-- Make restaurant_id nullable
ALTER TABLE public.user_favorites
ALTER COLUMN restaurant_id DROP NOT NULL;