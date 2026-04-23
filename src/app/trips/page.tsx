"use client";

import LayoutWrapper from "@/components/layout/LayoutWrapper";
import MetricCard from "@/components/dashboard/MetricCard";
import TripCard from "@/components/dashboard/TripCard";
import Link from "next/link";

const tripsData = [
  {
    id: "TRP-8924",
    status: "in-transit" as const,
    origin: { name: "Mumbai, MH", date: "12 Oct 2023, 08:00 AM" },
    destination: { name: "Delhi, DL", date: "15 Oct 2023", isEstimated: true },
    company: "ABC Logistics Ltd.",
    vehicle: "MH12 AB 1234",
    material: "15 MT Steel Coils",
    driver: {
      name: "Ramesh K.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDs8vYyaJRt3Ehc5U9tkxEe2f2cRwGnXFP-zUSS11H-wWFcjpuyUFPMCcS5saeF0FDVEASQBKoNfcCM-aHGja_scXSRDnZIbwZQ6eAOxVzd2rRWhzDXNICRMRuk6FL4M5jqyBhngdZru0sp7W1Vpi-wSHeQnWU8Vm_iJq8Hg-FeFQEWh1E3nHniHMQ8ByJMDbu-QZ7ibO02iV1JH2fxrPIHfDDedTa1Py-tp6MVpH9BgZubOeIcKAV4xajaE6O169gEAG3q9ZO0ddgE",
    },
    financials: { total: "₹45,000", advance: "₹20,000", balance: "₹25,000" },
  },
  {
    id: "TRP-8910",
    status: "delivered" as const,
    origin: { name: "Pune, MH", date: "10 Oct 2023" },
    destination: { name: "Surat, GJ", date: "11 Oct 2023" },
    company: "Global Transporters",
    vehicle: "GJ05 XX 9988",
    material: "10 MT Cotton",
    driver: { name: "Suresh P.", avatar: "" }, // Placeholder
    financials: { total: "₹22,000", advance: "₹17,000", balance: "₹5,000" },
  },
];

export default function TripsPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-[2.75rem] font-bold text-on-surface leading-tight tracking-[-0.02em]">Trips Management</h1>
            <p className="text-on-surface-variant mt-1 font-medium">Monitor active routes, pending deliveries, and financials.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/trips/new"
              className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Trip
            </Link>
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

        {/* Metric Stack */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            label="Active Trips" 
            value="142" 
            trend={{ value: "+12%", isUp: true }} 
            icon="route" 
            theme="primary" 
          />
          <MetricCard 
            label="Pending Deliveries" 
            value="28" 
            subtitle="Requires action soon" 
            icon="inventory_2" 
            theme="warning" 
          />
          <MetricCard 
            label="Pending Payments" 
            value="₹4,50k" 
            trend={{ value: "Overdue: ₹1.2L", isUp: false }} 
            icon="payments" 
            theme="error" 
          />
          <MetricCard 
            label="This Month Revenue" 
            value="₹32.4L" 
            subtitle="Projected: ₹45L" 
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
          {tripsData.map((trip) => (
            <TripCard key={trip.id} {...trip} />
          ))}
        </div>

        {/* Load More */}
        <div className="py-8 text-center">
          <button className="text-sm font-bold text-primary hover:text-primary-container transition-colors flex items-center justify-center gap-2 mx-auto group">
            Load More Trips
            <span className="material-symbols-outlined group-hover:translate-y-0.5 transition-transform">expand_more</span>
          </button>
        </div>
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
