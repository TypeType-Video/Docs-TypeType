# Ihre Daten importieren

Sobald Ihre Instanz läuft und Ihr Konto angelegt ist, können Sie Ihre vorhandenen
Abonnements, Wiedergabelisten und Ihren Verlauf mitbringen. TypeType importiert aus
zwei Quellen: einem **Google-Takeout**-Export oder einer **PipePipe**-Sicherung.

Sie finden das auf dem Einstiegsbildschirm direkt nach der Registrierung und jederzeit
später unter **Importieren** in der Seitenleiste.

![Der Importbildschirm](/screenshot-onboarding.png)

## Von YouTube (Google Takeout) {#from-youtube-google-takeout}

Das bringt Ihre **Abonnements, Wiedergabelisten, Favoriten und Ihren
Wiedergabeverlauf** mit (Verlauf und Favoriten nur, wenn der Export die
entsprechenden Einträge aus Meine Aktivitäten enthält).

1. Fordern Sie einen Google-Takeout-Export von **YouTube und YouTube Music** an und
   fügen Sie auch **Meine Aktivitäten** hinzu, wenn Sie Ihren Wiedergabeverlauf
   möchten. Die App gibt Ihnen einen Link, der mit einem Klick die richtigen Produkte
   vorauswählt.
2. Warten Sie, bis Google ihn vorbereitet hat, und laden Sie dann die ZIP-Datei(en)
   herunter. Große Exporte werden in mehrere ZIP-Dateien aufgeteilt, das ist in
   Ordnung.
3. Wählen Sie auf dem Importbildschirm **Von YouTube importieren** und legen Sie **eine
   oder mehrere Takeout-ZIP-Dateien** ab (Sie können mehrere auf einmal auswählen).
4. Starten Sie den Import und prüfen Sie dann Ihre Abonnements und Wiedergabelisten.

::: warning Der Importfortschritt bleibt bei null
Wenn die Vorschau gelingt, ein Import aber ohne Fortschritt bei `00` Kategorien
stehen bleibt, notieren Sie die Kennung des Auftrags und die Zahlen der Vorschau,
bevor Sie ihn abbrechen. Dieses Verhalten wird in
[Issue #276](https://github.com/TypeType-Video/TypeType/issues/276) verfolgt; es
unterscheidet sich von einer Takeout-Datei, deren Erkennung fehlgeschlagen ist. Fügen
Sie einem Bericht weder das Archiv noch Kontodaten bei.
:::

::: tip
Sie müssen nichts entpacken: Laden Sie die Takeout-ZIP-Dateien genau so hoch, wie
Google sie Ihnen gibt.
:::

Wenn Sie mehrere Archive auswählen, verarbeitet und speichert das Frontend sie
nacheinander. Jeder Import entfernt doppelte Abonnements, Wiedergabelisten und
Video-URLs, verwendet eine vorhandene Wiedergabeliste wieder, wenn ihre
Herkunftszuordnung oder ihr Name bereits passt, und meldet vorhandene Einträge als
übersprungen. Ein späteres Archiv überspringt also Daten, die ein früheres bereits
gespeichert hat. Die Systemlisten von YouTube werden den **Favoriten** und **Später
ansehen** von TypeType zugeordnet, statt als doppelte gewöhnliche Wiedergabelisten zu
erscheinen.

Auch die Aktivität zu Videos mit „Mag ich“ kann Favoriten wiederherstellen, wenn die
Systemliste fehlt oder unvollständig ist. Der Import behält die ursprüngliche Zeit der
Aktivität, versteht die englischen und französischen Datumsformate von Takeout und
ignoriert Einträge zu gelöschten, privaten oder nicht verfügbaren Videos. So bleibt
die ursprüngliche Reihenfolge erhalten, statt Zeitstempel des Imports in umgekehrter
Reihenfolge zu vergeben.

Ältere oder nicht verfügbare Takeout-Zeilen können nur Ersatz-Metadaten enthalten. Die
Wiedergabeliste öffnet sich sofort, und Server plant die Reparatur der Metadaten im
Hintergrund, statt die gesamte Antwort zu blockieren, während er jeden Eintrag
auflöst.

Diese Einzelheiten wurden überprüft, nachdem
[lelam183 langsame, umgekehrte und doppelte importierte Wiedergabelisten gemeldet hatte](https://github.com/TypeType-Video/TypeType/issues/135).

## Von PipePipe {#from-pipepipe}

Sie kommen von der App PipePipe? Stellen Sie direkt aus deren Sicherung wieder her.

1. Exportieren Sie eine Sicherung aus PipePipe (eine `.zip`-Datei).
2. Wählen Sie auf dem Importbildschirm **Von PipePipe importieren** und legen Sie die
   Sicherungs-ZIP ab.
3. Das stellt Ihren **Verlauf, Ihre Abonnements, Wiedergabelisten und Ihren
   Wiedergabefortschritt** wieder her.

## Nach dem Import {#after-importing}

Wenn der Import fertig ist, zeigt er einen kurzen Bericht darüber, was übernommen und
was übersprungen wurde, damit Sie genau sehen, was geschehen ist. Ihre Abonnements und
Wiedergabelisten stehen sofort zur Verfügung.

## Quellen {#source-references}

- [Takeout-Parser und Entfernen von Duplikaten](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/YoutubeTakeoutParserService.kt)
- [Speichern eines Takeout-Imports](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/YoutubeTakeoutImporterService.kt)
- [Reparatur der Metadaten im Hintergrund](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/UserVideoMetadataRepairService.kt)
