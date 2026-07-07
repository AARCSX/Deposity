"use client";

import LayoutWrapper from "@/components/layout/LayoutWrapper";
import MetricCard from "@/components/dashboard/MetricCard";

const transactions = [
  {
    date: "12/03/2024",
    vehicle: "NL-01-AF-2034",
    model: "Ashok Leyland 1618",
    category: "Fuel",
    categoryColor: "bg-primary-fixed text-on-primary-fixed-variant",
    description: "Full tank diesel at Reliance Petrol Pump",
    amount: "₹12,450.00",
    status: "check_circle",
    statusColor: "text-tertiary",
  },
  {
    date: "11/03/2024",
    vehicle: "MH-43-BE-1102",
    model: "BharatBenz 2823R",
    category: "Maintenance",
    categoryColor: "bg-error-container text-on-error-container",
    description: "Brake pad replacement and oil change",
    amount: "₹28,200.00",
    status: "check_circle",
    statusColor: "text-tertiary",
  },
  {
    date: "10/03/2024",
    vehicle: "KA-01-JH-4455",
    model: "Tata Prima 4028.S",
    category: "Toll",
    categoryColor: "bg-secondary-container text-on-secondary-container",
    description: "NH-44 Toll Plaza - Month Pass",
    amount: "₹8,500.00",
    status: "check_circle",
    statusColor: "text-tertiary",
  },
  {
    date: "09/03/2024",
    vehicle: "UP-14-DT-9988",
    model: "Eicher Pro 3015",
    category: "Others",
    categoryColor: "bg-tertiary-fixed text-on-tertiary-fixed",
    description: "Driver per-diem and parking fees",
    amount: "₹2,400.00",
    status: "pending",
    statusColor: "text-warning",
  },
];

export default function ExpensesPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-[2.75rem] font-black tracking-tighter text-on-surface leading-tight">Expense Analytics</h2>
            <p className="text-on-surface-variant font-medium text-sm">Monitoring fleet operational costs for March 2024</p>
          </div>
          <button className="bg-gradient-to-br from-primary to-primary-container text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all shrink-0 flex items-center gap-2">
            <span className="material-symbols-outlined">add_circle</span>
            Add Expense
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard label="Total Expenses" value="₹4,82,900" trend={{ value: "12%", isUp: false }} icon="account_balance_wallet" theme="primary" />
          
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center mb-4">
              <span className="material-symbols-outlined">local_gas_station</span>
            </div>
            <p className="text-outline text-[0.65rem] font-black uppercase tracking-widest mb-1">Fuel</p>
            <h3 className="text-2xl font-black tabular-nums text-on-surface">₹2,45,000</h3>
            <div className="w-full bg-surface-container h-2 rounded-full mt-5">
              <div className="bg-primary h-full rounded-full w-[65%]"></div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-warning flex items-center justify-center mb-4">
              <span className="material-symbols-outlined">build</span>
            </div>
            <p className="text-outline text-[0.65rem] font-black uppercase tracking-widest mb-1">Maintenance</p>
            <h3 className="text-2xl font-black tabular-nums text-on-surface">₹1,12,400</h3>
            <div className="w-full bg-surface-container h-2 rounded-full mt-5">
              <div className="bg-warning h-full rounded-full w-[40%]"></div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-tertiary flex items-center justify-center mb-4">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <p className="text-outline text-[0.65rem] font-black uppercase tracking-widest mb-1">Others</p>
            <h3 className="text-2xl font-black tabular-nums text-on-surface">₹1,25,500</h3>
            <div className="w-full bg-surface-container h-2 rounded-full mt-5">
              <div className="bg-tertiary h-full rounded-full w-[25%]"></div>
            </div>
          </div>
        </div>

        {/* Charts & Visual Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trend Analysis */}
          <div className="lg:col-span-2 bg-surface-container-lowest p-10 rounded-[2.5rem] border border-outline-variant/10 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h4 className="text-xl font-bold tracking-tight">Monthly Trend</h4>
              <div className="flex bg-surface-container-low p-1 rounded-xl">
                <button className="px-5 py-2 text-xs font-bold rounded-lg bg-primary text-white shadow-sm">Daily</button>
                <button className="px-5 py-2 text-xs font-bold rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">Weekly</button>
              </div>
            </div>
            {/* Chart Simulation */}
            <div className="h-56 flex items-end justify-between gap-4">
              {[40, 60, 45, 75, 90, 100, 65].map((height, i) => (
                <div key={i} className="w-full group relative">
                  <div 
                    className={`rounded-2xl transition-all duration-300 cursor-pointer ${height === 100 ? 'bg-primary' : 'bg-primary/10 hover:bg-primary/20'}`}
                    style={{ height: `${height}%` }}
                  >
                    <div className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 shadow-xl whitespace-nowrap z-10`}>
                      ₹{(height * 820).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-6 text-[0.7rem] font-black text-outline uppercase tracking-[0.2em] px-2">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>

          {/* Allocation Ring */}
          <div className="bg-surface-container-lowest p-10 rounded-[2.5rem] border border-outline-variant/10 shadow-sm flex flex-col items-center">
            <h4 className="text-xl font-bold tracking-tight mb-8 self-start">Expense Allocation</h4>
            <div className="relative w-56 h-56 mb-8 group">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-surface-container" cx="112" cy="112" fill="transparent" r="95" stroke="currentColor" strokeWidth="22"></circle>
                <circle className="text-primary" cx="112" cy="112" fill="transparent" r="95" stroke="currentColor" strokeDasharray="597" strokeDashoffset="150" strokeWidth="22" strokeLinecap="round"></circle>
                <circle className="text-warning" cx="112" cy="112" fill="transparent" r="95" stroke="currentColor" strokeDasharray="597" strokeDashoffset="450" strokeWidth="22" strokeLinecap="round"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[0.65rem] text-outline font-black uppercase tracking-widest mb-1">Fuel</span>
                <span className="text-4xl font-black text-on-surface">51%</span>
              </div>
            </div>
            <div className="w-full space-y-4">
              <AllocationItem color="bg-primary" label="Fuel" percentage="51%" />
              <AllocationItem color="bg-warning" label="Maintenance" percentage="23%" />
              <AllocationItem color="bg-tertiary" label="Admin & Other" percentage="26%" />
            </div>
          </div>
        </div>

        {/* Recent Expenses Table */}
        <div className="bg-surface-container-lowest rounded-[2.5rem] overflow-hidden border border-outline-variant/10 shadow-sm">
          <div className="px-10 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-low/30 border-b border-outline-variant/10">
            <h4 className="text-xl font-black tracking-tighter">Recent Transactions</h4>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest text-outline hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">filter_list</span> Filter
              </button>
              <button className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest text-outline hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">download</span> Export CSV
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/40">
                  <th className="px-10 py-5 text-[0.7rem] uppercase tracking-[0.2em] font-black text-outline">Date</th>
                  <th className="px-10 py-5 text-[0.7rem] uppercase tracking-[0.2em] font-black text-outline">Vehicle</th>
                  <th className="px-10 py-5 text-[0.7rem] uppercase tracking-[0.2em] font-black text-outline">Category</th>
                  <th className="px-10 py-5 text-[0.7rem] uppercase tracking-[0.2em] font-black text-outline">Description</th>
                  <th className="px-10 py-5 text-[0.7rem] uppercase tracking-[0.2em] font-black text-outline text-right">Amount</th>
                  <th className="px-10 py-5 text-[0.7rem] uppercase tracking-[0.2em] font-black text-outline text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {transactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-primary/5 transition-colors group cursor-pointer">
                    <td className="px-10 py-5 text-sm font-bold tabular-nums text-on-surface">{tx.date}</td>
                    <td className="px-10 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-xl">local_shipping</span>
                        </div>
                        <div>
                          <p className="text-sm font-black leading-none text-on-surface">{tx.vehicle}</p>
                          <p className="text-[0.65rem] text-outline font-bold mt-1 uppercase tracking-tighter">{tx.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${tx.categoryColor}`}>
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-10 py-5 text-sm text-on-surface-variant font-medium max-w-xs truncate">{tx.description}</td>
                    <td className="px-10 py-5 text-sm font-black text-right tabular-nums text-on-surface">{tx.amount}</td>
                    <td className="px-10 py-5 text-center">
                      <span className={`material-symbols-outlined ${tx.statusColor} text-2xl`} style={{ fontVariationSettings: "'FILL' 1" }}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-10 py-6 bg-surface-container-low/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-[0.7rem] font-bold text-outline uppercase tracking-widest">
            <p>Showing 1-10 of 482 transactions</p>
            <div className="flex gap-2">
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-lowest text-outline hover:bg-primary hover:text-white transition-all shadow-sm">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">1</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-lowest text-outline hover:bg-primary hover:text-white transition-all shadow-sm">2</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-lowest text-outline hover:bg-primary hover:text-white transition-all shadow-sm">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto py-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-xs text-on-surface-variant font-medium">© 2026 OnWay Depo. All rights reserved. Powered by AARCSX Deposity.</p>
          <div className="flex gap-6">
            <a className="text-xs text-outline hover:text-primary font-bold uppercase tracking-widest transition-colors" href="#">Privacy Policy</a>
            <a className="text-xs text-outline hover:text-primary font-bold uppercase tracking-widest transition-colors" href="#">Support Portal</a>
          </div>
        </footer>
      </div>
    </LayoutWrapper>
  );
}

function AllocationItem({ color, label, percentage }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-2xl border border-outline-variant/5 shadow-sm hover:translate-x-1 transition-transform cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <span className="text-[0.65rem] font-black text-on-surface uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-xs font-black tabular-nums">{percentage}</span>
    </div>
  );
}
