# Sources de la communauté et remerciements

La documentation est vérifiée par rapport au code, mais le code seul ne montre pas
tous les échecs de déploiement et n'explique pas quel détail déroute un exploitant. Les
signalements de la communauté apportent cette preuve manquante. Cette page recense les
personnes et les fils qui ont directement façonné la documentation actuelle.

## Contributeurs cités dans la documentation {#contributors-referenced-in-the-documentation}

| Contributeur | Signalement ou discussion | Documentation améliorée |
| --- | --- | --- |
| [arcoast](https://github.com/arcoast) | [Connexion distante à YouTube, discussion #122](https://github.com/TypeType-Video/TypeType/discussions/122) | Exigences du proxy pour les WebSockets et diagnostic du nginx périmé |
| [arcoast](https://github.com/arcoast) | [Nommage des variables de base de données, discussion #123](https://github.com/TypeType-Video/TypeType/discussions/123) | Les variables PostgreSQL comme unique source de vérité au niveau de la stack |
| [arcoast](https://github.com/arcoast) | [Guide OIDC pour Authelia et Pocket ID, discussion #128](https://github.com/TypeType-Video/TypeType/discussions/128) | Exemples de fournisseurs testés et réglages de rappel |
| [arcoast](https://github.com/arcoast) | [Secret RPC de Garage, discussion #130](https://github.com/TypeType-Video/TypeType/discussions/130) | Génération d'un `GARAGE_RPC_SECRET` aléatoire pour les installations manuelles |
| [filippobaroni](https://github.com/filippobaroni) | [Ancienne lecture et migration de la stack, discussion #133](https://github.com/TypeType-Video/TypeType/discussions/133#discussioncomment-17779201) | Détection et migration des fichiers Compose qui utilisent encore l'ancien espace de noms d'images |
| [hugoghx](https://github.com/hugoghx) | [Environnement du conteneur Token, discussion #156](https://github.com/TypeType-Video/TypeType/discussions/156) | Nommage du service Token, limite du réseau interne et limites actuelles du durcissement |
| [hulmgulm](https://github.com/hulmgulm) | [Mise en place du premier administrateur, discussion #151](https://github.com/TypeType-Video/TypeType/discussions/151) | État de l'initialisation et dépannage CORS par origine exacte |
| [Toni-Vide](https://github.com/Toni-Vide) | [Déconnexions inattendues, discussion #162](https://github.com/TypeType-Video/TypeType/discussions/162) | Dépannage du jeton d'accès, du cookie de renouvellement et de la session |
| [nanhoes](https://github.com/nanhoes) | [Parcours de téléchargement sur iOS, issue #116](https://github.com/TypeType-Video/TypeType/issues/116) | Propagation de l'authentification et revue du chemin des artefacts |
| [lelam183](https://github.com/lelam183) | [Comportement des playlists importées, issue #135](https://github.com/TypeType-Video/TypeType/issues/135) | Dédoublonnage à l'import, rattachement des playlists système et réparation des métadonnées en arrière-plan |
| [BuggyPasta](https://github.com/BuggyPasta) | [Instructions de déploiement avec Dockge, discussion #277](https://github.com/TypeType-Video/TypeType/discussions/277) | Disposition de la stack sous Dockge, initialisation unique et retours d'exploitant sur l'installation manuelle |
| [hugoghx](https://github.com/hugoghx) | [Lecture des directs, issue #145](https://github.com/TypeType-Video/TypeType/issues/145) | Revue de la lecture en direct et de la fenêtre glissante |
| [Priveetee](https://github.com/Priveetee) | [Changements de qualité en direct, issue #163](https://github.com/TypeType-Video/TypeType/issues/163) | Notions de session en direct et de changement de qualité dans le guide de lecture |

Merci à toutes les personnes ci-dessus d'avoir publié des symptômes reproductibles, le
contexte de leur configuration et les résultats de leurs suivis. Leurs signalements
ont rendu le déroulé pris en charge plus clair pour ceux qui rencontreront la même
limite plus tard.

## Soutiens du projet {#project-supporters}

### Sponsor régulier {#recurring-sponsor}

Merci à [@Toastienergy](https://github.com/Toastienergy) de soutenir TypeType par une
contribution régulière sur GitHub Sponsors. Elle m'aide à couvrir l'infrastructure et à
passer plus de temps à améliorer le projet.

### Donateur ponctuel {#one-time-donor}

Je remercie aussi [@filippobaroni](https://github.com/filippobaroni) pour le don
ponctuel sur GitHub Sponsors qui a aidé à soutenir TypeType.

Si vous voulez soutenir TypeType financièrement, vous pouvez le faire par
[GitHub Sponsors](https://github.com/sponsors/Priveetee).

## Comment le matériau de la communauté est utilisé {#how-community-material-is-used}

Une discussion ou une issue n'est pas recopiée telle quelle dans le manuel. Avant de
devenir de la documentation :

1. Le dépôt propriétaire actuel est inspecté pour confirmer que le comportement existe
   toujours.
2. Les fichiers Compose et nginx centraux sont vérifiés pour le déploiement pris en
   charge.
3. Les valeurs sensibles et les détails propres à une instance sont retirés.
4. Le résultat est écrit comme une explication ou un diagnostic réutilisable.
5. Le contributeur d'origine et le fil public sont cités là où l'apport est utilisé.

C'est important parce qu'un ancien contournement peut devenir nuisible après un
changement de l'implémentation. Par exemple, l'enquête sur les WebSockets de la
discussion #122 reste utile, mais le correctif pris en charge consiste à utiliser la
configuration nginx intégrée actuelle, pas à recopier toute la stack sur mesure de
l'auteur du signalement.

## Issues et discussions {#issues-and-discussions}

Tous les signalements tournés vers les utilisateurs sont centralisés dans le dépôt
TypeType :

- [Suivi des issues](https://github.com/TypeType-Video/TypeType/issues) pour les bugs, les fonctions et les manques de la
  documentation.
- [Discussions](https://github.com/TypeType-Video/TypeType/discussions) pour les questions d'exploitants, les constats de
  déploiement, les idées et les exemples de configuration.

Quand vous signalez un problème, joignez les réponses `/api/version/*` utiles et
retirez les jetons, cookies, mots de passe, noms d'hôte internes et URL d'instances
privées. Voir [Signaler un problème](/fr/self-hosting/reporting-issues) pour la liste
complète.
