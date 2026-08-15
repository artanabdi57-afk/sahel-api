import React, { useEffect, useState } from "react";
import { Menu, LogOut, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearSession, getCurrentShop } from "../lib/auth";
import { useLanguage } from "../lib/i18n";
import { useCurrency } from "../lib/api";
import { getNavForBusinessType } from "../config/navConfig";
import WhatsAppSupportButton from "./WhatsAppSupportButton.jsx";

const hiddenPages = [{ key: "profile", path: "/profile" }];

function NavItem({ item, compact = false, t, onClick }) {
  const Icon = item.icon;
  const label = item.label || t(item.key);
  return <NavLink to={item.path} onClick={onClick} title={compact ? label : undefined} className={({ isActive }) => ["group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200", compact ? "justify-center px-2" : "", isActive ? "bg-blue-50 text-blue-700 shadow-sm" : "text-slate-600 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-950"].join(" ")}><Icon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />{!compact && <span className="truncate">{label}</span>}{compact && <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-lg bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xl group-hover:block">{label}</span>}</NavLink>;
}

export default function Layout() {
  const { t } = useLanguage();
  useCurrency();
  const location = useLocation();
  const navigate = useNavigate();
  const shop = getCurrentShop();
  const items = getNavForBusinessType(shop?.business_type);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sahel-sidebar-collapsed") === "1");
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = [...items, ...hiddenPages].find((item) => item.path === location.pathname) || items[0];
  const isDashboard = location.pathname === "/dashboard";
  const isReports = location.pathname === "/reports";
  const shopName = shop?.shop_name?.trim() || "Your business";
  const shopInitial = shopName.charAt(0).toUpperCase();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  useEffect(() => { localStorage.setItem("sahel-sidebar-collapsed", collapsed ? "1" : "0"); }, [collapsed]);
  function handleLogout() { clearSession(); navigate("/login", { replace: true }); }

  const Sidebar = ({ mobile = false }) => (
    <aside className={[mobile ? "fixed inset-y-0 left-0 z-50 w-[280px] animate-[slideIn_.25s_ease-out]" : `fixed left-0 top-0 z-30 hidden h-screen lg:block ${collapsed ? "w-20" : "w-64"}`, "border-r border-slate-200 bg-white/95 p-4 shadow-xl shadow-slate-200/30 backdrop-blur-xl transition-[width,transform] duration-300 ease-out"].join(" ")}>
      <div className={`mb-7 flex items-center ${collapsed && !mobile ? "justify-center" : "justify-between gap-3"}`}>
        <div className="flex min-w-0 items-center gap-3">
          {shop?.logo ? <img src={shop.logo} alt={`${shopName} logo`} className="h-11 w-11 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-slate-200 transition-transform duration-300 hover:scale-105" /> : <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-black text-white shadow-lg shadow-blue-600/20 transition-transform duration-300 hover:scale-105" aria-label={`${shopName} logo`}>{shopInitial}</div>}
          {(!collapsed || mobile) && <div className="min-w-0 animate-[fadeIn_.2s_ease-out]"><p className="truncate text-lg font-black text-slate-950">{shopName}</p><p className="truncate text-xs font-semibold text-slate-400">{shop?.business_type ? shop.business_type.replace(/_/g, " ") : "Business workspace"}</p></div>}
        </div>
        {mobile ? <button className="rounded-lg p-2 text-slate-500 transition hover:rotate-90 hover:bg-slate-100 hover:text-slate-950" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button> : <button className="hidden rounded-lg p-2 text-slate-500 transition-all duration-200 hover:scale-105 hover:bg-slate-100 hover:text-slate-950 lg:block" onClick={() => setCollapsed((v) => !v)} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}</button>}
      </div>

      <nav className="space-y-1.5">{items.map((item) => <NavItem key={item.path} item={item} compact={collapsed && !mobile} t={t} onClick={() => mobile && setMobileOpen(false)} />)}</nav>
      <button className={`${collapsed && !mobile ? "justify-center" : ""} absolute bottom-5 left-4 right-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-950`} onClick={handleLogout} title={collapsed && !mobile ? t("logout") : undefined}><LogOut className="h-5 w-5 shrink-0" />{(!collapsed || mobile) && t("logout")}</button>
    </aside>
  );

  return <div className="min-h-screen bg-slate-50">
    <Sidebar />
    {collapsed && <button onClick={() => setCollapsed(false)} className="fixed left-[68px] top-5 z-40 hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-lg transition-all duration-200 hover:scale-110 hover:bg-blue-50 hover:text-blue-700 lg:flex" title="Expand sidebar" aria-label="Expand sidebar"><PanelLeftOpen className="h-4 w-4" /></button>}
    {mobileOpen && <><div className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden animate-[fadeIn_.2s_ease-out]" onClick={() => setMobileOpen(false)} /><Sidebar mobile /></>}
    <main className={`min-h-screen pb-24 transition-[margin] duration-300 lg:pb-0 ${collapsed ? "lg:ml-20" : "lg:ml-64"}`}>
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 px-4 py-2.5 backdrop-blur-xl lg:hidden"><div className="flex items-center gap-3"><button className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:scale-105 hover:bg-slate-50" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button><div className="flex min-w-0 items-center gap-2.5">{shop?.logo ? <img src={shop.logo} alt={`${shopName} logo`} className="h-8 w-8 rounded-lg object-cover" /> : <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-black text-white">{shopInitial}</div>}<div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800">{shopName}</p><p className="truncate text-[10px] font-bold uppercase tracking-wider text-blue-600">Sahel</p></div></div></div></header>
      <div className={isDashboard ? "mx-auto max-w-7xl px-4 py-5 lg:px-8 lg:py-8" : isReports ? "w-full px-4 py-5 lg:px-8 lg:py-7" : "mx-auto max-w-7xl px-4 py-5 lg:px-8 lg:py-7"}><Outlet /></div>
    </main>
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 px-2 pb-2 pt-1 shadow-lg backdrop-blur-xl lg:hidden"><div className="flex gap-1 overflow-x-auto">{items.map((item) => <NavItem key={item.path} item={item} compact={false} t={t} />)}</div></nav>
    <WhatsAppSupportButton />
  </div>;
}
