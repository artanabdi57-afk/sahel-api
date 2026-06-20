import React from "react";
import { Link } from "react-router-dom";

const styles = `
.lp { --ink:#14110f; --paper:#f6f1e7; --rust:#b5482a; --rust-deep:#8a3520; --gold:#c89a4b; --green-ink:#2f4a3a; --line:rgba(20,17,15,0.12);
  --font-display: Georgia, 'Times New Roman', serif; --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--paper); color: var(--ink); font-family: var(--font-body); line-height: 1.6; -webkit-font-smoothing: antialiased; min-height: 100vh; }
.lp * { box-sizing: border-box; }
.lp .wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.lp nav { display: flex; align-items: center; justify-content: space-between; padding: 24px 0; border-bottom: 1px solid var(--line); }
.lp .logo { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--ink); text-decoration: none; }
.lp .logo-mark { width: 32px; height: 32px; background: var(--rust); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: var(--paper); font-size: 16px; font-weight: 700; }
.lp .nav-links { display: flex; align-items: center; gap: 32px; }
.lp .nav-links a { color: var(--ink); text-decoration: none; font-size: 15px; font-weight: 500; opacity: 0.75; }
.lp .nav-links a:hover { opacity: 1; }
.lp .nav-cta { background: var(--rust); color: var(--paper) !important; padding: 10px 22px; border-radius: 4px; opacity: 1 !important; }
.lp .hero { padding: 88px 0 64px; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 64px; align-items: center; }
.lp .eyebrow { font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--rust); font-weight: 700; margin-bottom: 18px; }
.lp h1 { font-family: var(--font-display); font-size: 56px; line-height: 1.06; font-weight: 700; letter-spacing: -0.01em; margin: 0 0 24px; }
.lp h1 em { color: var(--rust); font-style: normal; }
.lp .hero-sub { font-size: 18px; color: rgba(20,17,15,0.7); max-width: 460px; margin: 0 0 36px; }
.lp .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 28px; }
.lp .btn-primary { background: var(--rust); color: var(--paper); padding: 15px 30px; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; transition: background 0.15s ease; border: none; cursor: pointer; }
.lp .btn-primary:hover { background: var(--rust-deep); }
.lp .btn-secondary { background: transparent; color: var(--ink); padding: 15px 30px; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: 16px; border: 1.5px solid var(--ink); display: inline-block; }
.lp .hero-note { font-size: 13px; color: rgba(20,17,15,0.55); margin: 0; }
.lp .ledger { background: #fffdf8; border: 1px solid var(--line); border-radius: 8px; box-shadow: 0 24px 60px rgba(20,17,15,0.12); overflow: hidden; transform: rotate(1.5deg); }
.lp .ledger-tab { background: var(--ink); color: var(--paper); font-family: var(--font-display); font-size: 13px; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; }
.lp .ledger-body { padding: 22px 24px; }
.lp .ledger-row { display: flex; justify-content: space-between; align-items: baseline; padding: 11px 0; border-bottom: 1px dashed var(--line); font-family: var(--font-display); }
.lp .ledger-row:last-child { border-bottom: none; }
.lp .ledger-name { font-size: 15px; }
.lp .ledger-amt { font-size: 15px; font-weight: 700; }
.lp .amt-paid { color: var(--green-ink); }
.lp .amt-owed { color: var(--rust); }
.lp .ledger-strike { text-decoration: line-through; opacity: 0.35; }
.lp .ledger-total { margin-top: 14px; padding-top: 14px; border-top: 2px solid var(--ink); display: flex; justify-content: space-between; font-family: var(--font-display); font-weight: 700; font-size: 17px; }
.lp .trust-bar { border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 28px 0; display: flex; justify-content: space-around; flex-wrap: wrap; gap: 24px; text-align: center; }
.lp .trust-stat-num { font-family: var(--font-display); font-size: 30px; font-weight: 700; color: var(--rust); }
.lp .trust-stat-label { font-size: 13px; color: rgba(20,17,15,0.6); text-transform: uppercase; letter-spacing: 0.06em; }
.lp .section { padding: 96px 0; }
.lp .section-head { max-width: 580px; margin-bottom: 56px; }
.lp .section-eyebrow { font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--rust); font-weight: 700; margin-bottom: 14px; }
.lp h2 { font-family: var(--font-display); font-size: 38px; font-weight: 700; line-height: 1.15; margin: 0; }
.lp .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--line); border: 1px solid var(--line); }
.lp .feature-card { background: var(--paper); padding: 36px 32px; }
.lp .feature-num { font-family: var(--font-display); font-size: 14px; color: var(--rust); font-weight: 700; margin-bottom: 16px; }
.lp .feature-card h3 { font-family: var(--font-display); font-size: 20px; margin: 0 0 10px; }
.lp .feature-card p { font-size: 14.5px; color: rgba(20,17,15,0.68); margin: 0; }
.lp .how { background: var(--ink); color: var(--paper); }
.lp .how .section-eyebrow { color: var(--gold); }
.lp .how h2 { color: var(--paper); }
.lp .how-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; margin-top: 16px; }
.lp .how-step-num { font-family: var(--font-display); font-size: 44px; color: var(--gold); font-weight: 700; margin-bottom: 14px; line-height: 1; }
.lp .how-step h3 { font-family: var(--font-display); font-size: 19px; margin: 0 0 8px; }
.lp .how-step p { font-size: 14.5px; color: rgba(246,241,231,0.65); margin: 0; }
.lp .testimonial { padding: 96px 0; text-align: center; }
.lp .testimonial blockquote { font-family: var(--font-display); font-size: 30px; line-height: 1.4; max-width: 760px; margin: 0 auto 28px; font-style: italic; }
.lp .testimonial cite { font-style: normal; font-size: 14px; color: rgba(20,17,15,0.6); font-weight: 600; }
.lp .pricing-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; max-width: 720px; margin: 0 auto; }
.lp .price-card { background: #fffdf8; border: 1px solid var(--line); border-radius: 8px; padding: 36px 32px; position: relative; }
.lp .price-card.featured { border: 2px solid var(--rust); }
.lp .price-badge { position: absolute; top: -13px; left: 32px; background: var(--rust); color: var(--paper); font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; padding: 4px 12px; border-radius: 3px; }
.lp .price-name { font-family: var(--font-display); font-size: 20px; font-weight: 700; margin: 0 0 6px; }
.lp .price-amt { font-family: var(--font-display); font-size: 40px; font-weight: 700; margin: 0 0 4px; }
.lp .price-period { font-size: 13px; color: rgba(20,17,15,0.55); margin: 0 0 24px; }
.lp .price-list { list-style: none; margin: 0 0 28px; padding: 0; }
.lp .price-list li { font-size: 14.5px; padding: 8px 0; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 10px; }
.lp .price-list li::before { content: "\\2713"; color: var(--green-ink); font-weight: 700; }
.lp .faq-item { border-bottom: 1px solid var(--line); padding: 24px 0; }
.lp .faq-item h3 { font-family: var(--font-display); font-size: 18px; margin: 0 0 8px; }
.lp .faq-item p { font-size: 14.5px; color: rgba(20,17,15,0.68); max-width: 680px; margin: 0; }
.lp .final-cta { background: var(--rust); color: var(--paper); text-align: center; padding: 88px 24px; border-radius: 12px; margin: 0 24px 96px; }
.lp .final-cta h2 { color: var(--paper); margin-bottom: 16px; }
.lp .final-cta p { font-size: 17px; opacity: 0.85; margin-bottom: 32px; }
.lp .final-cta .btn-primary { background: var(--paper); color: var(--rust); }
.lp .final-cta .btn-primary:hover { background: #fff; }
.lp footer { border-top: 1px solid var(--line); padding: 48px 0; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px; font-size: 13.5px; color: rgba(20,17,15,0.55); }
.lp footer a { color: rgba(20,17,15,0.55); text-decoration: none; margin-left: 20px; }
@media (max-width: 860px) {
  .lp .hero { grid-template-columns: 1fr; padding-top: 48px; }
  .lp h1 { font-size: 38px; }
  .lp .features-grid { grid-template-columns: 1fr; }
  .lp .how-steps { grid-template-columns: 1fr; }
  .lp .pricing-grid { grid-template-columns: 1fr; }
  .lp .nav-links a:not(.nav-cta) { display: none; }
  .lp .ledger { transform: none; margin-top: 32px; }
}
`;

export default function Landing() {
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

        <section className="hero">
          <div>
            <p className="eyebrow">Built for Somali shop owners</p>
            <h1>Run your shop from your phone, not a <em>notebook</em>.</h1>
            <p className="hero-sub">
              Sahel is shop management software made for Somalia. Track every sale, watch your stock,
              and know exactly who owes you money - all in one simple app. No paper. No guessing.
            </p>
            <div className="hero-ctas">
              <Link to="/signup" className="btn-primary">Start free with Sahel</Link>
              <a href="#how" className="btn-secondary">See how it works</a>
            </div>
            <p className="hero-note">Free to start &middot; No card required &middot; Works on phone, computer, or tablet</p>
          </div>

          <div style={{ position: "relative" }}>
            <div className="ledger">
              <div className="ledger-tab">
                <span>Sahel &middot; Today</span>
                <span>Hodan Market</span>
              </div>
              <div className="ledger-body">
                <div className="ledger-row">
                  <span className="ledger-name">Sugar, 5 bags</span>
                  <span className="ledger-amt amt-paid">$42.00</span>
                </div>
                <div className="ledger-row">
                  <span className="ledger-name">Cooking oil, 3L</span>
                  <span className="ledger-amt amt-paid">$18.50</span>
                </div>
                <div className="ledger-row">
                  <span className="ledger-name">Ahmed Ali - credit</span>
                  <span className="ledger-amt amt-owed">$50.00</span>
                </div>
                <div className="ledger-row">
                  <span className="ledger-name ledger-strike">Rice, 10kg</span>
                  <span className="ledger-amt amt-paid">$31.00</span>
                </div>
                <div className="ledger-total">
                  <span>Today's total</span>
                  <span>$141.50</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="trust-bar">
          <div>
            <div className="trust-stat-num">25+</div>
            <div className="trust-stat-label">Shops using Sahel</div>
          </div>
          <div>
            <div className="trust-stat-num">100%</div>
            <div className="trust-stat-label">Built for Somalia</div>
          </div>
          <div>
            <div className="trust-stat-num">$0</div>
            <div className="trust-stat-label">To get started</div>
          </div>
          <div>
            <div className="trust-stat-num">24/7</div>
            <div className="trust-stat-label">Access from anywhere</div>
          </div>
        </div>
      </div>

      <section className="section" id="features">
        <div className="wrap">
          <div className="section-head">
            <p className="section-eyebrow">What Sahel does</p>
            <h2>Everything your shop needs, nothing it doesn't.</h2>
          </div>
          <div className="features-grid">
            {[
              ["01", "Sales tracking", "Record every sale in seconds. See your daily, weekly, and monthly totals without doing the math yourself."],
              ["02", "Inventory that never lies", "Know exactly what's in stock right now. Get warned before you run out of what sells best."],
              ["03", "Customer credit, tracked", "See who owes you, how much, and for how long. No more relying on memory or scraps of paper."],
              ["04", "Expenses in one place", "Log what goes out, not just what comes in. Understand your real profit at a glance."],
              ["05", "Reports that make sense", "Clear, simple reports that show you what's working and what's not - no spreadsheets required."],
              ["06", "Works everywhere", "Phone, computer, or tablet. Your shop data follows you, always up to date, always in sync."]
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

      <section className="how" id="how">
        <div className="wrap section">
          <div className="section-head">
            <p className="section-eyebrow">Getting started</p>
            <h2>From paper to Sahel in three steps.</h2>
          </div>
          <div className="how-steps">
            {[
              ["1", "Create your shop", "Sign up with your name and shop details. Takes less than two minutes, no paperwork involved."],
              ["2", "Add your products", "List what you sell and how much you have. Sahel keeps count from here on out."],
              ["3", "Start selling", "Record sales as they happen. Watch your reports, stock, and credit update in real time."]
            ].map(([num, title, desc]) => (
              <div className="how-step" key={num}>
                <div className="how-step-num">{num}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonial">
        <div className="wrap">
          <blockquote>"Before Sahel I kept everything in a notebook. Now I know exactly who owes me and what's selling, every single day."</blockquote>
          <cite>&mdash; A Sahel shop owner, Mogadishu</cite>
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="wrap">
          <div className="section-head" style={{ marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
            <p className="section-eyebrow">Simple pricing</p>
            <h2>Start free. Upgrade when you're ready.</h2>
          </div>
          <div className="pricing-grid">
            <div className="price-card">
              <p className="price-name">Free</p>
              <p className="price-amt">$0</p>
              <p className="price-period">forever, no card needed</p>
              <ul className="price-list">
                <li>Up to 100 products</li>
                <li>Sales tracking</li>
                <li>Basic reports</li>
                <li>1 user account</li>
              </ul>
              <Link to="/signup" className="btn-secondary" style={{ width: "100%", textAlign: "center" }}>Start free</Link>
            </div>
            <div className="price-card featured">
              <span className="price-badge">Most popular</span>
              <p className="price-name">Pro</p>
              <p className="price-amt">$5</p>
              <p className="price-period">per month</p>
              <ul className="price-list">
                <li>Unlimited products</li>
                <li>Customer credit tracking</li>
                <li>Expense tracking</li>
                <li>Advanced reports</li>
                <li>Up to 3 user accounts</li>
              </ul>
              <Link to="/signup" className="btn-primary" style={{ width: "100%", textAlign: "center" }}>Start free trial</Link>
            </div>
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
              ["What is Sahel?", "Sahel is shop management software built specifically for small retail businesses in Somalia. It helps shop owners track sales, manage inventory, follow customer credit, and understand their expenses, all from one simple app."],
              ["Is Sahel free to use?", "Yes. Sahel has a free plan that covers the essentials - sales tracking, basic reports, and up to 100 products - with no credit card required. A Pro plan is available for shops that need more."],
              ["Do I need to install anything?", "No. Sahel works directly in your phone or computer's browser at mysahelapp.com. A desktop app and mobile app are also available for shop owners who prefer them."],
              ["Can I track customers who owe me money?", "Yes. Sahel's credit tracking feature lets you record what each customer owes, see payment history, and get a clear view of all outstanding debts across your shop."],
              ["Is my shop data private?", "Yes. Each shop's data on Sahel is private and only visible to that shop's account. No other Sahel user can see your sales, stock, or customer information."]
            ].map(([q, a]) => (
              <div className="faq-item" key={q}>
                <h3>{q}</h3>
                <p>{a}</p>
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

