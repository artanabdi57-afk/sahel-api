import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import sahelIcon from "../assets/sahel_logo_icon_only.svg";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "", done: false });

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) {
      setStatus({ loading: false, error: "Passwords do not match.", done: false });
      return;
    }
    setStatus({ loading: true, error: "", done: false });
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setStatus({ loading: false, error: "", done: true });
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (error) {
      setStatus({ loading: false, error: error.message, done: false });
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-[#f7fbff] to-[#edf6ff] p-4 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img className="mx-auto h-14 w-14" src={sahelIcon} alt="Sahel" />
          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950">New password</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm font-medium leading-6 text-slate-500">
            Choose a strong password for your account.
          </p>
        </div>

        {status.done ? (
          <div className="rounded-2xl bg-green-50 border border-green-200 px-6 py-6 text-center">
            <p className="text-sm font-bold text-green-700">Password updated!</p>
            <p className="mt-1 text-sm font-medium text-green-600">Redirecting you to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                className="w-full bg-transparent text-sm font-medium outline-none"
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </label>

            <label className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                className="w-full bg-transparent text-sm font-medium outline-none"
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
              />
            </label>

            {status.error ? (
              <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {status.error}
              </div>
            ) : null}

            <button
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-[0_12px_25px_rgba(37,99,235,0.20)] transition hover:bg-blue-700 disabled:opacity-60"
              disabled={status.loading}
            >
              {status.loading ? "Updating..." : "Update password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
