import { dndAPI } from '../api.js';

const CLASS_FR = {
    barbarian: 'Barbare',
    bard: 'Barde',
    cleric: 'Clerc',
    druid: 'Druide',
    fighter: 'Guerrier',
    monk: 'Moine',
    paladin: 'Paladin',
    ranger: 'Rôdeur',
    rogue: 'Roublard',
    sorcerer: 'Ensorceleur',
    warlock: 'Occultiste',
    wizard: 'Magicien',
};

const CLASS_ICONS = {
    barbarian: '🪓',
    bard: '🎵',
    cleric: '✝️',
    druid: '🌿',
    fighter: '🛡️',
    monk: '👊',
    paladin: '⚔️',
    ranger: '🏹',
    rogue: '🗡️',
    sorcerer: '✨',
    warlock: '👁️',
    wizard: '📚',
};

const CLASS_BANNER = {
    barbarian: 'rage_(barbarian).webp',
    bard:      'bardic_inspiration_(d6)_(bard).webp',
    cleric:    'divine_intervention_(cleric).webp',
    druid:     'archdruid_(druid).webp',
    fighter:   'action_surge_(1_use)_(fighter).webp',
    monk:      'ki_(monk).webp',
    paladin:   'divine_smite_(paladin).webp',
    ranger:    'favored_enemy_(1_type)_(ranger).webp',
    rogue:     'sneak_attack_(rogue).webp',
    sorcerer:  'font_of_magic_(sorcerer).webp',
    warlock:   'pact_magic_(warlock).webp',
    wizard:    'spellcasting__wizard_(wizard).webp',
};

const ABILITY_FR = {
    STR: 'Force',
    DEX: 'Dextérité',
    CON: 'Constitution',
    INT: 'Intelligence',
    WIS: 'Sagesse',
    CHA: 'Charisme',
};

class ClassBrowser extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.classes = [];
        this.selectedClass = null;
        this.classData = null;
        this.classLevels = null;
        this.subclassesData = []; // {slug, name, desc, source, subtypeName}
    }

    connectedCallback() {
        this.renderShell();
        this.loadClasses();
    }

    renderShell() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                /* ─── Grille de sélection ─── */
                .class-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                    gap: 0.75rem;
                    margin-bottom: 2rem;
                }

                .class-btn {
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

                .class-btn:hover {
                    background: linear-gradient(135deg, #fdf0d5 0%, #f4e4c1 100%);
                    border-color: #ffd700;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.25);
                    color: #5c2a00;
                }

                .class-btn.active {
                    background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
                    border-color: #ffd700;
                    color: #f4e4c1;
                    box-shadow: 0 0 12px rgba(255,215,0,0.35);
                }

                .class-icon {
                    font-size: 1.8rem;
                    line-height: 1;
                }

                .class-name {
                    text-align: center;
                    line-height: 1.2;
                    font-weight: 600;
                }

                /* ─── Loading & erreur ─── */
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

                /* ─── Bannière classe ─── */
                .class-banner-wrap {
                    margin: -1.5rem -1.5rem 1.5rem;
                    border-radius: 6px 6px 0 0;
                    overflow: hidden;
                }

                .class-banner-wrap img {
                    width: 100%;
                    height: auto;
                    display: block;
                }

                /* ─── Détail classe ─── */
                .class-detail {
                    background: linear-gradient(135deg, #f4e4c1 0%, #e8d4a8 100%);
                    border: 2px solid #8b4513;
                    border-radius: 8px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
                    animation: fadeIn 0.3s ease;
                    /* Espace pour le header sticky lors du scrollIntoView */
                    scroll-margin-top: 90px;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .class-detail-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #8b4513;
                }

                .class-detail-icon {
                    font-size: 3rem;
                    line-height: 1;
                }

                .class-detail-title {
                    font-family: 'Cinzel', serif;
                    font-size: 1.8rem;
                    font-weight: 600;
                    color: #2c1810;
                    margin: 0 0 0.25rem 0;
                }

                .class-detail-subtitle {
                    font-family: 'Crimson Text', serif;
                    font-size: 1rem;
                    color: #654321;
                }

                /* ─── Badges info ─── */
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

                /* ─── Section maîtrises ─── */
                .section-title {
                    font-family: 'Cinzel', serif;
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #2c1810;
                    margin: 1.25rem 0 0.6rem 0;
                    padding-bottom: 0.3rem;
                    border-bottom: 1px solid rgba(139,69,19,0.3);
                }

                .proficiency-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.4rem;
                    margin-bottom: 0.5rem;
                }

                .prof-tag {
                    padding: 0.2rem 0.6rem;
                    background: rgba(139,69,19,0.08);
                    border: 1px solid rgba(139,69,19,0.35);
                    border-radius: 4px;
                    font-family: 'Crimson Text', serif;
                    font-size: 0.9rem;
                    color: #4a2800;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .prof-tag:hover {
                    background: rgba(139,69,19,0.18);
                    border-color: #8b4513;
                    color: #2c1810;
                }

                /* ─── Table de progression ─── */
                .table-wrapper {
                    overflow-x: auto;
                    margin-bottom: 0.5rem;
                    border-radius: 4px;
                    border: 1px solid rgba(139,69,19,0.4);
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-family: 'Crimson Text', serif;
                    font-size: 0.95rem;
                    background: rgba(255,255,255,0.5);
                }

                th {
                    background: rgba(139,69,19,0.15);
                    color: #2c1810;
                    font-family: 'Cinzel', serif;
                    font-size: 0.8rem;
                    font-weight: 600;
                    padding: 0.6rem 0.75rem;
                    text-align: left;
                    white-space: nowrap;
                    border-bottom: 2px solid rgba(139,69,19,0.4);
                }

                td {
                    padding: 0.45rem 0.75rem;
                    border-bottom: 1px solid rgba(139,69,19,0.15);
                    color: #2c1810;
                    vertical-align: top;
                }

                tr:hover td {
                    background: rgba(255,215,0,0.06);
                }

                .level-num {
                    font-weight: 600;
                    white-space: nowrap;
                }

                .prof-bonus {
                    white-space: nowrap;
                }

                .feature-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.3rem;
                }

                .feature-btn {
                    background: none;
                    border: 1px solid rgba(139,69,19,0.5);
                    border-radius: 4px;
                    padding: 0.15rem 0.5rem;
                    font-family: 'Crimson Text', serif;
                    font-size: 0.9rem;
                    color: #5c2a00;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                }

                .feature-btn:hover {
                    background: rgba(139,69,19,0.12);
                    border-color: #8b4513;
                    color: #2c1810;
                }

                .empty-features {
                    color: #a07850;
                    font-style: italic;
                    font-size: 0.85rem;
                }

                /* ─── Sous-classes ─── */
                .subclass-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
                    gap: 0.75rem;
                }

                .subclass-card {
                    padding: 1rem;
                    background: rgba(255,255,255,0.5);
                    border: 1px solid rgba(139,69,19,0.4);
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }

                .subclass-card:hover {
                    background: rgba(255,215,0,0.1);
                    border-color: #8b4513;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.12);
                }

                .subclass-name {
                    font-family: 'Cinzel', serif;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #2c1810;
                    margin: 0 0 0.3rem 0;
                }

                .subclass-source {
                    font-family: 'Crimson Text', serif;
                    font-size: 0.8rem;
                    color: #a07850;
                    font-style: italic;
                }
            </style>
            <div id="browser-root"></div>
        `;
    }

    async loadClasses() {
        const root = this.shadowRoot.getElementById('browser-root');
        root.innerHTML = `<div class="loading"><div class="spinner"></div>Chargement des classes...</div>`;

        try {
            const data = await dndAPI.getClassesList();
            this.classes = data.results;
            this.renderClassGrid();
        } catch {
            root.innerHTML = `<div class="loading">Erreur de chargement. Veuillez réessayer.</div>`;
        }
    }

    renderClassGrid() {
        const root = this.shadowRoot.getElementById('browser-root');
        const grid = document.createElement('div');
        grid.className = 'class-grid';

        this.classes.forEach(cls => {
            const btn = document.createElement('button');
            btn.className = 'class-btn' + (this.selectedClass === cls.index ? ' active' : '');
            btn.dataset.index = cls.index;
            btn.innerHTML = `
                <span class="class-icon">${CLASS_ICONS[cls.index] || '🎲'}</span>
                <span class="class-name">${CLASS_FR[cls.index] || cls.name}</span>
            `;
            btn.addEventListener('click', () => this.selectClass(cls.index));
            grid.appendChild(btn);
        });

        root.innerHTML = '';
        root.appendChild(grid);

        if (this.selectedClass && this.classData && this.classLevels) {
            root.appendChild(this.buildDetailPanel());
        }
    }

    async selectClass(index) {
        if (this.selectedClass === index) return;

        this.selectedClass = index;
        this.classData = null;
        this.classLevels = null;
        this.subclassesData = [];

        this.shadowRoot.querySelectorAll('.class-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.index === index);
        });

        const root = this.shadowRoot.getElementById('browser-root');
        const detailEl = root.querySelector('.class-detail');
        if (detailEl) detailEl.remove();

        const loading = document.createElement('div');
        loading.className = 'loading';
        loading.innerHTML = `<div class="spinner"></div>Chargement de ${CLASS_FR[index] || index}...`;
        root.appendChild(loading);

        // Préchargement de la bannière en parallèle des appels API
        const bannerFile = CLASS_BANNER[index];
        if (bannerFile) {
            const preload = new Image();
            preload.src = `./assets/images/feature/${index}/${bannerFile}`;
        }

        // dnd5eapi : appels séquentiels pour éviter le rate-limit (429)
        // Open5e : en parallèle (serveur différent, non-bloquant)
        let classData, classLevels;
        try {
            classData = await dndAPI.getClassDetails(index);
            classLevels = await dndAPI.getClassLevels(index);
        } catch {
            loading.innerHTML = 'Erreur de chargement.';
            return;
        }
        this.classData = classData;
        this.classLevels = classLevels;

        const open5eResult = await Promise.allSettled([dndAPI.getOpen5eClass(index)]);
        const open5eData = open5eResult[0].status === 'fulfilled' ? open5eResult[0].value : null;
        if (open5eData && open5eData.archetypes && open5eData.archetypes.length > 0) {
            this.subclassesData = open5eData.archetypes.map(a => ({
                slug: a.slug,
                name: a.name,
                desc: a.desc,
                source: a.document__title || null,
                subtypeName: open5eData.subtypes_name || 'Sous-classes',
            }));
        } else {
            // Fallback : sous-classes dnd5eapi (sans desc, fetch au clic)
            this.subclassesData = (this.classData.subclasses || []).map(s => ({
                slug: s.index,
                name: s.name,
                desc: null,
                source: null,
                subtypeName: 'Sous-classes',
            }));
        }

        loading.remove();
        const detail = this.buildDetailPanel();
        root.appendChild(detail);

        // Sur mobile : faire défiler jusqu'à la fiche (après le rendu)
        requestAnimationFrame(() => {
            detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        // Préchargement silencieux des capacités → cache chaud avant le premier clic
        this.prefetchFeatures(this.classLevels);
    }

    prefetchFeatures(levels) {
        const seen = new Set();
        const indices = [];
        for (const lvl of levels) {
            for (const f of lvl.features || []) {
                if (!seen.has(f.index)) {
                    seen.add(f.index);
                    indices.push(f.index);
                }
            }
        }
        // Fetch séquentiel espacé de 250 ms pour ne pas déclencher le rate-limit
        let delay = 300;
        for (const index of indices) {
            setTimeout(() => dndAPI.getFeatureDetails(index).catch(() => {}), delay);
            delay += 250;
        }
    }

    buildDetailPanel() {
        const cls = this.classData;
        const levels = this.classLevels;
        const nameFR = CLASS_FR[cls.index] || cls.name;
        const icon = CLASS_ICONS[cls.index] || '🎲';

        const detail = document.createElement('div');
        detail.className = 'class-detail';

        const savingThrowsFR = (cls.saving_throws || [])
            .map(st => ABILITY_FR[st.index.toUpperCase()] || st.name)
            .join(', ');

        const bannerFile = CLASS_BANNER[cls.index];
        const bannerHTML = bannerFile
            ? `<div class="class-banner-wrap">
                <img src="./assets/images/feature/${cls.index}/${bannerFile}" alt="${nameFR}" onerror="this.closest('.class-banner-wrap').style.display='none'">
               </div>`
            : '';

        detail.innerHTML = `
            ${bannerHTML}
            <div class="class-detail-header">
                <span class="class-detail-icon">${icon}</span>
                <div>
                    <h2 class="class-detail-title">${nameFR}</h2>
                    <div class="class-detail-subtitle">${cls.name}</div>
                </div>
            </div>

            <div class="info-badges">
                <span class="badge">🎲 <strong>Dé de vie :</strong>&nbsp;d${cls.hit_die}</span>
                <span class="badge">🛡️ <strong>JS :</strong>&nbsp;${savingThrowsFR || '—'}</span>
            </div>

            ${this.buildProficienciesSection(cls)}
            ${this.buildLevelTable(levels)}
            ${this.buildSubclassesSection()}
        `;

        setTimeout(() => {
            this.shadowRoot.querySelectorAll('.prof-tag').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.dispatchEvent(new CustomEvent('class-proficiency-details', {
                        detail: { index: btn.dataset.prof },
                        bubbles: true,
                    }));
                });
            });
        }, 0);

        return detail;
    }

    buildProficienciesSection(cls) {
        const profs = cls.proficiencies || [];
        if (!profs.length) return '';

        const armors = profs.filter(p => /armor|shield/i.test(p.name));
        const weapons = profs.filter(p => /weapon|sword|axe|bow|crossbow|dagger|mace|staff|warhammer|handaxe|lance|maul|pike|rapier|scimitar|shortsword|spear|trident|whip|club|greatclub|quarterstaff|sling|dart|javelin|flail|glaive|halberd|longbow|shortbow|net|blowgun/i.test(p.name) && !/armor/i.test(p.name));
        const tools = profs.filter(p => !armors.includes(p) && !weapons.includes(p));

        const tag = p => `<button class="prof-tag" data-prof="${p.index}">${p.name}</button>`;
        let html = `<h3 class="section-title">Maîtrises</h3>`;
        if (armors.length) html += `<div class="proficiency-list">${armors.map(tag).join('')}</div>`;
        if (weapons.length) html += `<div class="proficiency-list">${weapons.map(tag).join('')}</div>`;
        if (tools.length) html += `<div class="proficiency-list">${tools.map(tag).join('')}</div>`;
        return html;
    }

    buildLevelTable(levels) {
        const rows = levels.map(lvl => {
            const featuresHtml = lvl.features && lvl.features.length
                ? lvl.features.map(f => `<button class="feature-btn" data-feature="${f.index}">${f.name}</button>`).join('')
                : `<span class="empty-features">—</span>`;

            return `
                <tr>
                    <td class="level-num">${lvl.level}</td>
                    <td class="prof-bonus">+${lvl.prof_bonus}</td>
                    <td><div class="feature-list">${featuresHtml}</div></td>
                </tr>
            `;
        }).join('');

        const html = `
            <h3 class="section-title">Progression (niveaux 1–20)</h3>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Niv.</th>
                            <th>Bonus maîtrise</th>
                            <th>Capacités</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;

        setTimeout(() => {
            this.shadowRoot.querySelectorAll('.feature-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.dispatchEvent(new CustomEvent('class-feature-details', {
                        detail: { index: btn.dataset.feature },
                        bubbles: true,
                    }));
                });
            });
        }, 0);

        return html;
    }

    buildSubclassesSection() {
        const subclasses = this.subclassesData;
        if (!subclasses.length) return '';

        const subtypeName = subclasses[0]?.subtypeName || 'Sous-classes';
        const sourceLabel = subclasses.some(s => s.source) ? ` (via Open5e)` : '';

        const cards = subclasses.map((sc, i) => `
            <div class="subclass-card" data-idx="${i}" role="button" tabindex="0">
                <div class="subclass-name">${sc.name}</div>
                ${sc.source ? `<div class="subclass-source">${sc.source}</div>` : ''}
            </div>
        `).join('');

        const html = `
            <h3 class="section-title">${subtypeName}${sourceLabel}</h3>
            <div class="subclass-grid">${cards}</div>
        `;

        setTimeout(() => {
            this.shadowRoot.querySelectorAll('.subclass-card').forEach(card => {
                const dispatch = () => {
                    const sc = this.subclassesData[parseInt(card.dataset.idx)];
                    this.dispatchEvent(new CustomEvent('class-subclass-details', {
                        detail: {
                            index: sc.slug,
                            // Si desc disponible (Open5e), on l'embarque → pas de fetch au clic
                            data: sc.desc != null ? sc : null,
                        },
                        bubbles: true,
                    }));
                };
                card.addEventListener('click', dispatch);
                card.addEventListener('keypress', e => { if (e.key === 'Enter' || e.key === ' ') dispatch(); });
            });
        }, 0);

        return html;
    }
}

customElements.define('class-browser', ClassBrowser);
