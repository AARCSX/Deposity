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
    role: "Fleet Manager",
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
        role: "Fleet Manager",
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
    if (!formData.name.trim()) {
      setError("Please enter the employee's full name.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save employee details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEdit = !!employeeToEdit?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-surface px-6 py-5 border-b border-outline-variant/15 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              <span className="material-symbols-outlined">{isEdit ? "edit_note" : "person_add"}</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-on-surface">
                {isEdit ? "Edit Staff Details & Salary" : "Register New Employee"}
              </h3>
              <p className="text-xs text-on-surface-variant font-medium">
                {isEdit ? "Update employee information, salary, and status" : "Add a new staff member to your Deposity roster"}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-error/10 border border-error/20 text-xs text-error font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-outline">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-semibold"
              />
            </div>

            {/* Role / Designation */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-outline">Role / Designation *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-semibold cursor-pointer"
              >
                <option value="Fleet Manager">Fleet Manager</option>
                <option value="Accountant">Accountant</option>
                <option value="Driver">Driver</option>
                <option value="Yard Operator">Yard Operator</option>
                <option value="Mechanic">Mechanic</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Employee">Employee</option>
              </select>
            </div>

            {/* Staff Status */}
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

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-outline">Phone Number</label>
              <input
                type="text"
                placeholder="e.g. +91 9876543210"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-semibold"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-outline">Email Address</label>
              <input
                type="email"
                placeholder="e.g. staff@example.com"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-semibold"
              />
            </div>

            {/* Monthly Base Salary */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-outline">Monthly Base Salary (₹) *</label>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 25000"
                value={formData.baseSalary ?? ""}
                onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-bold tabular-nums"
              />
            </div>

            {/* Initial Pending Balance */}
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
              <span className="material-symbols-outlined text-base">{isEdit ? "save" : "person_add"}</span>
              {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Register Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
