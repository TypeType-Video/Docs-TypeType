# Proxy inverse et HTTPS

Pour un vrai déploiement, vous placez un proxy inverse devant la stack et la servez en
HTTPS sur votre propre domaine. Vous n'exposez jamais que le conteneur **web**
(`HOST_PORT_WEB`, `8082` par défaut) ; il relaie déjà `/api/` vers le serveur en
interne, y compris les passages en WebSocket, les médias SABR, les téléchargements et
les gros envois.

## Avant de commencer

1. Faites pointer un enregistrement DNS (par exemple `watch.example.com`) vers votre
   serveur.
2. Ajoutez cette origine à `ALLOWED_ORIGINS` dans `.env`, puis appliquez :

   ```sh
   # .env
   ALLOWED_ORIGINS=https://watch.example.com
   ```

   ```sh
   docker compose up -d
   ```

## Option A - Caddy (recommandé)

Caddy obtient et renouvelle les certificats TLS automatiquement. Un `Caddyfile` de
trois lignes suffit :

```text
watch.example.com {
    reverse_proxy localhost:8082
}
```

Caddy transmet d'emblée les WebSockets et les bons en-têtes. C'est tout ce qu'il vous
faut.

## Option B - nginx

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl;
    server_name watch.example.com;

    # ssl_certificate ... (utilisez certbot pour obtenir un certificat)

    client_max_body_size 2g;

    location / {
        proxy_pass http://127.0.0.1:8082;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Utilisez [certbot](https://certbot.eff.org/) pour obtenir et renouveler le certificat.

::: warning Gardez les en-têtes de passage en WebSocket et la taille du corps
L'application utilise des WebSockets et accepte de gros envois (imports Takeout). Si
vous retirez les en-têtes `Upgrade`/`Connection` ou fixez un `client_max_body_size`
petit, des parties de l'application cassent. Les réglages ci-dessus correspondent à ce
qu'attend le conteneur web fourni.
:::

## Option C - Traefik

Ces exemples supposent une installation Traefik existante, avec un point d'entrée
`websecure` à l'écoute sur le port 443 et un
[résolveur de certificats ACME](https://doc.traefik.io/traefik/reference/install-configuration/tls/certificate-resolvers/acme/)
configuré dans la configuration statique de Traefik. Remplacez `YOUR_CERT_RESOLVER`
par le nom de ce résolveur et `watch.example.com` par votre domaine. Traefik utilise
le résolveur pour obtenir et renouveler les certificats TLS ; les extraits ci-dessous
ne le créent pas.

Rattachez Traefik et le service web de TypeType (`typetype`) au même réseau Docker.
Les exemples utilisent un réseau externe existant nommé `proxy` ; remplacez ce nom par
celui de votre réseau Traefik. Gardez aussi le service web sur son réseau `default`
existant, pour qu'il puisse toujours joindre le serveur TypeType.

Pour le fournisseur Docker de Traefik, fusionnez ceci dans votre configuration
Compose :

```yaml
services:
  typetype:
    networks:
      - default
      - proxy
    labels:
      traefik.enable: "true"
      traefik.docker.network: "proxy"
      traefik.http.services.typetype.loadbalancer.server.port: "80"
      traefik.http.routers.typetype.service: "typetype"
      traefik.http.routers.typetype.entrypoints: "websecure"
      traefik.http.routers.typetype.rule: "Host(`watch.example.com`)"
      traefik.http.routers.typetype.tls: "true"
      traefik.http.routers.typetype.tls.certresolver: "YOUR_CERT_RESOLVER"

networks:
  proxy:
    external: true
```

Sinon, gardez les mêmes rattachements réseau et utilisez cette configuration YAML
dynamique avec le fournisseur de fichiers de Traefik à la place des étiquettes :

```yaml
http:
  routers:
    typetype:
      entryPoints:
        - websecure
      rule: 'Host(`watch.example.com`)'
      service: typetype
      tls:
        certResolver: YOUR_CERT_RESOLVER

  services:
    typetype:
      loadBalancer:
        servers:
          - url: http://typetype:80
```

Le conteneur web sert du HTTP simple sur le port 80 ; Traefik termine le HTTPS.
Activez le fournisseur Docker ou le fournisseur de fichiers dans Traefik selon
l'exemple que vous choisissez.

## Connexion distante et WebSockets

La connexion interactive à YouTube commence par une requête HTTP normale, puis ouvre
un WebSocket sous `/api/youtube-session/browser/...`. Le proxy inverse externe comme
la configuration nginx fournie doivent préserver le passage en WebSocket.

Un échec caractéristique ressemble à ceci :

```text
POST /api/youtube-session/browser/start -> 201
GET  /api/youtube-session/browser/<session-id> -> 404
```

Le `201` montre que Server et Token ont créé la session. Le `404` qui suit veut dire
que la connexion du navigateur est arrivée à Ktor comme un GET HTTP simple au lieu
d'un WebSocket. Vérifiez les en-têtes `Upgrade` et `Connection` à chaque couche de
proxy.

L'image web prise en charge inclut cette configuration nginx : les mises à jour
normales la rafraîchissent donc avec l'image. Un montage sur mesure depuis l'hôte
remplace le fichier fourni ; si vous en avez déclaré un dans
`docker-compose.override.yml`, comparez-le à la configuration actuelle du frontend
quand le routage des WebSockets ou de l'API change.

Merci à [arcoast](https://github.com/arcoast), dont le déploiement manuel dans la
[discussion #122](https://github.com/TypeType-Video/TypeType/discussions/122) a montré
qu'un fichier nginx périmé était la limite WebSocket manquante.

## Téléchargements derrière un domaine

La stack prise en charge sert les artefacts par `/api/downloader/...`. Server suit la
redirection interne de Garage et diffuse le résultat : un déploiement normal n'a donc
pas besoin d'un second nom d'hôte public pour Garage.

N'exposez Garage à part que lorsqu'une configuration de Downloader sur mesure et
voulue utilise un point d'accès S3 public. Dans cette topologie, protégez le point
d'accès selon la documentation du stockage objet et gardez les identifiants d'accès
privés.
