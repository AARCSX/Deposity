"use client";

import React, { useEffect, useState } from "react";
import { SalaryPaymentRecord } from "@/types/employee";
import { authenticatedFetch } from "@/lib/api";

interface SalaryHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientType: "driver" | "employee";
  recipientId: string;
  recipientName: string;
  baseSalary?: number;
  pendingBalance?: number;
}

export default function SalaryHistoryModal({
  isOpen,
  onClose,
  recipientType,
  recipientId,
  recipientName,
  baseSalary = 0,
  pendingBalance = 0,
}: SalaryHistoryModalProps) {
  const [payments, setPayments] = useState<SalaryPaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !recipientId) return;

    const endpoint =
      recipientType === "driver"
        ? `/drivers/${recipientId}/salary-history`
        : `/employees/${recipientId}/salary-history`;

    setIsLoading(true);
    authenticatedFetch(endpoint)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setPayments(data || []);
      })
      .catch(() => setPayments([]))
      .finally(() => setIsLoading(false));
  }, [isOpen, recipientId, recipientType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-surface px-6 py-5 border-b border-outline-variant/15 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold text-lg">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-on-surface">Salary Disbursement History</h3>
              <p className="text-xs text-on-surface-variant font-medium">
                {recipientName} • <span className="capitalize">{recipientType}</span>
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

        {/* Salary Summary Pills */}
        <div className="p-6 bg-surface-container-low/40 border-b border-outline-variant/10 grid grid-cols-2 gap-4">
          <div className="p-3.5 rounded-2xl bg-white border border-outline-variant/15">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-0.5">
              Monthly Base Salary
            </span>
            <span className="text-base font-black text-slate-900 tabular-nums">
              ₹{baseSalary.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-outline-variant/15">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-0.5">
              Current Pending Balance
            </span>
            <span
              className={`text-base font-black tabular-nums ${
                pendingBalance > 0 ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {pendingBalance > 0 ? `₹${pendingBalance.toLocaleString("en-IN")}` : "Fully Settled ✓"}
            </span>
          </div>
        </div>

        {/* Payment History List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-xs font-semibold text-slate-500">
              Loading disbursement history...
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-outline-variant/20 bg-surface-container-low/30">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">history_toggle_off</span>
              <p className="text-xs font-bold text-on-surface">No salary transactions recorded</p>
              <p className="text-[11px] text-on-surface-variant mt-1">
                Log a Salary expense in the Expense Portal to record disbursements for this {recipientType}.
              </p>
            </div>
          ) : (
            payments.map((p, idx) => (
              <div
                key={p.id || idx}
                className="p-4 rounded-2xl bg-white border border-outline-variant/15 shadow-2xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-sm shrink-0">
                    ₹
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>Salary Paid</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded-md border border-slate-200">
                        {p.paymentMode || "Bank Transfer"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      {p.paymentDate} {p.notes ? `• ${p.notes}` : ""}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-emerald-600 tabular-nums">
                    + ₹{p.amountPaid.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold tabular-nums mt-0.5">
                    {p.pendingBalance > 0
                      ? `Rem: ₹${p.pendingBalance.toLocaleString("en-IN")}`
                      : "Paid in Full"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-surface px-6 py-4 border-t border-outline-variant/15 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
}
