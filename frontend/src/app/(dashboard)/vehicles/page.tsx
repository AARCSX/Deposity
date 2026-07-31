"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import VehicleCard from "@/components/dashboard/VehicleCard";
import CreateVehicleWizard from "@/components/vehicles/CreateVehicleWizard";
import { VehicleRecord } from "@/types/vehicle";
import { authenticatedFetch } from "@/lib/api";

const fallbackData: VehicleRecord[] = [];

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleRecord | null>(null);

  // Active Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [driverFilter, setDriverFilter] = useState<"ALL" | "ASSIGNED" | "UNASSIGNED">("ALL");
  const [docsFilter, setDocsFilter] = useState<"ALL" | "EXPIRING_SOON" | "EXPIRED">("ALL");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("deposity_token");
      if (!token) {
        router.push("/");
      }
    }
  }, [router]);

  const loadVehicles = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await authenticatedFetch("/vehicles");
      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
      const data = await response.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setFetchError(err.message || "Failed to load vehicles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleWizardSubmit = async (data: VehicleRecord) => {
    const isEdit = !!editingVehicle;
    const url = isEdit ? `/vehicles/${editingVehicle?.id}` : "/vehicles";
    const method = isEdit ? "PUT" : "POST";
    
    const response = await authenticatedFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (response.ok) {
      loadVehicles(); // Refetch
      setIsCreateModalOpen(false);
      setEditingVehicle(null);
    } else {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Unknown server error");
    }
  };

  const handleVehicleDelete = async (vehicleId: string) => {
    if (!vehicleId) return;
    if (!confirm("Are you sure you want to delete this vehicle from your fleet?")) return;
    try {
      const response = await authenticatedFetch(`/vehicles/${vehicleId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        loadVehicles();
      } else {
        alert("Failed to delete vehicle");
      }
    } catch {
      alert("Network error while deleting vehicle");
    }
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const reg = (v.core?.registrationNumber || "").toLowerCase();
        const make = (v.core?.make || "").toLowerCase();
        const model = (v.core?.model || "").toLowerCase();
        const body = (v.core?.bodyType || "").toLowerCase();
        const driver = (v.ownership?.driverName || "").toLowerCase();
        const match = reg.includes(q) || make.includes(q) || model.includes(q) || body.includes(q) || driver.includes(q);
        if (!match) return false;
      }

      // 2. Driver Filter
      if (driverFilter === "ASSIGNED" && !v.ownership?.driverId) return false;
      if (driverFilter === "UNASSIGNED" && v.ownership?.driverId) return false;

      // 3. Docs Compliance Filter
      if (docsFilter !== "ALL") {
        const now = new Date();
        const thirtyDays = new Date();
        thirtyDays.setDate(now.getDate() + 30);

        const expDates = [
          v.compliance?.rcExpiry,
          v.compliance?.insuranceExpiry,
          v.compliance?.pucExpiry,
          v.compliance?.fitnessExpiry,
          v.compliance?.fastagExpiry,
        ].filter(Boolean).map((d) => new Date(d!));

        let hasExpired = expDates.some((d) => d < now);
        let hasExpiringSoon = expDates.some((d) => d >= now && d <= thirtyDays);

        if (docsFilter === "EXPIRED" && !hasExpired) return false;
        if (docsFilter === "EXPIRING_SOON" && !hasExpiringSoon && !hasExpired) return false;
      }

      return true;
    });
  }, [vehicles, searchQuery, driverFilter, docsFilter]);

  // Helper to map robust data to the simpler VehicleCard props
  const mapToCardProps = (v: VehicleRecord) => {
    // Real driver data returned by the backend LEFT JOIN
    const driverData = v.ownership.driverId && v.ownership.driverName ? {
      name: v.ownership.driverName,
      phone: v.ownership.driverPhone || "+91 99999 99999",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAM6UaUvN7X6syLgqiZ63hpuzb5UrKkYWEhKSRzCkx4cFSiGSdWp-BQC0xH3xe9IJZ3QYqmf7MhacYWYDYy0r9T_g9hqQX2HhK9S9e3SyWNc8JHWuWw8C0zPAfwUFJKdfPtZ6JHguHHm_zEnMi1CBuUSNlG5L1AMHvOc8C4Bd1ujCgpsuDLes5E1HzLs0Uvwk_P8bcCpBrJtNVGHcJAeQvPTtQ9bLJMazChiYm11WGZQxvkFN97GUU7wDJiqQUZ4yVSNYpMSzlbuDgG"
    } : null;

    return {
      id: v.id || "",
      plateNumber: v.core.registrationNumber || "UNKNOWN",
      vehicleType: v.core.bodyType || "Truck",
      driver: driverData,
      compliance: v.compliance,
      gpsActive: !!v.ownership.gpsDeviceId,
      onEdit: () => {
        setEditingVehicle(v);
        setIsCreateModalOpen(true);
      },
      onDelete: (id: string) => handleVehicleDelete(id),
    };
  };

  return (
    <>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-[2.75rem] leading-none font-bold text-on-background tracking-[-0.02em] mb-2">Vehicles</h1>
            <p className="text-on-surface-variant font-medium">
              Manage your fleet of <span className="text-primary font-bold">{vehicles.length} Vehicles</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setEditingVehicle(null);
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-[0.98] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[1.25rem]">add</span>
              Add Vehicle
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/15 flex flex-wrap gap-4 items-center justify-between shadow-[0px_20px_40px_rgba(23,28,31,0.06)]">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Driver Filter */}
            <div className="flex items-center gap-1.5 bg-surface-container-high px-3.5 py-2 rounded-xl text-xs font-bold text-on-surface-variant border border-outline-variant/10">
              <span className="material-symbols-outlined text-[16px] text-primary">badge</span>
              <select
                value={driverFilter}
                onChange={(e: any) => setDriverFilter(e.target.value)}
                className="bg-transparent outline-none font-bold cursor-pointer text-on-surface"
              >
                <option value="ALL">Driver: All</option>
                <option value="ASSIGNED">Driver: Assigned</option>
                <option value="UNASSIGNED">Driver: Unassigned</option>
              </select>
            </div>

            {/* Docs Compliance Filter */}
            <div className="flex items-center gap-1.5 bg-surface-container-high px-3.5 py-2 rounded-xl text-xs font-bold text-on-surface-variant border border-outline-variant/10">
              <span className="material-symbols-outlined text-[16px] text-amber-600">verified</span>
              <select
                value={docsFilter}
                onChange={(e: any) => setDocsFilter(e.target.value)}
                className="bg-transparent outline-none font-bold cursor-pointer text-on-surface"
              >
                <option value="ALL">Docs: All Statuses</option>
                <option value="EXPIRING_SOON">Docs: Expiring Soon (30 Days)</option>
                <option value="EXPIRED">Docs: Expired</option>
              </select>
            </div>
          </div>

          <div className="relative w-full md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[1.25rem]">
              search
            </span>
            <input
              className="w-full bg-surface border border-outline-variant/15 text-on-surface text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/50 font-medium"
              placeholder="Search registration, make, model..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-12 flex justify-center text-on-surface-variant font-medium">
              Loading vehicles...
            </div>
          ) : fetchError ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-error/30 bg-error/5">
              <span className="material-symbols-outlined text-4xl text-error mb-3">cloud_off</span>
              <p className="text-sm font-semibold text-error">{fetchError}</p>
              <p className="text-xs text-on-surface-variant mt-1 max-w-xs">Your session may have expired. Try refreshing.</p>
              <button
                onClick={loadVehicles}
                className="mt-4 px-5 py-2 bg-primary text-white rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Retry
              </button>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-outline-variant/20 bg-surface-container-lowest">
              <span className="material-symbols-outlined text-4xl text-outline mb-3">local_shipping</span>
              <p className="text-sm font-semibold text-on-surface">No vehicles match filter criteria</p>
              <p className="text-xs text-on-surface-variant mt-1 max-w-xs">Try adjusting your search query or filter options above.</p>
            </div>
          ) : filteredVehicles.map((vehicle, index) => (
            <VehicleCard key={vehicle.id || vehicle.core.registrationNumber || index} {...mapToCardProps(vehicle)} />
          ))}
        </div>
        
        <div className="h-12"></div>
        
        {/* Modals */}
        <CreateVehicleWizard 
          isOpen={isCreateModalOpen} 
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingVehicle(null);
          }} 
          onSubmit={handleWizardSubmit} 
          vehicleToEdit={editingVehicle}
        />
      </div>
    </>
  );
}
