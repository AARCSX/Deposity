"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PremiumCTA() {
  return (
    <section id="contact" className="px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-[linear-gradient(135deg,_rgba(255,255,255,0.95),_rgba(240,249,255,0.95))] shadow-[0_30px_90px_-32px_rgba(15,23,42,0.3)]">
        <div className="grid gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:px-12 lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-600">Ready to modernize operations?</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-5xl">
              Give every fleet decision the elegance it deserves.
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Bring your vehicles, drivers, maintenance, and analytics into one premium operating system built for the future of freight.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className="rounded-full bg-slate-950 px-6 py-3 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">
                Start Free Trial
              </Link>
              <Link href="/dashboard" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-sky-200 hover:text-slate-950">
                Open Dashboard
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/80 p-5 shadow-inner"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_45%)]" />
            <div className="relative rounded-[1.5rem] border border-slate-200/80 bg-gradient-to-br from-slate-950 to-sky-900 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Next dispatch</p>
                  <p className="text-lg font-semibold">Route 412 • 06:45</p>
                </div>
                <div className="rounded-full bg-sky-400/20 px-3 py-1 text-sm font-semibold text-sky-100">Priority</div>
              </div>
              <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="h-24 rounded-[1rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.25),_rgba(255,255,255,0.05))]" />
                <div className="mt-4 flex items-center justify-between text-sm text-slate-200">
                  <span>Vehicle 18</span>
                  <span>ETA 08:10</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
