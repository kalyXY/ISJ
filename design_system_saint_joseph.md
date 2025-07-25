# Design System - École Saint Joseph
## Système de Design Complet

---

**Projet :** Plateforme Éducative Numérique  
**Établissement :** École Saint Joseph, Goma - RDC  
**Version :** 1.0  
**Date :** Juillet 2025

---

## 1. Identité Visuelle

### 1.1 Philosophie de Design

#### **Vision Créative**
Créer une identité visuelle moderne, accessible et chaleureuse qui reflète les valeurs éducatives de Saint Joseph tout en respectant la culture congolaise et les contraintes techniques locales.

#### **Principes Fondamentaux**
1. **Simplicité** : Interface intuitive adaptée à tous les niveaux
2. **Accessibilité** : Lisible même avec écrans de faible qualité
3. **Performance** : Optimisé pour connexions lentes
4. **Inclusivité** : Respectueux de la diversité culturelle
5. **Modernité** : Esthétique contemporaine et professionnelle

### 1.2 Palette de Couleurs

#### **Couleurs Primaires**

```
SAINT JOSEPH BLUE (Bleu Principal)
- Primary: #2563EB (rgb(37, 99, 235))
- Light: #3B82F6 (rgb(59, 130, 246))
- Dark: #1D4ED8 (rgb(29, 78, 216))
- Inspiration: Sérénité, confiance, savoir
```

```
CONGO GREEN (Vert Secondaire)
- Primary: #059669 (rgb(5, 150, 105))
- Light: #10B981 (rgb(16, 185, 129))
- Dark: #047857 (rgb(4, 120, 87))
- Inspiration: Croissance, nature, espoir
```

```
WARM GOLD (Or Accent)
- Primary: #D97706 (rgb(217, 119, 6))
- Light: #F59E0B (rgb(245, 158, 11))
- Dark: #B45309 (rgb(180, 83, 9))
- Inspiration: Excellence, réussite, prestige
```

#### **Couleurs Neutres**

```
GRAPHITE (Texte Principal)
- Primary: #1F2937 (rgb(31, 41, 55))
- Light: #374151 (rgb(55, 65, 81))
- Dark: #111827 (rgb(17, 24, 39))
```

```
CLOUD GRAY (Arrière-plans)
- Primary: #F3F4F6 (rgb(243, 244, 246))
- Light: #F9FAFB (rgb(249, 250, 251))
- Dark: #E5E7EB (rgb(229, 231, 235))
```

```
PURE WHITE
- Primary: #FFFFFF (rgb(255, 255, 255))
- Usage: Backgrounds, cards, modals
```

#### **Couleurs Système**

```
SUCCESS (Succès)
- Primary: #10B981 (rgb(16, 185, 129))
- Background: #D1FAE5 (rgb(209, 250, 229))
- Usage: Validation, réussite
```

```
WARNING (Attention)
- Primary: #F59E0B (rgb(245, 158, 11))
- Background: #FEF3C7 (rgb(254, 243, 199))
- Usage: Alertes, avertissements
```

```
ERROR (Erreur)
- Primary: #EF4444 (rgb(239, 68, 68))
- Background: #FEE2E2 (rgb(254, 226, 226))
- Usage: Erreurs, suppression
```

```
INFO (Information)
- Primary: #3B82F6 (rgb(59, 130, 246))
- Background: #DBEAFE (rgb(219, 234, 254))
- Usage: Informations, notifications
```

### 1.3 Typographie

#### **Famille de Polices**

```
PRIMARY FONT: Inter
- Usage: Interface, titres, contenus
- Fallback: -apple-system, BlinkMacSystemFont, sans-serif
- Raison: Lisibilité optimale, support multi-langue
```

```
SECONDARY FONT: Roboto
- Usage: Données, tableaux, nombres
- Fallback: Arial, sans-serif
- Raison: Clarté numérique, densité d'information
```

```
ACCENT FONT: Poppins
- Usage: Logos, titres spéciaux
- Fallback: Georgia, serif
- Raison: Personnalité, chaleur africaine
```

#### **Échelle Typographique**

```
H1 - Hero Title
- Size: 48px / 3rem
- Weight: 700 (Bold)
- Line Height: 1.1
- Usage: Page titles, dashboards
```

```
H2 - Section Title
- Size: 36px / 2.25rem
- Weight: 600 (SemiBold)
- Line Height: 1.2
- Usage: Module titles, cards headers
```

```
H3 - Subsection Title
- Size: 28px / 1.75rem
- Weight: 600 (SemiBold)
- Line Height: 1.3
- Usage: Form sections, lists
```

```
H4 - Component Title
- Size: 24px / 1.5rem
- Weight: 500 (Medium)
- Line Height: 1.4
- Usage: Component headers, modals
```

```
H5 - Small Title
- Size: 20px / 1.25rem
- Weight: 500 (Medium)
- Line Height: 1.4
- Usage: Table headers, small components
```

```
H6 - Micro Title
- Size: 16px / 1rem
- Weight: 500 (Medium)
- Line Height: 1.5
- Usage: Labels, badges, tags
```

```
BODY LARGE
- Size: 18px / 1.125rem
- Weight: 400 (Regular)
- Line Height: 1.6
- Usage: Important content, introductions
```

```
BODY REGULAR
- Size: 16px / 1rem
- Weight: 400 (Regular)
- Line Height: 1.5
- Usage: Default text, forms, tables
```

```
BODY SMALL
- Size: 14px / 0.875rem
- Weight: 400 (Regular)
- Line Height: 1.5
- Usage: Secondary text, captions
```

```
CAPTION
- Size: 12px / 0.75rem
- Weight: 400 (Regular)
- Line Height: 1.4
- Usage: Metadata, timestamps, footnotes
```

### 1.4 Iconographie

#### **Bibliothèque d'Icônes**
- **Principale :** Lucide React (2px stroke, 24px default)
- **Secondaire :** Heroicons (outline/solid variants)
- **Style :** Minimal, cohérent, accessible

#### **Icônes Métier Spécifiques**

```
NAVIGATION
- Home: 🏠 (house)
- Dashboard: 📊 (bar-chart-3)
- Students: 👥 (users)
- Teachers: 🎓 (graduation-cap)
- Classes: 📚 (book-open)
- Grades: 📝 (clipboard-list)
- Schedule: 📅 (calendar)
- Messages: 💬 (message-circle)
- Settings: ⚙️ (settings)
```

```
ACTIONS
- Add: ➕ (plus)
- Edit: ✏️ (edit)
- Delete: 🗑️ (trash-2)
- Save: 💾 (save)
- Search: 🔍 (search)
- Filter: 🔽 (filter)
- Sort: ⏫ (arrow-up-down)
- Download: ⬇️ (download)
- Upload: ⬆️ (upload)
```

```
STATUS
- Success: ✅ (check-circle)
- Warning: ⚠️ (alert-triangle)
- Error: ❌ (x-circle)
- Info: ℹ️ (info)
- Loading: ⏳ (loader)
```

## 2. Composants UI

### 2.1 Système de Grille

#### **Layout Responsive**

```
BREAKPOINTS
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px - 1440px
- Large: 1440px+
```

```
GRID SYSTEM
- Colonnes: 12 colonnes flexibles
- Gutters: 16px mobile, 24px desktop
- Margins: 16px mobile, 32px desktop
- Max-width: 1200px desktop
```

#### **Espacements (Spacing Scale)**

```
SPACING TOKENS
- xs: 4px (0.25rem)
- sm: 8px (0.5rem)
- md: 16px (1rem)
- lg: 24px (1.5rem)
- xl: 32px (2rem)
- 2xl: 48px (3rem)
- 3xl: 64px (4rem)
- 4xl: 80px (5rem)
```

### 2.2 Composants de Base

#### **Boutons (Buttons)**

```
PRIMARY BUTTON
- Background: Saint Joseph Blue (#2563EB)
- Text: White (#FFFFFF)
- Hover: Darker blue (#1D4ED8)
- Border-radius: 8px
- Padding: 12px 24px
- Font: 16px, Medium weight
- Usage: Actions principales
```

```
SECONDARY BUTTON
- Background: Transparent
- Text: Saint Joseph Blue (#2563EB)
- Border: 2px solid #2563EB
- Hover: Light blue background
- Border-radius: 8px
- Padding: 12px 24px
- Usage: Actions secondaires
```

```
GHOST BUTTON
- Background: Transparent
- Text: Graphite (#1F2937)
- Hover: Light gray background
- Border-radius: 8px
- Padding: 12px 24px
- Usage: Actions tertiaires
```

```
DANGER BUTTON
- Background: Error red (#EF4444)
- Text: White (#FFFFFF)
- Hover: Darker red (#DC2626)
- Border-radius: 8px
- Padding: 12px 24px
- Usage: Suppressions, actions critiques
```

#### **Formulaires (Forms)**

```
INPUT FIELD
- Background: White (#FFFFFF)
- Border: 1px solid #D1D5DB
- Border-radius: 8px
- Padding: 12px 16px
- Font: 16px regular
- Focus: Blue border (#2563EB)
- Error: Red border (#EF4444)
- Height: 48px minimum
```

```
TEXTAREA
- Same as input field
- Min-height: 120px
- Resize: vertical only
- Line-height: 1.5
```

```
SELECT DROPDOWN
- Same as input field
- Arrow icon: Chevron down
- Options: White background
- Hover: Light gray background
```

```
CHECKBOX/RADIO
- Size: 20px x 20px
- Border: 2px solid #D1D5DB
- Checked: Saint Joseph Blue
- Border-radius: 4px (checkbox), 50% (radio)
- Focus: Blue outline
```

#### **Cartes (Cards)**

```
BASIC CARD
- Background: White (#FFFFFF)
- Border: 1px solid #E5E7EB
- Border-radius: 12px
- Padding: 24px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Hover: Subtle shadow increase
```

```
ELEVATED CARD
- Background: White (#FFFFFF)
- Border: None
- Border-radius: 12px
- Padding: 24px
- Shadow: 0 4px 6px rgba(0,0,0,0.1)
- Usage: Important content, modals
```

```
STAT CARD
- Background: Gradient (Blue to Green)
- Text: White (#FFFFFF)
- Border-radius: 12px
- Padding: 24px
- Icon: Top-right corner
- Usage: Dashboard metrics
```

### 2.3 Composants Spécialisés

#### **Navigation**

```
SIDEBAR NAVIGATION
- Width: 280px desktop, full mobile
- Background: White (#FFFFFF)
- Border: 1px solid #E5E7EB
- Items: 48px height
- Active: Blue background (#EFF6FF)
- Hover: Light gray background
```

```
TOP NAVIGATION
- Height: 72px
- Background: White (#FFFFFF)
- Border-bottom: 1px solid #E5E7EB
- Logo: Left aligned
- User menu: Right aligned
- Breadcrumb: Center
```

```
MOBILE NAVIGATION
- Bottom fixed navigation
- Height: 64px
- Background: White (#FFFFFF)
- 5 main items max
- Active: Blue color
```

#### **Tableaux (Tables)**

```
DATA TABLE
- Header: Gray background (#F9FAFB)
- Rows: Alternating white/light gray
- Border: 1px solid #E5E7EB
- Cell padding: 12px 16px
- Font: 14px regular
- Hover: Light blue background
```

```
RESPONSIVE TABLE
- Mobile: Card layout
- Tablet: Horizontal scroll
- Desktop: Full table
- Sticky header: Yes
- Sorting: Arrow indicators
```

#### **Modales (Modals)**

```
MODAL OVERLAY
- Background: rgba(0,0,0,0.5)
- Backdrop blur: 4px
- Z-index: 1000
- Click outside: Close modal
```

```
MODAL CONTAINER
- Background: White (#FFFFFF)
- Border-radius: 12px
- Max-width: 600px
- Padding: 32px
- Shadow: 0 20px 25px rgba(0,0,0,0.1)
- Animation: Fade in + scale up
```

## 3. Thèmes et Modes

### 3.1 Mode Clair (Light Mode)

#### **Couleurs Principales**
- **Background:** #FFFFFF
- **Surface:** #F9FAFB
- **Text Primary:** #1F2937
- **Text Secondary:** #6B7280
- **Borders:** #E5E7EB

#### **Utilisation**
- Mode par défaut
- Optimisé pour lecture prolongée
- Meilleur contraste sur écrans LCD

### 3.2 Mode Sombre (Dark Mode)

#### **Couleurs Principales**
- **Background:** #111827
- **Surface:** #1F2937
- **Text Primary:** #F9FAFB
- **Text Secondary:** #D1D5DB
- **Borders:** #374151

#### **Couleurs Adaptées**
- **Primary Blue:** #60A5FA (plus clair)
- **Success Green:** #34D399 (plus clair)
- **Warning Gold:** #FBBF24 (plus clair)
- **Error Red:** #F87171 (plus clair)

#### **Utilisation**
- Optionnel, activable par utilisateur
- Économie batterie sur OLED
- Confort nocturne

### 3.3 Mode Haute Contraste

#### **Adaptations**
- **Ratio de contraste:** Minimum 7:1
- **Bordures:** Plus épaisses (2px)
- **Focus:** Indicateurs renforcés
- **Couleurs:** Palette réduite, très contrastée

#### **Utilisation**
- Accessibilité visuelle
- Malvoyants, daltoniens
- Écrans de faible qualité

## 4. Animations et Interactions

### 4.1 Principes d'Animation

#### **Caractéristiques**
- **Durée:** 200-300ms (interactions)
- **Easing:** ease-out (naturel)
- **Performance:** Transform/opacity uniquement
- **Réduction:** Respecter prefers-reduced-motion

#### **Types d'Animations**

```
FADE TRANSITIONS
- Duration: 200ms
- Easing: ease-out
- Usage: Modals, tooltips, notifications
```

```
SLIDE TRANSITIONS  
- Duration: 300ms
- Easing: ease-out
- Usage: Sidebars, dropdowns, tabs
```

```
SCALE TRANSITIONS
- Duration: 150ms
- Easing: ease-out
- Usage: Buttons, cards hover
```

### 4.2 États Interactifs

#### **Hover States**
- **Boutons:** Couleur plus sombre + scale(1.02)
- **Cartes:** Ombre plus prononcée
- **Liens:** Underline + couleur
- **Icônes:** Couleur + scale(1.1)

#### **Focus States**
- **Contour:** 2px solid blue
- **Offset:** 2px
- **Radius:** Suit le composant
- **Couleur:** #2563EB avec 50% opacity

#### **Active States**
- **Boutons:** Scale(0.98) + couleur foncée
- **Liens:** Couleur plus foncée
- **Inputs:** Border bleu + shadow

### 4.3 Feedback Utilisateur

#### **Loading States**
- **Spinner:** Rotation 360° en 1s
- **Skeleton:** Pulse animation
- **Progress:** Smooth transition
- **Buttons:** Disabled state + spinner

#### **Success/Error States**
- **Checkmark:** Scale up animation
- **Error X:** Shake animation
- **Notifications:** Slide in from top
- **Toast:** Fade in + slide up

## 5. Patterns et Layouts

### 5.1 Layout Principal

#### **Structure Dashboard**

```
DESKTOP LAYOUT
┌─────────────────────────────────────────┐
│ Header (Logo + Navigation + User)       │
├─────────────────────────────────────────┤
│ Sidebar │ Main Content Area           │
│ Navigation│                            │
│         │                            │
│         │                            │
│         │                            │
└─────────────────────────────────────────┘
```

```
MOBILE LAYOUT
┌─────────────────────────┐
│ Header (Logo + Menu)    │
├─────────────────────────┤
│                         │
│ Main Content Area       │
│                         │
│                         │
│                         │
├─────────────────────────┤
│ Bottom Navigation       │
└─────────────────────────┘
```

### 5.2 Patterns de Contenu

#### **Page d'Accueil Dashboard**

```
HERO SECTION
- Titre de bienvenue personnalisé
- Statistiques clés (cartes)
- Actions rapides (boutons)
- Arrière-plan: Gradient subtil
```

```
STATS GRID
- 4 colonnes desktop, 2 mobile
- Métriques importantes
- Icônes représentatives
- Couleurs différenciées
```

```
RECENT ACTIVITY
- Liste des actions récentes
- Timestamps relatifs
- Icônes d'actions
- Liens vers détails
```

#### **Listes et Tableaux**

```
HEADER SECTION
- Titre de la page
- Boutons d'action (Ajouter, Exporter)
- Recherche et filtres
- Compteur d'éléments
```

```
FILTERS BAR
- Filtres par statut
- Recherche textuelle
- Tri par colonnes
- Pagination
```

```
DATA DISPLAY
- Tableau responsive
- Actions par ligne
- Sélection multiple
- États visuels clairs
```

### 5.3 Formulaires

#### **Structure Standard**

```
FORM HEADER
- Titre du formulaire
- Description optionnelle
- Indicateur de progression
- Boutons d'annulation
```

```
FORM BODY
- Sections groupées
- Labels clairs
- Validation en temps réel
- Messages d'aide
```

```
FORM FOOTER
- Boutons d'action
- Statut de sauvegarde
- Liens annexes
- Progression
```

## 6. Accessibilité

### 6.1 Standards WCAG 2.1

#### **Niveau AA Compliance**
- **Contraste:** Minimum 4.5:1 (texte normal)
- **Contraste:** Minimum 3:1 (texte large)
- **Navigation:** Clavier uniquement
- **Screen readers:** Support complet

#### **Techniques Implémentées**

```
SEMANTIC HTML
- Utilisation de balises appropriées
- Structure heading hiérarchique
- Landmarks ARIA
- Rôles explicites
```

```
KEYBOARD NAVIGATION
- Tab order logique
- Focus visible
- Escape pour fermer
- Raccourcis clavier
```

```
SCREEN READER SUPPORT
- Alt text pour images
- Labels pour formulaires
- Descriptions ARIA
- Live regions
```

### 6.2 Adaptations Locales

#### **Connexion Lente**
- **Images:** Compression optimale
- **Fonts:** Subsetting
- **CSS:** Minification
- **JS:** Code splitting

#### **Écrans Variés**
- **Résolutions:** 240px à 1920px+
- **Densité:** 1x à 3x
- **Qualité:** LCD basique à Retina
- **Orientation:** Portrait/landscape

#### **Langues**
- **Français:** Langue principale
- **Lingala:** Support basique
- **Anglais:** Interface admin
- **RTL:** Préparation future

## 7. Guidelines d'Implémentation

### 7.1 Structure CSS

#### **Architecture**

```
SCSS STRUCTURE
styles/
├── abstracts/
│   ├── _variables.scss
│   ├── _mixins.scss
│   └── _functions.scss
├── base/
│   ├── _reset.scss
│   ├── _typography.scss
│   └── _global.scss
├── components/
│   ├── _buttons.scss
│   ├── _forms.scss
│   ├── _cards.scss
│   └── _navigation.scss
├── layouts/
│   ├── _header.scss
│   ├── _sidebar.scss
│   └── _main.scss
├── pages/
│   ├── _dashboard.scss
│   ├── _students.scss
│   └── _grades.scss
└── themes/
    ├── _light.scss
    └── _dark.scss
```

#### **Variables CSS**

```css
:root {
  /* Colors */
  --color-primary: #2563EB;
  --color-secondary: #059669;
  --color-accent: #D97706;
  --color-text: #1F2937;
  --color-background: #FFFFFF;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-family-primary: 'Inter', sans-serif;
  --font-family-secondary: 'Roboto', sans-serif;
  --font-size-base: 1rem;
  --line-height-base: 1.5;
  
  /* Borders */
  --border-radius: 0.5rem;
  --border-width: 1px;
  --border-color: #E5E7EB;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-normal: 200ms ease-out;
  --transition-slow: 300ms ease-out;
}
```

### 7.2 Composants React

#### **Structure Recommandée**

```jsx
// Button.jsx
import React from 'react';
import { cn } from '../utils/classnames';

const Button = ({ 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  children,
  className,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
    secondary: 'border border-primary text-primary hover:bg-primary-light focus:ring-primary',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };
  
  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};

export default Button;
```

### 7.3 Tokens de Design

#### **Utilisation avec Tailwind**

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          light: '#3B82F6',
          dark: '#1D4ED8'
        },
        secondary: {
          DEFAULT: '#059669',
          light: '#10B981',
          dark: '#047857'
        },
        accent: {
          DEFAULT: '#D97706',
          light: '#F59E0B',
          dark: '#B45309'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace']
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      }
    }
  }
}
```

## 8. Maintenance et Evolution

### 8.1 Versioning

#### **Semantic Versioning**
- **Major (X.0.0):** Changements breaking
- **Minor (X.Y.0):** Nouvelles fonctionnalités
- **Patch (X.Y.Z):** Corrections de bugs

#### **Documentation**
- **Changelog:** Historique des modifications
- **Migration guides:** Aide aux mises à jour
- **Component library:** Storybook documentation

### 8.2 Testing

#### **Visual Regression**
- **Chromatic:** Tests automatisés
- **Screenshots:** Comparaison pixel-perfect
- **Responsive:** Tests multi-devices

#### **Accessibilité**
- **axe-core:** Tests automatisés
- **Screen readers:** Tests manuels
- **Keyboard:** Navigation complète

### 8.3 Performance

#### **Métriques**
- **Bundle size:** < 200KB gzipped
- **Load time:** < 3 secondes
- **Lighthouse:** Score > 90
- **Core Web Vitals:** Seuils verts

#### **Optimisations**
- **Tree shaking:** Élimination du code mort
- **Code splitting:** Chargement différé
- **Image optimization:** Formats modernes
- **Caching:** Stratégies agressives

---

## Conclusion

Ce Design System fournit une base solide pour développer une application éducative moderne, accessible et adaptée au contexte congolais. Il équilibre les exigences esthétiques contemporaines avec les contraintes techniques locales, tout en maintenant une identité visuelle forte pour l'École Saint Joseph.

**Prochaines étapes :**
1. Implémentation des composants de base
2. Tests utilisateurs avec les personas identifiés
3. Itération basée sur les retours
4. Documentation interactive (Storybook)
5. Formation des équipes de développement

---

*Design System - École Saint Joseph, Goma*  
*Version 1.0 - Juillet 2025*  
*Confidentiel - Usage interne uniquement*