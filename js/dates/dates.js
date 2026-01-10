/* Hijri date calculation and occasion fetching extracted from index.html */

/**
 * Update the displayed Hijri date and fetch the occasion for the current day.
 * Uses the Islamic Umm al‑Qura calendar via Intl.DateTimeFormat. On success,
 * writes the formatted date into the #hijri-date element and triggers a
 * lookup for today’s occasion. On failure, displays a fallback message.
 */
async function updateDates() {
    const now = new Date();
    const hijriOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        calendar: 'islamic-umalqura',
        numberingSystem: 'latn'
    };
    try {
        const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', hijriOptions);
        const parts = formatter.formatToParts(now);
        let day, month, year;
        parts.forEach(part => {
            if (part.type === 'day') day = parseInt(part.value);
            if (part.type === 'month') month = part.value;
            if (part.type === 'year') year = part.value;
        });
        const hijriDateString = `${day} ${month} ${year} هـ`;
        const dateEl = document.getElementById('hijri-date');
        if (dateEl) dateEl.textContent = hijriDateString;
        await fetchTodayOccasion(day, month);
    } catch (e) {
        console.error("خطأ في حساب التاريخ الهجري:", e);
        const dateEl = document.getElementById('hijri-date');
        if (dateEl) dateEl.textContent = "التاريخ الهجري غير متاح";
    }
}

/**
 * Fetch today’s occasion from the monasbat.json file. If none exists,
 * determines the next upcoming occasion. Updates the #today-occasion-text
 * element with a formatted message. On failure, displays a default
 * invocation of prayers on Muhammad and his family.
 * @param {number} currentDay
 * @param {string} currentMonth
 */
async function fetchTodayOccasion(currentDay, currentMonth) {
    const occasionTextElement = document.getElementById('today-occasion-text');
    try {
        const response = await fetch('UP/monasbat.json');
        if (!response.ok) return;
        const data = await response.json();
        // Find current month’s data
        const monthData = data.find(m => m.tab_title === currentMonth);
        if (monthData) {
            const todayOccasion = monthData.items.find(item => {
                const dayNum = parseInt(item.title1);
                return dayNum === currentDay;
            });
            if (todayOccasion) {
                occasionTextElement.innerHTML = `<span class="text-yellow-300 font-bold">مناسبة اليوم:</span> ${todayOccasion.title2.replace(/\n/g, ' ')}`;
                return;
            }
        }
        // If no occasion today, look for the next one
        let nextOccasion = null;
        if (monthData) {
            nextOccasion = monthData.items.find(item => parseInt(item.title1) > currentDay);
        }
        if (!nextOccasion) {
            const monthOrder = [
                "محرم", "صفر", "ربيع الأول", "ربيع الثاني", "جمادى الأول", "جمادى الآخر",
                "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
            ];
            const currentMonthIndex = monthOrder.indexOf(currentMonth);
            for (let i = 1; i <= 12; i++) {
                const nextMonthIndex = (currentMonthIndex + i) % 12;
                const nextMonthName = monthOrder[nextMonthIndex];
                const nextMonthData = data.find(m => m.tab_title === nextMonthName);
                if (nextMonthData && nextMonthData.items.length > 0) {
                    nextOccasion = nextMonthData.items[0];
                    nextOccasion.monthName = nextMonthName;
                    break;
                }
            }
        }
        if (nextOccasion) {
            const displayMonth = nextOccasion.monthName || currentMonth;
            occasionTextElement.innerHTML = `<span class="opacity-60">المناسبة القادمة (${nextOccasion.title1} ${displayMonth}):</span> ${nextOccasion.title2.split('\n')[0]}`;
        } else {
            occasionTextElement.textContent = "خير ما نبدأ به الصلاة على محمد وآل محمد";
        }
    } catch (error) {
        console.error("خطأ في جلب المناسبات:", error);
        occasionTextElement.textContent = "خير ما نبدأ به الصلاة على محمد وآل محمد";
    }
}

// Automatically update dates when the document is ready
window.addEventListener('DOMContentLoaded', () => {
    updateDates();
    const body = document.body;
    if (body.classList.contains('light-mode')) {
        const icon = document.getElementById('themeIcon');
        if (icon) {
            icon.classList.replace('fa-moon', 'fa-sun');
        }
    }
});