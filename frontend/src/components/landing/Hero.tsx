"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import FleetVisualization from "./FleetVisualization";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-10 pb-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="mb-6 inline-flex items-center rounded-full border border-sky-200/80 bg-sky-50/70 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm shadow-sky-200/50">
              Trusted by 500+ Logistics Companies
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl xl:text-7xl">
              Manage Every Truck.
              <br />
              Every Driver.
              <br />
              <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Every Depot.
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
              Deposity is the unified operating platform for logistics companies, managing fleets, depots, drivers, fuel, maintenance, analytics, and trips from one intelligent dashboard.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-sky-500 px-7 py-3 text-sm font-semibold text-white shadow-xl shadow-sky-500/30 transition hover:-translate-y-0.5 hover:bg-sky-600"
              >
                Get Started
              </Link>
              <Link
                href="#pricing"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
              >
                Book Demo
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Live Trucks", value: "1,284" },
                { label: "Parking Availability", value: "86%" },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5 shadow-lg shadow-slate-200/70"
                >
                  <p className="text-3xl font-semibold text-slate-950">{item.value}</p>
                  <p className="mt-2 text-sm uppercase tracking-[0.24em] text-slate-500">
                    {item.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
            className="relative"
          >
            <FleetVisualization />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
