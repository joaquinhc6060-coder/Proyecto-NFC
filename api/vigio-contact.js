import { createClient } from '@supabase/supabase-js';

const clean = (value) => String(value || '').replace(/^\uFEFF/, '').trim();
const fail = (status, message) => Object.assign(new Error(message), { status });
const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
const recentRequests = new Map();

function getText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function allowRequest(req) {
  const ip = String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const record = recentRequests.get(ip) || [];
  const active = record.filter((time) => now - time < 10 * 60 * 1000);
  if (active.length >= 5) return false;
  active.push(now);
  recentRequests.set(ip, active);
  return true;
}

async function sendEmail(apiKey, payload) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw fail(502, 'No pudimos enviar el correo. Inténtalo nuevamente en unos minutos.');
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); throw fail(405, 'Método no permitido.'); }
    if (!allowRequest(req)) throw fail(429, 'Has enviado varios mensajes. Espera unos minutos e inténtalo nuevamente.');

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    if (getText(body.company, 100)) return res.status(200).json({ ok: true }); // Honeypot: no revelar el filtro.

    const nombre = getText(body.name, 100);
    const email = getText(body.email, 254).toLowerCase();
    const telefono = getText(body.phone, 40);
    const asunto = getText(body.subject, 140) || 'Consulta general';
    const mensaje = getText(body.message, 3000);
    if (!nombre || !mensaje || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw fail(400, 'Completa tu nombre, correo válido y mensaje para poder enviarlo.');

    const url = clean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
    const serviceKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
    const resendApiKey = clean(process.env.RESEND_API_KEY);
    const from = clean(process.env.VIGIO_CONTACT_FROM_EMAIL);
    const to = clean(process.env.VIGIO_CONTACT_TO_EMAIL);
    if (!url || !serviceKey) throw fail(503, 'El formulario no está configurado todavía.');
    if (!resendApiKey || !from || !to) throw fail(503, 'El correo de contacto está en configuración. Inténtalo nuevamente más tarde.');

    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const detail = [`Asunto: ${asunto}`, `Nombre: ${nombre}`, telefono ? `Teléfono: ${telefono}` : '', `Mensaje: ${mensaje}`].filter(Boolean).join('\n');
    const { error: databaseError } = await admin.from('contactos').insert([{ email, producto_interes: detail, origen: 'web_contacto' }]);
    if (databaseError) {
      // Diagnóstico interno para Vercel: no registrar los datos ingresados por
      // la persona ni secretos, sólo el motivo entregado por Supabase.
      console.error('[vigio-contact] Supabase insert failed', {
        code: databaseError.code || null,
        message: databaseError.message || 'Sin detalle',
        hint: databaseError.hint || null,
      });
      throw fail(500, 'No pudimos registrar tu mensaje. Inténtalo nuevamente en unos minutos.');
    }

    const safe = { nombre: escapeHtml(nombre), email: escapeHtml(email), telefono: escapeHtml(telefono || 'No informado'), asunto: escapeHtml(asunto), mensaje: escapeHtml(mensaje).replace(/\n/g, '<br>') };
    await sendEmail(resendApiKey, {
      from,
      to: [to],
      reply_to: email,
      subject: `[Vigio] ${asunto}`,
      html: `<h2>Nueva consulta desde vigio.cl</h2><p><strong>Nombre:</strong> ${safe.nombre}</p><p><strong>Correo:</strong> ${safe.email}</p><p><strong>Teléfono:</strong> ${safe.telefono}</p><p><strong>Asunto:</strong> ${safe.asunto}</p><p><strong>Mensaje:</strong><br>${safe.mensaje}</p>`,
    });
    await sendEmail(resendApiKey, {
      from,
      to: [email],
      subject: 'Recibimos tu mensaje · Vigio',
      html: `<h2>Hola, ${safe.nombre}</h2><p>Recibimos tu consulta sobre <strong>${safe.asunto}</strong>.</p><p>Gracias por escribirnos. Te responderemos por este correo apenas sea posible.</p><p>— Equipo Vigio</p>`,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('[vigio-contact]', error);
    return res.status(error.status || 500).json({ error: error.status ? error.message : 'Error del servidor. Inténtalo nuevamente.' });
  }
}
