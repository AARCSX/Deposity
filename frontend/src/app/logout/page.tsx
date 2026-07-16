"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { clearSession, authenticatedFetch } from "@/lib/api";

export default function LogoutPage() {
  const router = useRouter();
  const logoutAttempted = useRef(false);

  useEffect(() => {
    if (logoutAttempted.current) return;
    logoutAttempted.current = true;

    async function performLogout() {
      try {
        await authenticatedFetch("/auth/logout", { method: "POST" });
      } catch (err) {
        console.error("Failed to notify backend of logout:", err);
      } finally {
        clearSession();
        router.push("/");
      }
    }

    performLogout();
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
