BEGIN;
ALTER TABLE public.perfiles_vigio
  ADD COLUMN IF NOT EXISTS edad varchar(30),
  ADD COLUMN IF NOT EXISTS comentarios_adicionales text,
  ADD COLUMN IF NOT EXISTS mensaje_voz_url text,
  ADD COLUMN IF NOT EXISTS tipo_sanguineo varchar(20),
  ADD COLUMN IF NOT EXISTS enfermedades_condicion text,
  ADD COLUMN IF NOT EXISTS nacionalidad varchar(100),
  ADD COLUMN IF NOT EXISTS destino varchar(150);

CREATE OR REPLACE FUNCTION public.vigio_activar_placa_interna(p_token text, p_pin text, p_perfil jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE verification jsonb; placa uuid;
BEGIN
  verification := public.vigio_verificar_pin(p_token, p_pin);
  IF NOT (verification->>'ok')::boolean THEN RETURN verification; END IF;
  placa := (verification->>'id')::uuid;
  IF nullif(trim(p_perfil->>'nombre'), '') IS NULL OR nullif(trim(p_perfil->>'nombre_contacto'), '') IS NULL OR nullif(trim(p_perfil->>'telefono_contacto'), '') IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Completa el nombre y los datos de contacto.');
  END IF;
  INSERT INTO public.perfiles_vigio (placa_id,owner_id,nombre,categoria,raza_o_modelo,foto_url,telefono_contacto,whatsapp_contacto,nombre_contacto,ciudad,mensaje_auxilio,alergias,cuidados_especiales,estado_alerta,edad,comentarios_adicionales,mensaje_voz_url,tipo_sanguineo,enfermedades_condicion,nacionalidad,destino)
  VALUES (placa,auth.uid(),trim(p_perfil->>'nombre'),coalesce(p_perfil->>'categoria','mascota'),p_perfil->>'raza_o_modelo',p_perfil->>'foto_url',p_perfil->>'telefono_contacto',coalesce(nullif(p_perfil->>'whatsapp_contacto',''),p_perfil->>'telefono_contacto'),p_perfil->>'nombre_contacto',p_perfil->>'ciudad',p_perfil->>'mensaje_auxilio',p_perfil->>'alergias',p_perfil->>'cuidados_especiales','lost',p_perfil->>'edad',p_perfil->>'comentarios_adicionales',p_perfil->>'mensaje_voz_url',p_perfil->>'tipo_sanguineo',p_perfil->>'enfermedades_condicion',p_perfil->>'nacionalidad',p_perfil->>'destino');
  UPDATE public.placas_vigio SET estado='activada',owner_id=auth.uid(),fecha_activacion=now(),pin_fallos=0,pin_bloqueado_hasta=NULL WHERE id=placa;
  RETURN jsonb_build_object('ok',true);
END $$;
NOTIFY pgrst,'reload schema';
COMMIT;
