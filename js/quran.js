// js/quran.js
// Quran reader with: surah list search, verse highlight, in-surah search, and resume last position.

const Quran = {
  data: null,
  currentSurahId: null,
  _scrollTimer: null,
  _onScrollHandler: null,
  _matches: [],
  _matchIndex: 0,

  // Convert digits to Arabic-Indic (١٢٣)
  toArabicDigits: (num) => {
    const id = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    return num.toString().replace(/[0-9]/g, (w) => id[+w]);
  },

  _stripDiacritics: (s) => (s || '')
    .toString()
    .replace(/ـ/g, '')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, ''),

  _norm: (s) => Quran._stripDiacritics(s).toLowerCase().trim(),

  _getLast: () => {
    try { return JSON.parse(localStorage.getItem('quran_last') || 'null'); }
    catch { return null; }
  },

  _setLast: (patch) => {
    const cur = Quran._getLast() || {};
    const next = { ...cur, ...patch, ts: Date.now() };
    try { localStorage.setItem('quran_last', JSON.stringify(next)); } catch {}
  },

  init: async () => {
    if (Quran.data) return;
    try {
      // اسم الملف في المجلد json تم تحويله إلى ترميز Unicode مع علامات #، لذلك نقوم بتركيب المسار الصحيح بشكل آمن
      const fileName = '#U0627#U0644#U0642#U0631#U0627#U0646 #U0627#U0644#U0643#U0631#U064a#U0645.json';
      const encoded = encodeURIComponent(fileName);
      const response = await fetch('json/' + encoded);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      Quran.data = await response.json();
    } catch (error) {
      console.error('Error loading Quran data:', error);
      Quran.data = null;
    }
  },

  showSurahs: async () => {
    document.getElementById('titleEl').innerText = 'القرآن الكريم';
    const app = document.getElementById('app');

    app.innerHTML = `
      <div class="fade-in">
        <div class="card" style="padding:14px; margin-top:0">
          <div style="display:flex; gap:10px; align-items:center">
            <span class="material-symbols-outlined" aria-hidden="true">search</span>
            <input id="surahSearchInput" class="input" type="search" placeholder="ابحث عن سورة..." style="flex:1"/>
          </div>
          <div id="surahResume" style="margin-top:12px"></div>
        </div>

        <div class="list-group">
          <div style="border-radius:var(--radius-md); box-shadow:var(--shadow-sm)" id="surahList">
            <div style="padding:14px; text-align:center; color:var(--text-muted)">جاري تحميل السور...</div>
          </div>
        </div>
      </div>`;

    await Quran.init();

    const listEl = document.getElementById('surahList');
    if (!Quran.data) {
      listEl.innerHTML = `<div class="card" style="text-align:center;padding:20px">حدث خطأ أثناء تحميل البيانات</div>`;
      return;
    }

    // Resume tile
    const last = Quran._getLast();
    const resumeEl = document.getElementById('surahResume');
    if (last?.surahId) {
      const surah = Quran.data.find(s => s.id === Number(last.surahId));
      resumeEl.innerHTML = `
        <button class="btn" style="width:100%; justify-content:space-between" data-action="resume-last-surah">
          <span style="display:flex; align-items:center; gap:8px">
            <span class="material-symbols-outlined">history</span>
            <span>متابعة القراءة</span>
          </span>
          <span style="opacity:0.8">${surah ? surah.name : ''}</span>
        </button>`;
    } else {
      resumeEl.innerHTML = '';
    }

    // Build list
    let html = '';
    Quran.data.forEach((surah) => {
      html += `
        <div class="list-tile" data-action="navigate" data-page="surah" data-payload="${surah.id}" data-surah-name="${(surah.name || '').replace(/"/g,'&quot;')}">
          <div style="display:flex; align-items:center; gap:12px">
            <span style="background:var(--primary); color:white; width:42px; height:42px; border-radius:999px; display:flex; align-items:center; justify-content:center; font-weight:bold">
              ${Quran.toArabicDigits(surah.id)}
            </span>
            <div>
              <div style="font-weight:700">${surah.name}</div>
              <div style="font-size:0.75rem; color:var(--text-muted)">${surah.type} - ${Quran.toArabicDigits(surah.total_verses)} آية</div>
            </div>
          </div>
          <span class="material-symbols-outlined" aria-hidden="true" style="color:var(--text-muted)">chevron_left</span>
        </div>`;
    });
    listEl.innerHTML = html;

    // Search filter
    const input = document.getElementById('surahSearchInput');
    input?.addEventListener('input', () => {
      const q = Quran._norm(input.value);
      document.querySelectorAll('#surahList .list-tile').forEach(tile => {
        const name = Quran._norm(tile.dataset.surahName || '');
        tile.style.display = (!q || name.includes(q)) ? '' : 'none';
      });
    });
  },

  showSurah: (id) => {
    const sid = Number(id);
    const surah = Quran.data?.find(s => s.id === sid);
    if (!surah) return;

    Quran.currentSurahId = sid;

    document.getElementById('titleEl').innerText = surah.name;
    const app = document.getElementById('app');

    let verses = surah.verses;
    if (typeof verses === 'string') {
      try {
        const fixedJson = verses.replace(/'/g, '"');
        verses = JSON.parse(fixedJson);
      } catch (e) {
        console.error("Error parsing verses:", e);
        verses = [];
      }
    }

    const versesHtml = (verses || []).map(v => {
      const vid = Number(v.id);
      return `<span class="verse-text" data-verse-id="${vid}">${v.text} <span class="verse-number">${Quran.toArabicDigits(vid)}</span></span>`;
    }).join(' ');

    app.innerHTML = `
      <div class="fade-in">
        <div class="card reader-card" style="min-height:70vh; margin-top:0; padding: 24px 18px;">
          <div id="verseSearchBar" class="verse-search hidden">
            <div style="display:flex; gap:10px; align-items:center">
              <span class="material-symbols-outlined" aria-hidden="true">search</span>
              <input id="verseSearchInput" class="input" type="search" placeholder="ابحث داخل السورة..." style="flex:1"/>
              <button class="btn-icon" id="verseSearchNext" title="التالي"><span class="material-symbols-outlined">arrow_back</span></button>
              <button class="btn-icon" id="verseSearchClear" title="مسح"><span class="material-symbols-outlined">close</span></button>
            </div>
            <div id="verseSearchHint" class="verse-search-hint"></div>
          </div>

          <div style="text-align:center; margin-bottom:18px; font-family:var(--reader-font); font-size:1.6rem; font-weight:bold;">
            ${sid !== 1 && sid !== 9 ? 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ' : ''}
          </div>

          <div id="readerText" class="reader-content quran-reader" style="line-height: 2.2; font-size: 1.25rem; text-align: justify; font-family: var(--reader-font), serif;">
            ${versesHtml}
          </div>

          <div style="text-align:center; margin-top:40px; color:var(--text-muted); font-size:0.9rem">صدق الله العلي العظيم</div>
        </div>
      </div>`;

    Quran._attachSurahHandlers(sid);
  },

  toggleVerseSearch: () => {
    const bar = document.getElementById('verseSearchBar');
    if (!bar) return;
    bar.classList.toggle('hidden');
    if (!bar.classList.contains('hidden')) {
      const input = document.getElementById('verseSearchInput');
      input?.focus();
      input?.select?.();
    } else {
      Quran._clearMatches();
    }
  },

  _clearMatches: () => {
    Quran._matches = [];
    Quran._matchIndex = 0;
    document.querySelectorAll('.verse-text.match').forEach(el => el.classList.remove('match'));
    const hint = document.getElementById('verseSearchHint');
    if (hint) hint.textContent = '';
  },

  _applyVerseSearch: (query) => {
    Quran._clearMatches();
    const q = Quran._norm(query);
    if (!q) return;

    const verses = Array.from(document.querySelectorAll('#readerText .verse-text'));
    verses.forEach(v => {
      const t = Quran._norm(v.textContent || '');
      if (t.includes(q)) {
        v.classList.add('match');
        Quran._matches.push(v);
      }
    });

    const hint = document.getElementById('verseSearchHint');
    if (hint) {
      hint.textContent = Quran._matches.length ? `عدد النتائج: ${Quran._matches.length}` : 'لا توجد نتائج';
    }

    if (Quran._matches.length) {
      Quran._matchIndex = 0;
      Quran._scrollToMatch(0);
    }
  },

  _scrollToMatch: (idx) => {
    const el = Quran._matches[idx];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  _attachSurahHandlers: (sid) => {
    const app = document.getElementById('app');
    const readerText = document.getElementById('readerText');

    // Restore last position if matches this surah
    const last = Quran._getLast();
    setTimeout(() => {
      if (last?.surahId && Number(last.surahId) === sid) {
        if (typeof last.scrollTop === 'number') app.scrollTop = last.scrollTop;
        if (last.verseId) {
          const v = document.querySelector(`.verse-text[data-verse-id="${Number(last.verseId)}"]`);
          if (v) v.classList.add('active');
        }
      } else {
        app.scrollTop = 0;
      }
    }, 0);

    // Save scroll position (throttled)
    const onScroll = () => {
      if (Quran._scrollTimer) return;
      Quran._scrollTimer = setTimeout(() => {
        Quran._scrollTimer = null;
        Quran._setLast({ surahId: sid, scrollTop: app.scrollTop });
      }, 300);
    };

    // إزالة المستمع السابق إن وجد لتجنب تراكم المستمعين عند فتح سور متعددة
    if (Quran._onScrollHandler) {
      try { app.removeEventListener('scroll', Quran._onScrollHandler); } catch {}
    }
    Quran._onScrollHandler = onScroll;
    app.addEventListener('scroll', Quran._onScrollHandler, { passive: true });

    // Verse highlight + save
    readerText?.addEventListener('click', (e) => {
      const v = e.target.closest('.verse-text');
      if (!v) return;
      document.querySelectorAll('.verse-text.active').forEach(el => el.classList.remove('active'));
      v.classList.add('active');
      const verseId = Number(v.dataset.verseId || '0');
      Quran._setLast({ surahId: sid, verseId, scrollTop: app.scrollTop });
    });

    // Verse search interactions
    const input = document.getElementById('verseSearchInput');
    const nextBtn = document.getElementById('verseSearchNext');
    const clearBtn = document.getElementById('verseSearchClear');

    input?.addEventListener('input', () => Quran._applyVerseSearch(input.value));
    nextBtn?.addEventListener('click', () => {
      if (!Quran._matches.length) return;
      Quran._matchIndex = (Quran._matchIndex + 1) % Quran._matches.length;
      Quran._scrollToMatch(Quran._matchIndex);
    });
    clearBtn?.addEventListener('click', () => {
      if (input) input.value = '';
      Quran._clearMatches();
    });
  }
};

// Expose for actions.js
window.Quran = Quran;
