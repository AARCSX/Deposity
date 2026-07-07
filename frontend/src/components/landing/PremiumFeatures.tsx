"use client";

import { motion } from "framer-motion";

import Link from "next/link";

const features = [
  {
    title: "Fleet Management",
    description: "Route orchestration, asset visibility, and real-time dispatch from a single pane of glass.",
    accent: "from-sky-500/15 via-white to-cyan-100/60",
    badge: "Precise control",
    illustration: "Fleet",
    href: "/vehicles",
  },
  {
    title: "Vehicle Maintenance",
    description: "Prevent downtime with automated work orders, reminders, and predictive service signals.",
    accent: "from-indigo-500/15 via-white to-slate-100/60",
    badge: "Built for uptime",
    illustration: "Service",
    href: "/vehicles",
  },
  {
    title: "AI Predictive Maintenance",
    description: "Machine learning detects risk patterns before they become expensive failures.",
    accent: "from-blue-500/20 via-white to-sky-100/60",
    badge: "Forecast risk",
    illustration: "AI",
    href: "/vehicles",
  },
  {
    title: "Trip Tracking",
    description: "Monitor progress across your network with live transit, milestones, and exception handling.",
    accent: "from-cyan-500/15 via-white to-blue-100/60",
    badge: "Live visibility",
    illustration: "Trips",
    href: "/trips",
  },
  {
    title: "Fuel Analytics",
    description: "Uncover inefficiency with cost-per-mile, idle time, and utilization analytics.",
    accent: "from-emerald-500/15 via-white to-sky-100/60",
    badge: "Lower cost",
    illustration: "Fuel",
    href: "/dashboard",
  },
  {
    title: "Driver Management",
    description: "Coordinate drivers, certifications, hours, and compliance in one intelligent workflow.",
    accent: "from-violet-500/15 via-white to-blue-100/60",
    badge: "Compliance ready",
    illustration: "Drivers",
    href: "/drivers",
  },
  {
    title: "Reports & Insights",
    description: "Executive reporting and board-ready metrics updated automatically every minute.",
    accent: "from-slate-500/15 via-white to-sky-100/60",
    badge: "Executive clarity",
    illustration: "Insights",
    href: "/reports",
  },
  {
    title: "Warehouse Operations",
    description: "Coordinate inventory, load planning, dock scheduling, and warehouse performance.",
    accent: "from-amber-500/15 via-white to-sky-100/60",
    badge: "Flow at scale",
    illustration: "Warehouse",
    href: "/dashboard",
  },
];

function FeatureCard({ feature, index }: { feature: (typeof features)[number]; index: number }) {
  return (
    <Link href={feature.href} className="block">
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, delay: index * 0.04 }}
        className={`group rounded-[2rem] border border-slate-200/80 bg-gradient-to-br ${feature.accent} p-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)]`}
      >
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-white/80 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            {feature.badge}
          </span>
          <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">{feature.illustration}</div>
        </div>

        <div className="mt-6 rounded-[1.4rem] border border-white/80 bg-white/60 p-4 shadow-inner">
          <div className="mb-4 h-24 rounded-[1rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(224,242,254,0.9))] p-4">
            <div className="flex h-full items-end justify-between gap-2">
              {[52, 76, 64, 90, 70].map((height, idx) => (
                <div key={idx} className="flex-1 rounded-t-full bg-gradient-to-t from-sky-500 to-blue-400" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
          <h3 className="text-xl font-semibold text-slate-950">{feature.title}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
        </div>
      </motion.article>
    </Link>
  );
}

export default function PremiumFeatures() {
  return (
    <section id="features" className="px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-600">Platform capabilities</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-5xl">
            Premium operations built for modern logistics teams.
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            From dispatch to asset care, every workflow is designed to feel calm, intelligent, and delightfully efficient.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
