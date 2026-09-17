# Lecture et le lecteur

Ouvrez n'importe quelle vidéo pour arriver sur la page de lecture : le lecteur, les
détails, les vidéos apparentées, et les commentaires.

![La page de lecture](/screenshot-watch.png)

---

![Une vidéo en cours de lecture sur une instance auto-hébergée](/watch.gif)

## Contrôles du lecteur

Le lecteur dispose des contrôles habituels (lecture et pause, défilement, volume,
plein écran) plus un menu de paramètres où vous choisissez :

- **La qualité**, choisissez une résolution, ou laissez-la s'adapter. Une valeur par
  défaut peut être définie dans les [Paramètres](./settings#playback).
- **La vitesse de lecture**.
- **Les sous-titres**, choisissez une piste quand la vidéo en propose.
- **La piste audio**, changez de langue quand plusieurs sont disponibles. Une langue
  audio préférée peut être définie dans les [Paramètres](./settings#languages).

## Mode cinéma et picture-in-picture

- Le **mode cinéma** élargit le lecteur et assombrit la page, pour une vue centrée,
  façon théâtre.
- Le **picture-in-picture** fait apparaître la vidéo dans une fenêtre flottante pour
  continuer à regarder en naviguant, en utilisant le picture-in-picture natif de
  votre navigateur.

![Le mode cinéma, le lecteur élargi avec la page assombrie](/cinema.gif)

## SponsorBlock

Les segments marqués par la communauté (sponsors, autopromotion, et plus) s'affichent
sur la barre de défilement et peuvent être **passés automatiquement ou simplement
marqués**. Vous décidez du comportement et des catégories concernées, voir les
[Paramètres](./settings#sponsorblock).

## Raccourcis clavier

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

## Gestes tactiles

Sur un écran tactile :

- **Glissez à gauche ou à droite** sur la vidéo pour la faire défiler.
- **Appuyez et maintenez** la vidéo pour avancer rapidement.

## Lecture automatique

Une fois activée, la vidéo suivante démarre automatiquement quand la vidéo en cours se
termine. Basculez-la dans les [Paramètres](./settings#playback).

## Lives

Les lives YouTube utilisent le lecteur SABR natif de TypeType. Le lecteur suit le
direct automatiquement, continue de mettre en mémoire tampon pendant de courtes
interruptions réseau, et permet de naviguer dans la fenêtre DVR quand le live en
propose une.

## Lecteur intégré

TypeType propose une route dédiée pour intégrer des vidéos YouTube. Voir
[Lecteur intégré](./embedding) pour le format d'URL, les paramètres, le balisage
iframe, et les conditions d'accès invité.

## Shorts

Les Shorts se lisent dans un lecteur vertical dédié, défilable au doigt. Vous pouvez
désactiver entièrement la surface Shorts dans les [Paramètres](./settings#what-you-see).
