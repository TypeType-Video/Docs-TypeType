# Twitch (optionnel)

La prise en charge de Twitch est un service optionnel, publié sous le nom
[TypeType-Live](https://github.com/TypeType-Video/TypeType-Live). Avec lui, les utilisateurs
parcourent les lives, catégories et tags de Twitch, regardent les lives, les rediffusions et les
clips, lisent et écrivent dans le chat, et peuvent lier leur compte Twitch. Les rediffusions gardent
leur position comme n'importe quelle vidéo. Twitch ne voit jamais leur adresse IP, et leur navigateur ne contacte jamais Twitch.

Une stack sans ce service fonctionne exactement comme avant et n'affiche aucune section Twitch.

## Avant de commencer {#requirements}

| Ressource | Quantité |
| --- | --- |
| Mémoire | Environ 128 Mo (`LIVE_MEMORY_LIMIT`) |
| Disque | Environ 10 Mo pour l'image |
| TypeType | 1.18.0 ou plus récent, installé avec l'installeur ou le fichier Compose pris en charge |

Ce qui change sur votre stack quand vous l'ajoutez :

- un nouveau conteneur, `typetype-live` ;
- trois nouveaux secrets dans le volume `typetype_secrets`, créés par `typetype-init` : le secret
  partagé entre Server et Live, la clé qui chiffre les comptes Twitch liés, et la clé qui garde les
  liens de lecture valides après un redémarrage ;
- Server est recréé avec l'adresse du service.

Les commandes de cette page utilisent `$STACK_DIR` pour le dossier de votre stack :

```sh
STACK_DIR=~/typetype-stack
```

## A. Avec l'installeur {#install}

Lancez l'installeur avec `--twitch`, sur une nouvelle instance ou sur une instance existante :

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --twitch
```

Sans `--yes`, l'installeur pose aussi la question. Il écrit `TWITCH_ENABLED=true` dans `.env`, pour que
les mises à jour suivantes gardent Twitch.

## B. À la main {#install-by-hand}

```sh
cd "$STACK_DIR"
COMPOSE_TWITCH_FILE=docker-compose.twitch.yml ./scripts/run-stack-init.sh
docker compose -f docker-compose.yml -f docker-compose.twitch.yml up -d --wait
```

Ajoutez `TWITCH_ENABLED=true` dans `.env` si vous mettez ensuite à jour avec l'installeur.

## Vérifier que ça marche {#check}

Ouvrez l'instance : la barre latérale affiche **Live**. Ouvrez une chaîne en direct et son chat.

```sh
docker compose -f docker-compose.yml -f docker-compose.twitch.yml ps typetype-live
```

Le conteneur doit être `healthy`.

## Lier un compte Twitch {#link-account}

Chaque utilisateur peut lier son propre compte Twitch depuis **Live > Lier un compte Twitch**.
TypeType affiche un code à saisir sur `twitch.tv/activate` depuis n'importe quel appareil connecté à
Twitch. Un compte lié affiche les lives suivis, permet d'écrire dans le chat et de suivre des chaînes,
et lit le chat et les chapitres des rediffusions avec ce compte. Les jetons restent chiffrés dans la
base de données et n'arrivent jamais au navigateur.

## Le retirer {#remove}

Mettez `TWITCH_ENABLED=false` dans `.env`, pour qu'une mise à jour ne l'ajoute pas de nouveau, puis
démarrez la stack sans le fichier Twitch :

```sh
cd "$STACK_DIR"
docker compose -f docker-compose.yml up -d --remove-orphans --wait
```

La section Twitch disparaît. Les comptes liés restent chiffrés dans la base de données.

## Réglages {#settings}

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `TYPETYPE_LIVE_IMAGE` | suit `TYPETYPE_VERSION` | Image de Live |
| `LIVE_MEMORY_LIMIT` | `128m` | Mémoire maximale du conteneur |
| `LIVE_SEGMENT_CACHE` | `48MiB` | Cache partagé des segments vidéo |
| `TWITCH_SERVICE_TIMEOUT_MS` | `15000` | Délai des appels de Server vers Live |

## Votre propre fichier Compose {#own-compose}

Si vous faites tourner TypeType avec votre propre fichier Compose, ajoutez le service `typetype-live` de
[docker-compose.twitch.yml](https://github.com/TypeType-Video/TypeType/blob/main/docker-compose.twitch.yml)
sans publier son port : seuls le serveur et le conteneur web lui parlent. Ses variables sont listées dans le
[README de TypeType-Live](https://github.com/TypeType-Video/TypeType-Live).

### Relier le serveur au service {#server}

| Variable | Rôle |
| --- | --- |
| `TWITCH_SERVICE_URL` | Adresse du service, par exemple `http://typetype-live:8080` |
| `TWITCH_SERVICE_SECRET` | La même valeur que `LIVE_SECRET` |
| `TWITCH_TOKEN_ENCRYPTION_KEY` | Au moins 32 caractères aléatoires ; chiffre les comptes Twitch liés par les utilisateurs |
| `TWITCH_SERVICE_TIMEOUT_MS` | Délai d'attente des requêtes vers le service, `15000` par défaut |

`TWITCH_SERVICE_SECRET` et `TWITCH_TOKEN_ENCRYPTION_KEY` acceptent aussi une variante
`_FILE` qui lit la valeur dans un fichier. Twitch reste désactivé tant que les trois
premières variables ne sont pas toutes définies.

### Le conteneur web {#web}

L'image web envoie déjà `/live/hls/` au service à l'adresse `typetype-live:8080`. Définissez
`TYPETYPE_LIVE_HOST` et `TYPETYPE_LIVE_PORT` sur le conteneur web si le vôtre porte un autre
nom ou un autre port. Seuls les liens vidéo signés passent par cette route ; l'API du service
reste privée derrière le secret partagé.
