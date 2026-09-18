# Reproductor incrustado

TypeType ofrece una ruta de reproductor dedicada para incrustar vídeos de YouTube sin
el resto de la página de reproducción.

## Formato de URL

Usa el identificador del vídeo de YouTube después de `/embed/`:

```text
https://tu-instancia.ejemplo/embed/ID_VIDEO
```

El identificador es el valor de 11 caracteres después de `v=` en una URL de
reproducción normal de YouTube. Por ejemplo,
`https://www.youtube.com/watch?v=dQw4w9WgXcQ` se convierte en `/embed/dQw4w9WgXcQ`.

## Posición de inicio y reproducción automática

| Parámetro | Valor | Comportamiento |
| --- | --- | --- |
| `t` | Segundos o una duración | Posición de inicio |
| `start` | Segundos o una duración | Alias de `t` |
| `time_continue` | Segundos o una duración | Alias compatible con Invidious para `t` |
| `autoplay` | `1` | Solicita reproducción automática |

Las duraciones pueden combinar horas, minutos, y segundos, como `1h30m15s`. Cuando
hay varios parámetros de inicio presentes, TypeType usa `t`, luego `start`, luego
`time_continue`. Los valores inválidos o negativos empiezan desde el principio.

```text
/embed/dQw4w9WgXcQ?t=90
/embed/dQw4w9WgXcQ?start=1m30s
/embed/dQw4w9WgXcQ?time_continue=45&autoplay=1
```

La reproducción automática sigue sujeta a la política de medios del navegador. Un
navegador puede requerir un gesto del usuario antes de iniciar el audio.

## Añadir un iframe

```html
<iframe
  src="https://tu-instancia.ejemplo/embed/dQw4w9WgXcQ?autoplay=1"
  title="Reproductor de vídeo TypeType"
  allow="autoplay; fullscreen; picture-in-picture"
  allowfullscreen
  loading="lazy"
></iframe>
```

Dale al iframe un tamaño responsivo explícito en la página que lo rodea. Por ejemplo:

```css
.video-embed {
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 0;
}
```

Añade `class="video-embed"` al iframe si usas este ejemplo.

### Verifica el iframe, no solo la URL

Abrir `/embed/...` directamente y obtener una respuesta `200` demuestra que la ruta y
el reproductor funcionan como una página de nivel superior. No demuestra que otro
sitio pueda incluirlo en un marco. Prueba la URL final dentro de un iframe en un
origen distinto.

Un proxy inverso o una CDN que añada `X-Frame-Options: DENY` bloquea la incrustación
aunque la página directa y todas las solicitudes de medios funcionen. Una política de
seguridad de contenido (CSP) restrictiva con la directiva `frame-ancestors` puede
hacer lo mismo. Mantén la protección contra encuadrado en las páginas normales de
TypeType, pero no envíes `X-Frame-Options: DENY` en `/embed/*`. Usa la directiva CSP
`frame-ancestors` en esa ruta si necesitas restringir qué sitios pueden incrustarla.

## Cuentas, configuración, y acceso de invitados

Abrir una URL de incrustación directamente en una pestaña del navegador puede
reutilizar la cuenta de TypeType actual y su configuración de reproducción. Dentro de
un iframe, la reproducción es anónima y no lee la sesión ni la configuración de
TypeType del sitio que lo incrusta.

La instancia debe por tanto permitir el acceso de invitados para la reproducción en
iframe. Un administrador puede activar **Permitir modo invitado** desde la
configuración de administración de TypeType. Cuando el acceso de invitados está
desactivado, la incrustación muestra un mensaje dedicado con un enlace a la página de
reproducción normal en lugar de intentar la reproducción.

La incrustación también muestra los mismos estados de no disponible, programado, y
solo para miembros que la página de reproducción. Los fallos de carga temporales
ofrecen una acción de reintento cuando es seguro reintentar.
