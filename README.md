# Fandrik'i Mirindra

Jeu de plateforme 3D en vue de côté, inspiré de *Level Devil* (pièges cachés), situé à Madagascar. Jeu web (Three.js) empaqueté en application Android avec Capacitor.

- 80 niveaux : forêt, tsingy, baobabs et lieux célèbres de Madagascar (volcans et lave pour les derniers)
- 25 personnages malgaches (maki, fosa, omby, kisoa, Kalanoro, Lolo, Vazimba, sirène…) avec boutique d'accessoires
- Interface en malagasy, français et anglais
- Profils, scores, étoiles, niveaux de qualité graphique

## Lancer le jeu

```bash
npm install
npm run dev
```

## Construire l'APK Android

Prérequis : Node, JDK 17 et le SDK Android (licences acceptées).

```powershell
powershell -ExecutionPolicy Bypass -File build-apk.ps1
```

Le fichier `Mirindra.apk` est créé à la racine du projet.

## Outils

`tools/` contient le moteur de simulation déterministe et le solveur qui vérifie que chaque niveau est finissable.

## Stack

Vite, Three.js, Capacitor 6, JavaScript.
