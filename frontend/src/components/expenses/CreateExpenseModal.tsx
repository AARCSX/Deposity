"use client";

import React, { useEffect, useState } from "react";
import { CreateExpenseRequest } from "@/types/expense";
import { authenticatedFetch } from "@/lib/api";

interface CreateExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExpenseRequest) => Promise<void>;
}

export default function CreateExpenseModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateExpenseModalProps) {
  const [category, setCategory] = useState<"Salary" | "EMI" | "FASTag" | "Fuel & Fleet" | "Office & Misc">("Salary");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMode, setPaymentMode] = useState("Bank Transfer");
  const [notes, setNotes] = useState("");

  // Salary specific
  const [recipientType, setRecipientType] = useState<"driver" | "employee">("driver");
  const [recipientId, setRecipientId] = useState("");
  const [pendingBalance, setPendingBalance] = useState<number | "">(0);

  // EMI / Vehicle specific
  const [vehicleId, setVehicleId] = useState("");
  const [installmentNo, setInstallmentNo] = useState<number | "">("");

  // Lists for dropdowns
  const [drivers, setDrivers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch drivers, employees, vehicles
    authenticatedFetch("/drivers")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setDrivers(Array.isArray(data) ? data : []))
      .catch(() => {});

    authenticatedFetch("/employees")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setEmployees(Array.isArray(data) ? data : []))
      .catch(() => {});

    authenticatedFetch("/vehicles")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setVehicles(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [isOpen]);

  // Update pending balance auto-suggestion when driver/employee changes
  useEffect(() => {
    if (category !== "Salary" || !recipientId) return;

    if (recipientType === "driver") {
      const d = drivers.find((x) => x.id === recipientId);
      if (d) {
        const rawBal = parseFloat((d.pendingBalance || "0").replace(/[^0-9.]/g, "")) || 0;
        setPendingBalance(rawBal);
      }
    } else {
      const e = employees.find((x) => x.id === recipientId);
      if (e) {
        setPendingBalance(e.pendingBalance || 0);
      }
    }
  }, [recipientId, recipientType, category, drivers, employees]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid expense amount.");
      return;
    }

    if (category === "Salary" && !recipientId) {
      setError("Please select the recipient driver or employee.");
      return;
    }

    if (category === "EMI" && !vehicleId) {
      setError("Please select the vehicle for EMI payment.");
      return;
    }

    if (category === "FASTag" && !vehicleId) {
      setError("Please select the vehicle for FASTag recharge.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let finalTitle = title;
      if (!finalTitle.trim()) {
        if (category === "FASTag") {
          const selectedVeh = vehicles.find((v) => v.id === vehicleId);
          const regNo = selectedVeh?.core?.registrationNumber || selectedVeh?.registrationNumber || "";
          finalTitle = regNo ? `FASTag Recharge (${regNo})` : "FASTag Toll Recharge";
        } else if (category === "Salary") {
          finalTitle = "Staff Salary Disbursement";
        } else if (category === "EMI") {
          finalTitle = "Vehicle Loan EMI Payment";
        } else {
          finalTitle = `${category} Expense`;
        }
      }

      const payload: CreateExpenseRequest = {
        category,
        title: finalTitle,
        amount: Number(amount),
        expenseDate,
        recipientType: category === "Salary" ? recipientType : "",
        recipientId: category === "Salary" ? recipientId : "",
        pendingBalance: category === "Salary" ? Number(pendingBalance || 0) : 0,
        vehicleId: category === "EMI" || category === "FASTag" || category === "Fuel & Fleet" ? vehicleId : "",
        installmentNo: category === "EMI" && installmentNo ? Number(installmentNo) : 0,
        paymentMode,
        notes,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to log expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-surface px-6 py-5 border-b border-outline-variant/15 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-warning/10 text-warning flex items-center justify-center font-bold text-lg">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-on-surface">1-Step Expense Wizard</h3>
              <p className="text-xs text-on-surface-variant font-medium">
                Log fleet expenses, salaries, EMI, FASTag, fuel, or operational costs
              </p>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-error/10 border border-error/20 text-xs text-error font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </div>
          )}

          {/* Expense Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-outline">Select Expense Type *</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(["Salary", "EMI", "FASTag", "Fuel & Fleet", "Office & Misc"] as const).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-2.5 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                    category === cat
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                      : "bg-surface-container-highest/50 border-outline-variant/20 text-on-surface hover:bg-surface-container-highest"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {cat === "Salary"
                      ? "badge"
                      : cat === "EMI"
                      ? "directions_bus"
                      : cat === "FASTag"
                      ? "credit_card"
                      : cat === "Fuel & Fleet"
                      ? "local_gas_station"
                      : "business"}
                  </span>
                  <span className="truncate w-full text-center">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* DYNAMIC FORM FIELDS DEPENDING ON CATEGORY */}

          {/* 1. SALARY SPECIFIC */}
          {category === "Salary" && (
            <div className="p-4 rounded-2xl bg-surface-container-low/40 border border-outline-variant/15 space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-xs font-bold text-outline">Recipient Type:</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-on-surface cursor-pointer">
                    <input
                      type="radio"
                      name="recType"
                      checked={recipientType === "driver"}
                      onChange={() => {
                        setRecipientType("driver");
                        setRecipientId("");
                      }}
                      className="accent-primary"
                    />
                    Driver
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-on-surface cursor-pointer">
                    <input
                      type="radio"
                      name="recType"
                      checked={recipientType === "employee"}
                      onChange={() => {
                        setRecipientType("employee");
                        setRecipientId("");
                      }}
                      className="accent-primary"
                    />
                    Staff Employee
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-outline">
                  Select {recipientType === "driver" ? "Driver" : "Employee"} *
                </label>
                <select
                  required
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-semibold"
                >
                  <option value="">-- Choose Recipient --</option>
                  {recipientType === "driver"
                    ? drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.phone}) • Base: {d.salary || "₹0"}
                        </option>
                      ))
                    : employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.role}) • Base: ₹{emp.baseSalary?.toLocaleString()}
                        </option>
                      ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-outline">Amount Paid Now (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                    className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-rose-600">Remaining Pending Balance (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={pendingBalance}
                    onChange={(e) =>
                      setPendingBalance(e.target.value !== "" ? Number(e.target.value) : "")
                    }
                    className="w-full bg-rose-50/50 border border-rose-200 rounded-xl px-4 py-2.5 text-sm text-rose-700 outline-none focus:border-rose-500 font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. EMI SPECIFIC */}
          {category === "EMI" && (
            <div className="p-4 rounded-2xl bg-surface-container-low/40 border border-outline-variant/15 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-outline">Select Vehicle for EMI *</label>
                <select
                  required
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-semibold"
                >
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map((v) => {
                    const reg = v.core?.registrationNumber || v.registrationNumber || "Vehicle";
                    const make = v.core?.make || v.make || "";
                    const model = v.core?.model || v.model || "";
                    const label = `${reg.toUpperCase()} ${make || model ? `(${make} ${model})`.trim() : ""}`;
                    return (
                      <option key={v.id} value={v.id}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-outline">EMI Amount Paid (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 25000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                    className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-outline">Installment No (Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 6"
                    value={installmentNo}
                    onChange={(e) =>
                      setInstallmentNo(e.target.value ? Number(e.target.value) : "")
                    }
                    className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. FASTAG SPECIFIC */}
          {category === "FASTag" && (
            <div className="p-4 rounded-2xl bg-surface-container-low/40 border border-outline-variant/15 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-outline">Select Vehicle for FASTag Recharge *</label>
                <select
                  required
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-semibold"
                >
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map((v) => {
                    const reg = v.core?.registrationNumber || v.registrationNumber || "Vehicle";
                    const make = v.core?.make || v.make || "";
                    const model = v.core?.model || v.model || "";
                    const label = `${reg.toUpperCase()} ${make || model ? `(${make} ${model})`.trim() : ""}`;
                    return (
                      <option key={v.id} value={v.id}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-outline">FASTag Recharge Amount (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 3000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-bold"
                />
              </div>
            </div>
          )}

          {/* 3. FUEL & FLEET OPS SPECIFIC */}
          {category === "Fuel & Fleet" && (
            <div className="p-4 rounded-2xl bg-surface-container-low/40 border border-outline-variant/15 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-outline">Select Vehicle (Optional)</label>
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-semibold"
                >
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map((v) => {
                    const reg = v.core?.registrationNumber || v.registrationNumber || "Vehicle";
                    const make = v.core?.make || v.make || "";
                    const label = `${reg.toUpperCase()} ${make ? `(${make})` : ""}`;
                    return (
                      <option key={v.id} value={v.id}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-outline">Total Fuel / Operational Amount (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 12500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-bold"
                />
              </div>
            </div>
          )}

          {/* 4. OFFICE & MISC SPECIFIC */}
          {category === "Office & Misc" && (
            <div className="p-4 rounded-2xl bg-surface-container-low/40 border border-outline-variant/15 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-outline">Expense Title / Particulars *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yard Electricity Bill, Office Rent, Toll Recharge"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-outline">Total Amount Paid (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 8500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-bold"
                />
              </div>
            </div>
          )}

          {/* COMMON FIELDS: Payment Date & Mode */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-outline">Payment Date</label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-outline">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-semibold"
              >
                <option value="Bank Transfer">Bank Transfer / NEFT</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-outline">Notes / Reference No (Optional)</label>
            <input
              type="text"
              placeholder="e.g. UTR #991200192 or Bank receipt ref"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-medium"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/15">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-outline-variant/20 text-sm font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Processing..." : "Record Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
