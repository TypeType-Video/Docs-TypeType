# Wartung

Der tägliche Betrieb, sobald der Stack läuft.

## Aktualisieren {#updating}

Wenn Sie TypeType mit dem empfohlenen Installer installiert haben, führen Sie ihn
erneut aus. Er aktualisiert die verwalteten Stack-Dateien, behält `.env`,
Compose-Overrides und die Daten-Volumes, lädt die Images der Version, wartet auf die
Dienste, prüft die Versionen der Komponenten und richtet neu hinzugekommene
Garage-Ressourcen ein:

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --yes --dir "$STACK_DIR"
cd "$STACK_DIR"
docker compose ps
```

`$STACK_DIR` ist Ihr Stack-Verzeichnis, `~/typetype-stack`, sofern Sie kein anderes
gewählt haben: siehe [Das Verzeichnis wählen](./quick-start#stack-directory).

Eingestellte Ports bleiben unverändert, wenn der Installer erneut läuft. Konten,
Verlauf, Downloads und die Geheimnisse der Dienste bleiben in `.env` und den benannten
Volumes. Bevor er verwaltete Dateien ändert, legt der Installer unter
`.typetype-backups/` ein Verzeichnis mit Zeitstempel an, das die vorherigen
Stack-Dateien und, wenn die alte Konfiguration gültig ist, ihre aufgelösten und
laufenden Image-Referenzen enthält.

Bei einer Installation ohne Skripte ersetzen Sie zuerst die Compose-Datei und die
Skripte durch die der aktuellen Version und behalten dabei `.env`, ein eventuelles
Override und eigene Konfiguration. Prüfen Sie dann den Stack und erstellen Sie ihn
neu:

```sh
docker compose config -q
docker compose pull
docker compose up -d --force-recreate --wait --wait-timeout 180
docker compose ps
```

### Einen älteren Priveetee-Stack migrieren {#migrate-an-older-priveetee-stack}

Ältere Installationen verwenden möglicherweise noch Compose-Dateien, die auf
`ghcr.io/priveetee/...` verweisen. `docker compose pull` mit diesen Dateien lädt
weiterhin aus dem alten Image-Namensraum; es bringt die Instanz nicht auf eine
aktuelle Version unter `ghcr.io/typetype-video/...`.

Prüfen Sie die aufgelösten Image-Namen in dem Verzeichnis, das die aktive
Compose-Datei enthält:

```sh
docker compose config --images
```

Beginnt ein TypeType-Image mit `ghcr.io/priveetee/`, erneuern Sie die Stack-Dateien
einmal. Sichern Sie zuerst die aktuelle Konfiguration und die Datenbank:

```sh
cd "$STACK_DIR"
migration_backup="../typetype-stack-before-migration-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$migration_backup"
cp -a .env docker-compose.yml "$migration_backup"/
[ ! -f nginx.conf ] || cp -a nginx.conf "$migration_backup"/
[ ! -f garage.toml ] || cp -a garage.toml "$migration_backup"/
docker compose exec -T postgres \
  pg_dump -U typetype typetype > "$migration_backup/typetype.sql"
```

Laden Sie die aktuelle unterstützte Compose-Datei und die Skripte in dasselbe
Verzeichnis. Der Installer behält die vorhandene `.env`, das Compose-Override, nicht
verwaltete Dateien und die benannten Volumes und ergänzt die aktuell erforderlichen
Einträge:

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh \
  | bash -s -- --dir "$PWD" --download-only --yes
```

::: warning Eigene Stack-Dateien werden ersetzt
Der Befehl erneuert `docker-compose.yml`, `.env.example` und die Stack-Skripte.
Vergleichen Sie die Sicherung mit Zeitstempel, bevor Sie eine eigene Änderung
wiederherstellen; kopieren Sie nicht die alte Compose-Datei zurück, denn das würde
auch ihre alten Image-Referenzen wiederherstellen. Halten Sie eigene Änderungen an
Diensten in `docker-compose.override.yml`.
:::

Eine alte `nginx.conf` des Hosts wird gesichert, vom Standard-Stack aber nicht mehr
eingebunden, weil nginx jetzt im Web-Image enthalten ist. Eine alte `garage.toml` wird
für einen einmaligen Import in das Volume `garage_config` bereitgestellt. Die
Initialisierung überschreibt nie eine Konfiguration, die in diesem Volume bereits
vorhanden ist.

Prüfen Sie den erneuerten Stack und sehen Sie sich die Images erneut an:

```sh
docker compose config -q
docker compose config --images
```

Die vier Anwendungs-Images von TypeType müssen jetzt mit `ghcr.io/typetype-video/`
beginnen. Laden Sie sie und erstellen Sie die Dienste neu, ohne Volumes zu löschen:

```sh
docker compose pull
docker compose up -d --force-recreate --wait --wait-timeout 180
docker compose ps
```

Ersetzen Sie zuletzt den folgenden Beispiel-Origin durch die URL der Instanz und
bestätigen Sie die Revisionen der bereitgestellten Komponenten:

```sh
curl -fsS https://watch.example.com/api/version
curl -fsS https://watch.example.com/api/version/web
curl -fsS https://watch.example.com/api/version/server
curl -fsS https://watch.example.com/api/version/token
curl -fsS https://watch.example.com/api/version/downloader
```

Diese einmalige Migrationslücke wurde durch
[filippobaronis Nachfrage in Diskussion #133](https://github.com/TypeType-Video/TypeType/discussions/133#discussioncomment-17779201) deutlich.

Wenn Sie von einer Version aktualisieren, die Garage noch nicht enthielt, durchlaufen
Sie einmal [die manuelle Einrichtung](./docker-compose#manual-setup) einschließlich
Teil 2, bevor Sie Downloads verwenden.

Bewahren Sie vor jeder Aktualisierung die aktuellen Image-Referenzen und eine
Datenbanksicherung auf, damit Sie die Aktualisierung bei Bedarf
[zurücknehmen](./rollback) können.

## Protokolle {#logs}

```sh
docker compose logs -f typetype-server     # einem Dienst folgen
docker compose logs --tail=100 typetype    # die letzten 100 Zeilen der Web-App
docker compose logs                         # alles
```

Die Server-Protokolle sind die Stelle, an der Sie nachsehen, wenn Extraktion, Konten
oder die API sich falsch verhalten.

## Sicherungen {#backups}

Zwei Speicher enthalten alles, was zählt: die Datenbank und der Objektspeicher.

### Datenbank {#database}

```sh
docker compose exec -T postgres \
  pg_dump -U typetype typetype > typetype-$(date +%F).sql
```

Wiederherstellen in einem frischen Stack:

```sh
cat typetype-YYYY-MM-DD.sql | docker compose exec -T postgres psql -U typetype typetype
```

### Objektspeicher (Downloads) {#object-store-downloads}

Die Downloads liegen in den Volumes `garage_data` und `garage_meta`. Sichern Sie die
Volumes selbst (stoppen Sie für eine konsistente Kopie zuerst den Stack):

```sh
docker compose down
docker run --rm -v typetype_garage_data:/data -v "$PWD":/backup busybox \
  tar czf /backup/garage-data-$(date +%F).tar.gz -C /data .
docker compose up -d
```

Passen Sie den Volume-Namen an, wenn das Präfix Ihres Compose-Projekts abweicht (Sie
sehen es mit `docker volume ls`).

::: tip
Downloads sind Artefakte, die sich neu erzeugen lassen; die wichtige Sicherung ist
also die der Datenbank. Auch die Datei `.env` aufzubewahren lohnt sich, weil sie Ihre
Ports und eigenen Werte festhält.
:::

## Stoppen und starten {#stopping-and-starting}

```sh
docker compose stop      # Container stoppen, behalten
docker compose start     # sie wieder starten
docker compose down      # Container entfernen, Volumes behalten (Daten sicher)
```

## Ressourcen {#resources}

Eine kleine Instanz läuft bequem mit etwa 2 GB RAM. Die schwersten Komponenten sind
der API-Server (JVM) und die Datenbank. Der Downloader beansprucht Speicher und
Netzwerk am stärksten, solange Aufträge laufen; sonst ruht er.
