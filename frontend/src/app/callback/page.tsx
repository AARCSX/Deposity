"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { setAuthToken } from "@/lib/api";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleExchange() {
      const code = searchParams.get("code");
      const state = searchParams.get("state");

      if (!code || !state) {
        setError("Authorization code or state is missing from the callback request.");
        return;
      }

      // Verify state
      const savedState = localStorage.getItem("oauth_state");
      if (state !== savedState) {
        setError("CSRF state mismatch. The authorization request may have been tampered with.");
        return;
      }

      // Retrieve verifier
      const verifier = localStorage.getItem("oauth_code_verifier");
      if (!verifier) {
        setError("Cryptographic code verifier not found. Please initiate login again.");
        return;
      }

      const redirectUri = window.location.origin + "/callback";
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

      try {
        const response = await fetch(`${apiBase}/auth/callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            code_verifier: verifier,
            redirect_uri: redirectUri,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with ${response.status}`);
        }

        const data = await response.json();
        if (!data.access_token) {
          throw new Error("No access token returned from backend.");
        }

        // Save token
        setAuthToken(data.access_token);

        // Clean up
        localStorage.removeItem("oauth_code_verifier");
        localStorage.removeItem("oauth_state");

        // Redirect to dashboard
        router.push("/dashboard");
      } catch (err: any) {
        setError(err.message || "Failed to exchange authorization code for session token.");
      }
    }

    handleExchange();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#06060f] flex items-center justify-center px-6 text-white font-sans">
        <div className="max-w-md w-full rounded-[32px] border border-red-500/20 bg-[#0d0d1a]/85 p-8 text-center shadow-2xl backdrop-blur-md">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 flex items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <ShieldAlert size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-[#e8e8f0]">Authentication Failed</h1>
          <p className="text-sm text-red-200/70 mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => {
              localStorage.removeItem("oauth_code_verifier");
              localStorage.removeItem("oauth_state");
              router.push("/");
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-500/20 to-red-600/30 border border-red-500/30 hover:border-red-500/60 text-red-200 font-semibold transition-all hover:shadow-lg active:scale-[0.98]"
          >
            Return to Safety
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06060f] flex items-center justify-center px-6 text-white font-sans">
      <div className="max-w-md w-full rounded-[32px] border border-white/10 bg-[#0d0d1a]/80 p-10 text-center shadow-2xl backdrop-blur-md">
        <div className="flex justify-center mb-6">
          <Loader2 className="h-12 w-12 animate-spin text-[#7180B9]" />
        </div>
        <h1 className="text-2xl font-bold mb-3 text-[#e8e8f0]">Completing handshake</h1>
        <p className="text-sm text-white/50 leading-relaxed">
          Verifying authorization credentials with AARCSX Identity and setting up your secure session...
        </p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#06060f] flex items-center justify-center px-6 text-white font-sans">
        <div className="max-w-md w-full rounded-[32px] border border-white/10 bg-[#0d0d1a]/80 p-10 text-center shadow-2xl backdrop-blur-md">
          <div className="flex justify-center mb-6">
            <Loader2 className="h-12 w-12 animate-spin text-[#7180B9]" />
          </div>
          <h1 className="text-2xl font-bold mb-3 text-[#e8e8f0]">Loading</h1>
          <p className="text-sm text-white/50 leading-relaxed">Preparing authentication callback handler...</p>
        </div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
