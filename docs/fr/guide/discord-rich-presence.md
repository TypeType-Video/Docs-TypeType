# Discord Rich Presence

Affichez ce que vous regardez sur TypeType comme statut Discord : titre, chaîne, et
un lien vers la vidéo. Cela passe par un petit compagnon de bureau,
[TypeType RPC](https://github.com/TypeType-Video/TypeType-RPC), qui communique avec
Discord via sa connexion locale, le même mécanisme utilisé par Spotify ou un jeu.

## Ce qu'il faut

- Un compte TypeType. Les invités ne peuvent pas créer de clé de présence.
- [Discord desktop](https://discord.com/download), ou un client compatible comme
  [Vesktop](https://vesktop.dev/), lancé sur la même machine.
- L'application [TypeType RPC](https://github.com/TypeType-Video/TypeType-RPC)
  installée.

## Créer une clé de présence

1. Ouvrez **Paramètres**, puis **API**.
2. Sous **Accès à la présence**, nommez la clé pour la reconnaître plus tard, puis
   **Créer une clé**.
3. Copiez la clé. Elle commence par `ttp1_`, et c'est la seule fois où vous la verrez,
   TypeType ne stocke que son empreinte.

![Création d'une clé de présence](/screenshot-presence-key-created.png)

Vous pouvez avoir jusqu'à 10 clés actives en même temps. Révoquez-en une à tout moment
depuis le même écran, indépendamment de vos sessions de connexion.

## Connecter TypeType RPC

1. Installez et ouvrez [TypeType RPC](https://github.com/TypeType-Video/TypeType-RPC).
2. Cliquez sur l'icône dans la zone de notification, puis **Paramètres…**.
3. Entrez l'URL de votre instance et la clé que vous venez de créer, puis
   **Enregistrer**.
4. Activez **Partager sur Discord**.

![La fenêtre des paramètres de TypeType RPC](/screenshot-rpc-settings.png)

Le partage reprend automatiquement la prochaine fois que vous ouvrez l'application,
c'est donc une configuration à faire une seule fois.

## Ce qu'elle peut voir

La portée de la clé est `presence:read`, en lecture seule et restreinte : ce qui est
en cours de lecture, son titre, sa chaîne, et sa position, rien d'autre. Elle ne peut
pas voir votre historique, vos abonnements, les détails de votre compte, ni votre
session, et TypeType RPC n'interroge le serveur que tant que son propre interrupteur
est activé.

## Dépannage

- **Rien ne s'affiche dans Discord** : les boutons Rich Presence et la carte
  d'activité sont invisibles sur votre *propre* profil, c'est une limitation de
  Discord, pas un bug. Demandez à un ami de vérifier, ou regardez votre profil depuis
  un second compte.
- **L'application n'arrive pas à se connecter** : TypeType RPC communique avec Discord
  via une connexion locale, donc Discord (ou Vesktop) doit d'abord être lancé sur la
  même machine.
