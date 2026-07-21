# Reverse proxy and HTTPS

For a real deployment you put a reverse proxy in front of the stack and serve it over
HTTPS on your own domain. You only ever expose the **web** container
(`HOST_PORT_WEB`, default `8082`); it already proxies `/api/` to the server
internally, including WebSocket upgrades, SABR media, downloads, and large uploads.

## Before you start

1. Point a DNS record (for example `watch.example.com`) at your server.
2. Add that origin to `ALLOWED_ORIGINS` in `.env`, then re-apply:

   ```sh
   # .env
   ALLOWED_ORIGINS=https://watch.example.com
   ```

   ```sh
   docker compose up -d
   ```

## Option A — Caddy (recommended)

Caddy obtains and renews TLS certificates automatically. A two-line `Caddyfile` is
enough:

```text
watch.example.com {
    reverse_proxy localhost:8082
}
```

Caddy forwards WebSockets and the right headers out of the box. That is all you need.

## Option B — nginx

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl;
    server_name watch.example.com;

    # ssl_certificate ... (use certbot to obtain a certificate)

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

Use [certbot](https://certbot.eff.org/) to obtain and renew the certificate.

::: warning Keep the upgrade headers and body size
The app uses WebSockets and accepts large uploads (Takeout imports). If you drop the
`Upgrade`/`Connection` headers or set a small `client_max_body_size`, parts of the app
break. The settings above match what the bundled web container expects.
:::

## Remote login and WebSockets

Interactive YouTube login starts with a normal HTTP request, then opens a WebSocket
under `/api/youtube-session/browser/...`. Both the external reverse proxy and the
bundled nginx configuration must preserve the upgrade.

A characteristic failure looks like this:

```text
POST /api/youtube-session/browser/start -> 201
GET  /api/youtube-session/browser/<session-id> -> 404
```

The `201` shows that Server and Token created the session. The following `404` means
the browser connection reached Ktor as a plain HTTP GET instead of a WebSocket. Check
the `Upgrade` and `Connection` headers at every proxy layer.

If you mount `nginx.conf` from the host, refresh it when updating TypeType. An older
copy can override the fixed configuration shipped by the current project files.

Thanks to [arcoast](https://github.com/arcoast), whose manual deployment in
[discussion #122](https://github.com/TypeType-Video/TypeType/discussions/122)
identified a stale nginx file as the missing WebSocket boundary.

## Downloads behind a domain

The supported stack serves artifacts through `/api/downloader/...`. Server follows
the internal Garage redirect and streams the result, so a normal deployment does not
need a second public hostname for Garage.

Only expose Garage separately when a deliberate custom Downloader configuration uses
a public S3 endpoint. In that topology, protect the endpoint according to the object
store's documentation and keep the access credentials private.
