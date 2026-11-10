import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'node:crypto';

const fail = (status, message) => Object.assign(new Error(message), { status });

function clientIp(req) {
  // Vercel writes this header at its edge. Locally, do not trust client headers.
  const forwarded = process.env.VERCEL === '1' ? req.headers['x-vercel-forwarded-for'] : '';
  return String(forwarded || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
}

export function createPinActivationHandler(clientFactory = createClient) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    try {
      if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); throw fail(405, 'Método no permitido.'); }
      if (req.headers['x-vigio-request'] !== 'pin-activation') throw fail(403, 'Solicitud no permitida.');
      if (req.headers.origin) {
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        if (new URL(req.headers.origin).host !== host) throw fail(403, 'Origen no permitido.');
      }
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const pin = typeof body.pin === 'string' ? body.pin : '';
      if (!/^[0-9]{6}$/.test(pin)) throw fail(400, 'Ingresa el PIN de 6 dígitos.');
      const cleanEnv = value => String(value || '').replace(/^\uFEFF/, '').trim();
      const url = cleanEnv(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
      const serviceKey = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
      if (!url || !serviceKey) throw fail(503, 'La activación no está configurada.');
      const secret = process.env.VIGIO_PIN_RATE_LIMIT_SECRET || serviceKey;
      const subject = createHmac('sha256', secret).update(clientIp(req)).digest('hex');
      const db = clientFactory(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
      const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
      const { data: userData, error: userError } = await db.auth.getUser(token);
      if (userError || !userData?.user?.id) throw fail(401, 'Inicia sesión para activar un producto.');
      const { data, error } = await db.rpc('vigio_resolver_placa_por_pin_servidor', { p_pin: pin, p_subject_hash: subject, p_usuario_id: userData.user.id });
      if (error) {
        console.error('Vigio PIN resolver RPC failed', { code: error.code, message: error.message });
        throw fail(502, 'No se pudo validar el PIN. Intenta nuevamente.');
      }
      if (data?.rate_limited) return res.status(429).json({ error: 'Demasiados intentos.', retry_at: data.retry_at });
      if (data?.used) return res.status(409).json({ error: 'Este PIN ya fue utilizado.' });
      if (data?.limit_reached) return res.status(409).json({ error: 'Tu cuenta ya alcanzó el máximo de 10 productos.' });
      if (!data?.ok || typeof data.token !== 'string') return res.status(401).json({ error: 'PIN incorrecto.', attempts_left: data?.attempts_left, retry_at: data?.retry_at });
      return res.status(200).json({ ok: true, token: data.token, tipo_producto: typeof data.tipo_producto === 'string' ? data.tipo_producto : '' });
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.status ? error.message : 'Error del servidor. Intenta nuevamente.' });
    }
  };
}

export default createPinActivationHandler();
