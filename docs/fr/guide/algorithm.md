# Choisir son algorithme

::: warning Expérimental
Les algorithmes décrits ici sont en version 0.0.1. Ce qu'ils affichent, leurs réglages
et leurs noms peuvent encore changer. La page n'existe que sur une instance dont
l'hébergeur a installé le service de recommandations et l'a activé.
:::

TypeType peut construire votre accueil avec un algorithme que vous choisissez, que vous
pouvez lire et régler. Il dit quelles données il lit, chaque rangée de l'accueil dit
pourquoi elle est là, et ce qu'il a déduit de vous vous est montré et se corrige.

Seul l'accueil change. La recherche, les abonnements et l'historique restent les mêmes.

## L'activer {#turn-on}

1. Ouvrez **Algorithme** dans le menu.
2. Sous **Accueil par algorithme**, activez **Construire mon accueil avec un
   algorithme que je choisis**.
3. Sous **Algorithme de l'accueil**, choisissez-en un. Si vous hésitez, ouvrez **Quel
   algorithme me correspond ?** : il les compare côte à côte.
4. Revenez à l'accueil.

La première page peut prendre quelques secondes. En attendant, vous voyez l'accueil
habituel avec le message « Votre accueil mijote » ; le nouveau le remplace tout seul.

Si **Algorithme** n'est pas dans le menu, votre instance ne le propose pas. Sur
certaines instances, l'administrateur l'a activé pour tout le monde : l'option est
alors déjà active, et vous pouvez la désactiver.

Sur un compte vide, l'accueil affiche une carte de bienvenue avec deux boutons,
**Importer mes données** et **Choisir mon algorithme**. Un algorithme n'a rien sur
quoi travailler tant que vous n'avez pas importé vos données ou regardé quelques
vidéos.

## Les algorithmes {#algorithms}

Il n'y a pas de bonne réponse, seulement différentes façons de regarder.

| Algorithme | Ce que vous verrez | Données lues |
| --- | --- | --- |
| Abonnements | Les dernières vidéos des chaînes que vous suivez, dans l'ordre de publication : aujourd'hui, les sept derniers jours, avant. Rien n'est déduit de vous. | Abonnements |
| Découverte | Les nouvelles vidéos de vos abonnements, des vidéos liées à celles-ci et à vos favoris venant de chaînes que vous ne suivez pas, et les tendances. | Abonnements et favoris. Jamais votre historique. |
| Signals | Les vidéos commencées, d'autres vidéos des créateurs que vous avez regardés, des rangées par sujet, et une rangée de créateurs que vous n'avez jamais regardés. Il réagit en quelques minutes à ce que vous venez de regarder. | Historique des vidéos, favoris, abonnements |
| Signals, chaînes | Les dernières vidéos des créateurs que vous regardez le plus, et de vos abonnements. | Historique des vidéos, favoris, abonnements |
| Signals, vidéos | Les sujets de ce que vous regardez, quel que soit l'auteur de la vidéo. | Historique des vidéos, favoris |
| Signals, mélange | Les créateurs que vous regardez, et des vidéos sur vos sujets venant de n'importe quel créateur. | Historique des vidéos, favoris, abonnements |

Dans le guide, chaque algorithme porte trois jauges, de nulle à élevée :

- **Personnalisation** : à quel point l'accueil dépend de ce que vous regardez.
- **Découverte** : la place laissée aux chaînes que vous ne connaissez pas encore.
- **Variété** : à quel point la page change d'un rafraîchissement à l'autre.

Tous les algorithmes lisent aussi ce que vous avez marqué **Pas pour moi**, pour
l'écarter, et tous sauf Abonnements lisent ce qui a été affiché récemment sur votre
accueil, pour ne pas le répéter.

Un algorithme ne reçoit que les données qu'il annonce sous **Données utilisées**.
Celui qui ne lit pas votre historique ne le reçoit jamais.

Vous pouvez en changer à tout moment. Vos données et les réglages de chaque algorithme
sont conservés.

## La page Algorithme, section par section {#page}

### Vue d'ensemble

Deux graphiques : de quoi votre accueil est fait (vidéos commencées, regardé
récemment, abonnements, vos centres d'intérêt, nouveaux créateurs, tendances) et la
part de chacun de vos centres d'intérêt. Chaque part mène à l'endroit où elle se
règle.

### Données utilisées {#data}

La page présente les six catégories de données dont TypeType permet de régler l'usage
pour les recommandations : historique des vidéos, historique des Shorts, favoris,
abonnements, chaînes et vidéos bloquées, et vidéos signalées « Pas pour moi ».
L'historique de recherche n'y figure pas et n'est pas transmis à Signals. En bleu, ce
que l'algorithme actuel lit ; en gris, ce qui est conservé sans servir à l'accueil.

Ouvrez une catégorie pour régler :

- **Collecter** : l'historique des vidéos et celui des Shorts partagent ce réglage.
  Désactivé, aucun nouveau visionnage n'est enregistré ; l'existant reste soumis à la
  durée de conservation.
- **Utiliser pour l'accueil** : désactivé, les éléments restent enregistrés mais aucun
  algorithme ne les lit.
- **Remonter jusqu'à** : jusqu'où l'algorithme remonte, de quelques jours à sans
  limite. Les éléments plus anciens restent dans votre compte ; ils cessent seulement
  de compter pour l'accueil.
- **Exclure** sur un élément : il est conservé et n'est jamais lu. **Réintégrer** le
  remet.

Aucun de ces choix ne supprime quoi que ce soit.

### Ce qu'il retient {#profile}

Ce que l'algorithme a déduit de vos données. C'est vide tant que vous n'avez pas
regardé quelques vidéos.

- **Centres d'intérêt.** Chacun porte le nom des mots que les titres de ses vidéos ont
  en commun, et indique sur combien d'éléments il repose, avec quelques-unes de vos
  vidéos. Sur chacun :
  - **Épingler** : il a toujours sa rangée sur l'accueil ;
  - **Masquer** : il ne revient plus sur l'accueil ;
  - **Ne pas prendre en compte** : il ne compte plus comme centre d'intérêt, mais ses
    vidéos peuvent encore apparaître.
- **Ajouter un sujet** avec vos mots, dans n'importe quelle langue (« astronomie »,
  « cuisine japonaise »). L'algorithme cherche alors des vidéos dessus.
- **Chaînes les plus regardées.** Sélectionnez-en une pour voir sur quoi elle repose,
  ou pour qu'elle ne compte plus.
- **Regardé récemment.** Les vidéos regardées il y a peu qui orientent encore
  l'accueil, chacune avec les minutes pendant lesquelles elle compte encore.
  **Oublier** retire son effet sans effacer votre historique.

Les centres d'intérêt sont trouvés par le sens des titres, dans toutes les langues :
une vidéo titrée en arabe et une autre titrée en anglais sur le même sujet se
retrouvent ensemble.

Un changement s'applique au prochain rafraîchissement de l'accueil.

### Détails {#details}

**Tous les réglages** liste chaque réglage de l'algorithme choisi, par famille :

| Famille | Ce qu'elle règle |
| --- | --- |
| Sources | Où l'algorithme cherche les vidéos candidates |
| Pondérations | Ce qui compte le plus pour classer les candidates |
| Vidéos récentes | Combien de temps une vidéo regardée oriente l'accueil |
| Page | La taille de la page et sa répartition |
| Découverte | La place laissée à ce que vous ne regardez pas encore |
| Hasard | Si l'accueil change à chaque rafraîchissement |

Chaque réglage affiche sa valeur par défaut et un bouton **Rétablir**, et **Rétablir
les valeurs par défaut** les remet tous. Sans hasard, les mêmes données donnent
toujours la même page.

**Construction du dernier accueil** montre, pour la page que vous venez de voir :
combien de vidéos ont été trouvées et depuis quelles sources, combien ont été écartées
et pourquoi (déjà regardées, bloquées, centres d'intérêt masqués, trop d'une même
chaîne, données exclues, Shorts), les rangées avec la raison de chacune, et les
meilleurs scores avec ce qui a fait chacun. Cela vient du calcul même qui a construit
la page.

S'il est écrit qu'aucun accueil n'a encore été construit par un algorithme, ouvrez
d'abord l'accueil.

**Code source** renvoie au code de l'algorithme choisi.

### Mes avis {#opinions}

Les avis que vous avez donnés sur l'accueil, chacun avec un bouton **Retirer**. Seul
ce que vous avez choisi d'envoyer est conservé, avec l'algorithme et les réglages que
vous aviez à ce moment-là. Cela part avec votre export.

## Sur l'accueil {#home}

- **Rangées et raisons.** Sous **Présentation de l'accueil**, choisissez **Comme
  d'habitude** (une seule grille) ou **Par catégories** (une rangée titrée par
  raison). Les vidéos sont les mêmes dans les deux cas.
- **Pas pour moi.** Sur une carte, **Pas pour moi** retire la vidéo aussitôt. Sous
  **Pourquoi ? (si vous voulez)**, vous pouvez répondre **Déjà vue**, **Pas cette
  chaîne**, **Pas ce sujet** ou **Autre**. **Annuler** remet la carte. Après **Pas ce
  sujet**, la carte propose **Masquer le sujet** ; un sujet masqué se retrouve sous
  **Ce qu'il retient**.
- **Cette page vous convient ?** Répondez **Bien** ou **Pas bien**, et dites ce qui
  cloche si vous voulez : trop répétitif, sans rapport avec vous, trop de vieilles
  vidéos, il manque vos chaînes. Rien n'est envoyé si vous ne répondez pas.

## Le désactiver {#turn-off}

Désactivez **Construire mon accueil avec un algorithme que je choisis**. Vous
retrouvez aussitôt l'accueil habituel. Vos choix, corrections et avis sont conservés
au cas où vous reviendriez.

## Références

- [Dépôt de Signals](https://github.com/TypeType-Video/TypeType-Signals)
- [Installer le service de recommandations](/fr/self-hosting/recommender)
