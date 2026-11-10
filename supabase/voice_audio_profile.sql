-- Vigio: audio de voz opcional y único por perfil.
-- No ejecutar automáticamente: aplicar en Supabase junto con el despliegue
-- que incorpora el selector/grabador de audio.
BEGIN;

ALTER TABLE public.perfiles_vigio
  ADD COLUMN IF NOT EXISTS audio_url text;

-- Conserva audios antiguos bajo el nombre anterior, si existían.
UPDATE public.perfiles_vigio
SET audio_url = mensaje_voz_url
WHERE audio_url IS NULL AND mensaje_voz_url IS NOT NULL;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('vigio-audios', 'vigio-audios', true, 1048576, ARRAY['audio/webm','audio/ogg','audio/mp4','audio/mpeg'])
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 1048576,
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

-- Amplía la activación vigente sin cambiar su contrato: guarda URL en la ficha
-- y también en datos_perfil, de donde se alimenta el panel del dueño.
CREATE OR REPLACE FUNCTION public.vigio_activar_placa_interna(p_token text, p_pin text, p_perfil jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE plate public.placas_vigio%ROWTYPE; profile_data jsonb; selected_type text; primary_phone text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Inicia sesión para activar el producto.'); END IF;
  SELECT * INTO plate FROM public.placas_vigio WHERE token=p_token FOR UPDATE;
  IF NOT FOUND OR plate.estado<>'fabricada' OR plate.pin_usado OR plate.pin_activacion<>p_pin THEN
    RETURN jsonb_build_object('ok',false,'error','El PIN ya no está disponible.');
  END IF;
  IF (SELECT count(*) FROM public.placas_vigio WHERE owner_id=auth.uid() AND estado IN ('activada','sin_datos'))>=10 THEN
    RETURN jsonb_build_object('ok',false,'error','Tu cuenta ya alcanzó el máximo de 10 productos.');
  END IF;
  selected_type:=p_perfil->>'tipo';
  IF selected_type NOT IN ('mascota','persona','objeto') THEN RETURN jsonb_build_object('ok',false,'error','Elige qué deseas proteger.'); END IF;
  profile_data:=jsonb_strip_nulls(p_perfil);
  primary_phone:=coalesce(nullif(profile_data->>'telefono_principal',''),nullif(profile_data->>'telefono_contacto',''),'');
  INSERT INTO public.perfiles_vigio(
    placa_id,owner_id,nombre,categoria,raza_o_modelo,foto_url,audio_url,telefono_contacto,whatsapp_contacto,nombre_contacto,ciudad,
    comentarios_adicionales,segundo_contacto_nombre,segundo_contacto_telefono,estado_alerta
  ) VALUES (
    plate.id,auth.uid(),coalesce(nullif(profile_data->>'nombre',''),nullif(profile_data->>'identificador',''),'Perfil Vigio'),selected_type,
    profile_data->>'raza',profile_data->>'foto_url',profile_data->>'audio_url',primary_phone,primary_phone,
    coalesce(nullif(profile_data->>'contacto_principal_nombre',''),'Propietario'),profile_data->>'ciudad_origen',profile_data->>'comentario',
    profile_data->>'contacto_alternativo_nombre',profile_data->>'telefono_alternativo','safe'
  );
  UPDATE public.placas_vigio SET estado='activada',owner_id=auth.uid(),fecha_activacion=now(),pin_usado=true,
    datos_perfil=profile_data,campos_visibles=coalesce(profile_data->'campos_visibles','{}'::jsonb),pin_fallos=0,pin_bloqueado_hasta=NULL
  WHERE id=plate.id;
  RETURN jsonb_build_object('ok',true);
END $$;

CREATE OR REPLACE FUNCTION public.vigio_actualizar_perfil(p_placa_id uuid, p_datos jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE profile_id uuid;
BEGIN
  SELECT pr.id INTO profile_id FROM public.perfiles_vigio pr JOIN public.placas_vigio p ON p.id=pr.placa_id
  WHERE p.id=p_placa_id AND p.owner_id=auth.uid() AND pr.owner_id=auth.uid() FOR UPDATE OF pr;
  IF profile_id IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Producto no disponible en tu cuenta.'); END IF;
  UPDATE public.perfiles_vigio SET
    nombre=coalesce(nullif(trim(p_datos->>'nombre'),''),nombre), foto_url=coalesce(p_datos->>'foto_url',foto_url),
    audio_url=nullif(p_datos->>'audio_url',''), nombre_contacto=coalesce(nullif(trim(p_datos->>'nombre_contacto'),''),nombre_contacto),
    telefono_contacto=coalesce(nullif(trim(p_datos->>'telefono_contacto'),''),telefono_contacto), whatsapp_contacto=p_datos->>'whatsapp_contacto',
    ciudad=p_datos->>'ciudad', raza_o_modelo=p_datos->>'raza_o_modelo', mensaje_auxilio=p_datos->>'mensaje_auxilio',
    alergias=p_datos->>'alergias', cuidados_especiales=p_datos->>'cuidados_especiales', estado_alerta=coalesce(p_datos->>'estado_alerta',estado_alerta),
    updated_at=now()
  WHERE id=profile_id;
  UPDATE public.placas_vigio SET datos_perfil = datos_perfil || jsonb_strip_nulls(p_datos) WHERE id=p_placa_id;
  RETURN jsonb_build_object('ok',true);
END $$;

NOTIFY pgrst, 'reload schema';
COMMIT;
