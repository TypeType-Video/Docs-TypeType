# Authentifizierung (OIDC)

Standardmäßig verwendet TypeType lokale Konten (E-Mail-Adresse und Passwort). Sie
können außerdem einen **OpenID-Connect**-Anbieter wie Authentik, Keycloak, Authelia
oder Pocket ID anbinden, damit sich Nutzer per Single Sign-on anmelden.

Das ist eine Einrichtung auf Instanzebene. Die Nutzersicht steht unter
[Anmelden](/de/guide/accounts#single-sign-on-oidc).

## Einen Anbieter anbinden {#connect-a-provider}

OIDC ist aktiv, sobald Aussteller, Client-ID und Client-Geheimnis auf dem
**API-Server** (`typetype-server`) gesetzt sind. Die stabile Basis-Compose-Datei
reicht OIDC-Variablen aus `.env` nicht weiter; legen Sie daher daneben eine
`docker-compose.override.yml` an:

```yaml
services:
  typetype-server:
    environment:
      OIDC_ISSUER: ${OIDC_ISSUER}
      OIDC_CLIENT_ID: ${OIDC_CLIENT_ID}
      OIDC_CLIENT_SECRET: ${OIDC_CLIENT_SECRET}
      OIDC_PROVIDER_NAME: ${OIDC_PROVIDER_NAME:-OIDC}
      OIDC_SCOPES: ${OIDC_SCOPES:-openid email profile}
```

Tragen Sie dann die Werte in `.env` ein:

```dotenv
OIDC_ISSUER=https://identity.example.com
OIDC_CLIENT_ID=replace-with-client-id
OIDC_CLIENT_SECRET=replace-with-client-secret
OIDC_PROVIDER_NAME="Company login"
```

Server unterstützt diese Variablen:

| Variable | Erforderlich | Standard | Was es ist |
| --- | --- | --- | --- |
| `OIDC_ISSUER` | ja | - | Die Aussteller-URL Ihres Anbieters (z. B. `https://id.example.com`). `OIDC_ISSUER_URL` funktioniert ebenfalls. |
| `OIDC_CLIENT_ID` | ja | - | Die Client-ID Ihres Anbieters |
| `OIDC_CLIENT_SECRET` | ja | - | Das Client-Geheimnis Ihres Anbieters |
| `OIDC_DISCOVERY_URL` | nein | `<issuer>/.well-known/openid-configuration` | Nur ändern, wenn die Discovery woanders liegt |
| `OIDC_SCOPES` | nein | `openid email profile` | Angeforderte Scopes |
| `OIDC_PROVIDER_NAME` | nein | `OIDC` | Name auf der Anmeldeschaltfläche |

Sind sie gesetzt, erscheint auf der Anmeldeseite eine Schaltfläche zum Anmelden mit
dem Namen aus `OIDC_PROVIDER_NAME`. Wenden Sie das Override mit
`docker compose up -d --force-recreate typetype-server` an.

## Redirect-URI {#redirect-uri}

Registrieren Sie diese Callback-URLs bei Ihrem Anbieter:

```text
https://<your-domain>/auth/oidc/callback
dev.typetype.android://oidc/callback
```

Verwenden Sie Ihre echte Domain (oder `http://localhost:8082/auth/oidc/callback` für
einen lokalen Test).

Der Callback gehört zur Route des Frontends, nicht zu `/api`, und muss genau mit der
Konfiguration des Anbieters übereinstimmen.

## Getestete Anbieterbeispiele {#tested-provider-examples}

Das Community-Mitglied [arcoast](https://github.com/arcoast) hat sowohl Authelia als
auch Pocket ID getestet und die funktionierenden Einstellungen auf Anbieterseite in
[Diskussion #128](https://github.com/TypeType-Video/TypeType/discussions/128) veröffentlicht.

### Pocket ID {#pocket-id}

Legen Sie einen vertraulichen Client an mit:

| Einstellung in Pocket ID | Wert |
| --- | --- |
| Callback URL | `https://watch.example.com/auth/oidc/callback` `dev.typetype.android://oidc/callback` |
| Client launch URL | `https://watch.example.com/` |
| Public client | aus |
| Requires re-authentication | aus |
| PKCE | aus |
| Logout callback | leer |

Kopieren Sie die von Pocket ID erzeugte Client-ID und das Geheimnis in die obigen
TypeType-Variablen und verwenden Sie die Basis-URL von Pocket ID als `OIDC_ISSUER`.

### Authelia {#authelia}

Legen Sie einen vertraulichen Authelia-Client an, mit derselben Callback-URL, den
Scopes `openid`, `profile` und `email` und der Authentifizierung `client_secret_post`
am Token-Endpunkt. Tragen Sie den zufälligen Wert des Client-Geheimnisses in
`OIDC_CLIENT_SECRET` von TypeType ein; konfigurieren Sie seinen Hash als
Client-Geheimnis in Authelia gemäß der aktuellen OIDC-Dokumentation von Authelia.

Die Konfigurationsformate der Anbieter können sich ändern. Nutzen Sie Diskussion #128
als mit TypeType getestete Referenz und die aktuelle Dokumentation des Anbieters für
das genaue Schema.

## Lebensdauer der Sitzung {#session-lifetime}

Nach einer lokalen oder OIDC-Anmeldung gilt das Zugriffstoken eine Stunde. Der Browser
erhält außerdem ein rotierendes Erneuerungs-Cookie, der normale Ablauf des
Zugriffstokens sollte also unbemerkt bleiben. Die Erneuerungssitzung gilt
standardmäßig 30 Tage. Setzen Sie `AUTH_SESSION_TTL_DAYS` in `.env`, um einen Wert von
1 bis 365 Tagen zu wählen:

```dotenv
AUTH_SESSION_TTL_DAYS=90
```

Diese Dauer gilt für neu ausgestellte und erneuerte Sitzungen. Vorhandene
Datenbankzeilen behalten ihren aktuellen Ablauf bis zur nächsten erfolgreichen
Erneuerung oder Anmeldung.

Das Erneuerungs-Cookie ist `HttpOnly`, `Secure` und `SameSite=None`. Eine öffentliche
Installation braucht daher HTTPS, das richtige `ALLOWED_ORIGINS` und einen Proxy, der
Anfragen mit Zugangsdaten unverändert lässt. Siehe
[Unerwartete Abmeldungen](./troubleshooting#unexpected-sign-outs), wenn ein Nutzer
abgemeldet wird, während er aktiv ist.

Für ein vertrauenswürdiges lokales Netzwerk, das kein HTTPS verwenden kann, lässt sich
mit einer ausdrücklichen Kompatibilitätsoption das Erneuerungs-Cookie ohne `Secure`
und mit `SameSite=Lax` ausstellen:

```dotenv
AUTH_ALLOW_INSECURE_COOKIES=true
```

::: danger
Schalten Sie diese Option nicht in einem öffentlichen oder nicht vertrauenswürdigen
Netzwerk ein. Erneuerungs-Cookies der Konten können über unverschlüsseltes HTTP
übertragen werden. HTTPS bleibt der unterstützte Standard.
:::

Erstellen Sie Server neu, nachdem Sie eine der beiden Variablen geändert haben:

```sh
docker compose up -d --force-recreate typetype-server
```

Diese Erklärung geht auf das Verhalten zurück, nach dem
[Toni-Vide in Diskussion #162](https://github.com/TypeType-Video/TypeType/discussions/162) gefragt hat und das im aktuellen
Authentifizierungscode überprüft wurde.

## Optionen für Administratoren {#admin-options}

Zwei zugehörige Optionen liegen im Bereich **Admin**, nicht in der Umgebung:

- **Lokale Anmeldung abschalten**: Single Sign-on wird zum einzigen Weg hinein, sodass
  niemand E-Mail-Adresse und Passwort verwenden kann.
- **Automatisch zum Anbieter weiterleiten**: die Anmeldeseite ganz überspringen und
  Nutzer direkt zu Ihrem Anbieter schicken.

::: warning
Melden Sie sich einmal mit OIDC an und vergewissern Sie sich, dass es funktioniert,
bevor Sie die lokale Anmeldung abschalten. Sonst können Sie sich aus der Instanz
aussperren.
:::
