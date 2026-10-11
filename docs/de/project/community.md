# Quellen aus der Community und Danksagungen

Die Dokumentation wird gegen den Quellcode geprüft, aber der Quellcode allein zeigt
nicht jeden Fehler bei einer Installation und erklärt nicht, welches Detail einen
Betreiber verwirrt. Berichte aus der Community liefern diesen fehlenden Nachweis.
Diese Seite hält die Personen und Beiträge fest, die die aktuelle Dokumentation
unmittelbar geprägt haben.

## In der Dokumentation genannte Mitwirkende {#contributors-referenced-in-the-documentation}

| Mitwirkende | Bericht oder Diskussion | Verbesserte Dokumentation |
| --- | --- | --- |
| [arcoast](https://github.com/arcoast) | [Remote-Anmeldung bei YouTube, Diskussion #122](https://github.com/TypeType-Video/TypeType/discussions/122) | Proxy-Anforderungen für WebSockets und die Diagnose der veralteten nginx-Datei |
| [arcoast](https://github.com/arcoast) | [Benennung der Datenbankvariablen, Diskussion #123](https://github.com/TypeType-Video/TypeType/discussions/123) | PostgreSQL-Variablen als einzige maßgebliche Quelle auf Stack-Ebene |
| [arcoast](https://github.com/arcoast) | [OIDC-Leitfaden für Authelia und Pocket ID, Diskussion #128](https://github.com/TypeType-Video/TypeType/discussions/128) | Getestete Anbieterbeispiele und Callback-Einstellungen |
| [arcoast](https://github.com/arcoast) | [Garage-RPC-Geheimnis, Diskussion #130](https://github.com/TypeType-Video/TypeType/discussions/130) | Erzeugung eines zufälligen `GARAGE_RPC_SECRET` bei manuellen Installationen |
| [filippobaroni](https://github.com/filippobaroni) | [Alte Wiedergabe und Stack-Migration, Diskussion #133](https://github.com/TypeType-Video/TypeType/discussions/133#discussioncomment-17779201) | Erkennung und Migration von Compose-Dateien, die noch den früheren Image-Namensraum verwenden |
| [hugoghx](https://github.com/hugoghx) | [Umgebung des Token-Containers, Diskussion #156](https://github.com/TypeType-Video/TypeType/discussions/156) | Benennung des Token-Dienstes, Grenze des internen Netzwerks und aktuelle Grenzen der Härtung |
| [hulmgulm](https://github.com/hulmgulm) | [Einrichtung des ersten Administrators, Diskussion #151](https://github.com/TypeType-Video/TypeType/discussions/151) | Zustand der Initialisierung und CORS-Fehlersuche mit exaktem Origin |
| [Toni-Vide](https://github.com/Toni-Vide) | [Unerwartete Abmeldungen, Diskussion #162](https://github.com/TypeType-Video/TypeType/discussions/162) | Fehlersuche bei Zugriffstoken, Erneuerungs-Cookie und Sitzung |
| [nanhoes](https://github.com/nanhoes) | [Download-Ablauf unter iOS, Issue #116](https://github.com/TypeType-Video/TypeType/issues/116) | Weitergabe der Authentifizierung und Prüfung des Artefaktpfads |
| [lelam183](https://github.com/lelam183) | [Verhalten importierter Wiedergabelisten, Issue #135](https://github.com/TypeType-Video/TypeType/issues/135) | Entfernen von Duplikaten beim Import, Zuordnung der Systemlisten und Reparatur der Metadaten im Hintergrund |
| [BuggyPasta](https://github.com/BuggyPasta) | [Anleitung zur Bereitstellung mit Dockge, Diskussion #277](https://github.com/TypeType-Video/TypeType/discussions/277) | Aufbau des Stacks in Dockge, einmalige Initialisierung und Rückmeldungen von Betreibern zur manuellen Einrichtung |
| [hugoghx](https://github.com/hugoghx) | [Livestream-Wiedergabe, Issue #145](https://github.com/TypeType-Video/TypeType/issues/145) | Prüfung der Live-Wiedergabe und des gleitenden Fensters |
| [Priveetee](https://github.com/Priveetee) | [Qualitätswechsel im Livestream, Issue #163](https://github.com/TypeType-Video/TypeType/issues/163) | Begriffe zu Live-Sitzung und Qualitätswechsel im Wiedergabe-Leitfaden |

Danke an alle oben Genannten dafür, dass sie nachvollziehbare Symptome, den Kontext
ihrer Konfiguration und die Ergebnisse ihrer Nachverfolgung veröffentlicht haben. Ihre
Berichte haben den unterstützten Ablauf für alle klarer gemacht, die später an
dieselbe Grenze stoßen.

## Unterstützer des Projekts {#project-supporters}

### Regelmäßiger Sponsor {#recurring-sponsor}

Danke an [@Toastienergy](https://github.com/Toastienergy) für die Unterstützung von
TypeType durch einen regelmäßigen Beitrag über GitHub Sponsors. Er hilft mir, die
Infrastruktur zu tragen und mehr Zeit in die Verbesserung des Projekts zu stecken.

### Einmaliger Spender {#one-time-donor}

Ich danke auch [@filippobaroni](https://github.com/filippobaroni) für die einmalige
Spende über GitHub Sponsors, die geholfen hat, TypeType zu unterstützen.

Wenn Sie TypeType finanziell unterstützen möchten, können Sie das über
[GitHub Sponsors](https://github.com/sponsors/Priveetee) tun.

## Wie Material aus der Community verwendet wird {#how-community-material-is-used}

Eine Diskussion oder ein Issue wird nicht unverändert ins Handbuch übernommen. Bevor
daraus Dokumentation wird:

1. Das aktuell zuständige Repository wird geprüft, um zu bestätigen, dass das
   Verhalten noch besteht.
2. Die zentralen Compose- und nginx-Dateien werden für die unterstützte Installation
   geprüft.
3. Sensible Werte und instanzspezifische Details werden entfernt.
4. Das Ergebnis wird als wiederverwendbare Erklärung oder Diagnose geschrieben.
5. Die ursprünglich beitragende Person und der öffentliche Beitrag werden dort
   verlinkt, wo die Erkenntnis verwendet wird.

Das ist wichtig, weil eine ältere Behelfslösung nach einer Änderung der
Implementierung schädlich werden kann. Die WebSocket-Untersuchung in Diskussion #122
bleibt zum Beispiel nützlich, die unterstützte Lösung besteht aber darin, die aktuelle
mitgelieferte nginx-Konfiguration zu verwenden, statt den gesamten eigenen Stack der
meldenden Person zu kopieren.

## Issues und Diskussionen {#issues-and-discussions}

Alle Berichte aus Nutzersicht werden im TypeType-Repository gebündelt:

- [Issue-Tracker](https://github.com/TypeType-Video/TypeType/issues) für Fehler, Funktionen und Lücken in der Dokumentation.
- [Diskussionen](https://github.com/TypeType-Video/TypeType/discussions) für Fragen von Betreibern, Erkenntnisse aus Installationen,
  Ideen und Konfigurationsbeispiele.

Fügen Sie beim Melden eines Problems die passenden Antworten von `/api/version/*` bei
und entfernen Sie Token, Cookies, Passwörter, interne Hostnamen und private
Instanz-URLs. Die vollständige Prüfliste steht unter
[Probleme melden](/de/self-hosting/reporting-issues).
