
-- Crear política RLS para permitir acceso público de lectura a eventos activos
CREATE POLICY "Allow public read access to active events" 
ON public.events 
FOR SELECT 
USING (is_active = true AND deleted_at IS NULL);
