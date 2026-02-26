import './components/header.js';
import './components/equipment-search.js';
import './components/equipment-card.js';
import './components/dice-roller.js';
import './components/spells-search.js';
import './components/spell-card.js';
import './components/class-browser.js';
import './components/species-browser.js';
import './components/dice-modal.js';
import { APP_VERSION } from './version.js';

class DnDApp {
    static CURRENCY_FR = {
        cp: { abbr: 'pc', name: 'cuivre', color: '#b87333' },
        sp: { abbr: 'pa', name: 'argent', color: '#c0c0c0' },
        ep: { abbr: 'pe', name: 'électrum', color: '#50c878' },
        gp: { abbr: 'po', name: 'or', color: '#ffd700' },
        pp: { abbr: 'pp', name: 'platine', color: '#e5e4e2' }
    };

    constructor() {
        this.currentPage = 'equipment';
        this.header = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupRouting();
        this.loadInitialPage();
        this.registerServiceWorker();
        this.setupPWAInstall();
        this.displayVersion();
        this.setupScrollToTop();
    }

    setupScrollToTop() {
        const btn = document.getElementById('scroll-top-btn');
        if (!btn) return;

        window.addEventListener('scroll', () => {
            btn.classList.toggle('visible', window.scrollY > 300);
        }, { passive: true });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    displayVersion() {
        const footerP = document.querySelector('footer p');
        if (footerP) {
            footerP.innerHTML =
                `&copy; ${new Date().getFullYear()} Assistant D&amp;D MJ - Créé avec les API D&amp;D5E ` +
                `<span class="app-version">v${APP_VERSION}</span>`;
        }
    }

    setupEventListeners() {
        document.addEventListener('navigation', (e) => {
            this.handleNavigation(e.detail.page);
        });

        document.addEventListener('search-results', (e) => {
            this.displaySearchResults(e.detail.results);
        });

        document.addEventListener('favorite-toggled', (e) => {
            this.handleFavoriteToggle(e.detail);
        });

        document.addEventListener('show-details', (e) => {
            this.showEquipmentDetails(e.detail.index);
        });

        document.addEventListener('spells-search-results', (e) => {
            this.displaySpellResults(e.detail.results);
        });

        document.addEventListener('spell-show-details', (e) => {
            this.showSpellDetails(e.detail.index);
        });

        document.addEventListener('class-feature-details', (e) => {
            this.showClassFeature(e.detail.index);
        });

        document.addEventListener('class-proficiency-details', (e) => {
            this.showClassProficiency(e.detail.index);
        });

        document.addEventListener('species-subspecies-details', (e) => {
            this.showSubspeciesModal(e.detail.data);
        });

        document.addEventListener('class-subclass-details', (e) => {
            if (e.detail.data) {
                // Open5e : toutes les données déjà embarquées dans l'événement
                this.showClassSubclassModal(e.detail.data);
            } else {
                // Fallback dnd5eapi : fetch par index
                this.showClassSubclass(e.detail.index);
            }
        });
    }

    setupRouting() {
        window.addEventListener('hashchange', () => {
            this.handleHashChange();
        });

        window.addEventListener('popstate', () => {
            this.handleHashChange();
        });
    }

    handleHashChange() {
        const hash = window.location.hash.slice(1) || 'equipment';
        this.handleNavigation(hash);
    }

    loadInitialPage() {
        const hash = window.location.hash.slice(1) || 'equipment';
        this.handleNavigation(hash);
    }

    handleNavigation(page) {
        if (this.currentPage === page) return;

        this.hideAllPages();
        this.showPage(page);
        this.updateHeader(page);
        this.currentPage = page;

        if (page === 'favorites') {
            this.loadFavorites();
        }
    }

    hideAllPages() {
        const pages = document.querySelectorAll('.page-section');
        pages.forEach(page => {
            page.classList.add('hidden');
        });
    }

    showPage(page) {
        const pageElement = document.getElementById(`${page}-section`);
        if (pageElement) {
            pageElement.classList.remove('hidden');
            pageElement.classList.add('fade-in');
        }
    }

    updateHeader(page) {
        const header = document.querySelector('dnd-header');
        if (header) {
            header.setActivePage(page);
        }
    }

    async displaySearchResults(results) {
        const resultsContainer = document.getElementById('equipment-results');
        
        if (!results || results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <div class="empty-state-title">Aucun résultat trouvé</div>
                    <div class="empty-state-text">
                        Essayez de modifier votre recherche ou vos filtres pour trouver d'autres équipements.
                    </div>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = '';
        resultsContainer.classList.add('fade-in');

        results.forEach(equipment => {
            const card = document.createElement('equipment-card');
            card.setAttribute('equipment-data', JSON.stringify(equipment));
            resultsContainer.appendChild(card);
        });
    }

    async loadFavorites() {
        const favoritesContainer = document.getElementById('favorites-results');
        const { storageManager } = await import('./utils/storage.js');
        const equipmentFavorites = storageManager.getFavorites();
        const spellFavorites = storageManager.getSpellFavorites();

        if (equipmentFavorites.length === 0 && spellFavorites.length === 0) {
            favoritesContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⭐</div>
                    <div class="empty-state-title">Aucun favori</div>
                    <div class="empty-state-text">
                        Ajoutez des équipements ou des sorts à vos favoris pour les retrouver facilement ici.
                    </div>
                </div>
            `;
            return;
        }

        favoritesContainer.innerHTML = '<div class="loading">Chargement des favoris...</div>';

        try {
            const { dndAPI } = await import('./api.js');
            favoritesContainer.innerHTML = '';
            favoritesContainer.classList.add('fade-in');

            if (equipmentFavorites.length > 0) {
                const heading = document.createElement('h2');
                heading.className = 'page-title';
                heading.style.cssText = 'font-size: 1.3rem; margin: 0 0 1rem 0; grid-column: 1/-1;';
                heading.textContent = 'Équipement favori';
                favoritesContainer.appendChild(heading);

                const equipmentDetails = await Promise.all(
                    equipmentFavorites.map(index => dndAPI.getEquipmentDetails(index))
                );
                equipmentDetails.forEach(equipment => {
                    const card = document.createElement('equipment-card');
                    card.setAttribute('equipment-data', JSON.stringify(equipment));
                    favoritesContainer.appendChild(card);
                });
            }

            if (spellFavorites.length > 0) {
                const heading = document.createElement('h2');
                heading.className = 'page-title';
                heading.style.cssText = 'font-size: 1.3rem; margin: 2rem 0 1rem 0; grid-column: 1/-1;';
                heading.textContent = 'Sorts favoris';
                favoritesContainer.appendChild(heading);

                const spellDetails = await Promise.all(
                    spellFavorites.map(index => dndAPI.getSpellDetails(index))
                );
                spellDetails.forEach(spell => {
                    const card = document.createElement('spell-card');
                    card.setAttribute('spell-data', JSON.stringify(spell));
                    favoritesContainer.appendChild(card);
                });
            }
        } catch (error) {
            console.error('Failed to load favorites:', error);
            favoritesContainer.innerHTML = `
                <div class="error-state">
                    <div class="error-state-title">Erreur de chargement</div>
                    <div class="error-state-text">
                        Impossible de charger vos favoris. Veuillez réessayer.
                    </div>
                </div>
            `;
        }
    }

    handleFavoriteToggle(detail) {
        if (this.currentPage === 'favorites') {
            setTimeout(() => this.loadFavorites(), 100);
        }

        this.showNotification(
            detail.isFavorited ? 'Ajouté aux favoris' : 'Retiré des favoris',
            'success'
        );
    }

    async displaySpellResults(results) {
        const resultsContainer = document.getElementById('spells-results');

        if (!results || results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">✨</div>
                    <div class="empty-state-title">Aucun sort trouvé</div>
                    <div class="empty-state-text">
                        Essayez de modifier votre recherche ou votre filtre de niveau.
                    </div>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = '';
        resultsContainer.classList.add('fade-in');

        results.forEach(spell => {
            const card = document.createElement('spell-card');
            card.setAttribute('spell-data', JSON.stringify(spell));
            resultsContainer.appendChild(card);
        });
    }

    async showSpellDetails(index) {
        try {
            const { dndAPI } = await import('./api.js');
            const spell = await dndAPI.getSpellDetails(index);
            this.showSpellModal(spell);
        } catch (error) {
            console.error('Failed to load spell details:', error);
            this.showNotification('Erreur lors du chargement des détails', 'error');
        }
    }

    showSpellModal(spell) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay fade-in';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content scale-in';

        const school = spell.school ? spell.school.name.toLowerCase() : '';
        const imageIndex = spell.index.replace(/-/g, '_');
        const imagePath = `./assets/images/spell/${school}/${imageIndex}.webp`;

        modalContent.innerHTML = `
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            <img
                src="${imagePath}"
                alt="${spell.name}"
                class="spell-modal-image"
                onerror="this.style.display='none'"
            >
            <h2>${spell.name}</h2>
            <div class="equipment-details">
                ${this.formatSpellDetails(spell)}
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    formatSpellRange(range) {
        if (!range) return 'N/A';
        return range.replace(/(\d+)\s*-?\s*(?:foot|feet)/gi, (_match, feet) => {
            const m = (parseInt(feet) * 0.3048).toFixed(1);
            return `${feet} ft (${m} m)`;
        });
    }

    parseMarkdown(text) {
        return text
            .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/_(.+?)_/g, '<em>$1</em>');
    }

    formatSpellDetails(spell) {
        const COMPONENTS_FR = { V: 'Verbale', S: 'Somatique', M: 'Matérielle' };
        let html = '<div class="details-grid">';

        const levelLabel = spell.level === 0 ? 'Sort mineur' : `Niveau ${spell.level}`;
        html += `<div class="detail-section"><h3>École & Niveau</h3><p>${levelLabel} — ${spell.school ? spell.school.name : 'N/A'}</p></div>`;

        if (spell.desc && spell.desc.length > 0) {
            html += '<div class="detail-section"><h3>Description</h3>';
            spell.desc.forEach(paragraph => { html += `<p>${this.parseMarkdown(paragraph)}</p>`; });
            html += '</div>';
        }

        html += `
            <div class="detail-section"><h3>Temps d'incantation</h3><p>${spell.casting_time || 'N/A'}</p></div>
            <div class="detail-section"><h3>Portée</h3><p>${this.formatSpellRange(spell.range)}</p></div>
            <div class="detail-section"><h3>Durée</h3><p>${spell.duration || 'N/A'}</p></div>
        `;

        const components = (spell.components || []).map(c => COMPONENTS_FR[c] || c).join(', ');
        const material = spell.material ? ` (${spell.material})` : '';
        html += `<div class="detail-section"><h3>Composantes</h3><p>${components}${material}</p></div>`;

        html += `
            <div class="detail-section"><h3>Concentration</h3><p>${spell.concentration ? 'Oui' : 'Non'}</p></div>
            <div class="detail-section"><h3>Rituel</h3><p>${spell.ritual ? 'Oui' : 'Non'}</p></div>
        `;

        if (spell.classes && spell.classes.length > 0) {
            html += `
                <div class="detail-section"><h3>Classes</h3>
                <div class="properties-list">
                    ${spell.classes.map(c => `<span class="property-tag">${c.name}</span>`).join('')}
                </div></div>
            `;
        }

        if (spell.higher_level && spell.higher_level.length > 0) {
            html += '<div class="detail-section"><h3>Niveaux supérieurs</h3>';
            spell.higher_level.forEach(paragraph => { html += `<p>${this.parseMarkdown(paragraph)}</p>`; });
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    async showClassProficiency(index) {
        try {
            const { dndAPI } = await import('./api.js');
            const prof = await dndAPI.getProficiencyDetails(index);
            this.showClassProficiencyModal(prof);
        } catch (error) {
            console.error('Failed to load proficiency details:', error);
            this.showNotification('Erreur lors du chargement de la maîtrise', 'error');
        }
    }

    showClassProficiencyModal(prof) {
        const TYPE_FR = {
            'Armor':          'Armures',
            'Weapons':        'Armes',
            'Artisan\'s Tools': 'Outils d\'artisan',
            'Tools':          'Outils',
            'Saving Throws':  'Jets de sauvegarde',
            'Skills':         'Compétences',
            'Gaming Sets':    'Jeux',
            'Musical Instruments': 'Instruments de musique',
            'Other':          'Autre',
        };

        const modal = document.createElement('div');
        modal.className = 'modal-overlay fade-in';
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content scale-in';

        const typeFR = TYPE_FR[prof.type] || prof.type || '—';
        const classes = (prof.classes || []).map(c => `<span class="property-tag">${c.name}</span>`).join('');
        const reference = prof.reference
            ? `<div class="detail-section"><h3>Référence</h3><p>${prof.reference.name}</p></div>`
            : '';

        const TYPES_WITH_IMAGE = new Set(['Armor', 'Weapons', 'Tools', "Artisan's Tools", 'Gaming Sets', 'Musical Instruments']);
        const imgSlug = TYPES_WITH_IMAGE.has(prof.type)
            ? prof.name.toLowerCase().replace(/ /g, '_')
            : null;
        const imgPath = imgSlug ? `./assets/images/proficiencies/${imgSlug}.webp` : null;

        modalContent.innerHTML = `
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            ${imgPath ? `<img src="${imgPath}" alt="${prof.name}" class="spell-modal-image" onerror="this.style.display='none'">` : ''}
            <h2>${prof.name}</h2>
            <div class="equipment-details">
                <div class="details-grid">
                    <div class="detail-section"><h3>Type</h3><p>${typeFR}</p></div>
                    ${reference}
                    ${classes ? `<div class="detail-section"><h3>Classes</h3><div class="properties-list">${classes}</div></div>` : ''}
                </div>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    }

    async showClassFeature(index) {
        try {
            const { dndAPI } = await import('./api.js');
            const feature = await dndAPI.getFeatureDetails(index);
            this.showClassFeatureModal(feature);
        } catch (error) {
            console.error('Failed to load feature details:', error);
            this.showNotification('Erreur lors du chargement de la capacité', 'error');
        }
    }

    getFeatureImagePath(featureName, classIndex) {
        const slug = featureName.toLowerCase().replace(/:/g, '_').replace(/\//g, '_').replace(/ /g, '_');
        return `./assets/images/feature/${classIndex}/${slug}_(${classIndex}).webp`;
    }

    showClassFeatureModal(feature) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay fade-in';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content scale-in';

        const levelLabel = feature.level ? `Niveau ${feature.level}` : '';
        const classIndex = feature.class ? feature.class.index : '';
        const className = feature.class ? feature.class.name : '';
        const subtitle = [className, levelLabel].filter(Boolean).join(' — ');

        const descHtml = (feature.desc || [])
            .map(p => `<p>${this.parseMarkdown(p)}</p>`)
            .join('');

        const imagePath = classIndex ? this.getFeatureImagePath(feature.name, classIndex) : null;
        const imageHTML = imagePath
            ? `<img src="${imagePath}" alt="${feature.name}" class="spell-modal-image" onerror="this.style.display='none'">`
            : '';

        modalContent.innerHTML = `
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            ${imageHTML}
            <h2>${feature.name}</h2>
            ${subtitle ? `<p style="font-family:'Crimson Text',serif;color:#654321;margin:0 0 1rem 0;font-style:italic;">${subtitle}</p>` : ''}
            <div class="equipment-details">
                <div class="details-grid">
                    <div class="detail-section">${descHtml || '<p>Aucune description disponible.</p>'}</div>
                </div>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    }

    async showClassSubclass(index) {
        try {
            const { dndAPI } = await import('./api.js');
            const subclass = await dndAPI.getSubclassDetails(index);
            this.showClassSubclassModal(subclass);
        } catch (error) {
            console.error('Failed to load subclass details:', error);
            this.showNotification('Erreur lors du chargement de la sous-classe', 'error');
        }
    }

    showSubspeciesModal(subspecies) {
        const ABILITY_FR = {
            str: 'Force', dex: 'Dextérité', con: 'Constitution',
            int: 'Intelligence', wis: 'Sagesse', cha: 'Charisme',
        };

        const bonusesHtml = (subspecies.ability_bonuses || [])
            .map(ab => {
                const abbr = ab.ability_score?.index || '';
                const name = ABILITY_FR[abbr] || ab.ability_score?.name || abbr;
                return `<span style="display:inline-flex;align-items:center;gap:0.3rem;padding:0.3rem 0.7rem;background:rgba(76,153,0,0.1);border:1px solid #4c9900;border-radius:20px;font-size:0.9rem;color:#2a5500;margin:0.2rem;">+${ab.bonus} ${name}</span>`;
            }).join('');

        const traitsHtml = (subspecies.racial_traits || [])
            .map(t => `<span style="padding:0.2rem 0.6rem;background:rgba(139,69,19,0.08);border:1px solid rgba(139,69,19,0.35);border-radius:4px;font-size:0.9rem;color:#4a2800;display:inline-block;margin:0.2rem;">${t.name}</span>`)
            .join('');

        const descHtml = subspecies.desc
            ? `<p style="font-family:'Crimson Text',serif;font-size:1rem;color:#3d1c00;line-height:1.6;margin-bottom:1rem;">${subspecies.desc}</p>`
            : '';

        const modal = document.createElement('div');
        modal.className = 'modal-overlay fade-in';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content scale-in';

        modalContent.innerHTML = `
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            <h2>${subspecies.name}</h2>
            ${subspecies.race ? `<p style="font-family:'Crimson Text',serif;color:#654321;margin:0 0 1rem 0;font-style:italic;">Sous-espèce — ${subspecies.race.name}</p>` : ''}
            <div class="equipment-details">
                <div class="details-grid">
                    <div class="detail-section">
                        ${descHtml}
                        ${bonusesHtml ? `<div style="margin-bottom:0.75rem;"><strong style="font-family:'Cinzel',serif;font-size:0.9rem;color:#2c1810;">Bonus de caractéristiques</strong><br><div style="margin-top:0.4rem;">${bonusesHtml}</div></div>` : ''}
                        ${traitsHtml ? `<div><strong style="font-family:'Cinzel',serif;font-size:0.9rem;color:#2c1810;">Traits supplémentaires</strong><br><div style="margin-top:0.4rem;">${traitsHtml}</div></div>` : ''}
                    </div>
                </div>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    }

    showClassSubclassModal(subclass) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay fade-in';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content scale-in';

        // Données Open5e : {name, desc (string), source, subtypeName}
        // Données dnd5eapi : {name, desc (array), class, subclass_flavor}
        let subtitle = '';
        let descHtml = '';

        if (typeof subclass.desc === 'string') {
            // Open5e : desc est une longue chaîne markdown
            subtitle = [subclass.subtypeName, subclass.source].filter(Boolean).join(' — ');
            descHtml = this.renderOpen5eMarkdown(subclass.desc);
        } else {
            // dnd5eapi : desc est un tableau de paragraphes
            const className = subclass.class ? subclass.class.name : '';
            const flavor = subclass.subclass_flavor || '';
            subtitle = [className, flavor].filter(Boolean).join(' — ');
            descHtml = (subclass.desc || [])
                .map(p => `<p>${this.parseMarkdown(p)}</p>`)
                .join('');
        }

        modalContent.innerHTML = `
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            <h2>${subclass.name}</h2>
            ${subtitle ? `<p style="font-family:'Crimson Text',serif;color:#654321;margin:0 0 1rem 0;font-style:italic;">${subtitle}</p>` : ''}
            <div class="equipment-details">
                <div class="details-grid">
                    <div class="detail-section">${descHtml || '<p>Aucune description disponible.</p>'}</div>
                </div>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    }

    renderOpen5eMarkdown(text) {
        if (!text) return '';

        // Traitement ligne par ligne pour gérer tous les niveaux de titres (#, ##, …, #####)
        // et les listes sans dépendre de doubles sauts de ligne.
        const HEADING_STYLE = {
            major: "font-family:'Cinzel',serif;font-size:1.05rem;font-weight:600;color:#5c2a00;" +
                   "border-bottom:2px solid rgba(139,69,19,0.35);padding-bottom:0.2rem;" +
                   "margin:1.5rem 0 0.5rem 0;",
            minor: "font-family:'Cinzel',serif;font-size:0.95rem;font-weight:600;color:#2c1810;" +
                   "border-bottom:1px solid rgba(139,69,19,0.2);padding-bottom:0.1rem;" +
                   "margin:1.1rem 0 0.3rem 0;",
        };

        const lines = text.split('\n');
        const parts = [];
        let paraLines = [];

        const flushPara = () => {
            const content = paraLines.join(' ').trim();
            if (content) parts.push(`<p style="margin:0.4rem 0;">${this.parseMarkdown(content)}</p>`);
            paraLines = [];
        };

        for (const raw of lines) {
            const line = raw.trim();

            // Titres : # à ######
            const hMatch = line.match(/^(#{1,6})\s+(.+)$/);
            if (hMatch) {
                flushPara();
                const depth = hMatch[1].length;
                const title = this.parseMarkdown(hMatch[2]);
                // ##### (capacité) = minor, tout le reste = major
                const style = depth >= 4 ? HEADING_STYLE.minor : HEADING_STYLE.major;
                const tag = depth >= 4 ? 'h4' : 'h3';
                parts.push(`<${tag} style="${style}">${title}</${tag}>`);
                continue;
            }

            // Éléments de liste (- ou *)
            if (/^[-*]\s/.test(line)) {
                flushPara();
                parts.push(`<li style="margin:0.2rem 0 0.2rem 1.4rem;">${this.parseMarkdown(line.slice(2))}</li>`);
                continue;
            }

            // Ligne vide → fin de paragraphe
            if (!line) {
                flushPara();
                continue;
            }

            paraLines.push(line);
        }

        flushPara();
        return parts.join('');
    }

    async showEquipmentDetails(index) {
        try {
            const { dndAPI } = await import('./api.js');
            const equipment = await dndAPI.getEquipmentDetails(index);
            this.showModal(equipment);
        } catch (error) {
            console.error('Failed to load equipment details:', error);
            this.showNotification('Erreur lors du chargement des détails', 'error');
        }
    }

    getEquipmentImagePath(equipment) {
        // Priorité : catégories spécifiques avant les génériques
        const CATEGORY_FOLDER = [
            ['equipment-packs',     'kits'],
            ['other-tools',         'kits'],
            ['gaming-sets',         'sets_jeux'],
            ['artisans-tools',      'outils_artisan'],
            ['musical-instruments', 'instruments_musique'],
            ['ammunition',          'munitions'],
            ['arcane-foci',         'focaliseurs'],
            ['holy-symbols',        'focaliseurs'],
            ['druidic-foci',        'focaliseurs'],
            ['barding',             'barding'],
            ['weapons',             'armes'],
            ['armor',               'armures'],
            ['mounts',              'montures'],
            ['vehicles',            'vehicules'],
            ['adventuring-gear',    'equipement_aventurier'],
            ['tools',               'outils_artisan'],
        ];

        // Chemin complet quand le dossier diffère de ce que la catégorie donnerait
        const PATH_OVERRIDE = {
            'climbers-kit':     "kits/climber's_kit",
            'healers-kit':      "kits/healer's_kit",
            'navigators-tools': "outils_artisan/navigator's_tools",
            'net':              'armes/net',
            'quarterstaff':     'armes/quarterstaff',
            'thieves-tools':    "equipement_aventurier/thieves'_tools",
        };

        // Nom de fichier quand l'API 2024 a simplifié/renommé l'item
        const FILE_OVERRIDE = {
            // Armes — crossbows renommés (sans virgule)
            'hand-crossbow':    'crossbow,_hand',
            'heavy-crossbow':   'crossbow,_heavy',
            'light-crossbow':   'crossbow,_light',
            // Armures — tiret vs underscore
            'half-plate-armor': 'half_plate_armor',
            // Équipement aventurier — noms simplifiés dans l'API 2024
            'acid':             'acid_(vial)',
            'alchemists-fire':  "alchemist's_fire_(flask)",
            'antitoxin':        'antitoxin_(vial)',
            'ball-bearings':    'ball_bearings_(bag_of_1,000)',
            'chain':            'chain_(10_feet)',
            'costume':          'clothes,_costume',
            'flask':            'flask_or_tankard',
            'holy-water':       'holy_water_(flask)',
            'ink':              'ink_(1_ounce_bottle)',
            'jug':              'jug_or_pitcher',
            'ladder':           'ladder_(10-foot)',
            'map':              'case,_map_or_scroll',
            'mirror':           'mirror,_steel',
            'oil':              'oil_(flask)',
            'paper':            'paper_(one_sheet)',
            'parchment':        'parchment_(one_sheet)',
            'perfume':          'perfume_(vial)',
            'poison-basic':     'poison,_basic_(vial)',
            'pole':             'pole_(10-foot)',
            'rations':          'rations_(1_day)',
            'robe':             'robes',
            'rope':             'rope,_hempen_(50_feet)',
            'spikes-iron':      'spike,_iron',
            'string':           'string_(10_feet)',
            'tent':             'tent,_two-person',
            // Munitions — pluralisés/renommés dans l'API 2024
            'arrows':           'arrow',
            'bolts':            'crossbow_bolt',
            'bullets-sling':    'sling_bullet',
            'needles':          'blowgun_needle',
            // Sets de jeux
            'dice':             'dice_set',
            'playing-cards':    'playing_card_set',
        };

        if (PATH_OVERRIDE[equipment.index]) {
            return `./assets/images/equipment/${PATH_OVERRIDE[equipment.index]}.webp`;
        }

        // L'API 2024 renvoie equipment_categories (tableau)
        const cats = (equipment.equipment_categories || []).map(c => c.index);
        const match = CATEGORY_FOLDER.find(([key]) => cats.includes(key));
        if (!match) return null;
        const file = FILE_OVERRIDE[equipment.index] || equipment.name.toLowerCase().replace(/ /g, '_');
        return `./assets/images/equipment/${match[1]}/${file}.webp`;
    }

    showModal(equipment) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay fade-in';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content scale-in';

        const imagePath = this.getEquipmentImagePath(equipment);
        const imageHTML = imagePath
            ? `<img src="${imagePath}" alt="${equipment.name}" class="spell-modal-image" onerror="this.style.display='none'">`
            : '';

        modalContent.innerHTML = `
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            ${imageHTML}
            <h2>${equipment.name}</h2>
            <div class="equipment-details">
                ${this.formatEquipmentDetails(equipment)}
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    convertFeetToMeters(feet) {
        const meters = feet * 0.3048;
        return meters.toFixed(1);
    }

    convertPoundsToKg(pounds) {
        const kg = pounds * 0.453592;
        return kg.toFixed(1);
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

    formatCurrency(unit) {
        const currency = DnDApp.CURRENCY_FR[unit];
        if (currency) {
            return `${currency.abbr} <span style="color: ${currency.color}; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">●</span>`;
        }
        return unit;
    }

    formatEquipmentDetails(equipment) {
        let html = '<div class="details-grid">';
        
        if (equipment.desc && equipment.desc.length > 0) {
            html += '<div class="detail-section"><h3>Description</h3>';
            equipment.desc.forEach(paragraph => {
                html += `<p>${paragraph}</p>`;
            });
            html += '</div>';
        }
        
        if (equipment.cost) {
            html += `
                <div class="detail-section">
                    <h3>Coût</h3>
                    <p>${equipment.cost.quantity} ${this.formatCurrency(equipment.cost.unit)}</p>
                </div>
            `;
        }
        
        if (equipment.weight) {
            const weightInKg = this.convertPoundsToKg(equipment.weight);
            html += `
                <div class="detail-section">
                    <h3>Poids</h3>
                    <p>${equipment.weight} lb (${weightInKg} kg)</p>
                </div>
            `;
        }
        
        if (equipment.damage) {
            html += `
                <div class="detail-section">
                    <h3>Dégâts</h3>
                    <p>${equipment.damage.damage_dice} ${equipment.damage.damage_type.name}</p>
                </div>
            `;
        }
        
        if (equipment.range) {
            const formattedRange = this.formatRange(equipment.range);
            html += `
                <div class="detail-section">
                    <h3>Portée</h3>
                    <p>${formattedRange}</p>
                </div>
            `;
        }
        
        if (equipment.properties && equipment.properties.length > 0) {
            html += `
                <div class="detail-section">
                    <h3>Propriétés</h3>
                    <div class="properties-list">
                        ${equipment.properties.map(prop => `<span class="property-tag">${prop.name}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type} slide-up`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--error-color)' : 'var(--primary-color)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 4px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
            z-index: 1001;
            font-family: var(--font-secondary);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js')
                .then((registration) => {
                    console.log('[App] Service Worker enregistré avec succès:', registration);

                    // Vérifier les mises à jour toutes les 30 secondes
                    setInterval(() => registration.update(), 30000);

                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;

                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                this.showUpdatePrompt(newWorker);
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.error('[App] Échec de l\'enregistrement du Service Worker:', error);
                });

            // Recharger la page quand le nouveau SW prend le contrôle
            let refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (!refreshing) {
                    refreshing = true;
                    window.location.reload();
                }
            });
        }
    }

    showUpdatePrompt(newWorker) {
        const existingPrompt = document.querySelector('.update-prompt');
        if (existingPrompt) return;

        const prompt = document.createElement('div');
        prompt.className = 'update-prompt';
        prompt.innerHTML = `
            <div class="update-prompt-content">
                <span>🔄 Nouvelle version disponible</span>
                <button class="update-button">Mettre à jour</button>
                <button class="update-close">✕</button>
            </div>
        `;

        prompt.querySelector('.update-button').addEventListener('click', () => {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
            prompt.remove();
        });

        prompt.querySelector('.update-close').addEventListener('click', () => {
            prompt.remove();
        });

        document.body.appendChild(prompt);
    }

    setupPWAInstall() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        window.addEventListener('appinstalled', () => {
            console.log('[App] Application PWA installée avec succès');
            this.deferredPrompt = null;
            const prompt = document.querySelector('.pwa-install-prompt');
            if (prompt) prompt.remove();
        });
    }

    showInstallPrompt() {
        const existingPrompt = document.querySelector('.pwa-install-prompt');
        if (existingPrompt) return;

        const prompt = document.createElement('div');
        prompt.className = 'pwa-install-prompt';
        
        prompt.innerHTML = `
            <div class="pwa-install-content">
                <div class="pwa-install-icon">📱</div>
                <div class="pwa-install-text">
                    <h3>Installer cette application</h3>
                    <p>Ajoutez l'Assistant D&D MJ à votre écran d'accueil</p>
                </div>
                <button class="pwa-install-btn">Installer</button>
                <button class="pwa-install-close">×</button>
            </div>
        `;

        prompt.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 2px solid #e63946;
            border-radius: 12px;
            padding: 1rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: slideUp 0.5s ease-out;
            font-family: var(--font-secondary);
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .pwa-install-content {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .pwa-install-icon {
                font-size: 2.5rem;
                flex-shrink: 0;
            }

            .pwa-install-text {
                flex: 1;
            }

            .pwa-install-text h3 {
                color: #e63946;
                margin: 0 0 0.25rem 0;
                font-size: 1rem;
                font-family: var(--font-primary);
            }

            .pwa-install-text p {
                color: #ffffff;
                margin: 0;
                font-size: 0.875rem;
                opacity: 0.8;
            }

            .pwa-install-btn {
                background: #e63946;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                font-family: var(--font-secondary);
                transition: all 0.3s;
            }

            .pwa-install-btn:hover {
                background: #ff4d6d;
                transform: translateY(-2px);
            }

            .pwa-install-close {
                background: transparent;
                color: #ffffff;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.25rem 0.5rem;
                opacity: 0.6;
            }

            .pwa-install-close:hover {
                opacity: 1;
            }

            @media (max-width: 480px) {
                .pwa-install-content {
                    flex-direction: column;
                    text-align: center;
                }

                .pwa-install-text {
                    margin-bottom: 0.5rem;
                }

                .pwa-install-btn {
                    width: 100%;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(prompt);

        const installBtn = prompt.querySelector('.pwa-install-btn');
        const closeBtn = prompt.querySelector('.pwa-install-close');

        installBtn.addEventListener('click', async () => {
            if (this.deferredPrompt) {
                this.deferredPrompt.prompt();
                const { outcome } = await this.deferredPrompt.userChoice;
                console.log('[App] Choix de l\'utilisateur:', outcome);
                this.deferredPrompt = null;
            }
            prompt.remove();
        });

        closeBtn.addEventListener('click', () => {
            prompt.remove();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DnDApp();
});

export { DnDApp };