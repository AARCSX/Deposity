"use client";

import { useState } from "react";
import { TripRecord } from "@/types/trip";

interface RecordPaymentModalProps {
  trip: TripRecord;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSubmitted: (updatedTrip: TripRecord) => void;
}

export default function RecordPaymentModal({
  trip,
  isOpen,
  onClose,
  onPaymentSubmitted,
}: RecordPaymentModalProps) {
  const total = trip.financials.totalFreight || 0;
  const advance = trip.financials.advancePaid || 0;
  const remaining = Math.max(0, total - advance);

  const [paymentAmount, setPaymentAmount] = useState<number>(remaining);
  const [paymentMode, setPaymentMode] = useState<string>("Bank Transfer");
  const [referenceNo, setReferenceNo] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newAdvance = advance + Number(paymentAmount);
    const updatedTrip: TripRecord = {
      ...trip,
      financials: {
        ...trip.financials,
        advancePaid: newAdvance,
      },
    };

    await onPaymentSubmitted(updatedTrip);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Record Freight Payment</h3>
            <p className="text-xs text-slate-500 font-mono">Trip #{trip.id || "NEW"}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs border border-slate-100">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Billed Company</span>
            <span className="font-bold text-slate-900">{trip.cargo.company}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Total Freight</span>
            <span className="font-bold text-slate-900">₹{total.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Already Received</span>
            <span className="font-semibold text-emerald-600">₹{advance.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
            <span className="text-rose-600">Current Balance Pending</span>
            <span className="text-rose-600">₹{remaining.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Payment Amount Received (₹)
            </label>
            <input
              type="number"
              required
              min={1}
              max={remaining}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Payment Mode
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-primary"
            >
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
              <option value="UPI">UPI / GPay / PhonePe</option>
              <option value="Cheque">Cheque</option>
              <option value="Cash">Cash Settlement</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Transaction / Reference No. (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. TXN987654321"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-primary font-mono"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || paymentAmount <= 0}
              className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Recording..." : `Record ₹${paymentAmount.toLocaleString("en-IN")}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
