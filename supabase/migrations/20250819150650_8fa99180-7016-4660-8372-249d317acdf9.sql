
-- Create restaurant_custom_tags table
CREATE TABLE public.restaurant_custom_tags (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, slug)
);

-- Enable RLS on restaurant_custom_tags
ALTER TABLE public.restaurant_custom_tags ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to restaurant custom tags
CREATE POLICY "Allow public read access to restaurant custom tags" 
ON public.restaurant_custom_tags 
FOR SELECT 
USING (true);

-- Insert sample custom tags for restaurants
INSERT INTO restaurant_custom_tags (restaurant_id, name, slug, description) VALUES
(1, 'Popular', 'popular', 'Platos más pedidos por los clientes'),
(1, 'Saludable', 'saludable', 'Opciones nutritivas y equilibradas'),
(1, 'Casero', 'casero', 'Preparado con recetas tradicionales'),
(2, 'Picante', 'picante', 'Con especias y sabores intensos'),
(2, 'Tradicional', 'tradicional', 'Recetas clásicas de la casa'),
(2, 'Gourmet', 'gourmet', 'Preparación elaborada y sofisticada'),
(3, 'Vegano', 'vegano', 'Sin ingredientes de origen animal'),
(3, 'Ligero', 'ligero', 'Preparación con menos calorías'),
(3, 'Fresco', 'fresco', 'Ingredientes de temporada'),
-- Add more tags for testing
(1, 'Especial del Chef', 'especial-chef', 'Creación exclusiva del chef'),
(2, 'Para Compartir', 'para-compartir', 'Ideal para disfrutar en grupo'),
(3, 'Sin Gluten', 'sin-gluten', 'Apto para celíacos');

-- Create dish_custom_tags junction table to link dishes with custom tags
CREATE TABLE public.dish_custom_tags (
    id SERIAL PRIMARY KEY,
    dish_id INTEGER NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
    custom_tag_id INTEGER NOT NULL REFERENCES restaurant_custom_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(dish_id, custom_tag_id)
);

-- Enable RLS on dish_custom_tags
ALTER TABLE public.dish_custom_tags ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to dish custom tags
CREATE POLICY "Allow public read access to dish custom tags" 
ON public.dish_custom_tags 
FOR SELECT 
USING (true);

-- Migrate existing custom_tags from dishes to the new junction table
-- First, extract custom tags from existing dishes and link them properly
DO $$
DECLARE
    dish_record RECORD;
    tag_name TEXT;
    tag_id INTEGER;
BEGIN
    -- Loop through all dishes that have custom_tags
    FOR dish_record IN 
        SELECT id, restaurant_id, custom_tags 
        FROM dishes 
        WHERE custom_tags IS NOT NULL AND jsonb_array_length(custom_tags) > 0
    LOOP
        -- Loop through each custom tag in the dish
        FOR tag_name IN 
            SELECT jsonb_array_elements_text(dish_record.custom_tags)
        LOOP
            -- Find or create the custom tag for this restaurant
            SELECT id INTO tag_id 
            FROM restaurant_custom_tags 
            WHERE restaurant_id = dish_record.restaurant_id 
            AND name = tag_name;
            
            -- If tag doesn't exist, create it
            IF tag_id IS NULL THEN
                INSERT INTO restaurant_custom_tags (restaurant_id, name, slug, description)
                VALUES (
                    dish_record.restaurant_id, 
                    tag_name, 
                    lower(replace(replace(tag_name, ' ', '-'), 'ñ', 'n')),
                    'Tag migrado automáticamente'
                )
                RETURNING id INTO tag_id;
            END IF;
            
            -- Link dish to custom tag
            INSERT INTO dish_custom_tags (dish_id, custom_tag_id)
            VALUES (dish_record.id, tag_id)
            ON CONFLICT (dish_id, custom_tag_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Create indexes for better performance
CREATE INDEX idx_restaurant_custom_tags_restaurant_id ON restaurant_custom_tags(restaurant_id);
CREATE INDEX idx_restaurant_custom_tags_slug ON restaurant_custom_tags(slug);
CREATE INDEX idx_dish_custom_tags_dish_id ON dish_custom_tags(dish_id);
CREATE INDEX idx_dish_custom_tags_custom_tag_id ON dish_custom_tags(custom_tag_id);

-- Verify the migration worked correctly
SELECT 
    d.id as dish_id,
    d.name as dish_name,
    r.name as restaurant_name,
    rct.name as tag_name,
    rct.slug as tag_slug
FROM dishes d
JOIN restaurants r ON d.restaurant_id = r.id
JOIN dish_custom_tags dct ON d.id = dct.dish_id
JOIN restaurant_custom_tags rct ON dct.custom_tag_id = rct.id
WHERE d.is_active = true
ORDER BY d.id, rct.name;
