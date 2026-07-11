"use client";

import React, { useState } from "react";
import { VehicleRecord } from "@/types/vehicle";

interface CreateVehicleWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VehicleRecord) => Promise<void>;
}

const initialData: VehicleRecord = {
  core: {
    registrationNumber: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    bodyType: "Open Body",
    axleConfig: "",
    tonnageCapacity: 0,
    fuelCapacity: 0,
    averageMileage: 0,
  },
  compliance: {
    rcExpiry: "",
    insuranceExpiry: "",
    pucExpiry: "",
    fitnessExpiry: "",
    permitDetails: "",
  },
  ownership: {
    ownershipType: "Own",
    driverId: "",
    homeBranch: "",
    gpsDeviceId: "",
  },
  maintenance: {
    currentOdometer: 0,
    lastServicedDate: "",
  },
  status: "all-good"
};

const STEPS = [
  { id: 0, title: "Core Specs", subtitle: "Physical attributes" },
  { id: 1, title: "Compliance", subtitle: "Documents & Expiry" },
  { id: 2, title: "Ownership", subtitle: "Ops & Telematics" },
  { id: 3, title: "Maintenance", subtitle: "Service history" },
];

export default function CreateVehicleWizard({ isOpen, onClose, onSubmit }: CreateVehicleWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<VehicleRecord>(initialData);
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
            <h2 className="text-xl font-bold text-on-surface">Add New Vehicle</h2>
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

        {/* Step Navigation (Top) */}
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

        {/* Form Content Area */}
        <div className="p-6 overflow-y-auto flex-1">
          {currentStep === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-right-4 duration-300">
              <div className="md:col-span-2 text-sm text-on-surface-variant mb-2">Permanent physical attributes of the truck used for load matching.</div>
              <Input label="Registration / License Plate Number" placeholder="e.g. MH12AB1234" value={formData.core.registrationNumber} onChange={(v) => setFormData(f => ({...f, core: {...f.core, registrationNumber: v}}))} />
              <Input label="Make" placeholder="e.g. Tata, Ashok Leyland" value={formData.core.make} onChange={(v) => setFormData(f => ({...f, core: {...f.core, make: v}}))} />
              <Input label="Model" placeholder="e.g. Signa 4923" value={formData.core.model} onChange={(v) => setFormData(f => ({...f, core: {...f.core, model: v}}))} />
              <Input label="Year" type="number" placeholder="2023" value={formData.core.year.toString()} onChange={(v) => setFormData(f => ({...f, core: {...f.core, year: Number(v)}}))} />
              <Select label="Body Type" value={formData.core.bodyType} onChange={(v) => setFormData(f => ({...f, core: {...f.core, bodyType: v}}))} options={["Open Body", "Container", "Flatbed", "Reefer"]} />
              <Input label="Axle Configuration" placeholder="e.g. 10 Wheeler (6x2)" value={formData.core.axleConfig} onChange={(v) => setFormData(f => ({...f, core: {...f.core, axleConfig: v}}))} />
              <Input label="Tonnage Capacity (MT)" type="number" placeholder="25" value={formData.core.tonnageCapacity.toString()} onChange={(v) => setFormData(f => ({...f, core: {...f.core, tonnageCapacity: Number(v)}}))} />
              <Input label="Fuel Tank Capacity (Liters)" type="number" placeholder="300" value={formData.core.fuelCapacity.toString()} onChange={(v) => setFormData(f => ({...f, core: {...f.core, fuelCapacity: Number(v)}}))} />
              <Input label="Average Mileage (kmpl)" type="number" placeholder="4.5" value={formData.core.averageMileage.toString()} onChange={(v) => setFormData(f => ({...f, core: {...f.core, averageMileage: Number(v)}}))} />
            </div>
          )}

          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-right-4 duration-300">
              <div className="md:col-span-2 text-sm text-on-surface-variant mb-2">Tracking expiration dates helps prevent heavy fines.</div>
              <Input label="RC Expiry" type="date" value={formData.compliance.rcExpiry} onChange={(v) => setFormData(f => ({...f, compliance: {...f.compliance, rcExpiry: v}}))} />
              <Input label="Insurance Expiry" type="date" value={formData.compliance.insuranceExpiry} onChange={(v) => setFormData(f => ({...f, compliance: {...f.compliance, insuranceExpiry: v}}))} />
              <Input label="PUC Expiry" type="date" value={formData.compliance.pucExpiry} onChange={(v) => setFormData(f => ({...f, compliance: {...f.compliance, pucExpiry: v}}))} />
              <Input label="Fitness Expiry" type="date" value={formData.compliance.fitnessExpiry} onChange={(v) => setFormData(f => ({...f, compliance: {...f.compliance, fitnessExpiry: v}}))} />
              <div className="md:col-span-2">
                <Input label="National/State Permit Details" placeholder="Enter permit validity and states" value={formData.compliance.permitDetails} onChange={(v) => setFormData(f => ({...f, compliance: {...f.compliance, permitDetails: v}}))} />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-right-4 duration-300">
              <div className="md:col-span-2 text-sm text-on-surface-variant mb-2">Essential for accounting, billing, and fleet-owner payouts.</div>
              <Select label="Ownership Type" value={formData.ownership.ownershipType} onChange={(v) => setFormData(f => ({...f, ownership: {...f.ownership, ownershipType: v as any}}))} options={["Own", "Market"]} />
              <Input label="Assigned Driver ID" placeholder="Leave blank if unassigned" value={formData.ownership.driverId} onChange={(v) => setFormData(f => ({...f, ownership: {...f.ownership, driverId: v}}))} />
              <Input label="Home Branch / Location" placeholder="e.g. Pune Depot" value={formData.ownership.homeBranch} onChange={(v) => setFormData(f => ({...f, ownership: {...f.ownership, homeBranch: v}}))} />
              <Input label="GPS Device ID" placeholder="IoT Telematics ID" value={formData.ownership.gpsDeviceId} onChange={(v) => setFormData(f => ({...f, ownership: {...f.ownership, gpsDeviceId: v}}))} />
            </div>
          )}

          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-right-4 duration-300">
              <div className="md:col-span-2 text-sm text-on-surface-variant mb-2">Proactive maintenance data keeps your fleet on the road.</div>
              <Input label="Current Odometer Reading (km)" type="number" placeholder="125000" value={formData.maintenance.currentOdometer.toString()} onChange={(v) => setFormData(f => ({...f, maintenance: {...f.maintenance, currentOdometer: Number(v)}}))} />
              <Input label="Last Serviced Date" type="date" value={formData.maintenance.lastServicedDate} onChange={(v) => setFormData(f => ({...f, maintenance: {...f.maintenance, lastServicedDate: v}}))} />
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
              {isSubmitting ? "Saving..." : "Create Vehicle"}
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
interface InputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
}

function Input({ label, value, onChange, placeholder, type = "text" }: InputProps) {
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

interface SelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}

function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-outline">{label}</label>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
      >
        <option value="" disabled>Select an option</option>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}
