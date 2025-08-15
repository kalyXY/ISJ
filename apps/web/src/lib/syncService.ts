import axiosInstance from './axiosInstance';
import { NetworkService } from './network';
import { OfflineStorageService, PendingOperation } from './storage';

export interface SyncResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: Array<{
    operation: PendingOperation;
    error: string;
  }>;
}

export class SyncService {
  private static instance: SyncService;
  private networkService: NetworkService;
  private storageService: OfflineStorageService;
  private isCurrentlySyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private syncListeners: Array<(result: SyncResult) => void> = [];

  private constructor() {
    this.networkService = NetworkService.getInstance();
    this.storageService = OfflineStorageService.getInstance();
    this.setupNetworkListener();
    this.startPeriodicSync();
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private setupNetworkListener(): void {
    this.networkService.addListener((isOnline) => {
      if (isOnline && !this.isCurrentlySyncing) {
        this.syncPendingOperations();
      }
    });
  }

  private startPeriodicSync(): void {
    // Synchronisation automatique toutes les 5 minutes si en ligne
    this.syncInterval = setInterval(() => {
      if (this.networkService.isOnline() && !this.isCurrentlySyncing) {
        this.syncPendingOperations();
      }
    }, 5 * 60 * 1000);
  }

  public async syncPendingOperations(): Promise<SyncResult> {
    if (this.isCurrentlySyncing) {
      return {
        success: false,
        processedCount: 0,
        failedCount: 0,
        errors: [{ operation: {} as PendingOperation, error: 'Synchronisation déjà en cours' }]
      };
    }

    if (!this.networkService.isOnline()) {
      return {
        success: false,
        processedCount: 0,
        failedCount: 0,
        errors: [{ operation: {} as PendingOperation, error: 'Pas de connexion réseau' }]
      };
    }

    this.isCurrentlySyncing = true;
    
    try {
      await this.storageService.updateSyncStatus({
        status: 'syncing',
        lastError: undefined
      });

      const pendingOperations = await this.storageService.getPendingOperations();
      
      if (pendingOperations.length === 0) {
        await this.storageService.updateSyncStatus({
          status: 'idle',
          lastSyncTimestamp: Date.now(),
          pendingCount: 0
        });
        
        return {
          success: true,
          processedCount: 0,
          failedCount: 0,
          errors: []
        };
      }

      const result = await this.processPendingOperations(pendingOperations);
      
      await this.storageService.updateSyncStatus({
        status: result.success ? 'idle' : 'error',
        lastSyncTimestamp: Date.now(),
        pendingCount: result.failedCount,
        lastError: result.errors.length > 0 ? result.errors[0].error : undefined
      });

      // Notifier les listeners
      this.notifySyncListeners(result);

      return result;

    } catch (error) {
      await this.storageService.updateSyncStatus({
        status: 'error',
        lastError: error instanceof Error ? error.message : 'Erreur inconnue'
      });

      const result: SyncResult = {
        success: false,
        processedCount: 0,
        failedCount: 0,
        errors: [{ operation: {} as PendingOperation, error: error instanceof Error ? error.message : 'Erreur inconnue' }]
      };

      this.notifySyncListeners(result);
      return result;

    } finally {
      this.isCurrentlySyncing = false;
    }
  }

  private async processPendingOperations(operations: PendingOperation[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      processedCount: 0,
      failedCount: 0,
      errors: []
    };

    // Traiter les opérations en lot pour optimiser les performances
    const batchSize = 10;
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      
      // Utiliser l'endpoint de synchronisation en lot
      try {
        const batchResult = await this.syncBatch(batch);
        result.processedCount += batchResult.processed;
        result.failedCount += batchResult.failed;
        result.errors.push(...batchResult.errors);
      } catch (error) {
        // Si l'endpoint de batch échoue, traiter individuellement
        await this.processBatchIndividually(batch, result);
      }
    }

    result.success = result.failedCount === 0;
    return result;
  }

  private async syncBatch(operations: PendingOperation[]): Promise<{
    processed: number;
    failed: number;
    errors: Array<{ operation: PendingOperation; error: string }>;
  }> {
    const batchData = operations.map(op => ({
      id: op.id,
      type: op.type,
      endpoint: op.endpoint,
      method: op.method,
      data: op.data,
      headers: op.headers
    }));

    try {
      const response = await axiosInstance.post('/api/sync/batch', {
        operations: batchData
      });

      const results = response.data.results;
      let processed = 0;
      let failed = 0;
      const errors: Array<{ operation: PendingOperation; error: string }> = [];

      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i];
        const operationResult = results[i];

        if (operationResult.success) {
          if (operation.id) {
            await this.storageService.removePendingOperation(operation.id);
          }
          processed++;
        } else {
          if (operation.id) {
            await this.storageService.incrementRetryCount(operation.id);
            
            // Supprimer l'opération si le nombre max de tentatives est atteint
            if (operation.retryCount >= operation.maxRetries) {
              await this.storageService.removePendingOperation(operation.id);
            }
          }
          failed++;
          errors.push({
            operation,
            error: operationResult.error || 'Erreur inconnue'
          });
        }
      }

      return { processed, failed, errors };

    } catch (error) {
      throw error; // Laisser le chiamant gérer l'erreur
    }
  }

  private async processBatchIndividually(
    operations: PendingOperation[], 
    result: SyncResult
  ): Promise<void> {
    for (const operation of operations) {
      try {
        await this.processIndividualOperation(operation);
        result.processedCount++;
      } catch (error) {
        result.failedCount++;
        result.errors.push({
          operation,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });

        // Incrémenter le compteur de tentatives
        if (operation.id) {
          await this.storageService.incrementRetryCount(operation.id);
          
          // Supprimer l'opération si le nombre max de tentatives est atteint
          if (operation.retryCount >= operation.maxRetries) {
            await this.storageService.removePendingOperation(operation.id);
          }
        }
      }
    }
  }

  private async processIndividualOperation(operation: PendingOperation): Promise<void> {
    const config: any = {
      method: operation.method,
      url: operation.endpoint,
      headers: operation.headers
    };

    if (operation.data && ['POST', 'PUT', 'PATCH'].includes(operation.method)) {
      config.data = operation.data;
    }

    const response = await axiosInstance(config);
    
    if (response.status >= 200 && response.status < 300) {
      if (operation.id) {
        await this.storageService.removePendingOperation(operation.id);
      }
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  public addSyncListener(listener: (result: SyncResult) => void): () => void {
    this.syncListeners.push(listener);
    
    return () => {
      const index = this.syncListeners.indexOf(listener);
      if (index > -1) {
        this.syncListeners.splice(index, 1);
      }
    };
  }

  private notifySyncListeners(result: SyncResult): void {
    this.syncListeners.forEach(listener => listener(result));
  }

  public async forcSync(): Promise<SyncResult> {
    return await this.syncPendingOperations();
  }

  public isSyncing(): boolean {
    return this.isCurrentlySyncing;
  }

  public async getSyncStatus() {
    return await this.storageService.getSyncStatus();
  }

  public async clearAllPendingOperations(): Promise<void> {
    await this.storageService.clearAllPendingOperations();
    await this.storageService.updateSyncStatus({
      pendingCount: 0,
      status: 'idle'
    });
  }

  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.syncListeners = [];
  }
}