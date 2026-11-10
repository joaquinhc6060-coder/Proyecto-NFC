import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const catalog = JSON.parse(readFileSync(new URL('../src/data/products.json', import.meta.url), 'utf8'));
const { categories, products } = catalog;
const byId = new Map(products.map(p => [p.id, p]));

test('product ids are unique, URL-safe and belong to a known category', () => {
  assert.equal(byId.size, products.length);
  const categoryIds = new Set(categories.map(c => c.id));
  for (const p of products) {
    assert.match(p.id, /^[a-z0-9-]+$/, p.id);
    assert.ok(categoryIds.has(p.category), `${p.id} has unknown category ${p.category}`);
  }
});

test('catalog has the agreed products and launch prices', () => {
  const expected = {
    'placa-nfc-negra': 12990, 'placa-nfc-azul': 12990, 'pulsera-nfc': 12990,
    'pack-duo': 22990, 'pack-familia': 43990, 'pack-manada': 62990,
  };
  assert.deepEqual(Object.fromEntries(products.map(p => [p.id, p.price])), expected);
});

test('pack savings and per-unit prices match the commercial offer', () => {
  const offer = {
    'pack-duo': { regular: 25980, savings: 2990, unit: 11495 },
    'pack-familia': { regular: 51960, savings: 7970, unit: 10998 },
    'pack-manada': { regular: 77940, savings: 14950, unit: 10498 },
  };
  for (const [id, o] of Object.entries(offer)) {
    const p = byId.get(id);
    assert.equal(p.regularPrice, o.regular, id);
    assert.equal(p.regularPrice - p.price, o.savings, id);
    assert.equal(Math.round(p.price / p.units), o.unit, id);
  }
  assert.equal(byId.get('pack-duo').freeShipping, false);
  assert.equal(byId.get('pack-familia').freeShipping, true);
  assert.equal(byId.get('pack-manada').freeShipping, true);
});

test('complements exist and never repeat the current product', () => {
  for (const p of products) {
    assert.ok(p.complements.length > 0, `${p.id} has no complements`);
    for (const id of p.complements) {
      assert.ok(byId.has(id), `${p.id} references missing ${id}`);
      assert.notEqual(id, p.id, `${p.id} lists itself as complement`);
    }
  }
});

test('every product has a configurable viewer, colors and complete page content', () => {
  for (const p of products) {
    assert.ok(['flip', 'model', 'none'].includes(p.viewer.mode), p.id);
    assert.ok(p.colors.length >= 1, p.id);
    for (const c of p.colors) assert.match(c.hex, /^#[0-9a-f]{6}$/i, `${p.id}/${c.id}`);
    assert.ok(p.cardImages.length >= 1 && p.description && p.notice, p.id);
    assert.ok(p.features.length && p.specs.length, p.id);
  }
});

test('every gallery image and viewer face exists in public/', () => {
  const exists = path => existsSync(new URL(`../public${path}`, import.meta.url));
  for (const p of products) {
    assert.ok(p.gallery.length >= 2, `${p.id} gallery too short`);
    for (const item of p.gallery) {
      if (item.type) continue;
      assert.ok(item.alt, `${p.id} image without alt text`);
      assert.ok(exists(item.src), `${p.id} missing ${item.src}`);
    }
    for (const src of p.cardImages) assert.ok(exists(src), `${p.id} missing card image ${src}`);
    if (p.viewer.mode === 'flip') {
      for (const color of p.colors) {
        const folder = color.imagesFrom || p.id;
        for (const face of ['frente', 'reverso']) assert.ok(exists(`/assets/products/${folder}/${face}.webp`), `${p.id}/${color.id} missing ${face}`);
      }
    }
  }
});

test('bracelet specs use strap measures and never pet-plate fields', () => {
  const labels = byId.get('pulsera-nfc').specs.map(s => s.label);
  assert.deepEqual(labels, ['Largo de la correa', 'Ancho', 'Material', 'Resistencia al agua']);
});
