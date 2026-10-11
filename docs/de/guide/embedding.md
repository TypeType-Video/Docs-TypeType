# Eingebetteter Player

TypeType bietet eine eigene Player-Route, um YouTube-Videos ohne den Rest der
Wiedergabeseite einzubetten.

## URL-Format {#url-format}

Verwenden Sie die YouTube-Videokennung nach `/embed/`:

```text
https://your-instance.example/embed/VIDEO_ID
```

Die Kennung ist der 11 Zeichen lange Wert nach `v=` in einer normalen
YouTube-Wiedergabe-URL. Aus `https://www.youtube.com/watch?v=dQw4w9WgXcQ` wird zum
Beispiel `/embed/dQw4w9WgXcQ`.

## Startposition und automatische Wiedergabe {#start-position-and-autoplay}

| Parameter | Wert | Verhalten |
| --- | --- | --- |
| `t` | Sekunden oder eine Dauer | Startposition |
| `start` | Sekunden oder eine Dauer | Alias für `t` |
| `time_continue` | Sekunden oder eine Dauer | Invidious-kompatibler Alias für `t` |
| `autoplay` | `1` | Automatische Wiedergabe anfordern |

Dauern können Stunden, Minuten und Sekunden kombinieren, etwa `1h30m15s`. Sind
mehrere Startparameter vorhanden, verwendet TypeType `t`, dann `start`, dann
`time_continue`. Ungültige oder negative Werte starten am Anfang.

```text
/embed/dQw4w9WgXcQ?t=90
/embed/dQw4w9WgXcQ?start=1m30s
/embed/dQw4w9WgXcQ?time_continue=45&autoplay=1
```

Die automatische Wiedergabe unterliegt weiterhin der Medienrichtlinie des Browsers.
Ein Browser kann eine Nutzeraktion verlangen, bevor Ton startet.

## Ein iframe hinzufügen {#add-an-iframe}

```html
<iframe
  src="https://your-instance.example/embed/dQw4w9WgXcQ?autoplay=1"
  title="TypeType video player"
  allow="autoplay; fullscreen; picture-in-picture"
  allowfullscreen
  loading="lazy"
></iframe>
```

Geben Sie dem iframe in der umgebenden Seite eine ausdrückliche, anpassungsfähige
Größe. Zum Beispiel:

```css
.video-embed {
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 0;
}
```

Fügen Sie dem iframe `class="video-embed"` hinzu, wenn Sie dieses Beispiel verwenden.

### Das iframe prüfen, nicht nur die URL {#verify-the-iframe-not-only-the-url}

`/embed/...` direkt zu öffnen und eine Antwort `200` zu sehen, beweist, dass Route und
Player als Seite der obersten Ebene funktionieren. Es beweist nicht, dass eine andere
Website sie einrahmen darf. Testen Sie die endgültige URL in einem iframe auf einem
anderen Origin.

Ein Reverse-Proxy oder CDN, der `X-Frame-Options: DENY` hinzufügt, blockiert die
Einbettung, obwohl die direkte Seite und alle Medienanfragen funktionieren. Eine
restriktive `frame-ancestors`-Direktive der Content Security Policy kann dasselbe
bewirken. Behalten Sie den Schutz gegen Einrahmen auf normalen TypeType-Seiten bei,
senden Sie aber kein `X-Frame-Options: DENY` auf `/embed/*`. Verwenden Sie auf dieser
Route CSP `frame-ancestors`, wenn Sie einschränken müssen, welche Websites sie
einbetten dürfen.

## Konten, Einstellungen und Gastzugang {#accounts-settings-and-guest-access}

Eine Einbettungs-URL direkt in einem Browser-Tab zu öffnen, kann das aktuelle
TypeType-Konto und die Player-Einstellungen weiterverwenden. In einem iframe ist die
Wiedergabe anonym und liest weder die TypeType-Sitzung noch die Einstellungen der
einbettenden Website.

Die Instanz muss deshalb den Gastzugang für die iframe-Wiedergabe erlauben. Ein
Administrator kann **Gastmodus zulassen** in den Verwaltungseinstellungen von TypeType
einschalten. Ist der Gastzugang abgeschaltet, zeigt die Einbettung einen eigenen
Hinweis mit einem Link zur normalen Wiedergabeseite, statt die Wiedergabe zu
versuchen.

Die Einbettung zeigt außerdem dieselben Zustände für nicht verfügbare, geplante und
nur für Mitglieder bestimmte Videos wie die Wiedergabeseite. Bei vorübergehenden
Ladefehlern gibt es eine Schaltfläche zum erneuten Versuch, wenn das gefahrlos möglich
ist.
