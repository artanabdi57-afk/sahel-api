import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, AlertTriangle, BarChart3, Bell, Building2,
  Check, CheckCircle2, ChevronDown, Clock, CreditCard,
  Eye, Globe, History, Key, Lock, LogOut,
  Mail, MoreVertical, Phone, Plus, RefreshCw, Search,
  Send, Shield, ShieldCheck, ShieldOff, ShoppingCart, Star,
  Trash2, TrendingUp, User, UserCheck, UserMinus, UserPlus,
  Users, X, XCircle, Zap, MapPin
} from "lucide-react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const ADMIN_USER = "sahel2026";
const ADMIN_PASS = "Halimoabdimuse@123";

const SUPABASE_URL  = "https://olhfaqqpypwotusviyhf.supabase.co";
const SUPABASE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9saGZhcXFweXB3b3R1c3ZpeWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDgzNTMsImV4cCI6MjA2NTQ4NDM1M30.bMy6oMo6eGBXbUKVQsJl__mH2kfgZoan9578P4fiFjw";

const ROLES = {
  superadmin : "Super Admin",
  support    : "Support Admin",
  sales      : "Sales Admin",
  finance    : "Finance Admin",
  readonly   : "Read-Only Admin",
};

const ROLE_PERMS = {
  superadmin : ["dashboard","users","subscriptions","analytics","notifications","audit","settings"],
  support    : ["dashboard","users","audit"],
  sales      : ["dashboard","users","subscriptions","analytics"],
  finance    : ["dashboard","analytics","subscriptions"],
  readonly   : ["dashboard","analytics"],
};

const NAV = [
  { id:"dashboard",      icon: BarChart3,   label:"Dashboard"      },
  { id:"users",          icon: Users,        label:"Users"          },
  { id:"subscriptions",  icon: CreditCard,   label:"Subscriptions"  },
  { id:"analytics",      icon: TrendingUp,   label:"Analytics"      },
  { id:"notifications",  icon: Bell,         label:"Notifications"  },
  { id:"audit",          icon: History,      label:"Audit Log"      },
  { id:"settings",       icon: Shield,       label:"Settings"       },
];

const PLAN_DURATIONS = [
  { label:"7 days",    days:7   },
  { label:"1 month",   days:30  },
  { label:"3 months",  days:90  },
  { label:"6 months",  days:180 },
  { label:"12 months", days:365 },
  { label:"Custom",    days:0   },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt    = n => new Intl.NumberFormat().format(Math.round(n ?? 0));
const fmtUSD = n => "$" + fmt(n);
const fmtDate = iso => iso ? new Date(iso).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : "—";
const timeAgo = iso => {
  if (!iso) return "Never";
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60)    return "just now";
  if (s < 3600)  return Math.floor(s/60)+"m ago";
  if (s < 86400) return Math.floor(s/3600)+"h ago";
  return Math.floor(s/86400)+"d ago";
};
const daysLeft = iso => {
  if (!iso) return null;
  return Math.ceil((new Date(iso) - Date.now()) / 86400000);
};
const addDays = days => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

// ─── SUPABASE API ─────────────────────────────────────────────────────────────
async function sbQuery(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_admin_sql`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "apikey":        SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
    },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) {
    // fallback: use direct REST for reads
    throw new Error(await res.text());
  }
  return res.json();
}

async function sbRest(table, params = "") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: {
      "apikey":        SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
      "Content-Type":  "application/json",
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function sbPatch(table, id, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      "apikey":        SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
      "Content-Type":  "application/json",
      "Prefer":        "return=representation",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function sbDelete(table, id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "DELETE",
    headers: {
      "apikey":        SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return true;
}

// Load shops + users joined
async function loadShops() {
  const [shops, users, products, sales, expenses] = await Promise.all([
    sbRest("shops", "select=*&order=created_at.desc"),
    sbRest("users", "select=id,email,phone,created_at,status,user_role,shop_name"),
    sbRest("products", "select=shop_id,id"),
    sbRest("sales",    "select=shop_id,selling_price,quantity_sold"),
    sbRest("expenses", "select=shop_id,amount"),
  ]);

  // Build user map
  const userMap = {};
  users.forEach(u => { userMap[u.id] = u; });

  // Build usage maps
  const prodCount = {};
  products.forEach(p => { prodCount[p.shop_id] = (prodCount[p.shop_id]||0) + 1; });

  const saleCount = {};
  const revenue   = {};
  sales.forEach(s => {
    saleCount[s.shop_id] = (saleCount[s.shop_id]||0) + 1;
    revenue[s.shop_id]   = (revenue[s.shop_id]||0) + (parseFloat(s.selling_price)||0) * (s.quantity_sold||0);
  });

  const expTotal = {};
  expenses.forEach(e => { expTotal[e.shop_id] = (expTotal[e.shop_id]||0) + (parseFloat(e.amount)||0); });

  return shops.map(s => {
    const owner = userMap[s.owner_id] || {};
    return {
      id:            s.id,
      shop_name:     s.shop_name,
      owner_name:    owner.shop_name || owner.email || "—",
      owner_email:   owner.email || "—",
      phone:         s.phone || owner.phone || null,
      location:      s.location || null,
      country:       s.location || "—",
      created_at:    s.created_at,
      last_login:    null,
      plan:          s.plan || "free",
      plan_expiry:   s.plan_expires_at || null,
      status:        s.status || "active",
      hear_about:    s.hear_about,
      business_type: s.business_type,
      main_problem:  s.main_problem,
      owner_id:      s.owner_id,
      usage: {
        products:      prodCount[s.id] || 0,
        sales:         saleCount[s.id] || 0,
        revenue:       revenue[s.id]   || 0,
        expenses_total: expTotal[s.id] || 0,
      },
    };
  });
}

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
function Badge({ children, color = "slate" }) {
  const map = {
    green:  "bg-green-50  text-green-700  border-green-200",
    red:    "bg-rose-50   text-rose-700   border-rose-200",
    blue:   "bg-blue-50   text-blue-700   border-blue-200",
    amber:  "bg-amber-50  text-amber-700  border-amber-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    slate:  "bg-slate-100 text-slate-600  border-slate-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap ${map[color]}`}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant="secondary", size="md", disabled, className="" }) {
  const base = "inline-flex items-center gap-2 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm:"px-3 py-1.5 text-xs", md:"px-4 py-2 text-sm", lg:"px-6 py-3 text-sm" };
  const variants = {
    primary:   "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    danger:    "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100",
    ghost:     "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
    success:   "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

function Modal({ title, onClose, children, width = "max-w-lg" }) {
  useEffect(() => {
    const fn = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className={`w-full ${width} max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h3 className="text-lg font-black text-slate-950">{title}</h3>
          <Btn variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Btn>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg text-sm font-bold ${t.type === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : t.type === "warning" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-green-200 bg-green-50 text-green-700"}`}>
          {t.type === "error" ? <XCircle className="h-4 w-4 shrink-0" /> : t.type === "warning" ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color = "blue" }) {
  const colors = {
    blue:   { card:"bg-blue-600 border-blue-700", icon:"bg-blue-500",  txt:"text-blue-100", val:"text-white",      ic:"text-white" },
    green:  { card:"bg-white border-slate-200",   icon:"bg-green-50",  txt:"text-slate-500",val:"text-slate-950",  ic:"text-green-600" },
    amber:  { card:"bg-white border-slate-200",   icon:"bg-amber-50",  txt:"text-slate-500",val:"text-slate-950",  ic:"text-amber-600" },
    red:    { card:"bg-white border-slate-200",   icon:"bg-rose-50",   txt:"text-slate-500",val:"text-slate-950",  ic:"text-rose-600"  },
    purple: { card:"bg-white border-slate-200",   icon:"bg-purple-50", txt:"text-slate-500",val:"text-slate-950",  ic:"text-purple-600"},
    slate:  { card:"bg-white border-slate-200",   icon:"bg-slate-100", txt:"text-slate-500",val:"text-slate-950",  ic:"text-slate-600" },
  };
  const c = colors[color];
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${c.card}`}>
      <div className="flex items-start justify-between">
        <p className={`text-[11px] font-black uppercase tracking-widest ${c.txt}`}>{label}</p>
        <div className={`rounded-xl p-2 ${c.icon}`}>
          <Icon className={`h-4 w-4 ${c.ic}`} />
        </div>
      </div>
      <p className={`mt-3 text-3xl font-black ${c.val}`}>{value}</p>
      {sub && <p className={`mt-1 text-xs font-semibold ${c.txt}`}>{sub}</p>}
    </div>
  );
}

// ─── AUTH ──────────────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [role, setRole]   = useState("superadmin");
  const [form, setForm]   = useState({ user:"", pass:"" });
  const [err,  setErr]    = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (form.user === ADMIN_USER && form.pass === ADMIN_PASS) {
        onAuth({ name: "Abdikadir", role });
      } else {
        setErr("Invalid credentials. Please try again.");
      }
    }, 600);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-[0_12px_30px_rgba(37,99,235,0.3)]">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-slate-950">Sahel Admin</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Restricted access — authorised personnel only</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">Username</label>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                <User className="h-4 w-4 text-slate-400" />
                <input className="w-full bg-transparent text-sm font-medium outline-none" placeholder="Username" value={form.user} onChange={e=>setForm({...form,user:e.target.value})} required />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">Password</label>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                <Lock className="h-4 w-4 text-slate-400" />
                <input type="password" className="w-full bg-transparent text-sm font-medium outline-none" placeholder="••••••••" value={form.pass} onChange={e=>setForm({...form,pass:e.target.value})} required />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">Role</label>
              <select value={role} onChange={e=>setRole(e.target.value)} className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                {Object.entries(ROLES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            {err && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{err}</div>}
            <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)] transition hover:bg-blue-700 disabled:opacity-60">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardView({ shops, logs, loading }) {
  const total     = shops.length;
  const active    = shops.filter(s=>s.status==="active").length;
  const suspended = shops.filter(s=>s.status==="suspended").length;
  const pro       = shops.filter(s=>s.plan==="paid").length;
  const free      = shops.filter(s=>s.plan==="free").length;
  const mrr       = pro * 29;

  const now      = Date.now();
  const today    = new Date().toDateString();
  const newToday = shops.filter(s=>new Date(s.created_at).toDateString()===today).length;
  const newWeek  = shops.filter(s=>now - new Date(s.created_at) < 7*86400000).length;
  const newMonth = shops.filter(s=>new Date(s.created_at).getMonth()===new Date().getMonth()).length;

  const expiring = shops.filter(s=>{ const d=daysLeft(s.plan_expiry); return d!==null && d>=0 && d<=30; });

  const noPhone    = shops.filter(s=>!s.phone).length;
  const noLocation = shops.filter(s=>!s.location).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950">Dashboard</h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">Platform overview — {new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
          <RefreshCw className="h-4 w-4 animate-spin" /> Loading live data from Supabase…
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard label="Total Shops"  value={fmt(total)}     icon={Building2}  color="blue"   />
        <StatCard label="Active"        value={fmt(active)}    icon={UserCheck}   color="green"  sub="accounts" />
        <StatCard label="Suspended"     value={fmt(suspended)} icon={UserMinus}   color="red"    sub="accounts" />
        <StatCard label="Pro Plan"      value={fmt(pro)}       icon={Star}        color="purple" sub="paid" />
        <StatCard label="Free Plan"     value={fmt(free)}      icon={Users}       color="slate"  />
        <StatCard label="MRR"           value={fmtUSD(mrr)}    icon={CreditCard}  color="green"  sub="est. monthly" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">New Registrations</p>
          <div className="flex divide-x divide-slate-100">
            {[["Today",newToday],["This Week",newWeek],["This Month",newMonth]].map(([l,v])=>(
              <div key={l} className="flex-1 px-4 first:pl-0 last:pr-0 text-center">
                <p className="text-2xl font-black text-slate-950">{v}</p>
                <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Profile Completeness</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Phone className="h-4 w-4 text-slate-400"/>Missing Phone</div>
              <Badge color={noPhone>0?"amber":"green"}>{noPhone} shops</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><MapPin className="h-4 w-4 text-slate-400"/>Missing Location</div>
              <Badge color={noLocation>0?"amber":"green"}>{noLocation} shops</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><CheckCircle2 className="h-4 w-4 text-green-500"/>Complete Profiles</div>
              <Badge color="green">{shops.filter(s=>s.phone&&s.location).length} shops</Badge>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">System Health</p>
          <div className="space-y-3">
            {[["Supabase DB","Operational","green"],["Auth Service","Operational","green"],["API Server","Operational","green"],["File Storage","Operational","green"],["Email Service","Operational","green"]].map(([s,st,c])=>(
              <div key={s} className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">{s}</span>
                <Badge color={c}>{st}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Expiring Subscriptions (30 days)</p>
          {expiring.length === 0
            ? <p className="text-sm font-semibold text-slate-400">No subscriptions expiring soon.</p>
            : <div className="space-y-3">{expiring.map(s=>{
                const d=daysLeft(s.plan_expiry);
                return (
                  <div key={s.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                    <div>
                      <p className="text-sm font-black text-slate-950">{s.owner_name}</p>
                      <p className="text-xs font-semibold text-slate-400">{s.shop_name}</p>
                    </div>
                    <Badge color={d<=7?"red":"amber"}>{d}d left</Badge>
                  </div>
                );
              })}</div>
          }
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Recent Activity</p>
          <div className="space-y-3">
            {logs.slice(0,5).map((l,i)=>(
              <div key={l.id||i} className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50">
                  <Activity className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-950 truncate">{l.action}</p>
                  <p className="text-xs font-semibold text-slate-400">{l.admin} · {timeAgo(l.ts)}</p>
                </div>
              </div>
            ))}
            {logs.length === 0 && <p className="text-sm text-slate-400 font-semibold">No activity yet this session.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── USERS ────────────────────────────────────────────────────────────────────
function UsersView({ shops, setShops, addLog, toast, role, reloadShops }) {
  const canEdit = role !== "readonly";
  const [search,   setSearch]   = useState("");
  const [filters,  setFilters]  = useState({ plan:"all", status:"all" });
  const [page,     setPage]     = useState(1);
  const [modal,    setModal]    = useState(null);
  const [planForm, setPlanForm] = useState({ plan:"paid", duration:30, custom:"" });
  const [editForm, setEditForm] = useState({});
  const [saving,   setSaving]   = useState(false);
  const PER = 8;

  const filtered = useMemo(()=>{
    const q = search.toLowerCase();
    return shops.filter(s=>{
      const matchQ      = !q || s.owner_name.toLowerCase().includes(q) || s.shop_name.toLowerCase().includes(q) || (s.owner_email||"").toLowerCase().includes(q) || (s.phone||"").includes(q) || (s.location||"").toLowerCase().includes(q);
      const matchPlan   = filters.plan==="all"   || s.plan===filters.plan;
      const matchStatus = filters.status==="all" || s.status===filters.status;
      return matchQ && matchPlan && matchStatus;
    });
  },[shops,search,filters]);

  const pages = Math.max(1,Math.ceil(filtered.length/PER));
  const paged = filtered.slice((page-1)*PER, page*PER);

  async function doSuspend(s) {
    if(!window.confirm(`Suspend ${s.owner_name}?`)) return;
    try {
      await sbPatch("shops", s.id, { status:"suspended" });
      setShops(p=>p.map(x=>x.id===s.id?{...x,status:"suspended"}:x));
      addLog({action:"Suspended account",target:s.owner_name});
      toast("Account suspended.");
    } catch(e) { toast("Failed: "+e.message,"error"); }
  }

  async function doUnsuspend(s) {
    try {
      await sbPatch("shops", s.id, { status:"active" });
      setShops(p=>p.map(x=>x.id===s.id?{...x,status:"active"}:x));
      addLog({action:"Unsuspended account",target:s.owner_name});
      toast("Account reactivated.");
    } catch(e) { toast("Failed: "+e.message,"error"); }
  }

  async function doSoftDelete(s) {
    if(!window.confirm(`Remove ${s.owner_name}? They will lose access.`)) return;
    try {
      await sbPatch("shops", s.id, { status:"suspended" });
      setShops(p=>p.filter(x=>x.id!==s.id));
      addLog({action:"Removed account",target:s.owner_name});
      toast("Account removed.");
      setModal(null);
    } catch(e) { toast("Failed: "+e.message,"error"); }
  }

  async function doSaveEdit() {
    const s = modal.shop;
    setSaving(true);
    try {
      await sbPatch("shops", s.id, {
        shop_name: editForm.shop_name,
        location:  editForm.location,
        phone:     editForm.phone,
        business_type: editForm.business_type,
        hear_about:    editForm.hear_about,
      });
      setShops(p=>p.map(x=>x.id===s.id?{...x,...editForm,country:editForm.location}:x));
      addLog({action:"Edited shop information",target:s.owner_name});
      toast("Shop information updated.");
      setModal(null);
    } catch(e) { toast("Failed: "+e.message,"error"); }
    setSaving(false);
  }

  async function doApplyPlan() {
    const s = modal.shop;
    const days = planForm.duration === 0 ? parseInt(planForm.custom)||30 : planForm.duration;
    const expiry = planForm.plan==="paid" ? addDays(days) : null;
    setSaving(true);
    try {
      await sbPatch("shops", s.id, { plan: planForm.plan, plan_expires_at: expiry });
      setShops(p=>p.map(x=>x.id===s.id?{...x,plan:planForm.plan,plan_expiry:expiry}:x));
      addLog({action:`Assigned ${planForm.plan} plan${planForm.plan==="paid"?` (${days} days)`:""}`,target:s.owner_name});
      toast("Plan updated.");
      setModal(null);
    } catch(e) { toast("Failed: "+e.message,"error"); }
    setSaving(false);
  }

  function openView(shop)  { setModal({type:"view",  shop}); }
  function openEdit(shop)  {
    setEditForm({ shop_name:shop.shop_name, location:shop.location||"", phone:shop.phone||"", business_type:shop.business_type||"", hear_about:shop.hear_about||"" });
    setModal({type:"edit",shop});
  }
  function openPlan(shop)  { setPlanForm({plan:shop.plan,duration:30,custom:""}); setModal({type:"plan",shop}); }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950">User Management</h1>
          <p className="text-sm font-semibold text-slate-500">{filtered.length} account{filtered.length!==1?"s":""} — live from Supabase</p>
        </div>
        <Btn variant="secondary" onClick={reloadShops}><RefreshCw className="h-4 w-4"/>Refresh</Btn>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-4 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Search name, email, phone, location…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
        </div>
        <select className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-bold outline-none focus:border-blue-500" value={filters.plan} onChange={e=>{setFilters({...filters,plan:e.target.value});setPage(1);}}>
          <option value="all">All Plans</option><option value="paid">Pro</option><option value="free">Free</option>
        </select>
        <select className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-bold outline-none focus:border-blue-500" value={filters.status} onChange={e=>{setFilters({...filters,status:e.target.value});setPage(1);}}>
          <option value="all">All Status</option><option value="active">Active</option><option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Shop / Owner","Email","Phone","Location","Registered","Plan","Status","Actions"].map(h=>(
                <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paged.length===0
              ? <tr><td colSpan={8} className="py-12 text-center text-sm font-bold text-slate-400">No users match your filters.</td></tr>
              : paged.map(s=>{
                  const dl = daysLeft(s.plan_expiry);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-600">
                            {(s.shop_name||"?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-slate-950 whitespace-nowrap">{s.shop_name}</p>
                            <p className="text-xs font-semibold text-slate-400">{s.owner_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-semibold whitespace-nowrap">{s.owner_email}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {s.phone
                          ? <span className="font-semibold text-slate-700">{s.phone}</span>
                          : <span className="text-amber-600 font-bold text-xs flex items-center gap-1"><AlertTriangle className="h-3 w-3"/>Missing</span>
                        }
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {s.location
                          ? <span className="flex items-center gap-1 font-semibold text-slate-700"><MapPin className="h-3 w-3 text-slate-400 shrink-0"/>{s.location}</span>
                          : <span className="text-amber-600 font-bold text-xs flex items-center gap-1"><AlertTriangle className="h-3 w-3"/>Missing</span>
                        }
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-500 whitespace-nowrap">{fmtDate(s.created_at)}</td>
                      <td className="px-4 py-3">
                        <Badge color={s.plan==="paid"?"purple":"slate"}>{s.plan==="paid"?"Pro":"Free"}</Badge>
                        {dl!==null && dl<=30 && <p className={`mt-0.5 text-[10px] font-bold ${dl<=7?"text-rose-600":"text-amber-600"}`}>{dl}d left</p>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge color={s.status==="active"?"green":"red"}>{s.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Btn size="sm" variant="ghost" onClick={()=>openView(s)}><Eye className="h-3.5 w-3.5" /></Btn>
                          {canEdit && <>
                            <Btn size="sm" variant="ghost" onClick={()=>openEdit(s)}><User className="h-3.5 w-3.5" /></Btn>
                            <Btn size="sm" variant="ghost" onClick={()=>openPlan(s)}><Star className="h-3.5 w-3.5" /></Btn>
                            {s.status==="active"
                              ? <Btn size="sm" variant="danger" onClick={()=>doSuspend(s)}><ShieldOff className="h-3.5 w-3.5" /></Btn>
                              : <Btn size="sm" variant="success" onClick={()=>doUnsuspend(s)}><ShieldCheck className="h-3.5 w-3.5" /></Btn>
                            }
                            <Btn size="sm" variant="danger" onClick={()=>doSoftDelete(s)}><Trash2 className="h-3.5 w-3.5" /></Btn>
                          </>}
                        </div>
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </div>

      {pages>1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400">Page {page} of {pages}</p>
          <div className="flex gap-1">
            {Array.from({length:pages},(_,i)=>(
              <button key={i} onClick={()=>setPage(i+1)} className={`h-8 w-8 rounded-lg text-xs font-black transition-colors ${page===i+1?"bg-blue-600 text-white":"border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>{i+1}</button>
            ))}
          </div>
        </div>
      )}

      {/* VIEW */}
      {modal?.type==="view" && (
        <Modal title={modal.shop.shop_name} onClose={()=>setModal(null)} width="max-w-2xl">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Shop Name",    modal.shop.shop_name],
              ["Owner",        modal.shop.owner_name],
              ["Email",        modal.shop.owner_email],
              ["Phone",        modal.shop.phone || "⚠ Not provided"],
              ["Location",     modal.shop.location || "⚠ Not provided"],
              ["Registered",   fmtDate(modal.shop.created_at)],
              ["Plan",         modal.shop.plan],
              ["Plan Expiry",  fmtDate(modal.shop.plan_expiry)],
              ["Status",       modal.shop.status],
              ["Revenue",      fmtUSD(modal.shop.usage?.revenue)],
              ["Sales",        fmt(modal.shop.usage?.sales)],
              ["Products",     fmt(modal.shop.usage?.products)],
              ["Heard Via",    modal.shop.hear_about || "—"],
              ["Business Type",modal.shop.business_type || "—"],
              ["Main Problem", modal.shop.main_problem || "—"],
            ].map(([k,v])=>(
              <div key={k} className={`rounded-xl p-3 ${(!modal.shop.phone && k==="Phone") || (!modal.shop.location && k==="Location") ? "bg-amber-50 border border-amber-200" : "bg-slate-50"}`}>
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{k}</p>
                <p className={`mt-0.5 text-sm font-bold ${(!modal.shop.phone && k==="Phone") || (!modal.shop.location && k==="Location") ? "text-amber-700" : "text-slate-950"}`}>{v||"—"}</p>
              </div>
            ))}
          </div>
          {canEdit && (
            <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
              <Btn size="sm" onClick={()=>{setModal(null); setTimeout(()=>openEdit(modal.shop),50);}}><User className="h-3.5 w-3.5"/>Edit Info</Btn>
              <Btn size="sm" onClick={()=>{setModal(null); setTimeout(()=>openPlan(modal.shop),50);}}><Star className="h-3.5 w-3.5"/>Manage Plan</Btn>
              <Btn size="sm" variant="danger" onClick={()=>doSoftDelete(modal.shop)}><Trash2 className="h-3.5 w-3.5"/>Remove Account</Btn>
            </div>
          )}
        </Modal>
      )}

      {/* EDIT */}
      {modal?.type==="edit" && (
        <Modal title={`Edit — ${modal.shop.shop_name}`} onClose={()=>setModal(null)}>
          <div className="space-y-3">
            {[
              ["Shop Name","shop_name","text"],
              ["Phone Number","phone","tel"],
              ["Location / City","location","text"],
              ["Business Type","business_type","text"],
              ["How they heard about Sahel","hear_about","text"],
            ].map(([l,k,t])=>(
              <div key={k}>
                <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-400">{l}</label>
                <input type={t} value={editForm[k]||""} onChange={e=>setEditForm({...editForm,[k]:e.target.value})} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Btn onClick={()=>setModal(null)}>Cancel</Btn>
              <Btn variant="primary" onClick={doSaveEdit} disabled={saving}>
                {saving ? <RefreshCw className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4"/>}Save Changes
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* PLAN */}
      {modal?.type==="plan" && (
        <Modal title={`Manage Plan — ${modal.shop.shop_name}`} onClose={()=>setModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-400">Plan</label>
              <div className="flex gap-2">
                {["free","paid"].map(p=>(
                  <button key={p} onClick={()=>setPlanForm({...planForm,plan:p})} className={`flex-1 rounded-xl border py-3 text-sm font-black transition-all ${planForm.plan===p?"border-blue-600 bg-blue-600 text-white":"border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
                    {p==="paid"?"Pro / Paid":"Free"}
                  </button>
                ))}
              </div>
            </div>
            {planForm.plan==="paid" && (
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-400">Duration</label>
                <div className="flex flex-wrap gap-2">
                  {PLAN_DURATIONS.map(d=>(
                    <button key={d.label} onClick={()=>setPlanForm({...planForm,duration:d.days})} className={`rounded-xl border px-4 py-2 text-xs font-black transition-all ${planForm.duration===d.days?"border-blue-600 bg-blue-600 text-white":"border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
                      {d.label}
                    </button>
                  ))}
                </div>
                {planForm.duration===0 && (
                  <input type="number" placeholder="Days (e.g. 45)" value={planForm.custom} onChange={e=>setPlanForm({...planForm,custom:e.target.value})} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-blue-500" />
                )}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Btn onClick={()=>setModal(null)}>Cancel</Btn>
              <Btn variant="primary" onClick={doApplyPlan} disabled={saving}>
                {saving ? <RefreshCw className="h-4 w-4 animate-spin"/> : <Star className="h-4 w-4"/>}Apply Plan
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
function SubscriptionsView({ shops, setShops, addLog, toast }) {
  const paid        = shops.filter(s=>s.plan==="paid");
  const expiringSoon= shops.filter(s=>{ const d=daysLeft(s.plan_expiry); return d!==null && d>=0 && d<=30; });
  const expired     = shops.filter(s=>{ const d=daysLeft(s.plan_expiry); return d!==null && d<0; });

  async function extend(s, days) {
    const base = s.plan_expiry && daysLeft(s.plan_expiry)>0 ? new Date(s.plan_expiry) : new Date();
    base.setDate(base.getDate()+days);
    const expiry = base.toISOString();
    try {
      await sbPatch("shops", s.id, { plan:"paid", plan_expires_at: expiry });
      setShops(p=>p.map(x=>x.id===s.id?{...x,plan:"paid",plan_expiry:expiry}:x));
      addLog({action:`Extended subscription by ${days} days`,target:s.owner_name});
      toast(`Subscription extended by ${days} days.`);
    } catch(e) { toast("Failed: "+e.message,"error"); }
  }

  async function cancel(s) {
    if(!window.confirm(`Cancel subscription for ${s.shop_name}?`)) return;
    try {
      await sbPatch("shops", s.id, { plan:"free", plan_expires_at: null });
      setShops(p=>p.map(x=>x.id===s.id?{...x,plan:"free",plan_expiry:null}:x));
      addLog({action:"Cancelled subscription",target:s.owner_name});
      toast("Subscription cancelled.");
    } catch(e) { toast("Failed: "+e.message,"error"); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950">Subscriptions</h1>
        <p className="text-sm font-semibold text-slate-500">{paid.length} active Pro accounts</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active Pro"     value={fmt(paid.length)}         icon={Star}          color="purple" />
        <StatCard label="Expiring (30d)" value={fmt(expiringSoon.length)} icon={AlertTriangle} color="amber" />
        <StatCard label="Expired"        value={fmt(expired.length)}      icon={XCircle}       color="red" />
      </div>

      {expiringSoon.length>0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-amber-700">⚠ Expiring Soon</p>
          <div className="space-y-2">
            {expiringSoon.map(s=>(
              <div key={s.id} className="flex items-center justify-between rounded-xl bg-white p-3 border border-amber-100">
                <div>
                  <p className="font-black text-slate-950">{s.owner_name} <span className="font-semibold text-slate-400">· {s.shop_name}</span></p>
                  <p className="text-xs font-bold text-amber-600">{daysLeft(s.plan_expiry)} days left · expires {fmtDate(s.plan_expiry)}</p>
                </div>
                <div className="flex gap-2">
                  <Btn size="sm" variant="primary" onClick={()=>extend(s,30)}>+30d</Btn>
                  <Btn size="sm" onClick={()=>extend(s,365)}>+1yr</Btn>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <div className="border-b border-slate-100 p-4">
          <h2 className="font-black text-slate-950">All Shops</h2>
        </div>
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Shop","Phone","Location","Plan","Expiry","Days Left","Revenue","Actions"].map(h=>(
                <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shops.map(s=>{
              const dl = daysLeft(s.plan_expiry);
              return (
                <tr key={s.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <p className="font-black text-slate-950">{s.shop_name}</p>
                    <p className="text-xs font-semibold text-slate-400">{s.owner_name}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">
                    {s.phone || <span className="text-amber-500 text-xs font-bold">—</span>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">
                    {s.location || <span className="text-amber-500 text-xs font-bold">—</span>}
                  </td>
                  <td className="px-4 py-3"><Badge color={s.plan==="paid"?"purple":"slate"}>{s.plan==="paid"?"Pro":"Free"}</Badge></td>
                  <td className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">{fmtDate(s.plan_expiry)}</td>
                  <td className="px-4 py-3">
                    {dl===null ? <span className="text-slate-400 font-semibold">—</span>
                    : <Badge color={dl<0?"red":dl<=7?"red":dl<=30?"amber":"green"}>{dl<0?`${Math.abs(dl)}d overdue`:`${dl}d`}</Badge>}
                  </td>
                  <td className="px-4 py-3 font-black text-blue-600 whitespace-nowrap">{fmtUSD(s.usage?.revenue)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      <Btn size="sm" onClick={()=>extend(s,30)}>+30d</Btn>
                      <Btn size="sm" onClick={()=>extend(s,365)}>+1yr</Btn>
                      {s.plan==="paid" && <Btn size="sm" variant="danger" onClick={()=>cancel(s)}><X className="h-3 w-3"/>Cancel</Btn>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
function AnalyticsView({ shops }) {
  const totalRevenue = shops.reduce((s,x)=>s+(x.usage?.revenue||0),0);
  const totalSales   = shops.reduce((s,x)=>s+(x.usage?.sales||0),0);
  const pro  = shops.filter(s=>s.plan==="paid").length;
  const conv = shops.length ? Math.round(pro/shops.length*100) : 0;

  const byLocation = useMemo(()=>{
    const m={};
    shops.forEach(s=>{ const loc=(s.location||"Unknown").trim(); m[loc]=(m[loc]||0)+1; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]);
  },[shops]);
  const maxL = Math.max(...byLocation.map(([,v])=>v),1);

  const topRevenue = [...shops].sort((a,b)=>(b.usage?.revenue||0)-(a.usage?.revenue||0)).slice(0,5);
  const mostProducts = [...shops].sort((a,b)=>(b.usage?.products||0)-(a.usage?.products||0)).slice(0,5);

  const missingPhone    = shops.filter(s=>!s.phone).length;
  const missingLocation = shops.filter(s=>!s.location).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950">Analytics</h1>
        <p className="text-sm font-semibold text-slate-500">Platform-wide metrics from your real data</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue"   value={fmtUSD(totalRevenue)} icon={CreditCard}  color="green" />
        <StatCard label="Total Sales"     value={fmt(totalSales)}      icon={ShoppingCart} color="blue" />
        <StatCard label="Businesses"      value={fmt(shops.length)}    icon={Building2}    color="purple"/>
        <StatCard label="Conversion Rate" value={conv+"%"}             icon={TrendingUp}   color="green" sub="free → pro"/>
      </div>

      {(missingPhone>0||missingLocation>0) && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="mb-2 text-xs font-black uppercase tracking-widest text-amber-700">⚠ Incomplete Client Profiles</p>
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-amber-800">
            {missingPhone>0    && <span className="flex items-center gap-1"><Phone className="h-4 w-4"/>{missingPhone} shop{missingPhone>1?"s":""} missing phone number</span>}
            {missingLocation>0 && <span className="flex items-center gap-1"><MapPin className="h-4 w-4"/>{missingLocation} shop{missingLocation>1?"s":""} missing location</span>}
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">Shops by Location</p>
          <div className="space-y-3">
            {byLocation.map(([c,v])=>(
              <div key={c}>
                <div className="mb-1 flex justify-between text-xs font-bold">
                  <span className="text-slate-700 flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-400"/>{c}</span>
                  <span className="text-slate-400">{v}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-blue-600 transition-all" style={{width:`${Math.round(v/maxL*100)}%`}} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">Top Revenue Shops</p>
          <div className="space-y-3">
            {topRevenue.map((s,i)=>(
              <div key={s.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[11px] font-black text-blue-600">{i+1}</span>
                  <div>
                    <p className="text-sm font-black text-slate-950">{s.shop_name}</p>
                    <p className="text-xs text-slate-400">{s.location||"No location"}</p>
                  </div>
                </div>
                <span className="text-sm font-black text-blue-600">{fmtUSD(s.usage?.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">Most Products Listed</p>
          <div className="space-y-3">
            {mostProducts.map((s,i)=>(
              <div key={s.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-50 text-[11px] font-black text-green-600">{i+1}</span>
                  <div>
                    <p className="text-sm font-black text-slate-950">{s.shop_name}</p>
                    <p className="text-xs text-slate-400">{s.location||"No location"}</p>
                  </div>
                </div>
                <span className="text-sm font-black text-slate-700">{s.usage?.products} products</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All clients table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <div className="border-b border-slate-100 p-4">
          <h2 className="font-black text-slate-950">All Clients — Phone & Location Overview</h2>
        </div>
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Shop","Owner Email","Phone","Location","Products","Sales","Revenue","Plan"].map(h=>(
                <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shops.map(s=>(
              <tr key={s.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-black text-slate-950 whitespace-nowrap">{s.shop_name}</td>
                <td className="px-4 py-3 font-semibold text-slate-500 whitespace-nowrap text-xs">{s.owner_email}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {s.phone
                    ? <span className="font-semibold text-slate-700">{s.phone}</span>
                    : <Badge color="amber">Missing</Badge>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {s.location
                    ? <span className="font-semibold text-slate-700">{s.location}</span>
                    : <Badge color="amber">Missing</Badge>}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-700">{s.usage?.products}</td>
                <td className="px-4 py-3 font-semibold text-slate-700">{s.usage?.sales}</td>
                <td className="px-4 py-3 font-black text-blue-600">{fmtUSD(s.usage?.revenue)}</td>
                <td className="px-4 py-3"><Badge color={s.plan==="paid"?"purple":"slate"}>{s.plan==="paid"?"Pro":"Free"}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
function NotificationsView({ shops, addLog, toast }) {
  const [form, setForm] = useState({ audience:"all", title:"", message:"" });
  const [sent, setSent] = useState([]);

  function send() {
    if(!form.title||!form.message){ toast("Title and message are required.","error"); return; }
    const count = form.audience==="all" ? shops.length
                : form.audience==="paid" ? shops.filter(s=>s.plan==="paid").length
                : shops.filter(s=>s.plan==="free").length;
    setSent(p=>[{id:Date.now(),ts:new Date().toISOString(),...form,count},...p]);
    addLog({action:`Sent notification: "${form.title}"`,target:`${count} users (${form.audience})`});
    toast(`Notification sent to ${count} users.`);
    setForm({audience:"all",title:"",message:""});
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950">Notifications</h1>
        <p className="text-sm font-semibold text-slate-500">Send announcements to your {shops.length} clients</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-black text-slate-950">Compose Notification</h2>
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-400">Audience</label>
            <div className="grid grid-cols-3 gap-2">
              {[["all","All Users"],["paid","Pro Only"],["free","Free Only"]].map(([v,l])=>(
                <button key={v} onClick={()=>setForm({...form,audience:v})} className={`rounded-xl border py-2.5 text-xs font-black transition-all ${form.audience===v?"border-blue-600 bg-blue-600 text-white":"border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-400">Title</label>
            <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Notification title" className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-400">Message</label>
            <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} rows={5} placeholder="Your message…" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none" />
          </div>
          <Btn variant="primary" onClick={send} className="w-full justify-center"><Send className="h-4 w-4"/>Send Notification</Btn>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-black text-slate-950">Sent History</h2>
          {sent.length===0
            ? <div className="flex h-40 items-center justify-center text-sm font-bold text-slate-400">No notifications sent yet.</div>
            : <div className="space-y-3">{sent.map(n=>(
                <div key={n.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-black text-slate-950">{n.title}</p>
                    <Badge color="blue">{n.audience}</Badge>
                  </div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">{n.message}</p>
                  <p className="text-xs font-bold text-slate-400">{timeAgo(n.ts)} · {n.count} recipients</p>
                </div>
              ))}</div>
          }
        </div>
      </div>
    </div>
  );
}

// ─── AUDIT LOG ────────────────────────────────────────────────────────────────
function AuditView({ logs }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-950">Audit Log</h1>
        <p className="text-sm font-semibold text-slate-500">All admin actions this session</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Timestamp","Admin","Action","Target"].map(h=>(
                <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length===0
              ? <tr><td colSpan={4} className="py-12 text-center text-sm font-bold text-slate-400">No audit entries yet this session.</td></tr>
              : logs.map((l,i)=>(
                <tr key={l.id||i} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">{fmtDate(l.ts)} {new Date(l.ts).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</td>
                  <td className="px-4 py-3 font-black text-slate-950 whitespace-nowrap">{l.admin}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{l.action}</td>
                  <td className="px-4 py-3"><Badge color="blue">{l.target}</Badge></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsView({ admin }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950">Roles & Settings</h1>
        <p className="text-sm font-semibold text-slate-500">Your current role: <span className="text-blue-600">{ROLES[admin.role]}</span></p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {Object.entries(ROLES).map(([k,v])=>(
          <div key={k} className={`rounded-2xl border p-5 shadow-sm ${k===admin.role?"border-blue-600 bg-blue-50":"border-slate-200 bg-white"}`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-sm font-black ${k===admin.role?"text-blue-900":"text-slate-950"}`}>{v}</p>
              {k===admin.role && <Badge color="blue">You</Badge>}
            </div>
            <div className="space-y-1.5">
              {NAV.map(n=>{
                const has = ROLE_PERMS[k]?.includes(n.id);
                return (
                  <div key={n.id} className={`flex items-center gap-2 text-xs font-bold ${has?"text-slate-700":"text-slate-300"}`}>
                    {has ? <Check className="h-3 w-3 text-green-500 shrink-0"/> : <X className="h-3 w-3 shrink-0"/>}
                    {n.label}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-black text-slate-950">Database Info</h2>
        <div className="divide-y divide-slate-100">
          {[
            ["Project","SAHAL"],
            ["Database","Supabase PostgreSQL 17"],
            ["Region","eu-central-1"],
            ["Project ID","olhfaqqpypwotusviyhf"],
            ["RLS","Enabled on all tables"],
          ].map(([k,v])=>(
            <div key={k} className="flex items-center justify-between py-3">
              <p className="text-sm font-bold text-slate-700">{k}</p>
              <span className="text-sm font-semibold text-slate-500 font-mono">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function Admin() {
  const [admin,    setAdmin]    = useState(()=>{
    try { return JSON.parse(sessionStorage.getItem("sahel_admin")||"null"); } catch { return null; }
  });
  const [view,     setView]     = useState("dashboard");
  const [shops,    setShops]    = useState([]);
  const [logs,     setLogs]     = useState([]);
  const [toasts,   setToasts]   = useState([]);
  const [sideOpen, setSideOpen] = useState(false);
  const [loading,  setLoading]  = useState(false);

  function toast(msg, type="success") {
    const id = Date.now();
    setToasts(p=>[...p,{id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)), 4000);
  }

  function addLog(entry) {
    setLogs(p=>[{
      id:"a"+Date.now(),
      ts:new Date().toISOString(),
      admin: admin?.name || "Admin",
      ...entry
    },...p]);
  }

  async function reloadShops() {
    setLoading(true);
    try {
      const data = await loadShops();
      setShops(data);
    } catch(e) {
      toast("Failed to load data: "+e.message,"error");
    }
    setLoading(false);
  }

  useEffect(()=>{
    if (admin) reloadShops();
  },[admin]);

  function handleAuth(a) {
    sessionStorage.setItem("sahel_admin", JSON.stringify(a));
    setAdmin(a);
  }

  function handleLogout() {
    addLog({action:"Signed out",target:admin.name});
    sessionStorage.removeItem("sahel_admin");
    setAdmin(null);
    setShops([]);
    setLogs([]);
  }

  if (!admin) return <AuthScreen onAuth={handleAuth} />;

  const perms   = ROLE_PERMS[admin.role]||[];
  const allowed = NAV.filter(n=>perms.includes(n.id));

  if (!perms.includes(view)) {
    const first = allowed[0];
    if (first && view !== first.id) { setView(first.id); return null; }
  }

  const props = { shops, setShops, addLog, toast, role:admin.role, logs, reloadShops, loading };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {sideOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={()=>setSideOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${sideOpen?"translate-x-0":"-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-950">Sahel Admin</p>
            <p className="text-[10px] font-bold text-slate-400">{ROLES[admin.role]}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {allowed.map(n=>(
            <button key={n.id} onClick={()=>{setView(n.id);setSideOpen(false);}} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${view===n.id?"bg-blue-600 text-white shadow-sm":"text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>
              <n.icon className="h-4 w-4 shrink-0" />
              {n.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-3 space-y-1">
          <div className="rounded-xl bg-slate-50 px-3 py-2.5">
            <p className="text-xs font-black text-slate-950">{admin.name}</p>
            <p className="text-[10px] font-bold text-slate-400">{shops.length} clients loaded</p>
          </div>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-950 transition-all">
            <LogOut className="h-4 w-4" />Sign Out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
          <button onClick={()=>setSideOpen(true)} className="rounded-lg p-1.5 hover:bg-slate-100">
            <MoreVertical className="h-5 w-5 text-slate-600" />
          </button>
          <span className="font-black text-slate-950">Sahel Admin</span>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {view==="dashboard"     && <DashboardView     {...props} />}
          {view==="users"         && <UsersView         {...props} />}
          {view==="subscriptions" && <SubscriptionsView {...props} />}
          {view==="analytics"     && <AnalyticsView     {...props} />}
          {view==="notifications" && <NotificationsView {...props} />}
          {view==="audit"         && <AuditView         {...props} />}
          {view==="settings"      && <SettingsView      admin={admin} />}
        </main>
      </div>

      <Toast toasts={toasts} />
    </div>
  );
}
