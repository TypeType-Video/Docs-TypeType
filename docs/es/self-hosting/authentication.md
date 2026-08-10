# Sesiones de cuenta

Después de iniciar sesión de forma local o mediante OIDC, el token de acceso de
TypeType dura una hora. Una sesión de actualización renueva automáticamente ese
token sin pedir otro inicio de sesión.

## Duración de la sesión

La sesión de actualización dura 30 días de forma predeterminada. Puedes elegir una
duración de 1 a 365 días en `.env`:

```dotenv
AUTH_SESSION_TTL_DAYS=90
```

La nueva duración se aplica a las sesiones creadas o renovadas después del cambio.
Vuelve a crear Server para aplicar la configuración:

```sh
docker compose up -d --force-recreate typetype-server
```

## HTTPS y redes locales

De forma predeterminada, la cookie de actualización es `HttpOnly`, `Secure` y
`SameSite=None`. Usa HTTPS para cualquier instancia pública.

En una red local de confianza que no pueda usar HTTPS, una opción de compatibilidad
permite que la cookie funcione mediante HTTP con `SameSite=Lax`:

```dotenv
AUTH_ALLOW_INSECURE_COOKIES=true
```

::: danger
No actives esta opción en Internet ni en una red que no sea de confianza. La cookie
podría viajar por una conexión HTTP sin cifrar.
:::

Un cierre de sesión exactamente después de una hora suele indicar que la cookie de
actualización no fue enviada o aceptada. Comprueba también que `ALLOWED_ORIGINS`
contenga exactamente el origen del navegador.

La guía completa en inglés explica la
[autenticación](/self-hosting/authentication) y la
[resolución de cierres de sesión](/self-hosting/troubleshooting#unexpected-sign-outs).
