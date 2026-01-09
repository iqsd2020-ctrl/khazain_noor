// js/actions.js
// Centralized event delegation to avoid inline onclick handlers.
// Uses data-action + data-* attributes.
// Safe no-op if target module is not loaded.

(function () {

  const showToast = (msg) => {
    try {
      let el = document.getElementById('toast');
      if (!el) {
        el = document.createElement('div');
        el.id = 'toast';
        el.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:var(--bg-card);color:var(--text);padding:10px 14px;border-radius:14px;box-shadow:var(--shadow-md);border:1px solid var(--border);z-index:9999;opacity:0;transition:opacity .2s ease, transform .2s ease;pointer-events:none;font-weight:700;font-size:.95rem;';
        document.body.appendChild(el);
      }
      el.textContent = msg;
      el.style.opacity = '1';
      el.style.transform = 'translateX(-50%) translateY(0)';
      clearTimeout(el._t);
      el._t = setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(-50%) translateY(6px)';
      }, 1500);
    } catch {}
  };
  const safeJsonParse = (s) => {
    try { return JSON.parse(s); } catch { return null; }
  };

  const getPayload = (el) => {
    const p = el.getAttribute('data-payload');
    if (p) return safeJsonParse(p) || {};
    return null;
  };

  const handle = (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;

    const action = el.dataset.action;

    // Special: only close modal/overlay when the overlay itself was clicked
    if (action === 'close-font-modal') {
      if (el.id === 'fontModal' && e.target === el && window.Utils?.closeFontModal) {
        window.Utils.closeFontModal(e);
      }
      return;
    }
    if (action === 'toggle-sidebar-overlay') {
      if (el.id === 'sidebarOverlay' && e.target === el && window.Views?.toggleSidebar) {
        window.Views.toggleSidebar();
      }
      return;
    }

    switch (action) {
      case 'navigate': {
        const page = el.dataset.page || el.dataset.target;
        const payload = getPayload(el);
        if (window.Router?.navigate) window.Router.navigate(page, payload || null);
        break;
      }
      case 'show-category': {
        const key = el.dataset.category;
        if (window.Views?.showCategory) window.Views.showCategory(key);
        break;
      }
      case 'show-category-tab': {
        const key = el.dataset.category;
        const idxStr = el.dataset.index;
        const idx = idxStr ? parseInt(idxStr, 10) : 0;
        if (window.Views?.showCategoryTab) window.Views.showCategoryTab(key, idx);
        break;
      }
      case 'toggle-sidebar': {
        if (window.Views?.toggleSidebar) window.Views.toggleSidebar();
        break;
      }
      case 'toggle-search': {
        if (window.Views?.toggleSearch) window.Views.toggleSearch();
        break;
      }
      case 'font-size': {
        const delta = parseInt(el.dataset.delta || '0', 10);
        if (Number.isFinite(delta) && window.Utils?.changeFontSize) window.Utils.changeFontSize(delta);
        break;
      }
      case 'open-font-modal': {
        const target = el.dataset.target || 'app';
        if (window.Utils?.openFontModal) window.Utils.openFontModal(target);
        break;
      }
      case 'select-font': {
        const type = el.dataset.type;
        const font = el.dataset.font;
        if (window.Utils?.selectFont) window.Utils.selectFont(type, font);
        break;
      }
      case 'toggle-theme': {
        if (window.toggleTheme) window.toggleTheme();
        break;
      }
      case 'toggle-focus': {
        if (window.UI?.toggleFocusMode) window.UI.toggleFocusMode();
        break;
      }
      case 'toggle-verse-search': {
        if (window.Quran?.toggleVerseSearch) window.Quran.toggleVerseSearch();
        break;
      }
      case 'resume-last-surah': {
        const last = safeJsonParse(localStorage.getItem('quran_last') || '');
        if (last?.surahId && window.Router?.navigate) window.Router.navigate('surah', last.surahId);
        break;
      }
      case 'open-reader': {
        // Supports either data-payload JSON or individual attrs
        const payload = getPayload(el) || {};
        const title = el.dataset.title;
        const file = el.dataset.file;
        const id = el.dataset.id;
        const categoryKey = el.dataset.categorykey;
        const groupIndex = el.dataset.groupindex;
        const fromDays = el.dataset.fromdays === 'true';

        if (title) payload.title = title;
        if (file) payload.file = file;
        if (id) payload.id = id;
        if (categoryKey) payload.categoryKey = categoryKey;
        if (fromDays) payload.fromDays = true;

        // If we are opening from a grouped category list, store scroll position and pass group index
        if (categoryKey && typeof groupIndex !== 'undefined') {
          try {
            const appEl = document.getElementById('app');
            if (appEl) {
              localStorage.setItem('scroll_' + categoryKey + '_' + groupIndex, appEl.scrollTop);
            }
          } catch {}
          // pass group index to the reader payload so we can navigate back correctly
          payload.groupIndex = parseInt(groupIndex, 10);
        }

        if (window.Router?.navigate) window.Router.navigate('reader', payload);
        break;
      }
      case 'open-day-works': {
        const dayId = el.dataset.dayId;
        if (window.DaysManager?.openDayWorks) window.DaysManager.openDayWorks(dayId);
        break;
      }
      
      case 'copy-text': {
        const text = el.dataset.copy || el.dataset.text || '';
        if (!text) break;

        const doCopy = async () => {
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(text);
            } else {
              const ta = document.createElement('textarea');
              ta.value = text;
              ta.style.position = 'fixed';
              ta.style.opacity = '0';
              ta.style.left = '-9999px';
              document.body.appendChild(ta);
              ta.focus();
              ta.select();
              document.execCommand('copy');
              ta.remove();
            }
            showToast('تم النسخ');
          } catch (e) {
            showToast('تعذر النسخ');
          }
        };

        doCopy();
        break;
      }
      case 'tasbih-mode': {
        const mode = el.dataset.mode;
        if (window.TasbihLogic?.setMode) window.TasbihLogic.setMode(mode);
        break;
      }
      case 'tasbih-inc': {
        if (window.TasbihLogic?.increment) window.TasbihLogic.increment();
        break;
      }
      case 'tasbih-reset': {
        if (window.TasbihLogic?.reset) window.TasbihLogic.reset();
        break;
      }
      case 'occasions-filter': {
        const filter = el.dataset.filter;
        if (window.Occasions?.setFilter) window.Occasions.setFilter(filter);
        break;
      }
      default:
        // no-op
        break;
    }
  };

  document.addEventListener('click', handle);
})();
