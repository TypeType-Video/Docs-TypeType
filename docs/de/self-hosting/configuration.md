# Konfiguration

Der unterstützte Stack liest die Entscheidungen zur Installation aus `.env`. Der Installer legt diese Datei für Sie an und aktualisiert sie. Für eine manuelle Installation kopieren Sie `.env.example`, ersetzen die unten genannten Werte und halten die Datei aus der Versionsverwaltung heraus.

Nicht jede interne Dienstvariable gehört in `.env`: Die zentrale Compose-Datei leitet interne URLs ab und reicht an jeden Container nur unterstützte Einstellungen weiter. Verwenden Sie ein Compose-Override, um eine eigene Topologie aufzubauen.

## Web- und Diagnose-Ports {#ports}

| Variable | Standard | Zweck |
| --- | --- | --- |
| `HOST_PORT_WEB` | `8082` | Öffentlicher Web-Container; nginx liefert die App, die API, WebSockets, SABR und Downloads aus |
| `HOST_BIND_SERVER` | `127.0.0.1` | Host-Adresse für den Diagnose-Port von Server |
| `HOST_PORT_SERVER` | `8080` | Port für Diagnose und direkten API-Zugriff von Server |
| `HOST_BIND_TOKEN` | `127.0.0.1` | Host-Adresse für den Diagnose-Port von Token |
| `HOST_PORT_TOKEN` | `8081` | Port für Zustand und Version von Token |
| `HOST_BIND_GARAGE_S3` | `127.0.0.1` | Host-Adresse für Einrichtung und Diagnose von Garage |
| `HOST_PORT_GARAGE_S3` | `3900` | S3-Port von Garage |

Nur `HOST_PORT_WEB` braucht einen öffentlichen Zugang. Lassen Sie die anderen Host-Bindungen auf Loopback, es sei denn, ein bestimmtes vertrauenswürdiges Netzwerk braucht sie. Downloader, PostgreSQL und Dragonfly haben in der unterstützten Compose-Datei keinen festen Host-Port.

Die Beta verwendet die entsprechenden Werte `HOST_PORT_*_BETA` und `HOST_BIND_*_BETA`. Siehe [Beta und main](./beta-and-main).

## Erlaubte Browser-Origins {#allowed-browser-origins}

| Variable | Standard | Zweck |
| --- | --- | --- |
| `ALLOWED_ORIGINS` | localhost-URLs für die Entwicklung | Durch Kommas getrennte Browser-Origins, die Server aufrufen dürfen |

Ein Origin besteht aus Schema, Host und optionalem Port, ohne Pfad und ohne abschließenden Schrägstrich:

```dotenv
ALLOWED_ORIGINS=https://watch.example.com,http://192.0.2.10:8082
```

Der Origin des Browsers muss genau übereinstimmen. Eine Seite kann normal laden, während Registrierung, Anmeldung oder andere API-Aktionen mit einem leeren `403` scheitern, wenn dieser Wert falsch ist. Erstellen Sie Server nach einer Änderung neu:

```sh
docker compose up -d --force-recreate typetype-server
```

Diese Diagnose wurde durch [hulmgulms Bericht zum ersten Administrator](https://github.com/TypeType-Video/TypeType/discussions/151) bestätigt.

## Kontositzungen {#account-sessions}

| Variable | Standard | Zweck |
| --- | --- | --- |
| `AUTH_SESSION_TTL_DAYS` | `30` | Lebensdauer der Erneuerungssitzung in Tagen, begrenzt auf `1` bis `365` |
| `AUTH_ALLOW_INSECURE_COOKIES` | `false` | Erlaubt Erneuerungs-Cookies über unverschlüsseltes HTTP mit `SameSite=Lax` |

Zugriffstoken gelten immer eine Stunde. Eine gültige Erneuerungssitzung erneuert sie unbemerkt; `AUTH_SESSION_TTL_DAYS` bestimmt also, wie lange ein Konto ohne neue Anmeldung angemeldet bleiben kann.

Lassen Sie `AUTH_ALLOW_INSECURE_COOKIES=false` bei HTTPS und bei jeder öffentlichen Installation. Setzen Sie den Wert nur dann auf `true`, wenn eine vertrauenswürdige, rein lokale Instanz über unverschlüsseltes HTTP laufen muss. Das schwächt die Transportsicherheit; siehe [Lebensdauer der Sitzung](./authentication#session-lifetime).

Erstellen Sie Server neu, nachdem Sie einen der beiden Werte geändert haben:

```sh
docker compose up -d --force-recreate typetype-server
```

## Datenbank und Cache {#database-and-cache}

Der mitgelieferte PostgreSQL-Dienst verwendet diese Werte:

| Variable | Standard | Zweck |
| --- | --- | --- |
| `POSTGRES_DB` | `typetype` | Hauptdatenbank der Anwendung |
| `POSTGRES_USER` | `typetype` | PostgreSQL-Nutzer |
| `POSTGRES_PASSWORD` | `typetype` | PostgreSQL-Passwort; für eine echte Installation ersetzen |
| `DRAGONFLY_URL` | `redis://dragonfly:6379` | Cache-URL von Server |
| `DRAGONFLY_MAX_MEMORY` | `2gb` | Arbeitsspeicher, den der Cache nutzen darf. Ist er voll, vergisst er seine ältesten Einträge, statt neue abzulehnen. |
| `DRAGONFLY_THREADS` | `4` | Threads des Caches. Dragonfly braucht 256 MB von `DRAGONFLY_MAX_MEMORY` je Thread und startet nicht mit weniger. |

`POSTGRES_DB`, `POSTGRES_USER` und `POSTGRES_PASSWORD` sind die maßgebliche Quelle auf Stack-Ebene. Compose leitet daraus die `DATABASE_*`-Werte von Server und die `DB_URL` des Downloaders ab. Ändern Sie die PostgreSQL-Werte einmal, statt ein Passwort in mehreren dienstspezifischen Variablen zu wiederholen.

Wählen Sie diese Werte vor dem ersten Start. Nachdem PostgreSQL sein Volume initialisiert hat, ändert eine Änderung in `.env` allein nicht das Passwort der vorhandenen Datenbankrolle.

Diese Regelung geht auf die Unstimmigkeit zurück, die [arcoast in Diskussion #123](https://github.com/TypeType-Video/TypeType/discussions/123) aufgezeigt hat.

Für eine externe Datenbank setzen Sie `DATABASE_URL`, `DATABASE_USER` und `DATABASE_PASSWORD` für Server sowie `DB_URL` für den Downloader mit einem Compose-Override. Der Downloader braucht im aktuellen Entwurf seine eigene Datenbank `typetype_downloader`.

## Downloads und Garage {#downloads-and-garage}

| Variable | Standard | Zweck |
| --- | --- | --- |
| `DOWNLOADER_S3_ACCESS_KEY` | Platzhalter | Garage-Zugriffsschlüssel; muss mit `GK` beginnen |
| `DOWNLOADER_S3_SECRET_KEY` | Platzhalter | Geheimnis des Garage-Zugriffsschlüssels |
| `GARAGE_RPC_SECRET` | Platzhalter | RPC-Geheimnis des Garage-Clusters, 32 Byte hexadezimal |

Der Installer erzeugt alle drei Werte und richtet den Bucket ein. Eine Installation ohne Skripte muss die Platzhalter ersetzen und [Manuelle Einrichtung, Teil 2](./docker-compose#part-2-object-storage-for-downloads) abschließen.

Der mitgelieferte Downloader verwendet `http://garage:3900` sowohl für seinen S3-Client als auch für die vorsignierte Artefakt-URL. Server erkennt diesen internen Hostnamen und reicht die fertige Datei an den Browser weiter. Im unterstützten `.env` gibt es keine erforderliche Variable `DOWNLOADER_S3_PUBLIC_ENDPOINT`.

Die Erzeugung von `GARAGE_RPC_SECRET` kam hinzu, nachdem [arcoast in Diskussion #130 auf das fehlende Geheimnis hingewiesen hatte](https://github.com/TypeType-Video/TypeType/discussions/130).

## Mitgelieferte und eigene Dienstkonfiguration {#bundled-and-custom-service-configuration}

Das Web-Image enthält die unterstützte nginx-Konfiguration. Der zentrale Stack bindet keine `nginx.conf` vom Host ein, Korrekturen am Proxy kommen also mit den normalen Aktualisierungen des Web-Images.

Der Init-Dienst `garage-config` schreibt die Standardkonfiguration von Garage nur dann in das benannte Volume `garage_config`, wenn dieses Volume noch keine Konfiguration enthält. Vorhandene Inhalte werden nie überschrieben. Bei der Migration von einem älteren Stack stellt der Installer die frühere `garage.toml` des Hosts bereit, und der Init-Dienst importiert sie bei der ersten Verwendung.

Halten Sie bewusste Änderungen an nginx oder Garage in eigenen Dateien und binden Sie sie über `docker-compose.override.yml` ein. Der Installer behält das Override und ersetzt keine nicht verwalteten Konfigurationsdateien. Ein Beispiel finden Sie unter [Eigene nginx- oder Garage-Konfiguration](./docker-compose#custom-nginx-or-garage-configuration).

## YouTube und Token {#youtube-and-token}

Token bleibt aktiv, weil die YouTube-Wiedergabe seine Endpunkte für PO-Token, Decoder, Untertitel und SABR verwendet. Der folgende Schalter steuert nur die interaktive Remote-Anmeldung:

| Variable | Standard | Zweck |
| --- | --- | --- |
| `YOUTUBE_REMOTE_LOGIN_ENABLED` | `false` | Schaltet die interaktive YouTube-Anmeldung ein |
| `YOUTUBE_OUTBOUND_PROXY_URL` | leer | Optionaler ausgehender Proxy für den YouTube-Verkehr |
| `YOUTUBE_REMOTE_LOGIN_CALLBACK_BASE_URL` | `http://localhost:8080` | Interner Server-Origin, der den Abschluss-Rückruf von Token empfängt |
| `YOUTUBE_REMOTE_LOGIN_CALLBACK_ORIGIN` | `http://typetype-server:8080` | Interner Rückruf-Origin, den Token verwendet |
| `YOUTUBE_REMOTE_LOGIN_TTL_MS` | `480000` | Von Server angeforderte Lebensdauer, begrenzt auf 1 bis 10 Minuten |
| `YOUTUBE_REMOTE_LOGIN_MAX_SESSIONS` | `2` | Gleichzeitige Remote-Browser-Sitzungen, begrenzt auf 1 bis 8 |
| `YOUTUBE_REMOTE_LOGIN_FRAME_FPS` | `10` | Aufnahmerate der Anmeldeansicht |
| `YOUTUBE_REMOTE_LOGIN_MAX_FRAME_BYTES` | `524288` | Maximale Größe eines kodierten Anmeldebilds |

Lassen Sie den Standard-Rückruf auf einer internen Server-URL. Der Browser erreicht die Anmeldesitzung über den öffentlichen Web-Origin und einen WebSocket; er ruft diese Rückruf-Adresse nicht direkt auf.

Beide Rückruf-Einstellungen müssen in einem eigenen Compose-Stack denselben internen Server-Origin verwenden. Setzen Sie `YOUTUBE_REMOTE_LOGIN_CALLBACK_BASE_URL` bei Server und `YOUTUBE_REMOTE_LOGIN_CALLBACK_ORIGIN` bei Token auf den Hostnamen und Port, den Token im Compose-Netzwerk erreichen kann, zum Beispiel `http://typetype-server:8080`. Verwenden Sie für keine der beiden Einstellungen die öffentliche Web-URL.

In der unterstützten Compose-Datei behält Token seine eigene Standardobergrenze von acht Minuten, weil diese Variable nur an Server weitergereicht wird. Werte über acht Minuten verlängern die tatsächliche Reservierung daher nicht ohne eine eigene Token-Konfiguration.

Eigene Compose-Stacks, die den Dienst `typetype-token` umbenennen, müssen die aktuelle Variable für den internen Endpunkt von Server, `SUBTITLE_SERVICE_URL`, setzen oder `typetype-token` als Netzwerk-Alias behalten. Siehe [Eigene Namen für den Token-Dienst](./security#custom-token-service-names).

## Grenzen für Anfragen an YouTube {#youtube-request-limits}

Eine Instanz erreicht YouTube über eine einzige Adresse, und YouTube lehnt eine Adresse ab, die zu viel verlangt: Geöffnete Videos scheitern dann mit „Sign in to confirm you're not a bot“, länger als zehn Minuten. Suche, Kanalseiten und Videoseiten vertragen weit mehr als das Öffnen von Videos.

Server liest diese Werte aus seiner eigenen Umgebung. Die unterstützte Compose-Datei reicht sie nicht weiter: Setzen Sie sie mit einem Compose-Override für `typetype-server`.

| Variable | Standard | Zweck |
| --- | --- | --- |
| `YOUTUBE_OPENS_PER_MINUTE` | `0` (keine Grenze) | Videos, die die gesamte Instanz pro Minute bei YouTube öffnet. Darüber wartet jedes Video, bis es an der Reihe ist, höchstens 30 Sekunden. Ein Video, auf das niemand wartet, stellt sich nie an: Es geht sofort oder gar nicht. |
| `YOUTUBE_SESSION_RENEWAL` | an | Nach drei abgelehnten Videos innerhalb einer Minute fordert Server einmal eine neue Sitzung bei Token an und wartet dann zwei Minuten. `off` schaltet das ab. |
| `YOUTUBE_LIVE_PROBE` | Live-Client zuerst | `after` fragt zuerst den üblichen Client und den Live-Client nur für das, was dieser als live meldet. Für eine stark genutzte Instanz: Der Live-Client bearbeitet ein Video nach dem anderen. |
| `STREAM_PREVIEWS` | an | `off` lehnt jedes Video ab, das angefordert wird, bevor es jemand ansieht, etwa beim Überfahren einer Karte. |
| `SABR_INITIALIZATION_RANGE` | an | `off` überspringt eine Anfrage, die YouTube für manche Adressen bei jeder Wiedergabe ablehnt. |
| `EXTRACTOR_SIMULTANEOUS_REQUESTS_PER_HOST` | `64` | Anfragen, die der Extraktor gleichzeitig an einen Host unterwegs haben darf |
| `EXTRACTOR_HTTP_VERSION` | HTTP/2 | `1` verwendet eine Anfrage je Verbindung. Nutzen Sie das, wenn Server unter Ansturm nicht mehr antwortet, während sein Prozessor untätig ist. |
| `SUBSCRIPTION_FEED_MAX_CONCURRENT_FETCHES` | `20` | Kanalseiten, die gleichzeitig abgefragt werden, wenn ein Abonnement-Feed aufgebaut wird; lässt sich nur senken |
| `SUBSCRIPTION_FEED_FRESHNESS_SECONDS` | `60` | Wie alt ein Abonnement-Feed sein darf, bevor sein Lesen eine Aktualisierung auslöst; lässt sich nur erhöhen, bis zu einem Tag |
| `YOUTUBE_REQUEST_LOG` | aus | `1` schreibt eine Protokollzeile je Anfrage an YouTube. Nur zur Diagnose. |

```yaml
services:
  typetype-server:
    environment:
      YOUTUBE_OPENS_PER_MINUTE: "120"
      YOUTUBE_LIVE_PROBE: after
```

Speichern Sie das als `docker-compose.override.yml` im Stack-Verzeichnis und erstellen Sie dann Server neu:

```sh
docker compose up -d --force-recreate typetype-server
```

Server fordert von sich aus nie den Text einer Untertitelspur bei YouTube an; das ist die Adresse, die YouTube am strengsten überwacht.

## Empfehlungsdienst {#recommender}

Der optionale Empfehlungsdienst hat eine eigene Seite mit seinen Voraussetzungen und allen Einstellungen: [Empfehlungsdienst](./recommender).

## YouTube-Geheimnisse {#secrets-handled-automatically}

| Variable | Zweck |
| --- | --- |
| `YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN` | Authentifiziert die Rückrufe der Remote-Anmeldung zwischen Server und Token |
| `YOUTUBE_SESSION_ENCRYPTION_KEY` | Verschlüsselt gespeicherte YouTube-Sitzungsdaten |

Der Init-Container `typetype-secrets` schreibt sie in ein privates benanntes Volume. Leere Werte und die Platzhalter `SET_ME_...` führen dazu, dass beim ersten Start ein Wert erzeugt wird. Ein echter Wert in `.env` ersetzt die erzeugte Datei.

Wechseln Sie `YOUTUBE_SESSION_ENCRYPTION_KEY` nicht leichtfertig: Bereits gespeicherte YouTube-Sitzungen lassen sich mit einem anderen Schlüssel nicht entschlüsseln.

## OIDC {#oidc}

OIDC-Variablen werden von Server unterstützt, gehören aber nicht zur grundlegenden `.env.example`. Fügen Sie sie über ein Compose-Override hinzu, wie unter [Authentifizierung (OIDC)](./authentication) beschrieben. Die unterstützten Server-Variablen sind:

- `OIDC_ISSUER` (oder `OIDC_ISSUER_URL`);
- `OIDC_CLIENT_ID`;
- `OIDC_CLIENT_SECRET`;
- optional `OIDC_DISCOVERY_URL`, `OIDC_SCOPES` und `OIDC_PROVIDER_NAME`.

## Abweichende Images {#image-overrides}

Lassen Sie diese leer, um den normalen stabilen oder Beta-Image-Tags zu folgen:

| Stabil | Beta |
| --- | --- |
| `TYPETYPE_WEB_IMAGE` | `TYPETYPE_WEB_BETA_IMAGE` |
| `TYPETYPE_SERVER_IMAGE` | `TYPETYPE_SERVER_BETA_IMAGE` |
| `TYPETYPE_DOWNLOADER_IMAGE` | `TYPETYPE_DOWNLOADER_BETA_IMAGE` |
| `TYPETYPE_TOKEN_IMAGE` | `TYPETYPE_TOKEN_BETA_IMAGE` |
| `TYPETYPE_RECOMMENDER_IMAGE` | `TYPETYPE_RECOMMENDER_IMAGE` |

Setzen Sie sie für ein Rollback oder eine festgelegte Installation auf unveränderliche Referenzen `ghcr.io/...@sha256:...`. Siehe [Eine Aktualisierung zurücknehmen](./rollback).

## Fehlerberichte {#bug-reports}

| Variable | Standard | Zweck |
| --- | --- | --- |
| `GITHUB_REPO` | `TypeType-Video/TypeType` | Repository, auf das der Berichtslink in der App zielt |
| `GITHUB_ISSUE_TEMPLATE` | `bug_report_backend.md` | Dateiname der Vorlage, der an den Berichtslink in der App angehängt wird |

::: warning Derzeitige Unstimmigkeit mit dem zentralen Tracker
Das ausgelieferte Ziel-Repository und die Vorlage passen derzeit nicht zusammen: `bug_report_backend.md` existiert in TypeType-Server, nicht im zentralen TypeType-Repository. Die zentrale Auswahl bietet zwar `bug_report.yml`, diese Datei ist aber ein strukturiertes Issue-Formular, dessen Felder eigene Abfrage-IDs verwenden; der Generator in der App sendet einen einzigen Markdown-`body`. Den Dateinamen durch `bug_report.yml` zu ersetzen ist daher keine gleichwertige Lösung für das Vorausfüllen der Diagnose.
:::

Wenn Sie auf einen Fork oder ein anderes Repository zielen, verwenden Sie eine Vorlage, die zu der URL passt, die dessen Issue-Ablauf erwartet. Die aktuelle Einschränkung und den manuellen Meldeweg finden Sie unter [Probleme melden](./reporting-issues#from-inside-the-app).

## Die aufgelöste Konfiguration prüfen {#validate-the-resolved-configuration}

Compose kann den endgültigen Dienstgraphen anzeigen, ohne ihn zu starten:

```sh
docker compose config -q
docker compose config
```

Der zweite Befehl löst Variablen auf; fügen Sie seine Ausgabe also nicht öffentlich ein, ohne Passwörter und Geheimnisse zu entfernen.

## Quellen {#source-references}

- [Aktuelle `.env.example`](https://github.com/TypeType-Video/TypeType/blob/main/.env.example)
- [Umgebung des stabilen Compose](https://github.com/TypeType-Video/TypeType/blob/main/docker-compose.yml)
- [Laden der Umgebung in Server](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/Application.kt)
- [Konfiguration der Remote-Anmeldung](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/YoutubeRemoteBrowserConfig.kt)
