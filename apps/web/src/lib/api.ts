import axios from 'axios';
import { useAuthStore } from './auth';

const API_URL = 'http://localhost:3001';

// Création d'une instance axios avec les bons paramètres
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important pour envoyer/recevoir les cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification à toutes les requêtes
api.interceptors.request.use((config) => {
  // Récupérer le token du localStorage
  const token = localStorage.getItem('auth-token');
  
  // Si token existe, l'ajouter aux headers
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // En cas d'erreur 401 (non autorisé) ou 403 (accès refusé)
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('Erreur d\'authentification:', error.response?.status);
      
      // Si on est dans le navigateur, vérifier l'authentification avant de rediriger
      if (typeof window !== 'undefined') {
        // Ne pas rediriger immédiatement, attendre que le store soit disponible
        setTimeout(() => {
          const { checkAuth } = useAuthStore.getState();
          
          // Essayer de vérifier l'authentification
          checkAuth().then(async () => {
            // Si l'utilisateur est toujours null après la vérification, rediriger vers login
            if (!useAuthStore.getState().user) {
        window.location.href = '/login';
            }
          });
        }, 100);
      }
    }
    return Promise.reject(error);
  }
); 