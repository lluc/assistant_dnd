class EquipmentCard extends HTMLElement {
    static CURRENCY_FR = {
        cp: { abbr: 'pc', name: 'cuivre', color: '#b87333', icon: '🟤' },
        sp: { abbr: 'pa', name: 'argent', color: '#c0c0c0', icon: '⚪' },
        ep: { abbr: 'pe', name: 'électrum', color: '#50c878', icon: '🟢' },
        gp: { abbr: 'po', name: 'or', color: '#ffd700', icon: '🟡' },
        pp: { abbr: 'pp', name: 'platine', color: '#e5e4e2', icon: '⚪' }
    };

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['equipment-data'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'equipment-data' && newValue) {
            try {
                this.equipment = JSON.parse(newValue);
                this.render();
            } catch (error) {
                console.error('Failed to parse equipment data:', error);
            }
        }
    }

    async connectedCallback() {
        if (!this.equipment) {
            const data = this.getAttribute('equipment-data');
            if (data) {
                this.equipment = JSON.parse(data);
                this.render();
            }
        }
        if (this.equipment) {
            const { storageManager } = await import('../utils/storage.js');
            const isFavorited = storageManager.isFavorite(this.equipment.index);
            this.updateFavoriteButton(isFavorited);
        }
    }

    render() {
        if (!this.equipment) return;

        const equipment = this.equipment;
        const cost = equipment.cost ? `${equipment.cost.quantity} ${this.formatCurrency(equipment.cost.unit)}` : 'Non spécifié';
        const weight = equipment.weight ? `${equipment.weight} lb (${(equipment.weight * 0.453592).toFixed(1)} kg)` : 'Non spécifié';
        const damage = equipment.damage ? `${equipment.damage.damage_dice} ${equipment.damage.damage_type.name}` : null;
        const range = equipment.range ? this.formatRange(equipment.range) : null;
        const properties = equipment.properties || [];

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
                    gap: 1rem;
                }

                .card-title {
                    font-family: 'Cinzel', serif;
                    font-size: 1.3rem;
                    font-weight: 600;
                    color: #2c1810;
                    margin: 0;
                    flex: 1;
                }

                .card-type {
                    background: #8b4513;
                    color: #f4e4c1;
                    padding: 0.3rem 0.8rem;
                    border-radius: 4px;
                    font-family: 'Crimson Text', serif;
                    font-size: 0.9rem;
                    white-space: nowrap;
                }

                .card-description {
                    font-family: 'Crimson Text', serif;
                    color: #654321;
                    margin-bottom: 1rem;
                    line-height: 1.5;
                    font-style: italic;
                }

                .card-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 0.8rem;
                    margin-bottom: 1rem;
                }

                .stat {
                    background: rgba(139, 69, 19, 0.1);
                    padding: 0.5rem;
                    border-radius: 4px;
                    border: 1px solid rgba(139, 69, 19, 0.3);
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
                }

                .currency-icon {
                    font-size: 0.9em;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                }

                .properties {
                    margin-top: 1rem;
                }

                .properties-title {
                    font-family: 'Cinzel', serif;
                    font-size: 0.9rem;
                    color: #8b4513;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                }

                .property-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .property-tag {
                    background: #cd853f;
                    color: #2c1810;
                    padding: 0.2rem 0.6rem;
                    border-radius: 3px;
                    font-family: 'Crimson Text', serif;
                    font-size: 0.8rem;
                    border: 1px solid #8b4513;
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

                .damage-info {
                    background: rgba(220, 53, 69, 0.1);
                    border: 1px solid rgba(220, 53, 69, 0.3);
                    padding: 0.5rem;
                    border-radius: 4px;
                    margin-top: 0.5rem;
                }

                .damage-label {
                    font-family: 'Cinzel', serif;
                    font-size: 0.8rem;
                    color: #721c24;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .damage-value {
                    font-family: 'Crimson Text', serif;
                    color: #721c24;
                    font-weight: 600;
                    font-size: 1.1rem;
                }

                @media (max-width: 768px) {
                    .card {
                        padding: 1rem;
                    }

                    .card-title {
                        font-size: 1.1rem;
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
                    <h3 class="card-title">${equipment.name}</h3>
                    <span class="card-type">${this.getEquipmentCategory(equipment)}</span>
                </div>
                
                ${equipment.desc ? `
                    <div class="card-description">
                        ${equipment.desc[0]}
                    </div>
                ` : ''}
                
                <div class="card-stats">
                    <div class="stat">
                        <div class="stat-label">Coût</div>
                        <div class="stat-value">${cost}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Poids</div>
                        <div class="stat-value">${weight}</div>
                    </div>
                    ${damage ? `
                        <div class="stat">
                            <div class="stat-label">Dégâts</div>
                            <div class="stat-value">${damage}</div>
                        </div>
                    ` : ''}
                    ${range ? `
                        <div class="stat">
                            <div class="stat-label">Portée</div>
                            <div class="stat-value">${range}</div>
                        </div>
                    ` : ''}
                </div>
                
                ${properties.length > 0 ? `
                    <div class="properties">
                        <div class="properties-title">Propriétés</div>
                        <div class="property-tags">
                            ${properties.map(prop => `
                                <span class="property-tag">${prop.name}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="card-actions">
                    <button class="card-button favorite-button">
                        <span class="button-text">⭐ Favori</span>
                    </button>
                    <button class="card-button details-button">
                        📋 Détails
                    </button>
                </div>
            </div>
        `;

        // Setup event listeners after DOM is created
        const button = this.shadowRoot.querySelector('.favorite-button');
        const detailsButton = this.shadowRoot.querySelector('.details-button');
        
        button.addEventListener('click', () => this.toggleFavorite(equipment.index));
        detailsButton.addEventListener('click', () => this.showDetails(equipment.index));
    }

    getEquipmentCategory(equipment) {
        if (equipment.equipment_category) {
            return equipment.equipment_category.name;
        }
        if (equipment.weapon_category) {
            return `Arme (${equipment.weapon_category})`;
        }
        if (equipment.armor_category) {
            return `Armure (${equipment.armor_category})`;
        }
        return 'Divers';
    }

    formatCurrency(unit) {
        const currency = EquipmentCard.CURRENCY_FR[unit];
        if (currency) {
            return `${currency.abbr} <span class="currency-icon" style="color: ${currency.color}">●</span>`;
        }
        return unit;
    }

    convertFeetToMeters(feet) {
        const meters = feet * 0.3048;
        return meters.toFixed(1);
    }

    formatRange(range) {
        if (typeof range === 'object') {
            let result = '';
            if (range.normal) {
                const normalMeters = this.convertFeetToMeters(range.normal);
                result += `${range.normal} ft (${normalMeters} m)`;
            }
            if (range.long && range.long > range.normal) {
                const longMeters = this.convertFeetToMeters(range.long);
                result += ` / ${range.long} ft (${longMeters} m)`;
            }
            return result;
        }
        if (typeof range === 'number') {
            const meters = this.convertFeetToMeters(range);
            return `${range} ft (${meters} m)`;
        }
        return range;
    }

    async toggleFavorite(index) {
        const { storageManager } = await import('../utils/storage.js');
        const isFavorited = storageManager.isFavorite(index);
        
        if (isFavorited) {
            storageManager.removeFavorite(index);
            this.updateFavoriteButton(false);
        } else {
            storageManager.addFavorite(index);
            this.updateFavoriteButton(true);
        }
        
        this.dispatchEvent(new CustomEvent('favorite-toggled', {
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
        this.dispatchEvent(new CustomEvent('show-details', {
            detail: { index },
            bubbles: true
        }));
    }
}

customElements.define('equipment-card', EquipmentCard);