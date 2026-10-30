# Paramètres

Ouvrez **Paramètres** depuis le menu latéral. La page compte onze sections, listées à
gauche : Lecture, Vidéo, Interface, Langues, Services, Notifications, Données, API,
Confidentialité, Contenu bloqué et À propos. La plupart des choix sont enregistrés
sur votre instance et suivent votre compte dans chaque navigateur. Le thème, la
langue de l'interface et la couleur du lecteur restent dans le navigateur où vous les
avez réglés.

![La section Lecture de la page des paramètres](/screenshot-settings.png)

## Lecture {#playback}

- **Lecture automatique**, lance la vidéo suivante automatiquement.
- **Autoplay countdown**, les secondes avant que la lecture automatique passe à la
  suite ; `0` lance tout de suite l'élément suivant d'une playlist.
- **Skip playlist autoplay screen**, passe directement à l'élément suivant de la
  playlist, en gardant le compte à rebours pour les recommandations.
- **Masquer les prochaines vidéos des playlists**, cache les titres et miniatures des
  éléments suivants.
- **Audio-only playback**, ne charge que le flux audio quand le service en propose
  un. Voir [Audio uniquement](./watching#audio-only).
- **Default quality**, la résolution à laquelle les vidéos s'ouvrent.
- **Default playback speed**, appliquée au démarrage d'une vidéo.

La lecture YouTube utilise le chemin SABR avec état sur chaque navigateur pris en
charge. NicoNico et BiliBili conservent leurs propres chemins de lecture spécifiques.

## Vidéo et SponsorBlock {#sponsorblock}

La section **Vidéo** décide de ce que SponsorBlock fait des segments signalés par la
communauté :

- **SponsorBlock behavior**, **Ignorer** les segments automatiquement, les
  **Marquer** sur la barre sans les sauter, ou **Désactivé** pour ignorer
  SponsorBlock.
- **SponsorBlock categories**, choisissez **Ignorer**, **Marquer** ou **Masquer**
  pour chaque type de segment : message sponsorisé, autopromotion, rappel
  d'interaction, intro, écrans de fin, et d'autres.
- **Advanced display**, fixe une durée minimale de segment, affiche le segment en
  cours à côté du temps, affiche les chapitres et les étiquettes de vidéo entière,
  saute ces étiquettes à la main, coupe le son au lieu de sauter, et ne saute les
  passages sans musique que sur les clips musicaux.

La même section contient deux interrupteurs de la page de lecture : **Autoplay next
video**, qui enchaîne avec la première suggestion, et **Lecture automatique à
l'ouverture**, qui lance une vidéo dès que vous l'ouvrez.

![Comportement et catégories de SponsorBlock](/screenshot-sponsorblock.png)

## Interface {#what-you-see}

**Démarrage** règle la **Default landing page** : Accueil, Abonnements, Historique,
Playlists, À regarder plus tard ou Favoris.

**Disposition** règle le nombre de **Vidéos par ligne**, le **Thème** (système,
clair ou sombre), la **Taille des vidéos associées** sur la page de lecture et la
**Couleur du lecteur**. Cette couleur s'applique à la barre de progression et aux
contrôles du lecteur, en vidéo comme en audio seul. Choisissez par défaut, blanc,
rouge, rose, violet, bleu, vert ou orange ; la barre sous les pastilles montre le
résultat.

![Choisir une couleur du lecteur dans Paramètres > Interface](/player-color.gif)

**Surfaces de découverte** désactive des parties de TypeType :

- **DeArrow titles and thumbnails**, titres écrits par la communauté et miniatures
  représentatives pour les vidéos YouTube.
- **Continue watching** et **Recommandations de l'accueil**, masquent les vidéos en
  cours ou les recommandations personnalisées de l'accueil. Voir
  [Choisir son algorithme](/fr/guide/algorithm) pour la construction de l'accueil.
- **Related videos**, masque la colonne de suggestions sur la page de lecture.
- **Comments and danmaku**, arrête de charger les commentaires et les commentaires
  défilants.
- **Shorts surface**, masque les vidéos courtes partout ainsi que la page Shorts.
- **Live streams**, masque les directs en cours et programmés du fil
  d'abonnements.
- **Members-only videos**, masque les vidéos réservées aux membres payants d'une
  chaîne.
- **Masquer everything**, désactive d'un coup toutes les surfaces ci-dessus.

![Surfaces de découverte dans Paramètres > Interface](/screenshot-content-toggles.png)

## Langues {#languages}

- **Langue de l'interface**, anglais, chinois simplifié, français ou allemand, sur
  cet appareil.
- **Sous-titres**, active les sous-titres par défaut ; **Langue des sous-titres**
  choisit la piste préférée.
- **Langue audio**, la piste audio à choisir quand une vidéo en propose plusieurs.
- **Préférer la langue d'origine**, garde toujours l'audio original plutôt qu'une
  piste doublée.

## Services {#service}

Choisissez le service par défaut, **YouTube, NicoNico ou BiliBili**, pour que la
recherche et la navigation visent la bonne source. Le menu des services en haut de la
page permet aussi d'en changer.

## Notifications, données et clés API

- **Notifications** active ou coupe les fenêtres de notification pour les nouvelles
  vidéos et vous laisse choisir les chaînes abonnées qui vous préviennent. Les
  nouvelles chaînes sont désactivées au départ.
- **Données** exporte une sauvegarde TypeType des catégories choisies, en restaure
  une et ouvre le [transfert de données](/fr/self-hosting/importing-data) vers
  d'autres applications. Une restauration remplace les catégories contenues dans la
  sauvegarde.
- **API** crée et révoque les clés des applications externes, comme
  [Discord Rich Presence](./discord-rich-presence).

## Confidentialité et contenu bloqué

**Confidentialité** gère l'enregistrement de l'historique et efface l'historique de
visionnage, l'historique de recherche ou les abonnements. **Contenu bloqué** liste
les chaînes, vidéos et mots-clés que vous avez masqués. Les deux sont décrits dans
[Confidentialité et blocage](./privacy).

## À propos {#about}

La section À propos affiche la version, la révision complète et l'heure de build
renvoyées par l'application web, Server, Token et Downloader. Chaque composant est
vérifié séparément, si bien qu'un service interne indisponible ne masque pas les
informations de version renvoyées par les autres. Utilisez le bouton d'actualisation
après une mise à jour pour demander les valeurs actuelles.
