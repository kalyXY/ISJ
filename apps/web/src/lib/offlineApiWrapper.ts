import axiosInstance from './axiosInstance';
import { NetworkService } from './network';
import { OfflineStorageService } from './storage';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

export class OfflineApiWrapper {
  private static instance: OfflineApiWrapper;
  private networkService: NetworkService;
  private storageService: OfflineStorageService;

  private constructor() {
    this.networkService = NetworkService.getInstance();
    this.storageService = OfflineStorageService.getInstance();
    this.setupInterceptors();
  }

  public static getInstance(): OfflineApiWrapper {
    if (!OfflineApiWrapper.instance) {
      OfflineApiWrapper.instance = new OfflineApiWrapper();
    }
    return OfflineApiWrapper.instance;
  }

  private setupInterceptors(): void {
    // Intercepteur de requête pour gérer le mode offline
    axiosInstance.interceptors.request.use(
      async (config) => {
        // Si pas de connexion et que c'est une opération de modification
        if (!this.networkService.isOnline() && this.isModifyingOperation(config)) {
          await this.handleOfflineRequest(config);
          // Retourner une réponse simulée pour ne pas bloquer l'interface
          return Promise.reject({ 
            isOfflineHandled: true, 
            message: 'Opération mise en file d\'attente pour synchronisation' 
          });
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur de réponse pour mettre en cache les données
    axiosInstance.interceptors.response.use(
      async (response) => {
        // Mettre en cache les données de lecture
        if (this.isReadOperation(response.config) && response.data) {
          await this.cacheResponseData(response);
        }
        return response;
      },
      async (error) => {
        // Si erreur réseau et pas d'handling offline déjà fait
        if (this.isNetworkError(error) && !error.isOfflineHandled) {
          // Tenter de récupérer depuis le cache pour les opérations de lecture
          if (this.isReadOperation(error.config)) {
            const cachedData = await this.getCachedData(error.config);
            if (cachedData) {
              return {
                data: cachedData,
                status: 200,
                statusText: 'OK (cached)',
                headers: {},
                config: error.config,
                fromCache: true
              } as AxiosResponse;
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private isModifyingOperation(config: AxiosRequestConfig): boolean {
    const method = config.method?.toUpperCase();
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method || '');
  }

  private isReadOperation(config: AxiosRequestConfig): boolean {
    const method = config.method?.toUpperCase();
    return method === 'GET';
  }

  private isNetworkError(error: any): boolean {
    return error.code === 'NETWORK_ERROR' || 
           error.code === 'ECONNREFUSED' || 
           !error.response;
  }

  private async handleOfflineRequest(config: AxiosRequestConfig): Promise<void> {
    const operationType = this.getOperationType(config);
    
    await this.storageService.addPendingOperation({
      type: operationType,
      endpoint: config.url || '',
      method: (config.method?.toUpperCase() as any) || 'GET',
      data: config.data,
      headers: config.headers as Record<string, string>,
      maxRetries: 3
    });

    // Mettre à jour le statut de synchronisation
    const currentStatus = await this.storageService.getSyncStatus();
    await this.storageService.updateSyncStatus({
      pendingCount: currentStatus.pendingCount + 1
    });
  }

  private getOperationType(config: AxiosRequestConfig): 'CREATE' | 'UPDATE' | 'DELETE' {
    const method = config.method?.toUpperCase();
    
    switch (method) {
      case 'POST':
        return 'CREATE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return 'CREATE';
    }
  }

  private async cacheResponseData(response: AxiosResponse): Promise<void> {
    const url = response.config.url;
    if (!url) return;

    // Déterminer la clé de cache et la durée d'expiration
    const cacheConfig = this.getCacheConfiguration(url);
    if (!cacheConfig) return;

    await this.storageService.cacheData(
      cacheConfig.key,
      response.data,
      cacheConfig.expirationMinutes
    );
  }

  private getCacheConfiguration(url: string): { key: string; expirationMinutes: number } | null {
    // Configuration de cache spécifique pour chaque endpoint
    if (url.includes('/academics/eleves')) {
      return { key: this.generateCacheKey(url, 'students'), expirationMinutes: 60 };
    }
    
    if (url.includes('/academics/classes')) {
      return { key: this.generateCacheKey(url, 'classes'), expirationMinutes: 120 };
    }
    
    if (url.includes('/academics/enseignants')) {
      return { key: this.generateCacheKey(url, 'teachers'), expirationMinutes: 120 };
    }
    
    if (url.includes('/academics/notes')) {
      return { key: this.generateCacheKey(url, 'grades'), expirationMinutes: 30 };
    }
    
    if (url.includes('/academics/bulletins')) {
      return { key: this.generateCacheKey(url, 'bulletins'), expirationMinutes: 30 };
    }

    // Cache par défaut pour autres endpoints
    if (url.includes('/admin/') || url.includes('/academics/')) {
      return { key: this.generateCacheKey(url, 'misc'), expirationMinutes: 60 };
    }

    return null;
  }

  private generateCacheKey(url: string, type: string): string {
    // Créer une clé de cache unique basée sur l'URL et les paramètres
    const urlObj = new URL(url, 'http://localhost');
    const pathKey = urlObj.pathname.replace(/\//g, '_');
    const searchParams = urlObj.searchParams.toString();
    
    return `${type}${pathKey}${searchParams ? `_${searchParams}` : ''}`;
  }

  private async getCachedData(config: AxiosRequestConfig): Promise<any | null> {
    const url = config.url;
    if (!url) return null;

    const cacheConfig = this.getCacheConfiguration(url);
    if (!cacheConfig) return null;

    return await this.storageService.getCachedData(cacheConfig.key);
  }

  // Méthodes publiques pour forcer la mise en cache
  public async cacheStudents(students: any[]): Promise<void> {
    await this.storageService.cacheStudents(students);
  }

  public async cacheClasses(classes: any[]): Promise<void> {
    await this.storageService.cacheClasses(classes);
  }

  public async cacheTeachers(teachers: any[]): Promise<void> {
    await this.storageService.cacheTeachers(teachers);
  }

  public async cacheBulletins(bulletins: any[]): Promise<void> {
    await this.storageService.cacheBulletins(bulletins);
  }

  // Méthodes pour récupérer les données cachées
  public async getCachedStudents(): Promise<any[] | null> {
    return await this.storageService.getCachedStudents();
  }

  public async getCachedClasses(): Promise<any[] | null> {
    return await this.storageService.getCachedClasses();
  }

  public async getCachedTeachers(): Promise<any[] | null> {
    return await this.storageService.getCachedTeachers();
  }

  public async getCachedBulletins(): Promise<any[] | null> {
    return await this.storageService.getCachedBulletins();
  }
}

// Initialiser le wrapper automatiquement
export const offlineApiWrapper = OfflineApiWrapper.getInstance();