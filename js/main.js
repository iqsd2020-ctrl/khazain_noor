const FontOptions=[{name:'الخط 1',value:'Font1'},{name:'الخط 2',value:'Font2'},{name:'الخط 3',value:'Font3'},{name:'الخط 4',value:'Font4'},{name:'الخط 5',value:'Font5'},{name:'الخط 6',value:'Font6'},{name:'الخط 7',value:'Font7'},{name:'الخط 8',value:'Font8'},{name:'الخط 9',value:'Font9'},{name:'الخط 10',value:'Font10'},{name:'الخط 11',value:'Font11'},{name:'الخط 12',value:'Font12'},{name:'الخط 13',value:'Font13'},{name:'الخط 14',value:'Font14'},{name:'الخط 15',value:'Font15'},{name:'الخط 16',value:'Font16'},{name:'الخط 17',value:'Font17'},{name:'الخط 18',value:'Font18'},{name:'الخط 19',value:'Font19'},{name:'الخط 20',value:'Font20'}];
const State={theme:localStorage.getItem('theme')||'light',fontSize:localStorage.getItem('fontSize')||26,appFont:localStorage.getItem('appFont')||'Font1',readerFont:localStorage.getItem('readerFont')||'Font1'};

const Router = {
    navigate: (p, d = null) => {
    const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        // ليس هناك شريط تنقل سفلي بعد الآن، لذا لا حاجة لتحديث ظهوره

        const readerTools = document.getElementById('readerTools');
        const searchToggle = document.getElementById('searchToggle');
        const themeToggle = document.getElementById('themeToggle');
        
        if (readerTools) {
            if (p === 'reader' || p === 'surah') {
                readerTools.classList.remove('hidden');
                readerTools.style.display = 'flex';
                if(searchToggle) searchToggle.classList.add('hidden');
                if(themeToggle) themeToggle.classList.add('hidden');
            } else {
                readerTools.classList.add('hidden');
                readerTools.style.display = 'none';
                if(searchToggle) searchToggle.classList.remove('hidden');
                if(themeToggle) themeToggle.classList.remove('hidden');
            }
        }

        // لم تعد هناك أزرار تنقل سفلية لتعيين الحالة النشطة لها

        const backBtn = document.getElementById('backBtn');
        if (p !== 'home') {
            backBtn.classList.remove('hidden');
            if (p === 'reader' && d && d.fromDays) {
                backBtn.onclick = () => Router.navigate('days');
            } else if (p === 'reader' && d && d.categoryKey) {
                // إذا كان لدينا رقم المجموعة، نعود إليها مباشرة. وإلا نعود إلى قائمة القسم.
                if (typeof d.groupIndex !== 'undefined') {
                    backBtn.onclick = () => Views.showCategoryTab(d.categoryKey, d.groupIndex);
                } else {
                    backBtn.onclick = () => Views.showCategory(d.categoryKey);
                }
            } else if (p === 'reader') {
                backBtn.onclick = () => Router.back();
            } else if (p === 'surah') {
                backBtn.onclick = () => Router.navigate('quran');
            } else {
                backBtn.onclick = () => Router.navigate('home');
            }
        } else {
            backBtn.classList.add('hidden');
        }

        const app = document.getElementById('app');
        if (p !== 'reader') {
            app.innerHTML = '';
            app.scrollTop = 0;
        }

        switch (p) {
            case 'home': Views.home(); break;
            case 'days': Views.days(); break;
            case 'quran': Quran.showSurahs(); break;
            case 'surah': Quran.showSurah(d); break;
            case 'occasions': Occasions.renderPage(); break;
            case 'library': Views.library(); break;
            case 'reader': Views.reader(d); break;
            case 'tasbih': if (typeof Views.tasbih === 'function') Views.tasbih(); break;
            case 'favorites': if (typeof Views.favorites === 'function') Views.favorites(); break;
            case 'settings': Views.settings(); break;
        }
    },
    // back ينتقل الآن إلى الصفحة الرئيسية بدلاً من المكتبة، حيث تم جمع الأقسام في الصفحة الرئيسية
    back: () => Router.navigate('home')
};

const Views={
    toggleSidebar: () => {
        const s = document.getElementById('sidebar');
        const o = document.getElementById('sidebarOverlay');
        if(s) s.classList.toggle('active');
        if(o) o.classList.toggle('active');
    },

    toggleSearch: () => {
        const sb = document.getElementById('searchBar');
        const si = document.getElementById('searchInput');
        if(sb) {
            sb.classList.toggle('hidden');
            if(!sb.classList.contains('hidden')) {
                si.focus();
                // بناء الفهرس عند فتح البحث لضمان سرعة الاستجابة لاحقاً
                DB.buildSearchIndex();
            } else {
                si.value = '';
                const container = document.getElementById('searchResults');
                if(container) container.innerHTML = '';
            }
        }
    },

    handleSearch: async (query) => {
        const container = document.getElementById('searchResults');
        if (!query || query.trim() === "") {
            container.innerHTML = '';
            return;
        }

        // إظهار مؤشر تحميل بسيط
        container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted)">جاري البحث...</div>';

        try {
            const results = await DB.search(query);
            if (results.length === 0) {
                container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)">لا توجد نتائج مطابقة</div>';
                return;
            }

            const categoryTitles = {
                duas: 'الأدعية', ziyarat: 'الزيارات', monajat: 'المناجاة', baqiyat: 'الباقيات الصالحات',
                days: 'أعمال الأيام', months: 'أعمال الشهور', nahj_balagha: 'نهج البلاغة',
                aqaid_imamiah: 'عقائد الإمامية', rights: 'رسالة الحقوق', monasbat: 'المناسبات', friday_duas_audio: 'أدعية الجمعة (صوتياً)'
            };

            container.innerHTML = results.map(item => `
    <div class="search-result-item" data-action="open-reader" data-id="${item.id}" data-title="${item.title}" data-categorykey="${item.categoryKey}">
        <div>
            <div style="font-weight:700">${item.title}</div>
            <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px">${item.categoryTitle}</div>
        </div>
        <span class="cat-tag">${categoryTitles[item.categoryKey] || item.categoryKey}</span>
    </div>
`).join('');
        } catch (error) {
            console.error("Search error:", error);
            container.innerHTML = '<div style="text-align:center;padding:20px;color:red">حدث خطأ أثناء البحث</div>';
        }
    },

    home:()=>{
        // الصفحة الرئيسية تعرض بطاقة التاريخ الهجري يعقبها شبكة تحوي كل الأقسام الرئيسية
        const titleEl = document.getElementById('titleEl');
        if (titleEl) titleEl.innerText = 'خزائن النور';
        const hijriDate = new Date().toLocaleDateString('ar-SA-u-ca-islamic', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        // قائمة بكل الأقسام بما في ذلك القرآن والمسبحة وأعمال الأيام
        const allSections = [
            { id: 'duas', title: 'الأدعية', icon: 'volunteer_activism', action: 'show-category' },
            { id: 'ziyarat', title: 'الزيارات', icon: 'mosque', action: 'show-category' },
            { id: 'monajat', title: 'المناجاة', icon: 'library_books', action: 'show-category' },
            { id: 'baqiyat', title: 'الباقيات الصالحات', icon: 'diamond', action: 'show-category' },
            { id: 'nahj_balagha', title: 'نهج البلاغة', icon: 'article', action: 'show-category' },
            { id: 'months', title: 'أعمال الشهور', icon: 'nightlight', action: 'show-category' },
            { id: 'aqaid_imamiah', title: 'عقائد الإمامية', icon: 'shield', action: 'show-category' },
            { id: 'rights', title: 'رسالة الحقوق', icon: 'balance', action: 'show-category' },
            { id: 'monasbat', title: 'المناسبات', icon: 'event', action: 'show-category' },
            { id: 'friday_duas_audio', title: 'أدعية الجمعة (صوتياً)', icon: 'headphones', action: 'show-category' },
            { id: 'days', title: 'أعمال الأيام', icon: 'calendar_month', action: 'navigate', page: 'days' },
            { id: 'quran', title: 'القرآن الكريم', icon: 'menu_book', action: 'navigate', page: 'quran' },
            { id: 'tasbih', title: 'المسبحة', icon: 'toll', action: 'navigate', page: 'tasbih' }
        ];

        // بناء HTML للصفحة الرئيسية
        let html = `<div class="fade-in">
            <div class="card hero-card" data-action="navigate" data-page="occasions" style="cursor:pointer; background: linear-gradient(135deg, var(--primary), #0d9488); color: white; border: none;">
                <div style="opacity:0.8;font-size:0.9rem;margin-bottom:4px">التاريخ الهجري</div>
                <div style="font-size:1.4rem;font-weight:800;margin-bottom:12px">${hijriDate}</div>
                <div id="occasionStrip" style="background:rgba(255,255,255,0.1); border-radius: 12px; min-height: 50px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 0.8rem; opacity: 0.7;">جاري تحميل المناسبة...</span>
                </div>
            </div>

            <h3 style="margin:24px 0 16px;font-size:1.1rem">الأقسام</h3>
            <div class="grid-menu">`;
        allSections.forEach(sec => {
            if (sec.action === 'show-category') {
                html += `<div class="menu-item" data-action="show-category" data-category="${sec.id}"><span class="menu-icon material-symbols-outlined" aria-hidden="true">${sec.icon}</span><span style="font-weight:700">${sec.title}</span></div>`;
            } else if (sec.action === 'navigate') {
                const pg = sec.page || sec.id;
                html += `<div class="menu-item" data-action="navigate" data-page="${pg}"><span class="menu-icon material-symbols-outlined" aria-hidden="true">${sec.icon}</span><span style="font-weight:700">${sec.title}</span></div>`;
            }
        });
        html += `</div>

            <div class="card" style="margin-top:24px;border-right:4px solid var(--secondary)">
                <div style="font-size:3rem;line-height:0;color:var(--text-muted);opacity:0.2;margin-bottom:10px">“</div>
                <p style="font-size:1.1rem;line-height:1.8;font-weight:600;text-align:center">أَحْيُوا أَمْرَنَا رَحِمَ اللَّهُ مَنْ أَحْيَا أَمْرَنَا</p>
                <div style="text-align:center;margin-top:12px;font-size:0.9rem;color:var(--primary);font-weight:700">— الإمام الصادق (ع)</div>
            </div>
        </div>`;
        const appEl = document.getElementById('app');
        if (appEl) appEl.innerHTML = html;
        if (typeof Occasions !== 'undefined') {
            Occasions.initHome();
        }
    },

    days:()=>{
        document.getElementById('titleEl').innerText='أيام الأسبوع';
        // استخدم أسماء الملفات المشفرة كما هي في مجلد txt/days، لأن أسماء الملفات العربية تم تحويلها إلى ترميز Unicode
        const daysList = [
            { name: 'السبت', icon: 'nightlight', file: 'days/#U0627#U0644#U0633#U0628#U062a.txt' },
            { name: 'الأحد', icon: 'wb_sunny', file: 'days/#U0627#U0644#U0623#U062d#U062f.txt' },
            { name: 'الاثنين', icon: 'eco', file: 'days/#U0627#U0644#U0627#U062b#U0646#U064a#U0646.txt' },
            { name: 'الثلاثاء', icon: 'candle', file: 'days/#U0627#U0644#U062b#U0644#U0627#U062b#U0627#U0621.txt' },
            { name: 'الأربعاء', icon: 'waves', file: 'days/#U0627#U0644#U0623#U0631#U0628#U0639#U0627#U0621.txt' },
            { name: 'الخميس', icon: 'auto_awesome', file: 'days/#U0627#U0644#U062e#U0645#U064a#U0633.txt' },
            { name: 'الجمعة', icon: 'mosque', file: 'days/#U0627#U0644#U062c#U0645#U0639#U0629.txt' }
        ];
        
        let html = `<div class="fade-in">
            <h3 style="margin-bottom:16px;font-size:1.1rem">اختر اليوم لعرض الأعمال</h3>
            <div class="grid-menu">`;
            
        daysList.forEach(day => {
            html += `<div class="menu-item" data-action="open-reader" data-title="أعمال يوم ${day.name}" data-file="${day.file}" data-fromdays="true">
                <span class="menu-icon material-symbols-outlined" aria-hidden="true">${day.icon}</span>
                <span style="font-weight:700">${day.name}</span>
            </div>`;
        });
        
        html += `</div></div>`;
        document.getElementById('app').innerHTML = html;
    },

    library:()=>{
        document.getElementById('titleEl').innerText='المكتبة';
        const cats = [
            { id: 'duas', title: 'الأدعية', icon: 'volunteer_activism' },
            { id: 'ziyarat', title: 'الزيارات', icon: 'mosque' },
            { id: 'monajat', title: 'المناجاة', icon: 'library_books' },
            { id: 'baqiyat', title: 'الباقيات الصالحات', icon: 'diamond' },
            { id: 'nahj_balagha', title: 'نهج البلاغة', icon: 'article' },
            { id: 'months', title: 'أعمال الشهور', icon: 'nightlight' },
            { id: 'aqaid_imamiah', title: 'عقائد الإمامية', icon: 'shield' },
            { id: 'rights', title: 'رسالة الحقوق', icon: 'balance' },
            { id: 'monasbat', title: 'المناسبات', icon: 'event' },
            { id: 'friday_duas_audio', title: 'أدعية الجمعة (صوتياً)', icon: 'headphones' }
        ];

        let html = `<div class="fade-in"><div class="grid-menu">`;
        cats.forEach(c => {
            html += `<div class="menu-item" data-action="show-category" data-category="${c.id}">
                <span class="menu-icon material-symbols-outlined" aria-hidden="true">${c.icon}</span>
                <span style="font-weight:700">${c.title}</span>
            </div>`;
        });
        html += `</div></div>`;
        document.getElementById('app').innerHTML = html;
    },

  // في ملف main.js - استبدل دالة Views.showCategory بالكامل بهذه النسخة المصححة:
showCategory: async (key) => {
    // إغلاق الشريط الجانبي إن كان مفتوحاً
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');

    const app = document.getElementById('app');
    app.innerHTML = `<div style="height:80vh;display:flex;justify-content:center;align-items:center"><div style="color:var(--text-muted)">جاري تحميل القائمة...</div></div>`;
    const data = await DB.load(key);
    if (!data) {
        app.innerHTML = `<div class="card">حدث خطأ في تحميل البيانات</div>`;
        return;
    }

    // عناوين الأقسام باللغة العربية
    const titles = {
        duas: 'الأدعية', ziyarat: 'الزيارات', monajat: 'المناجاة', baqiyat: 'الباقيات الصالحات',
        nahj_balagha: 'نهج البلاغة', months: 'أعمال الشهور', aqaid_imamiah: 'عقائد الإمامية',
        rights: 'رسالة الحقوق', monasbat: 'المناسبات', friday_duas_audio: 'أدعية الجمعة (صوتياً)'
    };
    document.getElementById('titleEl').innerText = titles[key] || 'المكتبة';

    // بناء قائمة التبويبات (المجموعات) فقط
    let html = `<div class="fade-in"><div class="list-group">`;
    data.forEach((tab, idx) => {
        html += `<div class="list-tile" data-action="show-category-tab" data-category="${key}" data-index="${idx}">
            <span>${tab.tab_title}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted)"><path d="M15 19l-7-7 7-7"/></svg>
        </div>`;
    });
    html += `</div></div>`;
    app.innerHTML = html;
    app.scrollTop = 0;

    // زر الرجوع يرجع إلى الصفحة الرئيسية حيث تعرض كافة الأقسام
    const backBtn = document.getElementById('backBtn');
    backBtn.classList.remove('hidden');
    backBtn.onclick = () => Router.navigate('home');
},

    // عرض عناصر تبويب معيّن داخل القسم
showCategoryTab: async (key, index) => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');

    const data = await DB.load(key);
    if (!data || !Array.isArray(data) || !data[index]) {
        return;
    }
    const tab = data[index];
    document.getElementById('titleEl').innerText = tab.tab_title;

    const app = document.getElementById('app');
    let html = `<div class="fade-in"><div class="list-group"><div style="border-radius:var(--radius-md);box-shadow:var(--shadow-sm)">`;
    tab.items.forEach(item => {
        const title = item.title || item.title1;
        html += `<div class="list-tile" data-action="open-reader" data-id="${item.id}" data-title="${title}" data-categorykey="${key}" data-groupindex="${index}">
            <span>${title}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted)"><path d="M15 19l-7-7 7-7"/></svg>
        </div>`;
    });
    html += `</div></div></div>`;
    app.innerHTML = html;

    // استرجاع آخر موضع تمرير إذا كان محفوظاً
    try {
        const stored = localStorage.getItem('scroll_' + key + '_' + index);
        if (stored !== null) {
            const pos = parseInt(stored, 10);
            if (!isNaN(pos)) app.scrollTop = pos;
        } else {
            app.scrollTop = 0;
        }
    } catch (e) {
        app.scrollTop = 0;
    }

    // زر الرجوع يعيد إلى قائمة التبويبات للقسم
    const backBtn = document.getElementById('backBtn');
    backBtn.classList.remove('hidden');
    backBtn.onclick = () => Views.showCategory(key);
},

    reader: async (d)=>{
        document.getElementById('titleEl').innerText=d.title;
        const app = document.getElementById('app');
        app.innerHTML = `<div style="height:80vh;display:flex;justify-content:center;align-items:center"><div style="color:var(--text-muted)">جاري التحميل...</div></div>`;

        let content = "";
        let audioUrl = null;

        if (d.file) {
            try {
                const res = await fetch('txt/' + d.file);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                content = await res.text();
            } catch (e) {
                content = "خطأ في تحميل الملف";
            }
        } else {
            const item = await DB.getItem(d.categoryKey, d.id);
            if (item) {
                content = item.content || item.title2 || "لا يوجد محتوى";
                audioUrl = item.audio;
            }
        }

        let html = `<div class="fade-in reader-container">`;
        
        if (audioUrl && typeof AudioPlayer !== 'undefined') {
            html += AudioPlayer.render(audioUrl);
        }

        html += `<div class="reader-content" style="font-size:${State.fontSize}px">${content.replace(/\n/g, '<br>')}</div></div>`;
        app.innerHTML = html;
        app.scrollTop = 0;

        if (audioUrl && typeof AudioPlayer !== 'undefined') {
            AudioPlayer.init();
        }
    },

    settings: () => {
        document.getElementById('titleEl').innerText = 'الإعدادات';
        const app = document.getElementById('app');
        
        let html = `<div class="fade-in">
            <div class="card">
                <h3 style="margin-bottom:20px">المظهر والخطوط</h3>
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
                    <span>الوضع الليلي</span>
                    <button class="btn-icon" data-action="toggle-theme" style="background:var(--bg-body)">
                        ${State.theme === 'dark' ? 
                            '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>' : 
                            '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'
                        }
                    </button>
                </div>

                <div style="margin-bottom:24px">
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px">
                        <span>حجم الخط</span>
                        <span style="font-weight:700; color:var(--primary)">${State.fontSize}</span>
                    </div>
                    <input type="range" min="16" max="40" value="${State.fontSize}" oninput="Utils.changeFontSize(parseInt(this.value) - State.fontSize)">
                </div>

                <div style="display:grid; gap:12px">
                    <button class="font-select-btn" data-action="open-font-modal" data-target="app" style="width:100%; justify-content:space-between">
                        <span>خط التطبيق</span>
                        <span style="opacity:0.6">${State.appFont}</span>
                    </button>
                    <button class="font-select-btn" data-action="open-font-modal" data-target="reader" style="width:100%; justify-content:space-between">
                        <span>خط القراءة</span>
                        <span style="opacity:0.6">${State.readerFont}</span>
                    </button>
                </div>
            </div>

            <div class="card" style="text-align:center; opacity:0.7">
                <div style="font-weight:800; color:var(--primary); margin-bottom:4px">خزائن النور</div>
                <div style="font-size:0.8rem">الإصدار 6.0.1</div>
            </div>
        </div>`;
        
        app.innerHTML = html;
    }
    ,

    /**
     * صفحة المفضلة: تعرض العناصر التي قام المستخدم بحفظها كمفضلة.
     * حالياً هي مجرد صفحة بسيطة بدون دعم فعلي لحفظ العناصر،
     * ويمكن تطويرها لاحقاً لإظهار قائمة بالعناصر المفضلة عند توفرها في localStorage.
     */
    favorites: () => {
        document.getElementById('titleEl').innerText = 'المفضلة';
        const app = document.getElementById('app');
        let html = `<div class="fade-in">
            <h3 style="margin-bottom:16px;font-size:1.1rem">العناصر المفضلة</h3>`;
        // محاولة قراءة قائمة المفضلات من localStorage
        let favs = [];
        try {
            const stored = localStorage.getItem('favorites');
            if (stored) favs = JSON.parse(stored);
        } catch (e) {}
        if (Array.isArray(favs) && favs.length > 0) {
            html += `<div class="list-group">`;
            favs.forEach(item => {
                // لكل عنصر، عرض عنوانه وتوفير رابط للقراءة حسب خصائصه
                const payload = {};
                if (item.title) payload.title = item.title;
                if (item.id) payload.id = item.id;
                if (item.categoryKey) payload.categoryKey = item.categoryKey;
                if (item.groupIndex !== undefined) payload.groupIndex = item.groupIndex;
                const payloadStr = JSON.stringify(payload);
                html += `<div class="list-tile" data-action="open-reader" data-payload='${payloadStr}'>
                    <span>${item.title}</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted)"><path d="M15 19l-7-7 7-7"/></svg>
                </div>`;
            });
            html += `</div>`;
        } else {
            html += `<div class="card" style="text-align:center; padding:20px; color:var(--text-muted)">
                لا توجد عناصر مفضلة حتى الآن
            </div>`;
        }
        html += `</div>`;
        if (app) app.innerHTML = html;
    }
};

const Utils = {
    changeFontSize: (delta) => {
        let newSize = parseInt(State.fontSize) + delta;
        if (newSize < 16) newSize = 16;
        if (newSize > 40) newSize = 40;
        
        State.fontSize = newSize;
        localStorage.setItem('fontSize', newSize);
        
        const reader = document.querySelector('.reader-content');
        if (reader) reader.style.fontSize = newSize + 'px';
        
        // تحديث الرقم في صفحة الإعدادات إذا كانت مفتوحة
        const sizeDisplay = document.querySelector('span[style*="color:var(--primary)"]');
        if (sizeDisplay) sizeDisplay.innerText = newSize;
    },

    openFontModal: (type) => {
        const modal = document.getElementById('fontModal');
        const list = document.getElementById('fontList');
        const current = type === 'app' ? State.appFont : State.readerFont;
        
        list.innerHTML = FontOptions.map(f => `
            <div class="font-option ${f.value === current ? 'selected' : ''}" data-action="select-font" data-type="${type}" data-font="${f.value}">
                <span style="font-family:${f.value}">${f.name}</span>
                <div class="check-circle"></div>
            </div>
        `).join('');
        
        modal.classList.add('active');
        modal.dataset.type = type;
    },

    closeFontModal: (e) => {
        const modal = document.getElementById('fontModal');
        modal.classList.remove('active');
    },

    selectFont: (type, font) => {
        if (type === 'app') {
            State.appFont = font;
            localStorage.setItem('appFont', font);
            document.documentElement.style.setProperty('--app-font', font);
        } else {
            State.readerFont = font;
            localStorage.setItem('readerFont', font);
            document.documentElement.style.setProperty('--reader-font', font);
            const reader = document.querySelector('.reader-content');
            if (reader) reader.style.fontFamily = font;
        }
        Utils.closeFontModal();
        
        // تحديث صفحة الإعدادات
        if (document.getElementById('titleEl').innerText === 'الإعدادات') {
            Views.settings();
        }
    }
};


// جعل الكائنات متاحة لأزرار onclick داخل HTML
try {
  window.Router = Router;
  window.Views = Views;
  window.Utils = Utils;
} catch (e) {}
