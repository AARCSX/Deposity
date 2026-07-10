"use client";

import React, { useState } from "react";
import { TripRecord } from "@/types/trip";

interface CreateTripWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TripRecord) => Promise<void>;
}

const initialData: TripRecord = {
  status: "pending",
  route: {
    originName: "",
    originDate: "",
    destinationName: "",
    destinationDate: "",
    isEstimated: true,
  },
  cargo: {
    material: "",
    weight: 0,
    company: "",
  },
  assignment: {
    vehicleId: "",
    driverId: "",
  },
  financials: {
    totalFreight: 0,
    advancePaid: 0,
  }
};

const STEPS = [
  { id: 0, title: "Route", subtitle: "Origin & Destination" },
  { id: 1, title: "Cargo", subtitle: "Material & Client" },
  { id: 2, title: "Assignment", subtitle: "Vehicle & Driver" },
  { id: 3, title: "Financials", subtitle: "Freight & Advance" },
];

export default function CreateTripWizard({ isOpen, onClose, onSubmit }: CreateTripWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<TripRecord>(initialData);
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
        
        {/* Header & Progress */}
        <div className="bg-surface px-6 py-4 border-b border-outline-variant/15 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Create New Trip</h2>
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
              <div className="md:col-span-2 text-sm text-on-surface-variant mb-2">Define the trip route and timeline.</div>
              <Input label="Origin City/Location" placeholder="e.g. Mumbai, MH" value={formData.route.originName} onChange={(v: string) => setFormData(f => ({...f, route: {...f.route, originName: v}}))} />
              <Input label="Start Date/Time" type="datetime-local" value={formData.route.originDate} onChange={(v: string) => setFormData(f => ({...f, route: {...f.route, originDate: v}}))} />
              <Input label="Destination City/Location" placeholder="e.g. Delhi, DL" value={formData.route.destinationName} onChange={(v: string) => setFormData(f => ({...f, route: {...f.route, destinationName: v}}))} />
              <Input label="Estimated Arrival Date/Time" type="datetime-local" value={formData.route.destinationDate} onChange={(v: string) => setFormData(f => ({...f, route: {...f.route, destinationDate: v}}))} />
            </div>
          )}

          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-right-4 duration-300">
              <div className="md:col-span-2 text-sm text-on-surface-variant mb-2">Details about the load and the client.</div>
              <Input label="Client / Company Name" placeholder="e.g. ABC Logistics Ltd." value={formData.cargo.company} onChange={(v: string) => setFormData(f => ({...f, cargo: {...f.cargo, company: v}}))} />
              <Input label="Material Type" placeholder="e.g. Steel Coils, Cotton" value={formData.cargo.material} onChange={(v: string) => setFormData(f => ({...f, cargo: {...f.cargo, material: v}}))} />
              <Input label="Total Weight (MT)" type="number" placeholder="15" value={formData.cargo.weight.toString()} onChange={(v: string) => setFormData(f => ({...f, cargo: {...f.cargo, weight: Number(v)}}))} />
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-right-4 duration-300">
              <div className="md:col-span-2 text-sm text-on-surface-variant mb-2">Assign resources to this trip.</div>
              <Input label="Vehicle Registration No." placeholder="e.g. MH12 AB 1234" value={formData.assignment.vehicleId} onChange={(v: string) => setFormData(f => ({...f, assignment: {...f.assignment, vehicleId: v}}))} />
              <Input label="Driver ID / Name" placeholder="e.g. Ramesh K." value={formData.assignment.driverId} onChange={(v: string) => setFormData(f => ({...f, assignment: {...f.assignment, driverId: v}}))} />
            </div>
          )}

          {currentStep === 3 && (
            <div className="grid grid-cols-1 gap-5 animate-in slide-in-from-right-4 duration-300 max-w-md">
              <div className="text-sm text-on-surface-variant mb-2">Financial agreements for the trip.</div>
              <Input label="Total Freight Amount (₹)" type="number" placeholder="45000" value={formData.financials.totalFreight.toString()} onChange={(v: string) => setFormData(f => ({...f, financials: {...f.financials, totalFreight: Number(v)}}))} />
              <Input label="Advance Paid (₹)" type="number" placeholder="20000" value={formData.financials.advancePaid.toString()} onChange={(v: string) => setFormData(f => ({...f, financials: {...f.financials, advancePaid: Number(v)}}))} />
              <div className="p-4 bg-surface-container-high rounded-xl flex justify-between items-center mt-4">
                <span className="font-bold text-on-surface-variant">Remaining Balance</span>
                <span className="font-bold text-lg text-error">
                  ₹{(formData.financials.totalFreight - formData.financials.advancePaid).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
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
              {isSubmitting ? "Creating..." : "Create Trip"}
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
