import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Phone, Store, ChevronRight, CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step,    setStep]    = useState(1); // 1=shop info, 2=done
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [form,    setForm]    = useState({
    shop_name:     "",
    phone:         "",
    location:      "",
    business_type: "",
    hear_about:    "",
  });

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (!form.shop_name.trim()) { setError("Shop name is required."); return; }
    if (!form.phone.trim())     { setError("Phone number is required."); return; }
    if (!form.location.trim())  { setError("Location is required."); return; }

    setSaving(true);
    try {
      // Get current auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error("Session expired. Please sign in again.");

      const userId = session.user.id;

      // Update public.users phone + shop_name
      await supabase
        .from("users")
        .update({ phone: form.phone.trim(), shop_name: form.shop_name.trim() })
        .eq("id", userId);

      // Create the primary shop
      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .insert({
          owner_id:      userId,
          shop_name:     form.shop_name.trim(),
          phone:         form.phone.trim(),
          location:      form.location.trim(),
          business_type: form.business_type.trim() || null,
          hear_about:    form.hear_about.trim()    || null,
          status:        "active",
          plan:          "free",
          is_primary:    true,
        })
        .select()
        .single();

      if (shopError) throw shopError;

      // Save shop to localStorage
      localStorage.setItem("sahel_shop", JSON.stringify({
        id:        shopData.id,
        shop_name: shopData.shop_name,
        location:  shopData.location,
        phone:     shopData.phone,
        plan:      shopData.plan,
        status:    shopData.status,
      }));

      // Update user in localStorage too
      const savedUser = JSON.parse(localStorage.getItem("sahel_user") || "{}");
      localStorage.setItem("sahel_user", JSON.stringify({
        ...savedUser,
        phone: form.phone.trim(),
      }));

      setStep(2);
      setTimeout(() => navigate("/dashboard", { replace: true }), 1800);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Step 2: success screen ────────────────────────────────────────────────
  if (step === 2) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-9 w-9 text-green-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-950">You're all set!</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            <strong>{form.shop_name}</strong> is ready. Taking you to your dashboard…
          </p>
        </div>
      </main>
    );
  }

  // ── Step 1: shop setup form ───────────────────────────────────────────────
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
            <Store className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-950">Set up your shop</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Just a few details and you're ready to go.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Shop name */}
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                Shop Name <span className="text-rose-500">*</span>
              </label>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                <Store className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-300"
                  placeholder="e.g. Hassan General Store"
                  value={form.shop_name}
                  onChange={e => set("shop_name", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Phone — required */}
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-300"
                  placeholder="+252 61 234 5678"
                  type="tel"
                  value={form.phone}
                  onChange={e => set("phone", e.target.value)}
                  required
                />
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-400">Used to contact you about your account.</p>
            </div>

            {/* Location — required */}
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                Location / City <span className="text-rose-500">*</span>
              </label>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-300"
                  placeholder="e.g. Mogadishu, Somalia"
                  value={form.location}
                  onChange={e => set("location", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Business type — optional */}
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                Business Type <span className="text-slate-300 font-medium normal-case">(optional)</span>
              </label>
              <select
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                value={form.business_type}
                onChange={e => set("business_type", e.target.value)}
              >
                <option value="">Select type…</option>
                <option>General Store</option>
                <option>Grocery</option>
                <option>Pharmacy</option>
                <option>Electronics</option>
                <option>Fashion / Clothing</option>
                <option>Wholesale</option>
                <option>Supermarket</option>
                <option>Restaurant / Café</option>
                <option>Textiles</option>
                <option>Other</option>
              </select>
            </div>

            {/* How they heard — optional */}
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                How did you hear about Sahel? <span className="text-slate-300 font-medium normal-case">(optional)</span>
              </label>
              <select
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                value={form.hear_about}
                onChange={e => set("hear_about", e.target.value)}
              >
                <option value="">Select…</option>
                <option>Facebook</option>
                <option>WhatsApp</option>
                <option>Friend / Family</option>
                <option>Google Search</option>
                <option>YouTube</option>
                <option>TV / Radio</option>
                <option>Other</option>
              </select>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating your shop…
                </>
              ) : (
                <>
                  Start using Sahel
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>

          </form>
        </div>

        <p className="mt-4 text-center text-xs font-semibold text-slate-400">
          You can update these details anytime from Settings.
        </p>
      </div>
    </main>
  );
}
