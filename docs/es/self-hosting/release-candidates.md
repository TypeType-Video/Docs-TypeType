# Versiones candidatas

Una versión candidata, o rc, es la próxima versión de TypeType antes del día de su
publicación. Usa las imágenes que se van a publicar, así que puedes probar una versión
antes y avisar de lo que falla antes de que todos actualicen. La instancia oficial
también funciona con las versiones candidatas.

| Opción | Imágenes | Cambia | Para |
| --- | --- | --- | --- |
| **Última versión** | `:latest`, `:1.16.0` | Solo el día de una versión | El uso diario |
| **Versiones candidatas** | `:rc`, `:1.16.0-rc.1` | Cuando un componente está listo para la próxima versión | Probar la próxima versión antes |
| **Una versión** | `:1.15.0` | Nunca, hasta que elijas otra | Quedarse en una versión a propósito |
| **Beta** | `-beta:latest` | Con cada push a `dev` | El desarrollo, puede romperse |

Una versión candidata solo recibe lo que está listo para la próxima versión, así que es
más estable que la beta. Aun así puede tener errores: haz una copia de seguridad de la
base de datos antes de cambiar, consulta [Copias de seguridad](./maintenance#backups).
Cómo se preparan las candidatas se explica en
[Ramas y versiones](/es/project/releases#how-a-release-is-made).

## Elegir tu versión {#choose-your-version}

Ejecuta el instalador como siempre. Te pregunta qué versión quieres:

```text
[install] Which TypeType version do you want?
[install]   1) The latest release, recommended for everyday use
[install]   2) The release candidates, the next version before its release
[install]   3) One version that never changes until you pick another one
Choose 1, 2 or 3 [1]:
```

Elige `2` para las versiones candidatas. El instalador escribe `TYPETYPE_VERSION=rc` en
`.env`, para que las cuatro imágenes de TypeType usen la etiqueta `:rc`, y toma los
archivos del stack de las versiones candidatas de la rama `staging`. Vuelve a
ejecutarlo más tarde para cambiar: propone tu elección actual por defecto. Tu `.env`,
tus puertos y tus volúmenes de datos se quedan como están.

Un valor `TYPETYPE_*_IMAGE` en `.env` sigue teniendo prioridad para su imagen. Quita esas
líneas, o déjalas vacías, para que todas las imágenes sigan tu elección.

## Sin preguntas {#without-questions}

Para scripts e instalaciones automáticas, elige con una opción y añade `--yes`:

| Opción | Efecto |
| --- | --- |
| `--rc` | Seguir las versiones candidatas |
| `--latest` | Volver a seguir la última versión |
| `--version 1.15.0` | Quedarse en una versión |

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --rc --yes --dir "$STACK_DIR"
```

`$STACK_DIR` es el directorio de tu stack, `~/typetype-stack` salvo que hayas elegido
otro. Estas opciones no se pueden combinar con `--beta`.

## Actualizar {#update}

Vuelve a ejecutar el instalador. Un stack con las versiones candidatas mantiene los
archivos de `staging` al volver a ejecutar el instalador, incluso con `--yes`. Sin el
instalador, descarga y recrea el stack:

```sh
cd "$STACK_DIR"
docker compose pull
docker compose up -d --wait --wait-timeout 180
```

Una nueva versión candidata sustituye las imágenes `:rc`, así que cada actualización trae
la más reciente.

## Comprobar qué ejecutas {#check-what-you-run}

```sh
curl -fsS http://localhost:8082/api/version/server
```

El campo `version` muestra la versión candidata, por ejemplo `1.16.0-rc.1`. El mismo
endpoint existe para `web`, `token` y `downloader`.

## Volver a la última versión {#go-back-to-the-latest-release}

Ejecuta el instalador y elige `1`, o pasa `--latest`. Una versión candidata puede
modificar la base de datos, así que volver a una versión anterior puede necesitar la
copia de seguridad que hiciste antes de cambiar: consulta
[Revertir una actualización](./rollback).

Después de una publicación, la última versión y la última versión candidata tienen el
mismo código: puedes quedarte en las versiones candidatas para seguir probando la
siguiente versión.

## Informar de un problema {#report-a-problem}

Abre un [issue](https://github.com/TypeType-Video/TypeType/issues) con las versiones de
`/api/version` e indica que usas una versión candidata. Consulta
[Informar de problemas](./reporting-issues).
