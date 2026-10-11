# Importer vos données

Une fois votre instance en marche et votre compte créé, vous pouvez ramener vos
abonnements, vos playlists et votre historique existants. TypeType importe depuis
deux sources : un export **Google Takeout**, ou une sauvegarde **PipePipe**.

Vous trouverez cela sur l'écran d'accueil juste après l'inscription, et à tout moment
ensuite sous **Importer** dans la barre latérale.

![L'écran d'import](/screenshot-onboarding.png)

## Depuis YouTube (Google Takeout) {#from-youtube-google-takeout}

Cela ramène vos **abonnements, playlists, favoris et historique de visionnage**
(l'historique et les favoris seulement si l'export contient les enregistrements Mon
activité correspondants).

1. Demandez un export Google Takeout de **YouTube et YouTube Music**, et ajoutez aussi
   **Mon activité** si vous voulez votre historique de visionnage. L'application vous
   donne un lien en un clic qui présélectionne les bons produits.
2. Attendez que Google le prépare, puis téléchargez le ou les fichiers ZIP. Les gros
   exports sont découpés en plusieurs ZIP, c'est normal.
3. Sur l'écran d'import, choisissez **Import from YouTube** et déposez **un ou
   plusieurs fichiers ZIP Takeout** (vous pouvez en sélectionner plusieurs d'un coup).
4. Lancez l'import, puis vérifiez vos abonnements et vos playlists.

::: warning La progression de l'import reste à zéro
Si l'aperçu réussit mais qu'un import reste à `00` catégorie sans avancer, notez
l'identifiant de la tâche et les chiffres de l'aperçu avant de l'annuler. Ce
comportement est suivi dans
[l'issue #276](https://github.com/TypeType-Video/TypeType/issues/276) ; il est
différent d'un fichier Takeout dont la détection a échoué. Ne joignez ni l'archive ni
aucune donnée de compte à un signalement.
:::

::: tip
Inutile de décompresser quoi que ce soit : envoyez les ZIP Takeout tels que Google
vous les donne.
:::

Quand vous sélectionnez plusieurs archives, le Frontend les traite et les enregistre
une par une. Chaque import retire les abonnements, playlists et URL de vidéos en
double ; réutilise une playlist existante quand sa correspondance d'origine ou son nom
correspond déjà ; et signale les entrées existantes comme ignorées. Une archive
suivante ignore donc les données déjà enregistrées par une précédente. Les playlists
système de YouTube sont rattachées aux **Favoris** et à **À regarder plus tard** de
TypeType au lieu d'apparaître en double comme des playlists ordinaires.

L'activité des vidéos aimées peut aussi restaurer les Favoris quand la playlist
système manque ou est incomplète. L'importeur garde l'heure d'origine de l'activité,
comprend les formats de date anglais et français de Takeout, et ignore les
enregistrements de vidéos aimées supprimées, privées ou indisponibles. Cela conserve
l'ordre d'origine au lieu d'attribuer des horodatages d'import dans l'ordre inverse.

Des lignes Takeout anciennes ou indisponibles peuvent ne contenir que des métadonnées
de secours. La playlist s'ouvre tout de suite et Server planifie la réparation des
métadonnées en arrière-plan, plutôt que de bloquer toute la réponse pendant qu'il
résout chaque élément.

Ces détails ont été revus après que
[lelam183 a signalé des playlists importées lentes, inversées et en double](https://github.com/TypeType-Video/TypeType/issues/135).

## Depuis PipePipe {#from-pipepipe}

Vous venez de l'application PipePipe ? Restaurez directement depuis sa sauvegarde.

1. Exportez une sauvegarde depuis PipePipe (un fichier `.zip`).
2. Sur l'écran d'import, choisissez **Import from PipePipe** et déposez le ZIP de
   sauvegarde.
3. Cela restaure votre **historique, vos abonnements, vos playlists et votre
   progression de lecture**.

## Après l'import {#after-importing}

Quand l'import se termine, il affiche un court rapport de ce qui a été ramené et de ce
qui a été ignoré, pour que vous voyiez exactement ce qui s'est passé. Vos abonnements
et vos playlists sont disponibles tout de suite.

## Références {#source-references}

- [Analyse du Takeout et dédoublonnage](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/YoutubeTakeoutParserService.kt)
- [Enregistrement d'un Takeout](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/YoutubeTakeoutImporterService.kt)
- [Réparation des métadonnées en arrière-plan](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/UserVideoMetadataRepairService.kt)
