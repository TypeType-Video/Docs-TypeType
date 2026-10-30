# Proxy inverso y HTTPS

En un despliegue real pones un proxy inverso delante de la pila y la sirves por HTTPS
en tu propio dominio. Solo expones el contenedor **web** (`HOST_PORT_WEB`, `8082` por
defecto); este ya redirige `/api/` al servidor internamente, incluidas las
actualizaciones a WebSocket, los medios SABR, las descargas y las subidas grandes.

## Antes de empezar {#before-you-start}

1. Apunta un registro DNS (por ejemplo `watch.example.com`) a tu servidor.
2. Añade ese origen a `ALLOWED_ORIGINS` en `.env` y vuelve a aplicar:

   ```sh
   # .env
   ALLOWED_ORIGINS=https://watch.example.com
   ```

   ```sh
   docker compose up -d
   ```

## Opción A - Caddy (recomendado) {#option-a---caddy-recommended}

Caddy obtiene y renueva los certificados TLS automáticamente. Basta un `Caddyfile` de
tres líneas:

```text
watch.example.com {
    reverse_proxy localhost:8082
}
```

Caddy reenvía los WebSockets y las cabeceras correctas sin más configuración. Eso es
todo lo que necesitas.

## Opción B - nginx {#option-b---nginx}

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl;
    server_name watch.example.com;

    # ssl_certificate ... (usa certbot para obtener un certificado)

    client_max_body_size 2g;

    location / {
        proxy_pass http://127.0.0.1:8082;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Usa [certbot](https://certbot.eff.org/) para obtener y renovar el certificado.

::: warning Conserva las cabeceras de actualización y el tamaño del cuerpo
La aplicación acepta subidas grandes: las importaciones de copias llegan a 512 MB.
Con un `client_max_body_size` pequeño, las importaciones fallan. Los ajustes
anteriores, cabeceras de actualización incluidas, coinciden con lo que espera el
contenedor web incluido.
:::

## Opción C - Traefik {#option-c---traefik}

Estos ejemplos suponen una instalación de Traefik existente, con un punto de entrada
`websecure` escuchando en el puerto 443 y un
[resolvedor de certificados ACME](https://doc.traefik.io/traefik/reference/install-configuration/tls/certificate-resolvers/acme/)
configurado en la configuración estática de Traefik. Sustituye `YOUR_CERT_RESOLVER`
por el nombre de ese resolvedor y `watch.example.com` por tu dominio. Traefik usa el
resolvedor para obtener y renovar los certificados TLS; los fragmentos siguientes no
lo crean.

Conecta Traefik y el servicio web de TypeType (`typetype`) a la misma red de Docker.
Los ejemplos usan una red externa existente llamada `proxy`; sustituye ese nombre por
el de tu red de Traefik. Mantén también el servicio web en su red `default` existente
para que pueda seguir alcanzando el servidor de TypeType.

Para el proveedor Docker de Traefik, combina lo siguiente con tu configuración de
Compose:

```yaml
services:
  typetype:
    networks:
      - default
      - proxy
    labels:
      traefik.enable: "true"
      traefik.docker.network: "proxy"
      traefik.http.services.typetype.loadbalancer.server.port: "80"
      traefik.http.routers.typetype.service: "typetype"
      traefik.http.routers.typetype.entrypoints: "websecure"
      traefik.http.routers.typetype.rule: "Host(`watch.example.com`)"
      traefik.http.routers.typetype.tls: "true"
      traefik.http.routers.typetype.tls.certresolver: "YOUR_CERT_RESOLVER"

networks:
  proxy:
    external: true
```

Como alternativa, conserva las mismas conexiones de red y usa esta configuración YAML
dinámica con el proveedor de archivos de Traefik en lugar de las etiquetas:

```yaml
http:
  routers:
    typetype:
      entryPoints:
        - websecure
      rule: 'Host(`watch.example.com`)'
      service: typetype
      tls:
        certResolver: YOUR_CERT_RESOLVER

  services:
    typetype:
      loadBalancer:
        servers:
          - url: http://typetype:80
```

El contenedor web sirve HTTP sin cifrar en el puerto 80; Traefik termina el HTTPS.
Activa en Traefik el proveedor Docker o el de archivos según el ejemplo que elijas.

## Descargas detrás de un dominio {#downloads-behind-a-domain}

La pila compatible sirve los artefactos por `/api/downloader/...`. Server sigue la
redirección interna de Garage y transmite el resultado, así que un despliegue normal
no necesita un segundo nombre de host público para Garage.

Expón Garage por separado solo cuando una configuración personalizada y deliberada de
Downloader use un punto de acceso S3 público. En esa topología, protege el punto de
acceso según la documentación del almacén de objetos y mantén privadas las
credenciales de acceso.
