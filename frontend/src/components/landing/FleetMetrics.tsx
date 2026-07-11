"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const stats = [
  { label: "Vehicles", value: 10000, suffix: "+" },
  { label: "Companies", value: 250, suffix: "+" },
  { label: "Trips", value: 5000000, suffix: "+" },
  { label: "Uptime", value: 99.99, suffix: "%" },
];

const previewCards = [
  { title: "Live fleet overview", detail: "Interactive dispatch panel with route health and vehicle status." },
  { title: "Analytics dashboard", detail: "Fleet performance metrics in elegant real-time visualizations." },
  { title: "Depot operations", detail: "Centralized view of loading, parking, and maintenance workflows." },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const start = Date.now();
    const initial = 0;
    const step = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const nextValue = Math.floor(progress * value);
      setCount(nextValue);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);

  return (
    <span>{count.toLocaleString()}{suffix}</span>
  );
}

export default function FleetMetrics() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid gap-16 lg:grid-cols-[0.95fr_0.85fr] lg:items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="mb-6 max-w-xl"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Statistics</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                The numbers logistics teams trust.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Grow with confidence using a platform that supports every operational insight from depot to destination.
              </p>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2">
              {stats.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  className="rounded-[30px] border border-slate-200/80 bg-slate-50 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.06)]"
                >
                  <p className="text-3xl font-semibold tracking-tight text-slate-950">
                    <Counter value={item.value} suffix={item.suffix} />
                  </p>
                  <p className="mt-3 text-sm uppercase tracking-[0.28em] text-slate-500">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            {previewCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className="rounded-[32px] border border-slate-200/80 bg-slate-50 p-7 shadow-[0_32px_80px_rgba(15,23,42,0.05)]"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Preview</p>
                  <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-sm">
                    Live
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-950">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{card.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
