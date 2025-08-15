'use client';

import { useState, useEffect, useCallback } from 'react';
import { NetworkService } from '@/lib/network';
import { SyncService, SyncResult } from '@/lib/syncService';
import { OfflineStorageService } from '@/lib/storage';

export interface OfflineStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperations: number;
  lastSyncTimestamp: number;
  syncStatus: 'idle' | 'syncing' | 'error';
  lastError?: string;
}

export const useOffline = () => {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: true,
    isSyncing: false,
    pendingOperations: 0,
    lastSyncTimestamp: 0,
    syncStatus: 'idle'
  });

  const [networkService] = useState(() => NetworkService.getInstance());
  const [syncService] = useState(() => SyncService.getInstance());
  const [storageService] = useState(() => OfflineStorageService.getInstance());

  // Mettre à jour le statut depuis les services
  const updateStatus = useCallback(async () => {
    const syncStatus = await syncService.getSyncStatus();
    const isOnline = networkService.isOnline();
    const isSyncing = syncService.isSyncing();
    
    setStatus({
      isOnline,
      isSyncing,
      pendingOperations: syncStatus.pendingCount,
      lastSyncTimestamp: syncStatus.lastSyncTimestamp,
      syncStatus: syncStatus.status,
      lastError: syncStatus.lastError
    });
  }, [networkService, syncService]);

  // Configurer les listeners
  useEffect(() => {
    updateStatus();

    // Listener pour les changements de réseau
    const removeNetworkListener = networkService.addListener((isOnline) => {
      setStatus(prev => ({ ...prev, isOnline }));
    });

    // Listener pour les changements de synchronisation
    const removeSyncListener = syncService.addSyncListener((result: SyncResult) => {
      updateStatus();
    });

    // Mettre à jour le statut périodiquement
    const interval = setInterval(updateStatus, 10000); // Toutes les 10 secondes

    return () => {
      removeNetworkListener();
      removeSyncListener();
      clearInterval(interval);
    };
  }, [networkService, syncService, updateStatus]);

  // Forcer la synchronisation
  const forceSync = useCallback(async (): Promise<SyncResult> => {
    const result = await syncService.forcSync();
    await updateStatus();
    return result;
  }, [syncService, updateStatus]);

  // Vérifier la connectivité réelle
  const testConnectivity = useCallback(async (): Promise<boolean> => {
    return await networkService.testRealConnectivity();
  }, [networkService]);

  // Obtenir les statistiques de stockage
  const getStorageStats = useCallback(async () => {
    return await storageService.getStorageStats();
  }, [storageService]);

  // Nettoyer les données hors ligne
  const clearOfflineData = useCallback(async () => {
    await storageService.clearAllData();
    await updateStatus();
  }, [storageService, updateStatus]);

  // Nettoyer seulement le cache expiré
  const clearExpiredCache = useCallback(async () => {
    await storageService.clearExpiredCache();
  }, [storageService]);

  return {
    status,
    forceSync,
    testConnectivity,
    getStorageStats,
    clearOfflineData,
    clearExpiredCache,
    refreshStatus: updateStatus
  };
};