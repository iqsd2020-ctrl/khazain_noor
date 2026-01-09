// js/start.js

// --- تبديل الثيم (الوضع الليلي/النهاري) ---
window.toggleTheme = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    
    // تحديث DOM و التخزين
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    State.theme = newTheme; 
    
    // تحديث أيقونات الشمس والقمر
    const sun = document.getElementById('sunIcon');
    const moon = document.getElementById('moonIcon');
    if(sun) sun.classList.toggle('hidden', !isDark);
    if(moon) moon.classList.toggle('hidden', isDark);
    
    // إعادة رسم صفحة الإعدادات لتحديث زر التبديل إذا كانت مفتوحة
    if (document.getElementById('titleEl').innerText === 'الإعدادات') {
        Views.settings(); 
    }
};

// --- التنبيه الشرعي ---
const showNote = () => {
    const noteHtml = `
        <div id="noteOverlay" style="position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 20px;">
            <div class="card fade-in" style="max-width: 320px; text-align: center; padding: 30px; border-radius: 24px; box-shadow: var(--shadow-lg); background: var(--surface);">
                <div style="width: 60px; height: 60px; background: #fffbeb; color: #d97706; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>
                <h3 style="font-weight: 800; margin-bottom: 12px; color: var(--text-main);">ملاحظة هامة</h3>
                <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px;">يبدأ اليوم الشرعي ليلاً ثم نهاراً. إذا اضطررت لفعل أمر منهي عنه، فتصدق واقرأ آية الكرسي.</p>
                <button id="closeNoteBtn" style="width: 100%; background: var(--primary); color: white; border: none; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer;">حسناً، فهمت</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', noteHtml);
    document.getElementById('closeNoteBtn').onclick = () => {
        document.getElementById('noteOverlay').remove();
        sessionStorage.setItem('noteShown', 'true');
    };
};

// --- التهيئة عند بدء التشغيل (Init) ---
function initApp() {
    // 1. تطبيق الثيم المحفوظ
    if (State.theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        const sun = document.getElementById('sunIcon');
        const moon = document.getElementById('moonIcon');
        if(sun) sun.classList.remove('hidden');
        if(moon) moon.classList.add('hidden');
    }

    // 2. تطبيق الخطوط المحفوظة
    document.documentElement.style.setProperty('--app-font', State.appFont);
    document.documentElement.style.setProperty('--reader-font', State.readerFont);

    // 3. تفعيل الأزرار في الهيدر
    const themeToggle = document.getElementById('themeToggle');
    if(themeToggle) themeToggle.onclick = window.toggleTheme;

    // 4. إظهار التنبيه الشرعي
    if (!sessionStorage.getItem('noteShown')) {
        showNote();
    }

    // 5. الانتقال للصفحة الرئيسية
    Router.navigate('home');
}

// تشغيل التطبيق
initApp();


// --- تسجيل Service Worker لتفعيل وضع PWA والعمل دون اتصال ---
(() => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        // فعّل النسخة الجديدة مباشرة عند توفرها
        if (reg.waiting) reg.waiting.postMessage('SKIP_WAITING');
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              sw.postMessage('SKIP_WAITING');
            }
          });
        });
      }).catch((err) => console.warn('SW registration failed:', err));
    });
  }
})();


// --- وضع التركيز (إخفاء الهيدر والـNav أثناء القراءة) ---
window.UI = window.UI || {};
window.UI.toggleFocusMode = () => {
  const body = document.body;
  const active = body.classList.toggle('focus-mode');
  try { localStorage.setItem('focus_mode', active ? '1' : '0'); } catch {}
  UI._syncFocusExit();
};
window.UI._syncFocusExit = () => {
  let btn = document.getElementById('focusExitBtn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'focusExitBtn';
    btn.className = 'focus-exit';
    btn.setAttribute('type', 'button');
    btn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">close_fullscreen</span><span>خروج</span>';
    btn.addEventListener('click', () => UI.toggleFocusMode());
    document.body.appendChild(btn);
  }
  btn.style.display = document.body.classList.contains('focus-mode') ? 'flex' : 'none';
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.UI && UI._syncFocusExit) UI._syncFocusExit();
});
