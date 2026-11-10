-- Canonical account functions for the isolated Vigio testing project.
CREATE INDEX IF NOT EXISTS idx_placas_vigio_owner ON public.placas_vigio(owner_id);
CREATE INDEX IF NOT EXISTS idx_perfiles_vigio_owner ON public.perfiles_vigio(owner_id);

ALTER TABLE public.placas_vigio DROP CONSTRAINT IF EXISTS chk_estado_placa;
ALTER TABLE public.placas_vigio
  ADD CONSTRAINT chk_estado_placa CHECK (estado IN ('fabricada', 'activada', 'sin_datos', 'bloqueada'));

CREATE OR REPLACE FUNCTION public.vigio_mis_productos()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', p.id, 'token', p.token, 'estado', p.estado,
        'tipo_producto', p.tipo_producto, 'datos_perfil', p.datos_perfil,
        'fecha_activacion', p.fecha_activacion,
        'perfil', coalesce(to_jsonb(pr) - 'owner_id', jsonb_build_object('nombre', 'Sin datos', 'estado_alerta', 'safe'))
      ) ORDER BY p.fecha_activacion DESC NULLS LAST
    ), '[]'::jsonb
  )
  FROM public.placas_vigio p
  LEFT JOIN public.perfiles_vigio pr ON pr.placa_id = p.id
  WHERE auth.uid() IS NOT NULL
    AND p.owner_id = auth.uid()
    AND (pr.owner_id IS NULL OR pr.owner_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.vigio_actualizar_perfil(p_placa_id uuid, p_datos jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  data jsonb := jsonb_strip_nulls(coalesce(p_datos, '{}'::jsonb));
  profile_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Inicia sesión para editar el producto.');
  END IF;
  IF nullif(trim(data->>'nombre'), '') IS NULL OR nullif(trim(data->>'telefono_contacto'), '') IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Completa el nombre y el teléfono de contacto.');
  END IF;

  SELECT pr.id INTO profile_id
  FROM public.placas_vigio p
  LEFT JOIN public.perfiles_vigio pr ON pr.placa_id = p.id
  WHERE p.id = p_placa_id AND p.owner_id = auth.uid()
    AND (pr.owner_id IS NULL OR pr.owner_id = auth.uid())
  FOR UPDATE OF p;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Producto no disponible en tu cuenta.');
  END IF;

  IF profile_id IS NULL THEN
    INSERT INTO public.perfiles_vigio (
      placa_id, owner_id, nombre, categoria, telefono_contacto, whatsapp_contacto,
      nombre_contacto, estado_alerta
    ) VALUES (
      p_placa_id, auth.uid(), trim(data->>'nombre'), coalesce(nullif(data->>'tipo', ''), 'mascota'),
      trim(data->>'telefono_contacto'), coalesce(nullif(data->>'whatsapp_contacto', ''), trim(data->>'telefono_contacto')),
      coalesce(nullif(trim(data->>'nombre_contacto'), ''), 'Propietario'), 'safe'
    ) RETURNING id INTO profile_id;
  END IF;

  UPDATE public.perfiles_vigio SET
    nombre = trim(data->>'nombre'),
    categoria = coalesce(nullif(data->>'tipo', ''), categoria),
    raza_o_modelo = data->>'raza', foto_url = data->>'foto_url', audio_url = coalesce(data->>'audio_url', audio_url),
    telefono_contacto = trim(data->>'telefono_contacto'),
    whatsapp_contacto = coalesce(nullif(data->>'whatsapp_contacto', ''), trim(data->>'telefono_contacto')),
    nombre_contacto = coalesce(nullif(trim(data->>'contacto_principal_nombre'), ''), nombre_contacto),
    ciudad = data->>'direccion', alergias = data->>'alergias',
    cuidados_especiales = data->>'comentario', comentarios_adicionales = data->>'comentario',
    edad = data->>'edad', tipo_sanguineo = data->>'tipo_sanguineo',
    enfermedades_condicion = data->>'enfermedades_condicion', nacionalidad = data->>'nacionalidad',
    destino = data->>'destino', segundo_contacto_nombre = data->>'contacto_alternativo_nombre',
    segundo_contacto_telefono = data->>'contacto_alternativo_telefono', updated_at = now()
  WHERE id = profile_id;

  UPDATE public.placas_vigio SET
    estado = 'activada',
    datos_perfil = jsonb_strip_nulls(datos_perfil || data),
    campos_visibles = coalesce(data->'campos_visibles', campos_visibles)
  WHERE id = p_placa_id AND owner_id = auth.uid();
  RETURN jsonb_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.vigio_eliminar_datos_perfil(p_placa_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.placas_vigio WHERE id = p_placa_id AND owner_id = auth.uid()
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'No tienes permiso para modificar este producto.');
  END IF;
  DELETE FROM public.perfiles_vigio WHERE placa_id = p_placa_id AND owner_id = auth.uid();
  UPDATE public.placas_vigio
  SET estado = 'sin_datos', datos_perfil = '{}'::jsonb, campos_visibles = '{}'::jsonb
  WHERE id = p_placa_id AND owner_id = auth.uid();
  RETURN jsonb_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.vigio_bloquear_cuenta_y_productos(p_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  DELETE FROM public.perfiles_vigio WHERE owner_id = p_user_id;
  UPDATE public.placas_vigio
  SET estado = 'bloqueada', datos_perfil = '{}'::jsonb, campos_visibles = '{}'::jsonb
  WHERE owner_id = p_user_id;
  DELETE FROM public.profiles WHERE id = p_user_id;
  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.vigio_mis_productos() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.vigio_actualizar_perfil(uuid, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.vigio_eliminar_datos_perfil(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.vigio_bloquear_cuenta_y_productos(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.vigio_mis_productos() TO authenticated;
GRANT EXECUTE ON FUNCTION public.vigio_actualizar_perfil(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.vigio_eliminar_datos_perfil(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.vigio_bloquear_cuenta_y_productos(uuid) TO service_role;
