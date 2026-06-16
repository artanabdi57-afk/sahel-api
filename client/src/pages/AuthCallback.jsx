import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { saveSession } from "../lib/auth";
import { hasSupabaseAuthConfig, supabase } from "../lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    async function finishGoogleLogin() {
      try {
        if (!hasSupabaseAuthConfig) {
          throw new Error("Missing Supabase frontend config.");
        }

        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const accessToken = data.session?.access_token;

        if (!accessToken) {
          throw new Error("Google login did not return a session.");
        }

        const response = await apiRequest("/auth/oauth-session", {
          method: "POST",
          body: JSON.stringify({ access_token: accessToken })
        });

        saveSession(response.data);
        navigate(response.data.onboarding_required ? "/onboarding" : "/dashboard", { replace: true });
      } catch (loginError) {
        setError(loginError.message);
      }
    }

    finishGoogleLogin();
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-soft">
        <h1 className="text-xl font-black text-slate-950">Finishing Google login</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          {error || "Please wait while Sahel prepares your workspace."}
        </p>
      </div>
    </main>
  );
}
