# Horse CLICKER

Un jeu clicker interactif en 3D où vous prenez soin d'un cheval virtuel.

![Horse CLICKER Game](public/images/Jeu.png)

## Description

Horse CLICKER est un jeu de type "clicker" développé en web. Cliquez sur le cheval pour gagner des ressources, achetez de la nourriture pour augmenter son niveau de nourriture et sa barre de stamina. Plus la stamina augmente, meilleurs sont vos multiplicateurs de points !

Votre objectif final est de remplir la jauge jusqu'à 1500 points tout en accomplissant diverses missions qui apparaîtront au cours du jeu.

## Fonctionnalités principales

- **Système de clics interactif** : Cliquez sur le cheval 3D pour gagner de l'argent 
- **Gestion de ressources** : Achetez de la nourriture pour augmenter le multiplicateur
- **Barre de stamina** : Augmentez la stamina pour obtenir de meilleurs multiplicateurs
- **Système de missions** : Complétez diverses missions qui apparaissent pendant le jeu
- **Modèles 3D** : Visualisation du cheval en 3D grâce à Three.js
- **Objectif final** : Remplir la jauge principale à 1500 points

## Technologies utilisées

- HTML5
- CSS3
- JavaScript
- Three.js (pour les modèles 3D)
- Vite (bundler)
- Git LFS (pour le stockage des fichiers volumineux)

## Jouer en ligne

Vous pouvez jouer à Horse CLICKER directement en ligne :
[https://waelzein6.github.io/HorseClicker/](https://waelzein6.github.io/HorseClicker/)

## Installation locale

1. Clonez le dépôt Git :
```bash
git clone https://github.com/WaelZEIN6/HorseClicker.git
cd HorseClicker
```

2. Installez les dépendances :
```bash
npm install
```

3. Lancez le serveur de développement :
```bash
npm run dev
```

4. Ouvrez votre navigateur à l'adresse indiquée (généralement http://localhost:5173)

## Déploiement

Pour déployer le jeu sur GitHub Pages :

```bash
npm run build
npm run deploy
```

## Utilisation de Git LFS

Ce projet utilise Git Large File Storage (LFS) pour gérer les fichiers 3D volumineux (FBX et GLB). Si vous souhaitez contribuer ou cloner le projet, assurez-vous d'avoir Git LFS installé :

```bash
git lfs install
git lfs pull
```

## Structure du projet
```
ChevalClicker/
├── node_modules/
├── public/
│   ├── assets/         # Modèles 3D (LowPolyTrees.glb)
│   ├   ├── textures/   # Textures pour les modèles
│   ├── images/         # Images statiques
│   │   └── Background/ # Images d'arrière-plan
│   │   └── menu/       # Icones du menu
│   │   └── money/      # Icone d'argent
│   │   └── upgradefood/ # Icones nourritures
│   └── sound/          # Fichiers audio
├── src/
│   ├── css/            # Styles CSS
│   ├── js/             # Fichiers JavaScript
├── .gitattributes      # Configuration Git LFS
├── .gitignore          # Configuration Git 
├── index.html          # Page principale
├── vite.config.js      # Configuration Vite 
├── package-lock.json
├── package.json        # Mettez à jour pour inclure 
└── README.md
```

## Auteurs

- Wael ZEIN
- Guillaume Leleux
- Martin Mollat

Amusez-vous bien avec HORSE CLICKER ! 🐴