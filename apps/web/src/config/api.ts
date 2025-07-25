/**
 * Configuration de l'API
 * Contient les constantes pour les connexions aux services backend
 */

// URL de base de l'API
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Endpoints de l'API
export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${API_URL}/auth/login`,
    REGISTER: `${API_URL}/auth/register`,
    LOGOUT: `${API_URL}/auth/logout`,
    ME: `${API_URL}/auth/me`,
    REFRESH_TOKEN: `${API_URL}/auth/refresh-token`,
  },
  // Users
  USERS: {
    BASE: `${API_URL}/admin/users`,
    GET_ALL: `${API_URL}/admin/users`,
    GET_BY_ID: (id: string) => `${API_URL}/admin/users/${id}`,
    CREATE: `${API_URL}/admin/users`,
    UPDATE: (id: string) => `${API_URL}/admin/users/${id}`,
    DELETE: (id: string) => `${API_URL}/admin/users/${id}`,
    VALIDATE_PARENT: (id: string) => `${API_URL}/admin/users/${id}/validate`,
  },
  // Autres endpoints à ajouter au besoin
};

// Configuration des requêtes
export const REQUEST_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
};

/**
 * Obtient les en-têtes d'authentification à partir du token stocké
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('auth-token');
  return {
    ...REQUEST_CONFIG.headers,
    Authorization: token ? `Bearer ${token}` : '',
  };
}; 