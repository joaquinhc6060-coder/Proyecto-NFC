import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

const env = { ...loadEnv('development', process.cwd(), ''), ...process.env };
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
if (!url || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Falta la URL de Supabase o SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}
const db = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
let failed = false;
for (const table of ['placas_vigio', 'perfiles_vigio']) {
  const { count, error } = await db.from(table).select('id', { count: 'exact', head: true });
  console.log(JSON.stringify({ tabla: table, filas: count, error: error ? { codigo: error.code, mensaje: error.message } : null }));
  if (error) failed = true;
  if (!error) {
    const { data: sample, error: sampleError } = await db.from(table).select('*').limit(1);
    console.log(JSON.stringify({ tabla: table, columnas: sample?.[0] ? Object.keys(sample[0]) : [], error: sampleError?.message || null }));
  }
}
const { error: inventoryError } = await db.from('placas_vigio')
  .select('id,token,pin_activacion,estado,tipo_producto,lote,fecha_fabricacion,fecha_activacion,perfiles_vigio(nombre,nombre_contacto)').limit(1);
console.log(JSON.stringify({ consultaInventario: !inventoryError, error: inventoryError ? { codigo: inventoryError.code, mensaje: inventoryError.message } : null }));
if (inventoryError) failed = true;
const { error } = await db.auth.admin.listUsers({ page: 1, perPage: 1 });
console.log(JSON.stringify({ accesoAuthAdmin: !error, error: error ? { codigo: error.code, mensaje: error.message } : null }));
if (error) failed = true;
process.exitCode = failed ? 1 : 0;
