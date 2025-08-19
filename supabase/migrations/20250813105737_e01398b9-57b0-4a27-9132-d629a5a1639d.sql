
-- Add RLS policies to allow public read access to dishes and related tables

-- Enable RLS on dishes table if not already enabled
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

-- Add policy to allow public read access to active dishes
CREATE POLICY "Allow public read access to active dishes" 
ON public.dishes 
FOR SELECT 
USING (is_active = true AND deleted_at IS NULL);

-- Enable RLS on dish_variants table if not already enabled
ALTER TABLE public.dish_variants ENABLE ROW LEVEL SECURITY;

-- Add policy to allow public read access to dish variants
CREATE POLICY "Allow public read access to dish variants" 
ON public.dish_variants 
FOR SELECT 
USING (true);

-- Enable RLS on dish_categories table if not already enabled
ALTER TABLE public.dish_categories ENABLE ROW LEVEL SECURITY;

-- Add policy to allow public read access to dish categories
CREATE POLICY "Allow public read access to dish categories" 
ON public.dish_categories 
FOR SELECT 
USING (true);
