-- Vigio · bandeja privada de consultas del formulario web.
-- Ejecutar primero en Supabase Testing y, tras validar el flujo, en Producción.
-- La inserción pública NO se habilita: /api/vigio-contact usa service_role.

BEGIN;

CREATE TABLE IF NOT EXISTS public.contactos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL CHECK (
    char_length(email) <= 254
    AND email ~* '^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]+$'
  ),
  producto_interes text NOT NULL CHECK (char_length(producto_interes) <= 3500),
  origen text NOT NULL DEFAULT 'web_contacto' CHECK (char_length(origen) <= 50),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contactos ENABLE ROW LEVEL SECURITY;

-- No hay acceso directo desde el navegador: evita consultar o inundar la bandeja
-- saltándose las validaciones, honeypot y rate limit de la función de Vercel.
REVOKE ALL ON TABLE public.contactos FROM anon, authenticated;
GRANT ALL ON TABLE public.contactos TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.contactos_id_seq TO service_role;

COMMIT;
