# Composant de Chargement pour la Navigation

## Vue d'ensemble

Cette fonctionnalité améliore l'expérience utilisateur en ajoutant un indicateur de chargement lors de la navigation entre modules dans l'application École Saint Joseph.

## Fonctionnalités

### 🎯 Objectifs
- Réduire la perception du temps d'attente
- Améliorer l'expérience utilisateur lors des transitions entre pages
- Fournir un feedback visuel immédiat lors de la navigation
- Maintenir l'engagement de l'utilisateur pendant le chargement

### ⚡ Fonctionnalités principales

1. **Affichage conditionnel** : Le loader n'apparaît qu'après un délai configurable pour éviter les flashs visuels sur les navigations rapides
2. **Temps minimum d'affichage** : Assure une perception fluide même sur des connexions très rapides
3. **Indicateur de progression animé** : Barre de progression avec animation pour montrer l'activité
4. **Message contextuel** : Affiche le nom du module en cours de chargement
5. **Responsive** : S'adapte à tous les écrans
6. **Accessible** : Utilise les attributs ARIA appropriés

## Structure des fichiers

```
src/
├── components/
│   └── ui/
│       └── navigation-loading.tsx     # Composant principal de chargement
├── hooks/
│   └── use-navigation-loading.ts      # Hook personnalisé pour la gestion d'état
└── components/layout/
    ├── sidebar.tsx                    # Sidebar principal (modifié)
    └── admin-sidebar.tsx             # Sidebar administrateur (modifié)
```

## Utilisation

### Hook `useNavigationLoading`

```tsx
const { isLoading, targetRoute, navigateWithLoading } = useNavigationLoading({
  minLoadingTime: 500,  // Temps minimum d'affichage (ms)
  delay: 150,           // Délai avant affichage (ms)
  excludeRoutes: ['/login', '/register']  // Routes à exclure
});
```

### Composant `NavigationLoading`

```tsx
<NavigationLoading 
  isVisible={isLoading} 
  currentRoute={targetRoute} 
/>
```

### Navigation avec chargement

```tsx
// Au lieu de Link classique
<button onClick={() => navigateWithLoading('/dashboard', 'Tableau de bord')}>
  Accéder au Dashboard
</button>
```

## Configuration

### Options du hook

| Option | Type | Défaut | Description |
|--------|------|--------|-------------|
| `minLoadingTime` | number | 500 | Temps minimum d'affichage en ms |
| `delay` | number | 100 | Délai avant affichage en ms |
| `excludeRoutes` | string[] | [] | Routes à exclure du loading |

### Paramètres des sidebars

- **Sidebar principal** : délai de 150ms, minimum 400ms
- **Admin sidebar** : délai de 120ms, minimum 500ms
- Routes exclues : `/login`, `/register`, `/admin/dashboard`

## Animations CSS

Les animations sont définies dans `index.css` :

```css
@keyframes loading-progress {
  0% { width: 0%; opacity: 0.6; }
  50% { width: 70%; opacity: 0.8; }
  100% { width: 100%; opacity: 1; }
}
```

## Performance

### Optimisations intégrées

1. **Prefetching intelligent** : Les routes sont préchargées au survol
2. **Délai d'activation** : Évite les flashs sur les navigations rapides
3. **Temps minimum** : Assure une perception fluide
4. **Exclusion conditionnelle** : Certaines routes sont exclues du loading

### Impact sur les performances

- ✅ Amélioration de la perception de performance
- ✅ Réduction du taux de rebond
- ✅ Meilleur engagement utilisateur
- ✅ Feedback immédiat

## Accessibilité

- `role="status"` : Indique aux lecteurs d'écran que c'est un statut
- `aria-live="polite"` : Annonce les changements sans interrompre
- `aria-label` : Description claire du statut de chargement
- Support complet du clavier et des technologies d'assistance

## Tests recommandés

1. **Navigation rapide** : Vérifier que le loader ne clignote pas
2. **Navigation lente** : S'assurer que le loader apparaît et disparaît correctement
3. **Navigation multiple** : Tester les clics rapides successifs
4. **Responsive** : Tester sur mobile et desktop
5. **Accessibilité** : Tester avec lecteur d'écran

## Maintenance

### Points d'attention

- Ajuster les délais selon les performances réelles
- Monitorer les métriques d'engagement utilisateur
- Mettre à jour les routes exclues selon les besoins
- Optimiser les animations selon les retours utilisateurs

### Évolutions possibles

- [ ] Ajout de différents types de loaders selon le contexte
- [ ] Intégration avec les métriques de performance
- [ ] Personnalisation par profil utilisateur
- [ ] Cache intelligent des états de chargement