# Twitch (optional)

::: warning Nur Entwicklungszweige
Die Twitch-Unterstützung liegt auf den `dev`-Zweigen von TypeType-Server und
TypeType-Frontend. Sie ist noch in keiner Veröffentlichung enthalten, und der zentrale Stack
bringt sie nicht mit.
:::

Die Twitch-Unterstützung ist ein optionaler Dienst, veröffentlicht als
[TypeType Live](https://github.com/TypeType-Video/TypeType-Live). Ein Stack ohne ihn verhält
sich genau wie vorher: Der Server antwortet auf seinen Twitch-Routen mit `404`, und die
Web-App blendet den Twitch-Bereich aus.

Mit ihm sehen deine Nutzer Twitch-Livestreams, VODs und Clips über deine Instanz. Twitch
sieht nie ihre IP-Adresse, und ihr Browser kontaktiert Twitch nie.

## Bevor du beginnst {#requirements}

| Ressource | Umfang |
| --- | --- |
| Arbeitsspeicher | Begrenzt auf 128 MB, mit `GOMEMLIMIT` bei 100 MiB |
| Image | Aus dem Quellcode gebaut; noch ist kein Image veröffentlicht |
| Netzwerk | Ausgehender Zugriff des Dienstes auf Twitch |

## 1. Den Dienst bauen und starten {#service}

```sh
git clone https://github.com/TypeType-Video/TypeType-Live.git
cd TypeType-Live
docker build -t typetype-live:local .
```

Füge ihn der Compose-Datei deines Stacks hinzu, im selben Netzwerk wie der Server und der
Web-Container:

```yaml
  typetype-live:
    image: typetype-live:local
    restart: unless-stopped
    environment:
      LIVE_SECRET: ${LIVE_SECRET}
      LIVE_SIGNING_KEY: ${LIVE_SIGNING_KEY}
      LIVE_PUBLIC_BASE: /live
      LIVE_SEGMENT_CACHE: 48MiB
      GOMEMLIMIT: 100MiB
    read_only: true
    cap_drop: [ALL]
    security_opt:
      - no-new-privileges:true
    pids_limit: 128
    mem_limit: 128m
```

Veröffentliche seinen Port nicht. Nur der Server und der Web-Container sprechen mit ihm.

| Variable | Standard | Bedeutung |
| --- | --- | --- |
| `LIVE_SECRET` | erforderlich | Mit dem Server geteilt, mindestens 32 Zeichen |
| `LIVE_SIGNING_KEY` | zufällig beim Start | Hält signierte Videolinks über Neustarts hinweg gültig, mindestens 32 Zeichen |
| `LIVE_PUBLIC_BASE` | | Öffentliches Präfix der Videolinks, `/live` mit dem Web-Container von TypeType |
| `LIVE_SEGMENT_CACHE` | `32MiB` | Speicher für geteilte Videosegmente: etwa angesehene Kanäle x Segmentgröße x 6 |
| `LIVE_ADDR` | `:8080` | Lauschadresse |
| `LIVE_LOG_LEVEL` | `info` | Protokollstufe |

## 2. Den Server auf den Dienst verweisen {#server}

| Variable | Bedeutung |
| --- | --- |
| `TWITCH_SERVICE_URL` | Adresse des Dienstes, zum Beispiel `http://typetype-live:8080` |
| `TWITCH_SERVICE_SECRET` | Derselbe Wert wie `LIVE_SECRET` |
| `TWITCH_TOKEN_ENCRYPTION_KEY` | Mindestens 32 zufällige Zeichen; verschlüsselt die Twitch-Konten, die Nutzer verknüpfen |
| `TWITCH_SERVICE_TIMEOUT_MS` | Zeitlimit für Anfragen an den Dienst, standardmäßig `15000` |

`TWITCH_SERVICE_SECRET` und `TWITCH_TOKEN_ENCRYPTION_KEY` akzeptieren auch eine
`_FILE`-Variante, die den Wert aus einer Datei liest. Twitch bleibt aus, bis alle drei
ersten Variablen gesetzt sind.

## 3. Der Web-Container {#web}

Das Web-Image leitet `/live/hls/` bereits an den Dienst unter `typetype-live:8080` weiter.
Setze `TYPETYPE_LIVE_HOST` und `TYPETYPE_LIVE_PORT` am Web-Container, wenn deiner einen
anderen Namen oder Port hat. Nur die signierten Videolinks laufen über diese Route; die API
des Dienstes bleibt hinter dem geteilten Geheimnis privat.

## Was deine Nutzer bekommen {#features}

- Einen Twitch-Bereich mit Livestreams, Kategorien und Suche.
- Livestreams, VODs und Clips, abgespielt über die Instanz.
- Den Live-Chat mit Abzeichen und Emotes.
- Das Verknüpfen ihres Twitch-Kontos mit einem Code auf twitch.tv/activate, für gefolgte
  Livestreams, Abonnenten-Inhalte und das Senden von Chatnachrichten.
