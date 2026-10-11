# Voraussetzungen

## Unterstützte Hosts {#supported-hosts}

TypeType braucht einen 64-Bit-Linux-Host. Die veröffentlichten Images unterstützen
`linux/amd64` und `linux/arm64`; der Installer wählt bei Bedarf automatisch die
ARM64-Variante für den Cache. Eine GPU ist nicht erforderlich.

::: tip Raspberry Pi
Ein 64-Bit-Raspberry-Pi 4 oder 5 mit mindestens 4 GiB RAM kann eine kleine
persönliche Instanz betreiben. Verwenden Sie für Docker, PostgreSQL und die
Garage-Daten eine USB-3-SSD statt einer microSD-Karte.
:::

## Ressourcen bemessen {#resource-sizing}

Diese Werte gelten für den Host insgesamt, für den vollständigen Compose-Stack mit
Web-App, Server, Token, Downloader, PostgreSQL, Cache und Garage. Es sind Zielwerte
für die Installation, keine harten Grenzen.

| Profil | CPU | RAM | Freier Speicherplatz vor Downloads | Geeignet für |
| --- | --- | --- | --- | --- |
| Kleine persönliche Instanz | 2 vCPU | 4 GiB | 20 GiB auf SSD | Ein oder zwei gleichzeitige Wiedergaben und gelegentliche Downloads |
| Empfohlen | 4 vCPU | 8 GiB | 40 GiB auf SSD | Mehrere Nutzer, Aktualisierung der Abonnements und regelmäßige Downloads |
| Stark genutzt oder viele Downloads | 8+ vCPU | 16+ GiB | 100+ GiB plus Platz für Artefakte | Viele gleichzeitige Sitzungen oder große und wiederholte Downloads |

Das Minimum von 4 GiB lässt Raum über dem normalen Bedarf des gesamten Stacks und für
kurze Spitzen von Server oder Token. Die CPU-Last ist meist gering, aber Extraktion,
eine große Aktualisierung der Abonnements, der Start einer Wiedergabe und das Muxen
eines Downloads können zusammenfallen. Planen Sie Kapazität für jeden gleichzeitigen
Nutzer ein, statt von ruhenden Containern auszugehen.

Die Wiedergabe lädt oder speichert kein ganzes Video im Arbeitsspeicher. Ein Stream
von zehn Stunden braucht also keine zehn Stunden RAM; den Speicherbedarf erhöhen
gleichzeitige Wiedergabesitzungen und ihre aktiven Puffer.

## Speicherplatz und lange Downloads {#storage-and-long-downloads}

Halten Sie Speicherplatz für vier getrennte Zwecke frei:

- Docker-Images und genug Reserve, um eine Aktualisierung zu laden, bevor alte
  Schichten entfernt werden.
- PostgreSQL, Cache und Metadaten der Anwendung.
- Arbeitsdateien des Downloaders, während getrennte Ton- und Videospuren geholt und
  gemuxt werden.
- Fertige Artefakte im Garage-Volume.

Schätzen Sie die endgültige Mediengröße aus der gesamten Bitrate:

```text
size in decimal GB ≈ bitrate in Mbit/s × duration in hours × 0.45
```

| Beispiel | Ungefähre Endgröße |
| --- | --- |
| 10 Stunden Audio mit 128 kbit/s | 0,58 GB |
| 10 Stunden Audio mit 256 kbit/s | 1,15 GB |
| 10 Stunden 4K-Video mit 20 Mbit/s | 90 GB, zuzüglich Audio |
| 10 Stunden 4K-Video mit 40 Mbit/s | 180 GB, zuzüglich Audio |

Die Auflösungsangabe allein bestimmt die Dateigröße nicht; das tut die gewählte
Bitrate.

Mit dem mitgelieferten lokalen Garage-Speicher kann ein Video-Download vorübergehend
etwa das Dreifache seiner Endgröße auf demselben Host belegen: heruntergeladene
Spuren, die gemuxte Datei und das Garage-Objekt können nebeneinander bestehen, bis der
Auftrag endet. Ein reiner Audio-Download kann vorübergehend etwa das Doppelte seiner
Endgröße brauchen. Der Standard-Stack erlaubt zwei gleichzeitige Download-Aufträge,
rechnen Sie also damit, dass sich beide überschneiden.

`S3_ARTIFACT_TTL_SECONDS=7200` steuert den Ablauf der Artefakt-URL. Es ist kein
Speicherkontingent und entfernt das Objekt nicht automatisch aus Garage. Löschen Sie
abgeschlossene Download-Aufträge, wenn Sie deren Artefakte nicht mehr brauchen.
Beobachten Sie den Speicher von Garage und Docker, besonders vor langen
4K-Downloads:

```sh
df -h
docker stats --no-stream
docker system df -v
docker compose exec -T garage /garage -c /etc/garage.toml status
```

## Netzwerkkapazität {#network-capacity}

Der Wiedergabeverkehr von YouTube läuft über den TypeType-Host. Für einen entfernten
Zuschauer empfängt der Host die gewählten Medien und sendet sie wieder hinaus; seine
Download- und Upload-Kapazität müssen also jeweils die Summe der aktiven
Stream-Bitraten plus Protokoll-Overhead abdecken. Zu Hause betriebene Instanzen sind
oft durch die Upload-Geschwindigkeit begrenzt.

Ein Stream mit 40 Mbit/s braucht während der Wiedergabe zum Beispiel etwa 40 Mbit/s
eingehend und 40 Mbit/s ausgehend. Zwei solche Streams brauchen etwa das Doppelte.
Lassen Sie zusätzliche Reserve für Extraktion, Vorschaubilder, Downloads und andere
Nutzer.

## Erforderliche Software {#required-software}

Installieren Sie die folgenden Werkzeuge auf dem Host:

- **Docker Engine** 24+ und das Plugin **Docker Compose v2** (`docker compose`, nicht
  das alte `docker-compose`).
- **curl**, um den unterstützten Installer auszuführen.
- **git**, um das Repository zu klonen.
- **openssl**, um Geheimnisse zu erzeugen. Es ist auf den meisten Distributionen
  vorinstalliert; falls nicht, zeigen die Befehle dieser Anleitung auch eine
  Alternative mit Python.

Prüfen Sie, was vorhanden ist:

```sh
docker --version
docker compose version
curl --version
openssl version
git --version
```

Schlägt `docker compose version` fehl, installieren Sie das Compose-Plugin für Ihre
Distribution, bevor Sie fortfahren.

## Optional, für eine öffentliche Installation {#optional-for-a-public-deployment}

- Ein **Domainname**, der auf Ihren Server zeigt.
- Ein Reverse-Proxy (Caddy, nginx oder Traefik), der TLS terminiert. Das behandelt
  [Reverse-Proxy und HTTPS](./reverse-proxy). Für eine rein lokale Einrichtung können
  Sie das überspringen und die App unter `http://localhost:8082` erreichen.

::: warning Als Nicht-root-Nutzer ausführen
Fügen Sie Ihren Nutzer der Gruppe `docker` hinzu (`sudo usermod -aG docker "$USER"`,
dann ab- und wieder anmelden), damit Sie nicht jeden Befehl mit `sudo` ausführen
müssen.
:::
