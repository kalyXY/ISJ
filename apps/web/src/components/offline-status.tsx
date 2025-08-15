'use client';

import { useState } from 'react';
import { useOffline } from '@/hooks/useOffline';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  Trash2,
  Database
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const OfflineStatus = () => {
  const { 
    status, 
    forceSync, 
    getStorageStats, 
    clearOfflineData, 
    clearExpiredCache 
  } = useOffline();
  
  const [isLoading, setIsLoading] = useState(false);
  const [storageStats, setStorageStats] = useState<{
    pendingOperations: number;
    cachedItems: number;
    totalSize: string;
  } | null>(null);

  const handleForceSync = async () => {
    setIsLoading(true);
    try {
      await forceSync();
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowStorageStats = async () => {
    try {
      const stats = await getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  };

  const handleClearCache = async () => {
    try {
      await clearExpiredCache();
      alert('Cache expiré nettoyé avec succès');
    } catch (error) {
      console.error('Erreur lors du nettoyage du cache:', error);
    }
  };

  const handleClearAllData = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les données hors ligne ? Cette action est irréversible.')) {
      try {
        await clearOfflineData();
        alert('Toutes les données hors ligne ont été supprimées');
      } catch (error) {
        console.error('Erreur lors de la suppression des données:', error);
      }
    }
  };

  const getStatusIcon = () => {
    if (status.isSyncing) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    if (!status.isOnline) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
    
    if (status.syncStatus === 'error') {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
    
    return <Wifi className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (status.isSyncing) {
      return 'Synchronisation...';
    }
    
    if (!status.isOnline) {
      return 'Hors ligne';
    }
    
    if (status.syncStatus === 'error') {
      return 'Erreur de sync';
    }
    
    return 'En ligne';
  };

  const getStatusBadgeVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (status.isSyncing) return 'default';
    if (!status.isOnline) return 'destructive';
    if (status.syncStatus === 'error') return 'secondary';
    return 'outline';
  };

  const formatLastSync = () => {
    if (!status.lastSyncTimestamp || status.lastSyncTimestamp === 0) {
      return 'Jamais synchronisé';
    }
    
    return formatDistanceToNow(new Date(status.lastSyncTimestamp), {
      addSuffix: true,
      locale: fr
    });
  };

  return (
    <TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <Badge variant={getStatusBadgeVariant()} className="text-xs">
                    {getStatusText()}
                  </Badge>
                  {status.pendingOperations > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {status.pendingOperations}
                    </Badge>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm space-y-1">
                  <p><strong>Statut:</strong> {getStatusText()}</p>
                  <p><strong>Opérations en attente:</strong> {status.pendingOperations}</p>
                  <p><strong>Dernière sync:</strong> {formatLastSync()}</p>
                  {status.lastError && (
                    <p className="text-red-500"><strong>Erreur:</strong> {status.lastError}</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-64">
          <div className="px-3 py-2 text-sm">
            <div className="font-medium mb-2">État de la synchronisation</div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Statut:</span>
                <span className={
                  status.isOnline 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }>
                  {getStatusText()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>En attente:</span>
                <span>{status.pendingOperations} opération(s)</span>
              </div>
              <div className="flex justify-between">
                <span>Dernière sync:</span>
                <span>{formatLastSync()}</span>
              </div>
              {status.lastError && (
                <div className="text-red-500 mt-2">
                  <div className="font-medium">Dernière erreur:</div>
                  <div className="text-xs">{status.lastError}</div>
                </div>
              )}
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleForceSync}
            disabled={isLoading || !status.isOnline}
            className="cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Forcer la synchronisation
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleShowStorageStats}
            className="cursor-pointer"
          >
            <Database className="h-4 w-4 mr-2" />
            Statistiques de stockage
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleClearCache}
            className="cursor-pointer"
          >
            <Clock className="h-4 w-4 mr-2" />
            Nettoyer le cache expiré
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleClearAllData}
            className="cursor-pointer text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer toutes les données
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Affichage des statistiques de stockage */}
      {storageStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Statistiques de stockage</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Opérations en attente:</span>
                <span>{storageStats.pendingOperations}</span>
              </div>
              <div className="flex justify-between">
                <span>Éléments en cache:</span>
                <span>{storageStats.cachedItems}</span>
              </div>
              <div className="flex justify-between">
                <span>Taille totale:</span>
                <span>{storageStats.totalSize}</span>
              </div>
            </div>
            <Button 
              onClick={() => setStorageStats(null)} 
              className="mt-4 w-full"
            >
              Fermer
            </Button>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
};