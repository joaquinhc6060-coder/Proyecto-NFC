import test from 'node:test';
import assert from 'node:assert/strict';
import { createBatch, createHandler } from '../api/vigio-admin.js';
import { inventoryCsv, supplierCsv, csvCell } from '../src/lib/adminCsv.js';

process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-server-key';
process.env.VIGIO_ADMIN_USERNAME = 'test-admin';
process.env.VIGIO_ADMIN_EMAIL = 'master@example.test';
test('supplier CSV contains only manufacturing fields and never exports secrets or owner data', () => {
  const csv = supplierCsv([{ tipo_producto: 'kids', token: 'kid-abc', lote: 'LOTE,1', pin_activacion: '987654', owner_id: 'private-owner', perfiles_vigio: { nombre: 'private-name' } }]);
  assert.equal(csv, '\uFEFF"Numero","Tipo","Token_NFC_QR","URL_Grabado_NFC_QR","Lote"\r\n"1","kids","kid-abc","https://vigio.cl/p/kid-abc","LOTE,1"');
  for (const secret of ['PIN', '987654', 'private-owner', 'private-name']) assert.ok(!csv.includes(secret));
});
const user = { email: 'master@example.test', app_metadata: { vigio_master: true } };

async function request(body, { client = {}, headers = {}, method = 'POST', authenticated = true } = {}) {
  const res = { headers: {}, statusCode: 200, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; } };
  const req = { method, body, headers: { host: 'localhost:5173', 'x-vigio-request': 'admin', ...(authenticated ? { cookie: 'vigio_master_session=valid-token' } : {}), ...headers } };
  await createHandler(() => ({ auth: { getUser: async () => ({ data: { user }, error: null }), ...client.auth }, ...client }))(req, res);
  return res;
}

test('all product batches have unique schema-compatible tokens and six digit PINs', () => {
  for (const category of ['mascotas', 'kids', 'restaurante']) {
    const batch = createBatch({ quantity: 500, category, batch: '  LOTE-TEST  ' });
    assert.equal(new Set(batch.map(d => d.token)).size, 500);
    for (const item of batch) {
      assert.ok(item.token.length <= 16);
      assert.match(item.pin_activacion, /^[1-9][0-9]{5}$/);
      assert.equal(item.estado, 'fabricada'); assert.equal(item.lote, 'LOTE-TEST');
    }
  }
});
test('invalid batch requests cannot reach an INSERT', () => {
  for (const quantity of [0, -1, 501, 2.5, NaN, '10']) assert.throws(() => createBatch({ quantity, category: 'kids', batch: 'LOTE' }));
  for (const batch of ['', ' ', 'x'.repeat(51), null]) assert.throws(() => createBatch({ quantity: 1, category: 'kids', batch }));
  assert.throws(() => createBatch({ quantity: 1, category: 'invalid', batch: 'LOTE' }));
});
test('factory CSV excludes PIN; packaging includes PIN; both escape commas, quotes, newlines and formulas', () => {
  const devices = [{ token: 'vg123', pin_activacion: '123456', lote: '=SUM(1,2)\n"lote"' }];
  const factory = inventoryCsv(devices); const packaging = inventoryCsv(devices, true);
  assert.ok(factory.startsWith('\uFEFF')); assert.ok(!factory.includes('123456'));
  assert.ok(packaging.includes('123456')); assert.ok(factory.includes('https://vigio.cl/p/vg123'));
  assert.equal(csvCell('=1+1'), '"\'=1+1"');
  assert.ok(factory.includes('""lote""'));
});
test('inventory and generation require a server-verified session', async () => {
  for (const action of ['list', 'generate', 'delete', 'delete-batch', 'delete-all']) assert.equal((await request({ action }, { authenticated: false })).statusCode, 401);
  const invalid = { auth: { getUser: async () => ({ data: { user: { ...user, app_metadata: {} } }, error: null }) } };
  assert.equal((await request({ action: 'list' }, { client: invalid })).statusCode, 401);
});
test('CSRF and unsupported methods are rejected', async () => {
  assert.equal((await request({ action: 'logout' }, { headers: { 'x-vigio-request': '' } })).statusCode, 403);
  assert.equal((await request({ action: 'logout' }, { headers: { origin: 'https://evil.test' } })).statusCode, 403);
  assert.equal((await request({}, { method: 'GET' })).statusCode, 405);
});
test('login uses Auth and issues HttpOnly cookie; logout expires it', async () => {
  const client = { auth: { signInWithPassword: async () => ({ data: { user, session: { access_token: 'signed.jwt', expires_in: 3600 } } }) } };
  const res = await request({ action: 'login', user: 'test-admin', pass: 'example' }, { client, authenticated: false });
  assert.equal(res.statusCode, 200); assert.match(res.headers['Set-Cookie'], /HttpOnly; SameSite=Strict/);
  assert.ok(!JSON.stringify(res.body).includes('signed.jwt'));
  assert.match((await request({ action: 'logout' })).headers['Set-Cookie'], /Max-Age=0/);
});
test('wrong password and non-admin accounts cannot obtain an admin cookie', async () => {
  for (const result of [
    { data: { user: null }, error: { status: 400 } },
    { data: { user: { ...user, app_metadata: {} } }, error: null },
    { data: { user: null }, error: { status: 429 } },
  ]) {
    const res = await request({ action: 'login', user: 'test-admin', pass: 'wrong' }, {
      authenticated: false, client: { auth: { signInWithPassword: async () => result } },
    });
    assert.equal(res.statusCode, result.error?.status === 429 ? 429 : 401);
    assert.equal(res.headers['Set-Cookie'], undefined);
  }
});
test('list reads beyond one Supabase page', async () => {
  let pages = 0;
  const query = { select() { return this; }, order() { return this; }, async range(start) { pages++; return { data: Array.from({ length: start === 0 ? 500 : 1 }, (_, i) => ({ token: String(start + i) })), error: null }; } };
  const res = await request({ action: 'list' }, { client: { from: () => query } });
  assert.equal(res.body.devices.length, 501); assert.equal(pages, 2);
});
test('database failures are errors; only collisions retry atomically', async () => {
  let calls = 0;
  const payload = { action: 'generate', quantity: 3, category: 'kids', batch: 'TEST' };
  const client = { from: () => ({ insert: async rows => { assert.equal(rows.length, 3); calls++; return { error: calls === 1 ? { code: '23505' } : null }; } }) };
  const res = await request(payload, { client }); assert.equal(res.statusCode, 201); assert.equal(calls, 2);
  const failure = await request(payload, { client: { from: () => ({ insert: async () => ({ error: { code: '42501' } }) }) } });
  assert.equal(failure.statusCode, 502); assert.ok(!failure.body.count);
});

const deleteId = '12345678-1234-1234-1234-123456789abc';
test('delete rejects empty, oversized and invalid selections before accessing the database', async () => {
  for (const ids of [undefined, [], [null], [''], ['id'], [deleteId, 'invalid'], Array(501).fill(deleteId)]) {
    const res = await request({ action: 'delete', ids }, { client: { from() { assert.fail('Invalid selection reached database'); } } });
    assert.equal(res.statusCode, 400);
  }
});
test('delete removes only explicit IDs in one database statement and reports confirmed rows', async () => {
  let calls = 0;
  const res = await request({ action: 'delete', ids: [deleteId, deleteId] }, { client: { from(table) {
    assert.equal(table, 'placas_vigio');
    return { delete() { calls++; return this; }, in(column, ids) { assert.equal(column, 'id'); assert.deepEqual(ids, [deleteId]); return this; },
      async select(columns) { assert.equal(columns, 'id'); return { data: [{ id: deleteId }], error: null }; } };
  } } });
  assert.equal(calls, 1); assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { count: 1, deletedIds: [deleteId] });
});
test('delete reports database failures without claiming success', async () => {
  const res = await request({ action: 'delete', ids: [deleteId] }, { client: { from: () => ({ delete() { return this; }, in() { return this; }, select: async () => ({ data: null, error: { code: '23503' } }) }) } });
  assert.equal(res.statusCode, 502); assert.equal(res.body.count, undefined);
});

test('bulk delete validates scope and typed confirmation before accessing database', async () => {
  for (const body of [
    { action: 'delete-all' }, { action: 'delete-all', confirmation: 'wrong' },
    { action: 'delete-batch', batch: '', confirmation: '' },
    { action: 'delete-batch', batch: 'LOTE', confirmation: 'OTHER' },
    { action: 'delete-batch', batch: 'x'.repeat(51), confirmation: 'x'.repeat(51) },
  ]) {
    const res = await request(body, { client: { from() { assert.fail('Invalid bulk deletion reached database'); } } });
    assert.equal(res.statusCode, 400);
  }
});
test('bulk delete uses exact batch equality or explicit all scope and counts beyond return limits', async () => {
  for (const all of [false, true]) {
    let calls = 0;
    const query = {
      delete(options) { assert.deepEqual(options, { count: 'exact' }); calls++; return this; },
      async eq(column, value) { assert.equal(all, false); assert.equal(column, 'lote'); assert.equal(value, 'LOTE-1'); return { count: 1501, error: null }; },
      async not(column, operator, value) { assert.equal(all, true); assert.deepEqual([column, operator, value], ['id', 'is', null]); return { count: 2000, error: null }; },
    };
    const res = await request({ action: all ? 'delete-all' : 'delete-batch', batch: 'LOTE-1', confirmation: all ? 'BORRAR TODO' : 'LOTE-1' }, { client: { from(table) { assert.equal(table, 'placas_vigio'); return query; } } });
    assert.equal(res.statusCode, 200); assert.equal(res.body.count, all ? 2000 : 1501); assert.equal(calls, 1);
  }
});
test('bulk delete database failure never claims success', async () => {
  const res = await request({ action: 'delete-all', confirmation: 'BORRAR TODO' }, { client: { from: () => ({ delete() { return this; }, not: async () => ({ count: null, error: { code: '23503' } }) }) } });
  assert.equal(res.statusCode, 502); assert.equal(res.body.count, undefined);
});
