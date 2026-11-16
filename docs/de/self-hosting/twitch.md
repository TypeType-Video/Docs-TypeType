# Twitch (optional)

Die Twitch-Unterstützung ist ein optionaler Dienst, veröffentlicht als
[TypeType-Live](https://github.com/TypeType-Video/TypeType-Live). Damit durchsuchen Nutzer Twitch-Lives,
Kategorien und Tags, schauen Lives, vergangene Übertragungen und Clips, lesen und schreiben im Chat und
können ihr Twitch-Konto verknüpfen. Vergangene Übertragungen merken sich ihre Position wie jedes andere
Video. Twitch sieht nie ihre IP-Adresse, und ihr Browser kontaktiert Twitch nie.

Ein Stack ohne diesen Dienst verhält sich genau wie vorher und zeigt keinen Twitch-Bereich.

## Bevor du beginnst {#requirements}

| Ressource | Menge |
| --- | --- |
| Arbeitsspeicher | Etwa 128 MB |
| Speicherplatz | Etwa 10 MB für das Image |
| TypeType | 1.18.0 oder neuer |

Was sich an deinem Stack ändert: ein neuer Container, `typetype-live`, und Server wird mit der Adresse des
Dienstes neu erstellt. Nur Server und der Web-Container sprechen mit ihm; veröffentliche seinen Port nicht.

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

Der Installer erstellt die Geheimnisse, fügt den Dienst hinzu und behält ihn bei späteren Updates.

## B. Von Hand {#install-by-hand}

Für alle, die ihren Stack selbst verwalten, zum Beispiel mit Dockge.

1. Füge drei zufällige Geheimnisse mit mindestens 32 Zeichen in `.env` ein. Jeder Passwortgenerator geht;
   `openssl rand -hex 32` gibt eines aus.

   ```dotenv
   TWITCH_SERVICE_SECRET=durch-einen-zufaelligen-wert-ersetzen
   TWITCH_TOKEN_ENCRYPTION_KEY=durch-einen-anderen-zufaelligen-wert-ersetzen
   LIVE_SIGNING_KEY=durch-einen-dritten-zufaelligen-wert-ersetzen
   ```

   Behalte `TWITCH_TOKEN_ENCRYPTION_KEY`, sobald Konten verknüpft sind: Wenn er sich ändert, müssen die
   Nutzer sie neu verknüpfen.

2. Füge den Dienst in `docker-compose.override.yml` neben `docker-compose.yml` ein (lege die Datei an,
   falls es sie noch nicht gibt; der Installer behält sie bei Updates):

   ```yaml
   services:
     typetype-server:
       environment:
         TWITCH_SERVICE_URL: http://typetype-live:8080
         TWITCH_SERVICE_SECRET: ${TWITCH_SERVICE_SECRET}
         TWITCH_TOKEN_ENCRYPTION_KEY: ${TWITCH_TOKEN_ENCRYPTION_KEY}

     typetype-live:
       image: ghcr.io/typetype-video/typetype-live:${TYPETYPE_VERSION:-latest}
       restart: unless-stopped
       environment:
         LIVE_SECRET: ${TWITCH_SERVICE_SECRET}
         LIVE_SIGNING_KEY: ${LIVE_SIGNING_KEY}
         LIVE_PUBLIC_BASE: /live
       mem_limit: 128m
       read_only: true
       cap_drop: [ALL]
       security_opt: ["no-new-privileges:true"]
   ```

   Während des Release Candidate folgt der Stack `TYPETYPE_VERSION=rc`, und Live ebenso.

3. Starte ihn:

   ```sh
   docker compose up -d
   ```

   Der Web-Container leitet die Videolinks unter `/live/` bereits an `typetype-live:8080` weiter. Hat dein
   Live-Container einen anderen Namen, setze `TYPETYPE_LIVE_HOST` (und `TYPETYPE_LIVE_PORT`) am Web-Container.

## Prüfen, ob es funktioniert {#check}

Öffne die Instanz: Die Seitenleiste zeigt **Live**. Öffne einen Live-Kanal und seinen Chat. Im Verzeichnis
des Stacks zeigt `docker compose ps typetype-live` den Container als `healthy`.

## Ein Twitch-Konto verknüpfen {#link-account}

Jeder Nutzer kann sein eigenes Twitch-Konto unter **Live > Twitch-Konto verknüpfen** verknüpfen. TypeType zeigt
einen Code, den man auf `twitch.tv/activate` an einem beliebigen bei Twitch angemeldeten Gerät eingibt. Ein
verknüpftes Konto zeigt die gefolgten Lives, erlaubt Chat und Folgen und liest Chat und Kapitel vergangener
Übertragungen mit diesem Konto. Die Tokens bleiben verschlüsselt in der Datenbank und erreichen nie den Browser.

## Entfernen {#remove}

Mit dem Installer setzt du `TWITCH_ENABLED=false` in `.env` und startest ihn erneut. Von Hand entfernst du den
Block `typetype-live` und die drei `TWITCH_*`-Zeilen aus `docker-compose.override.yml` und startest
`docker compose up -d --remove-orphans`. Der Twitch-Bereich verschwindet; verknüpfte Konten bleiben
verschlüsselt in der Datenbank.

## Einstellungen {#settings}

| Variable | Standard | Zweck |
| --- | --- | --- |
| `TWITCH_SERVICE_URL` | | Adresse des Dienstes, wie Server ihn erreicht |
| `TWITCH_SERVICE_SECRET` | | Von Server und Live geteilt (`LIVE_SECRET`), mindestens 32 Zeichen |
| `TWITCH_TOKEN_ENCRYPTION_KEY` | | Verschlüsselt verknüpfte Twitch-Konten, mindestens 32 Zeichen |
| `LIVE_SIGNING_KEY` | zufällig beim Start | Hält Videolinks über Neustarts gültig, mindestens 32 Zeichen |
| `LIVE_SEGMENT_CACHE` | `32MiB` | Speicher für gemeinsame Videosegmente |
| `TWITCH_SERVICE_TIMEOUT_MS` | `15000` | Zeitlimit der Aufrufe von Server an Live |

Twitch bleibt aus, bis Server die ersten drei hat. Jedes Geheimnis akzeptiert auch eine `_FILE`-Variante, die
den Wert aus einer Datei liest.
