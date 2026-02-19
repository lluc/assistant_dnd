import { dndAPI } from '../api.js';

class SpellsSearch extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.searchTimeout = null;
        this.currentResults = [];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.loadInitialSpells();
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

                .level-filter {
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

                .level-filter:focus {
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

                    .level-filter {
                        min-width: 100%;
                    }
                }
            </style>

            <div class="search-container">
                <div class="search-header">
                    <div class="search-input-wrapper">
                        <span class="search-icon">✨</span>
                        <input
                            type="text"
                            class="search-input"
                            placeholder="Rechercher un sort..."
                            aria-label="Rechercher un sort"
                        >
                    </div>
                    <select class="level-filter" aria-label="Filtrer par niveau">
                        <option value="">Tous les niveaux</option>
                        <option value="0">Sorts mineurs</option>
                        <option value="1">Niveau 1</option>
                        <option value="2">Niveau 2</option>
                        <option value="3">Niveau 3</option>
                        <option value="4">Niveau 4</option>
                        <option value="5">Niveau 5</option>
                        <option value="6">Niveau 6</option>
                        <option value="7">Niveau 7</option>
                        <option value="8">Niveau 8</option>
                        <option value="9">Niveau 9</option>
                    </select>
                    <button class="search-button" type="button">Rechercher</button>
                </div>
                <div class="search-info">
                    Tapez le nom d'un sort ou filtrez par niveau
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const searchInput = this.shadowRoot.querySelector('.search-input');
        const searchButton = this.shadowRoot.querySelector('.search-button');
        const levelFilter = this.shadowRoot.querySelector('.level-filter');

        const performSearch = () => {
            const query = searchInput.value.trim();
            const level = levelFilter.value;
            this.handleSearch(query, level);
        };

        searchInput.addEventListener('input', () => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(performSearch, 300);
        });

        searchButton.addEventListener('click', performSearch);

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        levelFilter.addEventListener('change', performSearch);
    }

    async loadInitialSpells() {
        this.handleSearch('', '');
    }

    async handleSearch(query, level) {
        this.showLoading(true);

        try {
            let results;

            if (level !== '') {
                const levelResults = await dndAPI.getSpellsByLevel(level);
                if (query) {
                    const filtered = levelResults.filter(s =>
                        s.name.toLowerCase().includes(query.toLowerCase())
                    );
                    results = await Promise.all(
                        filtered.slice(0, 20).map(s => dndAPI.getSpellDetails(s.index))
                    );
                } else {
                    results = await Promise.all(
                        levelResults.slice(0, 20).map(s => dndAPI.getSpellDetails(s.index))
                    );
                }
            } else if (query) {
                results = await dndAPI.searchSpells(query);
            } else {
                const spellsList = await dndAPI.getSpellsList();
                results = await Promise.all(
                    spellsList.results.slice(0, 20).map(s => dndAPI.getSpellDetails(s.index))
                );
            }

            this.currentResults = results;
            this.displayResults(results);

        } catch (error) {
            console.error('Spell search error:', error);
            this.showError('La recherche a échoué. Veuillez réessayer.');
        } finally {
            this.showLoading(false);
        }
    }

    displayResults(results) {
        this.dispatchEvent(new CustomEvent('spells-search-results', {
            detail: { results },
            bubbles: true
        }));
    }

    showLoading(show) {
        const container = this.shadowRoot.querySelector('.search-container');
        const existingLoading = container.querySelector('.loading');

        if (show && !existingLoading) {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'loading';
            loadingDiv.innerHTML = `
                <div class="spinner"></div>
                <span>Consultation du grimoire...</span>
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

customElements.define('spells-search', SpellsSearch);
