const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function generateSVGIcon(size, withPadding = false) {
  const padding = withPadding ? 16 : 0;
  const iconSize = size - (padding * 2);
  
  const diceColor = '#e63946';
  const bgColor = '#1a1a2e';
  const dotColor = '#ffffff';
  
  const diceX = padding + (iconSize * 0.2);
  const diceY = padding + (iconSize * 0.35);
  const diceSize = iconSize * 0.6;
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
  svg += `<rect width="${size}" height="${size}" fill="${bgColor}"/>`;
  
  if (iconSize > 30) {
    const dotSize = Math.max(2, diceSize * 0.08);
    const dotOffset = diceSize * 0.25;
    const center = diceSize / 2;
    
    svg += `<rect x="${diceX}" y="${diceY}" width="${diceSize}" height="${diceSize}" fill="${diceColor}" rx="${diceSize * 0.15}" ry="${diceSize * 0.15}"/>`;
    
    svg += `<circle cx="${diceX + dotOffset}" cy="${diceY + dotOffset}" r="${dotSize}" fill="${dotColor}"/>`;
    svg += `<circle cx="${diceX + diceSize - dotOffset}" cy="${diceY + dotOffset}" r="${dotSize}" fill="${dotColor}"/>`;
    svg += `<circle cx="${diceX + center}" cy="${diceY + center}" r="${dotSize}" fill="${dotColor}"/>`;
    svg += `<circle cx="${diceX + dotOffset}" cy="${diceY + diceSize - dotOffset}" r="${dotSize}" fill="${dotColor}"/>`;
    svg += `<circle cx="${diceX + diceSize - dotOffset}" cy="${diceY + diceSize - dotOffset}" r="${dotSize}" fill="${dotColor}"/>`;
  } else {
    svg += `<rect x="${diceX}" y="${diceY}" width="${diceSize}" height="${diceSize}" fill="${diceColor}" rx="${diceSize * 0.1}" ry="${diceSize * 0.1}"/>`;
  }
  
  svg += '</svg>';
  
  return svg;
}

function generatePNGPlaceholder(size) {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #1a1a2e; }
  .icon { width: ${size}px; height: ${size}px; }
</style>
</head>
<body>
${generateSVGIcon(size, false)}
</body>
</html>`;
}

const iconsDir = path.join(__dirname, 'icons');
const screenshotsDir = path.join(__dirname, 'screenshots');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

sizes.forEach(size => {
  const svgIcon = generateSVGIcon(size, false);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  fs.writeFileSync(filepath, svgIcon);
  console.log(`✅ Généré: ${filename}`);
});

sizes.forEach(size => {
  const svgIcon = generateSVGIcon(size, true);
  const filename = `icon-${size}x${size}-maskable.svg`;
  const filepath = path.join(iconsDir, filename);
  fs.writeFileSync(filepath, svgIcon);
  console.log(`✅ Généré (maskable): ${filename}`);
});

console.log('\n🎲 Icônes PWA générées avec succès !');
console.log('💡 Convertissez les fichiers SVG en PNG pour une meilleure compatibilité.');
console.log('   Utilisez un outil comme https://svgtopng.com/ ou une commande convert ImageMagick:'); 
console.log('   for f in icons/*.svg; do convert "$f" "${f%.svg}.png"; done');