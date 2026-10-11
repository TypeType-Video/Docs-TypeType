# Eine Aktualisierung zurücknehmen

TypeType kann zu den zuvor laufenden Anwendungs-Images zurückkehren, ohne seine
Daten-Volumes zu löschen. Bereiten Sie die Angaben für das Rollback **vor** jeder
Aktualisierung vor; der Tag `latest` wandert weiter und taugt nicht als Referenz für
ein Rollback.

::: danger Löschen Sie nie die Volumes
Führen Sie nicht `docker compose down -v` aus und entfernen Sie nicht die Volumes von
PostgreSQL, Garage oder den Geheimnissen. Ein normales `docker compose down` behält
sie.
:::

## Vor der Aktualisierung {#before-updating}

Öffnen Sie das Stack-Verzeichnis: `~/typetype-stack`, sofern Sie kein anderes gewählt
haben, oder bei einer manuellen Installation das Verzeichnis mit
`docker-compose.yml`. Siehe [Das Verzeichnis wählen](./quick-start#stack-directory).

```sh
cd "$STACK_DIR"
mkdir rollback-before-update
cp .env docker-compose.yml rollback-before-update/
for file in docker-compose.arm64.yml docker-compose.override.yml nginx.conf garage.toml; do
  [ ! -f "$file" ] || cp -a "$file" rollback-before-update/
done
docker compose exec -T postgres pg_dump -U typetype typetype > rollback-before-update/typetype.sql
```

Der unterstützte Installer erledigt den Teil mit den Stack-Dateien und den
Image-Referenzen vor einer Aktualisierung automatisch. Seine Sicherungen mit
Zeitstempel liegen unter `.typetype-backups/`. Ein Datenbank-Dump bleibt eine eigene
Sicherung des Betreibers.

Halten Sie die vier Image-Referenzen fest, die derzeit laufen:

```sh
docker image inspect "$(docker compose images -q typetype)" --format '{{index .RepoDigests 0}}'
docker image inspect "$(docker compose images -q typetype-server)" --format '{{index .RepoDigests 0}}'
docker image inspect "$(docker compose images -q typetype-downloader)" --format '{{index .RepoDigests 0}}'
docker image inspect "$(docker compose images -q typetype-token)" --format '{{index .RepoDigests 0}}'
```

Jeder Befehl gibt eine unveränderliche Referenz aus, die auf `@sha256:...` endet.
Bewahren Sie die vier Ausgaben bei der Sicherung auf und beschriften Sie sie mit web,
server, downloader und token.

## Die vorherige Version der Anwendung wiederherstellen {#restore-the-previous-application-version}

Stoppen Sie den aktuellen Stack, ohne seine Volumes zu entfernen:

```sh
docker compose down
```

Stellen Sie die vorherigen Stack-Dateien und die Konfiguration wieder her:

```sh
cp rollback-before-update/.env .env
cp rollback-before-update/docker-compose.yml docker-compose.yml
for file in docker-compose.arm64.yml docker-compose.override.yml nginx.conf garage.toml; do
  [ ! -f "rollback-before-update/$file" ] || cp -a "rollback-before-update/$file" "$file"
done
```

Öffnen Sie `.env` und setzen Sie diese Werte auf die vier Referenzen, die Sie vor der
Aktualisierung festgehalten haben:

```dotenv
TYPETYPE_WEB_IMAGE=ghcr.io/typetype-video/typetype@sha256:WEB_DIGEST
TYPETYPE_SERVER_IMAGE=ghcr.io/typetype-video/typetype-server@sha256:SERVER_DIGEST
TYPETYPE_DOWNLOADER_IMAGE=ghcr.io/typetype-video/typetype-downloader@sha256:DOWNLOADER_DIGEST
TYPETYPE_TOKEN_IMAGE=ghcr.io/typetype-video/typetype-token@sha256:TOKEN_DIGEST
```

Verwenden Sie die vollständigen Werte, die Docker ausgegeben hat, nicht die
Beispielplatzhalter. Prüfen Sie dann die wiederhergestellte Konfiguration und
erstellen Sie den Stack neu:

```sh
docker compose config -q
docker compose pull
docker compose up -d --force-recreate --wait --wait-timeout 180
docker compose ps
curl -fsS http://localhost:8080/health
curl -fsS http://localhost:8081/health
curl -fsS http://localhost:8082/api/downloader/health/deep
```

Das ändert nur die Version der Anwendung. Konten, Verlauf, Einstellungen, Downloads,
die Garage-Konfiguration und die Geheimnisse bleiben in den vorhandenen Volumes.

## Die Datenbank nur wiederherstellen, wenn es nötig ist {#restore-the-database-only-when-required}

Stellen Sie die Datenbank nicht allein deshalb wieder her, weil die Anwendung
zurückgenommen wurde. Die meisten Rollbacks der Anwendung funktionieren mit den
vorhandenen Daten. Stellen Sie die Sicherung nur wieder her, wenn die
Versionshinweise es verlangen oder der vorherige Server mit dem aktuellen Schema nicht
starten kann.

Stoppen Sie zuerst die Dienste, die sich mit PostgreSQL verbinden:

```sh
docker compose stop typetype typetype-server typetype-downloader postgres-init
docker compose exec -T postgres dropdb -U typetype --if-exists typetype
docker compose exec -T postgres createdb -U typetype typetype
docker compose exec -T postgres psql -U typetype typetype < rollback-before-update/typetype.sql
docker compose up -d --wait --wait-timeout 180
```

Das setzt die Datenbank auf ihren Zustand vor der Aktualisierung zurück; Änderungen
nach der Sicherung gehen also verloren.

## Zu normalen Aktualisierungen zurückkehren {#return-to-normal-updates}

Nachdem die fehlerhafte Version ersetzt wurde, entfernen Sie die vier Werte
`TYPETYPE_*_IMAGE` aus `.env` oder lassen Sie sie leer. Die nächste normale
Aktualisierung folgt dann wieder den stabilen `latest`-Images. Siehe
[Wartung](./maintenance#updating).
