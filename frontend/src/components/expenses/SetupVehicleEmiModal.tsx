"use client";

import React, { useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/api";

interface SetupVehicleEmiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SetupVehicleEmiModal({
  isOpen,
  onClose,
  onSuccess,
}: SetupVehicleEmiModalProps) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const [bankName, setBankName] = useState("HDFC Bank");
  const [amount, setAmount] = useState<number | "">(25000);
  const [installmentsCount, setInstallmentsCount] = useState<number>(12);
  const [firstDueDate, setFirstDueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [referenceNo, setReferenceNo] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    authenticatedFetch("/vehicles")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setVehicles(Array.isArray(data) ? data : []))
      .catch(() => setVehicles([]));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) {
      setError("Please select a vehicle.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid monthly installment amount.");
      return;
    }
    if (!installmentsCount || installmentsCount <= 0) {
      setError("Please enter the number of installments.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const baseDate = new Date(firstDueDate);
      for (let i = 1; i <= installmentsCount; i++) {
        const dueDate = new Date(baseDate);
        dueDate.setMonth(baseDate.getMonth() + (i - 1));

        const payload = {
          installmentNo: i,
          dueDate: dueDate.toISOString(),
          amount: Number(amount),
          status: "Pending",
          bankName,
          referenceNo,
        };

        const res = await authenticatedFetch(`/vehicles/${vehicleId}/emi`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed on installment #${i}`);
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to setup vehicle EMI schedule.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-surface px-6 py-5 border-b border-outline-variant/15 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-on-surface">Setup Vehicle Loan &amp; EMI</h3>
              <p className="text-xs text-on-surface-variant font-medium">
                Create recurring EMI schedule for vehicle financing
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

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-outline">Select Vehicle *</label>
            <select
              required
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-semibold"
            >
              <option value="">-- Choose Vehicle --</option>
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
              <label className="text-xs font-bold text-outline">Financing Bank Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. HDFC Bank, ICICI Bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-outline">Monthly EMI Amount (₹) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 25000"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-outline">Total No. of Installments *</label>
              <input
                type="number"
                required
                min={1}
                max={120}
                placeholder="e.g. 12 or 24"
                value={installmentsCount}
                onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-outline">1st Installment Due Date *</label>
              <input
                type="date"
                required
                value={firstDueDate}
                onChange={(e) => setFirstDueDate(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-outline">Loan Account / Reference No (Optional)</label>
            <input
              type="text"
              placeholder="e.g. LN-8891002931"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-medium"
            />
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
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Generating Schedule..." : "Create EMI Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
