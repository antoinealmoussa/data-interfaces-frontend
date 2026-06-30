---
name: api-integration
description: How to make API calls in Stravoska frontend — Axios client, JWT cookies, React Query consumption
---

## Axios Client (`src/api/client.ts`)

- Instance Axios créée avec `baseURL: "/api/v1"` et `withCredentials: true`
- Intercepteur de réponse : sur 401, tente un refresh via `POST /token/refresh`
  - Les requêtes échouant pendant le refresh sont mises en file d'attente puis rejouées
  - Si le refresh échoue, dispatche `window.dispatchEvent(new CustomEvent("auth:unauthorized"))` — l'AuthProvider écoute cet event et déconnecte l'utilisateur
- Les endpoints d'auth (`/login`, `/register`, `/logout`, `/token/refresh`) ne déclenchent PAS le refresh (évite les boucles infinies)

## API Modules

Pattern : modules plain-object exportés. Exemple depuis `src/api/teamApi.ts` :

```ts
export const teamApi = {
  getAll: () => apiClient.get<Team[]>("/teams").then((r) => r.data),
  create: (team: CreateTeamDto) =>
    apiClient.post<Team>("/teams", team).then((r) => r.data),
};
```

Consommés via React Query dans les composants/pages :

```ts
const { data: teams } = useQuery({
  queryKey: ["teams"],
  queryFn: teamApi.getAll,
});
```

## Proxy Vite

En dev, Vite proxy `/api` vers `http://localhost:8000` (configuré dans `vite.config.ts`, variable `VITE_PROXY_TARGET`).
