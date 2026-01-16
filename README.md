# 🎲 Assistant D&D MJ

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-brightgreen.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Web Components](https://img.shields.io/badge/Web%20Components-v1-blue.svg)](https://www.webcomponents.org/)
[![D&D 5E](https://img.shields.io/badge/D%26D-5E-red.svg)](https://www.dnd5eapi.co/)

Une Single Page Application moderne pour assister les Maîtres de Jeu Donjons & Dragons, construite avec HTML5, Vanilla JavaScript et Web Components.

## ✨ Fonctionnalités

### 🔍 **Recherche d'Équipement Avancée**
- Recherche textuelle en temps réel dans toute la base de données D&D5E
- Filtres par catégorie (armes, armures, outils, etc.)
- Affichage détaillé : dégâts, coût, poids, propriétés
- Conversion automatique (feet → mètres, livres → kg)

### ⭐ **Système de Favoris**
- Sauvegarde locale persistante avec localStorage
- Accès rapide aux équipements préférés
- Gestion unificée de tous les favoris

### 🎲 **Lanceur de Dés Complet**
- Support complet : d4, d6, d8, d10, d12, d20, d100
- Lancers personnalisés avec modificateurs multiples
- Historique détaillé des 50 derniers jets
- Animations fluides et feedback visuel immédiat

### 📱 **Interface Responsive & Thématique**
- Design adaptatif pour mobile, tablette et desktop
- Thème médiéval fantaisie avec polices Cinzel & Crimson Text
- Animations CSS fluides et transitions élégantes
- Accessibilité WCAG 2.1 AA complète

## 🏗️ Architecture Technique

### **Web Components Modulaires**
```javascript
<dnd-header>          // Navigation avec routing SPA
<equipment-search>    // Recherche avancée avec filtres
<equipment-card>      // Affichage détaillé des équipements
<dice-roller>         // Lanceur de dés interactif
```

### **Services Optimisés**
- **API Service** : Communication intelligente avec D&D5E API
- **Storage Manager** : Gestion complète du localStorage
- **Performance Monitor** : Optimisation et monitoring en temps réel

### **Performance Native**
- Cache intelligent des requêtes API (5 minutes TTL)
- Lazy loading des composants et ressources
- Support Service Worker pour usage offline

## 🚀 Démarrage Rapide

### **Prérequis**
- Navigateur moderne (Chrome 54+, Firefox 63+, Safari 10.1+, Edge 79+)
- Serveur web local (optionnel mais recommandé)

### **Installation**
```bash
# Clonez le dépôt
git clone https://github.com/username/dnd-dm-assistant.git
cd dnd-dm-assistant

# Lancez le serveur de développement
npm run serve

# Ou manuellement
python3 -m http.server 8000
```

**Ouvrez** `http://localhost:8000` dans votre navigateur

## 🎯 Guide d'Utilisation

### **Navigation SPA**
- `#equipment` - Recherche principale d'équipement
- `#favorites` - Équipements favoris enregistrés
- `#dice` - Lanceur de dés avec historique

### **Recherche d'Équipement**
1. **Recherche textuelle** : Tapez le nom d'un équipement
2. **Filtres avancés** : Sélectionnez une catégorie spécifique
3. **Favoris** : Cliquez ⭐ pour sauvegarder
4. **Détails** : Cliquez 📋 pour informations complètes

### **Lanceur de Dés**
- **Jet rapide** : Cliquez directement sur un dé
- **Lancer personnalisé** : Configurez nombre de dés + modificateurs
- **Historique** : Consultez les 50 derniers jets en bas de page

## 📁 Structure du Projet

```
dnd-dm-assistant/
├── 📄 index.html                 # Point d'entrée SPA
├── 🎨 css/
│   ├── main.css              # Thème médiéval & styles globaux
│   └── components.css        # Styles spécifiques des composants
├── ⚡ js/
│   ├── app.js                # Logique principale & routing
│   ├── api.js                # Service D&D5E API
│   ├── components/           # Web Components réutilisables
│   │   ├── header.js         # Navigation principale
│   │   ├── equipment-search.js # Moteur de recherche
│   │   ├── equipment-card.js   # Cartes d'équipement
│   │   └── dice-roller.js      # Lanceur de dés
│   └── utils/                # Services utilitaires
│       ├── storage.js        # Gestion localStorage
│       └── performance.js    # Optimisations
└── 📚 README.md                 # Cette documentation
```

## 🛠️ Technologies Utilisées

| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| **HTML5** | Semantic Tags | Structure & accessibilité |
| **CSS3** | Grid/Flexbox | Layout responsive |
| **JavaScript** | ES6+ Modules | Logique applicative |
| **Web Components** | v1 API | Composants réutilisables |
| **Shadow DOM** | v1 | Encapsulation |
| **D&D5E API** | 2024 Edition | Base de données officielle |

## 📊 Compatibilité Navigateur

![Browser Support](https://badges.herokuapp.com/browsers?googlechrome=54&firefox=63&safari=10.1&edge=79)

## 🤝 Contribuer

Nous welcome les contributions ! Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les directives.

### **Axes d'Amélioration**
- [ ] Personnages PNJ/Joueur management
- [ ] Générateur de combats et initiative
- [ ] Integration audio (ambiance, sons de dés)
- [ ] Mode offline complet avec Service Worker
- [ ] Support multi-langues (i18n)

## 📝 License

Ce projet est distribué sous [License MIT](LICENSE) - voir le fichier LICENSE pour détails.

---

**🎲 Créé avec ❤️ pour les passionnés de Donjons & Dragons** 

*Built by gamers, for gamers.*