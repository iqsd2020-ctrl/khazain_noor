/* مناسبات (Hijri occasions) */
const Occasions = (() => {
  const MONTH_ALIASES = new Map([
    ['محرم', 1],
    ['صفر', 2],
    ['ربيع الاول', 3], ['ربيع الأول', 3], ['ربيع الأوّل', 3],
    ['ربيع الثاني', 4], ['ربيع الآخر', 4], ['ربيع الاخر', 4],
    ['جمادى الاول', 5], ['جمادى الأول', 5], ['جمادى الأولى', 5], ['جمادى الاولي', 5],
    ['جمادى الآخر', 6], ['جمادى الاخر', 6], ['جمادى الآخرة', 6], ['جمادى الاخرة', 6], ['جمادى الثانية', 6],
    ['رجب', 7],
    ['شعبان', 8],
    ['رمضان', 9],
    ['شوال', 10],
    ['ذو القعدة', 11], ['ذي القعدة', 11],
    ['ذو الحجة', 12], ['ذي الحجة', 12],
  ]);

  const normalize = (s) => (s || '')
    .toString()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/أ|إ|آ/g, 'ا')
    .replace(/ة/g, 'ه')
    .toLowerCase();

  const toInt = (s) => {
    const out = (s || '').toString().replace(/[^\d]/g, '');
    const n = Number(out);
    return Number.isFinite(n) ? n : NaN;
  };

  const escapeHtml = (s) => (s || '').toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const getHijriParts = (date = new Date()) => {
    const fmt = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = fmt.formatToParts(date);
    const day = toInt(parts.find(p => p.type === 'day')?.value);
    const month = toInt(parts.find(p => p.type === 'month')?.value);
    const year = toInt(parts.find(p => p.type === 'year')?.value);
    return { day, month, year };
  };

  const parseOccasionKey = (title1, monthIdx) => {
    // title1 usually like "10 محرم" OR "20 صفر"
    const m = (title1 || '').match(/(\d+)/);
    const day = m ? Number(m[1]) : NaN;
    return { day, month: monthIdx };
  };

  const flatten = (data) => {
    const out = [];
    (data || []).forEach(tab => {
      const monthName = tab?.tab_title || '';
      const monthIdx = MONTH_ALIASES.get(normalize(monthName)) || null;
      if (!monthIdx) return;

      (tab.items || []).forEach(item => {
        const title1 = item?.title1 || '';
        const title2 = item?.title2 || '';
        const { day, month } = parseOccasionKey(title1, monthIdx);
        if (!Number.isFinite(day) || !Number.isFinite(month)) return;
        // Title2 might have multiple lines. We'll keep full but show first line in list.
        const firstLine = title2.split('\n').map(s => s.trim()).filter(Boolean)[0] || title2.trim();
        out.push({
          id: item?.id,
          month,
          day,
          monthName,
          title1,
          title2,
          summary: firstLine,
        });
      });
    });
    return out;
  };

  const buildFutureOffsets = (base = new Date(), maxDays = 420) => {
    const map = new Map();
    for (let offset = 0; offset <= maxDays; offset++) {
      const d = new Date(base);
      d.setDate(d.getDate() + offset);
      const h = getHijriParts(d);
      const key = `${h.month}-${h.day}`;
      if (!map.has(key)) map.set(key, offset);
    }
    return map;
  };

  const buildIndex = (data) => {
    // Map key "m-d" -> first matching occasion
    const idx = new Map();
    (data || []).forEach(tab => {
      const monthName = tab?.tab_title || '';
      const monthIdx = MONTH_ALIASES.get(normalize(monthName)) || null;
      if (!monthIdx) return;

      (tab.items || []).forEach(item => {
        const title1 = item?.title1 || '';
        const m = title1.match(/(\d+)/);
        const day = m ? Number(m[1]) : NaN;
        if (!Number.isFinite(day)) return;

        const key = `${monthIdx}-${day}`;
        if (!idx.has(key)) {
          idx.set(key, {
            month: monthIdx,
            day,
            monthName,
            title1,
            title2: item?.title2 || '',
          });
        }
      });
    });
    return idx;
  };

  const pickOccasion = async () => {
    const data = await DB.load('monasbat');
    const idx = buildIndex(data);

    const today = getHijriParts(new Date());
    const todayKey = `${today.month}-${today.day}`;
    if (idx.has(todayKey)) {
      return { kind: 'today', occasion: idx.get(todayKey), offsetDays: 0 };
    }

    // Find next within 420 days by simulating Gregorian days and converting to Hijri
    const base = new Date();
    for (let offset = 1; offset <= 420; offset++) {
      const d = new Date(base);
      d.setDate(d.getDate() + offset);
      const h = getHijriParts(d);
      const key = `${h.month}-${h.day}`;
      if (idx.has(key)) {
        return { kind: 'next', occasion: idx.get(key), offsetDays: offset };
      }
    }

    return { kind: 'none', occasion: null, offsetDays: null };
  };

  const renderStrip = (targetEl, payload) => {
    if (!targetEl) return;

    if (payload.kind === 'none') {
      targetEl.innerHTML = `
        <div class="occasion-strip" data-action="navigate" data-page="occasions" style="cursor:pointer">
          <span class="material-symbols-outlined" aria-hidden="true">event</span>
          <div>
            <div class="occasion-title">لا توجد مناسبة</div>
            <div class="occasion-sub">اعرض جميع المناسبات</div>
          </div>
        </div>`;
      return;
    }

    const o = payload.occasion;
    const title = payload.kind === 'today' ? 'مناسبة اليوم' : 'الحدث القادم';
    const sub = payload.kind === 'today'
      ? `${o.title1}`
      : `بعد ${payload.offsetDays} يوم • ${o.title1}`;

    targetEl.innerHTML = `
      <div class="occasion-strip" data-action="navigate" data-page="occasions" style="cursor:pointer">
        <span class="material-symbols-outlined" aria-hidden="true">event</span>
        <div>
          <div class="occasion-title">${escapeHtml(title)}: ${escapeHtml(o.title2.split('\n')[0] || o.title2)}</div>
          <div class="occasion-sub">${escapeHtml(sub)}</div>
        </div>
      </div>`;
  };

  const initHome = async () => {
    const targetEl = document.getElementById('occasionStrip');
    if (!targetEl) return;

    try {
      const payload = await pickOccasion();
      renderStrip(targetEl, payload);
    } catch (e) {
      targetEl.innerHTML = `
        <div class="occasion-strip">
          <span class="material-symbols-outlined">error</span>
          <div>
            <div class="occasion-title">تعذر تحميل المناسبات</div>
            <div class="occasion-sub">تحقق من الملفات أو أعد تحميل الصفحة</div>
          </div>
        </div>`;
      console.error(e);
    }
  };

  // ---- Full occasions page ----
  let _filter = 'upcoming'; // upcoming | month | all

  const setFilter = (f) => {
    _filter = f || 'upcoming';
    renderPage();
  };

  const renderPage = async () => {
    document.getElementById('titleEl').innerText = 'المناسبات';
    const app = document.getElementById('app');

    app.innerHTML = `
      <div class="fade-in">
        <div class="card" style="margin-top:0; padding:14px">
          <div style="display:flex; gap:8px; flex-wrap:wrap">
            <button class="chip ${_filter==='upcoming'?'active':''}" data-action="occasions-filter" data-filter="upcoming">القادمة</button>
            <button class="chip ${_filter==='month'?'active':''}" data-action="occasions-filter" data-filter="month">هذا الشهر</button>
            <button class="chip ${_filter==='all'?'active':''}" data-action="occasions-filter" data-filter="all">كل السنة</button>
          </div>
          <div style="margin-top:10px; color:var(--text-muted); font-size:0.85rem" id="occHint"></div>
        </div>
        <div id="occList"></div>
      </div>`;

    const data = await DB.load('monasbat');
    const flat = flatten(data);
    const today = getHijriParts(new Date());
    const offsets = buildFutureOffsets(new Date(), 420);

    flat.forEach(x => {
      x.key = `${x.month}-${x.day}`;
      x.offsetDays = offsets.has(x.key) ? offsets.get(x.key) : null;
    });

    const listEl = document.getElementById('occList');
    const hintEl = document.getElementById('occHint');

    // Decide list based on filter
    let items = [];
    if (_filter === 'upcoming') {
      items = flat
        .filter(x => x.offsetDays !== null)
        .sort((a,b) => a.offsetDays - b.offsetDays);
      hintEl.textContent = items.length ? `الأقرب: خلال ${items[0].offsetDays} يوم` : '';
    } else if (_filter === 'month') {
      items = flat
        .filter(x => x.month === today.month)
        .sort((a,b) => a.day - b.day);
      hintEl.textContent = `شهر هجري رقم ${today.month}`;
    } else {
      items = flat.sort((a,b) => (a.month - b.month) || (a.day - b.day));
      hintEl.textContent = 'مرتب حسب الأشهر الهجرية';
    }

    if (!items.length) {
      listEl.innerHTML = `<div class="card" style="text-align:center; padding:20px">لا توجد بيانات لعرضها</div>`;
      return;
    }

    // Render
    let html = `<div class="list-group"><div style="border-radius:var(--radius-md); box-shadow:var(--shadow-sm)">`;
    items.forEach(x => {
      const badge = _filter === 'upcoming'
        ? (x.offsetDays === 0 ? 'اليوم' : `بعد ${x.offsetDays} يوم`)
        : `${x.title1}`;

      html += `
        <div class="list-tile">
          <div style="display:flex; align-items:flex-start; gap:12px">
            <span class="badge">${escapeHtml(badge)}</span>
            <div style="flex:1">
              <div style="font-weight:800; line-height:1.5">${escapeHtml(x.summary)}</div>
              <div style="margin-top:6px; color:var(--text-muted); font-size:0.85rem; white-space:pre-line">${escapeHtml(x.title2)}</div>
            </div>
          </div>
        </div>`;
    });
    html += `</div></div>`;

    listEl.innerHTML = html;

    // Soft reminder if very close
    if (_filter === 'upcoming' && items[0]?.offsetDays !== null && items[0].offsetDays <= 3) {
      hintEl.textContent = `تنبيه: ${items[0].offsetDays === 0 ? 'مناسبة اليوم' : 'المناسبة القادمة قريبًا'} • خلال ${items[0].offsetDays} يوم`;
    }
  };

  return { initHome, getHijriParts, renderPage, setFilter };
})();

window.Occasions = Occasions;
