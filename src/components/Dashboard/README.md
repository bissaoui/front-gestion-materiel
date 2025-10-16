# Dashboard Moderne - Documentation

## 🚀 Fonctionnalités

### ✨ Technologies Utilisées

- **React 18** - Framework principal
- **Material-UI (MUI)** - Composants UI modernes
- **Recharts** - Bibliothèque de graphiques avancés
- **Framer Motion** - Animations fluides
- **Chart.js** - Graphiques de base (fallback)

### 📊 Composants Principaux

#### 1. **ModernDashboard** (`ModernDashboard.jsx`)
Dashboard principal avec toutes les métriques et graphiques.

**Fonctionnalités :**
- Métriques en temps réel
- Graphiques interactifs
- Animations fluides
- Mode temps réel (actualisation automatique)
- Notifications toast
- Design responsive

#### 2. **MetricsCard** (`MetricsCard.jsx`)
Carte de métrique avancée avec indicateurs visuels.

**Props :**
```javascript
{
  title: string,           // Titre de la métrique
  value: string|number,    // Valeur principale
  subtitle: string,        // Sous-titre descriptif
  trend: 'up'|'down',      // Tendance
  change: string,          // Pourcentage de changement
  progress: number,        // Valeur de progression (0-100)
  color: string,           // Couleur du thème
  icon: ReactNode,         // Icône
  status: 'success'|'warning'|'error'|'info'|'normal',
  details: Array,          // Détails supplémentaires
  onMoreClick: function    // Callback pour plus d'actions
}
```

#### 3. **AdvancedChart** (`AdvancedChart.jsx`)
Composant de graphique avancé avec multiples types.

**Types de graphiques supportés :**
- Barres (`bar`)
- Ligne (`line`)
- Aire (`area`)
- Secteurs (`pie`)
- Dispersion (`scatter`)
- Radar (`radar`)
- Treemap (`treemap`)

**Props :**
```javascript
{
  title: string,           // Titre du graphique
  data: Array,             // Données
  dataKey: string,         // Clé des données
  xAxisKey: string,        // Clé de l'axe X
  yAxisKey: string,        // Clé de l'axe Y
  color: string,           // Couleur principale
  colors: Array,           // Palette de couleurs
  height: number,          // Hauteur du graphique
  showControls: boolean,   // Afficher les contrôles
  onExport: function       // Callback d'export
}
```

#### 4. **RealTimeWidget** (`RealTimeWidget.jsx`)
Widget de données temps réel avec indicateurs de statut.

**Fonctionnalités :**
- Indicateur de statut en direct
- Bouton de rafraîchissement
- Animations de chargement
- Dernière mise à jour affichée

#### 5. **NotificationToast** (`NotificationToast.jsx`)
Système de notifications toast avec animations.

**Types de notifications :**
- `success` - Succès (vert)
- `warning` - Avertissement (orange)
- `error` - Erreur (rouge)
- `info` - Information (bleu)

### 🎨 Styles et Animations

#### CSS Personnalisé (`dashboard.css`)
- Animations keyframes
- Effets de survol
- Glass morphism
- Skeleton loading
- Responsive design
- Dark mode support

#### Animations Framer Motion
- **containerVariants** - Animation en cascade
- **itemVariants** - Animation des éléments individuels
- **fadeInUp** - Apparition depuis le bas
- **slideInRight** - Glissement depuis la droite

### 📱 Responsive Design

Le dashboard s'adapte automatiquement à différentes tailles d'écran :

- **Mobile** (< 768px) : Layout en colonne unique
- **Tablet** (768px - 1024px) : Layout en 2 colonnes
- **Desktop** (> 1024px) : Layout en 4 colonnes

### 🔄 Mode Temps Réel

**Activation :** Toggle "Temps réel" dans l'en-tête

**Fonctionnalités :**
- Actualisation automatique toutes les 30 secondes
- Indicateur de statut en direct
- Notifications de mise à jour
- Animations de chargement

### 📊 Métriques Disponibles

1. **Matériels**
   - Total des matériels
   - Taux d'affectation
   - Matériels disponibles vs affectés

2. **Marchés**
   - Nombre de marchés actifs
   - Nombre de prestataires
   - Tendances mensuelles

3. **Demandes**
   - Total des demandes
   - Taux de validation
   - Demandes en attente

4. **Stock**
   - Articles en stock faible
   - Niveau de stock optimal
   - Alertes de réapprovisionnement

### 🎯 Graphiques Avancés

#### Tendances Mensuelles
- Graphique composé (aire + barres + ligne)
- Données des 12 derniers mois
- Matériels, demandes et marchés

#### Répartition par Type/Marque
- Graphiques en secteurs et barres
- Couleurs personnalisées
- Légendes interactives

#### Métriques de Performance
- Graphique radar
- Indicateurs de performance
- Visualisation des KPI

### 🚨 Système d'Alertes

**Types d'alertes :**
- Stock faible (< 5 articles)
- Demandes en attente
- Taux d'affectation faible
- Erreurs de chargement

**Indicateurs visuels :**
- Couleurs de statut
- Icônes d'état
- Badges de notification
- Progress bars

### 🔧 Configuration

#### Variables d'environnement
```javascript
// API Configuration
API_URL: string

// Real-time settings
REFRESH_INTERVAL: number (default: 30000ms)

// Chart settings
DEFAULT_COLORS: string[]
```

#### Personnalisation
- Couleurs du thème
- Intervalles de rafraîchissement
- Types de graphiques par défaut
- Animations activées/désactivées

### 📈 Performance

**Optimisations :**
- Lazy loading des composants
- Memoization des calculs
- Debouncing des mises à jour
- Virtualisation des listes longues

**Métriques :**
- Temps de chargement initial < 2s
- Mise à jour temps réel < 500ms
- Animations 60fps
- Bundle size optimisé

### 🛠️ Maintenance

#### Mise à jour des données
```javascript
// Rafraîchissement manuel
fetchData(true);

// Mode temps réel
setRealTimeMode(true);
```

#### Gestion des erreurs
- Fallbacks pour les données manquantes
- Retry automatique en cas d'erreur
- Messages d'erreur utilisateur-friendly
- Logging des erreurs

### 🔮 Roadmap

**Fonctionnalités futures :**
- Export PDF/Excel des graphiques
- Filtres avancés par période
- Comparaisons de périodes
- Alertes personnalisées
- Mode sombre/clair
- Widgets personnalisables
- Intégration WebSocket
- Cache intelligent
- Analytics avancées

---

## 📝 Notes de Développement

### Structure des Fichiers
```
src/components/Dashboard/
├── ModernDashboard.jsx      # Dashboard principal
├── MetricsCard.jsx          # Carte de métrique
├── AdvancedChart.jsx        # Graphique avancé
├── RealTimeWidget.jsx       # Widget temps réel
├── NotificationToast.jsx    # Notifications
├── dashboard.css           # Styles personnalisés
└── README.md              # Documentation
```

### Dépendances
```json
{
  "recharts": "^2.8.0",
  "framer-motion": "^10.16.0",
  "@mui/x-charts": "^6.0.0",
  "@mui/x-data-grid": "^6.0.0",
  "@mui/x-date-pickers": "^6.0.0",
  "@mui/lab": "^5.0.0"
}
```

### Compatibilité
- React 18+
- Material-UI 5+
- Navigateurs modernes (Chrome, Firefox, Safari, Edge)
- Mobile responsive
