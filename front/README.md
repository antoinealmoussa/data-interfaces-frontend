# Architecture du repo

```bash
front/
├── src
│   ├── App.css
│   ├── App.tsx
│   ├── assets             # Images, icônes..
│   ├── components
│   │   ├── layout         # Affichage générique (header, menu...)
│   │   ├── plots          # Graphiques Recharts
│   │   └── ui             # Composants standards
│   ├── theme              # Thème MUI
│   ├── types
│   ├── utils
│   ├── index.css
│   ├── main.tsx
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

## Tailwind

`npm install tailwindcss @tailwindcss/vite`
[Tuto](https://tailwindcss.com/docs/installation/using-vite)

## MUI

`npm install @mui/material @emotion/react @emotion/styled @mui/icons-material`
[Doc](https://mui.com/material-ui/getting-started/)

## Recharts

`npm install recharts`
[Doc](https://recharts.github.io/)
