# Fonctionnalité d'Affectation des Élèves dans les Classes

## Vue d'ensemble

Cette fonctionnalité permet la gestion complète de l'affectation des élèves dans les salles de classe avec toutes les capacités demandées :

- ✅ Sélection/création de salles de classe existantes ou nouvelles
- ✅ Ajout d'un ou plusieurs élèves à une salle avec leurs informations complètes
- ✅ Gestion des conflits d'affectation
- ✅ Visualisation des élèves par salle
- ✅ Interface intuitive avec validation des données
- ✅ Gestion de la capacité maximale avec alertes

## Accès à la fonctionnalité

### Interface Web
1. Connectez-vous en tant qu'administrateur
2. Naviguez vers **Admin > Gestion académique > Affectation des élèves**
3. URL directe : `/admin/classes/assignment`

## Fonctionnalités principales

### 1. Tableau de bord des statistiques
- **Classes totales** : Nombre total de classes dans l'établissement
- **Capacité totale** : Somme des capacités maximales de toutes les classes
- **Élèves inscrits** : Nombre total d'élèves actifs
- **Taux d'occupation** : Pourcentage global d'occupation des classes

### 2. Système de filtrage avancé
- **Recherche** : Par nom de classe, élève, matricule
- **Année scolaire** : Filtrage par année scolaire
- **Section** : Filtrage par section académique
- **Élèves non affectés** : Vue dédiée aux élèves sans classe

### 3. Vue par classes
- **Cartes de classe** avec informations complètes :
  - Nom de la classe et salle
  - Section et option
  - Année scolaire
  - Capacité et occupation en temps réel
  - Indicateurs visuels de capacité (vert/orange/rouge)
  - Actions : Voir élèves, Affecter élève

### 4. Vue par élèves
- **Liste complète des élèves** avec :
  - Informations personnelles (nom, prénom, matricule)
  - Statut d'affectation (classe actuelle ou "Non affecté")
  - Actions : Voir détails, Affecter à une classe

### 5. Dialog d'affectation d'élèves
- **Sélection d'élève** avec recherche intelligente
- **Sélection de classe** avec indicateurs de capacité
- **Prévention des conflits** :
  - Vérification de la capacité maximale
  - Détection des changements de classe
  - Confirmation pour les affectations forcées
- **Résumé de l'affectation** avant validation

### 6. Vue détaillée par classe
- **Informations complètes de la classe**
- **Liste détaillée des élèves** avec :
  - Numérotation automatique
  - Informations complètes (nom, matricule, genre, téléphone parent)
  - Section et option de chaque élève
  - Action pour retirer un élève

## Fonctionnalités de validation et sécurité

### Validation de capacité
- **Vérification automatique** avant chaque affectation
- **Alertes visuelles** pour les classes proches de la capacité
- **Blocage des affectations** si capacité dépassée
- **Messages d'erreur informatifs**

### Gestion des conflits
- **Détection automatique** des conflits d'affectation :
  - Élève déjà dans une autre classe
  - Changement de section ou d'option
- **Options de résolution** :
  - Annulation de l'affectation
  - Affectation forcée avec avertissements
- **Historique des changements**

### Validation des données
- **Vérification de l'existence** des élèves et classes
- **Contrôle d'intégrité** des relations
- **Messages d'erreur détaillés**

## API Backend

### Nouveaux endpoints créés

#### Élèves
- `GET /api/eleves/classe/:classeId` - Obtenir les élèves d'une classe
- `POST /api/eleves/add-to-classe` - Affecter un élève à une classe
- `GET /api/eleves?classeId=null` - Obtenir les élèves non affectés

#### Classes
- `GET /api/academics/classes/stats` - Statistiques des classes
- `DELETE /api/academics/classes/:classeId/students/:eleveId` - Retirer un élève

### Fonctionnalités backend ajoutées

#### Contrôleur des élèves (`eleveController.ts`)
- `checkClassCapacity()` - Vérification de la capacité
- `checkStudentConflicts()` - Détection des conflits
- `getElevesByClasse()` - Liste des élèves par classe
- `addEleveToClasse()` - Affectation avec validation

#### Contrôleur des classes (`academics/classeController.ts`)
- Extension du modèle avec `capaciteMaximale` et `description`
- `getClassesStats()` - Statistiques globales
- `removeStudentFromClasse()` - Retrait d'élève
- Enrichissement des réponses avec informations de capacité

## Modèle de données étendu

### Classe
```prisma
model Classe {
  id                  String    @id @default(auto()) @map("_id") @db.ObjectId
  nom                 String
  salle               String?
  capaciteMaximale    Int       @default(30)  // NOUVEAU
  description         String?                  // NOUVEAU
  // ... autres champs existants
}
```

### Enrichissement des réponses
Toutes les réponses de classes incluent maintenant :
- `studentsCount` : Nombre d'élèves actuels
- `availableSpots` : Places libres
- `isAtCapacity` : Booléen indiquant si la capacité est atteinte
- `capacityPercentage` : Pourcentage d'occupation

## Interface utilisateur

### Composants créés
- `ClassStatsCard` - Carte de statistiques
- `ClassManagementCard` - Carte de gestion de classe
- `StudentAssignmentDialog` - Dialog d'affectation
- `StudentListByClass` - Liste d'élèves par classe
- `Progress` - Barre de progression (composant UI)

### Pages créées
- `/admin/classes/assignment` - Page principale d'affectation

### Navigation
- Ajout du lien "Affectation des élèves" dans le menu admin
- Icône : `UserCheck`
- Prefetch automatique pour de meilleures performances

## Utilisation

### Affecter un élève à une classe
1. Cliquez sur "Affecter un élève" ou "Affecter" sur une carte de classe
2. Recherchez et sélectionnez l'élève
3. Recherchez et sélectionnez la classe de destination
4. Vérifiez le résumé de l'affectation
5. Confirmez l'affectation

### Gérer les conflits
1. Si des conflits sont détectés, un dialog apparaît
2. Lisez les avertissements (changement de classe, section, option)
3. Choisissez :
   - **Annuler** : Revenir à la sélection
   - **Forcer** : Procéder malgré les conflits

### Visualiser les élèves d'une classe
1. Cliquez sur "Voir élèves" sur une carte de classe
2. Consultez les informations de la classe
3. Parcourez la liste détaillée des élèves
4. Utilisez "Retirer" pour désaffecter un élève

### Gérer les capacités
- Les classes proches de la capacité (≥80%) sont marquées en orange
- Les classes pleines (100%) sont marquées en rouge
- Les affectations vers des classes pleines sont bloquées
- Des messages d'alerte informent sur l'état de capacité

## Messages et notifications

### Types de messages
- **Succès** : Affectation réussie, retrait réussi
- **Avertissement** : Conflits détectés, capacité proche
- **Erreur** : Capacité dépassée, élève non trouvé, erreurs de connexion
- **Information** : Actions en cours, états du système

### Gestion des erreurs
- **Validation côté client** : Vérifications immédiates
- **Validation côté serveur** : Sécurité et intégrité
- **Messages détaillés** : Aide à la résolution des problèmes
- **Codes d'erreur HTTP** appropriés (400, 404, 409, 500)

## Performance et optimisation

### Frontend
- **Prefetch** des routes de navigation
- **Loading states** pendant les opérations
- **Optimistic updates** pour une meilleure UX
- **Recherche côté client** pour les listes courtes

### Backend
- **Requêtes optimisées** avec includes appropriés
- **Validation en une seule requête** pour les affectations
- **Transactions** pour les opérations critiques
- **Cache des statistiques** (futur)

## Tests et validation

### Tests recommandés
1. **Affectation normale** : Élève non affecté vers classe libre
2. **Gestion de capacité** : Tentative d'affectation vers classe pleine
3. **Conflits** : Changement de classe d'un élève déjà affecté
4. **Recherche** : Filtrage et recherche d'élèves/classes
5. **Retrait** : Désaffectation d'un élève
6. **Interface responsive** : Test sur mobile/tablette

### Validation des données
- Tous les champs requis sont validés
- Les IDs d'élèves et classes sont vérifiés
- Les capacités sont respectées
- Les états sont cohérents

## Sécurité

### Contrôle d'accès
- **Authentification requise** : Utilisateur connecté
- **Autorisation admin** : Rôle administrateur obligatoire
- **Validation des sessions** : Vérification à chaque requête

### Validation des données
- **Sanitisation** des entrées utilisateur
- **Vérification d'existence** des entités référencées
- **Contrôle d'intégrité** des relations
- **Prévention des injections** via Prisma ORM

## Maintenance et évolutions futures

### Améliorations possibles
- **Import/Export** d'affectations en masse
- **Historique** des affectations
- **Notifications** automatiques aux parents
- **Règles d'affectation** automatiques
- **Rapports** d'occupation des classes
- **API publique** pour intégrations externes

### Surveillance
- **Logs** des affectations importantes
- **Métriques** d'utilisation
- **Alertes** sur les erreurs critiques
- **Monitoring** des performances

## Support

Pour toute question ou problème :
1. Vérifiez les logs du serveur
2. Consultez les messages d'erreur détaillés
3. Testez avec des données d'exemple
4. Contactez l'équipe de développement

---

**Note** : Cette fonctionnalité a été conçue pour être intuitive et robuste, avec une attention particulière portée à la validation des données et à la gestion des cas d'erreur.