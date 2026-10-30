# Reproducción y el reproductor

Abre cualquier vídeo para llegar a la página de reproducción: el reproductor, los
detalles, vídeos relacionados, y comentarios.

![Un vídeo reproduciéndose en una instancia autoalojada](/watch.gif)

## Controles del reproductor {#player-controls}

El reproductor tiene los controles habituales (reproducir y pausar, avanzar, volumen,
pantalla completa) más un menú de configuración donde eliges:

- **Calidad**, elige una resolución, o deja que se adapte. Se puede establecer un
  valor predeterminado en [Configuración](./settings#playback).
- **Velocidad de reproducción**.
- **Subtítulos**, elige una pista cuando el vídeo los tenga.
- **Pista de audio**, cambia de idioma cuando hay varias disponibles. Se puede
  establecer un idioma de audio preferido en [Configuración](./settings#languages).

La barra de progreso y los controles usan el color del reproductor elegido en
[Settings > Interface](./settings#what-you-see).

![El reproductor con una barra de progreso morada](/screenshot-player-color.png)

## Solo audio {#audio-only}

Selecciona **Audio only** bajo el vídeo para cargar solo el sonido. El reproductor
muestra la miniatura y el título en lugar de la imagen, mantiene los mismos controles
y sigue mostrando los subtítulos: actívalos con el botón **CC**. Selecciona otra vez
**Audio only** para recuperar la imagen. Para empezar así cada vídeo, activa
**Audio-only playback** en [Settings > Playback](./settings#playback).

![Reproducción en solo audio con subtítulos en inglés bajo el título](/screenshot-audio-only-subtitles.png)

Cuando reproduces una lista, su panel tiene su propio interruptor **Audio-only
playback**. Parte de tu ajuste de Playback y solo se aplica a esa lista: una lista de
música puede seguir en solo audio mientras los demás vídeos conservan la imagen.

## Modo cine e imagen en imagen {#cinema-mode-and-picture-in-picture}

- El **modo cine** amplía el reproductor y oscurece la página, para una vista
  centrada, estilo teatro.
- La **imagen en imagen** saca el vídeo a una ventana flotante para que puedas seguir
  viéndolo mientras navegas, usando la imagen en imagen nativa de tu navegador.

![Modo cine, el reproductor ampliado con la página oscurecida](/cinema.gif)

## SponsorBlock {#sponsorblock}

Los segmentos marcados por la comunidad (patrocinios, autopromoción, y más) se
muestran en la barra de progreso y pueden **omitirse o simplemente marcarse**
automáticamente. Tú decides el comportamiento y qué categorías cuentan, consulta
[Configuración](./settings#sponsorblock).

## Atajos de teclado {#keyboard-shortcuts}

Las teclas estándar del reproductor están disponibles:

| Tecla | Acción |
| --- | --- |
| `k` o `Espacio` | Reproducir / pausar |
| `f` | Pantalla completa |
| `m` | Silenciar |
| `c` | Subtítulos activados / desactivados |
| `i` | Imagen en imagen |
| `j` o `←` | Retroceder |
| `l` o `→` | Avanzar |
| `↑` / `↓` | Subir / bajar volumen |

Además de esas, TypeType añade:

| Tecla | Acción |
| --- | --- |
| `Espacio` (mantener) | Avance rápido mientras se mantiene, suelta para reanudar |
| `,` | Retroceder un fotograma (en pausa) |
| `.` | Avanzar un fotograma (en pausa) |

## Gestos táctiles {#touch-gestures}

En una pantalla táctil:

- **Arrastra hacia la izquierda o derecha** sobre el vídeo para desplazarte por él.
- **Mantén pulsado** el vídeo para avanzar rápidamente.

## Reproducción automática {#autoplay}

Cuando está activada, el siguiente vídeo empieza automáticamente cuando termina el
actual. Actívala en [Configuración](./settings#playback).

## Cuando el servidor está ocupado {#when-the-server-is-busy}

Si YouTube limita la instancia, el reproductor muestra **The video service is busy.
Retrying…** y vuelve a intentarlo tras la espera que pide el servidor. Si el servicio
sigue sin estar disponible, el mensaje te pide que lo intentes de nuevo en un
momento.

## Transmisiones en directo {#livestreams}

Las transmisiones en directo de YouTube usan el reproductor SABR nativo de TypeType.
El reproductor sigue el punto en directo automáticamente, sigue almacenando en búfer
durante breves interrupciones de red, y permite desplazarse dentro de la ventana DVR
cuando la transmisión la ofrece.

## Reproductor incrustado {#embedded-player}

TypeType ofrece una ruta dedicada para incrustar vídeos de YouTube. Consulta
[Reproductor incrustado](./embedding) para el formato de URL, parámetros, marcado
iframe, y los requisitos de acceso para invitados.

## Shorts {#shorts}

Los Shorts se reproducen en un reproductor vertical dedicado, deslizable. Puedes
desactivar por completo la sección Shorts en
[Configuración](./settings#what-you-see).
