# Fehlerbehebung

Sehen Sie zuerst nach, was ein Dienst gerade tut:

```sh
docker compose ps               # Zustand aller Dienste
docker compose logs -f <name>   # einem Dienst folgen, z. B. typetype-server
```

## Ein Port ist bereits belegt {#a-port-is-already-in-use}

`docker compose up` scheitert mit einem Fehler „address already in use“ oder „port is
allocated“. Ein anderes Programm verwendet diesen Port. Ändern Sie das passende
`HOST_PORT_*` in `.env` (siehe [Konfiguration](./configuration#ports)) und führen Sie
`docker compose up -d` erneut aus.

## Die Seite lädt, aber Aktionen scheitern mit CORS- oder Netzwerkfehlern {#the-page-loads-but-actions-fail-with-cors-network-errors}

Die Web-App lädt, aber die Anmeldung oder das Laden von Inhalten scheitert. Ihre
Domain fehlt in `ALLOWED_ORIGINS`. Setzen Sie den Wert auf Ihren echten Origin (zum
Beispiel `https://watch.example.com`), dann `docker compose up -d`. Siehe
[Reverse-Proxy und HTTPS](./reverse-proxy#before-you-start).

Die Übereinstimmung ist exakt: Geben Sie Schema und Port an und lassen Sie den
abschließenden Schrägstrich weg. Eine unter `http://server.lan:32110` geöffnete Seite
braucht zum Beispiel:

```dotenv
ALLOWED_ORIGINS=http://server.lan:32110
```

Erstellen Sie Server neu, nachdem Sie `.env` bearbeitet haben:

```sh
docker compose up -d --force-recreate typetype-server
```

Dieser konkrete Fehler beim ersten Administrator wurde mit
[hulmgulm in Diskussion #151](https://github.com/TypeType-Video/TypeType/discussions/151) eingegrenzt.

## Ein Dienst startet ständig neu {#a-service-keeps-restarting}

```sh
docker compose logs --tail=50 <name>
```

- `typetype-server` wartet auf `postgres` und die Init-Container; startet er neu,
  prüfen Sie, ob `postgres` gesund ist und `DATABASE_*` stimmt.
- `typetype` (Web) hängt vom Server ab; es ist in Ordnung, wenn er einige Sekunden
  nach dem Server startet.

## Downloads funktionieren nicht {#downloads-do-not-work}

Die Download-Funktion setzt voraus, dass der Objektspeicher eingerichtet ist. Stellen
Sie sicher, dass Sie:

1. echte Werte für `DOWNLOADER_S3_ACCESS_KEY` (beginnt mit `GK`) und
   `DOWNLOADER_S3_SECRET_KEY` in `.env` gesetzt haben;
2. die Einrichtungsschritte für Garage aus
   [Manuelle Einrichtung, Teil 2](./docker-compose#part-2-object-storage-for-downloads)
   ausgeführt haben;
3. ein echtes `GARAGE_RPC_SECRET` erzeugt und Garage neu gestartet haben, falls seine
   Protokolle den Platzhalter ablehnen.

Prüfen Sie, ob der Objektspeicher Ihren Schlüssel und Ihren Bucket sieht:

```sh
docker compose exec -T garage /garage bucket list
docker compose exec -T garage /garage key list
```

Der Browser verwendet `/api/downloader/...`; er muss den internen Hostnamen `garage`
nicht auflösen. Ein `401 Authentication required` in den Protokollen des Downloaders
bedeutet dagegen, dass die Extraktionsanfrage des Auftrags keine gültige Nutzersitzung
behalten hat. Fügen Sie dem Bericht die Protokolle von Server und Downloader sowie die
fünf Versionsantworten der Komponenten bei.

Dieser Fehler kam bei der Nachverfolgung von
[nanhoes’ Bericht zu Downloads unter iOS](https://github.com/TypeType-Video/TypeType/issues/116)
ans Licht und wurde dann mit dem aktuellen Autorisierungsablauf von Server zu
Downloader abgeglichen.

## Die Remote-Anmeldung bei YouTube startet und zeigt dann einen 404 {#remote-youtube-login-starts-then-shows-a-404}

Wenn das Anlegen der Sitzung gelingt, die Browser-Route aber `404` zurückgibt, wurde
der WebSocket vermutlich als normale HTTP-Anfrage weitergeleitet. Prüfen Sie auf jeder
Proxy-Ebene:

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $connection_upgrade;
```

Die unterstützte nginx-Konfiguration ist im Web-Image enthalten. Verwendet der Stack
eine eigene Einbindung vom Host, vergleichen Sie sie mit der aktuellen Datei im
Frontend-Repository. Siehe
[Remote-Anmeldung und WebSockets](./reverse-proxy#remote-login-and-websockets) und die
ursprüngliche [Diagnose aus der Community](https://github.com/TypeType-Video/TypeType/discussions/122).

## Unerwartete Abmeldungen {#unexpected-sign-outs}

Ein Zugriffstoken des Kontos gilt eine Stunde, die Erneuerungssitzung aber
standardmäßig 30 Tage. Das Frontend erneuert automatisch, wenn eine authentifizierte
Anfrage `401` zurückgibt; eine Abmeldung nach einer Stunde ist also kein erwartetes
normales Verhalten.

Prüfen Sie:

1. Die Seite verwendet HTTPS. Das Erneuerungs-Cookie ist standardmäßig `Secure`.
2. `ALLOWED_ORIGINS` enthält den genauen Origin des Browsers.
3. Anmeldung und Anfragen an `/api/auth/refresh` enthalten Zugangsdaten und werden
   nicht von einem eigenen Proxy entfernt.
4. Server verwendet weiterhin das PostgreSQL-Volume, das die Erneuerungssitzung
   enthält.
5. Die Datenschutzeinstellungen des Browsers lehnen das Erneuerungs-Cookie mit
   `SameSite=None` nicht ab.

Server erzeugt bei jedem Start ein neues JWT-Signaturgeheimnis, es sei denn, eine
eigene Installation setzt `JWT_SECRET`. Das macht das alte Zugriffstoken ungültig,
aber die normale Erneuerung sollte sich sofort erholen, solange die
PostgreSQL-Sitzung und das Erneuerungs-Cookie noch vorhanden sind. Ein Neustart allein
sollte daher keine neue Anmeldung erfordern.

Für eine vertrauenswürdige, rein lokale Instanz, die kein HTTPS verwenden kann, setzen
Sie `AUTH_ALLOW_INSECURE_COOKIES=true` und erstellen `typetype-server` neu. Das
schwächt die Transportsicherheit der Cookies bewusst und darf in einem öffentlichen
oder nicht vertrauenswürdigen Netzwerk nicht verwendet werden.
`AUTH_SESSION_TTL_DAYS` kann die Lebensdauer der Erneuerung zwischen 1 und 365 Tagen
ändern. Siehe [Lebensdauer der Sitzung](./authentication#session-lifetime).

Besteht das Problem weiter, halten Sie die Server-Protokolle rund um `/auth/refresh`,
den Antwortstatus im Browser und die bereitgestellten Revisionen fest. Fügen Sie weder
das Cookie noch ein Bearer-Token bei.

Diese Prüfliste geht auf das unerwartete Verhalten zurück, das
[Toni-Vide in Diskussion #162](https://github.com/TypeType-Video/TypeType/discussions/162) gemeldet hat.

## Eine gespeicherte YouTube-Sitzung funktioniert nach einer Änderung des Geheimnisses nicht mehr {#a-saved-youtube-session-stopped-working-after-a-secret-change}

`YOUTUBE_SESSION_ENCRYPTION_KEY` verschlüsselt gespeicherte YouTube-Cookies und
Wiedergabe-Token. Wenn Sie den Wert ändern, nachdem die Remote-Anmeldung verwendet
wurde, lassen sich diese gespeicherten YouTube-Sitzungen nicht mehr entschlüsseln, und
betroffene Nutzer müssen YouTube erneut verbinden. Die Anmeldung am TypeType-Konto
wird damit nicht verschlüsselt. Wählen Sie den Wert einmal und behalten Sie ihn. Der
erzeugte Wert bleibt in `typetype_secrets` erhalten, Sie müssen ihn also in der Regel
nicht anfassen.

## Die Wiedergabe lädt neu, und `/api/proxy` gibt `422` zurück {#playback-reloads-and-apiproxy-returns-422}

Eine alte Wiedergabe-Implementierung schickte signierte `googlevideo`-URLs über
`/api/proxy`. Ihre ersten Range-Anfragen konnten `206` zurückgeben, gefolgt von
`422`-Antworten mit `{"error":"Upstream returned 403"}`. Der Player baute die Quelle
dann immer wieder neu auf, und Server konnte `ChannelWriteException` protokollieren,
nachdem der Browser eine aufgegebene Proxy-Antwort geschlossen hatte.

Die aktuelle Wiedergabe verwendet eine zustandsbehaftete SABR-Sitzung und nutzt diese
signierten Medien-URLs nicht über denselben zum Browser gerichteten Pfad. Tritt das
alte Anfragemuster noch auf, prüfen Sie die fünf Versionsantworten der Komponenten und
führen Sie aus:

```sh
docker compose config --images
```

Eine Ausgabe mit `ghcr.io/priveetee/...` bedeutet, dass die aktive Compose-Datei noch
auf den früheren Image-Namensraum zeigt. Folgen Sie
[Einen älteren Priveetee-Stack migrieren](./maintenance#migrate-an-older-priveetee-stack),
bevor Sie die Remote-Anmeldung, die private IP-Adresse oder die Proxy-Einstellungen
untersuchen.

Die alte Fehlerfolge und die erfolgreiche Aktualisierung hat
[filippobaroni in Diskussion #133](https://github.com/TypeType-Video/TypeType/discussions/133#discussioncomment-17779201) dokumentiert.

## Token ist gesund, aber die YouTube-Wiedergabe scheitert {#token-is-healthy-but-youtube-playback-fails}

`/health` beweist nur, dass der Bun-Dienst lauscht. PO-Token, Decoder, SABR und die
Abläufe des Remote-Browsers brauchen außerdem Chromium über Playwright und
beschreibbare Laufzeitpfade.

Wenn Sie ein eigenes Container-Profil ohne root oder mit Schreibschutz angewendet
haben, testen Sie `/potoken`, ein normales YouTube-Video, einen Livestream und die
Remote-Anmeldung getrennt erneut. Ein beliebiger Nutzer `nobody` hat im aktuellen
Image kein nutzbares Home-Verzeichnis für Chromiums Crashpad. Kehren Sie zur
unterstützten Definition des Token-Dienstes zurück, bevor Sie den Fehler als Fehler
von Server oder Player behandeln.

Siehe [Browser-Grenze von Token](./security#token-browser-boundary) und
[hugoghx’ Untersuchung des Containers](https://github.com/TypeType-Video/TypeType/discussions/156).

## Ganz von vorn beginnen {#start-over-from-scratch}

::: danger Das löscht Ihre Daten
`down -v` entfernt die Volumes von Datenbank, Cache und Objektspeicher.
:::

```sh
docker compose down -v
docker compose up -d
```

## Aktualisieren {#updating}

Vom Installer verwalteter Stack:

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --yes --dir "$STACK_DIR"
cd "$STACK_DIR"
docker compose ps
```

`$STACK_DIR` ist Ihr Stack-Verzeichnis, `~/typetype-stack`, sofern Sie kein anderes
gewählt haben: siehe [Das Verzeichnis wählen](./quick-start#stack-directory).

Stack ohne Skripte, nachdem Sie die verwaltete Compose-Datei und die Skripte durch die
der aktuellen Version ersetzt und dabei `.env` und ein eventuelles eigenes Override
behalten haben:

```sh
docker compose config -q
docker compose pull
docker compose up -d --force-recreate --wait --wait-timeout 180
docker compose ps
```

Ihre Daten liegen in benannten Volumes, Aktualisierungen behalten also Ihre Konten und
Ihren Verlauf. Startet eine neue Version nicht richtig, folgen Sie
[Eine Aktualisierung zurücknehmen](./rollback), statt Container oder Volumes zu
löschen.
