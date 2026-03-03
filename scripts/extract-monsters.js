#!/usr/bin/env node

/**
 * Script pour extraire tous les monstres depuis l'API D&D5E 2014
 * et générer le fichier de données statiques js/data/monsters.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'https://www.dnd5eapi.co/api/2014';
const OUTPUT_FILE = path.join(__dirname, '../js/data/monsters.js');

console.log('🐉 Extraction des monstres depuis l\'API D&D5E...');

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);

            if (response.status === 429) {
                const waitTime = Math.min(1000 * Math.pow(2, i), 5000);
                console.warn(`  Rate limited on ${url}, waiting ${waitTime}ms...`);
                await delay(waitTime);
                continue;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`  Attempt ${i + 1} failed for ${url}:`, error.message);
            if (i === retries - 1) throw error;
            await delay(1000 * (i + 1));
        }
    }
}

async function extractMonsters() {
    try {
        // 1. Récupérer la liste des monstres
        console.log('📋 Récupération de la liste des monstres...');
        const monstersList = await fetchWithRetry(`${API_BASE}/monsters`);
        console.log(`   Trouvé ${monstersList.count} monstres`);

        // 2. Extraire les détails de chaque monstre
        console.log('📖 Extraction des détails des monstres...');
        const monstersDetails = {};
        const total = monstersList.results.length;

        for (let i = 0; i < total; i++) {
            const monster = monstersList.results[i];
            const progress = `${i + 1}/${total}`;

            try {
                console.log(`   [${progress}] ${monster.name} (${monster.index})`);

                const details = await fetchWithRetry(`${API_BASE}/monsters/${monster.index}`);
                monstersDetails[monster.index] = details;

                // Délai pour éviter le rate limiting
                if ((i + 1) % 5 === 0) {
                    await delay(200);
                }

            } catch (error) {
                console.error(`   ❌ Échec pour ${monster.name}:`, error.message);
            }
        }

        const extractedCount = Object.keys(monstersDetails).length;
        console.log(`✅ ${extractedCount}/${total} monstres extraits avec succès`);

        // 3. Générer le fichier de données
        console.log('💾 Génération du fichier de données...');

        const dataContent = `/**
 * Données statiques des monstres D&D5E
 * Générées automatiquement depuis l'API le ${new Date().toISOString()}
 * Total: ${extractedCount} monstres
 */

export const MONSTERS_DATA = {
    // Liste légère pour les recherches et filtres
    list: ${JSON.stringify(monstersList.results, null, 4)},

    // Données complètes indexées par 'index'
    details: ${JSON.stringify(monstersDetails, null, 4)}
};
`;

        // Créer le dossier js/data s'il n'existe pas
        const dataDir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(OUTPUT_FILE, dataContent);

        const stats = fs.statSync(OUTPUT_FILE);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log(`✅ Fichier généré: ${OUTPUT_FILE}`);
        console.log(`📊 Taille: ${sizeMB} MB`);
        console.log(`🎯 ${extractedCount} monstres disponibles`);

        return extractedCount;

    } catch (error) {
        console.error('❌ Erreur lors de l\'extraction:', error);
        process.exit(1);
    }
}

// Exécution du script
extractMonsters()
    .then(count => {
        console.log(`\n🎉 Extraction terminée avec succès! ${count} monstres extraits.`);
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Extraction échouée:', error);
        process.exit(1);
    });