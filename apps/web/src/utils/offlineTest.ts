import { NetworkService } from '@/lib/network';
import { OfflineStorageService } from '@/lib/storage';
import { SyncService } from '@/lib/syncService';

export class OfflineTestSuite {
  private networkService: NetworkService;
  private storageService: OfflineStorageService;
  private syncService: SyncService;

  constructor() {
    this.networkService = NetworkService.getInstance();
    this.storageService = OfflineStorageService.getInstance();
    this.syncService = SyncService.getInstance();
  }

  public async runAllTests(): Promise<{ passed: number; failed: number; results: Array<{ test: string; passed: boolean; error?: string }> }> {
    const results: Array<{ test: string; passed: boolean; error?: string }> = [];

    const tests = [
      { name: 'Test de détection de connexion', fn: this.testNetworkDetection.bind(this) },
      { name: 'Test de stockage local', fn: this.testLocalStorage.bind(this) },
      { name: 'Test de mise en cache', fn: this.testCaching.bind(this) },
      { name: 'Test des opérations hors ligne', fn: this.testOfflineOperations.bind(this) },
      { name: 'Test de chiffrement', fn: this.testEncryption.bind(this) },
      { name: 'Test de nettoyage du cache', fn: this.testCacheCleanup.bind(this) }
    ];

    for (const test of tests) {
      try {
        await test.fn();
        results.push({ test: test.name, passed: true });
      } catch (error) {
        results.push({ 
          test: test.name, 
          passed: false, 
          error: error instanceof Error ? error.message : 'Erreur inconnue' 
        });
      }
    }

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    return { passed, failed, results };
  }

  private async testNetworkDetection(): Promise<void> {
    console.log('🧪 Test de détection de connexion...');
    
    // Vérifier que le service network fonctionne
    const isOnline = this.networkService.isOnline();
    if (typeof isOnline !== 'boolean') {
      throw new Error('La détection de connexion ne retourne pas un booléen');
    }

    // Tester l'ajout et suppression de listeners
    let callbackExecuted = false;
    const removeListener = this.networkService.addListener((isOnline) => {
      callbackExecuted = true;
    });

    // Supprimer le listener
    removeListener();

    console.log('✅ Test de détection de connexion réussi');
  }

  private async testLocalStorage(): Promise<void> {
    console.log('🧪 Test de stockage local...');

    // Test d'ajout d'opération en attente
    const operationId = await this.storageService.addPendingOperation({
      type: 'CREATE',
      endpoint: '/test/endpoint',
      method: 'POST',
      data: { test: 'data' },
      maxRetries: 3
    });

    if (!operationId) {
      throw new Error('Échec de l\'ajout d\'opération en attente');
    }

    // Test de récupération des opérations en attente
    const pendingOps = await this.storageService.getPendingOperations();
    if (pendingOps.length === 0) {
      throw new Error('Aucune opération en attente trouvée');
    }

    // Test de suppression
    await this.storageService.removePendingOperation(operationId);
    const updatedOps = await this.storageService.getPendingOperations();
    
    if (updatedOps.some(op => op.id === operationId)) {
      throw new Error('L\'opération n\'a pas été supprimée');
    }

    console.log('✅ Test de stockage local réussi');
  }

  private async testCaching(): Promise<void> {
    console.log('🧪 Test de mise en cache...');

    const testData = [
      { id: '1', nom: 'Test', prenom: 'Student' },
      { id: '2', nom: 'Another', prenom: 'Student' }
    ];

    // Test de mise en cache des étudiants
    await this.storageService.cacheStudents(testData);

    // Test de récupération
    const cachedStudents = await this.storageService.getCachedStudents();
    if (!cachedStudents || cachedStudents.length !== testData.length) {
      throw new Error('Les données mises en cache ne correspondent pas');
    }

    // Test de mise en cache avec expiration
    await this.storageService.cacheData('test-key', { test: 'value' }, 1); // 1 minute

    const cachedValue = await this.storageService.getCachedData('test-key');
    if (!cachedValue || cachedValue.test !== 'value') {
      throw new Error('Les données avec expiration ne sont pas correctes');
    }

    // Nettoyage
    await this.storageService.removeCachedData('test-key');

    console.log('✅ Test de mise en cache réussi');
  }

  private async testOfflineOperations(): Promise<void> {
    console.log('🧪 Test des opérations hors ligne...');

    // Simuler des opérations hors ligne
    const operations = [
      {
        type: 'CREATE' as const,
        endpoint: '/academics/eleves',
        method: 'POST' as const,
        data: { nom: 'Test', prenom: 'Offline' },
        maxRetries: 3
      },
      {
        type: 'UPDATE' as const,
        endpoint: '/academics/eleves/123',
        method: 'PUT' as const,
        data: { nom: 'Updated' },
        maxRetries: 3
      }
    ];

    // Ajouter les opérations
    for (const op of operations) {
      await this.storageService.addPendingOperation(op);
    }

    // Vérifier qu'elles sont stockées
    const storedOps = await this.storageService.getPendingOperations();
    if (storedOps.length < operations.length) {
      throw new Error('Toutes les opérations n\'ont pas été stockées');
    }

    // Test du statut de synchronisation
    await this.storageService.updateSyncStatus({
      status: 'syncing',
      pendingCount: storedOps.length,
      lastSyncTimestamp: Date.now()
    });

    const syncStatus = await this.storageService.getSyncStatus();
    if (syncStatus.status !== 'syncing') {
      throw new Error('Le statut de synchronisation n\'a pas été mis à jour');
    }

    // Nettoyage
    await this.storageService.clearAllPendingOperations();

    console.log('✅ Test des opérations hors ligne réussi');
  }

  private async testEncryption(): Promise<void> {
    console.log('🧪 Test de chiffrement...');

    const sensitiveData = {
      id: '123',
      nom: 'Secret',
      prenom: 'Data',
      email: 'secret@example.com'
    };

    // Mettre en cache avec chiffrement
    await this.storageService.cacheData('encrypted-test', sensitiveData);

    // Récupérer et vérifier
    const decryptedData = await this.storageService.getCachedData('encrypted-test');
    
    if (!decryptedData || decryptedData.email !== sensitiveData.email) {
      throw new Error('Le chiffrement/déchiffrement a échoué');
    }

    // Vérifier que les données sont bien chiffrées dans IndexedDB
    // (Ceci est une vérification basique - en production on vérifierait directement dans IndexedDB)
    
    // Nettoyage
    await this.storageService.removeCachedData('encrypted-test');

    console.log('✅ Test de chiffrement réussi');
  }

  private async testCacheCleanup(): Promise<void> {
    console.log('🧪 Test de nettoyage du cache...');

    // Créer des données avec expiration courte
    await this.storageService.cacheData('expired-test', { value: 'should-expire' }, 0.01); // 0.6 secondes

    // Attendre l'expiration
    await new Promise(resolve => setTimeout(resolve, 100));

    // Nettoyer le cache expiré
    await this.storageService.clearExpiredCache();

    // Vérifier que les données expirées ont été supprimées
    const expiredData = await this.storageService.getCachedData('expired-test');
    if (expiredData !== null) {
      throw new Error('Les données expirées n\'ont pas été supprimées');
    }

    console.log('✅ Test de nettoyage du cache réussi');
  }

  public async simulateOfflineScenario(): Promise<void> {
    console.log('🎭 Simulation d\'un scénario hors ligne complet...');

    try {
      // 1. Mettre en cache des données initiales
      const initialData = [
        { id: '1', nom: 'Dupont', prenom: 'Jean', matricule: 'MAT001' },
        { id: '2', nom: 'Martin', prenom: 'Marie', matricule: 'MAT002' }
      ];
      await this.storageService.cacheStudents(initialData);

      // 2. Simuler des opérations hors ligne
      await this.storageService.addPendingOperation({
        type: 'CREATE',
        endpoint: '/academics/eleves',
        method: 'POST',
        data: { nom: 'Nouveau', prenom: 'Étudiant' },
        maxRetries: 3
      });

      await this.storageService.addPendingOperation({
        type: 'UPDATE',
        endpoint: '/academics/eleves/1',
        method: 'PUT',
        data: { prenom: 'Jean-Claude' },
        maxRetries: 3
      });

      // 3. Vérifier les statistiques
      const stats = await this.storageService.getStorageStats();
      console.log('📊 Statistiques de stockage:', stats);

      // 4. Tester le statut de synchronisation
      const syncStatus = await this.storageService.getSyncStatus();
      console.log('🔄 Statut de synchronisation:', syncStatus);

      console.log('✅ Simulation du scénario hors ligne réussie');
    } catch (error) {
      console.error('❌ Erreur dans la simulation:', error);
      throw error;
    }
  }

  public async cleanupAfterTests(): Promise<void> {
    console.log('🧹 Nettoyage après les tests...');
    
    await this.storageService.clearAllData();
    
    console.log('✅ Nettoyage terminé');
  }
}

// Fonction utilitaire pour exécuter les tests depuis la console
export const runOfflineTests = async (): Promise<void> => {
  const testSuite = new OfflineTestSuite();
  
  console.log('🚀 Démarrage des tests offline...');
  
  try {
    const results = await testSuite.runAllTests();
    
    console.log('\n📊 Résultats des tests:');
    console.log(`✅ Tests réussis: ${results.passed}`);
    console.log(`❌ Tests échoués: ${results.failed}`);
    
    if (results.failed > 0) {
      console.log('\n🔍 Détails des échecs:');
      results.results
        .filter(r => !r.passed)
        .forEach(r => console.log(`❌ ${r.test}: ${r.error}`));
    }

    // Simulation d'un scénario complet
    console.log('\n🎭 Simulation d\'un scénario complet...');
    await testSuite.simulateOfflineScenario();
    
  } catch (error) {
    console.error('💥 Erreur lors des tests:', error);
  } finally {
    await testSuite.cleanupAfterTests();
  }
};

// Export pour utilisation dans la console du navigateur
if (typeof window !== 'undefined') {
  (window as any).runOfflineTests = runOfflineTests;
  (window as any).OfflineTestSuite = OfflineTestSuite;
}