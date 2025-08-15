import Dexie, { Table } from 'dexie';
import CryptoJS from 'crypto-js';

export interface PendingOperation {
  id?: number;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  data?: any;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  headers?: Record<string, string>;
}

export interface CachedData {
  id?: number;
  key: string;
  data: any;
  timestamp: number;
  expiresAt?: number;
}

export interface SyncStatus {
  id?: number;
  lastSyncTimestamp: number;
  pendingCount: number;
  status: 'idle' | 'syncing' | 'error';
  lastError?: string;
}

class OfflineDatabase extends Dexie {
  pendingOperations!: Table<PendingOperation>;
  cachedData!: Table<CachedData>;
  syncStatus!: Table<SyncStatus>;

  constructor() {
    super('ISJOfflineDB');
    
    this.version(1).stores({
      pendingOperations: '++id, type, endpoint, timestamp, retryCount',
      cachedData: '++id, key, timestamp, expiresAt',
      syncStatus: '++id, lastSyncTimestamp, status'
    });
  }
}

export class OfflineStorageService {
  private static instance: OfflineStorageService;
  private db: OfflineDatabase;
  private encryptionKey: string;

  private constructor() {
    this.db = new OfflineDatabase();
    this.encryptionKey = this.getOrCreateEncryptionKey();
  }

  public static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  private getOrCreateEncryptionKey(): string {
    const key = 'isj-encryption-key';
    let encryptionKey = localStorage.getItem(key);
    
    if (!encryptionKey) {
      encryptionKey = CryptoJS.lib.WordArray.random(256/8).toString();
      localStorage.setItem(key, encryptionKey);
    }
    
    return encryptionKey;
  }

  private encrypt(data: any): string {
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.encryptionKey).toString();
  }

  private decrypt(encryptedData: string): any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

  // Gestion des opérations en attente
  public async addPendingOperation(operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>): Promise<number> {
    const pendingOp: PendingOperation = {
      ...operation,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: operation.maxRetries || 3
    };

    return await this.db.pendingOperations.add(pendingOp);
  }

  public async getPendingOperations(): Promise<PendingOperation[]> {
    return await this.db.pendingOperations.orderBy('timestamp').toArray();
  }

  public async removePendingOperation(id: number): Promise<void> {
    await this.db.pendingOperations.delete(id);
  }

  public async incrementRetryCount(id: number): Promise<void> {
    const operation = await this.db.pendingOperations.get(id);
    if (operation) {
      await this.db.pendingOperations.update(id, {
        retryCount: operation.retryCount + 1
      });
    }
  }

  public async clearAllPendingOperations(): Promise<void> {
    await this.db.pendingOperations.clear();
  }

  // Gestion du cache des données
  public async cacheData(key: string, data: any, expirationMinutes?: number): Promise<void> {
    const encryptedData = this.encrypt(data);
    const timestamp = Date.now();
    const expiresAt = expirationMinutes ? timestamp + (expirationMinutes * 60 * 1000) : undefined;

    await this.db.cachedData.put({
      key,
      data: encryptedData,
      timestamp,
      expiresAt
    });
  }

  public async getCachedData(key: string): Promise<any | null> {
    const cached = await this.db.cachedData.where('key').equals(key).first();
    
    if (!cached) return null;
    
    // Vérifier l'expiration
    if (cached.expiresAt && Date.now() > cached.expiresAt) {
      await this.removeCachedData(key);
      return null;
    }

    try {
      return this.decrypt(cached.data);
    } catch (error) {
      console.error('Erreur lors du déchiffrement des données:', error);
      await this.removeCachedData(key);
      return null;
    }
  }

  public async removeCachedData(key: string): Promise<void> {
    await this.db.cachedData.where('key').equals(key).delete();
  }

  public async clearExpiredCache(): Promise<void> {
    const now = Date.now();
    await this.db.cachedData.where('expiresAt').below(now).delete();
  }

  public async clearAllCache(): Promise<void> {
    await this.db.cachedData.clear();
  }

  // Gestion du statut de synchronisation
  public async updateSyncStatus(status: Partial<SyncStatus>): Promise<void> {
    const currentStatus = await this.getSyncStatus();
    const updatedStatus = { ...currentStatus, ...status };
    
    if (currentStatus.id) {
      await this.db.syncStatus.update(currentStatus.id, updatedStatus);
    } else {
      await this.db.syncStatus.add(updatedStatus as SyncStatus);
    }
  }

  public async getSyncStatus(): Promise<SyncStatus> {
    const status = await this.db.syncStatus.orderBy('id').last();
    return status || {
      lastSyncTimestamp: 0,
      pendingCount: 0,
      status: 'idle'
    };
  }

  // Utilitaires
  public async getStorageStats(): Promise<{
    pendingOperations: number;
    cachedItems: number;
    totalSize: string;
  }> {
    const pendingCount = await this.db.pendingOperations.count();
    const cachedCount = await this.db.cachedData.count();
    
    // Estimation approximative de la taille
    const estimate = await navigator.storage?.estimate?.();
    const totalSize = estimate?.usage ? `${(estimate.usage / 1024 / 1024).toFixed(2)} MB` : 'N/A';

    return {
      pendingOperations: pendingCount,
      cachedItems: cachedCount,
      totalSize
    };
  }

  public async clearAllData(): Promise<void> {
    await Promise.all([
      this.clearAllPendingOperations(),
      this.clearAllCache(),
      this.db.syncStatus.clear()
    ]);
  }

  // Méthodes spécifiques pour les entités ISJ
  public async cacheStudents(students: any[]): Promise<void> {
    await this.cacheData('students', students, 60); // Cache pendant 1 heure
  }

  public async getCachedStudents(): Promise<any[] | null> {
    return await this.getCachedData('students');
  }

  public async cacheClasses(classes: any[]): Promise<void> {
    await this.cacheData('classes', classes, 120); // Cache pendant 2 heures
  }

  public async getCachedClasses(): Promise<any[] | null> {
    return await this.getCachedData('classes');
  }

  public async cacheTeachers(teachers: any[]): Promise<void> {
    await this.cacheData('teachers', teachers, 120); // Cache pendant 2 heures
  }

  public async getCachedTeachers(): Promise<any[] | null> {
    return await this.getCachedData('teachers');
  }

  public async cacheBulletins(bulletins: any[]): Promise<void> {
    await this.cacheData('bulletins', bulletins, 30); // Cache pendant 30 minutes
  }

  public async getCachedBulletins(): Promise<any[] | null> {
    return await this.getCachedData('bulletins');
  }
}