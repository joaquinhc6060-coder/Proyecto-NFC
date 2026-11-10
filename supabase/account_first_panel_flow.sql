-- Vigio: cuentas antes de activaciones y ciclo de vida seguro del producto.
BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nombre varchar(100),
  ADD COLUMN IF NOT EXISTS apellido varchar(100);

-- Un producto con datos borrados sigue perteneciendo a su dueño, pero no expone
-- un perfil público y no puede ser reactivado usando el mismo PIN.
ALTER TABLE public.placas_vigio DROP CONSTRAINT IF EXISTS chk_estado_placa;
ALTER TABLE public.placas_vigio
  ADD CONSTRAINT chk_estado_placa CHECK (estado IN ('fabricada', 'activada', 'sin_datos', 'bloqueada'));

CREATE OR REPLACE FUNCTION public.vigio_mis_productos()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',p.id,'token',p.token,'estado',p.estado,'tipo_producto',p.tipo_producto,
   'fecha_activacion',p.fecha_activacion,'perfil',coalesce(to_jsonb(pr)-'owner_id',jsonb_build_object('nombre','Sin datos','estado_alerta','safe')))
   ORDER BY p.fecha_activacion DESC NULLS LAST),'[]'::jsonb)
 FROM public.placas_vigio p LEFT JOIN public.perfiles_vigio pr ON pr.placa_id=p.id
 WHERE auth.uid() IS NOT NULL AND p.owner_id=auth.uid() AND (pr.owner_id IS NULL OR pr.owner_id=auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.vigio_resolver_placa_por_pin_servidor(p_pin text, p_subject_hash text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE limiter public.vigio_pin_lookup_limits%ROWTYPE; found_record record; attempts_now smallint;
BEGIN
 IF p_pin IS NULL OR p_pin !~ '^[0-9]{6}$' OR p_subject_hash IS NULL OR p_subject_hash !~ '^[a-f0-9]{64}$' THEN RETURN jsonb_build_object('ok',false); END IF;
 SELECT * INTO limiter FROM public.vigio_pin_lookup_limits WHERE subject_hash=p_subject_hash FOR UPDATE;
 IF NOT FOUND THEN INSERT INTO public.vigio_pin_lookup_limits(subject_hash,attempts) VALUES(p_subject_hash,1);
 ELSIF limiter.window_started_at <= now()-interval '15 minutes' THEN UPDATE public.vigio_pin_lookup_limits SET window_started_at=now(),attempts=1,updated_at=now() WHERE subject_hash=p_subject_hash;
 ELSE attempts_now:=limiter.attempts+1; UPDATE public.vigio_pin_lookup_limits SET attempts=attempts_now,updated_at=now() WHERE subject_hash=p_subject_hash; IF attempts_now>5 THEN RETURN jsonb_build_object('ok',false,'rate_limited',true); END IF; END IF;
 SELECT token,tipo_producto INTO found_record FROM public.placas_vigio WHERE pin_activacion=p_pin AND estado='fabricada' AND (pin_bloqueado_hasta IS NULL OR pin_bloqueado_hasta<=now()) LIMIT 2;
 IF NOT FOUND THEN RETURN jsonb_build_object('ok',false); END IF;
 RETURN jsonb_build_object('ok',true,'token',found_record.token,'tipo_producto',found_record.tipo_producto);
END $$;

CREATE OR REPLACE FUNCTION public.vigio_actualizar_perfil(p_placa_id uuid,p_datos jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE profile_id uuid; plate_estado text;
BEGIN
 SELECT p.estado,pr.id INTO plate_estado,profile_id FROM public.placas_vigio p LEFT JOIN public.perfiles_vigio pr ON pr.placa_id=p.id
 WHERE p.id=p_placa_id AND auth.uid() IS NOT NULL AND p.owner_id=auth.uid() AND (pr.owner_id IS NULL OR pr.owner_id=auth.uid()) FOR UPDATE OF p;
 IF plate_estado IS NULL OR (profile_id IS NULL AND plate_estado <> 'sin_datos') THEN RETURN jsonb_build_object('ok',false,'error','Producto no disponible en tu cuenta.'); END IF;
 IF nullif(trim(p_datos->>'nombre'),'') IS NULL OR nullif(trim(p_datos->>'telefono_contacto'),'') IS NULL THEN
   RETURN jsonb_build_object('ok',false,'error','Completa el nombre y el teléfono de contacto.');
 END IF;
 IF profile_id IS NULL THEN
   INSERT INTO public.perfiles_vigio(placa_id,owner_id,nombre,categoria,telefono_contacto,whatsapp_contacto,nombre_contacto,estado_alerta)
   VALUES(p_placa_id,auth.uid(),trim(p_datos->>'nombre'),coalesce(nullif(p_datos->>'categoria',''),'mascota'),trim(p_datos->>'telefono_contacto'),coalesce(nullif(p_datos->>'whatsapp_contacto',''),trim(p_datos->>'telefono_contacto')),coalesce(nullif(trim(p_datos->>'nombre_contacto'),''),'Propietario'),'safe') RETURNING id INTO profile_id;
 END IF;
 UPDATE public.perfiles_vigio SET nombre=trim(p_datos->>'nombre'), nombre_contacto=coalesce(nullif(trim(p_datos->>'nombre_contacto'),''),nombre_contacto),
   telefono_contacto=trim(p_datos->>'telefono_contacto'), whatsapp_contacto=coalesce(nullif(p_datos->>'whatsapp_contacto',''),trim(p_datos->>'telefono_contacto')),
   ciudad=p_datos->>'ciudad', raza_o_modelo=p_datos->>'raza_o_modelo', foto_url=p_datos->>'foto_url', mensaje_auxilio=p_datos->>'mensaje_auxilio',
   alergias=p_datos->>'alergias', cuidados_especiales=p_datos->>'cuidados_especiales', edad=p_datos->>'edad', comentarios_adicionales=p_datos->>'comentarios_adicionales',
   mensaje_voz_url=p_datos->>'mensaje_voz_url', tipo_sanguineo=p_datos->>'tipo_sanguineo', enfermedades_condicion=p_datos->>'enfermedades_condicion',
   nacionalidad=p_datos->>'nacionalidad', destino=p_datos->>'destino', estado_alerta=coalesce(nullif(p_datos->>'estado_alerta',''),'safe'), updated_at=now()
 WHERE id=profile_id;
 UPDATE public.placas_vigio SET estado='activada' WHERE id=p_placa_id AND estado='sin_datos';
 RETURN jsonb_build_object('ok',true);
END $$;

CREATE OR REPLACE FUNCTION public.vigio_eliminar_datos_perfil(p_placa_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.placas_vigio WHERE id=p_placa_id AND owner_id=auth.uid()) THEN
   RETURN jsonb_build_object('ok',false,'error','No tienes permiso para modificar este producto.');
 END IF;
 DELETE FROM public.perfiles_vigio WHERE placa_id=p_placa_id AND owner_id=auth.uid();
 UPDATE public.placas_vigio SET estado='sin_datos' WHERE id=p_placa_id AND owner_id=auth.uid();
 RETURN jsonb_build_object('ok',true);
END $$;

-- Solo lo puede invocar el endpoint con service_role después de validar la sesión.
CREATE OR REPLACE FUNCTION public.vigio_bloquear_cuenta_y_productos(p_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 DELETE FROM public.perfiles_vigio WHERE owner_id=p_user_id;
 UPDATE public.placas_vigio SET estado='bloqueada' WHERE owner_id=p_user_id;
 DELETE FROM public.profiles WHERE id=p_user_id;
 RETURN jsonb_build_object('ok',true);
END $$;

REVOKE ALL ON FUNCTION public.vigio_eliminar_datos_perfil(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.vigio_bloquear_cuenta_y_productos(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.vigio_eliminar_datos_perfil(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.vigio_bloquear_cuenta_y_productos(uuid) TO service_role;
NOTIFY pgrst,'reload schema';
COMMIT;
