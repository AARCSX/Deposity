"use client";

import { motion } from "framer-motion";

export default function PremiumShowcase() {
  return (
    <section id="solutions" className="px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl rounded-[2.5rem] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-6 shadow-[0_30px_90px_-30px_rgba(15,23,42,0.45)] sm:p-10 lg:p-14">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">Live control center</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.025em] text-white sm:text-5xl">
              A beautiful operating layer for every fleet decision.
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Replace fragmented tools with a calm, premium experience that turns operations into a strategic advantage.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-slate-200">Maps & routes</div>
              <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-slate-200">Maintenance timeline</div>
              <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-slate-200">Fleet health</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="rounded-[2rem] border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
          >
            <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.06))] p-4 sm:p-5">
              <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/70 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-200">Fleet status</p>
                      <p className="text-xs text-slate-400">Global coverage</p>
                    </div>
                    <div className="rounded-full bg-sky-400/20 px-3 py-1 text-xs font-semibold text-sky-200">Live</div>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.25),_rgba(15,23,42,0.95))] p-3">
                    <svg viewBox="0 0 240 140" className="h-40 w-full">
                      <path d="M30 100 C70 70, 100 72, 135 85 S190 100, 215 68" stroke="#7dd3fc" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="6 6" />
                      <circle cx="60" cy="98" r="8" fill="#38bdf8" />
                      <circle cx="135" cy="83" r="8" fill="#f8fafc" />
                      <circle cx="210" cy="67" r="8" fill="#60a5fa" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/90 p-4 text-slate-900">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Trip timeline</p>
                      <p className="text-sm text-slate-500">4.2h left</p>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-slate-100">
                      <div className="h-2 w-[78%] rounded-full bg-gradient-to-r from-sky-500 to-blue-600" />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                      <div className="rounded-xl bg-slate-100 p-2"><p className="font-semibold">92%</p><p className="text-slate-500">Loaded</p></div>
                      <div className="rounded-xl bg-slate-100 p-2"><p className="font-semibold">14</p><p className="text-slate-500">Stops</p></div>
                      <div className="rounded-xl bg-slate-100 p-2"><p className="font-semibold">3</p><p className="text-slate-500">Alerts</p></div>
                    </div>
                  </div>

                  <div className="rounded-[1.4rem] border border-white/10 bg-white/90 p-4 text-slate-900">
                    <p className="text-sm font-semibold">Maintenance pulse</p>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2">
                        <span>Brake inspection</span>
                        <span className="font-semibold text-sky-600">Today</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2">
                        <span>Oil change</span>
                        <span className="font-semibold text-slate-700">Scheduled</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
