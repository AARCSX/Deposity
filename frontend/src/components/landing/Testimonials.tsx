"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

const testimonials = [
  {
    quote: "Deposity helped us cut dispatch time in half and gave our team confidence in route planning.",
    name: "Maya Chen",
    role: "Operations Lead, Atlas Logistics",
  },
  {
    quote: "The predictive maintenance tools prevented downtime and kept our fleet rolling.",
    name: "Noah Patel",
    role: "Fleet Manager, Urban Haul",
  },
  {
    quote: "We now have one single source of truth for vehicles, drivers, and depots.",
    name: "Lia Gonzales",
    role: "COO, Swift Freight",
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const testimonial = testimonials[active];

  const nav = useMemo(
    () => testimonials.map((item, index) => ({ ...item, active: index === active })),
    [active]
  );

  return (
    <section className="bg-slate-950 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-400">Customer stories</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Logistics teams love Deposity.
          </h2>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-[0.65fr_0.35fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="rounded-[40px] border border-white/10 bg-white/5 p-10 shadow-[0_40px_120px_rgba(15,23,42,0.25)] backdrop-blur"
          >
            <p className="text-2xl font-semibold leading-10 text-white">“{testimonial.quote}”</p>
            <div className="mt-8 flex items-center gap-4">
              <div className="h-14 w-14 rounded-3xl bg-slate-900/90" />
              <div>
                <p className="text-base font-semibold text-white">{testimonial.name}</p>
                <p className="text-sm text-slate-400">{testimonial.role}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-4 rounded-[36px] border border-white/10 bg-slate-900/90 p-6"
          >
            {nav.map((item, index) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setActive(index)}
                className={`w-full rounded-3xl border px-5 py-4 text-left transition ${
                  item.active ? "border-sky-500 bg-slate-800 text-white shadow-lg shadow-sky-500/20" : "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-600 hover:bg-slate-900"
                }`}
              >
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="mt-1 text-xs text-slate-400">{item.role}</p>
              </button>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
