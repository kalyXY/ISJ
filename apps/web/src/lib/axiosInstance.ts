import axios from 'axios';
import { API_URL } from '@/config';

// Création d'une instance axios avec la configuration de base
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Permet d'envoyer les cookies avec les requêtes
});

// Intercepteur pour ajouter le token JWT à chaque requête
axiosInstance.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    
    // Si le token existe, l'ajouter aux headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et les erreurs
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gérer les erreurs 401 (non autorisé)
    if (error.response && error.response.status === 401) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
      if (typeof window !== 'undefined') {
        // Stocker l'URL actuelle pour rediriger l'utilisateur après la connexion
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 