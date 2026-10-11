# Autenticación (OIDC)

Por defecto, TypeType usa cuentas locales (correo y contraseña). También puedes
conectar un proveedor de **OpenID Connect** como Authentik, Keycloak, Authelia o
Pocket ID, para que los usuarios inicien sesión con inicio de sesión único.

Es una configuración a nivel de instancia. Para el lado del usuario, consulta
[Inicio de sesión](/es/guide/accounts#single-sign-on-oidc).

## Conectar un proveedor {#connect-a-provider}

OIDC se activa en cuanto el emisor, el identificador de cliente y el secreto de
cliente están definidos en el **servidor API** (`typetype-server`). El archivo Compose
base estable no reenvía las variables OIDC desde `.env`, así que añade un
`docker-compose.override.yml` junto a él:

```yaml
services:
  typetype-server:
    environment:
      OIDC_ISSUER: ${OIDC_ISSUER}
      OIDC_CLIENT_ID: ${OIDC_CLIENT_ID}
      OIDC_CLIENT_SECRET: ${OIDC_CLIENT_SECRET}
      OIDC_PROVIDER_NAME: ${OIDC_PROVIDER_NAME:-OIDC}
      OIDC_SCOPES: ${OIDC_SCOPES:-openid email profile}
```

Después añade los valores a `.env`:

```dotenv
OIDC_ISSUER=https://identity.example.com
OIDC_CLIENT_ID=replace-with-client-id
OIDC_CLIENT_SECRET=replace-with-client-secret
OIDC_PROVIDER_NAME="Company login"
```

Server admite estas variables:

| Variable | Obligatoria | Por defecto | Qué es |
| --- | --- | --- | --- |
| `OIDC_ISSUER` | sí | - | La URL del emisor de tu proveedor (por ejemplo `https://id.example.com`). `OIDC_ISSUER_URL` también funciona. |
| `OIDC_CLIENT_ID` | sí | - | El identificador de cliente de tu proveedor |
| `OIDC_CLIENT_SECRET` | sí | - | El secreto de cliente de tu proveedor |
| `OIDC_DISCOVERY_URL` | no | `<issuer>/.well-known/openid-configuration` | Cámbiala solo si el descubrimiento está en otro lugar |
| `OIDC_SCOPES` | no | `openid email profile` | Ámbitos solicitados |
| `OIDC_PROVIDER_NAME` | no | `OIDC` | Nombre que se muestra en el botón «Sign in with...» |

Cuando están definidas, en la página de inicio de sesión aparece un botón **Sign in
with `OIDC_PROVIDER_NAME`**. Aplica el override con
`docker compose up -d --force-recreate typetype-server`.

## URI de redirección {#redirect-uri}

Registra estas URL de devolución de llamada en tu proveedor:

```text
https://<your-domain>/auth/oidc/callback
dev.typetype.android://oidc/callback
```

Usa tu dominio real (o `http://localhost:8082/auth/oidc/callback` para una prueba
local).

La devolución de llamada pertenece a la ruta del Frontend, no a `/api`, y debe
coincidir exactamente con la configuración del proveedor.

## Ejemplos de proveedores probados {#tested-provider-examples}

[arcoast](https://github.com/arcoast), miembro de la comunidad, probó tanto Authelia
como Pocket ID y publicó los ajustes del lado del proveedor que funcionan en la
[discusión #128](https://github.com/TypeType-Video/TypeType/discussions/128).

### Pocket ID {#pocket-id}

Crea un cliente confidencial con:

| Ajuste de Pocket ID | Valor |
| --- | --- |
| Callback URL | `https://watch.example.com/auth/oidc/callback` `dev.typetype.android://oidc/callback` |
| Client launch URL | `https://watch.example.com/` |
| Public client | desactivado |
| Requires re-authentication | desactivado |
| PKCE | desactivado |
| Logout callback | vacío |

Copia el identificador de cliente y el secreto generados por Pocket ID en las
variables de TypeType de arriba, y usa la URL base de Pocket ID como `OIDC_ISSUER`.

### Authelia {#authelia}

Crea un cliente confidencial de Authelia con la misma URL de devolución de llamada,
los ámbitos `openid`, `profile` y `email`, y autenticación `client_secret_post` en el
punto de acceso de tokens. Pon el valor aleatorio del secreto de cliente en
`OIDC_CLIENT_SECRET` de TypeType; configura su hash como secreto de cliente de
Authelia según la documentación OIDC actual de Authelia.

Los formatos de configuración de los proveedores pueden cambiar. Usa la discusión #128
como referencia probada con TypeType y la documentación actual del proveedor para su
esquema exacto.

## Duración de la sesión {#session-lifetime}

Después de iniciar sesión de forma local o con OIDC, el token de acceso dura una hora.
El navegador recibe además una cookie de renovación rotativa, así que la caducidad
normal del token de acceso debería pasar desapercibida. La sesión de renovación dura
30 días por defecto. Define `AUTH_SESSION_TTL_DAYS` en `.env` para elegir un valor de
1 a 365 días:

```dotenv
AUTH_SESSION_TTL_DAYS=90
```

Esta duración se aplica a las sesiones recién emitidas y a las renovadas. Las filas
existentes en la base de datos conservan su caducidad actual hasta la siguiente
renovación o inicio de sesión correctos.

La cookie de renovación es `HttpOnly`, `Secure` y `SameSite=None`. Por tanto, un
despliegue público necesita HTTPS, el `ALLOWED_ORIGINS` correcto y un proxy que
mantenga intactas las peticiones con credenciales. Consulta
[Cierres de sesión inesperados](./troubleshooting#unexpected-sign-outs) si se cierra
la sesión de un usuario mientras está activo.

Para una red local de confianza que no puede usar HTTPS, una opción de compatibilidad
explícita puede emitir la cookie de renovación sin `Secure` y con `SameSite=Lax`:

```dotenv
AUTH_ALLOW_INSECURE_COOKIES=true
```

::: danger
No actives esta opción en una red pública o no confiable. Las cookies de renovación de
las cuentas pueden viajar por HTTP sin cifrar. HTTPS sigue siendo el valor por defecto
compatible.
:::

Después de cambiar cualquiera de las dos variables, vuelve a crear Server:

```sh
docker compose up -d --force-recreate typetype-server
```

Esta explicación responde al comportamiento cuestionado por
[Toni-Vide en la discusión #162](https://github.com/TypeType-Video/TypeType/discussions/162) y verificado en el código de autenticación
actual.

## Opciones del administrador {#admin-options}

Dos opciones relacionadas están en la zona **Admin**, no en el entorno:

- **Desactivar el inicio de sesión local**: hace que el inicio de sesión único sea la
  única forma de entrar, de modo que nadie pueda usar correo y contraseña.
- **Redirigir automáticamente al proveedor**: omite por completo la página de inicio
  de sesión y envía a los usuarios directamente a tu proveedor.

::: warning
Antes de desactivar el inicio de sesión local, inicia sesión una vez con OIDC y
confirma que funciona. De lo contrario puedes quedarte fuera de la instancia.
:::
