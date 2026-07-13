"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import MetricCard from "@/components/dashboard/MetricCard";
import TripCard from "@/components/dashboard/TripCard";
import CreateTripWizard from "@/components/trips/CreateTripWizard";
import { TripRecord } from "@/types/trip";
import { authenticatedFetch } from "@/lib/api";

const fallbackData: TripRecord[] = [
  {
    id: "TRP-8924",
    status: "in-transit",
    route: { 
      originName: "Mumbai, MH", originDate: "12 Oct 2023, 08:00 AM", 
      destinationName: "Delhi, DL", destinationDate: "15 Oct 2023", isEstimated: true 
    },
    cargo: { material: "15 MT Steel Coils", weight: 15, company: "ABC Logistics Ltd." },
    assignment: { vehicleId: "MH12 AB 1234", driverId: "Ramesh K." },
    financials: { totalFreight: 45000, advancePaid: 20000 },
  },
  {
    id: "TRP-8910",
    status: "delivered",
    route: { 
      originName: "Pune, MH", originDate: "10 Oct 2023", 
      destinationName: "Surat, GJ", destinationDate: "11 Oct 2023", isEstimated: false 
    },
    cargo: { material: "10 MT Cotton", weight: 10, company: "Global Transporters" },
    assignment: { vehicleId: "GJ05 XX 9988", driverId: "Suresh P." },
    financials: { totalFreight: 22000, advancePaid: 17000 },
  },
];

export default function TripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<TripRecord[]>([]);
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

  const loadTrips = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch("/trips");
      if (!response.ok) throw new Error("API unreachable");
      const data = await response.json();
      setTrips(Array.isArray(data) && data.length > 0 ? data : fallbackData);
    } catch {
      // Fallback to mock data if API is unreachable for testing
      setTrips(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateSubmit = async (data: TripRecord) => {
    try {
      const response = await authenticatedFetch("/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        loadTrips(); // Refetch
      } else {
        // Optimistic UI update for testing
        const newTrip = { ...data, id: `TRP-${Math.floor(1000 + Math.random() * 9000)}` };
        setTrips(prev => [newTrip, ...prev]);
      }
    } catch {
      // Optimistic UI update for testing
      const newTrip = { ...data, id: `TRP-${Math.floor(1000 + Math.random() * 9000)}` };
      setTrips(prev => [newTrip, ...prev]);
    }
    setIsCreateModalOpen(false);
  };

  // Helper to map robust data to the simpler TripCard props
  const mapToCardProps = (t: TripRecord) => {
    return {
      id: t.id || "TRP-NEW",
      status: t.status,
      origin: { name: t.route.originName, date: t.route.originDate },
      destination: { name: t.route.destinationName, date: t.route.destinationDate, isEstimated: t.route.isEstimated },
      company: t.cargo.company,
      vehicle: t.assignment.vehicleId,
      material: t.cargo.material || `${t.cargo.weight} MT Cargo`,
      driver: {
        name: t.assignment.driverId || "Unassigned",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDs8vYyaJRt3Ehc5U9tkxEe2f2cRwGnXFP-zUSS11H-wWFcjpuyUFPMCcS5saeF0FDVEASQBKoNfcCM-aHGja_scXSRDnZIbwZQ6eAOxVzd2rRWhzDXNICRMRuk6FL4M5jqyBhngdZru0sp7W1Vpi-wSHeQnWU8Vm_iJq8Hg-FeFQEWh1E3nHniHMQ8ByJMDbu-QZ7ibO02iV1JH2fxrPIHfDDedTa1Py-tp6MVpH9BgZubOeIcKAV4xajaE6O169gEAG3q9ZO0ddgE",
      },
      financials: {
        total: `₹${t.financials.totalFreight.toLocaleString()}`,
        advance: `₹${t.financials.advancePaid.toLocaleString()}`,
        balance: `₹${(t.financials.totalFreight - t.financials.advancePaid).toLocaleString()}`,
      },
    };
  };

  // Compute dynamic metric values from the trips data
  const activeTrips = trips.filter(t => t.status === "in-transit").length;
  const pendingTrips = trips.filter(t => t.status === "pending").length;
  const totalRevenue = trips.reduce((sum, t) => sum + t.financials.totalFreight, 0);
  const pendingPayments = trips.reduce((sum, t) => sum + (t.financials.totalFreight - t.financials.advancePaid), 0);

  return (
    <LayoutWrapper>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-[2.75rem] font-bold text-on-surface leading-tight tracking-[-0.02em]">Trips Management</h1>
            <p className="text-on-surface-variant mt-1 font-medium">
              Monitor <span className="text-primary font-bold">{trips.length} trips</span>, active routes, and financials.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Trip
            </button>
            <div className="flex bg-surface-container-high rounded-xl p-1 shadow-sm">
              <button className="px-4 py-2 rounded-lg bg-surface-container-lowest text-primary font-bold shadow-sm flex items-center gap-2 text-sm transition-all">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>list</span>
                List
              </button>
              <button className="px-4 py-2 rounded-lg text-on-surface-variant hover:text-on-surface font-bold flex items-center gap-2 text-sm transition-colors">
                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                Calendar
              </button>
              <button className="px-4 py-2 rounded-lg text-on-surface-variant hover:text-on-surface font-bold flex items-center gap-2 text-sm transition-colors">
                <span className="material-symbols-outlined text-[20px]">map</span>
                Map
              </button>
            </div>
          </div>
        </div>

        {/* Metric Stack — now driven by actual data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            label="Active Trips" 
            value={String(activeTrips)} 
            icon="route" 
            theme="primary" 
          />
          <MetricCard 
            label="Pending Deliveries" 
            value={String(pendingTrips)} 
            subtitle="Awaiting dispatch" 
            icon="inventory_2" 
            theme="warning" 
          />
          <MetricCard 
            label="Pending Payments" 
            value={`₹${(pendingPayments / 1000).toFixed(1)}k`} 
            icon="payments" 
            theme="error" 
          />
          <MetricCard 
            label="Total Revenue" 
            value={`₹${(totalRevenue / 100000).toFixed(1)}L`} 
            icon="account_balance_wallet" 
            theme="tertiary" 
          />
        </div>

        {/* Filters Area */}
        <div className="flex flex-wrap items-center gap-3 bg-surface-container-low/30 p-2 rounded-2xl border border-outline-variant/10">
          <span className="text-sm font-bold text-on-surface-variant ml-2 flex items-center gap-1.5 uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">filter_list</span> Filters
          </span>
          <div className="flex flex-wrap gap-2">
            <FilterButton label="Status" value="All" active />
            <FilterButton label="Payment" value="Pending" />
            <FilterButton label="Date" value="Last 30 Days" />
            <FilterButton label="Company" value="Any" />
          </div>
        </div>

        {/* Trip Cards Container */}
        <div className="flex flex-col gap-5">
          {isLoading ? (
            <div className="py-12 flex justify-center text-on-surface-variant font-medium">
              Loading trips...
            </div>
          ) : trips.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-outline-variant/20 bg-surface-container-lowest">
              <span className="material-symbols-outlined text-4xl text-outline mb-3">directions</span>
              <p className="text-sm font-semibold text-on-surface">No trips found</p>
              <p className="text-xs text-on-surface-variant mt-1 max-w-xs">Create your first trip by clicking the &quot;New Trip&quot; button above.</p>
            </div>
          ) : trips.map((trip) => (
            <TripCard key={trip.id || trip.route.originName} {...mapToCardProps(trip)} />
          ))}
        </div>

        {/* Load More — only show when there are trips */}
        {trips.length > 0 && (
          <div className="py-8 text-center">
            <button className="text-sm font-bold text-primary hover:text-primary-container transition-colors flex items-center justify-center gap-2 mx-auto group">
              Load More Trips
              <span className="material-symbols-outlined group-hover:translate-y-0.5 transition-transform">expand_more</span>
            </button>
          </div>
        )}

        {/* Modals */}
        <CreateTripWizard 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          onSubmit={handleCreateSubmit} 
        />
      </div>
    </LayoutWrapper>
  );
}

function FilterButton({ label, value, active }: { label: string; value: string; active?: boolean }) {
  return (
    <button className={`px-4 py-2 rounded-full border text-sm font-bold transition-all flex items-center gap-2 ${active ? "bg-primary/10 border-primary text-primary" : "bg-surface-container-lowest border-outline-variant/15 text-on-surface hover:border-primary/50"}`}>
      {label}: <span className={active ? "text-primary" : "text-on-surface-variant"}>{value}</span>
      <span className="material-symbols-outlined text-[16px]">expand_more</span>
    </button>
  );
}
