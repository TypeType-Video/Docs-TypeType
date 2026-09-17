# Lecteur intégré

TypeType propose une route de lecteur dédiée pour intégrer des vidéos YouTube sans le
reste de la page de lecture.

## Format d'URL

Utilisez l'identifiant de la vidéo YouTube après `/embed/` :

```text
https://votre-instance.exemple/embed/ID_VIDEO
```

L'identifiant est la valeur de 11 caractères après `v=` dans une URL de visionnage
YouTube classique. Par exemple, `https://www.youtube.com/watch?v=dQw4w9WgXcQ` devient
`/embed/dQw4w9WgXcQ`.

## Position de départ et lecture automatique

| Paramètre | Valeur | Comportement |
| --- | --- | --- |
| `t` | Secondes ou une durée | Position de départ |
| `start` | Secondes ou une durée | Alias de `t` |
| `time_continue` | Secondes ou une durée | Alias compatible Invidious pour `t` |
| `autoplay` | `1` | Demande la lecture automatique |

Les durées peuvent combiner heures, minutes et secondes, comme `1h30m15s`. Quand
plusieurs paramètres de départ sont présents, TypeType utilise `t`, puis `start`, puis
`time_continue`. Les valeurs invalides ou négatives démarrent depuis le début.

```text
/embed/dQw4w9WgXcQ?t=90
/embed/dQw4w9WgXcQ?start=1m30s
/embed/dQw4w9WgXcQ?time_continue=45&autoplay=1
```

La lecture automatique reste soumise à la politique média du navigateur. Un navigateur
peut exiger un geste utilisateur avant de démarrer le son.

## Ajouter une iframe

```html
<iframe
  src="https://votre-instance.exemple/embed/dQw4w9WgXcQ?autoplay=1"
  title="Lecteur vidéo TypeType"
  allow="autoplay; fullscreen; picture-in-picture"
  allowfullscreen
  loading="lazy"
></iframe>
```

Donnez à l'iframe une taille responsive explicite dans la page qui l'entoure. Par
exemple :

```css
.video-embed {
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 0;
}
```

Ajoutez `class="video-embed"` à l'iframe en utilisant cet exemple.

### Vérifiez l'iframe, pas seulement l'URL

Ouvrir `/embed/...` directement et obtenir une réponse `200` prouve que la route et le
lecteur fonctionnent comme une page de premier niveau. Cela ne prouve pas qu'un autre
site peut l'encadrer. Testez l'URL finale à l'intérieur d'une iframe sur une autre
origine.

Un reverse proxy ou un CDN qui ajoute `X-Frame-Options: DENY` bloque l'intégration
même si la page directe et toutes les requêtes média fonctionnent. Une politique de
sécurité du contenu (CSP) restrictive avec la directive `frame-ancestors` peut faire
la même chose. Gardez la protection anti-cadrage sur les pages TypeType normales, mais
n'envoyez pas `X-Frame-Options: DENY` sur `/embed/*`. Utilisez la directive CSP
`frame-ancestors` sur cette route si vous devez restreindre quels sites peuvent
l'intégrer.

## Comptes, paramètres et accès invité

Ouvrir une URL d'intégration directement dans un onglet de navigateur peut réutiliser
le compte TypeType courant et ses paramètres de lecture. Dans une iframe, la lecture
est anonyme et ne lit ni la session TypeType ni les paramètres du site qui l'intègre.

L'instance doit donc autoriser l'accès invité pour la lecture en iframe. Un
administrateur peut activer **Autoriser le mode invité** depuis les paramètres
d'administration de TypeType. Quand l'accès invité est désactivé, l'intégration
affiche un message dédié avec un lien vers la page de lecture normale au lieu de
tenter la lecture.

L'intégration affiche aussi les mêmes états indisponible, programmé, et réservé aux
membres que la page de lecture. Les échecs de chargement temporaires proposent une
action de nouvel essai quand c'est sûr de réessayer.
