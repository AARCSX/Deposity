"use client";

import React, { useState, useEffect } from "react";
import { CompanyRecord } from "@/types/company";

interface EditCompanyModalProps {
  isOpen: boolean;
  company: CompanyRecord | null;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<CompanyRecord>) => Promise<void>;
}

export default function EditCompanyModal({
  isOpen,
  company,
  onClose,
  onSubmit,
}: EditCompanyModalProps) {
  const [formData, setFormData] = useState<CompanyRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (company) {
      setFormData({ ...company });
      setErrorMsg(null);
    }
  }, [company]);

  if (!isOpen || !company || !formData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg("Company Name is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onSubmit(company.id || "", {
        name: formData.name.trim(),
        industry: formData.industry?.trim() || "",
        location: formData.location?.trim() || "",
        logo: formData.logo?.trim() || "",
        status: formData.status,
        contactPerson: formData.contactPerson?.trim() || "",
        phone: formData.phone?.trim() || "",
        email: formData.email?.trim() || "",
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update company details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <form
        onSubmit={handleSubmit}
        className="bg-surface-container-lowest w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-surface px-6 py-4 border-b border-outline-variant/15 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Edit Client Company Details</h2>
            <p className="text-sm text-on-surface-variant font-medium">Update profile, contacts, and account status</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Company Name"
              placeholder="e.g. Reliance Retail Ltd."
              value={formData.name}
              onChange={(v: string) => setFormData((f) => f && { ...f, name: v })}
            />
            <Input
              label="Industry / Vertical"
              placeholder="e.g. FMCG, Automotive"
              value={formData.industry || ""}
              onChange={(v: string) => setFormData((f) => f && { ...f, industry: v })}
            />
            <div className="md:col-span-2">
              <Input
                label="Location / Branch"
                placeholder="e.g. Mumbai HQ • Supply Chain Division"
                value={formData.location || ""}
                onChange={(v: string) => setFormData((f) => f && { ...f, location: v })}
              />
            </div>
            <Input
              label="Logo URL (optional)"
              placeholder="https://..."
              value={formData.logo || ""}
              onChange={(v: string) => setFormData((f) => f && { ...f, logo: v })}
            />
            <Select
              label="Account Tier"
              value={formData.status}
              onChange={(v: string) =>
                setFormData((f) => f && { ...f, status: v as CompanyRecord["status"] })
              }
              options={["Standard Account", "Premium Partner"]}
            />

            <div className="md:col-span-2 pt-2 border-t border-outline-variant/10">
              <p className="text-xs font-bold uppercase tracking-wider text-outline mb-3">Primary Contact Person</p>
            </div>

            <Input
              label="Contact Person Name"
              placeholder="e.g. Rajesh Deshmukh"
              value={formData.contactPerson || ""}
              onChange={(v: string) => setFormData((f) => f && { ...f, contactPerson: v })}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 98210 55432"
              value={formData.phone || ""}
              onChange={(v: string) => setFormData((f) => f && { ...f, phone: v })}
            />
            <div className="md:col-span-2">
              <Input
                label="Email Address"
                type="email"
                placeholder="contact@company.com"
                value={formData.email || ""}
                onChange={(v: string) => setFormData((f) => f && { ...f, email: v })}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-surface px-6 py-4 border-t border-outline-variant/15 flex justify-end items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            {isSubmitting ? "Saving Changes..." : "Save Changes"}
            {!isSubmitting && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
          </button>
        </div>
      </form>
    </div>
  );
}

// Helpers
function Input({ label, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-outline">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-outline">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
