"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CompanyCard from "@/components/dashboard/CompanyCard";
import MetricCard from "@/components/dashboard/MetricCard";
import CreateCompanyWizard from "@/components/companies/CreateCompanyWizard";
import { CompanyRecord } from "@/types/company";
import { TripRecord } from "@/types/trip";
import { authenticatedFetch } from "@/lib/api";

// Helper to format INR values
function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} Lakh`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
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

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resCompanies, resTrips] = await Promise.all([
        authenticatedFetch("/companies").catch(() => null),
        authenticatedFetch("/trips").catch(() => null),
      ]);

      const companyData: CompanyRecord[] = resCompanies && resCompanies.ok ? await resCompanies.json() : [];
      const tripData: TripRecord[] = resTrips && resTrips.ok ? await resTrips.json() : [];

      setTrips(Array.isArray(tripData) ? tripData : []);

      // Cross-reference companies with trips to ensure any company from trips is registered
      const companyMap = new Map<string, CompanyRecord>();

      (Array.isArray(companyData) ? companyData : []).forEach((c) => {
        companyMap.set(c.name.toLowerCase(), c);
      });

      // Auto-discover company names present in trips
      (Array.isArray(tripData) ? tripData : []).forEach((t) => {
        const compName = t.cargo?.company;
        if (compName && !companyMap.has(compName.toLowerCase())) {
          companyMap.set(compName.toLowerCase(), {
            id: `comp_${compName.toLowerCase().replace(/\s+/g, "_")}`,
            name: compName,
            status: "Active",
            location: "Pan India",
            contactPerson: "Operations Lead",
            phone: "+91 98765 43210",
            email: `contact@${compName.toLowerCase().replace(/\s+/g, "")}.com`,
            totalValue: 0,
            isPaid: true,
            pendingAmount: 0,
            industry: "Logistics & Freight",
          });
        }
      });

      setCompanies(Array.from(companyMap.values()));
    } catch {
      setCompanies([]);
      setTrips([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateSubmit = async (data: CompanyRecord) => {
    const payload = {
      ...data,
      email: data.email?.trim() || "",
      phone: data.phone?.trim() || "",
      contactPerson: data.contactPerson?.trim() || "",
      location: data.location?.trim() || "",
    };

    const response = await authenticatedFetch("/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      await loadData();
      setIsCreateModalOpen(false);
    } else {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to register company on backend server.");
    }
  };

  // Derive dynamic client financial metrics cross-referenced with Trips
  const enrichedCompanies = companies.map((c) => {
    const matchedTrips = trips.filter(
      (t) => t.cargo?.company?.toLowerCase() === c.name.toLowerCase()
    );

    let totalVal = c.totalValue || 0;
    let pendingAmt = c.pendingAmount || 0;

    if (matchedTrips.length > 0) {
      totalVal = matchedTrips.reduce((sum, t) => sum + (t.financials?.totalFreight || 0), 0);
      pendingAmt = matchedTrips.reduce(
        (sum, t) => sum + Math.max(0, (t.financials?.totalFreight || 0) - (t.financials?.advancePaid || 0)),
        0
      );
    }

    const isPaid = pendingAmt <= 0;
    const status = pendingAmt > 0 ? "Payment Overdue" : c.status || "Active Partner";

    return {
      ...c,
      totalValue: totalVal,
      pendingAmount: pendingAmt,
      isPaid,
      status,
      tripCount: matchedTrips.length,
    };
  });

  // Data-driven summary metrics across the ecosystem
  const totalClients = enrichedCompanies.length;
  const paidClients = enrichedCompanies.filter((c) => c.isPaid).length;
  const overdueClients = enrichedCompanies.filter((c) => c.pendingAmount > 0).length;
  const totalBusinessValue = enrichedCompanies.reduce((sum, c) => sum + c.totalValue, 0);
  const totalPending = enrichedCompanies.reduce((sum, c) => sum + c.pendingAmount, 0);

  // Map CompanyRecord to CompanyCard props
  const mapToCardProps = (c: typeof enrichedCompanies[0]) => ({
    id: c.id || "#ON-NEW",
    name: c.name,
    logo: c.logo || "",
    status: c.status,
    location: c.location,
    contactPerson: c.contactPerson,
    phone: c.phone,
    email: c.email,
    totalValue: formatINR(c.totalValue),
    isPaid: c.isPaid,
    pendingAmount: c.pendingAmount > 0 ? formatINR(c.pendingAmount) : undefined,
  });

  return (
    <>
      <div className="space-y-12 max-w-[1600px] mx-auto p-4 md:p-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-[2.75rem] font-black tracking-tighter text-on-surface leading-tight mb-2">Client Ecosystem</h2>
            <p className="text-on-surface-variant font-medium text-sm leading-relaxed">
              {enrichedCompanies.length > 0
                ? `Managing ${enrichedCompanies.length} client partnerships synced directly with live trip dispatches.`
                : "Start building your client network. Register your first company to get started."}
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">add_business</span>
            Add Company
          </button>
        </div>

        {/* Quick Metrics — 100% Synced with Trips & Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            label="Total Clients"
            value={String(totalClients)}
            icon="groups"
            theme="primary"
          />
          <MetricCard
            label="Paid Accounts"
            value={String(paidClients)}
            subtitle={totalClients > 0 ? `${((paidClients / totalClients) * 100).toFixed(0)}% fully settled` : "—"}
            icon="check_circle"
            theme="tertiary"
          />
          <MetricCard
            label="Revenue at Risk"
            value={formatINR(totalPending)}
            subtitle={overdueClients > 0 ? `${overdueClients} Pending Settlements` : "All clear"}
            icon="warning"
            theme="error"
          />
          <MetricCard
            label="Total Business Value"
            value={formatINR(totalBusinessValue)}
            icon="account_balance_wallet"
            theme="secondary"
          />
        </div>

        {/* Content Area — Loading / Empty / Grid */}
        {isLoading ? (
          <div className="py-16 flex justify-center text-on-surface-variant font-medium">
            Loading client ecosystem & trip history...
          </div>
        ) : enrichedCompanies.length === 0 ? (
          /* ── Empty State ── */
          <div className="py-20 flex flex-col items-center justify-center text-center rounded-3xl border-2 border-dashed border-outline-variant/20 bg-surface-container-lowest">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-4xl text-outline">domain_add</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">No companies registered yet</h3>
            <p className="text-sm text-on-surface-variant max-w-md mb-6">
              Register your first client or dispatch a trip to start tracking partnerships, contacts, and live financial health.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">add_business</span>
              Register First Client
            </button>
          </div>
        ) : (
          <>
            {/* Client Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {enrichedCompanies.map((company, i) => (
                <CompanyCard key={company.id || i} {...mapToCardProps(company)} />
              ))}

              {/* Quick-Add card at the end of the grid */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="rounded-xl border-2 border-dashed border-outline-variant/30 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center p-8 group min-h-[350px] cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors mb-4">
                  <span className="material-symbols-outlined text-3xl">add</span>
                </div>
                <span className="text-lg font-bold text-on-surface">Register New Client</span>
                <span className="text-xs text-on-surface-variant mt-1">Setup KYC &amp; Credit Terms</span>
              </button>
            </div>

            {/* Live Trip Transaction History Table */}
            <div className="mt-16 bg-surface-container-lowest rounded-[2rem] overflow-hidden border border-outline-variant/15 shadow-sm">
              <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Transaction &amp; Trip History Summary</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Live trip dispatches and freight transactions across all partner companies
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer">
                    <span className="material-symbols-outlined text-[16px]">filter_list</span> Filter
                  </button>
                  <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer">
                    <span className="material-symbols-outlined text-[16px]">download</span> Export CSV
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low/50 border-b border-slate-200/60">
                      <th className="px-8 py-4 text-[0.7rem] font-bold text-outline uppercase tracking-widest">Trip &amp; Client</th>
                      <th className="px-8 py-4 text-[0.7rem] font-bold text-outline uppercase tracking-widest">Route &amp; Schedule</th>
                      <th className="px-8 py-4 text-[0.7rem] font-bold text-outline uppercase tracking-widest">Trip Status</th>
                      <th className="px-8 py-4 text-[0.7rem] font-bold text-outline uppercase tracking-widest text-right">Freight Billed</th>
                      <th className="px-8 py-4 text-[0.7rem] font-bold text-outline uppercase tracking-widest text-right">Balance Pending</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {trips.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-10 text-center text-sm text-slate-500">
                          No active trip transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      trips.map((t, i) => {
                        const totalFreight = t.financials?.totalFreight || 0;
                        const advance = t.financials?.advancePaid || 0;
                        const pending = Math.max(0, totalFreight - advance);
                        const isSettled = pending <= 0;

                        return (
                          <tr key={t.id || i} className="hover:bg-primary/5 transition-colors group cursor-pointer">
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-on-surface">{t.cargo?.company || "General Client"}</p>
                                  <p className="text-xs text-on-surface-variant font-mono">{t.id || "TRP-NEW"} • {t.cargo?.material || "Cargo"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-4">
                              <p className="text-sm font-bold text-on-surface">{t.route?.originName} ➔ {t.route?.destinationName}</p>
                              <p className="text-xs text-on-surface-variant font-medium">{t.route?.originDate}</p>
                            </td>
                            <td className="px-8 py-4">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                                t.status === "delivered"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : t.status === "in-transit"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="px-8 py-4 text-right tabular-nums font-bold text-sm text-on-surface">
                              ₹{totalFreight.toLocaleString("en-IN")}
                            </td>
                            <td className="px-8 py-4 text-right tabular-nums font-bold text-sm">
                              {isSettled ? (
                                <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-md">Paid in Full</span>
                              ) : (
                                <span className="text-rose-600">₹{pending.toLocaleString("en-IN")}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="mt-auto py-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-xs text-on-surface-variant font-medium">© 2026 OnWay Depo. All rights reserved. Powered by AARCSX Deposity.</p>
          <div className="flex gap-6">
            <a className="text-xs text-outline hover:text-primary font-bold uppercase tracking-widest transition-colors" href="#">Privacy Policy</a>
            <a className="text-xs text-outline hover:text-primary font-bold uppercase tracking-widest transition-colors" href="#">Support Portal</a>
          </div>
        </footer>

        {/* Modals */}
        <CreateCompanyWizard
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      </div>
    </>
  );
}
