BEGIN;
CREATE INDEX IF NOT EXISTS idx_placas_vigio_owner ON public.placas_vigio(owner_id);
CREATE INDEX IF NOT EXISTS idx_perfiles_vigio_owner ON public.perfiles_vigio(owner_id);
CREATE OR REPLACE FUNCTION public.vigio_mis_productos()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',p.id,'token',p.token,'estado',p.estado,
   'tipo_producto',p.tipo_producto,'fecha_activacion',p.fecha_activacion,'perfil',to_jsonb(pr)-'owner_id')
   ORDER BY p.fecha_activacion DESC NULLS LAST),'[]'::jsonb)
 FROM public.placas_vigio p JOIN public.perfiles_vigio pr ON pr.placa_id=p.id
 WHERE auth.uid() IS NOT NULL AND (p.owner_id=auth.uid() OR pr.owner_id=auth.uid())
   AND (p.owner_id IS NULL OR p.owner_id=auth.uid()) AND (pr.owner_id IS NULL OR pr.owner_id=auth.uid());
$$;
CREATE OR REPLACE FUNCTION public.vigio_actualizar_perfil(p_placa_id uuid,p_datos jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE profile_id uuid;
BEGIN
 SELECT pr.id INTO profile_id FROM public.perfiles_vigio pr JOIN public.placas_vigio p ON p.id=pr.placa_id
 WHERE p.id=p_placa_id AND auth.uid() IS NOT NULL AND (p.owner_id=auth.uid() OR pr.owner_id=auth.uid())
   AND (p.owner_id IS NULL OR p.owner_id=auth.uid()) AND (pr.owner_id IS NULL OR pr.owner_id=auth.uid()) FOR UPDATE OF pr;
 IF profile_id IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Producto no disponible en tu cuenta.'); END IF;
 IF nullif(trim(p_datos->>'nombre'),'') IS NULL OR nullif(trim(p_datos->>'nombre_contacto'),'') IS NULL
   OR nullif(trim(p_datos->>'telefono_contacto'),'') IS NULL OR p_datos->>'estado_alerta' IS NULL
   OR p_datos->>'estado_alerta' NOT IN ('safe','lost') THEN
   RETURN jsonb_build_object('ok',false,'error','Revisa nombre, contacto, teléfono y estado.');
 END IF;
 UPDATE public.perfiles_vigio SET nombre=trim(p_datos->>'nombre'),nombre_contacto=trim(p_datos->>'nombre_contacto'),
   telefono_contacto=trim(p_datos->>'telefono_contacto'),whatsapp_contacto=p_datos->>'whatsapp_contacto',
   ciudad=p_datos->>'ciudad',raza_o_modelo=p_datos->>'raza_o_modelo',foto_url=p_datos->>'foto_url',
   mensaje_auxilio=p_datos->>'mensaje_auxilio',alergias=p_datos->>'alergias',
   cuidados_especiales=p_datos->>'cuidados_especiales',estado_alerta=p_datos->>'estado_alerta',updated_at=now()
 WHERE id=profile_id;
 RETURN jsonb_build_object('ok',true);
END $$;
DO $$ BEGIN
 IF to_regprocedure('public.vigio_activar_placa_interna(text,text,jsonb)') IS NULL THEN
   ALTER FUNCTION public.vigio_activar_placa(text,text,jsonb) RENAME TO vigio_activar_placa_interna;
 END IF;
END $$;
REVOKE ALL ON FUNCTION public.vigio_activar_placa_interna(text,text,jsonb) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.vigio_activar_placa(p_token text,p_pin text,p_perfil jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok',false,'error','Inicia sesión para vincular la placa a tu cuenta.'); END IF;
 RETURN public.vigio_activar_placa_interna(p_token,p_pin,p_perfil);
END $$;
REVOKE ALL ON FUNCTION public.vigio_mis_productos() FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.vigio_actualizar_perfil(uuid,jsonb) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.vigio_activar_placa(text,text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.vigio_mis_productos() TO authenticated;
GRANT EXECUTE ON FUNCTION public.vigio_actualizar_perfil(uuid,jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.vigio_activar_placa(text,text,jsonb) TO authenticated;
NOTIFY pgrst,'reload schema';
COMMIT;
