-- Owner-only photo storage plus final public-table RLS hardening.
DROP POLICY IF EXISTS "vigio_photo_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "vigio_photo_delete_own" ON storage.objects;
DROP POLICY IF EXISTS "vigio_photo_select_own" ON storage.objects;
CREATE POLICY "vigio_photo_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vigio-mascotas' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "vigio_photo_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'vigio-mascotas' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "vigio_photo_select_own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'vigio-mascotas' AND (storage.foldername(name))[1] = auth.uid()::text);

ALTER TABLE public.placas_vigio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles_vigio ENABLE ROW LEVEL SECURITY;
DO $$
DECLARE policy_row record;
BEGIN
  FOR policy_row IN
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('placas_vigio', 'perfiles_vigio')
      AND cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', policy_row.policyname, policy_row.tablename);
  END LOOP;
END;
$$;

DROP POLICY IF EXISTS "vigio_profile_owner_update" ON public.perfiles_vigio;
CREATE POLICY "vigio_profile_owner_update" ON public.perfiles_vigio
  FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

REVOKE INSERT, UPDATE, DELETE ON public.placas_vigio, public.perfiles_vigio FROM anon, authenticated;
GRANT SELECT ON public.placas_vigio, public.perfiles_vigio TO anon, authenticated;
GRANT ALL ON public.placas_vigio, public.perfiles_vigio TO service_role;
NOTIFY pgrst, 'reload schema';
