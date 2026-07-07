"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "15,000+", label: "Vehicles" },
  { value: "750+", label: "Companies" },
  { value: "9 Million+", label: "Trips" },
  { value: "99.98%", label: "Uptime" },
];

export default function PremiumStats() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl rounded-[2.4rem] border border-slate-200/80 bg-white/70 p-8 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.25)] backdrop-blur sm:p-10 lg:p-14">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-600">Operational confidence</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-5xl">
              Trusted by teams that cannot afford downtime.
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Every metric is designed to communicate calm, precision, and measurable impact at enterprise scale.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="rounded-[1.5rem] border border-slate-200/80 bg-gradient-to-br from-white to-sky-50/70 p-5 shadow-sm"
              >
                <p className="text-3xl font-semibold tracking-[-0.02em] text-slate-950">{stat.value}</p>
                <p className="mt-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
