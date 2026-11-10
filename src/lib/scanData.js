export function whatsappNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return /^9\d{8}$/.test(digits) ? '56' + digits : digits;
}
export async function loadPublicPlate(client, token) {
  const { data: device, error } = await client.from('placas_vigio').select('id,token,estado,tipo_producto,owner_id,fecha_activacion').eq('token',token).maybeSingle();
  if (error) throw new Error('No se pudo consultar la placa. Comprueba tu conexión.');
  if (!device) throw new Error('No encontramos esta placa. Revisa el código o contacta a Vigio.');
  if (device.estado === 'bloqueada') throw new Error('Esta placa está bloqueada. Contacta a Vigio.');
  const { data: p, error: profileError } = await client.from('perfiles_vigio').select('*').eq('placa_id', device.id).maybeSingle();
  if (profileError) throw new Error('No se pudo cargar la ficha. Vuelve a intentar.');
  if (!p && (device.estado === 'fabricada' || device.estado === 'sin_datos')) return { device, profile: null };
  if (!p || device.estado !== 'activada') throw new Error('Esta placa tiene datos pendientes de revisión. Contacta a Vigio.');
  return { device, profile: {
    type: p.categoria === 'persona' || p.categoria === 'nino' || device.tipo_producto === 'kids' ? 'kids' : p.categoria === 'objeto' ? 'objeto' : p.categoria === 'mascota' ? 'mascota' : 'neutro',
    producto: device.tipo_producto, placa_id: device.id, nombre: p.nombre,
    especie: p.raza_o_modelo || 'Perfil protegido', foto: p.foto_url || '/images/vigio-logo.jpg',
    alerta: p.estado_alerta, mensaje_auxilio: p.mensaje_auxilio, acerca_de: p.cuidados_especiales || p.mensaje_auxilio || '',
    audio_url: p.audio_url || p.mensaje_voz_url || '', comentarios_adicionales: p.comentarios_adicionales || '', edad: p.edad || '',
    alergias: p.alergias ? [p.alergias] : [], medicamentos: p.cuidados_especiales ? [p.cuidados_especiales] : [],
    owner_nombre: p.nombre_contacto, owner_telefono: p.telefono_contacto, owner_whatsapp: whatsappNumber(p.whatsapp_contacto || p.telefono_contacto), owner_alt_nombre: p.segundo_contacto_nombre || '', owner_alt_telefono: p.segundo_contacto_telefono || '', owner_alt_whatsapp: whatsappNumber(p.segundo_contacto_telefono || ''), owner_ciudad: p.ciudad,
    ciudad: p.ciudad, grupo_sanguineo: p.tipo_sanguineo || 'No informado', alergia_severa: p.alergias || 'Sin información registrada', mensaje_padres: p.mensaje_auxilio,
    mama_telefono: p.telefono_contacto, papa_telefono: p.whatsapp_contacto || p.telefono_contacto,
  } };
}
