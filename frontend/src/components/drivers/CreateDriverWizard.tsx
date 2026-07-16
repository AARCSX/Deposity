"use client";

import React, { useState, useEffect } from "react";
import { authenticatedFetch } from "@/lib/api";
import { VehicleRecord } from "@/types/vehicle";
import { DriverRecord } from "@/types/driver";

interface CreateDriverWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  driverToEdit?: DriverRecord | null;
}

const parseCurrency = (val: any) => {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const cleaned = val.replace(/[₹$,]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  return dateStr.substring(0, 10);
};

export default function CreateDriverWizard({ isOpen, onClose, onSubmit, driverToEdit }: CreateDriverWizardProps) {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [status, setStatus] = useState("Active");
  const [phone, setPhone] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [licenseIssuance, setLicenseIssuance] = useState("");
  const [salary, setSalary] = useState("");
  const [pendingBalance, setPendingBalance] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSubmissionError(null);
      if (driverToEdit) {
        setName(driverToEdit.name || "");
        setAvatar(driverToEdit.avatar || "");
        setStatus(driverToEdit.status || "Active");
        setPhone(driverToEdit.phone || "");
        setVehicleId(driverToEdit.vehicleId || "");
        setLicenseNumber(driverToEdit.licenseNumber || "");
        setLicenseExpiry(formatDate(driverToEdit.licenseExpiry));
        setLicenseIssuance(formatDate(driverToEdit.licenseIssuance));
        setSalary(parseCurrency(driverToEdit.salary).toString());
        setPendingBalance(parseCurrency(driverToEdit.pendingBalance).toString());
      } else {
        setName("");
        setAvatar("");
        setStatus("Active");
        setPhone("");
        setVehicleId("");
        setLicenseNumber("");
        setLicenseExpiry("");
        setLicenseIssuance("");
        setSalary("");
        setPendingBalance("0");
      }

      // Fetch vehicles to populate assignment select
      authenticatedFetch("/vehicles")
        .then((res) => {
          if (res.ok) return res.json();
          return [];
        })
        .then((data) => setVehicles(data))
        .catch(() => setVehicles([]));
    }
  }, [isOpen, driverToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError(null);

    const payload = {
      name,
      avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
      status,
      phone,
      vehicleId: vehicleId || null,
      licenseNumber,
      licenseExpiry: licenseExpiry ? new Date(licenseExpiry).toISOString() : new Date().toISOString(),
      licenseIssuance: licenseIssuance ? new Date(licenseIssuance).toISOString() : null,
      salary: parseFloat(salary) || 0,
      pendingBalance: parseFloat(pendingBalance) || 0,
      isStatusWarning: false,
    };

    try {
      await onSubmit(payload);
      // Reset Form on Success
      setName("");
      setAvatar("");
      setStatus("Active");
      setPhone("");
      setVehicleId("");
      setLicenseNumber("");
      setLicenseExpiry("");
      setLicenseIssuance("");
      setSalary("");
      setPendingBalance("0");
    } catch (err: any) {
      setSubmissionError(err.message || "An unexpected error occurred while saving the driver.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="bg-surface px-6 py-4 border-b border-outline-variant/15 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-on-surface">{driverToEdit ? "Edit Driver Details" : "Register New Driver"}</h2>
            <p className="text-sm text-on-surface-variant font-medium">{driverToEdit ? "Update driver information" : "Add driver details and assign vehicles"}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          {submissionError && (
            <div className="p-4 rounded-xl border border-error/20 bg-error/5 text-error flex items-start gap-3 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-[1.25rem] shrink-0 mt-0.5">error</span>
              <div className="text-sm">
                <span className="font-bold">Error saving driver:</span> {submissionError}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-outline">Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-outline">License Number</label>
              <input
                type="text"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="e.g. DL-142021005678"
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-outline">License Issuance Date</label>
              <input
                type="date"
                value={licenseIssuance}
                onChange={(e) => setLicenseIssuance(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-outline">License Expiry Date</label>
              <input
                type="date"
                required
                value={licenseExpiry}
                onChange={(e) => setLicenseExpiry(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-outline">Salary (INR per month)</label>
              <input
                type="number"
                required
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. 25000"
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-outline">Pending Balance (INR)</label>
              <input
                type="number"
                value={pendingBalance}
                onChange={(e) => setPendingBalance(e.target.value)}
                placeholder="e.g. 0"
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-outline">Assign Vehicle</label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
              >
                <option value="">Unassigned</option>
                {vehicles.map((v) => (
                  <option key={v.id || v.core.registrationNumber} value={v.id || v.core.registrationNumber}>
                    {v.core.registrationNumber} ({v.core.make} {v.core.model})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-outline">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
              >
                <option value="Active">Active</option>
                <option value="On Break">On Break</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-outline">Avatar Image URL (Optional)</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="Leave blank for default premium avatar"
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              {isSubmitting ? "Saving..." : driverToEdit ? "Save Changes" : "Register Driver"}
              {!isSubmitting && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
