# Elegir tu algoritmo

::: warning Experimental
Los algoritmos descritos aquí están en la versión 0.0.1. Lo que muestran, sus ajustes
y sus nombres todavía pueden cambiar. La página solo existe en una instancia cuyo
administrador instaló el servicio de recomendaciones y lo activó.
:::

TypeType puede construir tu página de inicio con un algoritmo que eliges, que puedes
leer y ajustar. Dice qué datos lee, cada fila de la página de inicio dice por qué está
ahí, y lo que dedujo sobre ti se te muestra y se puede corregir.

Solo cambia la página de inicio. La búsqueda, las suscripciones y el historial siguen
igual.

::: tip Nombres de la interfaz
La interfaz de TypeType todavía no está traducida al español. Los nombres de botones y
secciones se dan aquí tal como aparecen, en inglés.
:::

## Activarlo {#turn-on}

1. Abre **Algorithm** en el menú.
2. En **Home page by algorithm**, activa **Build my home page with an algorithm I
   choose**.
3. En **Home page algorithm**, elige uno. Si dudas, abre **Which algorithm suits
   me?**: los compara uno al lado del otro.
4. Vuelve a la página de inicio.

La primera página puede tardar unos segundos. Mientras tanto ves la página de inicio
habitual con el mensaje "Your home page is cooking"; la nueva la reemplaza sola.

Si **Algorithm** no está en el menú, tu instancia no lo ofrece. En algunas instancias
el administrador lo activó para todos: la opción ya está activada y puedes
desactivarla.

En una cuenta vacía, la página de inicio muestra una tarjeta de bienvenida con dos
botones, **Import my data** y **Choose my algorithm**. Un algoritmo no tiene nada con
qué trabajar hasta que importes tus datos o veas algunos vídeos.

## Los algoritmos {#algorithms}

No hay una respuesta correcta, solo distintas maneras de ver vídeos.

| Algoritmo | Lo que verás | Datos que lee |
| --- | --- | --- |
| Subscriptions | Los vídeos más recientes de los canales que sigues, por orden de publicación: hoy, los últimos siete días, antes. No se deduce nada sobre ti. | Suscripciones |
| Discovery | Vídeos nuevos de tus suscripciones, vídeos relacionados con ellos y con tus favoritos de canales que no sigues, y tendencias. | Suscripciones y favoritos. Nunca tu historial. |
| Signals | Vídeos que empezaste, más vídeos de los creadores que viste, filas por tema y una fila de creadores que nunca viste. Reacciona en minutos a lo que acabas de ver. | Historial de vídeos, favoritos, suscripciones; historial de Shorts solo si está activado |
| Signals, channels | Los vídeos más recientes de los creadores que más ves, y de tus suscripciones. | Historial de vídeos, favoritos, suscripciones; historial de Shorts solo si está activado |
| Signals, videos | Los temas de lo que ves, sea quien sea el autor del vídeo. | Historial de vídeos, favoritos; historial de Shorts solo si está activado |
| Signals, mix | Los creadores que ves, y vídeos sobre tus temas de cualquier creador. | Historial de vídeos, favoritos, suscripciones; historial de Shorts solo si está activado |

Por defecto, los Shorts se mantienen aparte y no influyen en las recomendaciones de
vídeos normales. En la familia Signals, **Let Shorts shape the home page** está
desactivado por defecto; al activarlo, los Shorts también pueden influir en los vídeos
normales.

En la guía, cada algoritmo lleva tres medidores, de ninguno a alto:

- **Personal**: cuánto depende la página de inicio de lo que ves.
- **Discovery**: cuánto espacio queda para canales que aún no conoces.
- **Variety**: cuánto cambia la página de una actualización a otra.

Todos los algoritmos leen además lo que marcaste **Not for me**, para descartarlo, y
todos menos Subscriptions leen lo que se mostró hace poco en tu página de inicio, para
no repetirlo.

Un algoritmo solo recibe los datos que anuncia en **Data used**. El que no lee tu
historial nunca lo recibe.

Puedes cambiar en cualquier momento. Tus datos y los ajustes de cada algoritmo se
conservan.

## La página Algorithm, sección por sección {#page}

### Overview

Dos gráficos: de qué está hecha tu página de inicio (vídeos empezados, vistos
recientemente, suscripciones, tus intereses, creadores nuevos, tendencias) y la parte
de cada uno de tus intereses. Cada parte lleva al lugar donde se ajusta.

### Data used {#data}

La página enumera las seis categorías de datos cuyo uso puedes ajustar en TypeType para
las recomendaciones: historial de vídeos, historial de Shorts, favoritos, suscripciones,
canales y vídeos bloqueados, y vídeos marcados como «No me interesa». El historial de
búsqueda no aparece aquí ni se envía a Signals. En azul, lo que lee el algoritmo actual;
en gris, lo que se conserva sin usarse en la página de inicio.

Abre una categoría para ajustar:

- **Collect**: el historial de vídeos y el de Shorts comparten este ajuste. Al
  desactivarlo, no se registran nuevas visualizaciones; las entradas existentes siguen
  sujetas a su período de conservación.
- **Use for the home page**: desactivado, los elementos siguen guardados pero ningún
  algoritmo los lee.
- **Read back**: hasta cuándo retrocede el algoritmo, desde unos días hasta sin
  límite. Los elementos más antiguos siguen en tu cuenta; solo dejan de contar para la
  página de inicio.
- **Exclude** en un elemento: se conserva y nunca se lee. **Include** lo vuelve a
  incluir.

Ninguna de estas opciones borra nada.

### What it keeps {#profile}

Lo que el algoritmo dedujo de tus datos. Está vacío hasta que hayas visto algunos
vídeos.

- **Interests.** Cada interés lleva el nombre de las palabras que comparten los
  títulos de sus vídeos e indica en cuántos elementos se basa, con algunos de tus
  propios vídeos. En cada uno:
  - **Pin**: siempre tiene su fila en la página de inicio;
  - **Hide**: no vuelve a la página de inicio;
  - **Don't take into account**: deja de contar como interés, pero sus vídeos todavía
    pueden aparecer.
- **Add** un tema con tus palabras, en cualquier idioma ("astronomía", "cocina
  japonesa"). El algoritmo buscará vídeos sobre él.
- **Most watched channels.** Selecciona uno para ver en qué se basa, o para que deje
  de contar.
- **Recently watched.** Los vídeos vistos hace poco que todavía orientan la página de
  inicio, cada uno con los minutos que le quedan. **Forget** quita su efecto sin
  borrar tu historial.

Los intereses se encuentran por el significado de los títulos, en cualquier idioma: un
vídeo titulado en árabe y otro en inglés sobre el mismo tema acaban juntos.

Un cambio se aplica en la siguiente actualización de la página de inicio.

### Details {#details}

**All settings** lista cada ajuste del algoritmo elegido, por familia:

| Familia | Lo que ajusta |
| --- | --- |
| Sources | Dónde busca el algoritmo los vídeos candidatos |
| Weights | Lo que más cuenta para ordenar los candidatos |
| Recent videos | Cuánto tiempo un vídeo visto sigue orientando la página de inicio |
| Page | El tamaño de la página y cómo se reparte |
| Discovery | El espacio que queda para lo que aún no ves |
| Randomness | Si la página de inicio cambia en cada actualización |

Cada ajuste muestra su valor por defecto y un botón **Restore**, y **Restore
defaults** los restablece todos. Sin azar, los mismos datos dan siempre la misma
página.

**How the last home page was built** muestra, para la página que acabas de ver:
cuántos vídeos se encontraron y de qué fuentes, cuántos se descartaron y por qué (ya
vistos, bloqueados, intereses ocultos, demasiados de un mismo canal, datos excluidos,
Shorts), las filas con la razón de cada una, y las mejores puntuaciones con lo que
formó cada una. Sale del mismo cálculo que construyó la página.

Si dice que todavía ningún algoritmo construyó una página de inicio, abre primero la
página de inicio.

**Source code** enlaza al código del algoritmo elegido.

### My opinions {#opinions}

Las opiniones que diste sobre la página de inicio, cada una con un botón **Take
back**. Solo se conserva lo que elegiste enviar, con el algoritmo y los ajustes que
tenías en ese momento. Sale con tu exportación.

## En la página de inicio {#home}

- **Filas y razones.** En **Home page layout**, elige **As usual** (una sola
  cuadrícula) o **By category** (una fila con título por razón). Los vídeos son los
  mismos en ambos casos.
- **Not for me.** En una tarjeta, **Not for me** quita el vídeo al instante. En
  **Why? (if you wish)** puedes responder **Already seen**, **Not this channel**,
  **Not this topic** u **Other**. **Undo** devuelve la tarjeta. Después de **Not this
  topic**, la tarjeta ofrece **Hide the subject**; un tema oculto se encuentra de
  nuevo en **What it keeps**.
- **Does this page suit you?** Responde **Good** o **Not good**, y di qué falla si
  quieres: demasiado repetitivo, nada que ver contigo, demasiados vídeos antiguos,
  faltan tus canales. No se envía nada si no respondes.

## Desactivarlo {#turn-off}

Desactiva **Build my home page with an algorithm I choose**. Recuperas al instante la
página de inicio habitual. Tus elecciones, correcciones y opiniones se conservan por
si vuelves.

## Referencias

- [Repositorio de Signals](https://github.com/TypeType-Video/TypeType-Signals)
- [Instalar el servicio de recomendaciones](/es/self-hosting/recommender)
