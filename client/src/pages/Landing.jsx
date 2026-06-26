import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Package, 
  BarChart3, 
  ShoppingCart, 
  Wallet, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  FileText
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

// Live Graph Data
const demoSalesData = [
  { day: "Mon", sales: 400 },
  { day: "Tue", sales: 800 },
  { day: "Wed", sales: 600 },
  { day: "Thu", sales: 1300 },
  { day: "Fri", sales: 1100 },
  { day: "Sat", sales: 1700 },
  { day: "Sun", sales: 2100 },
];

const styles = `
  .sahel-web { font-family: 'Inter', sans-serif; background: #ffffff; color: #0f172a; scroll-behavior: smooth; }
  .navbar { display: flex; justify-content: space-between; align-items: center; padding: 20px 6%; background: #ffffff; border-bottom: 1px solid #f1f5f9; position: sticky; top: 0; z-index: 100; }
  
  /* THE LOGO STYLE */
  .logo-container { display: flex; align-items: center; gap: 12px; text-decoration: none; }
  .logo-icon { width: 42px; height: 42px; background: #3b82f6; border-radius: 10px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
  .logo-text { font-size: 28px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px; }
  
  /* HERO SECTION */
  .hero-box { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 60px; padding: 100px 6%; align-items: center; min-height: 85vh; background: radial-gradient(circle at top right, #eff6ff, #ffffff); }
  .hero-content h1 { font-size: 60px; font-weight: 800; line-height: 1.05; color: #0f172a; margin-bottom: 24px; }
  .hero-content p { font-size: 20px; color: #475569; margin-bottom: 40px; line-height: 1.6; max-width: 540px; }
  
  .actions { display: flex; gap: 16px; }
  .btn-blue { background: #2563eb; color: #ffffff; padding: 18px 34px; border-radius: 12px; font-weight: 700; text-decoration: none; border: none; cursor: pointer; transition: 0.2s; font-size: 16px; }
  .btn-blue:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(37,99,235,0.2); }
  .btn-white { background: #ffffff; color: #2563eb; padding: 18px 34px; border-radius: 12px; font-weight: 700; text-decoration: none; border: 2px solid #2563eb; cursor: pointer; transition: 0.2s; font-size: 16px; }
  .btn-white:hover { background: #f8fafc; }

  /* GRAPH VISUAL */
  .graph-card { background: #ffffff; border-radius: 30px; padding: 35px; border: 1px solid #e2e8f0; box-shadow: 0 30px 60px rgba(15,23,42,0.1); }
  .graph-label { font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; display: block; }
  
  /* KNOW ABOUT US SECTION */
  .about-section { padding: 120px 6%; background: #ffffff; }
  .section-header { text-align: center; margin-bottom: 80px; }
  .section-header h2 { font-size: 42px; font-weight: 800; color: #0f172a; }
  
  .tool-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; }
  .tool-card { padding: 40px; border-radius: 24px; background: #f8fafc; border: 1px solid #f1f5f9; transition: 0.3s; }
  .tool-card:hover { background: #ffffff; border-color: #2563eb; transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
  .tool-icon { width: 56px; height: 56px; background: #ffffff; color: #2563eb; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
  .tool-card h3 { font-size: 22px; font-weight: 800; margin-bottom: 12px; }
  .tool-card p { color: #64748b; line-height: 1.6; font-size: 15px; }

  @media (max-width: 1024px) {
    .hero-box { grid-template-columns: 1fr; text-align: center; padding-top: 60px; }
    .hero-content h1 { font-size: 45px; }
    .hero-content p { margin: 0 auto 40px; }
    .actions { justify-content: center; }
  }
`;

export default function SahelLanding() {
  const aboutRef = useRef(null);
  const handleScroll = () => aboutRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="sahel-web">
      <style>{styles}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        <Link to="/" className="logo-container">
          <div className="logo-icon">
            <TrendingUp size={24} color="white" />
          </div>
          <span className="logo-text">Sahel</span>
        </Link>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <Link to="/login" style={{ textDecoration: 'none', color: '#475569', fontWeight: '600' }}>Login</Link>
          <Link to="/signup" className="btn-blue" style={{ padding: '12px 24px', fontSize: '14px' }}>Register</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-box">
        <div className="hero-content">
          <h1>Manage your Shop with Intelligence.</h1>
          <p>
            The most reliable business management tool for retailers. 
            Track sales, manage inventory, and monitor expenses with one simple app.
          </p>
          <div className="actions">
            <Link to="/signup" className="btn-blue">Start with free trial</Link>
            <button onClick={handleScroll} className="btn-white">Know about us</button>
          </div>
        </div>

        {/* INTERACTIVE DEMO GRAPH */}
        <div className="graph-card">
          <span className="graph-label">Daily Sales Activity</span>
          <h3 style={{ margin: '0 0 30px', fontSize: '24px', fontWeight: '800' }}>Live Performance</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={demoSalesData}>
                <defs>
                  <linearGradient id="chartBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#2563eb" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#chartBlue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
             <div>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: '700' }}>TOP PRODUCT</p>
                <p style={{ margin: 0, fontWeight: '800' }}>Sugar (50kg)</p>
             </div>
             <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: '700' }}>REVENUE</p>
                <p style={{ margin: 0, fontWeight: '800', color: '#2563eb' }}>$2,450.00</p>
             </div>
          </div>
        </div>
      </section>

      {/* KNOW ABOUT US / FEATURES */}
      <section className="about-section" ref={aboutRef}>
        <div className="section-header">
          <h2>Everything your shop needs</h2>
          <p style={{ color: '#64748b', fontSize: '18px', marginTop: '10px' }}>
            Sahel is more than an app. It's a reliable partner for your business growth.
          </p>
        </div>

        <div className="tool-grid">
          <div className="tool-card">
            <div className="tool-icon"><Package size={28} /></div>
            <h3>Manage Inventory</h3>
            <p>Know exactly what is in your store. Track stock levels, receive low-stock alerts, and manage incoming orders effortlessly.</p>
          </div>

          <div className="tool-card">
            <div className="tool-icon"><BarChart3 size={28} /></div>
            <h3>Track Sales</h3>
            <p>Record every transaction instantly. Monitor your daily revenue and see your profit margins grow with clean, visual reports.</p>
          </div>

          <div className="tool-card">
            <div className="tool-icon"><TrendingUp size={28} /></div>
            <h3>Best-Selling Products</h3>
            <p>Our intelligence tool tells you exactly which products are moving the fastest so you can double down on what works.</p>
          </div>

          <div className="tool-card">
            <div className="tool-icon"><Wallet size={28} /></div>
            <h3>Track Expenses</h3>
            <p>Log your rent, electricity, and wholesale costs. Know your true net profit after all expenses are deducted.</p>
          </div>

          <div className="tool-card">
            <div className="tool-icon"><ShoppingCart size={28} /></div>
            <h3>Order Management</h3>
            <p>Keep track of when you make an order with suppliers. Manage your supply chain without the headache of missing items.</p>
          </div>

          <div className="tool-card">
            <div className="tool-icon"><ShieldCheck size={28} /></div>
            <h3>Reliable & Secure</h3>
            <p>Built with stability in mind. Your business data is secure, private, and accessible to you 24/7 from any device.</p>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <div style={{ background: '#f8fafc', padding: '100px 6%', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '20px' }}>Ready to optimize your shop?</h2>
        <Link to="/signup" className="btn-blue">Start free trial with Sahel</Link>
      </div>
    </div>
  );
}
