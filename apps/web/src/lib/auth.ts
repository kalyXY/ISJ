import axios from 'axios';
import { useRouter } from 'next/navigation';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useEffect, useState, useCallback, useMemo } from 'react';

// Types
export type UserRole = 'admin' | 'enseignant' | 'eleve' | 'parent' | 'parent_attente';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: UserRole;
  status?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshAuthToken: () => Promise<boolean>;
}

// Créer une instance axios avec les bons paramètres
const api = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
});

// Intercepteur pour ajouter le token JWT à toutes les requêtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fonction pour récupérer l'utilisateur courant
export const getCurrentUser = async (): Promise<User | null> => {
  const token = localStorage.getItem('auth-token');
  
  if (!token) {
    console.log('Aucun token trouvé dans localStorage');
    return null;
  }

  try {
    console.log('Tentative de récupération de l\'utilisateur avec le token:', token.substring(0, 10) + '...');
    
    const response = await api.get('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Réponse de /api/auth/me:', response.data);
    
    // Vérifier que les données de l'utilisateur sont complètes
    if (!response.data.user || !response.data.user.id) {
      console.error('Données utilisateur incomplètes:', response.data);
      return null;
    }
    
    return response.data.user;
  } catch (error: any) {
    console.error('Erreur détaillée lors de la récupération de l\'utilisateur:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Ne pas supprimer le token automatiquement en cas d'erreur 500
    // car cela pourrait être un problème temporaire du serveur
    if (error.response?.status !== 500) {
      localStorage.removeItem('auth-token');
    }
    
    return null;
  }
};

// Fonction pour rafraîchir le token
export const refreshToken = async (): Promise<string | null> => {
  try {
    // Appel à l'API pour rafraîchir le token
    const response = await api.post('/api/auth/refresh-token');
    
    if (!response.data?.token) {
      console.error('Aucun token reçu lors du rafraîchissement');
      return null;
    }
    
    const token = response.data.token;
    
    // Stocker le nouveau token dans localStorage
    localStorage.setItem('auth-token', token);
    
    // Mettre à jour le cookie
    if (typeof document !== 'undefined') {
      const expirationDate = new Date();
      expirationDate.setTime(expirationDate.getTime() + (7 * 24 * 60 * 60 * 1000));
      document.cookie = `token=${token}; path=/; expires=${expirationDate.toUTCString()}`;
    }
    
    return token;
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    return null;
  }
};

// Store Zustand pour l'authentification
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      
      // Fonction de login
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/api/auth/login', { email, password });
          
          if (!response.data.token) {
            throw new Error('Token manquant dans la réponse');
          }
          
          console.log('Token reçu:', response.data.token.substring(0, 10) + '...');
          
          // Stocker le token dans localStorage pour une persistance plus longue
          localStorage.setItem('auth-token', response.data.token);

          // Déposer également le token dans un cookie (non HttpOnly) afin que le middleware
          // Next.js (côté serveur) puisse l'utiliser pour l'autorisation des pages.
          if (typeof document !== 'undefined') {
            // Configurer l'expiration du cookie à 7 jours
            const expirationDate = new Date();
            expirationDate.setTime(expirationDate.getTime() + (7 * 24 * 60 * 60 * 1000));
            document.cookie = `token=${response.data.token}; path=/; expires=${expirationDate.toUTCString()}`;
          }
          
          set({ 
            user: response.data.user, 
            token: response.data.token,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Erreur de connexion', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      // Fonction de logout
      logout: async () => {
        set({ isLoading: true });
        try {
          await api.post('/api/auth/logout');
          // Supprimer le token du localStorage
          localStorage.removeItem('auth-token');
          if (typeof document !== 'undefined') {
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
          set({ user: null, token: null, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          console.error('Erreur de déconnexion:', error);
        }
      },
      
      // Fonction pour rafraîchir le token
      refreshAuthToken: async () => {
        const token = await refreshToken();
        
        if (token) {
          set(state => ({ ...state, token }));
          return true;
        }
        
        return false;
      },
      
      // Vérifier si l'utilisateur est connecté
      checkAuth: async () => {
        // Vérifier si on est déjà en train de charger
        if (get().isLoading) return;
        
        set({ isLoading: true });
        try {
          // Récupérer le token des cookies ou localStorage
          let token = null;
          
          // Essayer de récupérer le token depuis les cookies
          if (typeof document !== 'undefined') {
            const cookieToken = document.cookie.split(';').find(c => c.trim().startsWith('token='));
            if (cookieToken) {
              token = cookieToken.split('=')[1];
            }
          }
          
          // Si pas de token dans les cookies, essayer localStorage
          if (!token) {
            token = localStorage.getItem('auth-token');
          }
          
          // Stocker le token trouvé dans localStorage pour assurer la cohérence
          if (token) {
            localStorage.setItem('auth-token', token);
          }
          
          // Si aucun token, l'utilisateur n'est pas connecté
          if (!token) {
            set({ user: null, token: null, isLoading: false });
            return;
          }
          
          const user = await getCurrentUser();
          
          // Ne mettre à jour que si l'utilisateur a changé
          if (JSON.stringify(user) !== JSON.stringify(get().user)) {
            set({ 
              user,
              token,
              isLoading: false 
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Erreur lors de la vérification de l\'authentification:', error);
          // Ne pas supprimer automatiquement en cas d'erreur
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

// Hook pour rediriger en fonction du rôle
export const useAuthRedirect = () => {
  const router = useRouter();
  // On lit l'état *au moment* de l'appel pour éviter d'utiliser des valeurs périmées
  const redirectToRoleDashboard = async () => {
    const { user, token } = useAuthStore.getState();
    if (!user || !token) return;
    
    try {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'pending_parent') {
        // Rediriger vers une page d'attente pour les parents en attente de validation
        router.push('/pending-account');
      } else {
        // Redirection par défaut
        router.push('/');
      }
    } catch (error) {
      console.error('Erreur lors de la redirection:', error);
      router.push('/');
    }
  };
  
  return { redirectToRoleDashboard };
};

// Hook principal useAuth pour accéder aux fonctionnalités d'authentification
export const useAuth = () => {
  const { 
    user, 
    token, 
    isLoading, 
    error, 
    login, 
    logout, 
    checkAuth,
    refreshAuthToken 
  } = useAuthStore();

  // Vérifier l'authentification et le token au chargement du composant
  useEffect(() => {
    // Utiliser une variable pour éviter les appels multiples
    let isMounted = true;
    
    const verifyAuth = async () => {
      if (!user && !isLoading && isMounted) {
        await checkAuth();
      }
    };
    
    verifyAuth();
    
    // Configurer un intervalle pour rafraîchir le token périodiquement
    // (toutes les 6 heures pour un token de 7 jours)
    const refreshInterval = setInterval(async () => {
      if (isMounted && token) {
        console.log('🔄 Rafraîchissement périodique du token');
        await refreshAuthToken();
      }
    }, 6 * 60 * 60 * 1000); // 6 heures
    
    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dépendance vide pour n'exécuter qu'au montage du composant

  // Fonctions utilitaires pour vérifier les rôles
  const isAdmin = !!user && user.role === 'admin';
  const isPendingParent = !!user && user.role === 'pending_parent';
  const isTeacher = !!user && user.role === 'enseignant';
  const isStudent = !!user && user.role === 'student';
  const isParent = !!user && user.role === 'parent';
  const isAuthenticated = !!user;

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  return {
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
    refreshAuthToken,
    isAdmin,
    isPendingParent,
    isTeacher,
    isStudent,
    isParent,
    isAuthenticated,
    hasRole
  };
};

// Hook pour protéger les routes
export const useRequireAuth = (allowedRoles: UserRole[] = []) => {
  const router = useRouter();
  const { 
    user, 
    isLoading, 
    checkAuth, 
    refreshAuthToken 
  } = useAuthStore();
  
  // État local pour suivre si la vérification est terminée
  const [authChecked, setAuthChecked] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Memoize the verification function to avoid unnecessary re-runs
  const verifyAuth = useCallback(async () => {
    if (authChecked || isLoading) return;
    
    try {
      // Only check auth if no user is present
      if (!user) {
        await checkAuth();
      } else {
        // Refresh token silently if user exists (non-blocking)
        refreshAuthToken().catch(console.error);
      }
    } finally {
      setAuthChecked(true);
    }
  }, [checkAuth, isLoading, authChecked, refreshAuthToken, user]);
  
  // Vérifier l'authentification au chargement du composant
  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);
  
  // Memoize redirect logic
  const shouldRedirect = useMemo(() => {
    if (!authChecked || isLoading || isRedirecting) return null;
    
    if (!user) {
      return { type: 'login', path: `/login${typeof window !== 'undefined' ? `?redirect=${encodeURIComponent(window.location.pathname)}` : ''}` };
    }
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      const dashboardPaths = {
        admin: '/admin/dashboard',
        parent_attente: '/pending-account',
        enseignant: '/teacher/dashboard',
        eleve: '/student/dashboard',
        parent: '/parent/dashboard'
      };
      return { type: 'role', path: dashboardPaths[user.role] || '/' };
    }
    
    return null;
  }, [user, isLoading, allowedRoles, authChecked, isRedirecting]);
  
  // Handle redirects
  useEffect(() => {
    if (shouldRedirect && !isRedirecting) {
      setIsRedirecting(true);
      router.push(shouldRedirect.path);
    }
  }, [shouldRedirect, router, isRedirecting]);
  
  // État combiné pour simplifier l'utilisation dans les composants
  const combinedLoading = isLoading || !authChecked;
  const isAuthorized = !combinedLoading && !!user && (allowedRoles.length === 0 || allowedRoles.includes(user.role));
  
  return { 
    user, 
    isLoading: combinedLoading,
    isAuthorized
  };
}; 