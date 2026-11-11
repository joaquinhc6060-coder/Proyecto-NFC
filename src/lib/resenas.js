// Lógica de reseñas sin dependencias de React (probada en tests/resenas.test.mjs).

export const MIN_VERIFICADAS_PARA_RESUMEN = 3;

const esReal = r => r && r.plantilla !== true;

// Resumen "4,9 · 12 reseñas": solo con 3 o más reseñas reales y verificadas.
export function resumenCalificacion(resenas = []) {
  const verificadas = resenas.filter(r => esReal(r) && r.verificada === true);
  if (verificadas.length < MIN_VERIFICADAS_PARA_RESUMEN) return null;
  const promedio = verificadas.reduce((suma, r) => suma + clampEstrellas(r.estrellas), 0) / verificadas.length;
  return {
    promedio: Math.round(promedio * 10) / 10,
    cantidad: verificadas.length,
    texto: `${(Math.round(promedio * 10) / 10).toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} · ${verificadas.length} reseñas`,
  };
}

// Datos estructurados schema.org: nunca mientras exista alguna tarjeta plantilla.
export function datosEstructurados(resenas = [], nombreMarca = 'Vigio') {
  if (!resenas.length || resenas.some(r => !esReal(r))) return null;
  const resumen = resumenCalificacion(resenas);
  if (!resumen) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: nombreMarca,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: resumen.promedio, reviewCount: resumen.cantidad, bestRating: 5, worstRating: 1 },
    review: resenas.filter(r => r.verificada === true).map(r => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.nombre },
      reviewBody: r.texto,
      reviewRating: { '@type': 'Rating', ratingValue: clampEstrellas(r.estrellas), bestRating: 5 },
      ...(r.fecha ? { datePublished: r.fecha } : {}),
    })),
  };
}

export const clampEstrellas = valor => Math.max(1, Math.min(5, Math.round(Number(valor) || 0)));

export function iniciales(nombre = '') {
  return nombre.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('') || '?';
}

// Enlace de WhatsApp con el mensaje escrito. Si el número aún es un marcador (+56 9 XXXX XXXX), abre sin destinatario.
export function enlaceWhatsApp(numero = '', mensaje = '') {
  const digitos = String(numero).replace(/\D/g, '');
  const valido = !/x/i.test(numero) && digitos.length >= 11;
  return `https://wa.me/${valido ? digitos : ''}?text=${encodeURIComponent(mensaje)}`;
}

export function formatoFecha(fecha) {
  if (!fecha) return '';
  const d = new Date(`${fecha}T12:00:00`);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
}
