import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Award, BookOpen, CheckCircle, Play, Users, BarChart3, ChevronRight } from "lucide-react";

const styles = `
:root {
  --lms-blue: #2563eb;
  --lms-blue-dark: #1e40af;
  --lms-blue-light: #dbeafe;
  --white: #ffffff;
  --slate-50: #f8fafc;
  --slate-200: #e2e8f0;
  --slate-600: #475569;
  --slate-900: #0f172a;
  --glass: rgba(255, 255, 255, 0.8);
}

.lms-page { 
  background: var(--slate-50); 
  color: var(--slate-900); 
  font-family: 'Inter', system-ui, sans-serif;
  min-height: 100vh;
}

/* --- THE NEW LEARNING BADGE --- */
.badge-container {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.badge-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  background: var(--lms-blue);
  filter: blur(25px);
  opacity: 0.2;
  border-radius: 50%;
  animation: pulse-glow 3s infinite;
}

.professional-badge {
  position: relative;
  width: 80px;
  height: 90px;
  background: linear-gradient(135deg, var(--lms-blue), var(--lms-blue-dark));
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
  z-index: 2;
}

@keyframes pulse-glow {
  0% { transform: scale(1); opacity: 0.2; }
  50% { transform: scale(1.2); opacity: 0.4; }
  100% { transform: scale(1); opacity: 0.2; }
}

/* --- HERO & UI ELEMENTS --- */
.lms-hero {
  padding: 100px 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.hero-title {
  font-size: 64px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: var(--slate-900);
}

.hero-title span {
  color: var(--lms-blue);
}

.btn-lms-primary {
  background: var(--lms-blue);
  color: white;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-lms-primary:hover {
  background: var(--lms-blue-dark);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
}

/* --- LMS DASHBOARD PREVIEW CARD --- */
.lms-card-preview {
  background: var(--white);
  border: 1px solid var(--slate-200);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 40px 80px rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: var(--lms-blue-light);
  border-radius: 4px;
  margin: 12px 0;
  overflow: hidden;
}

.progress-fill {
  width: 75%;
  height: 100%;
  background: var(--lms-blue);
  border-radius: 4px;
}

.stat-chip {
  background: var(--lms-blue-light);
  color: var(--lms-blue-dark);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 960px) {
  .lms-hero { grid-template-columns: 1fr; text-align: center; }
  .hero-title { font-size: 44px; }
  .badge-container { margin: 0 auto 20px; }
}
`;

export default function LandingPro() {
  return (
    <div className="lms-page">
      <style>{styles}</style>
      
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        
        {/* Navigation */}
        <nav style={{ display: "flex", justifyContent: "space-between", padding: "32px 0", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "24px", color: "var(--lms-blue)" }}>
            <div className="professional-badge" style={{ width: "32px", height: "36px" }}>
              <Award size={18} />
            </div>
            Sahel LMS
          </div>
          <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
            <Link to="/login" style={{ color: "var(--slate-600)", textDecoration: "none", fontWeight: 600 }}>Login</Link>
            <Link to="/signup" className="btn-lms-primary" style={{ padding: "10px 20px" }}>Get Started</Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="lms-hero">
          <div>
            {/* THE NEW EYE-CATCHING BADGE */}
            <div className="badge-container">
              <div className="badge-glow"></div>
              <div className="professional-badge">
                <Award size={40} strokeWidth={2.5} />
              </div>
            </div>

            <h1 className="hero-title">
              Empower Your <span>Success</span> with Sahel Pro.
            </h1>
            <p style={{ fontSize: "20px", color: "var(--slate-600)", margin: "24px 0 40px", lineHeight: "1.5" }}>
              The #1 Professional Learning Management System designed for the next generation of Somali entrepreneurs. Master your business today.
            </p>
            <div style={{ display: "flex", gap: "16px" }}>
              <Link to="/signup" className="btn-lms-primary">
                Explore Courses <ChevronRight size={20} />
              </Link>
              <button style={{ background: "none", border: "1px solid var(--slate-200)", padding: "16px 32px", borderRadius: "12px", fontWeight: "600", cursor: "pointer" }}>
                View Demo
              </button>
            </div>
          </div>

          {/* Visual UI Elements */}
          <div style={{ position: "relative" }}>
            <div className="lms-card-preview">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <span className="stat-chip">Active Learning</span>
                <Users size={20} color="var(--slate-600)" />
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Inventory Management 101</h3>
              <p style={{ color: "var(--slate-600)", fontSize: "14px" }}>Module 4: Stock Optimization</p>
              
              <div className="progress-bar-container">
                <div className="progress-fill"></div>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700 }}>
                <span>75% Completed</span>
                <span style={{ color: "var(--lms-blue)" }}>Next: Final Exam</span>
              </div>

              <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--slate-200)", display: "flex", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", background: "var(--lms-blue-light)", borderRadius: "8px", display: "flex", alignItems: "center", justifyCenter: "center", color: "var(--lms-blue)" }}>
                   <Play size={20} style={{marginLeft: '12px', marginTop: '10px'}}/>
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "14px", margin: 0 }}>Resume Lecture</p>
                  <p style={{ fontSize: "12px", color: "var(--slate-600)", margin: 0 }}>Video · 12 minutes left</p>
                </div>
              </div>
            </div>

            {/* Smaller Floating Stat Card */}
            <div style={{
              position: "absolute",
              bottom: "-30px",
              left: "-20px",
              background: "var(--white)",
              padding: "16px",
              borderRadius: "16px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              border: "1px solid var(--slate-200)"
            }}>
              <div style={{ background: "#22c55e", color: "white", padding: "8px", borderRadius: "10px" }}>
                <CheckCircle size={20} />
              </div>
              <div>
                <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--slate-600)", textTransform: "uppercase" }}>Certificate</p>
                <p style={{ fontSize: "14px", fontWeight: 800 }}>Verified & Issued</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px", marginTop: "80px" }}>
           {[
             { icon: <BookOpen />, title: "Curated Content", desc: "Expertly designed courses for Somali markets." },
             { icon: <BarChart3 />, title: "Analytics", desc: "Track your progress with detailed performance data." },
             { icon: <Award />, title: "Certifications", desc: "Earn badges recognized by industry leaders." }
           ].map((feat, i) => (
             <div key={i} style={{ background: "white", padding: "32px", borderRadius: "20px", border: "1px solid var(--slate-200)" }}>
                <div style={{ color: "var(--lms-blue)", marginBottom: "16px" }}>{feat.icon}</div>
                <h4 style={{ fontWeight: 800, marginBottom: "8px" }}>{feat.title}</h4>
                <p style={{ color: "var(--slate-600)", fontSize: "14px" }}>{feat.desc}</p>
             </div>
           ))}
        </div>

      </div>
    </div>
  );
}
