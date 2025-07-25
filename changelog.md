# Changelog

All notable changes to the École Saint Joseph web application project will be documented in this file.

## [Unreleased]

## [2023-11-25] Correction de l'authentification pour le module académique

### Ajouté
- Nouveau fichier `axiosInstance.ts` qui ajoute automatiquement le token JWT aux headers des requêtes API
- Gestion automatique des erreurs 401 avec redirection vers la page de connexion
- Mécanisme de stockage du token dans localStorage après connexion
- Gestion des redirections après connexion vers la page précédemment visitée

### Modifié
- Service `academics.ts` pour utiliser axiosInstance au lieu d'axios directement
- Configuration CORS du serveur pour accepter uniquement les requêtes depuis http://localhost:3000
- Format des réponses API pour accéder aux données via response.data.data
- Correction du middleware d'authentification pour accepter le token depuis le header Authorization ou les cookies

### Sécurité
- Envoi systématique des credentials avec les requêtes API (withCredentials: true)
- Stockage sécurisé du token JWT dans localStorage
- Protection de toutes les routes académiques avec vérification du token JWT
- Gestion des erreurs d'authentification avec messages appropriés

## [2023-11-20] Implémentation de la gestion des utilisateurs

### Ajouté
- Module complet de gestion des utilisateurs pour l'administration :
  - Page `/admin/users` avec tableau responsive et pagination
  - Filtres avancés par nom, rôle et statut
  - Actions rapides : modifier, supprimer, valider parent
  - Page de modification d'utilisateur avec formulaire complet
  - Modales de confirmation pour les actions critiques
- API RESTful pour la gestion des utilisateurs :
  - Routes CRUD complètes avec protection admin
  - Validation des données avec contrôles d'unicité email
  - Support pour la validation des parents en attente
  - Filtrage et pagination côté serveur
- Améliorations UX :
  - Badges de statut colorés pour visualiser rapidement l'état des comptes
  - Notifications toast pour les actions réussies/échouées
  - Formulaires avec validation en temps réel
  - Gestion optimisée des mots de passe (possibilité de ne pas modifier)

### Modifié
- Refonte de la structure des routes API admin
- Amélioration du contrôleur d'authentification pour supporter les nouveaux rôles
- Optimisation de la gestion des statuts utilisateur (active, inactive, en_attente)
- Mise à jour du modèle User dans Prisma pour mieux gérer les statuts et rôles

### Sécurité
- Protection de toutes les routes admin avec middleware d'authentification
- Vérification des rôles pour chaque action
- Hashage sécurisé des mots de passe lors des mises à jour
- Validation côté serveur pour éviter les injections

## [2023-11-17] Unification du layout administrateur

### Ajouté
- Nouveau composant `AdminSidebar` avec navigation par catégories et structure améliorée
- Composant `AdminHeader` avec détection automatique du titre de la page en fonction de l'URL
- Layout unifié `AdminLayout` qui intègre sidebar et header pour toutes les pages admin
- Comportement responsive avec menu collapsible sur mobile et affichage fixe sur desktop
- Structure de navigation cohérente avec icônes pour chaque section

### Modifié
- Refonte complète de la page "Créer un utilisateur" avec alignement amélioré et expérience responsive
- Mise à jour du tableau de bord administrateur pour s'intégrer au nouveau layout
- Ajustement des hauteurs, marges et espacement pour une expérience visuelle cohérente
- Amélioration de l'affichage des titres et sous-titres sur toutes les pages admin
- Mise à jour des icônes et des indicateurs visuels pour une meilleure compréhension

### Supprimé
- Ancien layout administrateur qui n'incluait pas de sidebar permanente
- Redondances dans la navigation et les en-têtes sur les différentes pages admin
- Menus secondaires flottants qui n'apparaissaient que sur certaines pages

## [2023-11-15] Refonte et Modernisation de l'Interface Utilisateur

### Ajouté
- Nouveau système de design avec variables CSS améliorées et palette de couleurs cohérente
- Animation et transitions fluides sur les composants interactifs
- Gestion améliorée des espaces et de la typographie
- Scrollbar personnalisée pour une expérience utilisateur plus élégante
- Classes d'animation simplifiées (.fade-in, .slide-in)
- Nouveaux variants de boutons (accent, subtle, light)
- Support de plus de tailles pour les boutons et spinners
- Système d'ombres amélioré

### Modifié
- Header repensé avec un design plus professionnel
- Formulaire de connexion modernisé avec icônes et meilleure gestion des états
- Sélecteur de thème (mode clair/sombre) amélioré avec animations et icônes
- AuthLayout plus élégant avec affichage du titre et sous-titre
- UserMenu remplacé par un menu utilisateur avec avatar à initiales
- Card component amélioré avec variants (default, outline, ghost, elevated) et effet hover
- Input component modernisé avec support d'icônes et d'états d'erreur
- Contrastes améliorés pour tous les modes (clair, sombre, contraste élevé)
- Spinner redessiné pour un look plus moderne et fluide

### Supprimé
- Composants de loading redondants (data-loader, loading-spinner, loader)
- Animations trop lourdes ou non nécessaires
- Styles incohérents dans l'application

### Added
- Created project changelog to track all significant modifications
- Implemented responsive layout components based on design system specifications:
  - Layout component with proper structure and responsive behavior
  - Header with logo, navigation, and user menu
  - Sidebar navigation for desktop view with collapsible functionality
  - Bottom navigation for mobile view with 5 primary actions
  - Main content area with proper padding and responsive adjustments
- Configured design system:
  - Added color palette based on Saint Joseph's identity (blue, green, gold)
  - Implemented typography system with Inter, Roboto, and Poppins fonts
  - Set up proper CSS variables for all design tokens
  - Created theme variants: light, dark, and high contrast for accessibility
- Updated pages:
  - Redesigned home page with statistics cards and activity feeds
  - Created dashboard page structure
- Added responsive components:
  - Mobile-first approach with different layouts for mobile and desktop
  - Proper spacing and sizing according to the design system
  - Interactive elements with proper states (hover, active, focus)
- Implemented authentication system with role-based access control:
  - Created login page with email, password, and role selector
  - Implemented backend authentication with JWT tokens and secure cookies
  - Added role-based middleware for route protection
  - Created role-specific dashboards (admin, teacher, student, parent)
  - Implemented automatic redirection based on user role
  - Added security features: password hashing, httpOnly cookies, JWT validation
  - Added Next.js middleware for automatic redirection to login page for unauthenticated users
  - Implemented client-side authentication checks and redirections

## [2023-10-15] Correction de l'authentification persistante
- Augmentation de la durée d'expiration des JWT tokens à 7 jours (au lieu de 1 jour)
- Correction de la configuration des cookies côté serveur avec maxAge explicite
- Amélioration de la gestion des cookies côté client avec expiration synchronisée
- Ajout d'un mécanisme de rafraîchissement automatique des tokens
- Ajout d'une route backend `/api/auth/refresh-token` pour renouveler les tokens
- Correction du middleware Next.js pour éviter les redirections incorrectes
- Amélioration des intercepteurs axios pour maintenir l'authentification
- Correction de la récupération des tokens depuis cookies et localStorage
- Stabilisation des redirections entre pages protégées

## [2023-07-24] Restructuration admin-only
- Suppression des rôles non-admin (teacher, student, parent)
- Création d'un nouveau rôle `pending_parent` pour les parents en attente de validation
- Suppression des interfaces et routes liées aux rôles non-admin
- Modification du dashboard admin pour inclure les liens vers les différentes sections de gestion
- Création des pages pour la validation des parents en attente et l'ajout d'utilisateurs
- Création des routes API pour la gestion des utilisateurs et des parents en attente
- Mise à jour du middleware d'authentification pour prendre en compte les nouveaux rôles
- Création d'une page pour les utilisateurs en attente de validation
- Mise à jour des composants de garde pour supprimer les rôles non admin

## [2023-07-23] Correction des importations de composants
- Correction de l'importation du composant Loader dans auth-guard.tsx
- Changement de l'importation nommée en importation par défaut
- Résolution de l'erreur "Export Loader doesn't exist in target module"

## [2023-07-22] Correction du manifest pour PWA
- Correction de l'erreur 500 lors du chargement du manifest.webmanifest
- Migration du manifest statique vers l'API de métadonnées de Next.js 14
- Mise à jour des chemins d'icônes et des métadonnées de l'application
- Ajout de la propriété "purpose" pour les icônes maskable
- Suppression du fichier statique pour éviter les conflits

## [2023-07-21] Correction des boucles infinies dans l'authentification
- Correction du hook `useAuth` pour éviter les appels récursifs à `checkAuth`
- Optimisation du hook `useRequireAuth` avec des dépendances appropriées dans useEffect
- Amélioration du composant `Providers` avec useRef pour éviter les vérifications multiples
- Optimisation de la fonction `checkAuth` pour éviter les mises à jour inutiles
- Correction du problème "Maximum update depth exceeded" dans les composants React
- Vérification conditionnelle de l'authentification uniquement au montage des composants

## [2023-07-20] Protection de l'authentification et vérification du token
- Middleware Express `authenticateToken` ajouté pour sécuriser les routes
- Route `/api/auth/me` qui renvoie l'utilisateur connecté selon le token
- Gestion du token dans localStorage + envoi du header Authorization côté frontend
- Fonction `getCurrentUser()` pour centraliser l'appel à l'API
- Correction des problèmes d'authentification persistante
- Vérification des rôles pour l'accès aux routes protégées

## [2023-07-19] Gestion des rôles & redirection
- Redirection automatique vers le dashboard après connexion selon le rôle
- Middleware de protection des routes (admin, teacher, etc.)
- Stockage du JWT dans localStorage pour persistance
- Contexte React useAuth() pour accès au rôle connecté
- L'admin est le seul à pouvoir ajouter d'autres utilisateurs
- Composants de protection des routes par rôle (AuthGuard)
- Composants conditionnels basés sur le rôle (RoleBasedContent)
- Menu utilisateur adapté au rôle connecté
- Layouts spécifiques pour chaque rôle avec protection d'accès

## [2023-07-18] Route /api/auth/login et correction du manifest
- Création de la route backend Express /api/auth/login
- Connexion réelle avec MongoDB Atlas via Prisma
- Sécurité avec bcrypt + JWT
- Correction du fichier manifest.webmanifest (JSON valide)

## [2023-08-05] Authentification complète
- Page d'inscription avec sélection de rôle
- Backend sécurisé avec Prisma (password hash, email unique)
- Fonction de récupération de mot de passe : token + expiration
- Pages forgot-password et reset-password stylisées
- Intégration directe MongoDB Atlas (données réelles)
- Validation des formulaires avec Zod et React Hook Form
- Gestion des erreurs et feedback utilisateur
- Sécurité renforcée avec tokens JWT et cookies httpOnly
- Interface responsive et animations fluides
- Composants UI réutilisables pour l'authentification

## [2023-07-17] Gestion des élèves
- Modèle `Student` créé avec Prisma pour MongoDB Atlas
- Routes API CRUD connectées à MongoDB Atlas:
  - GET /api/students - Liste des élèves avec filtres et pagination
  - GET /api/students/:id - Détails d'un élève
  - POST /api/students - Ajout d'un nouvel élève
  - PUT /api/students/:id - Modification d'un élève
  - DELETE /api/students/:id - Suppression d'un élève
- Page de gestion des élèves pour les administrateurs:
  - Tableau responsive avec filtres (recherche, classe, promotion, statut)
  - Pagination avancée avec contrôle du nombre d'éléments par page
  - Formulaire d'ajout/modification d'élève avec validation
  - Confirmation de suppression avec dialog modal
- Implémentation de composants UI accessibles:
  - Labels appropriés et messages d'erreur pour les formulaires
  - États de focus et contraste pour l'accessibilité
  - Design responsive pour mobile et desktop
  - Composants réutilisables (table, form, select, etc.) 