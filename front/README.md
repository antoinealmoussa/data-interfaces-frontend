# Architecture du repo

front/
├── src/
│ ├── assets/ # Images, icônes, etc.
│ ├── pages/ # Différentes pages de l'application
│ ├── components/ # Composants réutilisables
│ │ ├── layout/ # Composants de layout (header, sidebar, etc.)
│ │ ├── ui/ # Composants UI génériques (boutons, cartes, etc.)
│ │ ├── App.tsx # Composant racine
│ ├── theme/ # Configuration du thème MUI
│ ├── utils/ # Fonctions utilitaires
│ ├── App.tsx # Point d'entrée principal
│ ├── main.tsx # Fichier d'entrée
│ ├── vite-env.d.ts
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── tsconfig.json
├── index.html # Fichier principal

# Lancement du front en local

`npm run dev`

# Ce projet a été créé grâce à ...

## Vite

`npm create vite@latest react-ts-vite-app -- --template react-ts`
[Tuto](https://medium.com/@robinviktorsson/complete-guide-to-setting-up-react-with-typescript-and-vite-2025-468f6556aaf2)

## Tailwind

`npm install tailwindcss @tailwindcss/vite`
[Tuto](https://tailwindcss.com/docs/installation/using-vite)

## MUI

`npm install @mui/material @emotion/react @emotion/styled @mui/icons-material`
