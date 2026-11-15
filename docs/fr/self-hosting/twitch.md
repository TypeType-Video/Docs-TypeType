# Twitch (optionnel)

::: warning Branches de développement uniquement
La prise en charge de Twitch se trouve sur les branches `dev` de TypeType-Server et de
TypeType-Frontend. Elle n'est pas encore dans une version publiée, et la pile centrale ne
l'inclut pas.
:::

La prise en charge de Twitch est un service optionnel, publié sous le nom
[TypeType Live](https://github.com/TypeType-Video/TypeType-Live). Une pile sans ce service
fonctionne exactement comme avant : le serveur répond `404` sur ses routes Twitch et
l'application web masque la section Twitch.

Avec lui, vos utilisateurs regardent les lives, les VOD et les clips Twitch à travers votre
instance. Twitch ne voit jamais leur adresse IP, et leur navigateur ne contacte jamais Twitch.

## Avant de commencer {#requirements}

| Ressource | Quantité |
| --- | --- |
| Mémoire | Plafonnée à 128 Mo, avec `GOMEMLIMIT` à 100 Mio |
| Image | Construite depuis les sources ; aucune image n'est encore publiée |
| Réseau | Accès sortant vers Twitch depuis le service |

## 1. Construire et lancer le service {#service}

```sh
git clone https://github.com/TypeType-Video/TypeType-Live.git
cd TypeType-Live
docker build -t typetype-live:local .
```

Ajoutez-le au fichier Compose de votre pile, sur le même réseau que le serveur et le
conteneur web :

```yaml
  typetype-live:
    image: typetype-live:local
    restart: unless-stopped
    environment:
      LIVE_SECRET: ${LIVE_SECRET}
      LIVE_SIGNING_KEY: ${LIVE_SIGNING_KEY}
      LIVE_PUBLIC_BASE: /live
      LIVE_SEGMENT_CACHE: 48MiB
      GOMEMLIMIT: 100MiB
    read_only: true
    cap_drop: [ALL]
    security_opt:
      - no-new-privileges:true
    pids_limit: 128
    mem_limit: 128m
```

Ne publiez pas son port. Seuls le serveur et le conteneur web lui parlent.

| Variable | Par défaut | Rôle |
| --- | --- | --- |
| `LIVE_SECRET` | obligatoire | Partagée avec le serveur, au moins 32 caractères |
| `LIVE_SIGNING_KEY` | aléatoire au démarrage | Garde les liens vidéo signés valides après un redémarrage, au moins 32 caractères |
| `LIVE_PUBLIC_BASE` | | Préfixe public des liens vidéo, `/live` avec le conteneur web de TypeType |
| `LIVE_SEGMENT_CACHE` | `32MiB` | Mémoire pour les segments vidéo partagés : environ chaînes regardées x taille de segment x 6 |
| `LIVE_ADDR` | `:8080` | Adresse d'écoute |
| `LIVE_LOG_LEVEL` | `info` | Niveau de journalisation |

## 2. Relier le serveur au service {#server}

| Variable | Rôle |
| --- | --- |
| `TWITCH_SERVICE_URL` | Adresse du service, par exemple `http://typetype-live:8080` |
| `TWITCH_SERVICE_SECRET` | La même valeur que `LIVE_SECRET` |
| `TWITCH_TOKEN_ENCRYPTION_KEY` | Au moins 32 caractères aléatoires ; chiffre les comptes Twitch liés par les utilisateurs |
| `TWITCH_SERVICE_TIMEOUT_MS` | Délai d'attente des requêtes vers le service, `15000` par défaut |

`TWITCH_SERVICE_SECRET` et `TWITCH_TOKEN_ENCRYPTION_KEY` acceptent aussi une variante
`_FILE` qui lit la valeur dans un fichier. Twitch reste désactivé tant que les trois
premières variables ne sont pas toutes définies.

## 3. Le conteneur web {#web}

L'image web envoie déjà `/live/hls/` au service à l'adresse `typetype-live:8080`. Définissez
`TYPETYPE_LIVE_HOST` et `TYPETYPE_LIVE_PORT` sur le conteneur web si le vôtre porte un autre
nom ou un autre port. Seuls les liens vidéo signés passent par cette route ; l'API du service
reste privée derrière le secret partagé.

## Ce que vos utilisateurs obtiennent {#features}

- Une section Twitch avec les lives, les catégories et la recherche.
- Les lives, les VOD et les clips lus à travers l'instance.
- Le chat en direct, avec les badges et les emotes.
- La liaison de leur compte Twitch avec un code sur twitch.tv/activate, pour les lives
  suivis, le contenu réservé aux abonnés et l'envoi de messages dans le chat.
