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
  const [activeTab, setActiveTab] = useState("documents");

  // Sub-resource states
  const [emiSchedules, setEmiSchedules] = useState<any[]>([]);
  const [fastagLogs, setFastagLogs] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);

  // Modal states
  const [isEmiModalOpen, setIsEmiModalOpen] = useState(false);
  const [emiToEdit, setEmiToEdit] = useState<any | null>(null);
  const [emiForm, setEmiForm] = useState({
    installmentNo: 1,
    dueDate: "",
    amount: 0,
    status: "Pending",
    paymentDate: "",
    bankName: "",
    referenceNo: "",
  });

  const [isFastagModalOpen, setIsFastagModalOpen] = useState(false);
  const [fastagForm, setFastagForm] = useState({
    transactionId: "",
    timestamp: "",
    tollPlaza: "",
    amount: 0,
    status: "Debited",
    balance: 0,
  });

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

  const fetchEMI = async () => {
    try {
      const res = await authenticatedFetch(`/vehicles/${id}/emi`);
      if (res.ok) {
        const data = await res.json();
        setEmiSchedules(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFASTag = async () => {
    try {
      const res = await authenticatedFetch(`/vehicles/${id}/fastag`);
      if (res.ok) {
        const data = await res.json();
        setFastagLogs(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await authenticatedFetch(`/trips`);
      if (res.ok) {
        const data = await res.json();
        const vehicleReg = vehicle?.core.registrationNumber.toLowerCase();
        setTrips((data || []).filter((t: any) => t.assignment?.vehicleId?.toLowerCase() === vehicleReg));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMaintenance = async () => {
    try {
      const res = await authenticatedFetch(`/maintenance`);
      if (res.ok) {
        const data = await res.json();
        const vehicleReg = vehicle?.core.registrationNumber.toLowerCase();
        setMaintenance((data || []).filter((m: any) => m.vehicleNumber?.toLowerCase() === vehicleReg));
      }
    } catch (err) {
      console.error(err);
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

  // Fetch tab-specific data on tab switch
  useEffect(() => {
    if (!id || !vehicle) return;
    if (activeTab === "emi") {
      fetchEMI();
    } else if (activeTab === "fastag") {
      fetchFASTag();
    } else if (activeTab === "trips") {
      fetchTrips();
    } else if (activeTab === "maintenance") {
      fetchMaintenance();
    }
  }, [activeTab, id, vehicle]);

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

  // EMI Handlers
  const handleOpenEmiModal = (emi: any = null) => {
    if (emi) {
      setEmiToEdit(emi);
      setEmiForm({
        installmentNo: emi.installmentNo,
        dueDate: emi.dueDate ? emi.dueDate.substring(0, 10) : "",
        amount: emi.amount,
        status: emi.status || "Pending",
        paymentDate: emi.paymentDate ? emi.paymentDate.substring(0, 10) : "",
        bankName: emi.bankName || "",
        referenceNo: emi.referenceNo || "",
      });
    } else {
      setEmiToEdit(null);
      setEmiForm({
        installmentNo: emiSchedules.length + 1,
        dueDate: "",
        amount: 0,
        status: "Pending",
        paymentDate: "",
        bankName: "",
        referenceNo: "",
      });
    }
    setIsEmiModalOpen(true);
  };

  const handleEmiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        installmentNo: Number(emiForm.installmentNo),
        dueDate: emiForm.dueDate,
        amount: Number(emiForm.amount),
        status: emiForm.status,
        paymentDate: emiForm.paymentDate || null,
        bankName: emiForm.bankName || null,
        referenceNo: emiForm.referenceNo || null,
      };

      const url = emiToEdit 
        ? `/vehicles/${id}/emi/${emiToEdit.id}` 
        : `/vehicles/${id}/emi`;
      const method = emiToEdit ? "PUT" : "POST";

      const res = await authenticatedFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsEmiModalOpen(false);
        fetchEMI();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to save EMI schedule");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEmi = async (emiId: string) => {
    if (!confirm("Are you sure you want to delete this installment?")) return;
    try {
      const res = await authenticatedFetch(`/vehicles/${id}/emi/${emiId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchEMI();
      } else {
        alert("Failed to delete installment");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // FASTag Handlers
  const handleFastagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        transactionId: fastagForm.transactionId,
        timestamp: new Date(fastagForm.timestamp).toISOString(),
        tollPlaza: fastagForm.tollPlaza,
        amount: Number(fastagForm.amount),
        status: fastagForm.status,
        balance: Number(fastagForm.balance),
      };

      const res = await authenticatedFetch(`/vehicles/${id}/fastag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsFastagModalOpen(false);
        // reset form
        setFastagForm({
          transactionId: "",
          timestamp: "",
          tollPlaza: "",
          amount: 0,
          status: "Debited",
          balance: 0,
        });
        fetchFASTag();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to save transaction");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFastag = async (fastagId: string) => {
    if (!confirm("Are you sure you want to delete this transaction log?")) return;
    try {
      const res = await authenticatedFetch(`/vehicles/${id}/fastag/${fastagId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchFASTag();
      } else {
        alert("Failed to delete transaction log");
      }
    } catch (err) {
      console.error(err);
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
          <TabButton active={activeTab === "documents"} onClick={() => setActiveTab("documents")}>Documents</TabButton>
          <TabButton active={activeTab === "emi"} onClick={() => setActiveTab("emi")}>EMI Schedule</TabButton>
          <TabButton active={activeTab === "fastag"} onClick={() => setActiveTab("fastag")}>FASTag History</TabButton>
          <TabButton active={activeTab === "trips"} onClick={() => setActiveTab("trips")}>Trip History</TabButton>
          <TabButton active={activeTab === "maintenance"} onClick={() => setActiveTab("maintenance")}>Maintenance</TabButton>
        </div>

        {/* Tab Contents */}
        {activeTab === "documents" && (
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
        )}

        {activeTab === "emi" && (
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/15 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-lg text-on-surface">EMI Payment Schedule</h3>
                <p className="text-xs text-on-surface-variant">Track loan installments, amounts, status, and payment records.</p>
              </div>
              <button 
                onClick={() => handleOpenEmiModal()}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-md shadow-primary/20 hover:opacity-90 transition-opacity active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Installment
              </button>
            </div>

            {emiSchedules.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-outline-variant/20 rounded-xl bg-surface-container-low/30">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">account_balance</span>
                <p className="text-sm font-bold text-on-surface">No installments found</p>
                <p className="text-xs text-on-surface-variant mt-1">Add your first EMI schedule installment details above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-outline-variant/10">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-surface-container-high">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Installment #</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Due Date</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Amount</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Status</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Payment Date</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Bank Name</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Reference No</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {emiSchedules.map((emi) => (
                      <tr key={emi.id} className="hover:bg-primary/5 transition-colors">
                        <td className="px-4 py-3 font-medium text-on-surface">Installment {emi.installmentNo}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{formatDateForDisplay(emi.dueDate)}</td>
                        <td className="px-4 py-3 font-semibold text-on-surface">₹{emi.amount.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            emi.status === "Paid" ? "bg-tertiary/10 text-tertiary" :
                            emi.status === "Overdue" ? "bg-error/10 text-error" :
                            "bg-warning/10 text-warning"
                          }`}>
                            {emi.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">{emi.paymentDate ? formatDateForDisplay(emi.paymentDate) : "—"}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{emi.bankName || "—"}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{emi.referenceNo || "—"}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button 
                            onClick={() => handleOpenEmiModal(emi)}
                            className="text-primary hover:text-primary-container text-xs font-semibold"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteEmi(emi.id)}
                            className="text-error hover:text-error/85 text-xs font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "fastag" && (
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/15 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-lg text-on-surface">FASTag Toll History</h3>
                <p className="text-xs text-on-surface-variant">Review toll plaza payments, status, and account balance logs.</p>
              </div>
              <button 
                onClick={() => setIsFastagModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-md shadow-primary/20 hover:opacity-90 transition-opacity active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Transaction
              </button>
            </div>

            {fastagLogs.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-outline-variant/20 rounded-xl bg-surface-container-low/30">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">toll</span>
                <p className="text-sm font-bold text-on-surface">No FASTag logs found</p>
                <p className="text-xs text-on-surface-variant mt-1">Add transaction records or load histories for this vehicle.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-outline-variant/10">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-surface-container-high">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Transaction ID</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Timestamp</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Toll Plaza</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Amount</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Status</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Balance</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {fastagLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-primary/5 transition-colors">
                        <td className="px-4 py-3 font-mono text-on-surface">{log.transactionId}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{new Date(log.timestamp).toLocaleString("en-GB")}</td>
                        <td className="px-4 py-3 text-on-surface">{log.tollPlaza}</td>
                        <td className="px-4 py-3 font-bold text-error">-₹{log.amount.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            log.status === "Debited" ? "bg-tertiary/10 text-tertiary" : "bg-error/10 text-error"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-on-surface">₹{log.balance.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => handleDeleteFastag(log.id)}
                            className="text-error hover:text-error/85 text-xs font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "trips" && (
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/15 shadow-sm">
            <h3 className="font-bold text-lg text-on-surface mb-6">Trip History</h3>

            {trips.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-outline-variant/20 rounded-xl bg-surface-container-low/30">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">local_shipping</span>
                <p className="text-sm font-bold text-on-surface">No trips recorded</p>
                <p className="text-xs text-on-surface-variant mt-1">This vehicle has not been assigned to any trips yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-outline-variant/10">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-surface-container-high">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Route</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Cargo</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Weight (MT)</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Status</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Freight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {trips.map((t) => (
                      <tr key={t.id} className="hover:bg-primary/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-on-surface">{t.route.originName} &rarr; {t.route.destinationName}</div>
                          <div className="text-xs text-on-surface-variant">Start: {formatDateForDisplay(t.route.originDate)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-on-surface font-medium">{t.cargo.material}</div>
                          <div className="text-xs text-on-surface-variant">{t.cargo.company}</div>
                        </td>
                        <td className="px-4 py-3 text-on-surface">{t.cargo.weight}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            t.status === "delivered" ? "bg-tertiary/10 text-tertiary" :
                            t.status === "in-transit" ? "bg-primary/10 text-primary" :
                            "bg-warning/10 text-warning"
                          }`}>
                            {t.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-on-surface">₹{t.financials.totalFreight?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "maintenance" && (
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/15 shadow-sm">
            <h3 className="font-bold text-lg text-on-surface mb-6">Maintenance Logs</h3>

            {maintenance.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-outline-variant/20 rounded-xl bg-surface-container-low/30">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">build</span>
                <p className="text-sm font-bold text-on-surface">No maintenance logs found</p>
                <p className="text-xs text-on-surface-variant mt-1">No maintenance works have been logged for this vehicle.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-outline-variant/10">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-surface-container-high">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Date</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Type</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Description</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Status</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {maintenance.map((m) => (
                      <tr key={m.id} className="hover:bg-primary/5 transition-colors">
                        <td className="px-4 py-3 text-on-surface font-medium">{formatDateForDisplay(m.maintenanceDate)}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{m.maintenanceType}</td>
                        <td className="px-4 py-3 text-on-surface-variant truncate max-w-[200px]">{m.description}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            m.status === "Completed" ? "bg-tertiary/10 text-tertiary" : "bg-warning/10 text-warning"
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-on-surface">₹{m.cost.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        <div className="h-12"></div>
      </div>

      <CreateVehicleWizard 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        onSubmit={handleEditSubmit} 
        vehicleToEdit={vehicle} 
      />

      {/* EMI Schedule Modal Form */}
      {isEmiModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/15 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-on-surface">{emiToEdit ? "Edit Installment" : "Add Installment"}</h3>
              <button 
                onClick={() => setIsEmiModalOpen(false)} 
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>
            <form onSubmit={handleEmiSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Installment #</label>
                <input 
                  type="number" 
                  required
                  className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:border-primary outline-none"
                  value={emiForm.installmentNo}
                  onChange={(e) => setEmiForm({ ...emiForm, installmentNo: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Amount (₹)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:border-primary outline-none"
                    value={emiForm.amount}
                    onChange={(e) => setEmiForm({ ...emiForm, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Status</label>
                  <select 
                    className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:border-primary outline-none"
                    value={emiForm.status}
                    onChange={(e) => setEmiForm({ ...emiForm, status: e.target.value })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Due Date</label>
                <input 
                  type="date" 
                  required
                  className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:border-primary outline-none"
                  value={emiForm.dueDate}
                  onChange={(e) => setEmiForm({ ...emiForm, dueDate: e.target.value })}
                />
              </div>
              {emiForm.status === "Paid" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Payment Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:border-primary outline-none"
                      value={emiForm.paymentDate}
                      onChange={(e) => setEmiForm({ ...emiForm, paymentDate: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Bank Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. HDFC Bank"
                        className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:border-primary outline-none"
                        value={emiForm.bankName}
                        onChange={(e) => setEmiForm({ ...emiForm, bankName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Reference No</label>
                      <input 
                        type="text" 
                        placeholder="e.g. TXN987654"
                        className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:border-primary outline-none"
                        value={emiForm.referenceNo}
                        onChange={(e) => setEmiForm({ ...emiForm, referenceNo: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsEmiModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant/20 rounded-xl text-sm font-semibold hover:bg-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-md shadow-primary/10 hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FASTag Modal Form */}
      {isFastagModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/15 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-on-surface">Add FASTag Transaction</h3>
              <button 
                onClick={() => setIsFastagModalOpen(false)} 
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>
            <form onSubmit={handleFastagSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Transaction ID</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. FTG1002345"
                  className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:border-primary outline-none font-mono"
                  value={fastagForm.transactionId}
                  onChange={(e) => setFastagForm({ ...fastagForm, transactionId: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Amount (₹)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:border-primary outline-none"
                    value={fastagForm.amount}
                    onChange={(e) => setFastagForm({ ...fastagForm, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Status</label>
                  <select 
                    className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:border-primary outline-none"
                    value={fastagForm.status}
                    onChange={(e) => setFastagForm({ ...fastagForm, status: e.target.value })}
                  >
                    <option value="Debited">Debited</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Toll Plaza</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Khed Shivapur Plaza"
                  className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:border-primary outline-none"
                  value={fastagForm.tollPlaza}
                  onChange={(e) => setFastagForm({ ...fastagForm, tollPlaza: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Remaining Balance</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:border-primary outline-none"
                    value={fastagForm.balance}
                    onChange={(e) => setFastagForm({ ...fastagForm, balance: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Timestamp</label>
                  <input 
                    type="datetime-local" 
                    required
                    className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:border-primary outline-none"
                    value={fastagForm.timestamp}
                    onChange={(e) => setFastagForm({ ...fastagForm, timestamp: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsFastagModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant/20 rounded-xl text-sm font-semibold hover:bg-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-md shadow-primary/10 hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

function TabButton({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`pb-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${active ? "text-primary border-primary" : "text-on-surface-variant border-transparent hover:text-on-surface"}`}
    >
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
        {showAction && (
          <button className="bg-error text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-error/90 transition-colors active:scale-[0.98]">
            Renew Now
          </button>
        )}
      </div>
    </div>
  );
}
