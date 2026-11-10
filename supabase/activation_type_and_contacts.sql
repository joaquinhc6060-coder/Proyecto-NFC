BEGIN;
ALTER TABLE public.perfiles_vigio ADD COLUMN IF NOT EXISTS segundo_contacto_nombre varchar(100);
ALTER TABLE public.perfiles_vigio ADD COLUMN IF NOT EXISTS segundo_contacto_telefono varchar(20);

CREATE OR REPLACE FUNCTION public.vigio_activar_placa_interna(p_token text,p_pin text,p_perfil jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE plate public.placas_vigio%ROWTYPE; profile_data jsonb; selected_type text; primary_phone text;
BEGIN
 IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Inicia sesión para activar el producto.'); END IF;
 SELECT * INTO plate FROM public.placas_vigio WHERE token=p_token FOR UPDATE;
 IF NOT FOUND OR plate.estado<>'fabricada' OR plate.pin_usado OR plate.pin_activacion<>p_pin THEN RETURN jsonb_build_object('ok',false,'error','El PIN ya no está disponible.'); END IF;
 IF (SELECT count(*) FROM public.placas_vigio WHERE owner_id=auth.uid() AND estado IN ('activada','sin_datos'))>=10 THEN RETURN jsonb_build_object('ok',false,'error','Tu cuenta ya alcanzó el máximo de 10 productos.'); END IF;
 selected_type:=p_perfil->>'tipo';
 IF selected_type NOT IN ('mascota','persona','objeto') THEN RETURN jsonb_build_object('ok',false,'error','Elige qué deseas proteger.'); END IF;
 profile_data:=jsonb_strip_nulls(p_perfil);
 primary_phone:=coalesce(nullif(profile_data->>'telefono_principal',''),nullif(profile_data->>'telefono_contacto',''),'');
 INSERT INTO public.perfiles_vigio(placa_id,owner_id,nombre,categoria,raza_o_modelo,foto_url,telefono_contacto,whatsapp_contacto,nombre_contacto,ciudad,comentarios_adicionales,segundo_contacto_nombre,segundo_contacto_telefono,estado_alerta)
 VALUES(plate.id,auth.uid(),coalesce(nullif(profile_data->>'nombre',''),'Perfil Vigio'),selected_type,profile_data->>'raza',profile_data->>'foto_url',primary_phone,primary_phone,coalesce(nullif(profile_data->>'contacto_principal_nombre',''),'Propietario'),profile_data->>'direccion',profile_data->>'comentario',profile_data->>'contacto_alternativo_nombre',profile_data->>'contacto_alternativo_telefono','safe');
 UPDATE public.placas_vigio SET estado='activada',owner_id=auth.uid(),fecha_activacion=now(),pin_usado=true,datos_perfil=profile_data,campos_visibles=coalesce(profile_data->'campos_visibles','{}'::jsonb),pin_fallos=0,pin_bloqueado_hasta=NULL WHERE id=plate.id;
 RETURN jsonb_build_object('ok',true);
END $$;
NOTIFY pgrst,'reload schema';
COMMIT;
