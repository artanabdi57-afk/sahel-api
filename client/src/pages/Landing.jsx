import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// 1. Hook for Scroll Animations
function useElementOnScreen(options) {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, options);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, [containerRef, options]);

  return [containerRef, isVisible];
}

const styles = `
.lp { --ink:#14110f; --paper:#f6f1e7; --rust:#b5482a; --rust-deep:#8a3520; --gold:#c89a4b; --green-ink:#2f4a3a; --line:rgba(20,17,15,0.12);
  --font-display: Georgia, 'Times New Roman', serif; --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--paper); color: var(--ink); font-family: var(--font-body); line-height: 1.6; -webkit-font-smoothing: antialiased; min-height: 100vh; overflow-x: hidden; }
.lp * { box-sizing: border-box; }

/* Animation Classes */
.reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
.reveal.active { opacity: 1; transform: translateY(0); }

.lp .wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.lp nav { display: flex; align-items: center; justify-content: space-between; padding: 24px 0; border-bottom: 1px solid var(--line); }
.lp .logo { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--ink); text-decoration: none; transition: transform 0.2s; }
.lp .logo:hover { transform: scale(1.02); }
.lp .logo-mark { width: 32px; height: 32px; background: var(--rust); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: var(--paper); font-size: 16px; font-weight: 700; }

.lp .nav-links { display: flex; align-items: center; gap: 32px; }
.lp .nav-links a { color: var(--ink); text-decoration: none; font-size: 15px; font-weight: 500; opacity: 0.75; transition: opacity 0.2s; }
.lp .nav-links a:hover { opacity: 1; }
.lp .nav-cta { background: var(--rust); color: var(--paper) !important; padding: 10px 22px; border-radius: 4px; opacity: 1 !important; transition: all 0.2s !important; }
.lp .nav-cta:hover { background: var(--rust-deep); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(181,72,42,0.2); }

.lp .hero { padding: 88px 0 64px; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 64px; align-items: center; }
.lp h1 { font-family: var(--font-display); font-size: 56px; line-height: 1.06; font-weight: 700; letter-spacing: -0.01em; margin: 0 0 24px; }
.lp h1 em { color: var(--rust); font-style: normal; position: relative; display: inline-block; }

/* The Ledger Graphic with Interaction */
.lp .ledger { 
  background: #fffdf8; border: 1px solid var(--line); border-radius: 8px; 
  box-shadow: 0 24px 60px rgba(20,17,15,0.12); overflow: hidden; 
  transform: rotate(1.5deg); 
  animation: float 6s ease-in-out infinite;
  transition: all 0.4s ease;
}
.lp .ledger:hover { transform: rotate(0deg) scale(1.02); box-shadow: 0 32px 70px rgba(20,17,15,0.18); }
@keyframes float { 0%, 100% { transform: rotate(1.5deg) translateY(0); } 50% { transform: rotate(2deg) translateY(-10px); } }

.lp .ledger-row { display: flex; justify-content: space-between; align-items: baseline; padding: 11px 18px; border-bottom: 1px dashed var(--line); font-family: var(--font-display); transition: background 0.2s; cursor: default; }
.lp .ledger-row:hover { background: rgba(181,72,42,0.04); }

.lp .feature-card { background: var(--paper); padding: 36px 32px; transition: all 0.3s ease; border: 1px solid transparent; }
.lp .feature-card:hover { background: #fff; border-color: var(--line); transform: translateY(-8px); box-shadow: 0 12px 30px rgba(20,17,15,0.06); }

/* FAQ Accordion Styles */
.lp .faq-item { border-bottom: 1px solid var(--line); padding: 0; cursor: pointer; transition: background 0.2s; }
.lp .faq-item:hover { background: rgba(20,17,15,0.02); }
.lp .faq-trigger { display: flex; justify-content: space-between; align-items: center; padding: 24px 0; width: 100%; text-align: left; border: none; background: none; cursor: pointer; }
.lp .faq-content { max-height: 0; overflow: hidden; transition: all 0.3s ease-out; padding-bottom: 0; opacity: 0; }
.lp .faq-item.active .faq-content { max-height: 200px; padding-bottom: 24px; opacity: 1; }
.lp .faq-icon { transition: transform 0.3s; font-family: var(--font-display); font-size: 20px; font-weight: normal; }
.lp .faq-item.active .faq-icon { transform: rotate(45deg); color: var(--rust); }

.lp .btn-primary { transition: all 0.2s; transform: scale(1); }
.lp .btn-primary:active { transform: scale(0.96); }

@media (max-width: 860px) {
  .lp .hero { grid-template-columns: 1fr; padding-top: 48px; }
}
`;

export default function Landing() {
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Refs for scroll animations
  const [heroRef, heroVisible] = useElementOnScreen({ threshold: 0.1 });
  const [trustRef, trustVisible] = useElementOnScreen({ threshold: 0.1 });
  const [featRef, featVisible] = useElementOnScreen({ threshold: 0.1 });

  return (
    <div className="lp">
      <style>{styles}</style>

      <div className="wrap">
        <nav>
          <Link to="/" className="logo">
            <span className="logo-mark">S</span>
            Sahel
          </Link>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <Link to="/login" className="nav-cta">Log in</Link>
          </div>
        </nav>

        <section ref={heroRef} className={`hero reveal ${heroVisible ? 'active' : ''}`}>
          <div>
            <p className="eyebrow">Built for Somali shop owners</p>
            <h1>Run your shop from your phone, not a <em>notebook</em>.</h1>
            <p className="hero-sub">
              Sahel is shop management software made for Somalia. Track every sale, watch your stock,
              and know exactly who owes you money - all in one simple app.
            </p>
            <div className="hero-ctas">
              <Link to="/signup" className="btn-primary">Start free with Sahel</Link>
              <a href="#how" className="btn-secondary">See how it works</a>
            </div>
            <p className="hero-note">Free to start &middot; No card required</p>
          </div>

          <div style={{ position: "relative" }}>
            <div className="ledger">
              <div className="ledger-tab">
                <span>Sahel &middot; Today</span>
                <span>Hodan Market</span>
              </div>
              <div className="ledger-body" style={{padding: 0}}>
                {[
                  ["Sugar, 5 bags", "$42.00", "amt-paid"],
                  ["Cooking oil, 3L", "$18.50", "amt-paid"],
                  ["Ahmed Ali - credit", "$50.00", "amt-owed"],
                  ["Rice, 10kg", "$31.00", "amt-paid"]
                ].map(([name, price, type], i) => (
                    <div className="ledger-row" key={i}>
                        <span className="ledger-name">{name}</span>
                        <span className={`ledger-amt ${type}`}>{price}</span>
                    </div>
                ))}
                <div className="ledger-total" style={{margin: '14px 18px', paddingBottom: '14px'}}>
                  <span>Today's total</span>
                  <span>$141.50</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div ref={trustRef} className={`trust-bar reveal ${trustVisible ? 'active' : ''}`}>
          {[
            ["25+", "Shops using Sahel"],
            ["100%", "Built for Somalia"],
            ["$0", "To get started"],
            ["24/7", "Access from anywhere"]
          ].map(([num, label]) => (
            <div key={label} style={{transition: 'transform 0.3s'}} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <div className="trust-stat-num">{num}</div>
              <div className="trust-stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <section ref={featRef} className={`section reveal ${featVisible ? 'active' : ''}`} id="features">
        <div className="wrap">
          <div className="section-head">
            <p className="section-eyebrow">What Sahel does</p>
            <h2>Everything your shop needs.</h2>
          </div>
          <div className="features-grid">
            {[
              ["01", "Sales tracking", "Record every sale in seconds. See your daily totals without doing the math."],
              ["02", "Inventory that never lies", "Know exactly what's in stock. Get warned before you run out."],
              ["03", "Customer credit, tracked", "See who owes you, how much, and for how long. No more memory games."],
              ["04", "Expenses in one place", "Log what goes out. Understand your real profit at a glance."],
              ["05", "Reports that make sense", "Clear, simple reports that show you what's working."],
              ["06", "Works everywhere", "Phone, computer, or tablet. Your shop data follows you everywhere."]
            ].map(([num, title, desc]) => (
              <div className="feature-card" key={num}>
                <p className="feature-num">{num}</p>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <p className="section-eyebrow">Questions</p>
            <h2>Frequently asked questions</h2>
          </div>
          <div>
            {[
              ["What is Sahel?", "Sahel is shop management software built specifically for small retail businesses in Somalia. It helps shop owners track sales, manage inventory, and follow customer credit."],
              ["Is Sahel free to use?", "Yes. Sahel is completely free for Somali shop owners - sales tracking, credit tracking, expenses, and reports, with no credit card required."],
              ["Do I need to install anything?", "No. Sahel works directly in your phone or computer's browser at mysahelapp.com. It's built to be fast even on slow connections."],
              ["Can I track customers who owe me money?", "Yes. Sahel's credit tracking feature lets you record what each customer owes, see payment history, and get a clear view of debts."],
              ["Is my shop data private?", "Yes. Each shop's data on Sahel is private and only visible to that shop's account owner. We use banking-level security to protect your data."]
            ].map(([q, a], i) => (
              <div 
                className={`faq-item ${activeFaq === i ? 'active' : ''}`} 
                key={i}
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <div className="faq-trigger">
                  <h3>{q}</h3>
                  <span className="faq-icon">+</span>
                </div>
                <div className="faq-content">
                  <p>{a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="final-cta">
        <h2>Ready to leave the notebook behind?</h2>
        <p>Join the shop owners already running their business on Sahel.</p>
        <Link to="/signup" className="btn-primary">Start free with Sahel</Link>
      </div>

      <div className="wrap">
        <footer>
          <span>&copy; 2026 Sahel. Built for Somalia.</span>
          <div>
            <Link to="/login">Log in</Link>
            <Link to="/signup">Sign up</Link>
            <a href="mailto:hello@mysahelapp.com">Contact</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
