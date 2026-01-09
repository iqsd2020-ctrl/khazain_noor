// --- منطق المسبحة المطورة ---

Views.tasbih = () => {
    document.getElementById('titleEl').innerText = 'المسبحة الإلكترونية';
    
    const mode = localStorage.getItem('tasbihMode') || 'normal';
    const count = parseInt(localStorage.getItem('tasbihCount') || 0);
    const zahraStage = parseInt(localStorage.getItem('zahraStage') || 0);
    
    const zahraConfig = [
        { label: 'الله أكبر', limit: 34 },
        { label: 'الحمد لله', limit: 33 },
        { label: 'سبحان الله', limit: 33 }
    ];

    const dayMap = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const todayName = dayMap[new Date().getDay()];
    
    // بيانات الأذكار اليومية (مبسطة للدمج)
    const dailyZikr = {
        'السبت': { text: 'يا رب العالمين', limit: 100 },
        'الأحد': { text: 'يا ذا الجلال والإكرام', limit: 100 },
        'الاثنين': { text: 'يا قاضي الحاجات', limit: 100 },
        'الثلاثاء': { text: 'يا أرحم الراحمين', limit: 100 },
        'الأربعاء': { text: 'يا حي يا قيوم', limit: 100 },
        'الخميس': { text: 'لا إله إلا الله الملك الحق المبين', limit: 100 },
        'الجمعة': { text: 'اللهم صل على محمد وآل محمد', limit: 100 }
    };

    const currentZikr = dailyZikr[todayName];

    let label = 'ذكر الله';
    let limit = null;
    let isCompleted = false;

    if (mode === 'zahra') {
        if (zahraStage < 3) {
            label = zahraConfig[zahraStage].label;
            limit = zahraConfig[zahraStage].limit;
        } else {
            label = 'تقبل الله أعمالكم';
            isCompleted = true;
        }
    } else if (mode === 'daily') {
        label = currentZikr.text;
        limit = currentZikr.limit;
        if (count >= limit) isCompleted = true;
    }

    document.getElementById('app').innerHTML = `
        <div class="fade-in" style="height:100%; display:flex; flex-direction:column; padding: 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 30px;">
                <button data-action="tasbih-mode" data-mode="normal" class="card ${mode === 'normal' ? 'active-mode' : ''}" style="padding: 10px; font-size: 0.8rem; text-align: center; border: 1px solid var(--border);">مسبحة عامة</button>
                <button data-action="tasbih-mode" data-mode="zahra" class="card ${mode === 'zahra' ? 'active-mode' : ''}" style="padding: 10px; font-size: 0.8rem; text-align: center; border: 1px solid var(--border);">تسبيح الزهراء</button>
                <button data-action="tasbih-mode" data-mode="daily" class="card ${mode === 'daily' ? 'active-mode' : ''}" style="padding: 10px; font-size: 0.8rem; text-align: center; border: 1px solid var(--border); grid-column: span 2;">ذكر يوم ${todayName}</button>
            </div>

            <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <div id="tasbihLabel" style="font-family: 'Amiri', serif; font-size: 1.5rem; color: var(--primary); margin-bottom: 20px; text-align: center; min-height: 2.5rem;">
                    ${label}
                </div>
                
                <div class="tasbih-ring" data-action="tasbih-inc" style="width: 220px; height: 220px; border: 8px solid var(--primary); border-radius: 50%; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer; transition: transform 0.1s; box-shadow: var(--shadow-lg); background: var(--surface);">
                    <span id="tasbihVal" style="font-size: 4rem; font-weight: 800; color: var(--text-main); font-family: monospace;">${isCompleted ? '<span class="material-symbols-outlined" aria-label="تم">check</span>' : count}</span>
                    ${limit ? `<span style="font-size: 0.9rem; color: var(--text-muted);">الهدف: ${limit}</span>` : ''}
                </div>

                ${mode === 'zahra' && zahraStage < 3 ? `
                    <div style="display: flex; gap: 8px; margin-top: 20px;">
                        ${[0, 1, 2].map(i => `<div style="width: 30px; height: 6px; border-radius: 3px; background: ${i === zahraStage ? 'var(--primary)' : (i < zahraStage ? 'var(--secondary)' : 'var(--border)')}"></div>`).join('')}
                    </div>
                ` : ''}
                
                <div style="text-align:center; margin-top:40px;">
                    <button data-action="tasbih-reset" style="background:var(--surface); border:1px solid var(--border); color:var(--text-muted); padding:8px 24px; border-radius:20px; font-family:inherit; cursor:pointer; display: flex; align-items: center; gap: 8px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                        إعادة ضبط
                    </button>
                </div>
            </div>
        </div>
        <style>
            .active-mode { background: var(--primary) !important; color: white !important; border-color: var(--primary) !important; }
            .tasbih-ring:active { transform: scale(0.95); }
        </style>
    `;
};

const TasbihLogic = {
    setMode: (m) => {
        localStorage.setItem('tasbihMode', m);
        TasbihLogic.reset(false);
        Views.tasbih();
    },
    increment: () => {
        const mode = localStorage.getItem('tasbihMode') || 'normal';
        let count = parseInt(localStorage.getItem('tasbihCount') || 0);
        let zahraStage = parseInt(localStorage.getItem('zahraStage') || 0);
        
        const zahraConfig = [
            { label: 'الله أكبر', limit: 34 },
            { label: 'الحمد لله', limit: 33 },
            { label: 'سبحان الله', limit: 33 }
        ];

        if (mode === 'zahra') {
            if (zahraStage >= 3) return;
            count++;
            if (count >= zahraConfig[zahraStage].limit) {
                zahraStage++;
                count = 0;
                if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
            } else {
                if (navigator.vibrate) navigator.vibrate(10);
            }
            localStorage.setItem('zahraStage', zahraStage);
        } else {
            count++;
            if (navigator.vibrate) navigator.vibrate(10);
        }
        
        localStorage.setItem('tasbihCount', count);
        Views.tasbih();
    },
    reset: (ask = true) => {
        if (!ask || confirm('هل تريد إعادة ضبط العداد؟')) {
            localStorage.setItem('tasbihCount', 0);
            localStorage.setItem('zahraStage', 0);
            Views.tasbih();
        }
    }
};


// expose for actions.js
window.TasbihLogic = TasbihLogic;
