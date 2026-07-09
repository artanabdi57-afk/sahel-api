<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sahel — Business Knowledge Base</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,200;0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,900;1,9..40,400&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            display: ['"Space Grotesk"', 'sans-serif'],
            body: ['"DM Sans"', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <style>
    :root {
      --bg: #0C0F0A;
      --bg-elevated: #151A12;
      --card: #1A2016;
      --card-hover: #212B1C;
      --border: #2A3625;
      --border-light: #3A4A33;
      --fg: #E8EDE5;
      --fg-muted: #8A9A82;
      --fg-dim: #5C6B56;
      --accent: #C8E64E;
      --accent-dim: rgba(200, 230, 78, 0.12);
      --accent-glow: rgba(200, 230, 78, 0.25);
      --danger: #E64E4E;
      --tag-bg: rgba(200, 230, 78, 0.08);
    }

    * { box-sizing: border-box; }

    body {
      background: var(--bg);
      color: var(--fg);
      font-family: 'DM Sans', sans-serif;
      margin: 0;
      min-height: 100vh;
    }

    /* Atmospheric background */
    .bg-atmosphere {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
    }
    .bg-atmosphere::before {
      content: '';
      position: absolute;
      top: -30%;
      left: -10%;
      width: 60vw;
      height: 60vw;
      background: radial-gradient(circle, rgba(200,230,78,0.06) 0%, transparent 70%);
      animation: floatBlob 20s ease-in-out infinite;
    }
    .bg-atmosphere::after {
      content: '';
      position: absolute;
      bottom: -20%;
      right: -15%;
      width: 50vw;
      height: 50vw;
      background: radial-gradient(circle, rgba(200,230,78,0.04) 0%, transparent 70%);
      animation: floatBlob 25s ease-in-out infinite reverse;
    }
    @keyframes floatBlob {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(5%, -8%) scale(1.05); }
      66% { transform: translate(-3%, 5%) scale(0.95); }
    }

    /* Noise texture overlay */
    .noise-overlay {
      position: fixed;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      opacity: 0.03;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--border-light); }

    /* Card transitions */
    .topic-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
    }
    .topic-card:hover {
      background: var(--card-hover);
      border-color: var(--border-light);
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px var(--border-light);
    }
    .topic-card.active {
      border-color: var(--accent);
      box-shadow: 0 0 24px var(--accent-glow), 0 8px 32px rgba(0,0,0,0.3);
    }

    /* Question item */
    .question-item {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .question-item:hover {
      border-color: var(--border-light);
    }
    .question-item.open {
      border-color: var(--accent);
      box-shadow: 0 4px 20px var(--accent-dim);
    }

    /* Answer panel */
    .answer-panel {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease;
    }
    .answer-panel.open {
      max-height: 800px;
    }

    /* Answer bullet points */
    .answer-bullet {
      position: relative;
      padding-left: 20px;
      margin-bottom: 12px;
      line-height: 1.7;
      color: var(--fg);
    }
    .answer-bullet::before {
      content: '';
      position: absolute;
      left: 0;
      top: 10px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent);
    }

    /* Language toggle */
    .lang-toggle {
      position: relative;
      display: flex;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
    }
    .lang-btn {
      padding: 8px 18px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: var(--fg-muted);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.25s ease;
      position: relative;
      z-index: 1;
    }
    .lang-btn.active {
      color: var(--bg);
    }
    .lang-slider {
      position: absolute;
      top: 2px;
      bottom: 2px;
      border-radius: 8px;
      background: var(--accent);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 0;
    }

    /* Search input */
    .search-wrap {
      position: relative;
    }
    .search-wrap input {
      width: 100%;
      padding: 14px 18px 14px 48px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      color: var(--fg);
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      outline: none;
      transition: all 0.3s ease;
    }
    .search-wrap input::placeholder {
      color: var(--fg-dim);
    }
    .search-wrap input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-dim);
    }
    .search-wrap .search-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--fg-dim);
      font-size: 16px;
      transition: color 0.3s ease;
    }
    .search-wrap input:focus + .search-icon,
    .search-wrap input:focus ~ .search-icon {
      color: var(--accent);
    }

    /* Tag badge */
    .tag-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 12px;
      background: var(--tag-bg);
      border: 1px solid rgba(200,230,78,0.15);
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      color: var(--accent);
      letter-spacing: 0.3px;
    }

    /* Count badge */
    .count-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 26px;
      height: 26px;
      padding: 0 8px;
      background: var(--accent-dim);
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      color: var(--accent);
    }

    /* Chevron rotation */
    .chevron {
      transition: transform 0.3s ease;
      color: var(--fg-dim);
    }
    .question-item.open .chevron {
      transform: rotate(180deg);
      color: var(--accent);
    }

    /* Fade in animation */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-up {
      animation: fadeUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      opacity: 0;
    }

    /* Stagger children */
    .stagger > * { opacity: 0; animation: fadeUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
    .stagger > *:nth-child(1) { animation-delay: 0.05s; }
    .stagger > *:nth-child(2) { animation-delay: 0.1s; }
    .stagger > *:nth-child(3) { animation-delay: 0.15s; }
    .stagger > *:nth-child(4) { animation-delay: 0.2s; }
    .stagger > *:nth-child(5) { animation-delay: 0.25s; }
    .stagger > *:nth-child(6) { animation-delay: 0.3s; }
    .stagger > *:nth-child(7) { animation-delay: 0.35s; }
    .stagger > *:nth-child(8) { animation-delay: 0.4s; }
    .stagger > *:nth-child(9) { animation-delay: 0.45s; }

    /* No results */
    .no-results {
      text-align: center;
      padding: 60px 20px;
      color: var(--fg-dim);
    }
    .no-results i {
      font-size: 48px;
      margin-bottom: 16px;
      display: block;
      color: var(--border-light);
    }

    /* Header glow line */
    .glow-line {
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--accent), transparent);
      opacity: 0.3;
    }

    /* Back to top button */
    .back-to-top {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--card);
      border: 1px solid var(--border);
      color: var(--fg-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 50;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
      pointer-events: none;
    }
    .back-to-top.visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
    .back-to-top:hover {
      background: var(--accent);
      color: var(--bg);
      border-color: var(--accent);
    }

    /* RTL support for Somali */
    [dir="rtl"] .answer-bullet { padding-left: 0; padding-right: 20px; }
    [dir="rtl"] .answer-bullet::before { left: auto; right: 0; }
    [dir="rtl"] .search-wrap input { padding: 14px 48px 14px 18px; }
    [dir="rtl"] .search-wrap .search-icon { left: auto; right: 16px; }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
      }
    }

    /* Mobile adjustments */
    @media (max-width: 768px) {
      .topic-grid { grid-template-columns: 1fr !important; }
      .hero-title { font-size: 2rem !important; }
    }
  </style>
</head>
<body>
  <div class="bg-atmosphere"></div>
  <div class="noise-overlay"></div>

  <div style="position:relative; z-index:2;">
    <!-- Header -->
    <header class="sticky top-0 z-40" style="background: rgba(12,15,10,0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);">
      <div class="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div style="width:36px; height:36px; background:var(--accent); border-radius:10px; display:flex; align-items:center; justify-content:center;">
            <i class="fa-solid fa-seedling" style="color:var(--bg); font-size:16px;"></i>
          </div>
          <span class="font-display font-bold text-lg" style="color:var(--fg);">Sahel</span>
        </div>
        <div class="flex items-center gap-4">
          <!-- Language Toggle -->
          <div class="lang-toggle" id="langToggle" role="tablist" aria-label="Language selection">
            <div class="lang-slider" id="langSlider"></div>
            <button class="lang-btn active" data-lang="en" role="tab" aria-selected="true" onclick="setLang('en')">EN</button>
            <button class="lang-btn" data-lang="so" role="tab" aria-selected="false" onclick="setLang('so')">SO</button>
          </div>
        </div>
      </div>
      <div class="glow-line"></div>
    </header>

    <main class="max-w-5xl mx-auto px-5 pb-24">
      <!-- Hero Section -->
      <section class="pt-16 pb-12 text-center fade-up">
        <div class="tag-badge mx-auto mb-6" style="width:fit-content;">
          <i class="fa-solid fa-book-open" style="font-size:11px;"></i>
          <span id="heroTag">Knowledge Base</span>
        </div>
        <h1 class="font-display font-bold hero-title" id="heroTitle" style="font-size:2.75rem; line-height:1.15; color:var(--fg); max-width:640px; margin:0 auto 16px;">
          Answers for Somali Business Owners
        </h1>
        <p class="font-body" id="heroSub" style="font-size:17px; color:var(--fg-muted); max-width:520px; margin:0 auto 32px; line-height:1.6;">
          Practical guidance on starting, running, and growing your shop — in your language.
        </p>

        <!-- Search -->
        <div class="search-wrap max-w-lg mx-auto">
          <input
            type="text"
            id="searchInput"
            autocomplete="off"
            aria-label="Search questions"
            oninput="handleSearch(this.value)"
          >
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
        </div>
      </section>

      <!-- Topic Filter Tabs -->
      <section class="mb-8 fade-up" style="animation-delay:0.15s;">
        <div class="flex flex-wrap items-center gap-3 justify-center" id="topicTabs" role="tablist" aria-label="Topic filter">
          <!-- Rendered by JS -->
        </div>
      </section>

      <!-- Results count -->
      <div class="flex items-center justify-between mb-6" style="min-height:28px;">
        <p id="resultsCount" class="text-sm font-body" style="color:var(--fg-dim);"></p>
      </div>

      <!-- Questions List -->
      <section id="questionsList" class="space-y-4 stagger" role="list" aria-label="Questions">
        <!-- Rendered by JS -->
      </section>

      <!-- No Results -->
      <div id="noResults" class="no-results" style="display:none;">
        <i class="fa-regular fa-face-meh"></i>
        <p class="text-lg font-semibold mb-2" id="noResultsTitle" style="color:var(--fg-muted);">No matching questions</p>
        <p id="noResultsSub" style="color:var(--fg-dim);">Try a different search term or browse all topics.</p>
      </div>
    </main>

    <!-- Footer -->
    <footer style="border-top:1px solid var(--border); background:var(--bg-elevated);">
      <div class="max-w-5xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm" style="color:var(--fg-dim);">
          <span class="font-display font-semibold" style="color:var(--fg-muted);">Sahel</span> — Shop management built for Somalia
        </p>
        <div class="flex items-center gap-5">
          <a href="#" class="text-sm hover:underline" style="color:var(--fg-dim); transition:color 0.2s;" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--fg-dim)'">Privacy</a>
          <a href="#" class="text-sm hover:underline" style="color:var(--fg-dim); transition:color 0.2s;" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--fg-dim)'">Terms</a>
          <a href="#" class="text-sm hover:underline" style="color:var(--fg-dim); transition:color 0.2s;" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--fg-dim)'">Contact</a>
        </div>
      </div>
    </footer>
  </div>

  <!-- Back to top -->
  <button class="back-to-top" id="backToTop" onclick="window.scrollTo({top:0,behavior:'smooth'})" aria-label="Back to top">
    <i class="fa-solid fa-arrow-up" style="font-size:14px;"></i>
  </button>

  <script type="module">
    /* ── Data ─────────────────────────────────────────── */
    const topics = [
      {
        slug: "starting-a-business",
        label: { en: "Starting a Business", so: "Bilaabista Ganacsi" },
        icon: "fa-solid fa-rocket",
        questions: [
          {
            slug: "business-with-10000-somalia",
            q: {
              en: "What business can I start with $10,000 in Somalia?",
              so: "Ganacsi noocee ah ayaan kula bilaabi karaa $10,000 Soomaaliya?"
            },
            a: {
              en: [
                "With $10,000, retail and trade businesses tend to offer the fastest path to steady income — a general shop, a mobile money agent stand, or a small import/wholesale operation for household goods.",
                "The biggest cost is usually stock, not rent. Start with a smaller, well-chosen inventory of fast-moving items rather than spreading capital thin across too many products.",
                "Whatever you start, track every sale and every customer credit from day one. Businesses that keep clean records are far easier to grow, get a loan for, or hand off to staff later."
              ],
              so: [
                "$10,000, ganacsiyada tafaariiqda iyo ganacsiga waxay caadi ahaan bixiyaan jidka ugu dhaqsaha badan ee dakhli joogto ah — dukaan guud, taagitaan wakiil lacag-mobil ah, ama shaqo yar oo soo dejin/jumlo ah oo alaabta guriga ah.",
                "Kharashka ugu weyn caadi ahaan waa alaabta, ma aha kirada. Ku bilow keyd yar oo si fiican loo doortay oo alaab si degdeg ah u iibsan karta, halkii aad raasumaalka ku kala qaybin lahayd alaabo aad u badan.",
                "Wax kastoo aad bilowdo, la soco iib kasta iyo deyn kasta oo macmiil maalinta koowaad. Ganacsiyada diiwaanka nadiifka ah haysta ayaa aad ugu fudud koritaanka, deyn helitaanka, ama ka wareejinta shaqaalaha mustaqbalka."
              ]
            }
          },
          {
            slug: "fastest-way-to-start-selling-mogadishu",
            q: {
              en: "What's the fastest way to start selling in Mogadishu?",
              so: "Waa maxay habka ugu dhaqsaha badan ee lagu bilaabi karo iib Muqdisho?"
            },
            a: {
              en: [
                "Renting a small stall or shop space in an existing market is usually faster than building a standalone shop — foot traffic is already there.",
                "Buy your opening stock from local wholesalers rather than importing directly at first; it's slower to set up supply relationships, but you can start selling within days.",
                "Set up a simple way to track sales and customer credit immediately, even on paper, so you're not starting from scratch once you're busy."
              ],
              so: [
                "Kirayn kaydin yar ama meel dukaan oo suuq hore u jira ka dhex ah ayaa caadi ahaan ka dhaqsi badan dhisidda dukaan gaar ah — dadka soo maraa ayaa hore u jooga.",
                "Ka iibso keydkaaga furitaanka ganacsatada jumlada ee maxaliga ah halkii aad si toos ah u soo dejin lahayd marka hore; xiriirka bixiyeyaasha waa mid gaabin karta, laakiin waxaad bilaabi kartaa iibka maalmo gudahood.",
                "Samee hab fudud oo lagu la socdo iibka iyo deynta macaamiisha isla markiiba, xitaa warqad, si aadan uga bilaabin bilaash marka aad mashquul noqoto."
              ]
            }
          },
          {
            slug: "business-license-somalia-small-shop",
            q: {
              en: "Do I need a business license to open a small shop in Somalia?",
              so: "Ma u baahanahay laysan ganacsi si aan dukaan yar ugu furo Soomaaliya?"
            },
            a: {
              en: [
                "Requirements vary by region and municipality, so it's worth checking with your local district office before opening.",
                "Many small shops operate informally at first, but registering early makes it easier to open a bank account, get supplier credit, or apply for a loan later.",
                "If you're unsure where to start, local business associations or your municipal office can usually point you to the right registration process."
              ],
              so: [
                "Shuruudaha way ku kala duwan yihiin gobolka iyo degmada, marka waa faa'iido inaad la xiriirto xafiiska degmada hortaa inta aadan furin.",
                "Dukaamo badan oo yaryar ayaa markii hore si aan rasmi ahayn u shaqeeya, laakiin diiwaan gelinta hore ayaa ka dhigaysa mid fudud furitaanka akoonka bangiga, helitaanka deyn bixiye, ama codsiga deyn mustaqbalka.",
                "Haddii aadan hubin meesha aad ka bilaabayso, ururrada ganacsiga maxaliga ah ama xafiiska degmadaadu waxay kuu tilmaami karaan habka diiwaan gelinta saxda ah."
              ]
            }
          }
        ]
      },
      {
        slug: "shop-management-tools",
        label: { en: "Shop Management Tools", so: "Qalabka Maaraynta Dukaanka" },
        icon: "fa-solid fa-boxes-stacked",
        questions: [
          {
            slug: "choosing-shop-management-software",
            q: {
              en: "How to choose the right shop management software for my business",
              so: "Sida loo doorto software-ka maaraynta dukaanka ee ku habboon ganacsigayga"
            },
            a: {
              en: [
                "Look for software that keeps working during internet outages and syncs automatically when you're back online — connectivity in Somalia isn't always reliable.",
                "Make sure it tracks customer credit (deyn), not just full-price sales. Most shop owners extend credit regularly, and software that ignores this misses half the picture.",
                "Check for mobile money support — EVC Plus, eDahab, and WaafiPay — so payments don't need manual reconciliation.",
                "Somali-language support matters for daily use by staff, not just for marketing screenshots.",
                "Sahel was built around exactly these realities: offline-friendly syncing, credit tracking, mobile money integration, and multilingual support in one app."
              ],
              so: [
                "Raadi software sii wada shaqeynaya markay internetku go'o oo si toos ah isugu xira marka aad mar kale online noqoto — xiriirka internetka Soomaaliya had iyo jeer ma aha mid la isku halayn karo.",
                "Hubi inuu la socdo deynta macmiilka (deyn), ee aanu ahayn kaliya iibka qiimaha buuxa. Ganacsato badan ayaa si joogto ah deyn u siiya, softwareka iska indhatiraana wax badan ayuu ka maqan yahay.",
                "Hubi taageerada lacagta mobilka — EVC Plus, eDahab, iyo WaafiPay — si lacag-bixinta aan loo baahnayn xisaabin gacanta.",
                "Taageerada luqadda Soomaaliga ayaa muhiim u ah isticmaalka maalinlaha ah ee shaqaalaha, ee aan ahayn kaliya sawirrada suuqgeynta.",
                "Sahel waxaa loo dhisay xaqiiqooyinkan sax ah: isku-xirid offline-ku shaqeeya, la socodka deynta, isku-dhafka lacagta mobilka, iyo taageero luqado badan oo app kaliya ah."
              ]
            }
          },
          {
            slug: "shop-software-without-internet",
            q: {
              en: "Does shop software work without steady internet?",
              so: "Software-ka dukaanku ma shaqeeyaa iyada oo aan internet joogto ahayn?"
            },
            a: {
              en: [
                "Good shop software should let you keep recording sales even when you're offline, then sync everything automatically once connectivity returns.",
                "This matters most for daily sales entry — if software requires a live connection for every transaction, it becomes unusable during outages.",
                "Sahel is designed to keep working through spotty connections, so a slow network day doesn't mean a day of paper receipts."
              ],
              so: [
                "Software dukaan oo wanaagsan waa inuu kuu ogolaadaa inaad sii duubto iibka xitaa markaad offline tahay, ka dibna si toos ah isugu xiro marka xiriirku soo noqdo.",
                "Tani waxay ugu muhiimsan tahay gelinta iibka maalinlaha ah — haddii softwareku u baahdo xiriir toos ah dhaqdhaqaaq kasta, wuu noqonayaa mid aan la isticmaali karin waqtiga internetku go'o.",
                "Sahel waxaa loo dhisay inuu sii shaqeeyo xiriirro liita, sidaas darteed maalin network-kiisu tabar yahay macnaheedu ma aha maalin rasiidyo warqad ah."
              ]
            }
          },
          {
            slug: "software-track-customer-credit-deyn",
            q: {
              en: "Can software track customer credit (deyn)?",
              so: "Software-ku ma la socon karaa deynta macmiilka (deyn)?"
            },
            a: {
              en: [
                "Yes — the better shop platforms let you record partial payments, running balances, and due dates per customer, not just full completed sales.",
                "This removes the need for a separate notebook of who owes what, and reduces disputes since there's a clear digital record both sides can refer to.",
                "In Sahel, credit tracking is built into the same flow as regular sales, so nothing has to be logged twice."
              ],
              so: [
                "Haa — dukaamada software-ka ugu fiican waxay kuu ogolaadaan inaad duubto lacag-bixin qayb ahaan, hadhaaga, iyo taariikhaha dhammaadka macmiil kasta, ee aan ahayn kaliya iibka dhammaystiran.",
                "Tani waxay ka saartaa baahida buug gaar ah oo qorista cidda deynta leh, waxayna yaraysaa khilaafyada maadaama uu jiro diiwaan dijitaal ah oo cad oo labada dhinac ay tixraaci karaan.",
                "Sahel gudaheeda, la socodka deynta waxaa lagu daray habka isla mid ah ee iibka caadiga ah, sidaas darteed wax lama duubo laba jeer."
              ]
            }
          }
        ]
      },
      {
        slug: "buying-software",
        label: { en: "Buying Software", so: "Iibsiga Software-ka" },
        icon: "fa-solid fa-cart-shopping",
        questions: [
          {
            slug: "questions-to-ask-software-vendor",
            q: {
              en: "What questions should you ask a software vendor before buying?",
              so: "Su'aalo maxay tahay inaad weydiiso iibiyaha software-ka ka hor inta aadan iibsan?"
            },
            a: {
              en: [
                "Ask what happens to your data if you stop paying or the company shuts down — you should always be able to export your records.",
                "Ask whether the software works offline, and what happens to sales recorded during an outage.",
                "Ask if pricing is per shop, per staff member, or a flat rate, and whether there are hidden fees for support or updates.",
                "Ask for a real demo with your own products and a sample sale — not just a slide deck."
              ],
              so: [
                "Weydii waxa ku dhaca xogtaada haddii aad joojiso bixinta ama shirkaddu xirmato — waa inaad had iyo jeer awoodid inaad soo saarto diiwaannadaada.",
                "Weydii in software-ku offline shaqeeyo iyo waxa ku dhaca iibka la duubay waqtiga internetku go'o.",
                "Weydii in qiimuhu yahay mid dukaan kasta, shaqaale kasta, ama qiime go'an, iyo in ay jiraan kharashyo qarsoon oo taageero ama cusboonaysiin ah.",
                "Weydiiso muujin dhab ah oo alaabtaada gaarka ah iyo iib tusaale ah — ee aan ahayn kaliya bandhig slide ah."
              ]
            }
          },
          {
            slug: "cost-of-shop-software-somalia",
            q: {
              en: "How much should shop software cost in Somalia?",
              so: "Immisa buu ahaan lahaa qiimaha software-ka dukaanka Soomaaliya?"
            },
            a: {
              en: [
                "Pricing varies, but a fair range for small shop software is a modest monthly fee per shop rather than a large upfront license cost.",
                "Be cautious of tools priced for markets with very different infrastructure — mobile money integration and offline support should be included, not an expensive add-on.",
                "Always compare the monthly cost against the time currently lost to manual bookkeeping and credit tracking on paper."
              ],
              so: [
                "Qiimuhu wuu kala duwanaan karaa, laakiin qiime caddaalad ah oo dukaan yar software-kiisu leeyahay waa kharash bishii oo dhexdhexaad ah dukaan kasta, halkii uu noqon lahaa kharash weyn oo laysan ah oo hore la bixiyo.",
                "Ka taxadar qalab loo qiimeeyay suuqyo kaabayaal aad u kala duwan leh — isku-dhafka lacagta mobilka iyo taageerada offline waa in lagu daraa, ee aan noqon dheeraad qaali ah.",
                "Had iyo jeer barbardhig kharashka bishii marka la eego waqtiga hadda lumaya xisaabaadka gacanta iyo la socodka deynta warqadda."
              ]
            }
          },
          {
            slug: "what-happens-to-my-data",
            q: {
              en: "What happens to my data if I stop using the software?",
              so: "Waxa ku dhaca xogtayda haddii aan joojiyo isticmaalka software-ka?"
            },
            a: {
              en: [
                "Reputable software should let you export your sales, inventory, and customer records at any time, in a format you can open elsewhere.",
                "Before signing up for anything, confirm in writing that your data isn't locked in or held hostage if you decide to switch tools.",
                "Sahel gives shop owners full ownership of their own records, always exportable, with no lock-in."
              ],
              so: [
                "Software la isku halayn karo waa inuu kuu ogolaadaa inaad wakhti kasta soo saarto iibkaaga, keydkaaga, iyo diiwaannada macaamiisha, qaab aad meel kale ku furi karto.",
                "Ka hor inta aadan ku biirin wax kasta, hubi qoraal ahaan in xogtaadu aanay ku xirnayn ama la haysan haddii aad go'aansato inaad qalabka bedesho.",
                "Sahel waxay dukaan-leyaasha siisaa milkiilnimo buuxda oo diiwaannadooda gaarka ah, had iyo jeer soo saari kara, iyada oo aan lahayn xidhitaan."
              ]
            }
          }
        ]
      }
    ];

    /* ── Derive flat blog posts (both languages) ────── */
    const blogPosts = topics.flatMap((topic) =>
      topic.questions.map((item) => ({
        slug: item.slug,
        title: { en: item.q.en, so: item.q.so },
        excerpt: { en: item.a.en[0], so: item.a.so[0] },
        date: new Date().toISOString().slice(0, 10),
        content: { en: item.a.en.join("\n\n"), so: item.a.so.join("\n\n") },
        topic: topic.label
      }))
    );

    /* ── State ───────────────────────────────────────── */
    let currentLang = "en";
    let activeTopic = null; // null = all
    let searchQuery = "";
    let openQuestions = new Set();

    /* ── DOM refs ────────────────────────────────────── */
    const topicTabsEl = document.getElementById("topicTabs");
    const questionsListEl = document.getElementById("questionsList");
    const noResultsEl = document.getElementById("noResults");
    const resultsCountEl = document.getElementById("resultsCount");
    const searchInputEl = document.getElementById("searchInput");
    const langSlider = document.getElementById("langSlider");
    const backToTopBtn = document.getElementById("backToTop");

    /* ── Language toggle ─────────────────────────────── */
    function positionLangSlider() {
      const btn = document.querySelector(`.lang-btn[data-lang="${currentLang}"]`);
      if (!btn) return;
      langSlider.style.left = btn.offsetLeft + 2 + "px";
      langSlider.style.width = btn.offsetWidth - 4 + "px";
    }

    window.setLang = function(lang) {
      currentLang = lang;
      document.querySelectorAll(".lang-btn").forEach(b => {
        const isActive = b.dataset.lang === lang;
        b.classList.toggle("active", isActive);
        b.setAttribute("aria-selected", isActive);
      });
      positionLangSlider();

      // RTL for Somali
      document.documentElement.dir = lang === "so" ? "rtl" : "ltr";
      document.documentElement.lang = lang;

      // Update hero text
      document.getElementById("heroTag").textContent = lang === "so" ? "Xogta Ilmaha" : "Knowledge Base";
      document.getElementById("heroTitle").textContent = lang === "so"
        ? "Jawaabaha Ganacsatada Soomaaliyeed"
        : "Answers for Somali Business Owners";
      document.getElementById("heroSub").textContent = lang === "so"
        ? "Hanuunad waxqabadka oo ku saabsan bilaabista, maaraynta, iyo kordhinta dukaankaaga — luqaddaada."
        : "Practical guidance on starting, running, and growing your shop — in your language.";
      document.getElementById("searchInput").placeholder = lang === "so"
        ? "Raadi su'aalaha..."
        : "Search questions...";
      document.getElementById("noResultsTitle").textContent = lang === "so"
        ? "Su'aal la mid ah lama helin"
        : "No matching questions";
      document.getElementById("noResultsSub").textContent = lang === "so"
        ? "Isku day eray kale ama fiiri mawduucyada oo dhan."
        : "Try a different search term or browse all topics.";

      renderTopicTabs();
      renderQuestions();
    };

    /* ── Topic tabs ──────────────────────────────────── */
    function renderTopicTabs() {
      const allLabel = currentLang === "so" ? "Dhammaan" : "All Topics";
      const totalQ = topics.reduce((s, t) => s + t.questions.length, 0);

      let html = `<button
        class="topic-tab ${activeTopic === null ? 'active' : ''}"
        data-topic="${null}"
        onclick="window.selectTopic(null)"
        role="tab"
        aria-selected="${activeTopic === null}"
        style="display:inline-flex; align-items:center; gap:8px; padding:10px 18px; border-radius:12px; border:1px solid ${activeTopic === null ? 'var(--accent)' : 'var(--border)'}; background:${activeTopic === null ? 'var(--accent-dim)' : 'var(--card)'}; color:${activeTopic === null ? 'var(--accent)' : 'var(--fg-muted)'}; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.25s ease;"
      >
        ${allLabel}
        <span style="font-size:11px; opacity:0.7;">${totalQ}</span>
      </button>`;

      topics.forEach(t => {
        const isActive = activeTopic === t.slug;
        const label = t.label[currentLang];
        html += `<button
          class="topic-tab ${isActive ? 'active' : ''}"
          data-topic="${t.slug}"
          onclick="window.selectTopic('${t.slug}')"
          role="tab"
          aria-selected="${isActive}"
          style="display:inline-flex; align-items:center; gap:8px; padding:10px 18px; border-radius:12px; border:1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}; background:${isActive ? 'var(--accent-dim)' : 'var(--card)'}; color:${isActive ? 'var(--accent)' : 'var(--fg-muted)'}; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.25s ease;"
        >
          <i class="${t.icon}" style="font-size:13px;"></i>
          ${label}
          <span style="font-size:11px; opacity:0.7;">${t.questions.length}</span>
        </button>`;
      });

      topicTabsEl.innerHTML = html;
    }

    window.selectTopic = function(slug) {
      activeTopic = slug;
      openQuestions.clear();
      renderTopicTabs();
      renderQuestions();
    };

    /* ── Search ──────────────────────────────────────── */
    window.handleSearch = function(query) {
      searchQuery = query.trim().toLowerCase();
      openQuestions.clear();
      renderQuestions();
    };

    /* ── Filter questions ────────────────────────────── */
    function getFilteredQuestions() {
      let results = [];
      topics.forEach(topic => {
        if (activeTopic !== null && topic.slug !== activeTopic) return;
        topic.questions.forEach(q => {
          const textEn = (q.q.en + " " + q.a.en.join(" ")).toLowerCase();
          const textSo = (q.q.so + " " + q.a.so.join(" ")).toLowerCase();
          if (searchQuery && !textEn.includes(searchQuery) && !textSo.includes(searchQuery)) return;
          results.push({ ...q, topicSlug: topic.slug, topicLabel: topic.label, topicIcon: topic.icon });
        });
      });
      return results;
    }

    /* ── Render questions ────────────────────────────── */
    function renderQuestions() {
      const filtered = getFilteredQuestions();

      // Results count
      const countLabel = currentLang === "so"
        ? `Su'aal ${filtered.length} ${filtered.length === 1 ? 'ayaa' : 'ayaa'} la helay`
        : `${filtered.length} question${filtered.length !== 1 ? 's' : ''} found`;
      resultsCountEl.textContent = countLabel;

      if (filtered.length === 0) {
        questionsListEl.innerHTML = "";
        noResultsEl.style.display = "block";
        return;
      }

      noResultsEl.style.display = "none";

      let html = "";
      filtered.forEach((q, idx) => {
        const isOpen = openQuestions.has(q.slug);
        const questionText = q.q[currentLang];
        const topicLabel = q.topicLabel[currentLang];
        const answers = q.a[currentLang];

        // Highlight search match
        let displayQ = questionText;
        if (searchQuery) {
          const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
          displayQ = questionText.replace(regex, '<mark style="background:var(--accent-dim); color:var(--accent); padding:0 2px; border-radius:3px;">$1</mark>');
        }

        html += `<article
          class="question-item ${isOpen ? 'open' : ''}"
          data-slug="${q.slug}"
          role="listitem"
          style="animation-delay:${idx * 0.04}s;"
        >
          <button
            onclick="window.toggleQuestion('${q.slug}')"
            aria-expanded="${isOpen}"
            style="width:100%; display:flex; align-items:flex-start; gap:14px; padding:20px 22px; background:none; border:none; cursor:pointer; text-align:left; color:var(--fg); font-family:'DM Sans',sans-serif;"
          >
            <div style="flex:1; min-width:0;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; flex-wrap:wrap;">
                <span class="tag-badge">
                  <i class="${q.topicIcon}" style="font-size:10px;"></i>
                  ${topicLabel}
                </span>
              </div>
              <p style="font-size:16px; font-weight:600; line-height:1.5; margin:0;">${displayQ}</p>
            </div>
            <i class="fa-solid fa-chevron-down chevron" style="margin-top:4px; font-size:14px; flex-shrink:0;"></i>
          </button>
          <div class="answer-panel ${isOpen ? 'open' : ''}" style="${isOpen ? 'padding:0 22px 20px 22px;' : 'padding:0 22px;'}">
            <div style="border-top:1px solid var(--border); padding-top:16px;">
              ${answers.map(a => `<div class="answer-bullet">${a}</div>`).join("")}
            </div>
          </div>
        </article>`;
      });

      questionsListEl.innerHTML = html;
    }

    /* ── Toggle question ─────────────────────────────── */
    window.toggleQuestion = function(slug) {
      if (openQuestions.has(slug)) {
        openQuestions.delete(slug);
      } else {
        openQuestions.add(slug);
      }
      renderQuestions();
    };

    /* ── Back to top visibility ──────────────────────── */
    window.addEventListener("scroll", () => {
      backToTopBtn.classList.toggle("visible", window.scrollY > 400);
    }, { passive: true });

    /* ── Keyboard: Escape clears search ──────────────── */
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.activeElement === searchInputEl) {
        searchInputEl.value = "";
        handleSearch("");
        searchInputEl.blur();
      }
      // Focus search with /
      if (e.key === "/" && document.activeElement !== searchInputEl) {
        e.preventDefault();
        searchInputEl.focus();
      }
    });

    /* ── Init ────────────────────────────────────────── */
    positionLangSlider();
    renderTopicTabs();
    renderQuestions();

    // Reposition slider on resize
    window.addEventListener("resize", positionLangSlider);
  </script>
</body>
</html>
