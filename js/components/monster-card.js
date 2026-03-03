class MonsterCard extends HTMLElement {
    static MONSTER_TYPES_FR = {
        'aberration': 'Aberration',
        'beast': 'Bête',
        'celestial': 'Céleste',
        'construct': 'Artificiel',
        'dragon': 'Dragon',
        'elemental': 'Élémentaire',
        'fey': 'Fée',
        'fiend': 'Fiélon',
        'giant': 'Géant',
        'humanoid': 'Humanoïde',
        'monstrosity': 'Monstruosité',
        'ooze': 'Vase',
        'plant': 'Plante',
        'undead': 'Mort-vivant'
    };

    static MONSTER_TYPES_FOLDERS = {
        'aberration': 'divers',
        'beast': 'bêtes',
        'celestial': 'célestes',
        'construct': 'divers',
        'dragon': 'dragons',
        'elemental': 'élémentaires',
        'fey': 'fées',
        'fiend': 'fiélons',
        'giant': 'divers', // Pas de dossier géants, on utilise divers
        'humanoid': 'humanoïdes',
        'monstrosity': 'divers',
        'ooze': 'divers',
        'plant': 'divers',
        'undead': 'morts-vivants'
    };

    static ABILITIES_FR = {
        'STR': 'FOR',
        'DEX': 'DEX',
        'CON': 'CON',
        'INT': 'INT',
        'WIS': 'SAG',
        'CHA': 'CHA'
    };

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['monster-data'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'monster-data' && newValue) {
            try {
                this.monster = JSON.parse(newValue);
                this.render();
            } catch (error) {
                console.error('Failed to parse monster data:', error);
            }
        }
    }

    async connectedCallback() {
        if (!this.monster) {
            const data = this.getAttribute('monster-data');
            if (data) {
                this.monster = JSON.parse(data);
                this.render();
            }
        }
        if (this.monster) {
            const { storageManager } = await import('../utils/storage.js');
            const isFavorited = storageManager.isMonsterFavorite(this.monster.index);
            this.updateFavoriteButton(isFavorited);
        }
    }

    getMonsterImagePath(monster) {
        const typeKey = monster.type.toLowerCase();
        const typeFolder = MonsterCard.MONSTER_TYPES_FOLDERS[typeKey] || 'divers';
        const filename = monster.index.replace(/-/g, '_') + '.webp';
        return `assets/images/monsters/${typeFolder}/${filename}`;
    }

    formatChallengeRating(cr) {
        if (cr === 0.125) return '1/8';
        if (cr === 0.25) return '1/4';
        if (cr === 0.5) return '1/2';
        return cr.toString();
    }

    formatSpeed(speed) {
        if (!speed) return 'Non spécifié';
        const speedText = [];
        if (speed.walk) speedText.push(`${speed.walk} à pied`);
        if (speed.fly) speedText.push(`${speed.fly} en vol`);
        if (speed.swim) speedText.push(`${speed.swim} en nageant`);
        if (speed.climb) speedText.push(`${speed.climb} en grimpant`);
        if (speed.burrow) speedText.push(`${speed.burrow} en creusant`);
        return speedText.join(', ');
    }

    getAbilityModifier(score) {
        return Math.floor((score - 10) / 2);
    }

    formatModifier(modifier) {
        return modifier >= 0 ? `+${modifier}` : `${modifier}`;
    }

    render() {
        if (!this.monster) return;

        const monster = this.monster;
        const imagePath = this.getMonsterImagePath(monster);
        const type = MonsterCard.MONSTER_TYPES_FR[monster.type.toLowerCase()] || monster.type;
        const challengeRating = this.formatChallengeRating(monster.challenge_rating);
        const xp = monster.xp || 0;
        const ac = monster.armor_class?.[0]?.value || monster.armor_class || 'N/A';
        const hp = monster.hit_points || 'N/A';
        const speed = this.formatSpeed(monster.speed);

        // Calculate ability modifiers
        const abilities = {};
        const abilityKeys = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
        abilityKeys.forEach(key => {
            const score = monster[key.toLowerCase()] || 10;
            const modifier = this.getAbilityModifier(score);
            abilities[key] = { score, modifier };
        });

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-bottom: 1.5rem;
                }

                .card {
                    background: linear-gradient(135deg, #fff8e7 0%, #f4e4c1 100%);
                    border: 2px solid #8b4513;
                    border-radius: 8px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
                    position: relative;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
                    border-color: #a0522d;
                }

                .card::before {
                    content: '';
                    position: absolute;
                    top: -1px;
                    left: -1px;
                    right: -1px;
                    bottom: -1px;
                    background: linear-gradient(45deg, #8b4513, #cd853f, #8b4513);
                    border-radius: 8px;
                    z-index: -1;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .card:hover::before {
                    opacity: 0.3;
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }

                .monster-image {
                    width: 80px;
                    height: 80px;
                    border-radius: 8px;
                    object-fit: cover;
                    border: 2px solid #8b4513;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                    flex-shrink: 0;
                    background: #f4e4c1;
                }

                .monster-info {
                    flex: 1;
                    margin-left: 1rem;
                    min-width: 0;
                }

                .monster-name {
                    font-family: 'Cinzel', serif;
                    font-size: 1.4rem;
                    font-weight: 600;
                    color: #2c1810;
                    margin-bottom: 0.3rem;
                    word-wrap: break-word;
                }

                .monster-type-cr {
                    font-family: 'Crimson Text', serif;
                    font-size: 1rem;
                    color: #8b4513;
                    margin-bottom: 0.5rem;
                    font-style: italic;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                    gap: 0.8rem;
                    margin-bottom: 1rem;
                    padding: 0.8rem;
                    background: rgba(139, 69, 19, 0.1);
                    border-radius: 4px;
                }

                .stat-item {
                    text-align: center;
                }

                .stat-label {
                    font-family: 'Cinzel', serif;
                    font-size: 0.8rem;
                    color: #8b4513;
                    font-weight: 600;
                    text-transform: uppercase;
                    margin-bottom: 0.2rem;
                }

                .stat-value {
                    font-family: 'Crimson Text', serif;
                    color: #2c1810;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .abilities-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                    padding: 0.8rem;
                    background: rgba(255, 215, 0, 0.1);
                    border-radius: 4px;
                }

                .ability-item {
                    text-align: center;
                }

                .ability-label {
                    font-family: 'Cinzel', serif;
                    font-size: 0.7rem;
                    color: #8b4513;
                    font-weight: 600;
                    margin-bottom: 0.1rem;
                }

                .ability-score {
                    font-family: 'Crimson Text', serif;
                    font-size: 0.8rem;
                    color: #2c1810;
                    font-weight: 600;
                }

                .ability-modifier {
                    font-family: 'Crimson Text', serif;
                    font-size: 0.7rem;
                    color: #654321;
                    font-style: italic;
                }

                .speed-info {
                    margin-bottom: 1rem;
                    padding: 0.5rem;
                    background: rgba(50, 205, 50, 0.1);
                    border-left: 3px solid #32cd32;
                    border-radius: 0 4px 4px 0;
                }

                .speed-label {
                    font-family: 'Cinzel', serif;
                    font-size: 0.8rem;
                    color: #2d7f2d;
                    font-weight: 600;
                    margin-bottom: 0.2rem;
                    text-transform: uppercase;
                }

                .speed-value {
                    font-family: 'Crimson Text', serif;
                    color: #2c1810;
                    font-size: 0.9rem;
                }

                .card-actions {
                    display: flex;
                    gap: 0.8rem;
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(139, 69, 19, 0.3);
                }

                .card-button {
                    padding: 0.5rem 1rem;
                    border: 1px solid #8b4513;
                    border-radius: 4px;
                    font-family: 'Crimson Text', serif;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                }

                .favorite-button {
                    background: #ffd700;
                    color: #2c1810;
                }

                .favorite-button:hover {
                    background: #ffed4e;
                    transform: translateY(-1px);
                }

                .favorite-button.favorited {
                    background: #ff6b6b;
                    color: #fff;
                }

                .details-button {
                    background: transparent;
                    color: #8b4513;
                }

                .details-button:hover {
                    background: rgba(139, 69, 19, 0.1);
                }

                @media (max-width: 600px) {
                    .card-header {
                        flex-direction: column;
                        align-items: center;
                    }

                    .monster-info {
                        margin-left: 0;
                        margin-top: 1rem;
                        text-align: center;
                    }

                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .abilities-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }

                    .card-actions {
                        flex-direction: column;
                    }
                }
            </style>

            <div class="card">
                <div class="card-header">
                    <img
                        class="monster-image"
                        src="${imagePath}"
                        alt="${monster.name}"
                        loading="lazy"
                        onerror="this.style.display='none'"
                    >
                    <div class="monster-info">
                        <h3 class="monster-name">${monster.name}</h3>
                        <div class="monster-type-cr">${type} • Défi ${challengeRating} (${xp.toLocaleString()} XP)</div>
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-label">CA</div>
                        <div class="stat-value">${ac}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">PV</div>
                        <div class="stat-value">${hp}</div>
                    </div>
                </div>

                <div class="abilities-grid">
                    ${abilityKeys.map(key => `
                        <div class="ability-item">
                            <div class="ability-label">${MonsterCard.ABILITIES_FR[key]}</div>
                            <div class="ability-score">${abilities[key].score}</div>
                            <div class="ability-modifier">${this.formatModifier(abilities[key].modifier)}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="speed-info">
                    <div class="speed-label">Vitesse</div>
                    <div class="speed-value">${speed}</div>
                </div>

                <div class="card-actions">
                    <button class="card-button favorite-button" type="button">
                        <span class="button-text">⭐ Favori</span>
                    </button>
                    <button class="card-button details-button" type="button">
                        📖 Détails
                    </button>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const favoriteButton = this.shadowRoot.querySelector('.favorite-button');
        const detailsButton = this.shadowRoot.querySelector('.details-button');

        favoriteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFavorite();
        });

        detailsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showDetails(this.monster.index);
        });
    }

    async toggleFavorite() {
        if (!this.monster) return;

        const { storageManager } = await import('../utils/storage.js');
        const index = this.monster.index;
        const isFavorited = storageManager.isMonsterFavorite(index);

        if (isFavorited) {
            storageManager.removeMonsterFavorite(index);
            this.updateFavoriteButton(false);
        } else {
            storageManager.addMonsterFavorite(index);
            this.updateFavoriteButton(true);
        }

        this.dispatchEvent(new CustomEvent('monster-favorite-toggled', {
            detail: { index, isFavorited: !isFavorited },
            bubbles: true
        }));
    }

    updateFavoriteButton(isFavorited) {
        const button = this.shadowRoot.querySelector('.favorite-button');
        const buttonText = button.querySelector('.button-text');

        if (isFavorited) {
            button.classList.add('favorited');
            buttonText.textContent = '❌ Retirer';
        } else {
            button.classList.remove('favorited');
            buttonText.textContent = '⭐ Favori';
        }
    }

    showDetails(index) {
        this.dispatchEvent(new CustomEvent('monster-show-details', {
            detail: { index },
            bubbles: true
        }));
    }
}

customElements.define('monster-card', MonsterCard);