-- Instalaciones anteriores pueden tener políticas ALL con nombres distintos.
-- Una política permisiva adicional anula la restricción de dueño.
BEGIN;
ALTER TABLE public.placas_vigio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles_vigio ENABLE ROW LEVEL SECURITY;
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('placas_vigio', 'perfiles_vigio')
      AND cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, p.tablename);
  END LOOP;
END $$;
CREATE POLICY "Permitir al dueno actualizar su perfil" ON public.perfiles_vigio
  FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
NOTIFY pgrst, 'reload schema';
COMMIT;
