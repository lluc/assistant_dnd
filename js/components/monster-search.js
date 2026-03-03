import { dndAPI } from '../api.js';

class MonsterSearch extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.searchTimeout = null;
        this.currentResults = [];
        this.displayedResults = [];
        this.currentResults = [];
        this.isSearching = false;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        // Load initial set of monsters (e.g., 30 random monsters for browsing)
        this.loadInitialMonsters();
    }

    async loadInitialMonsters() {
        try {
            // Load first 30 monsters as default when page loads
            const { dndAPI } = await import('../api.js');
            const results = await dndAPI.getMonstersByFilters(); // No filters = all monsters
            // Show first 30 for initial browsing
            const initialResults = results.slice(0, 30);
            this.displayResults(initialResults);
        } catch (error) {
            console.error('Failed to load initial monsters:', error);
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-bottom: 2rem;
                }

                .search-container {
                    background: linear-gradient(135deg, #f4e4c1 0%, #e8d4a8 100%);
                    border: 2px solid #8b4513;
                    border-radius: 8px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
                    position: relative;
                }

                .search-container::before {
                    content: '';
                    position: absolute;
                    top: -2px;
                    left: -2px;
                    right: -2px;
                    bottom: -2px;
                    background: linear-gradient(45deg, #8b4513, #cd853f, #8b4513);
                    border-radius: 8px;
                    z-index: -1;
                }

                .search-header {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1rem;
                    flex-wrap: wrap;
                }

                .search-input-wrapper {
                    flex: 1;
                    min-width: 250px;
                    position: relative;
                }

                .search-input {
                    width: 100%;
                    padding: 0.8rem 1rem 0.8rem 2.5rem;
                    border: 2px solid #8b4513;
                    border-radius: 4px;
                    background: #fff;
                    font-family: 'Crimson Text', serif;
                    font-size: 1.1rem;
                    color: #2c1810;
                    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                    box-sizing: border-box;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #ffd700;
                    box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
                }

                .search-icon {
                    position: absolute;
                    left: 0.8rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #8b4513;
                    font-size: 1.2rem;
                }

                .filter-group {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .type-filter, .cr-filter {
                    padding: 0.8rem 1rem;
                    border: 2px solid #8b4513;
                    border-radius: 4px;
                    background: #fff;
                    font-family: 'Crimson Text', serif;
                    font-size: 1rem;
                    color: #2c1810;
                    cursor: pointer;
                    min-width: 150px;
                    box-sizing: border-box;
                }

                .type-filter:focus, .cr-filter:focus {
                    outline: none;
                    border-color: #ffd700;
                }

                .search-button {
                    padding: 0.8rem 1.5rem;
                    background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
                    color: #f4e4c1;
                    border: 2px solid #654321;
                    border-radius: 4px;
                    font-family: 'Cinzel', serif;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }

                .search-button:hover {
                    background: linear-gradient(135deg, #a0522d 0%, #8b4513 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                }

                .search-button:active {
                    transform: translateY(0);
                }

                .search-info {
                    margin-top: 1rem;
                    padding: 0.5rem;
                    background: rgba(139, 69, 19, 0.1);
                    border-radius: 4px;
                    font-family: 'Crimson Text', serif;
                    color: #654321;
                    font-size: 0.9rem;
                    text-align: center;
                }

                .loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-top: 1rem;
                    color: #8b4513;
                    font-family: 'Crimson Text', serif;
                }

                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #8b4513;
                    border-top: 2px solid #ffd700;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .search-header {
                        flex-direction: column;
                    }

                    .search-input-wrapper {
                        min-width: 100%;
                    }

                    .filter-group {
                        justify-content: stretch;
                    }

                    .type-filter, .cr-filter {
                        min-width: 48%;
                        flex: 1;
                    }

                    .search-button {
                        width: 100%;
                    }
                }
            </style>

            <div class="search-container">
                <div class="search-header">
                    <div class="search-input-wrapper">
                        <span class="search-icon">🐉</span>
                        <input
                            type="text"
                            class="search-input"
                            placeholder="Rechercher un monstre..."
                            aria-label="Rechercher un monstre"
                        >
                    </div>
                    <div class="filter-group">
                        <select class="type-filter" aria-label="Filtrer par type de créature">
                            <option value="">Toutes créatures</option>
                            <option value="aberration">Aberrations</option>
                            <option value="beast">Bêtes</option>
                            <option value="celestial">Célestes</option>
                            <option value="construct">Artificiels</option>
                            <option value="dragon">Dragons</option>
                            <option value="elemental">Élémentaires</option>
                            <option value="fey">Fées</option>
                            <option value="fiend">Fiélons</option>
                            <option value="giant">Géants</option>
                            <option value="humanoid">Humanoïdes</option>
                            <option value="monstrosity">Monstruosités</option>
                            <option value="ooze">Vases</option>
                            <option value="plant">Plantes</option>
                            <option value="undead">Morts-vivants</option>
                        </select>
                        <select class="cr-filter" aria-label="Filtrer par niveau de défi">
                            <option value="">Tous niveaux de défi</option>
                            <option value="0-1">ND 0-1</option>
                            <option value="2-5">ND 2-5</option>
                            <option value="6-10">ND 6-10</option>
                            <option value="11-15">ND 11-15</option>
                            <option value="16-20">ND 16-20</option>
                            <option value="21-30">ND 21-30</option>
                        </select>
                    </div>
                    <button class="search-button" type="button">Rechercher</button>
                </div>
                <div class="search-info">
                    <strong>334 monstres disponibles</strong> • Recherche et filtres instantanés • Fonctionne hors-ligne
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const searchInput = this.shadowRoot.querySelector('.search-input');
        const searchButton = this.shadowRoot.querySelector('.search-button');
        const typeFilter = this.shadowRoot.querySelector('.type-filter');
        const crFilter = this.shadowRoot.querySelector('.cr-filter');

        const performSearch = () => {
            const query = searchInput.value.trim();
            const type = typeFilter.value;
            const challengeRating = crFilter.value;
            this.handleSearch(query, type, challengeRating);
        };

        searchInput.addEventListener('input', () => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(performSearch, 300); // Délai plus court avec données locales
        });

        searchButton.addEventListener('click', performSearch);

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        typeFilter.addEventListener('change', performSearch);
        crFilter.addEventListener('change', performSearch);
    }

    async handleSearch(query, type, challengeRating) {
        // Empêche les recherches simultanées
        if (this.isSearching) {
            return;
        }

        this.isSearching = true;
        this.showLoading(true);

        try {
            if (query) {
                const { storageManager } = await import('../utils/storage.js');
                storageManager.addSearchQuery(query);
            }

            let results;

            if (query) {
                // Search by name
                results = await dndAPI.searchMonsters(query);

                // Apply additional filters to search results
                if (type) {
                    results = results.filter(monster => monster.type.toLowerCase() === type);
                }

                if (challengeRating) {
                    results = results.filter(monster => {
                        const cr = monster.challenge_rating;
                        switch (challengeRating) {
                            case '0-1':
                                return cr <= 1;
                            case '2-5':
                                return cr >= 2 && cr <= 5;
                            case '6-10':
                                return cr >= 6 && cr <= 10;
                            case '11-15':
                                return cr >= 11 && cr <= 15;
                            case '16-20':
                                return cr >= 16 && cr <= 20;
                            case '21-30':
                                return cr >= 21 && cr <= 30;
                            default:
                                return true;
                        }
                    });
                }
            } else {
                // Apply filters or load all monsters (no limit with static data)
                results = await dndAPI.getMonstersByFilters(type, challengeRating);
            }

            this.currentResults = results;
            this.displayResults(results);

        } catch (error) {
            console.error('Monster search error:', error);
            this.showError('La recherche a échoué. Veuillez réessayer.');
        } finally {
            this.showLoading(false);
            this.isSearching = false;
        }
    }

    displayResults(results) {
        this.dispatchEvent(new CustomEvent('monster-search-results', {
            detail: { results },
            bubbles: true
        }));
    }

    updateSearchInfo(message) {
        const infoDiv = this.shadowRoot.querySelector('.search-info');
        if (infoDiv) {
            infoDiv.innerHTML = `<em>${message}</em>`;
        }
    }

    resetSearchInfo() {
        const infoDiv = this.shadowRoot.querySelector('.search-info');
        if (infoDiv) {
            infoDiv.innerHTML = '<strong>334 monstres disponibles</strong> • Recherche et filtres instantanés • Fonctionne hors-ligne';
        }
    }

    showLoading(show) {
        const container = this.shadowRoot.querySelector('.search-container');
        const existingLoading = container.querySelector('.loading');

        if (show && !existingLoading) {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'loading';
            loadingDiv.innerHTML = `
                <div class="spinner"></div>
                <span>Recherche en cours...</span>
            `;
            container.appendChild(loadingDiv);
        } else if (!show && existingLoading) {
            existingLoading.remove();
        }
    }

    showError(message) {
        const container = this.shadowRoot.querySelector('.search-container');
        const existingError = container.querySelector('.error');

        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.style.cssText = `
            margin-top: 1rem;
            padding: 0.5rem;
            background: rgba(220, 53, 69, 0.1);
            border: 1px solid #dc3545;
            border-radius: 4px;
            color: #721c24;
            font-family: 'Crimson Text', serif;
            text-align: center;
        `;
        errorDiv.textContent = message;
        container.appendChild(errorDiv);

        setTimeout(() => errorDiv.remove(), 5000);
    }
}

customElements.define('monster-search', MonsterSearch);