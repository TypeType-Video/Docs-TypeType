# Importer vos données

Une fois votre instance lancée et votre compte créé, vous pouvez rapatrier vos
abonnements, playlists, historique et le reste depuis l'application que vous
utilisiez, puis les exporter plus tard vers une autre application. Ouvrez
**Transfert de données** dans la barre latérale ; les nouveaux comptes y arrivent
juste après l'inscription.

## Applications prises en charge {#supported-apps}

| Application ou format | Fichier | Import | Export |
| --- | --- | --- | --- |
| TypeType | `.json` | tout | tout |
| PipePipe | `.zip` | oui | non |
| NewPipe | `.zip` | oui | oui |
| Invidious | `.json` | oui | oui |
| Piped | `.json` | oui | oui |
| LibreTube | `.json` | oui | oui |
| ViewTube | `.zip` | oui | non |
| Flow | `.json` | oui | oui |
| Grayjay | `.zip` | oui | oui |
| YouTube Takeout | `.zip` | oui | non |
| OPML | `.opml` | abonnements | abonnements |
| Materialious | `.json` | abonnements | abonnements |
| SkyTube | `.opml` | abonnements | abonnements |
| youtube-local | `.opml` | abonnements | abonnements |

Ce qui passe dépend de ce que chaque application enregistre : abonnements, groupes
d'abonnements, historique, playlists, À regarder plus tard, favoris, progression de
lecture, historique de recherche, playlists enregistrées, paramètres ou filtres de
contenu. Une sauvegarde TypeType contient tout. Quand un format ne garde qu'une
partie d'une catégorie, l'aperçu et le rapport final le signalent.

![Le menu Importer depuis avec toutes les sources prises en charge](/screenshot-import-sources.png)

## Importer {#import}

1. Exportez une sauvegarde depuis votre application actuelle, et gardez le fichier
   tel quel : ne le décompressez pas et ne le modifiez pas.
2. Dans **Transfert de données**, restez sur **Importer** et laissez **Importer
   depuis** sur **Détection automatique**, ou choisissez l'application vous-même.
3. Déposez le fichier, ou choisissez-le. La limite est de 512 Mo.
4. TypeType analyse le fichier et affiche un aperçu : la source détectée, le nombre
   d'éléments trouvés par catégorie, les doublons et les remarques de compatibilité.
   Rien n'est écrit avant cette étape.
5. L'import démarre ensuite tout seul pour tout ce qui a été détecté. Les éléments que
   vous avez déjà sont ignorés. Vous pouvez quitter la page, l'import continue.

À la fin, un rapport liste ce qui a été importé et ce qui a été ignoré, et vous
pouvez le télécharger.

## Depuis YouTube (Google Takeout) {#from-youtube-google-takeout}

Takeout apporte vos **abonnements, votre historique, vos playlists, À regarder plus
tard et vos vidéos likées** (en favoris).

1. Choisissez **YouTube Takeout** dans **Importer depuis**, puis **Ouvrir Google
   Takeout** : le lien présélectionne YouTube et Mon activité. Gardez Mon activité si
   vous voulez votre historique.
2. Créez un export ZIP ponctuel et téléchargez-le depuis Google.
3. Déposez le ZIP d'origine. Si Google a découpé l'export en plusieurs ZIP,
   importez-les un par un.

L'import supprime les abonnements, playlists et vidéos en double, réutilise une
playlist existante quand elle correspond, et range les playlists système de YouTube
dans les **Favoris** et **À regarder plus tard** de TypeType plutôt que dans des
playlists ordinaires. L'activité « J'aime » peut aussi remplir les Favoris quand la
playlist système manque ou est incomplète ; la date et l'ordre d'origine sont
conservés. Les lignes aux métadonnées incomplètes sont complétées en arrière-plan,
si bien que la playlist s'ouvre tout de suite.

Si l'import indique qu'aucune donnée de compte n'a été trouvée, vous avez déposé une
partie de l'export qui ne contient que des vidéos : choisissez le ZIP qui contient
l'historique, les abonnements ou les playlists. S'il indique que l'archive dépasse
les limites ou est chiffrée, exportez de nouveau YouTube en parties ZIP plus petites.

## Exporter {#export}

Dans l'onglet **Exporter**, choisissez un **Format de destination** et les catégories
à inclure, puis **Générer l'export** et téléchargez le fichier. Une destination qui
ne peut pas garder tous les champs de TypeType affiche un avertissement, et le
rapport liste ce qui n'a pas pu être conservé. Un export TypeType garde tout : c'est
la sauvegarde à utiliser pour passer à une autre instance TypeType.

**Paramètres > Données** crée et restaure aussi directement une sauvegarde TypeType.
Une restauration y remplace les catégories contenues dans la sauvegarde.

## Références {#source-references}

- [Formats pris en charge](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-portability/src/main/kotlin/dev/typetype/server/portability/PortabilityFormat.kt)
- [Imports et exports enregistrés](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-portability/src/main/kotlin/dev/typetype/server/portability/PortabilityEngineFactory.kt)
- [Analyse de Takeout et dédoublonnage](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-services/src/main/kotlin/dev/typetype/server/services/YoutubeTakeoutParserService.kt)
- [Réparation des métadonnées en arrière-plan](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-services/src/main/kotlin/dev/typetype/server/services/UserVideoMetadataRepairService.kt)
