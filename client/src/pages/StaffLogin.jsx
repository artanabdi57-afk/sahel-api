import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Store } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import sahelIcon from "../assets/sahel_logo_icon_only.svg";

export default function StaffLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "" });
    try {
      const { data, error } = await supabase.rpc("staff_login", {
        p_email: form.email.trim(),
        p_password: form.password.trim()
      });
      if (error) throw error;
      if (!data) throw new Error("Invalid email or password");
      localStorage.setItem("sahel_auth_token", "staff-" + data.id);
      localStorage.setItem("sahel_user", JSON.stringify({ id: data.id, email: data.email, name: data.name, role: "staff" }));
      localStorage.setItem("sahel_shop", JSON.stringify({ id: data.shop_id, shop_name: data.shop_name || "My Shop" }));
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setStatus({ loading: false, error: error.message || "Invalid email or password" });
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-[#f7fbff] to-[#edf6ff] p-4 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img className="mx-auto h-14 w-14" src={sahelIcon} alt="Sahel" />
          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950">Staff Login</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm font-medium leading-6 text-slate-500">Log in with your staff account to access your shop.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
            <Mail className="h-4 w-4 text-slate-400" />
            <input className="w-full bg-transparent text-sm font-medium outline-none" type="email" placeholder="Your email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
            <Lock className="h-4 w-4 text-slate-400" />
            <input className="w-full bg-transparent text-sm font-medium outline-none" type="password" placeholder="Your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>
          {status.error ? <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{status.error}</div> : null}
          <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-[0_12px_25px_rgba(37,99,235,0.20)] transition hover:bg-blue-700 disabled:opacity-60" disabled={status.loading}>
            <Store className="h-4 w-4" />
            {status.loading ? "Logging in..." : "Log in to my shop"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Are you the shop owner?{" "}
          <a className="font-bold text-blue-600 hover:text-blue-700" href="/login">Owner login →</a>
        </p>
      </div>
    </main>
  );
}
