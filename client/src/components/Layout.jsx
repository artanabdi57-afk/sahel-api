import React from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  CreditCard,
  Home,
  LogOut,
  PlusCircle,
  ReceiptText,
  Settings,
  ShoppingCart
} from "lucide-react";
import { clearSession, getCurrentShop } from "../lib/auth";
import { useLanguage } from "../lib/i18n";
import { useCurrency } from "../lib/api";
import WhatsAppSupportButton from "./WhatsAppSupportButton.jsx";

const navItems = [
  { key: "dashboard", path: "/dashboard", icon: Home },
  { key: "inventory", path: "/inventory", icon: Boxes },
  { key: "newSale", path: "/sale", icon: PlusCircle },
  { key: "credits", path: "/credits", icon: CreditCard },
  { key: "orders", path: "/orders", icon: ClipboardList },
  { key: "expenses", path: "/expenses", icon: ReceiptText },
  { key: "reports", path: "/reports", icon: BarChart3 },
  { key: "settings", path: "/settings", icon: Settings }
];

const hiddenPages = [
  { key: "profile", path: "/profile" }
];

function NavItem({ item, compact = false, t }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
          compact ? "flex-1 flex-col justify-center gap-1 px-1 py-2 text-[11px]" : "",
          isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
        ].join(" ")
      }
    >
      <Icon className={compact ? "h-5 w-5" : "h-5 w-5"} />
      <span className={compact ? "leading-none" : ""}>{t(item.key)}</span>
    </NavLink>
  );
}

export default function Layout() {
  const { t } = useLanguage();
  useCurrency(); // Re-renders the whole app tree when currency changes in Settings
  const location = useLocation();
  const navigate = useNavigate();
  const current = [...navItems, ...hiddenPages].find((item) => item.path === location.pathname) || navItems[0];
  const isDashboard = location.pathname === "/dashboard";
  const isReports = location.pathname === "/reports";
  const shop = getCurrentShop();

  function handleLogout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-200 bg-white p-5 lg:block">
        <div className="mb-8 flex items-center gap-3">
          {shop?.logo ? (
            <img src={shop.logo} alt="Shop logo" className="h-11 w-11 rounded-lg object-cover" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-lg font-black text-white">
              S
            </div>
          )}
          <div>
            <p className="text-lg font-bold text-slate-950">Sahel</p>
            <p className="text-xs font-medium text-slate-500">{shop?.shop_name || "Shop Management"}</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} t={t} />
          ))}
        </nav>

        <button
          className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {t("logout")}
        </button>
      </aside>

      <main className="pb-24 lg:ml-64 lg:pb-0">
        {!isDashboard ? (
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Sahel</p>
                <h1 className="text-xl font-bold text-slate-950">{t(current.key)}</h1>
                <p className="text-sm font-medium text-slate-500">{shop?.shop_name}</p>
              </div>
              <button className="btn-secondary hidden sm:inline-flex" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                {t("logout")}
              </button>
            </div>
          </header>
        ) : null}

        <div
          className={
            isDashboard
              ? "mx-auto max-w-7xl px-4 py-4 lg:px-8 lg:py-7"
              : isReports
                ? "w-full px-4 py-5 lg:px-8"
                : "mx-auto max-w-7xl px-4 py-5 lg:px-8"
          }
        >
          <Outlet />
        </div>
      </main>

  <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white px-2 pb-2 pt-1 lg:hidden">
  <div className="flex gap-1 overflow-x-auto">
    {navItems.map((item) => (
      <NavItem key={item.path} item={item} compact t={t} />
    ))}
  </div>
</nav>

      <WhatsAppSupportButton />
    </div>
  );
}
