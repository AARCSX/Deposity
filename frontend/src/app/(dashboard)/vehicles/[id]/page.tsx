"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { authenticatedFetch } from "@/lib/api";
import { VehicleRecord, parsePermitDetails } from "@/types/vehicle";
import CreateVehicleWizard from "@/components/vehicles/CreateVehicleWizard";

export default function VehicleDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [vehicle, setVehicle] = useState<VehicleRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [driverName, setDriverName] = useState("Unassigned");
  const [driverPhone, setDriverPhone] = useState("");

  const fetchVehicleDetails = async () => {
    try {
      setLoading(true);
      const res = await authenticatedFetch(`/vehicles/${id}`);
      if (res.ok) {
        const data = await res.json();
        setVehicle(data);
      } else {
        setVehicle(null);
      }
    } catch (err) {
      console.error(err);
      setVehicle(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchVehicleDetails();
    }
  }, [id]);

  useEffect(() => {
    if (vehicle?.ownership?.driverId) {
      authenticatedFetch(`/drivers/${vehicle.ownership.driverId}`)
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((data) => {
          if (data) {
            setDriverName(data.name);
            setDriverPhone(data.phone);
          } else {
            setDriverName("Unassigned");
            setDriverPhone("");
          }
        })
        .catch(() => {
          setDriverName("Unassigned");
          setDriverPhone("");
        });
    } else {
      setDriverName("Unassigned");
      setDriverPhone("");
    }
  }, [vehicle]);

  const handleEditSubmit = async (updatedData: VehicleRecord) => {
    const res = await authenticatedFetch(`/vehicles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });
    if (res.ok) {
      const data = await res.json();
      setVehicle(data);
      setIsEditOpen(false);
    } else {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to save changes");
    }
  };

  const getDocStatus = (expiryStr?: string) => {
    if (!expiryStr) return "Not Added";
    const exp = new Date(expiryStr);
    const now = new Date();
    if (exp < now) return "Expired";
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 30) return "Expiring";
    return "Valid";
  };

  const getDocTheme = (expiryStr?: string) => {
    if (!expiryStr) return "warning";
    const exp = new Date(expiryStr);
    const now = new Date();
    if (exp < now) return "error";
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 30) return "warning";
    return "primary";
  };

  const formatDateForDisplay = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
    } catch {
      return dateStr || "N/A";
    }
  };

  const getStatusColorClass = (status?: string) => {
    switch (status) {
      case "all-good":
        return "bg-tertiary/10 text-tertiary";
      case "maintenance":
        return "bg-warning/10 text-warning";
      case "expired-docs":
        return "bg-error/10 text-error";
      case "expiring-soon":
        return "bg-warning/10 text-warning";
      default:
        return "bg-outline-variant/20 text-on-surface-variant";
    }
  };

  const getStatusDotColorClass = (status?: string) => {
    switch (status) {
      case "all-good":
        return "bg-tertiary";
      case "maintenance":
        return "bg-warning";
      case "expired-docs":
        return "bg-error";
      case "expiring-soon":
        return "bg-warning";
      default:
        return "bg-on-surface-variant";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "all-good":
        return "Active";
      case "maintenance":
        return "In Maintenance";
      case "expired-docs":
        return "Expired Docs";
      case "expiring-soon":
        return "Expiring Soon";
      default:
        return status || "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <p className="text-on-surface-variant font-medium animate-pulse">Loading vehicle details...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <span className="material-symbols-outlined text-5xl text-error">warning</span>
        <h2 className="text-2xl font-bold text-on-surface">Vehicle Not Found</h2>
        <p className="text-on-surface-variant">We couldn't locate a vehicle with the ID: {id}</p>
        <Link href="/vehicles" className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
          Back to Vehicles
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Link href="/vehicles" className="hover:text-primary transition-colors">
            Vehicles
          </Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="font-medium text-on-surface">
            {vehicle.core.registrationNumber.toUpperCase()}
          </span>
        </div>

        {/* Header Card (Hero) */}
        <div className="bg-surface-container-lowest rounded-xl p-8 mb-8 relative overflow-hidden shadow-sm border border-outline-variant/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`${getStatusColorClass(vehicle.status)} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1`}>
                  <span className={`w-2 h-2 rounded-full ${getStatusDotColorClass(vehicle.status)} block animate-pulse`}></span>
                  {getStatusLabel(vehicle.status)}
                </span>
                <span className="text-sm font-medium text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">
                  {vehicle.core.axleConfig || "Standard"} - {vehicle.core.bodyType}
                </span>
              </div>
              <h1 className="text-[2.75rem] font-bold leading-none tracking-[-0.02em] text-on-surface mb-2">
                {vehicle.core.registrationNumber.toUpperCase()}
              </h1>
              <p className="text-on-surface-variant text-sm font-medium">
                {vehicle.core.make} {vehicle.core.model} • Capacity: {vehicle.core.tonnageCapacity} MT
              </p>
            </div>
            <button 
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-surface-container-low text-primary font-semibold rounded-xl hover:bg-primary/10 transition-colors active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit Details
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 pt-8 border-t border-outline-variant/15">
            <StatItem icon="person" label="Current Driver" value={driverName} subValue={driverPhone || "No contact"} />
            <StatItem 
              icon="location_on" 
              label="GPS Status" 
              value={vehicle.ownership.gpsDeviceId ? "Active" : "Disconnected"} 
              subValue={vehicle.ownership.gpsDeviceId ? `ID: ${vehicle.ownership.gpsDeviceId}` : "No telemetry"} 
              hasPulse={!!vehicle.ownership.gpsDeviceId} 
            />
            <StatItem 
              icon="warning" 
              label="Next Expiry" 
              value="Insurance" 
              subValue={formatDateForDisplay(vehicle.compliance.insuranceExpiry)} 
              theme={getDocTheme(vehicle.compliance.insuranceExpiry)} 
            />
            <StatItem 
              icon="account_balance_wallet" 
              label="Odometer" 
              value={`${vehicle.maintenance.currentOdometer.toLocaleString()} km`} 
              subValue={`Last Service: ${formatDateForDisplay(vehicle.maintenance.lastServicedDate)}`} 
            />
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-8 border-b border-outline-variant/15 mb-8 overflow-x-auto scrollbar-hide">
          <TabButton active>Documents</TabButton>
          <TabButton>EMI Schedule</TabButton>
          <TabButton>FASTag History</TabButton>
          <TabButton>Trip History</TabButton>
          <TabButton>Maintenance</TabButton>
        </div>

        {/* Tab Content: Documents (Bento Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Timeline Panel */}
          <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/15">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-primary">event_note</span>
              Expiry Timeline
            </h3>
            <div className="relative pl-4 border-l-2 border-outline-variant/20 space-y-8">
              <TimelineNode date={formatDateForDisplay(vehicle.compliance.rcExpiry)} title="RC Expiry" theme={getDocTheme(vehicle.compliance.rcExpiry)} />
              <TimelineNode date={formatDateForDisplay(vehicle.compliance.insuranceExpiry)} title="Insurance Expiry" theme={getDocTheme(vehicle.compliance.insuranceExpiry)} />
              <TimelineNode date={formatDateForDisplay(vehicle.compliance.pucExpiry)} title="PUC Expiry" theme={getDocTheme(vehicle.compliance.pucExpiry)} />
              <TimelineNode date={formatDateForDisplay(vehicle.compliance.fitnessExpiry)} title="Fitness Expiry" theme={getDocTheme(vehicle.compliance.fitnessExpiry)} />
            </div>
          </div>

          {/* Document Cards Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocCard 
              title="Registration (RC)" 
              sub="Original Copy" 
              status={getDocStatus(vehicle.compliance.rcExpiry)} 
              issued={formatDateForDisplay(vehicle.compliance.rcIssuance)} 
              expires={formatDateForDisplay(vehicle.compliance.rcExpiry)} 
              theme={getDocTheme(vehicle.compliance.rcExpiry)}
            />
            <DocCard 
              title="Insurance" 
              sub="Comprehensive Policy" 
              status={getDocStatus(vehicle.compliance.insuranceExpiry)} 
              issued={formatDateForDisplay(vehicle.compliance.insuranceIssuance)} 
              expires={formatDateForDisplay(vehicle.compliance.insuranceExpiry)} 
              theme={getDocTheme(vehicle.compliance.insuranceExpiry)} 
            />
            <DocCard 
              title="PUC Certificate" 
              sub="Emission Validity" 
              status={getDocStatus(vehicle.compliance.pucExpiry)} 
              issued={formatDateForDisplay(vehicle.compliance.pucIssuance)} 
              expires={formatDateForDisplay(vehicle.compliance.pucExpiry)} 
              theme={getDocTheme(vehicle.compliance.pucExpiry)} 
            />
            <DocCard 
              title="Fitness Certificate" 
              sub="RTO Fitness" 
              status={getDocStatus(vehicle.compliance.fitnessExpiry)} 
              issued={formatDateForDisplay(vehicle.compliance.fitnessIssuance)} 
              expires={formatDateForDisplay(vehicle.compliance.fitnessExpiry)} 
              theme={getDocTheme(vehicle.compliance.fitnessExpiry)} 
            />

            {/* Permit Cards */}
            {(() => {
              const permit = parsePermitDetails(vehicle.compliance.permitDetails);
              if (permit.type === "National" && (permit.issuance || permit.expiry)) {
                return (
                  <DocCard
                    title="National Permit"
                    sub="All India"
                    status={getDocStatus(permit.expiry)}
                    issued={formatDateForDisplay(permit.issuance)}
                    expires={formatDateForDisplay(permit.expiry)}
                    theme={getDocTheme(permit.expiry)}
                  />
                );
              }
              if (permit.type === "State" && permit.states.length > 0) {
                return permit.states.map((sp) => (
                  <DocCard
                    key={sp.name}
                    title={`State Permit`}
                    sub={sp.name}
                    status={getDocStatus(sp.expiry)}
                    issued={formatDateForDisplay(sp.issuance)}
                    expires={formatDateForDisplay(sp.expiry)}
                    theme={getDocTheme(sp.expiry)}
                  />
                ));
              }
              return null;
            })()}
          </div>
        </div>
        
        <div className="h-12"></div>
      </div>

      <CreateVehicleWizard 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        onSubmit={handleEditSubmit} 
        vehicleToEdit={vehicle} 
      />
    </>
  );
}

function StatItem({ icon, label, value, subValue, hasPulse, theme = "primary" }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === "error" ? "bg-error/10 text-error" : "bg-surface-container-low text-primary"}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-xs text-on-surface-variant font-medium mb-1">{label}</p>
        <div className="flex items-center gap-2">
          {hasPulse && <span className="w-2 h-2 rounded-full bg-tertiary block animate-pulse"></span>}
          <p className={`font-bold ${theme === "error" ? "text-error" : "text-on-surface"}`}>{value}</p>
        </div>
        <p className="text-xs text-on-surface-variant mt-1">{subValue}</p>
      </div>
    </div>
  );
}

function TabButton({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button className={`pb-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${active ? "text-primary border-primary" : "text-on-surface-variant border-transparent hover:text-on-surface"}`}>
      {children}
    </button>
  );
}

function TimelineNode({ date, title, sub, theme = "primary" }: any) {
  const colors = {
    primary: "bg-primary",
    error: "bg-error",
    warning: "bg-warning",
    tertiary: "bg-tertiary",
  };

  return (
    <div className="relative">
      <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-surface-container-lowest ${colors[theme as keyof typeof colors]}`}></div>
      <p className="text-xs font-bold mb-1" style={{ color: `var(--${theme})` }}>{date}</p>
      <p className="font-bold text-sm text-on-surface">{title}</p>
      {sub && <p className="text-xs text-on-surface-variant mt-1">{sub}</p>}
    </div>
  );
}

function DocCard({ title, sub, status, issued, expires, provider, theme = "primary", showAction }: any) {
  return (
    <div className={`bg-surface-container-lowest border rounded-xl p-5 hover:shadow-md transition-all ${theme === "error" ? "border-error/30" : "border-outline-variant/15"}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === "error" ? "bg-error/10 text-error" : "bg-surface-container-low text-primary"}`}>
            <span className="material-symbols-outlined">description</span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-on-surface">{title}</h4>
            <p className="text-xs text-on-surface-variant">{sub}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${theme === "error" ? "bg-error/10 text-error" : theme === "warning" ? "bg-warning/10 text-warning" : "bg-tertiary/10 text-tertiary"}`}>
          {status}
        </span>
      </div>
      <div className="flex justify-between items-end mt-4 pt-4 border-t border-outline-variant/15">
        <div>
          {issued && issued !== "N/A" && <p className="text-xs text-on-surface-variant">Issued: {issued}</p>}
          {provider && <p className="text-xs text-on-surface-variant">Provider: {provider}</p>}
          <p className={`text-xs ${theme === "error" ? "font-bold text-error" : "text-on-surface-variant"}`}>
            Expires: {expires}
          </p>
        </div>
        {showAction ? (
          <button className="bg-error text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-error/90 transition-colors active:scale-[0.98]">
            Renew Now
          </button>
        ) : (
          <button className="text-primary hover:text-primary-container text-sm font-semibold flex items-center gap-1">
            View <span className="material-symbols-outlined text-sm">visibility</span>
          </button>
        )}
      </div>
    </div>
  );
}
