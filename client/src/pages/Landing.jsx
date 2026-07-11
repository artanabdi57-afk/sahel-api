import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  BarChart3,
  ShoppingCart,
  Wallet,
  ShieldCheck,
  TrendingUp,
  Star,
  ArrowDown,
  Menu,
  Info,
  ChevronDown,
  Instagram,
  Twitter,
  Smartphone,
  Rocket,
  Zap,
} from "lucide-react";

const CHART_DATA = [
  { day: "Mon", full: "Monday", sales: 400, tx: 5, product: "Rice (25kg)" },
  { day: "Tue", full: "Tuesday", sales: 800, tx: 8, product: "Sugar (50kg)" },
  { day: "Wed", full: "Wednesday", sales: 600, tx: 6, product: "Cooking Oil" },
  { day: "Thu", full: "Thursday", sales: 1300, tx: 11, product: "Sugar (50kg)" },
  { day: "Fri", full: "Friday", sales: 1100, tx: 9, product: "Flour (25kg)" },
  { day: "Sat", full: "Saturday", sales: 1700, tx: 13, product: "Sugar (50kg)" },
  { day: "Sun", full: "Sunday", sales: 2100, tx: 14, product: "Sugar (50kg)" },
];

const FEATS = [
  { icon: Package, k: ["f1t", "f1b"] },
  { icon: BarChart3, k: ["f2t", "f2b"] },
  { icon: TrendingUp, k: ["f3t", "f3b"] },
  { icon: Wallet, k: ["f4t", "f4b"] },
  { icon: ShoppingCart, k: ["f5t", "f5b"] },
  { icon: ShieldCheck, k: ["f6t", "f6b"] },
];

const STEPS = [
  { icon: Smartphone, n: 1, k: ["s1t", "s1b"] },
  { icon: Package, n: 2, k: ["s2t", "s2b"] },
  { icon: Rocket, n: 3, k: ["s3t", "s3b"] },
];

const STATS = [
  { v: 2400, s: "+", k: "st1", g: false },
  { v: 1.2, s: "M", p: "$", k: "st2", g: true },
  { v: 98, s: "%", k: "st3", g: false },
  { v: 4.9, s: "★", k: "st4", g: true },
];

const TESTS = [
  { img: "taran1", name: "Taran Ventures", loc: "Electronics, Mogadishu", k: "t1q" },
  { img: "muhin2", name: "Muhin Appliances", loc: "Home Appliances, Hargeisa", k: "t2q" },
  { img: "wardo3", name: "Wardo Fashion", loc: "Clothing, Kismayo", k: "t3q" },
];

const FAQS = [
  { qk: "fq1", ak: "fa1" },
  { qk: "fq2", ak: "fa2" },
  { qk: "fq3", ak: "fa3" },
  { qk: "fq4", ak: "fa4" },
];

const TRUST_NAMES = ["Taran Ventures", "Muhin Appliances", "Wardo Fashion", "Xamar Wholesale", "Geela Shop"];

const T = {
  en: {
    "nav.features": "Features", "nav.how": "How it works", "nav.stories": "Stories",
    "nav.faq": "FAQ", "nav.whatsapp": "WhatsApp", "nav.login": "Login",
    "nav.register": "Register", "nav.registerSoon": "Registration coming soon!",
    "hero.eyebrow": "Sales & Inventory Tracker",
    // SEO FIX: Added exact keyword "shop management software somalia" to H1 headline
    "hero.headline": "The Best Shop Management Software Somalia: Track Sales & Stock from your Phone",
    "hero.sub": "Sahel records every sale, alerts you when stock is low, and keeps a list of who owes you money. It works offline and speaks your language — Somali, English, and Arabic.",
    "hero.ctaPrimary": "WhatsApp us to start", "hero.ctaSecondary": "How it works",
    "hero.trust": "Used by 2,000+ shop owners", "hero.chartTitle": "Weekly sales — tap a day",
    "hero.topProduct": "TOP PRODUCT", "hero.revenue": "WEEK TOTAL", "hero.growth": "VS LAST WEEK",
    "trust.bar": "Used by these businesses",
    "why.eyebrow": "Built for Somalia", 
    // SEO FIX: Keywords in H2
    "why.title": "Why Choose Sahel Shop Management Software Somalia?",
    "why.body": "Sahel is a professional shop management software Somalia solution designed specifically for local retailers. Whether you are in Mogadishu, Hargeisa, or Kismayo, our shop management software Somalia platform allows you to track inventory, record sales, and manage customer credit without needing a steady internet connection. Unlike generic accounting apps, Sahel speaks Somali and understands how local businesses operate. If you need reliable shop management software Somalia, Sahel is built exactly for you.",
    "features.eyebrow": "What Sahel does", "features.title": "Six tasks our shop management software handles",
    "features.sub": "Sahel is the leading shop management software Somalia retailers use to automate their daily operations from their phones.",
    "f1t": "Records your stock", "f1b": "Sahel counts what comes in and what goes out. When an item is running low, it sends you an alert before you sell out.",
    "f2t": "Records every sale", "f2b": "Each time you sell something, tap it in Sahel. It adds up your daily, weekly, and monthly revenue automatically.",
    "f3t": "Shows your best sellers", "f3b": "Sahel ranks your products by what sells most. You see which items make money and which ones don't move.",
    "f4t": "Records your expenses", "f4b": "Log your rent, electricity, supplier payments, and transport costs. Sahel subtracts them from your revenue so you see real profit.",
    "f5t": "Tracks supplier orders", "f5b": "When you order from a supplier, record it in Sahel. It tracks what you ordered, when it's due, and whether it arrived.",
    "f6t": "Keeps your data private", "f6b": "Your sales and customer data stay on your phone and your secure account. Nobody else can see it.",
    "how.eyebrow": "Get started", "how.title": "Setup your shop management software in 5 minutes",
    "how.sub": "No setup wizard. No training videos. If you've ever sent a WhatsApp message, you can use Sahel right now.",
    "s1t": "Enter your name and phone number", "s1b": "That's all Sahel asks for. No email, no password to remember.",
    "s2t": "Type a product name and its price", "s2b": "Add one product, sell it. Add another one later. You don't need to set up everything at once.",
    "s3t": "Tap to record a sale", "s3b": "When a customer buys something, select the product and tap sell. Sahel updates your stock and revenue automatically.",
    "st1": "Shops using Sahel", "st2": "Revenue tracked per month", "st3": "Uptime", "st4": "User rating",
    "testimonials.eyebrow": "From our users", "testimonials.title": "Trusted by Somalia's biggest shops",
    "t1q": '"We were losing money because we forgot who paid and who didn\'t across three locations. Sahel fixed that. Now every sale and every debt is recorded. We recovered $1,800 in the first month."',
    "t2q": '"We have 350 appliance models. Counting stock on paper was impossible. Sahel tracks it all. Our stock accuracy went from guessing to near-perfect, and we reduced overstock by 30%."',
    "t3q": '"Fashion inventory changes every season. Before Sahel, I ordered based on gut feeling. Now I order based on what actually sells. My profit margin improved because I stopped buying things that don\'t move."',
    "faq.eyebrow": "Common questions", "faq.title": "Answers to questions people ask us",
    "fq1": "Is Sahel free?", "fa1": "Yes. Recording sales, tracking stock, and listing customer debts is free and will stay free.",
    "fq2": "Does it work without internet?", "fa2": "Yes. Every sale and stock update is saved on your phone first. When your phone connects to the internet again, it syncs automatically.",
    "fq3": "Can my employees use it?", "fa3": "Yes. You create accounts for your staff. They can record sales, but only you see the full financial picture.",
    "fq4": "Is my data safe?", "fa4": "Your data is encrypted and stored securely. Only you can access your business records.",
    "cta.eyebrow": "Free to start",
    "cta.title": "Get the best shop management software Somalia has to offer.",
    "cta.sub": "WhatsApp us now on +252 624 407 283 and we'll set you up in minutes.",
    "cta.button": "WhatsApp us now", "cta.secondary": "See features",
    // SEO FIX: Added keyword to footer
    "footer.desc": "Sahel is the #1 shop management software Somalia retailers use to record sales, manage stock, and track debts in Somali, English, and Arabic.",
    "footer.product": "Product", "footer.feat": "Features", "footer.how": "How it works",
    "footer.support": "Support", "footer.help": "FAQ", "footer.contact": "WhatsApp Us",
    "footer.tagline": "Built for shop owners, by shop owners.",
    "chart.sales": "SALES", "chart.transactions": "TRANSACTIONS",
    "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  },
  so: {
    // Somali translations kept but optimized for internal hierarchy
    "nav.features": "Muuqaal", "nav.how": "Sida ay u shaqeyso", "nav.stories": "Sheekooyin",
    "nav.faq": "Su'aalo", "nav.whatsapp": "WhatsApp", "nav.login": "Gal",
    "nav.register": "Diiwaan geli", "nav.registerSoon": "Diiwaan gelinta soon!",
    "hero.eyebrow": "La soco iibka iyo bakhaarka",
    "hero.headline": "Sahel — Software-ka Maamulka Dukaanka ee Soomaaliya.",
    "hero.sub": "Sahel waxay diiwaan gelisaa iib kasta, waxay ku dhawaaqdaa marka alaabtu yartahay, waxayna kaydisaa liiska kuwa lacag kuu leh. Waxay shaqeynaysaa internet la'aan oo afkaaga waa Soomaali, Ingiriisi iyo Carabi.",
    "hero.ctaPrimary": "WhatsApp nala soo xiriir", "hero.ctaSecondary": "Sida ay u shaqeyso",
    "hero.trust": "2,000+ oo dukaan oo isticmaala Sahel", "hero.chartTitle": "Iibka toddobaadkan — taabo maalinta",
    "hero.topProduct": "ALAABTA UGU IIBKA BADAN", "hero.revenue": "WADARTA TODDOBAADKA", "hero.growth": "TODDOBAADKA HORE",
    "trust.bar": "Dukaanoyin kuwaan isticmaala",
    "why.eyebrow": "Loo dhisay Soomaaliya", "why.title": "Software-ka Maamulka Dukaanka ee Loo Dhisay Soomaaliya",
    "why.body": "Sahel waa software maamul dukaan oo si gaar ah loogu dhisay Soomaaliya. Maalin kasta, milkiilayaal dukaan ah oo ku nool Muqdisho, Hargeysa, iyo Kismaayo ayaa isticmaala Sahel si ay ula socdaan bakhaarkooda, u diiwaan geliyaan iibkooda, oo ay u maamulaan deynta macaamiisha — iyada oo aan loo baahnayn internet joogto ah. Sahel wuxuu ku hadlaa Soomaali, wuxuuna la shaqeeyaa internet aan joogto ahayn.",
    "features.eyebrow": "Waxaa Sahel sameeyaa", "features.title": "Lixdar oo Sahel kuu qabtaa",
    "features.sub": "Sahel waa software maamul dukaan oo loogu dhisay Soomaaliya.",
    "f1t": "Waxay kaydisaa bakhaarka", "f1b": "Sahel waxay tirinaysaa waxa soo gelayaa iyo waxa baxaysaa. Marka alaabtu yartahay, waxay ku dhawaaqdaa inta aysan dhammaan.",
    "f2t": "Waxay diiwaan gelisaa iib kasta", "f2b": "Marka iibto dhacdo, taabo Sahel. Waxay isku daraysaa dakhligaaga maalinlaha, toddobaadlaha, iyo bisha si otomaatig ah.",
    "f3t": "Waxay muuqataa alaabta ugu iibsata", "f3b": "Sahel waxay isla soo qortaa alaabta sida iibka ugu badan. Waxaad arki doontaa waxa lacag geysata iyo waxa aan la iibin.",
    "f4t": "Waxay kaydisaa kharashka", "f4b": "Diiwaan geli kirada, korontada, lacag bixinta supplier-ka, iyo kharashga gaadinka. Sahel waxay ka saartaa dakhligaaga si aad u aragto faa'idada dhabta ah.",
    "f5t": "Waxay la socotaa dalabka supplier-ka", "f5b": "Marka aad supplier-ka ka dalbayso, diiwaan geli Sahel. Waxay la socotaa waxa dalbayso, waqtiga, iyo inay yimaaddo.",
    "f6t": "Waxay xifdisaa xogtaada", "f6b": "Xogta iibkaaga iyo macaamiishaaga waxay ku sugan tahay taleefankaaga iyo account-kaaga ammaan ka ah. Qofna ma arki karo.",
    "how.eyebrow": "Bilaow", "how.title": "Sadar saddex ah, daqiiqo shan, waad shaqeynaysaa",
    "how.sub": "Hadii aad weli WhatsApp diri karto, Sahel waad isticmaali kartaa hadda.",
    "s1t": "Geli magacaaga iyo lambaraga taleefanka", "s1b": "Sahel waxay weyddiisaa oo keliya. Iimayl, furasho, tixraac xumaan maaha.",
    "s2t": "Qor magaca alaabta iyo qiimaha", "s2b": "Kudar alaab halmar, iibi. Kadib kudar mid kale. Wax kasta waa inaad iskugu darin waqtigaas.",
    "s3t": "Taabo si aad u diiwaan geliso iibka", "s3b": "Marka macmiil iibo, dooro alaabta oo taabo iibi. Sahel waxay cusbooneysiiyaa bakhaarka iyo dakhliga si otomaatig ah.",
    "st1": "Dukaan isticmaala Sahel", "st2": "Dakhli la soco bishan", "st3": "Waqtiga shaqeyn", "st4": "Qiime muuqalka",
    "testimonials.eyebrow": "Ka isticmaalayaashayada", "testimonials.title": "Waxay ganacsatada sheegaan Sahel",
    "t1q": '"Waxaan la waashay lacag ceeb ah sababtoo ah waxaan isdilay mid bixiyay iyo midna aan bixin saddex meelood. Sahel waxay xallisey. Bishii ugu horeysay waxaan ka soo celiyay $1,800."',
    "t2q": '"Waxaan haynaa 350 nooc oo qalab guriga ah. Tirinta bakhaarka warqad ahaanna ayay ku dhacday Sahel. Saxda bakhaarka waxay ka baxday dhamaan oo waa yaraaday 30% kharashda ku waynaatay."',
    "t3q": '"Dhar business-ka waxay badaltaa jiilaalka. Hore Sahel, waxaan order gelin jiray rajo. Hadda waxaan order geliyaa sida waxa dhabta ah loo iibiyo. Faaiidadaaday waaa korodhay."',
    "faq.eyebrow": "Su'aalo caadi ah", "faq.title": "Jawaabo su'aalooyin oo nala weydiiyay",
    "fq1": "Sahel ma bilaash bay ahayd?", "fa1": "Haa. Diiwaanka iibka, la socodka bakhaarka, iyo liiska deynta macaamiisha waa bilaash.",
    "fq2": "Internet la'aan ma shaqeyn?", "fa2": "Haa. Iib kasta iyo cusboonayn bakhaarka waxay kaydisaa taleefankaaga horta. Marka internet ku soo baxdo, waxay si otomaatig ah u midowdaa.",
    "fq3": "Shaqaalaydu isticmaali karaa?", "fa3": "Haa. Waxaad sameysaa account shaqaale kasta. Waxay diiwaan geli karaan iib, oo kaliya aad oo ahaan muhiimka ah ayaad arki doontaa.",
    "fq4": "Xogtayda ma ammaan bay ahayd?", "fa4": "Xogtaada waa la xifdiyaa si ammaan ah. Aad oo kaliya ayaa arki karta xogtaaga ganacsiga.",
    "cta.eyebrow": "Bilaash inaad bilaabto",
    "cta.title": "Jooji inaad lacag la waasho deyno daalan iyo daaweyn xumaan.",
    "cta.sub": "WhatsApp nala soo xiriir hadda +252 624 407 283 oo waan ku diyaarinnaa daqiiqado.",
    "cta.button": "WhatsApp nala soo xiriir", "cta.secondary": "Eeg muuqaalada",
    "footer.desc": "Sahel waa software maamul dukaan oo loogu dhisay Soomaaliya.",
    "footer.product": "Badeecad", "footer.feat": "Muuqaal", "footer.how": "Sida ay u shaqeyso",
    "footer.support": "Taageero", "footer.help": "Su'aalo", "footer.contact": "WhatsApp Nala Xiriir",
    "footer.tagline": "Laga dhisay ganacsato, oo ganacsato.",
    "chart.sales": "IIBKA", "chart.transactions": "DHAQDHAQAAQ",
    "days": ["Isniin", "Talaada", "Arbaco", "Khamiis", "Jimco", "Sabti", "Axad"],
  },
  ar: {
    // Arabic translations
    "nav.features": "المميزات", "nav.how": "كيف يعمل", "nav.stories": "قصص",
    "nav.faq": "أسئلة", "nav.whatsapp": "واتساب", "nav.login": "تسجيل الدخول",
    "nav.register": "إنشاء حساب", "nav.registerSoon": "التسجيل قريباً!",
    "hero.eyebrow": "تتبع المبيعات والمخزون",
    "hero.headline": "ساهل — برنامج إدارة المتاجر في الصومال.",
    "hero.sub": "ساهل يسجّل كل عملية بيع، ينبهك عندما ينخفض المخزون، ويحتفظ بقائمة بمن لك عنده دين. يعمل بدون إنترنت ويتكلم بلغتك — الصومالية والإنجليزية والعربية.",
    "hero.ctaPrimary": "تواصل معنا عبر واتساب", "hero.ctaSecondary": "كيف يعمل",
    "hero.trust": "يستخدمه أكثر من 2,000 صاحب متجر", "hero.chartTitle": "مبيعات الأسبوع — اضغط على يوم",
    "hero.topProduct": "المنتج الأكثر مبيعاً", "hero.revenue": "إجمالي الأسبوع", "hero.growth": "مقارنة بالأسبوع السابق",
    "trust.bar": "يستخدمه هذه المتاجر",
    "why.eyebrow": "مصمم من أجل الصومال", "why.title": "برنامج إدارة المتاجر المصمم للصومال",
    "why.body": "ساهل هو برنامج إدارة متاجر مصمم خصيصاً للصومال. يومياً، يستخدم أصحاب المتاجر في مقديشو وهرجيسا وكيسمايو تطبيق ساهل لتتبع المخزون وتسجيل المبيعات وإدارة ديون العملاء.",
    "features.eyebrow": "ماذا يفعل ساهل", "features.title": "ستة أشياء يتعامل معها ساهل",
    "features.sub": "ساهل هو برنامج إدارة متاجر مصمم للصومال.",
    "f1t": "يسجّل مخزونك", "f1b": "ساهل يحسب ما يدخل وما يخرج. عندما ينخفض منتج، يرسل لك تنبيهاً قبل أن تنفذ الكمية.",
    "f2t": "يسجّل كل عملية بيع", "f2b": "كلما بعت شيئاً، اضغط عليه في ساهل. يجمع إيراداتك اليومية والأسبوعية والشهرية تلقائياً.",
    "f3t": "يُظهر أكثر المنتجات مبيعاً", "f3b": "ساهل يرتب منتجاتك حسب الأكثر مبيعاً. ترى أي المنتجات تجلب المال وأيها لا تتحرك.",
    "f4t": "يسجّل مصروفاتك", "f4b": "سجّل الإيجار والكهرباء ودفعات الموردين وتكاليف النقل. ساهل يطرحها من إيراداتك فترى الربح الحقيقي.",
    "f5t": "يتتبع طلبات الموردين", "f5b": "عندما تطلب من مورد، سجّله في ساهل. يتتبع ما طلبته وموعد الاستلام وهل وصل.",
    "f6t": "يحافظ على خصوصية بياناتك", "f6b": "بيانات مبيعاتك وعملائك تبقى على هاتفك وحسابك الآمن. لا أحد غيرك يمكنه رؤيتها.",
    "how.eyebrow": "ابدأ الآن", "how.title": "ثلاث خطوات، خمس دقائق، أنت تعمل",
    "how.sub": "إذا أرسلت رسالة واتساب من قبل، يمكنك استخدام ساهل الآن.",
    "s1t": "أدخل اسمك ورقم هاتفك", "s1b": "هذا كل ما يطلبه ساهل. بدون بريد إلكتروني، بدون كلمة مرور.",
    "s2t": "اكتب اسم المنتج وسعره", "s2b": "أضف منتجاً واحداً وابدأ البيع. لا تحتاج لإعداد كل شيء مرة واحدة.",
    "s3t": "اضغط لتسجيل عملية بيع", "s3b": "عندما يشتري عميل شيئاً، اختر المنتج واضغط بيع. ساهل يحدّث مخزونك وإيراداتك تلقائياً.",
    "st1": "متجر يستخدم ساهل", "st2": "إيرادات متتبعة شهرياً", "st3": "وقت التشغيل", "st4": "تقييم المستخدمين",
    "testimonials.eyebrow": "من مستخدمينا", "testimonials.title": "ماذا يقول أصحاب المتاجر عن ساهل",
    "t1q": '"كنا نخسر المال لأننا كنا ننسى من دفع ومن لم يدفع عبر ثلاثة فروع. ساهل حلّ هذه المشكلة. استرددنا 1,800 دولار في الشهر الأول."',
    "t2q": '"لدينا 350 موديل جهاز منزلي. عد المخزون على الورق كان مستحيلاً. ساهل يتتبع كل شيء. دقة المخزون انتقلت من التخمين إلى شبه الكمال."',
    "t3q": '"مخزون الأزياء يتغير كل موسم. قبل ساهل، كنت أطلب بناءً على الحدس. الآن أطلب بناءً على ما يباع فعلاً."',
    "faq.eyebrow": "أسئلة شائعة", "faq.title": "إجابات على الأسئلة التي يطرحها الناس علينا",
    "fq1": "هل ساهل مجاني؟", "fa1": "نعم. تسجيل المبيعات وتتبع المخزون وإعداد قائمة ديون العملاء مجاني وسيبقى مجانياً.",
    "fq2": "هل يعمل بدون إنترنت؟", "fa2": "نعم. كل عملية بيع وتحديث المخزون يتم حفظه على هاتفك أولاً. عندما يتصل هاتفك بالإنترنت مرة أخرى، يتم المزامنة تلقائياً.",
    "fq3": "هل يمكن لموظفي استخدامها؟", "fa3": "نعم. تقوم بإنشاء حسابات لموظفيك. يمكنهم تسجيل المبيعات، ولكن أنت فقط ترى الصورة المالية الكاملة.",
    "fq4": "هل بياناتي آمنة؟", "fa4": "بياناتك مشفرة ومخزنة بشكل آمن. أنت فقط يمكنك الوصول إلى سجلات عملك.",
    "cta.eyebrow": "مجاني للبدء",
    "cta.title": "توقف عن خسارة المال بسبب الديون المنسية والسجلات الفوضوية.",
    "cta.sub": "تواصل معنا عبر واتساب الآن على +252 624 407 283 وسنقوم بإعدادك في دقائق.",
    "cta.button": "تواصل معنا عبر واتساب الآن", "cta.secondary": "شاهد المميزات",
    "footer.desc": "ساهل هو برنامج إدارة متاجر مصمم للصومال.",
    "footer.product": "المنتج", "footer.feat": "المميزات", "footer.how": "كيف يعمل",
    "footer.support": "الدعم", "footer.help": "الأسئلة الشائعة", "footer.contact": "تواصل معنا عبر واتساب",
    "footer.tagline": "صُنع لأصحاب المتاجر، من قبل أصحاب المتاجر.",
    "chart.sales": "المبيعات", "chart.transactions": "المعاملات",
    "days": ["الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"],
  },
};

const LOGO_SRC =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="13" fill="#15203B"/><circle cx="35" cy="13" r="4" fill="#F2C14E"/><rect x="10" y="28" width="6" height="11" rx="2" fill="#7E88B0"/><rect x="21" y="20" width="6" height="19" rx="2" fill="#A9B1CE"/><rect x="32" y="14" width="6" height="25" rx="2" fill="#FBF8F2"/></svg>'
  );

const WA_PATH = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

function WAIcon({ size = 16, fill = "currentColor", className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} className={className}>
      <path d={WA_PATH} />
    </svg>
  );
}

const ANIM_CSS = `
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
@keyframes float-d{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes pulse-ring{0%{transform:scale(1);opacity:.5}100%{transform:scale(2);opacity:0}}
@keyframes wa-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.anim-up{opacity:0;transform:translateY(28px);transition:all .7s cubic-bezier(.22,1,.36,1)}
.anim-up.visible{opacity:1;transform:translateY(0)}
.anim-up-d1{transition-delay:.08s}.anim-up-d2{transition-delay:.16s}
.anim-up-d3{transition-delay:.24s}.anim-up-d4{transition-delay:.32s}.anim-up-d5{transition-delay:.4s}
.anim-scale{opacity:0;transform:scale(.95);transition:all .7s cubic-bezier(.22,1,.36,1)}
.anim-scale.visible{opacity:1;transform:scale(1)}
.float{animation:float 6s ease-in-out infinite}
.float-d{animation:float-d 6s ease-in-out 2s infinite}
.stat-bar{position:relative}
.stat-bar::after{content:'';position:absolute;bottom:0;left:0;height:3px;width:0;background:linear-gradient(90deg,#F2C14E,#D4A83A);border-radius:0 0 12px 12px;transition:width 1.4s cubic-bezier(.22,1,.36,1)}
.stat-bar.visible::after{width:100%}
.card-shine{position:relative;overflow:hidden}
.card-shine::before{content:'';position:absolute;top:0;left:-75%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);transform:skewX(-15deg);transition:left .6s ease}
.card-shine:hover::before{left:125%}
.feat-icon{transition:all .4s cubic-bezier(.22,1,.36,1)}
.tool-card:hover .feat-icon{transform:scale(1.12) rotate(-4deg)}
.grid-bg{background-image:linear-gradient(to right,rgba(21,32,59,.03)1px,transparent 1px),linear-gradient(to bottom,rgba(21,32,59,.03)1px,transparent 1px);background-size:48px 48px}
.glow-gold{background:radial-gradient(ellipse 500px 350px at 70% 30%,rgba(242,193,78,.08),transparent 70%)}
.glow-ink{background:radial-gradient(ellipse 400px 400px at 30% 60%,rgba(21,32,59,.04),transparent 70%)}
.curve-connector{position:relative}
.curve-connector::after{content:'';position:absolute;bottom:-1px;left:0;right:0;height:32px;background:#FBF8F2;clip-path:ellipse(55% 100% at 50% 100%)}
.line-tip{position:absolute;background:#15203B;color:#FBF8F2;font-size:11px;font-weight:700;padding:5px 12px;border-radius:8px;white-space:nowrap;pointer-events:none;z-index:20;opacity:0;transition:opacity .2s ease,transform .2s ease;transform:translateX(-50%) translateY(-6px)}
.line-tip.show{opacity:1;transform:translateX(-50%) translateY(0)}
.line-tip::after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid #15203B}
@media(max-width:768px){.cursor-glow{display:none!important}}
.hero-highlight{position:relative;display:inline}
.hero-highlight::after{content:'';position:absolute;bottom:2px;left:0;right:0;height:8px;background:linear-gradient(90deg,transparent,rgba(242,193,78,.35),transparent);border-radius:4px;opacity:0;animation:shimmer 3s ease-in-out infinite}
@keyframes shimmer{0%{opacity:0}50%{opacity:1}100%{opacity:0}}
.chart-glow{position:absolute;inset:-1px;border-radius:inherit;background:linear-gradient(135deg,rgba(242,193,78,.15),transparent 40%,transparent 60%,rgba(21,32,59,.08));pointer-events:none;z-index:1}
`;

function catmullRom(pts, tension) {
  if (!pts || pts.length === 0) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, pts.length - 1)];
    const t6 = 6 * tension;
    d += ` C ${p1.x + (p2.x - p0.x) / t6} ${p1.y + (p2.y - p0.y) / t6}, ${p2.x - (p3.x - p1.x) / t6} ${p2.y - (p3.y - p1.y) / t6}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function approxLen(pts) {
  let l = 0;
  for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return l * 1.25;
}

export default function SahelLanding() {
  const [lang, setLang] = useState("en");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(-1);
  const [toastMsg, setToastMsg] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [cursor, setCursor] = useState({ x: -300, y: -300 });
  const [openFaq, setOpenFaq] = useState(-1);

  const svgRef = useRef(null);
  const tipRef = useRef(null);
  const ptsRef = useRef([]);

  const tr = useCallback((k) => T[lang]?.[k] || T.en[k] || k, [lang]);
  const days = tr("days");
  const weekTotal = CHART_DATA.reduce((s, d) => s + d.sales, 0);

  const showToast = (msg) => { setToastMsg(msg); setToastShow(true); setTimeout(() => setToastShow(false), 3000); };

  useEffect(() => {
    const onScroll = () => { const s = document.documentElement.scrollTop, h = document.documentElement.scrollHeight - document.documentElement.clientHeight; setScrollPct(h > 0 ? (s / h) * 100 : 0); };
    const onMouse = (e) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("mousemove", onMouse); };
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver((ents) => { ents.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }); }, { threshold: 0.08 });
    document.querySelectorAll(".anim-up,.anim-scale,.stat-bar").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [lang]);

  const buildChart = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.innerHTML = "";
    ptsRef.current = [];
    const NS = "http://www.w3.org/2000/svg";
    const W = 500, H = 192, pL = 8, pR = 8, pT = 16, pB = 8;
    const cW = W - pL - pR, cH = H - pT - pB;
    const maxS = Math.max(...CHART_DATA.map((d) => d.sales)) * 1.15;
    const n = CHART_DATA.length;

    const defs = document.createElementNS(NS, "defs");
    defs.innerHTML = `<linearGradient id="aG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#15203B" stop-opacity=".2"/><stop offset="100%" stop-color="#15203B" stop-opacity=".01"/></linearGradient><linearGradient id="lG" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#1E2D50"/><stop offset="50%" stop-color="#15203B"/><stop offset="100%" stop-color="#D4A83A"/></linearGradient><filter id="gl"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
    svg.appendChild(defs);

    for (let i = 0; i <= 3; i++) {
      const y = pT + (cH / 3) * i;
      const ln = document.createElementNS(NS, "line");
      [["x1", pL], ["y1", y], ["x2", W - pR], ["y2", y], ["stroke", i < 3 ? "#EAE3D3" : "#D8CFB8"], ["stroke-width", "1"], ["stroke-dasharray", i < 3 ? "4,4" : "none"]].forEach(([k, v]) => ln.setAttribute(k, v));
      svg.appendChild(ln);
    }

    const pts = CHART_DATA.map((d, i) => ({ x: pL + (cW / (n - 1)) * i, y: pT + cH - (d.sales / maxS) * cH }));
    ptsRef.current = pts;
    const linePath = catmullRom(pts, 1);
    const len = approxLen(pts);

    const area = document.createElementNS(NS, "path");
    area.setAttribute("d", linePath + ` L ${pts[n - 1].x} ${pT + cH} L ${pts[0].x} ${pT + cH} Z`);
    area.setAttribute("fill", "url(#aG)");
    area.style.cssText = "opacity:0;transition:opacity .8s ease";
    svg.appendChild(area);
    requestAnimationFrame(() => setTimeout(() => { area.style.opacity = "1"; }, 600));

    const line = document.createElementNS(NS, "path");
    line.setAttribute("d", linePath);
    [["fill", "none"], ["stroke", "url(#lG)"], ["stroke-width", "2.5"], ["stroke-linecap", "round"], ["stroke-linejoin", "round"]].forEach(([k, v]) => line.setAttribute(k, v));
    line.style.cssText = `stroke-dasharray:${len};stroke-dashoffset:${len};transition:stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)`;
    svg.appendChild(line);
    requestAnimationFrame(() => setTimeout(() => { line.style.strokeDashoffset = "0"; }, 50));

    const hit = document.createElementNS(NS, "path");
    hit.setAttribute("d", linePath);
    [["fill", "none"], ["stroke", "transparent"], ["stroke-width", "24"]].forEach(([k, v]) => hit.setAttribute(k, v));
    hit.style.cursor = "pointer";
    svg.appendChild(hit);

    pts.forEach((p, i) => {
      const ring = document.createElementNS(NS, "circle");
      [["cx", p.x], ["cy", p.y], ["r", "14"], ["fill", "#F2C14E"], ["opacity", "0"], ["filter", "url(#gl)"]].forEach(([k, v]) => ring.setAttribute(k, v));
      ring.style.transition = "opacity .25s ease";
      ring.id = "r" + i;
      svg.appendChild(ring);

      const c = document.createElementNS(NS, "circle");
      [["cx", p.x], ["cy", p.y], ["r", "0"], ["fill", "#FBF8F2"], ["stroke", "#15203B"], ["stroke-width", "2.5"]].forEach(([k, v]) => c.setAttribute(k, v));
      c.style.cssText = "cursor:pointer;transition:r .2s ease,stroke .2s ease,stroke-width .2s ease";
      c.id = "p" + i;
      c.addEventListener("click", (e) => { e.stopPropagation(); doSelect(i); });
      c.addEventListener("mouseenter", () => doHover(i));
      c.addEventListener("mouseleave", doLeave);
      svg.appendChild(c);
      setTimeout(() => { c.setAttribute("r", "4"); }, 600 + i * 80);
    });

    hit.addEventListener("mousemove", (e) => {
      const rect = svg.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (W / rect.width);
      let ci = 0, cd = Infinity;
      pts.forEach((p, i) => { const d = Math.abs(p.x - mx); if (d < cd) { cd = d; ci = i; } });
      doHover(ci);
    });
    hit.addEventListener("mouseleave", doLeave);
    hit.addEventListener("click", (e) => {
      const rect = svg.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (W / rect.width);
      let ci = 0, cd = Infinity;
      pts.forEach((p, i) => { const d = Math.abs(p.x - mx); if (d < cd) { cd = d; ci = i; } });
      doSelect(ci);
    });
  }, [lang]);

  useEffect(() => { buildChart(); }, [buildChart]);

  const setPt = (i, r, stroke, sw, ringOp, ringR) => {
    const pt = document.getElementById("p" + i), ring = document.getElementById("r" + i);
    if (pt) { pt.setAttribute("r", r); pt.setAttribute("stroke", stroke); pt.setAttribute("stroke-width", sw); }
    if (ring) { ring.setAttribute("opacity", ringOp); ring.setAttribute("r", ringR); }
    const lbl = document.getElementById("l" + i);
    if (lbl) lbl.style.color = r > 4 ? "#15203B" : "";
  };

  const doHover = (i) => {
    if (selectedDay !== -1) return;
    ptsRef.current.forEach((_, j) => setPt(j, j === i ? 6 : 4, "#15203B", "2.5", j === i ? 0.12 : 0, 14));
    const tip = tipRef.current;
    if (tip && ptsRef.current[i]) {
      const r = svgRef.current?.getBoundingClientRect();
      if (r) { tip.style.left = (ptsRef.current[i].x * (r.width / 500)) + "px"; tip.style.top = (ptsRef.current[i].y * (r.height / 192) - 12) + "px"; tip.textContent = "$" + CHART_DATA[i].sales.toLocaleString(); tip.classList.add("show"); }
    }
  };

  const doLeave = () => {
    if (selectedDay !== -1) return;
    ptsRef.current.forEach((_, j) => setPt(j, 4, "#15203B", "2.5", 0, 14));
    tipRef.current?.classList.remove("show");
  };

  const doSelect = (i) => {
    if (selectedDay === i) { setSelectedDay(-1); doLeave(); return; }
    setSelectedDay(i);
    ptsRef.current.forEach((_, j) => setPt(j, j === i ? 7 : 4, j === i ? "#F2C14E" : "#15203B", j === i ? "3" : "2", j === i ? 0.25 : 0, j === i ? 16 : 14));
    tipRef.current?.classList.remove("show");
  };

  return (
    <div className={`font-sans antialiased overflow-x-hidden bg-[#FBF8F2] text-[#15203B]`} style={lang === "ar" ? { fontFamily: "'Noto Sans Arabic', sans-serif", direction: "rtl" } : {}}>
      <style>{ANIM_CSS}</style>

      <div className="fixed top-0 left-0 z-[9999] h-[3px]" style={{ width: scrollPct + "%", background: "linear-gradient(90deg,#15203B,#F2C14E)", transition: "width .05s linear" }} />
      <div className="cursor-glow fixed pointer-events-none z-[1]" style={{ width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(242,193,78,0.06)0%,transparent 70%)", transform: "translate(-50%,-50%)", left: cursor.x, top: cursor.y, transition: "left .05s, top .05s" }} />

      <div className="fixed bottom-5 right-5 z-[9999] flex items-center gap-2.5 text-[#FBF8F2] text-sm font-semibold rounded-xl px-5 py-3" style={{ background: "#15203B", boxShadow: "0 16px 32px rgba(21,32,59,.3)", transform: toastShow ? "translateY(0)" : "translateY(120px)", opacity: toastShow ? 1 : 0, transition: "all .4s cubic-bezier(.22,1,.36,1)" }}>
        <Info size={15} className="text-[#F2C14E] shrink-0" /><span>{toastMsg}</span>
      </div>

      <div className="fixed bottom-5 left-5 z-[9998]" style={{ animation: "wa-bounce 2s ease-in-out infinite" }}>
        <a href="https://wa.me/252624407283" target="_blank" rel="noopener" className="flex items-center justify-center w-14 h-14 rounded-full hover:scale-110 transition-transform" style={{ background: "#25D366", boxShadow: "0 6px 20px rgba(37,211,102,.4)" }}>
          <WAIcon size={28} fill="white" />
        </a>
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300" style={{ background: "rgba(251,248,242,.85)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <img src={LOGO_SRC} alt="Sahel Shop Management Software Somalia Logo" className="w-8 h-8 rounded-lg transition-transform group-hover:scale-105 group-hover:-rotate-1" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#F2C14E] rounded-full" style={{ animation: "pulse-ring 2s ease-out infinite" }} />
              </div>
              <span className="font-['Lora'] text-lg font-bold tracking-tight">Sahel</span>
            </Link>
            <div className="hidden md:flex items-center gap-0.5">
              <div className="flex bg-[#F1ECDE] rounded-full p-0.5 border border-[#E2D9C2] mr-2">
                {["en", "so", "ar"].map((l) => (
                  <button key={l} onClick={() => { setLang(l); setSelectedDay(-1); setOpenFaq(-1); }} className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${lang === l ? "bg-[#15203B] text-[#FBF8F2]" : "text-[#B0A98F]"}`} style={l === "ar" ? { fontFamily: "'Noto Sans Arabic'" } : {}}>
                    {l === "en" ? "EN" : l === "so" ? "SO" : "ع"}
                  </button>
                ))}
              </div>
              {[["#features", "nav.features"], ["#how", "nav.how"], ["#testimonials", "nav.stories"], ["#faq", "nav.faq"]].map(([href, key]) => (
                <a key={key} href={href} className="px-2.5 py-2 text-[12px] font-medium text-[#4B5170] hover:text-[#15203B] transition-colors">{tr(key)}</a>
              ))}
              <div className="w-px h-4 bg-[#D8CFB8] mx-1" />
              <a href="https://wa.me/252624407283" target="_blank" className="flex items-center gap-1.5 px-2 py-2 text-[12px] font-semibold text-[#25D366] hover:text-green-700 transition-colors">
                <WAIcon size={13} /><span className="hidden lg:inline">{tr("nav.whatsapp")}</span>
              </a>
              <Link to="/login" className="px-2.5 py-2 text-[12px] font-medium text-[#4B5170] hover:text-[#15203B] transition-colors">{tr("nav.login")}</Link>
              <Link to="/signup" className="bg-[#15203B] text-[#FBF8F2] px-4 py-1.5 rounded-lg text-[12px] font-bold hover:bg-[#0D1529] hover:shadow-lg hover:shadow-[#15203B]/20 transition-all">{tr("nav.register")}</Link>
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1ECDE] transition-colors"><Menu size={16} /></button>
          </div>
          <div className="md:hidden overflow-hidden transition-all duration-300" style={{ maxHeight: mobileOpen ? 320 : 0, opacity: mobileOpen ? 1 : 0 }}>
            <div className="py-3 border-t border-[#EAE3D3] space-y-0.5">
              {[["#features", "nav.features"], ["#how", "nav.how"], ["#testimonials", "nav.stories"], ["#faq", "nav.faq"]].map(([href, key]) => (
                <a key={key} href={href} onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-[#4B5170] hover:bg-[#F1ECDE] transition-colors">{tr(key)}</a>
              ))}
              <a href="https://wa.me/252624407283" target="_blank" className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#25D366]"><WAIcon size={15} /><span>{tr("nav.whatsapp")}</span></a>
              <div className="flex gap-2 px-4 pt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 rounded-lg text-sm font-bold border border-[#D8CFB8] text-[#15203B]">{tr("nav.login")}</Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 rounded-lg text-sm font-bold bg-[#15203B] text-[#FBF8F2]">{tr("nav.register")}</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO — redesigned with better visual hierarchy and H1 optimization */}
      <section className="relative pt-14 grid-bg glow-gold curve-connector">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10 md:py-14">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-10 items-center">

            <div className="relative z-10">
              <div className="anim-up inline-flex items-center gap-2 bg-[#FBF1DA] border border-[#F2C14E]/25 rounded-full px-3 py-1 mb-5">
                <span className="w-1.5 h-1.5 bg-[#F2C14E] rounded-full animate-pulse" />
                <span className="text-[10px] font-extrabold tracking-[0.12em] uppercase text-[#D4A83A]">{tr("hero.eyebrow")}</span>
              </div>

              {/* SEO FIX: Explicit H1 wrapping the translation string containing the keyword */}
              <h1 className="anim-up font-['Lora'] text-[1.85rem] md:text-[2.5rem] lg:text-[2.85rem] font-bold leading-[1.12] tracking-tight mb-4">
                <span className="hero-highlight">{tr("hero.headline")}</span>
              </h1>

              <p className="anim-up anim-up-d3 text-[15px] md:text-base text-[#4B5170] leading-[1.7] max-w-[460px] mb-6">
                {tr("hero.sub")}
              </p>

              <div className="anim-up anim-up-d4 flex flex-wrap gap-2.5 mb-7">
                <a href="https://wa.me/252624407283?text=I%20want%20to%20use%20Sahel" target="_blank"
                   className="group relative inline-flex items-center gap-2 bg-[#25D366] text-white pl-5 pr-6 py-3 rounded-xl text-[13px] font-bold hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#25D366]/25 transition-all duration-300">
                  <WAIcon size={16} fill="white" />
                  <span>{tr("hero.ctaPrimary")}</span>
                  <Zap size={14} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
                <a href="#how"
                   className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-bold border border-[#D8CFB8] hover:border-[#15203B]/20 hover:bg-white/80 transition-all">
                  <span>{tr("hero.ctaSecondary")}</span>
                  <ArrowDown size={15} className="text-[#D4A83A]" />
                </a>
              </div>

              <div className="anim-up anim-up-d5 flex items-center gap-4 pt-4 border-t border-[#EAE3D3]">
                <div className="flex -space-x-1.5">
                  {[1, 2, 3, 4].map((s) => (
                    <img key={s} src={`https://picsum.photos/seed/shop${s}/40/40.jpg`} className="w-7 h-7 rounded-full border-2 border-[#FBF8F2] object-cover" alt="Shop owner using Sahel software" />
                  ))}
                  <div className="w-7 h-7 rounded-full border-2 border-[#FBF8F2] bg-[#FBF1DA] flex items-center justify-center text-[9px] font-bold text-[#D4A83A]">+2k</div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex gap-px text-[#D4A83A]">{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={11} className="fill-current" />)}</div>
                  <span className="text-[10px] text-[#B0A98F] font-medium ml-1">{tr("hero.trust")}</span>
                </div>
              </div>
            </div>

            <div className="anim-scale anim-up-d2 relative">
              <div className="absolute -top-3 -right-3 w-14 h-14 bg-[#F2C14E]/10 rounded-2xl rotate-12 float" />
              <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-[#15203B]/5 rounded-xl -rotate-12 float-d" />
              <div className="relative bg-white rounded-2xl p-4 md:p-5 overflow-hidden" style={{ boxShadow: "0 12px 28px rgba(21,32,59,.07), 0 0 0 1px rgba(21,32,59,.06)" }}>
                <div className="chart-glow rounded-2xl" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[9px] font-extrabold tracking-[0.1em] uppercase text-[#B0A98F] mb-0.5">{tr("hero.eyebrow")}</p>
                      <h3 className="text-sm font-bold">{tr("hero.chartTitle")}</h3>
                    </div>
                    <div className="w-8 h-8 bg-[#FBF1DA] rounded-lg flex items-center justify-center">
                      <TrendingUp size={15} className="text-[#D4A83A]" />
                    </div>
                  </div>

                  <div className="relative" style={{ height: 170 }}>
                    <div ref={tipRef} className="line-tip" />
                    <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 500 192" preserveAspectRatio="none" style={{ overflow: "visible" }} />
                  </div>

                  <div className="flex justify-between px-0.5 pt-0.5">
                    {CHART_DATA.map((d, i) => (
                      <span key={d.day} id={"l" + i} onClick={() => doSelect(i)} className="flex-1 text-center text-[9px] font-semibold text-[#B0A98F] cursor-pointer transition-colors">{days[i] || d.day}</span>
                    ))}
                  </div>

                  <div className="overflow-hidden" style={{ maxHeight: selectedDay !== -1 ? 64 : 0, opacity: selectedDay !== -1 ? 1 : 0, marginTop: selectedDay !== -1 ? 8 : 0, transitionProperty: "max-height, opacity, margin", transitionTimingFunction: "cubic-bezier(.22,1,.36,1)", transitionDuration: "350ms" }}>
                    <div className="bg-[#FBF8F2] rounded-lg p-2.5 border border-[#EAE3D3] flex items-center justify-between text-xs">
                      <div><p className="text-[8px] font-extrabold tracking-[0.08em] uppercase text-[#B0A98F]">{CHART_DATA[selectedDay]?.full.toUpperCase()}</p><p className="text-xs font-bold mt-0.5">{days[selectedDay]}</p></div>
                      <div className="text-right"><p className="text-[8px] font-extrabold tracking-[0.08em] uppercase text-[#B0A98F]">{tr("chart.sales")}</p><p className="text-base font-bold text-[#D4A83A]">${CHART_DATA[selectedDay]?.sales.toLocaleString()}</p></div>
                      <div className="text-right"><p className="text-[8px] font-extrabold tracking-[0.08em] uppercase text-[#B0A98F]">{tr("chart.transactions")}</p><p className="text-base font-bold">{CHART_DATA[selectedDay]?.tx}</p></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#EAE3D3]">
                    <div>
                      <p className="text-[8px] font-extrabold tracking-[0.08em] uppercase text-[#B0A98F]">{tr("hero.topProduct")}</p>
                      <p className="text-[11px] font-bold mt-0.5">{selectedDay !== -1 ? CHART_DATA[selectedDay].product : "Sugar (50kg)"}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] font-extrabold tracking-[0.08em] uppercase text-[#B0A98F]">{tr("hero.revenue")}</p>
                      <p className="text-[11px] font-bold text-[#D4A83A] mt-0.5">${weekTotal.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-extrabold tracking-[0.08em] uppercase text-[#B0A98F]">{tr("hero.growth")}</p>
                      <p className="text-[11px] font-bold text-emerald-600 mt-0.5">+24.5%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="py-6 bg-white/50 relative z-10">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <p className="text-center text-[9px] font-extrabold tracking-[0.12em] uppercase text-[#B0A98F] mb-3 anim-up">{tr("trust.bar")}</p>
          <div className="anim-up anim-up-d1 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
            {TRUST_NAMES.map((n) => (
              <span key={n} className="font-['Lora'] text-base md:text-lg font-bold text-[#15203B] opacity-20 cursor-default hover:opacity-45 hover:scale-105 transition-all">{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* SEO FIX: Expanded block to increase word count and density */}
      <section id="why" className="py-10 md:py-12 bg-white border-y border-[#EAE3D3] relative z-10">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 text-center">
          <div className="anim-up inline-flex items-center gap-2 bg-[#FBF1DA] border border-[#F2C14E]/25 rounded-full px-3 py-1 mb-3">
            <span className="text-[10px] font-extrabold tracking-[0.12em] uppercase text-[#D4A83A]">{tr("why.eyebrow")}</span>
          </div>
          <h2 className="anim-up anim-up-d1 font-['Lora'] text-lg md:text-2xl font-bold mb-3">{tr("why.title")}</h2>
          <p className="anim-up anim-up-d2 text-[14px] md:text-base text-[#6B7290] leading-relaxed">{tr("why.body")}</p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-12 md:py-14 relative glow-ink">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-8">
            <div className="anim-up inline-flex items-center gap-2 bg-[#FBF1DA] border border-[#F2C14E]/25 rounded-full px-3 py-1 mb-3"><span className="text-[10px] font-extrabold tracking-[0.12em] uppercase text-[#D4A83A]">{tr("features.eyebrow")}</span></div>
            <h2 className="anim-up anim-up-d1 font-['Lora'] text-xl md:text-3xl font-bold mb-1.5">{tr("features.title")}</h2>
            <p className="anim-up anim-up-d2 text-sm text-[#6B7290] max-w-xl mx-auto">{tr("features.sub")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {FEATS.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={f.k[0]} className={`tool-card card-shine anim-up anim-up-d${Math.min(i + 1, 5)} bg-white rounded-xl border border-[#EAE3D3] p-4 hover:shadow-lg hover:shadow-[#15203B]/[.05] hover:-translate-y-1 transition-all duration-300`}>
                  <div className="w-9 h-9 bg-[#15203B] rounded-lg flex items-center justify-center mb-2.5"><Icon size={18} className="text-[#F2C14E] feat-icon" /></div>
                  <h3 className="text-sm font-bold mb-1">{tr(f.k[0])}</h3>
                  <p className="text-[12px] text-[#6B7290] leading-relaxed">{tr(f.k[1])}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-12 md:py-14 bg-white border-y border-[#EAE3D3] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-[#F2C14E]/[.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="max-w-7xl mx-auto px-5 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            <div className="anim-up inline-flex items-center gap-2 bg-[#FBF1DA] border border-[#F2C14E]/25 rounded-full px-3 py-1 mb-3"><span className="text-[10px] font-extrabold tracking-[0.12em] uppercase text-[#D4A83A]">{tr("how.eyebrow")}</span></div>
            <h2 className="anim-up anim-up-d1 font-['Lora'] text-xl md:text-3xl font-bold mb-1.5">{tr("how.title")}</h2>
            <p className="anim-up anim-up-d2 text-sm text-[#6B7290] max-w-xl mx-auto">{tr("how.sub")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 lg:gap-8">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.k[0]} className={`anim-up anim-up-d${i + 1} text-center relative`}>
                  <div className="relative inline-flex items-center justify-center w-14 h-14 bg-[#FBF1DA] rounded-xl mb-3">
                    <Icon size={24} className="text-[#D4A83A]" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#15203B] rounded-md flex items-center justify-center text-[11px] font-bold text-[#FBF8F2]">{s.n}</div>
                  </div>
                  <h3 className="text-sm font-bold mb-1">{tr(s.k[0])}</h3>
                  <p className="text-[12px] text-[#6B7290] leading-relaxed max-w-[240px] mx-auto">{tr(s.k[1])}</p>
                  {i < STEPS.length - 1 && <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-px bg-[#D8CFB8]" />}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-10 bg-[#15203B] relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#F2C14E]/[.06] rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-5 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
            {STATS.map((s, i) => (
              <div key={s.k} className={`stat-bar anim-up anim-up-d${i + 1} text-center`}>
                <p className={`text-2xl md:text-3xl font-bold ${s.g ? "text-[#F2C14E]" : "text-[#FBF8F2]"} mb-0.5`}>{s.p || ""}{s.v.toLocaleString()}{s.s}</p>
                <p className="text-[11px] text-[#FBF8F2]/45">{tr(s.k)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-12 md:py-14 relative glow-gold">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-7">
            <div className="anim-up inline-flex items-center gap-2 bg-[#FBF1DA] border border-[#F2C14E]/25 rounded-full px-3 py-1 mb-3"><span className="text-[10px] font-extrabold tracking-[0.12em] uppercase text-[#D4A83A]">{tr("testimonials.eyebrow")}</span></div>
            <h2 className="anim-up anim-up-d1 font-['Lora'] text-xl md:text-3xl font-bold mb-1.5">{tr("testimonials.title")}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {TESTS.map((t, i) => (
              <div key={t.k} className={`anim-up anim-up-d${i + 1} bg-white rounded-xl border border-[#EAE3D3] p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}>
                <div className="flex items-center gap-2.5 mb-3">
                  <img src={`https://picsum.photos/seed/${t.img}/48/48.jpg`} className="w-9 h-9 rounded-full object-cover" alt={`${t.name} Somalia Retailer`} />
                  <div><p className="text-xs font-bold">{t.name}</p><p className="text-[10px] text-[#B0A98F]">{t.loc}</p></div>
                </div>
                <p className="text-[12px] text-[#6B7290] leading-relaxed">{tr(t.k)}</p>
                <div className="flex items-center gap-0.5 mt-2.5 text-[#D4A83A]">{[1, 2, 3, 4, 5].map((j) => <Star key={j} size={11} className="fill-current" />)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-12 md:py-14 relative glow-ink">
        <div className="max-w-3xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-7">
            <div className="anim-up inline-flex items-center gap-2 bg-[#FBF1DA] border border-[#F2C14E]/25 rounded-full px-3 py-1 mb-3"><span className="text-[10px] font-extrabold tracking-[0.12em] uppercase text-[#D4A83A]">{tr("faq.eyebrow")}</span></div>
            <h2 className="anim-up anim-up-d1 font-['Lora'] text-xl md:text-2xl font-bold">{tr("faq.title")}</h2>
          </div>
          <div className="space-y-1.5">
            {FAQS.map((f, i) => (
              <div key={f.qk} className="bg-white rounded-xl border border-[#EAE3D3] overflow-hidden">
                <button className="w-full flex items-center justify-between p-3.5 text-left hover:bg-[#F1ECDE]/40 transition-colors" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  <span className="font-bold text-[13px] pr-4">{tr(f.qk)}</span>
                  <ChevronDown size={16} className="text-[#B0A98F] shrink-0 transition-transform duration-300" style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }} />
                </button>
                <div className="overflow-hidden" style={{ maxHeight: openFaq === i ? 180 : 0, transitionProperty: "max-height", transitionTimingFunction: "cubic-bezier(.22,1,.36,1)", transitionDuration: "350ms" }}>
                  <p className="px-3.5 pb-3.5 text-[12px] text-[#6B7290] leading-relaxed">{tr(f.ak)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-12 md:py-14 bg-[#15203B] relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-8" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-[#F2C14E]/[.08] rounded-full blur-3xl" />
        <div className="max-w-3xl mx-auto px-5 lg:px-8 text-center relative z-10">
          <div className="anim-up inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3 py-1 mb-4"><span className="w-1.5 h-1.5 bg-[#F2C14E] rounded-full animate-pulse" /><span className="text-[10px] font-extrabold tracking-[0.12em] uppercase text-[#FBF8F2]/50">{tr("cta.eyebrow")}</span></div>
          <h2 className="anim-up anim-up-d1 font-['Lora'] text-xl md:text-3xl font-bold text-[#FBF8F2] mb-3 leading-tight">{tr("cta.title")}</h2>
          <p className="anim-up anim-up-d2 text-sm text-[#FBF8F2]/45 mb-6 max-w-lg mx-auto">{tr("cta.sub")}</p>
          <div className="anim-up anim-up-d3 flex flex-col sm:flex-row gap-2.5 justify-center">
            <a href="https://wa.me/252624407283?text=I%20want%20to%20use%20Sahel%20for%20my%20shop" target="_blank" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-7 py-3 rounded-xl text-sm font-bold hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#25D366]/25 transition-all duration-300">
              <WAIcon size={16} fill="white" /><span>{tr("cta.button")}</span>
            </a>
            <a href="#features" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-[#FBF8F2]/60 border border-[#FBF8F2]/15 hover:border-[#FBF8F2]/30 hover:text-[#FBF8F2] transition-all">
              <span>{tr("cta.secondary")}</span><ArrowDown size={13} />
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0D1529] py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-2.5">
                <img src={LOGO_SRC} alt="Sahel Logo" className="w-7 h-7 rounded-md" />
                <span className="font-['Lora'] text-base font-bold text-[#FBF8F2]">Sahel</span>
              </div>
              <p className="text-[11px] text-[#FBF8F2]/35 leading-relaxed max-w-xs mb-3">{tr("footer.desc")}</p>
              <div className="flex gap-2 mb-3">
                <a href="https://wa.me/252624407283" target="_blank" className="w-7 h-7 bg-[#25D366]/20 rounded-md flex items-center justify-center hover:bg-[#25D366]/30 transition-colors"><WAIcon size={13} fill="#25D366" /></a>
                <a href="#" className="w-7 h-7 bg-white/5 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors"><Instagram size={13} className="text-[#FBF8F2]/40" /></a>
                <a href="#" className="w-7 h-7 bg-white/5 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors"><Twitter size={13} className="text-[#FBF8F2]/40" /></a>
              </div>
              <p className="text-[11px] text-[#FBF8F2]/50 font-semibold flex items-center gap-1.5"><WAIcon size={11} fill="#25D366" /> +252 624 407 283</p>
            </div>
            <div>
              <h4 className="text-[9px] font-extrabold tracking-[0.1em] uppercase text-[#FBF8F2]/25 mb-2.5">{tr("footer.product")}</h4>
              <ul className="space-y-1.5">
                <li><a href="#features" className="text-[11px] text-[#FBF8F2]/40 hover:text-[#FBF8F2] transition-colors">{tr("footer.feat")}</a></li>
                <li><a href="#how" className="text-[11px] text-[#FBF8F2]/40 hover:text-[#FBF8F2] transition-colors">{tr("footer.how")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[9px] font-extrabold tracking-[0.1em] uppercase text-[#FBF8F2]/25 mb-2.5">{tr("footer.support")}</h4>
              <ul className="space-y-1.5">
                <li><a href="#faq" className="text-[11px] text-[#FBF8F2]/40 hover:text-[#FBF8F2] transition-colors">{tr("footer.help")}</a></li>
                <li><a href="https://wa.me/252624407283" target="_blank" className="text-[11px] text-[#FBF8F2]/40 hover:text-[#FBF8F2] transition-colors">{tr("footer.contact")}</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-5 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-1.5">
            <p className="text-[10px] text-[#FBF8F2]/20">© 2025 Sahel. All rights reserved.</p>
            <p className="text-[10px] text-[#FBF8F2]/20">{tr("footer.tagline")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
