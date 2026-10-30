# Inicio de sesión

Tus suscripciones, listas de reproducción, historial, y configuración están
vinculados a tu cuenta en la instancia.

## Cuenta local {#local-account}

Crea una cuenta con un nombre, correo electrónico, y contraseña, y luego inicia
sesión. En una instancia completamente nueva, la **primera cuenta se convierte en
administradora** (consulta
[Inicio rápido](/es/self-hosting/quick-start#create-the-admin-account)). Si olvidas tu
contraseña, usa el proceso de restablecimiento desde la página de inicio de sesión.

![La página de inicio de sesión](/screenshot-login.png)

El navegador mantiene la sesión de la cuenta renovada automáticamente. El token de
acceso de corta duración expira después de una hora, mientras que la sesión de
renovación dura 30 días. Si se cierra tu sesión mientras usas el sitio activamente,
eso no es un cierre de sesión normal por inactividad; pide al operador de la
instancia que revise
[Cierres de sesión inesperados](/es/self-hosting/troubleshooting#unexpected-sign-outs).

## Inicio de sesión único (OIDC) {#single-sign-on-oidc}

Si tu instancia lo tiene configurado, la página de inicio de sesión muestra un botón
**Iniciar sesión con...** para tu proveedor de identidad (Google, Authentik,
Keycloak, etc.). Un solo clic te inicia sesión, sin una contraseña separada que
gestionar.

Dependiendo de cómo lo haya configurado el administrador:

- la página puede **redirigir directamente a tu proveedor** (sin pantalla de inicio
  de sesión en absoluto),
- y las **cuentas locales pueden estar desactivadas**, así que el inicio de sesión
  único es la única forma de entrar.

Configurar esto es cosa del administrador, consulta
[Autenticación (OIDC)](/es/self-hosting/authentication).

## Conectar YouTube {#connect-youtube}

Los vídeos públicos de YouTube se reproducen sin cuenta de YouTube. Cuando YouTube
rechaza un vídeo sin iniciar sesión, por ejemplo uno con restricción de edad,
TypeType puede reproducirlo con una cuenta de YouTube que conectes. La página de
reproducción te lleva entonces a **Login**.

1. Abre **Login** en el menú lateral y selecciona **Connect with YouTube**.
2. TypeType muestra un código. Abre `google.com/device` en cualquier dispositivo e
   introdúcelo.
3. Elige la cuenta de YouTube y permite el acceso. El estado pasa a conectado.

Usa una cuenta de YouTube secundaria e introduce el código rápido: caduca a los pocos
minutos. La sesión de YouTube se queda cifrada en el servidor y nunca se envía a la
página web. **Disconnect** la elimina. Si YouTube deja de aceptar la sesión, la
página de reproducción te pide conectarla de nuevo.

![La página de inicio de sesión de YouTube con el botón Connect with YouTube](/screenshot-youtube-session.png)

La pestaña **BiliBili** en la parte superior de la misma página conecta una cuenta de
BiliBili.

## Tu perfil {#your-profile}

Desde tu perfil gestionas los detalles de tu cuenta. Los administradores también
obtienen un área **Admin** para revisar informes de errores y gestionar la instancia.
