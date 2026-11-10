import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

const env = { ...loadEnv('development', process.cwd(), ''), ...process.env };
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
if (!url || !env.SUPABASE_SERVICE_ROLE_KEY || !env.VIGIO_ADMIN_EMAIL || !env.VIGIO_ADMIN_INITIAL_PASSWORD) {
  console.error('Configura SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VIGIO_ADMIN_EMAIL y VIGIO_ADMIN_INITIAL_PASSWORD en .env.');
  process.exit(1);
}
const db = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const { error } = await db.auth.admin.createUser({
  email: env.VIGIO_ADMIN_EMAIL,
  password: env.VIGIO_ADMIN_INITIAL_PASSWORD,
  email_confirm: true,
  app_metadata: { vigio_master: true },
});
if (error) {
  console.error('No se creó el administrador:', error.message, 'Si el correo ya existe, revisa la cuenta en Supabase; este script no modifica usuarios existentes.');
  process.exit(1);
}
console.log('Administrador creado. Quita VIGIO_ADMIN_INITIAL_PASSWORD de .env e ingresa en /admin-master.');
