import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { topics } from "../data/blogPosts";

function AccordionItem({ item, lang }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-base font-semibold text-slate-950">{item.q[lang]}</span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-orange-500 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="pb-5 pr-8 space-y-3">
            {item.a[lang].map((para, i) => (
              <p key={i} className="leading-relaxed text-slate-600">
                {para}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const uiText = {
  en: {
    eyebrow: "Sahel Blog",
    title: "Guides for shop owners in Somalia",
    subtitle: "Pick a topic, then tap a question to read the answer.",
  },
  so: {
    eyebrow: "Blog-ga Sahel",
    title: "Hagayaal loogu talagalay dukaan-leyda Soomaaliya",
    subtitle: "Dooro mowduuc, kadibna riix su'aal si aad u aqriso jawaabta.",
  },
};

export default function Blog() {
  const [lang, setLang] = useState("en");
  const [activeTopic, setActiveTopic] = useState(topics[0].slug);
  const current = topics.find((t) => t.slug === activeTopic);
  const text = uiText[lang];

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-white px-4 py-5 lg:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/welcome" className="flex items-center gap-3">
            <img src="/apple-touch-icon.png" alt="Sahel" className="h-10 w-10 rounded-lg" />
            <span className="text-lg font-bold text-slate-950">Sahel</span>
          </Link>
          <div className="flex rounded-full border border-slate-200 p-1">
            <button
              onClick={() => setLang("en")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                lang === "en" ? "bg-blue-600 text-white" : "text-slate-500"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("so")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                lang === "so" ? "bg-blue-600 text-white" : "text-slate-500"
              }`}
            >
              SO
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
          {text.eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">{text.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{text.subtitle}</p>

        <div className="mt-8 flex flex-wrap gap-2">
          {topics.map((topic) => {
            const isActive = topic.slug === activeTopic;
            return (
              <button
                key={topic.slug}
                onClick={() => setActiveTopic(topic.slug)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-orange-300 hover:text-orange-500"
                }`}
              >
                {topic.label[lang]}
              </button>
            );
          })}
        </div>

        <div
          key={activeTopic + lang}
          className="mt-8 rounded-lg border border-slate-200 px-6 animate-[fadeIn_0.3s_ease-in-out]"
        >
          {current.questions.map((item) => (
            <AccordionItem key={item.slug} item={item} lang={lang} />
          ))}
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
