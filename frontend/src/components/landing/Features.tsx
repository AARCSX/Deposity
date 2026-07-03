"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Fleet Management",
    description: "Monitor every vehicle, optimize routes, and keep your fleet moving with intelligent controls.",
  },
  {
    title: "Vehicle Maintenance",
    description: "Track service history, reminders, and predictive maintenance from one central system.",
  },
  {
    title: "Trip Tracking",
    description: "Plan routes, coordinate dispatch, and review trip performance in real time.",
  },
  {
    title: "Fuel Monitoring",
    description: "Reduce consumption, monitor cost trends, and stay ahead of fuel spend.",
  },
  {
    title: "Driver Management",
    description: "Manage certifications, schedules, performance insights, and crew availability.",
  },
  {
    title: "Analytics",
    description: "Powerful dashboards reveal depot efficiency, utilization, and growth metrics.",
  },
];

const timeline = [
  { step: "Service reminder", detail: "Automated notifications keep every fleet asset road-ready." },
  { step: "Maintenance history", detail: "Detailed records for every service and inspection event." },
  { step: "Predictive maintenance", detail: "Forecast issues before they impact operations." },
];

export default function Features() {
  return (
    <section className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid gap-16 lg:grid-cols-[0.9fr_0.95fr] lg:items-start">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="mb-8"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Premium features</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                A modern fleet platform built for growing logistics teams.
              </h2>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="rounded-[32px] border border-white bg-white p-6 shadow-[0_30px_60px_rgba(15,23,42,0.06)]"
                >
                  <p className="text-lg font-semibold text-slate-950">{feature.title}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-8 rounded-[36px] border border-slate-200/80 bg-white p-8 shadow-[0_40px_80px_rgba(15,23,42,0.06)] sm:p-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="rounded-[28px] bg-gradient-to-r from-sky-500 to-blue-600 p-7 text-white shadow-xl shadow-sky-500/20"
            >
              <p className="text-sm uppercase tracking-[0.28em] text-sky-100">Maintenance hub</p>
              <h3 className="mt-4 text-3xl font-semibold">Smart maintenance, fewer surprises.</h3>
              <p className="mt-4 text-sm leading-7 text-sky-100/90">
                Deposity keeps every asset healthy with reminders, service history, and predictive alerts.
              </p>
            </motion.div>

            <div className="space-y-6">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  className="rounded-[28px] border border-slate-200/80 bg-slate-50 p-5"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{item.step}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
