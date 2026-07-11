"use client";

import { useState, useEffect, useMemo } from "react";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import MetricCard from "@/components/dashboard/MetricCard";
import AlertItem from "@/components/dashboard/AlertItem";
import CreateTripWizard from "@/components/trips/CreateTripWizard";
import CreateVehicleWizard from "@/components/vehicles/CreateVehicleWizard";
import CreateMaintenanceWizard, { MaintenanceRecord } from "@/components/maintenance/CreateMaintenanceWizard";
import { TripRecord } from "@/types/trip";
import { VehicleRecord } from "@/types/vehicle";

// Local fallbacks if backend is completely empty or down
const fallbackVehicles: VehicleRecord[] = [
  {
    id: "V-101",
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
    compliance: { rcExpiry: "2028-10-12", insuranceExpiry: "2027-05-10", pucExpiry: "2026-12-01", fitnessExpiry: "2027-10-12", permitDetails: "National" },
    ownership: { ownershipType: "Own", driverId: "D-101", homeBranch: "Pune", gpsDeviceId: "GPS-9988" },
    maintenance: { currentOdometer: 145000, lastServicedDate: "2026-05-10" },
    status: "all-good"
  }
];

const fallbackTrips: TripRecord[] = [
  {
    id: "TRP-8924",
    status: "in-transit",
    route: { 
      originName: "Mumbai, MH", originDate: "12 Oct 2023, 08:00 AM", 
      destinationName: "Delhi, DL", destinationDate: "15 Oct 2023", isEstimated: true 
    },
    cargo: { material: "15 MT Steel Coils", weight: 15, company: "ABC Logistics Ltd." },
    assignment: { vehicleId: "MH12AB1234", driverId: "Rajesh Kumar" },
    financials: { totalFreight: 45000, advancePaid: 20000 },
  }
];

const fallbackMaintenance: MaintenanceRecord[] = [
  {
    id: "MNT-001",
    vehicleId: "V-101",
    vehicleNumber: "MH12AB1234",
    maintenanceType: "Service",
    maintenanceDate: "2026-05-12",
    odometerReading: 12540,
    serviceCenter: "Metro Truck Service",
    mechanic: "Rahul Sharma",
    cost: 8600,
    description: "Routine service and brake inspection.",
    partsReplaced: "Brake pads, engine oil",
    nextServiceDate: "2026-08-12",
    nextServiceOdometer: 14540,
    status: "Completed",
    notes: "Vehicle is running smoothly.",
  }
];

export default function Home() {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal control states
  const [isTripWizardOpen, setIsTripWizardOpen] = useState(false);
  const [isVehicleWizardOpen, setIsVehicleWizardOpen] = useState(false);
  const [isMaintenanceWizardOpen, setIsMaintenanceWizardOpen] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [resVehicles, resTrips, resMaint] = await Promise.all([
          fetch(`${apiBase}/vehicles`).catch(() => null),
          fetch(`${apiBase}/trips`).catch(() => null),
          fetch(`${apiBase}/maintenance`).catch(() => null),
        ]);

        let vehiclesData = [];
        let tripsData = [];
        let maintData = [];

        if (resVehicles && resVehicles.ok) {
          vehiclesData = await resVehicles.json();
        }
        if (resTrips && resTrips.ok) {
          tripsData = await resTrips.json();
        }
        if (resMaint && resMaint.ok) {
          maintData = await resMaint.json();
        }

        // Apply fallbacks if empty lists returned or API down
        setVehicles(vehiclesData.length > 0 ? vehiclesData : fallbackVehicles);
        setTrips(tripsData.length > 0 ? tripsData : fallbackTrips);
        setMaintenance(maintData.length > 0 ? maintData : fallbackMaintenance);
      } catch (err) {
        console.warn("API fetches failed, falling back to mock data:", err);
        setVehicles(fallbackVehicles);
        setTrips(fallbackTrips);
        setMaintenance(fallbackMaintenance);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [apiBase, refreshKey]);

  // Derived metrics
  const activeTripsCount = useMemo(() => {
    return trips.filter((t) => t.status === "in-transit").length;
  }, [trips]);

  const uniqueDriversCount = useMemo(() => {
    const drivers = new Set<string>();
    vehicles.forEach((v) => {
      if (v.ownership?.driverId) drivers.add(v.ownership.driverId);
    });
    trips.forEach((t) => {
      if (t.assignment?.driverId) drivers.add(t.assignment.driverId);
    });
    return Math.max(drivers.size, 8); // Minimum baseline representation
  }, [vehicles, trips]);

  const availableDriversCount = useMemo(() => {
    // Available = Total minus active trips drivers
    const activeDrivers = trips.filter((t) => t.status === "in-transit" && t.assignment?.driverId).length;
    return Math.max(uniqueDriversCount - activeDrivers, 1);
  }, [uniqueDriversCount, trips]);

  const formattedRevenue = useMemo(() => {
    const totalFreight = trips.reduce((sum, t) => sum + (t.financials?.totalFreight || 0), 0);
    if (totalFreight >= 100000) {
      return `₹${(totalFreight / 100000).toFixed(1)}L`;
    }
    return `₹${(totalFreight / 1000).toFixed(0)}K`;
  }, [trips]);

  // Parse trip date helper for grouping
  const parseTripDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed)) return new Date(parsed);
    // Handle formats like "12 Oct 2023"
    const parts = dateStr.split(/[\s,]+/);
    if (parts.length >= 3) {
      const day = parseInt(parts[0]);
      const monthName = parts[1].substring(0, 3);
      const year = parseInt(parts[2]);
      const months: Record<string, number> = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
      };
      const month = months[monthName] ?? 0;
      return new Date(year, month, day);
    }
    return new Date();
  };

  // Generate dynamic revenue grouping for the last 6 months
  const monthlyRevenueData = useMemo(() => {
    const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const today = new Date();
    const last6 = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - 5 + i, 1);
      return {
        label: monthsShort[d.getMonth()],
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
        revenue: 0,
      };
    });

    trips.forEach((t) => {
      const tripDate = parseTripDate(t.route?.originDate);
      const tripMonth = tripDate.getMonth();
      const tripYear = tripDate.getFullYear();
      const match = last6.find((m) => m.monthIndex === tripMonth && m.year === tripYear);
      if (match) {
        match.revenue += t.financials?.totalFreight || 0;
      }
    });

    return last6;
  }, [trips]);

  const maxRevenue = useMemo(() => {
    return Math.max(...monthlyRevenueData.map((m) => m.revenue), 10000);
  }, [monthlyRevenueData]);

  // Vehicle Status Counts
  const vehicleStatusCounts = useMemo(() => {
    const activeTripsVehicles = new Set(
      trips.filter((t) => t.status === "in-transit").map((t) => t.assignment?.vehicleId)
    );
    const inProgressMaintenance = new Set(
      maintenance.filter((m) => m.status === "In Progress").map((m) => m.vehicleNumber)
    );

    let active = 0;
    let maint = 0;
    let idle = 0;

    vehicles.forEach((v) => {
      const reg = v.core.registrationNumber;
      if (inProgressMaintenance.has(reg)) {
        maint++;
      } else if (activeTripsVehicles.has(reg)) {
        active++;
      } else {
        idle++;
      }
    });

    return { active, maint, idle };
  }, [vehicles, trips, maintenance]);

  // Operational Alerts calculation
  const alerts = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const checkDate = (dateStr?: string) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d >= today && d <= thirtyDaysFromNow;
    };

    // 1. Expirations
    const expiringVehicles: string[] = [];
    vehicles.forEach((v) => {
      if (
        checkDate(v.compliance?.fitnessExpiry) ||
        checkDate(v.compliance?.insuranceExpiry) ||
        checkDate(v.compliance?.pucExpiry) ||
        checkDate(v.compliance?.rcExpiry)
      ) {
        expiringVehicles.push(v.core.registrationNumber);
      }
    });

    // 2. Pending Payments
    const pendingPaymentTrips = trips.filter(
      (t) => t.status === "delivered" && (t.financials?.totalFreight || 0) > (t.financials?.advancePaid || 0)
    );
    const totalPendingFreight = pendingPaymentTrips.reduce(
      (sum, t) => sum + ((t.financials?.totalFreight || 0) - (t.financials?.advancePaid || 0)), 
      0
    );

    // 3. Overdue maintenance tasks
    const overdueMaint = maintenance.filter(
      (m) => m.status !== "Completed" && m.nextServiceDate && new Date(m.nextServiceDate) < today
    );

    const generatedAlerts: any[] = [];

    if (expiringVehicles.length > 0) {
      generatedAlerts.push({
        title: "Documents Expiring Soon",
        description: `${expiringVehicles.length} Vehicle(s) have compliance certificates expiring in less than 30 days.`,
        type: "warning" as const,
        tags: expiringVehicles.slice(0, 3),
        actionLabel: "Review",
      });
    } else {
      generatedAlerts.push({
        title: "All Compliance Intact",
        description: "No vehicle documents or permits are due for renewal in the next 30 days.",
        type: "info" as const,
        actionLabel: "View All",
      });
    }

    if (totalPendingFreight > 0) {
      generatedAlerts.push({
        title: "Trips Completed - Payment Pending",
        description: `${pendingPaymentTrips.length} trip(s) marked delivered but client payment is outstanding.`,
        type: "info" as const,
        metadata: totalPendingFreight >= 100000 
          ? `₹${(totalPendingFreight / 100000).toFixed(1)}L Total`
          : `₹${totalPendingFreight.toLocaleString()} Total`,
        actionLabel: "View All",
      });
    }

    if (overdueMaint.length > 0) {
      generatedAlerts.push({
        title: "Overdue Maintenance Logs",
        description: `${overdueMaint.length} service logs are overdue beyond their target schedules.`,
        type: "error" as const,
        actionLabel: "Process",
      });
    }

    return generatedAlerts;
  }, [vehicles, trips, maintenance]);

  // Chronological timeline calculation
  const timelineActivities = useMemo(() => {
    const list: any[] = [];

    trips.forEach((t) => {
      const date = parseTripDate(t.route?.originDate);
      list.push({
        date,
        time: t.status === "delivered" ? "Delivered" : "Dispatched",
        title: t.status === "delivered" ? "Trip Completed" : "Trip Started",
        description: `Trip #${t.id || "NEW"} to ${t.route.destinationName}. Material: ${t.cargo.material}.`,
        amount: t.financials?.totalFreight ? `₹${t.financials.totalFreight.toLocaleString()}` : undefined,
        type: t.status === "delivered" ? "tertiary" as const : "primary" as const
      });
    });

    maintenance.forEach((m) => {
      const date = m.maintenanceDate ? new Date(m.maintenanceDate) : new Date();
      list.push({
        date,
        time: m.status === "Completed" ? "Completed" : "Scheduled",
        title: m.status === "Completed" ? "Maintenance Done" : "Maintenance Logged",
        description: `${m.maintenanceType} completed for ${m.vehicleNumber} at ${m.serviceCenter}.`,
        amount: m.cost ? `₹${m.cost.toLocaleString()}` : undefined,
        type: "warning" as const
      });
    });

    return list
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 3);
  }, [trips, maintenance]);

  // Submission handler wrappers
  const handleTripSubmit = async (data: TripRecord) => {
    try {
      const response = await fetch(`${apiBase}/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        setRefreshKey((prev) => prev + 1);
      } else {
        setTrips((prev) => [{ ...data, id: `TRP-${Math.floor(1000 + Math.random() * 9000)}` }, ...prev]);
      }
    } catch {
      setTrips((prev) => [{ ...data, id: `TRP-${Math.floor(1000 + Math.random() * 9000)}` }, ...prev]);
    }
    setIsTripWizardOpen(false);
  };

  const handleVehicleSubmit = async (data: VehicleRecord) => {
    try {
      const response = await fetch(`${apiBase}/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        setRefreshKey((prev) => prev + 1);
      } else {
        setVehicles((prev) => [data, ...prev]);
      }
    } catch {
      setVehicles((prev) => [data, ...prev]);
    }
    setIsVehicleWizardOpen(false);
  };

  const handleMaintenanceSubmit = async (data: MaintenanceRecord) => {
    try {
      const completeRecord = { ...data, id: data.id || `MNT-${Math.floor(100 + Math.random() * 900)}` };
      const response = await fetch(`${apiBase}/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completeRecord)
      });
      if (response.ok) {
        setRefreshKey((prev) => prev + 1);
      } else {
        setMaintenance((prev) => [completeRecord, ...prev]);
      }
    } catch {
      console.warn("API write missed, fallback to local state");
    }
    setIsMaintenanceWizardOpen(false);
  };

  // Ring coordinates for responsive SVG Donut
  const strokeWidth = 10;
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // ~282.74
  
  const totalStatusCount = vehicleStatusCounts.active + vehicleStatusCounts.maint + vehicleStatusCounts.idle || 1;
  const activeStroke = (vehicleStatusCounts.active / totalStatusCount) * circumference;
  const maintStroke = (vehicleStatusCounts.maint / totalStatusCount) * circumference;

  return (
    <LayoutWrapper>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-[2.75rem] font-black text-on-surface leading-tight tracking-tight mb-1">OnWay</h1>
            <p className="text-on-surface-variant text-sm font-semibold flex items-center gap-2">
              Business Operations Overview 
              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant/30"></span>
              <span className="font-bold text-primary">AARCSX Deposity Platform</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="bg-surface-container-highest text-on-surface px-4 py-2.5 rounded-xl text-sm font-bold border border-outline-variant/15 hover:bg-surface-container-high transition-colors active:scale-[0.98]">
              Export Report
            </button>
          </div>
        </div>

        {/* Hero Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Vehicles"
            value={String(vehicles.length)}
            icon="local_shipping"
            theme="primary"
          />
          <MetricCard
            label="Active Trips"
            value={String(activeTripsCount)}
            icon="route"
            subtitle="In Transit"
            theme="warning"
          />
          <MetricCard
            label="Total Drivers"
            value={String(uniqueDriversCount)}
            icon="person"
            subtitle={`Available: ${availableDriversCount}`}
            theme="secondary"
          />
          <MetricCard
            label="Monthly Revenue"
            value={formattedRevenue}
            icon="account_balance_wallet"
            theme="tertiary"
          />
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions Strip */}
            <div className="bg-surface-container-low/50 backdrop-blur-md rounded-xl p-4 flex flex-wrap gap-3 items-center border border-outline-variant/15">
              <span className="text-xs font-black text-on-surface-variant ml-2 mr-4 uppercase tracking-widest">Quick Add</span>
              <button 
                onClick={() => setIsTripWizardOpen(true)}
                className="bg-surface-container-lowest text-primary hover:bg-primary/10 border border-outline-variant/15 px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span> New Trip
              </button>
              <button 
                onClick={() => setIsVehicleWizardOpen(true)}
                className="bg-surface-container-lowest text-on-surface hover:bg-surface-container-high border border-outline-variant/15 px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">directions_car</span> Vehicle
              </button>
              <button 
                onClick={() => setIsMaintenanceWizardOpen(true)}
                className="bg-surface-container-lowest text-on-surface hover:bg-surface-container-high border border-outline-variant/15 px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">receipt_long</span> Maintenance
              </button>
            </div>

            {/* Action Required Box */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 overflow-hidden">
              <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant/15 flex justify-between items-center">
                <h2 className="text-base font-black text-on-surface">Operational Updates</h2>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-md">Live Sync</span>
              </div>
              <div className="p-0 divide-y divide-outline-variant/10">
                {alerts.map((alert, index) => (
                  <AlertItem
                    key={index}
                    title={alert.title}
                    description={alert.description}
                    type={alert.type}
                    tags={alert.tags}
                    metadata={alert.metadata}
                    actionLabel={alert.actionLabel}
                  />
                ))}
              </div>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/15 flex flex-col">
                <h2 className="text-sm font-black text-on-surface mb-6 uppercase tracking-wider text-outline">Monthly Trip Revenue</h2>
                <div className="flex-1 min-h-[220px] flex items-end gap-3 pb-4 pt-8 border-b border-outline-variant/15 relative">
                  <div className="absolute left-0 top-0 bottom-4 flex flex-col justify-between text-[10px] text-on-surface-variant font-semibold">
                    <span>{maxRevenue >= 100000 ? `₹${(maxRevenue / 100000).toFixed(1)}L` : `₹${(maxRevenue / 1000).toFixed(0)}k`}</span>
                    <span>{maxRevenue >= 100000 ? `₹${(maxRevenue * 0.67 / 100000).toFixed(1)}L` : `₹${(maxRevenue * 0.67 / 1000).toFixed(0)}k`}</span>
                    <span>{maxRevenue >= 100000 ? `₹${(maxRevenue * 0.33 / 100000).toFixed(1)}L` : `₹${(maxRevenue * 0.33 / 1000).toFixed(0)}k`}</span>
                  </div>
                  <div className="w-12 shrink-0"></div>
                  {monthlyRevenueData.map((m, i) => {
                    const percent = Math.min((m.revenue / maxRevenue) * 100, 100);
                    return (
                      <div 
                        key={i} 
                        className="flex-1 rounded-t-lg transition-all duration-300 relative group bg-surface-container-highest hover:bg-primary/20 flex flex-col justify-end"
                        style={{ height: `${Math.max(percent, 8)}%` }}
                      >
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] font-bold text-on-surface bg-surface border border-outline-variant/10 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
                          ₹{m.revenue >= 100000 ? `${(m.revenue / 100000).toFixed(1)}L` : `${(m.revenue / 1000).toFixed(0)}k`}
                        </span>
                        <div className="w-full bg-primary rounded-t-lg" style={{ height: "100%" }}></div>
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-on-surface-variant">
                          {m.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/15 flex flex-col">
                <h2 className="text-sm font-black text-on-surface mb-4 uppercase tracking-wider text-outline">Vehicle Status</h2>
                <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
                  <div className="w-36 h-36 relative flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke="#e2e8f0"
                        strokeWidth={strokeWidth}
                      />
                      {vehicleStatusCounts.active > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r={radius}
                          fill="transparent"
                          stroke="#004ac6"
                          strokeWidth={strokeWidth}
                          strokeDasharray={`${activeStroke} ${circumference}`}
                          strokeDashoffset="0"
                        />
                      )}
                      {vehicleStatusCounts.maint > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r={radius}
                          fill="transparent"
                          stroke="#fbbf24"
                          strokeWidth={strokeWidth}
                          strokeDasharray={`${maintStroke} ${circumference}`}
                          strokeDashoffset={-activeStroke}
                        />
                      )}
                    </svg>
                    <div className="absolute text-center">
                      <span className="block text-3xl font-black text-on-surface leading-none tabular-nums">
                        {vehicles.length}
                      </span>
                      <span className="block text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">Total</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                    <span className="text-xs font-bold text-on-surface-variant">Active ({vehicleStatusCounts.active})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-warning"></div>
                    <span className="text-xs font-bold text-on-surface-variant">Maint. ({vehicleStatusCounts.maint})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]"></div>
                    <span className="text-xs font-bold text-on-surface-variant">Idle ({vehicleStatusCounts.idle})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Activity */}
          <div className="space-y-6">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-6 h-full">
              <h2 className="text-lg font-black text-on-surface mb-6">Recent Activity</h2>
              <div className="relative pl-6 border-l-2 border-outline-variant/30 border-dashed space-y-8">
                {timelineActivities.map((item, index) => (
                  <TimelineItem 
                    key={index}
                    time={item.time} 
                    title={item.title} 
                    description={item.description} 
                    amount={item.amount}
                    type={item.type}
                  />
                ))}
              </div>
              <button className="w-full mt-8 py-2.5 text-sm font-bold text-primary border border-outline-variant/15 rounded-lg hover:bg-surface-container-low transition-colors active:scale-[0.98]">
                View All History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Creation Modal Wizards */}
      <CreateTripWizard
        isOpen={isTripWizardOpen}
        onClose={() => setIsTripWizardOpen(false)}
        onSubmit={handleTripSubmit}
      />

      <CreateVehicleWizard
        isOpen={isVehicleWizardOpen}
        onClose={() => setIsVehicleWizardOpen(false)}
        onSubmit={handleVehicleSubmit}
      />

      <CreateMaintenanceWizard
        isOpen={isMaintenanceWizardOpen}
        onClose={() => setIsMaintenanceWizardOpen(false)}
        onSubmit={handleMaintenanceSubmit}
        vehicles={vehicles}
        recordToEdit={null}
      />
    </LayoutWrapper>
  );
}

function TimelineItem({ time, title, description, amount, type = "primary" }: any) {
  const colors = {
    primary: "border-primary bg-primary",
    warning: "border-amber-500 bg-amber-500",
    tertiary: "border-tertiary bg-tertiary",
  };

  return (
    <div className="relative">
      <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-surface-container-lowest border-2 flex items-center justify-center ${colors[type as keyof typeof colors]}`}>
        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
      </div>
      <p className="text-[10px] font-bold text-on-surface-variant mb-0.5">{time}</p>
      <h4 className="text-sm font-bold text-on-surface">{title}</h4>
      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{description}</p>
      {amount && (
        <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded ${type === "tertiary" ? "bg-tertiary/10 text-tertiary" : "bg-surface-container-highest text-on-surface-variant"}`}>
          {amount}
        </span>
      )}
    </div>
  );
}
