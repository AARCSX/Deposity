"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MetricCard from "@/components/dashboard/MetricCard";
import TripCard from "@/components/dashboard/TripCard";
import CreateTripWizard from "@/components/trips/CreateTripWizard";
import RecordPaymentModal from "@/components/trips/RecordPaymentModal";
import { TripRecord } from "@/types/trip";
import { authenticatedFetch } from "@/lib/api";

const fallbackData: TripRecord[] = [];

function TripsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createParam = searchParams.get("create");
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<TripRecord | null>(null);
  
  const [selectedPaymentTrip, setSelectedPaymentTrip] = useState<TripRecord | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const ITEMS_PER_PAGE = 5;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("deposity_token");
      if (!token) {
        router.push("/");
      }
    }
  }, [router]);

  useEffect(() => {
    if (createParam === "true") {
      setIsCreateModalOpen(true);
    }
  }, [createParam]);

  const loadTrips = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch("/trips");
      if (!response.ok) throw new Error("API unreachable");
      const data = await response.json();
      setTrips(Array.isArray(data) ? data : []);
      setVisibleCount(ITEMS_PER_PAGE); // Reset pagination on refresh
    } catch {
      setTrips([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWizardSubmit = async (data: TripRecord) => {
    const isEdit = !!editingTrip;
    const url = isEdit ? `/trips/${editingTrip?.id}` : "/trips";
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await authenticatedFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        loadTrips(); // Refetch
        setIsCreateModalOpen(false);
        setEditingTrip(null);
      } else {
        const err = await response.json().catch(() => ({}));
        alert(`Failed to save trip: ${err.error || response.statusText}`);
      }
    } catch (e: any) {
      alert(`Network error saving trip: ${e.message}`);
    }
  };

  const handlePaymentSubmitted = async (updatedTrip: TripRecord) => {
    // Update local state immediately for instant feedback
    setTrips(prev => prev.map(t => (t.id === updatedTrip.id ? updatedTrip : t)));

    if (updatedTrip.id) {
      try {
        await authenticatedFetch(`/trips/${updatedTrip.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTrip),
        });
      } catch (err) {
        console.warn("Failed to persist payment to backend:", err);
      }
    }
  };

  // Helper to map robust data to the simpler TripCard props
  const mapToCardProps = (t: TripRecord) => {
    const total = t.financials.totalFreight || 0;
    const advance = t.financials.advancePaid || 0;
    const balanceNum = Math.max(0, total - advance);

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
        total: `₹${total.toLocaleString("en-IN")}`,
        advance: `₹${advance.toLocaleString("en-IN")}`,
        balance: `₹${balanceNum.toLocaleString("en-IN")}`,
        rawBalance: balanceNum,
      },
      payments: t.payments || [],
    };
  };

  // Compute dynamic metric values from the trips data
  const activeTrips = trips.filter(t => t.status === "in-transit").length;
  const pendingTrips = trips.filter(t => t.status === "pending").length;
  const totalRevenue = trips.reduce((sum, t) => sum + t.financials.totalFreight, 0);
  const pendingPayments = trips.reduce((sum, t) => sum + Math.max(0, t.financials.totalFreight - t.financials.advancePaid), 0);

  const formattedRevenue = totalRevenue >= 100000 
    ? `₹${(totalRevenue / 100000).toFixed(1)}L` 
    : totalRevenue >= 1000 
    ? `₹${(totalRevenue / 1000).toFixed(1)}k` 
    : `₹${totalRevenue}`;

  const formattedPending = pendingPayments >= 100000 
    ? `₹${(pendingPayments / 100000).toFixed(1)}L` 
    : pendingPayments >= 1000 
    ? `₹${(pendingPayments / 1000).toFixed(1)}k` 
    : `₹${pendingPayments}`;

  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState("ALL");

  // Extract unique vehicle numbers from current trips list
  const vehicleOptions = useMemo(() => {
    const set = new Set<string>();
    trips.forEach((t) => {
      if (t.assignment?.vehicleId) {
        set.add(t.assignment.vehicleId);
      }
    });
    return Array.from(set).sort();
  }, [trips]);

  // Filtered trips list based on selected vehicle
  const filteredTrips = useMemo(() => {
    if (selectedVehicleFilter === "ALL") return trips;
    return trips.filter((t) => t.assignment?.vehicleId === selectedVehicleFilter);
  }, [trips, selectedVehicleFilter]);

  const handleQuickStatusChange = async (tripId: string, newStatus: "pending" | "in-transit" | "delivered") => {
    const existing = trips.find((t) => t.id === tripId);
    if (!existing) return;

    const updatedTrip = { ...existing, status: newStatus };
    setTrips((prev) => prev.map((t) => (t.id === tripId ? updatedTrip : t)));

    try {
      await authenticatedFetch(`/trips/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTrip),
      });
    } catch (err) {
      console.warn("Failed to persist quick status update:", err);
    }
  };

  return (
    <>
      <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight">Trips Management</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Monitor <span className="font-bold text-on-surface">{trips.length} trips</span>, active routes, and financials.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Vehicle Filter Dropdown (Left side of New Trip button) */}
            <div className="flex items-center gap-2 bg-surface-container-high rounded-xl px-3.5 py-2.5 border border-outline-variant/15 text-xs font-bold shadow-xs">
              <span className="material-symbols-outlined text-[18px] text-primary">filter_alt</span>
              <span className="text-slate-500 hidden sm:inline">Vehicle:</span>
              <select
                value={selectedVehicleFilter}
                onChange={(e) => setSelectedVehicleFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-on-surface outline-none cursor-pointer"
              >
                <option value="ALL">All Vehicles ({trips.length})</option>
                {vehicleOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => {
                setEditingTrip(null);
                setIsCreateModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              New Trip
            </button>
            <div className="flex items-center bg-surface-container-high rounded-xl p-1 border border-outline-variant/10">
              <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-surface text-on-surface shadow-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span> List
              </button>
              <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span> Calendar
              </button>
              <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">map</span> Map
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard 
            label="Active Trips" 
            value={activeTrips.toString()} 
            icon="alt_route" 
            theme="secondary" 
          />
          <MetricCard 
            label="Pending Deliveries" 
            value={pendingTrips.toString()} 
            icon="inventory_2" 
            subtitle="Awaiting dispatch" 
            theme="warning" 
          />
          <MetricCard 
            label="Pending Payments" 
            value={formattedPending} 
            icon="payments" 
            theme="error" 
          />
          <MetricCard 
            label="Total Revenue" 
            value={formattedRevenue} 
            icon="account_balance_wallet" 
            theme="tertiary" 
          />
        </div>

        {/* Trip Cards Container */}
        <div className="flex flex-col gap-5">
          {isLoading ? (
            <div className="py-12 flex justify-center text-on-surface-variant font-medium">
              Loading trips...
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-outline-variant/20 bg-surface-container-lowest">
              <span className="material-symbols-outlined text-4xl text-outline mb-3">directions</span>
              <p className="text-sm font-semibold text-on-surface">No trips found</p>
              <p className="text-xs text-on-surface-variant mt-1 max-w-xs">
                {selectedVehicleFilter !== "ALL"
                  ? `No trips registered for vehicle ${selectedVehicleFilter}.`
                  : "Create your first trip by clicking the 'New Trip' button above."}
              </p>
            </div>
          ) : filteredTrips.slice(0, visibleCount).map((trip) => (
            <TripCard 
              key={trip.id || trip.route.originName} 
              {...mapToCardProps(trip)} 
              onUpdateStatus={() => {
                setEditingTrip(trip);
                setIsCreateModalOpen(true);
              }}
              onChangeStatus={(newStatus) => handleQuickStatusChange(trip.id, newStatus)}
              onRecordPayment={() => {
                setSelectedPaymentTrip(trip);
                setIsPaymentModalOpen(true);
              }}
            />
          ))}
        </div>

        {/* Load More — only show when there are more trips to load */}
        {filteredTrips.length > visibleCount && (
          <div className="py-8 text-center">
            <button 
              onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
              className="text-sm font-bold text-primary hover:text-primary-container transition-colors flex items-center justify-center gap-2 mx-auto group"
            >
              Load More Trips
              <span className="material-symbols-outlined group-hover:translate-y-0.5 transition-transform">expand_more</span>
            </button>
          </div>
        )}

        {/* Modals */}
        <CreateTripWizard 
          isOpen={isCreateModalOpen} 
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingTrip(null);
            router.replace("/trips");
          }} 
          onSubmit={handleWizardSubmit} 
          tripToEdit={editingTrip}
        />

        {selectedPaymentTrip && (
          <RecordPaymentModal
            trip={selectedPaymentTrip}
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              setSelectedPaymentTrip(null);
            }}
            onPaymentSubmitted={handlePaymentSubmitted}
          />
        )}
      </div>
    </>
  );
}

export default function TripsPage() {
  return (
    <Suspense fallback={<div className="py-12 flex justify-center text-on-surface-variant font-medium">Loading Trips component...</div>}>
      <TripsContent />
    </Suspense>
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
