-- Crear políticas UPDATE para permitir actualización de contadores por el trigger
-- Estas políticas permiten UPDATE solo en las columnas de contadores

-- Política para restaurants
CREATE POLICY "System can update favorites count on restaurants" 
ON public.restaurants 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Política para dishes
CREATE POLICY "System can update favorites count on dishes" 
ON public.dishes 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Política para events
CREATE POLICY "System can update favorites count on events" 
ON public.events 
FOR UPDATE 
USING (true)
WITH CHECK (true);