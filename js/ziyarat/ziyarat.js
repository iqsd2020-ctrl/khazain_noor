/*
 * Ziyarat (الزيارات) module
 *
 * This script handles the three‑level navigation for the Ziyarat section.
 * The data is preloaded via `ziyaratTabs.js`, which defines
 * `window.ziyaratTabs` as an array of categories. Each category has
 * a title and an array of items representing specific ziyarat (visitation
 * supplications or pilgrimages). Each item is stored in its own
 * JavaScript file under `js/ziyarat/content/` which defines
 * `window.ziyaratContent`. The functions below render the category
 * list, the items list for a selected category, and the details view.
 */

const ziyaratTabs = Array.isArray(window.ziyaratTabs) ? window.ziyaratTabs : [];
let currentZiyaratTab = null;

function renderZiyaratCategories() {
    const container = document.getElementById('ziyarat-categories-container');
    if (!container) return;
    container.innerHTML = '';
    if (ziyaratTabs.length === 0) {
        container.innerHTML = `
            <div class="glass-card p-6 text-center text-gray-400 rounded-xl">
                <p>لا توجد زيارات متاحة.</p>
            </div>`;
        return;
    }
    ziyaratTabs.forEach((tab, index) => {
        const card = document.createElement('div');
        card.className = 'glass-card rounded-xl p-4 cursor-pointer hover:bg-white/10 transition';
        card.innerHTML = `<h3 class="text-lg text-indigo-200 font-bold mb-1">${tab.category}</h3>`;
        card.addEventListener('click', () => openZiyaratItems(index));
        container.appendChild(card);
    });
}

function openZiyaratItems(tabIndex) {
    currentZiyaratTab = tabIndex;
    const tab = ziyaratTabs[tabIndex];
    if (!tab) return;
    const itemsView = document.getElementById('ziyarat-items-view');
    const categoriesView = document.getElementById('ziyarat-categories-view');
    if (categoriesView) categoriesView.classList.add('hidden');
    if (itemsView) itemsView.classList.remove('hidden');
    const titleEl = document.getElementById('ziyarat-category-title');
    if (titleEl) titleEl.textContent = tab.category;
    const container = document.getElementById('ziyarat-items-container');
    if (!container) return;
    container.innerHTML = '';
    if (!Array.isArray(tab.items) || tab.items.length === 0) {
        container.innerHTML = `
            <div class="glass-card p-6 text-center text-gray-400 rounded-xl">
                <p>لا توجد زيارات في هذا القسم.</p>
            </div>`;
        return;
    }
    tab.items.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'glass-card rounded-xl p-4 cursor-pointer hover:bg-white/10 transition';
        card.innerHTML = `<h3 class="text-lg text-indigo-200 font-bold mb-1">${item.title}</h3>`;
        card.addEventListener('click', () => openZiyaratDetails(idx));
        container.appendChild(card);
    });
    window.scrollTo(0, 0);
}

async function openZiyaratDetails(itemIndex) {
    const tab = ziyaratTabs[currentZiyaratTab];
    if (!tab || !tab.items[itemIndex]) return;
    const item = tab.items[itemIndex];
    const itemsView = document.getElementById('ziyarat-items-view');
    const detailsView = document.getElementById('ziyarat-details-view');
    if (itemsView) itemsView.classList.add('hidden');
    if (detailsView) detailsView.classList.remove('hidden');
    const titleEl = document.getElementById('ziyarat-item-title');
    if (titleEl) titleEl.textContent = item.title;
    const contentContainer = document.getElementById('ziyarat-content-container');
    if (contentContainer) {
        contentContainer.innerHTML = `
            <div class="text-center mt-10 text-gray-400">
                <i class="fa-solid fa-circle-notch animate-spin text-3xl mb-3"></i>
                <p>جاري التحميل...</p>
            </div>`;
    }
    window.scrollTo(0, 0);

    // Update favorite button state and attach click handler for Ziyarat
    if (typeof updateFavButton === 'function') {
        try {
            updateFavButton('ziyarat', currentZiyaratTab, itemIndex, item.title);
        } catch (e) {
            console.error('Error updating Ziyarat favorite button:', e);
        }
    }
    try {
        const content = await loadZiyaratContent(item.file);
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

function backToZiyaratCategories() {
    const itemsView = document.getElementById('ziyarat-items-view');
    const categoriesView = document.getElementById('ziyarat-categories-view');
    if (itemsView) itemsView.classList.add('hidden');
    if (categoriesView) categoriesView.classList.remove('hidden');
    window.scrollTo(0, 0);
}

function backToZiyaratItems() {
    const detailsView = document.getElementById('ziyarat-details-view');
    const itemsView = document.getElementById('ziyarat-items-view');
    if (detailsView) detailsView.classList.add('hidden');
    if (itemsView) itemsView.classList.remove('hidden');
    window.scrollTo(0, 0);
}

function loadZiyaratContent(fileName) {
    return new Promise((resolve, reject) => {
        if (typeof window.ziyaratContent !== 'undefined') {
            try {
                delete window.ziyaratContent;
            } catch (e) {
                window.ziyaratContent = undefined;
            }
        }
        const script = document.createElement('script');
        script.src = `js/ziyarat/content/${fileName}`;
        script.onload = () => {
            const content = window.ziyaratContent;
            script.remove();
            try {
                delete window.ziyaratContent;
            } catch (e) {
                window.ziyaratContent = undefined;
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

document.addEventListener('DOMContentLoaded', () => {
    renderZiyaratCategories();
});