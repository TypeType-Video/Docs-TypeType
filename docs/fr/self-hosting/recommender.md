# Service de recommandations (expérimental)

::: warning Expérimental
Le service de recommandations est en version 0.0.1. Ses algorithmes, ses réglages et
ses besoins en ressources peuvent encore changer d'une mise à jour à l'autre.
:::

Le service de recommandations est optionnel. Il est publié sous le nom
[TypeType Signals](https://github.com/TypeType-Video/TypeType-Signals). Il permet à
chaque utilisateur de construire son accueil avec un algorithme qu'il choisit et
règle. Voir [Choisir son algorithme](/fr/guide/algorithm) pour ce que les utilisateurs
obtiennent.

Une stack sans lui se comporte exactement comme avant et n'affiche aucune option. Avec
lui, trois interrupteurs restent dans trois mains différentes :

1. vous installez le service ;
2. l'administrateur l'active pour l'instance ;
3. chaque utilisateur l'active pour lui-même.

## Avant de commencer {#requirements}

| Ressource | Quantité | Comment vérifier |
| --- | --- | --- |
| Mémoire | Environ 1 Go au repos, plafonnée à 2 Go par défaut (`RECOMMENDER_MEMORY_LIMIT`) | `free -h`, colonne `available` |
| Disque | Environ 550 Mo pour le modèle de langue et environ 330 Mo pour l'image | `df -h /var/lib/docker` |
| Réseau | Un accès à Internet au premier démarrage, pour télécharger le modèle depuis Hugging Face. Le service ne parle jamais à YouTube. | |
| TypeType | Une stack installée avec l'installateur ou le fichier Compose pris en charge | `docker compose ps` dans le dossier de la stack |

Ce qui change sur votre stack quand vous l'ajoutez :

- un nouveau conteneur, `typetype-recommender` ;
- un nouveau volume, `recommender_models`, pour le modèle ;
- une nouvelle base, `typetype_recommender`, dans le PostgreSQL que vous avez déjà ;
- le service `postgres` passe de `postgres:17` à `pgvector/pgvector:pg17`, le même
  PostgreSQL 17 avec l'extension `pgvector`, sur le même volume de données. PostgreSQL
  redémarre une fois : l'instance est indisponible quelques secondes ;
- Server est recréé avec l'adresse du service.

Vos données existantes ne sont ni migrées ni réécrites. Faites quand même une
sauvegarde de la base avant, comme avant tout changement de la stack : voir
[Maintenance](/self-hosting/maintenance#backups).

Les commandes de cette page utilisent `$STACK_DIR` pour le dossier où se trouve votre
stack. Définissez-la une fois dans votre terminal. `~/typetype-stack` n'est que la
valeur par défaut de l'installateur : mettez le dossier que vous avez choisi, quel
qu'il soit. Voir [Choisir le dossier](/self-hosting/quick-start#stack-directory).

```sh
STACK_DIR=~/typetype-stack
```

Choisissez l'une des trois façons ci-dessous.

## A. Nouvelle instance, avec l'installateur {#install-new}

1. Lancez l'installateur avec le service de recommandations :

   ```sh
   curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --recommender
   ```

   Sans `--recommender`, l'installateur pose la question, et répond non si vous
   appuyez simplement sur Entrée :

   ```text
   [install] Optional: the recommender (experimental) lets each user pick the algorithm of their home page.
   [install] It needs about 2 GB of memory and 1 GB of disk, and downloads a language model on first start.
   Add the experimental recommender? [y/N]:
   ```

2. L'installateur confirme le choix, puis demande avant de démarrer quoi que ce soit :

   ```text
   [install] Recommender (experimental) added to the stack.
   [install] Validating the resolved Compose stack...
   Proceed with Docker pull + startup in <votre dossier de stack>? [y/N]:
   ```

   Répondez `y`.

3. Attendez. Le premier démarrage télécharge l'image puis le modèle. L'installateur
   attend jusqu'à 15 minutes que tous les services soient en bonne santé, au lieu des
   3 minutes habituelles. Il se termine par :

   ```text
   Done. Open http://localhost:8082
   ```

4. Passez à [Vérifier qu'il tourne](#verify).

L'installateur a mis `RECOMMENDER_ENABLED=true` dans `.env` : l'option est donc déjà
proposée sur l'instance.

## B. Instance existante, avec l'installateur {#install-existing}

Relancez l'installateur avec le dossier de votre stack. Il sauvegarde les fichiers
qu'il gère, conserve votre `.env` et votre `docker-compose.override.yml`, et ajoute le
service de recommandations.

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --recommender --dir "$STACK_DIR"
```

Attendez-vous à quelques secondes d'indisponibilité pendant que PostgreSQL et Server
redémarrent, puis passez à [Vérifier qu'il tourne](#verify).

## C. Instance existante, à la main {#manual}

À utiliser si vous gérez la stack vous-même, par exemple avec Dockge.

1. Allez dans le dossier de la stack et vérifiez que le fichier du service est là :

   ```sh
   cd "$STACK_DIR"
   ls docker-compose.recommender.yml
   ```

   S'il manque, vos fichiers de stack sont plus anciens que le service. Récupérez-le :

   ```sh
   curl -fsSLO https://raw.githubusercontent.com/TypeType-Video/TypeType/main/docker-compose.recommender.yml
   ```

2. Dites à la stack de le proposer. Dans `.env`, mettez :

   ```dotenv
   RECOMMENDER_ENABLED=true
   ```

   C'est aussi cette ligne qui fait que l'installateur garde le service lors d'une
   mise à jour ultérieure.

3. Créez la base et le secret partagé :

   ```sh
   COMPOSE_RECOMMENDER_FILE=docker-compose.recommender.yml ./scripts/run-stack-init.sh
   ```

   La sortie se termine par :

   ```text
   CREATE DATABASE
   CREATE EXTENSION
   ```

   Au deuxième passage, `CREATE DATABASE` est absent et la ligne de l'extension
   signale qu'elle existe déjà. Les deux cas sont normaux.

4. Démarrez le service et recréez Server :

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml up -d --wait --wait-timeout 900
   ```

   Sur un hôte ARM64, nommez aussi le fichier ARM64, comme vous le faites déjà :
   `-f docker-compose.yml -f docker-compose.arm64.yml -f docker-compose.recommender.yml`.

5. Passez à [Vérifier qu'il tourne](#verify).

::: warning Nommez les deux fichiers désormais
Chaque commande `docker compose` de cette stack doit maintenant nommer aussi
`docker-compose.recommender.yml`. Une commande qui ne nomme que `docker-compose.yml`
avec `--remove-orphans` supprime le service de recommandations.
:::

## Vérifier qu'il tourne {#verify}

Lancez ces commandes depuis le dossier de la stack. Chacune nomme les deux fichiers
Compose, quelle que soit la façon dont vous avez installé : `docker compose` tout
seul ne connaît que les services de `docker-compose.yml`. Sur un hôte ARM64, ajoutez
`-f docker-compose.arm64.yml` entre les deux.

```sh
cd "$STACK_DIR"
```

1. Le conteneur est en bonne santé :

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml ps typetype-recommender
   ```

   La colonne `STATUS` doit afficher `Up ... (healthy)`. `(health: starting)` veut
   dire que le modèle est encore en cours de téléchargement ou de chargement.

2. Son journal montre un démarrage complet :

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml logs typetype-recommender
   ```

   ```text
   INFO:     Started server process [1]
   INFO:     Waiting for application startup.
   Warning: You are sending unauthenticated requests to the HF Hub. Please set a HF_TOKEN to enable higher rate limits and faster downloads.
   INFO:     Application startup complete.
   INFO:     Uvicorn running on http://0.0.0.0:8190 (Press CTRL+C to quit)
   ```

   L'avertissement sur le HF Hub est attendu : le modèle est public et n'a besoin
   d'aucun jeton. La pause avant `Application startup complete`, c'est le
   téléchargement.

3. Server le joint :

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml exec -T typetype-server wget -qO- http://127.0.0.1:8080/version/recommender
   ```

   ```json
   {"service":"recommender","version":"0.0.1","revision":"...","shortRevision":"...","buildTime":"..."}
   ```

   Une réponse vide ou une erreur veut dire que Server ne voit pas le service : voir
   [Dépannage](#troubleshooting).

4. L'instance l'annonce :

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml exec -T typetype-server wget -qO- http://127.0.0.1:8080/instance
   ```

   La réponse contient :

   ```json
   "recommender":{"installed":true,"enabled":true,"experimental":true}
   ```

   `installed` est vrai dès que Server connaît le service. `enabled` est
   l'interrupteur de l'instance, décrit juste après.

5. Dans l'application web, **Paramètres**, puis **À propos**, affiche une ligne
   **Algorithme** avec la version `0.0.1`.

## L'activer {#enable}

Installer le service ne montre rien aux utilisateurs tant que l'instance ne le propose
pas.

1. Connectez-vous en administrateur et ouvrez la console d'administration.
2. Ouvrez la section **Recommandations**.
3. Activez **Proposer l'accueil expérimental**. C'est déjà fait si `.env` contient
   `RECOMMENDER_ENABLED=true`.
4. Rechargez l'application web : **Algorithme** apparaît dans le menu.

Essayez ensuite avec votre propre compte :

1. Ouvrez **Algorithme**.
2. Activez **Construire mon accueil avec un algorithme que je choisis**.
3. Revenez à l'accueil. Sur un compte vide, vous obtenez une carte de bienvenue ;
   importez d'abord des données ou regardez quelques vidéos.
4. Rouvrez **Algorithme**, puis **Construction du dernier accueil** : on doit y voir
   les sources demandées et les vidéos trouvées.

Chaque utilisateur doit faire de même pour lui, sauf si vous activez **Activé par
défaut pour tous**.

La section **Recommandations** de la console d'administration contient tout ce qu'un
administrateur décide :

| Contrôle | Effet |
| --- | --- |
| **Proposer l'accueil expérimental** | Désactivé, tout le monde garde l'accueil habituel et la page Algorithme disparaît. Activé, chaque utilisateur choisit de l'activer. |
| **Activé par défaut pour tous** | Désactivé par défaut. Activé, chaque utilisateur obtient tout de suite l'accueil par algorithme et peut le désactiver. |
| **Algorithmes proposés** | Les algorithmes que les utilisateurs peuvent choisir. Aucun coché veut dire tous. |
| **Algorithme présélectionné** | Celui qu'un utilisateur a avant de choisir. **Le choix du service** suit `RECOMMENDER_DEFAULT_ALGORITHM`. |
| **Délai de réponse accordé (ms)** | Combien de temps un appel au service peut prendre. `0` garde la valeur fixée à l'installation. |
| **Demandes de vidéos à YouTube par minute** | Voir [Ce qu'il demande à YouTube](#provider-requests). `0` garde la valeur fixée à l'installation. |

En dessous, **État du service** indique s'il répond et en combien de millisecondes, le
temps moyen pour construire une page (réparti entre l'algorithme et les sources
YouTube), les pages servies et combien venaient du cache, combien de fois un visiteur
a reçu l'accueil habituel à la place, et les demandes de vidéos envoyées et retenues
cette minute. On y voit aussi combien d'utilisateurs ont activé l'option, par
algorithme, et les avis qu'ils ont choisi d'envoyer. Aucun avis ne nomme son auteur.
Les compteurs repartent de zéro quand Server redémarre.

## Ce qu'il stocke {#storage}

Les données de vos utilisateurs restent dans la base de Server. Le service de
recommandations n'a pas de comptes et ne sait pas qui est un utilisateur.

| Quoi | Où | Combien de temps |
| --- | --- | --- |
| Les vecteurs des titres de vidéos publiques | Sa propre base PostgreSQL, table `title_vectors` | Jusqu'à suppression. Aucun utilisateur n'est nommé. |
| L'historique d'un utilisateur, envoyé par Server sous une clé | La mémoire, et le cache partagé | 30 minutes après son dernier usage |
| Le plan d'une page en construction | La mémoire, et le cache partagé | 2 minutes |
| Ce qui a été conclu d'un historique | La mémoire seulement | 10 minutes, tant que l'historique ne change pas |

Server garde aussi chaque accueil construit dans Dragonfly pendant 30 minutes, et le
choix d'algorithme, les corrections et les avis de chaque utilisateur dans sa propre
base. L'export d'un utilisateur contient ses choix et ses avis.

Le service peut être redémarré à tout moment. Server renvoie alors l'historique et la
page suivante est construite normalement.

## Ce qu'il demande à YouTube {#provider-requests}

Le service de recommandations lui-même n'envoie rien à YouTube. Il dit à Server
quelles sources une page réclame (les vidéos d'une chaîne, une recherche, les vidéos
voisines d'une vidéo), et Server les récupère par son extraction habituelle, derrière
son cache partagé.

Server limite ce que le service peut lui faire ouvrir :

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `RECOMMENDER_STREAM_REQUESTS_PER_MINUTE` | `15` | Vidéos que le service peut faire ouvrir à Server chez le fournisseur en une minute, pour toute l'instance. Les personnes qui appuient sur lecture ne sont jamais limitées par ce réglage. |

Quand le fournisseur refuse une demande, le service ne demande plus aucune vidéo
pendant un moment, pour ne jamais faire durer un refus pour les personnes qui
regardent. Une page construite pendant ce temps a simplement moins de sources.

## Réglages {#settings}

Ces valeurs de la stack sont lues dans `.env` :

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `RECOMMENDER_ENABLED` | `false` | Propose le service sur l'instance. La console d'administration peut le changer ensuite. |
| `RECOMMENDER_MEMORY_LIMIT` | `2g` | Plafond de mémoire du conteneur |
| `RECOMMENDER_DEFAULT_ALGORITHM` | `signals` | L'algorithme présélectionné pour quelqu'un qui n'a pas choisi |
| `RECOMMENDER_DATABASE` | `typetype_recommender` | Nom de la base propre au service |
| `RECOMMENDER_CACHE_URL` | `redis://dragonfly:6379` | Cache partagé du service |
| `RECOMMENDER_THREADS` | jusqu'à 8 | Fils d'exécution du modèle de langue |
| `TYPETYPE_RECOMMENDER_IMAGE` | image stable | Image de remplacement, pour un déploiement figé ou un retour arrière |
| `TYPETYPE_POSTGRES_VECTOR_IMAGE` | `pgvector/pgvector:pg17` | Image PostgreSQL qui fournit `pgvector` |
| `TYPETYPE_RECOMMENDER_PORT` | `8190` | Port d'écoute du service, dans le réseau Compose |

Le côté Server de l'intégration se règle aussi :

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `RECOMMENDER_REQUEST_TIMEOUT_MS` | `2500` | Combien de temps un appel au service peut prendre |
| `RECOMMENDER_PAGE_DEADLINE_MS` | `4000` | Combien de temps un visiteur attend une page avant que l'accueil habituel soit affiché ; la page continue d'être construite pour la visite suivante |
| `RECOMMENDER_PAGE_TTL_SECONDS` | `1800` | Durée de conservation d'une page construite |
| `RECOMMENDER_PAGE_VARIANTS` | `3` | Pages gardées par utilisateur, pour qu'un rafraîchissement en montre une autre tout de suite |
| `RECOMMENDER_RELATED_TTL_SECONDS` | `86400` | Durée de conservation des vidéos voisines d'une vidéo |
| `RECOMMENDER_SEARCH_TTL_SECONDS` | `21600` | Durée de conservation d'un résultat de recherche |
| `RECOMMENDER_CHANNEL_TTL_SECONDS` | `1800` | Durée de conservation des vidéos d'une chaîne |
| `RECOMMENDER_SOURCE_PARALLELISM` | `6` | Sources d'une même page récupérées en même temps |

Le fichier du service ne transmet que les valeurs ci-dessus. Le service en lit
d'autres, que vous fixez avec un fichier d'override Compose sur
`typetype-recommender` :

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `RECOMMENDER_HISTORY_TTL_SECONDS` | `1800` | Durée de conservation d'un historique envoyé par Server après son dernier usage |
| `RECOMMENDER_HISTORY_ITEMS_KEPT` | `400000` | Visionnages et likes de tous les historiques gardés en mémoire en même temps, environ 0,5 Mo pour 1 000 |
| `RECOMMENDER_PLAN_TTL_SECONDS` | `120` | Durée de conservation du plan d'une page |
| `RECOMMENDER_PROFILE_TTL_SECONDS` | `600` | Durée de conservation de ce qui a été conclu d'un historique inchangé ; `0` le désactive |
| `RECOMMENDER_EMBED_BUDGET` | `100` | Nouveaux titres lus par le modèle au plus dans une requête |
| `RECOMMENDER_MAX_TITLES` | `2000` | Titres lus au plus par un profil |
| `RECOMMENDER_EMBEDDING_MODEL`, `RECOMMENDER_EMBEDDING_FILE` | mpnet multilingue, fp16 | Le modèle de langue et sa variante |
| `RECOMMENDER_DATABASE_POOL` | `4` | Connexions gardées vers la base |
| `RECOMMENDER_CACHE_TIMEOUT_MS` | `2000` | Combien de temps un appel au cache peut prendre |

Une variable laissée vide compte comme non définie.

```yaml
services:
  typetype-recommender:
    environment:
      RECOMMENDER_PARALLEL_BATCHES: "3"
```

Enregistrez-le sous `docker-compose.override.yml` dans le dossier de la stack ;
l'installateur conserve ce fichier et l'applique en dernier.

### Mémoire contre vitesse {#memory}

Avec ses valeurs par défaut, le service reste sous 2 Go. Sur un hôte qui peut lui
donner 4 Go, deux réglages du service le rendent plus rapide quand beaucoup de
nouvelles personnes arrivent en même temps, au prix de la mémoire :

| Variable | Défaut | Effet |
| --- | --- | --- |
| `RECOMMENDER_PARALLEL_BATCHES` | `1` | Lots de titres passant dans le modèle en même temps. `3` sert une foule de nouvelles personnes environ un tiers plus vite, pour environ 0,8 Go de plus au pic. |
| `RECOMMENDER_ONNX_ARENA` | `0` | `1` laisse le modèle garder la mémoire de ses plus gros lots : environ 10 % plus rapide sous une foule, environ 1,3 Go de plus. |

Augmentez `RECOMMENDER_MEMORY_LIMIT` en même temps.

## Le mettre à jour {#update}

Avec l'installateur, mettez à jour comme d'habitude. Il garde le service parce que
`.env` contient `RECOMMENDER_ENABLED=true` :

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --yes --dir "$STACK_DIR"
```

À la main, tirez les images et recréez avec les deux fichiers :

```sh
cd "$STACK_DIR"
docker compose -f docker-compose.yml -f docker-compose.recommender.yml pull
docker compose -f docker-compose.yml -f docker-compose.recommender.yml up -d --wait --wait-timeout 900
```

Le modèle reste dans son volume : une mise à jour ne le retélécharge pas. Refaites
ensuite les vérifications de [Vérifier qu'il tourne](#verify) : la ligne de version
vous dit quelle version répond.

## L'enlever {#remove}

1. Dans `.env`, mettez `RECOMMENDER_ENABLED=false`, pour que l'installateur ne le
   rajoute pas à la prochaine mise à jour.

2. Recréez la stack sans le fichier du service :

   ```sh
   cd "$STACK_DIR"
   docker compose -f docker-compose.yml up -d --remove-orphans --wait
   ```

   Le conteneur du service est supprimé, PostgreSQL revient à `postgres:17` et Server
   est recréé sans l'adresse du service. L'accueil redevient l'accueil habituel pour
   tout le monde et la page Algorithme disparaît.

3. Vérifiez :

   ```sh
   docker compose exec -T typetype-server wget -qO- http://127.0.0.1:8080/instance
   ```

   La réponse contient maintenant `"recommender":{"installed":false,`.

Les choix, corrections et avis des utilisateurs restent dans la base de Server, au
cas où vous rajouteriez le service. Rien d'autre d'eux n'a jamais été stocké par le
service.

Pour récupérer l'espace disque, si vous le souhaitez :

```sh
docker volume ls | grep recommender_models
docker volume rm <nom affiché ci-dessus>
docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DROP DATABASE typetype_recommender"'
```

## Dépannage {#troubleshooting}

Lisez d'abord le journal du service :

```sh
cd "$STACK_DIR"
docker compose -f docker-compose.yml -f docker-compose.recommender.yml logs --tail 100 typetype-recommender
```

| Ce que vous voyez | Cause | Que faire |
| --- | --- | --- |
| `STATUS` reste sur `(health: starting)` pendant des minutes au premier démarrage | Le modèle, environ 550 Mo, est en cours de téléchargement | Attendez. Le journal affiche `Application startup complete` quand c'est fini. |
| Le journal montre une erreur réseau avant `Application startup complete` | Le modèle n'a pas pu être téléchargé depuis Hugging Face | Donnez au conteneur un accès à Internet pour le premier démarrage. Ensuite le modèle est lu depuis le volume. |
| `no such service: typetype-recommender` | La commande ne nomme que `docker-compose.yml` | Ajoutez `-f docker-compose.recommender.yml`. |
| Le conteneur est tué et redémarre, `OOMKilled` dans `docker inspect` | Il a atteint `RECOMMENDER_MEMORY_LIMIT` | Augmentez la limite, ou gardez les valeurs par défaut de [Mémoire contre vitesse](#memory). |
| `/version/recommender` ne répond rien | Server n'a pas été recréé avec le fichier du service, ou le secret partagé manque | Relancez les deux commandes de [C. À la main](#manual), étapes 3 et 4. |
| **Algorithme** n'est pas dans le menu | L'instance ne le propose pas | Console d'administration, **Recommandations**, **Proposer l'accueil expérimental** ; puis rechargez la page. |
| L'accueil reste l'accueil habituel | La page n'était pas prête à temps, ou le compte n'a pas de données | Rechargez après quelques secondes. Dans la console d'administration, **Retours à l'accueil habituel** compte combien de fois cela arrive. |
| **État du service** affiche **Ne répond pas** | Le service est arrêté ou démarre encore | Vérifiez son état et son journal comme ci-dessus. En attendant, les accueils sont les accueils habituels. |

## Références

- [Dépôt de Signals](https://github.com/TypeType-Video/TypeType-Signals)
- [Fichier Compose du service](https://github.com/TypeType-Video/TypeType/blob/main/docker-compose.recommender.yml)
- [Installateur](https://github.com/TypeType-Video/TypeType/blob/main/scripts/install-stack.sh)
- [Configuration du service côté Server](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-services/src/main/kotlin/dev/typetype/server/services/RecommenderConfig.kt)
