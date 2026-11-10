-- Audio storage and the current activation implementation for testing.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('vigio-audios', 'vigio-audios', true, 1048576, ARRAY['audio/webm','audio/ogg','audio/mp4','audio/mpeg'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Vigio voice owner insert" ON storage.objects;
DROP POLICY IF EXISTS "Vigio voice owner select" ON storage.objects;
DROP POLICY IF EXISTS "Vigio voice owner delete" ON storage.objects;
CREATE POLICY "Vigio voice owner insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vigio-audios' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Vigio voice owner select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'vigio-audios' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Vigio voice owner delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'vigio-audios' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE OR REPLACE FUNCTION public.vigio_activar_placa_interna(p_token text, p_pin text, p_perfil jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  plate public.placas_vigio%ROWTYPE;
  data jsonb := jsonb_strip_nulls(coalesce(p_perfil, '{}'::jsonb));
  selected_type text;
  primary_phone text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'Inicia sesión para activar el producto.'); END IF;
  SELECT * INTO plate FROM public.placas_vigio WHERE token = p_token FOR UPDATE;
  IF NOT FOUND OR plate.estado <> 'fabricada' OR plate.pin_usado OR plate.pin_activacion <> p_pin THEN
    RETURN jsonb_build_object('ok', false, 'error', 'El PIN ya no está disponible.');
  END IF;
  selected_type := data->>'tipo';
  IF selected_type NOT IN ('mascota', 'persona', 'objeto') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Elige qué deseas proteger.');
  END IF;
  primary_phone := coalesce(nullif(data->>'telefono_principal', ''), nullif(data->>'telefono_contacto', ''), '');
  IF nullif(trim(data->>'nombre'), '') IS NULL OR primary_phone = '' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Completa nombre y teléfono de contacto.');
  END IF;
  INSERT INTO public.perfiles_vigio (
    placa_id, owner_id, nombre, categoria, raza_o_modelo, foto_url, audio_url,
    telefono_contacto, whatsapp_contacto, nombre_contacto, ciudad,
    comentarios_adicionales, segundo_contacto_nombre, segundo_contacto_telefono, estado_alerta
  ) VALUES (
    plate.id, auth.uid(), trim(data->>'nombre'), selected_type, data->>'raza', data->>'foto_url', data->>'audio_url',
    primary_phone, primary_phone, coalesce(nullif(data->>'contacto_principal_nombre', ''), 'Propietario'),
    data->>'direccion', data->>'comentario', data->>'contacto_alternativo_nombre',
    data->>'contacto_alternativo_telefono', 'safe'
  );
  UPDATE public.placas_vigio SET
    estado = 'activada', owner_id = auth.uid(), fecha_activacion = now(), pin_usado = true,
    datos_perfil = data, campos_visibles = coalesce(data->'campos_visibles', '{}'::jsonb),
    pin_fallos = 0, pin_bloqueado_hasta = NULL
  WHERE id = plate.id;
  RETURN jsonb_build_object('ok', true);
END;
$$;
