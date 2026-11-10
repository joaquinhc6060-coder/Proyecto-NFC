import fs from 'node:fs/promises';
import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

const env = { ...loadEnv('development', process.cwd(), ''), ...process.env };
const url = (env.SUPABASE_URL || env.VITE_SUPABASE_URL).replace(/\/$/, '');
const ref = new URL(url).hostname.split('.')[0];
const base = `https://api.supabase.com/v1/projects/${ref}`;
async function management(path, method = 'GET', body) {
  const response = await fetch(base + path, {
    method, headers: { Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(45000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Supabase HTTP ${response.status}: ${data.message || 'Revisa los permisos del token.'}`);
  return data;
}
const config = await management('/config/auth');
console.log(JSON.stringify({ confirmacionCorreo: !config.mailer_autoconfirm, google: !!config.external_google_enabled, facebook: !!config.external_facebook_enabled }));
if (process.argv.includes('--apply')) {
  await fs.mkdir('backups.local', { recursive: true });
  // Back up only fields being changed; do not write provider secrets to disk.
  await fs.writeFile(`backups.local/activation-auth-${Date.now()}.json`, JSON.stringify({ mailer_autoconfirm: config.mailer_autoconfirm, uri_allow_list: config.uri_allow_list }));
  const redirects = new Set((config.uri_allow_list || '').split(',').map(s => s.trim()).filter(Boolean));
  for (const origin of ['http://localhost:5173', 'http://localhost:5175', 'http://127.0.0.1:5175', 'https://vigio.cl', 'https://www.vigio.cl']) {
    for (const path of ['/p/**', '/scan/**', '/login**']) redirects.add(origin + path);
  }
  const patch = { mailer_autoconfirm: true, uri_allow_list: [...redirects].join(',') };
  for (const provider of ['google', 'facebook']) {
    const prefix = provider.toUpperCase();
    if (env[`${prefix}_CLIENT_ID`] && env[`${prefix}_CLIENT_SECRET`]) {
      patch[`external_${provider}_enabled`] = true;
      patch[`external_${provider}_client_id`] = env[`${prefix}_CLIENT_ID`];
      patch[`external_${provider}_secret`] = env[`${prefix}_CLIENT_SECRET`];
    }
  }
  await management('/config/auth', 'PATCH', patch);
  const db = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const options = { public: true, fileSizeLimit: 2097152, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] };
  const { data: bucket } = await db.storage.getBucket('vigio-mascotas');
  const { error } = bucket ? await db.storage.updateBucket('vigio-mascotas', options) : await db.storage.createBucket('vigio-mascotas', options);
  if (error) throw new Error('No se pudo configurar el almacenamiento: ' + error.message);
  await management('/database/migrations', 'POST', { name: 'vigio_activation_photo_storage', query: await fs.readFile('supabase/activation_photo_storage.sql', 'utf8') });
  const updated = await management('/config/auth');
  console.log(JSON.stringify({ correoSinConfirmacion: updated.mailer_autoconfirm === true, google: !!updated.external_google_enabled, facebook: !!updated.external_facebook_enabled, almacenamientoFotos: true }));
}
