# Requisitos previos

**Idiomas:** [English](/self-hosting/prerequisites) ·
[Français](/fr/self-hosting/prerequisites) · Español

## Sistemas compatibles

TypeType necesita un sistema Linux de 64 bits. Las imágenes publicadas son compatibles
con `linux/amd64` y `linux/arm64`; el instalador selecciona automáticamente la
configuración de caché para ARM64 cuando es necesaria. No se requiere una GPU.

::: tip Raspberry Pi
Una Raspberry Pi 4 o 5 de 64 bits con al menos 4 GiB de RAM puede ejecutar una
instancia personal pequeña. Usa un SSD USB 3 en lugar de una tarjeta microSD para
Docker, PostgreSQL y los datos de Garage.
:::

## Dimensionamiento de recursos

Estas cifras representan los recursos totales del sistema para toda la pila Compose:
aplicación web, Server, Token, Downloader, PostgreSQL, caché y Garage. Son objetivos de
dimensionamiento, no límites estrictos.

| Perfil | Procesador | RAM | Espacio libre antes de las descargas | Uso adecuado |
| --- | --- | --- | --- | --- |
| Instancia personal pequeña | 2 vCPU | 4 GiB | 20 GiB en SSD | Una o dos reproducciones simultáneas y descargas ocasionales |
| Recomendado | 4 vCPU | 8 GiB | 40 GiB en SSD | Varios usuarios, actualizaciones de suscripciones y descargas frecuentes |
| Uso intensivo | 8+ vCPU | 16+ GiB | 100+ GiB más la capacidad de los artefactos | Muchas sesiones simultáneas o descargas grandes y repetidas |

El mínimo de 4 GiB deja margen sobre el consumo normal de la pila completa y los picos
breves de Server o Token. El uso del procesador suele ser moderado, pero la extracción,
la actualización de muchas suscripciones, el inicio de reproducciones y el multiplexado
de descargas pueden coincidir. Dimensiona el sistema para los usuarios simultáneos, no
solo para los contenedores en reposo.

La reproducción no carga ni almacena el vídeo completo en memoria. Por tanto, un vídeo
de diez horas no necesita diez horas de RAM; las sesiones simultáneas y sus búferes
activos son los que aumentan el uso de memoria.

## Almacenamiento y descargas largas

Reserva espacio de disco para cuatro usos diferentes:

- Las imágenes Docker y el margen necesario para descargar una actualización antes de
  eliminar las capas antiguas.
- PostgreSQL, la caché y los metadatos de la aplicación.
- Los archivos de trabajo de Downloader mientras descarga y multiplexa las pistas de
  audio y vídeo por separado.
- Los archivos terminados en el volumen de Garage.

Calcula el tamaño final del archivo a partir de su tasa de bits total:

```text
tamaño en GB decimales ≈ tasa en Mbit/s × duración en horas × 0,45
```

| Ejemplo | Tamaño final aproximado |
| --- | --- |
| 10 horas de audio a 128 kbit/s | 0,58 GB |
| 10 horas de audio a 256 kbit/s | 1,15 GB |
| 10 horas de vídeo 4K a 20 Mbit/s | 90 GB, más el audio |
| 10 horas de vídeo 4K a 40 Mbit/s | 180 GB, más el audio |

La resolución por sí sola no determina el tamaño del archivo; la tasa de bits
seleccionada es el factor decisivo.

Con el almacenamiento local de Garage incluido, una descarga de vídeo puede ocupar
temporalmente unas tres veces su tamaño final en el mismo sistema: las pistas
descargadas, el archivo multiplexado y el objeto de Garage pueden coexistir hasta que
termine el trabajo. Una descarga de solo audio puede necesitar temporalmente unas dos
veces su tamaño final. La pila permite dos descargas simultáneas de forma
predeterminada, así que deja espacio para que ambas coincidan.

`S3_ARTIFACT_TTL_SECONDS=7200` controla la caducidad de la URL del archivo. No es una
cuota de almacenamiento y no elimina automáticamente el objeto de Garage. Elimina los
trabajos de descarga terminados cuando ya no necesites sus archivos. Supervisa Garage
y el almacenamiento de Docker, especialmente antes de una descarga 4K larga:

```sh
df -h
docker stats --no-stream
docker system df -v
docker compose exec -T garage /garage -c /etc/garage.toml status
```

## Capacidad de red

El tráfico de reproducción de YouTube pasa por el sistema TypeType. Para un usuario
remoto, el servidor recibe el contenido seleccionado y vuelve a enviarlo; tanto la
capacidad de descarga como la de subida deben cubrir la suma de las tasas de las
reproducciones activas, más el margen del protocolo. En una instalación doméstica, la
velocidad de subida suele ser el factor limitante.

Por ejemplo, una reproducción de 40 Mbit/s necesita aproximadamente 40 Mbit/s de
entrada y 40 Mbit/s de salida mientras se reproduce. Dos reproducciones iguales
necesitan aproximadamente el doble. Deja margen adicional para la extracción, las
miniaturas, las descargas y los demás usuarios.

## Software necesario

Instala las siguientes herramientas en el sistema:

- **Docker Engine** 24+ y el complemento **Docker Compose v2** (`docker compose`, no
  el antiguo `docker-compose`).
- **curl**, para ejecutar el instalador compatible.
- **git**, para clonar el repositorio.
- **openssl**, para generar secretos. Está preinstalado en la mayoría de
  distribuciones; si no, la guía también incluye una alternativa con Python.

Comprueba las versiones instaladas:

```sh
docker --version
docker compose version
curl --version
openssl version
git --version
```

Si `docker compose version` falla, instala el complemento Compose de tu distribución
antes de continuar.

## Opcional para una instalación pública

- Un **nombre de dominio** que apunte al servidor.
- Un proxy inverso (Caddy, nginx o Traefik) para terminar TLS. Este paso se explica en
  la [guía del proxy inverso y HTTPS](/self-hosting/reverse-proxy). Para una instalación
  exclusivamente local, puedes usar `http://localhost:8082`.

::: warning Ejecutar Docker sin root
Añade tu usuario al grupo `docker`
(`sudo usermod -aG docker "$USER"` y vuelve a iniciar sesión) para no tener que usar
`sudo` en cada comando.
:::
