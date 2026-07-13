"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { setAuthToken } from "@/lib/api";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    setAuthToken(null);
    localStorage.removeItem("deposity_token");
    localStorage.removeItem("oauth_code_verifier");
    localStorage.removeItem("oauth_state");

    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#06060f] flex items-center justify-center px-6 text-white font-sans">
      <div className="max-w-md w-full rounded-[32px] border border-white/10 bg-[#0d0d1a]/80 p-10 text-center shadow-2xl backdrop-blur-md">
        <div className="flex justify-center mb-6">
          <Loader2 className="h-12 w-12 animate-spin text-[#7180B9]" />
        </div>
        <h1 className="text-2xl font-bold mb-3 text-[#e8e8f0]">Logging out</h1>
        <p className="text-sm text-white/50 leading-relaxed">
          Ending your session and cleaning up temporary state...
        </p>
      </div>
    </div>
  );
}
