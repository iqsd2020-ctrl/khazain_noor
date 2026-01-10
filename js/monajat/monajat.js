/*
 * Monajat (المناجاة) module
 *
 * This script provides functionality similar to the supplications
 * module but specifically for the fifteen monajat (supplicatory
 * prayers). Like the duaa feature, monajat data is preloaded
 * through a small metadata file (monajatList.js) that defines
 * `window.monajatList` containing objects with `id`, `title` and
 * `file` properties. Each monajat's full content is stored in its
 * own JavaScript file within js/monajat/content and defines a
 * global variable `window.monajatContent` as a template literal. This
 * approach avoids the limitations of fetching local JSON files when
 * running the app over the file:// protocol and keeps file sizes
 * manageable. The functions below render the list, load content on
 * demand, and manage navigation between views.
 */

// Retrieve the list of monajat from the global defined in
// monajatList.js. If not available, fall back to an empty array.
const monajatList = Array.isArray(window.monajatList) ? window.monajatList : [];

// Track the currently selected monajat index. This helps determine which
// audio file to load when toggling the audio player.
let currentMonajatIndex = null;

// URLs for the monajat audio files in the same order as monajatList.
const monajatAudioUrls = [
    'https://www.shiavoice.com/media/edaie/munajat_imam_sejad/mu7amed_el7ujerat/ooo13w88n93y.mp3',
    'https://www.shiavoice.com/media/edaie/munajat_imam_sejad/mu7amed_el7ujerat/xsc2pjijopwh.mp3',
    'https://www.shiavoice.com/media/edaie/munajat_imam_sejad/mu7amed_el7ujerat/wxd55umyeb0j.mp3',
    'https://www.shiavoice.com/media/edaie/munajat_imam_sejad/mu7amed_el7ujerat/smd8w0wkk1ut.mp3',
    'https://www.shiavoice.com/media/edaie/munajat_imam_sejad/mu7amed_el7ujerat/krn1mtnex9pg.mp3',
    'https://www.shiavoice.com/media/edaie/munajat_imam_sejad/mu7amed_el7ujerat/rqgsi180c95h.mp3',
    'https://www.shiavoice.com/media/edaie/munajat_imam_sejad/mu7amed_el7ujerat/dkewntv844en.mp3',
    'https://www.shiavoice.com/media/edaie/munajat_imam_sejad/mu7amed_el7ujerat/evo3qhfar821.mp3',
    'https://www.shiavoice.com/media/edaie/munajat_imam_sejad/mu7amed_el7ujerat/kkwzkdw21gfp.mp3',
    'https://www.shiavoice.com/media/edaie/munajat_imam_sejad/mu7amed_el7ujerat/gxni80636gbh.mp3',
    'https://www.shiavoice.com/media/edaie/munajat_imam_sejad/mu7amed_el7ujerat/foemdaja6c88.mp3',
    'https://www.shiavoice.com/media/edaie/munajat_imam_sejad/mu7amed_el7ujerat/vqvw6yp3ha36.mp3',
    'https://www.shiavoice.com/media/edaie/munajat_imam_sejad/mu7amed_el7ujerat/ind9dmnkdbw5.mp3',
    'https://www.shiavoice.com/media/edaie/munajat_imam_sejad/mu7amed_el7ujerat/rxprxn0g3dt5.mp3',
    'https://www.shiavoice.com/media/edaie/munajat_imam_sejad/mu7amed_el7ujerat/tk33q7ozib7m.mp3'
];

/**
 * Toggle the audio player for the current monajat. When showing, load the
 * appropriate MP3 based on currentMonajatIndex and start playback. When
 * hiding, pause playback and hide the player. The player element is
 * created lazily and reused across toggles.
 */
function toggleMonajatAudio() {
    const playerContainer = document.getElementById('monajat-audio-player');
    if (!playerContainer) return;
    // Ensure there is an audio element inside the container
    let audioEl = playerContainer.querySelector('audio');
    if (!audioEl) {
        audioEl = document.createElement('audio');
        audioEl.controls = true;
        audioEl.className = 'w-full';
        playerContainer.appendChild(audioEl);
    }
    // Determine audio source based on currentMonajatIndex
    const url = Array.isArray(monajatAudioUrls) && currentMonajatIndex != null ? monajatAudioUrls[currentMonajatIndex] : null;
    if (!url) return;
    if (playerContainer.classList.contains('hidden')) {
        // Show and play
        audioEl.src = url;
        playerContainer.classList.remove('hidden');
        audioEl.play().catch(() => {});
    } else {
        // Hide and pause
        audioEl.pause();
        playerContainer.classList.add('hidden');
    }
}

// Expose the toggle function to the global scope so it can be called from HTML
if (typeof window !== 'undefined') {
    window.toggleMonajatAudio = toggleMonajatAudio;
}

/**
 * Render the list of monajat titles into the container. Each
 * title becomes a clickable card that opens the corresponding
 * monajat details when clicked. If the list is empty, a
 * placeholder message is shown.
 */
function renderMonajatList() {
    const container = document.getElementById('monajat-list-container');
    if (!container) return;
    // Clear existing content
    container.innerHTML = '';
    if (monajatList.length === 0) {
        container.innerHTML = `
            <div class="glass-card p-6 text-center text-gray-400 rounded-xl">
                <p>لا توجد مناجاة متاحة.</p>
            </div>`;
        return;
    }
    // Create a card for each monajat
    monajatList.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'glass-card rounded-xl p-4 cursor-pointer hover:bg-white/10 transition';
        card.innerHTML = `<h3 class="text-lg text-indigo-200 font-bold mb-1">${item.title}</h3>`;
        card.addEventListener('click', () => openMonajatDetails(index));
        container.appendChild(card);
    });
}

/**
 * Dynamically load a content script for a given monajat file.
 * The script is expected to define a global variable
 * `window.monajatContent` containing the HTML content of the
 * monajat. The returned Promise resolves with the value of
 * `window.monajatContent` and cleans up the inserted script
 * element afterward. If an error occurs during loading, the
 * Promise rejects.
 *
 * @param {string} fileName - Name of the JavaScript file containing
 *   the monajat content (e.g. "1.js").
 * @returns {Promise<string>} Promise resolving with the content string
 */
function loadMonajatContent(fileName) {
    return new Promise((resolve, reject) => {
        // Remove any previous global content definition
        if (typeof window.monajatContent !== 'undefined') {
            try {
                delete window.monajatContent;
            } catch (e) {
                window.monajatContent = undefined;
            }
        }
        const script = document.createElement('script');
        script.src = `js/monajat/content/${fileName}`;
        script.onload = () => {
            const content = window.monajatContent;
            // Clean up: remove script element and delete global content
            script.remove();
            try {
                delete window.monajatContent;
            } catch (e) {
                window.monajatContent = undefined;
            }
            if (typeof content === 'string') {
                resolve(content);
            } else {
                reject(new Error('No content defined in script'));
            }
        };
        script.onerror = () => {
            script.remove();
            reject(new Error('Failed to load monajat content'));
        };
        document.body.appendChild(script);
    });
}

/**
 * Open the details view for a specific monajat by its index in
 * monajatList. This function updates the title, loads the content
 * asynchronously via loadMonajatContent, and handles UI transitions
 * between the list and details views. A loading spinner is shown
 * while the content script loads.
 *
 * @param {number} index - Index of the selected monajat
 */
async function openMonajatDetails(index) {
    const item = monajatList[index];
    if (!item) return;
    // Set current monajat index for audio playback
    currentMonajatIndex = index;
    // Update title
    const titleEl = document.getElementById('monajat-title');
    if (titleEl) titleEl.textContent = item.title;
    // Show a loading placeholder while fetching content
    const contentContainer = document.getElementById('monajat-content-container');
    if (contentContainer) {
        contentContainer.innerHTML = `
            <div class="text-center mt-10 text-gray-400">
                <i class="fa-solid fa-circle-notch animate-spin text-3xl mb-3"></i>
                <p>جاري تحميل المناجاة...</p>
            </div>`;
    }
    // Show details view and hide list view before content loads
    const listView = document.getElementById('monajat-list-view');
    const detailsView = document.getElementById('monajat-details-view');
    if (listView) listView.classList.add('hidden');
    if (detailsView) detailsView.classList.remove('hidden');
    window.scrollTo(0, 0);

    // Hide and pause any existing audio player for monajat
    const playerContainer = document.getElementById('monajat-audio-player');
    if (playerContainer) {
        const audioEl = playerContainer.querySelector('audio');
        if (audioEl) {
            audioEl.pause();
        }
        playerContainer.classList.add('hidden');
    }

    // Update favorite button state and attach click handler
    if (typeof updateFavButton === 'function') {
        try {
            updateFavButton('monajat', null, index, item.title);
        } catch (e) {
            console.error('Error updating monajat favorite button:', e);
        }
    }
    try {
        const content = await loadMonajatContent(item.file);
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
                    <p>عذراً، تعذر تحميل هذه المناجاة.</p>
                </div>`;
        }
        console.error(error);
    }
}

/**
 * Close the monajat details view and return to the list view.
 */
function closeMonajatDetails() {
    const detailsView = document.getElementById('monajat-details-view');
    const listView = document.getElementById('monajat-list-view');
    if (detailsView) detailsView.classList.add('hidden');
    if (listView) listView.classList.remove('hidden');
    // Pause and hide audio when closing monajat details
    const playerContainer = document.getElementById('monajat-audio-player');
    if (playerContainer) {
        const audioEl = playerContainer.querySelector('audio');
        if (audioEl) audioEl.pause();
        playerContainer.classList.add('hidden');
    }
    window.scrollTo(0, 0);
}

// Initialize the monajat list once the DOM is ready. We do not
// need to perform asynchronous loading here since monajatList is
// preloaded via monajatList.js. This ensures the UI updates quickly.
document.addEventListener('DOMContentLoaded', () => {
    renderMonajatList();
});