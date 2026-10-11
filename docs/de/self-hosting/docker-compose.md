# Manuelle Einrichtung

Diese Seite bringt TypeType auf Ihrem eigenen Rechner **von Hand** zum Laufen, mit
Docker Compose. Die Grundeinrichtung ist eine kurze Folge von Befehlen. Alles, was die
Hilfsskripte im Repository tun, wird hier erklärt, sodass Sie nie ein Skript ausführen
müssen, das Sie nicht verstehen.

Der Stack erzeugt die sensiblen YouTube-Schlüssel bei seiner einmaligen
Initialisierung. Eine Installation ohne Skripte muss das Garage-RPC-Geheimnis selbst
erzeugen, wie unten gezeigt.

::: tip Empfohlen: das Installationsskript
Für die meisten ist das Skript aus dem [Schnellstart](./quick-start) der einfachste
Weg: Es erledigt alles auf dieser Seite für Sie, einschließlich des Objektspeichers
für Downloads. Nutzen Sie diese manuelle Anleitung, wenn Sie die volle Kontrolle
möchten oder jeden Schritt verstehen wollen.
:::

## Teil 1 - Zum Laufen bringen {#part-1---get-it-running}

### 1. Die Dateien herunterladen {#1-download-the-files}

Die Compose-Datei, `.env.example` und die Stack-Skripte liegen im TypeType-Repository.
Das Web-Image enthält bereits die unterstützte nginx-Konfiguration, und Compose legt
die Standardkonfiguration von Garage in einem benannten Volume an. Der Stack lädt
fertig gebaute Images, es gibt also nichts zu kompilieren.

```sh
git clone https://github.com/TypeType-Video/TypeType.git
cd TypeType
```

### 2. Ihre Konfiguration anlegen {#2-create-your-configuration}

Kopieren Sie die Beispieldatei. Die meisten Standardwerte funktionieren für eine
lokale Installation bereits; ersetzen Sie mit dem nächsten Befehl den
Garage-Platzhalter, bevor Sie die Dienste starten.

```sh
cp .env.example .env
```

Erzeugen Sie ein eindeutiges hexadezimales Garage-RPC-Geheimnis mit 32 Byte und
ersetzen Sie seinen Platzhalter:

```sh
GARAGE_RPC_SECRET=$(openssl rand -hex 32)
sed -i "s/^GARAGE_RPC_SECRET=.*/GARAGE_RPC_SECRET=$GARAGE_RPC_SECRET/" .env
```

Dieser Wert authentifiziert das interne Cluster-Protokoll von Garage. Der unterstützte
Installer erzeugt ihn automatisch; die Anforderung wurde durch
[arcoasts Untersuchung zu Garage](https://github.com/TypeType-Video/TypeType/discussions/130)
erkannt.

::: tip Die beiden YouTube-Platzhalter werden automatisch gefüllt
`YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN` und `YOUTUBE_SESSION_ENCRYPTION_KEY` werden beim
ersten Start **für Sie** ausgefüllt. Ein Init-Container erzeugt sie, und Server liest
sie aus einem privaten Volume. Lassen Sie diese beiden `SET_ME_...`-Werte unverändert,
es sei denn, Sie verwalten die Geheimnisse selbst.
:::

### 3. Initialisieren und alles starten {#3-bootstrap-and-start-everything}

```sh
./scripts/run-stack-init.sh
docker compose up -d --remove-orphans --wait --wait-timeout 180
```

Die Initialisierung führt eine kurzlebige Aufgabe `typetype-init` aus und entfernt sie
nach einem erfolgreichen Lauf. Sie bereitet das private Geheimnis-Volume, die
Garage-Konfiguration und die Downloader-Datenbank vor, bevor die dauerhaft laufenden
Dienste starten.

Prüfen Sie, ob die dauerhaft laufenden Dienste aktiv sind:

```sh
docker compose ps -a
```

Sie sollten `typetype`, `typetype-server`, `typetype-token`, `typetype-downloader`,
`postgres`, `dragonfly` und `garage` sehen, alle `running` oder `healthy`. Die
Initialisierung lief mit `--rm`, es ist also zu erwarten, dass sie nach einem
erfolgreichen Lauf nicht in der Liste erscheint.

### 4. Öffnen und das Administratorkonto anlegen {#4-open-it-and-create-the-admin-account}

Rufen Sie **`http://localhost:8082`** auf. Bei einer frischen Installation erkennt die
App, dass noch kein Konto existiert, und fordert Sie auf, eines anzulegen. Das **erste
Konto wird automatisch zum Administrator**, ohne weiteren Schritt.

![Der Registrierungsbildschirm einer frischen Installation](/screenshot-register.png)

Geben Sie Name, E-Mail-Adresse und Passwort ein, dann **Registrieren**. Sie sind
sofort als Administrator angemeldet und landen auf dem Einstiegsbildschirm, von dem
aus Sie Ihre Daten importieren können.

![Als Administrator angemeldet](/screenshot-onboarding.png)

Der gesamte Ablauf vom leeren Formular bis zur Startseite des Administrators:

![Das Administratorkonto anlegen](/register-admin.gif)

Das ist die gesamte Grundinstallation. Wie Sie sie unter einer echten Domain mit HTTPS
bereitstellen, steht unter [Reverse-Proxy und HTTPS](./reverse-proxy).

## Teil 2 - Objektspeicher für Downloads {#part-2-object-storage-for-downloads}

Die **Download**-Funktion braucht einen S3-kompatiblen Objektspeicher, den der Stack
bereits enthält (Garage). Das [Installationsskript](./quick-start) richtet ihn
automatisch ein; die manuellen Schritte stehen unten. Stöbern und Ansehen
funktionieren bereits, Sie können das also jetzt oder später erledigen, aber Downloads
bleiben abgeschaltet, bis es getan ist.

### 1. Einen Zugriffsschlüssel und ein Geheimnis erzeugen {#1-generate-an-access-key-and-secret}

Der Zugriffsschlüssel muss mit `GK` beginnen.

```sh
echo "DOWNLOADER_S3_ACCESS_KEY=GK$(openssl rand -hex 12)"
echo "DOWNLOADER_S3_SECRET_KEY=$(openssl rand -hex 32)"
```

Fügen Sie beide Zeilen in `.env` ein, anstelle der Platzhalter `SET_ME_ACCESS_KEY` und
`SET_ME_SECRET_KEY`, und erstellen Sie dann die betroffenen Dienste neu:

```sh
docker compose up -d
```

### 2. Garage einrichten {#2-provision-garage}

Führen Sie diese Befehle einmal aus. Sie weisen Speicher zu, legen den Bucket an,
registrieren Ihren Schlüssel und geben ihm Zugriff. Garage liest die initialisierte
Konfiguration über `GARAGE_CONFIG_FILE`, die Kommandozeile verwendet sie also
automatisch.

```sh
# kurzer Alias für die Garage-Kommandozeile im Container
g() { docker compose exec -T garage /garage "$@"; }

# 1. dem Knoten ein Speicher-Layout geben
NODE_ID=$(g node id | head -n1 | cut -d@ -f1)
g layout assign -z dc1 -c 20GB "$NODE_ID"
g layout apply --version 1

# 2. den Bucket für Downloads anlegen
g bucket create typetype-downloads

# 3. den Schlüssel aus Schritt 1 registrieren (IHRE Werte aus .env verwenden)
g key import --yes -n typetype-downloader "<DOWNLOADER_S3_ACCESS_KEY>" "<DOWNLOADER_S3_SECRET_KEY>"

# 4. diesem Schlüssel die Nutzung des Buckets erlauben
g bucket allow --read --write --owner --key "<DOWNLOADER_S3_ACCESS_KEY>" typetype-downloads
```

::: tip
`--version 1` ist bei einer frischen Installation richtig. Wenn Sie den Layout-Schritt
später erneut ausführen, verwenden Sie eins mehr als die Version, die `g layout show`
anzeigt.
:::

Downloads funktionieren jetzt über die Oberfläche.

Der Browser lädt über das Gateway von Server herunter. Garage bleibt intern; Sie
müssen Port 3900 nicht öffentlich freigeben und keinen S3-Endpunkt für den Browser
einrichten.

## Teil 3 - Mit Dockge bereitstellen {#deploy-with-dockge}

::: tip Dank
Dieser Abschnitt ist dem Bericht von [@BuggyPasta](https://github.com/BuggyPasta)
nachempfunden, der den gesamten Ablauf von Anfang bis Ende auf einer echten
Dockge-Installation durchgearbeitet und in
[der Fortsetzung von Issue #254](https://github.com/TypeType-Video/TypeType/issues/254#issuecomment-5701725080)
und in [Diskussion #277](https://github.com/TypeType-Video/TypeType/discussions/277)
veröffentlicht hat. Danke.
:::

[Dockge](https://github.com/louislam/dockge) ist eine Weboberfläche für Docker
Compose. Es kann den TypeType-Stack neben Ihren anderen Stacks verwalten, ersetzt aber
nicht die einmalige Initialisierung von TypeType. Behalten Sie die offiziellen
Dienstnamen und Dateien bei, damit die internen URLs und die Garage-Befehle weiterhin
zum unterstützten Stack passen.

### 1. Das Stack-Verzeichnis vorbereiten {#1-prepare-the-stack-directory}

Verwenden Sie das Host-Verzeichnis, das als Stacks-Verzeichnis von Dockge eingebunden
ist. Das folgende Beispiel legt einen Stack `typetype` unter `$HOME/dockge-stacks` an;
wählen Sie einen anderen Pfad, wenn Ihre Dockge-Installation einen anderen verwendet.

```sh
mkdir -p "$HOME/dockge-stacks"
git clone --depth 1 https://github.com/TypeType-Video/TypeType.git \
  "$HOME/dockge-stacks/typetype"
cd "$HOME/dockge-stacks/typetype"
cp .env.example .env
mkdir -p .typetype-migration
```

Erzeugen Sie das Garage-Geheimnis vor dem Bereitstellen. Behalten Sie den Wert in
`.env`; fügen Sie ihn nie in ein öffentliches Issue oder einen Dockge-Screenshot ein.

```sh
GARAGE_RPC_SECRET=$(openssl rand -hex 32)
sed -i "s/^GARAGE_RPC_SECRET=.*/GARAGE_RPC_SECRET=$GARAGE_RPC_SECRET/" .env
```

Aktualisieren Sie Dockge und wählen Sie den Stack `typetype`. Bearbeiten Sie `.env` in
Dockge oder im Stack-Verzeichnis und setzen Sie `ALLOWED_ORIGINS` auf genau den
Origin, den die Nutzer öffnen werden. Fügen Sie keine älteren Compose-Beispiele aus
der Community über die aktuelle Datei ein; die unterstützte Compose-Datei enthält
bereits den aktuellen Ablauf mit `typetype-init`.

### 2. Die einmalige Initialisierung ausführen {#2-run-the-one-time-bootstrap}

Führen Sie dies einmal im Stack-Verzeichnis aus, bevor Sie die Dienste der Anwendung
starten:

```sh
./scripts/run-stack-init.sh
```

Der Befehl führt `typetype-init` mit `--rm` aus. Er erzeugt die Geheimnisse der
YouTube-Sitzung, legt die Garage-Konfiguration an und erstellt die
Downloader-Datenbank. Sie können ihn beim Aktualisieren des Stacks gefahrlos erneut
ausführen; vorhandene Geheimnisse und die Garage-Konfiguration bleiben erhalten.

### 3. Den Stack in Dockge starten und verwalten {#3-start-and-manage-the-stack-in-dockge}

Wenn die Initialisierung erfolgreich beendet ist, verwenden Sie in Dockge die Aktion
**Deploy** oder **Start**. Der entsprechende Befehl auf dem Host lautet:

```sh
docker compose up -d --remove-orphans --wait --wait-timeout 180
```

Prüfen Sie den Stack in Dockge oder mit `docker compose ps`. Der
Initialisierungs-Container wird nach dem Erfolg entfernt, er muss also nicht weiter
laufen. Behalten Sie die Volumes von PostgreSQL, Garage und den Geheimnissen, wenn Sie
den Stack stoppen oder aktualisieren; verwenden Sie für eine normale Aktualisierung
nie `docker compose down -v`.

### 4. Den Stack aktualisieren, ohne etwas zu verlieren {#4-update-the-stack-without-losing-anything}

Verwenden Sie in Dockge die Aktion **Update**, die die neuen Images lädt und die
Container neu startet, und führen Sie dann **System Prune** aus, um den Speicherplatz
der alten Image-Schichten zurückzugewinnen.

::: warning Führen Sie nie ein Prune aus, während der Stack gestoppt ist
Das Layout von Garage und die Registrierung des Buckets liegen in denselben benannten
Volumes, die in [Teil 2](#part-2-object-storage-for-downloads) beschrieben sind und
die ein Prune nicht entfernt. Sollten Sie aber doch einmal ein Prune ausführen,
während der Stack gestoppt ist, besteht die sichere Wiederherstellung einfach darin,
die Einrichtungsschritte für Garage aus Teil 2 erneut auszuführen: Das dauert einige
Sekunden und berührt weder Ihre Konten noch Ihren Verlauf oder Ihre Einstellungen.
:::

::: tip Die Knoten-ID von Garage ist nicht stabil
Wenn Sie das Metadaten-Volume von Garage jemals vollständig löschen (keine normale
Aktualisierung), ändert sich seine Knoten-ID, und Sie müssen die Layout-Zuweisung aus
[Teil 2](#part-2-object-storage-for-downloads) mit der neu erzeugten ID wiederholen,
nicht mit einer aus einem früheren Lauf.
:::


## Eigene nginx- oder Garage-Konfiguration {#custom-nginx-or-garage-configuration}

Die unterstützten Standardwerte brauchen keine Konfigurationsdateien auf dem Host. Um
einen der beiden Dienste anzupassen, halten Sie die eigenen Dateien außerhalb der
verwalteten Stack-Dateien und binden Sie sie mit einer `docker-compose.override.yml`
ein:

```yaml
services:
  typetype:
    volumes:
      - ./config/nginx.conf:/etc/nginx/conf.d/default.conf:ro
  garage:
    volumes:
      - ./config/garage.toml:/etc/garage/garage.toml:ro
```

Legen Sie `config/nginx.conf` oder `config/garage.toml` nur an, wenn die
Standardtopologie nicht zur Installation passt. Compose lädt die Override-Datei
automatisch. Prüfen Sie die aufgelösten Einbindungen vor dem Start:

```sh
docker compose config -q
docker compose config
```

Der Installer behält `docker-compose.override.yml` und Dateien, die nicht zum
verwalteten Stack gehören. Nehmen Sie diese Dateien zusammen mit `.env` in Ihre
Sicherungen auf.

## Befehle für den Alltag {#everyday-commands}

```sh
docker compose pull && docker compose up -d   # auf die neueste Version aktualisieren
docker compose logs -f typetype-server        # den Server-Protokollen folgen
docker compose down                           # stoppen (Ihre Daten bleiben erhalten)
```
