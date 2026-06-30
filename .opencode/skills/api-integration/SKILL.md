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
- Fonction utilitaire `teamPath(teamName, ...segments)` pour construire les URLs rugby :
  - Produit `/rugby-teams/teams/{teamName}/{segments}` avec `teamName` encodé via `encodeURIComponent`
  - Exemple : `teamPath("Mon equipe", "players")` → `/rugby-teams/teams/Mon%20equipe/players`

## API Modules

Pattern : modules plain-object exportés, organisés par application dans des sous-dossiers de `src/api/`. Exemple depuis `src/api/rugby-teams/teamApi.ts` :

```ts
import { apiClient, teamPath } from "../../client";

export const teamApi = {
  getAll: () => apiClient.get<Team[]>("/rugby-teams/teams").then((r) => r.data),
  create: (team: CreateTeamDto) =>
    apiClient.post<Team>("/rugby-teams/teams", team).then((r) => r.data),
  getBySeason: (seasonId: number) =>
    apiClient.get<Team[]>(`/rugby-teams/teams/by-season/${seasonId}`).then((r) => r.data),
};
```

Pour les ressources nichées sous une équipe (`players`, `tournaments`, `training`), utiliser `teamPath` :

```ts
export const playerApi = {
  getByTeam: (teamName: string) =>
    apiClient.get<Player[]>(`${teamPath(teamName, "players")}?skip=0&limit=100`).then((r) => r.data),
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
