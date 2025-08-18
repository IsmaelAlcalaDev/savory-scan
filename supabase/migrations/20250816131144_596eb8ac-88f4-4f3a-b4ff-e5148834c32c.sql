
-- Crear buckets para diferentes tipos de imágenes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('food-type-icons', 'food-type-icons', true, 2097152, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('cuisine-type-icons', 'cuisine-type-icons', true, 2097152, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('restaurant-covers', 'restaurant-covers', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('restaurant-galleries', 'restaurant-galleries', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('event-images', 'event-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('promotion-images', 'promotion-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('dish-images', 'dish-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas RLS para food-type-icons (solo lectura pública, solo admins pueden escribir)
CREATE POLICY "Public read access for food type icons" ON storage.objects
  FOR SELECT USING (bucket_id = 'food-type-icons');

CREATE POLICY "Admin write access for food type icons" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'food-type-icons' AND 
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Admin update access for food type icons" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'food-type-icons' AND 
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Admin delete access for food type icons" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'food-type-icons' AND 
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Políticas RLS para cuisine-type-icons (solo lectura pública, solo admins pueden escribir)
CREATE POLICY "Public read access for cuisine type icons" ON storage.objects
  FOR SELECT USING (bucket_id = 'cuisine-type-icons');

CREATE POLICY "Admin write access for cuisine type icons" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cuisine-type-icons' AND 
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Admin update access for cuisine type icons" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'cuisine-type-icons' AND 
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Admin delete access for cuisine type icons" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'cuisine-type-icons' AND 
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Políticas RLS para restaurant-covers (lectura pública, propietarios pueden escribir)
CREATE POLICY "Public read access for restaurant covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'restaurant-covers');

CREATE POLICY "Restaurant owners can upload covers" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'restaurant-covers' AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Restaurant owners can update their covers" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'restaurant-covers' AND 
    auth.uid() = owner
  );

CREATE POLICY "Restaurant owners can delete their covers" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'restaurant-covers' AND 
    auth.uid() = owner
  );

-- Políticas RLS para restaurant-galleries (lectura pública, propietarios pueden escribir)
CREATE POLICY "Public read access for restaurant galleries" ON storage.objects
  FOR SELECT USING (bucket_id = 'restaurant-galleries');

CREATE POLICY "Restaurant owners can upload gallery images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'restaurant-galleries' AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Restaurant owners can update their gallery images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'restaurant-galleries' AND 
    auth.uid() = owner
  );

CREATE POLICY "Restaurant owners can delete their gallery images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'restaurant-galleries' AND 
    auth.uid() = owner
  );

-- Políticas RLS para event-images (lectura pública, propietarios pueden escribir)
CREATE POLICY "Public read access for event images" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-images');

CREATE POLICY "Restaurant owners can upload event images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'event-images' AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Restaurant owners can update their event images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'event-images' AND 
    auth.uid() = owner
  );

CREATE POLICY "Restaurant owners can delete their event images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'event-images' AND 
    auth.uid() = owner
  );

-- Políticas RLS para promotion-images (lectura pública, propietarios pueden escribir)
CREATE POLICY "Public read access for promotion images" ON storage.objects
  FOR SELECT USING (bucket_id = 'promotion-images');

CREATE POLICY "Restaurant owners can upload promotion images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'promotion-images' AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Restaurant owners can update their promotion images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'promotion-images' AND 
    auth.uid() = owner
  );

CREATE POLICY "Restaurant owners can delete their promotion images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'promotion-images' AND 
    auth.uid() = owner
  );

-- Políticas RLS para dish-images (lectura pública, propietarios pueden escribir)
CREATE POLICY "Public read access for dish images" ON storage.objects
  FOR SELECT USING (bucket_id = 'dish-images');

CREATE POLICY "Restaurant owners can upload dish images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'dish-images' AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Restaurant owners can update their dish images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'dish-images' AND 
    auth.uid() = owner
  );

CREATE POLICY "Restaurant owners can delete their dish images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'dish-images' AND 
    auth.uid() = owner
  );
