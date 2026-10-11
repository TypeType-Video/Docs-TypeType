# Inicio rápido

La forma más rápida y **recomendada** de autoalojar TypeType es el script de
instalación. Prepara toda la pila por ti, secretos, puertos libres, servicios y el
almacén de objetos para las descargas, de modo que obtienes una instancia completa y
funcional con un solo comando.

::: tip ¿Prefieres hacerlo a mano?
Todo lo que hace el script también está documentado paso a paso en
[Instalación manual](./docker-compose), por si quieres control total o entender cada
parte.
:::

## Un comando {#one-command}

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash
```

El instalador:

- crea `~/typetype-stack` con el archivo Compose y los scripts de la pila,
- genera los secretos del descargador, del RPC de Garage y de la sesión de YouTube,
- elige puertos libres automáticamente cuando los predeterminados están ocupados,
- valida la configuración resultante y arranca todos los servicios,
- e inicializa Garage, para que **las descargas funcionen desde el primer momento**.

Es interactivo. Primero descarga y prepara los archivos de la pila, y después pide
confirmación antes de descargar las imágenes y arrancar los contenedores.

En una actualización, el instalador crea primero una copia de seguridad con marca de
tiempo de los archivos de la pila que gestiona y anota las referencias de las imágenes
actuales. Después espera a los servicios renovados y verifica sus puntos de versión
antes de terminar.

### Elegir el directorio {#stack-directory}

El instalador coloca la pila en `~/typetype-stack`. Ese es solo su valor por defecto:
pasa `--dir` para instalar donde quieras.

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --dir /srv/typetype
```

Los comandos de esta documentación usan `$STACK_DIR` para ese directorio. Defínela una
vez en tu terminal, con el valor por defecto o con el directorio que elegiste:

```sh
STACK_DIR=~/typetype-stack
```

Una instalación manual no tiene valor por defecto: `$STACK_DIR` es el directorio que
contiene tu `docker-compose.yml`.

### Solo descargar {#download-only}

Para obtener los archivos y revisarlos antes de arrancar Docker tú mismo:

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --download-only
```

## Comprobar que está en marcha {#check-it-is-up}

```sh
cd "$STACK_DIR"
docker compose ps
docker compose exec -T typetype-server wget -qO- http://127.0.0.1:8080/health
```

El segundo comando comprueba Server desde dentro de su contenedor, así que sigue
siendo correcto cuando el instalador elige otro puerto en el host.

## Crear la cuenta de administrador {#create-the-admin-account}

Abre la aplicación web (el instalador muestra la URL exacta, `http://localhost:8082`
por defecto). En una instalación nueva te pide crear una cuenta, y la **primera cuenta
se convierte en administrador** automáticamente.

![La pantalla de registro en una instalación nueva](/screenshot-register.png)

Introduce un nombre, un correo y una contraseña, y después **Register**. Has iniciado
sesión como administrador y llegas a la pantalla de bienvenida, desde donde puedes
importar tus datos.

![Sesión iniciada como administrador](/screenshot-onboarding.png)

El proceso completo:

![Creación de la cuenta de administrador](/register-admin.gif)

## Siguientes pasos {#next}

- Ponla en tu propio dominio con HTTPS: [Proxy inverso y HTTPS](./reverse-proxy).
- Ajusta puertos, base de datos y secretos: [Configuración](./configuration).
- Mantenla en buen estado: [Mantenimiento](./maintenance).
