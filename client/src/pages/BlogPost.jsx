import { useState, useMemo } from "react";
import { topics, blogPosts } from "../data/blogPosts";

const iconMap = {
  "starting-a-business": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  "shop-management-tools": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  "buying-software": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  ),
};

export default function Blog() {
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
        results.push({ ...question, topicSlug: topic.slug, topicLabel: topic.label });
      });
    });
    return results;
  }, [activeTopic, search]);

  function toggle(slug) {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function highlightText(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} style={{ background: "rgba(200,230,78,0.15)", color: "#C8E64E", padding: "0 2px", borderRadius: 3 }}>{part}</mark>
      ) : (part)
    );
  }

  const totalQ = topics.reduce((s, t) => s + t.questions.length, 0);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: "#0C0F0A", color: "#E8EDE5", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(12,15,10,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(200,230,78,0.1)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: "#C8E64E", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0C0F0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 20h10" /><path d="M10 20c5.5-2.5.8-6.4 3-10" /><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" /><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, fontFamily: "'Space Grotesk', sans-serif" }}>Sahel</span>
          </div>
          <div style={{ display: "flex", background: "#1A2016", border: "1px solid #2A3625", borderRadius: 10, overflow: "hidden" }}>
            {["en", "so"].map((l) => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: "7px 18px", fontSize: 13, fontWeight: 600, letterSpacing: 0.5, color: lang === l ? "#0C0F0A" : "#8A9A82", background: lang === l ? "#C8E64E" : "transparent", border: "none", cursor: "pointer", transition: "all 0.25s ease" }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 80px" }}>
        {/* Hero */}
        <section style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", background: "rgba(200,230,78,0.08)", border: "1px solid rgba(200,230,78,0.15)", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#C8E64E", marginBottom: 20 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
            {lang === "so" ? "Xogta Ilmaha" : "Knowledge Base"}
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.75rem)", fontWeight: 800, lineHeight: 1.15, margin: "0 auto 14px", fontFamily: "'Space Grotesk', sans-serif", maxWidth: 640 }}>
            {lang === "so" ? "Jawaabaha Ganacsatada Soomaaliyeed" : "Answers for Somali Business Owners"}
          </h1>
          <p style={{ fontSize: 17, color: "#8A9A82", maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.6 }}>
            {lang === "so" ? "Hanuunad waxqabadka oo ku saabsan bilaabista, maaraynta, iyo kordhinta dukaankaaga — luqaddaada." : "Practical guidance on starting, running, and growing your shop — in your language."}
          </p>
          <div style={{ position: "relative", maxWidth: 480, margin: "0 auto" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "so" ? "Raadi su'aalaha..." : "Search questions..."}
              style={{ width: "100%", padding: "13px 18px 13px 46px", background: "#1A2016", border: "1px solid #2A3625", borderRadius: 14, color: "#E8EDE5", fontSize: 15, fontFamily: "inherit", outline: "none", transition: "border-color 0.25s, box-shadow 0.25s" }}
              onFocus={(e) => { e.target.style.borderColor = "#C8E64E"; e.target.style.boxShadow = "0 0 0 3px rgba(200,230,78,0.12)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#2A3625"; e.target.style.boxShadow = "none"; }}
            />
            <svg style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#5C6B56" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </div>
        </section>

        {/* Topic Tabs */}
        <section style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 28 }}>
          <button
            onClick={() => setActiveTopic(null)}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 12, border: `1px solid ${activeTopic === null ? "#C8E64E" : "#2A3625"}`, background: activeTopic === null ? "rgba(200,230,78,0.12)" : "#1A2016", color: activeTopic === null ? "#C8E64E" : "#8A9A82", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.25s ease" }}
          >
            {lang === "so" ? "Dhammaan" : "All Topics"}
            <span style={{ fontSize: 11, opacity: 0.7 }}>{totalQ}</span>
          </button>
          {topics.map((t) => {
            const isActive = activeTopic === t.slug;
            return (
              <button key={t.slug} onClick={() => setActiveTopic(isActive ? null : t.slug)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 12, border: `1px solid ${isActive ? "#C8E64E" : "#2A3625"}`, background: isActive ? "rgba(200,230,78,0.12)" : "#1A2016", color: isActive ? "#C8E64E" : "#8A9A82", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.25s ease" }}>
                <span style={{ display: "flex", alignItems: "center" }}>{iconMap[t.slug]}</span>
                {t.label[lang]}
                <span style={{ fontSize: 11, opacity: 0.7 }}>{t.questions.length}</span>
              </button>
            );
          })}
        </section>

        {/* Results count */}
        <p style={{ fontSize: 13, color: "#5C6B56", marginBottom: 20 }}>
          {lang === "so" ? `Su'aal ${filtered.length} ayaa la helay` : `${filtered.length} question${filtered.length !== 1 ? "s" : ""} found`}
        </p>

        {/* Questions */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#8A9A82", marginBottom: 6 }}>{lang === "so" ? "Su'aal la mid ah lama helin" : "No matching questions"}</p>
            <p style={{ color: "#5C6B56", fontSize: 14 }}>{lang === "so" ? "Isku day eray kale ama fiiri mawduucyada oo dhan." : "Try a different search term or browse all topics."}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((q) => {
              const isOpen = openSet.has(q.slug);
              const answers = q.a[lang];
              return (
                <article key={q.slug} style={{ background: "#1A2016", border: `1px solid ${isOpen ? "#C8E64E" : "#2A3625"}`, borderRadius: 14, overflow: "hidden", transition: "border-color 0.3s, box-shadow 0.3s", boxShadow: isOpen ? "0 4px 20px rgba(200,230,78,0.08)" : "none" }}>
                  <button onClick={() => toggle(q.slug)} aria-expanded={isOpen} style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 14, padding: "18px 22px", background: "none", border: "none", cursor: "pointer", textAlign: "left", color: "#E8EDE5", fontFamily: "inherit" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 11px", background: "rgba(200,230,78,0.08)", border: "1px solid rgba(200,230,78,0.15)", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#C8E64E" }}>
                          <span style={{ display: "flex", alignItems: "center" }}>{iconMap[q.topicSlug]}</span>
                          {q.topicLabel[lang]}
                        </span>
                      </div>
                      <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5, margin: 0 }}>{highlightText(q.q[lang], search.trim())}</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isOpen ? "#C8E64E" : "#5C6B56"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 4, flexShrink: 0, transition: "transform 0.3s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}><polyline points="6 9 12 15 18 9" /></svg>
                  </button>
                  <div style={{ maxHeight: isOpen ? 600 : 0, overflow: "hidden", transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)", padding: isOpen ? "0 22px 20px" : "0 22px" }}>
                    <div style={{ borderTop: "1px solid #2A3625", paddingTop: 16 }}>
                      {answers.map((a, i) => (
                        <div key={i} style={{ position: "relative", paddingLeft: 20, marginBottom: 12, lineHeight: 1.7, color: "#E8EDE5", fontSize: 15 }}>
                          <span style={{ position: "absolute", left: 0, top: 10, width: 6, height: 6, borderRadius: "50%", background: "#C8E64E", display: "block" }} />
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
              <a key={link} href="#" style={{ fontSize: 14, color: "#5C6B56", textDecoration: "none" }}>{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
