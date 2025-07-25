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

// Service d'authentification
const AuthService = {
  // Fonction de connexion
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials, {
        withCredentials: true,
      });
      
      // Stocker le token dans localStorage
      if (response.data.token) {
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
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    // Rediriger vers la page de connexion
    window.location.href = '/login';
  },
  
  // Récupérer le token
  getToken: (): string | null => {
    return localStorage.getItem('auth-token');
  },
  
  // Récupérer l'utilisateur connecté
  getCurrentUser: (): any => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
  
  // Vérifier si l'utilisateur est connecté
  isAuthenticated: (): boolean => {
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