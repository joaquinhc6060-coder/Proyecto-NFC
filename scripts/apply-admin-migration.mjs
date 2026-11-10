import fs from 'node:fs/promises';
import { loadEnv } from 'vite';

const env = { ...loadEnv('development', process.cwd(), ''), ...process.env };
const host = new URL(env.SUPABASE_URL || env.VITE_SUPABASE_URL).hostname;
if (!/^[a-z0-9]+\.supabase\.co$/.test(host) || !env.SUPABASE_ACCESS_TOKEN) {
  throw new Error('Falta el token personal o la URL oficial del proyecto Supabase.');
}
const base = `https://api.supabase.com/v1/projects/${host.split('.')[0]}/database`;
async function api(path, body) {
  const response = await fetch(base + path, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal: AbortSignal.timeout(60000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`Supabase Management API: HTTP ${response.status}. ${typeof data?.message === 'string' ? data.message : 'Revisa los permisos del token.'}`);
  return data;
}
const snapshotQuery = `SELECT
  (SELECT count(*) FROM public.placas_vigio) AS placas,
  (SELECT count(*) FROM public.perfiles_vigio) AS perfiles,
  (SELECT md5(coalesce(string_agg(id::text || ':' || token || ':' || estado, ',' ORDER BY id), '')) FROM public.placas_vigio) AS placas_hash,
  (SELECT md5(coalesce(string_agg(row_to_json(p)::text, ',' ORDER BY id), '')) FROM public.perfiles_vigio p) AS perfiles_hash,
  (SELECT jsonb_agg(column_name ORDER BY ordinal_position) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'placas_vigio') AS columnas,
  (SELECT jsonb_agg(to_jsonb(p)) FROM pg_policies p WHERE schemaname = 'public' AND tablename IN ('placas_vigio','perfiles_vigio')) AS politicas,
  (SELECT jsonb_agg(to_jsonb(g)) FROM information_schema.role_table_grants g WHERE table_schema = 'public' AND table_name IN ('placas_vigio','perfiles_vigio')) AS permisos;
`;
const before = (await api('/query', { query: snapshotQuery, read_only: true }))[0];
console.log(JSON.stringify({ placas: before.placas, perfiles: before.perfiles, columnas: before.columnas }));
if (!process.argv.includes('--apply')) {
  console.log('Comprobación de acceso y esquema completada. No se aplicaron cambios.');
} else {
await fs.mkdir('backups.local', { recursive: true });
const stamp = new Date().toISOString().replaceAll(':', '-');
await fs.writeFile(`backups.local/admin-schema-${stamp}.json`, JSON.stringify(before, null, 2));
const hardening = process.argv.includes('--harden');
const account = process.argv.includes('--account');
const pinLogin = process.argv.includes('--pin-login');
const profileFields = process.argv.includes('--profile-fields');
const voiceStorage = process.argv.includes('--voice-storage');
const accountFirst = process.argv.includes('--account-first');
const activationUx = process.argv.includes('--activation-ux');
const activationType = process.argv.includes('--activation-type');
const dashboardJson = process.argv.includes('--dashboard-json');
const file = dashboardJson ? 'supabase/dashboard_profile_json.sql' : activationType ? 'supabase/activation_type_and_contacts.sql' : activationUx ? 'supabase/activation_ux_security.sql' : accountFirst ? 'supabase/account_first_panel_flow.sql' : voiceStorage ? 'supabase/voice_storage.sql' : profileFields ? 'supabase/profile_category_fields.sql' : pinLogin ? 'supabase/pin_login_activation.sql' : account ? 'supabase/owner_account.sql' : hardening ? 'supabase/admin_master_security_hardening.sql' : 'supabase/admin_master_security.sql';
const query = await fs.readFile(file, 'utf8');
await api('/migrations', { name: dashboardJson ? 'vigio_dashboard_profile_json' : activationType ? 'vigio_activation_type_and_contacts' : activationUx ? 'vigio_activation_ux_security' : accountFirst ? 'vigio_account_first_panel_flow' : voiceStorage ? 'vigio_voice_storage' : profileFields ? 'vigio_profile_category_fields' : pinLogin ? 'vigio_pin_login_activation' : account ? 'vigio_owner_account' : hardening ? 'vigio_admin_master_security_hardening' : 'vigio_admin_master_security', query });
console.log('Migración registrada y aplicada en Supabase.');
const after = (await api('/query', { query: snapshotQuery, read_only: true }))[0];
for (const key of (profileFields || accountFirst || activationUx || activationType) ? ['placas', 'perfiles', 'placas_hash'] : ['placas', 'perfiles', 'placas_hash', 'perfiles_hash']) {
  if (before[key] !== after[key]) throw new Error('Cambió la verificación de datos existentes: ' + key);
}
console.log('Integridad verificada: placas, estados, tokens y perfiles existentes conservados.');
}
