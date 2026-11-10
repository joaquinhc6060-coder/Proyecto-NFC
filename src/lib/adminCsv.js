export function csvCell(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function inventoryCsv(devices, packaging = false) {
  const headers = ['Tipo', 'Token_NFC_QR', 'URL_Grabado', ...(packaging ? ['PIN_Secreto_Empaque'] : []), 'Estado', 'Lote', 'Fecha_Creacion'];
  const rows = devices.map(d => [d.tipo_producto, d.token, `https://vigio.cl/p/${d.token}`, ...(packaging ? [d.pin_activacion] : []), d.estado, d.lote, d.fecha_fabricacion]);
  return '\uFEFF' + [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
}

export function supplierCsv(devices) {
  const headers = ['Numero', 'Tipo', 'Token_NFC_QR', 'URL_Grabado_NFC_QR', 'Lote'];
  const rows = devices.map((d, index) => [index + 1, d.tipo_producto, d.token, `https://vigio.cl/p/${d.token}`, d.lote]);
  return '\uFEFF' + [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
}
