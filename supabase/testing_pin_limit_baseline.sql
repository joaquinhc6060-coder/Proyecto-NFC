-- Minimal rate-limit storage used by the current Vigio account flow.
-- This replaces a legacy migration that no longer applies cleanly to a fresh schema.
CREATE TABLE IF NOT EXISTS public.vigio_pin_lookup_limits (
  subject_hash text PRIMARY KEY CHECK (subject_hash ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz NOT NULL DEFAULT now(),
  attempts smallint NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vigio_pin_lookup_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.vigio_pin_lookup_limits FROM PUBLIC, anon, authenticated;
