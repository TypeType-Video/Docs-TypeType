# Signaler un problème

Tous les problèmes vivent à un seul endroit :
**[TypeType-Video/TypeType](https://github.com/TypeType-Video/TypeType/issues)**.

Ouvrez tout là-bas, qu'il s'agisse de l'application web, de l'API ou des
téléchargements, et choisissez le formulaire qui convient.

Vous n'avez jamais à deviner quelle partie est en cause. Si un signalement se révèle
propre au backend, les mainteneurs prennent le relais.

Il y a deux façons de signaler :

- Ouvrir une issue **directement sur GitHub**, au lien ci-dessus.
- Utiliser l'**outil de signalement dans l'application**, décrit ci-dessous.

## Depuis l'application {#from-inside-the-app}

Le moyen le plus rapide de signaler quelque chose est l'action intégrée **Signaler un
bug**, par exemple depuis la barre d'actions de la page de lecture. Elle ouvre un court
formulaire, et vous n'avez pas besoin d'un compte GitHub pour l'utiliser.

Vous ne remplissez que deux choses :

- une **catégorie** parmi Lecteur, Langue audio, Sous-titres, Interface ou
  Fonctionnalité,
- une courte **description** de ce qui n'a pas marché.

L'application rassemble tout le reste pour vous. Le signalement capture
automatiquement la page ou la vidéo où vous étiez, votre navigateur et votre langue,
l'état du lecteur, et les journaux de plantage ou les erreurs d'API récents, tous
collectés dans le navigateur pendant que vous utilisez l'application. Vous n'avez
jamais à aller chercher des détails techniques à la main.

Quand vous l'envoyez, le signalement est enregistré sur votre instance. Ce qui se
passe ensuite :

1. Le signalement est enregistré sur votre instance.
2. Un administrateur relit les signalements envoyés dans la zone **Administration**.
3. Depuis un signalement, un administrateur peut ouvrir une **issue GitHub
   préremplie** : l'application construit un lien `issues/new` pour le dépôt que vous
   avez configuré, avec le titre, un corps prérempli (le signalement et son contexte),
   une demande d'étiquette `bug` et, quand `GITHUB_ISSUE_TEMPLATE` est défini, ce
   modèle. GitHub n'applique les étiquettes demandées par l'URL que si la personne qui
   ouvre le lien en a le droit. Le générateur masque les noms d'hôte des URL et les
   textes ressemblant à des domaines qu'il reconnaît avant de mettre le signalement
   dans cette URL. Relisez toujours le résultat avant de le publier.

Aucun jeton GitHub n'est nécessaire : l'application ne fait que générer le lien
prérempli ; l'issue est créée quand quelqu'un l'envoie sur GitHub.

### Configuration {#configuration}

Deux variables décident où pointent les signalements faits dans l'application (voir
[Configuration](./configuration#bug-reports)) :

| Variable | Défaut | Signification |
| --- | --- | --- |
| `GITHUB_REPO` | `TypeType-Video/TypeType` | Dépôt visé par l'issue préremplie |
| `GITHUB_ISSUE_TEMPLATE` | `bug_report_backend.md` | Nom du fichier de modèle actuellement ajouté au lien |

Pour garder tous les signalements des utilisateurs dans le suivi unique ci-dessus,
laissez `GITHUB_REPO` à sa valeur par défaut. Utilisez plutôt votre propre fork si
vous tenez un suivi séparé.

## Rendre un signalement utile {#make-a-report-useful}

- Dites si vous êtes sur le canal **main** ou **beta** (voir
  [Beta et main](./beta-and-main)).
- Donnez les étapes pour reproduire, ce que vous attendiez et ce qui s'est passé.
- Pour les problèmes de lecture, notez la vidéo, le fournisseur (YouTube, NicoNico,
  BiliBili) et la qualité.
- Regardez dans `docker compose logs typetype-server` s'il y a une erreur autour du
  moment où c'est arrivé.
- Joignez les révisions des composants déployés quand le problème peut dépendre d'une
  mise à jour :

  ```sh
  curl -fsS https://watch.example.com/api/version
  curl -fsS https://watch.example.com/api/version/web
  curl -fsS https://watch.example.com/api/version/server
  curl -fsS https://watch.example.com/api/version/token
  curl -fsS https://watch.example.com/api/version/downloader
  ```

  Remplacez l'origine d'exemple et retirez les noms d'hôte privés avant de publier.
  Ces points d'accès contiennent des métadonnées de construction, pas des
  identifiants.

## Comment les issues sont organisées {#how-issues-are-organised}

Chaque issue est triée par étiquettes, pour que le suivi reste facile à parcourir :

- **Type**, le genre de signalement : `bug`, `feature request`, `enhancement`,
  `documentation` ou `question`. Les formulaires GitHub centraux posent leur étiquette
  automatiquement. Le lien actuel de l'application ne demande que `bug`, sous réserve
  de la règle de permission GitHub ci-dessus.
- **Zone**, la partie concernée : `area: frontend`, `area: backend`, `area: token` ou
  `area: downloader`. Les mainteneurs l'ajoutent au tri : vous n'avez jamais à le
  faire.
- **Priorité** : `priority: high`, `priority: medium` ou `priority: low`.

En pratique, la plupart des signalements portent sur **l'application web et la
lecture**, le lecteur, les playlists, les sous-titres, les imports et l'interface,
avec une part plus petite sur le **backend** (l'extraction et l'API). Les signalements
sont triés et la grande majorité sont corrigés et fermés : un signalement clair
devient donc vraiment un correctif.

Les signalements qui améliorent sensiblement une explication ou un diagnostic sont
crédités dans [Sources de la communauté et remerciements](/fr/project/community).

### Envie de contribuer ? {#want-to-contribute}

Deux étiquettes valent la peine d'être suivies :

- [`good first issue`](https://github.com/TypeType-Video/TypeType/issues?q=is%3Aopen+label%3A%22good+first+issue%22), des points de départ abordables.
- [`help wanted`](https://github.com/TypeType-Video/TypeType/issues?q=is%3Aopen+label%3A%22help+wanted%22), là où un coup de main est bienvenu.
