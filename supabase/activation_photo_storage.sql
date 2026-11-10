BEGIN;
DROP POLICY IF EXISTS "vigio_photo_insert_own" ON storage.objects;
CREATE POLICY "vigio_photo_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vigio-mascotas' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "vigio_photo_delete_own" ON storage.objects;
CREATE POLICY "vigio_photo_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'vigio-mascotas' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "vigio_photo_select_own" ON storage.objects;
CREATE POLICY "vigio_photo_select_own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'vigio-mascotas' AND (storage.foldername(name))[1] = auth.uid()::text);
COMMIT;
