/*
 * Smart search module for Khaza'in al‑Nur
 *
 * This script powers the search overlay that allows users to search
 * across all titles in the application—supplications, monajat, baqiat,
 * rights, ziyarats and nahj. It normalizes Arabic text by removing
 * diacritics and other variations so that searches are tolerant of
 * different spellings and vocalization. When the user types in the
 * search box the results update live. Selecting a result navigates
 * to the corresponding item, drilling down through categories as
 * necessary.
 */

(() => {
    // Get references to the DOM elements used by the search overlay
    const searchOverlay = document.getElementById('search-overlay');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');
    const resultsList = document.getElementById('search-results');
    const closeIcon = document.getElementById('close-search');

    if (!searchOverlay || !searchContainer || !searchInput || !resultsList) {
        console.warn('Search elements not found in DOM');
        return;
    }

    /**
     * Normalize Arabic text for insensitive searching. Removes
     * diacritics, kashida (tatweel), and normalizes variations of
     * similar letters (e.g., different forms of Alef). Also converts
     * Taa Marbuta to Haa and Alif Maqsura to Yaa. This function is
     * based on common Arabic text normalization practices.
     *
     * @param {string} text The text to normalize
     * @returns {string} Normalized text
     */
    function normalizeArabic(text) {
        return text
            // Remove harakat (diacritics)
            .replace(/[\u064B-\u065F]/g, '')
            // Remove tatweel (kashida)
            .replace(/[\u0640]/g, '')
            // Normalize various Alef forms to bare Alef
            .replace(/[\u0622\u0623\u0625]/g, 'ا')
            // Convert taa marbuta to haa
            .replace(/ة/g, 'ه')
            // Convert alif maqsura to yaa
            .replace(/ى/g, 'ي')
            // Convert hamza on waw to waw
            .replace(/ؤ/g, 'و')
            // Convert hamza on yaa to yaa
            .replace(/ئ/g, 'ي')
            // Trim whitespace
            .trim();
    }

    /**
     * Translate the internal section identifiers to human‑friendly labels.
     * These labels are shown alongside search results to indicate the
     * origin of each entry.
     *
     * @param {string} section The internal section name (e.g., 'duaa')
     * @returns {string} Translated label
     */
    function translateSection(section) {
        switch (section) {
            case 'duaa':
                return 'الأدعية';
            case 'monajat':
                return 'المناجاة';
            case 'baqiat':
                return 'الباقيات الصالحات';
            case 'rights':
                return 'رسالة الحقوق';
            case 'ziyarat':
                return 'الزيارات';
            case 'nahj':
                return 'نهج البلاغة';
            case 'khutbah':
                return 'خطب الجمعة';
            default:
                return '';
        }
    }

    /**
     * Toggle the visibility of the search overlay. When opening the
     * overlay, the search input is cleared and focused. When closing,
     * the input and results are reset. This function is exposed on
     * window so it can be called from the header button.
     */
    function toggleSearch() {
        const isHidden = searchOverlay.classList.contains('hidden');
        if (isHidden) {
            // Show overlay
            searchOverlay.classList.remove('hidden');
            searchContainer.classList.remove('hidden');
            // Reset and focus input
            searchInput.value = '';
            clearResults();
            setTimeout(() => searchInput.focus(), 50);
        } else {
            // Hide overlay
            searchOverlay.classList.add('hidden');
            searchContainer.classList.add('hidden');
            searchInput.value = '';
            clearResults();
        }
    }

    /**
     * Clear the search results list.
     */
    function clearResults() {
        resultsList.innerHTML = '';
    }

    /**
     * Render the search results. Results are provided as objects from
     * window.searchData. Each result becomes a clickable card that
     * navigates to the corresponding item when selected.
     *
     * @param {Array} results Array of result objects
     */
    function renderResults(results) {
        clearResults();
        if (!results || results.length === 0) {
            const noResult = document.createElement('div');
            noResult.className = 'text-center text-gray-400 mt-4';
            noResult.textContent = 'لا توجد نتائج مطابقة';
            resultsList.appendChild(noResult);
            return;
        }
        results.forEach(item => {
            const card = document.createElement('div');
            card.className = 'glass-card rounded-xl p-3 cursor-pointer hover:bg-white/10 transition';
            card.innerHTML = `
                <h3 class="text-lg text-indigo-200 font-bold mb-1">${item.title}</h3>
                <p class="text-sm text-gray-400">${translateSection(item.section)}</p>
            `;
            card.addEventListener('click', () => {
                // Navigate to the selected item, closing the search overlay first
                toggleSearch();
                // Determine which section and call appropriate functions
                const section = item.section;
                // Use setTimeout to ensure that view transitions occur after page changes
                if (section === 'duaa') {
                    openPage('duaa-list-view');
                    setTimeout(() => openDuaaDetails(item.itemIndex), 50);
                } else if (section === 'monajat') {
                    openPage('monajat-list-view');
                    setTimeout(() => openMonajatDetails(item.itemIndex), 50);
                } else if (section === 'baqiat') {
                    openPage('baqiat-categories-view');
                    setTimeout(() => {
                        openBaqiatItems(item.categoryIndex);
                        // Another timeout ensures the items view has rendered
                        setTimeout(() => openBaqiatDetails(item.itemIndex), 50);
                    }, 50);
                } else if (section === 'rights') {
                    openPage('rights-categories-view');
                    setTimeout(() => {
                        openRightsItems(item.categoryIndex);
                        setTimeout(() => openRightsDetails(item.itemIndex), 50);
                    }, 50);
                } else if (section === 'ziyarat') {
                    openPage('ziyarat-categories-view');
                    setTimeout(() => {
                        openZiyaratItems(item.categoryIndex);
                        setTimeout(() => openZiyaratDetails(item.itemIndex), 50);
                    }, 50);
                } else if (section === 'nahj') {
                    openPage('nahj-categories-view');
                    setTimeout(() => {
                        openNahjItems(item.categoryIndex);
                        setTimeout(() => openNahjDetails(item.itemIndex), 50);
                    }, 50);
                } else if (section === 'khutbah') {
                    openPage('khutbah-categories-view');
                    setTimeout(() => {
                        openKhutbahItems(item.categoryIndex);
                        setTimeout(() => openKhutbahDetails(item.itemIndex), 50);
                    }, 50);
                }
            });
            resultsList.appendChild(card);
        });
    }

    /**
     * Perform a search against the preloaded searchData. Normalizes the
     * query and the item titles before comparing. When the query is
     * empty, results are cleared.
     */
    function performSearch() {
        const query = normalizeArabic(searchInput.value);
        if (!query || query.length === 0) {
            clearResults();
            return;
        }
        const results = window.searchData.filter(item => {
            // Normalizing the title each time is acceptable given the
            // small number of entries (~700). For large datasets, you
            // could precompute normalized titles instead.
            return normalizeArabic(item.title).includes(query);
        });
        renderResults(results);
    }

    // Event listeners
    searchInput.addEventListener('input', performSearch);
    closeIcon.addEventListener('click', toggleSearch);
    // Expose toggleSearch globally so the header button can call it
    window.toggleSearch = toggleSearch;
})();