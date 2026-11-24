-- Evita caracteres corruptos en el mensaje de emergencia predeterminado.
-- Los escapes Unicode mantienen el texto correcto aunque el editor o terminal
-- use una codificación distinta.
BEGIN;

ALTER TABLE public.perfiles_vigio
  ALTER COLUMN mensaje_auxilio
  SET DEFAULT U&'\00A1Hola! Me he perdido, por favor contacta a mi due\00F1o.';

-- Repara solamente valores dañados por una codificación anterior.
UPDATE public.perfiles_vigio
SET mensaje_auxilio = U&'\00A1Hola! Me he perdido, por favor contacta a mi due\00F1o.'
WHERE position(U&'\FFFD' IN coalesce(mensaje_auxilio, '')) > 0;

NOTIFY pgrst, 'reload schema';
COMMIT;
