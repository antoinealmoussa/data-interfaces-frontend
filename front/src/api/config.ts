// Récupère les variables d'environnement
const API_URLS = {
  backend: import.meta.env.VITE_BACKEND_API,
};

// Fonction pour obtenir les en-têtes avec le token d'authentification
export const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("token");
    if (token) {
        return {
            "Authorization": `Bearer ${token}`
        };
    }
    return {};
};

export default API_URLS;

