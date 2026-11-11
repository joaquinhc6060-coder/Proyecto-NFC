import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { datosEstructurados, enlaceWhatsApp, iniciales, resumenCalificacion } from '../src/lib/resenas.js';

const data = JSON.parse(readFileSync(new URL('../src/data/resenas.json', import.meta.url), 'utf8'));
const real = (n, extra = {}) => Array.from({ length: n }, (_, i) => ({ nombre: `Cliente ${i}`, texto: 'ok', estrellas: 5, verificada: true, plantilla: false, ...extra }));

test('resenas.json has the switch, the four templates and no invented review text', () => {
  assert.equal(typeof data.mostrarSeccion, 'boolean');
  assert.equal(data.resenas.length, 4);
  for (const r of data.resenas) {
    assert.equal(r.texto, 'Texto de la reseña (pendiente)');
    assert.equal(r.plantilla, true);
    assert.ok(r.estrellas >= 1 && r.estrellas <= 5);
    for (const k of ['nombre', 'ciudad', 'producto', 'texto', 'estrellas', 'foto', 'fecha', 'verificada']) assert.ok(k in r, `${r.nombre} missing ${k}`);
  }
});

test('rating summary needs 3+ real verified reviews and ignores templates', () => {
  assert.equal(resumenCalificacion(data.resenas), null);
  assert.equal(resumenCalificacion(real(2)), null);
  assert.equal(resumenCalificacion([...real(2), { estrellas: 5, verificada: true, plantilla: true }]), null);
  const r = resumenCalificacion([...real(2), ...real(1, { estrellas: 4 })]);
  assert.equal(r.cantidad, 3);
  assert.equal(r.texto, '4,7 · 3 reseñas');
});

test('structured data is never emitted while any template remains', () => {
  assert.equal(datosEstructurados(data.resenas), null);
  assert.equal(datosEstructurados([...real(3), data.resenas[0]]), null);
  const schema = datosEstructurados(real(3));
  assert.equal(schema.aggregateRating.reviewCount, 3);
  assert.equal(schema.review.length, 3);
});

test('WhatsApp link carries the message and skips placeholder numbers', () => {
  const msg = 'Hola, quiero dejar mi reseña de Vigio. Producto: ... Mi opinión: ...';
  assert.equal(enlaceWhatsApp('+56 9 XXXX XXXX', msg), `https://wa.me/?text=${encodeURIComponent(msg)}`);
  assert.equal(enlaceWhatsApp('+56 9 1234 5678', 'Hola'), 'https://wa.me/56912345678?text=Hola');
});

test('initials for avatars without photo', () => {
  assert.equal(iniciales('Ejemplo 1'), 'E1');
  assert.equal(iniciales('María José Pérez'), 'MJ');
  assert.equal(iniciales(''), '?');
});
