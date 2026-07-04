"use client";

import { motion } from "framer-motion";
import Link from "next/link";

function StatCard({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.3)] backdrop-blur ${className || ""}`}>
      <p className="text-lg font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

export default function PremiumHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-10 sm:px-6 lg:px-8 lg:pb-32 lg:pt-16">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-5%] top-[-15%] h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="absolute right-[-8%] top-10 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-indigo-100/60 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Trusted by 500+ logistics companies
          </div>

          <h1 className="text-5xl font-semibold leading-[0.95] tracking-[-0.03em] text-slate-950 sm:text-6xl lg:text-7xl">
            Move Freight Smarter.
            <br />
            Manage Every <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700 bg-clip-text text-transparent">Fleet</span>.
            <br />
            From One Platform.
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
            AI-powered fleet ERP built for logistics companies to manage vehicles, trips, maintenance, fuel, drivers, warehouses, and analytics in one elegant operating system.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" className="rounded-full bg-slate-950 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800">
              Get Started
            </Link>
            <Link href="/dashboard" className="rounded-full border border-slate-200 bg-white/70 px-6 py-3 text-center text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:text-slate-950">
              Dashboard Preview
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, index) => (
                <span key={index}>★</span>
              ))}
            </div>
            <p className="font-medium text-slate-600">Trusted by industry leaders in global freight.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-sky-200/60 via-white to-blue-100/70 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2.2rem] border border-white/70 bg-white/70 p-3 shadow-[0_30px_90px_-30px_rgba(15,23,42,0.3)] backdrop-blur-xl sm:p-4">
            <div className="rounded-[1.7rem] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(240,249,255,0.95))] p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Command Center</p>
                  <p className="text-sm text-slate-500">Live network overview</p>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">All systems live</div>
              </div>

              <div className="relative overflow-hidden rounded-[1.6rem] border border-slate-200/70 bg-slate-950 p-4 text-white sm:p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_40%),linear-gradient(135deg,rgba(2,132,199,0.32),rgba(15,23,42,0.9))]" />
                <div className="relative">
                  <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur">
                    <p className="text-sm font-medium">Route intelligence</p>
                    <p className="text-sm text-sky-200">Live · 14 active</p>
                  </div>

                  <div className="relative h-60 rounded-[1.3rem] border border-white/10 bg-[linear-gradient(120deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03))] p-3">
                    <svg viewBox="0 0 300 220" className="h-full w-full">
                      <path d="M40 160 C80 125, 110 135, 140 110 S220 70, 260 90" stroke="#7dd3fc" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="6 6" />
                      <path d="M45 165 Q95 120 145 110 T260 95" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.5" fill="none" />
                      <circle cx="60" cy="165" r="6" fill="#38bdf8" />
                      <circle cx="140" cy="110" r="6" fill="#f8fafc" />
                      <circle cx="260" cy="90" r="6" fill="#60a5fa" />
                    </svg>

                    <motion.div
                      animate={{ x: [0, 160, 0], y: [0, -15, 0] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute left-10 top-12"
                    >
                      <div className="rounded-full border border-sky-300/30 bg-sky-400/20 p-2 backdrop-blur">
                        <div className="h-8 w-10 rounded-full bg-white/85" />
                      </div>
                    </motion.div>

                    <motion.div
                      animate={{ y: [0, -10, 0], x: [0, 6, 0] }}
                      transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute right-6 top-8"
                    >
                      <div className="rounded-2xl border border-white/10 bg-white/10 p-2 backdrop-blur">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600" />
                      </div>
                    </motion.div>

                    <div className="absolute bottom-4 left-4 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur">
                      <p className="text-xs text-slate-300">Warehouse</p>
                      <p className="text-sm font-semibold">Dock 07</p>
                    </div>

                    <div className="absolute bottom-4 right-4 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur">
                      <p className="text-xs text-slate-300">Maintenance</p>
                      <p className="text-sm font-semibold">2 alerts</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <StatCard label="Fuel efficiency" value="+12%" className="bg-white/10 text-white" />
                    <StatCard label="On-time trips" value="98.7%" className="bg-white/10 text-white" />
                    <StatCard label="Active drivers" value="284" className="bg-white/10 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
