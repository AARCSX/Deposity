"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function VehicleDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Link href="/vehicles" className="hover:text-primary transition-colors">
            Vehicles
          </Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="font-medium text-on-surface">{id ? id.replace("-", " ").toUpperCase() : "MH 12 AB 3456"}</span>
        </div>

        {/* Header Card (Hero) */}
        <div className="bg-surface-container-lowest rounded-xl p-8 mb-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-tertiary/10 text-tertiary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-tertiary block animate-pulse"></span>
                  Active
                </span>
                <span className="text-sm font-medium text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">
                  10 Wheeler - Open Body
                </span>
              </div>
              <h1 className="text-[2.75rem] font-bold leading-none tracking-[-0.02em] text-on-surface mb-2">
                {id ? id.replace("-", " ").toUpperCase() : "MH 12 AB 3456"}
              </h1>
              <p className="text-on-surface-variant text-sm font-medium">Tata LPT 2518 • Added 12/05/2022</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low text-primary font-semibold rounded-xl hover:bg-primary/10 transition-colors active:scale-[0.98]">
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit Details
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 pt-8 border-t border-outline-variant/15">
            <StatItem icon="person" label="Current Driver" value="Ramesh Kumar" subValue="+91 98765 43210" />
            <StatItem 
              icon="location_on" 
              label="GPS Status" 
              value="Tracking Active" 
              subValue="Last seen: 2 mins ago" 
              hasPulse 
            />
            <StatItem 
              icon="warning" 
              label="Next Expiry" 
              value="Insurance" 
              subValue="In 15 Days (20/11/2023)" 
              theme="error" 
            />
            <StatItem 
              icon="account_balance_wallet" 
              label="Next Payment" 
              value="₹ 24,500" 
              subValue="EMI due 05/11/2023" 
            />
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-8 border-b border-outline-variant/15 mb-8 overflow-x-auto scrollbar-hide">
          <TabButton active>Documents</TabButton>
          <TabButton>EMI Schedule</TabButton>
          <TabButton>FASTag History</TabButton>
          <TabButton>Trip History</TabButton>
          <TabButton>Maintenance</TabButton>
        </div>

        {/* Tab Content: Documents (Bento Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Timeline Panel */}
          <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/15">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-primary">event_note</span>
              Expiry Timeline
            </h3>
            <div className="relative pl-4 border-l-2 border-outline-variant/20 space-y-8">
              <TimelineNode date="20/11/2023" title="Insurance Expires" sub="HDFC Ergo" theme="error" />
              <TimelineNode date="15/12/2023" title="Fitness Certificate" sub="RTO Pune" theme="warning" />
              <TimelineNode date="10/05/2024" title="National Permit" theme="tertiary" />
            </div>
          </div>

          {/* Document Cards Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocCard title="Registration (RC)" sub="Original Copy" status="Valid" issued="12/05/2022" expires="11/05/2037" />
            <DocCard 
              title="Insurance" 
              sub="Comprehensive" 
              status="Expiring" 
              provider="HDFC Ergo" 
              expires="20/11/2023" 
              theme="error" 
              showAction 
            />
            <DocCard 
              title="Fitness Certificate" 
              sub="RTO Pune" 
              status="Due Soon" 
              issued="16/12/2022" 
              expires="15/12/2023" 
              theme="warning" 
            />
            <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-xl p-5 flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer border-dashed min-h-[160px]">
              <span className="material-symbols-outlined text-3xl mb-2 text-primary">add_circle</span>
              <p className="text-sm font-bold">Add Document</p>
            </div>
          </div>
        </div>
        
        <div className="h-12"></div>
      </div>
    </>
  );
}

function StatItem({ icon, label, value, subValue, hasPulse, theme = "primary" }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === "error" ? "bg-error/10 text-error" : "bg-surface-container-low text-primary"}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-xs text-on-surface-variant font-medium mb-1">{label}</p>
        <div className="flex items-center gap-2">
          {hasPulse && <span className="w-2 h-2 rounded-full bg-tertiary block animate-pulse"></span>}
          <p className={`font-bold ${theme === "error" ? "text-error" : "text-on-surface"}`}>{value}</p>
        </div>
        <p className="text-xs text-on-surface-variant mt-1">{subValue}</p>
      </div>
    </div>
  );
}

function TabButton({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button className={`pb-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${active ? "text-primary border-primary" : "text-on-surface-variant border-transparent hover:text-on-surface"}`}>
      {children}
    </button>
  );
}

function TimelineNode({ date, title, sub, theme = "primary" }: any) {
  const colors = {
    primary: "bg-primary",
    error: "bg-error",
    warning: "bg-warning",
    tertiary: "bg-tertiary",
  };

  return (
    <div className="relative">
      <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-surface-container-lowest ${colors[theme as keyof typeof colors]}`}></div>
      <p className="text-xs font-bold mb-1" style={{ color: `var(--${theme})` }}>{date}</p>
      <p className="font-bold text-sm text-on-surface">{title}</p>
      {sub && <p className="text-xs text-on-surface-variant mt-1">{sub}</p>}
    </div>
  );
}

function DocCard({ title, sub, status, issued, expires, provider, theme = "primary", showAction }: any) {
  return (
    <div className={`bg-surface-container-lowest border rounded-xl p-5 hover:shadow-md transition-all ${theme === "error" ? "border-error/30" : "border-outline-variant/15"}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === "error" ? "bg-error/10 text-error" : "bg-surface-container-low text-primary"}`}>
            <span className="material-symbols-outlined">description</span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-on-surface">{title}</h4>
            <p className="text-xs text-on-surface-variant">{sub}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${theme === "error" ? "bg-error/10 text-error" : theme === "warning" ? "bg-warning/10 text-warning" : "bg-tertiary/10 text-tertiary"}`}>
          {status}
        </span>
      </div>
      <div className="flex justify-between items-end mt-4 pt-4 border-t border-outline-variant/15">
        <div>
          {issued && <p className="text-xs text-on-surface-variant">Issued: {issued}</p>}
          {provider && <p className="text-xs text-on-surface-variant">Provider: {provider}</p>}
          <p className={`text-xs ${theme === "error" ? "font-bold text-error" : "text-on-surface-variant"}`}>
            Expires: {expires}
          </p>
        </div>
        {showAction ? (
          <button className="bg-error text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-error/90 transition-colors active:scale-[0.98]">
            Renew Now
          </button>
        ) : (
          <button className="text-primary hover:text-primary-container text-sm font-semibold flex items-center gap-1">
            View <span className="material-symbols-outlined text-sm">visibility</span>
          </button>
        )}
      </div>
    </div>
  );
}
