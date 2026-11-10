import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAudio, validateEmailPair, validatePhoto, activationDraft, parseActivationDraft, DRAFT_TTL, MAX_AUDIO_BYTES } from '../src/lib/activationUtils.js';

test('email comparison trims whitespace and normalizes case; mismatches and malformed mail fail', () => {
  assert.equal(validateEmailPair(' Owner@Example.cl ', 'owner@example.cl'), '');
  assert.ok(validateEmailPair('owner@example.cl', 'another@example.cl'));
  assert.ok(validateEmailPair('', ''));
  assert.ok(validateEmailPair('bad-address', 'bad-address'));
});
test('only supported photo types and reasonable file sizes are accepted', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp']) assert.equal(validatePhoto({ type, size: 1024 }), '');
  assert.ok(validatePhoto({ type: 'image/svg+xml', size: 100 }));
  assert.ok(validatePhoto({ type: 'image/jpeg', size: 11 * 1024 * 1024 }));
});
test('voice audio accepts supported compressed audio and rejects oversized or unsupported files', () => {
  for (const type of ['audio/webm', 'audio/webm;codecs=opus', 'audio/ogg', 'audio/mp4', 'audio/mpeg']) {
    assert.equal(validateAudio({ type, size: 1024 }), '');
  }
  assert.ok(validateAudio({ type: 'audio/wav', size: 1024 }));
  assert.ok(validateAudio({ type: 'audio/webm', size: MAX_AUDIO_BYTES + 1 }));
});
test('OAuth draft keeps pet data, PIN and photo but excludes password and unrelated fields', () => {
  const now = Date.now();
  const value = activationDraft({ formData: { nombre: 'Luna', email: 'owner@example.cl', password: 'must-not-persist', unrelated: 'secret' }, pin: '123456', step: 2, photo: 'data:image/jpeg;base64,YQ==' }, now);
  const serialized = JSON.stringify(value);
  assert.ok(!serialized.includes('must-not-persist')); assert.ok(!serialized.includes('unrelated'));
  const restored = parseActivationDraft(serialized, now + 1000);
  assert.equal(restored.formData.nombre, 'Luna'); assert.equal(restored.pin, '123456');
  assert.equal(restored.step, 2); assert.equal(restored.photo, value.photo);
});
test('expired, corrupt or unsafe OAuth drafts are rejected', () => {
  const now = Date.now();
  const data = activationDraft({ formData: {}, pin: '123456', step: 2, photo: '' }, now);
  assert.equal(parseActivationDraft(JSON.stringify(data), now + DRAFT_TTL + 1), null);
  assert.equal(parseActivationDraft('{bad json'), null);
  assert.equal(parseActivationDraft(JSON.stringify({ ...data, expires: 'invalid' }), now), null);
  assert.equal(parseActivationDraft(JSON.stringify({ ...data, photo: 'javascript:alert(1)' }), now), null);
  assert.equal(parseActivationDraft(JSON.stringify({ ...data, pin: '123' }), now), null);
});
