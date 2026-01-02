# Architecture du repo

```bash
front/
├── public                 # Images, icônes...
├── src
│   ├── App.tsx
│   ├── api                # Configuration des routes back-end spécifiées dans le docker-compose
│   ├── components
│   │   ├── authentication # Composants liés à l'authentification
│   │   ├── layout         # Affichage générique (header, menu...)
│   │   ├── plots          # Graphiques Recharts
│   │   └── ui             # Composants standards
│   ├── pages              # Pages complètes
│   │   ├── authentication # Pages liées à l'authentification
│   │   ├── ...            # Pages liées à un autre service
│   │   └── ...            # Pages liées à un autre service
│   ├── theme              # Thème MUI
│   ├── types
│   ├── utils
│   ├── main.tsx           # Différentiation des routes publiques et privées
│   ├── routes.ts          # Gestion des différentes url front
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

# Lancement du front en local

`npm run dev`

# Ce projet a été créé grâce à ...

## Vite

`npm create vite@latest react-ts-vite-app -- --template react-ts`
[Tuto](https://medium.com/@robinviktorsson/complete-guide-to-setting-up-react-with-typescript-and-vite-2025-468f6556aaf2)

## MUI

`npm install @mui/material @emotion/react @emotion/styled @mui/icons-material`
[Doc](https://mui.com/material-ui/getting-started/)

## Recharts

`npm install recharts`
[Doc](https://recharts.github.io/)
