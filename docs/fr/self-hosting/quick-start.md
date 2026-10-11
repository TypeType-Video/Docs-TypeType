# Démarrage rapide

La façon la plus rapide et **recommandée** d'auto-héberger TypeType est le script
d'installation. Il met en place toute la stack pour vous, secrets, ports libres,
services et stockage objet pour les téléchargements : vous obtenez une instance
complète et fonctionnelle en une commande.

::: tip Vous préférez le faire à la main ?
Tout ce que fait le script est aussi documenté pas à pas dans
[Installation manuelle](./docker-compose), si vous voulez tout maîtriser ou comprendre
chaque partie.
:::

## Une commande {#one-command}

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash
```

L'installateur :

- crée `~/typetype-stack` avec le fichier Compose et les scripts de la stack,
- génère les secrets du téléchargeur, du RPC Garage et de la session YouTube,
- choisit automatiquement des ports libres quand ceux par défaut sont pris,
- valide la configuration résolue et démarre tous les services,
- et initialise Garage, pour que **les téléchargements marchent d'emblée**.

Il est interactif. Il télécharge et prépare d'abord les fichiers de la stack, puis
demande confirmation avant de tirer les images et de démarrer les conteneurs.

Lors d'une mise à jour, l'installateur crée d'abord une sauvegarde horodatée des
fichiers de la stack qu'il gère et note les références d'images actuelles. Il attend
ensuite les services rafraîchis et vérifie leurs points de version avant de terminer.

### Choisir le dossier {#stack-directory}

L'installateur met la stack dans `~/typetype-stack`. Ce n'est que sa valeur par
défaut : passez `--dir` pour installer où vous voulez.

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --dir /srv/typetype
```

Les commandes de cette documentation utilisent `$STACK_DIR` pour ce dossier.
Définissez-la une fois dans votre terminal, sur la valeur par défaut ou sur le dossier
que vous avez choisi :

```sh
STACK_DIR=~/typetype-stack
```

Une installation manuelle n'a pas de valeur par défaut : `$STACK_DIR` est le dossier
qui contient votre `docker-compose.yml`.

### Télécharger seulement {#download-only}

Pour récupérer les fichiers et les relire avant de lancer Docker vous-même :

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --download-only
```

## Vérifier qu'elle tourne {#check-it-is-up}

```sh
cd "$STACK_DIR"
docker compose ps
docker compose exec -T typetype-server wget -qO- http://127.0.0.1:8080/health
```

La deuxième commande interroge Server depuis l'intérieur de son conteneur : elle
reste donc juste quand l'installateur a choisi un autre port sur l'hôte.

## Créer le compte administrateur {#create-the-admin-account}

Ouvrez l'application web (l'installateur affiche l'URL exacte,
`http://localhost:8082` par défaut). Sur une installation neuve, elle vous demande de
créer un compte, et le **premier compte devient administrateur** automatiquement.

![L'écran d'inscription sur une installation neuve](/screenshot-register.png)

Saisissez un nom, une adresse e-mail et un mot de passe, puis **Créer un compte**.
Vous êtes connecté en administrateur et arrivez sur l'écran d'accueil, d'où vous
pouvez importer vos données.

![Connecté en tant qu'administrateur](/screenshot-onboarding.png)

Le déroulé complet :

![Création du compte administrateur](/register-admin.gif)

## Ensuite {#next}

- Mettez-la sur votre propre domaine en HTTPS :
  [Proxy inverse et HTTPS](./reverse-proxy).
- Réglez les ports, la base et les secrets : [Configuration](./configuration).
- Gardez-la en bonne santé : [Maintenance](./maintenance).
