import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, BarChart3, TrendingUp, Wallet, ShoppingCart, 
  ShieldCheck, Smartphone, PackagePlus, Rocket, Star, 
  ChevronDown, Menu, Info, Instagram, Twitter, ArrowDown, X,
  CheckCircle2
} from 'lucide-react';

// --- DATA & TRANSLATIONS (Preserved Exactly) ---
const CHART_DATA = [
  {day:'Mon',full:'Monday',sales:400,tx:5,product:'Rice (25kg)'},
  {day:'Tue',full:'Tuesday',sales:800,tx:8,product:'Sugar (50kg)'},
  {day:'Wed',full:'Wednesday',sales:600,tx:6,product:'Cooking Oil'},
  {day:'Thu',full:'Thursday',sales:1300,tx:11,product:'Sugar (50kg)'},
  {day:'Fri',full:'Friday',sales:1100,tx:9,product:'Flour (25kg)'},
  {day:'Sat',full:'Saturday',sales:1700,tx:13,product:'Sugar (50kg)'},
  {day:'Sun',full:'Sunday',sales:2100,tx:14,product:'Sugar (50kg)'},
];

const T = {
  en: {
    'nav.features':'Features','nav.how':'How it works','nav.stories':'Stories','nav.faq':'FAQ','nav.whatsapp':'WhatsApp','nav.register':'Register','nav.registerSoon':'Account created! Security token (JWT) saved.',
    'hero.eyebrow':'Sales & Inventory Tracker','hero.headline':'We track your sales, stock, and customer debts — from your phone.','hero.sub':'Sahel records every sale, alerts you when stock is low, and keeps a list of who owes you money. It works offline and speaks your language — Somali, English, and Arabic.','hero.ctaPrimary':'WhatsApp us to start','hero.ctaSecondary':'How it works','hero.trust':'Used by 2,000+ shop owners','hero.chartTitle':'Weekly sales — tap a day','hero.topProduct':'TOP PRODUCT','hero.revenue':'WEEK TOTAL','hero.growth':'VS LAST WEEK',
    'trust.bar':'Used by these businesses',
    'features.eyebrow':'What Sahel does','features.title':'Six things Sahel handles for you','features.sub':'These are the tasks you currently do on paper or in your head. Sahel does them automatically and you can check them anytime from your phone.',
    'f1t':'Records your stock','f1b':'Sahel counts what comes in and what goes out. When an item is running low, it sends you an alert before you sell out.','f2t':'Records every sale','f2b':'Each time you sell something, tap it in Sahel. It adds up your daily, weekly, and monthly revenue automatically.','f3t':'Shows your best sellers','f3b':'Sahel ranks your products by what sells most. You see which items make money and which ones don\'t move.','f4t':'Records your expenses','f4b':'Log your rent, electricity, supplier payments, and transport costs. Sahel subtracts them from your revenue so you see real profit.','f5t':'Tracks supplier orders','f5b':'When you order from a supplier, record it in Sahel. It tracks what you ordered, when it\'s due, and whether it arrived.','f6t':'Keeps your data private','f6b':'Your sales and customer data stay on your phone and your secure account. Nobody else can see it.',
    'how.eyebrow':'Get started','how.title':'Three steps, five minutes, you\'re running','how.sub':'No setup wizard. No training videos. If you\'ve ever sent a WhatsApp message, you can use Sahel right now.',
    's1t':'Enter your name and phone number','s1b':'That\'s all Sahel asks for. No email, no password to remember.','s2t':'Type a product name and its price','s2b':'Add one product, sell it. Add another one later. You don\'t need to set up everything at once.','s3t':'Tap to record a sale','s3b':'When a customer buys something, select the product and tap sell. Sahel updates your stock and revenue automatically.',
    'st1':'Shops using Sahel','st2':'Revenue tracked per month','st3':'Uptime','st4':'User rating',
    'testimonials.eyebrow':'From our users','testimonials.title':'What business owners say about Sahel',
    't1q':'"We were losing money because we forgot who paid and who didn\'t across three locations. Sahel fixed that. Now every sale and every debt is recorded. We recovered $1,800 in the first month."','t2q':'"We have 350 appliance models. Counting stock on paper was impossible. Sahel tracks it all. Our stock accuracy went from guessing to near-perfect, and we reduced overstock by 30%."','t3q':'"Fashion inventory changes every season. Before Sahel, I ordered based on gut feeling. Now I order based on what actually sells. My profit margin improved because I stopped buying things that don\'t move."',
    'faq.eyebrow':'Common questions','faq.title':'Answers to questions people ask us',
    'fq1':'Is Sahel free?','fa1':'Yes. Recording sales, tracking stock, and listing customer debts is free and will stay free.','fq2':'Does it work without internet?','fa2':'Yes. Every sale and stock update is saved on your phone first. When your phone connects to the internet again, it syncs automatically.','fq3':'Can my employees use it?','fa3':'Yes. You create accounts for your staff. They can record sales, but only you see the full financial picture.','fq4':'Is my data safe?','fa4':'Your data is encrypted and stored securely. Only you can access your business records.',
    'cta.eyebrow':'Free to start','cta.title':'Stop losing money to forgotten debts and messy records.','cta.sub':'WhatsApp us now on +252 624 407 283 and we\'ll set you up in minutes.','cta.button':'WhatsApp us now','cta.secondary':'See features',
    'footer.desc':'Sahel records your sales, manages your stock, and tracks who owes you money — from your phone, in Somali, English, and Arabic.','footer.product':'Product','footer.feat':'Features','footer.how':'How it works','footer.support':'Support','footer.help':'FAQ','footer.contact':'WhatsApp Us','footer.tagline':'Built for shop owners, by shop owners.',
    'days':['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
  },
  so: {
    'nav.features':'Muuqaal','nav.how':'Sida ay u shaqeyso','nav.stories':'Sheekooyin','nav.faq':'Su\'aalo','nav.whatsapp':'WhatsApp','nav.register':'Diiwaan geli','nav.registerSoon':'Akoon waa la sameeyay! JWT waa la keydiyay.',
    'hero.eyebrow':'La soco iibka iyo bakhaarka','hero.headline':'Waxaan la soco naa iibkaa, bakhaarka, iyo lacagta macaamiisha ku waaya — taleefankaaga.','hero.sub':'Sahel waxay diiwaan gelisaa iib kasta, waxay ku dhawaaqdaa marka alaabtu yartahay, waxayna kaydisaa liiska kuwa lacag kuu leh. Waxay shaqeynaysaa internet la\'aan oo afkaaga waa Soomaali, Ingiriisi iyo Carabi.','hero.ctaPrimary':'WhatsApp nala soo xiriir','hero.ctaSecondary':'Sida ay u shaqeyso','hero.trust':'2,000+ oo dukaan oo isticmaala Sahel','hero.chartTitle':'Iibka toddobaadkan — taabo maalinta','hero.topProduct':'ALAABTA UGU IIBKA BADAN','hero.revenue':'WADARTA TODDOBAADKA','hero.growth':'TODDOBAADKA HORE',
    'trust.bar':'Dukaanoyin kuwaan isticmaala',
    'features.eyebrow':'Waxaa Sahel sameeyaa','features.title':'Lixdar oo Sahel kuu qabtaa','features.sub':'Waa shaqooyin hadda warqad ama maskaxda ku sameeyso. Sahel waxay sameeyaa si otomaatig ah, sax ah, oo waad la socdi karo taleefankaaga wakhti kasta.',
    'f1t':'Waxay kaydisaa bakhaarka','f1b':'Sahel waxay tirinaysaa waxa soo gelayaa iyo waxa baxaysaa. Marka alaabtu yartahay, waxay ku dhawaaqdaa inta aysan dhammaan.','f2t':'Waxay diiwaan gelisaa iib kasta','f2b':'Marka iibto dhacdo, taabo Sahel. Waxay isku daraysaa dakhligaaga maalinlaha, toddobaadlaha, iyo bisha si otomaatig ah.','f3t':'Waxay muuqataa alaabta ugu iibsata','f3b':'Sahel waxay isla soo qortaa alaabta sida iibka ugu badan. Waxaad arki doontaa waxa lacag geysata iyo waxa aan la iibin.','f4t':'Waxay kaydisaa kharashka','f4b':'Diiwaan geli kirada, korontada, lacag bixinta supplier-ka, iyo kharashga gaadinka. Sahel waxay ka saartaa dakhligaaga si aad u aragto faa\'iidada dhabta ah.','f5t':'Waxay la socotaa dalabka supplier-ka','f5b':'Marka aad supplier-ka ka dalbayso, diiwaan geli Sahel. Waxay la socotaa waxa dalbayso, waqtiga, iyo inay yimaaddo.','f6t':'Waxay xifdisaa xogtaada','f6b':'Xogta iibkaaga iyo macaamiishaaga waxay ku sugan tahay taleefankaaga iyo account-kaaga ammaan ka ah. Qofna ma arki karo.',
    'how.eyebrow':'Bilaow','how.title':'Sadar saddex ah, daqiiqo shan, waad shaqeynaysaa','how.sub':'Wax setup ah, wax video barasho ah. Hadii aad weli WhatsApp diri karto, Sahel waad isticmaali kartaa hadda.',
    's1t':'Geli magacaaga iyo lambaraga taleefanka','s1b':'Sahel waxay weyddiisaa oo keliya. Iimayl, furasho, tixraac xumaan maaha.','s2t':'Qor magaca alaabta iyo qiimaha','s2b':'Kudar alaab halmar, iibi. Kadib kudar mid kale. Wax kasta waa inaad iskugu darin waqtigaas.','s3t':'Taabo si aad u diiwaan geliso iibka','s3b':'Marka macmiil iibo, dooro alaabta oo taabo iibi. Sahel waxay cusbooneysiiyaa bakhaarka iyo dakhliga si otomaatig ah.',
    'st1':'Dukaan isticmaala Sahel','st2':'Dakhli la soco bishan','st3':'Waqtiga shaqeyn','st4':'Qiime muuqalka',
    'testimonials.eyebrow':'Ka isticmaalayaashayada','testimonials.title':'Waxay ganacsatada sheegaan Sahel',
    't1q':'"Waxaan la waashay lacag ceeb ah sababtoo ah waxaan isdilay mid bixiyay iyo midna aan bixin saddex meelood. Sahel waxay xallisey. Hadda iib kasta iyo deyn kasta waa la diiwaan geliyaa..."','t2q':'"Waxaan haynaa 350 nooc oo qalab guriga ah. Tirinta bakhaarka warqad ahaanna ayay ku dhacday Sahel..."','t3q':'"Dhar business-ka waxay badaltaa jiilaalka. Hore Sahel, waxaan order gelin jiray rajo. Hadda waxaan order geliyaa sida waxa dhabta ah loo iibiyo..."',
    'faq.eyebrow':'Su\'aalo caadi ah','faq.title':'Jawaabo su\'aalooyin oo nala weydiiyay',
    'fq1':'Sahel ma bilaash bay ahayd?','fa1':'Haa. Diiwaanka iibka, la socodka bakhaarka, iyo liiska deynta macaamiisha waa bilaash.','fq2':'Internet la\'aan ma shaqeyn?','fa2':'Haa. Iib kasta iyo cusboonayn bakhaarka waxay kaydisaa taleefankaaga horta.','fq3':'Shaqaalaydu isticmaali karaa?','fa3':'Haa. Waxaad sameysaa account shaqaale kasta. Waxay diiwaan geli karaan iib.','fq4':'Xogtayda ma ammaan bay ahayd?','fa4':'Xogtaada waa la xifdiyaa si ammaan ah. Aad oo kaliya ayaa arki karta.',
    'cta.eyebrow':'Bilaash inaad bilaabto','cta.title':'Jooji inaad lacag la waasho deyno daalan iyo daaweyn xumaan.','cta.sub':'WhatsApp nala soo xiriir hadda +252 624 407 283.','cta.button':'WhatsApp nala soo xiriir','cta.secondary':'Eeg muuqaalada',
    'footer.desc':'Sahel waxay diiwaan gelisaa iibkaa, maamulaa bakhaarka...','footer.product':'Badeecad','footer.feat':'Muuqaal','footer.how':'Sida ay u shaqeyso','footer.support':'Taageero','footer.help':'Su\'aalo','footer.contact':'WhatsApp Nala Xiriir','footer.tagline':'Laga dhisay ganacsato, oo ganacsato.',
    'days':['Isniin','Talaada','Arbaco','Khamiis','Jimco','Sabti','Axad'],
  },
  ar: {
    'nav.features':'المميزات','nav.how':'كيف يعمل','nav.stories':'قصص','nav.faq':'أسئلة','nav.whatsapp':'واتساب','nav.register':'إنشاء حساب','nav.registerSoon':'تم إنشاء الحساب وحفظ رمز الأمان (JWT).',
    'hero.eyebrow':'تتبع المبيعات والمخزون','hero.headline':'نسجّل مبيعاتك ومخزونك وديون عملائك — من هاتفك.','hero.sub':'ساهل يسجّل كل عملية بيع، ينبهك عندما ينخفض المخزون، ويحتفظ بقائمة بمن لك عنده دين. يعمل بدون إنترنت ويتكلم بلغتك — الصومالية والإنجليزية والعربية.',
    'hero.ctaPrimary':'تواصل معنا عبر واتساب','hero.ctaSecondary':'كيف يعمل','hero.trust':'يستخدمه أكثر من 2,000 صاحب متجر','hero.chartTitle':'مبيعات الأسبوع — اضغط على يوم','hero.topProduct':'المنتج الأكثر مبيعاً','hero.revenue':'إجمالي الأسبوع','hero.growth':'مقارنة بالأسبوع السابق',
    'trust.bar':'يستخدمه هذه المتاجر',
    'features.eyebrow':'ماذا يفعل ساهل','features.title':'ستة أشياء يتعامل معها ساهل','features.sub':'هذه المهام التي تقوم بها حالياً على الورق أو في رأسك. ساهل يقوم بها تلقائياً ويمكنك مراجعتها أي وقت من هاتفك.',
    'f1t':'يسجّل مخزونك','f1b':'ساهل يحسب ما يدخل وما يخرج. عندما ينخفض منتج، يرسل لك تنبيهاً قبل أن تنفذ الكمية.',
    'f2t':'يسجّل كل عملية بيع','f2b':'كلما بعت شيئاً، اضغط عليه في ساهل. يجمع إيراداتك اليومية والأسبوعية والشهرية تلقائياً.',
    'f3t':'يُظهر أكثر المنتجات مبيعاً','f3b':'ساهل يرتب منتجاتك حسب الأكثر مبيعاً.',
    'f4t':'يسجّل مصروفاتك','f4b':'سجّل الإيجار والكهرباء ودفعات الموردين وتكاليف النقل.',
    'f5t':'يتتبع طلبات الموردين','f5b':'عندما تطلب من مورد، سجّله في ساهل.',
    'f6t':'يحافظ على خصوصية بياناتك','f6b':'بيانات مبيعاتك وعملائك تبقى على هاتفك وحسابك الآمن.',
    'how.eyebrow':'ابدأ الآن','how.title':'ثلاث خطوات، خمس دقائق، أنت تعمل','how.sub':'بدون معالج إعداد. بدون فيديوهات تدريب. إذا أرسلت رسالة واتساب من قبل، يمكنك استخدام ساهل الآن.',
    's1t':'أدخل اسمك ورقم هاتفك','s1b':'هذا كل ما يطلبه ساهل. بدون بريد إلكتروني، بدون كلمة مرور.',
    's2t':'اكتب اسم المنتج وسعره','s2b':'أضف منتجاً واحداً وابدأ البيع.',
    's3t':'اضغط لتسجيل عملية بيع','s3b':'عندما يشتري عميل شيئاً، اختر المنتج واضغط بيع.',
    'st1':'متجر يستخدم ساهل','st2':'إيرادات متتبعة شهرياً','st3':'وقت التشغيل','st4':'تقييم المستخدمين',
    'testimonials.eyebrow':'من مستخدمينا','testimonials.title':'ماذا يقول أصحاب المتاجر عن ساهل',
    't1q':'"كنا نخسر المال لأننا كنا ننسى من دفع ومن لم يدفع عبر ثلاثة فروع. ساهل حلّ هذه المشكلة..."','t2q':'"لدينا 350 موديل جهاز منزلي. عد المخزون على الورق كان مستحيلاً..."','t3q':'"مخزون الأزياء يتغير كل موسم. قبل ساهل، كنت أطلب بناءً على الحدس..."',
    'faq.eyebrow':'أسئلة شائعة','faq.title':'إجابات على الأسئلة التي يطرحها الناس علينا',
    'fq1':'هل ساهل مجاني؟','fa1':'نعم. تسجيل المبيعات وتتبع المخزون وإعداد قائمة ديون العملاء مجاني وسيبقى مجانياً.',
    'fq2':'هل يعمل بدون إنترنت؟','fa2':'نعم. كل عملية بيع وتحديث المخزون يتم حفظه على هاتفك أولاً.',
    'fq3':'هل يمكن لموظفي استخدامها؟','fa3':'نعم. تقوم بإنشاء حسابات لموظفيك.',
    'fq4':'هل بياناتي آمنة؟','fa4':'بياناتك مشفرة ومخزنة بشكل آمن.',
    'cta.eyebrow':'مجاني للبدء','cta.title':'توقف عن خسارة المال بسبب الديون المنسية والسجلات الفوضوية.','cta.sub':'تواصل معنا عبر واتساب الآن على +252 624 407 283.','cta.button':'تواصل معنا عبر واتساب الآن','cta.secondary':'شاهد المميزات',
    'footer.desc':'ساهل يسجّل مبيعاتك، يدير مخزونك، ويتتبع من لك عنده دين.','footer.product':'المنتج','footer.feat':'المميزات','footer.how':'كيف يعمل','footer.support':'الدعم','footer.help':'الأسئلة الشائعة','footer.contact':'تواصل معنا عبر واتساب','footer.tagline':'صُنع لأصحاب المتاجر، من قبل أصحاب المتاجر.',
    'days':['الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت','الأحد'],
  }
};

// --- APP COMPONENT ---
export default function SahelApp() {
  const [lang, setLang] = useState('en');
  const [selectedDay, setSelectedDay] = useState(6); // Default Sunday
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '' });
  const [showAuth, setShowAuth] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('sahel_jwt'));

  const t = (key) => (T[lang] && T[lang][key]) || T.en[key] || key;

  // JWT Registration Logic
  const handleRegister = (e) => {
    e.preventDefault();
    const payload = { user: e.target.phone.value, iat: Date.now() };
    const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(payload))}.SFLK789_MOCK_SIG`;
    localStorage.setItem('sahel_jwt', mockJwt);
    setToken(mockJwt);
    setShowAuth(false);
    showToast(t('nav.registerSoon'));
  };

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 4000);
  };

  // Animation Trigger
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => e.isIntersecting && e.target.classList.add('visible'));
    }, { threshold: 0.1 });
    document.querySelectorAll('.anim-up, .anim-scale, .stat-bar').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [lang]);

  return (
    <div className={`bg-cream text-ink font-sans antialiased overflow-x-hidden ${lang === 'ar' ? 'lang-ar' : ''}`}>
      
      {/* Scroll Progress & Toast */}
      <div id="scroll-progress" className="fixed top-0 left-0 h-1 bg-gold z-[9999]" style={{ width: '0%' }}></div>
      <div className={`toast ${toast.show ? 'show' : ''} z-[10000]`}>
        <Info className="w-4 h-4 text-gold" /> <span>{toast.msg}</span>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ink rounded-xl flex items-center justify-center text-gold font-serif font-bold text-xl">S</div>
            <span className="font-serif text-2xl font-bold text-ink">Sahel</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex bg-cream-dark p-1 rounded-full border border-border-dark">
              {['en', 'so', 'ar'].map(l => (
                <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === l ? 'bg-ink text-cream shadow-md' : 'text-slate-faint'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <a href="#features" className="text-sm font-medium text-slate hover:text-ink">{t('nav.features')}</a>
            <button onClick={() => setShowAuth(true)} className="bg-ink text-cream px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-ink-light transition-all">
              {token ? 'Dashboard' : t('nav.register')}
            </button>
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden"><Menu/></button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 grid-bg glow-gold curve-connector">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="anim-up">
            <div className="inline-flex items-center gap-2 bg-gold-glow border border-gold/20 px-4 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 bg-gold rounded-full animate-pulse"></span>
              <span className="text-[10px] font-extrabold tracking-widest text-gold-dim uppercase">{t('hero.eyebrow')}</span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold leading-tight text-ink mb-6">{t('hero.headline')}</h1>
            <p className="text-lg text-slate leading-relaxed mb-10 max-w-xl">{t('hero.sub')}</p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-wa text-white px-8 py-4 rounded-2xl font-bold hover:-translate-y-1 transition-all shadow-xl shadow-wa/20">{t('hero.ctaPrimary')}</button>
              <button className="border-2 border-border-dark px-8 py-4 rounded-2xl font-bold text-ink hover:bg-white">{t('hero.ctaSecondary')}</button>
            </div>
          </div>

          {/* Interactive Chart Card */}
          <div className="anim-scale relative bg-white p-8 rounded-[32px] border border-border shadow-2xl">
            <h3 className="font-bold text-ink mb-6">{t('hero.chartTitle')}</h3>
            <div className="h-56 flex items-end gap-3 pb-4 border-b border-border relative">
               {CHART_DATA.map((d, i) => (
                 <div key={i} onClick={() => setSelectedDay(i)} className={`chart-bar-wrap ${selectedDay === i ? 'selected' : ''}`}>
                    <div className="bar-tip">${d.sales}</div>
                    <div className="chart-bar-inner bg-gradient-to-t from-ink to-ink-light" style={{ height: `${(d.sales/2100)*100}%` }}></div>
                    <span className="chart-day">{t('days')[i].substring(0,3)}</span>
                 </div>
               ))}
            </div>
            <div className={`chart-detail-panel open mt-6`}>
              <div className="flex justify-between items-center bg-cream p-4 rounded-2xl border border-border">
                <div>
                  <p className="text-[10px] font-bold text-slate-faint uppercase">{t('days')[selectedDay]}</p>
                  <p className="font-bold text-ink">{CHART_DATA[selectedDay].product}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-faint uppercase">Sales</p>
                  <p className="text-xl font-bold text-gold-dim">${CHART_DATA[selectedDay].sales}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="font-serif text-4xl font-bold text-ink mb-4">{t('features.title')}</h2>
          <p className="text-slate max-w-2xl mx-auto">{t('features.sub')}</p>
        </div>
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="anim-up bg-white p-8 rounded-3xl border border-border hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gold-glow rounded-xl flex items-center justify-center mb-6 text-gold-dim">
                {i===1 && <Package/>} {i===2 && <BarChart3/>} {i===3 && <TrendingUp/>} {i===4 && <Wallet/>} {i===5 && <ShoppingCart/>} {i===6 && <ShieldCheck/>}
              </div>
              <h3 className="font-bold text-ink mb-2">{t(`f${i}t`)}</h3>
              <p className="text-sm text-slate leading-relaxed">{t(`f${i}b`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* JWT Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-ink/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[32px] p-10 shadow-2xl relative anim-scale visible">
            <button onClick={() => setShowAuth(false)} className="absolute top-6 right-6 p-2 hover:bg-cream rounded-full"><X/></button>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gold-glow rounded-2xl flex items-center justify-center mx-auto mb-4 text-gold-dim"><Smartphone className="w-8 h-8"/></div>
              <h2 className="font-serif text-2xl font-bold text-ink">{t('nav.register')}</h2>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              <input type="text" placeholder="Shop Name" required className="w-full p-4 rounded-2xl bg-cream border border-border focus:ring-2 focus:ring-gold outline-none"/>
              <input name="phone" type="tel" placeholder="Phone Number" required className="w-full p-4 rounded-2xl bg-cream border border-border focus:ring-2 focus:ring-gold outline-none"/>
              <button type="submit" className="w-full bg-ink text-cream font-bold py-4 rounded-2xl hover:bg-ink-light transition-all flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-gold"/> {t('nav.register')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#0D1529] pt-20 pb-10 text-cream/50">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 border-b border-white/5 pb-12 mb-8">
           <div className="col-span-2">
             <div className="flex items-center gap-3 text-cream mb-6">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center font-bold text-gold">S</div>
                <span className="font-serif text-xl font-bold">Sahel</span>
             </div>
             <p className="max-w-xs text-sm leading-relaxed">{t('footer.desc')}</p>
           </div>
           <div>
             <h4 className="text-white font-bold mb-4">{t('footer.product')}</h4>
             <ul className="space-y-2 text-sm">
               <li><a href="#features" className="hover:text-gold">{t('nav.features')}</a></li>
               <li><a href="#how" className="hover:text-gold">{t('nav.how')}</a></li>
             </ul>
           </div>
           <div>
             <h4 className="text-white font-bold mb-4">{t('footer.support')}</h4>
             <ul className="space-y-2 text-sm">
               <li><a href="#faq" className="hover:text-gold">{t('nav.faq')}</a></li>
               <li className="flex items-center gap-2"><div className="w-2 h-2 bg-wa rounded-full"></div> +252 624 407 283</li>
             </ul>
           </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between text-[10px] uppercase tracking-widest font-bold">
           <p>© 2025 Sahel Tech. All rights reserved.</p>
           <p>{t('footer.tagline')}</p>
        </div>
      </footer>

      {/* WhatsApp Float */}
      <a href="https://wa.me/252624407283" target="_blank" className="fixed bottom-8 left-8 w-16 h-16 bg-wa rounded-full flex items-center justify-center shadow-2xl text-white hover:scale-110 transition-transform z-40 animate-bounce">
        <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
    </div>
  );
}
