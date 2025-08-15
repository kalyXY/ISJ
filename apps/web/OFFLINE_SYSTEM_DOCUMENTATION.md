# Système Offline-First ISJ - Documentation

## Vue d'ensemble

Le système offline-first de l'application ISJ permet de continuer à utiliser l'application même en cas de perte de connexion Internet. Toutes les modifications effectuées hors ligne sont automatiquement synchronisées dès que la connexion est rétablie.

## Architecture

### Composants principaux

1. **NetworkService** (`/lib/network.ts`)
   - Détection automatique de l'état de la connexion
   - Écouteurs d'événements online/offline
   - Test de connectivité réelle vers le serveur

2. **OfflineStorageService** (`/lib/storage.ts`)
   - Stockage local sécurisé avec IndexedDB
   - Chiffrement des données sensibles
   - Gestion du cache avec expiration
   - File d'attente des opérations pending

3. **SyncService** (`/lib/syncService.ts`)
   - Synchronisation automatique et manuelle
   - Traitement en lot des opérations
   - Gestion des conflits et des erreurs
   - Retry automatique avec backoff

4. **OfflineApiWrapper** (`/lib/offlineApiWrapper.ts`)
   - Intercepteur transparent pour axios
   - Mise en cache automatique des réponses
   - Stockage automatique des mutations offline

## Fonctionnalités

### 🔄 Synchronisation automatique

- Déclenchement automatique au retour de connexion
- Synchronisation périodique (toutes les 5 minutes)
- Traitement par lot pour optimiser les performances
- Gestion des erreurs avec retry automatique

### 💾 Stockage local sécurisé

- **IndexedDB** pour les données complexes
- **Chiffrement AES** des données sensibles
- **Expiration automatique** du cache
- **Compression** des données volumineuses

### 🌐 Gestion réseau intelligente

- Détection automatique online/offline
- Test de connectivité réelle vers le serveur
- Fallback vers le cache en cas d'erreur réseau

### 🎯 Mode offline transparent

- Continuation de l'utilisation normale de l'app
- Interface utilisateur inchangée
- Indicateurs visuels du statut offline

## Utilisation

### Interface utilisateur

L'indicateur de statut offline est visible dans la sidebar admin et affiche :

- 🟢 **En ligne** : Connexion active
- 🔴 **Hors ligne** : Mode offline activé
- 🔄 **Synchronisation...** : Sync en cours
- ⚠️ **Erreur de sync** : Problème de synchronisation

### Opérations supportées

#### Lecture de données
```typescript
// Lecture automatique depuis le cache si offline
const students = await getStudents();
const student = await getStudentById('123');
```

#### Création, modification, suppression
```typescript
// Stockage automatique en file d'attente si offline
const newStudent = await createStudent(studentData);
await updateStudent('123', updates);
await archiveStudent('456');
```

### Services offline-ready

- **Students** : `studentsOfflineService`
- **Classes** : Support natif via OfflineApiWrapper
- **Teachers** : Support natif via OfflineApiWrapper
- **Bulletins** : Support natif via OfflineApiWrapper

## Configuration

### Durées de cache par défaut

```typescript
const CACHE_DURATIONS = {
  students: 60,    // 1 heure
  classes: 120,    // 2 heures  
  teachers: 120,   // 2 heures
  grades: 30,      // 30 minutes
  bulletins: 30    // 30 minutes
};
```

### Paramètres de synchronisation

```typescript
const SYNC_CONFIG = {
  batchSize: 10,           // Opérations par lot
  retryInterval: 5 * 60,   // 5 minutes entre sync
  maxRetries: 3,           // Tentatives max par opération
  timeout: 5000            // Timeout de connectivité
};
```

## API Backend

### Endpoints de synchronisation

#### `POST /api/sync/batch`
Traite un lot d'opérations en mode synchronisé.

```json
{
  "operations": [
    {
      "type": "CREATE",
      "endpoint": "/academics/eleves",
      "method": "POST",
      "data": { "nom": "Dupont", "prenom": "Jean" }
    },
    {
      "type": "UPDATE", 
      "endpoint": "/academics/eleves/123",
      "method": "PUT",
      "data": { "prenom": "Jean-Claude" }
    }
  ]
}
```

**Réponse :**
```json
{
  "success": true,
  "processed": 2,
  "failed": 0,
  "results": [
    { "success": true, "data": {...} },
    { "success": true, "data": {...} }
  ]
}
```

#### `POST /api/sync/operation`
Traite une opération individuelle.

#### `GET /api/sync/health`
Endpoint de test de connectivité.

## Tests et validation

### Exécution des tests

```typescript
// Dans la console du navigateur
await runOfflineTests();
```

### Simulation de scénarios

```typescript
// Simulation complète offline
const testSuite = new OfflineTestSuite();
await testSuite.simulateOfflineScenario();
```

### Tests automatisés

- ✅ Détection de connexion
- ✅ Stockage local
- ✅ Mise en cache
- ✅ Opérations hors ligne
- ✅ Chiffrement des données
- ✅ Nettoyage du cache

## Monitoring et debugging

### Outils de diagnostic

```typescript
// Statistiques de stockage
const stats = await storageService.getStorageStats();
console.log('Opérations en attente:', stats.pendingOperations);
console.log('Éléments en cache:', stats.cachedItems);
console.log('Taille totale:', stats.totalSize);

// Statut de synchronisation
const syncStatus = await syncService.getSyncStatus();
console.log('Dernière sync:', syncStatus.lastSyncTimestamp);
console.log('Statut:', syncStatus.status);
```

### Logs et erreurs

Les erreurs sont automatiquement loggées dans la console avec des préfixes :
- 🌐 `[Network]` : Événements réseau
- 💾 `[Storage]` : Opérations de stockage
- 🔄 `[Sync]` : Synchronisation
- 🔒 `[Security]` : Chiffrement

## Gestion des conflits

### Stratégie de résolution

1. **Timestamp-based** : Les données les plus récentes gagnent
2. **Server-side validation** : Le serveur valide la cohérence
3. **Manual resolution** : Interface pour conflits complexes

### Exemples de conflits

```typescript
// Conflit de modification simultanée
// Local: { nom: "Dupont-Martin", updatedAt: "2024-01-15T10:00:00Z" }
// Server: { nom: "Dupont", updatedAt: "2024-01-15T10:30:00Z" }
// Résolution: Server wins (plus récent)
```

## Sécurité

### Chiffrement des données

- **Algorithme** : AES-256
- **Clé** : Générée et stockée localement
- **Scope** : Toutes les données sensibles en cache

### Validation côté serveur

- Authentification requise pour tous les endpoints sync
- Validation des permissions utilisateur
- Sanitisation des données entrantes

## Performance

### Optimisations implémentées

- **Compression** des données volumineuses
- **Pagination** du cache en lecture
- **Batch processing** pour la synchronisation
- **Background sync** non-bloquant

### Métriques typiques

- **Temps de sync** : < 2s pour 100 opérations
- **Taille de cache** : ~10MB pour 1000 étudiants
- **Temps de réponse offline** : < 100ms

## Limitations connues

1. **Taille de cache** : Limitée par le quota IndexedDB du navigateur (~50MB)
2. **Conflits complexes** : Résolution automatique limitée aux cas simples
3. **Synchronisation** : Nécessite une connexion stable pour gros volumes

## Maintenance

### Nettoyage périodique

```typescript
// Nettoyage automatique du cache expiré (quotidien)
setInterval(async () => {
  await storageService.clearExpiredCache();
}, 24 * 60 * 60 * 1000);
```

### Mise à jour de la structure

En cas de changement de structure de données :

1. Incrementer la version de la DB
2. Ajouter une migration dans `OfflineDatabase`
3. Tester la compatibilité ascendante

## Roadmap

### Améliorations futures

- [ ] **Sync différentielle** : Seulement les changements
- [ ] **Résolution de conflits avancée** : Interface utilisateur
- [ ] **Compression avancée** : Algorithmes optimisés
- [ ] **Analytics offline** : Métriques d'utilisation
- [ ] **PWA integration** : Service Worker pour sync background

### Version 2.0

- [ ] **Multi-device sync** : Synchronisation entre appareils
- [ ] **Collaborative editing** : Édition simultanée
- [ ] **Real-time updates** : WebSocket integration
- [ ] **Advanced caching** : Cache predicitif intelligent

## Support et dépannage

### Problèmes courants

**Q: L'application ne synchronise pas**
A: Vérifier la connectivité réseau et les logs de synchronisation

**Q: Les données offline sont perdues**
A: Vérifier l'espace de stockage disponible et les quotas IndexedDB

**Q: Synchronisation lente**
A: Réduire la taille des lots ou vérifier la latence réseau

### Contact support

Pour tout problème technique :
- 📧 Email : support@isj.com
- 📋 Issues : GitHub repository
- 💬 Chat : Support en ligne