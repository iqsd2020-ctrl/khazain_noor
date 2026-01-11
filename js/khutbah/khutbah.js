/*
 * Khutbah (خطب الجمعة) module
 *
 * This module manages the Friday sermons section of the Khaza'in al‑Nur
 * application. The data for each Friday and its two sermons is
 * preloaded via `khutbahTabs.js` into the global variable
 * `window.khutbahTabs`. Each entry in this array includes a category
 * (the Friday title) and two items corresponding to the first and
 * second khutbah. The content for each khutbah resides in a
 * separate JavaScript file under `js/khutbah/content` that defines
 * `window.khutbahContent` when loaded. This script renders the list
 * of Fridays, allows navigation to view the two khutbahs, loads
 * content on demand, and integrates with the favorites and search
 * features.
 */

// Retrieve preloaded khutbah data. Fallback to empty array to avoid errors.
const khutbahTabs = Array.isArray(window.khutbahTabs) ? window.khutbahTabs : [];

// Audio URLs for each Friday sermon. Each entry corresponds to the
// category index in khutbahTabs. These URLs point to audio files
// hosted remotely, allowing users to listen while reading. If a
// category has two khutbahs, both will use the same audio file.
const khutbahAudioUrls = [
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-1.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-2.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-3.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-4.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-5.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-6.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-7.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-8.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-9.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-10.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-11.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-12.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-13.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-14.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-15.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-16.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-17.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-18.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-19.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-20.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-21.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-22.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-23.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-24.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-25.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-26.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-27.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-28.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-29.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-30.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-31.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-32.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-33.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-34.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-35.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-36.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-37.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-38.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-39.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-40.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-41.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-42.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-43.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-44.mp3",
    "https://alsaydalsadr.app/wp-content/uploads/2024/10/alkhutab-45.mp3",
];

/**
 * Toggle the khutbah audio player for the current category. If the
 * player is hidden, it will be shown and the audio source set
 * according to the currently active Friday. If the player is already
 * visible, it will be hidden and playback will stop. The same
 * audio file is used for both khutbahs of a given Friday.
 */
function toggleKhutbahAudio() {
    const container = document.getElementById('khutbah-audio-player');
    if (!container) return;
    // Initialize audio element on first use
    let audio = document.getElementById('khutbah-audio-element');
    if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'khutbah-audio-element';
        audio.controls = true;
        audio.className = 'w-full';
        container.appendChild(audio);
    }
    // Determine the audio URL for the current Friday
    const url = khutbahAudioUrls[currentKhutbahCategory] || null;
    if (url) {
        audio.src = url;
    }
    // Toggle visibility and playback
    if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        try {
            audio.play();
        } catch (e) {
            console.error('Failed to play khutbah audio:', e);
        }
    } else {
        container.classList.add('hidden');
        audio.pause();
        audio.currentTime = 0;
    }
}

// Track which Friday category is currently active. This helps when
// opening details so we know which category to reference.
let currentKhutbahCategory = null;

/**
 * Render the list of Friday categories into the khutbah categories
 * container. If no data is available, show a placeholder message.
 */
function renderKhutbahCategories() {
    const container = document.getElementById('khutbah-categories-container');
    if (!container) return;
    container.innerHTML = '';
    if (!Array.isArray(khutbahTabs) || khutbahTabs.length === 0) {
        container.innerHTML = `
            <div class="glass-card p-6 text-center text-gray-400 rounded-xl">
                لا توجد خطب متاحة.
            </div>`;
        return;
    }
    khutbahTabs.forEach((tab, index) => {
        const card = document.createElement('div');
        card.className = 'glass-card rounded-xl p-4 cursor-pointer hover:bg-white/10 transition';
        card.innerHTML = `<h3 class="text-lg text-indigo-200 font-bold mb-1">${tab.category}</h3>`;
        card.addEventListener('click', () => openKhutbahItems(index));
        container.appendChild(card);
    });
}

/**
 * Show the two khutbahs for the selected Friday. Updates the title
 * and switches the view from the categories list to the items list.
 * @param {number} index Index of the selected Friday in khutbahTabs
 */
function openKhutbahItems(index) {
    currentKhutbahCategory = index;
    const tab = khutbahTabs[index];
    if (!tab) return;
    const categoriesView = document.getElementById('khutbah-categories-view');
    const itemsView = document.getElementById('khutbah-items-view');
    if (categoriesView) categoriesView.classList.add('hidden');
    if (itemsView) itemsView.classList.remove('hidden');
    const titleEl = document.getElementById('khutbah-category-title');
    if (titleEl) titleEl.textContent = tab.category;
    const container = document.getElementById('khutbah-items-container');
    if (!container) return;
    container.innerHTML = '';
    const items = Array.isArray(tab.items) ? tab.items : [];
    if (items.length === 0) {
        container.innerHTML = `
            <div class="glass-card p-6 text-center text-gray-400 rounded-xl">
                لا توجد خطب في هذا القسم.
            </div>`;
        return;
    }
    items.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'glass-card rounded-xl p-4 cursor-pointer hover:bg-white/10 transition';
        card.innerHTML = `<h3 class="text-lg text-indigo-200 font-bold mb-1">${item.title}</h3>`;
        card.addEventListener('click', () => openKhutbahDetails(idx));
        container.appendChild(card);
    });
    window.scrollTo(0, 0);
}

/**
 * Load and display the selected khutbah. Shows a loading spinner
 * while the content is fetched and integrates with the favorites
 * system to update the star icon. If loading fails, an error
 * message is shown.
 *
 * @param {number} itemIndex Index of the khutbah within the current category
 */
async function openKhutbahDetails(itemIndex) {
    const tab = khutbahTabs[currentKhutbahCategory];
    if (!tab || !tab.items[itemIndex]) return;
    const item = tab.items[itemIndex];
    const itemsView = document.getElementById('khutbah-items-view');
    const detailsView = document.getElementById('khutbah-details-view');
    if (itemsView) itemsView.classList.add('hidden');
    if (detailsView) detailsView.classList.remove('hidden');
    const titleEl = document.getElementById('khutbah-item-title');
    if (titleEl) titleEl.textContent = item.title;
    const contentContainer = document.getElementById('khutbah-content-container');
    if (contentContainer) {
        contentContainer.innerHTML = `
            <div class="text-center mt-10 text-gray-400">
                <i class="fa-solid fa-circle-notch animate-spin text-3xl mb-3"></i>
                <p>جاري التحميل...</p>
            </div>`;
    }
    window.scrollTo(0, 0);
    // Hide and reset audio player when opening a new khutbah
    const audioContainer = document.getElementById('khutbah-audio-player');
    if (audioContainer) {
        audioContainer.classList.add('hidden');
        const audioEl = document.getElementById('khutbah-audio-element');
        if (audioEl) {
            audioEl.pause();
            audioEl.currentTime = 0;
        }
    }
    // Update favorite button state for khutbah
    if (typeof updateFavButton === 'function') {
        try {
            updateFavButton('khutbah', currentKhutbahCategory, itemIndex, item.title);
        } catch (e) {
            console.error('Error updating khutbah favorite button:', e);
        }
    }
    try {
        const content = await loadKhutbahContent(item.file);
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
                    <p>عذراً، تعذر تحميل الخطبة.</p>
                </div>`;
        }
        console.error(error);
    }
}

/**
 * Return from the khutbah items list back to the categories list.
 */
function backToKhutbahCategories() {
    const itemsView = document.getElementById('khutbah-items-view');
    const categoriesView = document.getElementById('khutbah-categories-view');
    if (itemsView) itemsView.classList.add('hidden');
    if (categoriesView) categoriesView.classList.remove('hidden');
    window.scrollTo(0, 0);
}

/**
 * Return from the khutbah details view back to the items list.
 */
function backToKhutbahItems() {
    const detailsView = document.getElementById('khutbah-details-view');
    const itemsView = document.getElementById('khutbah-items-view');
    if (detailsView) detailsView.classList.add('hidden');
    if (itemsView) itemsView.classList.remove('hidden');
    // Hide and reset the audio player when leaving khutbah details
    const audioContainer = document.getElementById('khutbah-audio-player');
    if (audioContainer) {
        audioContainer.classList.add('hidden');
        const audioEl = document.getElementById('khutbah-audio-element');
        if (audioEl) {
            audioEl.pause();
            audioEl.currentTime = 0;
        }
    }
    window.scrollTo(0, 0);
}

/**
 * Dynamically load the content for a given khutbah. The content file
 * defines `window.khutbahContent`. After loading, the script element
 * and global variable are cleaned up.
 *
 * @param {string} fileName Name of the content script
 * @returns {Promise<string>} Promise resolving with the content string
 */
function loadKhutbahContent(fileName) {
    return new Promise((resolve, reject) => {
        if (typeof window.khutbahContent !== 'undefined') {
            try {
                delete window.khutbahContent;
            } catch (e) {
                window.khutbahContent = undefined;
            }
        }
        const script = document.createElement('script');
        script.src = `js/khutbah/content/${fileName}`;
        script.onload = () => {
            const content = window.khutbahContent;
            script.remove();
            try {
                delete window.khutbahContent;
            } catch (e) {
                window.khutbahContent = undefined;
            }
            if (typeof content === 'string') {
                resolve(content);
            } else {
                reject(new Error('No content defined in khutbah script'));
            }
        };
        script.onerror = () => {
            script.remove();
            reject(new Error('Failed to load khutbah content'));
        };
        document.body.appendChild(script);
    });
}

// Initialize the khutbah categories when the DOM is ready and
// register the khutbah titles for search. This ensures that
// searchData includes khutbah items and that the list is rendered
// before a user navigates to it.
document.addEventListener('DOMContentLoaded', () => {
    try {
        renderKhutbahCategories();
    } catch (e) {
        console.error('Error rendering khutbah categories:', e);
    }
    // Extend searchData with khutbah entries if available
    if (Array.isArray(window.searchData)) {
        khutbahTabs.forEach((tab, catIdx) => {
            const items = Array.isArray(tab.items) ? tab.items : [];
            items.forEach((itm, itmIdx) => {
                window.searchData.push({
                    title: itm.title,
                    section: 'khutbah',
                    categoryIndex: catIdx,
                    itemIndex: itmIdx
                });
            });
        });
    }
});