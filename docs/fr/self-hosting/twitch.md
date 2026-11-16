# Twitch (optionnel)

La prise en charge de Twitch est un service optionnel, publié sous le nom
[TypeType-Live](https://github.com/TypeType-Video/TypeType-Live). Avec lui, les utilisateurs parcourent
les lives, catégories et tags de Twitch, regardent les lives, les rediffusions et les clips, lisent et
écrivent dans le chat, et peuvent lier leur compte Twitch. Les rediffusions gardent leur position comme
n'importe quelle vidéo. Twitch ne voit jamais leur adresse IP, et leur navigateur ne contacte jamais Twitch.

Une stack sans ce service fonctionne exactement comme avant et n'affiche aucune section Twitch.

## Avant de commencer {#requirements}

| Ressource | Quantité |
| --- | --- |
| Mémoire | Environ 128 Mo |
| Disque | Environ 10 Mo pour l'image |
| TypeType | 1.18.0 ou plus récent |

Ce qui change sur votre stack : un nouveau conteneur, `typetype-live`, et Server est recréé avec l'adresse
du service. Seuls Server et le conteneur web lui parlent ; ne publiez pas son port.

## A. Avec l'installeur {#install}

Lancez l'installeur avec `--twitch`, sur une nouvelle instance ou sur une instance existante :

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --twitch
```

::: tip Pendant la release candidate 1.18.0
Tant que 1.18.0 n'est pas sortie, `--twitch` n'existe que dans l'installeur des release candidates : utilisez
`https://raw.githubusercontent.com/TypeType-Video/TypeType/staging/scripts/install-stack.sh` avec
`bash -s -- --rc --twitch`.
:::

L'installeur crée les secrets, ajoute le service et le garde lors des mises à jour suivantes.

## B. À la main {#install-by-hand}

Pour ceux qui gèrent leur stack eux-mêmes, par exemple avec Dockge.

1. Ajoutez dans `.env` trois secrets aléatoires d'au moins 32 caractères. N'importe quel générateur de mots
   de passe convient ; `openssl rand -hex 32` en affiche un.

   ```dotenv
   TWITCH_SERVICE_SECRET=remplacez-par-une-valeur-aleatoire
   TWITCH_TOKEN_ENCRYPTION_KEY=remplacez-par-une-autre-valeur-aleatoire
   LIVE_SIGNING_KEY=remplacez-par-une-troisieme-valeur-aleatoire
   ```

   Gardez `TWITCH_TOKEN_ENCRYPTION_KEY` une fois que des comptes sont liés : la changer oblige les
   utilisateurs à les lier de nouveau.

2. Ajoutez le service dans `docker-compose.override.yml`, à côté de `docker-compose.yml` (créez le fichier
   si vous n'en avez pas ; l'installeur le garde lors des mises à jour) :

   ```yaml
   services:
     typetype-server:
       environment:
         TWITCH_SERVICE_URL: http://typetype-live:8080
         TWITCH_SERVICE_SECRET: ${TWITCH_SERVICE_SECRET}
         TWITCH_TOKEN_ENCRYPTION_KEY: ${TWITCH_TOKEN_ENCRYPTION_KEY}

     typetype-live:
       image: ghcr.io/typetype-video/typetype-live:${TYPETYPE_VERSION:-latest}
       restart: unless-stopped
       environment:
         LIVE_SECRET: ${TWITCH_SERVICE_SECRET}
         LIVE_SIGNING_KEY: ${LIVE_SIGNING_KEY}
         LIVE_PUBLIC_BASE: /live
       mem_limit: 128m
       read_only: true
       cap_drop: [ALL]
       security_opt: ["no-new-privileges:true"]
   ```

   Pendant la release candidate, la stack suit `TYPETYPE_VERSION=rc`, et Live aussi.

3. Démarrez-le :

   ```sh
   docker compose up -d
   ```

   Le conteneur web envoie déjà les liens vidéo sous `/live/` vers `typetype-live:8080`. Si votre conteneur
   Live porte un autre nom, définissez `TYPETYPE_LIVE_HOST` (et `TYPETYPE_LIVE_PORT`) sur le conteneur web.

## Vérifier que ça marche {#check}

Ouvrez l'instance : la barre latérale affiche **Live**. Ouvrez une chaîne en direct et son chat. Dans le
dossier de la stack, `docker compose ps typetype-live` montre le conteneur `healthy`.

## Lier un compte Twitch {#link-account}

Chaque utilisateur peut lier son propre compte Twitch depuis **Live > Lier un compte Twitch**. TypeType
affiche un code à saisir sur `twitch.tv/activate` depuis n'importe quel appareil connecté à Twitch. Un compte
lié affiche les lives suivis, permet d'écrire dans le chat et de suivre des chaînes, et lit le chat et les
chapitres des rediffusions avec ce compte. Les jetons restent chiffrés dans la base de données et n'arrivent
jamais au navigateur.

## Le retirer {#remove}

Avec l'installeur, mettez `TWITCH_ENABLED=false` dans `.env` et relancez-le. À la main, retirez le bloc
`typetype-live` et les trois lignes `TWITCH_*` de `docker-compose.override.yml`, puis lancez
`docker compose up -d --remove-orphans`. La section Twitch disparaît ; les comptes liés restent chiffrés dans
la base de données.

## Réglages {#settings}

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `TWITCH_SERVICE_URL` | | Adresse du service, telle que Server la joint |
| `TWITCH_SERVICE_SECRET` | | Partagé par Server et Live (`LIVE_SECRET`), 32 caractères ou plus |
| `TWITCH_TOKEN_ENCRYPTION_KEY` | | Chiffre les comptes Twitch liés, 32 caractères ou plus |
| `LIVE_SIGNING_KEY` | aléatoire au démarrage | Garde les liens vidéo valides après un redémarrage, 32 caractères ou plus |
| `LIVE_SEGMENT_CACHE` | `32MiB` | Mémoire des segments vidéo partagés |
| `TWITCH_SERVICE_TIMEOUT_MS` | `15000` | Délai des appels de Server vers Live |

Twitch reste désactivé tant que Server n'a pas les trois premières. Chaque secret accepte aussi une variante
`_FILE` qui lit la valeur dans un fichier.
