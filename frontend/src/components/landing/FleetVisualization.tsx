"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const cards = [
  {
    title: "Live Trucks",
    value: "1,284",
    helper: "+12 today",
    delay: 0.1,
  },
  {
    title: "Today's Trips",
    value: "238",
    helper: "On schedule",
    delay: 0.2,
  },
  {
    title: "Parking Availability",
    value: "86%",
    helper: "42 bays open",
    delay: 0.3,
  },
  {
    title: "Maintenance Alerts",
    value: "3",
    helper: "2 scheduled",
    delay: 0.4,
  },
];

function useCountUp(target: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame: number;
    const duration = 900;
    const start = performance.now();

    const step = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value.toLocaleString();
}

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="10" width="42" height="20" rx="4" fill="#0F172A" />
      <rect x="34" y="4" width="18" height="16" rx="4" fill="#1363DF" />
      <path d="M16 30h8" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 30h8" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
      <circle cx="16" cy="34" r="4" fill="#1E293B" />
      <circle cx="48" cy="34" r="4" fill="#1E293B" />
      <path d="M40 8h10" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
      <path d="M42 14v10" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function FleetVisualization() {
  const liveTrucks = useCountUp(1284);
  const trips = useCountUp(238);

  return (
    <div className="relative mx-auto max-w-[720px] overflow-hidden rounded-[40px] border border-slate-200/70 bg-slate-100/90 p-6 shadow-[0_40px_90px_rgba(15,23,42,0.14)] sm:p-8">
      <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-slate-200/50 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-100 to-transparent" />

      <div className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.12)]">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-cyan-50" />
        <div className="absolute left-8 top-8 h-20 w-20 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute right-10 top-16 h-28 w-28 rounded-full bg-cyan-200/30 blur-3xl" />

        <div className="relative z-10 grid gap-6 p-6 sm:grid-cols-[1.15fr_0.85fr] sm:p-8">
          <div className="space-y-6 rounded-[32px] border border-slate-200/70 bg-slate-950/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Depot operating center</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Active route tracking</h2>
              </div>
              <span className="rounded-full bg-slate-900/80 px-3 py-2 text-xs font-semibold text-sky-200">Realtime</span>
            </div>

            <div className="relative overflow-hidden rounded-[32px] border border-slate-800/70 bg-slate-900/95 p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_45%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_35%)]" />
              <div className="relative h-[280px] overflow-hidden rounded-[28px] bg-slate-950">
                <div className="absolute inset-x-6 top-10 h-1 rounded-full bg-slate-600/80" />
                <div className="absolute left-16 top-24 h-1 w-24 rounded-full bg-slate-600/80" />
                <div className="absolute right-14 top-32 h-1 w-20 rounded-full bg-slate-600/80" />
                <div className="absolute left-14 top-52 h-1 w-[220px] rounded-full bg-slate-600/80" />
                <div className="absolute right-10 top-72 h-1 w-[160px] rounded-full bg-slate-600/80" />
                <div className="absolute left-8 top-40 h-8 w-8 rounded-full bg-sky-400/20 shadow-[0_0_40px_rgba(14,165,233,0.35)]" />
                <div className="absolute right-16 top-80 h-10 w-10 rounded-full bg-cyan-400/20 shadow-[0_0_40px_rgba(6,182,212,0.35)]" />
                <div className="absolute left-[38%] top-24 h-20 w-20 rounded-full border border-sky-400/20 bg-slate-800/60" />

                <motion.div
                  className="absolute left-8 top-14"
                  animate={{ x: [0, 220, 0], y: [0, 8, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <TruckIcon className="h-14 w-auto" />
                </motion.div>

                <motion.div
                  className="absolute left-24 top-[172px]"
                  animate={{ x: [0, 190, 0], y: [0, -6, 0] }}
                  transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                >
                  <TruckIcon className="h-14 w-auto" />
                </motion.div>

                <motion.div
                  className="absolute right-8 top-40"
                  animate={{ x: [0, -180, 0], y: [0, 8, 0] }}
                  transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                >
                  <TruckIcon className="h-14 w-auto" />
                </motion.div>

                <div className="absolute bottom-6 left-6 right-6 rounded-[24px] border border-slate-700/80 bg-slate-900/95 p-4 text-sm text-slate-400 shadow-[0_20px_80px_rgba(15,23,42,0.2)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Next dispatch</p>
                      <p className="mt-2 text-base font-semibold text-white">TRK-1134 leaving in 8m</p>
                    </div>
                    <span className="rounded-full bg-slate-800/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">On time</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.05 }}
                className="rounded-[28px] border border-slate-800/70 bg-slate-900/95 p-4"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Depot capacity</p>
                <p className="mt-3 text-2xl font-semibold text-white">92%</p>
                <p className="mt-2 text-sm text-slate-400">64 of 70 bays active</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.1 }}
                className="rounded-[28px] border border-slate-800/70 bg-slate-900/95 p-4"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Fleet health</p>
                <p className="mt-3 text-2xl font-semibold text-white">99.1%</p>
                <p className="mt-2 text-sm text-slate-400">No urgent issues</p>
              </motion.div>
            </div>
          </div>

          <div className="space-y-4">
            {cards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 + index * 0.05 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
              >
                <div className="absolute -right-8 top-6 h-24 w-24 rounded-full bg-sky-100/50 blur-3xl" />
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{card.title}</p>
                    <p className="mt-4 text-3xl font-semibold text-slate-950">{card.value}</p>
                  </div>
                  <div className="h-12 w-12 rounded-[22px] bg-sky-500/10 p-3 text-sky-600 shadow-[0_14px_40px_rgba(56,189,248,0.16)]">
                    <TruckIcon className="h-full w-full" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-500">{card.helper}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
