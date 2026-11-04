# Versions candidates

Une version candidate, ou rc, est la prochaine version de TypeType avant le jour de sa
sortie. Elle utilise les images qui seront publiées : vous pouvez essayer une version
en avance et signaler ce qui casse avant que tout le monde ne mette à jour. L'instance
officielle tourne elle aussi sur les versions candidates.

| Choix | Images | Change | Pour |
| --- | --- | --- | --- |
| **Dernière version** | `:latest`, `:1.16.0` | Seulement le jour d'une version | L'usage quotidien |
| **Versions candidates** | `:rc`, `:1.16.0-rc.1` | Quand un composant est prêt pour la prochaine version | Essayer la prochaine version en avance |
| **Une version** | `:1.15.0` | Jamais, jusqu'à ce que vous en choisissiez une autre | Rester volontairement sur une version |
| **Beta** | `-beta:latest` | À chaque push sur `dev` | Le développement, peut casser |

Une version candidate ne reçoit que ce qui est prêt pour la prochaine version : elle est
donc plus stable que la beta. Elle peut quand même avoir des bugs : sauvegardez la base
de données avant de changer, voir [Sauvegardes](./maintenance#backups). La façon dont
les versions candidates sont préparées est décrite dans
[Branches et versions](/fr/project/releases#how-a-release-is-made).

## Choisir votre version {#choose-your-version}

Lancez l'installateur comme d'habitude. Il vous demande quelle version vous voulez :

```text
[install] Which TypeType version do you want?
[install]   1) The latest release, recommended for everyday use
[install]   2) The release candidates, the next version before its release
[install]   3) One version that never changes until you pick another one
Choose 1, 2 or 3 [1]:
```

Choisissez `2` pour les versions candidates. L'installateur écrit
`TYPETYPE_VERSION=rc` dans `.env`, pour que les quatre images TypeType utilisent
l'étiquette `:rc`, et il prend les fichiers de la stack des versions candidates sur la
branche `staging`. Relancez-le plus tard pour changer : il propose votre choix actuel
par défaut. Votre `.env`, vos ports et vos volumes de données restent tels quels.

::: tip Jusqu'à TypeType 1.16.0
Seul l'installateur de `staging` pose cette question. Utilisez-le pour l'instant :

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/staging/scripts/install-stack.sh | bash
```
:::

Une valeur `TYPETYPE_*_IMAGE` dans `.env` reste prioritaire pour son image. Retirez ces
lignes, ou laissez-les vides, pour que toutes les images suivent votre choix.

## Sans questions {#without-questions}

Pour les scripts et les installations automatiques, choisissez avec une option et
ajoutez `--yes` :

| Option | Effet |
| --- | --- |
| `--rc` | Suivre les versions candidates |
| `--latest` | Suivre de nouveau la dernière version |
| `--version 1.15.0` | Rester sur une version |

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/staging/scripts/install-stack.sh | bash -s -- --rc --yes --dir "$STACK_DIR"
```

`$STACK_DIR` est le dossier de votre stack, `~/typetype-stack` sauf si vous en avez
choisi un autre. Ces options ne se combinent pas avec `--beta`.

## Mettre à jour {#update}

Relancez l'installateur. Une stack sur les versions candidates garde les fichiers de
`staging` quand l'installateur est relancé, même avec `--yes`. Sans l'installateur,
récupérez et recréez la stack :

```sh
cd "$STACK_DIR"
docker compose pull
docker compose up -d --wait --wait-timeout 180
```

Une nouvelle version candidate remplace les images `:rc` : chaque mise à jour apporte
la plus récente.

## Vérifier ce qui tourne {#check-what-you-run}

```sh
curl -fsS http://localhost:8082/api/version/server
```

Le champ `version` indique la version candidate, par exemple `1.16.0-rc.1`. Le même
point d'accès existe pour `web`, `token` et `downloader`.

## Revenir à la dernière version {#go-back-to-the-latest-release}

Lancez l'installateur et choisissez `1`, ou passez `--latest`. Une version candidate peut
modifier la base de données : revenir à une version plus ancienne peut donc demander la
sauvegarde faite avant de changer, voir
[Revenir en arrière après une mise à jour](./rollback).

Après une sortie, la dernière version et la dernière version candidate contiennent le
même code : vous pouvez rester sur les versions candidates pour continuer à tester la
version suivante.

## Signaler un problème {#report-a-problem}

Ouvrez une [issue](https://github.com/TypeType-Video/TypeType/issues) avec les versions
renvoyées par `/api/version`, et précisez que vous utilisez une version candidate. Voir
[Signaler un problème](./reporting-issues).
