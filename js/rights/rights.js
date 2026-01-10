/*
 * Rights (رسالة الحقوق) module
 *
 * This script provides the multi‑level navigation for the Treatise of
 * Rights section. Data is preloaded via `rightsTabs.js` which defines
 * `window.rightsTabs` as an array of category objects. Each category
 * contains a title and a list of items (individual rights) with
 * associated file names. The module renders a list of categories,
 * allows the user to browse the items within a category, and
 * displays the full text of a selected item by dynamically loading
 * its JavaScript file. This ensures offline functionality without
 * relying on HTTP requests.
 */

const rightsTabs = Array.isArray(window.rightsTabs) ? window.rightsTabs : [];
let currentRightsTab = null;

// Audio support
const rightsAudioMap = (window.rightsAudioMap && typeof window.rightsAudioMap === 'object') ? window.rightsAudioMap : {};
let currentRightsTitle = null;

function hideRightsAudio() {
    const container = document.getElementById('rights-audio-player');
    if (!container) return;
    const audioEl = container.querySelector('audio');
    if (audioEl) {
        audioEl.pause();
    }
    container.classList.add('hidden');
    const btn = document.getElementById('rights-audio-btn');
    if (btn) {
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = 'fa-solid fa-volume-high text-sm';
        }
    }
}

function toggleRightsAudio() {
    const container = document.getElementById('rights-audio-player');
    const btn = document.getElementById('rights-audio-btn');
    if (!container || !btn) return;

    const title = currentRightsTitle;
    const url = title ? rightsAudioMap[title] : null;
    if (!url) {
        // No audio available for this right
        return;
    }

    const audioEl = container.querySelector('audio');
    if (!audioEl) return;

    const isHidden = container.classList.contains('hidden');
    if (isHidden) {
        // Show and load URL if needed
        if (audioEl.dataset.src !== url) {
            audioEl.pause();
            audioEl.src = url;
            audioEl.load();
            audioEl.dataset.src = url;
        }
        container.classList.remove('hidden');
        const icon = btn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-xmark text-sm';
        // Try to play; ignore autoplay restrictions
        audioEl.play().catch(() => {});
    } else {
        hideRightsAudio();
    }
}

function renderRightsCategories() {
    const container = document.getElementById('rights-categories-container');
    if (!container) return;
    container.innerHTML = '';
    if (rightsTabs.length === 0) {
        container.innerHTML = `
            <div class="glass-card p-6 text-center text-gray-400 rounded-xl">
                <p>لا توجد مواد متاحة.</p>
            </div>`;
        return;
    }
    rightsTabs.forEach((tab, index) => {
        const card = document.createElement('div');
        card.className = 'glass-card rounded-xl p-4 cursor-pointer hover:bg-white/10 transition';
        card.innerHTML = `<h3 class="text-lg text-indigo-200 font-bold mb-1">${tab.category}</h3>`;
        card.addEventListener('click', () => openRightsItems(index));
        container.appendChild(card);
    });
}

function openRightsItems(tabIndex) {
    currentRightsTab = tabIndex;
    // Leaving details context
    currentRightsTitle = null;
    hideRightsAudio();
    const tab = rightsTabs[tabIndex];
    if (!tab) return;
    const itemsView = document.getElementById('rights-items-view');
    const categoriesView = document.getElementById('rights-categories-view');
    if (categoriesView) categoriesView.classList.add('hidden');
    if (itemsView) itemsView.classList.remove('hidden');
    const titleEl = document.getElementById('rights-category-title');
    if (titleEl) titleEl.textContent = tab.category;
    const container = document.getElementById('rights-items-container');
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
        card.addEventListener('click', () => openRightsDetails(idx));
        container.appendChild(card);
    });
    window.scrollTo(0, 0);
}

async function openRightsDetails(itemIndex) {
    const tab = rightsTabs[currentRightsTab];
    if (!tab || !tab.items[itemIndex]) return;
    const item = tab.items[itemIndex];
    currentRightsTitle = item.title;
    hideRightsAudio();
    const itemsView = document.getElementById('rights-items-view');
    const detailsView = document.getElementById('rights-details-view');
    if (itemsView) itemsView.classList.add('hidden');
    if (detailsView) detailsView.classList.remove('hidden');
    const titleEl = document.getElementById('rights-item-title');
    if (titleEl) titleEl.textContent = item.title;
    const contentContainer = document.getElementById('rights-content-container');
    if (contentContainer) {
        contentContainer.innerHTML = `
            <div class="text-center mt-10 text-gray-400">
                <i class="fa-solid fa-circle-notch animate-spin text-3xl mb-3"></i>
                <p>جاري التحميل...</p>
            </div>`;
    }
    window.scrollTo(0, 0);

    // Update favorite button state and attach click handler for Rights
    if (typeof updateFavButton === 'function') {
        try {
            updateFavButton('rights', currentRightsTab, itemIndex, item.title);
        } catch (e) {
            console.error('Error updating rights favorite button:', e);
        }
    }
    try {
        const content = await loadRightsContent(item.file);
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

function backToRightsCategories() {
    const itemsView = document.getElementById('rights-items-view');
    const categoriesView = document.getElementById('rights-categories-view');
    if (itemsView) itemsView.classList.add('hidden');
    if (categoriesView) categoriesView.classList.remove('hidden');
    currentRightsTitle = null;
    hideRightsAudio();
    window.scrollTo(0, 0);
}

function backToRightsItems() {
    const detailsView = document.getElementById('rights-details-view');
    const itemsView = document.getElementById('rights-items-view');
    if (detailsView) detailsView.classList.add('hidden');
    if (itemsView) itemsView.classList.remove('hidden');
    currentRightsTitle = null;
    hideRightsAudio();
    window.scrollTo(0, 0);
}

function loadRightsContent(fileName) {
    return new Promise((resolve, reject) => {
        if (typeof window.rightsContent !== 'undefined') {
            try {
                delete window.rightsContent;
            } catch (e) {
                window.rightsContent = undefined;
            }
        }
        const script = document.createElement('script');
        script.src = `js/rights/content/${fileName}`;
        script.onload = () => {
            const content = window.rightsContent;
            script.remove();
            try {
                delete window.rightsContent;
            } catch (e) {
                window.rightsContent = undefined;
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
    renderRightsCategories();
});