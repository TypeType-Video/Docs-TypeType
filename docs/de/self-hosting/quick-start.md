# Schnellstart

Der schnellste und **empfohlene** Weg, TypeType selbst zu hosten, ist das
Installationsskript. Es richtet den gesamten Stack für Sie ein, Geheimnisse, freie
Ports, Dienste und den Objektspeicher für Downloads, sodass Sie mit einem Befehl eine
vollständige, funktionierende Instanz haben.

::: tip Lieber von Hand?
Alles, was das Skript tut, ist auch Schritt für Schritt unter
[Manuelle Einrichtung](./docker-compose) beschrieben, falls Sie die volle Kontrolle
möchten oder jeden Teil verstehen wollen.
:::

## Ein Befehl {#one-command}

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash
```

Der Installer:

- legt `~/typetype-stack` mit der Compose-Datei und den Stack-Skripten an,
- erzeugt die Geheimnisse für Downloader, Garage-RPC und YouTube-Sitzung,
- wählt automatisch freie Ports, wenn die Standard-Ports belegt sind,
- prüft die aufgelöste Konfiguration und startet alle Dienste,
- und richtet Garage ein, sodass **Downloads sofort funktionieren**.

Er ist interaktiv. Er lädt zuerst die Stack-Dateien herunter und bereitet sie vor,
dann fragt er nach einer Bestätigung, bevor er Images lädt und Container startet.

Bei einer Aktualisierung legt der Installer zuerst eine Sicherung der von ihm
verwalteten Stack-Dateien mit Zeitstempel an und hält die aktuellen Image-Referenzen
fest. Danach wartet er auf die erneuerten Dienste und prüft deren Versionsendpunkte,
bevor er endet.

### Das Verzeichnis wählen {#stack-directory}

Der Installer legt den Stack in `~/typetype-stack` ab. Das ist nur sein Standardwert:
Mit `--dir` installieren Sie, wo immer Sie möchten.

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --dir /srv/typetype
```

Die Befehle dieser Dokumentation verwenden `$STACK_DIR` für dieses Verzeichnis. Setzen
Sie die Variable einmal in Ihrem Terminal, auf den Standardwert oder auf das von Ihnen
gewählte Verzeichnis:

```sh
STACK_DIR=~/typetype-stack
```

Eine manuelle Installation hat keinen Standardwert: `$STACK_DIR` ist das Verzeichnis,
das Ihre `docker-compose.yml` enthält.

### Nur herunterladen {#download-only}

Um die Dateien zu holen und zu prüfen, bevor Sie Docker selbst starten:

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --download-only
```

## Prüfen, ob sie läuft {#check-it-is-up}

```sh
cd "$STACK_DIR"
docker compose ps
docker compose exec -T typetype-server wget -qO- http://127.0.0.1:8080/health
```

Der zweite Befehl prüft Server aus seinem Container heraus und bleibt deshalb richtig,
wenn der Installer einen anderen Host-Port gewählt hat.

## Das Administratorkonto anlegen {#create-the-admin-account}

Öffnen Sie die Web-App (der Installer gibt die genaue URL aus, standardmäßig
`http://localhost:8082`). Bei einer frischen Installation werden Sie aufgefordert, ein
Konto anzulegen, und das **erste Konto wird automatisch zum Administrator**.

![Der Registrierungsbildschirm einer frischen Installation](/screenshot-register.png)

Geben Sie Name, E-Mail-Adresse und Passwort ein, dann **Registrieren**. Sie sind als
Administrator angemeldet und landen auf dem Einstiegsbildschirm, von dem aus Sie Ihre
Daten importieren können.

![Als Administrator angemeldet](/screenshot-onboarding.png)

Der gesamte Ablauf:

![Das Administratorkonto anlegen](/register-admin.gif)

## Weiter {#next}

- Unter eigener Domain mit HTTPS bereitstellen:
  [Reverse-Proxy und HTTPS](./reverse-proxy).
- Ports, Datenbank und Geheimnisse einstellen: [Konfiguration](./configuration).
- In gutem Zustand halten: [Wartung](./maintenance).
