# Assistant D&D MJ

Une application Single Page Application pour assister les Maîtres de Jeu Donjons & Dragons, créée avec HTML5, Vanilla JavaScript et Web Components.

## Fonctionnalités

### 🔍 Recherche d'Équipement
- Recherche textuelle en temps réel dans toute la base de données D&D5E
- Filtres par catégorie (armes, armures, outils, etc.)
- Affichage détaillé des caractéristiques (dégâts, coût, poids, propriétés)
- Système de favoris avec localStorage

### 🎲 Lanceur de Dés
- Support de tous les types de dés D&D (d4, d6, d8, d10, d12, d20, d100)
- Lancers personnalisés avec modificateurs
- Historique des 50 derniers lancés
- Animations et feedback visuel

### 📱 Interface Responsive
- Design adaptatif pour mobile, tablette et desktop
- Thème médiéval fantaisie avec polices appropriées
- Animations fluides et transitions
- Accessibilité complète avec ARIA labels

## Architecture Technique

### Web Components
- `<dnd-header>` : Navigation avec routing
- `<equipment-search>` : Barre de recherche avec filtres
- `<equipment-card>` : Carte d'affichage d'équipement
- `<dice-roller>` : Lanceur de dés interactif

### Services
- **API Service** : Communication avec l'API D&D5E (https://www.dnd5eapi.co/api/2024/)
- **Storage Manager** : Gestion du localStorage avec méthodes utilitaires
- **Performance Monitor** : Optimisation et monitoring des performances

### Performance
- Lazy loading des composants
- Cache intelligent des requêtes API
- Virtual scrolling pour grandes listes
- Service Worker pour support offline

## Utilisation

### Démarrage Rapide
1. Clonez ou téléchargez les fichiers
2. Servez le répertoire avec un serveur web local
   ```bash
   python -m http.server 8000
   # ou
   npx serve .
   ```
3. Ouvrez `http://localhost:8000` dans votre navigateur

### Navigation
- **#equipment** : Page principale de recherche d'équipement
- **#favorites** : Liste des équipements favoris
- **#dice** : Lanceur de dés

### Recherche d'Équipement
1. Tapez le nom d'un équipement dans la barre de recherche
2. Utilisez les filtres par catégorie pour affiner les résultats
3. Cliquez sur "⭐ Favori" pour ajouter un équipement à vos favoris
4. Cliquez sur "📋 Détails" pour voir les informations complètes

### Lanceur de Dés
1. Cliquez sur un dé pour le lancer directement
2. Utilisez le formulaire personnalisé pour des jets complexes
3. Consultez l'historique en bas de la page

## Structure des Fichiers

```
dnd-dm-assistant/
├── index.html                 # Page principale
├── css/
│   ├── main.css              # Styles principaux et thème
│   └── components.css        # Styles des web components
├── js/
│   ├── app.js                # Logique principale et routing
│   ├── api.js                # Service API D&D5E
│   ├── components/
│   │   ├── header.js         # Composant d'en-tête
│   │   ├── equipment-search.js # Recherche d'équipement
│   │   ├── equipment-card.js   # Carte d'équipement
│   │   └── dice-roller.js      # Lanceur de dés
│   └── utils/
│       ├── storage.js        # Gestion localStorage
│       └── performance.js    # Outils performance
└── README.md                 # Ce fichier
```

## Technologies Utilisées

- **HTML5** : Semantic tags, Web Components
- **CSS3** : Grid, Flexbox, Custom Properties, Animations
- **JavaScript ES6+** : Modules, async/await, Custom Elements
- **Web Components** : Shadow DOM, Custom Elements
- **D&D5E API** : Base de données officielle

## Compatibilité Navigateur

- Chrome 54+
- Firefox 63+
- Safari 10.1+
- Edge 79+

## Développement

### Outils Requis
- Éditeur de code (VS Code recommandé)
- Serveur web local pour développement
- Navigateur moderne avec support ES6+

### Bonnes Pratiques
- Code modulaire avec imports/exports
- Gestion d'erreurs robuste
- Performance optimisée avec lazy loading
- Accessibilité WCAG 2.1 AA

### Extension
L'application est conçue pour être facilement extensible :
- Ajouter de nouveaux web components
- Intégrer d'autres endpoints de l'API D&D5E
- Personnaliser le thème via les variables CSS
- Ajouter des fonctionnalités offline

## License

Ce projet est open source et disponible sous licence MIT.

---

**Créé avec ❤️ pour les passionnés de Donjons & Dragons**