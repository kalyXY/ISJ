import axios from 'axios';
import { API_URL } from '@/config';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface LoginCredentials {
  email: string;
  password: string;
}

// Fonction utilitaire pour vérifier si localStorage est disponible
const isLocalStorageAvailable = (): boolean => {
  return typeof window !== 'undefined' && window.localStorage;
};

// Service d'authentification
const AuthService = {
  // Fonction de connexion
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials, {
        withCredentials: true,
      });
      
      // Stocker le token dans localStorage
      if (response.data.token && isLocalStorageAvailable()) {
        localStorage.setItem('auth-token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Fonction de déconnexion
  logout: (): void => {
    if (isLocalStorageAvailable()) {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user');
    }
    // Rediriger vers la page de connexion
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },
  
  // Récupérer le token
  getToken: (): string | null => {
    if (!isLocalStorageAvailable()) return null;
    return localStorage.getItem('auth-token');
  },
  
  // Récupérer l'utilisateur connecté
  getCurrentUser: (): any => {
    if (!isLocalStorageAvailable()) return null;
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error("Erreur lors du parsing de l'utilisateur dans localStorage:", e, userStr);
        return null;
      }
    }
    return null;
  },
  
  // Vérifier si l'utilisateur est connecté
  isAuthenticated: (): boolean => {
    if (!isLocalStorageAvailable()) return false;
    return !!localStorage.getItem('auth-token');
  },
  
  // Vérifier si l'utilisateur a un rôle spécifique
  hasRole: (role: string | string[]): boolean => {
    const user = AuthService.getCurrentUser();
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  }
};

export default AuthService; 