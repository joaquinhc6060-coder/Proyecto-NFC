-- Final profile fields used by the current Vigio testing frontend.
ALTER TABLE public.perfiles_vigio
  ADD COLUMN IF NOT EXISTS edad varchar(30),
  ADD COLUMN IF NOT EXISTS comentarios_adicionales text,
  ADD COLUMN IF NOT EXISTS mensaje_voz_url text,
  ADD COLUMN IF NOT EXISTS audio_url text,
  ADD COLUMN IF NOT EXISTS tipo_sanguineo varchar(20),
  ADD COLUMN IF NOT EXISTS enfermedades_condicion text,
  ADD COLUMN IF NOT EXISTS nacionalidad varchar(100),
  ADD COLUMN IF NOT EXISTS destino varchar(150),
  ADD COLUMN IF NOT EXISTS segundo_contacto_nombre varchar(100),
  ADD COLUMN IF NOT EXISTS segundo_contacto_telefono varchar(20);
