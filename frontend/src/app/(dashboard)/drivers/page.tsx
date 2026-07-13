"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import DriverCard from "@/components/dashboard/DriverCard";
import CreateDriverWizard from "@/components/drivers/CreateDriverWizard";
import { authenticatedFetch } from "@/lib/api";

export default function DriversPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<any[]>([]);
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

  const loadDrivers = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch("/drivers");
      if (!response.ok) throw new Error("API unreachable");
      const data = await response.json();
      setDrivers(Array.isArray(data) ? data : []);
    } catch {
      setDrivers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleCreateSubmit = async (data: any) => {
    try {
      const response = await authenticatedFetch("/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        loadDrivers(); // Refetch
      } else {
        // Optimistic UI fallback
        setDrivers(prev => [...prev, { ...data, id: `D-${Math.floor(100 + Math.random() * 900)}` }]);
      }
    } catch {
      // Optimistic UI fallback
      setDrivers(prev => [...prev, { ...data, id: `D-${Math.floor(100 + Math.random() * 900)}` }]);
    }
    setIsCreateModalOpen(false);
  };

  // Metrics calculations
  const totalDrivers = drivers.length;
  const onDutyCount = useMemo(() => {
    return drivers.filter(d => d.status === "Active").length;
  }, [drivers]);

  const expiringLicensesCount = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return drivers.filter(d => {
      if (!d.licenseExpiry) return false;
      const expiry = new Date(d.licenseExpiry);
      return expiry >= today && expiry <= thirtyDaysFromNow;
    }).length;
  }, [drivers]);

  const compliancePercentage = useMemo(() => {
    if (drivers.length === 0) return 100;
    const compliant = drivers.filter(d => !d.isStatusWarning).length;
    return Math.round((compliant / drivers.length) * 100);
  }, [drivers]);

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div>
            <h2 className="text-[2.75rem] font-black text-on-surface leading-tight tracking-tight">Driver Fleet</h2>
            <p className="text-on-surface-variant font-medium mt-1">
              Managing {onDutyCount} Active Personnel
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high hover:bg-surface-container-highest transition-all rounded-full font-bold text-sm text-on-surface-variant active:scale-95">
              <span className="material-symbols-outlined text-lg">filter_list</span>
              Filters
            </button>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 duration-150 transition-all"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Register Driver
            </button>
          </div>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface-container-lowest p-5 rounded-full border border-outline-variant/10 shadow-sm flex flex-col items-center">
            <p className="text-[0.7rem] uppercase tracking-widest font-bold text-on-surface-variant">Total Drivers</p>
            <p className="text-3xl font-black mt-1 tabular-nums">{totalDrivers}</p>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-full border border-outline-variant/10 shadow-sm flex flex-col items-center">
            <p className="text-[0.7rem] uppercase tracking-widest font-bold text-tertiary">On Duty</p>
            <p className="text-3xl font-black mt-1 tabular-nums">{onDutyCount}</p>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-full border border-outline-variant/10 shadow-sm flex flex-col items-center">
            <p className="text-[0.7rem] uppercase tracking-widest font-bold text-error">Expiring Licenses</p>
            <p className="text-3xl font-black mt-1 tabular-nums">{expiringLicensesCount}</p>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-full border border-outline-variant/10 shadow-sm flex flex-col items-center">
            <p className="text-[0.7rem] uppercase tracking-widest font-bold text-primary">Fleet Compliance</p>
            <p className="text-3xl font-black mt-1 tabular-nums">{compliancePercentage}%</p>
          </div>
        </div>

        {/* Drivers Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-full py-12 flex justify-center text-on-surface-variant font-medium">
              Loading drivers...
            </div>
          ) : drivers.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-outline-variant/20 bg-surface-container-lowest">
              <span className="material-symbols-outlined text-4xl text-outline mb-3">badge</span>
              <p className="text-sm font-semibold text-on-surface">No drivers registered</p>
              <p className="text-xs text-on-surface-variant mt-1 max-w-xs">Register your first driver to begin assignment to vehicles and trips.</p>
            </div>
          ) : (
            drivers.map((driver) => (
              <DriverCard key={driver.phone} {...driver} />
            ))
          )}
        </div>

        {/* Modals */}
        <CreateDriverWizard
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      </div>
    </>
  );
}
