# Probleme melden

Alle Issues liegen an einem Ort:
**[TypeType-Video/TypeType](https://github.com/TypeType-Video/TypeType/issues)**.

Öffnen Sie alles dort, ob es um die Web-App, die API oder Downloads geht, und wählen
Sie das passende Formular.

Sie müssen nie raten, welcher Teil schuld ist. Stellt sich ein Bericht als
Backend-spezifisch heraus, übernehmen die Maintainer von dort.

Es gibt zwei Wege zu melden:

- Ein Issue **direkt auf GitHub** öffnen, unter dem Link oben.
- Die **Meldefunktion in der App** verwenden, die unten beschrieben ist.

## Aus der App heraus {#from-inside-the-app}

Am schnellsten melden Sie etwas mit der eingebauten Aktion **Einen Fehler melden**,
zum Beispiel in der Aktionsleiste der Wiedergabeseite. Sie öffnet ein kurzes Formular,
und Sie brauchen dafür kein GitHub-Konto.

Sie füllen nur zwei Dinge aus:

- eine **Kategorie**, eine von Player, Tonsprache, Untertitel, Oberfläche oder
  Funktionalität,
- eine kurze **Beschreibung** dessen, was schiefging.

Alles andere sammelt die App für Sie. Der Bericht erfasst automatisch die Seite oder
das Video, auf dem Sie waren, Ihren Browser und Ihre Sprache, den Zustand des Players
und aktuelle Absturzprotokolle oder API-Fehler, alles im Browser gesammelt, während
Sie die App nutzen. Sie müssen nie technische Einzelheiten von Hand heraussuchen.

Beim Absenden wird der Bericht auf Ihrer Instanz gespeichert. Was danach geschieht:

1. Der Bericht wird auf Ihrer Instanz gespeichert.
2. Ein Administrator sieht die eingereichten Berichte im Bereich **Admin** durch.
3. Aus einem Bericht heraus kann ein Administrator ein **vorausgefülltes
   GitHub-Issue** öffnen: Die App baut einen Link `issues/new` für Ihr eingestelltes
   Repository, mit dem Titel, einem vorausgefüllten Text (dem Bericht und seinem
   Kontext), einer Anforderung des Labels `bug` und, wenn `GITHUB_ISSUE_TEMPLATE`
   gesetzt ist, dieser Vorlage. GitHub wendet per URL angeforderte Labels nur an, wenn
   die Person, die den Link öffnet, die Berechtigung hat. Der Generator schwärzt
   Hostnamen in URLs und domainähnlichen Text, den er erkennt, bevor er den Bericht in
   diese URL setzt. Prüfen Sie das Ergebnis immer, bevor Sie es veröffentlichen.

Es ist kein GitHub-Token nötig: Die App erzeugt nur den vorausgefüllten Link; das
Issue entsteht, wenn jemand es auf GitHub absendet.

### Konfiguration {#configuration}

Zwei Variablen bestimmen, wohin Berichte aus der App zeigen (siehe
[Konfiguration](./configuration#bug-reports)):

| Variable | Standard | Bedeutung |
| --- | --- | --- |
| `GITHUB_REPO` | `TypeType-Video/TypeType` | Repository, auf das das vorausgefüllte Issue zielt |
| `GITHUB_ISSUE_TEMPLATE` | `bug_report_backend.md` | Dateiname der Vorlage, der derzeit an den Link angehängt wird |

Um alle Berichte der Nutzer im einen Tracker oben zu halten, lassen Sie `GITHUB_REPO`
auf dem Standardwert. Verwenden Sie stattdessen Ihren eigenen Fork, wenn Sie einen
getrennten Tracker führen.

## Einen Bericht nützlich machen {#make-a-report-useful}

- Sagen Sie, ob Sie auf dem Kanal **main** oder **beta** sind (siehe
  [Beta und main](./beta-and-main)).
- Nennen Sie die Schritte zum Nachstellen, was Sie erwartet haben und was geschehen
  ist.
- Bei Wiedergabeproblemen notieren Sie das Video, den Anbieter (YouTube, NicoNico,
  BiliBili) und die Qualität.
- Sehen Sie in `docker compose logs typetype-server` nach einem Fehler um den
  Zeitpunkt des Vorfalls.
- Fügen Sie die Revisionen der bereitgestellten Komponenten bei, wenn das Problem von
  einer Aktualisierung abhängen kann:

  ```sh
  curl -fsS https://watch.example.com/api/version
  curl -fsS https://watch.example.com/api/version/web
  curl -fsS https://watch.example.com/api/version/server
  curl -fsS https://watch.example.com/api/version/token
  curl -fsS https://watch.example.com/api/version/downloader
  ```

  Ersetzen Sie den Beispiel-Origin und entfernen Sie private Hostnamen, bevor Sie
  etwas veröffentlichen. Diese Endpunkte enthalten Build-Metadaten, keine
  Zugangsdaten.

## Wie Issues geordnet sind {#how-issues-are-organised}

Jedes Issue wird mit Labels einsortiert, damit der Tracker übersichtlich bleibt:

- **Art**, was für ein Bericht es ist: `bug`, `feature request`, `enhancement`,
  `documentation` oder `question`. Die zentralen GitHub-Formulare setzen ihr Label
  automatisch. Der aktuelle Link aus der App fordert nur `bug` an, vorbehaltlich der
  obigen Berechtigungsregel von GitHub.
- **Bereich**, welchen Teil es berührt: `area: frontend`, `area: backend`,
  `area: token` oder `area: downloader`. Die Maintainer ergänzen das bei der Sichtung,
  Sie müssen es also nie tun.
- **Priorität**: `priority: high`, `priority: medium` oder `priority: low`.

In der Praxis betreffen die meisten Berichte **die Web-App und die Wiedergabe**, den
Player, Wiedergabelisten, Untertitel, Importe und die Oberfläche, ein kleinerer Teil
das **Backend** (die Extraktion und die API). Berichte werden gesichtet, und die große
Mehrheit wird behoben und geschlossen; ein klarer Bericht wird also wirklich zu einer
Korrektur.

Berichte, die eine Erklärung oder Diagnose wesentlich verbessern, werden unter
[Quellen aus der Community und Danksagungen](/de/project/community) gewürdigt.

### Möchten Sie beitragen? {#want-to-contribute}

Zwei Labels lohnen einen Blick:

- [`good first issue`](https://github.com/TypeType-Video/TypeType/issues?q=is%3Aopen+label%3A%22good+first+issue%22), gut zugängliche Einstiegspunkte.
- [`help wanted`](https://github.com/TypeType-Video/TypeType/issues?q=is%3Aopen+label%3A%22help+wanted%22), wo eine helfende Hand willkommen ist.
