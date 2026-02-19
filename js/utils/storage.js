class StorageManager {
    constructor() {
        this.keys = {
            favorites: 'dnd-favorites',
            spellFavorites: 'dnd-spell-favorites',
            searchHistory: 'dnd-search-history',
            userPreferences: 'dnd-user-preferences',
            diceHistory: 'dnd-dice-history'
        };
    }

    getFavorites() {
        try {
            return JSON.parse(localStorage.getItem(this.keys.favorites) || '[]');
        } catch (error) {
            console.error('Failed to get favorites:', error);
            return [];
        }
    }

    addFavorite(index) {
        try {
            const favorites = this.getFavorites();
            if (!favorites.includes(index)) {
                favorites.push(index);
                localStorage.setItem(this.keys.favorites, JSON.stringify(favorites));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to add favorite:', error);
            return false;
        }
    }

    removeFavorite(index) {
        try {
            const favorites = this.getFavorites();
            const newFavorites = favorites.filter(fav => fav !== index);
            localStorage.setItem(this.keys.favorites, JSON.stringify(newFavorites));
            return true;
        } catch (error) {
            console.error('Failed to remove favorite:', error);
            return false;
        }
    }

    isFavorite(index) {
        const favorites = this.getFavorites();
        return favorites.includes(index);
    }

    getSpellFavorites() {
        try {
            return JSON.parse(localStorage.getItem(this.keys.spellFavorites) || '[]');
        } catch (error) {
            console.error('Failed to get spell favorites:', error);
            return [];
        }
    }

    addSpellFavorite(index) {
        try {
            const favorites = this.getSpellFavorites();
            if (!favorites.includes(index)) {
                favorites.push(index);
                localStorage.setItem(this.keys.spellFavorites, JSON.stringify(favorites));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to add spell favorite:', error);
            return false;
        }
    }

    removeSpellFavorite(index) {
        try {
            const favorites = this.getSpellFavorites();
            const newFavorites = favorites.filter(fav => fav !== index);
            localStorage.setItem(this.keys.spellFavorites, JSON.stringify(newFavorites));
            return true;
        } catch (error) {
            console.error('Failed to remove spell favorite:', error);
            return false;
        }
    }

    isSpellFavorite(index) {
        const favorites = this.getSpellFavorites();
        return favorites.includes(index);
    }

    getSearchHistory() {
        try {
            return JSON.parse(localStorage.getItem(this.keys.searchHistory) || '[]');
        } catch (error) {
            console.error('Failed to get search history:', error);
            return [];
        }
    }

    addSearchQuery(query) {
        try {
            const history = this.getSearchHistory();
            const newHistory = history.filter(item => item !== query);
            newHistory.unshift(query);
            
            const maxHistory = 20;
            const trimmedHistory = newHistory.slice(0, maxHistory);
            
            localStorage.setItem(this.keys.searchHistory, JSON.stringify(trimmedHistory));
            return trimmedHistory;
        } catch (error) {
            console.error('Failed to add search query:', error);
            return [];
        }
    }

    clearSearchHistory() {
        try {
            localStorage.removeItem(this.keys.searchHistory);
            return true;
        } catch (error) {
            console.error('Failed to clear search history:', error);
            return false;
        }
    }

    getUserPreferences() {
        try {
            return JSON.parse(localStorage.getItem(this.keys.userPreferences) || '{}');
        } catch (error) {
            console.error('Failed to get user preferences:', error);
            return {};
        }
    }

    setUserPreference(key, value) {
        try {
            const preferences = this.getUserPreferences();
            preferences[key] = value;
            localStorage.setItem(this.keys.userPreferences, JSON.stringify(preferences));
            return true;
        } catch (error) {
            console.error('Failed to set user preference:', error);
            return false;
        }
    }

    getUserPreference(key, defaultValue = null) {
        const preferences = this.getUserPreferences();
        return preferences.hasOwnProperty(key) ? preferences[key] : defaultValue;
    }

    getDiceHistory() {
        try {
            return JSON.parse(localStorage.getItem(this.keys.diceHistory) || '[]');
        } catch (error) {
            console.error('Failed to get dice history:', error);
            return [];
        }
    }

    addDiceRoll(rollData) {
        try {
            const history = this.getDiceHistory();
            history.unshift({
                ...rollData,
                timestamp: new Date().toISOString()
            });
            
            const maxHistory = 50;
            const trimmedHistory = history.slice(0, maxHistory);
            
            localStorage.setItem(this.keys.diceHistory, JSON.stringify(trimmedHistory));
            return trimmedHistory;
        } catch (error) {
            console.error('Failed to add dice roll:', error);
            return [];
        }
    }

    clearDiceHistory() {
        try {
            localStorage.removeItem(this.keys.diceHistory);
            return true;
        } catch (error) {
            console.error('Failed to clear dice history:', error);
            return false;
        }
    }

    exportData() {
        try {
            const data = {
                favorites: this.getFavorites(),
                searchHistory: this.getSearchHistory(),
                userPreferences: this.getUserPreferences(),
                diceHistory: this.getDiceHistory(),
                exportDate: new Date().toISOString()
            };
            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Failed to export data:', error);
            return null;
        }
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.favorites && Array.isArray(data.favorites)) {
                localStorage.setItem(this.keys.favorites, JSON.stringify(data.favorites));
            }
            
            if (data.searchHistory && Array.isArray(data.searchHistory)) {
                localStorage.setItem(this.keys.searchHistory, JSON.stringify(data.searchHistory));
            }
            
            if (data.userPreferences && typeof data.userPreferences === 'object') {
                localStorage.setItem(this.keys.userPreferences, JSON.stringify(data.userPreferences));
            }
            
            if (data.diceHistory && Array.isArray(data.diceHistory)) {
                localStorage.setItem(this.keys.diceHistory, JSON.stringify(data.diceHistory));
            }
            
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }

    clearAllData() {
        try {
            Object.values(this.keys).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Failed to clear all data:', error);
            return false;
        }
    }

    getStorageInfo() {
        try {
            const info = {};
            Object.entries(this.keys).forEach(([name, key]) => {
                const value = localStorage.getItem(key);
                if (value) {
                    info[name] = {
                        size: new Blob([value]).size,
                        items: key === this.keys.favorites || key === this.keys.searchHistory || key === this.keys.diceHistory 
                            ? JSON.parse(value).length 
                            : 1
                    };
                }
            });
            return info;
        } catch (error) {
            console.error('Failed to get storage info:', error);
            return {};
        }
    }
}

export const storageManager = new StorageManager();