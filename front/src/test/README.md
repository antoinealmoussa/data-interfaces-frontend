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

### Installer les dépendances

```bash
npm install
# ou
yarn install
```

### Lancer les tests

```bash
npm run test
# ou
yarn test
```

### Mode watch (développement)

Les tests s'exécutent en mode watch par défaut pour re-tester automatiquement lors des modifications.

### Interface utilisateur des tests

```bash
npm run test:ui
# ou
yarn test:ui
```

### Couverture de code

```bash
npm run test:coverage
# ou
yarn test:coverage
```

## Tests créés

### Utilitaires (`utils/`)

- ✅ `randomData.test.tsx` : Tests pour les fonctions de génération de mots et phrases aléatoires

### Composants UI (`components/ui/`)

- ✅ `ArticleCard.test.tsx` : Tests du composant de carte d'article (affichage, liens, dates)

### Composants d'authentification (`components/authentication/`)

- ✅ `LoginForm.test.tsx` : Tests du formulaire de connexion (champs, soumission, états)
- ✅ `SignInForm.test.tsx` : Tests du formulaire d'inscription (champs, soumission, états)

## Notes

- Les tests mockent `axios` pour éviter de faire de vraies requêtes HTTP
- Les tests utilisent `BrowserRouter` pour simuler le routage React
- Les composants Material-UI sont testés avec React Testing Library
