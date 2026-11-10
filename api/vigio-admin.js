import { createClient } from '@supabase/supabase-js';
import { randomInt } from 'node:crypto';

const COOKIE = 'vigio_master_session';
const fields = 'id,token,pin_activacion,estado,tipo_producto,lote,fecha_fabricacion,fecha_activacion,perfiles_vigio(nombre,nombre_contacto)';
const fail = (status, message) => Object.assign(new Error(message), { status });

export function createBatch({ quantity, category, batch }) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 500) throw fail(400, 'La cantidad debe ser un entero entre 1 y 500.');
  if (!['mascotas', 'kids', 'restaurante'].includes(category)) throw fail(400, 'Línea de producto inválida.');
  if (typeof batch !== 'string' || !batch.trim() || batch.trim().length > 50) throw fail(400, 'El lote debe tener entre 1 y 50 caracteres.');
  const chars = '23456789abcdefghjkmnpqrstuvwxyz';
  const prefix = { mascotas: 'vg', kids: 'kid-', restaurante: 'rest-' }[category];
  const used = new Set();
  return Array.from({ length: quantity }, () => {
    let token;
    do { token = prefix + Array.from({ length: 10 }, () => chars[randomInt(chars.length)]).join(''); } while (used.has(token));
    used.add(token);
    return { token, pin_activacion: String(randomInt(100000, 1000000)), tipo_producto: category, estado: 'fabricada', lote: batch.trim() };
  });
}

export function createHandler(clientFactory = createClient) {
return async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vary', 'Cookie');
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const cookie = (value, age) => res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(value)}; Path=/api/vigio-admin; HttpOnly; SameSite=Strict; Max-Age=${age}${secure}`);
  try {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); throw fail(405, 'Método no permitido.'); }
    if (req.headers['x-vigio-request'] !== 'admin') throw fail(403, 'Solicitud no permitida.');
    if (req.headers.origin) {
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      if (new URL(req.headers.origin).host !== host) throw fail(403, 'Origen no permitido.');
    }
    const { action, ...input } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (action === 'logout') { cookie('', 0); return res.status(200).json({ ok: true }); }
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const username = process.env.VIGIO_ADMIN_USERNAME;
    const email = process.env.VIGIO_ADMIN_EMAIL;
    if (!url || !key || !username || !email) throw fail(503, 'Falta configurar el servidor del panel. Consulta docs/admin-master.md.');
    const db = clientFactory(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    if (action === 'login') {
      if (typeof input.user !== 'string' || typeof input.pass !== 'string' || input.user.length > 100 || input.pass.length > 256) throw fail(400, 'Datos de acceso inválidos.');
      if (input.user.trim() !== username) throw fail(401, 'Usuario o contraseña incorrectos.');
      const { data, error } = await db.auth.signInWithPassword({ email, password: input.pass });
      if (error || data.user?.app_metadata?.vigio_master !== true) throw fail(error?.status === 429 ? 429 : 401, error?.status === 429 ? 'Demasiados intentos. Espera antes de volver a ingresar.' : 'Usuario o contraseña incorrectos.');
      cookie(data.session.access_token, data.session.expires_in);
      return res.status(200).json({ ok: true });
    }
    const raw = (req.headers.cookie || '').split(';').map(part => part.trim()).find(part => part.startsWith(`${COOKIE}=`));
    const token = raw ? decodeURIComponent(raw.slice(COOKIE.length + 1)) : '';
    if (!token) throw fail(401, 'Inicia sesión para continuar.');
    const { data: { user }, error: authError } = await db.auth.getUser(token);
    if (authError || user?.app_metadata?.vigio_master !== true || user.email !== email) { cookie('', 0); throw fail(401, 'Tu sesión terminó. Vuelve a ingresar.'); }
    // Login ends in its own request; getUser(token) does not attach a user session.
    if (action === 'session') return res.status(200).json({ ok: true });
    if (action === 'list') {
      const devices = [];
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await db.from('placas_vigio').select(fields).order('fecha_fabricacion', { ascending: false }).order('id').range(offset, offset + 499);
        if (error) throw fail(502, 'No se pudo cargar el inventario de Supabase.');
        devices.push(...data);
        if (data.length < 500) break;
      }
      return res.status(200).json({ devices });
    }
    if (action === 'delete-batch' || action === 'delete-all') {
      const all = action === 'delete-all';
      if (!all && (typeof input.batch !== 'string' || !input.batch.trim() || input.batch.length > 50)) {
        throw fail(400, 'Selecciona un lote válido.');
      }
      if (input.confirmation !== (all ? 'BORRAR TODO' : input.batch)) throw fail(400, 'La confirmación no coincide.');
      let query = db.from('placas_vigio').delete({ count: 'exact' });
      query = all ? query.not('id', 'is', null) : query.eq('lote', input.batch);
      const { count, error } = await query;
      if (error || !Number.isInteger(count)) throw fail(502, 'No se pudo confirmar el borrado. Actualiza el inventario antes de reintentar.');
      return res.status(200).json({ count });
    }
    if (action === 'delete') {
      if (!Array.isArray(input.ids) || input.ids.length < 1 || input.ids.length > 500 ||
          input.ids.some(id => typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))) {
        throw fail(400, 'Selecciona entre 1 y 500 placas válidas para eliminar.');
      }
      const ids = [...new Set(input.ids)];
      // One DELETE statement: related profiles follow the existing database cascade.
      const { data, error } = await db.from('placas_vigio').delete().in('id', ids).select('id');
      if (error) throw fail(502, 'No se pudo confirmar la eliminación en Supabase. Actualiza el inventario antes de reintentar.');
      return res.status(200).json({ count: data.length, deletedIds: data.map(row => row.id) });
    }
    if (action === 'generate') {
      // A single INSERT is atomic. Retry only token collisions; never hide a DB failure.
      for (let attempt = 0; attempt < 3; attempt++) {
        const rows = createBatch(input);
        const { error } = await db.from('placas_vigio').insert(rows);
        if (!error) return res.status(201).json({ count: rows.length });
        if (error.code !== '23505') throw fail(502, 'No se pudo guardar el lote en Supabase. No se confirmó la creación.');
      }
      throw fail(409, 'No se pudo reservar un lote de tokens únicos. Intenta nuevamente.');
    }
    throw fail(400, 'Acción inválida.');
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.status ? error.message : 'Error del servidor. Intenta nuevamente.' });
  }
};
}

export default createHandler();
