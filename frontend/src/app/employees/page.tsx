"use client";

import LayoutWrapper from "@/components/layout/LayoutWrapper";
import Link from "next/link";

export default function EmployeesComingSoon() {
  return (
    <LayoutWrapper>
      <div className="min-h-[70vh] flex flex-col items-center justify-center relative overflow-hidden px-4">
        {/* Glow decorative blobs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse duration-5000"></div>

        {/* Content Card */}
        <div className="bg-surface-container-lowest/40 backdrop-blur-md rounded-[2.5rem] p-8 md:p-16 border border-outline-variant/15 shadow-2xl text-center max-w-2xl relative z-10 space-y-8">
          {/* Animated Premium Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-linear-to-br from-primary to-primary-container text-white shadow-xl shadow-primary/20 animate-bounce duration-3000">
            <span className="material-symbols-outlined text-4xl">badge</span>
          </div>

          <div className="space-y-3">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full">
              Phase 2 Launch
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface leading-tight">
              Employee Portal <br />
              <span className="text-primary bg-clip-text">Coming Soon</span>
            </h1>
            <p className="text-on-surface-variant font-medium text-sm md:text-base max-w-md mx-auto leading-relaxed">
              We are crafting a next-generation HR and driver directory system. You'll soon be able to manage shifts, compliance records, logins, and staff security permissions.
            </p>
          </div>

          {/* Interactive Progress Indicator */}
          <div className="space-y-2 max-w-sm mx-auto">
            <div className="flex justify-between text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              <span>Development Progress</span>
              <span>75%</span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden p-0.5 border border-outline-variant/10 shadow-inner">
              <div className="h-full bg-linear-to-r from-primary to-primary-container rounded-full w-3/4 relative">
                <div className="absolute inset-0 bg-white/20 animate-shimmer scale-x-150"></div>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link 
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Back to Dashboard
            </Link>
            <button 
              onClick={() => alert("You will be notified when this feature goes live!")}
              className="w-full sm:w-auto px-8 py-3.5 bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-bold text-sm rounded-xl border border-outline-variant/15 transition-all"
            >
              Notify Me
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-xs text-outline font-semibold uppercase tracking-widest mt-12 relative z-10">
          AARCSX Deposity Operations Engine v1.2
        </p>
      </div>
    </LayoutWrapper>
  );
}
