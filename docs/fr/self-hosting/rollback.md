# Revenir en arrière après une mise à jour

TypeType peut revenir aux images d'application qui tournaient auparavant sans
supprimer ses volumes de données. Préparez les informations de retour arrière
**avant** chaque mise à jour ; l'étiquette `latest` avance et n'est pas une référence
de retour utilisable.

::: danger Ne supprimez jamais les volumes
Ne lancez pas `docker compose down -v` et ne retirez pas les volumes de PostgreSQL, de
Garage ou des secrets. Un `docker compose down` normal les conserve.
:::

## Avant de mettre à jour {#before-updating}

Ouvrez le dossier de la stack : `~/typetype-stack` sauf si vous en avez choisi un
autre, ou le dossier qui contient `docker-compose.yml` pour une installation manuelle.
Voir [Choisir le dossier](./quick-start#stack-directory).

```sh
cd "$STACK_DIR"
mkdir rollback-before-update
cp .env docker-compose.yml rollback-before-update/
for file in docker-compose.arm64.yml docker-compose.override.yml nginx.conf garage.toml; do
  [ ! -f "$file" ] || cp -a "$file" rollback-before-update/
done
docker compose exec -T postgres pg_dump -U typetype typetype > rollback-before-update/typetype.sql
```

L'installateur pris en charge fait automatiquement la partie fichiers de la stack et
références d'images avant une mise à jour. Ses sauvegardes horodatées sont rangées
sous `.typetype-backups/`. Un export de la base reste une sauvegarde à part, à la
charge de l'exploitant.

Notez les quatre références d'images qui tournent actuellement :

```sh
docker image inspect "$(docker compose images -q typetype)" --format '{{index .RepoDigests 0}}'
docker image inspect "$(docker compose images -q typetype-server)" --format '{{index .RepoDigests 0}}'
docker image inspect "$(docker compose images -q typetype-downloader)" --format '{{index .RepoDigests 0}}'
docker image inspect "$(docker compose images -q typetype-token)" --format '{{index .RepoDigests 0}}'
```

Chaque commande affiche une référence immuable qui se termine par `@sha256:...`.
Gardez les quatre sorties avec la sauvegarde et étiquetez-les web, server, downloader
et token.

## Restaurer la version précédente de l'application {#restore-the-previous-application-version}

Arrêtez la stack actuelle sans retirer ses volumes :

```sh
docker compose down
```

Restaurez les fichiers de la stack et la configuration précédents :

```sh
cp rollback-before-update/.env .env
cp rollback-before-update/docker-compose.yml docker-compose.yml
for file in docker-compose.arm64.yml docker-compose.override.yml nginx.conf garage.toml; do
  [ ! -f "rollback-before-update/$file" ] || cp -a "rollback-before-update/$file" "$file"
done
```

Ouvrez `.env` et donnez à ces valeurs les quatre références notées avant la mise à
jour :

```dotenv
TYPETYPE_WEB_IMAGE=ghcr.io/typetype-video/typetype@sha256:WEB_DIGEST
TYPETYPE_SERVER_IMAGE=ghcr.io/typetype-video/typetype-server@sha256:SERVER_DIGEST
TYPETYPE_DOWNLOADER_IMAGE=ghcr.io/typetype-video/typetype-downloader@sha256:DOWNLOADER_DIGEST
TYPETYPE_TOKEN_IMAGE=ghcr.io/typetype-video/typetype-token@sha256:TOKEN_DIGEST
```

Utilisez les valeurs complètes affichées par Docker, pas les textes d'exemple. Validez
ensuite la configuration restaurée et recréez la stack :

```sh
docker compose config -q
docker compose pull
docker compose up -d --force-recreate --wait --wait-timeout 180
docker compose ps
curl -fsS http://localhost:8080/health
curl -fsS http://localhost:8081/health
curl -fsS http://localhost:8082/api/downloader/health/deep
```

Cela ne change que la version de l'application. Les comptes, l'historique, les
paramètres, les téléchargements, la configuration de Garage et les secrets restent
dans les volumes existants.

## Ne restaurer la base que si c'est nécessaire {#restore-the-database-only-when-required}

Ne restaurez pas la base simplement parce que l'application est revenue en arrière. La
plupart des retours arrière de l'application fonctionnent avec les données existantes.
Ne restaurez la sauvegarde que si les notes de version l'exigent ou si le serveur
précédent ne peut pas démarrer avec le schéma actuel.

Arrêtez d'abord les services qui se connectent à PostgreSQL :

```sh
docker compose stop typetype typetype-server typetype-downloader postgres-init
docker compose exec -T postgres dropdb -U typetype --if-exists typetype
docker compose exec -T postgres createdb -U typetype typetype
docker compose exec -T postgres psql -U typetype typetype < rollback-before-update/typetype.sql
docker compose up -d --wait --wait-timeout 180
```

Cela ramène la base à son état d'avant la mise à jour : les changements faits après la
sauvegarde sont donc perdus.

## Revenir aux mises à jour normales {#return-to-normal-updates}

Une fois la version fautive remplacée, retirez de `.env` les quatre valeurs
`TYPETYPE_*_IMAGE`, ou laissez-les vides. La prochaine mise à jour normale suivra alors
de nouveau les images stables `latest`. Voir [Maintenance](./maintenance#updating).
