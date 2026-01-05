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

# Tests Frontend

Ce dossier contient tous les tests unitaires pour l'application frontend.

## Configuration

Les tests utilisent :

- **Vitest** : Framework de test rapide et moderne
- **React Testing Library** : Bibliothèque pour tester les composants React
- **@testing-library/user-event** : Pour simuler les interactions utilisateur
- **jsdom** : Environnement DOM simulé pour les tests

## Structure

```
test/
├── setupTests.ts                    # Configuration globale des tests
├── components/
│   ├── authentication/
│   │   ├── LoginForm.test.tsx      # Tests du formulaire de connexion
│   │   └── SignInForm.test.tsx     # Tests du formulaire d'inscription
│   └── ui/
│       └── ArticleCard.test.tsx    # Tests de la carte d'article
└── utils/
    └── randomData.test.tsx         # Tests des utilitaires de données aléatoires
```

## Exécution des tests

### Lancer les tests

```bash
docker-compose exec frontend npm run test
```

### Mode watch (développement)

Les tests s'exécutent en mode watch par défaut pour re-tester automatiquement lors des modifications.

### Interface utilisateur des tests

```bash
npm run test:ui
```

### Couverture de code

```bash
npm run test:coverage
```

## Notes

- Les tests mockent `axios` pour éviter de faire de vraies requêtes HTTP
- Les tests utilisent `BrowserRouter` pour simuler le routage React
- Les composants Material-UI sont testés avec React Testing Library
