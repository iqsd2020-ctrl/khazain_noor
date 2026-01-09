const FontOptions=[{name:'الخط 1',value:'Font1'},{name:'الخط 2',value:'Font2'},{name:'الخط 3',value:'Font3'},{name:'الخط 4',value:'Font4'},{name:'الخط 5',value:'Font5'},{name:'الخط 6',value:'Font6'},{name:'الخط 7',value:'Font7'},{name:'الخط 8',value:'Font8'},{name:'الخط 9',value:'Font9'},{name:'الخط 10',value:'Font10'},{name:'الخط 11',value:'Font11'},{name:'الخط 12',value:'Font12'},{name:'الخط 13',value:'Font13'},{name:'الخط 14',value:'Font14'},{name:'الخط 15',value:'Font15'},{name:'الخط 16',value:'Font16'},{name:'الخط 17',value:'Font17'},{name:'الخط 18',value:'Font18'},{name:'الخط 19',value:'Font19'},{name:'الخط 20',value:'Font20'}];
const State={theme:localStorage.getItem('theme')||'light',fontSize:localStorage.getItem('fontSize')||26,appFont:localStorage.getItem('appFont')||'Font1',readerFont:localStorage.getItem('readerFont')||'Font1'};

const Router = {
    navigate: (p, d = null) => {
    const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        // إظهار شريط التنقل السفلي في كل الصفحات الرئيسية.
        // كان مخفياً في كل الصفحات ما عدا الرئيسية مما يمنع التنقل بين التبويبات.
        const nav = document.querySelector('nav');
        const hideNavPages = new Set(['reader', 'surah']);
        if (nav) nav.style.display = hideNavPages.has(p) ? 'none' : '';

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

        document.querySelectorAll('.nav-btn').forEach(b => {
            b.classList.remove('active');
            if (b.dataset.target === p || (p === 'reader' && b.dataset.target === 'library')) {
                b.classList.add('active');
            }
        });

        const backBtn = document.getElementById('backBtn');
        if (p !== 'home') {
            backBtn.classList.remove('hidden');
            if (p === 'reader' && d && d.fromDays) {
                backBtn.onclick = () => Router.navigate('days');
            } else if (p === 'reader' && d && d.categoryKey) {
                backBtn.onclick = () => Views.showCategory(d.categoryKey);
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
            case 'settings': Views.settings(); break;
        }
    },
    back: () => Router.navigate('library')
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
        document.getElementById('titleEl').innerText='خزائن النور';
        const t=new Date().toLocaleDateString('ar-SA-u-ca-islamic',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
        document.getElementById('app').innerHTML=`<div class="fade-in">
            <div class="card hero-card" data-action="navigate" data-page="occasions" style="cursor:pointer; background: linear-gradient(135deg, var(--primary), #0d9488); color: white; border: none;">
                <div style="opacity:0.8;font-size:0.9rem;margin-bottom:4px">التاريخ الهجري</div>
                <div style="font-size:1.4rem;font-weight:800;margin-bottom:12px">${t}</div>
                <div id="occasionStrip" style="background:rgba(255,255,255,0.1); border-radius: 12px; min-height: 50px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 0.8rem; opacity: 0.7;">جاري تحميل المناسبة...</span>
                </div>
            </div>
            
            <h3 style="margin-bottom:16px;font-size:1.1rem">الوصول السريع</h3>
            <div class="grid-menu">
                <div class="menu-item" data-action="show-category" data-category="duas"><span class="menu-icon material-symbols-outlined" aria-hidden="true">volunteer_activism</span><span style="font-weight:700">الأدعية</span></div>
                <div class="menu-item" data-action="navigate" data-page="quran"><span class="menu-icon material-symbols-outlined" aria-hidden="true">menu_book</span><span style="font-weight:700">القرآن الكريم</span></div>
                <div class="menu-item" data-action="show-category" data-category="monajat"><span class="menu-icon material-symbols-outlined" aria-hidden="true">library_books</span><span style="font-weight:700">المناجاة</span></div>
                <div class="menu-item" data-action="navigate" data-page="tasbih"><span class="menu-icon material-symbols-outlined" aria-hidden="true">toll</span><span style="font-weight:700">المسبحة</span></div>
            </div>

            <div class="card" style="margin-top:24px;border-right:4px solid var(--secondary)">
                <div style="font-size:3rem;line-height:0;color:var(--text-muted);opacity:0.2;margin-bottom:10px">“</div>
                <p style="font-size:1.1rem;line-height:1.8;font-weight:600;text-align:center">أَحْيُوا أَمْرَنَا رَحِمَ اللَّهُ مَنْ أَحْيَا أَمْرَنَا</p>
                <div style="text-align:center;margin-top:12px;font-size:0.9rem;color:var(--primary);font-weight:700">— الإمام الصادق (ع)</div>
            </div>
        </div>`;
        if (typeof Occasions !== 'undefined') {
            Occasions.initHome();
        }
},

    days:()=>{
        document.getElementById('titleEl').innerText='أيام الأسبوع';
        const daysList = [
            { name: 'السبت', icon: 'nightlight', file: 'days/السبت.txt' },
            { name: 'الأحد', icon: 'wb_sunny', file: 'days/الأحد.txt' },
            { name: 'الاثنين', icon: 'eco', file: 'days/الاثنين.txt' },
            { name: 'الثلاثاء', icon: 'candle', file: 'days/الثلاثاء.txt' },
            { name: 'الأربعاء', icon: 'waves', file: 'days/الأربعاء.txt' },
            { name: 'الخميس', icon: 'auto_awesome', file: 'days/الخميس.txt' },
            { name: 'الجمعة', icon: 'mosque', file: 'days/الجمعة.txt' }
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
    // تم حذف سطر Views.toggleSidebar() من هنا لأنه كان يفتح القائمة تلقائياً
    
    // تأكيد إغلاق القائمة (زيادة في الحرص)
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

    const titles = {
        duas: 'الأدعية', ziyarat: 'الزيارات', monajat: 'المناجاة', baqiyat: 'الباقيات الصالحات',
        nahj_balagha: 'نهج البلاغة', months: 'أعمال الشهور', aqaid_imamiah: 'عقائد الإمامية',
        rights: 'رسالة الحقوق', monasbat: 'المناسبات', friday_duas_audio: 'أدعية الجمعة (صوتياً)'
    };

    document.getElementById('titleEl').innerText = titles[key] || 'المكتبة';
    
    let html = `<div class="fade-in">`;
    data.forEach(tab => {
        html += `<div class="list-group"><h3>${tab.tab_title}</h3><div style="border-radius:var(--radius-md);box-shadow:var(--shadow-sm)">`;
        tab.items.forEach(item => {
            const title = item.title || item.title1;
            // --- التغيير هنا: استخدام Router.navigate بدلاً من Views.reader ---
            html += `<div class="list-tile" data-action="open-reader" data-id="${item.id}" data-title="${title}" data-categorykey="${key}">
                <span>${title}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted)"><path d="M15 19l-7-7 7-7"/></svg>
            </div>`;
            // ---------------------------------------------------------------
        });
        html += `</div></div><div style="height:24px"></div>`;
    });
    html += `</div>`;
    app.innerHTML = html;
    app.scrollTop = 0;
    
    // تحديث زر الرجوع ليعود للمكتبة في حال كنا في القائمة الرئيسية للقسم
    const backBtn = document.getElementById('backBtn');
    backBtn.classList.remove('hidden');
    backBtn.onclick = () => Router.navigate('library');
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
