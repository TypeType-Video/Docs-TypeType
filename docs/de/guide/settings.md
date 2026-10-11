# Einstellungen

Stellen Sie ein, wie sich TypeType für Sie verhält. Alles hier gilt pro Konto und wird
auf Ihrer Instanz gespeichert.

![Die Einstellungsseite](/screenshot-settings.png)

## Wiedergabe {#playback}

- **Nächstes Video automatisch wiedergeben**: startet das nächste Video automatisch,
  wenn eines endet.
- **Standardqualität**: die Auflösung, in der Videos geöffnet werden.
- **Wiedergabe in hoher Qualität aktivieren**: erlaubt Streams höherer Qualität, wenn
  verfügbar.

Die YouTube-Wiedergabe nutzt in jedem unterstützten Browser den zustandsbehafteten
SABR-Pfad. NicoNico und BiliBili behalten ihre anbieterspezifischen Wiedergabepfade.

## Untertitel {#captions}

Passen Sie das Aussehen der Untertitel an, Größe, Farben und Hintergrund, damit sie
so lesbar bleiben, wie Sie es mögen.

## Sprachen {#languages}

- **Bevorzugte Tonspur**: die Tonsprache, die automatisch gewählt wird, wenn ein Video
  mehrere hat.
- **Originalsprache erzwingen**: den Originalton statt einer synchronisierten Spur
  behalten.

## SponsorBlock {#sponsorblock}

Legen Sie fest, was mit von der Community markierten Abschnitten geschieht:

- **Verhalten**: automatisch **Überspringen**, auf der Leiste **Markieren**, ohne zu
  überspringen, oder **Aus**, um SponsorBlock ganz zu ignorieren.
- **Kategorien**: wählen Sie, welche Arten von Abschnitten zählen (Sponsor,
  Eigenwerbung und mehr), jeweils als Überspringen / Markieren / Ausblenden.
- **Feinere Kontrolle**: Kapitel anzeigen, den aktuellen Abschnitt neben der Zeit
  anzeigen, stummschalten statt überspringen, manuelles Überspringen bei Kennzeichnung
  des ganzen Videos und Nicht-Musik nur bei Musikvideos überspringen.

![SponsorBlock-Kategorien und -Optionen](/screenshot-sponsorblock.png)

## Was Sie sehen {#what-you-see}

Gestalten Sie Ihre Ansichten:

- **Angefangene Videos** auf der Startseite **ausblenden**.
- **Personalisierte Empfehlungen** auf der Startseite **ausblenden**.
- **Den Algorithmus wählen**, der die Startseite aufbaut, wo die Instanz ihn anbietet.
  Siehe [Den eigenen Algorithmus wählen](./algorithm).
- **Die Vorschlagsspalte** auf Wiedergabeseiten **ausblenden**.
- **Shorts ausblenden**: die Navigation entfernen und die Shorts-Seite sperren.
- **Kommentare und Danmaku** ein- oder ausblenden.
- **Standard-Startseite**: auf Startseite, Abonnements oder einer anderen Seite
  beginnen.

![Inhaltsoptionen: was wo erscheint](/screenshot-content-toggles.png)

## Dienst {#service}

Wählen Sie den aktiven Dienst, **YouTube, NicoNico oder BiliBili**, damit Suche und
Stöbern die richtige Quelle ansprechen.

## Über {#about}

Der Abschnitt Über zeigt Version, vollständige Revision und Build-Zeit, die Web-App,
Server, Token und Downloader melden. Jede Komponente wird unabhängig geprüft, sodass
ein nicht erreichbarer interner Dienst die Versionsangaben der anderen nicht verbirgt.
Nutzen Sie nach einer Aktualisierung die Schaltfläche zum Aktualisieren, um die
aktuellen Werte abzufragen.
