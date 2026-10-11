# Instalación manual

Esta página pone TypeType en marcha en tu propia máquina **a mano**, con Docker
Compose. La instalación básica es una secuencia corta de comandos. Todo lo que hacen
los scripts de ayuda del repositorio se explica aquí, así que nunca tienes que
ejecutar un script que no entiendas.

La pila crea las claves sensibles de YouTube durante su inicialización única. Una
instalación sin scripts debe generar por sí misma el secreto RPC de Garage, como se
muestra más abajo.

::: tip Recomendado: el script de instalación
Para la mayoría de la gente, el script de [Inicio rápido](./quick-start) es el camino
más fácil: hace por ti todo lo de esta página, incluido el almacén de objetos para las
descargas. Usa esta guía manual si quieres control total o entender cada paso.
:::

## Parte 1 - Ponerla en marcha {#part-1---get-it-running}

### 1. Descargar los archivos {#1-download-the-files}

El archivo Compose, `.env.example` y los scripts de la pila están en el repositorio
TypeType. La imagen web ya incluye la configuración de nginx compatible, y Compose
crea la configuración por defecto de Garage en un volumen con nombre. La pila descarga
imágenes ya construidas, así que no hay nada que compilar.

```sh
git clone https://github.com/TypeType-Video/TypeType.git
cd TypeType
```

### 2. Crear tu configuración {#2-create-your-configuration}

Copia el archivo de ejemplo. La mayoría de los valores por defecto ya sirven para una
instalación local; sustituye el marcador de Garage con el comando siguiente antes de
arrancar los servicios.

```sh
cp .env.example .env
```

Genera un secreto RPC de Garage único de 32 bytes en hexadecimal y sustituye su
marcador:

```sh
GARAGE_RPC_SECRET=$(openssl rand -hex 32)
sed -i "s/^GARAGE_RPC_SECRET=.*/GARAGE_RPC_SECRET=$GARAGE_RPC_SECRET/" .env
```

Este valor autentica el protocolo interno del clúster de Garage. El instalador
compatible lo genera automáticamente; este requisito se identificó gracias a
[la investigación de arcoast sobre Garage](https://github.com/TypeType-Video/TypeType/discussions/130).

::: tip Los dos marcadores de YouTube son automáticos
`YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN` y `YOUTUBE_SESSION_ENCRYPTION_KEY` se rellenan
**por ti** en el primer arranque. Un contenedor de inicialización los genera y Server
los lee de un volumen privado. Deja esos dos valores `SET_ME_...` sin cambios, salvo
que gestiones los secretos tú mismo.
:::

### 3. Inicializar y arrancar todo {#3-bootstrap-and-start-everything}

```sh
./scripts/run-stack-init.sh
docker compose up -d --remove-orphans --wait --wait-timeout 180
```

La inicialización ejecuta una tarea `typetype-init` de corta duración y la elimina
tras una ejecución correcta. Prepara el volumen privado de secretos, la configuración
de Garage y la base de datos de Downloader antes de que arranquen los servicios de
larga duración.

Comprueba que los servicios de larga duración están en marcha:

```sh
docker compose ps -a
```

Deberías ver `typetype`, `typetype-server`, `typetype-token`, `typetype-downloader`,
`postgres`, `dragonfly` y `garage`, todos `running` o `healthy`. El inicializador se
ejecutó con `--rm`, así que es normal que no aparezca en la lista tras una
inicialización correcta.

### 4. Abrirla y crear la cuenta de administrador {#4-open-it-and-create-the-admin-account}

Visita **`http://localhost:8082`**. En una instalación nueva, la aplicación detecta
que todavía no existe ninguna cuenta y te pide crear una. La **primera cuenta se
convierte en administrador** automáticamente, sin ningún paso adicional.

![La pantalla de registro en una instalación nueva](/screenshot-register.png)

Introduce un nombre, un correo y una contraseña, y después **Register**. Inicias
sesión de inmediato como administrador y llegas a la pantalla de bienvenida, desde
donde puedes importar tus datos.

![Sesión iniciada como administrador](/screenshot-onboarding.png)

El proceso completo, del formulario vacío a la página de inicio del administrador:

![Creación de la cuenta de administrador](/register-admin.gif)

Esa es toda la instalación básica. Para ponerla en un dominio real con HTTPS,
consulta [Proxy inverso y HTTPS](./reverse-proxy).

## Parte 2 - Almacén de objetos para las descargas {#part-2-object-storage-for-downloads}

La función de **descarga** necesita un almacén de objetos compatible con S3, que la
pila ya incluye (Garage). El [script de instalación](./quick-start) lo configura
automáticamente; los pasos manuales están abajo. Navegar y ver vídeos ya funciona, así
que puedes hacerlo ahora o más tarde, pero las descargas siguen desactivadas hasta que
esté hecho.

### 1. Generar una clave de acceso y un secreto {#1-generate-an-access-key-and-secret}

La clave de acceso debe empezar por `GK`.

```sh
echo "DOWNLOADER_S3_ACCESS_KEY=GK$(openssl rand -hex 12)"
echo "DOWNLOADER_S3_SECRET_KEY=$(openssl rand -hex 32)"
```

Pega las dos líneas en `.env`, sustituyendo los marcadores `SET_ME_ACCESS_KEY` y
`SET_ME_SECRET_KEY`, y después vuelve a crear los servicios afectados:

```sh
docker compose up -d
```

### 2. Aprovisionar Garage {#2-provision-garage}

Ejecuta esto una sola vez. Asigna almacenamiento, crea el bucket, registra tu clave y
le concede acceso. Garage lee la configuración inicializada mediante
`GARAGE_CONFIG_FILE`, así que la línea de comandos la usa automáticamente.

```sh
# alias corto para la línea de comandos de Garage dentro del contenedor
g() { docker compose exec -T garage /garage "$@"; }

# 1. dar al nodo una distribución de almacenamiento
NODE_ID=$(g node id | head -n1 | cut -d@ -f1)
g layout assign -z dc1 -c 20GB "$NODE_ID"
g layout apply --version 1

# 2. crear el bucket de descargas
g bucket create typetype-downloads

# 3. registrar la clave del paso 1 (usa TUS valores del .env)
g key import --yes -n typetype-downloader "<DOWNLOADER_S3_ACCESS_KEY>" "<DOWNLOADER_S3_SECRET_KEY>"

# 4. permitir que esa clave use el bucket
g bucket allow --read --write --owner --key "<DOWNLOADER_S3_ACCESS_KEY>" typetype-downloads
```

::: tip
`--version 1` es correcto en una instalación nueva. Si vuelves a ejecutar el paso de
distribución más adelante, usa uno más que la versión que muestra `g layout show`.
:::

Las descargas ya funcionan desde la interfaz.

El navegador descarga a través de la pasarela de Server. Garage sigue siendo interno;
no necesitas exponer el puerto 3900 públicamente ni configurar un punto de acceso S3
de cara al navegador.

## Parte 3 - Desplegar con Dockge {#deploy-with-dockge}

::: tip Crédito
Esta sección está adaptada del texto de [@BuggyPasta](https://github.com/BuggyPasta),
que recorrió todo el proceso de principio a fin en una instalación real de Dockge y lo
publicó en
[la continuación de la issue #254](https://github.com/TypeType-Video/TypeType/issues/254#issuecomment-5701725080)
y en la [discusión #277](https://github.com/TypeType-Video/TypeType/discussions/277).
Gracias.
:::

[Dockge](https://github.com/louislam/dockge) es una interfaz web para Docker Compose.
Puede gestionar la pila de TypeType junto a tus otras pilas, pero no sustituye a la
inicialización única de TypeType. Conserva los nombres de servicio y los archivos
oficiales para que las URL internas y los comandos de Garage sigan coincidiendo con la
pila compatible.

### 1. Preparar el directorio de la pila {#1-prepare-the-stack-directory}

Usa el directorio del host que está montado como directorio de pilas de Dockge. El
ejemplo siguiente crea una pila `typetype` bajo `$HOME/dockge-stacks`; elige otra ruta
si tu instalación de Dockge usa una distinta.

```sh
mkdir -p "$HOME/dockge-stacks"
git clone --depth 1 https://github.com/TypeType-Video/TypeType.git \
  "$HOME/dockge-stacks/typetype"
cd "$HOME/dockge-stacks/typetype"
cp .env.example .env
mkdir -p .typetype-migration
```

Genera el secreto de Garage antes de desplegar. Guarda el valor en `.env`; nunca lo
pegues en una issue pública ni en una captura de pantalla de Dockge.

```sh
GARAGE_RPC_SECRET=$(openssl rand -hex 32)
sed -i "s/^GARAGE_RPC_SECRET=.*/GARAGE_RPC_SECRET=$GARAGE_RPC_SECRET/" .env
```

Actualiza Dockge y selecciona la pila `typetype`. Edita `.env` desde Dockge o desde el
directorio de la pila, y pon en `ALLOWED_ORIGINS` el origen exacto que abrirán los
usuarios. No pegues ejemplos antiguos de Compose de la comunidad sobre el archivo
actual; el archivo Compose compatible ya contiene el flujo actual de `typetype-init`.

### 2. Ejecutar la inicialización única {#2-run-the-one-time-bootstrap}

Ejecuta esto una vez desde el directorio de la pila, antes de arrancar los servicios
de la aplicación:

```sh
./scripts/run-stack-init.sh
```

El comando ejecuta `typetype-init` con `--rm`. Genera los secretos de sesión de
YouTube, crea la configuración de Garage y crea la base de datos de Downloader. Es
seguro volver a ejecutarlo al actualizar la pila; los secretos y la configuración de
Garage existentes se conservan.

### 3. Arrancar y gestionar la pila en Dockge {#3-start-and-manage-the-stack-in-dockge}

Cuando la inicialización termine correctamente, usa la acción **Deploy** o **Start**
de Dockge. El comando equivalente en el host es:

```sh
docker compose up -d --remove-orphans --wait --wait-timeout 180
```

Comprueba la pila desde Dockge o con `docker compose ps`. El contenedor de
inicialización se elimina tras completarse, así que no tiene que seguir en marcha.
Conserva los volúmenes de PostgreSQL, Garage y secretos al parar o actualizar la pila;
nunca uses `docker compose down -v` para una actualización normal.

### 4. Actualizar la pila sin perder nada {#4-update-the-stack-without-losing-anything}

Usa la acción **Update** de Dockge, que descarga las imágenes nuevas y reinicia los
contenedores, y después ejecuta **System Prune** para recuperar el espacio en disco de
las capas de imagen antiguas.

::: warning Nunca hagas prune con la pila parada
La distribución de Garage y el registro del bucket viven en los mismos volúmenes con
nombre descritos en la [Parte 2](#part-2-object-storage-for-downloads), que el prune
no elimina. Pero si alguna vez haces prune con la pila parada, la recuperación segura
es simplemente volver a ejecutar los pasos de aprovisionamiento de Garage de la Parte
2: tarda unos segundos y no toca tus cuentas, tu historial ni tus ajustes.
:::

::: tip El identificador del nodo de Garage no es estable
Si alguna vez borras por completo el volumen de metadatos de Garage (no es una
actualización normal), el identificador de su nodo cambia y debes volver a ejecutar la
asignación de la distribución de la
[Parte 2](#part-2-object-storage-for-downloads) con el identificador recién generado,
no con uno de una ejecución anterior.
:::


## Configuración personalizada de nginx o Garage {#custom-nginx-or-garage-configuration}

Los valores por defecto compatibles no requieren archivos de configuración en el host.
Para personalizar cualquiera de los dos servicios, mantén los archivos personalizados
fuera de los archivos gestionados de la pila y móntalos con un
`docker-compose.override.yml`:

```yaml
services:
  typetype:
    volumes:
      - ./config/nginx.conf:/etc/nginx/conf.d/default.conf:ro
  garage:
    volumes:
      - ./config/garage.toml:/etc/garage/garage.toml:ro
```

Crea `config/nginx.conf` o `config/garage.toml` solo cuando la topología por defecto
no encaje con el despliegue. Compose carga el override automáticamente. Valida los
montajes resultantes antes de arrancar:

```sh
docker compose config -q
docker compose config
```

El instalador conserva `docker-compose.override.yml` y los archivos que no forman
parte de la pila gestionada. Incluye esos archivos en las copias de seguridad junto
con `.env`.

## Comandos del día a día {#everyday-commands}

```sh
docker compose pull && docker compose up -d   # actualizar a la última versión
docker compose logs -f typetype-server        # seguir los registros del servidor
docker compose down                           # parar (tus datos se conservan)
```
