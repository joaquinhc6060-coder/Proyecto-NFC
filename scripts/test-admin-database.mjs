import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { loadEnv } from 'vite';
import { createBatch } from '../api/vigio-admin.js';

const env = { ...loadEnv('development', process.cwd(), ''), ...process.env };
const ref = new URL(env.SUPABASE_URL || env.VITE_SUPABASE_URL).hostname.split('.')[0];
const quote = value => "'" + String(value).replaceAll("'", "''") + "'";
const batch = 'QA-' + randomUUID();
const rows = ['mascotas', 'kids', 'restaurante'].map(category => createBatch({ quantity: 1, category, batch })[0]);
const [pet, kid, restaurant] = rows;
const values = rows.map(row => `(${[row.token, row.pin_activacion, row.estado, row.tipo_producto, row.lote].map(quote).join(',')})`).join(',');
// All fixtures, state transitions, profiles and failed PIN attempts are rolled
// back on the same connection. Existing rows are never updated or deleted.
const query = `BEGIN;
SET LOCAL lock_timeout = '5s';
DO $test$
DECLARE r jsonb; n integer; p uuid;
BEGIN
  IF has_column_privilege('anon','public.placas_vigio','pin_activacion','SELECT')
    OR has_column_privilege('authenticated','public.placas_vigio','pin_activacion','SELECT')
    THEN RAISE EXCEPTION 'PIN expuesto'; END IF;
  IF has_table_privilege('anon','public.placas_vigio','INSERT')
    OR has_table_privilege('anon','public.placas_vigio','UPDATE')
    OR has_table_privilege('anon','public.perfiles_vigio','INSERT')
    THEN RAISE EXCEPTION 'Escritura publica habilitada'; END IF;
  PERFORM set_config('request.jwt.claim.sub',(SELECT id::text FROM auth.users ORDER BY created_at LIMIT 1),true);
  INSERT INTO public.placas_vigio(token,pin_activacion,estado,tipo_producto,lote) VALUES ${values};
  r := public.vigio_verificar_pin(${quote(pet.token)},'000000');
  IF (r->>'ok')::boolean THEN RAISE EXCEPTION 'PIN incorrecto aceptado'; END IF;
  FOR n IN 1..4 LOOP PERFORM public.vigio_verificar_pin(${quote(pet.token)},'000000'); END LOOP;
  r := public.vigio_verificar_pin(${quote(pet.token)},${quote(pet.pin_activacion)});
  IF (r->>'ok')::boolean THEN RAISE EXCEPTION 'Bloqueo no aplicado'; END IF;
  UPDATE public.placas_vigio SET pin_bloqueado_hasta = now() - interval '1 minute' WHERE token = ${quote(pet.token)};
  r := public.vigio_verificar_pin(${quote(pet.token)},${quote(pet.pin_activacion)});
  IF NOT (r->>'ok')::boolean THEN RAISE EXCEPTION 'PIN correcto rechazado tras vencer bloqueo'; END IF;
  r := public.vigio_activar_placa(${quote(pet.token)},${quote(pet.pin_activacion)},
    '{"nombre":"Prueba temporal","nombre_contacto":"QA","telefono_contacto":"+56000000000","whatsapp_contacto":"56000000000"}'::jsonb);
  IF NOT (r->>'ok')::boolean THEN RAISE EXCEPTION 'Activacion fallida'; END IF;
  SELECT id INTO p FROM public.placas_vigio WHERE token = ${quote(pet.token)} AND estado = 'activada';
  IF p IS NULL OR (SELECT count(*) FROM public.perfiles_vigio WHERE placa_id = p) <> 1 THEN RAISE EXCEPTION 'Perfil o estado incorrecto'; END IF;
  r := public.vigio_activar_placa(${quote(pet.token)},${quote(pet.pin_activacion)},
    '{"nombre":"Duplicado","nombre_contacto":"QA","telefono_contacto":"+56000000000"}'::jsonb);
  IF (r->>'ok')::boolean THEN RAISE EXCEPTION 'Doble activacion permitida'; END IF;
  UPDATE public.placas_vigio SET estado = 'bloqueada' WHERE token = ${quote(kid.token)};
  r := public.vigio_verificar_pin(${quote(kid.token)},${quote(kid.pin_activacion)});
  IF (r->>'ok')::boolean THEN RAISE EXCEPTION 'Placa bloqueada permitida'; END IF;
  UPDATE public.placas_vigio SET pin_activacion = NULL WHERE token = ${quote(restaurant.token)};
  r := public.vigio_verificar_pin(${quote(restaurant.token)},'000000');
  IF (r->>'ok')::boolean THEN RAISE EXCEPTION 'Placa sin PIN permitida'; END IF;
END $test$;
ROLLBACK;`;
const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query }), signal: AbortSignal.timeout(60000),
});
const result = await response.json();
assert.ok(response.ok, 'Pruebas SQL fallaron: ' + (result?.message || response.status));
console.log('Pruebas SQL reales aprobadas: tres productos, permisos, PIN, bloqueo, activación única y perfil.');
console.log('ROLLBACK completado: ninguna placa ni perfil de prueba persistió.');
