# Beta et main

TypeType est publié sur deux canaux, et vous pouvez les faire tourner côte à côte sur
le même hôte.

| Canal | Branche | Images | Ports par défaut |
| --- | --- | --- | --- |
| **main** (stable) | `main` | `ghcr.io/typetype-video/typetype:latest`, `...-server:latest`, ... | web `8082`, serveur `8080`, token `8081`, S3 `3900` |
| **beta** | `dev` | `ghcr.io/typetype-video/typetype-beta:latest`, `...-server-beta:latest`, ... | web `18082`, serveur `18080`, téléchargeur `19093`, token `18081`, S3 `3900` |

La CI construit les images automatiquement : un push sur `main` met à jour les images
`:latest`, un push sur `dev` met à jour les images `-beta`. **main est donc la version
stable** et **beta l'aperçu de ce qui arrive**.

Les dépôts, les épinglages de sous-modules, les notifications d'images et les
déploiements sont des parties distinctes du chemin de publication. Lisez
[Branches et versions](/fr/project/releases) quand vous avez besoin de la provenance
exacte d'un code source ou d'une image.

## Quand utiliser la beta {#when-to-use-beta}

- Pour essayer les fonctions à venir avant qu'elles n'atteignent la version stable.
- Pour reproduire ou confirmer un bug sur la dernière construction de `dev` avant de
  le signaler.

La beta peut casser ou changer sans préavis : gardez vos vraies données sur le canal
main.

## Faire tourner la beta à côté de main {#run-beta-alongside-main}

La stack beta est définie dans `docker-compose.dev.yml`. Lancée depuis le même dossier
de travail, elle lit le même `.env`, identifiants et réglages de base compris, mais un
nom de projet Compose différent lui donne des conteneurs, des réseaux et des volumes
de données nommés séparés. Cela n'isole pas les ports de l'hôte : le port Garage par
défaut de la beta livrée est aussi `3900`, donc une installation côte à côte manuelle
doit le changer.

### Une commande (recommandé) {#one-command-recommended}

Le script d'installation de la branche beta peut monter la stack beta pour vous. Il
utilise la construction `dev` : récupérez-le donc depuis `dev` et passez `--beta` :

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/dev/scripts/install-stack.sh | bash -s -- --beta
```

Cela crée `~/typetype-beta-stack`, ne récupère que `docker-compose.dev.yml` et ses
fichiers associés, choisit des ports `*_BETA` libres quand ceux par défaut sont pris,
tire les images beta, démarre cette stack et initialise Garage. Il est interactif par
défaut ; ajoutez `--yes` pour passer les questions, ou `--download-only` pour récupérer
les fichiers sans démarrer Docker.

### À la main {#manually}

Avant de démarrer la beta à côté de main, donnez à Garage un port libre sur l'hôte et
autorisez l'origine web de la beta. Pour les valeurs par défaut livrées :

```dotenv
HOST_PORT_GARAGE_S3_BETA=13900
ALLOWED_ORIGINS=http://localhost:8082,http://127.0.0.1:8082,http://localhost:18082,http://127.0.0.1:18082
```

Gardez les origines publiques déjà présentes dans `ALLOWED_ORIGINS`.

```sh
docker compose -f docker-compose.dev.yml -p typetype-beta up -d
```

- main continue de servir sur `http://localhost:8082`,
- la beta sert sur `http://localhost:18082`.

Gérez la stack beta avec les mêmes options `-f`/`-p` :

```sh
docker compose -f docker-compose.dev.yml -p typetype-beta ps
docker compose -f docker-compose.dev.yml -p typetype-beta pull
docker compose -f docker-compose.dev.yml -p typetype-beta down
```

## Mettre à jour un canal {#update-a-channel}

```sh
# main
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --yes

# beta
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/dev/scripts/install-stack.sh | bash -s -- --beta --yes
```

Relancer l'installateur garde le `.env`, les ports et les volumes de données existants
du canal, tout en rafraîchissant les fichiers de la stack et les images.

::: tip Ports déjà utilisés
L'installateur choisit des ports libres. Pour un lancement manuel, changez chaque
valeur `HOST_PORT_*_BETA` en conflit dans `.env` avant de démarrer la stack beta. En
particulier, la stable et la beta sont toutes deux livrées avec le port Garage `3900`
par défaut. Voir [Configuration](./configuration#ports).
:::
