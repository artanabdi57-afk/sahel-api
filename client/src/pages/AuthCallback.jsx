import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { apiRequest } from "../lib/api";
import { saveSession } from "../lib/auth";

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

        setStatus("Setting up your account…");

        // 2. Hand the Supabase access_token to OUR backend so it can issue a
        //    proper Sahel session token (this is what ProtectedRoute checks for).
        //    Calling supabase.rpc(...) directly here was the bug — it created/found
        //    the user in the database but never gave the browser a login token,
        //    so ProtectedRoute treated every new Google sign-in as logged out and
        //    bounced straight back to /welcome.
        const response = await apiRequest("/auth/oauth-session", {
          method: "POST",
          body: JSON.stringify({ access_token: session.access_token }),
        });

        // 3. Save token + user + shop so getToken()/isAuthenticated() work
        saveSession(response.data);

        // 4. Route: if no shop yet → onboarding, otherwise → dashboard
        if (response.data.onboarding_required) {
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
              href="/login"
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
