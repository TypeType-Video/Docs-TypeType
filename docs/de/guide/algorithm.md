# Den eigenen Algorithmus wählen

::: warning Experimentell
Die hier beschriebenen Algorithmen haben die Version 0.0.1. Was sie anzeigen, ihre
Einstellungen und ihre Namen können sich noch ändern. Die Seite gibt es nur auf einer
Instanz, deren Betreiber den Empfehlungsdienst installiert und eingeschaltet hat.
:::

TypeType kann Ihre Startseite mit einem Algorithmus aufbauen, den Sie auswählen, lesen
und einstellen. Er sagt, welche Ihrer Daten er liest, jede Reihe der Startseite sagt,
warum sie da ist, und was er über Sie abgeleitet hat, wird Ihnen gezeigt und lässt
sich korrigieren.

Nur die Startseite ändert sich. Suche, Abos und Verlauf bleiben gleich.

Die Namen der Algorithmen erscheinen in der Oberfläche auf Englisch.

## Einschalten {#turn-on}

1. Öffnen Sie **Algorithmus** im Menü.
2. Schalten Sie unter **Startseite per Algorithmus** die Option **Meine Startseite mit
   einem Algorithmus meiner Wahl aufbauen** ein.
3. Wählen Sie unter **Algorithmus der Startseite** einen aus. Wenn Sie unsicher sind,
   öffnen Sie **Welcher Algorithmus passt zu mir?**: Dort stehen sie nebeneinander.
4. Gehen Sie zurück zur Startseite.

Die erste Seite kann einige Sekunden brauchen. Bis dahin sehen Sie die gewohnte
Startseite mit dem Hinweis „Ihre Startseite köchelt“; die neue ersetzt sie von selbst.

Steht **Algorithmus** nicht im Menü, bietet Ihre Instanz ihn nicht an. Auf manchen
Instanzen hat der Administrator ihn für alle eingeschaltet: Die Option ist dann
bereits aktiv, und Sie können sie ausschalten.

Bei einem leeren Konto zeigt die Startseite eine Begrüßungskarte mit zwei
Schaltflächen, **Meine Daten importieren** und **Meinen Algorithmus wählen**. Ein
Algorithmus hat nichts, womit er arbeiten kann, bis Sie Ihre Daten importiert oder
einige Videos angesehen haben.

## Die Algorithmen {#algorithms}

Es gibt keine richtige Antwort, nur verschiedene Arten zu schauen.

| Algorithmus | Was Sie sehen | Gelesene Daten |
| --- | --- | --- |
| Subscriptions | Die neuesten Videos der Kanäle, denen Sie folgen, in der Reihenfolge der Veröffentlichung: heute, die letzten sieben Tage, früher. Über Sie wird nichts abgeleitet. | Abos |
| Discovery | Neue Videos Ihrer Abos, dazu verwandte Videos und Videos zu Ihren Favoriten von Kanälen, denen Sie nicht folgen, und Trends. | Abos und Favoriten. Nie Ihren Verlauf. |
| Signals | Angefangene Videos, mehr von den Erstellern, die Sie gesehen haben, Reihen nach Thema und eine Reihe mit Erstellern, die Sie nie gesehen haben. Er reagiert innerhalb von Minuten auf das, was Sie gerade angesehen haben. | Videoverlauf, Favoriten, Abos |
| Signals, channels | Die neuesten Videos der Ersteller, die Sie am meisten sehen, und Ihrer Abos. | Videoverlauf, Favoriten, Abos |
| Signals, videos | Die Themen dessen, was Sie sehen, egal von wem das Video stammt. | Videoverlauf, Favoriten |
| Signals, mix | Die Ersteller, die Sie sehen, und Videos zu Ihren Themen von beliebigen Erstellern. | Videoverlauf, Favoriten, Abos |

Im Leitfaden trägt jeder Algorithmus drei Anzeigen, von keine bis hoch:

- **Personalisierung**: wie stark die Startseite von dem abhängt, was Sie sehen.
- **Entdeckung**: wie viel Platz für Kanäle bleibt, die Sie noch nicht kennen.
- **Abwechslung**: wie stark sich die Seite von einer Aktualisierung zur nächsten
  ändert.

Jeder Algorithmus liest außerdem, was Sie mit **Nichts für mich** markiert haben, um
es wegzulassen, und alle außer Subscriptions lesen, was zuletzt auf Ihrer Startseite
gezeigt wurde, um es nicht zu wiederholen.

Ein Algorithmus erhält nur die Daten, die er unter **Genutzte Daten** angibt. Einer,
der Ihren Verlauf nicht liest, bekommt ihn nie.

Sie können jederzeit wechseln. Ihre Daten und die Einstellungen jedes Algorithmus
bleiben erhalten.

## Die Seite Algorithmus, Abschnitt für Abschnitt {#page}

### Übersicht {#overview}

Zwei Diagramme: woraus Ihre Startseite besteht (angefangene Videos, kürzlich
angesehen, Abos, Ihre Interessen, neue Ersteller, Trends) und der Anteil jedes Ihrer
Interessen. Jeder Teil führt zu der Stelle, an der er eingestellt wird.

### Genutzte Daten {#data}

Alles, was für Ihr Konto gespeichert ist, nach Kategorie: Videoverlauf,
Shorts-Verlauf, Favoriten, Abos, Suchverlauf und die übrigen. In Blau, was der
aktuelle Algorithmus liest. In Grau, was aufbewahrt wird, ohne für die Startseite
genutzt zu werden.

Öffnen Sie eine Kategorie, um einzustellen:

- **Erfassen**: Aus, es wird nichts Neues in dieser Kategorie gespeichert. Was schon
  da ist, bleibt.
- **Für die Startseite nutzen**: Aus, die Einträge bleiben gespeichert, aber kein
  Algorithmus liest sie.
- **Zurücklesen bis**: wie weit der Algorithmus zurückliest, von einigen Tagen bis
  unbegrenzt. Ältere Einträge bleiben in Ihrem Konto; sie zählen nur nicht mehr für
  die Startseite.
- **Ausschließen** bei einem einzelnen Eintrag: Er bleibt erhalten und wird nie
  gelesen. **Einbeziehen** nimmt ihn wieder auf.

Keine dieser Entscheidungen löscht etwas.

### Was er ableitet {#profile}

Was der Algorithmus aus Ihren Daten abgeleitet hat. Der Abschnitt ist leer, bis Sie
einige Videos angesehen haben.

- **Interessen.** Jedes ist nach den Wörtern benannt, die die Titel seiner Videos
  gemeinsam haben, und zeigt, auf wie vielen Einträgen es beruht, mit einigen Ihrer
  eigenen Videos. Bei jedem:
  - **Anheften**: Es bekommt immer eine Reihe auf der Startseite;
  - **Ausblenden**: Es kommt nicht mehr auf die Startseite;
  - **Nicht berücksichtigen**: Es zählt nicht mehr als Interesse, seine Videos können
    aber weiterhin erscheinen.
- **Hinzufügen** eines Themas in Ihren eigenen Worten, in jeder Sprache
  („Astronomie“, „japanische Küche“). Der Algorithmus sucht dann Videos dazu.
- **Meistgesehene Kanäle.** Wählen Sie einen aus, um zu sehen, worauf er beruht, oder
  damit er nicht mehr zählt.
- **Kürzlich angesehen.** Videos, die Sie vor Kurzem gesehen haben und die die
  Startseite noch lenken, jeweils mit den Minuten, die sie noch zählen. **Vergessen**
  entfernt die Wirkung, ohne Ihren Verlauf zu löschen.

Interessen werden über die Bedeutung der Titel gefunden, in jeder Sprache: Ein Video
mit arabischem Titel und eines mit englischem Titel zum selben Thema landen zusammen.

Eine Änderung gilt ab der nächsten Aktualisierung der Startseite.

### Details {#details}

**Alle Einstellungen** listet jede Einstellung des gewählten Algorithmus auf, nach
Gruppe:

| Gruppe | Was sie einstellt |
| --- | --- |
| Quellen | Wo der Algorithmus nach Kandidaten sucht |
| Gewichtungen | Was beim Ordnen der Kandidaten am meisten zählt |
| Kürzliche Videos | Wie lange ein angesehenes Video die Startseite lenkt |
| Seite | Die Größe der Seite und ihre Aufteilung |
| Entdeckung | Der Platz für das, was Sie noch nicht sehen |
| Zufall | Ob sich die Startseite bei jeder Aktualisierung ändert |

Jede Einstellung zeigt ihren Standardwert und eine Schaltfläche **Wiederherstellen**,
und **Standardwerte wiederherstellen** setzt alle zurück. Ohne Zufall ergeben dieselben
Daten immer dieselbe Seite.

**Aufbau der letzten Startseite** zeigt für die Seite, die Sie gerade gesehen haben:
wie viele Videos gefunden wurden und aus welchen Quellen, wie viele beiseitegelegt
wurden und warum (schon gesehen, blockiert, ausgeblendete Interessen, zu viele von
einem Kanal, ausgeschlossene Daten, Shorts), die Reihen mit dem Grund jeder Reihe und
die besten Bewertungen mit dem, woraus sie entstanden sind. Das stammt aus demselben
Lauf, der die Seite aufgebaut hat.

Steht dort, dass noch keine Startseite von einem Algorithmus aufgebaut wurde, öffnen
Sie zuerst die Startseite.

**Quellcode** führt zum Code des gewählten Algorithmus.

### Meine Rückmeldungen {#opinions}

Die Rückmeldungen, die Sie zur Startseite gegeben haben, jede mit einer Schaltfläche
**Zurücknehmen**. Gespeichert wird nur, was Sie senden wollten, zusammen mit dem
Algorithmus und den Einstellungen, die Sie in dem Moment hatten. Es ist in Ihrem
Export enthalten.

## Auf der Startseite {#home}

- **Reihen und Gründe.** Wählen Sie unter **Darstellung der Startseite** **Wie
  gewohnt** (ein Raster) oder **Nach Kategorien** (eine betitelte Reihe je Grund). Die
  Videos sind in beiden Fällen dieselben.
- **Nichts für mich.** Auf einer Karte nimmt **Nichts für mich** das Video sofort
  weg. Unter **Warum? (wenn Sie möchten)** können Sie **Schon gesehen**, **Nicht
  dieser Kanal**, **Nicht dieses Thema** oder **Anderes** antworten. **Rückgängig**
  holt die Karte zurück. Nach **Nicht dieses Thema** bietet die Karte an, das Thema
  auszublenden; ein ausgeblendetes Thema finden Sie unter **Was er ableitet** wieder.
- **Passt diese Seite für Sie?** Antworten Sie **Gut** oder **Nicht gut** und sagen
  Sie, wenn Sie möchten, was nicht stimmt: zu eintönig, nichts mit Ihnen zu tun, zu
  viele alte Videos, Ihre Kanäle fehlen. Nichts wird gesendet, wenn Sie nicht
  antworten.

## Ausschalten {#turn-off}

Schalten Sie **Meine Startseite mit einem Algorithmus meiner Wahl aufbauen** aus. Sie
haben sofort wieder die gewohnte Startseite. Ihre Auswahl, Korrekturen und
Rückmeldungen bleiben erhalten, falls Sie zurückkommen.

## Quellen {#source-references}

- [Signals-Repository](https://github.com/TypeType-Video/TypeType-Signals)
- [Den Empfehlungsdienst installieren](/de/self-hosting/recommender)
