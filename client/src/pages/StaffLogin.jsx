import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { apiRequest } from "../lib/api";
import { saveSession } from "../lib/auth";
import sahelLogo from "../assets/sahel_logo_english.svg";
import sahelIcon from "../assets/sahel_logo_icon_only.svg";

export default function StaffLogin() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "" });
    try {
      const response = await apiRequest("/auth/staff-login", {
        method: "POST",
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      });
      // saveSession stores token + user + shop in localStorage — same as owner login
      saveSession(response.data);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setStatus({ loading: false, error: err.message || "Invalid email or password." });
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-[#f7fbff] to-[#edf6ff] p-4">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:grid-cols-[0.9fr_1.1fr]">

          {/* Left panel */}
          <section className="hidden border-r border-slate-100 bg-[#f8fbff] p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <img className="h-11 w-auto" src={sahelLogo} alt="Sahel" />
              <h1 className="mt-10 max-w-md text-4xl font-black tracking-tight text-slate-950">
                Your shop, ready to go.
              </h1>
              <p className="mt-4 max-w-md text-sm font-medium leading-6 text-slate-500">
                Log in with your staff credentials to manage sales, stock, and customers.
              </p>
            </div>
            <div className="grid gap-3">
              {[
                ["Staff access",    "You only see the shop you're assigned to."],
                ["Secure login",    "Your password is hashed and protected."],
                ["Full daily flow", "Sales, inventory, credits, and more."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-sm font-black text-slate-950">{title}</p>
                  <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Right panel */}
          <section className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
            <div className="w-full max-w-sm">
              <div className="mb-8 text-center">
                <img className="mx-auto h-14 w-14" src={sahelIcon} alt="Sahel" />
                <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950">
                  Staff login
                </h2>
                <p className="mx-auto mt-2 max-w-xs text-sm font-medium leading-6 text-slate-500">
                  Log in with the email and password your shop owner gave you.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <label className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm font-medium outline-none"
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    autoComplete="email"
                  />
                </label>

                <label className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm font-medium outline-none"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={8}
                    autoComplete="current-password"
                  />
                </label>

                {status.error && (
                  <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {status.error}
                  </div>
                )}

                <button
                  className="btn-primary h-12 w-full rounded-xl bg-blue-600 shadow-[0_12px_25px_rgba(37,99,235,0.20)]"
                  disabled={status.loading}
                >
                  {status.loading ? "Logging in..." : "Log in"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <p className="mt-6 text-center text-xs font-medium leading-5 text-slate-400">
                Not a staff member?{" "}
                <a href="/login" className="font-bold text-blue-600 hover:text-blue-700">
                  Owner login →
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
