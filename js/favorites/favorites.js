/*
 * Favorites management module
 *
 * This script provides functions to persist a list of favorite items
 * across the application. Favorites are stored in localStorage with
 * information about the section (e.g., duaa, monajat) and indexes
 * necessary to retrieve the item again. Each item may also include
 * a title for display in the favorites list. The module also
 * exposes helper functions to update the favorite star icons in
 * detail views and to render the favorites list view.
 */

(function() {
    const STORAGE_KEY = 'favorites';

    /**
     * Load favorites list from localStorage. Returns an array of
     * favorite objects. Each favorite object should have at least
     * {section, itemIndex, categoryIndex?, title}.
     * @returns {Array}
     */
    function loadFavorites() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        try {
            const list = JSON.parse(raw);
            return Array.isArray(list) ? list : [];
        } catch (e) {
            console.warn('Failed to parse favorites from storage:', e);
            return [];
        }
    }

    /**
     * Save favorites list to localStorage.
     * @param {Array} list
     */
    function saveFavorites(list) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch (e) {
            console.error('Failed to save favorites:', e);
        }
    }

    /**
     * Find the index of a favorite item in the list by matching
     * section, categoryIndex and itemIndex.
     * @param {Array} list
     * @param {Object} item
     * @returns {number} Index or -1 if not found
     */
    function findFavoriteIndex(list, item) {
        return list.findIndex(f => f.section === item.section && f.itemIndex === item.itemIndex && (f.categoryIndex ?? null) === (item.categoryIndex ?? null));
    }

    /**
     * Determine whether an item is currently in the favorites list.
     * @param {Object} item
     * @returns {boolean}
     */
    function isFavorite(item) {
        const list = loadFavorites();
        return findFavoriteIndex(list, item) >= 0;
    }

    /**
     * Toggle a favorite item. If it exists, remove it; otherwise add it.
     * @param {Object} item
     */
    function toggleFavorite(item) {
        let list = loadFavorites();
        const idx = findFavoriteIndex(list, item);
        if (idx >= 0) {
            list.splice(idx, 1);
        } else {
            list.push(item);
        }
        saveFavorites(list);
        // If favorites view is visible, re-render to reflect changes
        const favView = document.getElementById('favorites-view');
        if (favView && !favView.classList.contains('hidden')) {
            renderFavorites();
        }
    }

    /**
     * Update the favorite star button in a detail view. The button
     * should exist in the DOM with id `${section}-fav-btn`. The
     * function attaches click handler and toggles the icon state
     * based on whether the item is currently favorite.
     *
     * @param {string} section e.g. 'duaa', 'monajat'
     * @param {number|null} categoryIndex Category index for multi-level sections; pass null for single-level sections
     * @param {number} itemIndex Index of the item within its section
     * @param {string} title The display title of the item
     */
    function updateFavButton(section, categoryIndex, itemIndex, title) {
        const btn = document.getElementById(section + '-fav-btn');
        if (!btn) return;
        const icon = btn.querySelector('i');
        const favItem = {
            section,
            itemIndex,
            title,
            // include categoryIndex only if defined
            ...(categoryIndex !== null && categoryIndex !== undefined ? { categoryIndex: categoryIndex } : {})
        };
        // Set icon state
        if (isFavorite(favItem)) {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            icon.classList.add('text-yellow-400');
        } else {
            icon.classList.remove('fa-solid');
            icon.classList.remove('text-yellow-400');
            icon.classList.add('fa-regular');
        }
        // Attach click handler
        btn.onclick = () => {
            toggleFavorite(favItem);
            // update icon after toggling
            updateFavButton(section, categoryIndex, itemIndex, title);
        };
    }

    /**
     * Render the favorites list into the favorites container. Uses
     * translateSection function from search.js if available; otherwise
     * defines a local fallback.
     */
    function renderFavorites() {
        const container = document.getElementById('favorites-container');
        if (!container) return;
        const list = loadFavorites();
        container.innerHTML = '';
        if (!list || list.length === 0) {
            container.innerHTML = `
                <div class="glass-card p-6 text-center text-gray-400 rounded-xl">
                    لا توجد عناصر مفضلة بعد.
                </div>`;
            return;
        }
        // Helper to translate section names; reuse from search.js if available
        const translateSection = window.translateSection || function(sec) {
            switch (sec) {
                case 'duaa': return 'الأدعية';
                case 'monajat': return 'المناجاة';
                case 'baqiat': return 'الباقيات';
                case 'rights': return 'رسالة الحقوق';
                case 'ziyarat': return 'الزيارات';
                case 'nahj': return 'نهج البلاغة';
                case 'khutbah': return 'خطب الجمعة';
                default: return '';
            }
        };
        list.forEach(item => {
            const div = document.createElement('div');
            div.className = 'glass-card rounded-xl p-4 cursor-pointer hover:bg-white/10 transition flex flex-col items-start';
            const sectionLabel = translateSection(item.section);
            const title = item.title || '';
            div.innerHTML = `
                <h3 class="text-lg text-indigo-200 font-bold mb-1">${title}</h3>
                <span class="text-sm text-gray-400">${sectionLabel}</span>
            `;
            div.addEventListener('click', () => {
                openFavoriteItem(item);
            });
            container.appendChild(div);
        });
    }

    /**
     * Navigate to a favorite item using existing section navigation
     * functions. This function calls openPage and appropriate open
     * functions for the item's section.
     * @param {Object} item
     */
    function openFavoriteItem(item) {
        const section = item.section;
        const catIdx = item.categoryIndex;
        const idx = item.itemIndex;
        if (section === 'duaa') {
            openPage('duaa-list-view');
            setTimeout(() => openDuaaDetails(idx), 50);
        } else if (section === 'monajat') {
            openPage('monajat-list-view');
            setTimeout(() => openMonajatDetails(idx), 50);
        } else if (section === 'baqiat') {
            openPage('baqiat-categories-view');
            setTimeout(() => {
                openBaqiatItems(catIdx);
                setTimeout(() => openBaqiatDetails(idx), 50);
            }, 50);
        } else if (section === 'rights') {
            openPage('rights-categories-view');
            setTimeout(() => {
                openRightsItems(catIdx);
                setTimeout(() => openRightsDetails(idx), 50);
            }, 50);
        } else if (section === 'ziyarat') {
            openPage('ziyarat-categories-view');
            setTimeout(() => {
                openZiyaratItems(catIdx);
                setTimeout(() => openZiyaratDetails(idx), 50);
            }, 50);
        } else if (section === 'nahj') {
            openPage('nahj-categories-view');
            setTimeout(() => {
                openNahjItems(catIdx);
                setTimeout(() => openNahjDetails(idx), 50);
            }, 50);
        } else if (section === 'khutbah') {
            openPage('khutbah-categories-view');
            setTimeout(() => {
                openKhutbahItems(catIdx);
                setTimeout(() => openKhutbahDetails(idx), 50);
            }, 50);
        }
    }

    /**
     * Copy the text content from a given container to the clipboard.
     * This function reads all text (stripping any HTML) from the element
     * with the provided id and writes it to the user's clipboard. A
     * brief confirmation alert is shown upon success.
     * @param {string} containerId The ID of the element containing the text to copy
     */
    function copyCurrentText(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        // Extract the plain text from the container
        const text = el.innerText || el.textContent || '';
        if (!navigator.clipboard) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.top = '-9999px';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            try {
                document.execCommand('copy');
                alert('تم نسخ النص!');
            } catch (err) {
                console.error('Clipboard copy failed:', err);
            }
            document.body.removeChild(textarea);
            return;
        }
        navigator.clipboard.writeText(text.trim()).then(() => {
            alert('تم نسخ النص!');
        }).catch(err => {
            console.error('Clipboard write failed:', err);
        });
    }

    // Expose functions globally for other modules
    window.loadFavorites = loadFavorites;
    window.isFavorite = isFavorite;
    window.toggleFavorite = toggleFavorite;
    window.updateFavButton = updateFavButton;
    window.renderFavorites = renderFavorites;
    window.openFavoriteItem = openFavoriteItem;
    // Expose copyCurrentText globally so detail views can use it
    window.copyCurrentText = copyCurrentText;
})();