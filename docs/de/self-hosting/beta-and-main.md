# Beta und main

TypeType wird auf zwei Kanälen veröffentlicht, und Sie können beide nebeneinander auf
demselben Host betreiben.

| Kanal | Branch | Images | Standard-Ports |
| --- | --- | --- | --- |
| **main** (stabil) | `main` | `ghcr.io/typetype-video/typetype:latest`, `...-server:latest`, ... | Web `8082`, Server `8080`, Token `8081`, S3 `3900` |
| **beta** | `dev` | `ghcr.io/typetype-video/typetype-beta:latest`, `...-server-beta:latest`, ... | Web `18082`, Server `18080`, Downloader `19093`, Token `18081`, S3 `3900` |

Die CI baut die Images automatisch: Ein Push auf `main` aktualisiert die
`:latest`-Images, ein Push auf `dev` die `-beta`-Images. **main ist also die stabile
Version** und **beta die Vorschau auf das, was als Nächstes kommt**.

Die Repositorys, die festgelegten Submodul-Stände, die Image-Benachrichtigungen und
die Bereitstellungen sind getrennte Teile des Veröffentlichungswegs. Lesen Sie
[Branches und Versionen](/de/project/releases), wenn Sie die genaue Herkunft von
Quellcode oder Images brauchen.

## Wann Sie die Beta verwenden {#when-to-use-beta}

- Um kommende Funktionen auszuprobieren, bevor sie die stabile Version erreichen.
- Um einen Fehler mit dem neuesten `dev`-Build nachzustellen oder zu bestätigen, bevor
  Sie ihn melden.

Die Beta kann ohne Ankündigung kaputtgehen oder sich ändern: Behalten Sie Ihre echten
Daten auf dem Kanal main.

## Die Beta neben main betreiben {#run-beta-alongside-main}

Der Beta-Stack ist in `docker-compose.dev.yml` definiert. Wird er aus demselben
Arbeitsverzeichnis gestartet, liest er dieselbe `.env`, einschließlich Zugangsdaten
und Datenbankeinstellungen, aber ein anderer Compose-Projektname gibt ihm getrennte
Container, Netzwerke und benannte Daten-Volumes. Die Host-Ports werden dadurch nicht
getrennt: Der Garage-Standardport der mitgelieferten Beta ist ebenfalls `3900`, eine
manuelle Einrichtung nebeneinander muss ihn also ändern.

### Ein Befehl (empfohlen) {#one-command-recommended}

Das Installationsskript des Beta-Branches kann den Beta-Stack für Sie starten. Es
verwendet den `dev`-Build, holen Sie es also von `dev` und übergeben Sie `--beta`:

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/dev/scripts/install-stack.sh | bash -s -- --beta
```

Das legt `~/typetype-beta-stack` an, holt nur `docker-compose.dev.yml` und die
zugehörigen Dateien, wählt freie `*_BETA`-Ports, wenn die Standard-Ports belegt sind,
lädt die Beta-Images, startet diesen Stack und richtet Garage ein. Es ist
standardmäßig interaktiv; fügen Sie `--yes` hinzu, um die Fragen zu überspringen, oder
`--download-only`, um die Dateien zu holen, ohne Docker zu starten.

### Von Hand {#manually}

Bevor Sie die Beta neben main starten, geben Sie Garage einen freien Host-Port und
erlauben Sie den Web-Origin der Beta. Für die mitgelieferten Standardwerte:

```dotenv
HOST_PORT_GARAGE_S3_BETA=13900
ALLOWED_ORIGINS=http://localhost:8082,http://127.0.0.1:8082,http://localhost:18082,http://127.0.0.1:18082
```

Behalten Sie öffentliche Origins, die bereits in `ALLOWED_ORIGINS` stehen.

```sh
docker compose -f docker-compose.dev.yml -p typetype-beta up -d
```

- main läuft weiter unter `http://localhost:8082`,
- die Beta läuft unter `http://localhost:18082`.

Verwalten Sie den Beta-Stack mit denselben Optionen `-f`/`-p`:

```sh
docker compose -f docker-compose.dev.yml -p typetype-beta ps
docker compose -f docker-compose.dev.yml -p typetype-beta pull
docker compose -f docker-compose.dev.yml -p typetype-beta down
```

## Einen Kanal aktualisieren {#update-a-channel}

```sh
# main
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --yes

# beta
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/dev/scripts/install-stack.sh | bash -s -- --beta --yes
```

Den Installer erneut auszuführen behält die vorhandene `.env`, die Ports und die
Daten-Volumes des Kanals und erneuert dabei die Stack-Dateien und Images.

::: tip Ports bereits belegt
Der Installer wählt freie Ports. Bei einem manuellen Start ändern Sie in `.env` jeden
kollidierenden Wert `HOST_PORT_*_BETA`, bevor Sie den Beta-Stack starten. Insbesondere
haben die stabile Version und die Beta beide den Garage-Port `3900` als Standard.
Siehe [Konfiguration](./configuration#ports).
:::
