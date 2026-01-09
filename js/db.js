const DB = {
    cache: {},
    searchIndex: null,
    
    files: {
        duas: 'json/duas.json',
        monajat: 'json/monajat.json',
        ziyarat: 'json/ziyarat.json',
        baqiyat: 'json/baqiyat.json',
        days: 'json/days.json',
        months: 'json/months.json',
        nahj_balagha: 'json/nahj_balagha.json',
        aqaid_imamiah: 'json/aqaid_imamiah.json',
        rights: 'json/rights.json',
        monasbat: 'json/monasbat.json',
        friday_duas_audio: 'json/friday_duas_audio.json'
    },

    load: async (key) => {
        if (DB.cache[key]) return DB.cache[key];
        try {
            const response = await fetch(DB.files[key]);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            DB.cache[key] = data;
            return data;
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return null;
        }
    },

    getItem: async (key, id) => {
        const data = await DB.load(key);
        if (!data) return null;
        for (const tab of data) {
            const item = tab.items.find(i => i.id == id);
            if (item) return { ...item, category: tab.tab_title };
        }
        return null;
    },

    buildSearchIndex: async () => {
        if (DB.searchIndex) return DB.searchIndex;
        const index = [];
        const keys = Object.keys(DB.files);
        
        for (const key of keys) {
            const data = await DB.load(key);
            if (data && Array.isArray(data)) {
                data.forEach(tab => {
                    if (tab.items && Array.isArray(tab.items)) {
                        tab.items.forEach(item => {
                            // استخدام title أو title1 (للمناسبات) كعنوان للبحث
                            const title = item.title || item.title1;
                            if (title) {
                                index.push({
                                    id: item.id,
                                    title: title,
                                    categoryKey: key,
                                    categoryTitle: tab.tab_title
                                });
                            }
                        });
                    }
                });
            }
        }
        DB.searchIndex = index;
        return index;
    },

    search: async (query) => {
        if (!query || query.trim() === "") return [];
        const index = await DB.buildSearchIndex();
        const q = query.toLowerCase().trim();
        return index.filter(item => 
            item.title && item.title.toLowerCase().includes(q)
        ).slice(0, 20);
    }
};
