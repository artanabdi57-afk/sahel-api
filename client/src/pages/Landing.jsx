import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  Package, 
  ShieldCheck, 
  PieChart, 
  ArrowRight, 
  ChevronDown,
  LineChart,
  Wallet
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

// Sample Data for the Visual Graphics
const graphData = [
  { day: "Mon", sales: 400 },
  { day: "Tue", sales: 700 },
  { day: "Wed", sales: 500 },
  { day: "Thu", sales: 1200 },
  { day: "Fri", sales: 900 },
  { day: "Sat", sales: 1500 },
  { day: "Sun", sales: 1800 },
];

const styles = `
  .sahel-container { font-family: 'Inter', sans-serif; background: #ffffff; color: #1e293b; scroll-behavior: smooth; }
  .nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 5%; background: #fff; border-bottom: 1px solid #f1f5f9; position: sticky; top: 0; z-index: 100; }
  .logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 22px; color: #2563eb; text-decoration: none; }
  
  .hero { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; padding: 80px 5%; align-items: center; min-height: 80vh; }
  .hero-text h1 { font-size: 52px; font-weight: 800; line-height: 1.1; margin-bottom: 20px; color: #0f172a; }
  .hero-text p { font-size: 18px; color: #64748b; margin-bottom: 35px; line-height: 1.6; }
  
  .btn-group { display: flex; gap: 15px; }
  .btn-get-started { background: #2563eb; color: #fff; padding: 16px 30px; border-radius: 8px; font-weight: 700; text-decoration: none; transition: 0.3s; border: none; cursor: pointer; }
  .btn-get-started:hover { background: #1d4ed8; transform: translateY(-2px); }
  .btn-know-us { background: #fff; color: #2563eb; padding: 16px 30px; border-radius: 8px; font-weight: 700; text-decoration: none; border: 2px solid #2563eb; transition: 0.3s; cursor: pointer; }
  .btn-know-us:hover { background: #eff6ff; }

  .visual-demo { background: #f8fafc; border-radius: 24px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
  .demo-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
  .inventory-tag { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }

  .features-section { padding: 100px 5%; background: #fff; }
  .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-top: 50px; }
  .feature-card { padding: 40px; border-radius: 20px; border: 1px solid #f1f5f9; transition: 0.3s; background: #fff; }
  .feature-card:hover { border-color: #2563eb; box-shadow: 0 10px 30px rgba(37,99,235,0.05); transform: translateY(-5px); }
  .icon-box { width: 50px; height: 50px; background: #eff6ff; color: #2563eb; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }

  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; text-align: center; padding-top: 40px; }
    .btn-group { justify-content: center; }
    .hero-text h1 { font-size: 40px; }
  }
`;

export default function SahelLanding() {
  const knowUsRef = useRef(null);

  const scrollToKnowUs = () => {
    knowUsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="sahel-container">
      <style>{styles}</style>

      {/* NAVIGATION */}
      <nav className="nav">
        <Link to="/" className="logo">
          <TrendingUp size={28} />
          SahelInsights
        </Link>
        <div style={{ display: "flex", gap: "15px" }}>
          <Link to="/login" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '600', padding: '10px' }}>Login</Link>
          <Link to="/signup" className="btn-get-started" style={{ padding: '10px 20px' }}>Register</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-text">
          <h1>Professional Shop Management Tool.</h1>
          <p>
            Stop using notebooks. Sahel Insights gives you the clarity to track your sales, 
            inventory, and expenses in one reliable, beautiful dashboard.
          </p>
          <div className="btn-group">
            <Link to="/signup" className="btn-get-started">Start with free trial</Link>
            <button onClick={scrollToKnowUs} className="btn-know-us">Know about us</button>
          </div>
        </div>

        {/* INTERACTIVE GRAPH VISUAL */}
        <div className="visual-demo">
          <div className="demo-header">
            <div>
              <span className="inventory-tag">Live Analytics</span>
              <h3 style={{ margin: '8px 0 0', fontSize: '18px', fontWeight: '800' }}>Sales Performance</h3>
            </div>
            <LineChart color="#2563eb" />
          </div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <AreaChart data={graphData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-around', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Stock Value</p>
              <p style={{ fontWeight: '800', margin: 0 }}>$14,200</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Daily Profit</p>
              <p style={{ fontWeight: '800', color: '#166534', margin: 0 }}>+$840</p>
            </div>
          </div>
        </div>
      </section>

      {/* KNOW ABOUT US SECTION */}
      <section className="features-section" ref={knowUsRef}>
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '15px' }}>Reliable Business Management</h2>
          <p style={{ color: '#64748b' }}>
            Sahel Insights is built for shop owners who need accuracy. We help you manage 
            every aspect of your shop with tools that are fast and easy to use.
          </p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="icon-box"><Package size={24} /></div>
            <h3>Track Inventory</h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Real-time updates on your stock levels. Never run out of your best-selling items again.</p>
          </div>

          <div className="feature-card">
            <div className="icon-box"><TrendingUp size={24} /></div>
            <h3>Sales Tracking</h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Every transaction is recorded instantly. See your daily, weekly, and monthly growth automatically.</p>
          </div>

          <div className="feature-card">
            <div className="icon-box"><PieChart size={24} /></div>
            <h3>Product Insights</h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Know exactly which products are making you money and which ones are sitting on the shelf.</p>
          </div>

          <div className="feature-card">
            <div className="icon-box"><Wallet size={24} /></div>
            <h3>Manage Expenses</h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Track your rent, utilities, and wholesale orders to see your true net profit.</p>
          </div>

          <div className="feature-card">
            <div className="icon-box"><ShieldCheck size={24} /></div>
            <h3>Very Reliable</h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Your data is secure and always accessible from your phone or computer, 24/7.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '60px 5%', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontWeight: '600' }}>Ready to optimize your shop?</p>
        <Link to="/signup" className="btn-get-started" style={{ display: 'inline-block', marginTop: '10px' }}>Start with free trial</Link>
      </footer>
    </div>
  );
}
