"use client";

import { useEffect, useMemo, useState } from "react";
import MetricCard from "@/components/dashboard/MetricCard";
import DynamicChassis, { AxleConfig } from "./DynamicChassis";
import TyreHistoryCard, { TyreActivity } from "./TyreHistoryCard";
import CreateMaintenanceWizard, { MaintenanceRecord } from "./CreateMaintenanceWizard";
import { VehicleRecord } from "@/types/vehicle";

const fallbackRecords: MaintenanceRecord[] = [
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
  },
  {
    id: "MNT-002",
    vehicleId: "V-102",
    vehicleNumber: "DL04CD5678",
    maintenanceType: "Tyre Replacement",
    maintenanceDate: "2026-06-18",
    odometerReading: 9860,
    serviceCenter: "Prime Fleet Garage",
    mechanic: "Aman Verma",
    cost: 24000,
    description: "Replaced all four tyres after uneven wear.",
    partsReplaced: "4 tyres, front axle-0-left, axle-0-right",
    nextServiceDate: "2026-09-18",
    nextServiceOdometer: 11860,
    status: "Scheduled",
    notes: "Awaiting delivery of tyres.",
  },
  {
    id: "MNT-003",
    vehicleId: "V-103",
    vehicleNumber: "HR26EF9012",
    maintenanceType: "Inspection",
    maintenanceDate: "2026-06-25",
    odometerReading: 14220,
    serviceCenter: "National Transit Hub",
    mechanic: "Sanjay Nair",
    cost: 5400,
    description: "Fitness and emission inspection.",
    partsReplaced: "None",
    nextServiceDate: "2026-06-30",
    nextServiceOdometer: 16220,
    status: "In Progress",
    notes: "Waiting for inspection clearance.",
  },
];

const fallbackVehicles: VehicleRecord[] = [
  {
    id: "V-101",
    core: {
      registrationNumber: "MH12AB1234",
      make: "Tata",
      model: "Signa 4923",
      year: 2022,
      bodyType: "Container",
      axleConfig: "1 1, 2 2, 2 2", // 10 Wheeler
      tonnageCapacity: 25,
      fuelCapacity: 300,
      averageMileage: 4.5
    },
    compliance: { rcExpiry: "", insuranceExpiry: "", pucExpiry: "", fitnessExpiry: "", permitDetails: "" },
    ownership: { ownershipType: "Own", driverId: "", homeBranch: "", gpsDeviceId: "" },
    maintenance: { currentOdometer: 12540, lastServicedDate: "2026-05-12" },
    status: "all-good"
  },
  {
    id: "V-102",
    core: {
      registrationNumber: "DL04CD5678",
      make: "Ashok Leyland",
      model: "U-Truck",
      year: 2021,
      bodyType: "Flatbed",
      axleConfig: "1 1, 2 2", // 6 Wheeler
      tonnageCapacity: 16,
      fuelCapacity: 200,
      averageMileage: 5.2
    },
    compliance: { rcExpiry: "", insuranceExpiry: "", pucExpiry: "", fitnessExpiry: "", permitDetails: "" },
    ownership: { ownershipType: "Own", driverId: "", homeBranch: "", gpsDeviceId: "" },
    maintenance: { currentOdometer: 9860, lastServicedDate: "2026-06-18" },
    status: "all-good"
  },
  {
    id: "V-103",
    core: {
      registrationNumber: "HR26EF9012",
      make: "BharatBenz",
      model: "PowerTruck",
      year: 2023,
      bodyType: "Reefer",
      axleConfig: "1 1, 1 1, 2 2, 2 2", // 12 Wheeler
      tonnageCapacity: 31,
      fuelCapacity: 350,
      averageMileage: 4.0
    },
    compliance: { rcExpiry: "", insuranceExpiry: "", pucExpiry: "", fitnessExpiry: "", permitDetails: "" },
    ownership: { ownershipType: "Own", driverId: "", homeBranch: "", gpsDeviceId: "" },
    maintenance: { currentOdometer: 14220, lastServicedDate: "2026-06-25" },
    status: "all-good"
  }
];

export function parseAxleConfig(configStr: string): AxleConfig[] {
  if (!configStr) return [{ left: 1, right: 1 }, { left: 2, right: 2 }, { left: 2, right: 2 }];
  
  const lower = configStr.toLowerCase().trim();
  
  // Helper to dynamically calculate axles for any wheel count
  const parseWheelCount = (w: number): AxleConfig[] => {
    if (w <= 2) return [{ left: 1, right: 1 }];
    if (w <= 4) return [{ left: 1, right: 1 }, { left: 1, right: 1 }];
    const target = w % 2 === 0 ? w : w + 1;
    const config: AxleConfig[] = [];
    if (target % 4 === 0) {
      config.push({ left: 1, right: 1 });
      config.push({ left: 1, right: 1 });
      const driveAxles = (target - 4) / 4;
      for (let i = 0; i < driveAxles; i++) {
        config.push({ left: 2, right: 2 });
      }
    } else {
      config.push({ left: 1, right: 1 });
      const driveAxles = (target - 2) / 4;
      for (let i = 0; i < driveAxles; i++) {
        config.push({ left: 2, right: 2 });
      }
    }
    return config;
  };

  // 1. Check for total wheel count mappings first to handle inputs like "10", "12", "6", "10 wheeler", "20 wheels", etc.
  const wheelOnlyMatch = lower.replace(/\s*wheelers?|\s*wheels?|\s*wheel/g, "").trim();
  const wheels = parseInt(wheelOnlyMatch);
  if (!isNaN(wheels) && /^\d+$/.test(wheelOnlyMatch)) {
    return parseWheelCount(wheels);
  }

  if (lower.includes("4x2") || lower.includes("6 wheeler")) {
    return [{ left: 1, right: 1 }, { left: 2, right: 2 }];
  }
  if (lower.includes("6x4") || lower.includes("6x2") || lower.includes("10 wheeler")) {
    return [{ left: 1, right: 1 }, { left: 2, right: 2 }, { left: 2, right: 2 }];
  }
  if (lower.includes("8x2") || lower.includes("8x4") || lower.includes("12 wheeler")) {
    return [{ left: 1, right: 1 }, { left: 1, right: 1 }, { left: 2, right: 2 }, { left: 2, right: 2 }];
  }

  // 2. Otherwise parse custom layouts like "1 1, 2 2, 2 2" or "1 1, 1 1, 2 2. 2 2"
  const segments = configStr.split(/[;,/\.\-]/);
  const parsed: AxleConfig[] = [];
  
  for (let seg of segments) {
    seg = seg.trim();
    if (!seg) continue;
    const numbers = seg.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      parsed.push({ left: parseInt(numbers[0]), right: parseInt(numbers[1]) });
    } else if (numbers && numbers.length === 1) {
      const val = parseInt(numbers[0]);
      if (val === 2) {
        parsed.push({ left: 1, right: 1 });
      } else if (val === 4) {
        parsed.push({ left: 2, right: 2 });
      } else {
        const left = Math.ceil(val / 2);
        const right = Math.floor(val / 2);
        parsed.push({ left, right });
      }
    }
  }
  
  if (parsed.length > 0) return parsed;
  
  return [{ left: 1, right: 1 }, { left: 2, right: 2 }, { left: 2, right: 2 }];
}

function isTyreMatch(record: MaintenanceRecord, tyreId: string): boolean {
  if (record.tyreId) {
    return record.tyreId === tyreId;
  }
  const text = `${record.maintenanceType} ${record.description} ${record.partsReplaced} ${record.notes}`.toLowerCase();
  if (text.includes(tyreId.toLowerCase())) return true;
  
  const parts = tyreId.split("-");
  const axleNum = parseInt(parts[1]) + 1; // 1-based index
  const side = parts[2]; // left or right
  const position = parts[3]; // inner or outer
  
  const hasAxle = text.includes(`axle ${axleNum}`) || text.includes(`axle-${axleNum}`) || (axleNum === 1 && text.includes("front")) || (axleNum > 1 && text.includes("rear"));
  const hasSide = text.includes(side);
  const hasPosition = !position || text.includes(position);
  
  if (hasAxle && hasSide && hasPosition) {
    return true;
  }
  
  if (record.maintenanceType.toLowerCase() === "tyre replacement" && !text.includes("axle")) {
    return true;
  }
  
  return false;
}

function parseDate(value: string) {
  if (!value) return new Date(0);
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

import { authenticatedFetch } from "@/lib/api";

export default function MaintenanceDashboard() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [filters, setFilters] = useState({ vehicle: "", type: "", status: "", from: "", to: "" });
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<MaintenanceRecord | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTyre, setSelectedTyre] = useState<string | null>(null);
  const [chassisVehicleNumber, setChassisVehicleNumber] = useState<string>("");

  const defaultAxleConfig: AxleConfig[] = [
    { left: 1, right: 1 },
    { left: 2, right: 2 },
    { left: 2, right: 2 }
  ];

  useEffect(() => {
    const loadData = async () => {
      // Load records
      try {
        const response = await authenticatedFetch("/maintenance");
        if (response.ok) {
          const data = await response.json();
          const recList = Array.isArray(data) ? data : [];
          setRecords(recList);
          if (recList.length > 0) {
            setSelectedRecord(recList[0]);
          } else {
            setSelectedRecord(null);
          }
        } else {
          setRecords([]);
          setSelectedRecord(null);
        }
      } catch {
        setRecords([]);
        setSelectedRecord(null);
      }

      // Load vehicles
      try {
        const response = await authenticatedFetch("/vehicles");
        if (response.ok) {
          const data = await response.json();
          setVehicles(Array.isArray(data) ? data : []);
        } else {
          setVehicles([]);
        }
      } catch {
        setVehicles([]);
      }
    };

    loadData();
  }, [refreshKey]);

  // Sync Chassis active vehicle with selected record
  useEffect(() => {
    if (selectedRecord) {
      setChassisVehicleNumber(selectedRecord.vehicleNumber);
    } else if (vehicles.length > 0 && !chassisVehicleNumber) {
      setChassisVehicleNumber(vehicles[0].core.registrationNumber);
    }
  }, [selectedRecord, vehicles]);

  // Calculate dynamic axle configuration for active chassis vehicle
  const currentAxleConfig = useMemo(() => {
    const targetVehicle = vehicles.find(
      (v) => v.core.registrationNumber.toLowerCase() === chassisVehicleNumber.toLowerCase()
    );
    if (targetVehicle && targetVehicle.core.axleConfig) {
      return parseAxleConfig(targetVehicle.core.axleConfig);
    }
    return defaultAxleConfig;
  }, [chassisVehicleNumber, vehicles]);

  // Dynamic tyre activity filtering based on selected vehicle + tyre
  const tyreActivities = useMemo<TyreActivity[]>(() => {
    if (!chassisVehicleNumber || !selectedTyre) return [];
    return records
      .filter((r) => r.vehicleNumber.toLowerCase() === chassisVehicleNumber.toLowerCase())
      .filter((r) => isTyreMatch(r, selectedTyre))
      .map((r) => ({
        id: r.id || "",
        date: r.maintenanceDate,
        type: r.maintenanceType,
        description: r.description || r.notes || "Routine maintenance",
        cost: r.cost,
        serviceCenter: r.serviceCenter,
        mechanic: r.mechanic,
      }));
  }, [records, chassisVehicleNumber, selectedTyre]);

  const filteredRecords = useMemo(() => {
    const items = records.filter((record) => {
      const matchesVehicle = !filters.vehicle || record.vehicleNumber.toLowerCase().includes(filters.vehicle.toLowerCase());
      const matchesType = !filters.type || record.maintenanceType.toLowerCase().includes(filters.type.toLowerCase());
      const matchesStatus = !filters.status || record.status.toLowerCase() === filters.status.toLowerCase();
      const fromDate = filters.from ? parseDate(filters.from) : null;
      const toDate = filters.to ? parseDate(filters.to) : null;
      const recordDate = parseDate(record.maintenanceDate);
      const matchesFrom = !fromDate || recordDate >= fromDate;
      const matchesTo = !toDate || recordDate <= toDate;
      return matchesVehicle && matchesType && matchesStatus && matchesFrom && matchesTo;
    });

    return [...items].sort((a, b) => parseDate(b.maintenanceDate).getTime() - parseDate(a.maintenanceDate).getTime());
  }, [filters, records]);

  const metrics = useMemo(() => {
    const scheduled = records.filter((record) => record.status === "Scheduled").length;
    const completed = records.filter((record) => record.status === "Completed").length;
    const overdue = records.filter((record) => {
      if (!record.nextServiceDate || record.status === "Completed") return false;
      return parseDate(record.nextServiceDate) < new Date();
    }).length;
    const totalCost = records.reduce((sum, item) => sum + item.cost, 0);

    return [
      { label: "Total Maintenance", value: String(records.length), icon: "receipt_long", theme: "primary" as const },
      { label: "Scheduled", value: String(scheduled), icon: "event_available", theme: "secondary" as const },
      { label: "Completed", value: String(completed), icon: "check_circle", theme: "tertiary" as const },
      { label: "Overdue", value: String(overdue), icon: "warning", theme: "error" as const },
      { label: "Total Expense", value: `₹${totalCost.toLocaleString()}`, icon: "payments", theme: "warning" as const },
    ];
  }, [records]);

  const upcomingItems = useMemo(() => {
    const today = new Date();
    const windowEnd = new Date();
    windowEnd.setDate(today.getDate() + 30);

    return records
      .filter((record) => record.nextServiceDate && record.status !== "Completed")
      .filter((record) => {
        const nextDate = parseDate(record.nextServiceDate);
        return nextDate >= today && nextDate <= windowEnd;
      })
      .sort((a, b) => parseDate(a.nextServiceDate).getTime() - parseDate(b.nextServiceDate).getTime())
      .slice(0, 5);
  }, [records]);

  const vehicleHistory = useMemo(() => {
    if (!selectedRecord) return [];
    return records
      .filter((record) => record.vehicleId === selectedRecord.vehicleId || record.vehicleNumber === selectedRecord.vehicleNumber)
      .sort((a, b) => parseDate(b.maintenanceDate).getTime() - parseDate(a.maintenanceDate).getTime());
  }, [records, selectedRecord]);

  const handleWizardSubmit = async (payload: MaintenanceRecord) => {
    const recordId = payload.id || `MNT-${Math.floor(100 + Math.random() * 900)}`;
    const completeRecord: MaintenanceRecord = {
      ...payload,
      id: recordId,
    };

    // Optimistic UI updates
    if (payload.id) {
      setRecords((prev) => prev.map((r) => (r.id === payload.id ? completeRecord : r)));
      setSelectedRecord(completeRecord);
    } else {
      setRecords((prev) => [completeRecord, ...prev]);
      setSelectedRecord(completeRecord);
    }

    try {
      const isEdit = !!payload.id;
      const method = isEdit ? "PATCH" : "POST";
      const response = await authenticatedFetch(`/maintenance${isEdit ? `/${payload.id}` : ""}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completeRecord),
      });

      if (!response.ok) throw new Error("Unable to save maintenance record");
      const saved = await response.json();
      setSelectedRecord(saved);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      console.warn("API save missed, running on local/mock state:", error);
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-[2.75rem] font-black tracking-[-0.02em] text-on-surface leading-tight">Vehicle Maintenance</h1>
            <p className="text-on-surface-variant font-medium">Track service tasks, upcoming due maintenance, and full repair histories.</p>
          </div>
          <button
            onClick={() => {
              setRecordToEdit(null);
              setIsWizardOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-br from-primary to-primary-container px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[1.1rem]">add_circle</span>
            Add Maintenance
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {metrics.map((card) => (
            <MetricCard key={card.label} {...card} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <section className="rounded-3xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-[0px_20px_40px_rgba(23,28,31,0.06)]">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight text-on-surface">Maintenance Dashboard</h2>
                <p className="text-sm text-on-surface-variant">Search, filter, and review the latest fleet maintenance activity.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <input
                  className="rounded-xl border border-outline-variant/20 bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Search vehicle"
                  value={filters.vehicle}
                  onChange={(event) => setFilters((current) => ({ ...current, vehicle: event.target.value }))}
                />
                <select
                  className="rounded-xl border border-outline-variant/20 bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                  value={filters.type}
                  onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}
                >
                  <option value="">All types</option>
                  <option value="Service">Service</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Tyre Replacement">Tyre Replacement</option>
                  <option value="Repair">Repair</option>
                </select>
                <select
                  className="rounded-xl border border-outline-variant/20 bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                  value={filters.status}
                  onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                >
                  <option value="">All statuses</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-3">
              <label className="text-sm text-on-surface-variant">
                From
                <input type="date" className="ml-2 rounded-lg border border-outline-variant/20 bg-surface px-2 py-1" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} />
              </label>
              <label className="text-sm text-on-surface-variant">
                To
                <input type="date" className="ml-2 rounded-lg border border-outline-variant/20 bg-surface px-2 py-1" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} />
              </label>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-outline-variant/20 rounded-2xl bg-surface-container-low/30">
                <span className="material-symbols-outlined text-5xl text-outline mb-2">search_off</span>
                <p className="text-sm font-bold text-on-surface">No records found matching filters</p>
                <p className="text-xs text-on-surface-variant mt-1">Try clearing filters or search parameters.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-outline-variant/10">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-surface-container-high">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Vehicle</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Type</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Date</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Status</th>
                      <th className="px-4 py-3 font-semibold text-on-surface-variant">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className={`cursor-pointer border-t border-outline-variant/10 transition-colors hover:bg-primary/5 ${selectedRecord?.id === record.id ? "bg-primary/10" : "bg-white"}`} onClick={() => setSelectedRecord(record)}>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-on-surface">{record.vehicleNumber}</div>
                          <div className="text-xs text-on-surface-variant">{record.serviceCenter}</div>
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">{record.maintenanceType}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{record.maintenanceDate}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[record.status as keyof typeof statusClasses] || statusClasses.Scheduled}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-on-surface">₹{record.cost.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-[0px_20px_40px_rgba(23,28,31,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-on-surface">{selectedRecord ? "Maintenance Details" : "No record selected"}</h3>
                  <p className="text-sm text-on-surface-variant">View the full maintenance record and edit it quickly.</p>
                </div>
                {selectedRecord && (
                  <button 
                    className="rounded-xl border border-primary/20 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/5" 
                    onClick={() => {
                      setRecordToEdit(selectedRecord);
                      setIsWizardOpen(true);
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>
              {selectedRecord ? (
                <div className="mt-4 space-y-4 text-sm text-on-surface-variant">
                  <div className="rounded-2xl bg-surface-container-low p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-outline">Vehicle</p>
                        <p className="text-lg font-semibold text-on-surface">{selectedRecord.vehicleNumber}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[selectedRecord.status as keyof typeof statusClasses] || statusClasses.Scheduled}`}>
                        {selectedRecord.status}
                      </span>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoItem label="Maintenance Type" value={selectedRecord.maintenanceType} />
                    <InfoItem label="Maintenance Date" value={selectedRecord.maintenanceDate} />
                    <InfoItem label="Odometer" value={`${selectedRecord.odometerReading.toLocaleString()} km`} />
                    <InfoItem label="Service Center" value={selectedRecord.serviceCenter} />
                    <InfoItem label="Mechanic" value={selectedRecord.mechanic} />
                    <InfoItem label="Cost" value={`₹${selectedRecord.cost.toLocaleString()}`} />
                    <InfoItem label="Next Service" value={selectedRecord.nextServiceDate || "—"} />
                    <InfoItem label="Next Odometer" value={selectedRecord.nextServiceOdometer ? `${selectedRecord.nextServiceOdometer.toLocaleString()} km` : "—"} />
                  </div>
                  <div className="rounded-2xl bg-surface-container-low p-4">
                    <p className="mb-2 text-xs uppercase tracking-[0.3em] text-outline">Description</p>
                    <p className="text-on-surface">{selectedRecord.description || "No description provided."}</p>
                  </div>
                  <div className="rounded-2xl bg-surface-container-low p-4">
                    <p className="mb-2 text-xs uppercase tracking-[0.3em] text-outline">Parts Replaced</p>
                    <p className="text-on-surface">{selectedRecord.partsReplaced || "None listed"}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-outline-variant/20 p-6 text-sm text-on-surface-variant">Select a maintenance record to inspect the full service details.</div>
              )}
            </div>

            <div className="rounded-3xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-[0px_20px_40px_rgba(23,28,31,0.06)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-on-surface">Upcoming Maintenance</h3>
                  <p className="text-sm text-on-surface-variant">Vehicles with service due in the next month.</p>
                </div>
              </div>
              <div className="space-y-3">
                {upcomingItems.length > 0 ? upcomingItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl bg-surface-container-low p-3">
                    <div>
                      <p className="font-semibold text-on-surface">{item.vehicleNumber}</p>
                      <p className="text-xs text-on-surface-variant">{item.maintenanceType} • {item.nextServiceDate}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Due Soon</span>
                  </div>
                )) : <p className="text-sm text-on-surface-variant">No upcoming work within the next 30 days.</p>}
              </div>
            </div>
          </section>
        </div>

        {/* Tyre & Chassis Tracker */}
        <section className="rounded-3xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-[0px_20px_40px_rgba(23,28,31,0.06)]">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black tracking-tight text-on-surface">Tyre & Chassis Tracker</h3>
              <p className="text-sm text-on-surface-variant">Interactive view of tyre wear and history for the selected vehicle.</p>
            </div>
            {vehicles.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-outline uppercase tracking-wider">Active Vehicle:</span>
                <select
                  className="rounded-xl border border-outline-variant/20 bg-surface px-3 py-2 text-sm outline-none focus:border-primary font-semibold text-on-surface min-w-[200px]"
                  value={chassisVehicleNumber}
                  onChange={(e) => {
                    setChassisVehicleNumber(e.target.value);
                    setSelectedTyre(null);
                  }}
                >
                  {vehicles.map((v) => (
                    <option key={v.core.registrationNumber} value={v.core.registrationNumber}>
                      {v.core.registrationNumber} ({v.core.make} {v.core.model})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[1fr_1.2fr]">
             <div className="bg-surface-container-low/30 rounded-2xl border border-outline-variant/10 flex items-center justify-center min-h-[300px]">
                <DynamicChassis 
                  axles={currentAxleConfig} 
                  selectedTyre={selectedTyre} 
                  onTyreClick={setSelectedTyre} 
                />
             </div>
             <div>
                {selectedTyre ? (
                  <TyreHistoryCard tyreId={selectedTyre} onClose={() => setSelectedTyre(null)} activities={tyreActivities} />
                ) : (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-outline-variant/20 bg-surface-container-lowest">
                     <span className="material-symbols-outlined text-4xl text-outline mb-2">touch_app</span>
                     <p className="text-sm font-semibold text-on-surface">Select a tyre to view history</p>
                     <p className="text-xs text-on-surface-variant mt-1 max-w-xs">Click on any tyre on the chassis diagram to see its specific maintenance logs, punctures, and replacement history.</p>
                  </div>
                )}
             </div>
          </div>
        </section>

        {/* Full Width Maintenance History */}
        <section className="rounded-3xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-[0px_20px_40px_rgba(23,28,31,0.06)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black tracking-tight text-on-surface">Vehicle Maintenance History</h3>
              <p className="text-sm text-on-surface-variant">A complete timeline for the selected vehicle.</p>
            </div>
            {selectedRecord && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                {vehicleHistory.length} records
              </span>
            )}
          </div>
          {selectedRecord ? (
            <div className="space-y-6">
              <div className="grid gap-4 rounded-2xl bg-surface-container-low p-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-outline font-bold">Total Cost</p>
                  <p className="text-xl font-semibold text-on-surface mt-1">₹{vehicleHistory.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-outline font-bold">Last Service</p>
                  <p className="text-xl font-semibold text-on-surface mt-1">{vehicleHistory[0]?.maintenanceDate || "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-outline font-bold">Upcoming Service</p>
                  <p className="text-xl font-semibold text-on-surface mt-1">{vehicleHistory[0]?.nextServiceDate || "—"}</p>
                </div>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {vehicleHistory.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-outline-variant/10 p-4 bg-white shadow-xs hover:border-primary/20 transition-all duration-200">
                    <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                      <div>
                        <p className="font-semibold text-on-surface text-base">{item.maintenanceType}</p>
                        <p className="text-sm text-on-surface-variant mt-1">{item.description}</p>
                        {item.partsReplaced && (
                          <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 bg-surface-container-low rounded-lg text-xs font-semibold text-outline">
                            <span className="material-symbols-outlined text-[14px]">settings</span>
                            <span>Parts: {item.partsReplaced}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <p className="text-sm font-semibold text-on-surface">{item.maintenanceDate}</p>
                        <p className="text-base text-primary font-black mt-1">₹{item.cost.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-outline-variant/20 p-6 text-sm text-on-surface-variant text-center">
              Choose a maintenance record to view the vehicle timeline.
            </div>
          )}
        </section>
      </div>

      <CreateMaintenanceWizard
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false);
          setRecordToEdit(null);
        }}
        onSubmit={handleWizardSubmit}
        vehicles={vehicles}
        recordToEdit={recordToEdit}
      />
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-container-low p-3">
      <p className="text-xs uppercase tracking-[0.3em] text-outline font-bold">{label}</p>
      <p className="mt-1 font-semibold text-on-surface">{value}</p>
    </div>
  );
}

const statusClasses = {
  Scheduled: "bg-amber-500/10 text-amber-700",
  "In Progress": "bg-primary/10 text-primary",
  Completed: "bg-tertiary/10 text-tertiary",
  Cancelled: "bg-error/10 text-error",
};
