# Discord Rich Presence

Zeigen Sie als Ihren Discord-Status, was Sie gerade auf TypeType ansehen: Titel, Kanal
und einen Link zurück zum Video. Dafür dient ein kleiner Desktop-Begleiter,
[TypeType RPC](https://github.com/TypeType-Video/TypeType-RPC), der über die lokale
Verbindung mit Discord spricht, derselbe Mechanismus, den Spotify oder ein Spiel
nutzt.

## Was es braucht {#what-it-needs}

- Ein TypeType-Konto. Gäste können keinen Präsenz-Schlüssel erstellen.
- [Discord Desktop](https://discord.com/download) oder ein kompatibler Client wie
  [Vesktop](https://vesktop.dev/), auf demselben Rechner gestartet.
- Die installierte App [TypeType RPC](https://github.com/TypeType-Video/TypeType-RPC).

## Einen Präsenz-Schlüssel erstellen {#create-a-presence-key}

1. Öffnen Sie **Einstellungen**, dann **API**.
2. Geben Sie unter **Präsenz-Zugriff** dem Schlüssel einen Namen, damit Sie ihn später
   wiedererkennen, dann **Schlüssel erstellen**.
3. Kopieren Sie den Schlüssel. Er beginnt mit `ttp1_`, und Sie sehen ihn nur dieses
   eine Mal: TypeType speichert nur seinen Hash.

![Einen Präsenz-Schlüssel erstellen](/screenshot-presence-key-created.png)

Sie können bis zu 10 aktive Schlüssel gleichzeitig haben. Widerrufen Sie einen
jederzeit auf demselben Bildschirm, unabhängig von Ihren Anmeldesitzungen.

## TypeType RPC verbinden {#connect-typetype-rpc}

1. Installieren und öffnen Sie
   [TypeType RPC](https://github.com/TypeType-Video/TypeType-RPC).
2. Klicken Sie auf das Symbol im Infobereich, dann auf **Settings…**.
3. Geben Sie die URL Ihrer Instanz und den gerade erstellten Schlüssel ein, dann
   **Save**.
4. Schalten Sie **Share on Discord** ein.

![Das Einstellungsfenster von TypeType RPC](/screenshot-rpc-settings.png)

Das Teilen wird beim nächsten Öffnen der App automatisch fortgesetzt, die Einrichtung
ist also einmalig.

## Was es sehen kann {#what-it-can-see}

Der Geltungsbereich des Schlüssels ist `presence:read`, nur lesend und eng gefasst:
was gerade läuft, Titel, Kanal und Position, sonst nichts. Er sieht weder Ihren
Verlauf noch Ihre Abonnements, Kontodaten oder Sitzung, und TypeType RPC fragt nur ab,
solange sein eigener Schalter an ist.

## Fehlerbehebung {#troubleshooting}

- **In Discord erscheint nichts**: Rich-Presence-Schaltflächen und die Aktivitätskarte
  sind auf Ihrem *eigenen* Profil unsichtbar. Das ist eine Einschränkung von Discord,
  kein Fehler. Bitten Sie einen Freund nachzusehen, oder sehen Sie sich Ihr Profil von
  einem zweiten Konto aus an.
- **Die App kann sich nicht verbinden**: TypeType RPC spricht über eine lokale
  Verbindung mit Discord, also muss Discord (oder Vesktop) zuerst auf demselben
  Rechner laufen.
