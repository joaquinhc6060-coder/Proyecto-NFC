BEGIN;
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('vigio-audios','vigio-audios',true,2097152,ARRAY['audio/webm','audio/ogg','audio/mp4','audio/mpeg'])
ON CONFLICT (id) DO UPDATE SET public=true,file_size_limit=2097152,allowed_mime_types=EXCLUDED.allowed_mime_types;
DROP POLICY IF EXISTS "Vigio voice owner insert" ON storage.objects;
DROP POLICY IF EXISTS "Vigio voice owner select" ON storage.objects;
CREATE POLICY "Vigio voice owner insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='vigio-audios' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY "Vigio voice owner select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id='vigio-audios' AND (storage.foldername(name))[1]=auth.uid()::text);
COMMIT;
