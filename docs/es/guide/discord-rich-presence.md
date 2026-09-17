# Discord Rich Presence

Muestra lo que estás viendo en TypeType como tu estado de Discord: título, canal, y un
enlace de vuelta al vídeo. Utiliza un pequeño complemento de escritorio,
[TypeType RPC](https://github.com/TypeType-Video/TypeType-RPC), que se comunica con
Discord a través de su conexión local, el mismo mecanismo que usan Spotify o un
videojuego.

## Qué necesitas

- Una cuenta de TypeType. Los invitados no pueden crear una clave de presencia.
- [Discord de escritorio](https://discord.com/download), o un cliente compatible como
  [Vesktop](https://vesktop.dev/), ejecutándose en el mismo equipo.
- La aplicación [TypeType RPC](https://github.com/TypeType-Video/TypeType-RPC)
  instalada.

## Crear una clave de presencia

1. Abre **Configuración**, luego **API**.
2. En **Acceso a la presencia**, nombra la clave para reconocerla más tarde, luego
   **Crear clave**.
3. Copia la clave. Empieza por `ttp1_`, y es la única vez que la verás, TypeType solo
   guarda su hash.

![Creación de una clave de presencia](/screenshot-presence-key-created.png)

Puedes tener hasta 10 claves activas a la vez. Revoca cualquiera en cualquier momento
desde la misma pantalla, de forma independiente a tus sesiones de inicio de sesión.

## Conectar TypeType RPC

1. Instala y abre [TypeType RPC](https://github.com/TypeType-Video/TypeType-RPC).
2. Haz clic en el icono de la bandeja del sistema, luego en **Configuración…**.
3. Introduce la URL de tu instancia y la clave que acabas de crear, luego
   **Guardar**.
4. Activa **Compartir en Discord**.

![La ventana de configuración de TypeType RPC](/screenshot-rpc-settings.png)

El uso compartido se reanuda automáticamente la próxima vez que abras la aplicación,
así que esta es una configuración que solo haces una vez.

## Qué puede ver

El alcance de la clave es `presence:read`, de solo lectura y muy limitado: lo que se
está reproduciendo, su título, canal y posición, nada más. No puede ver tu historial,
suscripciones, datos de la cuenta ni tu sesión, y TypeType RPC solo consulta el
servidor mientras su propio interruptor está activado.

## Solución de problemas

- **No aparece nada en Discord**: los botones de Rich Presence y la tarjeta de
  actividad son invisibles en tu *propio* perfil, es una limitación de Discord, no
  un fallo. Pide a un amigo que lo compruebe, o mira tu perfil desde una segunda
  cuenta.
- **La aplicación no puede conectarse**: TypeType RPC se comunica con Discord a través
  de una conexión local, así que Discord (o Vesktop) debe estar ejecutándose primero
  en el mismo equipo.
