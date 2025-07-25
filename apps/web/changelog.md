# Changelog du Frontend

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

## [2023-07-20] Protection de l'authentification et vérification du token
- Middleware Express `authenticateToken` ajouté pour sécuriser les routes
- Route `/api/auth/me` qui renvoie l'utilisateur connecté selon le token
- Gestion du token dans localStorage + envoi du header Authorization côté frontend
- Fonction `getCurrentUser()` pour centraliser l'appel à l'API
- Correction des problèmes d'authentification persistante
- Vérification des rôles pour l'accès aux routes protégées 