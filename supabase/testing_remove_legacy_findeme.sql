-- Vigio: limpieza de tablas heredadas del producto anterior y de restaurantes.
-- EJECUTAR SOLO EN EL PROYECTO SUPABASE DE TESTING.
-- No usar en producción hasta contar con respaldo validado y aprobación explícita.
--
-- Conserva las tablas usadas por Vigio: profiles, placas_vigio, perfiles_vigio,
-- vigio_pin_lookup_limits, vigio_intentos_pin y contactos (formulario web).

BEGIN;

-- Primero se eliminan las dependencias de restaurantes, sin CASCADE para que
-- la migración falle si existe una relación nueva que no haya sido auditada.
DROP TABLE IF EXISTS public.waiter_pins;
DROP TABLE IF EXISTS public.campanas_push;
DROP TABLE IF EXISTS public.boletas_restaurante;
DROP TABLE IF EXISTS public.tarjetas_vip_pases;
DROP TABLE IF EXISTS public.comensales;
DROP TABLE IF EXISTS public.restaurant_staff;
DROP TABLE IF EXISTS public.restaurantes;
DROP TABLE IF EXISTS public.restaurant_mesas;
DROP TABLE IF EXISTS public.tarjetas_vip;

-- Modelo NFC legado sustituido por placas_vigio + perfiles_vigio.
DROP TABLE IF EXISTS public.escaneos_gps;
DROP TABLE IF EXISTS public.mascotas;
DROP TABLE IF EXISTS public.kids_profiles;
DROP TABLE IF EXISTS public.placas_nfc;

COMMIT;
