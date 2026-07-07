"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "Deposity gave our operations team a calm, shared command center. It feels like a product built for the future.",
    name: "Alicia Chen",
    role: "Chief Operating Officer",
    company: "Northstar Logistics",
  },
  {
    quote: "The experience is as polished as the product itself. Switching to Deposity felt like upgrading our entire organization.",
    name: "Marcus Alvarez",
    role: "VP of Fleet",
    company: "Harbor Freight",
  },
  {
    quote: "We replaced six tools with one premium platform. Maintenance and dispatch finally work in sync.",
    name: "Elena Brooks",
    role: "Director of Transportation",
    company: "BluePeak Haulage",
  },
];

export default function PremiumTestimonials() {
  return (
    <section id="resources" className="px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-600">Customer love</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-5xl">
            Teams choose Deposity because it feels as premium as it performs.
          </h2>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.article
              key={item.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.2)] backdrop-blur"
            >
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <span key={starIndex}>★</span>
                ))}
              </div>
              <p className="mt-6 text-lg leading-8 text-slate-700">“{item.quote}”</p>
              <div className="mt-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-sm font-semibold text-white">
                  {item.name.split(" ").map((part) => part[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-slate-950">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.role}, {item.company}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
