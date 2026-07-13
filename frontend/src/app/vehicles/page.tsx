"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import VehicleCard from "@/components/dashboard/VehicleCard";
import CreateVehicleWizard from "@/components/vehicles/CreateVehicleWizard";
import { VehicleRecord } from "@/types/vehicle";
import { authenticatedFetch } from "@/lib/api";

const fallbackData: VehicleRecord[] = [
  {
    core: {
      registrationNumber: "MH12AB1234",
      make: "Tata",
      model: "Signa 4923",
      year: 2023,
      bodyType: "Truck",
      axleConfig: "10 Wheeler",
      tonnageCapacity: 25,
      fuelCapacity: 350,
      averageMileage: 4.5
    },
    compliance: {
      rcExpiry: "2028-10-12",
      insuranceExpiry: "2027-05-10",
      pucExpiry: "2026-12-01",
      fitnessExpiry: "2027-10-12",
      permitDetails: "National"
    },
    ownership: {
      ownershipType: "Own",
      driverId: "D-101",
      homeBranch: "Pune",
      gpsDeviceId: "GPS-9988"
    },
    maintenance: {
      currentOdometer: 145000,
      lastServicedDate: "2026-05-10"
    },
    status: "all-good"
  }
];

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
    try {
      const response = await authenticatedFetch("/vehicles");
      if (!response.ok) throw new Error("API unreachable");
      const data = await response.json();
      setVehicles(Array.isArray(data) && data.length > 0 ? data : fallbackData);
    } catch {
      // Fallback to mock data if API is unreachable for testing
      setVehicles(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleCreateSubmit = async (data: VehicleRecord) => {
    try {
      const response = await authenticatedFetch("/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        loadVehicles(); // Refetch
      } else {
        // Optimistic UI update for testing without backend
        setVehicles(prev => [data, ...prev]);
      }
    } catch {
      // Optimistic UI update for testing without backend
      setVehicles(prev => [data, ...prev]);
    }
    setIsCreateModalOpen(false);
  };

  // Helper to map robust data to the simpler VehicleCard props
  const mapToCardProps = (v: VehicleRecord) => {
    // Simple mock driver data since we only have driverId
    const driverMock = v.ownership.driverId ? {
      name: `Driver ${v.ownership.driverId}`,
      phone: "+91 99999 99999",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAM6UaUvN7X6syLgqiZ63hpuzb5UrKkYWEhKSRzCkx4cFSiGSdWp-BQC0xH3xe9IJZ3QYqmf7MhacYWYDYy0r9T_g9hqQX2HhK9S9e3SyWNc8JHWuWw8C0zPAfwUFJKdfPtZ6JHguHHm_zEnMi1CBuUSNlG5L1AMHvOc8C4Bd1ujCgpsuDLes5E1HzLs0Uvwk_P8bcCpBrJtNVGHcJAeQvPTtQ9bLJMazChiYm11WGZQxvkFN97GUU7wDJiqQUZ4yVSNYpMSzlbuDgG"
    } : null;

    return {
      plateNumber: v.core.registrationNumber || "UNKNOWN",
      vehicleType: v.core.bodyType || "Truck",
      status: v.status === "maintenance" ? "all-good" : v.status, 
      driver: driverMock,
      docs: {
        fit: "valid" as const,
        perm: "valid" as const,
        ins: "valid" as const,
        puc: "valid" as const
      },
      gpsActive: !!v.ownership.gpsDeviceId
    };
  };

  return (
    <LayoutWrapper>
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
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[1.25rem]">add</span>
              Add Vehicle
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/15 flex flex-wrap gap-4 items-center justify-between shadow-[0px_20px_40px_rgba(23,28,31,0.06)]">
          <div className="flex flex-wrap gap-2 items-center">
            <button className="flex items-center gap-2 bg-surface-container-high hover:bg-primary/10 text-on-surface-variant hover:text-primary px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-transparent">
              Status: All
              <span className="material-symbols-outlined text-[1.1rem]">expand_more</span>
            </button>
            <button className="flex items-center gap-2 bg-surface-container-high hover:bg-primary/10 text-on-surface-variant hover:text-primary px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-transparent">
              Docs: Expiring Soon
              <span className="material-symbols-outlined text-[1.1rem]">expand_more</span>
            </button>
            <button className="flex items-center gap-2 bg-surface-container-high hover:bg-primary/10 text-on-surface-variant hover:text-primary px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-transparent">
              Driver: Any
              <span className="material-symbols-outlined text-[1.1rem]">expand_more</span>
            </button>
          </div>
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[1.25rem]">
              search
            </span>
            <input
              className="w-full bg-surface border border-outline-variant/15 text-on-surface text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/50"
              placeholder="Find vehicle..."
              type="text"
            />
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-12 flex justify-center text-on-surface-variant font-medium">
              Loading vehicles...
            </div>
          ) : vehicles.map((vehicle, index) => (
            <VehicleCard key={vehicle.id || vehicle.core.registrationNumber || index} {...mapToCardProps(vehicle)} />
          ))}
        </div>
        
        <div className="h-12"></div>
        
        {/* Modals */}
        <CreateVehicleWizard 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          onSubmit={handleCreateSubmit} 
        />
      </div>
    </LayoutWrapper>
  );
}
