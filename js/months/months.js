/* Functions for displaying monthly occasions extracted from index.html */

// Map of month identifiers to their Arabic names. Used when loading
// occasions from the JSON data file.
const monthNameMap = {
    'muharram': 'محرم',
    'safar': 'صفر',
    'rabi1': 'ربيع الأول',
    'rabi2': 'ربيع الثاني',
    'jumada1': 'جمادى الأول',
    'jumada2': 'جمادى الآخر',
    'rajab': 'رجب',
    'shaban': 'شعبان',
    'ramadan': 'رمضان',
    'shawwal': 'شوال',
    'dhulqada': 'ذو القعدة',
    'dhulhijjah': 'ذو الحجة'
};

/**
 * Open the occasions page for a particular month. Hides the months grid,
 * shows the details view, updates the title and fetches the data for
 * that month from the monasbat.json file. If no data exists, displays
 * a placeholder message. Scrolls to the top when done.
 * @param {string} monthId - identifier of the month (e.g. 'ramadan')
 */
async function openMonthOccasions(monthId) {
    const monthsView = document.getElementById('months-view');
    if (monthsView) monthsView.classList.add('hidden');
    const detailsView = document.getElementById('occasions-details-view');
    if (detailsView) detailsView.classList.remove('hidden');
    const arabicName = monthNameMap[monthId];
    const titleEl = document.getElementById('month-occasions-title');
    if (titleEl) titleEl.textContent = 'مناسبات شهر ' + arabicName;
    const container = document.getElementById('occasions-container');
    if (container) {
        container.innerHTML = `
            <div class="text-center mt-10 text-gray-400">
                <i class="fa-solid fa-circle-notch animate-spin text-3xl mb-3"></i>
                <p>جاري جلب البيانات...</p>
            </div>`;
    }
    try {
        const response = await fetch('UP/monasbat.json');
        if (!response.ok) throw new Error('لم يتم العثور على الملف');
        const data = await response.json();
        const monthData = data.find(m => m.tab_title === arabicName);
        if (container) {
            container.innerHTML = '';
            if (monthData && monthData.items.length > 0) {
                monthData.items.forEach(item => {
                    const card = `
                        <div class="glass-card rounded-xl p-4 flex flex-col items-start text-right border-r-4 border-indigo-500 hover:bg-white/5 transition">
                            <span class="bg-indigo-500/20 text-indigo-200 px-2 py-1 rounded text-xs font-bold mb-2 inline-block">
                                <i class="fa-regular fa-calendar ml-1"></i> ${item.title1}
                            </span>
                            <p class="text-white text-base leading-relaxed md:text-lg card-title">
                                ${item.title2.replace(/\n/g, '<br>')}
                            </p>
                        </div>
                    `;
                    container.innerHTML += card;
                });
            } else {
                container.innerHTML = `
                    <div class="glass-card p-6 text-center text-gray-400 rounded-xl">
                        <p>لا توجد مناسبات مسجلة لهذا الشهر.</p>
                    </div>`;
            }
        }
    } catch (error) {
        console.error(error);
        if (container) {
            container.innerHTML = `
                <div class="glass-card p-6 text-center text-red-300 rounded-xl border border-red-500/30">
                    <i class="fa-solid fa-triangle-exclamation text-3xl mb-3"></i>
                    <p>عذراً، حدث خطأ أثناء تحميل البيانات.</p>
                    <p class="text-xs mt-2 opacity-70">تأكد من وجود الملف file/monasbat.json</p>
                </div>`;
        }
    }
    window.scrollTo(0, 0);
}

/**
 * Close the occasions details page and return to the months grid.
 */
function closeOccasionsPage() {
    const detailsView = document.getElementById('occasions-details-view');
    if (detailsView) detailsView.classList.add('hidden');
    const monthsView = document.getElementById('months-view');
    if (monthsView) monthsView.classList.remove('hidden');
}