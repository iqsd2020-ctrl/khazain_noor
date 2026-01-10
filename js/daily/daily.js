/* Functions for showing daily deeds extracted from index.html */

/**
 * Open a specific day page. Hides the list of days, shows the details
 * container, updates the title and triggers loading of the day content
 * via fetchDayContent (assumed to exist elsewhere).
 * @param {string} dayName - human readable Arabic day name
 * @param {string} fileName - file name (without extension) for the content
 */
function openDayPage(dayName, fileName) {
    const dailyView = document.getElementById('daily-deeds-view');
    if (dailyView) dailyView.classList.add('hidden');
    const detailsView = document.getElementById('day-details-view');
    if (detailsView) detailsView.classList.remove('hidden');
    const titleEl = document.getElementById('day-title');
    if (titleEl) titleEl.textContent = 'أعمال ' + dayName;
    // Load the content for the selected day
    fetchDayContent(fileName);
    window.scrollTo(0, 0);
}

/**
 * Close the day details page and return to the list of days. Restores
 * the loading placeholder for the day content.
 */
function closeDayPage() {
    const detailsView = document.getElementById('day-details-view');
    if (detailsView) detailsView.classList.add('hidden');
    const dailyView = document.getElementById('daily-deeds-view');
    if (dailyView) dailyView.classList.remove('hidden');
    const container = document.getElementById('day-content-container');
    if (container) {
        container.innerHTML = `
            <div class="text-center mt-10 text-gray-400">
                <i class="fa-solid fa-circle-notch animate-spin text-3xl mb-3"></i>
                <p>جاري تحميل البيانات...</p>
            </div>`;
    }
}

/**
 * Load the content for a given day from the Day directory. The content is
 * stored as an HTML fragment within a .txt file. This function fetches the
 * file, reads it as text and injects it directly into the day‑content
 * container. If an error occurs, a fallback message is displayed.
 *
 * @param {string} fileName - The base name of the day file (e.g. 'Friday')
 */
async function fetchDayContent(fileName) {
    const container = document.getElementById('day-content-container');
    if (!container) return;
    try {
        // If preloaded content exists for this day, use it directly. This avoids
        // issues with fetching local files via the file:// protocol.
        if (typeof dayContent !== 'undefined' && dayContent[fileName]) {
            container.innerHTML = dayContent[fileName];
            return;
        }
        // Otherwise attempt to fetch the file from the Day directory
        const response = await fetch(`Day/${fileName}.txt`);
        if (!response.ok) throw new Error('HTTP error ' + response.status);
        const text = await response.text();
        container.innerHTML = text;
    } catch (error) {
        console.error('Error loading day content:', error);
        container.innerHTML = `
            <div class="glass-card p-6 text-center text-red-300 rounded-xl border border-red-500/30">
                <i class="fa-solid fa-triangle-exclamation text-3xl mb-3"></i>
                <p>عذراً، تعذر تحميل محتوى هذا اليوم.</p>
            </div>`;
    }
}