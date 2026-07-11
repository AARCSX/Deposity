"use client";

import Link from "next/link";

const footerLinks = [
  {
    title: "Product",
    items: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Vehicles", href: "/vehicles" },
      { label: "Trips", href: "/trips" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Drivers", href: "/drivers" },
      { label: "Reports", href: "/reports" },
      { label: "Settings", href: "/settings" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Companies", href: "/companies" },
      { label: "Expenses", href: "/expenses" },
      { label: "Employees", href: "/employees" },
    ],
  },
];

export default function PremiumFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70 px-4 py-12 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-sm font-semibold text-white shadow-lg shadow-blue-500/30">
              D
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-700">Deposity</p>
              <p className="text-sm text-slate-500">AI-powered fleet ERP</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-600">
            Premium operations software for ambitious logistics teams that want clarity, control, and confidence at every mile.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {footerLinks.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-semibold text-slate-950">{group.title}</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {group.items.map((item) => (
                  <li key={item.label} className="transition hover:text-slate-950">
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-slate-200/80 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Deposity. All rights reserved.</p>
        <p>Built for logistics teams that require elegance and precision.</p>
      </div>
    </footer>
  );
}
