
-- 1) Crear tabla de configuración de la aplicación
CREATE TABLE public.app_settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2) Activar RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 3) Políticas RLS:
-- Lectura pública de claves marcadas como públicas o lectura total para admins
CREATE POLICY "Public can read public app settings"
  ON public.app_settings
  FOR SELECT
  USING (is_public = true OR has_role(auth.uid(), 'admin'));

-- Solo admins pueden crear/actualizar/borrar
CREATE POLICY "Admins can insert app settings"
  ON public.app_settings
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update app settings"
  ON public.app_settings
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete app settings"
  ON public.app_settings
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- 4) Trigger para updated_at
CREATE TRIGGER set_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Semillas iniciales (branding)
INSERT INTO public.app_settings (key, value, is_public, description) VALUES
('branding.logo_url', jsonb_build_object('url', 'https://w7.pngwing.com/pngs/256/867/png-transparent-zomato-logo-thumbnail.png'), true, 'URL del logo mostrado en el navbar'),
('branding.app_name', jsonb_build_object('text', 'FoodieSpot'), true, 'Nombre visible de la aplicación');
