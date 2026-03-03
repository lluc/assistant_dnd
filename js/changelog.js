/**
 * Changelog de l'application.
 * Mettre à jour manuellement lors de chaque `npm version patch|minor|major`.
 *
 * Types d'entrées : 'feat' | 'fix' | 'chore'
 */
export const CHANGELOG = [
    {
        version: '1.3.0',
        date: '2026-03-03',
        entries: [
            { type: 'feat', text: 'Migration des monstres vers des données statiques (334 monstres)' },
            { type: 'feat', text: 'Recherche et filtres de monstres instantanés (0ms vs 2-5s)' },
            { type: 'feat', text: 'Bestiaire entièrement fonctionnel hors-ligne' },
            { type: 'fix',  text: 'Élimination des problèmes de rate limiting de l\'API' },
            { type: 'fix',  text: 'Suppression des délais de chargement pour les monstres' },
        ],
    },
    {
        version: '1.2.0',
        date: '2026-02-26',
        entries: [
            { type: 'feat', text: 'Système de plateau de dés : composition multi-dés (2d6 + 1d20 + mod)' },
            { type: 'feat', text: 'Modale de lancer de dés accessible depuis la page Classes (dé de vie)' },
            { type: 'feat', text: 'Fenêtre "À propos" avec version, crédits et changelog' },
            { type: 'fix',  text: 'Correction du clic sur les boutons de dés quand le plateau est rempli' },
        ],
    },
    {
        version: '1.1.0',
        date: '2026-02-25',
        entries: [
            { type: 'feat', text: 'Navigateur d\'espèces jouables' },
            { type: 'feat', text: 'Navigateur de classes & sous-classes avec images et détails de maîtrises' },
            { type: 'feat', text: 'Images des équipements' },
            { type: 'fix',  text: 'Mapping des noms d\'équipements pour l\'API D&D 2024' },
        ],
    },
    {
        version: '1.0.0',
        date: '2026-02-19',
        entries: [
            { type: 'feat', text: 'Grimoire des sorts avec recherche, filtres par niveau et fiches détaillées' },
            { type: 'feat', text: 'Lanceur de dés avec historique et modificateur' },
            { type: 'feat', text: 'Recherche d\'équipement avec filtres par catégorie et gestion des favoris' },
            { type: 'feat', text: 'PWA installable avec mise en cache hors-ligne' },
        ],
    },
];
