import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Store } from "lucide-react";
import { apiRequest } from "../lib/api";
import { saveSession } from "../lib/auth";
import sahelIcon from "../assets/sahel_logo_icon_only.svg";

export default function Onboarding() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ shop_name: "", location: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ loading: true, error: "" });

    try {
      const response = await apiRequest("/auth/setup-shop", {
        method: "POST",
        body: JSON.stringify(form)
      });

      saveSession(response.data);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-[#f7fbff] to-[#edf6ff] p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
        <img className="mx-auto h-14 w-14" src={sahelIcon} alt="Sahel" />
        <h1 className="mt-5 text-center text-3xl font-black tracking-tight text-slate-950">Set up your shop</h1>
        <p className="mx-auto mt-2 max-w-xs text-center text-sm font-medium leading-6 text-slate-500">
          Add your shop name to finish creating your Sahel workspace.
        </p>

        <div className="mt-6 space-y-3">
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
        </div>

        {status.error ? (
          <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {status.error}
          </div>
        ) : null}

        <button className="btn-primary mt-5 h-12 w-full rounded-xl" disabled={status.loading}>
          {status.loading ? "Saving..." : "Continue to dashboard"}
        </button>
      </form>
    </main>
  );
}
