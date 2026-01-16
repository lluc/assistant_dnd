import './components/header.js';
import './components/equipment-search.js';
import './components/equipment-card.js';

class DnDApp {
    constructor() {
        this.currentPage = 'equipment';
        this.header = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupRouting();
        this.loadInitialPage();
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
        const favorites = storageManager.getFavorites();

        if (favorites.length === 0) {
            favoritesContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⭐</div>
                    <div class="empty-state-title">Aucun favori</div>
                    <div class="empty-state-text">
                        Ajoutez des équipements à vos favoris pour les retrouver facilement ici.
                    </div>
                </div>
            `;
            return;
        }

        favoritesContainer.innerHTML = '<div class="loading">Chargement des favoris...</div>';

        try {
            const { dndAPI } = await import('./api.js');
            const favoriteDetails = await Promise.all(
                favorites.map(index => dndAPI.getEquipmentDetails(index))
            );

            favoritesContainer.innerHTML = '';
            favoritesContainer.classList.add('fade-in');

            favoriteDetails.forEach(equipment => {
                const card = document.createElement('equipment-card');
                card.setAttribute('equipment-data', JSON.stringify(equipment));
                favoritesContainer.appendChild(card);
            });
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
                    <p>${equipment.cost.quantity} ${equipment.cost.unit}</p>
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
}

document.addEventListener('DOMContentLoaded', () => {
    new DnDApp();
});

export { DnDApp };