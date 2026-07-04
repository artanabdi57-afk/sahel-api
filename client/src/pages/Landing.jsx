import { useEffect } from "react";

const BODY_HTML = `<div id="scroll-progress"></div>
  <div id="cursor-glow"></div>
  <div id="toast" class="toast"><i data-lucide="info" class="w-4 h-4 text-gold flex-shrink-0"></i><span id="toast-msg"></span></div>

  <!-- WhatsApp Float -->
  <div id="wa-float">
    <a href="https://wa.me/252624407283" target="_blank" rel="noopener" aria-label="WhatsApp">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    </a>
  </div>

  <!-- NAVBAR -->
  <nav id="navbar" class="fixed top-0 left-0 right-0 z-50 transition-all duration-300" style="background:rgba(251,248,242,.8);backdrop-filter:blur(14px);">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="flex items-center justify-between h-[72px]">
        <a href="#" class="logo-group flex items-center gap-3">
          <div class="relative">
            <img src="" alt="Sahel" class="logo-img brand-logo-img" />
            <div class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gold rounded-full" style="animation:pulse-ring 2s ease-out infinite;"></div>
          </div>
          <span class="font-serif text-2xl font-bold tracking-tight text-ink">Sahel</span>
        </a>
        <div class="hidden md:flex items-center gap-1">
          <div class="flex bg-cream-dark rounded-full p-1 border border-border-dark mr-3">
            <button onclick="setLang('en')" id="lang-en" class="lang-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 bg-ink text-cream">EN</button>
            <button onclick="setLang('so')" id="lang-so" class="lang-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 text-slate-faint">SO</button>
            <button onclick="setLang('ar')" id="lang-ar" class="lang-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 text-slate-faint lang-ar">ع</button>
          </div>
          <a href="#features" class="px-4 py-2 text-sm font-medium text-slate hover:text-ink transition-colors" data-t="nav.features">Features</a>
          <a href="#how" class="px-4 py-2 text-sm font-medium text-slate hover:text-ink transition-colors" data-t="nav.how">How it works</a>
          <a href="#testimonials" class="px-4 py-2 text-sm font-medium text-slate hover:text-ink transition-colors" data-t="nav.stories">Stories</a>
          <a href="#faq" class="px-4 py-2 text-sm font-medium text-slate hover:text-ink transition-colors" data-t="nav.faq">FAQ</a>
          <div class="w-px h-6 bg-border-dark mx-2"></div>
          <a href="https://wa.me/252624407283" target="_blank" class="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-wa hover:text-green-700 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            <span data-t="nav.whatsapp">WhatsApp</span>
          </a>
          <a href="#" onclick="showToast(t('nav.registerSoon'));return false;" class="mag-btn bg-ink text-cream px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-ink-light hover:shadow-lg hover:shadow-ink/20 transition-all duration-200" data-t="nav.register">Register</a>
        </div>
        <button onclick="toggleMobile()" class="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-cream-dark transition-colors"><i data-lucide="menu" class="w-5 h-5"></i></button>
      </div>
      <div id="mobile-menu" class="mobile-menu md:hidden">
        <div class="py-4 border-t border-border space-y-1">
          <a href="#features" onclick="toggleMobile()" class="block px-4 py-3 rounded-xl text-sm font-medium text-slate hover:bg-cream-dark transition-colors" data-t="nav.features">Features</a>
          <a href="#how" onclick="toggleMobile()" class="block px-4 py-3 rounded-xl text-sm font-medium text-slate hover:bg-cream-dark transition-colors" data-t="nav.how">How it works</a>
          <a href="#testimonials" onclick="toggleMobile()" class="block px-4 py-3 rounded-xl text-sm font-medium text-slate hover:bg-cream-dark transition-colors" data-t="nav.stories">Stories</a>
          <a href="#faq" onclick="toggleMobile()" class="block px-4 py-3 rounded-xl text-sm font-medium text-slate hover:bg-cream-dark transition-colors" data-t="nav.faq">FAQ</a>
          <a href="https://wa.me/252624407283" target="_blank" class="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-wa hover:bg-green-50 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            <span data-t="nav.whatsapp">WhatsApp Us</span>
          </a>
          <div class="flex gap-2 px-4 pt-3">
            <a href="#" onclick="showToast(t('nav.registerSoon'));return false;" class="flex-1 text-center py-3 rounded-xl text-sm font-bold bg-ink text-cream" data-t="nav.register">Register</a>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <!-- HERO -->
  <section class="relative pt-[72px] grid-bg glow-gold curve-connector">
    <div class="max-w-7xl mx-auto px-6 lg:px-8 py-24 md:py-32 lg:py-40">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div class="relative z-10">
          <div class="anim-up inline-flex items-center gap-2 bg-gold-glow border border-gold/30 rounded-full px-4 py-1.5 mb-6">
            <span class="w-2 h-2 bg-gold rounded-full animate-pulse"></span>
            <span class="text-xs font-extrabold tracking-widest uppercase text-gold-dim" data-t="hero.eyebrow">Sales & Inventory Tracker</span>
          </div>
          <h1 id="hero-headline" class="font-serif text-[2.75rem] md:text-[3.5rem] lg:text-[4rem] font-bold leading-[1.08] tracking-tight text-ink mb-6" style="perspective:600px;" data-t="hero.headline">We track your sales, stock, and customer debts — from your phone.</h1>
          <p class="anim-up anim-up-delay-3 text-lg md:text-xl text-slate leading-relaxed max-w-xl mb-10" data-t="hero.sub">Sahel records every sale, alerts you when stock is low, and keeps a list of who owes you money. It works offline and speaks your language — Somali, English, and Arabic.</p>
          <div class="anim-up anim-up-delay-4 flex flex-wrap gap-4">
            <a href="https://wa.me/252624407283?text=I%20want%20to%20use%20Sahel" target="_blank" class="mag-btn group relative bg-wa text-white px-8 py-4 rounded-2xl text-base font-bold hover:bg-green-600 hover:-translate-y-1 hover:shadow-2xl hover:shadow-wa/30 transition-all duration-300">
              <span data-t="hero.ctaPrimary">WhatsApp us to start</span>
            </a>
            <a href="#how" class="mag-btn flex items-center gap-2 px-6 py-4 rounded-2xl text-base font-bold text-ink border-2 border-border-dark hover:border-ink/30 hover:bg-white/60 transition-all duration-200">
              <span data-t="hero.ctaSecondary">How it works</span>
              <i data-lucide="arrow-down" class="w-5 h-5 text-gold-dim"></i>
            </a>
          </div>
          <div class="anim-up anim-up-delay-5 flex items-center gap-6 mt-10 pt-8 border-t border-border">
            <div class="flex -space-x-2">
              <img src="https://picsum.photos/seed/shop1/40/40.jpg" class="w-9 h-9 rounded-full border-2 border-cream object-cover" alt="" />
              <img src="https://picsum.photos/seed/shop2/40/40.jpg" class="w-9 h-9 rounded-full border-2 border-cream object-cover" alt="" />
              <img src="https://picsum.photos/seed/shop3/40/40.jpg" class="w-9 h-9 rounded-full border-2 border-cream object-cover" alt="" />
              <img src="https://picsum.photos/seed/shop4/40/40.jpg" class="w-9 h-9 rounded-full border-2 border-cream object-cover" alt="" />
              <div class="w-9 h-9 rounded-full border-2 border-cream bg-gold-glow flex items-center justify-center text-xs font-bold text-gold-dim">+2k</div>
            </div>
            <div>
              <div class="flex items-center gap-1 text-gold-dim"><i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i><i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i><i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i><i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i><i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i></div>
              <p class="text-xs text-slate-faint font-medium mt-0.5" data-t="hero.trust">Used by 2,000+ shop owners</p>
            </div>
          </div>
        </div>

        <div class="anim-scale anim-up-delay-2 relative">
          <div class="absolute -top-6 -right-6 w-24 h-24 bg-gold/10 rounded-3xl rotate-12 float"></div>
          <div class="absolute -bottom-4 -left-4 w-16 h-16 bg-ink/5 rounded-2xl -rotate-12 float-d"></div>
          <div class="relative bg-white rounded-3xl border border-border shadow-2xl shadow-ink/[0.07] p-6 md:p-8">
            <div class="flex items-center justify-between mb-6">
              <div>
                <p class="text-[10px] font-extrabold tracking-widest uppercase text-slate-faint mb-1" data-t="hero.eyebrow">Sales & Inventory Tracker</p>
                <h3 class="text-lg font-bold text-ink" data-t="hero.chartTitle">Weekly sales — tap a day</h3>
              </div>
              <div class="w-10 h-10 bg-gold-glow rounded-xl flex items-center justify-center"><i data-lucide="trending-up" class="w-5 h-5 text-gold-dim"></i></div>
            </div>
            <div class="relative h-48 md:h-56 flex items-end gap-3 pb-2" id="chart-container">
              <div class="absolute inset-0 flex flex-col justify-between pointer-events-none"><div class="border-b border-dashed border-border w-full"></div><div class="border-b border-dashed border-border w-full"></div><div class="border-b border-dashed border-border w-full"></div><div class="border-b border-border w-full"></div></div>
            </div>
            <div class="chart-detail-panel" id="chart-detail">
              <div class="bg-cream rounded-xl p-4 border border-border flex items-center justify-between">
                <div><p class="text-[10px] font-extrabold tracking-widest uppercase text-slate-faint" id="detail-day-label">SUNDAY</p><p class="text-base font-bold text-ink" id="detail-day-name">Sunday</p></div>
                <div class="text-right"><p class="text-[10px] font-extrabold tracking-widest uppercase text-slate-faint" id="detail-sales-label">SALES</p><p class="text-xl font-bold text-gold-dim" id="detail-sales-value">$2,100</p></div>
                <div class="text-right"><p class="text-[10px] font-extrabold tracking-widest uppercase text-slate-faint" id="detail-tx-label">TRANSACTIONS</p><p class="text-xl font-bold text-ink" id="detail-tx-value">14</p></div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-border">
              <div><p class="text-[10px] font-extrabold tracking-widest text-slate-faint mb-1" data-t="hero.topProduct">TOP PRODUCT</p><p class="text-sm font-bold text-ink" id="stat-top-product">Sugar (50kg)</p></div>
              <div class="text-center"><p class="text-[10px] font-extrabold tracking-widest text-slate-faint mb-1" data-t="hero.revenue">WEEK TOTAL</p><p class="text-sm font-bold text-gold-dim" id="stat-week-total">$8,000</p></div>
              <div class="text-right"><p class="text-[10px] font-extrabold tracking-widest text-slate-faint mb-1" data-t="hero.growth">VS LAST WEEK</p><p class="text-sm font-bold text-emerald-600">+24.5%</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- TRUST BAR -->
  <section class="py-14 bg-white/50 relative z-10">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <p class="text-center text-xs font-extrabold tracking-widest uppercase text-slate-faint mb-8 anim-up" data-t="trust.bar">Used by these businesses</p>
      <div class="anim-up anim-up-delay-1 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
        <span class="trust-logo font-serif text-xl md:text-2xl font-bold text-ink opacity-30 cursor-default">Taran Ventures</span>
        <span class="trust-logo font-serif text-xl md:text-2xl font-bold text-ink opacity-30 cursor-default">Muhin Appliances</span>
        <span class="trust-logo font-serif text-xl md:text-2xl font-bold text-ink opacity-30 cursor-default">Wardo Fashion</span>
        <span class="trust-logo font-serif text-xl md:text-2xl font-bold text-ink opacity-30 cursor-default">Xamar Wholesale</span>
        <span class="trust-logo font-serif text-xl md:text-2xl font-bold text-ink opacity-30 cursor-default">Geela Shop</span>
      </div>
    </div>
  </section>

  <!-- FEATURES -->
  <section id="features" class="py-24 md:py-32 relative glow-ink">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="text-center mb-16 md:mb-20">
        <div class="anim-up inline-flex items-center gap-2 bg-gold-glow border border-gold/30 rounded-full px-4 py-1.5 mb-5"><span class="text-xs font-extrabold tracking-widest uppercase text-gold-dim" data-t="features.eyebrow">What Sahel does</span></div>
        <h2 class="anim-up anim-up-delay-1 font-serif text-3xl md:text-5xl font-bold text-ink mb-4" data-t="features.title">Six things Sahel handles for you</h2>
        <p class="anim-up anim-up-delay-2 text-lg text-slate-light max-w-2xl mx-auto" data-t="features.sub">These are the tasks you currently do on paper or in your head. Sahel does them automatically and you can check them anytime from your phone.</p>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5" id="features-grid"></div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section id="how" class="py-24 md:py-32 bg-white border-y border-border relative overflow-hidden">
    <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
    <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
      <div class="text-center mb-16 md:mb-20">
        <div class="anim-up inline-flex items-center gap-2 bg-gold-glow border border-gold/30 rounded-full px-4 py-1.5 mb-5"><span class="text-xs font-extrabold tracking-widest uppercase text-gold-dim" data-t="how.eyebrow">Get started</span></div>
        <h2 class="anim-up anim-up-delay-1 font-serif text-3xl md:text-5xl font-bold text-ink mb-4" data-t="how.title">Three steps, five minutes, you're running</h2>
        <p class="anim-up anim-up-delay-2 text-lg text-slate-light max-w-2xl mx-auto" data-t="how.sub">No setup wizard. No training videos. If you've ever sent a WhatsApp message, you can use Sahel right now.</p>
      </div>
      <div class="grid md:grid-cols-3 gap-8 lg:gap-12" id="steps-grid"></div>
    </div>
  </section>

  <!-- STATS -->
  <section class="py-20 bg-ink relative overflow-hidden" id="stats-section">
    <div class="absolute inset-0 grid-bg opacity-20"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/[0.06] rounded-full blur-3xl"></div>
    <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12" id="stats-grid"></div>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section id="testimonials" class="py-24 md:py-32 relative glow-gold">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="text-center mb-16">
        <div class="anim-up inline-flex items-center gap-2 bg-gold-glow border border-gold/30 rounded-full px-4 py-1.5 mb-5"><span class="text-xs font-extrabold tracking-widest uppercase text-gold-dim" data-t="testimonials.eyebrow">From our users</span></div>
        <h2 class="anim-up anim-up-delay-1 font-serif text-3xl md:text-5xl font-bold text-ink mb-4" data-t="testimonials.title">What business owners say about Sahel</h2>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6" id="testimonials-grid"></div>
    </div>
  </section>

  <!-- FAQ -->
  <section id="faq" class="py-24 md:py-32 relative glow-ink">
    <div class="max-w-3xl mx-auto px-6 lg:px-8">
      <div class="text-center mb-14">
        <div class="anim-up inline-flex items-center gap-2 bg-gold-glow border border-gold/30 rounded-full px-4 py-1.5 mb-5"><span class="text-xs font-extrabold tracking-widest uppercase text-gold-dim" data-t="faq.eyebrow">Common questions</span></div>
        <h2 class="anim-up anim-up-delay-1 font-serif text-3xl md:text-4xl font-bold text-ink" data-t="faq.title">Answers to questions people ask us</h2>
      </div>
      <div class="space-y-3" id="faq-list"></div>
    </div>
  </section>

  <!-- FINAL CTA -->
  <section class="py-24 md:py-32 bg-ink relative overflow-hidden">
    <div class="absolute inset-0 grid-bg opacity-10"></div>
    <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold/[0.08] rounded-full blur-3xl"></div>
    <div class="max-w-3xl mx-auto px-6 lg:px-8 text-center relative z-10">
      <div class="anim-up inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 mb-6"><span class="w-2 h-2 bg-gold rounded-full animate-pulse"></span><span class="text-xs font-extrabold tracking-widest uppercase text-cream/60" data-t="cta.eyebrow">Free to start</span></div>
      <h2 class="anim-up anim-up-delay-1 font-serif text-3xl md:text-5xl font-bold text-cream mb-6 leading-tight" data-t="cta.title">Stop losing money to forgotten debts and messy records.</h2>
      <p class="anim-up anim-up-delay-2 text-lg text-cream/50 mb-10 max-w-xl mx-auto" data-t="cta.sub">WhatsApp us now on +252 624 407 283 and we'll set you up in minutes.</p>
      <div class="anim-up anim-up-delay-3 flex flex-col sm:flex-row gap-4 justify-center">
        <a href="https://wa.me/252624407283?text=I%20want%20to%20use%20Sahel%20for%20my%20shop" target="_blank" class="mag-btn group relative bg-wa text-white px-10 py-4 rounded-2xl text-base font-bold hover:bg-green-600 hover:-translate-y-1 hover:shadow-2xl hover:shadow-wa/30 transition-all duration-300">
          <span data-t="cta.button">WhatsApp us now</span>
        </a>
        <a href="#features" class="mag-btn flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-cream/70 border-2 border-cream/15 hover:border-cream/30 hover:text-cream transition-all duration-200">
          <span data-t="cta.secondary">See features</span>
          <i data-lucide="arrow-down" class="w-4 h-4"></i>
        </a>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="bg-[#0D1529] py-16 border-t border-white/5">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="grid md:grid-cols-4 gap-10 mb-12">
        <div class="md:col-span-2">
          <div class="flex items-center gap-3 mb-4">
            <img src="" alt="Sahel" class="logo-img-sm brand-logo-img" />
            <span class="font-serif text-xl font-bold text-cream">Sahel</span>
          </div>
          <p class="text-sm text-cream/40 leading-relaxed max-w-sm mb-6" data-t="footer.desc">Sahel records your sales, manages your stock, and tracks who owes you money — from your phone, in Somali, English, and Arabic.</p>
          <div class="flex gap-3 mb-6">
            <a href="https://wa.me/252624407283" target="_blank" class="w-9 h-9 bg-wa/20 rounded-lg flex items-center justify-center hover:bg-wa/30 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
            <a href="#" class="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"><i data-lucide="instagram" class="w-4 h-4 text-cream/50"></i></a>
            <a href="#" class="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"><i data-lucide="twitter" class="w-4 h-4 text-cream/50"></i></a>
          </div>
          <p class="text-sm text-cream/60 font-semibold flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            +252 624 407 283
          </p>
        </div>
        <div>
          <h4 class="text-xs font-extrabold tracking-widest uppercase text-cream/30 mb-4" data-t="footer.product">Product</h4>
          <ul class="space-y-3">
            <li><a href="#features" class="text-sm text-cream/50 hover:text-cream transition-colors" data-t="footer.feat">Features</a></li>
            <li><a href="#how" class="text-sm text-cream/50 hover:text-cream transition-colors" data-t="footer.how">How it works</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-xs font-extrabold tracking-widest uppercase text-cream/30 mb-4" data-t="footer.support">Support</h4>
          <ul class="space-y-3">
            <li><a href="#faq" class="text-sm text-cream/50 hover:text-cream transition-colors" data-t="footer.help">FAQ</a></li>
            <li><a href="https://wa.me/252624407283" target="_blank" class="text-sm text-cream/50 hover:text-cream transition-colors" data-t="footer.contact">WhatsApp Us</a></li>
          </ul>
        </div>
      </div>
      <div class="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-xs text-cream/25">© 2025 Sahel. All rights reserved.</p>
        <p class="text-xs text-cream/25" data-t="footer.tagline">Built for shop owners, by shop owners.</p>
      </div>
    </div>
  </footer>`;

export default function Landing() {
  useEffect(() => {

    const LOGO = 'data:image/svg+xml;utf8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
      '<rect width="64" height="64" rx="16" fill="#15203B"/>' +
      '<text x="32" y="45" font-family="Georgia, serif" font-size="36" font-weight="700" fill="#F2C14E" text-anchor="middle">S</text>' +
      '</svg>'
    );
    const CHART = [
      {day:'Mon',full:'Monday',sales:400,tx:5,product:'Rice (25kg)'},
      {day:'Tue',full:'Tuesday',sales:800,tx:8,product:'Sugar (50kg)'},
      {day:'Wed',full:'Wednesday',sales:600,tx:6,product:'Cooking Oil'},
      {day:'Thu',full:'Thursday',sales:1300,tx:11,product:'Sugar (50kg)'},
      {day:'Fri',full:'Friday',sales:1100,tx:9,product:'Flour (25kg)'},
      {day:'Sat',full:'Saturday',sales:1700,tx:13,product:'Sugar (50kg)'},
      {day:'Sun',full:'Sunday',sales:2100,tx:14,product:'Sugar (50kg)'},
    ];
    const FEATS=[
      {icon:'package',k:['f1t','f1b']},{icon:'bar-chart-3',k:['f2t','f2b']},
      {icon:'trending-up',k:['f3t','f3b']},{icon:'wallet',k:['f4t','f4b']},
      {icon:'shopping-cart',k:['f5t','f5b']},{icon:'shield-check',k:['f6t','f6b']},
    ];
    const STEPS=[{icon:'smartphone',n:1,k:['s1t','s1b']},{icon:'package-plus',n:2,k:['s2t','s2b']},{icon:'rocket',n:3,k:['s3t','s3b']}];
    const STATS=[{v:2400,s:'+',k:'st1',g:false},{v:1.2,s:'M',p:'$',k:'st2',g:true},{v:98,s:'%',k:'st3',g:false},{v:4.9,s:'★',k:'st4',g:true}];
    const TESTS=[
      {img:'taran1',name:'Taran Ventures',loc:'Electronics, Mogadishu',k:'t1q'},
      {img:'muhin2',name:'Muhin Appliances',loc:'Home Appliances, Hargeisa',k:'t2q'},
      {img:'wardo3',name:'Wardo Fashion',loc:'Clothing, Kismayo',k:'t3q'},
    ];
    const FAQS=[{qk:'fq1',ak:'fa1'},{qk:'fq2',ak:'fa2'},{qk:'fq3',ak:'fa3'},{qk:'fq4',ak:'fa4'}];

    let L='en';

    const T={
      en:{
        'nav.features':'Features','nav.how':'How it works','nav.stories':'Stories','nav.faq':'FAQ','nav.whatsapp':'WhatsApp','nav.register':'Register','nav.registerSoon':'Registration coming soon!',
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
        'chart.sales':'SALES','chart.transactions':'TRANSACTIONS',
        'days':['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
      },
      so:{
        'nav.features':'Muuqaal','nav.how':'Sida ay u shaqeyso','nav.stories':'Sheekooyin','nav.faq':'Su\'aalo','nav.whatsapp':'WhatsApp','nav.register':'Diiwaan geli','nav.registerSoon':'Diiwaan gelinta soon!',
        'hero.eyebrow':'La soco iibka iyo bakhaarka','hero.headline':'Waxaan la soco naa iibkaa, bakhaarka, iyo lacagta macaamiisha ku waaya — taleefankaaga.','hero.sub':'Sahel waxay diiwaan gelisaa iib kasta, waxay ku dhawaaqdaa marka alaabtu yartahay, waxayna kaydisaa liiska kuwa lacag kuu leh. Waxay shaqeynaysaa internet la\'aan oo afkaaga waa Soomaali, Ingiriisi iyo Carabi.','hero.ctaPrimary':'WhatsApp nala soo xiriir','hero.ctaSecondary':'Sida ay u shaqeyso','hero.trust':'2,000+ oo dukaan oo isticmaala Sahel','hero.chartTitle':'Iibka toddobaadkan — taabo maalinta','hero.topProduct':'ALAABTA UGU IIBKA BADAN','hero.revenue':'WADARTA TODDOBAADKA','hero.growth':'TODDOBAADKA HORE',
        'trust.bar':'Dukaanoyin kuwaan isticmaala',
        'features.eyebrow':'Waxaa Sahel sameeyaa','features.title':'Lixdar oo Sahel kuu qabtaa','features.sub':'Waa shaqooyin hadda warqad ama maskaxda ku sameeyso. Sahel waxay sameeyaa si otomaatig ah, sax ah, oo waad la socdi karo taleefankaaga wakhti kasta.',
        'f1t':'Waxay kaydisaa bakhaarka','f1b':'Sahel waxay tirinaysaa waxa soo gelayaa iyo waxa baxaysaa. Marka alaabtu yartahay, waxay ku dhawaaqdaa inta aysan dhammaan.','f2t':'Waxay diiwaan gelisaa iib kasta','f2b':'Marka iibto dhacdo, taabo Sahel. Waxay isku daraysaa dakhligaaga maalinlaha, toddobaadlaha, iyo bisha si otomaatig ah.','f3t':'Waxay muuqataa alaabta ugu iibsata','f3b':'Sahel waxay isla soo qortaa alaabta sida iibka ugu badan. Waxaad arki doontaa waxa lacag geysata iyo waxa aan la iibin.','f4t':'Waxay kaydisaa kharashka','f4b':'Diiwaan geli kirada, korontada, lacag bixinta supplier-ka, iyo kharashga gaadinka. Sahel waxay ka saartaa dakhligaaga si aad u aragto faa\'iidada dhabta ah.','f5t':'Waxay la socotaa dalabka supplier-ka','f5b':'Marka aad supplier-ka ka dalbayso, diiwaan geli Sahel. Waxay la socotaa waxa dalbayso, waqtiga, iyo inay yimaaddo.','f6t':'Waxay xifdisaa xogtaada','f6b':'Xogta iibkaaga iyo macaamiishaaga waxay ku sugan tahay taleefankaaga iyo account-kaaga ammaan ka ah. Qofna ma arki karo.',
        'how.eyebrow':'Bilaow','how.title':'Sadar saddex ah, daqiiqo shan, waad shaqeynaysaa','how.sub':'Wax setup ah, wax video barasho ah. Hadii aad weli WhatsApp diri karto, Sahel waad isticmaali kartaa hadda.',
        's1t':'Geli magacaaga iyo lambaraga taleefanka','s1b':'Sahel waxay weyddiisaa oo keliya. Iimayl, furasho, tixraac xumaan maaha.','s2t':'Qor magaca alaabta iyo qiimaha','s2b':'Kudar alaab halmar, iibi. Kadib kudar mid kale. Wax kasta waa inaad iskugu darin waqtigaas.','s3t':'Taabo si aad u diiwaan geliso iibka','s3b':'Marka macmiil iibo, dooro alaabta oo taabo iibi. Sahel waxay cusbooneysiiyaa bakhaarka iyo dakhliga si otomaatig ah.',
        'st1':'Dukaan isticmaala Sahel','st2':'Dakhli la soco bishan','st3':'Waqtiga shaqeyn','st4':'Qiime muuqalka',
        'testimonials.eyebrow':'Ka isticmaalayaashayada','testimonials.title':'Waxay ganacsatada sheegaan Sahel',
        't1q':'"Waxaan la waashay lacag ceeb ah sababtoo ah waxaan isdilay mid bixiyay iyo midna aan bixin saddex meelood. Sahel waxay xallisey. Hadda iib kasta iyo deyn kasta waa la diiwaan geliyaa. Bishii ugu horeysay waxaan ka soo celiyay $1,800 oo hore paper-ka ku dulsaaray."','t2q':'"Waxaan haynaa 350 nooc oo qalab guriga ah. Tirinta bakhaarka warqad ahaanna ayay ku dhacday Sahel. Saxda bakhaarka waxay ka baxday dhamaan oo waa yaraaday 30% kharashda ku waynaatay."','t3q':'"Dhar business-ka waxay badaltaa jiilaalka. Hore Sahel, waxaan order gelin jiray rajo. Hadda waxaan order geliyaa sida waxa dhabta ah loo iibiyo. Faaiidadaaday waaa korodhay."',
        'faq.eyebrow':'Su\'aalo caadi ah','faq.title':'Jawaabo su\'aalooyin oo nala weydiiyay',
        'fq1':'Sahel ma bilaash bay ahayd?','fa1':'Haa. Diiwaanka iibka, la socodka bakhaarka, iyo liiska deynta macaamiisha waa bilaash.','fq2':'Internet la\'aan ma shaqeyn?','fa2':'Haa. Iib kasta iyo cusboonayn bakhaarka waxay kaydisaa taleefankaaga horta. Marka internet ku soo baxdo, waxay si otomaatig ah u midowdaa.','fq3':'Shaqaalaydu isticmaali karaa?','fa3':'Haa. Waxaad sameysaa account shaqaale kasta. Waxay diiwaan geli karaan iib, oo kaliya aad oo ahaan muhiimka ah ayaad arki doontaa.','fq4':'Xogtayda ma ammaan bay ahayd?','fa4':'Xogtaada waa la xifdiyaa si ammaan ah. Aad oo kaliya ayaa arki karta xogtaaga ganacsiga.',
        'cta.eyebrow':'Bilaash inaad bilaabto','cta.title':'Jooji inaad lacag la waasho deyno daalan iyo daaweyn xumaan.','cta.sub':'WhatsApp nala soo xiriir hadda +252 624 407 283 oo waan ku diyaarinnaa daqiiqado.','cta.button':'WhatsApp nala soo xiriir','cta.secondary':'Eeg muuqaalada',
        'footer.desc':'Sahel waxay diiwaan gelisaa iibkaa, maamulaa bakhaarka, oo la socdaa kuwa lacag kuu leh — taleefankaaga, Soomaali, Ingiriisi, iyo Carabi.','footer.product':'Badeecad','footer.feat':'Muuqaal','footer.how':'Sida ay u shaqeyso','footer.support':'Taageero','footer.help':'Su\'aalo','footer.contact':'WhatsApp Nala Xiriir','footer.tagline':'Laga dhisay ganacsato, oo ganacsato.',
        'chart.sales':'IIBKA','chart.transactions':'DHAQDHAQAAQ',
        'days':['Isniin','Talaada','Arbaco','Khamiis','Jimco','Sabti','Axad'],
      },
      ar:{
        'nav.features':'المميزات','nav.how':'كيف يعمل','nav.stories':'قصص','nav.faq':'أسئلة','nav.whatsapp':'واتساب','nav.register':'إنشاء حساب','nav.registerSoon':'التسجيل قريباً!',
        'hero.eyebrow':'تتبع المبيعات والمخزون','hero.headline':'نسجّل مبيعاتك ومخزونك وديون عملائك — من هاتفك.','hero.sub':'ساهل يسجّل كل عملية بيع، ينبهك عندما ينخفض المخزون، ويحتفظ بقائمة بمن لك عنده دين. يعمل بدون إنترنت ويتكلم بلغتك — الصومالية والإنجليزية والعربية.','hero.ctaPrimary':'تواصل معنا عبر واتساب','hero.ctaSecondary':'كيف يعمل','hero.trust':'يستخدمه أكثر من 2,000 صاحب متجر','hero.chartTitle':'مبيعات الأسبوع — اضغط على يوم','hero.topProduct':'المنتج الأكثر مبيعاً','hero.revenue':'إجمالي الأسبوع','hero.growth':'مقارنة بالأسبوع السابق',
        'trust.bar':'يستخدمه هذه المتاجر',
        'features.eyebrow':'ماذا يفعل ساهل','features.title':'ستة أشياء يتعامل معها ساهل','features.sub':'هذه المهام التي تقوم بها حالياً على الورق أو في رأسك. ساهل يقوم بها تلقائياً ويمكنك مراجعتها أي وقت من هاتفك.',
        'f1t':'يسجّل مخزونك','f1b':'ساهل يحسب ما يدخل وما يخرج. عندما ينخفض منتج، يرسل لك تنبيهاً قبل أن تنفذ الكمية.','f2t':'يسجّل كل عملية بيع','f2b':'كلما بعت شيئاً، اضغط عليه في ساهل. يجمع إيراداتك اليومية والأسبوعية والشهرية تلقائياً.','f3t':'يُظهر أكثر المنتجات مبيعاً','f3b':'ساهل يرتب منتجاتك حسب الأكثر مبيعاً. ترى أي المنتجات تجلب المال وأيها لا تتحرك.','f4t':'يسجّل مصروفاتك','f4b':'سجّل الإيجار والكهرباء ودفعات الموردين وتكاليف النقل. ساهل يطرحها من إيراداتك فترى الربح الحقيقي.','f5t':'يتتبع طلبات الموردين','f5b':'عندما تطلب من مورد، سجّله في ساهل. يتتبع ما طلبته وموعد الاستلام وهل وصل.','f6t':'يحافظ على خصوصية بياناتك','f6b':'بيانات مبيعاتك وعملائك تبقى على هاتفك وحسابك الآمن. لا أحد غيرك يمكنه رؤيتها.',
        'how.eyebrow':'ابدأ الآن','how.title':'ثلاث خطوات، خمس دقائق، أنت تعمل','how.sub':'بدون معالج إعداد. بدون فيديوهات تدريب. إذا أرسلت رسالة واتساب من قبل، يمكنك استخدام ساهل الآن.',
        's1t':'أدخل اسمك ورقم هاتفك','s1b':'هذا كل ما يطلبه ساهل. بدون بريد إلكتروني، بدون كلمة مرور.','s2t':'اكتب اسم المنتج وسعره','s2b':'أضف منتجاً واحداً وابدأ البيع. لا تحتاج لإعداد كل شيء مرة واحدة.','s3t':'اضغط لتسجيل عملية بيع','s3b':'عندما يشتري عميل شيئاً، اختر المنتج واضغط بيع. ساهل يحدّث مخزونك وإيراداتك تلقائياً.',
        'st1':'متجر يستخدم ساهل','st2':'إيرادات متتبعة شهرياً','st3':'وقت التشغيل','st4':'تقييم المستخدمين',
        'testimonials.eyebrow':'من مستخدمينا','testimonials.title':'ماذا يقول أصحاب المتاجر عن ساهل',
        't1q':'"كنا نخسر المال لأننا كنا ننسى من دفع ومن لم يدفع عبر ثلاثة فروع. ساهل حلّ هذه المشكلة. الآن كل عملية بيع وكل دين مسجّل. استرددنا 1,800 دولار في الشهر الأول."','t2q':'"لدينا 350 موديل جهاز منزلي. عد المخزون على الورق كان مستحيلاً. ساهل يتتبع كل شيء. دقة المخزون انتقلت من التخمين إلى شبه الكمال."','t3q':'"مخزون الأزياء يتغير كل موسم. قبل ساهل، كنت أطلب بناءً على الحدس. الآن أطلب بناءً على ما يُباع فعلاً. تحسنت هوامش ربحي."',
        'faq.eyebrow':'أسئلة شائعة','faq.title':'إجابات على الأسئلة الشائعة',
        'fq1':'هل ساهل مجاني؟','fa1':'نعم. تسجيل المبيعات وتتبع المخزون وقائمة ديون العملاء مجاني وسيبقى مجانياً.','fq2':'هل يعمل بدون إنترنت؟','fa2':'نعم. كل عملية بيع وتحديث مخزون يُحفظ على هاتفك أولاً. عندما يتصل هاتفك بالإنترنت مرة أخرى، يتزامن كل شيء تلقائياً.','fq3':'هل يمكن لموظفيّ استخدامه؟','fa3':'نعم. تنشئ حسابات لموظفيك. يمكنهم تسجيل المبيعات، لكنك أنت فقط ترى الصورة المالية الكاملة.','fq4':'هل بياناتي آمنة؟','fa4':'بياناتك مشفرة ومخزنة بأمان. أنت فقط يمكنك الوصول إلى سجلات عملك.',
        'cta.eyebrow':'مجاني للبدء','cta.title':'توقف عن خسارة المال بسبب الديون المنسية والسجلات الفوضوية.','cta.sub':'تواصل معنا عبر واتساب الآن على +252 624 407 283 وسنُعدّك في دقائق.','cta.button':'تواصل معنا عبر واتساب','cta.secondary':'شاهد المميزات',
        'footer.desc':'ساهل يسجّل مبيعاتك، يدير مخزونك، ويتتبع من لك عنده دين — من هاتفك، بالصومالية والإنجليزية والعربية.','footer.product':'المنتج','footer.feat':'المميزات','footer.how':'كيف يعمل','footer.support':'الدعم','footer.help':'أسئلة شائعة','footer.contact':'تواصل عبر واتساب','footer.tagline':'صُنع لأصحاب المتاجر، من أصحاب المتاجر.',
        'chart.sales':'المبيعات','chart.transactions':'العمليات',
        'days':['الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت','الأحد'],
      },
    };

    function t(k){return T[L]?.[k]||T.en[k]||k;}

    function applyTranslations(){
      document.querySelectorAll('[data-t]').forEach(el=>{
        const k=el.getAttribute('data-t');
        const v=T[L]?.[k];
        if(v!==undefined){
          el.textContent=v;
          if(L==='ar')el.classList.add('lang-ar');
          else el.classList.remove('lang-ar');
        }
      });
    }

    function setLang(lang){
      L=lang;
      applyTranslations();
      splitText();
      document.getElementById('lang-en').className=`lang-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${lang==='en'?'bg-ink text-cream':'text-slate-faint hover:text-ink'}`;
      document.getElementById('lang-so').className=`lang-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${lang==='so'?'bg-ink text-cream':'text-slate-faint hover:text-ink'}`;
      document.getElementById('lang-ar').className=`lang-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 lang-ar ${lang==='ar'?'bg-ink text-cream':'text-slate-faint hover:text-ink'}`;
      document.documentElement.lang=lang;
      document.documentElement.dir=lang==='ar'?'rtl':'ltr';
      if(selectedBar>=0)selectBar(selectedBar);
    }

    let selectedBar=-1;

    function buildChart(){
      const c=document.getElementById('chart-container');
      const mx=Math.max(...CHART.map(d=>d.sales));
      CHART.forEach((d,i)=>{
        const pct=(d.sales/mx)*100;
        const op=.15+(i/(CHART.length-1))*.85;
        const w=document.createElement('div');
        w.className='chart-bar-wrap';w.dataset.index=i;
        w.style.opacity='0';w.style.transform='translateY(20px)';
        w.style.transition=`all .5s cubic-bezier(.22,1,.36,1) ${i*.08}s`;
        w.innerHTML=`<div class="chart-bar-inner" style="height:${pct}%;background:#15203B;opacity:${op}"><div class="bar-tip">$${d.sales.toLocaleString()}</div></div><span class="chart-day">${d.day}</span>`;
        w.addEventListener('click',()=>selectBar(i));
        c.appendChild(w);
      });
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('class','absolute inset-0 w-full h-full pointer-events-none');
      svg.setAttribute('viewBox','0 0 280 200');svg.setAttribute('preserveAspectRatio','none');
      const pts=CHART.map((d,i)=>{const x=20+(i/(CHART.length-1))*240;const y=200-(d.sales/mx)*190-5;return`${x},${y}`;}).join(' ');
      const lp=pts.split(' ').pop();
      svg.innerHTML=`<polyline fill="none" stroke="#F2C14E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${pts}"/><circle cx="${lp.split(',')[0]}" cy="${lp.split(',')[1]}" r="4" fill="#F2C14E"/>`;
      c.appendChild(svg);
    }

    function selectBar(i){
      selectedBar=i;
      const d=CHART[i];
      document.querySelectorAll('.chart-bar-wrap').forEach((w,j)=>{
        w.classList.toggle('selected',j===i);
        const inner=w.querySelector('.chart-bar-inner');
        if(j===i){inner.style.background='#15203B';inner.style.opacity='1';}
        else{inner.style.opacity=.15+(j/(CHART.length-1))*.85;}
      });
      const days=T[L].days||T.en.days;
      document.getElementById('detail-day-label').textContent=d.day.toUpperCase();
      document.getElementById('detail-day-name').textContent=days[i];
      document.getElementById('detail-sales-label').textContent=t('chart.sales');
      document.getElementById('detail-sales-value').textContent='$'+d.sales.toLocaleString();
      document.getElementById('detail-tx-label').textContent=t('chart.transactions');
      document.getElementById('detail-tx-value').textContent=d.tx;
      document.getElementById('stat-top-product').textContent=d.product;
      document.getElementById('chart-detail').classList.add('open');
    }

    function animateChart(){document.querySelectorAll('.chart-bar-wrap').forEach((b,i)=>{setTimeout(()=>{b.style.opacity='1';b.style.transform='translateY(0)';},i*80);});}

    function buildFeatures(){
      document.getElementById('features-grid').innerHTML=FEATS.map((f,i)=>`
        <div class="anim-up ${i>0?'anim-up-delay-'+Math.min(i,5):''} card-shine tool-card group bg-white rounded-2xl border border-border p-8 hover:border-ink/20 hover:-translate-y-2 hover:shadow-2xl hover:shadow-ink/[0.08] transition-all duration-300">
          <div class="feat-icon w-12 h-12 bg-ink rounded-2xl flex items-center justify-center mb-6"><i data-lucide="${f.icon}" class="w-5 h-5 text-gold"></i></div>
          <h3 class="font-serif text-xl font-bold text-ink mb-3" data-t="${f.k[0]}">${t(f.k[0])}</h3>
          <p class="text-sm text-slate-light leading-relaxed" data-t="${f.k[1]}">${t(f.k[1])}</p>
        </div>`).join('');
    }

    function buildSteps(){
      document.getElementById('steps-grid').innerHTML=STEPS.map((s,i)=>`
        <div class="anim-up ${i>0?'anim-up-delay-'+i:''} relative text-center">
          <div class="relative inline-flex items-center justify-center w-20 h-20 bg-cream rounded-3xl border-2 border-border mb-8">
            <i data-lucide="${s.icon}" class="w-8 h-8 text-ink"></i>
            <span class="absolute -top-3 -right-3 w-8 h-8 bg-gold text-ink rounded-full flex items-center justify-center text-sm font-extrabold shadow-lg shadow-gold/30">${s.n}</span>
          </div>
          <h3 class="font-serif text-xl font-bold text-ink mb-3" data-t="${s.k[0]}">${t(s.k[0])}</h3>
          <p class="text-sm text-slate-light leading-relaxed max-w-xs mx-auto" data-t="${s.k[1]}">${t(s.k[1])}</p>
          ${i<STEPS.length-1?`<svg class="hidden md:block absolute top-10 left-[60%] w-[80%] h-2" viewBox="0 0 200 8"><line x1="0" y1="4" x2="200" y2="4" stroke="#EAE3D3" stroke-width="2" stroke-dasharray="8 6" class="step-line"/></svg>`:''}
        </div>`).join('');
    }

    function buildStats(){
      document.getElementById('stats-grid').innerHTML=STATS.map((s,i)=>`
        <div class="anim-up ${i>0?'anim-up-delay-'+i:''} stat-bar text-center pb-4">
          <p class="text-4xl md:text-5xl font-bold ${s.g?'text-gold':'text-cream'} font-serif mb-2">
            <span class="counter" data-target="${s.v}" data-prefix="${s.p||''}" data-suffix="${s.s}">${s.p||''}0${s.s}</span>
          </p>
          <p class="text-sm text-cream/50 font-medium" data-t="${s.k}">${t(s.k)}</p>
        </div>`).join('');
    }

    function buildTestimonials(){
      document.getElementById('testimonials-grid').innerHTML=TESTS.map((tm,i)=>`
        <div class="anim-up ${i>0?'anim-up-delay-'+i:''} bg-white rounded-2xl border border-border p-8 hover:shadow-xl hover:shadow-ink/[0.06] hover:-translate-y-1 transition-all duration-300">
          <div class="flex items-center gap-1 text-gold-dim mb-5">${'<i data-lucide="star" class="w-4 h-4 fill-current"></i>'.repeat(5)}</div>
          <p class="text-slate leading-relaxed mb-6" data-t="${tm.k}">${t(tm.k)}</p>
          <div class="flex items-center gap-3 pt-5 border-t border-border">
            <img src="https://picsum.photos/seed/${tm.img}/48/48.jpg" class="w-11 h-11 rounded-full object-cover" alt="" />
            <div><p class="text-sm font-bold text-ink">${tm.name}</p><p class="text-xs text-slate-faint">${tm.loc}</p></div>
          </div>
        </div>`).join('');
    }

    function buildFAQ(){
      document.getElementById('faq-list').innerHTML=FAQS.map((f,i)=>`
        <div class="anim-up ${i>0?'anim-up-delay-'+i:''} faq-item bg-white rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:border-ink/10">
          <button onclick="toggleFaq(this)" class="w-full flex items-center justify-between px-6 py-5 text-left group">
            <span class="text-sm font-bold text-ink pr-4 group-hover:text-ink-light transition-colors" data-t="${f.qk}">${t(f.qk)}</span>
            <i data-lucide="chevron-down" class="w-5 h-5 text-slate-faint flex-shrink-0 transition-transform duration-300 faq-chevron"></i>
          </button>
          <div class="faq-answer"><p class="px-6 pb-5 text-sm text-slate-light leading-relaxed" data-t="${f.ak}">${t(f.ak)}</p></div>
        </div>`).join('');
    }

    function toggleFaq(btn){
      const item=btn.closest('.faq-item');
      const ans=item.querySelector('.faq-answer');
      const chev=item.querySelector('.faq-chevron');
      const isOpen=ans.style.maxHeight&&ans.style.maxHeight!=='0px';
      document.querySelectorAll('.faq-answer').forEach(a=>a.style.maxHeight='0px');
      document.querySelectorAll('.faq-chevron').forEach(c=>c.style.transform='rotate(0deg)');
      document.querySelectorAll('.faq-item').forEach(i=>{i.classList.remove('border-ink/20');i.classList.add('border-border');});
      if(!isOpen){ans.style.maxHeight=ans.scrollHeight+'px';chev.style.transform='rotate(180deg)';item.classList.remove('border-border');item.classList.add('border-ink/20');}
    }

    function animateCounters(){
      document.querySelectorAll('.counter').forEach(el=>{
        if(el.dataset.done)return;const tgt=parseFloat(el.dataset.target);const pre=el.dataset.prefix||'';const suf=el.dataset.suffix||'';const fl=tgt%1!==0;const dur=2000;const st=performance.now();el.dataset.done='1';
        function tk(n){const e=n-st;const p=Math.min(e/dur,1);const ea=1-Math.pow(1-p,4);const c=tgt*ea;el.textContent=pre+(fl?c.toFixed(1):Math.floor(c).toLocaleString())+suf;if(p<1)requestAnimationFrame(tk);}
        requestAnimationFrame(tk);
      });
    }

    function splitText(){
      const el=document.getElementById('hero-headline');
      const txt=t('hero.headline');el.innerHTML='';let ci=0;
      for(const ch of txt){const s=document.createElement('span');s.className='split-char';s.style.animationDelay=(ci*.018+.3)+'s';s.textContent=ch===' '?'\u00A0':ch;el.appendChild(s);ci++;}
    }

    function showToast(m){const el=document.getElementById('toast');document.getElementById('toast-msg').textContent=m;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3000);}
    function toggleMobile(){document.getElementById('mobile-menu').classList.toggle('open');}

    const cg=document.getElementById('cursor-glow');let mx=0,my=0,gx=0,gy=0,rafId=null,glowActive=true;
    function onMouseMoveGlow(e){mx=e.clientX;my=e.clientY;}
    document.addEventListener('mousemove',onMouseMoveGlow);
    function ug(){if(!glowActive)return;gx+=(mx-gx)*.08;gy+=(my-gy)*.08;if(cg){cg.style.left=gx+'px';cg.style.top=gy+'px';}rafId=requestAnimationFrame(ug);}ug();

    function onMouseMoveMagnet(e){
      document.querySelectorAll('.mag-btn').forEach(btn=>{
        const r=btn.getBoundingClientRect();const cx=r.left+r.width/2;const cy=r.top+r.height/2;
        const dx=(e.clientX-cx)/r.width;const dy=(e.clientY-cy)/r.height;const d=Math.sqrt(dx*dx+dy*dy);
        if(d<1.5)btn.style.transform=`translate(${dx*4}px,${dy*4}px)`;else btn.style.transform='';
      });
    }
    document.addEventListener('mousemove',onMouseMoveMagnet);

    function onScroll(){
      const h=document.documentElement;
      const sp=document.getElementById('scroll-progress');
      if(sp)sp.style.width=((h.scrollTop/(h.scrollHeight-h.clientHeight))*100)+'%';
      const nb=document.getElementById('navbar');
      if(!nb)return;
      if(window.scrollY>20){nb.style.borderBottom='1px solid #EAE3D3';nb.style.boxShadow='0 4px 20px rgba(21,32,59,0.06)';}
      else{nb.style.borderBottom='none';nb.style.boxShadow='none';}
    }
    window.addEventListener('scroll',onScroll);

    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');if(e.target.closest('#stats-section'))animateCounters();e.target.querySelectorAll('.step-line').forEach(l=>l.classList.add('visible'));}});
    },{threshold:.15,rootMargin:'0px 0px -30px 0px'});

    function init(){
      document.getElementById('favicon').href=LOGO;
      document.querySelectorAll('.brand-logo-img').forEach(img=>img.src=LOGO);
      buildChart();buildFeatures();buildSteps();buildStats();buildTestimonials();buildFAQ();splitText();
      const total=CHART.reduce((s,d)=>s+d.sales,0);
      document.getElementById('stat-week-total').textContent='$'+total.toLocaleString();
      lucide.createIcons();
      setTimeout(()=>{
        document.querySelectorAll('.anim-up, .anim-scale, .stat-bar').forEach(el=>obs.observe(el));
        animateChart();
      },50);
    }

    function ensureLucideThenInit(){
      if(window.lucide){init();return;}
      const existing=document.querySelector('script[data-lucide-loader]');
      if(existing){existing.addEventListener('load',init);return;}
      const s=document.createElement('script');
      s.src='https://unpkg.com/lucide@latest';
      s.setAttribute('data-lucide-loader','true');
      s.onload=init;
      document.body.appendChild(s);
    }
    ensureLucideThenInit();

    return function cleanup(){
      glowActive=false;
      if(rafId)cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove',onMouseMoveGlow);
      document.removeEventListener('mousemove',onMouseMoveMagnet);
      window.removeEventListener('scroll',onScroll);
      obs.disconnect();
    };
  
  }, []);

  return (
    <div
      className="bg-cream text-ink font-sans antialiased overflow-x-hidden"
      dangerouslySetInnerHTML={{ __html: BODY_HTML }}
    />
  );
}
