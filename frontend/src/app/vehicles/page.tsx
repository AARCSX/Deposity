"use client";

import LayoutWrapper from "@/components/layout/LayoutWrapper";
import VehicleCard from "@/components/dashboard/VehicleCard";

const vehiclesData = [
  {
    plateNumber: "MH12AB1234",
    vehicleType: "Truck",
    status: "all-good" as const,
    driver: {
      name: "Rajesh Kumar",
      phone: "+91 98765 43210",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAM6UaUvN7X6syLgqiZ63hpuzb5UrKkYWEhKSRzCkx4cFSiGSdWp-BQC0xH3xe9IJZ3QYqmf7MhacYWYDYy0r9T_g9hqQX2HhK9S9e3SyWNc8JHWuWw8C0zPAfwUFJKdfPtZ6JHguHHm_zEnMi1CBuUSNlG5L1AMHvOc8C4Bd1ujCgpsuDLes5E1HzLs0Uvwk_P8bcCpBrJtNVGHcJAeQvPTtQ9bLJMazChiYm11WGZQxvkFN97GUU7wDJiqQUZ4yVSNYpMSzlbuDgG",
    },
    docs: {
      fit: "valid" as const,
      perm: "valid" as const,
      ins: "valid" as const,
      puc: "valid" as const,
    },
    gpsActive: true,
  },
  {
    plateNumber: "DL04CD5678",
    vehicleType: "Van",
    status: "expiring-soon" as const,
    driver: {
      name: "Amit Singh",
      phone: "+91 98765 43211",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCS5TmY1GQ9jgOPhMxCALVhtdaXQytXAFjHR4xRq2-c8_Ng2yVCyc5AVNdNZKUhtDIzW0wYsWEy2SPS5jtSUhUBoeKG7-XSWGg7FtXpOW-yK74QvdvekYcTxtqBC8bSrI8l1shV4MEI63adetcTqo_TRr6yMV7zVSTKPc4-ffXCEk2NZJfGyWUMYo3Z2foeSgbqPzidOaCIzLyVa9jw3v21N3Y0Eaz1Udm0-8tlwOqpA3t9zPR2dbRIcsYT2P-2E6Z1MIZB4U1CCepK",
    },
    docs: {
      fit: "valid" as const,
      perm: "expiring" as const,
      ins: "valid" as const,
      puc: "valid" as const,
    },
    gpsActive: false,
    emiDate: "15 Oct",
  },
  {
    plateNumber: "HR26EF9012",
    vehicleType: "Truck",
    status: "expired-docs" as const,
    driver: null,
    docs: {
      fit: "valid" as const,
      perm: "invalid" as const,
      ins: "valid" as const,
      puc: "invalid" as const,
    },
    gpsActive: false,
    locationState: "offline" as const,
  },
];

export default function VehiclesPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-[2.75rem] leading-none font-bold text-on-background tracking-[-0.02em] mb-2">Vehicles</h1>
            <p className="text-on-surface-variant font-medium">
              Manage your fleet of <span className="text-primary font-bold">25 Vehicles</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-[0.98]">
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
          {vehiclesData.map((vehicle) => (
            <VehicleCard key={vehicle.plateNumber} {...vehicle} />
          ))}
        </div>
        
        <div className="h-12"></div>
      </div>
    </LayoutWrapper>
  );
}
