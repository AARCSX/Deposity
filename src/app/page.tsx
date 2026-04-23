"use client";

import LayoutWrapper from "@/components/layout/LayoutWrapper";
import MetricCard from "@/components/dashboard/MetricCard";
import AlertItem from "@/components/dashboard/AlertItem";

export default function Home() {
  return (
    <LayoutWrapper>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-on-surface tracking-[-0.02em] mb-1">OnWay</h1>
            <p className="text-on-surface-variant text-sm flex items-center gap-2">
              Business Operations Overview 
              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant/30"></span>
              <span className="font-bold text-primary">Deposity Platform</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="bg-surface-container-highest text-on-surface px-4 py-2 rounded-xl text-sm font-semibold border border-outline-variant/15 hover:bg-surface-container-high transition-colors active:scale-[0.98]">
              Export Report
            </button>
          </div>
        </div>

        {/* Hero Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Vehicles"
            value="48"
            icon="local_shipping"
            trend={{ value: "2", isUp: true }}
            theme="primary"
          />
          <MetricCard
            label="Active Trips"
            value="12"
            icon="route"
            subtitle="In Transit"
            theme="warning"
          />
          <MetricCard
            label="Total Drivers"
            value="54"
            icon="person"
            subtitle="Available: 8"
            theme="secondary"
          />
          <MetricCard
            label="Monthly Revenue"
            value="₹12.4L"
            icon="account_balance_wallet"
            trend={{ value: "8%", isUp: true }}
            theme="tertiary"
          />
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions Strip */}
            <div className="bg-surface-container-low/50 backdrop-blur-md rounded-xl p-4 flex flex-wrap gap-3 items-center border border-outline-variant/15">
              <span className="text-sm font-bold text-on-surface-variant ml-2 mr-4 uppercase tracking-wider">Quick Add</span>
              <button className="bg-surface-container-lowest text-primary hover:bg-primary/10 border border-outline-variant/15 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors active:scale-[0.98]">
                <span className="material-symbols-outlined text-[18px]">add_circle</span> New Trip
              </button>
              <button className="bg-surface-container-lowest text-on-surface hover:bg-surface-container-high border border-outline-variant/15 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors active:scale-[0.98]">
                <span className="material-symbols-outlined text-[18px]">directions_car</span> Vehicle
              </button>
              <button className="bg-surface-container-lowest text-on-surface hover:bg-surface-container-high border border-outline-variant/15 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors active:scale-[0.98]">
                <span className="material-symbols-outlined text-[18px]">person_add</span> Driver
              </button>
              <button className="bg-surface-container-lowest text-on-surface hover:bg-surface-container-high border border-outline-variant/15 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors active:scale-[0.98]">
                <span className="material-symbols-outlined text-[18px]">receipt_long</span> Expense
              </button>
            </div>

            {/* Action Required Box */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 overflow-hidden">
              <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant/15 flex justify-between items-center">
                <h2 className="text-lg font-bold text-on-surface">Action Required</h2>
                <span className="bg-error/10 text-error text-xs font-bold px-2 py-1 rounded-md">3 Critical</span>
              </div>
              <div className="p-0">
                <AlertItem
                  title="Documents Expiring Soon"
                  description="3 Vehicles have fitness certificates expiring in less than 7 days."
                  type="warning"
                  tags={["MH-12-AB-1234", "MH-14-CD-5678"]}
                  actionLabel="Review"
                />
                <AlertItem
                  title="Pending Salary Payments"
                  description="Driver salaries for last month are overdue by 2 days."
                  type="error"
                  metadata="₹4.5L Total"
                  actionLabel="Process"
                />
                <AlertItem
                  title="Trips Completed - Payment Pending"
                  description="5 trips marked delivered but client payment not received."
                  type="info"
                  actionLabel="View All"
                />
              </div>
            </div>

            {/* Charts Area Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/15 flex flex-col">
                <h2 className="text-sm font-bold text-on-surface mb-4">Monthly Trip Revenue</h2>
                <div className="flex-1 min-h-[200px] flex items-end gap-2 pb-4 pt-8 border-b border-outline-variant/15 relative">
                  <div className="absolute left-0 top-0 bottom-4 flex flex-col justify-between text-[10px] text-on-surface-variant">
                    <span>₹15L</span>
                    <span>₹10L</span>
                    <span>₹5L</span>
                  </div>
                  {[40, 60, 45, 80, 95, 30].map((h, i) => (
                    <div 
                      key={i} 
                      className={`w-1/6 rounded-t-sm transition-all duration-300 relative group ${i === 4 ? "bg-primary shadow-[0_0_15px_rgba(0,74,198,0.3)]" : "bg-surface-container-highest hover:bg-primary/20"}`}
                      style={{ height: `${h}%` }}
                    >
                      <span className={`absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold ${i === 4 ? "text-primary opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                        {["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/15 flex flex-col">
                <h2 className="text-sm font-bold text-on-surface mb-4">Vehicle Status</h2>
                <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
                  <div className="w-32 h-32 rounded-full border-[12px] border-surface-container-high relative flex items-center justify-center" style={{ borderTopColor: "#004ac6", borderRightColor: "#004ac6", borderBottomColor: "#fbbf24", transform: "rotate(-45deg)" }}>
                    <div className="text-center" style={{ transform: "rotate(45deg)" }}>
                      <span className="block text-2xl font-bold text-on-surface leading-none tabular-nums">48</span>
                      <span className="block text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">Total</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary"></div><span className="text-xs text-on-surface-variant">Active (32)</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-warning"></div><span className="text-xs text-on-surface-variant">Maint. (8)</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-surface-container-high"></div><span className="text-xs text-on-surface-variant">Idle (8)</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Activity */}
          <div className="space-y-6">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-6 h-full">
              <h2 className="text-lg font-bold text-on-surface mb-6">Recent Activity</h2>
              <div className="relative pl-6 border-l-2 border-outline-variant/30 border-dashed space-y-8">
                <TimelineItem 
                  time="Just now" 
                  title="Trip Completed" 
                  description="Trip #TRP-1042 delivered to Mumbai. Invoice generated." 
                  amount="₹45,000"
                  type="tertiary"
                />
                <TimelineItem 
                  time="2 hours ago" 
                  title="Expense Recorded" 
                  description="Fuel expense logged by Driver Ramesh for MH-12-XY-9090." 
                  amount="₹12,500"
                  type="primary"
                />
                <TimelineItem 
                  time="5 hours ago" 
                  title="Vehicle Breakdown" 
                  description="MH-14-GH-1122 reported engine issue near Pune highway." 
                  type="warning"
                />
              </div>
              <button className="w-full mt-8 py-2 text-sm font-semibold text-primary border border-outline-variant/15 rounded-lg hover:bg-surface-container-low transition-colors active:scale-[0.98]">
                View All History
              </button>
            </div>
          </div>
        </div>
      </div>
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
      <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-surface-container-lowest border-2 flex items-center justify-center ${colors[type as keyof typeof colors]}`}>
        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
      </div>
      <p className="text-xs text-on-surface-variant mb-1">{time}</p>
      <h4 className="text-sm font-bold text-on-surface">{title}</h4>
      <p className="text-xs text-on-surface-variant mt-1">{description}</p>
      {amount && (
        <span className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded ${type === "tertiary" ? "bg-tertiary/10 text-tertiary" : "bg-surface-container-highest text-on-surface-variant"}`}>
          {amount}
        </span>
      )}
    </div>
  );
}
