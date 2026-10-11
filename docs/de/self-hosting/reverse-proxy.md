# Reverse-Proxy und HTTPS

Für eine echte Installation stellen Sie einen Reverse-Proxy vor den Stack und liefern
ihn über HTTPS unter Ihrer eigenen Domain aus. Sie geben immer nur den
**Web**-Container frei (`HOST_PORT_WEB`, standardmäßig `8082`); er leitet `/api/`
intern bereits an den Server weiter, einschließlich WebSocket-Upgrades, SABR-Medien,
Downloads und großer Uploads.

## Bevor Sie beginnen {#before-you-start}

1. Richten Sie einen DNS-Eintrag (zum Beispiel `watch.example.com`) auf Ihren Server.
2. Fügen Sie diesen Origin zu `ALLOWED_ORIGINS` in `.env` hinzu und wenden Sie die
   Änderung an:

   ```sh
   # .env
   ALLOWED_ORIGINS=https://watch.example.com
   ```

   ```sh
   docker compose up -d
   ```

## Option A - Caddy (empfohlen) {#option-a---caddy-recommended}

Caddy bezieht und erneuert TLS-Zertifikate automatisch. Ein `Caddyfile` mit drei
Zeilen genügt:

```text
watch.example.com {
    reverse_proxy localhost:8082
}
```

Caddy leitet WebSockets und die richtigen Header von Haus aus weiter. Mehr brauchen
Sie nicht.

## Option B - nginx {#option-b---nginx}

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl;
    server_name watch.example.com;

    # ssl_certificate ... (mit certbot ein Zertifikat beziehen)

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

Verwenden Sie [certbot](https://certbot.eff.org/), um das Zertifikat zu beziehen und
zu erneuern.

::: warning Behalten Sie die Upgrade-Header und die Body-Größe bei
Die App verwendet WebSockets und nimmt große Uploads an (Takeout-Importe). Wenn Sie
die Header `Upgrade`/`Connection` weglassen oder eine kleine `client_max_body_size`
setzen, funktionieren Teile der App nicht mehr. Die obigen Einstellungen entsprechen
dem, was der mitgelieferte Web-Container erwartet.
:::

## Option C - Traefik {#option-c---traefik}

Diese Beispiele setzen eine bestehende Traefik-Installation voraus, mit einem
Einstiegspunkt `websecure`, der auf Port 443 lauscht, und einem in der statischen
Konfiguration von Traefik eingerichteten
[ACME-Zertifikats-Resolver](https://doc.traefik.io/traefik/reference/install-configuration/tls/certificate-resolvers/acme/).
Ersetzen Sie `YOUR_CERT_RESOLVER` durch den Namen dieses Resolvers und
`watch.example.com` durch Ihre Domain. Traefik verwendet den Resolver, um
TLS-Zertifikate zu beziehen und zu erneuern; die folgenden Ausschnitte legen ihn nicht
an.

Hängen Sie Traefik und den Web-Dienst von TypeType (`typetype`) an dasselbe
Docker-Netzwerk. Die Beispiele verwenden ein vorhandenes externes Netzwerk namens
`proxy`; ersetzen Sie diesen Namen durch den Ihres Traefik-Netzwerks. Lassen Sie den
Web-Dienst außerdem in seinem vorhandenen Netzwerk `default`, damit er den
TypeType-Server weiterhin erreicht.

Für den Docker-Provider von Traefik fügen Sie Folgendes in Ihre Compose-Konfiguration
ein:

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

Alternativ behalten Sie dieselben Netzwerkanbindungen und verwenden statt der Labels
diese dynamische YAML-Konfiguration mit dem Datei-Provider von Traefik:

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

Der Web-Container liefert unverschlüsseltes HTTP auf Port 80; Traefik terminiert
HTTPS. Schalten Sie in Traefik den Docker- oder den Datei-Provider ein, je nach
gewähltem Beispiel.

## Remote-Anmeldung und WebSockets {#remote-login-and-websockets}

Die interaktive YouTube-Anmeldung beginnt mit einer normalen HTTP-Anfrage und öffnet
dann einen WebSocket unter `/api/youtube-session/browser/...`. Sowohl der externe
Reverse-Proxy als auch die mitgelieferte nginx-Konfiguration müssen das Upgrade
erhalten.

Ein typischer Fehler sieht so aus:

```text
POST /api/youtube-session/browser/start -> 201
GET  /api/youtube-session/browser/<session-id> -> 404
```

Das `201` zeigt, dass Server und Token die Sitzung angelegt haben. Das folgende `404`
bedeutet, dass die Verbindung des Browsers bei Ktor als normales HTTP-GET statt als
WebSocket angekommen ist. Prüfen Sie die Header `Upgrade` und `Connection` auf jeder
Proxy-Ebene.

Das unterstützte Web-Image enthält diese nginx-Konfiguration, normale Aktualisierungen
erneuern sie also mit dem Image. Eine eigene Einbindung vom Host überschreibt die
mitgelieferte Datei; ist eine in `docker-compose.override.yml` deklariert, vergleichen
Sie sie mit der aktuellen Konfiguration des Frontends, wenn sich das Routing von
WebSockets oder API ändert.

Dank an [arcoast](https://github.com/arcoast), dessen manuelle Installation in
[Diskussion #122](https://github.com/TypeType-Video/TypeType/discussions/122) eine
veraltete nginx-Datei als die fehlende WebSocket-Grenze erkannt hat.

## Downloads hinter einer Domain {#downloads-behind-a-domain}

Der unterstützte Stack liefert Artefakte über `/api/downloader/...` aus. Server folgt
der internen Umleitung von Garage und streamt das Ergebnis, eine normale Installation
braucht also keinen zweiten öffentlichen Hostnamen für Garage.

Geben Sie Garage nur dann gesondert frei, wenn eine bewusste eigene
Downloader-Konfiguration einen öffentlichen S3-Endpunkt verwendet. Schützen Sie den
Endpunkt in dieser Topologie gemäß der Dokumentation des Objektspeichers und halten
Sie die Zugangsdaten privat.
