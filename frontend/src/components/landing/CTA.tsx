"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="rounded-[40px] border border-white/20 bg-white/5 p-10 shadow-[0_40px_80px_rgba(15,23,42,0.16)] backdrop-blur"
        >
          <div className="grid gap-8 lg:grid-cols-[0.75fr_0.45fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-100">Ready to modernize?</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Launch your fleet operations on a premium platform.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-100/90">
                Deposity gives logistics teams instant visibility and effortless control over vehicles, drivers, trips, and depots.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-4 text-sm font-semibold text-slate-950 shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5"
              >
                Start free trial
              </Link>
              <Link
                href="#pricing"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                View pricing
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
