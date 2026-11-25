# Go-Server (experimentell)

TypeType Server gibt es auch in Go: [TypeType-Server-Go](https://github.com/TypeType-Video/TypeType-Server-Go).
Er beantwortet dieselbe API mit derselben Datenbank, denselben Einstellungen und denselben Secrets,
daher funktionieren die Web-App sowie die Android- und TV-Apps ohne Änderung mit ihm. Er ist
experimentell: Der Kotlin-Server bleibt der Standard, und Sie können jederzeit zurückwechseln.

## Bevor Sie beginnen {#requirements}

| Ressource | Menge |
| --- | --- |
| Arbeitsspeicher | Etwa 200 MB |
| Speicherplatz | Etwa 30 MB für das Image |

Was sich an Ihrem Stack ändert: Der Container `typetype-server` verwendet das Go-Image. Beim ersten
Start fügt er der Datenbank eine Tabelle hinzu, `go_schema_state`, und lässt alles andere unverändert.

Sichern Sie zuerst die Datenbank ([Backups](./maintenance#database)), wenn die Instanz in Gebrauch ist.

## Zum Go-Server wechseln {#install}

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --server go
```

Der Installer behält diese Wahl bei späteren Updates. Der Go-Server hat eigene Versionen: Er folgt
seiner neuesten Veröffentlichung und ignoriert `--version` und `--rc`. Mit `--beta` folgt er seinen
Beta-Images.

## Zurückwechseln {#switch-back}

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --server kotlin
```

Was der Go-Server geschrieben hat, bleibt für den Kotlin-Server lesbar.

## Von Hand {#install-by-hand}

Fügen Sie `docker-compose.go.yml` zu den Compose-Dateien hinzu, die Sie bereits verwenden:

```sh
docker compose -f docker-compose.yml -f docker-compose.go.yml --env-file .env up -d typetype-server
```

## Gut zu wissen {#differences}

- Die Server-Logs gehen in die Ausgabe des Containers (`docker compose logs typetype-server`), nicht in Dateien.
