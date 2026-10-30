# Configuración

Abre **Settings** desde el menú lateral. TypeType todavía no está traducido al
español, así que esta guía usa las etiquetas en inglés que verás en pantalla. La
página tiene once secciones, a la izquierda: Playback, Video, Interface, Languages,
Services, Notifications, Data, API, Privacy, Blocked content y About. La mayoría de
las opciones se guardan en tu instancia y siguen a tu cuenta en cada navegador. El
tema, el idioma de la interfaz y el color del reproductor se quedan en el navegador
donde los elegiste.

![La sección Playback de la página de configuración](/screenshot-settings.png)

## Reproducción {#playback}

- **Autoplay**, reproduce el siguiente vídeo automáticamente.
- **Autoplay countdown**, los segundos antes de pasar al siguiente; `0` inicia al
  momento el siguiente elemento de una lista.
- **Skip playlist autoplay screen**, pasa directamente al siguiente elemento de la
  lista y mantiene la cuenta atrás para las recomendaciones.
- **Hide upcoming playlist videos**, oculta los títulos y miniaturas de los
  siguientes elementos de la lista.
- **Audio-only playback**, carga solo el flujo de audio cuando el servicio lo
  ofrece. Consulta [Solo audio](./watching#audio-only).
- **Default quality**, la resolución con la que se abren los vídeos.
- **Default playback speed**, la velocidad aplicada al empezar un vídeo.

La reproducción de YouTube usa la ruta SABR con estado en todos los navegadores
compatibles. NicoNico y BiliBili mantienen sus propias rutas de reproducción
específicas.

## Vídeo y SponsorBlock {#sponsorblock}

La sección **Video** decide qué hace SponsorBlock con los segmentos marcados por la
comunidad:

- **SponsorBlock behavior**, **Skip** salta los segmentos automáticamente, **Mark**
  los marca en la barra sin saltarlos y **Off** ignora SponsorBlock.
- **SponsorBlock categories**, elige **Skip**, **Mark** o **Hide** para cada tipo de
  segmento: mensaje patrocinado, autopromoción, recordatorio de interacción,
  introducción, pantallas finales y más.
- **Advanced display**, fija una duración mínima de segmento, muestra el segmento
  actual junto al tiempo, muestra capítulos y etiquetas de vídeo completo, salta esas
  etiquetas a mano, silencia en lugar de saltar y salta las partes sin música solo en
  vídeos musicales.

La misma sección tiene dos interruptores de la página de reproducción: **Autoplay
next video**, que continúa con la primera sugerencia, y **Autoplay on open**, que
inicia un vídeo en cuanto lo abres.

![Comportamiento y categorías de SponsorBlock](/screenshot-sponsorblock.png)

## Interfaz {#what-you-see}

**Startup** fija la **Default landing page**: Home, Subscriptions, History,
Playlists, Watch later o Favorites.

**Layout** fija los **Videos per row**, el **Theme** (sistema, claro u oscuro), el
**Related video size** en la página de reproducción y el **Player color**. Ese color
se aplica a la barra de progreso y a los controles del reproductor, con vídeo y en
solo audio. Elige default, white, red, pink, purple, blue, green u orange; la barra
bajo las muestras enseña el resultado.

![Elegir un color del reproductor en Settings > Interface](/player-color.gif)

**Discovery surfaces** desactiva partes de TypeType:

- **DeArrow titles and thumbnails**, títulos escritos por la comunidad y miniaturas
  representativas para los vídeos de YouTube.
- **Continue watching** y **Home recommendations**, ocultan de la página de inicio
  los vídeos empezados o las recomendaciones personalizadas. Consulta
  [Elegir tu algoritmo](/es/guide/algorithm) para saber cómo se construye.
- **Related videos**, oculta la columna de sugerencias en la página de reproducción.
- **Comments and danmaku**, deja de cargar comentarios y comentarios en pantalla.
- **Shorts surface**, oculta los vídeos cortos en todas partes y la página Shorts.
- **Live streams**, oculta los directos activos y programados del feed de
  suscripciones.
- **Members-only videos**, oculta los vídeos que exigen una membresía de pago del
  canal.
- **Hide everything**, desactiva a la vez todas las superficies anteriores.

![Discovery surfaces en Settings > Interface](/screenshot-content-toggles.png)

## Idiomas {#languages}

- **Interface language**, inglés, chino simplificado, francés o alemán, en este
  dispositivo.
- **Subtitles**, activa los subtítulos por defecto; **Subtitle language** elige la
  pista preferida.
- **Audio language**, la pista de audio que se elige cuando un vídeo tiene varias.
- **Prefer original language**, conserva siempre el audio original en lugar de una
  pista doblada.

## Servicios {#service}

Elige el servicio por defecto, **YouTube, NicoNico o BiliBili**, para que la búsqueda
y la navegación apunten a la fuente correcta. El menú de servicios en la parte
superior de la página también permite cambiarlo.

## Notificaciones, datos y claves API

- **Notifications** activa o desactiva los avisos de vídeos nuevos y te deja elegir
  qué canales suscritos te avisan. Los canales nuevos empiezan desactivados.
- **Data** exporta una copia de TypeType de las categorías elegidas, restaura una y
  abre la [transferencia de datos](/es/self-hosting/importing-data) hacia otras
  aplicaciones. Restaurar sustituye las categorías incluidas en la copia.
- **API** crea y revoca claves para aplicaciones externas, como
  [Discord Rich Presence](./discord-rich-presence).

## Privacidad y contenido bloqueado

**Privacy** controla el registro del historial y borra el historial de
reproducción, el de búsqueda o las suscripciones. **Blocked content** lista los
canales, vídeos y palabras clave que has ocultado. Ambos se describen en
[Privacidad y bloqueo](./privacy).

## Acerca de {#about}

La sección About muestra la versión, la revisión completa y la hora de compilación
que devuelven la aplicación web, Server, Token y Downloader. Cada componente se
comprueba por separado, así que un servicio interno no disponible no oculta la
información de versión que devuelven los demás. Usa el botón de actualizar después
de una actualización para pedir los valores actuales.
