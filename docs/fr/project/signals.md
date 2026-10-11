# Signals, le service de recommandations

::: warning Expérimental
Signals est en version 0.0.1. Son contrat avec Server et ses algorithmes peuvent
encore changer.
:::

[TypeType Signals](https://github.com/TypeType-Video/TypeType-Signals) est le service optionnel qui contient les algorithmes
d'accueil. Cette page explique comment il s'articule avec Server et comment un
algorithme est écrit. Pour ce que voient les utilisateurs, lisez
[Choisir son algorithme](/fr/guide/algorithm) ; pour le faire tourner, lisez
[Service de recommandations](/fr/self-hosting/recommender).

## Qui fait quoi {#roles}

| | TypeType-Server | Signals |
| --- | --- | --- |
| Comptes, sessions, données des utilisateurs | Les possède | N'en a aucun : une requête ne nomme jamais un utilisateur |
| Parler à YouTube | Récupère chaque vidéo, par son extraction et son cache | Ne le fait jamais |
| Blocage, filtres familiaux | Les applique à tout ce qui revient | Ne peut pas les contourner |
| Choisir et ordonner les vidéos | Se rabat sur son accueil intégré | Possède les algorithmes |
| Ce qui est conservé | Choix, corrections, avis, pages construites | Vecteurs de titres publics et catalogue public de vidéos ; instantanés temporaires de visionnage associés à une clé |

Server est le seul appelant du service. Si le service est absent, lent ou en échec,
Server sert son accueil intégré : un accueil ne casse donc jamais.

## Un accueil, étape par étape {#flow}

```text
browser ── GET /recommendations/home ─▶ Server
Server  ── POST /v1/history (once, when the history changed) ─▶ Signals
Server  ── POST /v1/plan (snapshot) ─▶ Signals
Server  ◀─ the sources to fetch ───── Signals
Server:    fetches those sources, filters the candidates
Server  ── POST /v1/rank (plan id, candidates) ─▶ Signals
Server  ◀─ rows, reasons, trace ───── Signals
Server:    filters the rows again, keeps the page, serves it in slices
browser ◀─ rows ───────────────────── Server
```

1. **Instantané.** Server décrit la personne sans la nommer : l'algorithme qu'elle a
   choisi et ses réglages, l'heure et la langue, ses abonnements, et seulement les
   catégories de données que l'algorithme annonce et que la personne autorise. Un long
   historique est envoyé une fois sous une clé, puis désigné par cette clé.
2. **Plan.** L'algorithme répond avec les sources qu'il veut : le flux d'abonnements,
   les vidéos voisines d'une vidéo donnée, les vidéos d'une chaîne, une recherche, les
   tendances, ou des vidéos précises à reprendre. Chaque source porte la raison pour
   laquelle elle a été demandée.
3. **Récupération.** Server récupère les sources, par son cache partagé, et compte
   chaque vidéo qu'il doit ouvrir chez le fournisseur dans la limite de l'instance.
4. **Classement.** L'algorithme note les candidates et les range en rangées. Les
   rangées désignent les vidéos par leur URL seulement : le service ne peut pas mettre
   à l'écran une vidéo que Server n'a pas récupérée et filtrée.
5. **Second filtre.** Server applique de nouveau le blocage et les filtres familiaux
   aux rangées. Un bug dans un algorithme ne peut pas afficher une vidéo bloquée.

Une page qui n'est pas prête dans le délai de Server est remplacée par l'accueil
intégré pour cette visite, et continue d'être construite pour la suivante.

## Routes du service {#routes}

Toutes les routes sauf `/health` exigent l'en-tête `X-Internal-Token`, le secret
partagé avec Server.

| Route | Rôle |
| --- | --- |
| `GET /health` | Vivacité et version |
| `GET /version` | Version, révision et date de construction, comme tout service TypeType les donne |
| `GET /v1/algorithms` | Les algorithmes, leurs textes, les données que chacun lit et chaque réglage avec ses bornes et sa valeur par défaut. L'interface est construite à partir de cette réponse : un nouvel algorithme ne demande aucun changement du frontend. |
| `POST /v1/history` | Un historique et des likes sous une clé choisie par Server, en un appel ou en plusieurs parties |
| `POST /v1/plan` | Instantané en entrée, sources à récupérer en sortie |
| `POST /v1/rank` | Candidates en entrée, rangées avec leurs raisons en sortie, et la trace quand elle est demandée |
| `POST /v1/profile` | Ce que l'algorithme conclut d'un instantané : centres d'intérêt, chaînes, vidéos récentes |
| `POST /v1/topics` | Pour une liste de titres, le centre d'intérêt auquel chacun appartient |

Un plan ou un historique que le service ne détient plus reçoit un `409` ; Server le
renvoie alors. Les formes exactes sont les modèles de [`recommender/contract.py`](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/recommender/contract.py) et des fichiers
`contract_*.py` à côté.

## Règles que tout algorithme suit {#principles}

1. **Il dit ce qu'il lit.** Un algorithme liste les catégories de données qu'il
   utilise, et le moteur retire les autres de l'instantané avant de l'appeler. « Ne
   lit jamais votre historique » est vrai par construction.
2. **Chaque réglage est exposé.** Chaque poids, seuil, plafond et durée d'atténuation
   est déclaré avec son type, ses bornes et sa valeur par défaut, et montré à
   l'utilisateur.
3. **Chaque rangée a une raison.** Une rangée porte le genre de raison et l'élément ou
   la conclusion qui est derrière ; chaque vidéo porte ce qui l'a amenée.
4. **Les conclusions sont montrées.** Ce qui a été déduit (centres d'intérêt, chaînes,
   vidéos récentes) sort du même code que le classement, avec l'origine de chaque
   conclusion.
5. **Les décisions de l'utilisateur l'emportent.** Les centres d'intérêt masqués ou
   épinglés, les chaînes ignorées et les éléments exclus sont respectés par tous les
   algorithmes.
6. **Le hasard est déclaré.** Un algorithme qui tire au sort le dit et prend une
   graine : la même graine et les mêmes données donnent la même page.
7. **Un seul chemin de code.** Le profil et la trace que voit un utilisateur viennent
   du calcul qui a construit sa page. Il n'y a pas d'explication séparée.

## Écrire un algorithme {#write}

Un algorithme est un fichier dans `recommender/algorithms/`. Il déclare son nom et ses
textes, les données qu'il lit, ses réglages, et implémente deux étapes : planifier les
sources, puis classer les candidates en rangées. Enregistrez-le dans
`recommender/registry.py`.

Partez de [`subscriptions.py`](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/recommender/algorithms/subscriptions.py), le plus petit, et lisez d'abord [`CONTRIBUTING.md`](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/CONTRIBUTING.md) : il dit comment le code
est écrit et comment prouver qu'un changement n'a modifié aucune page.

```sh
docker compose up -d --build
uv run pytest
```

La première commande démarre le service sur le port `8190` avec sa propre base et son
propre cache. Les tests utilisent un substitut du modèle de langue par hachage de
mots : ils ne demandent donc aucun téléchargement.

## Comment Signals lit un historique {#signals}

La famille Signals (Signals, chaînes, vidéos, mélange) partage une même lecture de
l'historique :

- **Chaînes.** Une chaîne compte par le nombre de vidéos différentes regardées chez
  elle, avec une atténuation de moitié tous les 30 jours. Les minutes regardées ne
  comptent pas.
- **Centres d'intérêt.** Les titres des vidéos regardées jusqu'au bout sont comparés
  par leur sens avec un modèle de phrases multilingue, et regroupés quand ils sont
  assez proches en moyenne. Un groupe porte le nom des mots que ses titres ont en
  commun. Les titres qui ne disent rien d'un sujet sont laissés de côté.
- **Vidéos récentes.** Une vidéo qui vient d'être regardée oriente la page tout de
  suite ; son effet diminue de moitié avec le temps et s'arrête après quelques heures.

Les Shorts sont suivis à part et ne jouent aucun rôle par défaut dans les recommandations de vidéos classiques.
Dans la famille Signals, **Let Shorts shape the home page** est désactivé par défaut ;
si vous activez ce réglage, les Shorts peuvent aussi influer sur les vidéos classiques du fil.

Le modèle tourne en local dans le service, sur le processeur. Il est téléchargé une
fois au premier démarrage et rien n'est envoyé à un tiers ensuite.

## Versions {#versions}

Signals suit le [versionnage sémantique](https://semver.org). Un correctif ne change
aucune page, une version mineure peut changer ce que les pages montrent ou ajouter des
réglages, une version majeure change le contrat avec Server. Tant que le numéro
commence par 0, tout peut encore changer. La version qui tourne sur une instance est
affichée sur sa page À propos.

Le service est sous licence GNU Affero General Public License, version 3.

## Références {#source-references}

- [Dépôt de Signals](https://github.com/TypeType-Video/TypeType-Signals)
- [Modèles du contrat](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/recommender/contract.py)
- [Intégration du service dans Server](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-services/src/main/kotlin/dev/typetype/server/RecommenderServices.kt)
