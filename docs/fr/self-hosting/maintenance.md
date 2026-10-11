# Maintenance

L'exploitation au quotidien une fois la stack en marche.

## Mettre à jour {#updating}

Si vous avez installé TypeType avec l'installateur recommandé, relancez-le. Il met à
jour les fichiers de la stack qu'il gère, conserve `.env`, les overrides Compose et
les volumes de données, tire les images de la version, attend les services, vérifie
les versions des composants et provisionne les ressources Garage ajoutées depuis :

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --yes --dir "$STACK_DIR"
cd "$STACK_DIR"
docker compose ps
```

`$STACK_DIR` est le dossier de votre stack, `~/typetype-stack` sauf si vous en avez
choisi un autre : voir [Choisir le dossier](./quick-start#stack-directory).

Les ports configurés restent inchangés quand l'installateur est relancé. Les comptes,
l'historique, les téléchargements et les secrets des services restent dans `.env` et
dans les volumes nommés. Avant de modifier les fichiers gérés, l'installateur crée
sous `.typetype-backups/` un dossier horodaté qui contient les fichiers de stack
précédents et, quand l'ancienne configuration est valide, ses références d'images
résolues et en cours d'exécution.

Pour une installation sans script, remplacez d'abord le fichier Compose et les scripts
par ceux de la version actuelle, en gardant `.env`, un éventuel override et la
configuration sur mesure. Puis validez et recréez la stack :

```sh
docker compose config -q
docker compose pull
docker compose up -d --force-recreate --wait --wait-timeout 180
docker compose ps
```

### Migrer une ancienne stack Priveetee {#migrate-an-older-priveetee-stack}

Les installations anciennes peuvent encore utiliser des fichiers Compose qui
référencent `ghcr.io/priveetee/...`. Lancer `docker compose pull` avec ces fichiers
continue de tirer l'ancien espace de noms d'images ; cela ne fait pas passer
l'instance à une version actuelle `ghcr.io/typetype-video/...`.

Vérifiez les noms d'images résolus depuis le dossier qui contient le fichier Compose
actif :

```sh
docker compose config --images
```

Si une image TypeType commence par `ghcr.io/priveetee/`, rafraîchissez les fichiers de
la stack une fois. Gardez d'abord la configuration actuelle et une sauvegarde de la
base :

```sh
cd "$STACK_DIR"
migration_backup="../typetype-stack-before-migration-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$migration_backup"
cp -a .env docker-compose.yml "$migration_backup"/
[ ! -f nginx.conf ] || cp -a nginx.conf "$migration_backup"/
[ ! -f garage.toml ] || cp -a garage.toml "$migration_backup"/
docker compose exec -T postgres \
  pg_dump -U typetype typetype > "$migration_backup/typetype.sql"
```

Téléchargez le fichier Compose et les scripts actuels pris en charge dans le même
dossier. L'installateur garde le fichier `.env` existant, l'override Compose, les
fichiers non gérés et les volumes nommés, tout en ajoutant les entrées requises
actuelles :

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh \
  | bash -s -- --dir "$PWD" --download-only --yes
```

::: warning Les fichiers de stack personnalisés sont remplacés
La commande rafraîchit `docker-compose.yml`, `.env.example` et les scripts de la
stack. Comparez la sauvegarde horodatée avant de rétablir un changement sur mesure ;
ne recopiez pas l'ancien fichier Compose, car cela rétablirait aussi ses anciennes
références d'images. Gardez les changements de services sur mesure dans
`docker-compose.override.yml`.
:::

Un ancien `nginx.conf` de l'hôte est sauvegardé mais n'est plus monté par la stack par
défaut, parce que nginx est désormais livré dans l'image web. Un ancien `garage.toml`
est mis de côté pour un import unique dans le volume `garage_config`. L'initialisation
n'écrase jamais une configuration déjà présente dans ce volume.

Validez la stack rafraîchie et inspectez de nouveau les images :

```sh
docker compose config -q
docker compose config --images
```

Les quatre images d'application TypeType doivent maintenant commencer par
`ghcr.io/typetype-video/`. Tirez-les et recréez les services sans supprimer de
volumes :

```sh
docker compose pull
docker compose up -d --force-recreate --wait --wait-timeout 180
docker compose ps
```

Enfin, remplacez l'origine d'exemple ci-dessous par l'URL de l'instance et confirmez
les révisions des composants déployés :

```sh
curl -fsS https://watch.example.com/api/version
curl -fsS https://watch.example.com/api/version/web
curl -fsS https://watch.example.com/api/version/server
curl -fsS https://watch.example.com/api/version/token
curl -fsS https://watch.example.com/api/version/downloader
```

Ce trou de migration ponctuel a été mis en évidence par
[la relance de filippobaroni dans la discussion #133](https://github.com/TypeType-Video/TypeType/discussions/133#discussioncomment-17779201).

Quand vous mettez à niveau depuis une version qui n'incluait pas Garage, suivez une
fois [l'installation manuelle](./docker-compose#manual-setup), Partie 2 comprise,
avant d'utiliser les téléchargements.

Avant chaque mise à jour, gardez les références d'images actuelles et une sauvegarde
de la base, pour pouvoir [revenir en arrière](./rollback) si nécessaire.

## Journaux {#logs}

```sh
docker compose logs -f typetype-server     # suivre un service
docker compose logs --tail=100 typetype    # les 100 dernières lignes de l'application web
docker compose logs                         # tout
```

Les journaux du serveur sont l'endroit où regarder quand l'extraction, les comptes ou
l'API se comportent mal.

## Sauvegardes {#backups}

Deux stockages contiennent tout ce qui compte : la base de données et le stockage
objet.

### Base de données {#database}

```sh
docker compose exec -T postgres \
  pg_dump -U typetype typetype > typetype-$(date +%F).sql
```

Restaurer dans une stack neuve :

```sh
cat typetype-YYYY-MM-DD.sql | docker compose exec -T postgres psql -U typetype typetype
```

### Stockage objet (téléchargements) {#object-store-downloads}

Les téléchargements sont dans les volumes `garage_data` et `garage_meta`. Sauvegardez
les volumes eux-mêmes (arrêtez d'abord la stack pour une copie cohérente) :

```sh
docker compose down
docker run --rm -v typetype_garage_data:/data -v "$PWD":/backup busybox \
  tar czf /backup/garage-data-$(date +%F).tar.gz -C /data .
docker compose up -d
```

Adaptez le nom du volume si le préfixe de votre projet Compose est différent
(affichez-le avec `docker volume ls`).

::: tip
Les téléchargements sont des artefacts que l'on peut régénérer : la sauvegarde qui
compte est donc celle de la base. Le fichier `.env` vaut aussi la peine d'être gardé,
puisqu'il fixe vos ports et vos valeurs sur mesure.
:::

## Arrêter et démarrer {#stopping-and-starting}

```sh
docker compose stop      # arrêter les conteneurs, les garder
docker compose start     # les redémarrer
docker compose down      # retirer les conteneurs, garder les volumes (données en sécurité)
```

## Ressources {#resources}

Une petite instance est à l'aise avec environ 2 Go de RAM. Les composants les plus
lourds sont le serveur API (JVM) et la base de données. Le téléchargeur est celui qui
travaille le plus le disque et le réseau pendant que des tâches tournent ; il est au
repos le reste du temps.
