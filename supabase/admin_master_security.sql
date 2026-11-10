-- Ejecutar DESPUÉS de schema_vigio_100_placas.sql y junto al frontend actualizado.
-- No genera placas ni modifica tokens o PIN existentes.
BEGIN;
-- Algunas instalaciones previas tienen placas_vigio pero aún no tienen PIN.
-- No inventar un PIN para una placa física ya entregada: conservar NULL en esas
-- filas. Los lotes nuevos siempre insertan un PIN de seis dígitos desde el servidor.
ALTER TABLE public.placas_vigio ADD COLUMN IF NOT EXISTS pin_activacion varchar(10);
ALTER TABLE public.placas_vigio ADD COLUMN IF NOT EXISTS pin_fallos integer NOT NULL DEFAULT 0;
ALTER TABLE public.placas_vigio ADD COLUMN IF NOT EXISTS pin_bloqueado_hasta timestamptz;

-- SELECT * público exponía el PIN. El escáner solo necesita estas columnas.
REVOKE ALL ON public.placas_vigio FROM anon, authenticated;
GRANT SELECT (id, token, estado, tipo_producto, owner_id, fecha_activacion)
  ON public.placas_vigio TO anon, authenticated;
GRANT ALL ON public.placas_vigio, public.perfiles_vigio TO service_role;
REVOKE INSERT, UPDATE, DELETE ON public.perfiles_vigio FROM anon, authenticated;
GRANT SELECT ON public.perfiles_vigio TO anon, authenticated;
GRANT UPDATE (nombre, raza_o_modelo, foto_url, telefono_contacto, whatsapp_contacto,
  nombre_contacto, ciudad, mensaje_auxilio, alergias, cuidados_especiales, estado_alerta)
  ON public.perfiles_vigio TO authenticated;
DROP POLICY IF EXISTS "Permitir al dueno actualizar su perfil" ON public.perfiles_vigio;
CREATE POLICY "Permitir al dueno actualizar su perfil" ON public.perfiles_vigio
  FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE OR REPLACE FUNCTION public.vigio_verificar_pin(p_token text, p_pin text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE p public.placas_vigio%ROWTYPE;
BEGIN
  SELECT * INTO p FROM public.placas_vigio WHERE token = p_token FOR UPDATE;
  IF NOT FOUND OR p.estado <> 'fabricada' OR p.pin_activacion IS NULL OR p.pin_bloqueado_hasta > now() THEN
    RETURN jsonb_build_object('ok', false);
  END IF;
  IF p_pin IS NULL OR p_pin !~ '^[0-9]{6}$' OR p.pin_activacion <> p_pin THEN
    UPDATE public.placas_vigio SET
      pin_fallos = CASE WHEN pin_bloqueado_hasta <= now() THEN 1 ELSE pin_fallos + 1 END,
      pin_bloqueado_hasta = CASE WHEN (CASE WHEN pin_bloqueado_hasta <= now() THEN 1 ELSE pin_fallos + 1 END) >= 5
        THEN now() + interval '15 minutes' ELSE NULL END
      WHERE id = p.id;
    RETURN jsonb_build_object('ok', false);
  END IF;
  -- No reiniciar el contador al verificar: evita borrar intentos fallidos con solicitudes paralelas.
  RETURN jsonb_build_object('ok', true, 'id', p.id, 'tipo_producto', p.tipo_producto);
END $$;

CREATE OR REPLACE FUNCTION public.vigio_activar_placa(p_token text, p_pin text, p_perfil jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE verification jsonb; placa uuid;
BEGIN
  verification := public.vigio_verificar_pin(p_token, p_pin);
  IF NOT (verification->>'ok')::boolean THEN RETURN verification; END IF;
  placa := (verification->>'id')::uuid;
  IF nullif(trim(p_perfil->>'nombre'), '') IS NULL OR nullif(trim(p_perfil->>'nombre_contacto'), '') IS NULL
    OR nullif(trim(p_perfil->>'telefono_contacto'), '') IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Completa el nombre y los datos de contacto.');
  END IF;
  INSERT INTO public.perfiles_vigio (placa_id, owner_id, nombre, categoria, raza_o_modelo, foto_url,
    telefono_contacto, whatsapp_contacto, nombre_contacto, ciudad, mensaje_auxilio, alergias, cuidados_especiales, estado_alerta)
  VALUES (placa, auth.uid(), trim(p_perfil->>'nombre'), coalesce(p_perfil->>'categoria', 'mascota'),
    p_perfil->>'raza_o_modelo', p_perfil->>'foto_url', p_perfil->>'telefono_contacto',
    coalesce(nullif(p_perfil->>'whatsapp_contacto', ''), p_perfil->>'telefono_contacto'),
    p_perfil->>'nombre_contacto', p_perfil->>'ciudad', p_perfil->>'mensaje_auxilio',
    p_perfil->>'alergias', p_perfil->>'cuidados_especiales', 'lost');
  UPDATE public.placas_vigio SET estado = 'activada', owner_id = auth.uid(), fecha_activacion = now(),
    pin_fallos = 0, pin_bloqueado_hasta = NULL WHERE id = placa;
  RETURN jsonb_build_object('ok', true);
END $$;
REVOKE ALL ON FUNCTION public.vigio_verificar_pin(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.vigio_activar_placa(text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.vigio_verificar_pin(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.vigio_activar_placa(text, text, jsonb) TO anon, authenticated;
COMMIT;
