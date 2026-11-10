-- Vigio testing bootstrap.
-- Ejecutar únicamente en el proyecto Supabase de testing. No contiene datos reales.
BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo text NOT NULL DEFAULT '',
  telefono text,
  whatsapp text,
  instagram text,
  ciudad text DEFAULT 'Santiago, Chile',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vigio_profiles_owner_select" ON public.profiles;
DROP POLICY IF EXISTS "vigio_profiles_owner_update" ON public.profiles;
CREATE POLICY "vigio_profiles_owner_select" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "vigio_profiles_owner_update" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.vigio_create_profile_for_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre_completo, telefono, whatsapp)
  VALUES (
    NEW.id,
    coalesce(nullif(trim(NEW.raw_user_meta_data->>'nombre_completo'), ''),
             nullif(trim(concat_ws(' ', NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'apellido')), ''),
             split_part(NEW.email, '@', 1)),
    nullif(trim(NEW.raw_user_meta_data->>'telefono'), ''),
    nullif(trim(NEW.raw_user_meta_data->>'telefono'), '')
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS vigio_on_auth_user_created ON auth.users;
CREATE TRIGGER vigio_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.vigio_create_profile_for_user();

CREATE TABLE IF NOT EXISTS public.contactos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL,
  producto_interes text NOT NULL,
  origen text NOT NULL DEFAULT 'web_contacto',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contactos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vigio_contactos_web_insert" ON public.contactos;
CREATE POLICY "vigio_contactos_web_insert" ON public.contactos
  FOR INSERT TO anon, authenticated WITH CHECK (
    email ~* '^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]+$'
    AND char_length(email) <= 254
  );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('vigio-mascotas', 'vigio-mascotas', true, 10485760, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMIT;
