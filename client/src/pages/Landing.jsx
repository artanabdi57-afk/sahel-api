import { useEffect, useRef, useState } from 'react';

const LOGO = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
  '<rect width="64" height="64" rx="16" fill="#15203B"/>' +
  '<text x="32" y="45" font-family="Georgia, serif" font-size="36" font-weight="700" fill="#F2C14E" text-anchor="middle">S</text>' +
  '</svg>'
);

const CHART = [
  { day: 'Mon', full: 'Monday', sales: 400, tx: 5, product: 'Rice (25kg)' },
  { day: 'Tue', full: 'Tuesday', sales: 800, tx: 8, product: 'Sugar (50kg)' },
  { day: 'Wed', full: 'Wednesday', sales: 600, tx: 6, product: 'Cooking Oil' },
  { day: 'Thu', full: 'Thursday', sales: 1300, tx: 11, product: 'Sugar (50kg)' },
  { day: 'Fri', full: 'Friday', sales: 1100, tx: 9, product: 'Flour (25kg)' },
  { day: 'Sat', full: 'Saturday', sales: 1700, tx: 13, product: 'Sugar (50kg)' },
  { day: 'Sun', full: 'Sunday', sales: 2100, tx: 14, product: 'Sugar (50kg)' },
];

const FEATS = [
  { icon: 'package', k: ['f1t', 'f1b'] }, { icon: 'bar-chart-3', k: ['f2t', 'f2b'] },
  { icon: 'trending-up', k: ['f3t', 'f3b'] }, { icon: 'wallet', k: ['f4t', 'f4b'] },
  { icon: 'shopping-cart', k: ['f5t', 'f5b'] }, { icon: 'shield-check', k: ['f6t', 'f6b'] },
];

const STEPS = [
  { icon: 'smartphone', n: 1, k: ['s1t', 's1b'] },
  { icon: 'package-plus', n: 2, k: ['s2t', 's2b'] },
  { icon: 'rocket', n: 3, k: ['s3t', 's3b'] },
];

const STATS = [
  { v: 2400, s: '+', k: 'st1', g: false },
  { v: 1.2, s: 'M', p: '$', k: 'st2', g: true },
  { v: 98, s: '%', k: 'st3', g: false },
  { v: 4.9, s: '★', k: 'st4', g: true },
];

const TESTS = [
  { img: 'taran1', name: 'Taran Ventures', loc: 'Electronics, Mogadishu', k: 't1q' },
  { img: 'muhin2', name: 'Muhin Appliances', loc: 'Home Appliances, Hargeisa', k: 't2q' },
  { img: 'wardo3', name: 'Wardo Fashion', loc: 'Clothing, Kismayo', k: 't3q' },
];

const FAQS = [
  { qk: 'fq1', ak: 'fa1' }, { qk: 'fq2', ak: 'fa2' },
  { qk: 'fq3', ak: 'fa3' }, { qk: 'fq4', ak: 'fa4' },
];

const T = {
  en: {
    'nav.features': 'Features', 'nav.how': 'How it works', 'nav.stories': 'Stories',
    'nav.faq': 'FAQ', 'nav.whatsapp': 'WhatsApp', 'nav.register': 'Register',
    'nav.registerSoon': 'Registration coming soon!',
    'hero.eyebrow': 'Sales & Inventory Tracker',
    'hero.headline': 'We track your sales, stock, and customer debts — from your phone.',
    'hero.sub': 'Sahel records every sale, alerts you when stock is low, and keeps a list of who owes you money. It works offline and speaks your language — Somali, English, and Arabic.',
    'hero.ctaPrimary': 'WhatsApp us to start', 'hero.ctaSecondary': 'How it works',
    'hero.trust': 'Used by 2,000+ shop owners', 'hero.chartTitle': 'Weekly sales — tap a day',
    'hero.topProduct': 'TOP PRODUCT', 'hero.revenue': 'WEEK TOTAL', 'hero.growth': 'VS LAST WEEK',
    'trust.bar': 'Used by these businesses',
    'features.eyebrow': 'What Sahel does',
    'features.title': 'Six things Sahel handles for you',
    'features.sub': 'These are the tasks you currently do on paper or in your head. Sahel does them automatically and you can check them anytime from your phone.',
    'f1t': 'Records your stock', 'f1b': 'Sahel counts what comes in and what goes out. When an item is running low, it sends you an alert before you sell out.',
    'f2t': 'Records every sale', 'f2b': 'Each time you sell something, tap it in Sahel. It adds up your daily, weekly, and monthly revenue automatically.',
    'f3t': 'Shows your best sellers', 'f3b': "Sahel ranks your products by what sells most. You see which items make money and which ones don't move.",
    'f4t': 'Records your expenses', 'f4b': 'Log your rent, electricity, supplier payments, and transport costs. Sahel subtracts them from your revenue so you see real profit.',
    'f5t': 'Tracks supplier orders', 'f5b': "When you order from a supplier, record it in Sahel. It tracks what you ordered, when it's due, and whether it arrived.",
    'f6t': 'Keeps your data private', 'f6b': 'Your sales and customer data stay on your phone and your secure account. Nobody else can see it.',
    'how.eyebrow': 'Get started',
    'how.title': "Three steps, five minutes, you're running",
    'how.sub': 'No setup wizard. No training videos. If you\'ve ever sent a WhatsApp message, you can use Sahel right now.',
    's1t': 'Enter your name and phone number', 's1b': "That's all Sahel asks for. No email, no password to remember.",
    's2t': 'Type a product name and its price', 's2b': "Add one product, sell it. Add another one later. You don't need to set up everything at once.",
    's3t': 'Tap to record a sale', 's3b': 'When a customer buys something, select the product and tap sell. Sahel updates your stock and revenue automatically.',
    'st1': 'Shops using Sahel', 'st2': 'Revenue tracked per month', 'st3': 'Uptime', 'st4': 'User rating',
    'testimonials.eyebrow': 'From our users', 'testimonials.title': 'What business owners say about Sahel',
    't1q': '"We were losing money because we forgot who paid and who didn\'t across three locations. Sahel fixed that. Now every sale and every debt is recorded. We recovered $1,800 in the first month."',
    't2q': '"We have 350 appliance models. Counting stock on paper was impossible. Sahel tracks it all. Our stock accuracy went from guessing to near-perfect, and we reduced overstock by 30%."',
    't3q': '"Fashion inventory changes every season. Before Sahel, I ordered based on gut feeling. Now I order based on what actually sells. My profit margin improved because I stopped buying things that don\'t move."',
    'faq.eyebrow': 'Common questions', 'faq.title': 'Answers to questions people ask us',
    'fq1': 'Is Sahel free?', 'fa1': 'Yes. Recording sales, tracking stock, and listing customer debts is free and will stay free.',
    'fq2': 'Does it work without internet?', 'fa2': 'Yes. Every sale and stock update is saved on your phone first. When your phone connects to the internet again, it syncs automatically.',
    'fq3': 'Can my employees use it?', 'fa3': 'Yes. You create accounts for your staff. They can record sales, but only you see the full financial picture.',
    'fq4': 'Is my data safe?', 'fa4': 'Your data is encrypted and stored securely. Only you can access your business records.',
    'cta.eyebrow': 'Free to start',
    'cta.title': 'Stop losing money to forgotten debts and messy records.',
    'cta.sub': 'WhatsApp us now on +252 624 407 283 and we\'ll set you up in minutes.',
    'cta.button': 'WhatsApp us now', 'cta.secondary': 'See features',
    'footer.desc': 'Sahel records your sales, manages your stock, and tracks who owes you money — from your phone, in Somali, English, and Arabic.',
    'footer.product': 'Product', 'footer.feat': 'Features', 'footer.how': 'How it works',
    'footer.support': 'Support', 'footer.help': 'FAQ', 'footer.contact': 'WhatsApp Us',
    'footer.tagline': 'Built for shop owners, by shop owners.',
    'chart.sales': 'SALES', 'chart.transactions': 'TRANSACTIONS',
    'days': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  so: {
    'nav.features': 'Muuqaal', 'nav.how': 'Sida ay u shaqeyso', 'nav.stories': 'Sheekooyin',
    'nav.faq': "Su'aalo", 'nav.whatsapp': 'WhatsApp', 'nav.register': 'Diiwaan geli',
    'nav.registerSoon': 'Diiwaan gelinta soon!',
    'hero.eyebrow': 'La soco iibka iyo bakhaarka',
    'hero.headline': 'Waxaan la soco naa iibkaa, bakhaarka, iyo lacagta macaamiisha ku waaya — taleefankaaga.',
    'hero.sub': "Sahel waxay diiwaan gelisaa iib kasta, waxay ku dhawaaqdaa marka alaabtu yartahay, waxayna kaydisaa liiska kuwa lacag kuu leh. Waxay shaqeynaysaa internet la'aan oo afkaaga waa Soomaali, Ingiriisi iyo Carabi.",
    'hero.ctaPrimary': 'WhatsApp nala soo xiriir', 'hero.ctaSecondary': 'Sida ay u shaqeyso',
    'hero.trust': '2,000+ oo dukaan oo isticmaala Sahel',
    'hero.chartTitle': 'Iibka toddobaadkan — taabo maalinta',
    'hero.topProduct': 'ALAABTA UGU IIBKA BADAN', 'hero.revenue': 'WADARTA TODDOBAADKA',
    'hero.growth': 'TODDOBAADKA HORE',
    'trust.bar': 'Dukaanoyin kuwaan isticmaala',
    'features.eyebrow': 'Waxaa Sahel sameeyaa', 'features.title': 'Lixdar oo Sahel kuu qabtaa',
    'features.sub': 'Waa shaqooyin hadda warqad ama maskaxda ku sameeyso. Sahel waxay sameeyaa si otomaatig ah, sax ah, oo waad la socdi karo taleefankaaga wakhti kasta.',
    'f1t': 'Waxay kaydisaa bakhaarka', 'f1b': 'Sahel waxay tirinaysaa waxa soo gelayaa iyo waxa baxaysaa. Marka alaabtu yartahay, waxay ku dhawaaqdaa inta aysan dhammaan.',
    'f2t': 'Waxay diiwaan gelisaa iib kasta', 'f2b': 'Marka iibto dhacdo, taabo Sahel. Waxay isku daraysaa dakhligaaga maalinlaha, toddobaadlaha, iyo bisha si otomaatig ah.',
    'f3t': 'Waxay muuqataa alaabta ugu iibsata', 'f3b': 'Sahel waxay isla soo qortaa alaabta sida iibka ugu badan. Waxaad arki doontaa waxa lacag geysata iyo waxa aan la iibin.',
    'f4t': 'Waxay kaydisaa kharashka', 'f4b': "Diiwaan geli kirada, korontada, lacag bixinta supplier-ka, iyo kharashga gaadinka. Sahel waxay ka saartaa dakhligaaga si aad u aragto faa'idada dhabta ah.",
    'f5t': 'Waxay la socotaa dalabka supplier-ka', 'f5b': 'Marka aad supplier-ka ka dalbayso, diiwaan geli Sahel. Waxay la socotaa waxa dalbayso, waqtiga, iyo inay yimaaddo.',
    'f6t': 'Waxay xifdisaa xogtaada', 'f6b': 'Xogta iibkaaga iyo macaamiishaaga waxay ku sugan tahay taleefankaaga iyo account-kaaga ammaan ka ah. Qofna ma arki karo.',
    'how.eyebrow': 'Bilaow', 'how.title': 'Sadar saddex ah, daqiiqo shan, waad shaqeynaysaa',
    'how.sub': 'Wax setup ah, wax video barasho ah. Hadii aad weli WhatsApp diri karto, Sahel waad isticmaali kartaa hadda.',
    's1t': 'Geli magacaaga iyo lambaraga taleefanka', 's1b': 'Sahel waxay weyddiisaa oo keliya. Iimayl, furasho, tixraac xumaan maaha.',
    's2t': 'Qor magaca alaabta iyo qiimaha', 's2b': 'Kudar alaab halmar, iibi. Kadib kudar mid kale. Wax kasta waa inaad iskugu darin waqtigaas.',
    's3t': 'Taabo si aad u diiwaan geliso iibka', 's3b': 'Marka macmiil iibo, dooro alaabta oo taabo iibi. Sahel waxay cusbooneysiiyaa bakhaarka iyo dakhliga si otomaatig ah.',
    'st1': 'Dukaan isticmaala Sahel', 'st2': 'Dakhli la soco bishan', 'st3': 'Waqtiga shaqeyn', 'st4': 'Qiime muuqalka',
    'testimonials.eyebrow': 'Ka isticmaalayaashayada', 'testimonials.title': 'Waxay ganacsatada sheegaan Sahel',
    't1q': '"Waxaan la waashay lacag ceeb ah sababtoo ah waxaan isdilay mid bixiyay iyo midna aan bixin saddex meelood. Sahel waxay xallisey. Hadda iib kasta iyo deyn kasta waa la diiwaan geliyaa. Bishii ugu horeysay waxaan ka soo celiyay $1,800 oo hore paper-ka ku dulsaaray."',
    't2q': '"Waxaan haynaa 350 nooc oo qalab guriga ah. Tirinta bakhaarka warqad ahaanna ayay ku dhacday Sahel. Saxda bakhaarka waxay ka baxday dhamaan oo waa yaraaday 30% kharashda ku waynaatay."',
    't3q': '"Dhar business-ka waxay badaltaa jiilaalka. Hore Sahel, waxaan order gelin jiray rajo. Hadda waxaan order geliyaa sida waxa dhabta ah loo iibiyo. Faaiidadaaday waaa korodhay."',
    'faq.eyebrow': "Su'aalo caadi ah", 'faq.title': 'Jawaabo su\'aalooyin oo nala weydiiyay',
    'fq1': 'Sahel ma bilaash bay ahayd?', 'fa1': 'Haa. Diiwaanka iibka, la socodka bakhaarka, iyo liiska deynta macaamiisha waa bilaash.',
    'fq2': "Internet la'aan ma shaqeyn?", 'fa2': 'Haa. Iib kasta iyo cusboonayn bakhaarka waxay kaydisaa taleefankaaga horta. Marka internet ku soo baxdo, waxay si otomaatig ah u midowdaa.',
    'fq3': 'Shaqaalaydu isticmaali karaa?', 'fa3': 'Haa. Waxaad sameysaa account shaqaale kasta. Waxay diiwaan geli karaan iib, oo kaliya aad oo ahaan muhiimka ah ayaad arki doontaa.',
    'fq4': 'Xogtayda ma ammaan bay ahayd?', 'fa4': 'Xogtaada waa la xifdiyaa si ammaan ah. Aad oo kaliya ayaa arki karta xogtaaga ganacsiga.',
    'cta.eyebrow': 'Bilaash inaad bilaabto',
    'cta.title': 'Jooji inaad lacag la waasho deyno daalan iyo daaweyn xumaan.',
    'cta.sub': 'WhatsApp nala soo xiriir hadda +252 624 407 283 oo waan ku diyaarinnaa daqiiqado.',
    'cta.button': 'WhatsApp nala soo xiriir', 'cta.secondary': 'Eeg muuqaalada',
    'footer.desc': 'Sahel waxay diiwaan gelisaa iibkaa, maamulaa bakhaarka, oo la socdaa kuwa lacag kuu leh — taleefankaaga, Soomaali, Ingiriisi, iyo Carabi.',
    'footer.product': 'Badeecad', 'footer.feat': 'Muuqaal', 'footer.how': 'Sida ay u shaqeyso',
    'footer.support': 'Taageero', 'footer.help': "Su'aalo", 'footer.contact': 'WhatsApp Nala Xiriir',
    'footer.tagline': 'Laga dhisay ganacsato, oo ganacsato.',
    'chart.sales': 'IIBKA', 'chart.transactions': 'DHAQDHAQAAQ',
    'days': ['Isniin', 'Talaada', 'Arbaco', 'Khamiis', 'Jimco', 'Sabti', 'Axad'],
  },
  ar: {
    'nav.features': 'المميزات', 'nav.how': 'كيف يعمل', 'nav.stories': 'قصص',
    'nav.faq': 'أسئلة', 'nav.whatsapp': 'واتساب', 'nav.register': 'إنشاء حساب',
    'nav.registerSoon': 'التسجيل قريباً!',
    'hero.eyebrow': 'تتبع المبيعات والمخزون',
    'hero.headline': 'نسجّل مبيعاتك ومخزونك وديون عملائك — من هاتفك.',
    'hero.sub': 'ساهل يسجّل كل عملية بيع، ينبهك عندما ينخفض المخزون، ويحتفظ بقائمة بمن لك عنده دين. يعمل بدون إنترنت ويتكلم بلغتك — الصومالية والإنجليزية والعربية.',
    'hero.ctaPrimary': 'تواصل معنا عبر واتساب', 'hero.ctaSecondary': 'كيف يعمل',
    'hero.trust': 'يستخدمه أكثر من 2,000 صاحب متجر',
    'hero.chartTitle': 'مبيعات الأسبوع — اضغط على يوم',
    'hero.topProduct': 'المنتج الأكثر مبيعاً', 'hero.revenue': 'إجمالي الأسبوع',
    'hero.growth': 'مقارنة بالأسبوع السابق',
    'trust.bar': 'يستخدمه هذه المتاجر',
    'features.eyebrow': 'ماذا يفعل ساهل', 'features.title': 'ستة أشياء يتعامل معها ساهل',
    'features.sub': 'هذه المهام التي تقوم بها حالياً على الورق أو في رأسك. ساهل يقوم بها تلقائياً ويمكنك مراجعتها أي وقت من هاتفك.',
    'f1t': 'يسجّل مخزونك', 'f1b': 'ساهل يحسب ما يدخل وما يخرج. عندما ينخفض منتج، يرسل لك تنبيهاً قبل أن تنفذ الكمية.',
    'f2t': 'يسجّل كل عملية بيع', 'f2b': 'كلما بعت شيئاً، اضغط عليه في ساهل. يجمع إيراداتك اليومية والأسبوعية والشهرية تلقائياً.',
    'f3t': 'يُظهر أكثر المنتجات مبيعاً', 'f3b': 'ساهل يرتب منتجاتك حسب الأكثر مبيعاً. ترى أي المنتجات تجلب المال وأيها لا تتحرك.',
    'f4t': 'يسجّل مصروفاتك', 'f4b': 'سجّل الإيجار والكهرباء ودفعات الموردين وتكاليف النقل. ساهل يطرحها من إيراداتك فترى الربح الحقيقي.',
    'f5t': 'يتتبع طلبات الموردين', 'f5b': 'عندما تطلب من مورد، سجّله في ساهل. يتتبع ما طلبته وموعد الاستلام وهل وصل.',
    'f6t': 'يحافظ على خصوصية بياناتك', 'f6b': 'بيانات مبيعاتك وعملائك تبقى على هاتفك وحسابك الآمن. لا أحد غيرك يمكنه رؤيتها.',
    'how.eyebrow': 'ابدأ الآن', 'how.title': 'ثلاث خطوات، خمس دقائق، أنت تعمل',
    'how.sub': 'بدون معالج إعداد. بدون فيديوهات تدريب. إذا أرسلت رسالة واتساب من قبل، يمكنك استخدام ساهل الآن.',
    's1t': 'أدخل اسمك ورقم هاتفك', 's1b': 'هذا كل ما يطلبه ساهل. بدون بريد إلكتروني، بدون كلمة مرور.',
    's2t': 'اكتب اسم المنتج وسعره', 's2b': 'أضف منتجاً واحداً وابدأ البيع. لا تحتاج لإعداد كل شيء مرة واحدة.',
    's3t': 'اضغط لتسجيل عملية بيع', 's3b': 'عندما يشتري عميل شيئاً، اختر المنتج واضغط بيع. ساهل يحدّث مخزونك وإيراداتك تلقائياً.',
    'st1': 'متجر يستخدم ساهل', 'st2': 'إيرادات متتبعة شهرياً', 'st3': 'وقت التشغيل', 'st4': 'تقييم المستخدمين',
    'testimonials.eyebrow': 'من مستخدمينا', 'testimonials.title': 'ماذا يقول أصحاب المتاجر عن ساهل',
    't1q': '"كنا نخسر المال لأننا كنا ننسى من دفع ومن لم يدفع عبر ثلاثة فروع. ساهل حلّ هذه المشكلة. الآن كل عملية بيع وكل دين مسجّل. استرددنا 1,800 دولار في الشهر الأول."',
    't2q': '"لدينا 350 موديل جهاز منزلي. عد المخزون على الورق كان مستحيلاً. ساهل يتتبع كل شيء. دقة المخزون انتقلت من التخمين إلى شبه الكمال، وقللنا المخزون الزائد بنسبة 30%."',
    't3q': '"مخزون الأزياء يتغير كل موسم. قبل ساهل، كنت أطلب بناءً على الحدس. الآن أطلب بناءً على ما يباع فعلاً. تحسنت هامش الربح لأنني توقفت عن شراء الأشياء التي لا تتحرك."',
    'faq.eyebrow': 'أسئلة شائعة', 'faq.title': 'إجابات على الأسئلة التي يطرحها الناس علينا',
    'fq1': 'هل ساهل مجاني؟', 'fa1': 'نعم. تسجيل المبيعات وتتبع المخزون وإعداد قائمة ديون العملاء مجاني وسيبقى مجانياً.',
    'fq2': 'هل يعمل بدون إنترنت؟', 'fa2': 'نعم. كل عملية بيع وتحديث المخزون يتم حفظه على هاتفك أولاً. عندما يتصل هاتفك بالإنترنت مرة أخرى، يتم المزامنة تلقائياً.',
    'fq3': 'هل يمكن لموظفي استخدامها؟', 'fa3': 'نعم. تقوم بإنشاء حسابات لموظفيك. يمكنهم تسجيل المبيعات، ولكن أنت فقط ترى الصورة المالية الكاملة.',
    'fq4': 'هل بياناتي آمنة؟', 'fa4': 'بياناتك مشفرة ومخزنة بشكل آمن. أنت فقط يمكنك الوصول إلى سجلات عملك.',
    'cta.eyebrow': 'مجاني للبدء',
    'cta.title': 'توقف عن خسارة المال بسبب الديون المنسية والسجلات الفوضوية.',
    'cta.sub': 'تواصل معنا عبر واتساب الآن على +252 624 407 283 وسنقوم بإعدادك في دقائق.',
    'cta.button': 'تواصل معنا عبر واتساب الآن', 'cta.secondary': 'شاهد المميزات',
    'footer.desc': 'ساهل يسجّل مبيعاتك، يدير مخزونك، ويتتبع من لك عنده دين — من هاتفك، بالصومالية والإنجليزية والعربية.',
    'footer.product': 'المنتج', 'footer.feat': 'المميزات', 'footer.how': 'كيف يعمل',
    'footer.support': 'الدعم', 'footer.help': 'الأسئلة الشائعة', 'footer.contact': 'تواصل معنا عبر واتساب',
    'footer.tagline': 'صُنع لأصحاب المتاجر، من قبل أصحاب المتاجر.',
    'chart.sales': 'المبيعات', 'chart.transactions': 'المعاملات',
    'days': ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
  },
};

/* ─── Reusable icon components (no external dependency) ─── */
const Icon = ({ name, size = 20, className = '' }) => {
  const icons = {
    'package': <path d="M16.5 9.4 7.55 4.24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,
    'bar-chart-3': <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 17V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M13 17V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 17v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,
    'trending-up': <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17 6 23 6 23 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,
    'wallet': <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,
    'shopping-cart': <circle cx="8" cy="21" r="1" fill="currentColor"/><circle cx="19" cy="21" r="1" fill="currentColor"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,
    'shield-check': <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><polyline points="9 12 11 14 15 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,
    'smartphone': <rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="18" x2="12.01" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    'package-plus': <path d="M16.5 9.4 7.55 4.24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="8" x2="12" y2="8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="8" y1="12" x2="8" y2="12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="16" y1="12" x2="16" y2="12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    'rocket': <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,
    'star': <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,
    'arrow-down': <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="19 12 12 19 5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    'menu': <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>,
    'info': <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/><line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>,
    'instagram': <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="1.8"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="currentColor" strokeWidth="1.8"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>,
    'twitter': <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,
    'chevron-down': <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {icons[name] || null}
    </svg>
  );
};

/* ─── WhatsApp SVG ─── */
const WAIcon = ({ size = 16, fill = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

/* ─── Main component ─── */
export default function Landing() {
  const [lang, setLangState] = useState('en');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(-1);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: -300, y: -300 });
  const [openFaq, setOpenFaq] = useState(-1);
  const chartRef = useRef(null);
  const tooltipRef = useRef(null);
  const pointsRef = useRef([]);
  const animRef = useRef([]);

  const tr = (key) => (T[lang]?.[key]) || T.en[key] || key;

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const setLang = (l) => {
    setLangState(l);
    setSelectedDay(-1);
    setOpenFaq(-1);
  };

  /* scroll & cursor */
  useEffect(() => {
    const onScroll = () => {
      const st = document.documentElement.scrollTop;
      const sh = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress(sh > 0 ? (st / sh) * 100 : 0);
    };
    const onMouse = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouse, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onMouse); };
  }, []);

  /* intersection observer for animations */
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.anim-up,.anim-scale,.stat-bar').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [lang]);

  /* chart rendering */
  const renderChart = () => {
    const svg = chartRef.current;
    if (!svg) return;
    svg.innerHTML = '';
    pointsRef.current = [];
    animRef.current = [];

    const W = 500, H = 192, padL = 8, padR = 8, padT = 16, padB = 8;
    const cW = W - padL - padR, cH = H - padT - padB;
    const maxS = Math.max(...CHART.map(d => d.sales)) * 1.15;
    const n = CHART.length;
    const ns = 'http://www.w3.org/2000/svg';

    /* defs */
    const defs = document.createElementNS(ns, 'defs');
    defs.innerHTML = `<linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#15203B" stop-opacity="0.18"/><stop offset="100%" stop-color="#15203B" stop-opacity="0.01"/></linearGradient><linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#1E2D50"/><stop offset="100%" stop-color="#15203B"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
    svg.appendChild(defs);

    /* grid */
    for (let i = 0; i <= 3; i++) {
      const y = padT + (cH / 3) * i;
      const ln = document.createElementNS(ns, 'line');
      Object.entries({ x1: padL, y1: y, x2: W - padR, y2: y, stroke: i < 3 ? '#EAE3D3' : '#D8CFB8', 'stroke-width': '1', 'stroke-dasharray': i < 3 ? '4,4' : 'none' }).forEach(([k, v]) => ln.setAttribute(k, v));
      svg.appendChild(ln);
    }

    const pts = CHART.map((d, i) => ({
      x: padL + (cW / (n - 1)) * i,
      y: padT + cH - (d.sales / maxS) * cH,
      data: d, index: i,
    }));
    pointsRef.current = pts;

    /* catmull-rom */
    function crToBezier(points, tension) {
      let path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(i - 1, 0)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(i + 2, points.length - 1)];
        const cp1x = p1.x + (p2.x - p0.x) / (6 * tension), cp1y = p1.y + (p2.y - p0.y) / (6 * tension);
        const cp2x = p2.x - (p3.x - p1.x) / (6 * tension), cp2y = p2.y - (p3.y - p1.y) / (6 * tension);
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }
      return path;
    }

    const linePath = crToBezier(pts, 1);
    let len = 0;
    for (let i = 1; i < pts.length; i++) len += Math.sqrt((pts[i].x - pts[i - 1].x) ** 2 + (pts[i].y - pts[i - 1].y) ** 2);
    len *= 1.25;

    /* area */
    const area = document.createElementNS(ns, 'path');
    area.setAttribute('d', linePath + ` L ${pts[n - 1].x} ${padT + cH} L ${pts[0].x} ${padT + cH} Z`);
    area.setAttribute('fill', 'url(#areaGrad)');
    area.style.opacity = '0'; area.style.transition = 'opacity .8s ease';
    svg.appendChild(area);
    setTimeout(() => { area.style.opacity = '1'; }, 600);

    /* line */
    const line = document.createElementNS(ns, 'path');
    line.setAttribute('d', linePath);
    Object.entries({ fill: 'none', stroke: 'url(#lineGrad)', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }).forEach(([k, v]) => line.setAttribute(k, v));
    line.style.strokeDasharray = len; line.style.strokeDashoffset = len;
    line.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)';
    svg.appendChild(line);
    setTimeout(() => { line.style.strokeDashoffset = '0'; }, 50);

    /* hit area */
    const hit = document.createElementNS(ns, 'path');
    hit.setAttribute('d', linePath);
    Object.entries({ fill: 'none', stroke: 'transparent', 'stroke-width': '24' }).forEach(([k, v]) => hit.setAttribute(k, v));
    hit.style.cursor = 'pointer';
    svg.appendChild(hit);

    /* points */
    pts.forEach((p, i) => {
      const ring = document.createElementNS(ns, 'circle');
      Object.entries({ cx: p.x, cy: p.y, r: '14', fill: '#F2C14E', opacity: '0', filter: 'url(#glow)', id: 'ring-' + i }).forEach(([k, v]) => ring.setAttribute(k, v));
      ring.style.transition = 'opacity .25s ease';
      svg.appendChild(ring);

      const c = document.createElementNS(ns, 'circle');
      Object.entries({ cx: p.x, cy: p.y, r: '0', fill: '#FBF8F2', stroke: '#15203B', 'stroke-width': '2.5', id: 'pt-' + i }).forEach(([k, v]) => c.setAttribute(k, v));
      c.style.cursor = 'pointer'; c.style.transition = 'r .2s ease, stroke .2s ease, stroke-width .2s ease';
      c.addEventListener('click', (e) => { e.stopPropagation(); handleSelect(i); });
      c.addEventListener('mouseenter', () => handleHover(i));
      c.addEventListener('mouseleave', handleLeave);
      svg.appendChild(c);

      setTimeout(() => { c.setAttribute('r', '4'); }, 600 + i * 80);
    });

    /* hit area events */
    hit.addEventListener('mousemove', (e) => {
      const rect = svg.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (W / rect.width);
      let ci = 0, cd = Infinity;
      pts.forEach((p, i) => { const d = Math.abs(p.x - mx); if (d < cd) { cd = d; ci = i; } });
      handleHover(ci);
    });
    hit.addEventListener('mouseleave', handleLeave);
    hit.addEventListener('click', (e) => {
      const rect = svg.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (W / rect.width);
      let ci = 0, cd = Infinity;
      pts.forEach((p, i) => { const d = Math.abs(p.x - mx); if (d < cd) { cd = d; ci = i; } });
      handleSelect(ci);
    });
  };

  useEffect(() => { renderChart(); }, [lang]);

  const handleHover = (i) => {
    if (selectedDay !== -1) return;
    pointsRef.current.forEach((_, j) => {
      const pt = document.getElementById('pt-' + j);
      const ring = document.getElementById('ring-' + j);
      const lbl = document.getElementById('lbl-' + j);
      if (!pt) return;
      if (j === i) {
        pt.setAttribute('r', '6'); ring.setAttribute('opacity', '0.12'); if (lbl) lbl.style.color = '#15203B';
      } else {
        pt.setAttribute('r', '4'); ring.setAttribute('opacity', '0'); if (lbl) lbl.style.color = '';
      }
    });
    /* tooltip */
    const tip = tooltipRef.current;
    if (tip && pointsRef.current[i]) {
      const svgR = chartRef.current?.getBoundingClientRect();
      if (svgR) {
        const sx = svgR.width / 500, sy = svgR.height / 192;
        tip.style.left = (pointsRef.current[i].x * sx) + 'px';
        tip.style.top = (pointsRef.current[i].y * sy - 12) + 'px';
        tip.textContent = '$' + CHART[i].sales.toLocaleString();
        tip.style.opacity = '1';
      }
    }
  };

  const handleLeave = () => {
    if (selectedDay !== -1) return;
    pointsRef.current.forEach((_, j) => {
      const pt = document.getElementById('pt-' + j);
      const ring = document.getElementById('ring-' + j);
      const lbl = document.getElementById('lbl-' + j);
      if (!pt) return;
      pt.setAttribute('r', '4'); ring.setAttribute('opacity', '0'); if (lbl) lbl.style.color = '';
    });
    if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
  };

  const handleSelect = (i) => {
    if (selectedDay === i) { setSelectedDay(-1); handleLeave(); return; }
    setSelectedDay(i);
    pointsRef.current.forEach((_, j) => {
      const pt = document.getElementById('pt-' + j);
      const ring = document.getElementById('ring-' + j);
      const lbl = document.getElementById('lbl-' + j);
      if (!pt) return;
      if (j === i) {
        pt.setAttribute('r', '7'); pt.setAttribute('stroke', '#F2C14E'); pt.setAttribute('stroke-width', '3');
        ring.setAttribute('opacity', '0.25'); ring.setAttribute('r', '16'); if (lbl) lbl.style.color = '#15203B';
      } else {
        pt.setAttribute('r', '4'); pt.setAttribute('stroke', '#15203B'); pt.setAttribute('stroke-width', '2');
        ring.setAttribute('opacity', '0'); if (lbl) lbl.style.color = '';
      }
    });
    if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
  };

  const toggleFaq = (i) => { setOpenFaq(openFaq === i ? -1 : i); };

  const days = tr('days');
  const weekTotal = CHART.reduce((s, d) => s + d.sales, 0);

  const cn = 'font-sans antialiased overflow-x-hidden';

  return (
    <div className={`bg-cream text-ink ${cn} ${lang === 'ar' ? 'lang-ar' : ''}`} style={lang === 'ar' ? { fontFamily: "'Noto Sans Arabic', sans-serif", direction: 'rtl' } : {}}>
      {/* Progress bar */}
      <div id="scroll-progress" style={{ position: 'fixed', top: 0, left: 0, height: 3, zIndex: 9999, background: 'linear-gradient(90deg,#15203B,#F2C14E)', width: scrollProgress + '%', transition: 'width .05s linear' }} />

      {/* Cursor glow */}
      <div id="cursor-glow" style={{ position: 'fixed', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(242,193,78,0.06)0%,transparent 70%)', pointerEvents: 'none', zIndex: 1, transform: 'translate(-50%,-50%)', left: cursorPos.x, top: cursorPos.y, transition: 'left .05s, top .05s' }} />

      {/* Toast */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#15203B', color: '#FBF8F2', padding: '14px 24px', borderRadius: 14, fontSize: 14, fontWeight: 600, boxShadow: '0 20px 40px rgba(21,32,59,.3)', transform: toastVisible ? 'translateY(0)' : 'translateY(120px)', opacity: toastVisible ? 1 : 0, transition: 'all .4s cubic-bezier(.22,1,.36,1)', zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="info" size={16} className="text-gold flex-shrink-0" />
        <span>{toastMsg}</span>
      </div>

      {/* WhatsApp float */}
      <div style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 9998, animation: 'wa-bounce 2s ease-in-out infinite' }}>
        <a href="https://wa.me/252624407283" target="_blank" rel="noopener" aria-label="WhatsApp" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, background: '#25D366', borderRadius: '50%', boxShadow: '0 6px 24px rgba(37,211,102,.4)', transition: 'all .3s' }}>
          <WAIcon size={30} fill="white" />
        </a>
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300" style={{ background: 'rgba(251,248,242,.8)', backdropFilter: 'blur(14px)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            <a href="#" className="flex items-center gap-3 group">
              <div className="relative">
                <img src={LOGO} alt="Sahel" className="w-10 h-10 rounded-[10px] object-cover shrink-0 transition-transform group-hover:scale-105 group-hover:-rotate-1" />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gold rounded-full" style={{ animation: 'pulse-ring 2s ease-out infinite' }} />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-ink">Sahel</span>
            </a>
            <div className="hidden md:flex items-center gap-1">
              <div className="flex bg-cream-dark rounded-full p-1 border border-border-dark mr-3">
                {['en', 'so', 'ar'].map(l => (
                  <button key={l} onClick={() => setLang(l)} className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${lang === l ? 'bg-ink text-cream' : 'text-slate-faint hover:text-slate'}`} style={l === 'ar' ? { fontFamily: "'Noto Sans Arabic', sans-serif" } : {}}>
                    {l === 'en' ? 'EN' : l === 'so' ? 'SO' : 'ع'}
                  </button>
                ))}
              </div>
              {[['#features', 'nav.features'], ['#how', 'nav.how'], ['#testimonials', 'nav.stories'], ['#faq', 'nav.faq']].map(([href, key]) => (
                <a key={key} href={href} className="px-4 py-2 text-sm font-medium text-slate hover:text-ink transition-colors">{tr(key)}</a>
              ))}
              <div className="w-px h-6 bg-border-dark mx-2" />
              <a href="https://wa.me/252624407283" target="_blank" className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-wa hover:text-green-700 transition-colors">
                <WAIcon size={16} /><span>{tr('nav.whatsapp')}</span>
              </a>
              <a href="#" onClick={e => { e.preventDefault(); showToast(tr('nav.registerSoon')); }} className="bg-ink text-cream px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-ink-light hover:shadow-lg hover:shadow-ink/20 transition-all duration-200">{tr('nav.register')}</a>
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-cream-dark transition-colors"><Icon name="menu" /></button>
          </div>
          {/* Mobile menu */}
          <div style={{ maxHeight: mobileOpen ? 400 : 0, overflow: 'hidden', opacity: mobileOpen ? 1 : 0, transition: 'max-height .35s ease, opacity .3s ease' }} className="md:hidden">
            <div className="py-4 border-t border-border space-y-1">
              {[['#features', 'nav.features'], ['#how', 'nav.how'], ['#testimonials', 'nav.stories'], ['#faq', 'nav.faq']].map(([href, key]) => (
                <a key={key} href={href} onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-slate hover:bg-cream-dark transition-colors">{tr(key)}</a>
              ))}
              <a href="https://wa.me/252624407283" target="_blank" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-wa"><WAIcon size={16} /><span>{tr('nav.whatsapp')}</span></a>
              <div className="px-4 pt-3">
                <a href="#" onClick={e => { e.preventDefault(); showToast(tr('nav.registerSoon')); }} className="block text-center py-3 rounded-xl text-sm font-bold bg-ink text-cream">{tr('nav.register')}</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-[72px] grid-bg glow-gold curve-connector">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 md:py-32 lg:py-40">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative z-10">
              <div className="anim-up inline-flex items-center gap-2 bg-gold-glow border border-gold/30 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                <span className="text-xs font-extrabold tracking-widest uppercase text-gold-dim">{tr('hero.eyebrow')}</span>
              </div>
              <h1 className="anim-up font-serif text-[2.75rem] md:text-[3.5rem] lg:text-[4rem] font-bold leading-[1.08] tracking-tight text-ink mb-6">{tr('hero.headline')}</h1>
              <p className="anim-up anim-up-delay-3 text-lg md:text-xl text-slate leading-relaxed max-w-xl mb-10">{tr('hero.sub')}</p>
              <div className="anim-up anim-up-delay-4 flex flex-wrap gap-4">
                <a href="https://wa.me/252624407283?text=I%20want%20to%20use%20Sahel" target="_blank" className="bg-wa text-white px-8 py-4 rounded-2xl text-base font-bold hover:bg-green-600 hover:-translate-y-1 hover:shadow-2xl hover:shadow-wa/30 transition-all duration-300">{tr('hero.ctaPrimary')}</a>
                <a href="#how" className="flex items-center gap-2 px-6 py-4 rounded-2xl text-base font-bold text-ink border-2 border-border-dark hover:border-ink/30 hover:bg-white/60 transition-all duration-200">{tr('hero.ctaSecondary')} <Icon name="arrow-down" size={20} className="text-gold-dim" /></a>
              </div>
              <div className="anim-up anim-up-delay-5 flex items-center gap-6 mt-10 pt-8 border-t border-border">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(s => <img key={s} src={`https://picsum.photos/seed/shop${s}/40/40.jpg`} className="w-9 h-9 rounded-full border-2 border-cream object-cover" alt="" />)}
                  <div className="w-9 h-9 rounded-full border-2 border-cream bg-gold-glow flex items-center justify-center text-xs font-bold text-gold-dim">+2k</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-gold-dim">{[1, 2, 3, 4, 5].map(i => <Icon key={i} name="star" size={14} className="fill-current" />)}</div>
                  <p className="text-xs text-slate-faint font-medium mt-0.5">{tr('hero.trust')}</p>
                </div>
              </div>
            </div>
            {/* Chart card */}
            <div className="anim-scale anim-up-delay-2 relative">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gold/10 rounded-3xl rotate-12 float" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-ink/5 rounded-2xl -rotate-12 float-d" />
              <div className="relative bg-white rounded-3xl border border-border shadow-2xl shadow-ink/[0.07] p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-extrabold tracking-widest uppercase text-slate-faint mb-1">{tr('hero.eyebrow')}</p>
                    <h3 className="text-lg font-bold text-ink">{tr('hero.chartTitle')}</h3>
                  </div>
                  <div className="w-10 h-10 bg-gold-glow rounded-xl flex items-center justify-center"><Icon name="trending-up" size={20} className="text-gold-dim" /></div>
                </div>
                <div className="relative" style={{ height: 192 }}>
                  <div ref={tooltipRef} className="line-chart-tooltip" style={{ position: 'absolute', background: '#15203B', color: '#FBF8F2', fontSize: 11, fontWeight: 700, padding: '6px 14px', borderRadius: 8, whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 20, opacity: 0, transition: 'opacity .2s ease', transform: 'translateX(-50%)' }} />
                  <svg ref={chartRef} width="100%" height="100%" viewBox="0 0 500 192" preserveAspectRatio="none" style={{ overflow: 'visible' }} />
                </div>
                <div className="flex justify-between px-1 pt-1">
                  {CHART.map((d, i) => (
                    <span key={d.day} id={`lbl-${i}`} onClick={() => handleSelect(i)} className="flex-1 text-center text-[10px] font-semibold text-slate-faint cursor-pointer transition-colors" style={{ transition: 'color .25s' }}>{days[i] || d.day}</span>
                  ))}
                </div>
                {/* Detail panel */}
                <div style={{ maxHeight: selectedDay !== -1 ? 80 : 0, opacity: selectedDay !== -1 ? 1 : 0, marginTop: selectedDay !== -1 ? 16 : 0, overflow: 'hidden', transition: 'max-height .4s cubic-bezier(.22,1,.36,1), opacity .3s ease, margin .3s ease' }}>
                  <div className="bg-cream rounded-xl p-4 border border-border flex items-center justify-between">
                    <div><p className="text-[10px] font-extrabold tracking-widest uppercase text-slate-faint">{CHART[selectedDay]?.full.toUpperCase()}</p><p className="text-base font-bold text-ink">{days[selectedDay]}</p></div>
                    <div className="text-right"><p className="text-[10px] font-extrabold tracking-widest uppercase text-slate-faint">{tr('chart.sales')}</p><p className="text-xl font-bold text-gold-dim">${CHART[selectedDay]?.sales.toLocaleString()}</p></div>
                    <div className="text-right"><p className="text-[10px] font-extrabold tracking-widest uppercase text-slate-faint">{tr('chart.transactions')}</p><p className="text-xl font-bold text-ink">{CHART[selectedDay]?.tx}</p></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-border">
                  <div><p className="text-[10px] font-extrabold tracking-widest text-slate-faint mb-1">{tr('hero.topProduct')}</p><p className="text-sm font-bold text-ink">{selectedDay !== -1 ? CHART[selectedDay].product : 'Sugar (50kg)'}</p></div>
                  <div className="text-center"><p className="text-[10px] font-extrabold tracking-widest text-slate-faint mb-1">{tr('hero.revenue')}</p><p className="text-sm font-bold text-gold-dim">${weekTotal.toLocaleString()}</p></div>
                  <div className="text-right"><p className="text-[10px] font-extrabold tracking-widest text-slate-faint mb-1">{tr('hero.growth')}</p><p className="text-sm font-bold text-emerald-600">+24.5%</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="py-14 bg-white/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-center text-xs font-extrabold tracking-widest uppercase text-slate-faint mb-8 anim-up">{tr('trust.bar')}</p>
          <div className="anim-up anim-up-delay-1 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {['Taran Ventures', 'Muhin Appliances', 'Wardo Fashion', 'Xamar Wholesale', 'Geela Shop'].map(n => (
              <span key={n} className="font-serif text-xl md:text-2xl font-bold text-ink opacity-30 cursor-default hover:opacity-60 hover:scale-105 transition-all">{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 md:py-32 relative glow-ink">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-20">
            <div className="anim-up inline-flex items-center gap-2 bg-gold-glow border border-gold/30 rounded-full px-4 py-1.5 mb-5"><span className="text-xs font-extrabold tracking-widest uppercase text-gold-dim">{tr('features.eyebrow')}</span></div>
            <h2 className="anim-up anim-up-delay-1 font-serif text-3xl md:text-5xl font-bold text-ink mb-4">{tr('features.title')}</h2>
            <p className="anim-up anim-up-delay-2 text-lg text-slate-light max-w-2xl mx-auto">{tr('features.sub')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATS.map((f, i) => (
              <div key={f.k[0]} className={`tool-card card-shine anim-up anim-up-delay-${Math.min(i + 1, 5)} bg-white rounded-2xl border border-border p-6 hover:shadow-xl hover:shadow-ink/[0.06] transition-all duration-300`}>
                <div className="w-12 h-12 bg-gold-glow rounded-xl flex items-center justify-center mb-4"><Icon name={f.icon} size={24} className="text-gold-dim feat-icon" /></div>
                <h3 className="text-lg font-bold text-ink mb-2">{tr(f.k[0])}</h3>
                <p className="text-sm text-slate-light leading-relaxed">{tr(f.k[1])}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 md:py-32 bg-white border-y border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 md:mb-20">
            <div className="anim-up inline-flex items-center gap-2 bg-gold-glow border border-gold/30 rounded-full px-4 py-1.5 mb-5"><span className="text-xs font-extrabold tracking-widest uppercase text-gold-dim">{tr('how.eyebrow')}</span></div>
            <h2 className="anim-up anim-up-delay-1 font-serif text-3xl md:text-5xl font-bold text-ink mb-4">{tr('how.title')}</h2>
            <p className="anim-up anim-up-delay-2 text-lg text-slate-light max-w-2xl mx-auto">{tr('how.sub')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {STEPS.map((s, i) => (
              <div key={s.k[0]} className={`anim-up anim-up-delay-${i + 1} text-center relative`}>
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gold-glow rounded-2xl mb-6">
                  <Icon name={s.icon} size={36} className="text-gold-dim" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-ink rounded-lg flex items-center justify-center text-sm font-bold text-cream">{s.n}</div>
                </div>
                <h3 className="text-lg font-bold text-ink mb-2">{tr(s.k[0])}</h3>
                <p className="text-sm text-slate-light leading-relaxed max-w-xs mx-auto">{tr(s.k[1])}</p>
                {i < STEPS.length - 1 && <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-border-dark" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 bg-ink relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/[0.06] rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {STATS.map((s, i) => (
              <div key={s.k} className={`stat-bar anim-up anim-up-delay-${i + 1} text-center`}>
                <p className={`text-4xl md:text-5xl font-bold ${s.g ? 'text-gold' : 'text-cream'} mb-2`}>{s.p || ''}{s.v.toLocaleString()}{s.s}</p>
                <p className="text-sm text-cream/50">{tr(s.k)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 md:py-32 relative glow-gold">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="anim-up inline-flex items-center gap-2 bg-gold-glow border border-gold/30 rounded-full px-4 py-1.5 mb-5"><span className="text-xs font-extrabold tracking-widest uppercase text-gold-dim">{tr('testimonials.eyebrow')}</span></div>
            <h2 className="anim-up anim-up-delay-1 font-serif text-3xl md:text-5xl font-bold text-ink mb-4">{tr('testimonials.title')}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTS.map((t, i) => (
              <div key={t.k} className={`anim-up anim-up-delay-${i + 1} bg-white rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow duration-300`}>
                <div className="flex items-center gap-3 mb-4">
                  <img src={`https://picsum.photos/seed/${t.img}/48/48.jpg`} className="w-12 h-12 rounded-full object-cover" alt={t.name} />
                  <div><p className="font-bold text-ink">{t.name}</p><p className="text-xs text-slate-faint">{t.loc}</p></div>
                </div>
                <p className="text-sm text-slate-light leading-relaxed">{tr(t.k)}</p>
                <div className="flex items-center gap-1 mt-4 text-gold-dim">{[1, 2, 3, 4, 5].map(j => <Icon key={j} name="star" size={14} className="fill-current" />)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 md:py-32 relative glow-ink">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="anim-up inline-flex items-center gap-2 bg-gold-glow border border-gold/30 rounded-full px-4 py-1.5 mb-5"><span className="text-xs font-extrabold tracking-widest uppercase text-gold-dim">{tr('faq.eyebrow')}</span></div>
            <h2 className="anim-up anim-up-delay-1 font-serif text-3xl md:text-4xl font-bold text-ink">{tr('faq.title')}</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={f.qk} className="bg-white rounded-xl border border-border overflow-hidden">
                <button className="w-full flex items-center justify-between p-5 text-left hover:bg-cream-dark/50 transition-colors" onClick={() => toggleFaq(i)}>
                  <span className="font-bold text-ink pr-4">{tr(f.qk)}</span>
                  <Icon name="chevron-down" size={20} className="text-slate-faint shrink-0 transition-transform duration-300" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
                <div style={{ maxHeight: openFaq === i ? 300 : 0, overflow: 'hidden', transition: 'max-height .4s cubic-bezier(.22,1,.36,1)' }}>
                  <p className="px-5 pb-5 text-sm text-slate-light leading-relaxed">{tr(f.ak)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 bg-ink relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold/[0.08] rounded-full blur-3xl" />
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <div className="anim-up inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 mb-6"><span className="w-2 h-2 bg-gold rounded-full animate-pulse" /><span className="text-xs font-extrabold tracking-widest uppercase text-cream/60">{tr('cta.eyebrow')}</span></div>
          <h2 className="anim-up anim-up-delay-1 font-serif text-3xl md:text-5xl font-bold text-cream mb-6 leading-tight">{tr('cta.title')}</h2>
          <p className="anim-up anim-up-delay-2 text-lg text-cream/50 mb-10 max-w-xl mx-auto">{tr('cta.sub')}</p>
          <div className="anim-up anim-up-delay-3 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/252624407283?text=I%20want%20to%20use%20Sahel%20for%20my%20shop" target="_blank" className="bg-wa text-white px-10 py-4 rounded-2xl text-base font-bold hover:bg-green-600 hover:-translate-y-1 hover:shadow-2xl hover:shadow-wa/30 transition-all duration-300">{tr('cta.button')}</a>
            <a href="#features" className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-cream/70 border-2 border-cream/15 hover:border-cream/30 hover:text-cream transition-all duration-200">{tr('cta.secondary')} <Icon name="arrow-down" size={16} /></a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0D1529] py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src={LOGO} alt="Sahel" className="w-[34px] h-[34px] rounded-lg" />
                <span className="font-serif text-xl font-bold text-cream">Sahel</span>
              </div>
              <p className="text-sm text-cream/40 leading-relaxed max-w-sm mb-6">{tr('footer.desc')}</p>
              <div className="flex gap-3 mb-6">
                <a href="https://wa.me/252624407283" target="_blank" className="w-9 h-9 bg-wa/20 rounded-lg flex items-center justify-center hover:bg-wa/30 transition-colors"><WAIcon size={16} fill="#25D366" /></a>
                <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"><Icon name="instagram" size={16} className="text-cream/50" /></a>
                <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"><Icon name="twitter" size={16} className="text-cream/50" /></a>
              </div>
              <p className="text-sm text-cream/60 font-semibold flex items-center gap-2"><WAIcon size={14} fill="#25D366" /> +252 624 407 283</p>
            </div>
            <div>
              <h4 className="text-xs font-extrabold tracking-widest uppercase text-cream/30 mb-4">{tr('footer.product')}</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-sm text-cream/50 hover:text-cream transition-colors">{tr('footer.feat')}</a></li>
                <li><a href="#how" className="text-sm text-cream/50 hover:text-cream transition-colors">{tr('footer.how')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-extrabold tracking-widest uppercase text-cream/30 mb-4">{tr('footer.support')}</h4>
              <ul className="space-y-3">
                <li><a href="#faq" className="text-sm text-cream/50 hover:text-cream transition-colors">{tr('footer.help')}</a></li>
                <li><a href="https://wa.me/252624407283" target="_blank" className="text-sm text-cream/50 hover:text-cream transition-colors">{tr('footer.contact')}</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-cream/25">© 2025 Sahel. All rights reserved.</p>
            <p className="text-xs text-cream/25">{tr('footer.tagline')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
