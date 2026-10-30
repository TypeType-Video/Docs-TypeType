# Importar tus datos

Cuando tu instancia funcione y tengas tu cuenta, puedes traer tus suscripciones,
listas, historial y más desde la aplicación que usabas, y exportarlos más tarde a
otra aplicación. Abre **Data transfer** en la barra lateral; las cuentas nuevas
llegan ahí justo después del registro. TypeType todavía no está traducido al
español, así que esta página usa las etiquetas en inglés.

## Aplicaciones compatibles {#supported-apps}

| Aplicación o formato | Archivo | Importar | Exportar |
| --- | --- | --- | --- |
| TypeType | `.json` | todo | todo |
| PipePipe | `.zip` | sí | no |
| NewPipe | `.zip` | sí | sí |
| Invidious | `.json` | sí | sí |
| Piped | `.json` | sí | sí |
| LibreTube | `.json` | sí | sí |
| ViewTube | `.zip` | sí | no |
| Flow | `.json` | sí | sí |
| Grayjay | `.zip` | sí | sí |
| YouTube Takeout | `.zip` | sí | no |
| OPML | `.opml` | suscripciones | suscripciones |
| Materialious | `.json` | suscripciones | suscripciones |
| SkyTube | `.opml` | suscripciones | suscripciones |
| youtube-local | `.opml` | suscripciones | suscripciones |

Lo que pasa depende de lo que guarda cada aplicación: suscripciones, grupos de
suscripciones, historial, listas, Watch later, favoritos, progreso de reproducción,
historial de búsqueda, listas guardadas, ajustes o filtros de contenido. Una copia
de TypeType lo contiene todo. Cuando un formato solo guarda parte de una categoría,
la vista previa y el informe final lo indican.

![El menú Import from con todas las fuentes compatibles](/screenshot-import-sources.png)

## Importar {#import}

1. Exporta una copia desde tu aplicación actual y conserva el archivo tal cual: no
   lo descomprimas ni lo modifiques.
2. En **Data transfer**, quédate en **Import** y deja **Import from** en **Automatic
   detection**, o elige tú la aplicación.
3. Suelta el archivo o selecciónalo. El límite es de 512 MB.
4. TypeType analiza el archivo y muestra una vista previa: la fuente detectada,
   cuántos elementos encontró en cada categoría, los duplicados y las notas de
   compatibilidad. No se escribe nada antes de este paso.
5. Después, la importación empieza sola con todo lo detectado. Lo que ya tienes se
   omite. Puedes salir de la página; la importación continúa.

Al terminar, un informe muestra lo importado y lo omitido, y puedes descargarlo.

## Desde YouTube (Google Takeout) {#from-youtube-google-takeout}

Takeout trae tus **suscripciones, historial, listas, Watch later y vídeos que te
gustan** (como favoritos).

1. Elige **YouTube Takeout** en **Import from** y luego **Open Google Takeout**: el
   enlace preselecciona YouTube y Mi actividad. Mantén Mi actividad si quieres tu
   historial.
2. Crea una exportación ZIP única y descárgala de Google.
3. Suelta el ZIP original. Si Google dividió la exportación en varios ZIP,
   impórtalos de uno en uno.

La importación elimina suscripciones, listas y vídeos duplicados, reutiliza una
lista existente cuando coincide y lleva las listas del sistema de YouTube a
**Favoritos** y **Watch later** de TypeType en lugar de listas normales. La
actividad de «Me gusta» también puede llenar Favoritos cuando la lista del sistema
falta o está incompleta; se conservan la fecha y el orden originales. Las filas con
metadatos incompletos se completan en segundo plano, así que la lista se abre al
momento.

Si la importación dice que no encontró datos de la cuenta, soltaste una parte de la
exportación que solo contiene vídeos: elige el ZIP con el historial, las
suscripciones o las listas. Si dice que el archivo supera los límites o está
cifrado, vuelve a exportar YouTube en partes ZIP más pequeñas.

## Exportar {#export}

En la pestaña **Export**, elige un **Destination format** y las categorías que
quieres incluir, luego **Generate export** y descarga el archivo. Un destino que no
puede guardar todos los campos de TypeType muestra un aviso, y el informe lista lo
que no se pudo conservar. Una exportación de TypeType lo conserva todo: es la copia
que debes usar para pasar a otra instancia de TypeType.

**Settings > Data** también crea y restaura directamente una copia de TypeType.
Restaurar ahí sustituye las categorías incluidas en la copia.

## Referencias {#source-references}

- [Formatos compatibles](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-portability/src/main/kotlin/dev/typetype/server/portability/PortabilityFormat.kt)
- [Importadores y exportadores registrados](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-portability/src/main/kotlin/dev/typetype/server/portability/PortabilityEngineFactory.kt)
- [Análisis de Takeout y eliminación de duplicados](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-services/src/main/kotlin/dev/typetype/server/services/YoutubeTakeoutParserService.kt)
- [Reparación de metadatos en segundo plano](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-services/src/main/kotlin/dev/typetype/server/services/UserVideoMetadataRepairService.kt)
