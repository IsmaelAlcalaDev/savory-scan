
-- Crear bucket para logos de plataformas
INSERT INTO storage.buckets (id, name, public)
VALUES ('platform-logos', 'platform-logos', true);

-- Crear política para que cualquiera pueda ver los logos (son públicos)
CREATE POLICY "Public can view platform logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'platform-logos');

-- Crear política para que solo admins puedan subir logos
CREATE POLICY "Admins can upload platform logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'platform-logos' AND
  auth.jwt() ->> 'role' = 'admin'
);

-- Crear política para que solo admins puedan actualizar logos
CREATE POLICY "Admins can update platform logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'platform-logos' AND
  auth.jwt() ->> 'role' = 'admin'
);

-- Crear política para que solo admins puedan eliminar logos
CREATE POLICY "Admins can delete platform logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'platform-logos' AND
  auth.jwt() ->> 'role' = 'admin'
);
