import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { loadEnv } from 'vite';

// El endpoint local de activación necesita service_role, pero esa llave jamás
// debe guardarse en .env.testing ni enviarse a Vite como VITE_*. Se obtiene
// de la API de administración sólo para la vida de este proceso local.
const env = { ...loadEnv('testing', process.cwd(), ''), ...process.env };
const url = String(env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const accessToken = String(env.SUPABASE_ACCESS_TOKEN || '');

if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) || !accessToken) {
  console.error('Faltan SUPABASE_URL/VITE_SUPABASE_URL o SUPABASE_ACCESS_TOKEN para iniciar Testing.');
  process.exit(1);
}

const ref = new URL(url).hostname.split('.')[0];
const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/api-keys`, {
  headers: { Authorization: `Bearer ${accessToken}` },
});
if (!response.ok) {
  console.error(`No se pudo preparar Testing (Supabase ${response.status}). Revisa SUPABASE_ACCESS_TOKEN.`);
  process.exit(1);
}

const keys = await response.json();
const serviceKey = keys.find((key) => key.name === 'service_role')?.api_key;
if (typeof serviceKey !== 'string' || serviceKey.length < 100) {
  console.error('No se encontró una service-role válida para el proyecto Testing.');
  process.exit(1);
}

const configuredRateLimitSecret = String(env.VIGIO_PIN_RATE_LIMIT_SECRET || '');
const rateLimitSecret = configuredRateLimitSecret && configuredRateLimitSecret !== '[SENSITIVE]'
  ? configuredRateLimitSecret
  : randomBytes(32).toString('base64url');

console.log(`Testing listo: ${ref}.supabase.co (secretos sólo en memoria).`);
const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const child = spawn(command, ['vite', '--mode', 'testing'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: {
    ...process.env,
    SUPABASE_URL: url,
    SUPABASE_SERVICE_ROLE_KEY: serviceKey,
    VIGIO_PIN_RATE_LIMIT_SECRET: rateLimitSecret,
  },
});

child.on('exit', (code) => process.exit(code ?? 0));
