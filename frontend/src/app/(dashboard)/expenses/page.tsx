"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import CreateExpenseModal from "@/components/expenses/CreateExpenseModal";
import SetupVehicleEmiModal from "@/components/expenses/SetupVehicleEmiModal";
import ExportCsvModal from "@/components/common/ExportCsvModal";
import { ExpenseRecord, VehicleEMISummary } from "@/types/expense";
import { authenticatedFetch } from "@/lib/api";

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [emiSummaries, setEmiSummaries] = useState<VehicleEMISummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"ledger" | "emi">("ledger");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmiSetupOpen, setIsEmiSetupOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("deposity_token");
      if (!token) {
        router.push("/");
      }
    }
  }, [router]);

  const loadData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [expRes, emiRes] = await Promise.all([
        authenticatedFetch("/expenses"),
        authenticatedFetch("/expenses/emi-summary"),
      ]);

      if (expRes.ok) {
        const expData = await expRes.json();
        setExpenses(Array.isArray(expData) ? expData : []);
      }
      if (emiRes.ok) {
        const emiData = await emiRes.json();
        setEmiSummaries(Array.isArray(emiData) ? emiData : []);
      }
    } catch (err: any) {
      setFetchError(err.message || "Failed to load expenses ledger");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateExpense = async (payload: any) => {
    const response = await authenticatedFetch("/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to record expense");
    }

    await loadData();
  };

  const handleDeleteExpense = async (id?: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this expense record?")) return;

    try {
      const res = await authenticatedFetch(`/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete expense");
      await loadData();
    } catch (err: any) {
      alert(err.message || "Could not delete expense");
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchCat = selectedCategory === "All" || e.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        (e.recipientName && e.recipientName.toLowerCase().includes(q)) ||
        (e.vehicleNumber && e.vehicleNumber.toLowerCase().includes(q)) ||
        (e.notes && e.notes.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [expenses, selectedCategory, searchQuery]);

  // Financial Metrics
  const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalSalaryExp = expenses
    .filter((e) => e.category === "Salary")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalEMIExp = expenses
    .filter((e) => e.category === "EMI")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalFleetExp = expenses
    .filter((e) => e.category === "Fuel & Fleet")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const handleExportExpensesCSV = (month: number | "ALL", year: number | "ALL", category?: string) => {
    const filtered = expenses.filter((e) => {
      const d = new Date(e.expenseDate || e.createdAt || "");
      const matchYear = year === "ALL" || (!isNaN(d.getTime()) && d.getFullYear() === Number(year));
      const matchMonth = month === "ALL" || (!isNaN(d.getTime()) && d.getMonth() + 1 === Number(month));
      const matchCategory = !category || category === "All" || e.category === category;
      return matchYear && matchMonth && matchCategory;
    });

    if (filtered.length === 0) {
      alert("No expense records found matching the selected filters.");
      return;
    }

    const headers = ["Expense Date", "Category", "Title", "Amount (INR)", "Recipient / Vehicle", "Payment Mode", "Notes"];
    const rows = filtered.map((e) => [
      `"${e.expenseDate || ""}"`,
      `"${e.category || ""}"`,
      `"${(e.title || "").replace(/"/g, '""')}"`,
      `"${e.amount || 0}"`,
      `"${(e.recipientName || e.vehicleNumber || "").replace(/"/g, '""')}"`,
      `"${e.paymentMode || "Bank Transfer"}"`,
      `"${(e.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const catSuffix = category && category !== "All" ? `_${category.replace(/[^a-zA-Z0-9]/g, "")}` : "";
    const fileName = `Deposity_Expenses${catSuffix}_${month !== "ALL" ? `Month_${month}` : "FullYear"}_${year !== "ALL" ? year : "AllTime"}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-warning text-3xl">payments</span>
              <h1 className="text-3xl font-black text-on-surface tracking-tight">Expenses Portal</h1>
            </div>
            <p className="text-sm font-medium text-on-surface-variant mt-1">
              Log depo expenses via 1-step wizard, track salary disbursements, and manage centralized Vehicle EMI schedules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-surface-container-high text-on-surface border border-outline-variant/20 rounded-2xl font-bold text-sm hover:bg-surface-container-highest transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Export Expenses (CSV)
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">add_card</span>
              Log Expense
            </button>
          </div>
        </div>

        {/* Metrics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/10 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-outline block">Total Outflow</span>
            <span className="text-2xl font-black text-on-surface mt-1 block tabular-nums">
              ₹{totalExpenses.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/10 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">Salaries Paid</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block tabular-nums">
              ₹{totalSalaryExp.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/10 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">Vehicle EMIs</span>
            <span className="text-2xl font-black text-blue-600 mt-1 block tabular-nums">
              ₹{totalEMIExp.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/10 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">Fuel &amp; Fleet Ops</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block tabular-nums">
              ₹{totalFleetExp.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-outline-variant/15 gap-8">
          <button
            onClick={() => setActiveTab("ledger")}
            className={`pb-3.5 text-sm font-black transition relative flex items-center gap-2 cursor-pointer ${
              activeTab === "ledger" ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-lg">receipt_long</span>
            Expense Ledger
            {activeTab === "ledger" && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("emi")}
            className={`pb-3.5 text-sm font-black transition relative flex items-center gap-2 cursor-pointer ${
              activeTab === "emi" ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-lg">directions_bus</span>
            Vehicle EMI Tracker ({emiSummaries.length})
            {activeTab === "emi" && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
            )}
          </button>
        </div>

        {/* TAB 1: EXPENSE LEDGER */}
        {activeTab === "ledger" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {["All", "Salary", "EMI", "FASTag", "Fuel & Fleet", "Office & Misc"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-slate-900 text-white"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="bg-surface-container-lowest p-1.5 rounded-2xl border border-outline-variant/10 shadow-xs flex items-center gap-2 px-3 w-full sm:w-72">
                <span className="material-symbols-outlined text-outline text-sm">search</span>
                <input
                  type="text"
                  placeholder="Search ledger..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-on-surface outline-none font-medium"
                />
              </div>
            </div>

            {/* Ledger Table */}
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-high text-on-surface-variant uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Expense Title</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Recipient / Vehicle</th>
                      <th className="px-6 py-4">Payment Date &amp; Mode</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 font-medium">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500 font-semibold">
                          Loading expense ledger...
                        </td>
                      </tr>
                    ) : filteredExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-slate-500">
                          <span className="material-symbols-outlined text-4xl text-outline mb-2">receipt</span>
                          <p className="font-bold text-on-surface">No expenses found</p>
                          <p className="text-[11px] mt-0.5">Click "Log Expense" to add your first transaction.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-surface-container-low/50 transition">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 text-sm">{exp.title}</div>
                            {exp.notes && <div className="text-[11px] text-slate-500">{exp.notes}</div>}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                exp.category === "Salary"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : exp.category === "EMI"
                                  ? "bg-blue-100 text-blue-800"
                                  : exp.category === "FASTag"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : exp.category === "Fuel & Fleet"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {exp.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {exp.recipientName ? (
                              <div className="font-semibold text-slate-800">
                                {exp.recipientName} <span className="text-[10px] text-slate-500 uppercase font-mono">({exp.recipientType})</span>
                              </div>
                            ) : exp.vehicleNumber ? (
                              <div className="font-bold text-blue-700">{exp.vehicleNumber}</div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{exp.expenseDate}</div>
                            <div className="text-[10px] text-slate-500">{exp.paymentMode || "Bank Transfer"}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="font-black text-slate-900 text-sm tabular-nums">
                              ₹{exp.amount.toLocaleString("en-IN")}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1.5 text-outline hover:text-error hover:bg-error/10 rounded-full transition cursor-pointer"
                              title="Delete Expense"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VEHICLE EMI TRACKER */}
        {activeTab === "emi" && (
          <div className="space-y-6">
            <div className="bg-surface-container-low/40 p-6 rounded-3xl border border-outline-variant/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-on-surface">Vehicle EMI Loans &amp; Installments</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Centralized tracking for fleet vehicle loans, bank financing, and paid installment counts.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEmiSetupOpen(true)}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">post_add</span>
                  Setup Vehicle EMI
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-700 transition cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">payments</span>
                  Pay EMI via Wizard
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {emiSummaries.length === 0 ? (
                <div className="col-span-full py-16 text-center rounded-3xl border border-dashed border-outline-variant/20 bg-surface-container-lowest p-8">
                  <span className="material-symbols-outlined text-5xl text-outline mb-3">directions_bus</span>
                  <p className="text-base font-bold text-on-surface">No active Vehicle EMI schedules</p>
                  <p className="text-xs text-on-surface-variant mt-1 max-w-sm">
                    When you log EMI expenses for vehicles, their installment progress and bank loan metrics will populate here automatically.
                  </p>
                </div>
              ) : (
                emiSummaries.map((emi) => {
                  const pctPaid = emi.totalLoanAmount > 0 ? Math.round((emi.totalPaid / emi.totalLoanAmount) * 100) : 0;

                  return (
                    <div
                      key={emi.vehicleId}
                      className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-xs space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-outline block">
                            Vehicle Registration
                          </span>
                          <span className="text-xl font-black text-slate-900">{emi.vehicleNumber}</span>
                        </div>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold rounded-full">
                          {emi.financingBank || "HDFC Bank"}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-600">Loan Paid Progress</span>
                          <span className="text-blue-700 font-extrabold">{pctPaid}%</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(pctPaid, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Financial Breakdown */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-3 bg-slate-50 rounded-2xl">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Loan</span>
                          <span className="text-sm font-black text-slate-900 tabular-nums">
                            ₹{emi.totalLoanAmount.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-2xl">
                          <span className="text-[10px] font-bold uppercase text-emerald-600 block">Amount Paid</span>
                          <span className="text-sm font-black text-emerald-700 tabular-nums">
                            ₹{emi.totalPaid.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="p-3 bg-rose-50 rounded-2xl">
                          <span className="text-[10px] font-bold uppercase text-rose-600 block">Remaining</span>
                          <span className="text-sm font-black text-rose-700 tabular-nums">
                            ₹{emi.remainingAmount.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-2xl">
                          <span className="text-[10px] font-bold uppercase text-blue-600 block">Monthly EMI</span>
                          <span className="text-sm font-black text-blue-700 tabular-nums">
                            ₹{Math.round(emi.monthlyEmi).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] font-bold text-slate-500 flex justify-between items-center pt-2 border-t border-slate-100">
                        <span>Installments: {emi.paidInstallments} / {emi.totalInstallments}</span>
                        {emi.paidInstallments >= emi.totalInstallments || emi.remainingAmount <= 0 ? (
                          <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">verified</span> Paid Off
                          </span>
                        ) : (
                          <span>Next Due: {emi.nextDueDate ? new Date(emi.nextDueDate).toLocaleDateString("en-IN") : "—"}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 1-Step Expense Wizard Modal */}
        <CreateExpenseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateExpense}
        />

        {/* Setup Vehicle EMI Modal */}
        <SetupVehicleEmiModal
          isOpen={isEmiSetupOpen}
          onClose={() => setIsEmiSetupOpen(false)}
          onSuccess={loadData}
        />

        {/* Export CSV Modal */}
        <ExportCsvModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExport={handleExportExpensesCSV}
          categories={["All", "Salary", "EMI", "FASTag", "Fuel & Fleet", "Office & Misc"]}
          title="Export Expense Ledger (CSV)"
          description="Filter expenses by category, month, and year for CSV file generation."
        />
      </div>
    </>
  );
}
