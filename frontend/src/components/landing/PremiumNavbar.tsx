"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const navItems = ["Features", "Solutions", "Maintenance", "Pricing", "Resources", "Contact"];

export default function PremiumNavbar() {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-4 z-50 mx-auto flex w-full max-w-7xl justify-center px-4 sm:px-6 lg:px-8"
    >
      <div className="flex w-full items-center justify-between rounded-full border border-slate-200/80 bg-white/75 px-4 py-3 shadow-[0_20px_60px_-25px_rgba(37,99,235,0.35)] backdrop-blur-xl sm:px-6 lg:max-w-5xl">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-sm font-semibold text-white shadow-lg shadow-blue-500/30">
            D
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600">Deposity</p>
            <p className="text-xs text-slate-400">Fleet ERP Platform</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navItems.map((item) => (
            <Link key={item} href={`#${item.toLowerCase()}`} className="transition hover:text-slate-950">
              {item}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard"
            className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:text-slate-950 sm:inline-flex"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Book Demo
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
