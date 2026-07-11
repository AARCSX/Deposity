"use client";

import React, { useEffect, useState } from "react";
import { VehicleRecord } from "@/types/vehicle";

export interface MaintenanceRecord {
  id?: string;
  vehicleId: string;
  vehicleNumber: string;
  maintenanceType: string;
  maintenanceDate: string;
  odometerReading: number;
  serviceCenter: string;
  mechanic: string;
  cost: number;
  description: string;
  partsReplaced: string;
  nextServiceDate: string;
  nextServiceOdometer: number;
  status: string;
  notes: string;
}

interface CreateMaintenanceWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MaintenanceRecord) => Promise<void>;
  vehicles: VehicleRecord[];
  recordToEdit: MaintenanceRecord | null;
}

interface FormState {
  vehicleId: string;
  vehicleNumber: string;
  maintenanceType: string;
  maintenanceDate: string;
  odometerReading: string;
  serviceCenter: string;
  mechanic: string;
  cost: string;
  description: string;
  partsReplaced: string;
  nextServiceDate: string;
  nextServiceOdometer: string;
  status: string;
  notes: string;
}

const getInitialFormState = (vehicles: VehicleRecord[]): FormState => ({
  vehicleId: vehicles[0]?.id || "",
  vehicleNumber: vehicles[0]?.core.registrationNumber || "",
  maintenanceType: "Service",
  maintenanceDate: new Date().toISOString().split("T")[0],
  odometerReading: "",
  serviceCenter: "",
  mechanic: "",
  cost: "",
  description: "",
  partsReplaced: "",
  nextServiceDate: "",
  nextServiceOdometer: "",
  status: "Scheduled",
  notes: "",
});

const STEPS = [
  { id: 0, title: "Vehicle & Odo", subtitle: "Select truck and type" },
  { id: 1, title: "Service Details", subtitle: "Center, mechanic and cost" },
  { id: 2, title: "Parts & Next Date", subtitle: "Replaced parts & notes" },
];

export default function CreateMaintenanceWizard({
  isOpen,
  onClose,
  onSubmit,
  vehicles,
  recordToEdit,
}: CreateMaintenanceWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormState>(getInitialFormState(vehicles));
  const [useCustomVehicle, setUseCustomVehicle] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (recordToEdit) {
      const isRegistered = vehicles.some(
        (v) => v.core.registrationNumber === recordToEdit.vehicleNumber
      );
      setUseCustomVehicle(!isRegistered);
      setFormData({
        vehicleId: recordToEdit.vehicleId || "",
        vehicleNumber: recordToEdit.vehicleNumber || "",
        maintenanceType: recordToEdit.maintenanceType || "Service",
        maintenanceDate: recordToEdit.maintenanceDate || "",
        odometerReading: recordToEdit.odometerReading ? String(recordToEdit.odometerReading) : "",
        serviceCenter: recordToEdit.serviceCenter || "",
        mechanic: recordToEdit.mechanic || "",
        cost: recordToEdit.cost ? String(recordToEdit.cost) : "",
        description: recordToEdit.description || "",
        partsReplaced: recordToEdit.partsReplaced || "",
        nextServiceDate: recordToEdit.nextServiceDate || "",
        nextServiceOdometer: recordToEdit.nextServiceOdometer ? String(recordToEdit.nextServiceOdometer) : "",
        status: recordToEdit.status || "Scheduled",
        notes: recordToEdit.notes || "",
      });
    } else {
      setFormData(getInitialFormState(vehicles));
      setUseCustomVehicle(false);
    }
    setCurrentStep(0);
    setValidationError(null);
  }, [recordToEdit, vehicles, isOpen]);

  if (!isOpen) return null;

  const validateStep = (step: number): boolean => {
    setValidationError(null);
    if (step === 0) {
      if (!formData.vehicleNumber.trim()) {
        setValidationError("Registration Number is required.");
        return false;
      }
      if (!formData.vehicleId.trim()) {
        setValidationError("Vehicle ID is required.");
        return false;
      }
      if (!formData.odometerReading.trim() || Number(formData.odometerReading) < 0) {
        setValidationError("Please enter a valid odometer reading.");
        return false;
      }
      if (!formData.maintenanceDate) {
        setValidationError("Maintenance Date is required.");
        return false;
      }
    } else if (step === 1) {
      if (!formData.serviceCenter.trim()) {
        setValidationError("Service Center name is required.");
        return false;
      }
      if (!formData.mechanic.trim()) {
        setValidationError("Mechanic name is required.");
        return false;
      }
      if (!formData.cost.trim() || Number(formData.cost) <= 0) {
        setValidationError("Cost must be a valid amount greater than zero.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep((p) => p + 1);
      }
    }
  };

  const handleBack = () => {
    setValidationError(null);
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  };

  const handleVehicleChange = (regNum: string) => {
    if (regNum === "custom") {
      setUseCustomVehicle(true);
      setFormData((f) => ({ ...f, vehicleNumber: "", vehicleId: "" }));
    } else {
      setUseCustomVehicle(false);
      const vehicle = vehicles.find((v) => v.core.registrationNumber === regNum);
      if (vehicle) {
        setFormData((f) => ({
          ...f,
          vehicleNumber: vehicle.core.registrationNumber,
          vehicleId: vehicle.id || `V-${vehicle.core.registrationNumber}`,
        }));
      }
    }
  };

  const handleFinish = async () => {
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    try {
      const payload: MaintenanceRecord = {
        id: recordToEdit?.id,
        vehicleId: formData.vehicleId,
        vehicleNumber: formData.vehicleNumber,
        maintenanceType: formData.maintenanceType,
        maintenanceDate: formData.maintenanceDate,
        odometerReading: Number(formData.odometerReading) || 0,
        serviceCenter: formData.serviceCenter,
        mechanic: formData.mechanic,
        cost: Number(formData.cost) || 0,
        description: formData.description,
        partsReplaced: formData.partsReplaced,
        nextServiceDate: formData.nextServiceDate,
        nextServiceOdometer: Number(formData.nextServiceOdometer) || 0,
        status: formData.status,
        notes: formData.notes,
      };
      await onSubmit(payload);
      onClose();
    } catch (e: any) {
      setValidationError(e.message || "An error occurred while saving the record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCurrentInVehicles = vehicles.some(
    (v) => v.core.registrationNumber === formData.vehicleNumber
  );

  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="bg-surface px-6 py-4 border-b border-outline-variant/15 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-on-surface">
              {recordToEdit ? "Edit Maintenance Record" : "Add Maintenance Record"}
            </h2>
            <p className="text-xs text-on-surface-variant font-medium mt-0.5">
              Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surface-container-high h-1.5">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Step Navigation Headers */}
        <div className="px-6 py-3 bg-surface-container-low border-b border-outline-variant/10 flex gap-4 overflow-x-auto hide-scrollbar">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 shrink-0 ${
                currentStep === step.id ? "opacity-100" : "opacity-50"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep >= step.id
                    ? "bg-primary text-white"
                    : "bg-surface-container-highest text-on-surface-variant"
                }`}
              >
                {currentStep > step.id ? (
                  <span className="material-symbols-outlined text-[14px]">check</span>
                ) : (
                  step.id + 1
                )}
              </div>
              <span className="text-xs font-bold text-on-surface whitespace-nowrap">
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {validationError && (
            <div className="rounded-2xl border border-error/25 bg-error/10 px-4 py-3 text-sm text-error font-medium flex items-center gap-2 animate-in slide-in-from-top-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{validationError}</span>
            </div>
          )}

          {currentStep === 0 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-3">
                <label className="text-sm font-bold text-outline block">
                  Select Registered Vehicle *
                  <select
                    className="mt-1.5 w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                    value={
                      isCurrentInVehicles
                        ? formData.vehicleNumber
                        : formData.vehicleNumber
                        ? "custom"
                        : ""
                    }
                    onChange={(e) => handleVehicleChange(e.target.value)}
                  >
                    <option value="" disabled>
                      -- Select Vehicle --
                    </option>
                    {vehicles.map((v) => (
                      <option key={v.core.registrationNumber} value={v.core.registrationNumber}>
                        {v.core.registrationNumber} ({v.core.make} {v.core.model})
                      </option>
                    ))}
                    <option value="custom">Other / Manual Input</option>
                  </select>
                </label>

                {(useCustomVehicle || !isCurrentInVehicles) && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Registration Number *"
                      placeholder="e.g. MH12AB1234"
                      value={formData.vehicleNumber}
                      onChange={(v) => setFormData((f) => ({ ...f, vehicleNumber: v }))}
                    />
                    <Input
                      label="Vehicle ID *"
                      placeholder="e.g. V-101"
                      value={formData.vehicleId}
                      onChange={(v) => setFormData((f) => ({ ...f, vehicleId: v }))}
                    />
                  </div>
                )}

                {!useCustomVehicle && isCurrentInVehicles && (
                  <div className="p-3 bg-surface-container-low rounded-xl text-xs text-on-surface-variant flex justify-between items-center">
                    <span>
                      <strong>Selected Vehicle ID:</strong> {formData.vehicleId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleVehicleChange("custom")}
                      className="text-primary font-bold hover:underline"
                    >
                      Change Manually
                    </button>
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  label="Maintenance Type"
                  value={formData.maintenanceType}
                  onChange={(v) => setFormData((f) => ({ ...f, maintenanceType: v }))}
                  options={["Service", "Inspection", "Tyre Replacement", "Repair"]}
                />
                <Input
                  label="Maintenance Date *"
                  type="date"
                  value={formData.maintenanceDate}
                  onChange={(v) => setFormData((f) => ({ ...f, maintenanceDate: v }))}
                />
              </div>

              <Input
                label="Odometer Reading (km) *"
                type="number"
                placeholder="e.g. 12500"
                value={formData.odometerReading}
                onChange={(v) => setFormData((f) => ({ ...f, odometerReading: v }))}
              />
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Service Center *"
                  placeholder="e.g. Metro Truck Service"
                  value={formData.serviceCenter}
                  onChange={(v) => setFormData((f) => ({ ...f, serviceCenter: v }))}
                />
                <Input
                  label="Mechanic Name *"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.mechanic}
                  onChange={(v) => setFormData((f) => ({ ...f, mechanic: v }))}
                />
              </div>

              <Input
                label="Cost (₹) *"
                type="number"
                placeholder="e.g. 8600"
                value={formData.cost}
                onChange={(v) => setFormData((f) => ({ ...f, cost: v }))}
              />

              <TextArea
                label="Service Description"
                placeholder="Enter summary of work done..."
                value={formData.description}
                onChange={(v) => setFormData((f) => ({ ...f, description: v }))}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <Input
                label="Parts Replaced"
                placeholder="e.g. brake pads, front axle-1 tyre"
                value={formData.partsReplaced}
                onChange={(v) => setFormData((f) => ({ ...f, partsReplaced: v }))}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Next Service Date"
                  type="date"
                  value={formData.nextServiceDate}
                  onChange={(v) => setFormData((f) => ({ ...f, nextServiceDate: v }))}
                />
                <Input
                  label="Next Service Odometer (km)"
                  type="number"
                  placeholder="e.g. 15000"
                  value={formData.nextServiceOdometer}
                  onChange={(v) => setFormData((f) => ({ ...f, nextServiceOdometer: v }))}
                />
              </div>

              <Select
                label="Status"
                value={formData.status}
                onChange={(v) => setFormData((f) => ({ ...f, status: v }))}
                options={["Scheduled", "In Progress", "Completed", "Cancelled"]}
              />

              <TextArea
                label="General Notes"
                placeholder="Any special remarks or comments..."
                value={formData.notes}
                onChange={(v) => setFormData((f) => ({ ...f, notes: v }))}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-surface px-6 py-4 border-t border-outline-variant/15 flex justify-between items-center shrink-0">
          <button
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
          >
            Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            {currentStep === STEPS.length - 1 ? (
              <button
                onClick={handleFinish}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-linear-to-br from-primary to-primary-container text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting
                  ? "Saving..."
                  : recordToEdit
                  ? "Save Changes"
                  : "Record Maintenance"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Next Step
              </button>
            )}
          </div>
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
    <div className="space-y-1.5 w-full">
      <label className="text-xs font-bold text-outline">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
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
    <div className="space-y-1.5 w-full">
      <label className="text-xs font-bold text-outline">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-semibold"
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

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

function TextArea({ label, value, onChange, placeholder }: TextAreaProps) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-xs font-bold text-outline">{label}</label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-24 bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
      />
    </div>
  );
}
