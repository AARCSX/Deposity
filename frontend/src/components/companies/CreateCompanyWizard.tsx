"use client";

import React, { useState } from "react";
import { CompanyRecord } from "@/types/company";

interface CreateCompanyWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CompanyRecord) => Promise<void>;
}

const initialData: CompanyRecord = {
  name: "",
  logo: "",
  status: "Standard Account",
  location: "",
  contactPerson: "",
  phone: "",
  email: "",
  totalValue: 0,
  isPaid: true,
  pendingAmount: 0,
  industry: "",
};

const STEPS = [
  { id: 0, title: "Company Info", subtitle: "Identity & Location" },
  { id: 1, title: "Contact", subtitle: "POC & Communication" },
  { id: 2, title: "Financials", subtitle: "Billing & Status" },
];

export default function CreateCompanyWizard({ isOpen, onClose, onSubmit }: CreateCompanyWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CompanyRecord>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((p) => p + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
    setCurrentStep(0);
    setFormData(initialData);
  };

  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-surface px-6 py-4 border-b border-outline-variant/15 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Register New Client</h2>
            <p className="text-sm text-on-surface-variant font-medium">Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-surface-container-high h-1.5">
          <div className="bg-primary h-full transition-all duration-300 ease-out" style={{ width: `${progressPercentage}%` }}></div>
        </div>

        {/* Step Navigation */}
        <div className="px-6 py-3 bg-surface-container-low border-b border-outline-variant/10 flex gap-4 overflow-x-auto hide-scrollbar">
          {STEPS.map((step) => (
            <div key={step.id} className={`flex items-center gap-2 shrink-0 ${currentStep === step.id ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep >= step.id ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                {currentStep > step.id ? <span className="material-symbols-outlined text-[14px]">check</span> : step.id + 1}
              </div>
              <span className="text-xs font-bold text-on-surface whitespace-nowrap">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {currentStep === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-right-4 duration-300">
              <div className="md:col-span-2 text-sm text-on-surface-variant mb-2">Basic company identity and operating location.</div>
              <Input label="Company Name" placeholder="e.g. Reliance Retail Ltd." value={formData.name} onChange={(v: string) => setFormData(f => ({...f, name: v}))} />
              <Input label="Industry / Vertical" placeholder="e.g. FMCG, Automotive" value={formData.industry || ""} onChange={(v: string) => setFormData(f => ({...f, industry: v}))} />
              <div className="md:col-span-2">
                <Input label="Location / Branch" placeholder="e.g. Mumbai HQ • Supply Chain Division" value={formData.location} onChange={(v: string) => setFormData(f => ({...f, location: v}))} />
              </div>
              <Input label="Logo URL (optional)" placeholder="https://..." value={formData.logo} onChange={(v: string) => setFormData(f => ({...f, logo: v}))} />
              <Select label="Account Tier" value={formData.status} onChange={(v: string) => setFormData(f => ({...f, status: v as CompanyRecord["status"]}))} options={["Standard Account", "Premium Partner"]} />
            </div>
          )}

          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-right-4 duration-300">
              <div className="md:col-span-2 text-sm text-on-surface-variant mb-2">Primary point of contact for day-to-day operations.</div>
              <Input label="Contact Person Name" placeholder="e.g. Rajesh Deshmukh" value={formData.contactPerson} onChange={(v: string) => setFormData(f => ({...f, contactPerson: v}))} />
              <Input label="Phone Number" type="tel" placeholder="+91 98210 55432" value={formData.phone} onChange={(v: string) => setFormData(f => ({...f, phone: v}))} />
              <div className="md:col-span-2">
                <Input label="Email Address (optional)" type="email" placeholder="contact@company.com" value={formData.email || ""} onChange={(v: string) => setFormData(f => ({...f, email: v}))} />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-right-4 duration-300">
              <div className="md:col-span-2 text-sm text-on-surface-variant mb-2">Financial health and billing overview.</div>
              <Input label="Total Business Value (₹)" type="number" placeholder="24500000" value={formData.totalValue.toString()} onChange={(v: string) => setFormData(f => ({...f, totalValue: Number(v)}))} />
              <Input label="Pending Amount (₹)" type="number" placeholder="0" value={formData.pendingAmount.toString()} onChange={(v: string) => setFormData(f => ({...f, pendingAmount: Number(v)}))} />
              <div className="md:col-span-2 p-4 bg-surface-container-high rounded-xl flex justify-between items-center mt-2">
                <span className="font-bold text-on-surface-variant">Payment Status</span>
                <span className={`font-bold text-sm ${formData.pendingAmount > 0 ? "text-error" : "text-tertiary"}`}>
                  {formData.pendingAmount > 0 ? `₹${formData.pendingAmount.toLocaleString()} Overdue` : "All Clear ✓"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-surface px-6 py-4 border-t border-outline-variant/15 flex justify-between items-center">
          <button 
            onClick={handleBack} 
            disabled={currentStep === 0 || isSubmitting}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
          >
            Back
          </button>
          
          {currentStep === STEPS.length - 1 ? (
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              {isSubmitting ? "Registering..." : "Register Client"}
              {!isSubmitting && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-surface-container-highest text-on-surface hover:bg-outline-variant/20 transition-colors flex items-center gap-2"
            >
              Next Step
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
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
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}
