"use client";

import { motion } from "framer-motion";

export default function Animations() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-10 top-20 h-36 w-36 rounded-full bg-sky-200/60 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-10 top-32 h-28 w-28 rounded-full bg-blue-200/50 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-10 h-24 w-24 -translate-x-1/2 rounded-full bg-cyan-200/50 blur-3xl"
      />
    </div>
  );
}
