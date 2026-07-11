"use client";

import { useState, useEffect } from "react";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import CompanyCard from "@/components/dashboard/CompanyCard";
import MetricCard from "@/components/dashboard/MetricCard";
import CreateCompanyWizard from "@/components/companies/CreateCompanyWizard";
import { CompanyRecord } from "@/types/company";

const fallbackData: CompanyRecord[] = [
  {
    id: "#ON-9921",
    name: "Reliance Retail Ltd.",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPk9M_HfORkYCVfbhxTZVqKGhxznHfh81J-CU11ZtCfbnyb6H3CWHF5H55wPtTHQwOCCoedssr6cblcwBEhU-MGixMurHPq_YDJWVXwOgf09m_edi-iNry18OKaZcHlsore9I11Kv85Yj0zv4dzDH-IXFXo3UZwm4mQhFnG3iFbbFpch-kzUIrapr_AHeC_HqJXZeeSLKVaTlHCzwRqQUoFJcrhklvZ_BCjpHmBDHYCOEVzdxDaHsjRQ-AfIH6K_J6_h6RJviktNRX",
    status: "Premium Partner",
    location: "Mumbai HQ • Supply Chain Division",
    contactPerson: "Rajesh Deshmukh",
    phone: "+91 98210 55432",
    email: "r.deshmukh@reliance.com",
    totalValue: 24500000,
    isPaid: true,
    pendingAmount: 0,
    industry: "Retail & FMCG",
  },
  {
    id: "#ON-8742",
    name: "Tata Motors Mfg.",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyGwCdXeGhok9umHTHSUgGEc3i0Ezxkzgf3sQYr9gGq3sQuCdnhVnZfP3SCqPRkR1Higi_B-G-Tmm00KvdzGrWXQzTtlMbKBmUksuVDnHObI6EFVW19TFxy2Pe-oRqS4-AneRZwj2-XqcC2njBXyvYjYnUeUXniYSgXGU-VIl5YzkAXxAcCcSs3X0tsSbBZJpCNRMgHPpQVDb7bRxHHKmDuGH3zNDSikRipCWO8QeEKXHm1lQ3iYVDwzRwgYS0daBtqIb5SDwyxYUF",
    status: "Critical: Payment Overdue",
    location: "Pune Plant • Chassis Logistics",
    contactPerson: "Sneha Patil",
    phone: "+91 70451 22987",
    totalValue: 11200000,
    isPaid: false,
    pendingAmount: 1840000,
    industry: "Automotive",
  },
  {
    id: "#ON-1025",
    name: "Flipkart Internet",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtZG39AaQmIgBZtUTz3_ohMmvMOYvcqvowWU4-TuXqloslHgRddquYWWMFCMfZmDcQuefPLBHOzfZO_of6pkiazURFzyVcEtcTbtXPbR_Kdp7W4201ry506RruQm4ygOY1mYDDogBOTQEUQq9VWJOZ4wyzg4khGmwfucwlBOkJRp-6R_bl6h3X8ldmofXdZdzLstk1KP1vqeI5Mnj5SuM2VgYJi02T89xf4kedQN2ALFXMSuShf1DsUynTokcGbkUbX1nvBvbZTs17",
    status: "Standard Account",
    location: "Bangalore • Last Mile Operations",
    contactPerson: "Amit Verma",
    phone: "+91 88001 44556",
    totalValue: 8250000,
    isPaid: true,
    pendingAmount: 0,
    industry: "E-Commerce",
  },
  {
    id: "#ON-7731",
    name: "Mahindra Logistics",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYAghnZU_e-wxziCVHvBdQAUE557fgQt9TXw6SVXBf4iQALfW1ZQZHnws7OzY3Ho-pLAYggonqwJL41ULU4J-E2i-2EQRx-2qRwTgfMveHmPYBjuZOcGb5uQb7ygLn2s3L8u-ZNA7_FWlJVkzXiY0z88AuVMEnhIYv5ceKNrSY7nSJUcv78ERTeiFz21RDQ7imjgE1pOau_T2v8OanC-611bWvwJBYj0pCgDSctmEoJ2xmddm02wDuj1u__R-MB_d-VU7ybB1CWBv0",
    status: "Overdue",
    location: "Gurgaon Hub • Warehousing",
    contactPerson: "Karan Singh",
    phone: "+91 88001 44556",
    email: "k.singh@mahindra.com",
    totalValue: 5420000,
    isPaid: false,
    pendingAmount: 450000,
    industry: "Logistics",
  },
];

// Helper to format INR values
function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} Lakh`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return `₹${value.toLocaleString()}`;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiBase}/companies`);
      if (!response.ok) throw new Error("API unreachable");
      const data = await response.json();
      setCompanies(Array.isArray(data) && data.length > 0 ? data : fallbackData);
    } catch {
      setCompanies(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase]);

  const handleCreateSubmit = async (data: CompanyRecord) => {
    try {
      const response = await fetch(`${apiBase}/companies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        loadCompanies();
      } else {
        const newCompany = { ...data, id: `#ON-${Math.floor(1000 + Math.random() * 9000)}` };
        setCompanies((prev) => [newCompany, ...prev]);
      }
    } catch {
      const newCompany = { ...data, id: `#ON-${Math.floor(1000 + Math.random() * 9000)}` };
      setCompanies((prev) => [newCompany, ...prev]);
    }
    setIsCreateModalOpen(false);
  };

  // Map CompanyRecord to the props the existing CompanyCard expects
  const mapToCardProps = (c: CompanyRecord) => ({
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

  // Data-driven metrics
  const totalClients = companies.length;
  const paidClients = companies.filter((c) => c.isPaid).length;
  const overdueClients = companies.filter((c) => c.status.includes("Overdue")).length;
  const totalBusinessValue = companies.reduce((sum, c) => sum + c.totalValue, 0);
  const totalPending = companies.reduce((sum, c) => sum + c.pendingAmount, 0);

  return (
    <LayoutWrapper>
      <div className="space-y-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-[2.75rem] font-black tracking-tighter text-on-surface leading-tight mb-2">Client Ecosystem</h2>
            <p className="text-on-surface-variant font-medium text-sm leading-relaxed">
              {companies.length > 0
                ? `Managing ${companies.length} high-value partnerships across the pan-Indian supply chain.`
                : "Start building your client network. Register your first company to get started."}
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] transition-all active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-lg">add_business</span>
            Add Company
          </button>
        </div>

        {/* Quick Metrics */}
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
            subtitle={totalClients > 0 ? `${((paidClients / totalClients) * 100).toFixed(0)}% of all clients` : "—"}
            icon="check_circle"
            theme="tertiary"
          />
          <MetricCard
            label="Revenue at Risk"
            value={formatINR(totalPending)}
            subtitle={overdueClients > 0 ? `${overdueClients} Overdue` : "All clear"}
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
            Loading clients...
          </div>
        ) : companies.length === 0 ? (
          /* ── Empty State ── */
          <div className="py-20 flex flex-col items-center justify-center text-center rounded-3xl border-2 border-dashed border-outline-variant/20 bg-surface-container-lowest">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-4xl text-outline">domain_add</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">No companies registered yet</h3>
            <p className="text-sm text-on-surface-variant max-w-md mb-6">
              Register your first client to start tracking partnerships, contacts, and financial health across your supply chain.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">add_business</span>
              Register First Client
            </button>
          </div>
        ) : (
          <>
            {/* Client Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {companies.map((company, i) => (
                <CompanyCard key={company.id || i} {...mapToCardProps(company)} />
              ))}

              {/* Quick-Add card at the end of the grid */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="rounded-xl border-2 border-dashed border-outline-variant/30 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center p-8 group min-h-[350px]"
              >
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors mb-4">
                  <span className="material-symbols-outlined text-3xl">add</span>
                </div>
                <span className="text-lg font-bold text-on-surface">Register New Client</span>
                <span className="text-xs text-on-surface-variant mt-1">Setup KYC &amp; Credit Terms</span>
              </button>
            </div>

            {/* Transaction Summary Table — data-driven */}
            <div className="mt-16 bg-surface-container-lowest rounded-[2rem] overflow-hidden border border-outline-variant/15 shadow-sm">
              <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between">
                <h3 className="font-bold text-lg">Transaction History Summary</h3>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-surface-container rounded-lg transition-colors">
                    <span className="material-symbols-outlined">filter_list</span>
                  </button>
                  <button className="p-2 hover:bg-surface-container rounded-lg transition-colors">
                    <span className="material-symbols-outlined">download</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low/50">
                      <th className="px-8 py-4 text-[0.7rem] font-bold text-outline uppercase tracking-widest">Company</th>
                      <th className="px-8 py-4 text-[0.7rem] font-bold text-outline uppercase tracking-widest">Primary Contact</th>
                      <th className="px-8 py-4 text-[0.7rem] font-bold text-outline uppercase tracking-widest">Financial Health</th>
                      <th className="px-8 py-4 text-[0.7rem] font-bold text-outline uppercase tracking-widest text-right">Lifetime Business</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {companies.map((c, i) => {
                      const health = c.pendingAmount > 0 ? "Review Pending" : "Excellent";
                      const initials = c.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                      return (
                        <TransactionRow
                          key={c.id || i}
                          initials={initials}
                          name={c.name}
                          type={c.industry || c.location}
                          contact={c.contactPerson}
                          phone={c.phone}
                          health={health}
                          value={formatINR(c.totalValue)}
                        />
                      );
                    })}
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
    </LayoutWrapper>
  );
}

function TransactionRow({ initials, name, type, contact, phone, health, value }: any) {
  return (
    <tr className="hover:bg-primary/5 transition-colors group cursor-pointer">
      <td className="px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center font-black text-on-surface-variant text-xs">
            {initials}
          </div>
          <div>
            <p className="font-bold text-sm text-on-surface">{name}</p>
            <p className="text-xs text-on-surface-variant font-medium">{type}</p>
          </div>
        </div>
      </td>
      <td className="px-8 py-4">
        <p className="text-sm font-bold text-on-surface">{contact}</p>
        <p className="text-xs text-on-surface-variant font-medium">{phone}</p>
      </td>
      <td className="px-8 py-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${health === "Excellent" ? "bg-tertiary" : "bg-warning"}`}></div>
          <span className={`text-xs font-bold ${health === "Excellent" ? "text-tertiary" : "text-on-surface"}`}>{health}</span>
        </div>
      </td>
      <td className="px-8 py-4 text-right tabular-nums font-bold text-sm text-on-surface">{value}</td>
    </tr>
  );
}
