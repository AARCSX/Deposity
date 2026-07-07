"use client";

import LayoutWrapper from "@/components/layout/LayoutWrapper";
import MetricCard from "@/components/dashboard/MetricCard";

export default function ReportsPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-on-surface-variant font-black text-[0.65rem] uppercase tracking-[0.2em] mb-2 px-1">Performance Insight</h2>
            <h1 className="text-[2.75rem] font-black tracking-tighter text-on-surface leading-tight">Reports & Analytics</h1>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-2xl shadow-inner border border-outline-variant/10 shrink-0">
            <button className="px-5 py-2.5 text-xs font-black uppercase tracking-widest bg-primary text-white rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95">Daily</button>
            <button className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-on-surface-variant hover:bg-surface-container transition-colors rounded-xl">Weekly</button>
            <button className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-on-surface-variant hover:bg-surface-container transition-colors rounded-xl">Monthly</button>
            <div className="h-6 w-[1px] bg-outline-variant/30 mx-2"></div>
            <button className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors rounded-xl">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              01 Oct - 31 Oct
            </button>
          </div>
        </div>

        {/* Summary Stats Stack */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard 
            label="Total Revenue" 
            value="₹14,25,000" 
            trend={{ value: "12.4%", isUp: true }} 
            icon="account_balance_wallet" 
            theme="primary" 
          />
          <MetricCard 
            label="Total Expenses" 
            value="₹8,12,450" 
            trend={{ value: "4.2%", isUp: false }} 
            icon="outbox" 
            theme="error" 
          />
          <MetricCard 
            label="Net Profit" 
            value="₹6,12,550" 
            trend={{ value: "8.1%", isUp: true }} 
            icon="trending_up" 
            theme="primary" 
          />
        </div>

        {/* Analytics Bento Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Revenue Trends Line Chart */}
          <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-10 rounded-[2.5rem] border border-outline-variant/10 shadow-sm relative overflow-hidden flex flex-col justify-between h-[500px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Revenue Trends</h3>
                <p className="text-sm text-on-surface-variant font-medium mt-1">Daily financial performance overview</p>
              </div>
              <div className="flex gap-6">
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10"></span> Revenue
                </span>
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-outline">
                  <span className="w-2.5 h-2.5 rounded-full bg-outline/40"></span> Previous
                </span>
              </div>
            </div>
            
            <div className="flex-1 relative mt-10 mb-10 w-full group">
              {/* Simulated Chart Grid */}
              <div className="absolute inset-0 flex flex-col justify-between py-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-full border-t border-outline-variant/10"></div>
                ))}
              </div>
              
              {/* Line Chart Visual SVG */}
              <svg className="absolute inset-0 w-full h-full drop-shadow-[0_10px_20px_rgba(37,99,235,0.15)]" preserveAspectRatio="none" viewBox="0 0 800 250">
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#004ac6" stopOpacity="0.15"></stop>
                    <stop offset="100%" stopColor="#004ac6" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                {/* Previous Period Line */}
                <path 
                  d="M0,200 L100,180 L200,210 L300,190 L400,220 L500,170 L600,190 L700,160 L800,180" 
                  fill="none" 
                  stroke="#737686" 
                  strokeDasharray="6,4" 
                  strokeWidth="2"
                  className="opacity-40"
                ></path>
                {/* Main Revenue Line */}
                <path 
                  d="M0,210 L100,140 L200,160 L300,90 L400,110 L500,60 L600,80 L700,40 L800,20" 
                  fill="none" 
                  stroke="#004ac6" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="5"
                  className="transition-all duration-[600ms] ease-out-expo"
                ></path>
                <path 
                  d="M0,210 L100,140 L200,160 L300,90 L400,110 L500,60 L600,80 L700,40 L800,20 L800,250 L0,250 Z" 
                  fill="url(#chartGradient)"
                ></path>
              </svg>

              {/* Chart Tooltip Point */}
              <div className="absolute top-[30px] right-[12%] w-4 h-4 bg-primary border-4 border-white rounded-full shadow-xl animate-pulse"></div>
            </div>

            <div className="flex justify-between text-[0.65rem] font-black text-outline uppercase tracking-[0.2em] px-2 mb-2">
              <span>01 Oct</span><span>05 Oct</span><span>10 Oct</span><span>15 Oct</span><span>20 Oct</span><span>25 Oct</span><span>30 Oct</span>
            </div>
          </div>

          {/* Expense Breakdown Pie Chart */}
          <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest p-10 rounded-[2.5rem] border border-outline-variant/10 shadow-sm flex flex-col h-[500px]">
            <div className="mb-10">
              <h3 className="text-xl font-bold tracking-tight">Expense Breakdown</h3>
              <p className="text-sm text-on-surface-variant font-medium mt-1">Category-wise utilization</p>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center">
              {/* Donut Visual */}
              <div className="relative w-56 h-56 group pointer-events-none">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="112" cy="112" r="95" stroke="#dfe3e7" strokeWidth="24" fill="transparent" />
                  <circle cx="112" cy="112" r="95" stroke="#004ac6" strokeWidth="24" strokeDasharray="597" strokeDashoffset="268" strokeLinecap="round" fill="transparent" />
                  <circle cx="112" cy="112" r="95" stroke="#006242" strokeWidth="24" strokeDasharray="597" strokeDashoffset="447" strokeLinecap="round" fill="transparent" className="rotate-[120deg] origin-center" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="block text-[0.65rem] font-black text-outline uppercase tracking-widest mb-1">Total</span>
                  <span className="block text-4xl font-black tabular-nums text-on-surface">₹8.12L</span>
                </div>
              </div>

              <div className="w-full mt-12 space-y-4">
                <BreakdownItem color="bg-primary" label="Fuel & Maintenance" percentage="45%" />
                <BreakdownItem color="bg-tertiary" label="Staff Salaries" percentage="30%" />
                <BreakdownItem color="bg-error" label="Tolls & Permits" percentage="25%" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Vehicles */}
        <div className="bg-surface-container-lowest p-10 rounded-[2.5rem] border border-outline-variant/10 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
            <div>
              <h3 className="text-xl font-bold tracking-tight">Top Performing Vehicles</h3>
              <p className="text-sm text-on-surface-variant font-medium mt-1">Efficiency rankings based on profit per km</p>
            </div>
            <button className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-transform bg-primary/5 px-6 py-3 rounded-xl">
              View All Fleet
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-10">
            <PerformanceBar label="MH-12-BQ-8842" model="BharatBenz 5528TT" value="₹ 4.2L" progress="95%" />
            <PerformanceBar label="DL-01-AX-9003" model="Tata Prima 4028.S" value="₹ 3.8L" progress="82%" />
            <PerformanceBar label="KA-05-MK-1122" model="Eicher Pro 6037" value="₹ 3.4L" progress="75%" />
            <PerformanceBar label="HR-26-TY-0054" model="Ashok Leyland 4220" value="₹ 2.9L" progress="64%" />
          </div>
        </div>

        {/* Contextual Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
          <div className="bg-primary rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-primary/30">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
            <div className="relative z-10 space-y-6">
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em]">AI Prediction</span>
              <h4 className="text-3xl font-black tracking-tighter">Next Month's Forecast</h4>
              <p className="text-primary-fixed/80 font-medium text-sm leading-relaxed max-w-sm">
                Based on current trip volumes and fuel price stability, we project a <span className="font-black text-white px-1.5 py-0.5 bg-white/10 rounded-md ring-1 ring-white/20">15% increase</span> in operational efficiency for the Delhi-Mumbai corridor.
              </p>
              <button className="px-8 py-3.5 bg-white text-primary font-black text-xs uppercase tracking-[0.1em] rounded-2xl active:scale-95 transition-all shadow-xl hover:shadow-white/20">
                Download Strategic Report
              </button>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-[2.5rem] p-10 border border-outline-variant/10 flex flex-col sm:flex-row items-center gap-10 shadow-sm">
            <div className="flex-1 space-y-4 text-center sm:text-left">
              <h4 className="text-2xl font-black tracking-tighter">Efficiency Rating</h4>
              <p className="text-on-surface-variant font-medium text-sm leading-relaxed">
                Your fleet is performing <span className="text-primary font-black">8% better</span> than the regional industry average. Keep optimizing maintenance schedules.
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-8 pt-4">
                <div className="text-center">
                  <span className="block text-3xl font-black text-on-surface tracking-tighter">92%</span>
                  <span className="block text-[10px] uppercase font-black text-outline tracking-widest mt-1">Uptime</span>
                </div>
                <div className="w-[1px] h-12 bg-outline-variant/30 hidden sm:block"></div>
                <div className="text-center">
                  <span className="block text-3xl font-black text-on-surface tracking-tighter">14.2</span>
                  <span className="block text-[10px] uppercase font-black text-outline tracking-widest mt-1">km/L Avg</span>
                </div>
              </div>
            </div>
            <div className="w-40 h-40 relative group shrink-0">
              <svg className="w-full h-full transform -rotate-90 transition-transform group-hover:scale-105 duration-500">
                <circle cx="80" cy="80" r="70" stroke="#dfe3e7" strokeWidth="16" fill="transparent" viewBox="0 0 160 160" />
                <circle cx="80" cy="80" r="70" stroke="#006242" strokeWidth="16" strokeDasharray="440" strokeDashoffset="44" strokeLinecap="round" fill="transparent" viewBox="0 0 160 160" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-tertiary-container/10 w-24 h-24 rounded-full flex items-center justify-center flex-col shadow-inner">
                  <span className="text-4xl font-black text-tertiary tracking-tighter">A+</span>
                  <span className="text-[10px] font-black text-tertiary/60 uppercase tracking-widest -mt-1">Grade</span>
                </div>
              </div>
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

function BreakdownItem({ color, label, percentage }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-2xl border border-outline-variant/5 shadow-sm hover:translate-x-1 transition-transform cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${color} ring-4 ${color}/10`}></div>
        <span className="text-[0.65rem] font-black text-on-surface uppercase tracking-widest leading-none">{label}</span>
      </div>
      <span className="text-xs font-black tabular-nums">{percentage}</span>
    </div>
  );
}

function PerformanceBar({ label, model, value, progress }: any) {
  return (
    <div className="space-y-4 group">
      <div className="flex justify-between items-end">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 bg-surface-container-low rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-primary text-2xl">local_shipping</span>
          </div>
          <div>
            <span className="block font-black text-base text-on-surface tracking-tighter leading-none">{label}</span>
            <span className="block text-[0.65rem] text-outline font-bold uppercase tracking-widest mt-1.5">{model}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="block font-black tabular-nums text-primary text-lg tracking-tighter">{value}</span>
          <span className="block text-[10px] text-outline font-black uppercase tracking-widest">Net Profit</span>
        </div>
      </div>
      <div className="w-full h-4 bg-surface-container rounded-full overflow-hidden p-1 shadow-inner relative group/bar">
        <div 
          className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full relative group-hover/bar:brightness-110 transition-all duration-700 ease-out-expo" 
          style={{ width: progress }}
        >
          <div className="absolute inset-0 bg-white/20 animate-shimmer scale-x-150"></div>
        </div>
      </div>
    </div>
  );
}
