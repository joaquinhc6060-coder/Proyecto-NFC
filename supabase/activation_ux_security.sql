-- Vigio: activación opcional, perfil JSON y protección antiabuso.
BEGIN;

ALTER TABLE public.placas_vigio
  ADD COLUMN IF NOT EXISTS pin_usado boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS datos_perfil jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS campos_visibles jsonb NOT NULL DEFAULT '{}'::jsonb;
UPDATE public.placas_vigio SET pin_usado=true WHERE estado IN ('activada','sin_datos','bloqueada') AND owner_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_placas_vigio_pin ON public.placas_vigio(pin_activacion);
CREATE INDEX IF NOT EXISTS idx_placas_vigio_owner_id ON public.placas_vigio(owner_id);

CREATE TABLE IF NOT EXISTS public.vigio_intentos_pin (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_hash char(64) NOT NULL,
  fecha_hora timestamptz NOT NULL DEFAULT now(),
  resultado varchar(16) NOT NULL CHECK (resultado IN ('correcto','fallido','bloqueado','usado')),
  bloqueado_hasta timestamptz
);
CREATE INDEX IF NOT EXISTS idx_intentos_pin_usuario_ip_fecha ON public.vigio_intentos_pin(usuario_id,ip_hash,fecha_hora DESC);
ALTER TABLE public.vigio_intentos_pin ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.vigio_intentos_pin FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.vigio_resolver_placa_por_pin_servidor(p_pin text,p_subject_hash text,p_usuario_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE fail_count int; blocked_until timestamptz; plate public.placas_vigio%ROWTYPE;
BEGIN
 IF p_pin IS NULL OR p_pin !~ '^[0-9]{6}$' OR p_subject_hash !~ '^[a-f0-9]{64}$' OR p_usuario_id IS NULL THEN RETURN jsonb_build_object('ok',false); END IF;
 SELECT max(bloqueado_hasta),count(*) FILTER (WHERE resultado='fallido') INTO blocked_until,fail_count
 FROM public.vigio_intentos_pin WHERE usuario_id=p_usuario_id AND ip_hash=p_subject_hash AND fecha_hora>now()-interval '15 minutes';
 IF blocked_until>now() OR coalesce(fail_count,0)>=3 THEN
   blocked_until:=coalesce(blocked_until,now()+interval '15 minutes');
   IF blocked_until<=now() THEN blocked_until:=now()+interval '15 minutes'; END IF;
   INSERT INTO public.vigio_intentos_pin(usuario_id,ip_hash,resultado,bloqueado_hasta) VALUES(p_usuario_id,p_subject_hash,'bloqueado',blocked_until);
   RETURN jsonb_build_object('ok',false,'rate_limited',true,'retry_at',blocked_until);
 END IF;
 SELECT * INTO plate FROM public.placas_vigio WHERE pin_activacion=p_pin FOR UPDATE;
 IF NOT FOUND THEN
   INSERT INTO public.vigio_intentos_pin(usuario_id,ip_hash,resultado) VALUES(p_usuario_id,p_subject_hash,'fallido');
   SELECT count(*) FILTER (WHERE resultado='fallido') INTO fail_count FROM public.vigio_intentos_pin WHERE usuario_id=p_usuario_id AND ip_hash=p_subject_hash AND fecha_hora>now()-interval '15 minutes';
   IF fail_count>=3 THEN blocked_until:=now()+interval '15 minutes'; UPDATE public.vigio_intentos_pin SET bloqueado_hasta=blocked_until WHERE id=(SELECT max(id) FROM public.vigio_intentos_pin WHERE usuario_id=p_usuario_id AND ip_hash=p_subject_hash); END IF;
   RETURN jsonb_build_object('ok',false,'attempts_left',greatest(0,3-fail_count),'retry_at',blocked_until);
 END IF;
 IF plate.pin_usado OR plate.estado<>'fabricada' THEN
   INSERT INTO public.vigio_intentos_pin(usuario_id,ip_hash,resultado) VALUES(p_usuario_id,p_subject_hash,'usado');
   RETURN jsonb_build_object('ok',false,'used',true);
 END IF;
 IF (SELECT count(*) FROM public.placas_vigio WHERE owner_id=p_usuario_id AND estado IN ('activada','sin_datos'))>=10 THEN RETURN jsonb_build_object('ok',false,'limit_reached',true); END IF;
 INSERT INTO public.vigio_intentos_pin(usuario_id,ip_hash,resultado) VALUES(p_usuario_id,p_subject_hash,'correcto');
 RETURN jsonb_build_object('ok',true,'token',plate.token,'tipo_producto',plate.tipo_producto);
END $$;
REVOKE ALL ON FUNCTION public.vigio_resolver_placa_por_pin_servidor(text,text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.vigio_resolver_placa_por_pin_servidor(text,text,uuid) TO service_role;

-- Borra la información pública y los metadatos del producto, pero conserva la asociación y el PIN usado.
CREATE OR REPLACE FUNCTION public.vigio_eliminar_datos_perfil(p_placa_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.placas_vigio WHERE id=p_placa_id AND owner_id=auth.uid()) THEN RETURN jsonb_build_object('ok',false,'error','No tienes permiso para modificar este producto.'); END IF;
 DELETE FROM public.perfiles_vigio WHERE placa_id=p_placa_id AND owner_id=auth.uid();
 UPDATE public.placas_vigio SET estado='sin_datos',datos_perfil='{}'::jsonb,campos_visibles='{}'::jsonb WHERE id=p_placa_id AND owner_id=auth.uid();
 RETURN jsonb_build_object('ok',true);
END $$;
NOTIFY pgrst,'reload schema';
COMMIT;
