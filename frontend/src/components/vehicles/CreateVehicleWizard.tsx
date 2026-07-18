"use client";

import React, { useState, useEffect } from "react";
import { VehicleRecord, PermitData, PermitState, INDIAN_STATES, DEFAULT_PERMIT_DATA, parsePermitDetails, serializePermitDetails } from "@/types/vehicle";
import { authenticatedFetch } from "@/lib/api";

interface CreateVehicleWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VehicleRecord) => Promise<void>;
  vehicleToEdit?: VehicleRecord | null;
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
    rcIssuance: "",
    insuranceExpiry: "",
    insuranceIssuance: "",
    pucExpiry: "",
    pucIssuance: "",
    fitnessExpiry: "",
    fitnessIssuance: "",
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

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  return dateStr.substring(0, 10);
};

export default function CreateVehicleWizard({ isOpen, onClose, onSubmit, vehicleToEdit }: CreateVehicleWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<VehicleRecord>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);
  
  // Permit state management
  const [permitData, setPermitData] = useState<PermitData>({ ...DEFAULT_PERMIT_DATA });
  const [selectedState, setSelectedState] = useState("");
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (vehicleToEdit) {
        setFormData({
          ...vehicleToEdit,
          compliance: {
            ...vehicleToEdit.compliance,
            rcExpiry: formatDate(vehicleToEdit.compliance.rcExpiry),
            rcIssuance: formatDate(vehicleToEdit.compliance.rcIssuance),
            insuranceExpiry: formatDate(vehicleToEdit.compliance.insuranceExpiry),
            insuranceIssuance: formatDate(vehicleToEdit.compliance.insuranceIssuance),
            pucExpiry: formatDate(vehicleToEdit.compliance.pucExpiry),
            pucIssuance: formatDate(vehicleToEdit.compliance.pucIssuance),
            fitnessExpiry: formatDate(vehicleToEdit.compliance.fitnessExpiry),
            fitnessIssuance: formatDate(vehicleToEdit.compliance.fitnessIssuance),
          },
          ownership: {
            ...vehicleToEdit.ownership,
            driverId: vehicleToEdit.ownership.driverId || "",
          },
          maintenance: {
            ...vehicleToEdit.maintenance,
            lastServicedDate: formatDate(vehicleToEdit.maintenance?.lastServicedDate),
          }
        });
        // Parse existing permit data
        setPermitData(parsePermitDetails(vehicleToEdit.compliance.permitDetails));
      } else {
        setFormData(initialData);
        setPermitData({ ...DEFAULT_PERMIT_DATA });
      }
      setSubmissionError(null);

      authenticatedFetch("/drivers")
        .then((res) => {
          if (res.ok) return res.json();
          return [];
        })
        .then((data) => setDrivers(Array.isArray(data) ? data : []))
        .catch(() => setDrivers([]));
    }
  }, [isOpen, vehicleToEdit]);

  if (!isOpen) return null;

  const handleNext = () => {
    setSubmissionError(null);
    if (currentStep < STEPS.length - 1) setCurrentStep((p) => p + 1);
  };

  const handleBack = () => {
    setSubmissionError(null);
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  };

  const handleAddStatePermit = () => {
    if (!selectedState) return;
    if (permitData.statePermits.some(s => s.name === selectedState)) return; // No duplicates
    setPermitData(prev => ({
      ...prev,
      statePermits: [...prev.statePermits, { name: selectedState, issuance: "", expiry: "" }],
    }));
    setSelectedState("");
  };

  const handleRemoveStatePermit = (stateName: string) => {
    setPermitData(prev => ({
      ...prev,
      statePermits: prev.statePermits.filter(s => s.name !== stateName),
    }));
  };

  const handleStatePermitChange = (stateName: string, field: "issuance" | "expiry", value: string) => {
    setPermitData(prev => ({
      ...prev,
      statePermits: prev.statePermits.map(s => s.name === stateName ? { ...s, [field]: value } : s),
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);

    const payload = {
      ...formData,
      compliance: {
        ...formData.compliance,
        rcIssuance: formData.compliance.rcIssuance ? new Date(formData.compliance.rcIssuance).toISOString() : null,
        rcExpiry: formData.compliance.rcExpiry ? new Date(formData.compliance.rcExpiry).toISOString() : new Date().toISOString(),
        insuranceIssuance: formData.compliance.insuranceIssuance ? new Date(formData.compliance.insuranceIssuance).toISOString() : null,
        insuranceExpiry: formData.compliance.insuranceExpiry ? new Date(formData.compliance.insuranceExpiry).toISOString() : new Date().toISOString(),
        pucIssuance: formData.compliance.pucIssuance ? new Date(formData.compliance.pucIssuance).toISOString() : null,
        pucExpiry: formData.compliance.pucExpiry ? new Date(formData.compliance.pucExpiry).toISOString() : new Date().toISOString(),
        fitnessIssuance: formData.compliance.fitnessIssuance ? new Date(formData.compliance.fitnessIssuance).toISOString() : null,
        fitnessExpiry: formData.compliance.fitnessExpiry ? new Date(formData.compliance.fitnessExpiry).toISOString() : new Date().toISOString(),
        permitDetails: serializePermitDetails(permitData),
      },
      ownership: {
        ...formData.ownership,
        driverId: formData.ownership.driverId.trim() || null,
      },
      maintenance: {
        ...formData.maintenance,
        lastServicedDate: formData.maintenance.lastServicedDate ? new Date(formData.maintenance.lastServicedDate).toISOString() : new Date().toISOString(),
      }
    };

    try {
      await onSubmit(payload as any);
      // Only reset/close on success
      setCurrentStep(0);
      setFormData(initialData);
      setPermitData({ ...DEFAULT_PERMIT_DATA });
    } catch (err: any) {
      setSubmissionError(err.message || "Failed to save vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  // Available states = all states minus already added
  const availableStates = INDIAN_STATES.filter(s => !permitData.statePermits.some(ps => ps.name === s));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header & Progress */}
        <div className="bg-surface px-6 py-4 border-b border-outline-variant/15 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-on-surface">{vehicleToEdit ? "Edit Vehicle Details" : "Add New Vehicle"}</h2>
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
          {submissionError && (
            <div className="mb-5 p-4 rounded-xl border border-error/20 bg-error/5 text-error flex items-start gap-3 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-[1.25rem] shrink-0 mt-0.5">error</span>
              <div className="text-sm">
                <span className="font-bold">Error saving vehicle:</span> {submissionError}
              </div>
            </div>
          )}
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
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-sm text-on-surface-variant mb-2">Tracking expiration dates helps prevent heavy fines.</div>
              
              {/* Document Dates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="RC Issuance Date" type="date" value={formData.compliance.rcIssuance || ""} onChange={(v) => setFormData(f => ({...f, compliance: {...f.compliance, rcIssuance: v}}))} />
                <Input label="RC Expiry Date" type="date" value={formData.compliance.rcExpiry} onChange={(v) => setFormData(f => ({...f, compliance: {...f.compliance, rcExpiry: v}}))} />
                <Input label="Insurance Issuance Date" type="date" value={formData.compliance.insuranceIssuance || ""} onChange={(v) => setFormData(f => ({...f, compliance: {...f.compliance, insuranceIssuance: v}}))} />
                <Input label="Insurance Expiry Date" type="date" value={formData.compliance.insuranceExpiry} onChange={(v) => setFormData(f => ({...f, compliance: {...f.compliance, insuranceExpiry: v}}))} />
                <Input label="PUC Issuance Date" type="date" value={formData.compliance.pucIssuance || ""} onChange={(v) => setFormData(f => ({...f, compliance: {...f.compliance, pucIssuance: v}}))} />
                <Input label="PUC Expiry Date" type="date" value={formData.compliance.pucExpiry} onChange={(v) => setFormData(f => ({...f, compliance: {...f.compliance, pucExpiry: v}}))} />
                <Input label="Fitness Issuance Date" type="date" value={formData.compliance.fitnessIssuance || ""} onChange={(v) => setFormData(f => ({...f, compliance: {...f.compliance, fitnessIssuance: v}}))} />
                <Input label="Fitness Expiry Date" type="date" value={formData.compliance.fitnessExpiry} onChange={(v) => setFormData(f => ({...f, compliance: {...f.compliance, fitnessExpiry: v}}))} />
              </div>

              {/* Permit Section */}
              <div className="border-t border-outline-variant/15 pt-6 space-y-4">
                <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">verified</span>
                  Permit Details
                </h3>

                <div className="flex flex-wrap gap-6 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-on-surface">
                    <input 
                      type="checkbox"
                      checked={permitData.hasNational}
                      onChange={(e) => setPermitData(prev => ({ ...prev, hasNational: e.target.checked }))}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant/30"
                    />
                    National Permit
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-on-surface">
                    <input 
                      type="checkbox"
                      checked={permitData.hasState}
                      onChange={(e) => setPermitData(prev => ({ ...prev, hasState: e.target.checked }))}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant/30"
                    />
                    State Permits
                  </label>
                </div>

                {/* National Permit inputs */}
                {permitData.hasNational && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                    <div className="md:col-span-2 flex items-center gap-2 text-xs text-tertiary font-semibold">
                      <span className="material-symbols-outlined text-sm">public</span>
                      National Permit — Valid across all Indian states
                    </div>
                    <Input 
                      label="Permit Issuance Date" 
                      type="date" 
                      value={permitData.nationalIssuance} 
                      onChange={(v) => setPermitData(prev => ({ ...prev, nationalIssuance: v }))} 
                    />
                    <Input 
                      label="Permit Expiry Date" 
                      type="date" 
                      value={permitData.nationalExpiry} 
                      onChange={(v) => setPermitData(prev => ({ ...prev, nationalExpiry: v }))} 
                    />
                  </div>
                )}

                {/* State Permits inputs */}
                {permitData.hasState && (
                  <div className="space-y-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                    <div className="flex items-center gap-2 text-xs text-primary font-semibold">
                      <span className="material-symbols-outlined text-sm">map</span>
                      State Permits — Individual state authorizations
                    </div>
                    {/* Add State Row */}
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-outline block mb-1.5">Select State</label>
                        <select
                          value={selectedState}
                          onChange={(e) => setSelectedState(e.target.value)}
                          className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                        >
                          <option value="">Choose a state...</option>
                          {availableStates.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddStatePermit}
                        disabled={!selectedState}
                        className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center gap-1 shrink-0 h-[42px]"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Add State
                      </button>
                    </div>

                    {/* State Permits List */}
                    {permitData.statePermits.length === 0 ? (
                      <div className="py-8 text-center border border-dashed border-outline-variant/20 rounded-xl bg-surface-container-highest/20">
                        <span className="material-symbols-outlined text-3xl text-outline mb-2 block">map</span>
                        <p className="text-xs text-on-surface-variant">No state permits added yet. Select a state above to add one.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {permitData.statePermits.map((sp) => (
                          <div key={sp.name} className="p-4 bg-surface-container-highest/30 rounded-xl border border-outline-variant/10">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                                <span className="text-sm font-bold text-on-surface">{sp.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveStatePermit(sp.name)}
                                className="p-1 rounded-full hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors"
                                title="Remove state permit"
                              >
                                <span className="material-symbols-outlined text-sm">close</span>
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                label="Issuance Date"
                                type="date"
                                value={sp.issuance}
                                onChange={(v) => handleStatePermitChange(sp.name, "issuance", v)}
                              />
                              <Input
                                label="Expiry Date"
                                type="date"
                                value={sp.expiry}
                                onChange={(v) => handleStatePermitChange(sp.name, "expiry", v)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-right-4 duration-300">
              <div className="md:col-span-2 text-sm text-on-surface-variant mb-2">Essential for accounting, billing, and fleet-owner payouts.</div>
              <Select label="Ownership Type" value={formData.ownership.ownershipType} onChange={(v) => setFormData(f => ({...f, ownership: {...f.ownership, ownershipType: v as any}}))} options={["Own", "Market"]} />
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-outline">Assigned Driver</label>
                <select 
                  value={formData.ownership.driverId || ""}
                  onChange={(e) => setFormData(f => ({...f, ownership: {...f.ownership, driverId: e.target.value}}))}
                  className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                >
                  <option value="">Unassigned</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.phone})
                    </option>
                  ))}
                </select>
              </div>
              <Input label="Home Branch / Location" placeholder="e.g. Pune Depot" value={formData.ownership.homeBranch} onChange={(v) => setFormData(f => ({...f, ownership: {...f.ownership, homeBranch: v}}))} />
              <Input label="GPS Device ID" placeholder="IoT Telematics ID" value={formData.ownership.gpsDeviceId} onChange={(v) => setFormData(f => ({...f, ownership: {...f.ownership, gpsDeviceId: v}}))} />
            </div>
          )}

          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-right-4 duration-300">
              <div className="md:col-span-2 text-sm text-on-surface-variant mb-2">Proactive maintenance data keeps your fleet on the road.</div>
              <Input label="Current Odometer Reading (km)" type="number" placeholder="125000" value={formData.maintenance.currentOdometer.toString()} onChange={(v) => setFormData(f => ({...f, maintenance: {...f.maintenance, currentOdometer: Number(v)}}))} />
              <Input label="Last Serviced Date" type="date" value={formData.maintenance.lastServicedDate} onChange={(v) => setFormData(f => ({...f, maintenance: {...f.maintenance, lastServicedDate: v}}))} />
              <Select label="Vehicle Status" value={formData.status} onChange={(v) => setFormData(f => ({...f, status: v as any}))} options={["all-good", "maintenance"]} />
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
              {isSubmitting ? "Saving..." : vehicleToEdit ? "Save Changes" : "Create Vehicle"}
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
