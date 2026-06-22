# Reverse proxy and HTTPS

For a real deployment you put a reverse proxy in front of the stack and serve it over
HTTPS on your own domain. You only ever expose the **web** container
(`HOST_PORT_WEB`, default `8082`); it already proxies `/api/` to the server
internally, including WebSocket upgrades and large uploads.

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

## Downloads behind a domain

If you enabled [downloads](./docker-compose#part-2-object-storage-for-downloads), set
`DOWNLOADER_S3_PUBLIC_ENDPOINT` in `.env` to a URL the **browser** can reach (not
`localhost`), and expose the object store's S3 port the same way, on its own
subdomain for example. Leave it at the default if you do not use downloads.
