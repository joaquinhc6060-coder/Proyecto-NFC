# Activación de placas: correo, Google, Facebook y fotos

El formulario conserva el PIN de empaque. En el paso 1 se elige una foto con el selector nativo del teléfono o PC; no se pide una URL ni permiso general sobre la galería. Se admiten JPG, PNG y WEBP de hasta 10 MB, se reducen a JPEG de 1200 píxeles como máximo y se muestra una vista previa. La foto se sube después de iniciar sesión, al guardar la placa.

En el paso 2 se puede usar Google, Facebook o correo con contraseña. Por correo se escribe la dirección dos veces y debe coincidir; los registros nuevos no reciben enlace de confirmación. Las cuentas que ya existían sin confirmar siguen siendo cuentas anteriores pendientes: no se modifican usuarios existentes de forma masiva.

Antes de salir a Google o Facebook se conserva un borrador durante 30 minutos en la pestaña, con los datos, el PIN y la foto preparada. Nunca se guarda la contraseña en ese borrador. Al volver a la misma placa se recupera el paso de contacto y se muestra la cuenta conectada; el dueño pulsa Guardar y activar. La sesión social no activa la placa por sí sola.

## Crear las credenciales de Google

1. Entra en [Google Cloud Console](https://console.cloud.google.com/) y crea o selecciona un proyecto para Vigio.
2. Configura Google Auth Platform: nombre de la aplicación, correo de soporte y audiencia. Si la aplicación sigue en pruebas, añade los correos que van a probarla.
3. Crea un cliente OAuth de tipo **Aplicación web**. En URI de redirección autorizados añade la URL de callback de Supabase: `https://klpajsulcwdmcevouyok.supabase.co/auth/v1/callback`. Se encuentra en Supabase → Authentication → Sign In / Providers → Google. No es `/p/token` ni el dominio de la web.
4. Conserva Client ID y Client Secret en `.env` como `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.
5. Antes de abrirlo al público, revisa el estado de publicación y los requisitos de marca/audiencia de Google.

Referencia oficial: [Google con Supabase](https://supabase.com/docs/guides/auth/social-sign-in/auth-google).

## Crear las credenciales de Facebook

1. Entra en [Meta for Developers](https://developers.facebook.com/apps/) y crea una aplicación que incluya Facebook Login.
2. Configura Facebook Login para web y añade como **Valid OAuth Redirect URI** la misma URL de callback de Supabase: `https://klpajsulcwdmcevouyok.supabase.co/auth/v1/callback`.
3. Configura los datos públicos que Meta solicite, como dominio, política de privacidad y eliminación de datos. El inicio de sesión debe proporcionar el permiso `email` requerido por Supabase.
4. Guarda App ID y App Secret en `.env` como `FACEBOOK_CLIENT_ID` y `FACEBOOK_CLIENT_SECRET`.
5. Mientras la aplicación esté en modo desarrollo, prueba con los usuarios/roles permitidos. Para usuarios reales, completa los requisitos de publicación que indique Meta.

Referencia oficial: [Facebook con Supabase](https://supabase.com/docs/guides/auth/social-sign-in/auth-facebook).

## Conectar las credenciales

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
```

No llevan prefijo `VITE_` y no se deben pegar en el chat. Después de guardarlas:

```sh
node scripts/configure-activation.mjs --apply
```

El script configura los proveedores que tengan ID y secreto, desactiva la confirmación por correo, conserva las direcciones de retorno existentes y añade las de activación de Vigio. También prepara el bucket público `vigio-mascotas` y sus políticas de subida por dueño. Hasta que existan las credenciales, los botones sociales avisan que la opción no está disponible y se puede continuar por correo.

En producción se debe desplegar el frontend actualizado. Las claves OAuth quedan configuradas en Supabase y no se envían al navegador. El PIN sigue validándose en la base de datos al activar.

## Comprobaciones

`npm run test:activation`: correos iguales, formatos y límites de fotos, borrador de retorno OAuth y exclusión de contraseñas.

`node scripts/test-activation-live.mjs`: crea una cuenta temporal, comprueba sesión inmediata, sube una imagen de prueba, comprueba su acceso público y rechaza subidas sin sesión o en otra carpeta. Al terminar elimina exclusivamente el usuario y los archivos creados por esa ejecución.

Google y Facebook deben probarse con cuentas reales una vez configuradas las aplicaciones. El selector nativo se debe comprobar en los dispositivos objetivo; el código no solicita permisos de cámara ni de acceso completo a las fotos.
