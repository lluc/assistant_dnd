import './components/header.js';
import './components/equipment-search.js';
import './components/equipment-card.js';
import './components/spells-search.js';
import './components/spell-card.js';
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
        return range.replace(/(\d+)\s*-?\s*(?:foot|feet)/gi, (match, feet) => {
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

    showModal(equipment) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay fade-in';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content scale-in';
        
        modalContent.innerHTML = `
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
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