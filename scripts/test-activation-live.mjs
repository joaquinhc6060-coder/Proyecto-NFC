import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

const env = { ...loadEnv('development', process.cwd(), ''), ...process.env };
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, options);
const client = createClient(url, env.VITE_SUPABASE_ANON_KEY, options);
const anon = createClient(url, env.VITE_SUPABASE_ANON_KEY, options);
const run = randomUUID();
const email = `vigio-qa-${run}@example.com`;
let fixtureUser = null;
const paths = [];
const bucket = 'vigio-mascotas';
try {
  const { data, error } = await client.auth.signUp({ email, password: randomBytes(24).toString('base64url'), options: { data: { vigio_activation_qa: run } } });
  if (error) throw new Error('Registro de prueba: ' + error.message);
  fixtureUser = data.user;
  assert.ok(data.session, 'El registro aún exige confirmar por correo.');
  assert.ok(fixtureUser.email_confirmed_at, 'La cuenta no está confirmada automáticamente.');
  console.log('Registro por correo real: sesión inmediata, sin enlace de confirmación.');
  const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j6XkAAAAASUVORK5CYII=', 'base64');
  const own = `${fixtureUser.id}/qa-${run}.png`;
  paths.push(own);
  const { error: uploadError } = await client.storage.from(bucket).upload(own, image, { contentType: 'image/png' });
  if (uploadError) throw new Error('Subida de prueba: ' + uploadError.message);
  const publicUrl = client.storage.from(bucket).getPublicUrl(own).data.publicUrl;
  const photo = await fetch(publicUrl);
  assert.ok(photo.ok, 'La foto no está disponible en la ficha pública.');
  assert.ok((await photo.arrayBuffer()).byteLength > 0);
  console.log('Foto: subida por el dueño y lectura pública correctas.');
  const foreign = `00000000-0000-0000-0000-000000000000/qa-${run}.png`;
  paths.push(foreign);
  const { error: foreignError } = await client.storage.from(bucket).upload(foreign, image, { contentType: 'image/png' });
  assert.ok(foreignError, 'Se permitió subir una foto a la carpeta de otro dueño.');
  const anonymous = `anonymous/qa-${run}.png`;
  paths.push(anonymous);
  const { error: anonError } = await anon.storage.from(bucket).upload(anonymous, image, { contentType: 'image/png' });
  assert.ok(anonError, 'Se permitió subir una foto sin iniciar sesión.');
  console.log('Permisos: rechazadas las subidas sin sesión y a carpetas ajenas.');
} finally {
  if (paths.length) {
    const { error } = await admin.storage.from(bucket).remove(paths);
    if (error) throw new Error('No se pudieron limpiar las imágenes de prueba: ' + error.message);
  }
  if (fixtureUser) {
    const { data, error } = await admin.auth.admin.getUserById(fixtureUser.id);
    if (error || data.user?.email !== email || data.user?.user_metadata?.vigio_activation_qa !== run) throw new Error('No coincide el usuario temporal; no se elimina.');
    const { error: deleteError } = await admin.auth.admin.deleteUser(fixtureUser.id);
    if (deleteError) throw new Error('No se pudo limpiar el usuario temporal: ' + deleteError.message);
  }
  console.log('Limpieza completada: solo se retiraron el usuario y las imágenes temporales de esta prueba.');
}
