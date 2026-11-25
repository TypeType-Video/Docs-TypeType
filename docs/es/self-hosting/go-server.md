# Servidor Go (experimental)

TypeType Server también existe en Go: [TypeType-Server-Go](https://github.com/TypeType-Video/TypeType-Server-Go).
Responde a la misma API con la misma base de datos, los mismos ajustes y los mismos secretos, así que la
aplicación web y las aplicaciones de Android y TV funcionan con él sin cambios. Es experimental: el
servidor Kotlin sigue siendo el predeterminado, y puede volver a él en cualquier momento.

## Antes de empezar {#requirements}

| Recurso | Cantidad |
| --- | --- |
| Memoria | Unos 200 MB |
| Disco | Unos 30 MB para la imagen |

Qué cambia en su stack: el contenedor `typetype-server` usa la imagen Go. En su primer arranque añade
una tabla, `go_schema_state`, a la base de datos y deja todo lo demás como está.

Haga primero una copia de la base de datos ([Copias de seguridad](./maintenance#database)) si la instancia está en uso.

## Pasar al servidor Go {#install}

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --server go
```

El instalador conserva esta elección en las actualizaciones siguientes. El servidor Go tiene sus propias
versiones: sigue su última versión publicada e ignora `--version` y `--rc`. Con `--beta`, sigue sus
imágenes beta.

## Volver atrás {#switch-back}

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --server kotlin
```

Lo que el servidor Go escribió sigue siendo legible por el servidor Kotlin.

## A mano {#install-by-hand}

Añada `docker-compose.go.yml` a los archivos de Compose que ya usa:

```sh
docker compose -f docker-compose.yml -f docker-compose.go.yml --env-file .env up -d typetype-server
```

## Conviene saber {#differences}

- Los registros del servidor van a la salida del contenedor (`docker compose logs typetype-server`), no a archivos.
