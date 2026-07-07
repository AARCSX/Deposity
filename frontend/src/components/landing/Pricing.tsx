"use client";

import { motion } from "framer-motion";

const plans = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "For small fleets starting to centralize operations.",
    features: ["Vehicle tracking", "Driver profiles", "Basic analytics"],
    badge: "Most popular",
  },
  {
    name: "Growth",
    price: "$149",
    period: "/month",
    description: "For growing logistics teams that need automation.",
    features: ["Maintenance automation", "Fuel insights", "Route coordination"],
    badge: "Best value",
  },
  {
    name: "Enterprise",
    price: "Contact us",
    period: "",
    description: "Custom plans for large carrier operations and depots.",
    features: ["Dedicated success", "Custom integrations", "Priority support"],
    badge: "For teams",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Pricing</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Simple plans for every fleet size.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Choose the plan that fits your operations, from lean depots to enterprise logistics networks.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className={`rounded-[36px] border p-8 shadow-[0_32px_80px_rgba(15,23,42,0.08)] ${
                plan.name === "Growth" ? "border-sky-200 bg-white" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-950">{plan.name}</p>
                  <p className="mt-2 text-sm text-slate-500">{plan.description}</p>
                </div>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                  {plan.badge}
                </span>
              </div>
              <div className="mt-8 flex items-end gap-2">
                <p className="text-5xl font-semibold tracking-tight text-slate-950">{plan.price}</p>
                <span className="pb-1 text-sm text-slate-500">{plan.period}</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-slate-600">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/10 text-sky-600">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-10 inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:bg-sky-600"
              >
                Choose plan
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
