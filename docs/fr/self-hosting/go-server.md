# Serveur Go (expérimental)

TypeType Server existe aussi en Go : [TypeType-Server-Go](https://github.com/TypeType-Video/TypeType-Server-Go).
Il répond à la même API avec la même base de données, les mêmes réglages et les mêmes secrets :
l'application web et les applications Android et TV fonctionnent avec lui sans rien changer. Il est
expérimental : le serveur Kotlin reste celui par défaut, et vous pouvez revenir en arrière à tout moment.

## Avant de commencer {#requirements}

| Ressource | Quantité |
| --- | --- |
| Mémoire | Environ 200 Mo |
| Disque | Environ 30 Mo pour l'image |

Ce qui change sur votre stack : le conteneur `typetype-server` utilise l'image Go. À son premier
démarrage, il ajoute une table, `go_schema_state`, à la base de données et laisse tout le reste tel quel.

Sauvegardez d'abord la base de données ([Sauvegardes](./maintenance#database)) si l'instance est utilisée.

## Passer au serveur Go {#install}

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --server go
```

L'installeur garde ce choix lors des mises à jour suivantes. Le serveur Go a ses propres versions : il
suit sa dernière version publiée et ignore `--version` et `--rc`. Avec `--beta`, il suit ses images beta.

## Revenir en arrière {#switch-back}

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --server kotlin
```

Ce que le serveur Go a écrit reste lisible par le serveur Kotlin.

## À la main {#install-by-hand}

Ajoutez `docker-compose.go.yml` aux fichiers Compose que vous utilisez déjà :

```sh
docker compose -f docker-compose.yml -f docker-compose.go.yml --env-file .env up -d typetype-server
```

## Bon à savoir {#differences}

- Les journaux du serveur vont dans la sortie du conteneur (`docker compose logs typetype-server`), pas dans des fichiers.
