# Ihre Daten importieren

Sobald Ihre Instanz läuft und Ihr Konto angelegt ist, können Sie Abonnements,
Wiedergabelisten, Verlauf und mehr aus der App übernehmen, die Sie bisher genutzt
haben, und sie später in eine andere App exportieren. Öffnen Sie
**Datenübertragung** in der Seitenleiste; neue Konten landen direkt nach der
Registrierung dort.

## Unterstützte Apps {#supported-apps}

| App oder Format | Datei | Import | Export |
| --- | --- | --- | --- |
| TypeType | `.json` | alles | alles |
| PipePipe | `.zip` | ja | nein |
| NewPipe | `.zip` | ja | ja |
| Invidious | `.json` | ja | ja |
| Piped | `.json` | ja | ja |
| LibreTube | `.json` | ja | ja |
| ViewTube | `.zip` | ja | nein |
| Flow | `.json` | ja | ja |
| Grayjay | `.zip` | ja | ja |
| YouTube Takeout | `.zip` | ja | nein |
| OPML | `.opml` | Abonnements | Abonnements |
| Materialious | `.json` | Abonnements | Abonnements |
| SkyTube | `.opml` | Abonnements | Abonnements |
| youtube-local | `.opml` | Abonnements | Abonnements |

Was übernommen wird, hängt davon ab, was jede App speichert: Abonnements,
Abo-Gruppen, Verlauf, Wiedergabelisten, Später ansehen, Favoriten,
Wiedergabefortschritt, Suchverlauf, gespeicherte Wiedergabelisten, Einstellungen
oder Inhaltsfilter. Eine TypeType-Sicherung enthält alles. Hält ein Format eine
Kategorie nur teilweise, weisen Vorschau und Abschlussbericht darauf hin.

![Das Menü Importieren von mit allen unterstützten Quellen](/screenshot-import-sources.png)

## Importieren {#import}

1. Exportieren Sie eine Sicherung aus Ihrer bisherigen App und lassen Sie die Datei
   unverändert: nicht entpacken, nicht bearbeiten.
2. Bleiben Sie in **Datenübertragung** auf **Importieren** und lassen Sie
   **Importieren von** auf **Automatische Erkennung**, oder wählen Sie die App selbst.
3. Ziehen Sie die Datei hinein oder wählen Sie sie aus. Die Grenze liegt bei 512 MB.
4. TypeType analysiert die Datei und zeigt eine Vorschau: die erkannte Quelle, die
   Anzahl der Einträge je Kategorie, Duplikate und Kompatibilitätshinweise. Vor
   diesem Schritt wird nichts geschrieben.
5. Danach startet der Import von selbst für alles Erkannte. Was Sie schon haben, wird
   übersprungen. Sie können die Seite verlassen; der Import läuft weiter.

Am Ende listet ein Bericht auf, was importiert und was übersprungen wurde, und Sie
können ihn herunterladen.

## Von YouTube (Google Takeout) {#from-youtube-google-takeout}

Takeout bringt Ihre **Abonnements, Ihren Verlauf, Ihre Wiedergabelisten, Später
ansehen und Ihre gelikten Videos** (als Favoriten).

1. Wählen Sie **YouTube Takeout** unter **Importieren von**, dann **Öffne Google
   Takeout**: Der Link wählt YouTube und Meine Aktivitäten vor. Behalten Sie Meine
   Aktivitäten, wenn Sie Ihren Verlauf möchten.
2. Erstellen Sie einen einmaligen ZIP-Export und laden Sie ihn bei Google herunter.
3. Ziehen Sie das originale ZIP hinein. Hat Google den Export auf mehrere ZIPs
   verteilt, importieren Sie sie nacheinander.

Der Import entfernt doppelte Abonnements, Wiedergabelisten und Videos, nutzt eine
vorhandene Wiedergabeliste weiter, wenn sie passt, und ordnet die Systemlisten von
YouTube den TypeType-Listen **Favoriten** und **Später ansehen** zu statt gewöhnlichen
Wiedergabelisten. „Mag ich“-Aktivitäten können die Favoriten auch füllen, wenn die
Systemliste fehlt oder unvollständig ist; Zeitpunkt und Reihenfolge bleiben
erhalten. Zeilen mit unvollständigen Metadaten werden im Hintergrund ergänzt, damit
sich die Wiedergabeliste sofort öffnet.

Meldet der Import, dass keine Kontodaten gefunden wurden, haben Sie einen Teil des
Exports gewählt, der nur Videos enthält: Nehmen Sie das ZIP mit Verlauf, Abonnements
oder Wiedergabelisten. Meldet er, dass das Archiv die Grenzen überschreitet oder
verschlüsselt ist, exportieren Sie YouTube erneut in kleineren ZIP-Teilen.

## Exportieren {#export}

Wählen Sie im Reiter **Exportieren** ein **Ziel-Format** und die Kategorien, dann
**Export erstellen**, und laden Sie die Datei herunter. Ein Ziel, das nicht alle
TypeType-Felder aufnehmen kann, zeigt eine Warnung, und der Bericht listet, was nicht
erhalten werden konnte. Ein TypeType-Export behält alles: Das ist die Sicherung für
den Umzug auf eine andere TypeType-Instanz.

**Einstellungen > Daten** erstellt und stellt ebenfalls direkt eine
TypeType-Sicherung wieder her. Eine Wiederherstellung dort ersetzt die in der
Sicherung enthaltenen Kategorien.

## Quellen {#source-references}

- [Unterstützte Formate](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-portability/src/main/kotlin/dev/typetype/server/portability/PortabilityFormat.kt)
- [Registrierte Importer und Exporter](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-portability/src/main/kotlin/dev/typetype/server/portability/PortabilityEngineFactory.kt)
- [Takeout-Parser und Duplikatbereinigung](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-services/src/main/kotlin/dev/typetype/server/services/YoutubeTakeoutParserService.kt)
- [Metadaten-Reparatur im Hintergrund](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-services/src/main/kotlin/dev/typetype/server/services/UserVideoMetadataRepairService.kt)
