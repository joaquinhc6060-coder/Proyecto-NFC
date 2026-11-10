# Panel Master Vigio

Rutas: `/admin-master` y `/gestion-vigio`. No requiere un enlace público en la navegación.

## Configurar

1. En Supabase debe existir el esquema `supabase/schema_vigio_100_placas.sql`. Si ya existe, no vuelvas a ejecutarlo: también genera 100 placas.
2. Ejecuta **una vez** `supabase/admin_master_security.sql` en el SQL Editor. Esta migración conserva las placas existentes, restringe la lectura de PIN y mueve la activación a funciones transaccionales. Despliega el frontend actualizado junto con esta migración: el formulario anterior usa accesos que ahora se revocan.

   Si la instalación anterior no tenía la columna `pin_activacion`, se añade sin asignar códigos inventados a las placas existentes. Esas filas aparecen como «Sin PIN legado»; las placas sin activar requieren asignar su PIN físico real antes de poder activarse. Los perfiles ya activados se conservan.

   Ejecuta después `supabase/admin_master_security_hardening.sql`: elimina políticas de escritura antiguas con otros nombres y conserva únicamente la actualización por dueño. Con `SUPABASE_ACCESS_TOKEN` local también puedes aplicar ambas mediante `node scripts/apply-admin-migration.mjs --apply` y `node scripts/apply-admin-migration.mjs --apply --harden`. Este token es una credencial de mantenimiento; no se necesita en Vercel.
3. En `.env` completa `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VIGIO_ADMIN_USERNAME` (el usuario solicitado), `VIGIO_ADMIN_EMAIL` (una cuenta técnica exclusiva) y `VIGIO_ADMIN_INITIAL_PASSWORD` (la contraseña solicitada). La clave service role está en la configuración de API de Supabase. No uses el prefijo `VITE_` para secretos.
4. Ejecuta `npm run admin:setup`. Crea una cuenta confirmada con `app_metadata.vigio_master = true`; no modifica usuarios existentes. Quita `VIGIO_ADMIN_INITIAL_PASSWORD` de `.env` después. La contraseña queda gestionada por Supabase Auth.
5. Ejecuta `npm run dev` y abre `/admin-master`. En Vercel configura las mismas variables del servidor, salvo la contraseña inicial, además de las variables públicas de Supabase ya usadas por la web. Luego despliega el proyecto. `npm run preview` solo sirve archivos estáticos y no ejecuta la API.

La sesión usa una cookie HttpOnly y dura lo que el access token de Supabase (habitualmente una hora). Al expirar se vuelve a pedir acceso. Cada operación comprueba el usuario y su permiso de administrador en el servidor. Para retirar acceso, elimina `vigio_master` en los metadatos de la cuenta. Cerrar sesión elimina la cookie del navegador; un token previamente copiado conserva su vigencia hasta expirar. Supabase Auth aplica sus límites de intentos de acceso.

## Uso

El botón **Generar CSV para proveedor** descarga `vigio_proveedor_FECHA.csv` con número de fila, tipo, token, URL completa de grabación NFC/QR y lote. Incluye todos los resultados de los filtros actuales, en todas las páginas. No incluye PIN ni datos de dueños. Sustituye al botón «CSV fábrica»; **CSV empaque (con PIN)** conserva su función para el equipo de empaque.

- Genera entre 1 y 500 placas por operación para mascotas, kids o restaurante. Tokens y PIN se generan con criptografía en el servidor; el INSERT del lote es atómico y la base de datos garantiza tokens únicos.
- El inventario se consulta cada 15 segundos mientras la pestaña está visible; también permite actualización manual. Incluye perfiles reales, estados fabricada/activada/bloqueada, filtros por producto, estado y lote, búsqueda y páginas de 50 filas.
- **CSV fábrica** incluye URLs para grabar y excluye PIN. **CSV empaque** incluye PIN. Ambos exportan todas las filas filtradas, aunque se vean en varias páginas. Son CSV UTF-8 compatibles con Excel; no son archivos `.xlsx`.
- Si una conexión se corta durante la creación, actualiza y busca el lote antes de volver a enviarlo. No se crean respaldos locales ni lotes ficticios.
- El PIN se valida en Supabase, con bloqueo de 15 minutos tras cinco errores por placa. La activación crea el perfil y cambia el estado en una misma transacción. El flujo actualizado no exige enlace de confirmación para cuentas nuevas: usa dos campos de correo iguales y contraseña, o acceso social cuando esté configurado. Ver `docs/acceso-social-y-fotos.md`.

## Verificar

`npm run test:admin` prueba permisos del endpoint, cookies, CSRF, paginación, lotes, colisiones, fallos de persistencia y exportación. `npm run build` comprueba el frontend.

Después de aplicar la migración en una base de prueba: comprobar que anon no puede leer `pin_activacion` ni insertar/actualizar placas; probar PIN incorrecto, bloqueo y PIN correcto; comprobar que dos activaciones concurrentes producen un solo perfil y que un nuevo escaneo muestra el perfil. Estas comprobaciones necesitan una instancia Supabase configurada y no se ejecutan con los tests unitarios.

`node scripts/test-admin-database.mjs` prueba los permisos, los tres productos, PIN, bloqueo y doble activación secuencial en Supabase dentro de una transacción que termina con ROLLBACK. No deja registros de prueba. `node scripts/check-admin-connection.mjs` comprueba tablas y acceso administrativo sin imprimir filas. `node scripts/verify-admin-live.mjs` comprueba el endpoint con una contraseña de prueba en `VIGIO_ADMIN_TEST_PASSWORD`, que debe quitarse después de usarla.

Referencias: [Functions Node.js de Vercel](https://vercel.com/docs/functions/runtimes/node-js), [claves y acceso a datos de Supabase](https://supabase.com/docs/guides/database/secure-data).

### Eliminar placas

El boton Eliminar y las casillas permiten borrar placas individuales o hasta 500 seleccionadas, con confirmacion previa. Se eliminan directamente en Supabase junto con los perfiles vinculados por la cascada existente; los enlaces NFC/QR dejan de funcionar. No se eliminan cuentas de usuarios. Cambiar filtros limpia la seleccion. Desplegar frontend y API juntos; no requiere volver a ejecutar el esquema SQL.

### Borrado masivo

La seleccion permite marcar filas al pulsarlas, seleccionar la pagina y seleccionar hasta 500 resultados filtrados. Borrar lote completo usa un selector independiente y elimina todas las placas de ese lote, sin aplicar los filtros de la tabla ni el limite de 500. Borrar todo el inventario elimina todas las placas. Ambas operaciones requieren confirmacion escrita (nombre exacto del lote o BORRAR TODO), validada tambien en el servidor. Cada borrado se realiza en una sola sentencia y devuelve el conteo exacto; conserva cuentas de usuarios y aplica la cascada existente de perfiles.
