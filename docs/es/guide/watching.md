# Reproducción y el reproductor

Abre cualquier vídeo para llegar a la página de reproducción: el reproductor, los
detalles, vídeos relacionados, y comentarios.

![La página de reproducción](/screenshot-watch.png)

---

![Un vídeo reproduciéndose en una instancia autoalojada](/watch.gif)

## Controles del reproductor

El reproductor tiene los controles habituales (reproducir y pausar, avanzar, volumen,
pantalla completa) más un menú de configuración donde eliges:

- **Calidad**, elige una resolución, o deja que se adapte. Se puede establecer un
  valor predeterminado en [Configuración](./settings#playback).
- **Velocidad de reproducción**.
- **Subtítulos**, elige una pista cuando el vídeo los tenga.
- **Pista de audio**, cambia de idioma cuando hay varias disponibles. Se puede
  establecer un idioma de audio preferido en [Configuración](./settings#languages).

## Modo cine e imagen en imagen

- El **modo cine** amplía el reproductor y oscurece la página, para una vista
  centrada, estilo teatro.
- La **imagen en imagen** saca el vídeo a una ventana flotante para que puedas seguir
  viéndolo mientras navegas, usando la imagen en imagen nativa de tu navegador.

![Modo cine, el reproductor ampliado con la página oscurecida](/cinema.gif)

## SponsorBlock

Los segmentos marcados por la comunidad (patrocinios, autopromoción, y más) se
muestran en la barra de progreso y pueden **omitirse o simplemente marcarse**
automáticamente. Tú decides el comportamiento y qué categorías cuentan, consulta
[Configuración](./settings#sponsorblock).

## Atajos de teclado

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

## Gestos táctiles

En una pantalla táctil:

- **Arrastra hacia la izquierda o derecha** sobre el vídeo para desplazarte por él.
- **Mantén pulsado** el vídeo para avanzar rápidamente.

## Reproducción automática

Cuando está activada, el siguiente vídeo empieza automáticamente cuando termina el
actual. Actívala en [Configuración](./settings#playback).

## Transmisiones en directo

Las transmisiones en directo de YouTube usan el reproductor SABR nativo de TypeType.
El reproductor sigue el punto en directo automáticamente, sigue almacenando en búfer
durante breves interrupciones de red, y permite desplazarse dentro de la ventana DVR
cuando la transmisión la ofrece.

## Reproductor incrustado

TypeType ofrece una ruta dedicada para incrustar vídeos de YouTube. Consulta
[Reproductor incrustado](./embedding) para el formato de URL, parámetros, marcado
iframe, y los requisitos de acceso para invitados.

## Shorts

Los Shorts se reproducen en un reproductor vertical dedicado, deslizable. Puedes
desactivar por completo la sección Shorts en
[Configuración](./settings#what-you-see).
