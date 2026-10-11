# Importar tus datos

Cuando tu instancia esté en marcha y tu cuenta creada, puedes traer tus suscripciones,
listas de reproducción e historial existentes. TypeType importa desde dos fuentes: una
exportación de **Google Takeout** o una copia de seguridad de **PipePipe**.

Lo encontrarás en la pantalla de bienvenida justo después de registrarte, y en
cualquier momento posterior en **Import** en la barra lateral.

![La pantalla de importación](/screenshot-onboarding.png)

## Desde YouTube (Google Takeout) {#from-youtube-google-takeout}

Esto trae tus **suscripciones, listas de reproducción, favoritos e historial de
reproducción** (el historial y los favoritos solo si la exportación incluye los
registros correspondientes de Mi actividad).

1. Solicita una exportación de Google Takeout de **YouTube y YouTube Music**, y añade
   también **Mi actividad** si quieres tu historial de reproducción. La aplicación te
   da un enlace de un clic que preselecciona los productos correctos.
2. Espera a que Google la prepare y descarga el archivo o los archivos ZIP. Las
   exportaciones grandes se dividen en varios ZIP, es normal.
3. En la pantalla de importación, elige **Import from YouTube** y suelta **uno o varios
   archivos ZIP de Takeout** (puedes seleccionar varios a la vez).
4. Inicia la importación y después revisa tus suscripciones y listas.

::: warning El progreso de la importación se queda en cero
Si la vista previa funciona pero una importación se queda en `00` categorías sin
avanzar, guarda el identificador del trabajo y los recuentos de la vista previa antes
de cancelarla. Este comportamiento se sigue en la
[issue #276](https://github.com/TypeType-Video/TypeType/issues/276); es distinto de un
archivo de Takeout cuya detección falló. No incluyas el archivo ni ningún dato de la
cuenta en un informe.
:::

::: tip
No hace falta descomprimir nada: sube los ZIP de Takeout tal como te los da Google.
:::

Cuando seleccionas varios archivos, el Frontend los procesa y los confirma de uno en
uno. Cada importación elimina suscripciones, listas y URL de vídeos duplicadas;
reutiliza una lista existente cuando su correspondencia de origen o su nombre ya
coincide; e indica las entradas existentes como omitidas. Por tanto, un archivo
posterior omite los datos ya confirmados por uno anterior. Las listas de sistema de
YouTube se asignan a **Favorites** y **Watch later** de TypeType en lugar de aparecer
duplicadas como listas normales.

La actividad de vídeos que te gustaron también puede restaurar los favoritos cuando la
lista de sistema falta o está incompleta. El importador conserva la hora original de
la actividad, entiende los formatos de fecha de Takeout en inglés y en francés, e
ignora los registros de vídeos que te gustaron y están eliminados, son privados o no
están disponibles. Así se conserva el orden original en lugar de asignar marcas de
tiempo de importación en orden inverso.

Las filas de Takeout antiguas o no disponibles pueden contener solo metadatos de
reserva. La lista se abre de inmediato y Server programa la reparación de metadatos en
segundo plano, en lugar de bloquear toda la respuesta mientras resuelve cada elemento.

Estos detalles se revisaron después de que
[lelam183 informara de listas importadas lentas, invertidas y duplicadas](https://github.com/TypeType-Video/TypeType/issues/135).

## Desde PipePipe {#from-pipepipe}

¿Vienes de la aplicación PipePipe? Restaura directamente desde su copia de seguridad.

1. Exporta una copia de seguridad desde PipePipe (un archivo `.zip`).
2. En la pantalla de importación, elige **Import from PipePipe** y suelta el ZIP de la
   copia.
3. Esto restaura tu **historial, suscripciones, listas de reproducción y progreso de
   reproducción**.

## Después de importar {#after-importing}

Cuando la importación termina, muestra un breve informe de lo que se trajo y de lo que
se omitió, para que veas exactamente qué pasó. Tus suscripciones y listas están
disponibles de inmediato.

## Referencias {#source-references}

- [Análisis de Takeout y eliminación de duplicados](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/YoutubeTakeoutParserService.kt)
- [Confirmación de un Takeout](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/YoutubeTakeoutImporterService.kt)
- [Reparación de metadatos en segundo plano](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/UserVideoMetadataRepairService.kt)
