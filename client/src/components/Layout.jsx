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
  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      title={compact ? label : undefined}
      className={({ isActive }) => [
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
        compact ? "justify-center px-2" : "",
        isActive ? "bg-blue-50 text-blue-700 shadow-sm" : "text-slate-600 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-950"
      ].join(" ")}
    >
      <Icon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
      {!compact && <span>{label}</span>}
    </NavLink>
  );
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

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  useEffect(() => { localStorage.setItem("sahel-sidebar-collapsed", collapsed ? "1" : "0"); }, [collapsed]);

  function handleLogout() { clearSession(); navigate("/login", { replace: true }); }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? "fixed inset-y-0 left-0 z-50 w-[280px]" : `fixed left-0 top-0 z-30 hidden h-screen lg:block ${collapsed ? "w-20" : "w-64"}`} border-r border-slate-200 bg-white/95 p-4 shadow-xl shadow-slate-200/30 backdrop-blur-xl transition-all duration-300`}>
      <div className={`mb-7 flex items-center ${collapsed && !mobile ? "justify-center" : "justify-between gap-3"}`}>
        <div className="flex min-w-0 items-center gap-3">
          {shop?.logo ? <img src={shop.logo} alt="Shop logo" className="h-11 w-11 shrink-0 rounded-xl object-cover shadow-sm" /> : <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-black text-white shadow-lg shadow-blue-600/20">S</div>}
          {(!collapsed || mobile) && <div className="min-w-0"><p className="truncate text-lg font-black text-slate-950">Sahel</p><p className="truncate text-xs font-medium text-slate-500">{shop?.shop_name || "Shop Management"}</p></div>}
        </div>
        {mobile ? <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button> : <button className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:block" onClick={() => setCollapsed((v) => !v)} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}</button>}
      </div>

      <nav className="space-y-1.5">{items.map((item) => <NavItem key={item.path} item={item} compact={collapsed && !mobile} t={t} onClick={() => mobile && setMobileOpen(false)} />)}</nav>

      <button className={`${collapsed && !mobile ? "justify-center" : ""} absolute bottom-5 left-4 right-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950`} onClick={handleLogout} title={collapsed && !mobile ? t("logout") : undefined}><LogOut className="h-5 w-5 shrink-0" />{(!collapsed || mobile) && t("logout")}</button>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      {mobileOpen && <><div className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} /><Sidebar mobile /></>}

      <main className={`pb-24 transition-[margin] duration-300 lg:pb-0 ${collapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
              {!isDashboard && <div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">Sahel</p><h1 className="text-xl font-black tracking-tight text-slate-950">{current.label || t(current.key)}</h1><p className="text-xs font-medium text-slate-500">{shop?.shop_name}</p></div>}
              {isDashboard && <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Sahel</p><p className="text-sm font-semibold text-slate-600">{shop?.shop_name || "Business workspace"}</p></div>}
            </div>
            <div className="hidden items-center gap-2 sm:flex"><button className="btn-secondary" onClick={handleLogout}><LogOut className="h-4 w-4" />{t("logout")}</button></div>
          </div>
        </header>

        <div className={isDashboard ? "mx-auto max-w-7xl px-4 py-5 lg:px-8 lg:py-7" : isReports ? "w-full px-4 py-5 lg:px-8" : "mx-auto max-w-7xl px-4 py-5 lg:px-8"}><Outlet /></div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 px-2 pb-2 pt-1 shadow-lg backdrop-blur-xl lg:hidden"><div className="flex gap-1 overflow-x-auto">{items.map((item) => <NavItem key={item.path} item={item} compact={false} t={t} />)}</div></nav>
      <WhatsAppSupportButton />
    </div>
  );
}
