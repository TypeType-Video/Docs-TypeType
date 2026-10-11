# Installation manuelle

Cette page met TypeType en route sur votre propre machine **à la main**, avec Docker
Compose. L'installation de base tient en une courte suite de commandes. Tout ce que
font les scripts d'aide du dépôt est expliqué ici : vous n'avez donc jamais à lancer
un script que vous ne comprenez pas.

La stack crée les clés YouTube sensibles pendant son initialisation unique. Une
installation sans script doit générer elle-même le secret RPC de Garage, comme montré
plus bas.

::: tip Recommandé : le script d'installation
Pour la plupart des gens, le script du [Démarrage rapide](./quick-start) est le chemin
le plus simple : il fait tout ce qui est sur cette page pour vous, y compris le
stockage objet pour les téléchargements. Utilisez ce guide manuel si vous voulez tout
maîtriser ou comprendre chaque étape.
:::

## Partie 1 - La mettre en route {#part-1---get-it-running}

### 1. Télécharger les fichiers {#1-download-the-files}

Le fichier Compose, `.env.example` et les scripts de la stack se trouvent dans le
dépôt TypeType. L'image web inclut déjà la configuration nginx prise en charge, et
Compose crée la configuration par défaut de Garage dans un volume nommé. La stack tire
des images déjà construites : il n'y a rien à compiler.

```sh
git clone https://github.com/TypeType-Video/TypeType.git
cd TypeType
```

### 2. Créer votre configuration {#2-create-your-configuration}

Copiez le fichier d'exemple. La plupart des valeurs par défaut conviennent déjà à une
installation locale ; remplacez le texte de remplacement de Garage avec la commande
suivante avant de démarrer les services.

```sh
cp .env.example .env
```

Générez un secret RPC Garage unique de 32 octets en hexadécimal et remplacez son texte
de remplacement :

```sh
GARAGE_RPC_SECRET=$(openssl rand -hex 32)
sed -i "s/^GARAGE_RPC_SECRET=.*/GARAGE_RPC_SECRET=$GARAGE_RPC_SECRET/" .env
```

Cette valeur authentifie le protocole interne du cluster Garage. L'installateur pris
en charge la génère automatiquement ; cette exigence a été mise en évidence par
[l'enquête d'arcoast sur Garage](https://github.com/TypeType-Video/TypeType/discussions/130).

::: tip Les deux valeurs YouTube sont automatiques
`YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN` et `YOUTUBE_SESSION_ENCRYPTION_KEY` sont
remplies **pour vous** au premier démarrage. Un conteneur d'initialisation les génère
et Server les lit dans un volume privé. Laissez ces deux valeurs `SET_ME_...` telles
quelles, sauf si vous gérez les secrets vous-même.
:::

### 3. Initialiser et tout démarrer {#3-bootstrap-and-start-everything}

```sh
./scripts/run-stack-init.sh
docker compose up -d --remove-orphans --wait --wait-timeout 180
```

L'initialisation lance une tâche `typetype-init` de courte durée et la supprime après
un passage réussi. Elle prépare le volume privé des secrets, la configuration de
Garage et la base de Downloader avant le démarrage des services de longue durée.

Vérifiez que les services de longue durée tournent :

```sh
docker compose ps -a
```

Vous devez voir `typetype`, `typetype-server`, `typetype-token`,
`typetype-downloader`, `postgres`, `dragonfly` et `garage`, tous `running` ou
`healthy`. L'initialisation a été lancée avec `--rm` : il est donc normal qu'elle
n'apparaisse pas dans la liste après un passage réussi.

### 4. L'ouvrir et créer le compte administrateur {#4-open-it-and-create-the-admin-account}

Allez sur **`http://localhost:8082`**. Sur une installation neuve, l'application
détecte qu'aucun compte n'existe encore et vous demande d'en créer un. Le **premier
compte devient administrateur** automatiquement, sans étape supplémentaire.

![L'écran d'inscription sur une installation neuve](/screenshot-register.png)

Saisissez un nom, une adresse e-mail et un mot de passe, puis **Créer un compte**.
Vous êtes aussitôt connecté en administrateur et arrivez sur l'écran d'accueil, d'où
vous pouvez importer vos données.

![Connecté en tant qu'administrateur](/screenshot-onboarding.png)

Le déroulé complet, du formulaire vide à l'accueil de l'administrateur :

![Création du compte administrateur](/register-admin.gif)

C'est toute l'installation de base. Pour la mettre sur un vrai domaine en HTTPS, voir
[Proxy inverse et HTTPS](./reverse-proxy).

## Partie 2 - Stockage objet pour les téléchargements {#part-2-object-storage-for-downloads}

La fonction de **téléchargement** a besoin d'un stockage objet compatible S3, que la
stack inclut déjà (Garage). Le [script d'installation](./quick-start) le met en place
automatiquement ; les étapes manuelles sont ci-dessous. La navigation et la lecture
marchent déjà : vous pouvez donc le faire maintenant ou plus tard, mais les
téléchargements restent désactivés tant que ce n'est pas fait.

### 1. Générer une clé d'accès et un secret {#1-generate-an-access-key-and-secret}

La clé d'accès doit commencer par `GK`.

```sh
echo "DOWNLOADER_S3_ACCESS_KEY=GK$(openssl rand -hex 12)"
echo "DOWNLOADER_S3_SECRET_KEY=$(openssl rand -hex 32)"
```

Collez les deux lignes dans `.env`, à la place des textes `SET_ME_ACCESS_KEY` et
`SET_ME_SECRET_KEY`, puis recréez les services concernés :

```sh
docker compose up -d
```

### 2. Provisionner Garage {#2-provision-garage}

Lancez ces commandes une seule fois. Elles attribuent du stockage, créent le bucket,
enregistrent votre clé et lui donnent accès. Garage lit la configuration initialisée
par `GARAGE_CONFIG_FILE` : l'outil en ligne de commande l'utilise donc
automatiquement.

```sh
# alias court pour l'outil Garage dans le conteneur
g() { docker compose exec -T garage /garage "$@"; }

# 1. donner au nœud une disposition de stockage
NODE_ID=$(g node id | head -n1 | cut -d@ -f1)
g layout assign -z dc1 -c 20GB "$NODE_ID"
g layout apply --version 1

# 2. créer le bucket des téléchargements
g bucket create typetype-downloads

# 3. enregistrer la clé de l'étape 1 (utilisez VOS valeurs du .env)
g key import --yes -n typetype-downloader "<DOWNLOADER_S3_ACCESS_KEY>" "<DOWNLOADER_S3_SECRET_KEY>"

# 4. autoriser cette clé à utiliser le bucket
g bucket allow --read --write --owner --key "<DOWNLOADER_S3_ACCESS_KEY>" typetype-downloads
```

::: tip
`--version 1` est correct sur une installation neuve. Si vous relancez l'étape de
disposition plus tard, utilisez un de plus que la version affichée par
`g layout show`.
:::

Les téléchargements fonctionnent maintenant depuis l'interface.

Le navigateur télécharge par la passerelle de Server. Garage reste interne ; vous
n'avez pas besoin d'exposer le port 3900 publiquement ni de configurer un point
d'accès S3 tourné vers le navigateur.

## Partie 3 - Déployer avec Dockge {#deploy-with-dockge}

::: tip Crédit
Cette section est adaptée du compte rendu de
[@BuggyPasta](https://github.com/BuggyPasta), qui a parcouru tout le déroulé de bout
en bout sur une vraie installation Dockge et l'a publié dans
[la suite de l'issue #254](https://github.com/TypeType-Video/TypeType/issues/254#issuecomment-5701725080)
et la [discussion #277](https://github.com/TypeType-Video/TypeType/discussions/277).
Merci.
:::

[Dockge](https://github.com/louislam/dockge) est une interface web pour Docker
Compose. Il peut gérer la stack TypeType à côté de vos autres stacks, mais il ne
remplace pas l'initialisation unique de TypeType. Gardez les noms de services et les
fichiers officiels, pour que les URL internes et les commandes Garage continuent de
correspondre à la stack prise en charge.

### 1. Préparer le dossier de la stack {#1-prepare-the-stack-directory}

Utilisez le dossier de l'hôte monté comme dossier des stacks de Dockge. L'exemple
ci-dessous crée une stack `typetype` sous `$HOME/dockge-stacks` ; choisissez un autre
chemin si votre installation Dockge en utilise un différent.

```sh
mkdir -p "$HOME/dockge-stacks"
git clone --depth 1 https://github.com/TypeType-Video/TypeType.git \
  "$HOME/dockge-stacks/typetype"
cd "$HOME/dockge-stacks/typetype"
cp .env.example .env
mkdir -p .typetype-migration
```

Générez le secret Garage avant de déployer. Gardez la valeur dans `.env` ; ne la
collez jamais dans une issue publique ni dans une capture d'écran de Dockge.

```sh
GARAGE_RPC_SECRET=$(openssl rand -hex 32)
sed -i "s/^GARAGE_RPC_SECRET=.*/GARAGE_RPC_SECRET=$GARAGE_RPC_SECRET/" .env
```

Rafraîchissez Dockge et sélectionnez la stack `typetype`. Modifiez `.env` depuis
Dockge ou depuis le dossier de la stack, et donnez à `ALLOWED_ORIGINS` l'origine
exacte que les utilisateurs ouvriront. Ne collez pas d'anciens exemples Compose de la
communauté par-dessus le fichier actuel ; le fichier Compose pris en charge contient
déjà le déroulé `typetype-init` actuel.

### 2. Lancer l'initialisation unique {#2-run-the-one-time-bootstrap}

Lancez ceci une fois depuis le dossier de la stack, avant de démarrer les services de
l'application :

```sh
./scripts/run-stack-init.sh
```

La commande lance `typetype-init` avec `--rm`. Elle génère les secrets de session
YouTube, crée la configuration de Garage et crée la base de Downloader. On peut la
relancer sans risque lors d'une mise à jour de la stack ; les secrets et la
configuration Garage existants sont conservés.

### 3. Démarrer et gérer la stack dans Dockge {#3-start-and-manage-the-stack-in-dockge}

Une fois l'initialisation terminée avec succès, utilisez l'action **Deploy** ou
**Start** de Dockge. La commande équivalente sur l'hôte est :

```sh
docker compose up -d --remove-orphans --wait --wait-timeout 180
```

Vérifiez la stack depuis Dockge ou avec `docker compose ps`. Le conteneur
d'initialisation est supprimé après un succès : il n'a donc pas à rester en marche.
Gardez les volumes de PostgreSQL, de Garage et des secrets quand vous arrêtez ou
mettez à jour la stack ; n'utilisez jamais `docker compose down -v` pour une mise à
jour normale.

### 4. Mettre à jour la stack sans rien perdre {#4-update-the-stack-without-losing-anything}

Utilisez l'action **Update** de Dockge, qui tire les nouvelles images et redémarre les
conteneurs, puis lancez **System Prune** pour récupérer l'espace disque des anciennes
couches d'images.

::: warning Ne faites jamais de prune pendant que la stack est arrêtée
La disposition de Garage et l'enregistrement du bucket vivent dans les mêmes volumes
nommés que ceux décrits en [Partie 2](#part-2-object-storage-for-downloads), que le
prune ne supprime pas. Mais si jamais vous faites un prune pendant que la stack est
arrêtée, la réparation sûre consiste simplement à relancer les étapes de
provisionnement de Garage de la Partie 2 : cela prend quelques secondes et ne touche
ni à vos comptes, ni à votre historique, ni à vos paramètres.
:::

::: tip L'identifiant du nœud Garage n'est pas stable
Si un jour vous effacez entièrement le volume de métadonnées de Garage (ce n'est pas
une mise à jour normale), l'identifiant de son nœud change et vous devez relancer
l'attribution de la disposition de la
[Partie 2](#part-2-object-storage-for-downloads) avec le nouvel identifiant généré,
pas avec celui d'un passage précédent.
:::


## Configuration nginx ou Garage sur mesure {#custom-nginx-or-garage-configuration}

Les valeurs par défaut prises en charge ne demandent aucun fichier de configuration
sur l'hôte. Pour personnaliser l'un des deux services, gardez les fichiers sur mesure
en dehors des fichiers gérés de la stack et montez-les avec un
`docker-compose.override.yml` :

```yaml
services:
  typetype:
    volumes:
      - ./config/nginx.conf:/etc/nginx/conf.d/default.conf:ro
  garage:
    volumes:
      - ./config/garage.toml:/etc/garage/garage.toml:ro
```

Ne créez `config/nginx.conf` ou `config/garage.toml` que lorsque la topologie par
défaut ne convient pas au déploiement. Compose charge l'override automatiquement.
Validez les montages résolus avant de démarrer :

```sh
docker compose config -q
docker compose config
```

L'installateur conserve `docker-compose.override.yml` et les fichiers qui ne font pas
partie de la stack gérée. Gardez ces fichiers dans vos sauvegardes avec `.env`.

## Commandes de tous les jours {#everyday-commands}

```sh
docker compose pull && docker compose up -d   # mettre à jour vers la dernière version
docker compose logs -f typetype-server        # suivre les journaux du serveur
docker compose down                           # arrêter (vos données sont conservées)
```
