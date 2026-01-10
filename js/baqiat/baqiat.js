/*
 * Baqiat (الباقيات الصالحات) module
 *
 * This script manages the multi‑level navigation for the Baqiat section of
 * the Khaza'in al‑Nur application. Data for this section is preloaded via
 * `baqiatTabs.js`, which defines `window.baqiatTabs` as an array of
 * category objects. Each category contains a title and a list of items
 * (supplications or acts) with associated file names. The module
 * renders a list of categories, lets the user drill down into the
 * individual items of a selected category, and displays the full
 * content of an item on demand by dynamically loading its JavaScript
 * file. This approach allows the application to run over the `file://`
 * protocol without relying on fetch requests.
 */

// Grab the preloaded data for Baqiat. If not available, fall back to an
// empty array to avoid runtime errors.
const baqiatTabs = Array.isArray(window.baqiatTabs) ? window.baqiatTabs : [];

// Track which category (tab) is currently active when navigating
// between the items and details views.
let currentBaqiatTab = null;

/**
 * Render the list of Baqiat categories into the container. Each
 * category becomes a clickable card that opens the corresponding
 * list of items when selected. If no categories are available, a
 * placeholder message is shown.
 */
function renderBaqiatCategories() {
    const container = document.getElementById('baqiat-categories-container');
    if (!container) return;
    container.innerHTML = '';
    if (baqiatTabs.length === 0) {
        container.innerHTML = `
            <div class="glass-card p-6 text-center text-gray-400 rounded-xl">
                <p>لا توجد مواد متاحة.</p>
            </div>`;
        return;
    }
    baqiatTabs.forEach((tab, index) => {
        const card = document.createElement('div');
        card.className = 'glass-card rounded-xl p-4 cursor-pointer hover:bg-white/10 transition';
        card.innerHTML = `<h3 class="text-lg text-indigo-200 font-bold mb-1">${tab.category}</h3>`;
        card.addEventListener('click', () => openBaqiatItems(index));
        container.appendChild(card);
    });
}

/**
 * Display the list of items for a selected category. This function
 * updates the title of the items view, populates the list of item
 * cards, and switches the visible view from the categories list to
 * the items list.
 *
 * @param {number} tabIndex - Index of the selected category in baqiatTabs
 */
function openBaqiatItems(tabIndex) {
    currentBaqiatTab = tabIndex;
    const tab = baqiatTabs[tabIndex];
    if (!tab) return;
    const itemsView = document.getElementById('baqiat-items-view');
    const categoriesView = document.getElementById('baqiat-categories-view');
    if (categoriesView) categoriesView.classList.add('hidden');
    if (itemsView) itemsView.classList.remove('hidden');
    const titleEl = document.getElementById('baqiat-category-title');
    if (titleEl) titleEl.textContent = tab.category;
    const container = document.getElementById('baqiat-items-container');
    if (!container) return;
    container.innerHTML = '';
    if (!Array.isArray(tab.items) || tab.items.length === 0) {
        container.innerHTML = `
            <div class="glass-card p-6 text-center text-gray-400 rounded-xl">
                <p>لا توجد مواد في هذا القسم.</p>
            </div>`;
        return;
    }
    tab.items.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'glass-card rounded-xl p-4 cursor-pointer hover:bg-white/10 transition';
        card.innerHTML = `<h3 class="text-lg text-indigo-200 font-bold mb-1">${item.title}</h3>`;
        card.addEventListener('click', () => openBaqiatDetails(idx));
        container.appendChild(card);
    });
    window.scrollTo(0, 0);
}

/**
 * Display the details of a selected item. This function loads the
 * content from its corresponding JavaScript file, updates the title
 * and content containers, and toggles the visibility between the
 * items list and the details view. A loading spinner is shown while
 * the content is being fetched.
 *
 * @param {number} itemIndex - Index of the selected item within the
 *   current category's items array
 */
async function openBaqiatDetails(itemIndex) {
    const tab = baqiatTabs[currentBaqiatTab];
    if (!tab || !tab.items[itemIndex]) return;
    const item = tab.items[itemIndex];
    const itemsView = document.getElementById('baqiat-items-view');
    const detailsView = document.getElementById('baqiat-details-view');
    if (itemsView) itemsView.classList.add('hidden');
    if (detailsView) detailsView.classList.remove('hidden');
    const titleEl = document.getElementById('baqiat-item-title');
    if (titleEl) titleEl.textContent = item.title;
    const contentContainer = document.getElementById('baqiat-content-container');
    if (contentContainer) {
        contentContainer.innerHTML = `
            <div class="text-center mt-10 text-gray-400">
                <i class="fa-solid fa-circle-notch animate-spin text-3xl mb-3"></i>
                <p>جاري التحميل...</p>
            </div>`;
    }
    window.scrollTo(0, 0);

    // Update favorite button state and attach click handler for Baqiat
    if (typeof updateFavButton === 'function') {
        try {
            updateFavButton('baqiat', currentBaqiatTab, itemIndex, item.title);
        } catch (e) {
            console.error('Error updating Baqiat favorite button:', e);
        }
    }
    try {
        const content = await loadBaqiatContent(item.file);
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="glass-card rounded-xl p-5 text-right space-y-4 max-w-3xl mx-auto">
                    <p class="reading-text text-gray-200 leading-relaxed">${content}</p>
                </div>`;
        }
    } catch (error) {
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="glass-card p-6 text-center text-red-300 rounded-xl border border-red-500/30">
                    <i class="fa-solid fa-triangle-exclamation text-3xl mb-3"></i>
                    <p>عذراً، تعذر تحميل المحتوى.</p>
                </div>`;
        }
        console.error(error);
    }
}

/**
 * Return from the items list back to the categories list.
 */
function backToBaqiatCategories() {
    const itemsView = document.getElementById('baqiat-items-view');
    const categoriesView = document.getElementById('baqiat-categories-view');
    if (itemsView) itemsView.classList.add('hidden');
    if (categoriesView) categoriesView.classList.remove('hidden');
    window.scrollTo(0, 0);
}

/**
 * Return from the details view back to the items list.
 */
function backToBaqiatItems() {
    const detailsView = document.getElementById('baqiat-details-view');
    const itemsView = document.getElementById('baqiat-items-view');
    if (detailsView) detailsView.classList.add('hidden');
    if (itemsView) itemsView.classList.remove('hidden');
    window.scrollTo(0, 0);
}

/**
 * Dynamically load the content for a given Baqiat item. The content
 * file defines a global variable `window.baqiatContent` containing
 * the HTML string. Once loaded, the script element is removed and
 * the global variable is cleaned up.
 *
 * @param {string} fileName - File name of the content script (e.g.
 *   "6001.js")
 * @returns {Promise<string>} Promise resolving with the content
 */
function loadBaqiatContent(fileName) {
    return new Promise((resolve, reject) => {
        // Remove any previously loaded content
        if (typeof window.baqiatContent !== 'undefined') {
            try {
                delete window.baqiatContent;
            } catch (e) {
                window.baqiatContent = undefined;
            }
        }
        const script = document.createElement('script');
        script.src = `js/baqiat/content/${fileName}`;
        script.onload = () => {
            const content = window.baqiatContent;
            script.remove();
            try {
                delete window.baqiatContent;
            } catch (e) {
                window.baqiatContent = undefined;
            }
            if (typeof content === 'string') {
                resolve(content);
            } else {
                reject(new Error('No content defined'));
            }
        };
        script.onerror = () => {
            script.remove();
            reject(new Error('Failed to load content'));
        };
        document.body.appendChild(script);
    });
}

// Initialize the categories list when the DOM is ready. This ensures
// the UI is populated as soon as the page is loaded without
// requiring any additional calls.
document.addEventListener('DOMContentLoaded', () => {
    renderBaqiatCategories();
});