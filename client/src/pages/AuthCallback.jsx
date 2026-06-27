import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

// Saves session to localStorage so the rest of the app works
function saveSessionLocal(data) {
  if (!data) return;
  localStorage.setItem("sahel_user", JSON.stringify({
    id:    data.user_id,
    email: data.email,
    phone: data.phone || null,
  }));
  if (data.shop_id) {
    localStorage.setItem("sahel_shop", JSON.stringify({
      id:        data.shop_id,
      shop_name: data.shop_name,
      location:  data.location  || null,
      phone:     data.phone     || null,
      plan:      data.plan      || "free",
      status:    data.status    || "active",
    }));
  } else {
    localStorage.removeItem("sahel_shop");
  }
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Finishing Google login…");
  const [error,  setError]  = useState("");

  useEffect(() => {
    async function finish() {
      try {
        // 1. Get the Supabase session that Google just created
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const session = sessionData?.session;
        if (!session) throw new Error("Google login did not return a session. Please try again.");

        const authUser = session.user;
        setStatus("Setting up your account…");

        // 2. Call our new DB function — finds/creates public.users row,
        //    fixes the UUID mismatch, checks if shop exists
        const { data: upsertData, error: upsertError } = await supabase.rpc("upsert_oauth_user", {
          p_auth_id:   authUser.id,
          p_email:     authUser.email,
          p_full_name: authUser.user_metadata?.full_name || null,
        });
        if (upsertError) throw upsertError;

        // 3. Save to localStorage so getCurrentUser() / getCurrentShop() work
        saveSessionLocal(upsertData);

        // 4. Route: if no shop yet → onboarding, otherwise → dashboard
        if (upsertData.onboarding_required) {
          setStatus("One more step — setting up your shop…");
          navigate("/onboarding", { replace: true });
        } else {
          setStatus("All done! Taking you to your dashboard…");
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("AuthCallback error:", err);
        setError(err.message || "Something went wrong. Please try signing in again.");
      }
    }
    finish();
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft">
        {error ? (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
              <svg className="h-7 w-7 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-slate-950">Login failed</h1>
            <p className="mt-2 text-sm font-medium text-rose-600">{error}</p>
            <a
              href="/auth"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              Try again
            </a>
          </>
        ) : (
          <>
            {/* Spinner */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <svg className="h-7 w-7 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-slate-950">Just a moment…</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">{status}</p>
          </>
        )}
      </div>
    </main>
  );
}
