# Anmelden

Ihre Abonnements, Wiedergabelisten, Ihr Verlauf und Ihre Einstellungen gehören zu
Ihrem Konto auf der Instanz.

## Lokales Konto {#local-account}

Erstellen Sie ein Konto mit Name, E-Mail-Adresse und Passwort und melden Sie sich an.
Auf einer ganz neuen Instanz wird das **erste Konto zum Administrator** (siehe
[Schnellstart](/de/self-hosting/quick-start#create-the-admin-account)). Wenn Sie Ihr
Passwort vergessen haben, nutzen Sie die Zurücksetzung auf der Anmeldeseite.

![Die Anmeldeseite](/screenshot-login.png)

Der Browser erneuert die Kontositzung automatisch. Das kurzlebige Zugriffstoken läuft
nach einer Stunde ab, die Erneuerungssitzung hält 30 Tage. Wenn Sie abgemeldet werden,
während Sie die Seite aktiv nutzen, ist das kein normales Zeitlimit wegen Inaktivität;
bitten Sie den Betreiber der Instanz,
[Unerwartete Abmeldungen](/de/self-hosting/troubleshooting#unexpected-sign-outs) zu
prüfen.

## Single Sign-on (OIDC) {#single-sign-on-oidc}

Wenn Ihre Instanz es eingerichtet hat, zeigt die Anmeldeseite eine Schaltfläche zum
Anmelden mit Ihrem Identitätsanbieter (Google, Authentik, Keycloak und so weiter). Ein
Klick meldet Sie an, ohne ein eigenes Passwort verwalten zu müssen.

Je nachdem, wie der Administrator es eingerichtet hat:

- kann die Seite **direkt zu Ihrem Anbieter weiterleiten** (ganz ohne Anmeldebildschirm),
- und **lokale Konten können abgeschaltet sein**, sodass Single Sign-on der einzige
  Weg hinein ist.

Die Einrichtung liegt beim Administrator, siehe
[Authentifizierung (OIDC)](/de/self-hosting/authentication).

## YouTube verbinden {#connect-youtube}

Öffentliche YouTube-Videos laufen ohne YouTube-Konto. Wenn YouTube ein Video ohne
Anmeldung verweigert, etwa ein altersbeschränktes, kann TypeType es mit einem
verbundenen YouTube-Konto abspielen. Die Wiedergabeseite verweist Sie dann auf
**Anmeldung**.

1. Öffnen Sie **Anmeldung** im Seitenmenü und wählen Sie **Mit YouTube verbinden**.
2. TypeType zeigt einen Code. Öffnen Sie `google.com/device` auf einem beliebigen
   Gerät und geben Sie ihn ein.
3. Wählen Sie das YouTube-Konto und erlauben Sie den Zugriff. Der Status wechselt auf
   verbunden.

Verwenden Sie ein zweites YouTube-Konto und geben Sie den Code zügig ein: Er läuft
nach einigen Minuten ab. Die YouTube-Sitzung bleibt verschlüsselt auf dem Server und
wird nie an die Webseite gesendet. **Trennen** entfernt sie. Akzeptiert YouTube die
Sitzung nicht mehr, fordert die Wiedergabeseite Sie auf, sich erneut zu verbinden.

![Die YouTube-Anmeldeseite mit der Schaltfläche Mit YouTube verbinden](/screenshot-youtube-session.png)

Der Reiter **BiliBili** oben auf derselben Seite verbindet ein BiliBili-Konto.

## Ihr Profil {#your-profile}

In Ihrem Profil verwalten Sie Ihre Kontodaten. Administratoren haben außerdem einen
Bereich **Admin**, um Fehlerberichte zu prüfen und die Instanz zu verwalten.
