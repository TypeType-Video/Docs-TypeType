# Fuentes de la comunidad y agradecimientos

La documentación se contrasta con el código, pero el código por sí solo no muestra
todos los fallos de despliegue ni explica qué detalle confunde a un operador. Los
informes de la comunidad aportan esa evidencia que falta. Esta página recoge a las
personas y los hilos que dieron forma directamente a la documentación actual.

## Contribuidores citados en la documentación {#contributors-referenced-in-the-documentation}

| Contribuidor | Informe o discusión | Documentación mejorada |
| --- | --- | --- |
| [arcoast](https://github.com/arcoast) | [Inicio de sesión remoto en YouTube, discusión #122](https://github.com/TypeType-Video/TypeType/discussions/122) | Requisitos del proxy para WebSockets y diagnóstico del nginx obsoleto |
| [arcoast](https://github.com/arcoast) | [Nombres de las variables de base de datos, discusión #123](https://github.com/TypeType-Video/TypeType/discussions/123) | Las variables de PostgreSQL como única fuente de verdad a nivel de la pila |
| [arcoast](https://github.com/arcoast) | [Guía de OIDC para Authelia y Pocket ID, discusión #128](https://github.com/TypeType-Video/TypeType/discussions/128) | Ejemplos de proveedores probados y ajustes de devolución de llamada |
| [arcoast](https://github.com/arcoast) | [Secreto RPC de Garage, discusión #130](https://github.com/TypeType-Video/TypeType/discussions/130) | Generación de un `GARAGE_RPC_SECRET` aleatorio en instalaciones manuales |
| [filippobaroni](https://github.com/filippobaroni) | [Reproducción antigua y migración de la pila, discusión #133](https://github.com/TypeType-Video/TypeType/discussions/133#discussioncomment-17779201) | Detección y migración de archivos Compose que aún usan el antiguo espacio de nombres de imágenes |
| [hugoghx](https://github.com/hugoghx) | [Entorno del contenedor Token, discusión #156](https://github.com/TypeType-Video/TypeType/discussions/156) | Nombre del servicio Token, límite de la red interna y límites actuales del endurecimiento |
| [hulmgulm](https://github.com/hulmgulm) | [Configuración del primer administrador, discusión #151](https://github.com/TypeType-Video/TypeType/discussions/151) | Estado de la inicialización y solución de problemas de CORS por origen exacto |
| [Toni-Vide](https://github.com/Toni-Vide) | [Cierres de sesión inesperados, discusión #162](https://github.com/TypeType-Video/TypeType/discussions/162) | Solución de problemas del token de acceso, la cookie de renovación y la sesión |
| [nanhoes](https://github.com/nanhoes) | [Flujo de descarga en iOS, incidencia #116](https://github.com/TypeType-Video/TypeType/issues/116) | Propagación de la autenticación y revisión de la ruta de los artefactos |
| [lelam183](https://github.com/lelam183) | [Comportamiento de las listas importadas, incidencia #135](https://github.com/TypeType-Video/TypeType/issues/135) | Eliminación de duplicados al importar, asignación de las listas de sistema y reparación de metadatos en segundo plano |
| [BuggyPasta](https://github.com/BuggyPasta) | [Instrucciones de despliegue con Dockge, discusión #277](https://github.com/TypeType-Video/TypeType/discussions/277) | Disposición de la pila en Dockge, inicialización única y comentarios de operadores sobre la instalación manual |
| [hugoghx](https://github.com/hugoghx) | [Reproducción de directos, incidencia #145](https://github.com/TypeType-Video/TypeType/issues/145) | Revisión de la reproducción en directo y de la ventana móvil |
| [Priveetee](https://github.com/Priveetee) | [Cambios de calidad en directo, incidencia #163](https://github.com/TypeType-Video/TypeType/issues/163) | Conceptos de sesión en directo y cambio de calidad en la guía de reproducción |

Gracias a todas las personas anteriores por publicar síntomas reproducibles, el
contexto de su configuración y los resultados de sus seguimientos. Sus informes
hicieron más claro el flujo de trabajo compatible para quienes se encuentren con el
mismo límite más adelante.

## Quienes apoyan el proyecto {#project-supporters}

### Patrocinador recurrente {#recurring-sponsor}

Gracias a [@Toastienergy](https://github.com/Toastienergy) por apoyar TypeType con una
contribución recurrente en GitHub Sponsors. Me ayuda a cubrir la infraestructura y a
dedicar más tiempo a mejorar el proyecto.

### Donante puntual {#one-time-donor}

También agradezco a [@filippobaroni](https://github.com/filippobaroni) la donación
puntual en GitHub Sponsors que ayudó a apoyar TypeType.

Si quieres apoyar TypeType económicamente, puedes hacerlo a través de
[GitHub Sponsors](https://github.com/sponsors/Priveetee).

## Cómo se usa el material de la comunidad {#how-community-material-is-used}

Una discusión o una incidencia no se copia directamente en el manual. Antes de
convertirse en documentación:

1. Se inspecciona el repositorio dueño actual para confirmar que el comportamiento
   sigue existiendo.
2. Se comprueban los archivos centrales de Compose y nginx para el despliegue
   compatible.
3. Se eliminan los valores sensibles y los detalles específicos de una instancia.
4. El resultado se redacta como una explicación o un diagnóstico reutilizable.
5. Se enlaza al contribuidor original y al hilo público allí donde se usa la
   aportación.

Esto importa porque una solución provisional antigua puede volverse perjudicial tras
un cambio en la implementación. Por ejemplo, la investigación sobre WebSockets de la
discusión #122 sigue siendo útil, pero la corrección compatible es usar la
configuración de nginx incluida actual en lugar de copiar toda la pila personalizada
de quien informó.

## Incidencias y discusiones {#issues-and-discussions}

Todos los informes de cara al usuario se centralizan en el repositorio TypeType:

- [Gestor de incidencias](https://github.com/TypeType-Video/TypeType/issues) para errores, funciones y carencias de la
  documentación.
- [Discusiones](https://github.com/TypeType-Video/TypeType/discussions) para preguntas de operadores, hallazgos de despliegue, ideas
  y ejemplos de configuración.

Al informar de un problema, incluye las respuestas `/api/version/*` pertinentes y
quita tokens, cookies, contraseñas, nombres de host internos y URL de instancias
privadas. Consulta [Informar de problemas](/es/self-hosting/reporting-issues) para ver
la lista completa.
