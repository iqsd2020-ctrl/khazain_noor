// js/days.js
// Days works page using local JSON data (a3mal_days.json)
// Renders structured blocks + embeds audio where available.
// No inline onclick handlers (uses centralized actions.js).

const DaysManager = {
  cache: null,

  days: [
    { id: 'sat', name: 'السبت', icon: 'calendar_view_week', key: 'السبت' },
    { id: 'sun', name: 'الأحد', icon: 'wb_sunny', key: 'الأحد' },
    { id: 'mon', name: 'الإثنين', icon: 'event', key: 'الإثنين' },
    { id: 'tue', name: 'الثلاثاء', icon: 'event_available', key: 'الثلاثاء' },
    { id: 'wed', name: 'الأربعاء', icon: 'event_note', key: 'الأربعاء' },
    { id: 'thu', name: 'الخميس', icon: 'auto_awesome', key: 'الخميس' },
    { id: 'fri', name: 'الجمعة', icon: 'mosque', key: 'الجمعة' }
  ],

  load: async () => {
    if (DaysManager.cache) return DaysManager.cache;
    const res = await fetch('json/a3mal_days.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load a3mal_days.json');
    DaysManager.cache = await res.json();
    return DaysManager.cache;
  },

  renderDaysPage: async () => {
    document.getElementById('titleEl').innerText = 'أعمال الأيام';

    let html = `
      <div class="fade-in">
        <h3 style="margin-bottom:16px;font-size:1.1rem">اختر اليوم لعرض الأعمال</h3>
        <div class="grid-menu">`;

    DaysManager.days.forEach(day => {
      html += `
        <div class="menu-item" data-action="open-day-works" data-day-id="${day.id}">
          <span class="menu-icon material-symbols-outlined" aria-hidden="true">${day.icon}</span>
          <span style="font-weight:700">${day.name}</span>
        </div>`;
    });

    html += `</div></div>`;
    document.getElementById('app').innerHTML = html;
  },

  toneFromStyle: (style) => {
    const s = (style || '').toLowerCase();
    if (s.includes('red')) return 'danger';
    if (s.includes('green')) return 'success';
    if (s.includes('blue')) return 'info';
    return 'neutral';
  },

  escapeHtml: (str) => {
    return String(str ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  },

  buildCard: (inner, tone = 'neutral') => {
    const border =
      tone === 'danger' ? 'border-right:4px solid #dc2626;' :
      tone === 'success' ? 'border-right:4px solid #16a34a;' :
      tone === 'info' ? 'border-right:4px solid #2563eb;' :
      'border-right:4px solid var(--primary);';

    return `<div class="card" style="margin-bottom:12px; ${border}">${inner}</div>`;
  },

  munajatAudioMap: (data) => {
    const arr = Array.isArray(data?.['المناجاة الخمس عشرة']) ? data['المناجاة الخمس عشرة'] : [];
    const map = {};
    arr.forEach(x => {
      if (x && x.title && x.url) map[x.title.trim()] = x.url;
    });
    return map;
  },

  parseMunajatNames: (content) => {
    // e.g. "۞ مناجاة اليوم: المحبين + الشاكين + المطيعين لله"
    const m = String(content || '').match(/مناجاة\s+اليوم\s*:\s*(.+)$/);
    if (!m) return [];
    return m[1]
      .split('+')
      .map(s => s.replace(/[.،]/g, '').trim())
      .filter(Boolean);
  },

  openDayWorks: async (dayId) => {
    const day = DaysManager.days.find(d => d.id === dayId);
    if (!day) return;

    document.getElementById('titleEl').innerText = `أعمال يوم ${day.name}`;

    let data;
    try {
      data = await DaysManager.load();
    } catch (e) {
      document.getElementById('app').innerHTML = `
        <div class="fade-in">
          <div class="card" style="border-right:4px solid #dc2626;">
            تعذر تحميل بيانات أعمال الأيام.
          </div>
        </div>`;
      return;
    }

    const blocks = Array.isArray(data?.[day.key]) ? data[day.key] : [];
    const munajatMap = DaysManager.munajatAudioMap(data);

    let html = `<div class="fade-in">`;

    if (!blocks.length) {
      html += DaysManager.buildCard('لا توجد بيانات لهذا اليوم.', 'neutral');
      html += `</div>`;
      document.getElementById('app').innerHTML = html;
      return;
    }

    blocks.forEach((b) => {
      if (!b || !b.type) return;

      if (b.type === 'card') {
        const tone = DaysManager.toneFromStyle(b.style);
        const content = DaysManager.escapeHtml(b.content);

        let inner = `<div style="line-height:1.9">${content}</div>`;

        // If this card references today's munajat, embed audio players right under it.
        const names = DaysManager.parseMunajatNames(b.content);
        if (names.length) {
          const players = names
            .map(n => {
              const key = `مناجاة ${n}`; // titles are "مناجاة ...."
              const url = munajatMap[key];
              if (!url || !window.AudioPlayer?.render) return '';
              return window.AudioPlayer.render(url, key);
            })
            .filter(Boolean)
            .join('');
          if (players) {
            inner += `<div style="margin-top:12px">${players}</div>`;
          }
        }

        html += DaysManager.buildCard(inner, tone);
        return;
      }

      if (b.type === 'copyable') {
        const title = DaysManager.escapeHtml(b.title || '');
        const text = DaysManager.escapeHtml(b.text || '');
        const sub = DaysManager.escapeHtml(b.subtext || '');
        const copyValue = `${b.title || ''}\n${b.text || ''}\n${b.subtext || ''}`.trim();

        const inner = `
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px;">
            <div style="flex:1; min-width:0;">
              <div style="font-weight:800; margin-bottom:6px;">${title}</div>
              <div style="line-height:1.9; font-weight:600">${text}</div>
              <div style="margin-top:6px; color:var(--text-muted); font-weight:700">${sub}</div>
            </div>
            <button class="btn-icon" type="button" data-action="copy-text" data-copy="${DaysManager.escapeHtml(copyValue)}" aria-label="نسخ">
              <span class="material-symbols-outlined" aria-hidden="true">content_copy</span>
            </button>
          </div>`;
        html += DaysManager.buildCard(inner, 'neutral');
        return;
      }

      if (b.type === 'details') {
        const title = DaysManager.escapeHtml(b.title || '');
        const content = DaysManager.escapeHtml(b.content || '');
        const inner = `
          <details>
            <summary style="cursor:pointer; font-weight:800; padding:2px 0;">${title}</summary>
            <div style="margin-top:10px; line-height:1.9">${content}</div>
          </details>`;
        html += DaysManager.buildCard(inner, 'neutral');
        return;
      }
    });

    html += `</div>`;
    document.getElementById('app').innerHTML = html;

    // Bind audio controls if we rendered any players
    if (window.AudioPlayer?.init) window.AudioPlayer.init();
  }
};

// Attach to Views if present
if (window.Views) {
  window.Views.days = DaysManager.renderDaysPage;
}
