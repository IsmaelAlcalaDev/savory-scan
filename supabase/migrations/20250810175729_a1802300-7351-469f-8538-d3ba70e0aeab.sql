
-- 1) Políticas RLS explícitas y seguras para user_saved_restaurants
ALTER TABLE public.user_saved_restaurants ENABLE ROW LEVEL SECURITY;

-- Eliminar política amplia previa si existe
DROP POLICY IF EXISTS "Users can manage own saved restaurants" ON public.user_saved_restaurants;

-- Solo el propio usuario puede ver sus favoritos
CREATE POLICY "Users can select own saved restaurants"
  ON public.user_saved_restaurants
  FOR SELECT
  USING (auth.uid() = user_id);

-- Solo el propio usuario puede crear su favorito
CREATE POLICY "Users can insert own saved restaurants"
  ON public.user_saved_restaurants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Solo el propio usuario puede actualizar su favorito
CREATE POLICY "Users can update own saved restaurants"
  ON public.user_saved_restaurants
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Solo el propio usuario puede borrar su favorito
CREATE POLICY "Users can delete own saved restaurants"
  ON public.user_saved_restaurants
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins pueden gestionar para soporte
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_saved_restaurants'
      AND policyname = 'Admins can manage all saved restaurants'
  ) THEN
    CREATE POLICY "Admins can manage all saved restaurants"
      ON public.user_saved_restaurants
      FOR ALL
      USING (has_role(auth.uid(), 'admin'))
      WITH CHECK (has_role(auth.uid(), 'admin'));
  END IF;
END
$$;

-- 2) Realtime robusto: payloads completos y asegurar publicación
ALTER TABLE public.user_saved_restaurants REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'user_saved_restaurants'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.user_saved_restaurants';
  END IF;
END
$$;

-- 3) Índice para recálculos y métricas de ventana eficientes
CREATE INDEX IF NOT EXISTS idx_usr_restaurant_saved_active
  ON public.user_saved_restaurants (restaurant_id, is_active, saved_at DESC);
