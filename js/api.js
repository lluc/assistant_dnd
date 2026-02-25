class DnDAPI {
    constructor() {
        this.baseURL = 'https://www.dnd5eapi.co/api/2024';
        this.spellsBaseURL = 'https://www.dnd5eapi.co/api/2014';
        this.open5eBaseURL = 'https://api.open5e.com/v1';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    getCacheKey(url) {
        return url;
    }

    getFromCache(url) {
        const cached = this.cache.get(this.getCacheKey(url));
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCache(url, data) {
        this.cache.set(this.getCacheKey(url), {
            data,
            timestamp: Date.now()
        });
    }

    async fetchWithCache(url, retries = 3, retryDelay = 800) {
        const cached = this.getFromCache(url);
        if (cached) {
            return cached;
        }

        try {
            const response = await fetch(url);

            // Rate-limit : attendre et réessayer avec backoff exponentiel
            if (response.status === 429 && retries > 0) {
                const retry = retries - 1;
                console.warn(`[API] 429 sur ${url} — nouvel essai dans ${retryDelay}ms (${retry} restant(s))`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return this.fetchWithCache(url, retry, retryDelay * 2);
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.setCache(url, data);
            return data;
        } catch (error) {
            console.error('API fetch error:', error);
            throw error;
        }
    }

    async getEquipmentList() {
        return this.fetchWithCache(`${this.baseURL}/equipment`);
    }

    async getEquipmentDetails(index) {
        return this.fetchWithCache(`${this.baseURL}/equipment/${index}`);
    }

    async getEquipmentCategories() {
        return this.fetchWithCache(`${this.baseURL}/equipment-categories`);
    }

    async getAbilityScores() {
        return this.fetchWithCache(`${this.baseURL}/ability-scores`);
    }

    async searchEquipment(query) {
        try {
            const equipmentList = await this.getEquipmentList();
            const filtered = equipmentList.results.filter(item => 
                item.name.toLowerCase().includes(query.toLowerCase())
            );
            
            const detailedResults = await Promise.all(
                filtered.map(item => this.getEquipmentDetails(item.index))
            );
            
            return detailedResults;
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    }

    async getEquipmentByCategory(category) {
        try {
            const categoryData = await this.fetchWithCache(`${this.baseURL}/equipment-categories/${category}`);
            return categoryData;
        } catch (error) {
            console.error('Category fetch error:', error);
            return null;
        }
    }

    async getSpellsList() {
        return this.fetchWithCache(`${this.spellsBaseURL}/spells`);
    }

    async getSpellDetails(index) {
        return this.fetchWithCache(`${this.spellsBaseURL}/spells/${index}`);
    }

    async getSpellsByLevel(level) {
        try {
            const list = await this.getSpellsList();
            return list ? list.results.filter(s => s.level === parseInt(level)) : [];
        } catch (error) {
            console.error('Spells by level fetch error:', error);
            return [];
        }
    }

    async searchSpells(query) {
        try {
            const list = await this.getSpellsList();
            if (!list) return [];
            const filtered = list.results.filter(s =>
                s.name.toLowerCase().includes(query.toLowerCase())
            );
            return Promise.all(filtered.slice(0, 20).map(s => this.getSpellDetails(s.index)));
        } catch (error) {
            console.error('Spell search error:', error);
            return [];
        }
    }

    async getClassesList() {
        return this.fetchWithCache(`${this.spellsBaseURL}/classes`);
    }

    async getClassDetails(index) {
        return this.fetchWithCache(`${this.spellsBaseURL}/classes/${index}`);
    }

    async getClassLevels(index) {
        return this.fetchWithCache(`${this.spellsBaseURL}/classes/${index}/levels`);
    }

    async getSubclassDetails(index) {
        return this.fetchWithCache(`${this.spellsBaseURL}/subclasses/${index}`);
    }

    async getFeatureDetails(index) {
        return this.fetchWithCache(`${this.spellsBaseURL}/features/${index}`);
    }

    async getProficiencyDetails(index) {
        return this.fetchWithCache(`${this.spellsBaseURL}/proficiencies/${index}`);
    }

    async getOpen5eClass(slug) {
        return this.fetchWithCache(`${this.open5eBaseURL}/classes/${slug}/`);
    }

    async getSpeciesList() {
        return this.fetchWithCache(`${this.spellsBaseURL}/races`);
    }

    async getSpeciesDetails(index) {
        return this.fetchWithCache(`${this.spellsBaseURL}/races/${index}`);
    }

    async getSubspeciesDetails(index) {
        return this.fetchWithCache(`${this.spellsBaseURL}/subraces/${index}`);
    }

    async getTraitDetails(index) {
        return this.fetchWithCache(`${this.spellsBaseURL}/traits/${index}`);
    }
}

export const dndAPI = new DnDAPI();