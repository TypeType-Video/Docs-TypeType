# Twitch (optional)

Die Twitch-Unterstützung ist ein optionaler Dienst, veröffentlicht als
[TypeType-Live](https://github.com/TypeType-Video/TypeType-Live). Damit durchsuchen Nutzer Twitch-Lives,
Kategorien und Tags, schauen Lives, vergangene Übertragungen und Clips, lesen und schreiben im Chat und
können ihr Twitch-Konto verknüpfen. Vergangene Übertragungen merken sich ihre Position wie jedes andere Video. Twitch sieht nie ihre IP-Adresse, und ihr Browser kontaktiert Twitch nie.

Ein Stack ohne diesen Dienst verhält sich genau wie vorher und zeigt keinen Twitch-Bereich.

## Bevor du beginnst {#requirements}

| Ressource | Menge |
| --- | --- |
| Arbeitsspeicher | Etwa 128 MB (`LIVE_MEMORY_LIMIT`) |
| Speicherplatz | Etwa 10 MB für das Image |
| TypeType | 1.18.0 oder neuer, installiert mit dem Installer oder der unterstützten Compose-Datei |

Was sich an deinem Stack ändert, wenn du ihn hinzufügst:

- ein neuer Container, `typetype-live`;
- drei neue Geheimnisse im Volume `typetype_secrets`, erstellt von `typetype-init`: das Geheimnis, das Server
  mit Live teilt, der Schlüssel, der verknüpfte Twitch-Konten verschlüsselt, und der Schlüssel, der
  Wiedergabelinks über Neustarts hinweg gültig hält;
- Server wird mit der Adresse des Dienstes neu erstellt.

Die Befehle dieser Seite nutzen `$STACK_DIR` für das Verzeichnis deines Stacks:

```sh
STACK_DIR=~/typetype-stack
```

## A. Mit dem Installer {#install}

Starte den Installer mit `--twitch`, auf einer neuen oder einer bestehenden Instanz:

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --twitch
```

::: tip Während des Release Candidate 1.18.0
Bis 1.18.0 erscheint, gibt es `--twitch` nur im Installer der Release Candidates: Nutze
`https://raw.githubusercontent.com/TypeType-Video/TypeType/staging/scripts/install-stack.sh` mit
`bash -s -- --rc --twitch`.
:::

Ohne `--yes` fragt der Installer auch nach. Er schreibt `TWITCH_ENABLED=true` in `.env`, damit spätere
Updates Twitch behalten.

## B. Von Hand {#install-by-hand}

```sh
cd "$STACK_DIR"
COMPOSE_TWITCH_FILE=docker-compose.twitch.yml ./scripts/run-stack-init.sh
docker compose -f docker-compose.yml -f docker-compose.twitch.yml up -d --wait
```

Füge `TWITCH_ENABLED=true` zu `.env` hinzu, wenn du später mit dem Installer aktualisierst.

## Prüfen, ob es funktioniert {#check}

Öffne die Instanz: Die Seitenleiste zeigt **Live**. Öffne einen Live-Kanal und seinen Chat.

```sh
docker compose -f docker-compose.yml -f docker-compose.twitch.yml ps typetype-live
```

Der Container muss `healthy` sein.

## Ein Twitch-Konto verknüpfen {#link-account}

Jeder Nutzer kann sein eigenes Twitch-Konto unter **Live > Twitch-Konto verknüpfen** verknüpfen. TypeType
zeigt einen Code, den man auf `twitch.tv/activate` an einem beliebigen bei Twitch angemeldeten Gerät eingibt.
Ein verknüpftes Konto zeigt die gefolgten Lives, erlaubt Chat und Folgen und liest Chat und Kapitel
vergangener Übertragungen mit diesem Konto. Die Tokens bleiben verschlüsselt in der Datenbank und erreichen
nie den Browser.

## Entfernen {#remove}

Setze `TWITCH_ENABLED=false` in `.env`, damit ein späteres Update ihn nicht wieder hinzufügt, und starte den
Stack ohne die Twitch-Datei:

```sh
cd "$STACK_DIR"
docker compose -f docker-compose.yml up -d --remove-orphans --wait
```

Der Twitch-Bereich verschwindet. Verknüpfte Konten bleiben verschlüsselt in der Datenbank.

## Einstellungen {#settings}

| Variable | Standard | Zweck |
| --- | --- | --- |
| `TYPETYPE_LIVE_IMAGE` | folgt `TYPETYPE_VERSION` | Live-Image |
| `LIVE_MEMORY_LIMIT` | `128m` | Speichergrenze des Containers |
| `LIVE_SEGMENT_CACHE` | `48MiB` | Gemeinsamer Cache der Videosegmente |
| `TWITCH_SERVICE_TIMEOUT_MS` | `15000` | Zeitlimit der Aufrufe von Server an Live |

## Eigene Compose-Datei {#own-compose}

Wenn du TypeType mit einer eigenen Compose-Datei betreibst, füge den Dienst `typetype-live` aus
[docker-compose.twitch.yml](https://github.com/TypeType-Video/TypeType/blob/main/docker-compose.twitch.yml)
hinzu, ohne seinen Port zu veröffentlichen: Nur der Server und der Web-Container sprechen mit ihm. Seine
Variablen stehen in der [README von TypeType-Live](https://github.com/TypeType-Video/TypeType-Live).

### Den Server auf den Dienst verweisen {#server}

| Variable | Bedeutung |
| --- | --- |
| `TWITCH_SERVICE_URL` | Adresse des Dienstes, zum Beispiel `http://typetype-live:8080` |
| `TWITCH_SERVICE_SECRET` | Derselbe Wert wie `LIVE_SECRET` |
| `TWITCH_TOKEN_ENCRYPTION_KEY` | Mindestens 32 zufällige Zeichen; verschlüsselt die Twitch-Konten, die Nutzer verknüpfen |
| `TWITCH_SERVICE_TIMEOUT_MS` | Zeitlimit für Anfragen an den Dienst, standardmäßig `15000` |

`TWITCH_SERVICE_SECRET` und `TWITCH_TOKEN_ENCRYPTION_KEY` akzeptieren auch eine
`_FILE`-Variante, die den Wert aus einer Datei liest. Twitch bleibt aus, bis alle drei
ersten Variablen gesetzt sind.

### Der Web-Container {#web}

Das Web-Image leitet `/live/hls/` bereits an den Dienst unter `typetype-live:8080` weiter.
Setze `TYPETYPE_LIVE_HOST` und `TYPETYPE_LIVE_PORT` am Web-Container, wenn deiner einen
anderen Namen oder Port hat. Nur die signierten Videolinks laufen über diese Route; die API
des Dienstes bleibt hinter dem geteilten Geheimnis privat.
