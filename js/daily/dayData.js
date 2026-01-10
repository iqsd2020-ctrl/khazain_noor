/* Preloaded content for each day of the week.
 * This file defines a global `dayContent` object where keys correspond
 * to the English names of days (e.g. 'Friday') and values are HTML
 * fragments containing the markup for that day's deeds. The contents
 * originate from the Day/*.txt files bundled with the application. By
 * loading this module, the application can render daily deeds without
 * having to fetch local files at runtime, which can be restricted
 * under the file:// protocol.
 */

// Use var so that dayContent becomes a global property on the window object. This
// ensures other scripts (e.g. daily.js) can access it without imports.
var dayContent = {
  'Friday': `<div class="space-y-4">
    <div class="glass-card rounded-xl p-5 text-right border-r-4 border-indigo-400">
        <h3 class="text-lg text-indigo-300 font-bold mb-2"><i class="fa-solid fa-star ml-2"></i>فضل وأعمال الجمعة</h3>
        <ul class="list-disc list-inside text-gray-200 leading-loose text-sm space-y-2">
            <li class="text-green-300">يوم صالح لشراء واقتناء وخياطة الثياب.</li>
            <li class="text-green-300">يستحب غسل الجمعة (قبل الزوال).</li>
            <li class="text-green-300">تقليم الأظافر يدر الرزق ويؤمن من الجذام والعمى.</li>
            <li>المقاربة بعد العصر مستحبة (والمولود عالم مشهور).</li>
            <li>من أراد الحجامة فليحتجم الجمعة عصراً.</li>
        </ul>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-blue-300 font-bold mb-2"><i class="fa-regular fa-clock ml-2"></i>وقت الاستخارة</h3>
        <p class="reading-text text-lg text-gray-100">
            جيدة عند طلوع الشمس وعند العشاء (ورديئة عند العصر والضحى).
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-amber-300 font-bold mb-2"><i class="fa-solid fa-hand-holding-droplet ml-2"></i>تسبيح اليوم (100 مرة)</h3>
        <p class="reading-text text-sm text-white font-bold text-center py-2 leading-loose">
            اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَآلِ مُحَمَّدٍ وَعَجِّلْ فَرَجَهُمْ وَأَهْلِكْ عَدُوَّهُمْ، يَا اللَّهُ يَا هُوَ
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-emerald-300 font-bold mb-2"><i class="fa-solid fa-mosque ml-2"></i>زيارة اليوم</h3>
        <p class="reading-text text-gray-100 leading-loose">
            زيارة مولانا صاحب العصر والزمان (أرواحنا فداه).
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-indigo-300 font-bold mb-2"><i class="fa-solid fa-person-praying ml-2"></i>صلاة اليوم</h3>
        <p class="reading-text text-gray-200 text-sm leading-relaxed">
            ركعتان (من غير صلاة الجمعة)، تقرأ في الأولى سورة إبراهيم وفي الثانية سورة الحجر.
            <br><span class="text-xs opacity-70">الثواب: لم يصبه فقر أبداً ولا جنون ولا بلوى.</span>
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right text-center">
        <h3 class="text-base text-gray-400 mb-1">الذكر الخاص (256 مرة)</h3>
        <p class="text-2xl font-bold text-white">يَا نُورُ</p>
    </div>
</div>
`,
  'Saturday': `<div class="space-y-4">
    <div class="glass-card rounded-xl p-5 text-right border-r-4 border-rose-400">
        <h3 class="text-lg text-rose-300 font-bold mb-2"><i class="fa-solid fa-triangle-exclamation ml-2"></i>تنبيهات السبت</h3>
        <ul class="list-disc list-inside text-gray-200 leading-loose text-sm space-y-2">
            <li>يكره تقليم الأظافر (يورث الداء في الأصابع).</li>
            <li>لا يصلح فيه شراء أو خياطة الملابس الجديدة.</li>
            <li>المقاربة الزوجية (ليلة الأحد) غير جيدة.</li>
            <li class="text-green-300">يصح فيه الحجامة والفصد.</li>
        </ul>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-blue-300 font-bold mb-2"><i class="fa-regular fa-clock ml-2"></i>وقت الاستخارة</h3>
        <p class="reading-text text-lg text-gray-100">
            جيدة من طلوع الشمس إلى الضحى، ومن العصر إلى المغرب.
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-amber-300 font-bold mb-2"><i class="fa-solid fa-hand-holding-droplet ml-2"></i>تسبيح اليوم (100 مرة)</h3>
        <p class="reading-text text-xl text-white font-bold text-center py-2">
            يَا رَبَّ الْعَالَمِينَ
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-emerald-300 font-bold mb-2"><i class="fa-solid fa-mosque ml-2"></i>زيارة اليوم</h3>
        <p class="reading-text text-gray-100 leading-loose">
            زيارة النبي الأكرم (صلى الله عليه وآله وسلم).
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-indigo-300 font-bold mb-2"><i class="fa-solid fa-person-praying ml-2"></i>صلاة اليوم</h3>
        <p class="reading-text text-gray-200 text-sm leading-relaxed">
            أربع ركعات، يقرأ في كل ركعة الحمد، و(قل هو الله أحد) و(آية الكرسي).
            <br><span class="text-xs opacity-70">الثواب: كتبه الله في درجة النبيين والشهداء.</span>
        </p>
    </div>
    
    <div class="glass-card rounded-xl p-5 text-right text-center">
        <h3 class="text-base text-gray-400 mb-1">الذكر الخاص (1060 مرة)</h3>
        <p class="text-2xl font-bold text-white">يَا غَنِيُّ</p>
    </div>
</div>
`,
  'Sunday': `<div class="space-y-4">
    <div class="glass-card rounded-xl p-5 text-right border-r-4 border-indigo-400">
        <h3 class="text-lg text-indigo-300 font-bold mb-2"><i class="fa-solid fa-circle-info ml-2"></i>خصائص الأحد</h3>
        <ul class="list-disc list-inside text-gray-200 leading-loose text-sm space-y-2">
            <li class="text-green-300">المقاربة الزوجية جيدة (الولد يكون حافظاً لكتاب الله).</li>
            <li class="text-green-300">يستحب فيه الحجامة بعد الزوال.</li>
            <li class="text-rose-300">تقليم الأظافر غير جيد (يذهب بالبركة).</li>
            <li class="text-rose-300">لا يصلح لشراء الملابس الجديدة.</li>
        </ul>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-blue-300 font-bold mb-2"><i class="fa-regular fa-clock ml-2"></i>وقت الاستخارة</h3>
        <p class="reading-text text-lg text-gray-100">
            جيدة عند طلوع الشمس، وعند العشاء.
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-amber-300 font-bold mb-2"><i class="fa-solid fa-hand-holding-droplet ml-2"></i>تسبيح اليوم (100 مرة)</h3>
        <p class="reading-text text-xl text-white font-bold text-center py-2">
            يَا ذَا الْجَلالِ وَالإِكْرَامِ
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-emerald-300 font-bold mb-2"><i class="fa-solid fa-mosque ml-2"></i>زيارة اليوم</h3>
        <p class="reading-text text-gray-100 leading-loose">
            زيارة أمير المؤمنين (ع) والسيدة الزهراء (ع).
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-indigo-300 font-bold mb-2"><i class="fa-solid fa-person-praying ml-2"></i>صلاة اليوم</h3>
        <p class="reading-text text-gray-200 text-sm leading-relaxed">
            أربع ركعات، يقرأ في كل ركعة الحمد و(آمن الرسول...) مرة واحدة.
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right text-center">
        <h3 class="text-base text-gray-400 mb-1">الذكر الخاص (489 مرة)</h3>
        <p class="text-2xl font-bold text-white">يَا فَتَّاحُ</p>
    </div>
</div>
`,
  'Monday': `<div class="space-y-4">
    <div class="glass-card rounded-xl p-5 text-right border-r-4 border-green-400">
        <h3 class="text-lg text-green-300 font-bold mb-2"><i class="fa-solid fa-thumbs-up ml-2"></i>مستحبات الاثنين</h3>
        <ul class="list-disc list-inside text-gray-200 leading-loose text-sm space-y-2">
            <li>مناسب جداً لتقليم الأظافر (يورث حفظ القرآن).</li>
            <li>يصلح للمقاربة الزوجية ليلاً.</li>
            <li>يستحب فيه الحجامة.</li>
            <li>يوم صالح لشراء وخياطة الثياب.</li>
        </ul>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-blue-300 font-bold mb-2"><i class="fa-regular fa-clock ml-2"></i>وقت الاستخارة</h3>
        <p class="reading-text text-lg text-gray-100">
            جيدة عند طلوع الشمس، والمغرب، والعشاء.
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-amber-300 font-bold mb-2"><i class="fa-solid fa-hand-holding-droplet ml-2"></i>تسبيح اليوم (100 مرة)</h3>
        <p class="reading-text text-xl text-white font-bold text-center py-2">
            يَا قَاضِيَ الْحَاجَاتِ
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-emerald-300 font-bold mb-2"><i class="fa-solid fa-mosque ml-2"></i>زيارة اليوم</h3>
        <p class="reading-text text-gray-100 leading-loose">
            زيارة الإمامين الحسن والحسين (عليهما السلام).
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-indigo-300 font-bold mb-2"><i class="fa-solid fa-person-praying ml-2"></i>صلاة اليوم</h3>
        <p class="reading-text text-gray-200 text-sm leading-relaxed">
            عشر ركعات، يقرأ في كل ركعة الحمد و(قل هو الله أحد) عشراً.
            <br><span class="text-xs opacity-70">الثواب: يجعل الله له نوراً يضيء منه الموقف يوم القيامة.</span>
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right text-center">
        <h3 class="text-base text-gray-400 mb-1">الذكر الخاص (129 مرة)</h3>
        <p class="text-2xl font-bold text-white">يَا لَطِيفُ</p>
    </div>
</div>
`,
  'Tuesday': `<div class="space-y-4">
    <div class="glass-card rounded-xl p-5 text-right border-r-4 border-amber-400">
        <h3 class="text-lg text-amber-300 font-bold mb-2"><i class="fa-solid fa-list-check ml-2"></i>أعمال الثلاثاء</h3>
        <ul class="list-disc list-inside text-gray-200 leading-loose text-sm space-y-2">
            <li class="text-green-300">يوم صالح للحجامة والفصد.</li>
            <li class="text-green-300">صالح للمقاربة الزوجية.</li>
            <li class="text-rose-300">التقليم غير جيد (يخاف الهلاك عليه).</li>
            <li class="text-rose-300">لا يصلح لخياطة الملابس.</li>
        </ul>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-blue-300 font-bold mb-2"><i class="fa-regular fa-clock ml-2"></i>وقت الاستخارة</h3>
        <p class="reading-text text-lg text-gray-100">
            جيدة عند الظهر والعشاء (وردئية عند الضحى والعصر).
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-amber-300 font-bold mb-2"><i class="fa-solid fa-hand-holding-droplet ml-2"></i>تسبيح اليوم (100 مرة)</h3>
        <p class="reading-text text-xl text-white font-bold text-center py-2">
            يَا أَرْحَمَ الرَّاحِمِينَ
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-emerald-300 font-bold mb-2"><i class="fa-solid fa-mosque ml-2"></i>زيارة اليوم</h3>
        <p class="reading-text text-gray-100 leading-loose">
            زيارة الأئمة السجاد والباقر والصادق (عليهم السلام).
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-indigo-300 font-bold mb-2"><i class="fa-solid fa-person-praying ml-2"></i>صلاة اليوم</h3>
        <p class="reading-text text-gray-200 text-sm leading-relaxed">
            ست ركعات، يقرأ في كل ركعة الحمد، و(آمن الرسول)، و(إذا زلزلت) مرة واحدة.
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right text-center">
        <h3 class="text-base text-gray-400 mb-1">الذكر الخاص (903 مرة)</h3>
        <p class="text-2xl font-bold text-white">يَا قَابِضُ</p>
    </div>
</div>
`,
  'Wednesday': `<div class="space-y-4">
    <div class="glass-card rounded-xl p-5 text-right border-r-4 border-cyan-400">
        <h3 class="text-lg text-cyan-300 font-bold mb-2"><i class="fa-solid fa-clipboard-list ml-2"></i>توجيهات الأربعاء</h3>
        <ul class="list-disc list-inside text-gray-200 leading-loose text-sm space-y-2">
            <li class="text-green-300">المقاربة الزوجية جيدة (الولد يكون عالماً أو حاكماً).</li>
            <li class="text-green-300">شراء وخياطة الملابس فيها منفعة.</li>
            <li class="text-rose-300">توقوا الحجامة والنورة (ليلاً).</li>
            <li class="text-rose-300">تقليم الأظافر غير جيد (يورث سوء الخلق).
            </li>
        </ul>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-blue-300 font-bold mb-2"><i class="fa-regular fa-clock ml-2"></i>وقت الاستخارة</h3>
        <p class="reading-text text-lg text-gray-100">
            جيدة عند الزوال (ورديئة عند العصر).
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-amber-300 font-bold mb-2"><i class="fa-solid fa-hand-holding-droplet ml-2"></i>تسبيح اليوم (100 مرة)</h3>
        <p class="reading-text text-xl text-white font-bold text-center py-2">
            يَا حَيُّ يَا قَيُّومُ
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-emerald-300 font-bold mb-2"><i class="fa-solid fa-mosque ml-2"></i>زيارة اليوم</h3>
        <p class="reading-text text-gray-100 leading-loose">
            زيارة الأئمة الكاظم والرضا والجواد والهادي (عليهم السلام).
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-indigo-300 font-bold mb-2"><i class="fa-solid fa-person-praying ml-2"></i>صلاة اليوم</h3>
        <p class="reading-text text-gray-200 text-sm leading-relaxed">
            أربع ركعات، يقرأ في كل ركعة الحمد، والإخلاص، وسورة القدر.
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right text-center">
        <h3 class="text-base text-gray-400 mb-1">الذكر الخاص (541 مرة)</h3>
        <p class="text-2xl font-bold text-white">يَا مُتَعَالُ</p>
    </div>
</div>
`,
  'Thursday': `<div class="space-y-4">
    <div class="glass-card rounded-xl p-5 text-right border-r-4 border-purple-400">
        <h3 class="text-lg text-purple-300 font-bold mb-2"><i class="fa-solid fa-star ml-2"></i>فضل الخميس</h3>
        <ul class="list-disc list-inside text-gray-200 leading-loose text-sm space-y-2">
            <li class="text-green-300">يستحب فيه تقليم الأظافر (يجلب الرزق ويشفي الألم).</li>
            <li class="text-green-300">المقاربة الزوجية ليلة الجمعة جيدة جداً.</li>
            <li class="text-green-300">يستحب الحجامة والفصد.</li>
            <li class="text-green-300">يصلح لشراء وخياطة الملابس.</li>
        </ul>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-blue-300 font-bold mb-2"><i class="fa-regular fa-clock ml-2"></i>وقت الاستخارة</h3>
        <p class="reading-text text-lg text-gray-100">
            جيدة عند طلوع الشمس وعند العشاء.
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-amber-300 font-bold mb-2"><i class="fa-solid fa-hand-holding-droplet ml-2"></i>تسبيح اليوم (100 مرة)</h3>
        <p class="reading-text text-xl text-white font-bold text-center py-2">
            لَا إِلَهَ إِلَّا اللَّهُ الْمَلِكُ الْحَقُّ الْمُبِينُ
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-emerald-300 font-bold mb-2"><i class="fa-solid fa-mosque ml-2"></i>زيارة اليوم</h3>
        <p class="reading-text text-gray-100 leading-loose">
            زيارة الإمام الحسن العسكري (عليه السلام).
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right">
        <h3 class="text-lg text-indigo-300 font-bold mb-2"><i class="fa-solid fa-person-praying ml-2"></i>صلاة اليوم</h3>
        <p class="reading-text text-gray-200 text-sm leading-relaxed">
            أربع ركعات، يقرأ في الأولى الحمد و(قل هو الله أحد) 11 مرة، وفي الثانية 21 مرة، وفي الثالثة 31 مرة، وفي الرابعة 41 مرة.
        </p>
    </div>

    <div class="glass-card rounded-xl p-5 text-right text-center">
        <h3 class="text-base text-gray-400 mb-1">الذكر الخاص (308 مرة)</h3>
        <p class="text-2xl font-bold text-white">يَا رَزَّاقُ</p>
    </div>
</div>
`,
};