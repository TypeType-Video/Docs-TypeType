# Einstellungen

Öffnen Sie **Einstellungen** im Seitenmenü. Die Seite hat elf Bereiche, links
aufgeführt: Wiedergabe, Video, Benutzeroberfläche, Sprachen, Dienste,
Benachrichtigungen, Daten, API, Datenschutz, Gesperrter Inhalt und Über. Die meisten
Einstellungen werden auf Ihrer Instanz gespeichert und folgen Ihrem Konto in jeden
Browser. Design, Sprache der Oberfläche und Player-Farbe bleiben in dem Browser, in
dem Sie sie gewählt haben.

![Der Bereich Wiedergabe der Einstellungsseite](/screenshot-settings.png)

## Wiedergabe {#playback}

- **Automatische Wiedergabe**: spielt das nächste Video automatisch ab.
- **Countdown für automatische Wiedergabe**: die Sekunden, bevor es weitergeht; `0`
  startet das nächste Element einer Wiedergabeliste sofort.
- **Bildschirm für die automatische Wiedergabe der Wiedergabeliste überspringen**:
  springt direkt zum nächsten Element der Liste und behält den Countdown für
  Empfehlungen.
- **Kommende Playlist-Videos ausblenden**: blendet Titel und Vorschaubilder der
  nächsten Elemente aus.
- **„Nur-Ton“ Wiedergabe**: lädt nur den Audiostream, wenn der Dienst einen anbietet.
  Siehe [Nur Ton](./watching#audio-only).
- **Standardqualität**: die Auflösung, in der Videos geöffnet werden.
- **Standard-Wiedergabegeschwindigkeit**: gilt beim Start eines Videos.

Die YouTube-Wiedergabe nutzt in jedem unterstützten Browser den zustandsbehafteten
SABR-Pfad. NicoNico und BiliBili behalten ihre anbieterspezifischen Wiedergabepfade.

## Video und SponsorBlock {#sponsorblock}

Der Bereich **Video** legt fest, was SponsorBlock mit von der Community markierten
Segmenten macht:

- **SponsorBlock Verhalten**: **Überspringen** springt automatisch, **Markieren**
  zeigt Segmente auf der Leiste ohne zu springen, **Deaktiviert** ignoriert
  SponsorBlock.
- **SponsorBlock Kategorien**: wählen Sie **Überspringen**, **Markieren** oder
  **Ausblenden** für jede Segmentart: gesponserte Nachricht, Eigenwerbung,
  Interaktionserinnerung, Intro, Abspann und mehr.
- **Erweiterte Anzeige**: legt eine Mindestdauer fest, zeigt das aktuelle Segment
  neben der Zeit, zeigt Kapitel und Ganzvideo-Labels, überspringt diese Labels von
  Hand, schaltet stumm statt zu springen und überspringt Nicht-Musik nur in
  Musikvideos.

Derselbe Bereich enthält zwei Schalter für die Wiedergabeseite: **Nächstes Video
automatisch wiedergeben**, das mit dem ersten Vorschlag weitermacht, und **Autoplay
beim Öffnen**, das ein Video sofort beim Öffnen startet.

![Verhalten und Kategorien von SponsorBlock](/screenshot-sponsorblock.png)

## Benutzeroberfläche {#what-you-see}

**Hochfahren** legt die **Standardansicht** fest: Startseite, Abonnements, Verlauf,
Wiedergabelisten, Später ansehen oder Favoriten.

**Layout** legt die **Videos pro Zeile**, das **Design** (System, hell oder dunkel),
die **Größe ähnlicher Videos** auf der Wiedergabeseite und die **Player-Farbe** fest.
Die Player-Farbe gilt für die Fortschrittsleiste und die Bedienelemente, bei Video
und bei Nur-Ton-Wiedergabe. Zur Wahl stehen Standard, Weiß, Rot, Pink, Lila, Blau,
Grün und Orange; die Leiste unter den Farbfeldern zeigt das Ergebnis.

![Eine Player-Farbe in Einstellungen > Benutzeroberfläche wählen](/player-color.gif)

**Entdeckungsbereiche** schaltet Teile von TypeType ab:

- **DeArrow Titel und Vorschaubilder**: von der Community geschriebene Titel und
  repräsentative Vorschaubilder für YouTube-Videos.
- **Ansehen fortsetzen** und **Empfehlungen auf der Startseite**: blenden begonnene
  Videos oder persönliche Empfehlungen auf der Startseite aus. Siehe
  [Algorithmus wählen](/de/guide/algorithm) zum Aufbau der Startseite.
- **Ähnliche Videos**: blendet die Vorschlagsspalte auf der Wiedergabeseite aus.
- **Kommentare und danmaku**: lädt keine Kommentare und Lauftext-Kommentare mehr.
- **Shorts-Oberfläche**: blendet Kurzvideos überall und die Shorts-Seite aus.
- **Livestreams**: blendet laufende und geplante Livestreams im Abo-Feed aus.
- **Videos nur für Kanalmitglieder**: blendet Videos aus, die eine bezahlte
  Kanalmitgliedschaft verlangen.
- **Alles ausblenden**: schaltet alle obigen Bereiche auf einmal ab.

![Entdeckungsbereiche in Einstellungen > Benutzeroberfläche](/screenshot-content-toggles.png)

## Sprachen {#languages}

- **Benutzeroberflächensprache**: Englisch, vereinfachtes Chinesisch, Französisch
  oder Deutsch, auf diesem Gerät.
- **Untertitel**: schaltet Untertitel standardmäßig ein; **Untertitelsprache** wählt
  die bevorzugte Spur.
- **Tonsprache**: die Tonspur, die gewählt wird, wenn ein Video mehrere hat.
- **Bevorzuge Originalsprache**: behält immer den Originalton statt einer
  synchronisierten Spur.

## Dienste {#service}

Wählen Sie den Standarddienst, **YouTube, NicoNico oder BiliBili**, damit Suche und
Navigation die richtige Quelle verwenden. Das Dienstmenü oben auf der Seite wechselt
ihn ebenfalls.

## Benachrichtigungen, Daten und API-Schlüssel

- **Benachrichtigungen** schaltet Popups für neue Videos ein oder aus und lässt Sie
  wählen, welche abonnierten Kanäle Sie benachrichtigen. Neue Kanäle sind zunächst
  deaktiviert.
- **Daten** exportiert eine TypeType-Sicherung der gewählten Kategorien, stellt eine
  wieder her und öffnet die [Datenübertragung](/de/self-hosting/importing-data) zu
  anderen Apps. Eine Wiederherstellung ersetzt die in der Sicherung enthaltenen
  Kategorien.
- **API** erstellt und widerruft Schlüssel für externe Apps, etwa
  [Discord Rich Presence](./discord-rich-presence).

## Datenschutz und gesperrter Inhalt

**Datenschutz** steuert die Verlaufsaufzeichnung und löscht Wiedergabeverlauf,
Suchverlauf oder Abonnements. **Gesperrter Inhalt** listet die Kanäle, Videos und
Schlüsselwörter, die Sie ausgeblendet haben. Beides beschreibt
[Datenschutz und Sperren](./privacy).

## Über {#about}

Der Bereich Über zeigt Version, vollständige Revision und Build-Zeit, die von der
Web-App, Server, Token und Downloader gemeldet werden. Jede Komponente wird einzeln
geprüft, sodass ein nicht erreichbarer interner Dienst die Versionsangaben der
anderen nicht verdeckt. Nutzen Sie nach einem Update die Schaltfläche zum
Aktualisieren, um die aktuellen Werte abzufragen.
