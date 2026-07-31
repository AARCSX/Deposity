"use client";

import React, { useEffect, useState } from "react";
import { EmployeeRecord } from "@/types/employee";

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeRecord) => Promise<void>;
  employeeToEdit: EmployeeRecord | null;
}

export default function CreateEmployeeModal({
  isOpen,
  onClose,
  onSubmit,
  employeeToEdit,
}: CreateEmployeeModalProps) {
  const [formData, setFormData] = useState<EmployeeRecord>({
    name: "",
    role: "Staff Member",
    phone: "",
    email: "",
    joiningDate: new Date().toISOString().split("T")[0],
    baseSalary: 25000,
    pendingBalance: 0,
    status: "Active",
    avatar: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (employeeToEdit) {
      setFormData(employeeToEdit);
    } else {
      setFormData({
        name: "",
        role: "Staff Member",
        phone: "",
        email: "",
        joiningDate: new Date().toISOString().split("T")[0],
        baseSalary: 25000,
        pendingBalance: 0,
        status: "Active",
        avatar: "",
      });
    }
    setError(null);
  }, [employeeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update employee details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-surface px-6 py-5 border-b border-outline-variant/15 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              <span className="material-symbols-outlined">badge</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-on-surface">Configure Staff Salary &amp; Status</h3>
              <p className="text-xs text-on-surface-variant font-medium">AARCSX Identity Organization Employee</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Identity Info Card */}
        <div className="mx-6 mt-5 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-slate-900">{formData.name || "Employee"}</span>
              <span className="text-[10px] bg-primary/10 text-primary font-extrabold px-2 py-0.5 rounded-full uppercase">
                {formData.role || "Member"}
              </span>
            </div>
            {formData.email && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">{formData.email}</p>
            )}
          </div>
          <span className="material-symbols-outlined text-emerald-600 text-xl" title="Verified Identity Member">
            verified
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-error/10 border border-error/20 text-xs text-error font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-outline">Monthly Base Salary (₹) *</label>
            <input
              type="number"
              required
              min="0"
              placeholder="e.g. 35000"
              value={formData.baseSalary ?? ""}
              onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
              className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-bold tabular-nums"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-outline">Initial Pending Balance (₹) *</label>
            <input
              type="number"
              required
              min="0"
              placeholder="e.g. 0"
              value={formData.pendingBalance ?? ""}
              onChange={(e) => setFormData({ ...formData, pendingBalance: Number(e.target.value) })}
              className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-bold tabular-nums"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-outline">Staff Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-semibold cursor-pointer"
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
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
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">save</span>
              {isSubmitting ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
