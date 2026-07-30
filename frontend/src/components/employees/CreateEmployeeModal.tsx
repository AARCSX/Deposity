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
    role: "Fleet Operator",
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
        role: "Fleet Operator",
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
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError("Employee Name and Phone Number are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save employee.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-surface px-6 py-5 border-b border-outline-variant/15 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-on-surface">
              {employeeToEdit ? "Edit Staff Member" : "Register New Employee"}
            </h3>
            <p className="text-xs text-on-surface-variant font-medium mt-0.5">
              Enter non-driver employee payroll &amp; contact information
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
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
            <label className="text-xs font-bold text-outline">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-outline">Designation / Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-semibold"
              >
                <option value="Fleet Manager">Fleet Manager</option>
                <option value="Fleet Operator">Fleet Operator</option>
                <option value="Accountant">Accountant</option>
                <option value="Yard Supervisor">Yard Supervisor</option>
                <option value="Maintenance Mechanic">Maintenance Mechanic</option>
                <option value="Operations Executive">Operations Executive</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-outline">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-outline">Email Address</label>
              <input
                type="email"
                placeholder="e.g. ramesh@aarcsx.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-outline">Joining Date</label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-outline">Monthly Base Salary (₹)</label>
              <input
                type="number"
                placeholder="e.g. 30000"
                value={formData.baseSalary || ""}
                onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-outline">Initial Pending Balance (₹)</label>
              <input
                type="number"
                placeholder="e.g. 0"
                value={formData.pendingBalance || ""}
                onChange={(e) => setFormData({ ...formData, pendingBalance: Number(e.target.value) })}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-outline">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-semibold"
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-outline">Avatar Image URL (Optional)</label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-medium"
            />
          </div>

          {/* Footer Buttons */}
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
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : employeeToEdit
                ? "Save Changes"
                : "Register Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
