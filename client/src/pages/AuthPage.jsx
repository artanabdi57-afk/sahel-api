import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, MapPin, Phone, Store } from "lucide-react";
import { apiRequest } from "../lib/api";
import { saveSession } from "../lib/auth";
import sahelLogo from "../assets/sahel_logo_english.svg";
import sahelIcon from "../assets/sahel_logo_icon_only.svg";

export default function AuthPage({ mode }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    phone: "",
    email: "",
    password: "",
    shop_name: "",
    location: "",
    setup_code: ""
  });
  const [status, setStatus] = useState({ loading: false, error: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ loading: true, error: "" });

    try {
      if (isSignup && form.phone && !/^(61|62|68)\d{7}$/.test(form.phone)) {
        throw new Error("Phone must be 9 digits and start with 61, 62, or 68.");
      }

      const payload = isSignup
        ? {
            phone: form.phone,
            email: form.email,
            password: form.password,
            shop_name: form.shop_name,
            location: form.location,
            setup_code: form.setup_code
          }
        : {
            email: form.email,
            password: form.password
          };
      const response = await apiRequest(isSignup ? "/auth/signup" : "/auth/login", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      saveSession(response.data);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-[#f7fbff] to-[#edf6ff] p-4">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden border-r border-slate-100 bg-[#f8fbff] p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <img className="h-11 w-auto" src={sahelLogo} alt="Sahel" />
            <h1 className="mt-10 max-w-md text-4xl font-black tracking-tight text-slate-950">
              Fresh tools for trusted shop management.
            </h1>
            <p className="mt-4 max-w-md text-sm font-medium leading-6 text-slate-500">
              Keep each shop workspace private, organized, and easy to run from day one.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              ["Private workspace", "Every shop sees only its own data."],
              ["Secure sign in", "Password hashes and session tokens protect access."],
              ["Simple daily flow", "Sales, stock, credits, expenses, and reports stay together."]
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-black text-slate-950">{title}</p>
                <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-sm">
            <div className="mb-8 text-center">
              <img className="mx-auto h-14 w-14" src={sahelIcon} alt="Sahel" />
              <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950">
                {isSignup ? "Create your shop" : "Welcome back"}
              </h2>
              <p className="mx-auto mt-2 max-w-xs text-sm font-medium leading-6 text-slate-500">
                {isSignup ? "Owner-only setup for a new client business." : "Log in with your email and password."}
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
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  required
                />
              </label>

              <label className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                <Lock className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm font-medium outline-none"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  required
                  minLength={8}
                />
              </label>

              {isSignup ? (
                <>
                  <label className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <input
                      className="w-full bg-transparent text-sm font-medium outline-none"
                      inputMode="numeric"
                      maxLength={9}
                      placeholder="Phone number (optional)"
                      value={form.phone}
                      onChange={(event) => setForm({ ...form, phone: event.target.value.replace(/\D/g, "").slice(0, 9) })}
                    />
                  </label>
                  <p className="px-1 text-xs font-semibold text-slate-400">Optional phone: 9 digits starting with 61, 62, or 68.</p>

                  <label className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                    <Store className="h-4 w-4 text-slate-400" />
                    <input
                      className="w-full bg-transparent text-sm font-medium outline-none"
                      placeholder="Shop name"
                      value={form.shop_name}
                      onChange={(event) => setForm({ ...form, shop_name: event.target.value })}
                      required
                    />
                  </label>

                  <label className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <input
                      className="w-full bg-transparent text-sm font-medium outline-none"
                      placeholder="Location"
                      value={form.location}
                      onChange={(event) => setForm({ ...form, location: event.target.value })}
                    />
                  </label>

                  <label className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                    <Lock className="h-4 w-4 text-slate-400" />
                    <input
                      className="w-full bg-transparent text-sm font-medium outline-none"
                      type="password"
                      placeholder="Owner setup code"
                      value={form.setup_code}
                      onChange={(event) => setForm({ ...form, setup_code: event.target.value })}
                      required
                    />
                  </label>
                </>
              ) : null}

              {status.error ? (
                <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {status.error}
                </div>
              ) : null}

              <button className="btn-primary h-12 w-full rounded-xl bg-blue-600 shadow-[0_12px_25px_rgba(37,99,235,0.20)]" disabled={status.loading}>
                {status.loading ? "Please wait..." : isSignup ? "Create account" : "Log in"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-5 text-center text-xs font-medium leading-5 text-slate-400">
              Your shop data stays separated and protected.
            </p>

            <p className="mt-5 text-center text-sm font-medium text-slate-500">
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <Link className="font-black text-blue-600 hover:text-blue-700" to="/login">
                    Log in
                  </Link>
                </>
              ) : (
                <>
                  Need an account? Contact the Sahel owner.{" "}
                  <Link className="font-black text-blue-600 hover:text-blue-700" to="/admin">
                    Owner admin
                  </Link>
                </>
              )}
            </p>
          </div>
        </section>
        </div>
      </div>
    </main>
  );
}
