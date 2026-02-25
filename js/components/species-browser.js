import { dndAPI } from '../api.js';

const SPECIES_FR = {
    dragonborn: 'Draconide',
    dwarf: 'Nain',
    elf: 'Elfe',
    gnome: 'Gnome',
    'half-elf': 'Demi-Elfe',
    'half-orc': 'Demi-Orc',
    halfling: 'Halfelin',
    human: 'Humain',
    tiefling: 'Tieffelin',
};

const SPECIES_ICONS = {
    dragonborn: '🐉',
    dwarf: '⛏️',
    elf: '🌿',
    gnome: '🔧',
    'half-elf': '🌟',
    'half-orc': '💪',
    halfling: '🍀',
    human: '👤',
    tiefling: '😈',
};

const ABILITY_FR = {
    STR: 'Force',
    DEX: 'Dextérité',
    CON: 'Constitution',
    INT: 'Intelligence',
    WIS: 'Sagesse',
    CHA: 'Charisme',
};

const SIZE_FR = {
    Medium: 'Moyen',
    Small: 'Petit',
    Large: 'Grand',
    Tiny: 'Très petit',
};

const SPECIES_IMAGE = {
    dragonborn: './assets/images/race/moyennes/dragonborn.webp',
    dwarf:      './assets/images/race/moyennes/dwarf.webp',
    elf:        './assets/images/race/moyennes/elf.webp',
    gnome:      './assets/images/race/petites/gnome.webp',
    'half-elf': './assets/images/race/moyennes/half-elf.webp',
    'half-orc': './assets/images/race/moyennes/half-orc.webp',
    halfling:   './assets/images/race/petites/halfling.webp',
    human:      './assets/images/race/moyennes/human.webp',
    tiefling:   './assets/images/race/moyennes/tiefling.webp',
};

class SpeciesBrowser extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.speciesList = [];
        this.selectedSpecies = null;
        this.speciesData = null;
        this.traitsData = [];
    }

    connectedCallback() {
        this.renderShell();
        this.loadSpecies();
    }

    renderShell() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                /* ─── Grille de sélection ─── */
                .species-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                    gap: 0.75rem;
                    margin-bottom: 2rem;
                }

                .species-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.9rem 0.5rem;
                    background: linear-gradient(135deg, #f4e4c1 0%, #e8d4a8 100%);
                    border: 2px solid #8b4513;
                    border-radius: 8px;
                    cursor: pointer;
                    font-family: 'Cinzel', serif;
                    font-size: 0.85rem;
                    color: #2c1810;
                    transition: all 0.25s ease;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
                }

                .species-btn:hover {
                    background: linear-gradient(135deg, #fdf0d5 0%, #f4e4c1 100%);
                    border-color: #ffd700;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.25);
                    color: #5c2a00;
                }

                .species-btn.active {
                    background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
                    border-color: #ffd700;
                    color: #f4e4c1;
                    box-shadow: 0 0 12px rgba(255,215,0,0.35);
                }

                .species-icon {
                    font-size: 1.8rem;
                    line-height: 1;
                }

                .species-name {
                    text-align: center;
                    line-height: 1.2;
                    font-weight: 600;
                }

                /* ─── Loading ─── */
                .loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    padding: 3rem;
                    color: #8b4513;
                    font-family: 'Crimson Text', serif;
                    font-size: 1.1rem;
                }

                .spinner {
                    width: 24px;
                    height: 24px;
                    border: 3px solid #e8d4a8;
                    border-top-color: #8b4513;
                    border-radius: 50%;
                    animation: spin 0.9s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* ─── Bannière espèce ─── */
                .species-banner-wrap {
                    margin: -1.5rem -1.5rem 1.5rem;
                    border-radius: 6px 6px 0 0;
                    overflow: hidden;
                }

                .species-banner-wrap img {
                    width: 100%;
                    height: auto;
                    display: block;
                }

                /* ─── Panneau détail ─── */
                .species-detail {
                    background: linear-gradient(135deg, #f4e4c1 0%, #e8d4a8 100%);
                    border: 2px solid #8b4513;
                    border-radius: 8px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
                    animation: fadeIn 0.3s ease;
                    scroll-margin-top: 90px;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .species-detail-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #8b4513;
                }

                .species-detail-icon {
                    font-size: 3rem;
                    line-height: 1;
                }

                .species-detail-title {
                    font-family: 'Cinzel', serif;
                    font-size: 1.8rem;
                    font-weight: 600;
                    color: #2c1810;
                    margin: 0 0 0.25rem 0;
                }

                .species-detail-subtitle {
                    font-family: 'Crimson Text', serif;
                    font-size: 1rem;
                    color: #654321;
                }

                /* ─── Badges ─── */
                .info-badges {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-bottom: 1.25rem;
                }

                .badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                    padding: 0.35rem 0.75rem;
                    background: rgba(139,69,19,0.12);
                    border: 1px solid #8b4513;
                    border-radius: 20px;
                    font-family: 'Crimson Text', serif;
                    font-size: 0.95rem;
                    color: #3d1c00;
                }

                .badge strong {
                    font-weight: 600;
                }

                .badge.bonus {
                    background: rgba(76,153,0,0.1);
                    border-color: #4c9900;
                    color: #2a5500;
                }

                /* ─── Titres de section ─── */
                .section-title {
                    font-family: 'Cinzel', serif;
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #2c1810;
                    margin: 1.25rem 0 0.6rem 0;
                    padding-bottom: 0.3rem;
                    border-bottom: 1px solid rgba(139,69,19,0.3);
                }

                /* ─── Traits ─── */
                .trait-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .trait-item {
                    padding: 0.75rem 1rem;
                    background: rgba(255,255,255,0.5);
                    border: 1px solid rgba(139,69,19,0.35);
                    border-radius: 6px;
                }

                .trait-name {
                    font-family: 'Cinzel', serif;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #2c1810;
                    margin-bottom: 0.3rem;
                }

                .trait-desc {
                    font-family: 'Crimson Text', serif;
                    font-size: 0.95rem;
                    color: #3d1c00;
                    line-height: 1.5;
                }

                /* ─── Tags langues ─── */
                .tag-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.4rem;
                    margin-bottom: 0.5rem;
                }

                .lang-tag {
                    padding: 0.2rem 0.6rem;
                    background: rgba(139,69,19,0.08);
                    border: 1px solid rgba(139,69,19,0.35);
                    border-radius: 4px;
                    font-family: 'Crimson Text', serif;
                    font-size: 0.9rem;
                    color: #4a2800;
                }

                .lore-text {
                    font-family: 'Crimson Text', serif;
                    font-size: 0.95rem;
                    color: #4a2800;
                    line-height: 1.55;
                    font-style: italic;
                    margin-bottom: 0.5rem;
                }

                /* ─── Sous-espèces ─── */
                .subspecies-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 0.75rem;
                }

                .subspecies-card {
                    padding: 1rem;
                    background: rgba(255,255,255,0.5);
                    border: 1px solid rgba(139,69,19,0.4);
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }

                .subspecies-card:hover {
                    background: rgba(255,215,0,0.1);
                    border-color: #8b4513;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.12);
                }

                .subspecies-name {
                    font-family: 'Cinzel', serif;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #2c1810;
                    margin: 0 0 0.2rem 0;
                }

                .subspecies-hint {
                    font-family: 'Crimson Text', serif;
                    font-size: 0.85rem;
                    color: #a07850;
                    font-style: italic;
                }
            </style>
            <div id="browser-root"></div>
        `;
    }

    async loadSpecies() {
        const root = this.shadowRoot.getElementById('browser-root');
        root.innerHTML = `<div class="loading"><div class="spinner"></div>Chargement des espèces...</div>`;

        try {
            const data = await dndAPI.getSpeciesList();
            this.speciesList = data.results;
            this.renderSpeciesGrid();
        } catch {
            root.innerHTML = `<div class="loading">Erreur de chargement. Veuillez réessayer.</div>`;
        }
    }

    renderSpeciesGrid() {
        const root = this.shadowRoot.getElementById('browser-root');
        const grid = document.createElement('div');
        grid.className = 'species-grid';

        this.speciesList.forEach(sp => {
            const btn = document.createElement('button');
            btn.className = 'species-btn' + (this.selectedSpecies === sp.index ? ' active' : '');
            btn.dataset.index = sp.index;
            btn.innerHTML = `
                <span class="species-icon">${SPECIES_ICONS[sp.index] || '🎲'}</span>
                <span class="species-name">${SPECIES_FR[sp.index] || sp.name}</span>
            `;
            btn.addEventListener('click', () => this.selectSpecies(sp.index));
            grid.appendChild(btn);
        });

        root.innerHTML = '';
        root.appendChild(grid);

        if (this.selectedSpecies && this.speciesData) {
            root.appendChild(this.buildDetailPanel());
        }
    }

    async selectSpecies(index) {
        if (this.selectedSpecies === index) return;

        this.selectedSpecies = index;
        this.speciesData = null;
        this.traitsData = [];

        this.shadowRoot.querySelectorAll('.species-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.index === index);
        });

        const root = this.shadowRoot.getElementById('browser-root');
        const detailEl = root.querySelector('.species-detail');
        if (detailEl) detailEl.remove();

        const loading = document.createElement('div');
        loading.className = 'loading';
        loading.innerHTML = `<div class="spinner"></div>Chargement de ${SPECIES_FR[index] || index}...`;
        root.appendChild(loading);

        // Préchargement de l'image en parallèle des appels API
        const imgSrc = SPECIES_IMAGE[index];
        if (imgSrc) {
            const preload = new Image();
            preload.src = imgSrc;
        }

        try {
            this.speciesData = await dndAPI.getSpeciesDetails(index);
        } catch {
            loading.innerHTML = 'Erreur de chargement.';
            return;
        }

        // Fetch traits séquentiellement (évite le rate-limit 429)
        this.traitsData = [];
        for (const trait of (this.speciesData.traits || [])) {
            try {
                const data = await dndAPI.getTraitDetails(trait.index);
                this.traitsData.push(data);
            } catch {
                this.traitsData.push({ index: trait.index, name: trait.name, desc: [] });
            }
        }

        loading.remove();
        const detail = this.buildDetailPanel();
        root.appendChild(detail);

        requestAnimationFrame(() => {
            detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    buildDetailPanel() {
        const sp = this.speciesData;
        const nameFR = SPECIES_FR[sp.index] || sp.name;
        const icon = SPECIES_ICONS[sp.index] || '🎲';
        const speedM = Math.round((sp.speed || 30) * 0.3);
        const sizeFR = SIZE_FR[sp.size] || sp.size || '—';

        const detail = document.createElement('div');
        detail.className = 'species-detail';

        // Badges : vitesse, taille
        const badgesHTML = `
            <div class="info-badges">
                <span class="badge">🏃 <strong>Vitesse :</strong>&nbsp;${sp.speed} pi (${speedM} m)</span>
                <span class="badge">📏 <strong>Taille :</strong>&nbsp;${sizeFR}</span>
                ${(sp.ability_bonuses || []).map(ab => {
                    const abbr = ab.ability_score?.index?.toUpperCase() || '';
                    const nameFR = ABILITY_FR[abbr] || ab.ability_score?.name || abbr;
                    return `<span class="badge bonus">+${ab.bonus} ${nameFR}</span>`;
                }).join('')}
            </div>
        `;

        // Traits
        const traitsHTML = this.traitsData.length ? `
            <h3 class="section-title">Traits caractéristiques</h3>
            <div class="trait-list">
                ${this.traitsData.map(t => `
                    <div class="trait-item">
                        <div class="trait-name">${t.name}</div>
                        ${t.desc && t.desc.length
                            ? `<div class="trait-desc">${t.desc.join(' ')}</div>`
                            : ''}
                    </div>
                `).join('')}
            </div>
        ` : '';

        // Langues
        const langs = sp.languages || [];
        const langsHTML = langs.length ? `
            <h3 class="section-title">Langues</h3>
            <div class="tag-list">
                ${langs.map(l => `<span class="lang-tag">${l.name}</span>`).join('')}
            </div>
            ${sp.language_desc ? `<p class="lore-text">${sp.language_desc}</p>` : ''}
        ` : '';

        // Lore
        const loreHTML = `
            ${sp.age ? `<h3 class="section-title">Âge</h3><p class="lore-text">${sp.age}</p>` : ''}
            ${sp.alignment ? `<h3 class="section-title">Alignement</h3><p class="lore-text">${sp.alignment}</p>` : ''}
            ${sp.size_description ? `<h3 class="section-title">Corpulence</h3><p class="lore-text">${sp.size_description}</p>` : ''}
        `;

        // Sous-espèces
        const subraces = sp.subraces || [];
        const subspeciesHTML = subraces.length ? `
            <h3 class="section-title">Sous-espèces</h3>
            <div class="subspecies-grid">
                ${subraces.map(sub => `
                    <div class="subspecies-card" data-index="${sub.index}">
                        <div class="subspecies-name">${sub.name}</div>
                        <div class="subspecies-hint">Voir les détails →</div>
                    </div>
                `).join('')}
            </div>
        ` : '';

        const imgSrc = SPECIES_IMAGE[sp.index];
        const bannerHTML = imgSrc
            ? `<div class="species-banner-wrap">
                <img src="${imgSrc}" alt="${nameFR}" onerror="this.closest('.species-banner-wrap').style.display='none'">
               </div>`
            : '';

        detail.innerHTML = `
            ${bannerHTML}
            <div class="species-detail-header">
                <span class="species-detail-icon">${icon}</span>
                <div>
                    <h2 class="species-detail-title">${nameFR}</h2>
                    <div class="species-detail-subtitle">${sp.name}</div>
                </div>
            </div>
            ${badgesHTML}
            ${traitsHTML}
            ${langsHTML}
            ${loreHTML}
            ${subspeciesHTML}
        `;

        // Listeners sous-espèces (après insertion dans le DOM)
        setTimeout(() => {
            detail.querySelectorAll('.subspecies-card').forEach(card => {
                card.addEventListener('click', () => {
                    this.openSubspecies(card.dataset.index);
                });
            });
        }, 0);

        return detail;
    }

    async openSubspecies(index) {
        let data;
        try {
            data = await dndAPI.getSubspeciesDetails(index);
        } catch {
            return;
        }
        this.dispatchEvent(new CustomEvent('species-subspecies-details', {
            detail: { data },
            bubbles: true,
        }));
    }
}

customElements.define('species-browser', SpeciesBrowser);
