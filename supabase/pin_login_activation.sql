BEGIN;

CREATE TABLE IF NOT EXISTS public.vigio_pin_lookup_limits (
  subject_hash text PRIMARY KEY CHECK (subject_hash ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz NOT NULL DEFAULT now(),
  attempts smallint NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vigio_pin_lookup_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.vigio_pin_lookup_limits FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.vigio_resolver_placa_por_pin_servidor(p_pin text, p_subject_hash text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  limiter public.vigio_pin_lookup_limits%ROWTYPE;
  matching_tokens text[];
  attempts_now smallint;
BEGIN
  IF p_pin IS NULL OR p_pin !~ '^[0-9]{6}$' OR p_subject_hash IS NULL OR p_subject_hash !~ '^[a-f0-9]{64}$' THEN
    RETURN jsonb_build_object('ok', false);
  END IF;

  SELECT * INTO limiter FROM public.vigio_pin_lookup_limits WHERE subject_hash = p_subject_hash FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.vigio_pin_lookup_limits(subject_hash, attempts) VALUES (p_subject_hash, 1);
  ELSIF limiter.window_started_at <= now() - interval '15 minutes' THEN
    UPDATE public.vigio_pin_lookup_limits SET window_started_at = now(), attempts = 1, updated_at = now() WHERE subject_hash = p_subject_hash;
  ELSE
    attempts_now := limiter.attempts + 1;
    UPDATE public.vigio_pin_lookup_limits SET attempts = attempts_now, updated_at = now() WHERE subject_hash = p_subject_hash;
    IF attempts_now > 5 THEN
      RETURN jsonb_build_object('ok', false, 'rate_limited', true);
    END IF;
  END IF;

  SELECT array_agg(found.token) INTO matching_tokens FROM (
    SELECT p.token FROM public.placas_vigio p
     WHERE p.pin_activacion = p_pin
       AND p.estado = 'fabricada'
       AND (p.pin_bloqueado_hasta IS NULL OR p.pin_bloqueado_hasta <= now())
     LIMIT 2
  ) found;
  IF coalesce(array_length(matching_tokens, 1), 0) <> 1 THEN RETURN jsonb_build_object('ok', false); END IF;
  RETURN jsonb_build_object('ok', true, 'token', matching_tokens[1]);
END;
$$;

REVOKE ALL ON FUNCTION public.vigio_resolver_placa_por_pin_servidor(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.vigio_resolver_placa_por_pin_servidor(text, text) TO service_role;
NOTIFY pgrst, 'reload schema';
COMMIT;
