export function safeAccountReturn(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/panel';
  try {
    const url = new URL(value, 'https://vigio.local');
    if (url.origin !== 'https://vigio.local' || !/^\/(panel|mi-cuenta|panel-mascota|panel-kids|p\/[a-zA-Z0-9_-]{6,50}|scan\/[a-zA-Z0-9_-]{6,50})$/.test(url.pathname)) return '/panel';
    return url.pathname + url.search;
  } catch { return '/mi-cuenta'; }
}
export function plateActivationPath(value) {
  let token = String(value || '').trim();
  if (/^https?:\/\//i.test(token)) {
    const url = new URL(token);
    const match = url.pathname.match(/^\/(?:p|scan)\/([a-zA-Z0-9_-]{6,50})\/?$/);
    if (!['vigio.cl','www.vigio.cl','localhost','127.0.0.1'].includes(url.hostname) || !match) throw new Error('Usa el código o la dirección de tu placa Vigio.');
    token = match[1];
  }
  if (!/^[a-zA-Z0-9_-]{6,50}$/.test(token)) throw new Error('Ingresa el código público de la placa, no el PIN.');
  return '/p/' + encodeURIComponent(token);
}
export function productCategory(p) {
  const tipo = p.tipo || p.perfil?.categoria || p.tipo_producto;
  if (tipo === 'persona' || tipo === 'nino' || tipo === 'kids') return 'personas';
  if (tipo === 'objeto' || tipo === 'equipaje') return 'objetos';
  if (tipo === 'mascota' || tipo === 'mascotas' || tipo === 'mascota_circular') return 'mascotas';
  return 'neutro';
}
export function profilePayload(p) {
  const text = key => String(p[key] || '').trim();
  if (!text('nombre') || !text('nombre_contacto') || !text('telefono_contacto')) throw new Error('Completa nombre, contacto y teléfono.');
  if (!['safe','lost'].includes(p.estado_alerta)) throw new Error('Estado de alerta inválido.');
  return Object.fromEntries(['nombre','raza_o_modelo','foto_url','audio_url','telefono_contacto','whatsapp_contacto','nombre_contacto','ciudad','mensaje_auxilio','alergias','cuidados_especiales','edad','comentarios_adicionales','tipo_sanguineo','enfermedades_condicion','nacionalidad','destino','estado_alerta'].map(k => [k, text(k)]));
}
export async function loadOwnedProducts(client) {
  const { data, error } = await client.rpc('vigio_mis_productos');
  if (error) throw new Error('No se pudieron cargar tus productos. Intenta actualizar.');
  return Array.isArray(data) ? data.map(row=>({...row,perfil:{...(row.perfil||{}),...(row.datos_perfil||{})}})) : [];
}
export async function saveOwnedProfile(client, id, profile) {
  const { data, error } = await client.rpc('vigio_actualizar_perfil', { p_placa_id: id, p_datos: profilePayload(profile) });
  if (error) throw new Error('No se pudieron guardar los cambios. Comprueba tu sesión.');
  if (!data?.ok) throw new Error(data?.error || 'No tienes permiso para modificar este producto.');
  return data;
}
export async function deleteOwnedProfile(client, id) {
  const { data, error } = await client.rpc('vigio_eliminar_datos_perfil', { p_placa_id: id });
  if (error) throw new Error('No se pudieron eliminar los datos. Comprueba tu sesión.');
  if (!data?.ok) throw new Error(data?.error || 'No tienes permiso para modificar este producto.');
  return data;
}
