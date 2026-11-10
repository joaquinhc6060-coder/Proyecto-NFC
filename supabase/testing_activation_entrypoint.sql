-- Public entry point used by the activation form.
CREATE OR REPLACE FUNCTION public.vigio_activar_placa(p_token text, p_pin text, p_perfil jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Inicia sesión para vincular la placa a tu cuenta.');
  END IF;
  RETURN public.vigio_activar_placa_interna(p_token, p_pin, p_perfil);
END;
$$;

REVOKE ALL ON FUNCTION public.vigio_activar_placa(text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.vigio_activar_placa(text, text, jsonb) TO authenticated;
