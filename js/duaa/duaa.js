/*
 * Supplications (الأدعية) module
 *
 * This script renders a list of supplication titles and, upon user
 * selection, loads the full content from separate JavaScript files.
 * Due to browser security restrictions when running off the file://
 * protocol, we cannot fetch local JSON files using the Fetch API. To
 * work around this, a small metadata file (duaaList.js) is loaded
 * ahead of time via a <script> tag. Each entry in that list
 * contains an id, title and the name of a corresponding content
 * script in js/duaa/content. When a user clicks on a title, we
 * dynamically load the appropriate content script into the page to
 * retrieve the string defining `window.duaaContent`. This approach
 * avoids bundling all supplications into a single large script and
 * still works offline.
 */

// Retrieve the list of supplications from the global defined in
// duaaList.js. If not available, fall back to an empty array. Each
// entry should be an object with properties: id, title, file.
const duaaList = (Array.isArray(window.duaaList) ? window.duaaList : []);

// Track which supplication is currently active. This helps the audio module know
// which audio URL to load when toggling playback.
let currentDuaaIndex = null;

// URLs for supplication audio files. Each index corresponds to the order
// of items in duaaList. Entries that are `null` mean no audio is available
// for that supplication. These values were derived from the provided
// dua_links.json, de‑duplicated and matched by title.
const duaaAudioUrls = [
    'https://shiavoice.com/media/edaie/du3a_kumail/dvk4uhpurqhr.mp3',
    'https://shiavoice.com/media/edaie/du3a_3eshrat/xsdi2jde3xhq.mp3',
    'https://shiavoice.com/media/edaie/du3a_elsmat/xb7v5tfbt71k.mp3',
    'https://shiavoice.com/media/edaie/du3a_mashlool/hp4aer6qk4ke.mp3',
    'https://shiavoice.com/media/edaie/du3a_ysteshir/ihpasjp0mwi9.mp3',
    'https://shiavoice.com/media/edaie/du3a_mujir/ru0jjbybt7tbktm.mp3',
    'https://shiavoice.com/media/edaie/du3a_el3edile/dh7xfo5eecwum5x.mp3',
    'https://shiavoice.com/media/edaie/du3a_jawshan/oc2gy8wu183u.mp3',
    'https://shiavoice.com/media/edaie/du3a_jawshan_zeger/mks0s4vkro9u.mp3',
    'https://shiavoice.com/media/edaie/mutefereqe/htj0hjkedfze.mp3',
    'https://shiavoice.com/media/edaie/du3a_el7zin/kqrvk78kklhr5qy.mp3',
    'https://shiavoice.com/media/edaie/du3a_eltewesul/tsunwxptnk57.mp3',
    'https://shiavoice.com/media/edaie/asdarat/mirza_hussein_kazim/ed3ie_rejab2/mw8sw2dxaja0.mp3',
    'https://shiavoice.com/media/edaie/du3a_nudbe/4gbktohimqefsuz.mp3',
    'https://shiavoice.com/media/edaie/du3a_ehl_elthkur/zeqtoiidxiv0.mp3',
    'https://shiavoice.com/media/edaie/du3a_seba7/zjqtnf5490ow.mp3',
    null,
    'https://shiavoice.com/media/edaie/asdarat/hussein_qarib/rab_nor_elathim/5ntpv6g90tmfaim.mp3',
    'https://shiavoice.com/media/edaie/asdarat/hussein_elakref/adaeiat_layali_alqadr/cjnwpwu2lnumagx.mp3',
    'https://shiavoice.com/media/edaie/du3a_behae/ivaxr1zwdfhn.mp3',
    'https://shiavoice.com/media/edaie/du3a_yamefze3i/uexdvwcvbs77.mp3',
    'https://shiavoice.com/media/edaie/du3a_ya3udeti/qaad7tcsnbak.mp3',
    null,
    null,
    null,
    'https://shiavoice.com/media/zeiarat/mutefere8e/uhhc8us6ee50rmz.mp3',
    'https://shiavoice.com/media/edaie/du3a_3qleme/ksd2keofjpkh.mp3',
    'https://shiavoice.com/media/edaie/asdarat/3abd_elhei_alqember/edaie_sher_rajab/gpguvucrvvkc5l7.mp3',
    null,
    'https://shiavoice.com/media/edaie/asdarat/ahmed_elfetlawi/tewesul_eldemua/xytqvjpe46z2.mp3',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null
];

/**
 * Toggle the audio player visibility for the current supplication. When shown, it
 * loads the appropriate MP3 file based on the currentDuaaIndex and starts
 * playing. When hidden, playback is paused and the player is hidden.
 */
function toggleDuaaAudio() {
    const playerContainer = document.getElementById('duaa-audio-player');
    if (!playerContainer) return;
    let audioEl = playerContainer.querySelector('audio');
    if (!audioEl) {
        audioEl = document.createElement('audio');
        audioEl.controls = true;
        audioEl.className = 'w-full';
        playerContainer.appendChild(audioEl);
    }
    const url = Array.isArray(duaaAudioUrls) && currentDuaaIndex != null ? duaaAudioUrls[currentDuaaIndex] : null;
    if (!url) {
        // If no audio is available for this supplication, simply hide the player
        return;
    }
    if (playerContainer.classList.contains('hidden')) {
        audioEl.src = url;
        playerContainer.classList.remove('hidden');
        audioEl.play().catch(() => {});
    } else {
        audioEl.pause();
        playerContainer.classList.add('hidden');
    }
}

// Expose the audio toggle function to the global scope so it can be called from HTML
if (typeof window !== 'undefined') {
    window.toggleDuaaAudio = toggleDuaaAudio;
}

/**
 * Render the list of supplication titles into the container. Each
 * title becomes a clickable card that opens the corresponding
 * supplication details when clicked. If the list is empty, a
 * placeholder message is shown.
 */
function renderDuaaList() {
    const container = document.getElementById('duaa-list-container');
    if (!container) return;
    // Clear existing content
    container.innerHTML = '';
    if (duaaList.length === 0) {
        container.innerHTML = `
            <div class="glass-card p-6 text-center text-gray-400 rounded-xl">
                <p>لا توجد أدعية متاحة.</p>
            </div>`;
        return;
    }
    // Create a card for each supplication
    duaaList.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'glass-card rounded-xl p-4 cursor-pointer hover:bg-white/10 transition';
        card.innerHTML = `<h3 class="text-lg text-indigo-200 font-bold mb-1">${item.title}</h3>`;
        card.addEventListener('click', () => openDuaaDetails(index));
        container.appendChild(card);
    });
}

/**
 * Dynamically load a content script for a given supplication file.
 * The script is expected to define a global variable `window.duaaContent`
 * containing the HTML content of the supplication. The returned
 * Promise resolves with the value of `window.duaaContent` and cleans
 * up the inserted script element afterward. If an error occurs
 * during loading, the Promise rejects.
 *
 * @param {string} fileName - Name of the JavaScript file containing
 *   the supplication content (e.g. "3201.js").
 * @returns {Promise<string>} Promise resolving with the content string
 */
function loadDuaaContent(fileName) {
    return new Promise((resolve, reject) => {
        // Remove any previous global content definition
        if (typeof window.duaaContent !== 'undefined') {
            try {
                delete window.duaaContent;
            } catch (e) {
                window.duaaContent = undefined;
            }
        }
        const script = document.createElement('script');
        script.src = `js/duaa/content/${fileName}`;
        script.onload = () => {
            const content = window.duaaContent;
            // Clean up: remove script element and delete global content
            script.remove();
            // Note: leaving duaaContent undefined ensures subsequent
            // loads replace it.
            try {
                delete window.duaaContent;
            } catch (e) {
                window.duaaContent = undefined;
            }
            if (typeof content === 'string') {
                resolve(content);
            } else {
                reject(new Error('No content defined in script'));
            }
        };
        script.onerror = () => {
            script.remove();
            reject(new Error('Failed to load supplication content'));
        };
        document.body.appendChild(script);
    });
}

/**
 * Open the details view for a specific supplication by its index in
 * duaaList. This function updates the title, loads the content
 * asynchronously via loadDuaaContent, and handles UI transitions
 * between the list and details views. A loading spinner is shown
 * while the content script loads.
 *
 * @param {number} index - Index of the selected supplication
 */
async function openDuaaDetails(index) {
    const item = duaaList[index];
    if (!item) return;
    // Update the currently active supplication index for audio playback
    currentDuaaIndex = index;
    // Update title
    const titleEl = document.getElementById('duaa-title');
    if (titleEl) titleEl.textContent = item.title;
    // Show a loading placeholder while fetching content
    const contentContainer = document.getElementById('duaa-content-container');
    if (contentContainer) {
        contentContainer.innerHTML = `
            <div class="text-center mt-10 text-gray-400">
                <i class="fa-solid fa-circle-notch animate-spin text-3xl mb-3"></i>
                <p>جاري تحميل الدعاء...</p>
            </div>`;
    }
    // Show details view and hide list view before content loads
    const listView = document.getElementById('duaa-list-view');
    const detailsView = document.getElementById('duaa-details-view');
    if (listView) listView.classList.add('hidden');
    if (detailsView) detailsView.classList.remove('hidden');
    window.scrollTo(0, 0);

    // Hide any existing audio player and pause playback when opening a new supplication
    const audioContainer = document.getElementById('duaa-audio-player');
    if (audioContainer) {
        const audioEl = audioContainer.querySelector('audio');
        if (audioEl) {
            audioEl.pause();
        }
        audioContainer.classList.add('hidden');
    }

    // Update favorite button state and attach click handler
    if (typeof updateFavButton === 'function') {
        try {
            updateFavButton('duaa', null, index, item.title);
        } catch (e) {
            console.error('Error updating duaa favorite button:', e);
        }
    }
    try {
        const content = await loadDuaaContent(item.file);
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
                    <p>عذراً، تعذر تحميل هذا الدعاء.</p>
                </div>`;
        }
        console.error(error);
    }
}

/**
 * Close the supplication details view and return to the list view.
 */
function closeDuaaDetails() {
    const detailsView = document.getElementById('duaa-details-view');
    const listView = document.getElementById('duaa-list-view');
    if (detailsView) detailsView.classList.add('hidden');
    if (listView) listView.classList.remove('hidden');
    window.scrollTo(0, 0);
    // When leaving the details view, hide and pause any active audio player
    const audioContainer = document.getElementById('duaa-audio-player');
    if (audioContainer) {
        const audioEl = audioContainer.querySelector('audio');
        if (audioEl) {
            audioEl.pause();
        }
        audioContainer.classList.add('hidden');
    }
}

// Initialize the supplications list once the DOM is ready. We do not
// need to perform asynchronous loading here since duaaList is
// preloaded via duaaList.js. This ensures the UI updates quickly.
document.addEventListener('DOMContentLoaded', () => {
    renderDuaaList();
});