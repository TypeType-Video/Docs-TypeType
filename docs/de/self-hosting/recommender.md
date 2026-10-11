# Empfehlungsdienst (experimentell)

::: warning Experimentell
Der Empfehlungsdienst hat die Version 0.0.1. Seine Algorithmen, Einstellungen und sein
Ressourcenbedarf können sich zwischen Aktualisierungen noch ändern.
:::

Der Empfehlungsdienst ist optional. Er wird unter dem Namen
[TypeType Signals](https://github.com/TypeType-Video/TypeType-Signals) veröffentlicht.
Mit ihm baut jeder Nutzer seine Startseite mit einem Algorithmus auf, den er auswählt
und einstellt. Was Nutzer bekommen, steht unter
[Den eigenen Algorithmus wählen](/de/guide/algorithm).

Ein Stack ohne ihn verhält sich genau wie zuvor und zeigt nirgends eine Option. Mit
ihm bleiben drei Schalter in drei verschiedenen Händen:

1. Sie installieren den Dienst;
2. der Administrator schaltet ihn für die Instanz ein;
3. jeder Nutzer schaltet ihn für sich selbst ein.

## Bevor Sie beginnen {#requirements}

| Ressource | Menge | So prüfen Sie es |
| --- | --- | --- |
| Arbeitsspeicher | Etwa 1 GB im Leerlauf, standardmäßig auf 2 GB begrenzt (`RECOMMENDER_MEMORY_LIMIT`) | `free -h`, Spalte `available` |
| Speicherplatz | Etwa 550 MB für das Sprachmodell und etwa 330 MB für das Image | `df -h /var/lib/docker` |
| Netzwerk | Internetzugang beim ersten Start, um das Modell von Hugging Face herunterzuladen. Der Dienst spricht nie mit YouTube. | |
| TypeType | Ein Stack, der mit dem Installer oder der unterstützten Compose-Datei installiert wurde | `docker compose ps` im Stack-Verzeichnis |

Was sich an Ihrem Stack ändert, wenn Sie ihn hinzufügen:

- ein neuer Container, `typetype-recommender`;
- ein neues Volume, `recommender_models`, für das Modell;
- eine neue Datenbank, `typetype_recommender`, in Ihrem vorhandenen PostgreSQL;
- der Dienst `postgres` wechselt von `postgres:17` zu `pgvector/pgvector:pg17`,
  demselben PostgreSQL 17 mit der Erweiterung `pgvector`, auf demselben Daten-Volume.
  PostgreSQL startet einmal neu: Die Instanz ist einige Sekunden nicht erreichbar;
- Server wird mit der Adresse des Dienstes neu erstellt.

Ihre vorhandenen Daten werden weder migriert noch umgeschrieben. Sichern Sie die
Datenbank trotzdem vorher, wie vor jeder Änderung am Stack: siehe
[Maintenance](/self-hosting/maintenance#backups).

Die Befehle dieser Seite verwenden `$STACK_DIR` für das Verzeichnis, in dem Ihr Stack
liegt. Setzen Sie die Variable einmal in Ihrem Terminal. `~/typetype-stack` ist nur
der Standardwert des Installers: Tragen Sie das Verzeichnis ein, das Sie gewählt
haben, welches auch immer. Siehe
[Choose the directory](/self-hosting/quick-start#stack-directory).

```sh
STACK_DIR=~/typetype-stack
```

Wählen Sie einen der drei folgenden Wege.

## A. Neue Instanz, mit dem Installer {#install-new}

1. Starten Sie den Installer mit dem Empfehlungsdienst:

   ```sh
   curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --recommender
   ```

   Ohne `--recommender` fragt der Installer nach und antwortet mit Nein, wenn Sie nur
   die Eingabetaste drücken:

   ```text
   [install] Optional: the recommender (experimental) lets each user pick the algorithm of their home page.
   [install] It needs about 2 GB of memory and 1 GB of disk, and downloads a language model on first start.
   Add the experimental recommender? [y/N]:
   ```

2. Der Installer bestätigt die Wahl und fragt, bevor er etwas startet:

   ```text
   [install] Recommender (experimental) added to the stack.
   [install] Validating the resolved Compose stack...
   Proceed with Docker pull + startup in <Ihr Stack-Verzeichnis>? [y/N]:
   ```

   Antworten Sie mit `y`.

3. Warten Sie. Der erste Start lädt das Image und danach das Modell herunter. Der
   Installer wartet bis zu 15 Minuten, bis alle Dienste gesund sind, statt der
   üblichen 3. Er endet mit:

   ```text
   Done. Open http://localhost:8082
   ```

4. Weiter mit [Prüfen, ob er läuft](#verify).

Der Installer hat `RECOMMENDER_ENABLED=true` in `.env` gesetzt, die Option wird auf
der Instanz also bereits angeboten.

## B. Bestehende Instanz, mit dem Installer {#install-existing}

Starten Sie den Installer erneut mit dem Verzeichnis Ihres Stacks. Er sichert die von
ihm verwalteten Dateien, behält Ihre `.env` und Ihre `docker-compose.override.yml`
und fügt den Empfehlungsdienst hinzu.

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --recommender --dir "$STACK_DIR"
```

Rechnen Sie mit einigen Sekunden Ausfall, während PostgreSQL und Server neu starten,
und gehen Sie dann zu [Prüfen, ob er läuft](#verify).

## C. Bestehende Instanz, von Hand {#manual}

Für alle, die den Stack selbst verwalten, zum Beispiel mit Dockge.

1. Wechseln Sie ins Stack-Verzeichnis und prüfen Sie, ob die Datei des Dienstes da
   ist:

   ```sh
   cd "$STACK_DIR"
   ls docker-compose.recommender.yml
   ```

   Fehlt sie, sind Ihre Stack-Dateien älter als der Dienst. Laden Sie sie herunter:

   ```sh
   curl -fsSLO https://raw.githubusercontent.com/TypeType-Video/TypeType/main/docker-compose.recommender.yml
   ```

2. Weisen Sie den Stack an, ihn anzubieten. Setzen Sie in `.env`:

   ```dotenv
   RECOMMENDER_ENABLED=true
   ```

   Diese Zeile sorgt auch dafür, dass der Installer den Dienst bei einer späteren
   Aktualisierung behält.

3. Legen Sie die Datenbank und das gemeinsame Geheimnis an:

   ```sh
   COMPOSE_RECOMMENDER_FILE=docker-compose.recommender.yml ./scripts/run-stack-init.sh
   ```

   Die Ausgabe endet mit:

   ```text
   CREATE DATABASE
   CREATE EXTENSION
   ```

   Beim zweiten Durchlauf fehlt `CREATE DATABASE`, und die Zeile zur Erweiterung
   meldet, dass sie bereits existiert. Beides ist in Ordnung.

4. Starten Sie den Dienst und erstellen Sie Server neu:

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml up -d --wait --wait-timeout 900
   ```

   Auf einem ARM64-Host nennen Sie auch die ARM64-Datei, wie Sie es bereits tun:
   `-f docker-compose.yml -f docker-compose.arm64.yml -f docker-compose.recommender.yml`.

5. Weiter mit [Prüfen, ob er läuft](#verify).

::: warning Nennen Sie ab jetzt beide Dateien
Jeder `docker compose`-Befehl für diesen Stack muss nun auch
`docker-compose.recommender.yml` nennen. Ein Befehl, der nur `docker-compose.yml`
zusammen mit `--remove-orphans` nennt, entfernt den Empfehlungsdienst.
:::

## Prüfen, ob er läuft {#verify}

Führen Sie diese Befehle im Stack-Verzeichnis aus. Jeder nennt beide Compose-Dateien,
egal wie Sie installiert haben: `docker compose` allein kennt nur die Dienste aus
`docker-compose.yml`. Auf einem ARM64-Host fügen Sie `-f docker-compose.arm64.yml`
zwischen den beiden ein.

```sh
cd "$STACK_DIR"
```

1. Der Container ist gesund:

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml ps typetype-recommender
   ```

   In der Spalte `STATUS` muss `Up ... (healthy)` stehen. `(health: starting)`
   bedeutet, dass das Modell noch heruntergeladen oder geladen wird.

2. Sein Protokoll zeigt einen vollständigen Start:

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml logs typetype-recommender
   ```

   ```text
   INFO:     Started server process [1]
   INFO:     Waiting for application startup.
   Warning: You are sending unauthenticated requests to the HF Hub. Please set a HF_TOKEN to enable higher rate limits and faster downloads.
   INFO:     Application startup complete.
   INFO:     Uvicorn running on http://0.0.0.0:8190 (Press CTRL+C to quit)
   ```

   Die Warnung zum HF Hub ist zu erwarten: Das Modell ist öffentlich und braucht kein
   Token. Die Pause vor `Application startup complete` ist der Download.

3. Server erreicht ihn:

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml exec -T typetype-server wget -qO- http://127.0.0.1:8080/version/recommender
   ```

   ```json
   {"service":"recommender","version":"0.0.1","revision":"...","shortRevision":"...","buildTime":"..."}
   ```

   Eine leere Antwort oder ein Fehler bedeutet, dass Server den Dienst nicht sieht:
   siehe [Fehlerbehebung](#troubleshooting).

4. Die Instanz meldet ihn:

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml exec -T typetype-server wget -qO- http://127.0.0.1:8080/instance
   ```

   Die Antwort enthält:

   ```json
   "recommender":{"installed":true,"enabled":true,"experimental":true}
   ```

   `installed` ist wahr, sobald Server den Dienst kennt. `enabled` ist der Schalter
   der Instanz, der gleich beschrieben wird.

5. In der Web-App zeigt **Einstellungen**, dann **Über**, eine Zeile **Algorithmus**
   mit der Version `0.0.1`.

## Einschalten {#enable}

Die Installation des Dienstes zeigt Nutzern nichts, solange die Instanz ihn nicht
anbietet.

1. Melden Sie sich als Administrator an und öffnen Sie die Admin-Konsole.
2. Öffnen Sie den Abschnitt **Empfehlungen**.
3. Schalten Sie **Experimentelle Startseite anbieten** ein. Das ist bereits der Fall,
   wenn `.env` `RECOMMENDER_ENABLED=true` enthält.
4. Laden Sie die Web-App neu: **Algorithmus** erscheint im Menü.

Probieren Sie es dann mit Ihrem eigenen Konto aus:

1. Öffnen Sie **Algorithmus**.
2. Schalten Sie **Meine Startseite mit einem Algorithmus meiner Wahl aufbauen** ein.
3. Gehen Sie zurück zur Startseite. Bei einem leeren Konto erscheint eine
   Begrüßungskarte; importieren Sie zuerst Daten oder sehen Sie einige Videos an.
4. Öffnen Sie **Algorithmus** erneut, dann **Aufbau der letzten Startseite**: Dort
   müssen die abgefragten Quellen und die gefundenen Videos stehen.

Jeder Nutzer muss dasselbe für sich tun, es sei denn, Sie schalten **Standardmäßig
für alle aktiviert** ein.

Der Abschnitt **Empfehlungen** der Admin-Konsole enthält alles, was ein Administrator
entscheidet:

| Bedienelement | Wirkung |
| --- | --- |
| **Experimentelle Startseite anbieten** | Aus: Alle behalten die gewohnte Startseite, und die Seite Algorithmus verschwindet. Ein: Jeder Nutzer entscheidet, ob er sie einschaltet. |
| **Standardmäßig für alle aktiviert** | Standardmäßig aus. Ein: Jeder Nutzer bekommt sofort die Startseite per Algorithmus und kann sie ausschalten. |
| **Angebotene Algorithmen** | Welche Algorithmen Nutzer wählen dürfen. Nichts ausgewählt bedeutet alle. |
| **Vorausgewählter Algorithmus** | Der, den ein Nutzer hat, bevor er wählt. **Die Wahl des Dienstes** folgt `RECOMMENDER_DEFAULT_ALGORITHM`. |
| **Erlaubte Antwortzeit (ms)** | Wie lange ein Aufruf des Dienstes dauern darf. `0` behält den bei der Installation gesetzten Wert. |
| **Videoanfragen an YouTube pro Minute** | Siehe [Was er von YouTube verlangt](#provider-requests). `0` behält den bei der Installation gesetzten Wert. |

Darunter zeigt **Zustand des Dienstes**, ob er antwortet und in wie vielen
Millisekunden, die durchschnittliche Zeit für den Aufbau einer Seite (aufgeteilt in
Algorithmus und YouTube-Quellen), die ausgelieferten Seiten und wie viele aus dem
Cache kamen, wie oft ein Besucher stattdessen die gewohnte Startseite bekam, und die
in dieser Minute gesendeten und zurückgehaltenen Videoanfragen. Dort steht auch, wie
viele Nutzer die Option eingeschaltet haben, je Algorithmus, und welche Rückmeldungen
sie senden wollten. Keine Rückmeldung nennt ihren Verfasser. Die Zähler beginnen neu,
wenn Server neu startet.

## Was er speichert {#storage}

Die Daten Ihrer Nutzer bleiben in der Datenbank von Server. Der Empfehlungsdienst hat
keine Konten und weiß nicht, wer ein Nutzer ist.

| Was | Wo | Wie lange |
| --- | --- | --- |
| Vektoren öffentlicher Videotitel | Eigene PostgreSQL-Datenbank, Tabelle `title_vectors` | Bis zur Löschung. Kein Nutzer wird genannt. |
| Der Verlauf eines Nutzers, von Server unter einem Schlüssel gesendet | Arbeitsspeicher und gemeinsamer Cache | 30 Minuten nach der letzten Nutzung |
| Der Plan einer Seite im Aufbau | Arbeitsspeicher und gemeinsamer Cache | 2 Minuten |
| Was aus einem Verlauf abgeleitet wurde | Nur Arbeitsspeicher | 10 Minuten, solange der Verlauf unverändert ist |

Server behält außerdem jede aufgebaute Startseite 30 Minuten in Dragonfly und die
Wahl des Algorithmus, die Korrekturen und die Rückmeldungen jedes Nutzers in seiner
eigenen Datenbank. Der Export eines Nutzers enthält seine Auswahl und seine
Rückmeldungen.

Der Dienst kann jederzeit neu gestartet werden. Server sendet den Verlauf dann erneut,
und die nächste Seite wird normal aufgebaut.

## Was er von YouTube verlangt {#provider-requests}

Der Empfehlungsdienst selbst sendet nichts an YouTube. Er teilt Server mit, welche
Quellen eine Seite braucht (die Videos eines Kanals, eine Suche, die Videos neben
einem Video), und Server holt sie über seine übliche Extraktion, hinter seinem
gemeinsamen Cache.

Server begrenzt, was der Dienst ihn öffnen lassen darf:

| Variable | Standard | Zweck |
| --- | --- | --- |
| `RECOMMENDER_STREAM_REQUESTS_PER_MINUTE` | `15` | Videos, die der Dienst Server pro Minute beim Anbieter öffnen lassen darf, für die ganze Instanz. Wer auf Wiedergabe drückt, wird davon nie begrenzt. |

Lehnt der Anbieter eine Anfrage ab, verlangt der Dienst eine Weile gar kein Video
mehr, damit eine Ablehnung für die Zuschauenden nie länger dauert. Eine in dieser Zeit
aufgebaute Seite hat einfach weniger Quellen.

## Einstellungen {#settings}

Diese Werte des Stacks werden aus `.env` gelesen:

| Variable | Standard | Zweck |
| --- | --- | --- |
| `RECOMMENDER_ENABLED` | `false` | Bietet den Dienst auf der Instanz an. Die Admin-Konsole kann das danach ändern. |
| `RECOMMENDER_MEMORY_LIMIT` | `2g` | Speichergrenze des Containers |
| `RECOMMENDER_DEFAULT_ALGORITHM` | `signals` | Der vorausgewählte Algorithmus für alle, die nicht gewählt haben |
| `RECOMMENDER_DATABASE` | `typetype_recommender` | Name der eigenen Datenbank des Dienstes |
| `RECOMMENDER_CACHE_URL` | `redis://dragonfly:6379` | Gemeinsamer Cache des Dienstes |
| `RECOMMENDER_THREADS` | bis zu 8 | CPU-Threads des Sprachmodells |
| `TYPETYPE_RECOMMENDER_IMAGE` | stabiles Image | Abweichendes Image, für eine festgelegte Version oder ein Rollback |
| `TYPETYPE_POSTGRES_VECTOR_IMAGE` | `pgvector/pgvector:pg17` | PostgreSQL-Image, das `pgvector` mitbringt |
| `TYPETYPE_RECOMMENDER_PORT` | `8190` | Port, auf dem der Dienst im Compose-Netzwerk lauscht |

Auch die Server-Seite der Integration lässt sich einstellen:

| Variable | Standard | Zweck |
| --- | --- | --- |
| `RECOMMENDER_REQUEST_TIMEOUT_MS` | `2500` | Wie lange ein Aufruf des Dienstes dauern darf |
| `RECOMMENDER_PAGE_DEADLINE_MS` | `4000` | Wie lange ein Besucher auf eine Seite wartet, bevor die gewohnte Startseite gezeigt wird; die Seite wird für den nächsten Besuch weiter aufgebaut |
| `RECOMMENDER_PAGE_TTL_SECONDS` | `1800` | Wie lange eine aufgebaute Seite behalten wird |
| `RECOMMENDER_PAGE_VARIANTS` | `3` | Seiten je Nutzer, damit eine Aktualisierung sofort eine andere zeigt |
| `RECOMMENDER_RELATED_TTL_SECONDS` | `86400` | Wie lange die Videos neben einem Video behalten werden |
| `RECOMMENDER_SEARCH_TTL_SECONDS` | `21600` | Wie lange ein Suchergebnis behalten wird |
| `RECOMMENDER_CHANNEL_TTL_SECONDS` | `1800` | Wie lange die Videos eines Kanals behalten werden |
| `RECOMMENDER_SOURCE_PARALLELISM` | `6` | Quellen einer Seite, die gleichzeitig geholt werden |

Die Datei des Dienstes reicht nur die obigen Werte weiter. Der Dienst liest weitere
eigene Werte, die Sie mit einer Compose-Override-Datei für `typetype-recommender`
setzen:

| Variable | Standard | Zweck |
| --- | --- | --- |
| `RECOMMENDER_HISTORY_TTL_SECONDS` | `1800` | Wie lange ein von Server gesendeter Verlauf nach der letzten Nutzung behalten wird |
| `RECOMMENDER_HISTORY_ITEMS_KEPT` | `400000` | Wiedergaben und Likes aller Verläufe, die gleichzeitig im Arbeitsspeicher gehalten werden, etwa 0,5 MB je 1.000 |
| `RECOMMENDER_PLAN_TTL_SECONDS` | `120` | Wie lange der Plan einer Seite behalten wird |
| `RECOMMENDER_PROFILE_TTL_SECONDS` | `600` | Wie lange das aus einem unveränderten Verlauf Abgeleitete behalten wird; `0` schaltet es ab |
| `RECOMMENDER_EMBED_BUDGET` | `100` | Neue Titel, die das Modell höchstens innerhalb einer Anfrage liest |
| `RECOMMENDER_MAX_TITLES` | `2000` | Titel, die ein Profil höchstens liest |
| `RECOMMENDER_EMBEDDING_MODEL`, `RECOMMENDER_EMBEDDING_FILE` | mehrsprachiges mpnet, fp16 | Das Sprachmodell und seine Variante |
| `RECOMMENDER_DATABASE_POOL` | `4` | Offen gehaltene Verbindungen zur Datenbank |
| `RECOMMENDER_CACHE_TIMEOUT_MS` | `2000` | Wie lange ein Cache-Aufruf dauern darf |

Eine leer gelassene Variable gilt als nicht gesetzt.

```yaml
services:
  typetype-recommender:
    environment:
      RECOMMENDER_PARALLEL_BATCHES: "3"
```

Speichern Sie das als `docker-compose.override.yml` im Stack-Verzeichnis; der
Installer behält diese Datei und wendet sie zuletzt an.

### Arbeitsspeicher gegen Geschwindigkeit {#memory}

Mit den Standardwerten bleibt der Dienst unter 2 GB. Auf einem Host, der ihm 4 GB
geben kann, machen zwei Einstellungen des Dienstes ihn schneller, wenn viele neue
Personen gleichzeitig kommen, auf Kosten des Arbeitsspeichers:

| Variable | Standard | Wirkung |
| --- | --- | --- |
| `RECOMMENDER_PARALLEL_BATCHES` | `1` | Stapel von Titeln, die gleichzeitig durch das Modell laufen. `3` bedient einen Ansturm neuer Personen etwa ein Drittel schneller, bei etwa 0,8 GB mehr in der Spitze. |
| `RECOMMENDER_ONNX_ARENA` | `0` | `1` lässt das Modell den Speicher seiner größten Stapel behalten: etwa 10 % schneller unter Ansturm, etwa 1,3 GB mehr. |

Erhöhen Sie `RECOMMENDER_MEMORY_LIMIT` zugleich.

## Aktualisieren {#update}

Mit dem Installer aktualisieren Sie wie gewohnt. Er behält den Dienst, weil `.env`
`RECOMMENDER_ENABLED=true` enthält:

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --yes --dir "$STACK_DIR"
```

Von Hand laden Sie die Images und erstellen mit beiden Dateien neu:

```sh
cd "$STACK_DIR"
docker compose -f docker-compose.yml -f docker-compose.recommender.yml pull
docker compose -f docker-compose.yml -f docker-compose.recommender.yml up -d --wait --wait-timeout 900
```

Das Modell bleibt in seinem Volume: Eine Aktualisierung lädt es nicht erneut herunter.
Führen Sie danach die Prüfungen aus [Prüfen, ob er läuft](#verify) aus: Die
Versionszeile sagt Ihnen, welche Version antwortet.

## Entfernen {#remove}

1. Setzen Sie in `.env` `RECOMMENDER_ENABLED=false`, damit der Installer ihn bei der
   nächsten Aktualisierung nicht wieder hinzufügt.

2. Erstellen Sie den Stack ohne die Datei des Dienstes neu:

   ```sh
   cd "$STACK_DIR"
   docker compose -f docker-compose.yml up -d --remove-orphans --wait
   ```

   Der Container des Dienstes wird entfernt, PostgreSQL kehrt zu `postgres:17`
   zurück, und Server wird ohne die Adresse des Dienstes neu erstellt. Die Startseite
   ist für alle wieder die gewohnte, und die Seite Algorithmus verschwindet.

3. Prüfen Sie:

   ```sh
   docker compose exec -T typetype-server wget -qO- http://127.0.0.1:8080/instance
   ```

   Die Antwort enthält jetzt `"recommender":{"installed":false,`.

Auswahl, Korrekturen und Rückmeldungen der Nutzer bleiben in der Datenbank von Server,
falls Sie den Dienst wieder hinzufügen. Sonst hat der Dienst nie etwas von ihnen
gespeichert.

Um den Speicherplatz zurückzugewinnen, wenn Sie möchten:

```sh
docker volume ls | grep recommender_models
docker volume rm <oben angezeigter Name>
docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DROP DATABASE typetype_recommender"'
```

## Fehlerbehebung {#troubleshooting}

Lesen Sie zuerst das Protokoll des Dienstes:

```sh
cd "$STACK_DIR"
docker compose -f docker-compose.yml -f docker-compose.recommender.yml logs --tail 100 typetype-recommender
```

| Was Sie sehen | Ursache | Was zu tun ist |
| --- | --- | --- |
| `STATUS` bleibt beim ersten Start minutenlang auf `(health: starting)` | Das Modell, etwa 550 MB, wird heruntergeladen | Warten Sie. Das Protokoll zeigt `Application startup complete`, wenn es fertig ist. |
| Das Protokoll zeigt einen Netzwerkfehler vor `Application startup complete` | Das Modell konnte nicht von Hugging Face heruntergeladen werden | Geben Sie dem Container für den ersten Start Internetzugang. Danach wird das Modell aus dem Volume gelesen. |
| `no such service: typetype-recommender` | Der Befehl nennt nur `docker-compose.yml` | Fügen Sie `-f docker-compose.recommender.yml` hinzu. |
| Der Container wird beendet und startet neu, `OOMKilled` in `docker inspect` | Er hat `RECOMMENDER_MEMORY_LIMIT` erreicht | Erhöhen Sie die Grenze oder behalten Sie die Standardwerte aus [Arbeitsspeicher gegen Geschwindigkeit](#memory). |
| `/version/recommender` antwortet nicht | Server wurde nicht mit der Datei des Dienstes neu erstellt, oder das gemeinsame Geheimnis fehlt | Führen Sie die beiden Befehle aus [C. Von Hand](#manual), Schritte 3 und 4, erneut aus. |
| **Algorithmus** steht nicht im Menü | Die Instanz bietet ihn nicht an | Admin-Konsole, **Empfehlungen**, **Experimentelle Startseite anbieten**; danach die Seite neu laden. |
| Die Startseite bleibt die gewohnte | Die Seite war nicht rechtzeitig fertig, oder das Konto hat keine Daten | Laden Sie nach einigen Sekunden neu. In der Admin-Konsole zählt **Rückfälle auf die gewohnte Startseite**, wie oft das vorkommt. |
| **Zustand des Dienstes** zeigt **Antwortet nicht** | Der Dienst ist gestoppt oder startet noch | Prüfen Sie Status und Protokoll wie oben. Bis dahin sind die Startseiten die gewohnten. |

## Quellen {#source-references}

- [Signals-Repository](https://github.com/TypeType-Video/TypeType-Signals)
- [Compose-Datei des Dienstes](https://github.com/TypeType-Video/TypeType/blob/main/docker-compose.recommender.yml)
- [Installer](https://github.com/TypeType-Video/TypeType/blob/main/scripts/install-stack.sh)
- [Konfiguration des Dienstes in Server](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-services/src/main/kotlin/dev/typetype/server/services/RecommenderConfig.kt)
