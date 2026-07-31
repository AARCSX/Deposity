"use client";

import React, { useState } from "react";

interface ExportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (month: number | "ALL", year: number | "ALL", category?: string) => void;
  title?: string;
  description?: string;
  categories?: string[];
}

const MONTHS = [
  { value: "ALL", label: "All Months (Full Year)" },
  { value: 1, label: "01 - January" },
  { value: 2, label: "02 - February" },
  { value: 3, label: "03 - March" },
  { value: 4, label: "04 - April" },
  { value: 5, label: "05 - May" },
  { value: 6, label: "06 - June" },
  { value: 7, label: "07 - July" },
  { value: 8, label: "08 - August" },
  { value: 9, label: "09 - September" },
  { value: 10, label: "10 - October" },
  { value: 11, label: "11 - November" },
  { value: 12, label: "12 - December" },
];

const currentYear = new Date().getFullYear();
const YEARS = ["ALL", currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

export default function ExportCsvModal({
  isOpen,
  onClose,
  onExport,
  title = "Export Data to CSV",
  description = "Select the target Month, Year, and Category to generate your CSV download.",
  categories,
}: ExportCsvModalProps) {
  const [selectedMonth, setSelectedMonth] = useState<number | "ALL">("ALL");
  const [selectedYear, setSelectedYear] = useState<number | "ALL">(currentYear);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  if (!isOpen) return null;

  const handleDownload = (e: React.FormEvent) => {
    e.preventDefault();
    onExport(selectedMonth, selectedYear, selectedCategory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-surface px-6 py-5 border-b border-outline-variant/15 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              <span className="material-symbols-outlined">download</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-on-surface">{title}</h3>
              <p className="text-xs text-on-surface-variant font-medium">{description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleDownload} className="p-6 space-y-4">
          {categories && categories.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-outline">Select Category / Filter</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-semibold"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All Expense Categories" : c}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-outline">Select Month</label>
            <select
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
              }
              className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-semibold"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-outline">Select Year</label>
            <select
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
              }
              className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-semibold"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y === "ALL" ? "All Years (All Time)" : y}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/15">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-outline-variant/20 text-sm font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition active:scale-[0.98] cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Download CSV
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
