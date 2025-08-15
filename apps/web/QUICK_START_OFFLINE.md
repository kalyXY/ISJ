# Guide de Démarrage Rapide - Système Offline ISJ

## 🚀 Test immédiat

### 1. Démarrer l'application

```bash
# Frontend
cd apps/web
npm run dev

# Backend (dans un autre terminal)
cd apps/server
npm run dev
```

### 2. Tester le système offline

#### Via l'interface utilisateur

1. **Connectez-vous** à l'interface admin
2. **Observez l'indicateur** de statut offline dans la sidebar (coin bas droite)
3. **Naviguez** vers la section Étudiants pour mettre en cache des données

#### Simulation du mode offline

1. **Ouvrez les DevTools** (F12)
2. **Onglet Network** → Cochez "Offline" 
3. **Ou simulez** une perte de réseau : `navigator.onLine = false`

#### Actions à tester offline

1. **Créer un étudiant** → L'opération sera mise en file d'attente
2. **Modifier un étudiant** → Changement stocké localement
3. **Consulter la liste** → Données servies depuis le cache
4. **Observer l'indicateur** → Affiche "Hors ligne" avec compteur d'opérations

#### Retour en ligne

1. **Désactivez le mode offline** dans les DevTools
2. **Ou simulez** le retour : `navigator.onLine = true`
3. **Observer la synchronisation** → L'indicateur affiche "Synchronisation..."
4. **Vérifier** que les opérations sont envoyées au serveur

### 3. Tests via console

```javascript
// Dans la console du navigateur

// Test complet automatisé
await runOfflineTests();

// Simulation de scénario
const testSuite = new OfflineTestSuite();
await testSuite.simulateOfflineScenario();

// Statistiques
const stats = await OfflineStorageService.getInstance().getStorageStats();
console.log('Stats:', stats);
```

## 📊 Indicateurs de fonctionnement

### Statuts visuels

| Icône | Statut | Description |
|-------|--------|-------------|
| 🟢 | En ligne | Connexion active, sync OK |
| 🔴 | Hors ligne | Mode offline, opérations en attente |
| 🔄 | Synchronisation... | Sync en cours |
| ⚠️ | Erreur | Problème de synchronisation |

### Compteurs

- **Badge numérique** : Nombre d'opérations en attente
- **Tooltip détaillé** : Informations complètes sur le statut
- **Menu contextuel** : Actions manuelles disponibles

## 🛠️ Actions disponibles

### Menu contextuel (clic sur l'indicateur)

1. **Forcer la synchronisation** : Déclenche une sync manuelle
2. **Statistiques de stockage** : Affiche l'usage du cache
3. **Nettoyer le cache expiré** : Optimise l'espace
4. **Supprimer toutes les données** : Reset complet (pour debug)

### Raccourcis développeur

```javascript
// Services globaux disponibles
window.NetworkService = NetworkService.getInstance();
window.OfflineStorageService = OfflineStorageService.getInstance();
window.SyncService = SyncService.getInstance();

// Actions rapides
window.forceSync = () => SyncService.getInstance().forcSync();
window.clearCache = () => OfflineStorageService.getInstance().clearAllData();
```

## 🔍 Vérification du fonctionnement

### Checklist de validation

- [ ] **L'indicateur** est visible dans la sidebar
- [ ] **Le statut** change selon la connectivité
- [ ] **Les opérations offline** sont mises en file d'attente
- [ ] **Le cache** fonctionne pour la consultation
- [ ] **La synchronisation** se déclenche au retour en ligne
- [ ] **Les données** sont persistantes après rechargement

### Logs à surveiller

```javascript
// Activer les logs détaillés
localStorage.setItem('debug-offline', 'true');

// Observer dans la console :
// 🌐 [Network] Événements de connexion
// 💾 [Storage] Opérations de cache
// 🔄 [Sync] Synchronisation
// 🔒 [Security] Chiffrement
```

## 🚨 Dépannage rapide

### Problèmes courants

**L'indicateur ne s'affiche pas**
```javascript
// Vérifier l'initialisation
console.log('Services:', {
  network: window.NetworkService?.isOnline?.(),
  storage: !!window.OfflineStorageService,
  sync: !!window.SyncService
});
```

**Les données ne se synchronisent pas**
```javascript
// Vérifier les opérations en attente
const ops = await OfflineStorageService.getInstance().getPendingOperations();
console.log('Opérations pending:', ops);

// Forcer la sync
await SyncService.getInstance().forcSync();
```

**Le cache ne fonctionne pas**
```javascript
// Vérifier IndexedDB
const stats = await OfflineStorageService.getInstance().getStorageStats();
console.log('Cache stats:', stats);

// Tester le stockage
await OfflineStorageService.getInstance().cacheData('test', {hello: 'world'});
const data = await OfflineStorageService.getInstance().getCachedData('test');
console.log('Test cache:', data);
```

### Reset complet

```javascript
// Nettoyage total (en cas de problème)
await OfflineStorageService.getInstance().clearAllData();
localStorage.clear();
location.reload();
```

## 📝 Scénarios de test recommandés

### Scénario 1 : Création offline
1. Passer offline
2. Créer 3 nouveaux étudiants
3. Observer le compteur d'opérations (3)
4. Revenir online
5. Vérifier la synchronisation automatique

### Scénario 2 : Modification offline
1. Charger une liste d'étudiants (mise en cache)
2. Passer offline
3. Modifier plusieurs étudiants
4. Revenir online
5. Vérifier que les modifications sont synchronisées

### Scénario 3 : Navigation offline
1. Consulter plusieurs sections (étudiants, classes, etc.)
2. Passer offline
3. Naviguer dans l'app
4. Vérifier que les données cachées s'affichent

### Scénario 4 : Persistance
1. Effectuer des opérations offline
2. Fermer l'onglet/navigateur
3. Rouvrir l'application
4. Vérifier que les opérations sont toujours en attente

## 🎯 Objectifs de performance

### Métriques cibles

- **Temps de réponse offline** : < 100ms
- **Taille du cache** : ~10MB pour 1000 étudiants
- **Temps de synchronisation** : < 2s pour 100 opérations
- **Ratio de succès sync** : > 99%

### Monitoring

```javascript
// Métriques en temps réel
setInterval(async () => {
  const stats = await OfflineStorageService.getInstance().getStorageStats();
  const syncStatus = await SyncService.getInstance().getSyncStatus();
  
  console.log('📊 Métriques:', {
    pendingOps: stats.pendingOperations,
    cacheSize: stats.totalSize,
    lastSync: new Date(syncStatus.lastSyncTimestamp).toLocaleString(),
    status: syncStatus.status
  });
}, 30000); // Toutes les 30 secondes
```

## 📚 Ressources

- **Documentation complète** : `OFFLINE_SYSTEM_DOCUMENTATION.md`
- **Tests automatisés** : `utils/offlineTest.ts`
- **Code source** : Dossier `/lib/` (network, storage, sync)
- **Interface** : `components/offline-status.tsx`

## 🔗 Liens utiles

- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Navigator.onLine](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine)
- [Dexie.js Documentation](https://dexie.org/)

---

**Support** : En cas de problème, consultez la documentation complète ou contactez l'équipe de développement.