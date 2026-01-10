/*
 * Nahj al‑Balagha (نهج البلاغة) module
 *
 * This script implements a three‑level navigation system for the
 * Nahj al‑Balagha section, which includes sermons, letters, and
 * sayings attributed to Imam Ali (ع). The data for this section is
 * provided via `nahjTabs.js` defining `window.nahjTabs` with an array
 * of categories. Each category contains a title and an array of
 * items with corresponding content files. The module renders the
 * category list, the list of items for a selected category, and the
 * full content of an item loaded dynamically from its script file.
 */

const nahjTabs = Array.isArray(window.nahjTabs) ? window.nahjTabs : [];
let currentNahjTab = null;

function renderNahjCategories() {
    const container = document.getElementById('nahj-categories-container');
    if (!container) return;
    container.innerHTML = '';
    if (nahjTabs.length === 0) {
        container.innerHTML = `
            <div class="glass-card p-6 text-center text-gray-400 rounded-xl">
                <p>لا توجد مواد متاحة.</p>
            </div>`;
        return;
    }
    nahjTabs.forEach((tab, index) => {
        const card = document.createElement('div');
        card.className = 'glass-card rounded-xl p-4 cursor-pointer hover:bg-white/10 transition';
        card.innerHTML = `<h3 class="text-lg text-indigo-200 font-bold mb-1">${tab.category}</h3>`;
        card.addEventListener('click', () => openNahjItems(index));
        container.appendChild(card);
    });
}

function openNahjItems(tabIndex) {
    currentNahjTab = tabIndex;
    const tab = nahjTabs[tabIndex];
    if (!tab) return;
    const itemsView = document.getElementById('nahj-items-view');
    const categoriesView = document.getElementById('nahj-categories-view');
    if (categoriesView) categoriesView.classList.add('hidden');
    if (itemsView) itemsView.classList.remove('hidden');
    const titleEl = document.getElementById('nahj-category-title');
    if (titleEl) titleEl.textContent = tab.category;
    const container = document.getElementById('nahj-items-container');
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
        card.addEventListener('click', () => openNahjDetails(idx));
        container.appendChild(card);
    });
    window.scrollTo(0, 0);
}

async function openNahjDetails(itemIndex) {
    const tab = nahjTabs[currentNahjTab];
    if (!tab || !tab.items[itemIndex]) return;
    const item = tab.items[itemIndex];
    const itemsView = document.getElementById('nahj-items-view');
    const detailsView = document.getElementById('nahj-details-view');
    if (itemsView) itemsView.classList.add('hidden');
    if (detailsView) detailsView.classList.remove('hidden');
    const titleEl = document.getElementById('nahj-item-title');
    if (titleEl) titleEl.textContent = item.title;
    const contentContainer = document.getElementById('nahj-content-container');
    if (contentContainer) {
        contentContainer.innerHTML = `
            <div class="text-center mt-10 text-gray-400">
                <i class="fa-solid fa-circle-notch animate-spin text-3xl mb-3"></i>
                <p>جاري التحميل...</p>
            </div>`;
    }
    window.scrollTo(0, 0);

    // Update favorite button state and attach click handler for Nahj al‑Balagha
    if (typeof updateFavButton === 'function') {
        try {
            updateFavButton('nahj', currentNahjTab, itemIndex, item.title);
        } catch (e) {
            console.error('Error updating Nahj favorite button:', e);
        }
    }
    try {
        const content = await loadNahjContent(item.file);
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

function backToNahjCategories() {
    const itemsView = document.getElementById('nahj-items-view');
    const categoriesView = document.getElementById('nahj-categories-view');
    if (itemsView) itemsView.classList.add('hidden');
    if (categoriesView) categoriesView.classList.remove('hidden');
    window.scrollTo(0, 0);
}

function backToNahjItems() {
    const detailsView = document.getElementById('nahj-details-view');
    const itemsView = document.getElementById('nahj-items-view');
    if (detailsView) detailsView.classList.add('hidden');
    if (itemsView) itemsView.classList.remove('hidden');
    window.scrollTo(0, 0);
}

function loadNahjContent(fileName) {
    return new Promise((resolve, reject) => {
        if (typeof window.nahjContent !== 'undefined') {
            try {
                delete window.nahjContent;
            } catch (e) {
                window.nahjContent = undefined;
            }
        }
        const script = document.createElement('script');
        script.src = `js/nahj/content/${fileName}`;
        script.onload = () => {
            const content = window.nahjContent;
            script.remove();
            try {
                delete window.nahjContent;
            } catch (e) {
                window.nahjContent = undefined;
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
    renderNahjCategories();
});