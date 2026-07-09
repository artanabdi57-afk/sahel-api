import { useState, useMemo } from "react";

/* ── Data ─────────────────────────────────────────── */
const topics = [
  {
    slug: "starting-a-business",
    label: { en: "Starting a Business", so: "Bilaabista Ganacsi" },
    icon: "rocket",
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
    icon: "boxes",
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
    icon: "cart",
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

/* Derive flat blog posts — both languages preserved */
const blogPosts = topics.flatMap((topic) =>
  topic.questions.map((item) => ({
    slug: item.slug,
    title: { en: item.q.en, so: item.q.so },
    excerpt: { en: item.a.en[0], so: item.a.so[0] },
    date: new Date().toISOString().slice(0, 10),
    content: { en: item.a.en.join("\n\n"), so: item.a.so.join("\n\n") },
    topic: topic.label,
  }))
);

/* ── Icon map ──────────────────────────────────────── */
const iconMap = {
  rocket: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  boxes: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  cart: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  ),
};

/* ── Component ─────────────────────────────────────── */
export default function BlogPost() {
  const [lang, setLang] = useState("en");
  const [activeTopic, setActiveTopic] = useState(null);
  const [search, setSearch] = useState("");
  const [openSet, setOpenSet] = useState(new Set());

  const isRTL = lang === "so";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const results = [];
    topics.forEach((topic) => {
      if (activeTopic !== null && topic.slug !== activeTopic) return;
      topic.questions.forEach((question) => {
        const textEn = (question.q.en + " " + question.a.en.join(" ")).toLowerCase();
        const textSo = (question.q.so + " " + question.a.so.join(" ")).toLowerCase();
        if (q && !textEn.includes(q) && !textSo.includes(q)) return;
        results.push({ ...question, topicSlug: topic.slug, topicLabel: topic.label, topicIcon: topic.icon });
      });
    });
    return results;
  }, [activeTopic, search]);

  function toggle(slug) {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }

  function highlightText(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} style={{ background: "rgba(200,230,78,0.15)", color: "#C8E64E", padding: "0 2px", borderRadius: 3 }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  }

  const totalQuestions = topics.reduce((sum, t) => sum + t.questions.length, 0);

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        minHeight: "100vh",
        background: "#0C0F0A",
        color: "#E8EDE5",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(12,15,10,0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(200,230,78,0.1)",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: "#C8E64E", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0C0F0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 20h10" /><path d="M10 20c5.5-2.5.8-6.4 3-10" /><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" /><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, fontFamily: "'Space Grotesk', sans-serif" }}>Sahel</span>
          </div>

          {/* Language Toggle */}
          <div
            style={{
              display: "flex",
              background: "#1A2016",
              border: "1px solid #2A3625",
              borderRadius: 10,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {["en", "so"].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: "7px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  color: lang === l ? "#0C0F0A" : "#8A9A82",
                  background: lang === l ? "#C8E64E" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 80px" }}>
        {/* Hero */}
        <section style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 14px",
              background: "rgba(200,230,78,0.08)",
              border: "1px solid rgba(200,230,78,0.15)",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              color: "#C8E64E",
              marginBottom: 20,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            {lang === "so" ? "Xogta Ilmaha" : "Knowledge Base"}
          </div>

          <h1
            style={{
              fontSize: "clamp(1.8rem, 5vw, 2.75rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              margin: "0 auto 14px",
              fontFamily: "'Space Grotesk', sans-serif",
              maxWidth: 640,
            }}
          >
            {lang === "so" ? "Jawaabaha Ganacsatada Soomaaliyeed" : "Answers for Somali Business Owners"}
          </h1>

          <p style={{ fontSize: 17, color: "#8A9A82", maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.6 }}>
            {lang === "so"
              ? "Hanuunad waxqabadka oo ku saabsan bilaabista, maaraynta, iyo kordhinta dukaankaaga — luqaddaada."
              : "Practical guidance on starting, running, and growing your shop — in your language."}
          </p>

          {/* Search */}
          <div style={{ position: "relative", maxWidth: 480, margin: "0 auto" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "so" ? "Raadi su'aalaha..." : "Search questions..."}
              style={{
                width: "100%",
                padding: "13px 18px 13px 46px",
                background: "#1A2016",
                border: "1px solid #2A3625",
                borderRadius: 14,
                color: "#E8EDE5",
                fontSize: 15,
                fontFamily: "inherit",
                outline: "none",
                transition: "border-color 0.25s, box-shadow 0.25s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#C8E64E";
                e.target.style.boxShadow = "0 0 0 3px rgba(200,230,78,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#2A3625";
                e.target.style.boxShadow = "none";
              }}
            />
            <svg
              style={{ position: "absolute", left: isRTL ? "auto" : 16, right: isRTL ? 16 : "auto", top: "50%", transform: "translateY(-50%)", color: "#5C6B56" }}
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </section>

        {/* Topic Tabs */}
        <section style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 28 }}>
          <button
            onClick={() => setActiveTopic(null)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 18px",
              borderRadius: 12,
              border: `1px solid ${activeTopic === null ? "#C8E64E" : "#2A3625"}`,
              background: activeTopic === null ? "rgba(200,230,78,0.12)" : "#1A2016",
              color: activeTopic === null ? "#C8E64E" : "#8A9A82",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.25s ease",
            }}
          >
            {lang === "so" ? "Dhammaan" : "All Topics"}
            <span style={{ fontSize: 11, opacity: 0.7 }}>{totalQuestions}</span>
          </button>

          {topics.map((t) => {
            const isActive = activeTopic === t.slug;
            return (
              <button
                key={t.slug}
                onClick={() => setActiveTopic(isActive ? null : t.slug)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 18px",
                  borderRadius: 12,
                  border: `1px solid ${isActive ? "#C8E64E" : "#2A3625"}`,
                  background: isActive ? "rgba(200,230,78,0.12)" : "#1A2016",
                  color: isActive ? "#C8E64E" : "#8A9A82",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.25s ease",
                }}
              >
                <span style={{ display: "flex", alignItems: "center" }}>{iconMap[t.icon]}</span>
                {t.label[lang]}
                <span style={{ fontSize: 11, opacity: 0.7 }}>{t.questions.length}</span>
              </button>
            );
          })}
        </section>

        {/* Results count */}
        <p style={{ fontSize: 13, color: "#5C6B56", marginBottom: 20 }}>
          {lang === "so"
            ? `Su'aal ${filtered.length} ${filtered.length === 1 ? "ayaa" : "ayaa"} la helay`
            : `${filtered.length} question${filtered.length !== 1 ? "s" : ""} found`}
        </p>

        {/* Questions */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <svg style={{ margin: "0 auto 16px", display: "block", color: "#3A4A33" }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M8 15h8" /><circle cx="9" cy="9" r="1" fill="currentColor" /><circle cx="15" cy="9" r="1" fill="currentColor" />
            </svg>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#8A9A82", marginBottom: 6 }}>
              {lang === "so" ? "Su'aal la mid ah lama helin" : "No matching questions"}
            </p>
            <p style={{ color: "#5C6B56", fontSize: 14 }}>
              {lang === "so" ? "Isku day eray kale ama fiiri mawduucyada oo dhan." : "Try a different search term or browse all topics."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((q) => {
              const isOpen = openSet.has(q.slug);
              const answers = q.a[lang];
              return (
                <article
                  key={q.slug}
                  style={{
                    background: "#1A2016",
                    border: `1px solid ${isOpen ? "#C8E64E" : "#2A3625"}`,
                    borderRadius: 14,
                    overflow: "hidden",
                    transition: "border-color 0.3s, box-shadow 0.3s",
                    boxShadow: isOpen ? "0 4px 20px rgba(200,230,78,0.08)" : "none",
                  }}
                >
                  <button
                    onClick={() => toggle(q.slug)}
                    aria-expanded={isOpen}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      padding: "18px 22px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: isRTL ? "right" : "left",
                      color: "#E8EDE5",
                      fontFamily: "inherit",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "3px 11px",
                            background: "rgba(200,230,78,0.08)",
                            border: "1px solid rgba(200,230,78,0.15)",
                            borderRadius: 7,
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#C8E64E",
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center" }}>{iconMap[q.topicIcon]}</span>
                          {q.topicLabel[lang]}
                        </span>
                      </div>
                      <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5, margin: 0 }}>
                        {highlightText(q.q[lang], search.trim())}
                      </p>
                    </div>
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isOpen ? "#C8E64E" : "#5C6B56"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ marginTop: 4, flexShrink: 0, transition: "transform 0.3s ease, stroke 0.3s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  <div
                    style={{
                      maxHeight: isOpen ? 600 : 0,
                      overflow: "hidden",
                      transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      padding: isOpen ? "0 22px 20px" : "0 22px",
                    }}
                  >
                    <div style={{ borderTop: "1px solid #2A3625", paddingTop: 16 }}>
                      {answers.map((a, i) => (
                        <div
                          key={i}
                          style={{
                            position: "relative",
                            paddingLeft: isRTL ? 0 : 20,
                            paddingRight: isRTL ? 20 : 0,
                            marginBottom: 12,
                            lineHeight: 1.7,
                            color: "#E8EDE5",
                            fontSize: 15,
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              [isRTL ? "right" : "left"]: 0,
                              top: 10,
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#C8E64E",
                              display: "block",
                            }}
                          />
                          {a}
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #2A3625", background: "#151A12" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <p style={{ fontSize: 14, color: "#5C6B56", margin: 0 }}>
            <span style={{ fontWeight: 600, color: "#8A9A82", fontFamily: "'Space Grotesk', sans-serif" }}>Sahel</span> — Shop management built for Somalia
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy", "Terms", "Contact"].map((link) => (
              <a key={link} href="#" style={{ fontSize: 14, color: "#5C6B56", textDecoration: "none", transition: "color 0.2s" }}
                onMouseOver={(e) => { e.target.style.color = "#C8E64E"; }}
                onMouseOut={(e) => { e.target.style.color = "#5C6B56"; }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
