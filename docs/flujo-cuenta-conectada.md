# Sesión única y productos del dueño

`/login` es el único acceso de usuarios. Una contraseña incorrecta mantiene al usuario en el formulario con un error: no redirige por el texto del correo, datos de ejemplo o banderas locales. Google y Facebook usan la misma sesión Supabase cuando sus aplicaciones estén configuradas.

`/mi-cuenta` reúne los productos de la cuenta. Las rutas anteriores `/panel-mascota`, `/panel-kids`, `/admin` y `/dashboard-restaurante` abren ese panel autenticado. No contienen otro login ni mascotas ficticias. El prototipo comercial de restaurantes se conserva separado en `/demo/restaurante`, marcado como demostración; su CRM, IA y Wallet de ejemplo no son datos de la cuenta ni se presentan como servicios de producción.

El botón de usuario en la navegación abre Mis productos cuando hay sesión. Cerrar sesión llama realmente a Supabase. La sesión se conserva en el mismo origen del navegador: `localhost:5173`, `localhost:5175` y el dominio de producción son orígenes distintos y cada uno tiene su propia sesión.

## Activar y gestionar

Desde Activar placa se ingresa el token público o una dirección QR/NFC válida y se abre `/p/:token`. No se crea una cuenta desconectada de una placa ni se asignan roles desde el correo. El flujo valida el PIN, recoge los datos e inicia sesión o registra la cuenta. Al guardar, la activación transaccional asigna el mismo usuario a la placa y al perfil y abre Mis productos.

Cada producto muestra sus datos reales y permite editar el nombre, contactos, cuidados, foto y estado de alerta. Guardar actualiza `perfiles_vigio`; un nuevo escaneo abre esa misma información. La ficha de emergencia es pública y no exige iniciar sesión. Compartir ubicación pide permiso al navegador y prepara un mensaje para el WhatsApp real del contacto; el rescatista debe enviarlo en WhatsApp.

Una placa desconocida, bloqueada o con datos inconsistentes muestra un mensaje de error. No se transforma en una placa ficticia ni una ficha de demostración.

## Base de datos

La migración `supabase/owner_account.sql` añade:

- `vigio_mis_productos()`: lista únicamente las placas y perfiles cuyo dueño coincide con `auth.uid()`, sin PIN.
- `vigio_actualizar_perfil(uuid,jsonb)`: permite al dueño editar campos autorizados, sin cambiar token ni propietarios.
- Una entrada autenticada para `vigio_activar_placa`. La implementación atómica existente queda privada.

Aplicar **después** de las migraciones de seguridad anteriores:

```sh
node scripts/apply-admin-migration.mjs --apply --account
node scripts/configure-account-redirects.mjs
```

No volver a aplicar migraciones anteriores para sustituir las funciones actuales. El registro de migraciones en Supabase es la referencia del estado aplicado. Los productos históricos sin dueño no se asignan por coincidencias de nombre o correo: requieren identificar al titular.

## Comprobaciones

`npm test` comprueba los módulos de cuenta, activación y administración. `node scripts/test-owner-account-live.mjs` usa dos cuentas temporales, activa tres tipos de productos, comprueba edición y ficha pública, aislamiento entre cuentas, cierre y restauración de sesión. Elimina exclusivamente sus propios registros al terminar. `node scripts/test-admin-database.mjs` comprueba PIN y activación dentro de una transacción con ROLLBACK.

La configuración OAuth de Google y Facebook y el despliegue en Vercel siguen siendo requisitos separados; ver `docs/acceso-social-y-fotos.md`.
