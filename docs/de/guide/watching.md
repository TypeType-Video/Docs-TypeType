# Ansehen und der Player

Öffnen Sie ein beliebiges Video, um auf die Wiedergabeseite zu gelangen: den Player,
die Details, verwandte Videos und Kommentare.

![Die Wiedergabeseite](/screenshot-watch.png)

---

![Ein Video läuft auf einer selbst gehosteten Instanz](/watch.gif)

## Bedienelemente des Players {#player-controls}

Der Player hat die üblichen Bedienelemente (Wiedergabe und Pause, Spulen, Lautstärke,
Vollbild) und ein Einstellungsmenü, in dem Sie wählen:

- **Qualität**: eine Auflösung wählen oder automatisch anpassen lassen. Ein Standard
  lässt sich in [Einstellungen](./settings#playback) festlegen.
- **Wiedergabegeschwindigkeit**.
- **Untertitel**: eine Spur wählen, wenn das Video welche hat.
- **Tonspur**: die Sprache wechseln, wenn mehrere verfügbar sind. Eine bevorzugte
  Tonsprache lässt sich in [Einstellungen](./settings#languages) festlegen.

## Kinomodus und Bild-in-Bild {#cinema-mode-and-picture-in-picture}

- Der **Kinomodus** verbreitert den Player und dunkelt die Seite ab, für eine
  konzentrierte Ansicht wie im Kino.
- **Bild-in-Bild** löst das Video in ein schwebendes Fenster, damit Sie beim Stöbern
  weiterschauen können, über das native Bild-in-Bild Ihres Browsers.

![Kinomodus: der Player verbreitert, die Seite abgedunkelt](/cinema.gif)

## SponsorBlock {#sponsorblock}

Von der Community markierte Abschnitte (Sponsoren, Eigenwerbung und mehr) werden auf
der Zeitleiste angezeigt und können automatisch **übersprungen oder nur markiert**
werden. Sie bestimmen das Verhalten und welche Kategorien zählen, siehe
[Einstellungen](./settings#sponsorblock).

## Tastenkürzel {#keyboard-shortcuts}

Die üblichen Player-Tasten sind verfügbar:

| Taste | Aktion |
| --- | --- |
| `k` oder `Leertaste` | Wiedergabe / Pause |
| `f` | Vollbild |
| `m` | Stummschalten |
| `c` | Untertitel an / aus |
| `i` | Bild-in-Bild |
| `j` oder `←` | Zurückspulen |
| `l` oder `→` | Vorspulen |
| `↑` / `↓` | Lautstärke höher / niedriger |

Zusätzlich bietet TypeType:

| Taste | Aktion |
| --- | --- |
| `Leertaste` (halten) | Schneller Vorlauf, solange gehalten; loslassen, um fortzusetzen |
| `,` | Ein Bild zurück (bei Pause) |
| `.` | Ein Bild vor (bei Pause) |

## Touch-Gesten {#touch-gestures}

Auf einem Touchscreen:

- **Ziehen Sie nach links oder rechts** über das Video, um darin zu spulen.
- **Halten Sie** das Video **gedrückt**, um schnell vorzuspulen.

## Automatische Wiedergabe {#autoplay}

Ist sie eingeschaltet, startet das nächste Video automatisch, wenn das aktuelle endet.
Schalten Sie sie in [Einstellungen](./settings#playback) um.

## Livestreams {#livestreams}

YouTube-Livestreams nutzen den nativen SABR-Player von TypeType. Der Player folgt
automatisch der Live-Kante, puffert bei kurzen Netzunterbrechungen weiter voraus und
erlaubt das Spulen innerhalb des DVR-Fensters, wenn der Stream eines bietet.

## Eingebetteter Player {#embedded-player}

TypeType bietet eine eigene Route zum Einbetten von YouTube-Videos. Siehe
[Eingebetteter Player](./embedding) für das URL-Format, die Parameter, das
iframe-Markup und die Voraussetzungen für den Gastzugang.

## Shorts {#shorts}

Shorts laufen in einem eigenen vertikalen Player zum Wischen. Sie können die
Shorts-Ansicht in [Einstellungen](./settings#what-you-see) ganz abschalten.
