# Sicherheitsgrenzen

TypeType verarbeitet Kontodaten, YouTube-Sitzungscookies, im Browser ausgeführte
Token-Logik und heruntergeladene Medien. Diese Seite beschreibt die Grenzen, die der
unterstützte Compose-Stack bietet, und die Einschränkungen, die Sie kennen sollten,
bevor Sie ihn anpassen.

## Öffentliche und interne Dienste {#public-and-internal-services}

Geben Sie nur den Web-Dienst für Nutzer frei. Der aktuelle Stack verwendet diese
Grenzen:

| Dienst | Standard-Freigabe auf dem Host | Grund |
| --- | --- | --- |
| `typetype` | alle Schnittstellen auf `HOST_PORT_WEB` | Öffentliches Web, API, WebSocket, Wiedergabe und Download-Gateway |
| `typetype-server` | `127.0.0.1:HOST_PORT_SERVER` | Optionale Zustandsprüfung und direkte API-Diagnose vom Host aus |
| `typetype-token` | `127.0.0.1:HOST_PORT_TOKEN` | Optionale Zustandsdiagnose vom Host aus; nie eine öffentliche API |
| `garage` | `127.0.0.1:HOST_PORT_GARAGE_S3` | Interne Diagnose und Einrichtung des Objektspeichers |
| Downloader, PostgreSQL, Dragonfly | nur Compose-Netzwerk | Kein direkter Zugriff durch Browser oder Internet nötig |

Der mitgelieferte nginx schickt den Verkehr unter `/api/` und `/sabr/` an Server.
Server ist dann das Gateway zu Token und Downloader. Geben Sie Token, Downloader,
PostgreSQL oder Dragonfly nicht über Ihren öffentlichen Reverse-Proxy frei.

## Geheimnisse und gespeicherte Zugangsdaten {#secrets-and-stored-credentials}

Der Stack trennt drei Arten von Geheimnissen:

- `YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN` authentifiziert die Rückrufe der
  Remote-Anmeldung von Server an Token.
- `YOUTUBE_SESSION_ENCRYPTION_KEY` verschlüsselt gespeicherte
  YouTube-Sitzungsdaten.
- `GARAGE_RPC_SECRET` authentifiziert den RPC-Verkehr des Garage-Clusters.

Der Installer erzeugt sie und legt die YouTube-Werte im Volume `typetype_secrets` ab.
Manuelle Installationen müssen vor dem Start des Stacks ein zufälliges
Garage-RPC-Geheimnis erzeugen. Halten Sie `.env`, das Geheimnis-Volume und
Datenbanksicherungen privat.

Eine Änderung von `YOUTUBE_SESSION_ENCRYPTION_KEY` macht bereits gespeicherte
YouTube-Sitzungen unlesbar. Eine Änderung von `GARAGE_RPC_SECRET` ohne Rücksicht auf
den vorhandenen Garage-Zustand kann verhindern, dass der Objektspeicher-Knoten normal
startet.

## Browser-Grenze von Token {#token-browser-boundary}

TypeType-Token startet Chromium über Playwright für BotGuard- und PO-Token-Arbeit
sowie für die optionale interaktive YouTube-Anmeldung. Behandeln Sie ihn als Dienst,
der einen Browser ausführt:

- lassen Sie ihn im privaten Compose-Netzwerk;
- lassen Sie den Host-Port an `127.0.0.1` gebunden oder entfernen Sie den
  veröffentlichten Port ganz;
- binden Sie nur das Volume mit den erzeugten Geheimnissen ein, schreibgeschützt;
- aktualisieren Sie das Image zusammen mit dem übrigen Stack;
- geben Sie ihm keinen Zugriff auf fremde Host-Verzeichnisse oder den Docker-Socket.

Das unterstützte Compose verwendet derzeit `init: true` und `ipc: host` für die
Stabilität von Chromium. Das veröffentlichte Image deklariert noch nicht das
vollständige Profil ohne root, schreibgeschützt und ohne Capabilities, das in
[Diskussion #156](https://github.com/TypeType-Video/TypeType/discussions/156)
untersucht wurde.

::: warning Wenden Sie keine ungetestete Härtung blind an
Ein Container kann `/health` bestehen, während `/potoken`, SABR oder die
Remote-Anmeldung defekt ist. Der Betrieb als beliebiger Nutzer `nobody` lässt Chromium
außerdem ohne nutzbares Home-Verzeichnis. Prüfen Sie alle Abläufe von Token, nicht nur
den Zustandsendpunkt, wenn Sie ein eigenes Sicherheitsprofil testen.
:::

Das aktuelle Playwright-Image enthält ein Konto `pwuser`, und Tests aus der Community
haben ergeben, dass ein beschreibbares `/tmp` und `/home/pwuser` ein schreibgeschütztes
Root-Dateisystem ermöglichen können. Diese Konfiguration ist nützliche laufende
Arbeit, aber noch nicht der Standard des unterstützten Stacks, weil Browser-Sandbox,
IPC-Wahl, PO-Token, SABR und Remote-Anmeldung gemeinsam geprüft werden müssen.

Dank an [hugoghx](https://github.com/hugoghx) für die ausführliche Untersuchung der
Container-Grenzen und die reproduzierbaren Tests in Diskussion #156.

## Eigene Namen für den Token-Dienst {#custom-token-service-names}

Der DNS-Name des Dienstes in Compose lautet `typetype-token`, und Server verwendet
derzeit standardmäßig `http://typetype-token:8081`. Wenn ein eigener Stack diesen
Dienst umbenennt, ohne den Netzwerk-Alias zu behalten, setzen Sie die folgende
Umgebungsvariable von Server auf seine interne URL:

```yaml
services:
  typetype-server:
    environment:
      SUBTITLE_SERVICE_URL: http://my-token-service:8081
```

`SUBTITLE_SERVICE_URL` ist der aktuelle Name in der Implementierung, obwohl Token
inzwischen neben Untertiteln auch PO-Token, Dekodierung, SABR und Remote-Anmeldung
übernimmt. Der aktuelle Server liest keine Variable `TOKEN_SERVICE_URL`.

Nutzt die Remote-Anmeldung eine eigene Token-Adresse, setzen Sie für Server auch
`YOUTUBE_REMOTE_LOGIN_SERVICE_URL`. Im unterstützten Stack zeigen beide Werte auf
denselben internen Dienst.

## Authentifizierungssitzungen {#authentication-sessions}

Lokale und OIDC-Anmeldungen stellen ein Zugriffstoken für eine Stunde und eine
rotierende Erneuerungssitzung mit 30 Tagen Gültigkeit aus. Der Erneuerungswert ist ein
Cookie mit `HttpOnly`, `Secure`, `SameSite=None`. Das bedeutet:

- JavaScript kann das kurzlebige Zugriffstoken verwenden, das Erneuerungstoken aber
  nicht lesen;
- auf einer öffentlichen Domain sind HTTPS und eine korrekte Behandlung von
  Zugangsdaten und CORS erforderlich;
- der normale Ablauf eines Zugriffstokens soll eine Erneuerung auslösen, statt den
  Nutzer abzumelden;
- eine Abmeldung oder die Rotation des Erneuerungstokens kann die gespeicherte Sitzung
  widerrufen.

Es gibt keine eigene Einstellung für eine „Angemeldet bleiben“-Dauer. Unerwartete
Abmeldungen vor Ablauf der 30 Tage sollten als Problem mit Cookie, Origin, Proxy oder
Sitzung untersucht werden. Siehe
[Fehlerbehebung](./troubleshooting#unexpected-sign-outs).

Diese Erklärung geht auf die Frage von
[Toni-Vide in Diskussion #162](https://github.com/TypeType-Video/TypeType/discussions/162)
zurück und stützt sich auf den aktuellen Sitzungscode von Server und Frontend.

## OIDC-Geheimnisse {#oidc-secrets}

Verwenden Sie einen vertraulichen OIDC-Client und speichern Sie sein Geheimnis nur in
der Umgebung von Server. Registrieren Sie die genaue Callback-URL, beschränken Sie
beim Anbieter die erlaubten Redirect-URIs und prüfen Sie OIDC, bevor Sie die lokale
Anmeldung abschalten. Siehe [Authentifizierung (OIDC)](./authentication).

## Quellen {#source-references}

- [Dienstgrenzen im stabilen Compose](https://github.com/TypeType-Video/TypeType/blob/main/docker-compose.yml)
- [Container-Image von Token](https://github.com/TypeType-Video/TypeType-Token/blob/dev/Dockerfile)
- [Browser-Implementierung von Token](https://github.com/TypeType-Video/TypeType-Token/blob/dev/src/remote-login-browser.ts)
- [Lebensdauer des Zugriffstokens von Server](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/AuthAccessTokenCodec.kt)
- [Lebensdauer der Erneuerungssitzung von Server](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/AuthTokenIssuer.kt)
- [Einstellungen des Erneuerungs-Cookies](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/AuthCookieHelpers.kt)
