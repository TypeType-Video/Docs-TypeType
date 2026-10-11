# Informar de problemas

Todas las incidencias viven en un solo lugar:
**[TypeType-Video/TypeType](https://github.com/TypeType-Video/TypeType/issues)**.

Ábrelo todo allí, tanto si se trata de la aplicación web como de la API o las
descargas, y elige el formulario que corresponda.

Nunca tienes que adivinar qué parte falla. Si un informe resulta ser específico del
backend, los mantenedores se encargan a partir de ahí.

Hay dos formas de informar:

- Abrir una incidencia **directamente en GitHub**, en el enlace de arriba.
- Usar el **informador dentro de la aplicación**, descrito a continuación.

## Desde dentro de la aplicación {#from-inside-the-app}

La forma más rápida de señalar algo es la acción integrada **Report a bug**, por
ejemplo desde la barra de acciones de la página de reproducción. Abre un formulario
corto, y no necesitas una cuenta de GitHub para usarlo.

Solo rellenas dos cosas:

- una **categoría**, una entre Player, Audio Language, Subtitles, Interface o
  Functionality,
- una breve **descripción** de lo que salió mal.

La aplicación recoge todo lo demás por ti. El informe captura automáticamente la
página o el vídeo en el que estabas, tu navegador e idioma, el estado del reproductor
y cualquier registro reciente de fallos o errores de la API, todo recopilado en el
navegador mientras usas la aplicación. Nunca tienes que buscar detalles técnicos a
mano.

Cuando lo envías, el informe se guarda en tu instancia. Lo que ocurre después:

1. El informe se guarda en tu instancia.
2. Un administrador revisa los informes enviados en la zona **Admin**.
3. Desde un informe, un administrador puede abrir una **incidencia de GitHub
   prerrellenada**: la aplicación construye un enlace `issues/new` para el repositorio
   que tengas configurado, con el título, un cuerpo prerrellenado (el informe y su
   contexto), una petición de la etiqueta `bug` y, cuando `GITHUB_ISSUE_TEMPLATE` está
   definido, esa plantilla. GitHub solo aplica las etiquetas pedidas por URL cuando la
   persona que abre el enlace tiene permiso. El generador oculta los nombres de host
   de las URL y el texto con forma de dominio que reconoce antes de poner el informe
   en esa URL. Revisa siempre el resultado antes de publicarlo.

No hace falta ningún token de GitHub: la aplicación solo genera el enlace
prerrellenado; la incidencia se crea cuando alguien la envía en GitHub.

### Configuración {#configuration}

Dos variables deciden adónde apuntan los informes hechos desde la aplicación (consulta
[Configuración](./configuration#bug-reports)):

| Variable | Por defecto | Significado |
| --- | --- | --- |
| `GITHUB_REPO` | `TypeType-Video/TypeType` | Repositorio al que apunta la incidencia prerrellenada |
| `GITHUB_ISSUE_TEMPLATE` | `bug_report_backend.md` | Nombre del archivo de plantilla que se añade actualmente al enlace |

Para mantener todos los informes de los usuarios en el único gestor de incidencias de
arriba, deja `GITHUB_REPO` con su valor por defecto. Usa tu propio fork si llevas un
gestor aparte.

## Hacer útil un informe {#make-a-report-useful}

- Indica si estás en el canal **main** o **beta** (consulta
  [Beta y main](./beta-and-main)).
- Incluye los pasos para reproducirlo, lo que esperabas y lo que ocurrió.
- Para problemas de reproducción, anota el vídeo, el proveedor (YouTube, NicoNico,
  BiliBili) y la calidad.
- Mira en `docker compose logs typetype-server` si hay un error en torno al momento en
  que ocurrió.
- Incluye las revisiones de los componentes desplegados cuando el problema pueda
  depender de una actualización:

  ```sh
  curl -fsS https://watch.example.com/api/version
  curl -fsS https://watch.example.com/api/version/web
  curl -fsS https://watch.example.com/api/version/server
  curl -fsS https://watch.example.com/api/version/token
  curl -fsS https://watch.example.com/api/version/downloader
  ```

  Sustituye el origen de ejemplo y quita los nombres de host privados antes de
  publicar. Estos puntos de acceso contienen metadatos de compilación, no
  credenciales.

## Cómo se organizan las incidencias {#how-issues-are-organised}

Cada incidencia se clasifica con etiquetas, para que el gestor siga siendo fácil de
recorrer:

- **Tipo**, qué clase de informe es: `bug`, `feature request`, `enhancement`,
  `documentation` o `question`. Los formularios centrales de GitHub ponen su etiqueta
  automáticamente. El enlace actual de la aplicación solo pide `bug`, sujeto a la
  regla de permisos de GitHub de arriba.
- **Área**, qué parte toca: `area: frontend`, `area: backend`, `area: token` o
  `area: downloader`. Los mantenedores la añaden durante la clasificación, así que tú
  nunca tienes que hacerlo.
- **Prioridad**: `priority: high`, `priority: medium` o `priority: low`.

En la práctica, la mayoría de los informes tratan de **la aplicación web y la
reproducción**, el reproductor, las listas, los subtítulos, las importaciones y la
interfaz, con una parte menor sobre el **backend** (la extracción y la API). Los
informes se clasifican y la gran mayoría se corrigen y se cierran, así que un informe
claro se convierte de verdad en una corrección.

Los informes que mejoran de forma apreciable una explicación o un diagnóstico se
reconocen en [Fuentes de la comunidad y agradecimientos](/es/project/community).

### ¿Quieres contribuir? {#want-to-contribute}

Hay dos etiquetas que conviene seguir:

- [`good first issue`](https://github.com/TypeType-Video/TypeType/issues?q=is%3Aopen+label%3A%22good+first+issue%22), puntos de partida asequibles.
- [`help wanted`](https://github.com/TypeType-Video/TypeType/issues?q=is%3Aopen+label%3A%22help+wanted%22), donde una mano más es bienvenida.
