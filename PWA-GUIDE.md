# 📱 Guide PWA - Assistant D&D MJ

Cette application est maintenant une **Progressive Web App (PWA)** et peut être installée sur les smartphones et les tablettes.

## ✅ Fonctionnalités PWA Activées

- 🔄 **Installation native** : Ajoutez l'icône à votre écran d'accueil
- 🌐 **Mode hors ligne** : Fonctionne même sans connexion internet
- 📲 **Notifications** : Possibilité d'envoyer des notifications push
- ⚡ **Performance** : Cache des ressources pour un chargement rapide
- 🎨 **Icône d'application** : Icône personnalisée avec thème médiéval

## 🚀 Comment Installer la PWA

### Sur Android (Chrome)
1. Ouvrez l'application dans Chrome
2. Appuyez sur le menu "⋮" (trois points)
3. Sélectionnez "Ajouter à l'écran d'accueil"
4. Confirmez l'installation

### Sur iOS (Safari)
1. Ouvrez l'application dans Safari
2. Appuyez sur le bouton "Partager" (⬆️)
3. Faites défiler vers le bas et sélectionnez "Sur l'écran d'accueil"
4. Appuyez sur "Ajouter"

### Sur Desktop (Chrome/Edge)
1. Ouvrez l'application
2. Cherchez l'icône d'installation dans la barre d'adresse (⊕)
3. Cliquez pour installer

## 🔧 Développement et Déploiement

### Prérequis
- **HTTPS obligatoire** : Les PWA nécessitent une connexion sécurisée
- Le service worker doit être servi depuis le même domaine que l'application

### Serveur Local (pour tests)
```bash
# Serveur HTTP standard
npm run serve

# Serveur HTTPS (recommandé pour PWA)
npm run serve-https
```

### Déploiement en Production

#### Option 1: Static Hosting (GitHub Pages, Netlify, Vercel)
1. Uploadez tous les fichiers
2. Activez HTTPS automatique
3. Assurez-vous que le service worker est accessible à la racine (`/sw.js`)

#### Option 2: Serveur Web Personnalisé
Ajoutez ces en-têtes HTTP :
```
Service-Worker-Allowed: /
Cache-Control: public, max-age=31536000, immutable
```

## 🎨 Conversion des Icônes SVG en PNG

Les icônes sont actuellement en format SVG pour une qualité maximale. Pour une meilleure compatibilité mobile, convertissez-les en PNG :

### Avec ImageMagick (Linux/Mac)
```bash
# Install ImageMagick
sudo apt-get install imagemagick  # Linux
brew install imagemagick           # Mac

# Convert all SVG icons to PNG
cd icons
for f in *.svg; do 
  convert "$f" "${f%.svg}.png"
done

# Update manifest.json to use .png files instead of .svg
```

### En Ligne
Utilisez un service comme :
- https://svgtopng.com/
- https://convertio.co/fr/svg-png/
- https://cloudconvert.com/svg-to-png

### Mise à jour après conversion
Si vous convertissez en PNG, mettez à jour :
1. `manifest.json` : Changez `type: "image/svg+xml"` en `"image/png"`
2. `index.html` : Changez les liens `type="image/svg+xml"` en `"image/png"`
3. `sw.js` : Mettez à jour `ASSETS_TO_CACHE` avec les fichiers `.png`

## 🔍 Vérification PWA

### Lighthouse Audit (Chrome DevTools)
1. Ouvrez l'application dans Chrome
2. Faites F12 pour ouvrir DevTools
3. Allez dans l'onglet "Lighthouse"
4. Sélectionnez "Progressive Web App"
5. Cliquez sur "Analyze page load"

Score cible : 100/100

### Test sur Mobile
- ✅ Installation réussie
- ✅ Affichage en mode standalone (sans barre d'adresse)
- ✅ Fonctionnement hors ligne
- ✅ Thème de couleur correct
- ✅ Icône d'application visible

## 🐛 Débogage Service Worker

### Chrome DevTools
1. F12 → Application
2. Service Workers : Vérifiez le statut
3. Cache Storage : Vérifiez les assets mis en cache
4. Manifest : Vérifiez les propriétés

### Console Logs
```javascript
// Vérifier si Service Worker est supporté
if ('serviceWorker' in navigator) {
  console.log('✅ Service Worker supporté');
} else {
  console.log('❌ Service Worker non supporté');
}

// Vérifier si l'application est installée
window.addEventListener('appinstalled', () => {
  console.log('✅ Application PWA installée');
});
```

## 📊 Métriques de Performance

### Cache Strategy
- **Cache First** : Assets statiques (CSS, JS, images)
- **Network First** : API D&D5E
- **Cache Fallback** : Page hors ligne

### TTL (Time To Live)
- Assets statiques : 1 an (avec hash version)
- API responses : 5 minutes (déjà configuré dans `api.js`)

## 🔄 Mise à jour de la PWA

### Versioning
Lorsque vous mettez à jour le code :
1. Incrémentez `CACHE_NAME` dans `sw.js` (ex: `'dnd-assistant-v2'`)
2. Le service worker détectera automatiquement la nouvelle version
3. Les utilisateurs seront notifiés de la mise à jour disponible

### Force Update (manuellement)
```javascript
// Dans la console du navigateur
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    registration.unregister();
  });
  location.reload();
});
```

## 📱 Personnalisation

### Changer l'icône
1. Modifiez les fichiers dans `icons/`
2. Maintenez les mêmes tailles : 72, 96, 128, 144, 152, 192, 384, 512
3. Mettez à jour le manifest et le service worker

### Changer les couleurs
Dans `manifest.json` :
- `"theme_color"` : Couleur de la barre de statut
- `"background_color"` : Couleur de fond du splash screen

Dans `index.html` :
- `<meta name="theme-color">` : Couleur de la barre d'adresse

## 🆘 Problèmes Courants

### Service Worker ne s'installe pas
- Vérifiez que vous êtes sur HTTPS
- Assurez-vous que `sw.js` est accessible à la racine du domaine
- Vérifiez les erreurs dans la console

### Icône ne s'affiche pas
- Convertissez en PNG si nécessaire
- Vérifiez que les fichiers sont accessibles
- Nettoyez le cache du navigateur

### Mode hors ligne ne fonctionne pas
- Vérifiez que tous les assets sont listés dans `ASSETS_TO_CACHE`
- Ouvrez DevTools → Network → Offline pour tester
- Assurez-vous que le service worker est actif

## 📚 Ressources Utiles

- [MDN - Progressive Web Apps](https://developer.mozilla.org/fr/docs/Web/Progressive_web_apps)
- [PWA Builder](https://www.pwabuilder.com/)
- [Web.dev - PWA](https://web.dev/progressive-web-apps/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

**🎲 Profitez de votre Assistant D&D MJ installable !**