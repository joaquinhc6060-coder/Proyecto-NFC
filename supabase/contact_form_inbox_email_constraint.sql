-- Corrige la expresión regular de la migración inicial de contactos.
-- Es segura de ejecutar en Testing y Producción: no borra consultas existentes.

BEGIN;

ALTER TABLE public.contactos
  DROP CONSTRAINT IF EXISTS contactos_email_check;

ALTER TABLE public.contactos
  ADD CONSTRAINT contactos_email_check CHECK (
    char_length(email) <= 254
    AND email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  );

COMMIT;
