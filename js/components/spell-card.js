class SpellCard extends HTMLElement {
    static COMPONENTS_FR = {
        V: 'Verbale',
        S: 'Somatique',
        M: 'Matérielle'
    };

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['spell-data'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'spell-data' && newValue) {
            try {
                this.spell = JSON.parse(newValue);
                this.render();
            } catch (error) {
                console.error('Failed to parse spell data:', error);
            }
        }
    }

    async connectedCallback() {
        if (!this.spell) {
            const data = this.getAttribute('spell-data');
            if (data) {
                this.spell = JSON.parse(data);
                this.render();
            }
        }
        if (this.spell) {
            const { storageManager } = await import('../utils/storage.js');
            if (typeof storageManager.isSpellFavorite !== 'function') {
                // Module registry has an outdated version of storage.js (SW update in progress)
                window.location.reload();
                return;
            }
            const isFavorited = storageManager.isSpellFavorite(this.spell.index);
            this.updateFavoriteButton(isFavorited);
        }
    }

    render() {
        if (!this.spell) return;

        const spell = this.spell;
        const levelLabel = spell.level === 0 ? 'Sort mineur' : `Niveau ${spell.level}`;
        const school = spell.school ? spell.school.name : 'Inconnue';
        const components = (spell.components || [])
            .map(c => SpellCard.COMPONENTS_FR[c] || c)
            .join(', ');
        const classes = (spell.classes || []).map(c => c.name).join(', ');
        const concentration = spell.concentration ? 'Oui' : 'Non';
        const ritual = spell.ritual ? 'Oui' : 'Non';
        const description = spell.desc ? spell.desc[0] : '';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-bottom: 1.5rem;
                }

                .card {
                    background: linear-gradient(135deg, #f0f0ff 0%, #e8e0f4 100%);
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
                    gap: 1rem;
                }

                .card-title {
                    font-family: 'Cinzel', serif;
                    font-size: 1.3rem;
                    font-weight: 600;
                    color: #2c1810;
                    margin: 0;
                    flex: 1;
                    min-width: 0;
                    overflow-wrap: break-word;
                }

                .card-type {
                    background: #4a3060;
                    color: #e8d4f8;
                    padding: 0.3rem 0.8rem;
                    border-radius: 4px;
                    font-family: 'Crimson Text', serif;
                    font-size: 0.9rem;
                    white-space: nowrap;
                    flex-shrink: 0;
                }

                .card-description {
                    font-family: 'Crimson Text', serif;
                    color: #654321;
                    margin-bottom: 1rem;
                    line-height: 1.5;
                    font-style: italic;
                    overflow-wrap: break-word;
                }

                .card-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 0.8rem;
                    margin-bottom: 1rem;
                }

                .stat {
                    background: rgba(74, 48, 96, 0.08);
                    padding: 0.5rem;
                    border-radius: 4px;
                    border: 1px solid rgba(74, 48, 96, 0.25);
                }

                .stat-label {
                    font-family: 'Cinzel', serif;
                    font-size: 0.8rem;
                    color: #4a3060;
                    font-weight: 600;
                    text-transform: uppercase;
                    margin-bottom: 0.2rem;
                }

                .stat-value {
                    font-family: 'Crimson Text', serif;
                    color: #2c1810;
                    font-weight: 600;
                }

                .tags {
                    margin-top: 1rem;
                }

                .tags-title {
                    font-family: 'Cinzel', serif;
                    font-size: 0.9rem;
                    color: #4a3060;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                }

                .tag-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .tag {
                    background: #6a4a8a;
                    color: #f0e8f8;
                    padding: 0.2rem 0.6rem;
                    border-radius: 3px;
                    font-family: 'Crimson Text', serif;
                    font-size: 0.8rem;
                    border: 1px solid #4a3060;
                }

                .card-actions {
                    display: flex;
                    gap: 0.8rem;
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(74, 48, 96, 0.2);
                }

                .card-button {
                    padding: 0.5rem 1rem;
                    border: 1px solid #8b4513;
                    border-radius: 4px;
                    font-family: 'Crimson Text', serif;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.9rem;
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
                    color: #4a3060;
                    border-color: #4a3060;
                }

                .details-button:hover {
                    background: rgba(74, 48, 96, 0.1);
                }

                @media (max-width: 768px) {
                    .card {
                        padding: 1rem;
                    }

                    .card-header {
                        flex-direction: column;
                        gap: 0.5rem;
                    }

                    .card-title {
                        font-size: 1.1rem;
                    }

                    .card-type {
                        white-space: normal;
                        align-self: flex-start;
                    }

                    .card-stats {
                        grid-template-columns: 1fr 1fr;
                    }

                    .card-actions {
                        flex-direction: column;
                    }

                    .card-button {
                        width: 100%;
                        text-align: center;
                    }
                }
            </style>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${spell.name}</h3>
                    <span class="card-type">${levelLabel} · ${school}</span>
                </div>

                ${description ? `
                    <div class="card-description">${description}</div>
                ` : ''}

                <div class="card-stats">
                    <div class="stat">
                        <div class="stat-label">Incantation</div>
                        <div class="stat-value">${spell.casting_time || 'N/A'}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Portée</div>
                        <div class="stat-value">${this.formatSpellRange(spell.range)}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Durée</div>
                        <div class="stat-value">${spell.duration || 'N/A'}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Composantes</div>
                        <div class="stat-value">${components || 'N/A'}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Concentration</div>
                        <div class="stat-value">${concentration}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Rituel</div>
                        <div class="stat-value">${ritual}</div>
                    </div>
                </div>

                ${classes ? `
                    <div class="tags">
                        <div class="tags-title">Classes</div>
                        <div class="tag-list">
                            ${(spell.classes || []).map(c => `<span class="tag">${c.name}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="card-actions">
                    <button class="card-button favorite-button">
                        <span class="button-text">⭐ Favori</span>
                    </button>
                    <button class="card-button details-button">
                        📜 Détails
                    </button>
                </div>
            </div>
        `;

        const favoriteBtn = this.shadowRoot.querySelector('.favorite-button');
        const detailsBtn = this.shadowRoot.querySelector('.details-button');

        favoriteBtn.addEventListener('click', () => this.toggleFavorite(spell.index));
        detailsBtn.addEventListener('click', () => this.showDetails(spell.index));
    }

    formatSpellRange(range) {
        if (!range) return 'N/A';
        return range.replace(/(\d+)\s*-?\s*(?:foot|feet)/gi, (match, feet) => {
            const m = (parseInt(feet) * 0.3048).toFixed(1);
            return `${feet} ft (${m} m)`;
        });
    }

    async toggleFavorite(index) {
        const { storageManager } = await import('../utils/storage.js');
        if (typeof storageManager.isSpellFavorite !== 'function') {
            window.location.reload();
            return;
        }
        const isFavorited = storageManager.isSpellFavorite(index);

        if (isFavorited) {
            storageManager.removeSpellFavorite(index);
            this.updateFavoriteButton(false);
        } else {
            storageManager.addSpellFavorite(index);
            this.updateFavoriteButton(true);
        }

        this.dispatchEvent(new CustomEvent('favorite-toggled', {
            detail: { index, type: 'spell', isFavorited: !isFavorited },
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
        this.dispatchEvent(new CustomEvent('spell-show-details', {
            detail: { index },
            bubbles: true
        }));
    }
}

customElements.define('spell-card', SpellCard);
