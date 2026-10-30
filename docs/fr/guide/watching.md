# Lecture et le lecteur

Ouvrez n'importe quelle vidéo pour arriver sur la page de lecture : le lecteur, les
détails, les vidéos apparentées, et les commentaires.

![Une vidéo en cours de lecture sur une instance auto-hébergée](/watch.gif)

## Contrôles du lecteur {#player-controls}

Le lecteur dispose des contrôles habituels (lecture et pause, défilement, volume,
plein écran) plus un menu de paramètres où vous choisissez :

- **La qualité**, choisissez une résolution, ou laissez-la s'adapter. Une valeur par
  défaut peut être définie dans les [Paramètres](./settings#playback).
- **La vitesse de lecture**.
- **Les sous-titres**, choisissez une piste quand la vidéo en propose.
- **La piste audio**, changez de langue quand plusieurs sont disponibles. Une langue
  audio préférée peut être définie dans les [Paramètres](./settings#languages).

La barre de progression et les contrôles prennent la couleur du lecteur choisie dans
[Paramètres > Interface](./settings#what-you-see).

![Le lecteur avec une barre de progression violette](/screenshot-player-color.png)

## Audio uniquement {#audio-only}

Choisissez **Audio uniquement** sous la vidéo pour ne charger que le son. Le lecteur
affiche la miniature et le titre à la place de l'image, garde les mêmes contrôles et
continue d'afficher les sous-titres : activez-les avec le bouton **CC**. Choisissez
de nouveau **Audio uniquement** pour retrouver l'image. Pour lancer chaque vidéo de
cette façon, activez **Audio-only playback** dans
[Paramètres > Lecture](./settings#playback).

![Lecture en audio seul avec les sous-titres anglais sous le titre](/screenshot-audio-only-subtitles.png)

Quand vous lisez une playlist, le panneau de la playlist a son propre interrupteur
**Audio-only playback**. Il part de votre réglage de Lecture et ne vaut que pour
cette playlist : une playlist de musique peut rester en audio seul pendant que les
autres vidéos gardent l'image.

## Mode cinéma et picture-in-picture {#cinema-mode-and-picture-in-picture}

- Le **mode cinéma** élargit le lecteur et assombrit la page, pour une vue centrée,
  façon théâtre.
- Le **picture-in-picture** fait apparaître la vidéo dans une fenêtre flottante pour
  continuer à regarder en naviguant, en utilisant le picture-in-picture natif de
  votre navigateur.

![Le mode cinéma, le lecteur élargi avec la page assombrie](/cinema.gif)

## SponsorBlock {#sponsorblock}

Les segments marqués par la communauté (sponsors, autopromotion, et plus) s'affichent
sur la barre de défilement et peuvent être **passés automatiquement ou simplement
marqués**. Vous décidez du comportement et des catégories concernées, voir les
[Paramètres](./settings#sponsorblock).

## Raccourcis clavier {#keyboard-shortcuts}

Les touches standard du lecteur sont disponibles :

| Touche | Action |
| --- | --- |
| `k` ou `Espace` | Lecture / pause |
| `f` | Plein écran |
| `m` | Muet |
| `c` | Sous-titres activés / désactivés |
| `i` | Picture-in-picture |
| `j` ou `←` | Reculer |
| `l` ou `→` | Avancer |
| `↑` / `↓` | Volume plus fort / plus bas |

En plus de ça, TypeType ajoute :

| Touche | Action |
| --- | --- |
| `Espace` (maintenu) | Avance rapide tant que maintenu, relâchez pour reprendre |
| `,` | Reculer d'une image (en pause) |
| `.` | Avancer d'une image (en pause) |

## Gestes tactiles {#touch-gestures}

Sur un écran tactile :

- **Glissez à gauche ou à droite** sur la vidéo pour la faire défiler.
- **Appuyez et maintenez** la vidéo pour avancer rapidement.

## Lecture automatique {#autoplay}

Une fois activée, la vidéo suivante démarre automatiquement quand la vidéo en cours se
termine. Basculez-la dans les [Paramètres](./settings#playback).

## Quand le serveur est saturé {#when-the-server-is-busy}

Si YouTube limite l'instance, le lecteur affiche **Le service vidéo est saturé.
Nouvelle tentative…** et réessaie après le délai demandé par le serveur. Si le
service reste indisponible, le message vous invite à réessayer dans un instant.

## Lives {#livestreams}

Les lives YouTube utilisent le lecteur SABR natif de TypeType. Le lecteur suit le
direct automatiquement, continue de mettre en mémoire tampon pendant de courtes
interruptions réseau, et permet de naviguer dans la fenêtre DVR quand le live en
propose une.

## Lecteur intégré {#embedded-player}

TypeType propose une route dédiée pour intégrer des vidéos YouTube. Voir
[Lecteur intégré](./embedding) pour le format d'URL, les paramètres, le balisage
iframe, et les conditions d'accès invité.

## Shorts {#shorts}

Les Shorts se lisent dans un lecteur vertical dédié, défilable au doigt. Vous pouvez
désactiver entièrement la surface Shorts dans les [Paramètres](./settings#what-you-see).
