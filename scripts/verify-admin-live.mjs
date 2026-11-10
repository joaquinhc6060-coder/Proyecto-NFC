import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';
import handler from '../api/vigio-admin.js';

const env = { ...loadEnv('development', process.cwd(), ''), ...process.env };
for (const name of ['SUPABASE_URL', 'VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'VIGIO_ADMIN_USERNAME', 'VIGIO_ADMIN_EMAIL']) {
  if (env[name]) process.env[name] = env[name];
}
const password = env.VIGIO_ADMIN_TEST_PASSWORD || env.VIGIO_ADMIN_INITIAL_PASSWORD;
if (!password) {
  console.error('Configura temporalmente VIGIO_ADMIN_TEST_PASSWORD para verificar el login real.');
  process.exit(1);
}
async function request(body, session = '') {
  if (process.argv.includes('--http')) {
    const response = await fetch('http://127.0.0.1:5175/api/vigio-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Vigio-Request': 'admin', ...(session ? { Cookie: session } : {}) },
      body: JSON.stringify(body),
    });
    return { statusCode: response.status, headers: { 'Set-Cookie': response.headers.get('set-cookie') }, body: await response.json() };
  }
  const response = {
    headers: {}, statusCode: 200,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
  };
  await handler({ method: 'POST', headers: { host: 'localhost:5173', 'x-vigio-request': 'admin', cookie: session }, body }, response);
  return response;
}
if (process.argv.includes('--http')) {
  for (const path of ['/admin-master', '/gestion-vigio']) {
    const page = await fetch('http://127.0.0.1:5175' + path);
    if (!page.ok || !(await page.text()).includes('id="root"')) throw new Error('Ruta local no disponible: ' + path);
  }
  console.log('Rutas locales /admin-master y /gestion-vigio: disponibles.');
}
const login = await request({ action: 'login', user: env.VIGIO_ADMIN_USERNAME, pass: password });
if (login.statusCode !== 200) throw new Error('Falló el acceso administrativo: ' + (login.body?.error || login.statusCode));
const cookie = login.headers['Set-Cookie'].split(';')[0];
console.log('Login real: correcto. Cookie HttpOnly: ' + login.headers['Set-Cookie'].includes('HttpOnly'));
const inventory = await request({ action: 'list' }, cookie);
if (inventory.statusCode !== 200) throw new Error('Falló el inventario: ' + (inventory.body?.error || inventory.statusCode));
console.log('Inventario privado: correcto. Placas: ' + inventory.body.devices.length);
const anonymous = await request({ action: 'list' });
if (anonymous.statusCode !== 401) throw new Error('El inventario permitió acceso sin sesión.');
console.log('Acceso al panel sin sesión: rechazado.');

const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const db = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const { error: columnError } = await db.from('placas_vigio').select('pin_fallos', { head: true }).limit(1);
const { error: rpcError } = await db.rpc('vigio_verificar_pin', { p_token: '__vigio_check__', p_pin: '000000' });
const anon = createClient(url, env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const { error: pinError } = await anon.from('placas_vigio').select('pin_activacion').limit(1);
const secured = !columnError && !rpcError && pinError?.code === '42501';
console.log('Migración de seguridad: ' + (secured ? 'aplicada' : 'pendiente'));
console.log('PIN consultable desde acceso público: ' + (!pinError ? 'sí (requiere migración)' : pinError.code === '42501' ? 'no' : 'no determinado'));
for (const [check, error] of [['columnas', columnError], ['funcionPin', rpcError], ['accesoAnonimo', pinError]]) {
  if (error) console.log(JSON.stringify({ comprobacion: check, codigo: error.code, mensaje: error.message }));
}
const logout = await request({ action: 'logout' }, cookie);
if (logout.statusCode !== 200) throw new Error('Falló el cierre de sesión.');
console.log('Cierre de sesión: correcto.');
if (!secured) process.exitCode = 1;
