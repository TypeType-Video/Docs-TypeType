# Release-Kandidaten

Ein Release-Kandidat, kurz rc, ist die nächste TypeType-Version vor ihrem
Veröffentlichungstag. Er verwendet die Images, die veröffentlicht werden. So können Sie
eine Version früh ausprobieren und melden, was kaputtgeht, bevor alle aktualisieren.
Die offizielle Instanz läuft ebenfalls mit den Release-Kandidaten.

| Auswahl | Images | Ändert sich | Für |
| --- | --- | --- | --- |
| **Neueste Version** | `:latest`, `:1.16.0` | Nur am Tag einer Version | Den Alltag |
| **Release-Kandidaten** | `:rc`, `:1.16.0-rc.1` | Wenn eine Komponente für die nächste Version bereit ist | Die nächste Version früh testen |
| **Eine Version** | `:1.15.0` | Nie, bis Sie eine andere wählen | Bewusst auf einer Version bleiben |
| **Beta** | `-beta:latest` | Bei jedem Push auf `dev` | Die Entwicklung, kann kaputtgehen |

Ein Release-Kandidat erhält nur, was für die nächste Version bereit ist, und ist daher
stabiler als die Beta. Er kann trotzdem Fehler enthalten: Sichern Sie die Datenbank,
bevor Sie wechseln, siehe [Sicherungen](./maintenance#backups). Wie die Kandidaten
entstehen, beschreibt [Branches und Versionen](/de/project/releases#how-a-release-is-made).

## Ihre Version wählen {#choose-your-version}

Führen Sie das Installationsskript wie gewohnt aus. Es fragt, welche Version Sie
möchten:

```text
[install] Which TypeType version do you want?
[install]   1) The latest release, recommended for everyday use
[install]   2) The release candidates, the next version before its release
[install]   3) One version that never changes until you pick another one
Choose 1, 2 or 3 [1]:
```

Wählen Sie `2` für die Release-Kandidaten. Das Installationsskript schreibt
`TYPETYPE_VERSION=rc` in `.env`, damit die vier TypeType-Images den Tag `:rc`
verwenden, und holt die Stack-Dateien der Release-Kandidaten aus dem Branch `staging`.
Führen Sie es später erneut aus, um zu wechseln: Es schlägt Ihre aktuelle Wahl als
Standard vor. Ihre `.env`, Ports und Datenvolumes bleiben unverändert.

Ein Wert `TYPETYPE_*_IMAGE` in `.env` hat für sein Image weiterhin Vorrang. Entfernen
Sie diese Zeilen oder lassen Sie sie leer, damit alle Images Ihrer Wahl folgen.

## Ohne Fragen {#without-questions}

Für Skripte und automatische Installationen wählen Sie mit einer Option und fügen
`--yes` hinzu:

| Option | Wirkung |
| --- | --- |
| `--rc` | Den Release-Kandidaten folgen |
| `--latest` | Wieder der neuesten Version folgen |
| `--version 1.15.0` | Auf einer Version bleiben |

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --rc --yes --dir "$STACK_DIR"
```

`$STACK_DIR` ist Ihr Stack-Verzeichnis, `~/typetype-stack`, sofern Sie kein anderes
gewählt haben. Diese Optionen lassen sich nicht mit `--beta` kombinieren.

## Aktualisieren {#update}

Führen Sie das Installationsskript erneut aus. Ein Stack auf den Release-Kandidaten
behält die Stack-Dateien von `staging`, auch mit `--yes`. Ohne Installationsskript
laden und erstellen Sie den Stack neu:

```sh
cd "$STACK_DIR"
docker compose pull
docker compose up -d --wait --wait-timeout 180
```

Ein neuer Release-Kandidat ersetzt die `:rc`-Images, jede Aktualisierung bringt also
den neuesten.

## Prüfen, was läuft {#check-what-you-run}

```sh
curl -fsS http://localhost:8082/api/version/server
```

Das Feld `version` zeigt den Release-Kandidaten, zum Beispiel `1.16.0-rc.1`. Denselben
Endpunkt gibt es für `web`, `token` und `downloader`.

## Zur neuesten Version zurückkehren {#go-back-to-the-latest-release}

Führen Sie das Installationsskript aus und wählen Sie `1`, oder übergeben Sie
`--latest`. Ein Release-Kandidat kann die Datenbank ändern. Die Rückkehr zu einer
älteren Version kann daher die Sicherung erfordern, die Sie vor dem Wechsel angelegt
haben, siehe [Eine Aktualisierung zurücknehmen](./rollback).

Nach einer Veröffentlichung enthalten die neueste Version und der letzte
Release-Kandidat denselben Code. Sie können also auf den Release-Kandidaten bleiben, um
die nächste Version weiter zu testen.

## Ein Problem melden {#report-a-problem}

Eröffnen Sie ein [Issue](https://github.com/TypeType-Video/TypeType/issues) mit den
Versionen aus `/api/version` und geben Sie an, dass Sie einen Release-Kandidaten
verwenden. Siehe [Probleme melden](./reporting-issues).
