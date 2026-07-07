"use client";

import { useEffect, useMemo, useState } from "react";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import MetricCard from "@/components/dashboard/MetricCard";

interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  maintenanceType: string;
  maintenanceDate: string;
  odometerReading: number;
  serviceCenter: string;
  mechanic: string;
  cost: number;
  description: string;
  partsReplaced: string;
  nextServiceDate: string;
  nextServiceOdometer: number;
  status: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MaintenanceFormState {
  vehicleId: string;
  vehicleNumber: string;
  maintenanceType: string;
  maintenanceDate: string;
  odometerReading: string;
  serviceCenter: string;
  mechanic: string;
  cost: string;
  description: string;
  partsReplaced: string;
  nextServiceDate: string;
  nextServiceOdometer: string;
  status: string;
  notes: string;
}

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
    partsReplaced: "4 tyres",
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

const baseFormState: MaintenanceFormState = {
  vehicleId: "V-101",
  vehicleNumber: "MH12AB1234",
  maintenanceType: "Service",
  maintenanceDate: "2026-06-30",
  odometerReading: "12540",
  serviceCenter: "Metro Truck Service",
  mechanic: "Rahul Sharma",
  cost: "8600",
  description: "",
  partsReplaced: "",
  nextServiceDate: "2026-08-30",
  nextServiceOdometer: "14540",
  status: "Scheduled",
  notes: "",
};

function toFormState(record: MaintenanceRecord): MaintenanceFormState {
  return {
    vehicleId: record.vehicleId,
    vehicleNumber: record.vehicleNumber,
    maintenanceType: record.maintenanceType,
    maintenanceDate: record.maintenanceDate,
    odometerReading: String(record.odometerReading),
    serviceCenter: record.serviceCenter,
    mechanic: record.mechanic,
    cost: String(record.cost),
    description: record.description,
    partsReplaced: record.partsReplaced,
    nextServiceDate: record.nextServiceDate,
    nextServiceOdometer: String(record.nextServiceOdometer),
    status: record.status,
    notes: record.notes,
  };
}

function toRecordPayload(form: MaintenanceFormState, existingId?: string): MaintenanceRecord {
  return {
    id: existingId ?? "",
    vehicleId: form.vehicleId,
    vehicleNumber: form.vehicleNumber,
    maintenanceType: form.maintenanceType,
    maintenanceDate: form.maintenanceDate,
    odometerReading: Number(form.odometerReading),
    serviceCenter: form.serviceCenter,
    mechanic: form.mechanic,
    cost: Number(form.cost),
    description: form.description,
    partsReplaced: form.partsReplaced,
    nextServiceDate: form.nextServiceDate,
    nextServiceOdometer: Number(form.nextServiceOdometer),
    status: form.status,
    notes: form.notes,
  };
}

function parseDate(value: string) {
  if (!value) return new Date(0);
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

export default function MaintenanceDashboard() {
  const [records, setRecords] = useState<MaintenanceRecord[]>(fallbackRecords);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(fallbackRecords[0]);
  const [filters, setFilters] = useState({ vehicle: "", type: "", status: "", from: "", to: "" });
  const [formState, setFormState] = useState<MaintenanceFormState>(baseFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [submitState, setSubmitState] = useState<{ loading: boolean; error: string | null }>({ loading: false, error: null });
  const [refreshKey, setRefreshKey] = useState(0);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const response = await fetch(`${apiBase}/maintenance`);
        if (!response.ok) throw new Error("Unable to load maintenance records");
        const data = await response.json();
        setRecords(Array.isArray(data) ? data : fallbackRecords);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedRecord(data[0]);
        }
      } catch {
        setRecords(fallbackRecords);
        setSelectedRecord(fallbackRecords[0]);
      }
    };

    loadRecords();
  }, [apiBase, refreshKey]);

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
      { label: "Total Maintenance Records", value: String(records.length), icon: "receipt_long", theme: "primary" as const },
      { label: "Scheduled Maintenance", value: String(scheduled), icon: "event_available", theme: "secondary" as const },
      { label: "Completed Maintenance", value: String(completed), icon: "check_circle", theme: "tertiary" as const },
      { label: "Overdue Maintenance", value: String(overdue), icon: "warning", theme: "error" as const },
      { label: "Total Maintenance Cost", value: `₹${totalCost.toLocaleString()}`, icon: "payments", theme: "warning" as const },
    ];
  }, [records]);

  const upcomingItems = useMemo(() => {
    const today = new Date();
    const windowEnd = new Date();
    windowEnd.setDate(today.getDate() + 30);

    return records
      .filter((record) => record.nextServiceDate)
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitState({ loading: true, error: null });

    const validationErrors = [] as string[];
    if (!formState.vehicleNumber.trim()) validationErrors.push("Vehicle number is required");
    if (!formState.maintenanceType.trim()) validationErrors.push("Maintenance type is required");
    if (!formState.maintenanceDate) validationErrors.push("Maintenance date is required");
    if (!formState.serviceCenter.trim()) validationErrors.push("Service center is required");
    if (!formState.mechanic.trim()) validationErrors.push("Mechanic name is required");
    if (!formState.cost || Number(formState.cost) <= 0) validationErrors.push("Cost must be greater than zero");

    if (validationErrors.length > 0) {
      setSubmitState({ loading: false, error: validationErrors.join(" • ") });
      return;
    }

    const payload = toRecordPayload(formState, isEditing && selectedRecord ? selectedRecord.id : undefined);
    try {
      const method = isEditing ? "PATCH" : "POST";
      const response = await fetch(`${apiBase}/maintenance${isEditing && selectedRecord ? `/${selectedRecord.id}` : ""}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Unable to save maintenance record");
      const saved = await response.json();
      setSubmitState({ loading: false, error: null });
      setFormState(baseFormState);
      setIsEditing(false);
      setSelectedRecord(saved);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setSubmitState({ loading: false, error: error instanceof Error ? error.message : "Save failed" });
    }
  };

  const startEditing = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setFormState(toFormState(record));
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormState(baseFormState);
    setIsEditing(false);
  };

  return (
    <LayoutWrapper>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-[2.75rem] font-black tracking-[-0.02em] text-on-surface leading-tight">Vehicle Maintenance</h1>
            <p className="text-on-surface-variant font-medium">Track service tasks, upcoming due maintenance, and full repair histories.</p>
          </div>
          <button
            onClick={resetForm}
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
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-[0px_20px_40px_rgba(23,28,31,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-on-surface">{selectedRecord ? "Maintenance Details" : "No record selected"}</h3>
                  <p className="text-sm text-on-surface-variant">View the full maintenance record and edit it quickly.</p>
                </div>
                {selectedRecord && (
                  <button className="rounded-xl border border-primary/20 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/5" onClick={() => startEditing(selectedRecord)}>
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
                    <InfoItem label="Next Service" value={selectedRecord.nextServiceDate} />
                    <InfoItem label="Next Odometer" value={`${selectedRecord.nextServiceOdometer.toLocaleString()} km`} />
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

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-[0px_20px_40px_rgba(23,28,31,0.06)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black tracking-tight text-on-surface">Vehicle Maintenance History</h3>
                <p className="text-sm text-on-surface-variant">A complete timeline for the selected vehicle.</p>
              </div>
              {selectedRecord && <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{vehicleHistory.length} records</span>}
            </div>
            {selectedRecord ? (
              <div className="space-y-4">
                <div className="grid gap-3 rounded-2xl bg-surface-container-low p-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-outline">Total Cost</p>
                    <p className="text-lg font-semibold text-on-surface">₹{vehicleHistory.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-outline">Last Service</p>
                    <p className="text-lg font-semibold text-on-surface">{vehicleHistory[0]?.maintenanceDate || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-outline">Upcoming Service</p>
                    <p className="text-lg font-semibold text-on-surface">{vehicleHistory[0]?.nextServiceDate || "—"}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {vehicleHistory.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-outline-variant/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-on-surface">{item.maintenanceType}</p>
                          <p className="text-sm text-on-surface-variant">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-on-surface">{item.maintenanceDate}</p>
                          <p className="text-xs text-on-surface-variant">₹{item.cost.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : <div className="rounded-2xl border border-dashed border-outline-variant/20 p-6 text-sm text-on-surface-variant">Choose a maintenance record to view the vehicle timeline.</div>}
          </section>

          <section className="rounded-3xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-[0px_20px_40px_rgba(23,28,31,0.06)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black tracking-tight text-on-surface">{isEditing ? "Edit Maintenance Record" : "Add Maintenance Record"}</h3>
                <p className="text-sm text-on-surface-variant">Capture details that keep every vehicle compliant and service-ready.</p>
              </div>
            </div>
            {submitState.error && <div className="mb-4 rounded-2xl border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">{submitState.error}</div>}
            <MaintenanceForm formState={formState} isEditing={isEditing} onChange={setFormState} onSubmit={handleSubmit} loading={submitState.loading} />
          </section>
        </div>
      </div>
    </LayoutWrapper>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-container-low p-3">
      <p className="text-xs uppercase tracking-[0.3em] text-outline">{label}</p>
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

function MaintenanceForm({ formState, isEditing, onChange, onSubmit, loading }: { formState: MaintenanceFormState; isEditing: boolean; onChange: (value: MaintenanceFormState) => void; onSubmit: (event: React.FormEvent) => void; loading: boolean }) {
  const updateField = (field: keyof MaintenanceFormState, value: string) => {
    onChange({ ...formState, [field]: value });
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-on-surface-variant">
          Vehicle
          <input className="mt-1 w-full rounded-xl border border-outline-variant/20 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" value={formState.vehicleNumber} onChange={(event) => updateField("vehicleNumber", event.target.value)} required />
        </label>
        <label className="text-sm text-on-surface-variant">
          Vehicle ID
          <input className="mt-1 w-full rounded-xl border border-outline-variant/20 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" value={formState.vehicleId} onChange={(event) => updateField("vehicleId", event.target.value)} required />
        </label>
        <label className="text-sm text-on-surface-variant">
          Maintenance Type
          <select className="mt-1 w-full rounded-xl border border-outline-variant/20 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" value={formState.maintenanceType} onChange={(event) => updateField("maintenanceType", event.target.value)}>
            <option value="Service">Service</option>
            <option value="Inspection">Inspection</option>
            <option value="Tyre Replacement">Tyre Replacement</option>
            <option value="Repair">Repair</option>
          </select>
        </label>
        <label className="text-sm text-on-surface-variant">
          Maintenance Date
          <input type="date" className="mt-1 w-full rounded-xl border border-outline-variant/20 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" value={formState.maintenanceDate} onChange={(event) => updateField("maintenanceDate", event.target.value)} required />
        </label>
        <label className="text-sm text-on-surface-variant">
          Odometer Reading
          <input type="number" className="mt-1 w-full rounded-xl border border-outline-variant/20 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" value={formState.odometerReading} onChange={(event) => updateField("odometerReading", event.target.value)} required />
        </label>
        <label className="text-sm text-on-surface-variant">
          Service Center
          <input className="mt-1 w-full rounded-xl border border-outline-variant/20 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" value={formState.serviceCenter} onChange={(event) => updateField("serviceCenter", event.target.value)} required />
        </label>
        <label className="text-sm text-on-surface-variant">
          Mechanic Name
          <input className="mt-1 w-full rounded-xl border border-outline-variant/20 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" value={formState.mechanic} onChange={(event) => updateField("mechanic", event.target.value)} required />
        </label>
        <label className="text-sm text-on-surface-variant">
          Cost
          <input type="number" className="mt-1 w-full rounded-xl border border-outline-variant/20 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" value={formState.cost} onChange={(event) => updateField("cost", event.target.value)} required />
        </label>
        <label className="text-sm text-on-surface-variant md:col-span-2">
          Description
          <textarea className="mt-1 min-h-20 w-full rounded-xl border border-outline-variant/20 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" value={formState.description} onChange={(event) => updateField("description", event.target.value)} />
        </label>
        <label className="text-sm text-on-surface-variant md:col-span-2">
          Parts Replaced
          <input className="mt-1 w-full rounded-xl border border-outline-variant/20 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" value={formState.partsReplaced} onChange={(event) => updateField("partsReplaced", event.target.value)} />
        </label>
        <label className="text-sm text-on-surface-variant">
          Next Service Date
          <input type="date" className="mt-1 w-full rounded-xl border border-outline-variant/20 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" value={formState.nextServiceDate} onChange={(event) => updateField("nextServiceDate", event.target.value)} />
        </label>
        <label className="text-sm text-on-surface-variant">
          Next Service Odometer
          <input type="number" className="mt-1 w-full rounded-xl border border-outline-variant/20 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" value={formState.nextServiceOdometer} onChange={(event) => updateField("nextServiceOdometer", event.target.value)} />
        </label>
        <label className="text-sm text-on-surface-variant">
          Status
          <select className="mt-1 w-full rounded-xl border border-outline-variant/20 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" value={formState.status} onChange={(event) => updateField("status", event.target.value)}>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </label>
        <label className="text-sm text-on-surface-variant md:col-span-2">
          Notes
          <textarea className="mt-1 min-h-20 w-full rounded-xl border border-outline-variant/20 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" value={formState.notes} onChange={(event) => updateField("notes", event.target.value)} />
        </label>
      </div>
      <div className="flex gap-3">
        <button type="submit" className="rounded-xl bg-linear-to-br from-primary to-primary-container px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-[0.98]" disabled={loading}>
          {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Record"}
        </button>
        <button type="button" className="rounded-xl border border-outline-variant/20 px-4 py-2.5 text-sm font-semibold text-on-surface-variant" onClick={() => onChange(baseFormState)}>
          Reset
        </button>
      </div>
    </form>
  );
}
