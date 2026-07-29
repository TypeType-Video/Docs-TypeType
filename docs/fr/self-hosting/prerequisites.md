# Prérequis

**Langues :** [English](/self-hosting/prerequisites) · Français ·
[Español](/es/self-hosting/prerequisites)

## Hôtes pris en charge

TypeType nécessite un hôte Linux 64 bits. Les images publiées prennent en charge
`linux/amd64` et `linux/arm64` ; l'installateur sélectionne automatiquement la
configuration de cache ARM64 lorsque c'est nécessaire. Aucun GPU n'est requis.

::: tip Raspberry Pi
Un Raspberry Pi 4 ou 5 en 64 bits avec au moins 4 Gio de RAM peut faire fonctionner
une petite instance personnelle. Utilisez un SSD USB 3 plutôt qu'une carte microSD
pour Docker, PostgreSQL et les données Garage.
:::

## Dimensionnement des ressources

Ces valeurs correspondent aux ressources totales de l'hôte pour l'ensemble de la
stack Compose : application web, Server, Token, Downloader, PostgreSQL, cache et
Garage. Ce sont des objectifs de dimensionnement, pas des limites strictes.

| Profil | Processeur | RAM | Espace libre avant les téléchargements | Usage adapté |
| --- | --- | --- | --- | --- |
| Petite instance personnelle | 2 vCPU | 4 Gio | 20 Gio sur SSD | Une ou deux lectures simultanées et des téléchargements occasionnels |
| Recommandé | 4 vCPU | 8 Gio | 40 Gio sur SSD | Plusieurs utilisateurs, actualisation des abonnements et téléchargements réguliers |
| Usage intensif | 8+ vCPU | 16+ Gio | 100+ Gio et la capacité des fichiers téléchargés | De nombreuses sessions simultanées ou des téléchargements volumineux et répétés |

Le minimum de 4 Gio laisse une marge au-dessus de l'utilisation normale de la stack
complète et des pics courts de Server ou Token. Le processeur est généralement peu
sollicité, mais l'extraction, l'actualisation d'un grand nombre d'abonnements, le
démarrage des lectures et le muxage des téléchargements peuvent se chevaucher.
Dimensionnez l'hôte pour les utilisateurs simultanés, pas seulement pour les
conteneurs au repos.

La lecture ne charge pas et ne stocke pas toute la vidéo en mémoire. Une vidéo de dix
heures ne nécessite donc pas dix heures de RAM ; ce sont les sessions simultanées et
leurs tampons actifs qui augmentent l'utilisation de la mémoire.

## Stockage et téléchargements longs

Réservez de l'espace disque pour quatre usages distincts :

- Les images Docker et la marge nécessaire pour télécharger une mise à jour avant la
  suppression des anciennes couches.
- PostgreSQL, le cache et les métadonnées de l'application.
- Les fichiers de travail du Downloader pendant le téléchargement et le muxage des
  pistes audio et vidéo séparées.
- Les fichiers terminés dans le volume Garage.

Estimez la taille finale du média à partir de son débit total :

```text
taille en Go décimaux ≈ débit en Mbit/s × durée en heures × 0,45
```

| Exemple | Taille finale approximative |
| --- | --- |
| 10 heures d'audio à 128 kbit/s | 0,58 Go |
| 10 heures d'audio à 256 kbit/s | 1,15 Go |
| 10 heures de vidéo 4K à 20 Mbit/s | 90 Go, plus l'audio |
| 10 heures de vidéo 4K à 40 Mbit/s | 180 Go, plus l'audio |

La résolution ne détermine pas à elle seule la taille du fichier ; le débit sélectionné
est le facteur décisif.

Avec le stockage Garage local fourni, un téléchargement vidéo peut temporairement
occuper environ trois fois sa taille finale sur le même hôte : les pistes
téléchargées, le fichier muxé et l'objet Garage peuvent coexister jusqu'à la fin du
traitement. Un téléchargement audio seul peut temporairement nécessiter environ deux
fois sa taille finale. La stack autorise deux téléchargements simultanés par défaut ;
prévoyez donc que les deux traitements puissent se chevaucher.

`S3_ARTIFACT_TTL_SECONDS=7200` contrôle l'expiration de l'URL d'un fichier. Ce n'est
pas un quota de stockage et l'objet n'est pas supprimé automatiquement de Garage.
Supprimez les tâches de téléchargement terminées lorsque leurs fichiers ne sont plus
nécessaires. Surveillez Garage et le stockage Docker, surtout avant un long
téléchargement en 4K :

```sh
df -h
docker stats --no-stream
docker system df -v
docker compose exec -T garage /garage -c /etc/garage.toml status
```

## Capacité réseau

Le trafic de lecture YouTube transite par l'hôte TypeType. Pour un utilisateur
distant, l'hôte reçoit le média sélectionné puis le renvoie ; ses débits descendant et
montant doivent donc chacun couvrir la somme des débits des lectures actives, avec une
marge pour le protocole. Pour une instance hébergée à domicile, le débit montant est
souvent le facteur limitant.

Par exemple, une lecture à 40 Mbit/s nécessite environ 40 Mbit/s en réception et
40 Mbit/s en envoi pendant la lecture. Deux lectures identiques nécessitent environ le
double. Gardez une marge supplémentaire pour l'extraction, les miniatures, les
téléchargements et les autres utilisateurs.

## Logiciels requis

Installez les outils suivants sur l'hôte :

- **Docker Engine** 24+ et le plugin **Docker Compose v2** (`docker compose`, pas
  l'ancien `docker-compose`).
- **curl**, pour exécuter l'installateur pris en charge.
- **git**, pour cloner le dépôt.
- **openssl**, pour générer les secrets. Il est préinstallé sur la plupart des
  distributions ; sinon, le guide propose aussi une solution avec Python.

Vérifiez les versions installées :

```sh
docker --version
docker compose version
curl --version
openssl version
git --version
```

Si `docker compose version` échoue, installez le plugin Compose de votre distribution
avant de continuer.

## Facultatif pour un déploiement public

- Un **nom de domaine** pointant vers votre serveur.
- Un proxy inverse (Caddy, nginx ou Traefik) pour terminer TLS. Cette étape est
  détaillée dans le [guide du proxy inverse et de HTTPS](/self-hosting/reverse-proxy).
  Pour une installation strictement locale, vous pouvez utiliser
  `http://localhost:8082`.

::: warning Exécuter Docker sans être root
Ajoutez votre utilisateur au groupe `docker`
(`sudo usermod -aG docker "$USER"`, puis déconnectez-vous et reconnectez-vous) afin de
ne pas avoir à utiliser `sudo` pour chaque commande.
:::
