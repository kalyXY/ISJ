# MVP - Application Web École Saint Joseph
## Minimum Viable Product

---

**Projet :** Système de Gestion Scolaire Saint Joseph  
**Localisation :** Goma, République Démocratique du Congo  
**Date :** Juillet 2025  
**Version :** 1.0

---

## 1. Vision du Produit

### 1.1 Objectif Principal
Développer une application web moderne et intuitive qui digitalise la gestion administrative et pédagogique de l'école secondaire Saint Joseph, en tenant compte des spécificités locales et des contraintes techniques de la région.

### 1.2 Proposition de Valeur
- **Simplicité d'utilisation** adaptée aux différents niveaux de compétences numériques
- **Fonctionnement optimal** même avec une connexion internet limitée
- **Centralisation** de toutes les données scolaires
- **Communication améliorée** entre tous les acteurs éducatifs
- **Réduction des tâches administratives** manuelles

## 2. Analyse des Utilisateurs

### 2.1 Personas Principaux

#### **Administrateur/Directeur**
- **Besoins :** Vision globale, statistiques, gestion des ressources
- **Contraintes :** Temps limité, besoin de tableaux de bord synthétiques
- **Objectifs :** Optimiser la gestion, améliorer la qualité éducative

#### **Enseignant**
- **Besoins :** Gestion des notes, suivi des élèves, communication
- **Contraintes :** Accès limité aux outils numériques, temps de formation réduit
- **Objectifs :** Faciliter l'enseignement, améliorer le suivi pédagogique

#### **Élève**
- **Besoins :** Consulter notes, emploi du temps, communications
- **Contraintes :** Accès mobile principalement, connexion intermittente
- **Objectifs :** Suivre sa progression, accéder aux ressources

#### **Parent**
- **Besoins :** Suivi de la scolarité, communication avec l'école
- **Contraintes :** Familiarité limitée avec les outils numériques
- **Objectifs :** Accompagner efficacement son enfant

## 3. Fonctionnalités Core du MVP

### 3.1 Module Authentification & Gestion des Utilisateurs
**Priorité : CRITIQUE**

#### Fonctionnalités Essentielles :
- Système de connexion sécurisé avec rôles différenciés
- Gestion des profils utilisateurs
- Récupération de mot de passe par SMS/email
- Interface adaptée aux différents rôles

#### Critères d'Acceptation :
- Temps de connexion < 3 secondes
- Interface responsive (mobile-first)
- Sécurité : authentification à deux facteurs optionnelle

### 3.2 Module Gestion des Élèves
**Priorité : CRITIQUE**

#### Fonctionnalités Essentielles :
- Inscription et création de profils élèves
- Gestion des classes et promotions
- Suivi des présences (simple)
- Historique scolaire basique

#### Critères d'Acceptation :
- Recherche d'élèves en < 2 secondes
- Export des listes en format Excel/PDF
- Sauvegarde automatique des données

### 3.3 Module Gestion des Notes
**Priorité : CRITIQUE**

#### Fonctionnalités Essentielles :
- Saisie des notes par matière
- Calcul automatique des moyennes
- Génération de bulletins numériques
- Système de notation adapté au système congolais

#### Critères d'Acceptation :
- Interface de saisie intuitive
- Calculs automatiques sans erreur
- Génération de bulletins en PDF
- Historique des modifications

### 3.4 Module Communication
**Priorité : IMPORTANTE**

#### Fonctionnalités Essentielles :
- Messagerie interne simple
- Notifications push/SMS
- Annonces générales
- Communication parent-enseignant

#### Critères d'Acceptation :
- Notifications en temps réel
- Interface de messagerie simplifiée
- Intégration SMS locale

### 3.5 Module Emploi du Temps
**Priorité : IMPORTANTE**

#### Fonctionnalités Essentielles :
- Création d'emplois du temps par classe
- Affichage calendrier hebdomadaire
- Gestion des salles et professeurs
- Modifications en temps réel

#### Critères d'Acceptation :
- Vue calendrier responsive
- Synchronisation automatique
- Conflits détectés automatiquement

## 4. Architecture Technique MVP

### 4.1 Stack Technologique Recommandée

#### Frontend :
- **Framework :** React.js avec TypeScript
- **UI Library :** Tailwind CSS + Shadcn/UI
- **State Management :** Redux Toolkit
- **PWA :** Support offline basique

#### Backend :
- **Runtime :** Node.js avec Express
- **Base de données :** PostgreSQL + Redis (cache)
- **API :** REST avec documentation OpenAPI
- **Authentification :** JWT + bcrypt

#### Infrastructure :
- **Hébergement :** VPS local ou cloud hybride
- **CDN :** Optimisation pour l'Afrique
- **Backup :** Sauvegardes automatiques quotidiennes

### 4.2 Optimisations Locales
- **Compression :** Gzip/Brotli pour réduire la bande passante
- **Cache :** Stratégie de mise en cache agressive
- **Offline :** Fonctionnalités essentielles en mode hors ligne
- **Mobile-first :** Optimisation pour smartphones Android

## 5. Roadmap de Développement

### 5.1 Phase 1 (Mois 1-2) : Core Features
- [ ] Authentification et gestion utilisateurs
- [ ] Gestion de base des élèves
- [ ] Interface responsive
- [ ] Déploiement infrastructure

### 5.2 Phase 2 (Mois 3-4) : Fonctionnalités Pédagogiques
- [ ] Module de gestion des notes
- [ ] Génération de bulletins
- [ ] Communication basique
- [ ] Tests utilisateurs

### 5.3 Phase 3 (Mois 5-6) : Optimisation et Déploiement
- [ ] Emploi du temps
- [ ] Optimisations performances
- [ ] Formation utilisateurs
- [ ] Déploiement production

## 6. Métriques de Succès

### 6.1 Indicateurs Techniques
- **Performance :** Temps de chargement < 3 secondes
- **Disponibilité :** 99.5% uptime
- **Utilisabilité :** Taux d'adoption > 80%

### 6.2 Indicateurs Métier
- **Efficacité :** Réduction de 50% du temps administratif
- **Satisfaction :** Score NPS > 70
- **Adoption :** 90% des enseignants utilisent l'application

## 7. Contraintes et Risques

### 7.1 Contraintes Techniques
- Connexion internet intermittente
- Matériel informatique limité
- Variabilité des compétences numériques

### 7.2 Risques Identifiés
- **Technique :** Pannes électriques fréquentes
- **Humain :** Résistance au changement
- **Économique :** Coûts de maintenance

### 7.3 Stratégies de Mitigation
- Architecture résiliente et mode offline
- Formation intensive et support continu
- Modèle économique adapté au contexte local

## 8. Budget Estimatif MVP

### 8.1 Développement (6 mois)
- **Développeur Full-stack :** 2 400 $ USD
- **Designer UX/UI :** 800 $ USD
- **Infrastructure :** 300 $ USD
- **Formation et support :** 500 $ USD

**Total estimé :** 4 000 $ USD

### 8.2 Coûts Récurrents (Annuels)
- **Hébergement :** 360 $ USD/an
- **Maintenance :** 600 $ USD/an
- **Support :** 400 $ USD/an

**Total récurrent :** 1 360 $ USD/an

## 9. Critères de Lancement

### 9.1 Critères Techniques
- [ ] Tous les modules core fonctionnels
- [ ] Tests de charge validés
- [ ] Sécurité auditée
- [ ] Sauvegarde automatique opérationnelle

### 9.2 Critères Utilisateurs
- [ ] Formation administrative terminée
- [ ] 10 enseignants pilotes formés
- [ ] Documentation utilisateur complète
- [ ] Support technique en place

---

**Prochaines étapes :**
1. Validation des exigences avec l'équipe Saint Joseph
2. Affinage des spécifications techniques
3. Planification détaillée du développement
4. Démarrage de la phase de conception UX/UI

---

*Document préparé pour l'École Saint Joseph, Goma - RDC*  
*Confidentiel - Usage interne uniquement*