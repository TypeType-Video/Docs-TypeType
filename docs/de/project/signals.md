# Signals, der Empfehlungsdienst

::: warning Experimentell
Signals hat die Version 0.0.1. Sein Vertrag mit Server und seine Algorithmen können
sich noch ändern.
:::

[TypeType Signals](https://github.com/TypeType-Video/TypeType-Signals) ist der optionale Dienst, der die Startseiten-Algorithmen
enthält. Diese Seite erklärt, wie er mit Server zusammenspielt und wie ein Algorithmus
geschrieben wird. Was Nutzer sehen, steht unter
[Den eigenen Algorithmus wählen](/de/guide/algorithm); wie man ihn betreibt, unter
[Empfehlungsdienst](/de/self-hosting/recommender).

## Wer macht was {#roles}

| | TypeType-Server | Signals |
| --- | --- | --- |
| Konten, Sitzungen, Nutzerdaten | Ist dafür zuständig | Hat keine: Eine Anfrage nennt nie einen Nutzer |
| Mit YouTube sprechen | Holt jedes Video, über seine Extraktion und seinen Cache | Tut das nie |
| Blockieren, Familienfilter | Wendet sie auf alles an, was zurückkommt | Kann sie nicht umgehen |
| Videos auswählen und ordnen | Fällt auf seine eingebaute Startseite zurück | Ist für die Algorithmen zuständig |
| Was aufbewahrt wird | Auswahl, Korrekturen, Rückmeldungen, aufgebaute Seiten | Vektoren öffentlicher Videotitel und öffentlicher Videokatalog; zeitweilige Verlaufsmomentaufnahmen unter einem Schlüssel |

Server ist der einzige Aufrufer des Dienstes. Fehlt der Dienst, ist er langsam oder
schlägt er fehl, liefert Server seine eingebaute Startseite aus; eine Startseite geht
also nie kaputt.

## Eine Startseite, Schritt für Schritt {#flow}

```text
browser ── GET /recommendations/home ─▶ Server
Server  ── POST /v1/history (once, when the history changed) ─▶ Signals
Server  ── POST /v1/plan (snapshot) ─▶ Signals
Server  ◀─ the sources to fetch ───── Signals
Server:    fetches those sources, filters the candidates
Server  ── POST /v1/rank (plan id, candidates) ─▶ Signals
Server  ◀─ rows, reasons, trace ───── Signals
Server:    filters the rows again, keeps the page, serves it in slices
browser ◀─ rows ───────────────────── Server
```

1. **Momentaufnahme.** Server beschreibt die Person, ohne sie zu nennen: den
   Algorithmus, den sie gewählt hat, und seine Einstellungen, Uhrzeit und Sprache,
   ihre Abonnements und nur die Datenkategorien, die der Algorithmus angibt und die
   die Person erlaubt. Ein langer Verlauf wird einmal unter einem Schlüssel gesendet
   und danach über diesen Schlüssel benannt.
2. **Plan.** Der Algorithmus antwortet mit den Quellen, die er möchte: dem
   Abonnement-Feed, den Videos neben einem bestimmten Video, den Videos eines Kanals,
   einer Suche, den Trends oder bestimmten Videos zum Fortsetzen. Jede Quelle trägt
   den Grund, aus dem sie verlangt wurde.
3. **Abruf.** Server holt die Quellen über seinen gemeinsamen Cache und zählt jedes
   Video, das er beim Anbieter öffnen muss, gegen die Grenze der Instanz.
4. **Rangfolge.** Der Algorithmus bewertet die Kandidaten und ordnet sie in Reihen an.
   Reihen benennen Videos nur über ihre URL: Der Dienst kann kein Video auf den
   Bildschirm bringen, das Server nicht geholt und gefiltert hat.
5. **Zweiter Filter.** Server wendet Blockierung und Familienfilter erneut auf die
   Reihen an. Ein Fehler in einem Algorithmus kann kein blockiertes Video anzeigen.

Eine Seite, die innerhalb der Frist von Server nicht fertig ist, wird für diesen
Besuch durch die eingebaute Startseite ersetzt und für den nächsten weiter aufgebaut.

## Routen des Dienstes {#routes}

Jede Route außer `/health` verlangt den Header `X-Internal-Token`, das mit Server
geteilte Geheimnis.

| Route | Zweck |
| --- | --- |
| `GET /health` | Erreichbarkeit und Version |
| `GET /version` | Version, Revision und Build-Zeit, wie jeder TypeType-Dienst sie angibt |
| `GET /v1/algorithms` | Die Algorithmen, ihre Texte, die Daten, die jeder liest, und jede Einstellung mit Grenzen und Standardwert. Die Oberfläche wird aus dieser Antwort aufgebaut: Ein neuer Algorithmus braucht keine Änderung am Frontend. |
| `POST /v1/history` | Ein Verlauf und Likes unter einem von Server gewählten Schlüssel, in einem Aufruf oder in Teilen |
| `POST /v1/plan` | Momentaufnahme hinein, abzurufende Quellen heraus |
| `POST /v1/rank` | Kandidaten hinein, Reihen mit Gründen heraus, und die Spur, wenn sie verlangt wird |
| `POST /v1/profile` | Was der Algorithmus aus einer Momentaufnahme ableitet: Interessen, Kanäle, kürzlich Angesehenes |
| `POST /v1/topics` | Für eine Liste von Titeln das Interesse, zu dem jeder gehört |

Ein Plan oder Verlauf, den der Dienst nicht mehr hält, wird mit `409` beantwortet;
Server sendet ihn dann erneut. Die genauen Formen sind die Modelle in [`recommender/contract.py`](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/recommender/contract.py) und in den
Dateien `contract_*.py` daneben.

## Regeln, denen jeder Algorithmus folgt {#principles}

1. **Er sagt, was er liest.** Ein Algorithmus führt die Datenkategorien auf, die er
   verwendet, und die Engine entfernt die übrigen aus der Momentaufnahme, bevor sie
   ihn aufruft. „Liest nie Ihren Verlauf“ ist per Konstruktion wahr.
2. **Jede Einstellung ist offengelegt.** Jedes Gewicht, jede Schwelle, jede Obergrenze
   und jede Abklingzeit wird mit Typ, Grenzen und Standardwert deklariert und dem
   Nutzer gezeigt.
3. **Jede Reihe hat einen Grund.** Eine Reihe trägt die Art des Grundes und den
   Eintrag oder die Ableitung dahinter; jedes Video trägt, was es gebracht hat.
4. **Ableitungen werden gezeigt.** Was abgeleitet wurde (Interessen, Kanäle, kürzlich
   Angesehenes), stammt aus demselben Code, der die Rangfolge bildet, mit der Herkunft
   jeder Ableitung.
5. **Die Entscheidungen des Nutzers haben Vorrang.** Ausgeblendete und angeheftete
   Interessen, ignorierte Kanäle und ausgeschlossene Einträge werden von jedem
   Algorithmus beachtet.
6. **Zufall wird angegeben.** Ein Algorithmus, der zieht, sagt es und nimmt einen
   Startwert: Derselbe Startwert und dieselben Daten ergeben dieselbe Seite.
7. **Ein Codepfad.** Das Profil und die Spur, die ein Nutzer sieht, stammen aus dem
   Lauf, der seine Seite aufgebaut hat. Es gibt keine gesonderte Erklärung.

## Einen Algorithmus schreiben {#write}

Ein Algorithmus ist eine Datei in `recommender/algorithms/`. Er deklariert seinen
Namen und seine Texte, die Daten, die er liest, und seine Einstellungen und setzt zwei
Schritte um: die Quellen planen, dann die Kandidaten in Reihen ordnen. Registrieren
Sie ihn in `recommender/registry.py`.

Beginnen Sie mit [`subscriptions.py`](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/recommender/algorithms/subscriptions.py), dem kleinsten, und lesen Sie zuerst [`CONTRIBUTING.md`](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/CONTRIBUTING.md): Dort steht, wie
der Code geschrieben ist und wie Sie beweisen, dass eine Änderung keine Seite
verändert hat.

```sh
docker compose up -d --build
uv run pytest
```

Der erste Befehl startet den Dienst auf Port `8190` mit eigener Datenbank und eigenem
Cache. Die Tests verwenden einen Ersatz für das Sprachmodell, der Wörter hasht; sie
brauchen also keinen Download.

## Wie Signals einen Verlauf liest {#signals}

Die Signals-Familie (Signals, channels, videos, mix) teilt sich eine Lesart des
Verlaufs:

- **Kanäle.** Ein Kanal zählt nach den verschiedenen Videos, die von ihm gesehen
  wurden, und verliert alle 30 Tage die Hälfte seines Gewichts. Gesehene Minuten
  zählen nicht.
- **Interessen.** Titel von Videos, die zu Ende gesehen wurden, werden mit einem
  mehrsprachigen Satzmodell nach ihrer Bedeutung verglichen und gruppiert, wenn sie im
  Durchschnitt nah genug beieinanderliegen. Eine Gruppe ist nach den Wörtern benannt,
  die ihre Titel gemeinsam haben. Titel, die nichts über ein Thema sagen, bleiben
  außen vor.
- **Kürzlich Angesehenes.** Ein gerade gesehenes Video lenkt die Seite sofort; seine
  Wirkung halbiert sich mit der Zeit und endet nach einigen Stunden.

Shorts werden separat erfasst und beeinflussen normale Videoempfehlungen standardmäßig nicht.
In der Signals-Familie ist **Let Shorts shape the home page** standardmäßig ausgeschaltet; wenn Sie es aktivieren, können Shorts auch normale Videos im Feed beeinflussen.

Das Modell läuft lokal im Dienst, auf der CPU. Es wird einmal beim ersten Start
heruntergeladen, und danach wird nichts an Dritte gesendet.

## Versionen {#versions}

Signals folgt der [semantischen Versionierung](https://semver.org). Ein Patch ändert
keine Seite, eine Minor-Version kann ändern, was Seiten zeigen, oder Einstellungen
hinzufügen, eine Major-Version ändert den Vertrag mit Server. Solange die Nummer mit 0
beginnt, kann sich noch alles ändern. Die Version, die auf einer Instanz läuft, steht
auf deren Seite Über.

Der Dienst steht unter der GNU Affero General Public License, Version 3.

## Quellen {#source-references}

- [Signals-Repository](https://github.com/TypeType-Video/TypeType-Signals)
- [Modelle des Vertrags](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/recommender/contract.py)
- [Integration des Dienstes in Server](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-services/src/main/kotlin/dev/typetype/server/RecommenderServices.kt)
