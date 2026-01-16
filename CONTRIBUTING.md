# Contribuer à l'Assistant D&D MJ

Merci de votre intérêt pour contribuer à ce projet ! Voici comment vous pouvez participer.

## Structure du Projet

```
dnd-dm-assistant/
├── index.html                 # Page principale SPA
├── css/                       # Styles et thème
│   ├── main.css              # Styles principaux
│   └── components.css        # Styles des composants
├── js/
│   ├── app.js                # Logique principale et routing
│   ├── api.js                # Service API D&D5E
│   ├── components/           # Web Components
│   └── utils/                # Utilitaires (stockage, performance)
└── README.md
```

## Comment Contribuer

### 1. Fork le Projet
- Fork ce dépôt sur votre compte GitHub
- Clonez votre fork localement

### 2. Installer et Lancer
```bash
git clone https://github.com/VOTRE_USERNAME/dnd-dm-assistant.git
cd dnd-dm-assistant
npm run serve
```

### 3. Branches
- `main` : Branche principale stable
- `feature/nom-de-la-fonctionnalité` : Nouvelles fonctionnalités
- `fix/nom-du-bug` : Corrections de bugs

### 4. Commits
Utilisez des messages de commit clairs :
```
type(scope): description

Exemples:
feat(equipment): Add equipment categories filter
fix(dice): Fix dice roller animation
docs(readme): Update installation instructions
```

Types de commit :
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `style` : Styles (sans changement de logique)
- `refactor` : Refactoring
- `test` : Tests
- `chore` : Tâches de maintenance

### 5. Pull Requests
- Créez une PR depuis votre branche vers `main`
- Décrivez clairement les changements
- Assurez-vous que l'application fonctionne correctement

## Normes de Code

### JavaScript
- ES6+ avec modules
- Nommage en `camelCase` pour variables/fonctions
- Nommage en `PascalCase` pour classes/composants
- Commentaires seulement si nécessaire

### CSS
- Variables CSS pour les couleurs et thèmes
- BEM methodology pour les classes
- Mobile-first responsive design

### Web Components
- Shadow DOM pour l'encapsulation
- Custom Elements v1
- Attributs data pour la configuration

## Tests

Testez manuellement :
- Navigation entre les pages
- Recherche d'équipement
- Système de favoris
- Lanceur de dés
- Responsive design (mobile, tablette, desktop)

## Issues

Signalez les bugs et suggestions :
- Utilisez le template GitHub Issues
- Décrivez le problème clairement
- Includez des captures d'écran si possible

## Licence

En contribuant, vous acceptez que vos contributions soient sous licence MIT.