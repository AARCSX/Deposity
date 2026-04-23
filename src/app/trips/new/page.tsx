"use client";

import LayoutWrapper from "@/components/layout/LayoutWrapper";
import Link from "next/link";

export default function NewTripPage() {
  return (
    <LayoutWrapper>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-[2.75rem] font-bold text-on-surface tracking-tight leading-tight">New Trip Entry</h2>
            <p className="text-on-surface-variant font-medium mt-1">Create a new logistical movement record.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-2.5 rounded-xl text-on-surface bg-surface-container-highest hover:bg-surface-dim font-bold text-sm transition-all border border-outline-variant/15 active:scale-[0.98]">
              Save as Draft
            </button>
            <button className="px-6 py-2.5 rounded-xl text-white bg-gradient-to-br from-primary to-primary-container font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity active:scale-[0.98]">
              Add Trip
            </button>
          </div>
        </div>

        <form className="space-y-6">
          {/* Core Details Section */}
          <SectionCard icon="route" title="Trip Core Details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Trip Date */}
              <div>
                <label className="form-label">Trip Date</label>
                <div className="relative">
                  <input className="form-input-premium pl-10" type="date" defaultValue="2023-10-27" />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                    calendar_today
                  </span>
                </div>
              </div>
              {/* Vehicle Selection */}
              <div className="md:col-span-2">
                <label className="form-label">Vehicle Assignment</label>
                <div className="relative">
                  <select className="form-input-premium pl-10 appearance-none">
                    <option disabled value="">Search & Select Vehicle...</option>
                    <option value="MH12AB1234">MH12 AB 1234 (Tata Signa) - Driver: Ramesh - Available</option>
                    <option value="DL01XY9876">DL01 XY 9876 (Ashok Leyland) - Driver: Suresh - In Transit</option>
                  </select>
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                    local_shipping
                  </span>
                </div>
              </div>
              {/* Client/Company */}
              <div className="md:col-span-2">
                <label className="form-label">Billing Party / Client</label>
                <div className="relative">
                  <select className="form-input-premium pl-10 appearance-none">
                    <option disabled value="">Select Client...</option>
                    <option value="1">Reliance Logistics Private Limited</option>
                    <option value="2">TCI Freight</option>
                  </select>
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                    business
                  </span>
                </div>
              </div>
              {/* LR Number */}
              <div>
                <label className="form-label">LR Number (Lorry Receipt)</label>
                <input className="form-input-premium" placeholder="e.g. LR-2023-8992" type="text" />
              </div>
            </div>
          </SectionCard>

          {/* Routing & Load Details */}
          <SectionCard icon="my_location" title="Routing & Material">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Route Path */}
              <div className="relative pl-6 border-l-2 border-dashed border-outline-variant/30 space-y-6">
                <div className="relative">
                  <div className="absolute -left-[31px] top-3 h-4 w-4 rounded-full bg-surface-container-lowest border-2 border-primary z-10 shadow-sm"></div>
                  <label className="form-label">Loading Point (Origin)</label>
                  <input className="form-input-premium" placeholder="Enter City or Area" type="text" />
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] top-3 h-4 w-4 rounded-full bg-surface-container-lowest border-2 border-tertiary z-10 shadow-sm"></div>
                  <label className="form-label">Unloading Point (Destination)</label>
                  <input className="form-input-premium" placeholder="Enter City or Area" type="text" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="form-label text-[0.7rem] uppercase tracking-wider">Distance (km)</label>
                    <input className="form-input-premium font-mono tabular-nums" placeholder="Auto/Manual" type="number" />
                  </div>
                  <div>
                    <label className="form-label text-[0.7rem] uppercase tracking-wider">Transit Days</label>
                    <input className="form-input-premium" placeholder="e.g. 3" type="number" />
                  </div>
                </div>
              </div>
              {/* Load Details */}
              <div className="space-y-6 bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
                <div>
                  <label className="form-label">Material Description</label>
                  <input className="form-input-premium bg-surface-container-lowest" placeholder="e.g. Steel Coils, FMCG Goods" type="text" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Charged Weight (MT)</label>
                    <input className="form-input-premium bg-surface-container-lowest font-mono tabular-nums" placeholder="0.00" type="number" />
                  </div>
                  <div>
                    <label className="form-label">Actual Weight (MT)</label>
                    <input className="form-input-premium bg-surface-container-lowest font-mono tabular-nums" placeholder="0.00" type="number" />
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Financial Details */}
          <SectionCard icon="payments" title="Commercials">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">Rate Type</label>
                    <select className="form-input-premium appearance-none">
                      <option>Per MT (Tonnage)</option>
                      <option>Per KM (Distance)</option>
                      <option>Fixed Lumpsum</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Rate (₹)</label>
                    <input className="form-input-premium font-mono tabular-nums" placeholder="0.00" type="number" />
                  </div>
                  <div>
                    <label className="form-label">Freight Amount (₹)</label>
                    <input className="form-input-premium bg-surface-container-high/50 font-mono tabular-nums text-primary font-bold" placeholder="Auto Calc" readOnly type="number" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">Advance Given (₹)</label>
                    <input className="form-input-premium font-mono tabular-nums" placeholder="0.00" type="number" />
                  </div>
                  <div>
                    <label className="form-label">Advance Date</label>
                    <input className="form-input-premium text-sm" type="date" />
                  </div>
                  <div>
                    <label className="form-label">Advance Mode</label>
                    <select className="form-input-premium appearance-none">
                      <option>Bank Transfer</option>
                      <option>Cash</option>
                      <option>Fuel Slip</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/20 flex flex-col justify-center">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Financial Summary</h4>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant font-medium">Total Freight</span>
                    <span className="font-mono tabular-nums text-on-surface font-bold">₹ 0.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant font-medium">Advance Paid</span>
                    <span className="font-mono tabular-nums text-error font-bold">- ₹ 0.00</span>
                  </div>
                  <div className="h-px bg-primary/20 w-full"></div>
                </div>
                <div>
                  <span className="block text-xs text-on-surface-variant mb-1 font-bold">Pending Balance</span>
                  <div className="text-3xl font-black text-primary font-mono tabular-nums tracking-tight">
                    ₹ 0.00
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Status & Remarks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/15 col-span-1">
              <label className="form-label font-bold mb-4">Initial Trip Status</label>
              <div className="space-y-3">
                <StatusRadio id="scheduled" label="Scheduled" checked />
                <StatusRadio id="loading" label="Loading" />
                <StatusRadio id="in-transit" label="In Transit" />
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/15 md:col-span-2">
              <label className="form-label font-bold">Internal Remarks / Notes</label>
              <textarea className="w-full bg-surface-container-highest ghost-border rounded-lg px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary transition-all duration-200 h-full min-h-[120px] resize-none" placeholder="Add specific instructions or billing notes..."></textarea>
            </div>
          </div>
        </form>
        
        <div className="h-12"></div>
      </div>
    </LayoutWrapper>
  );
}

function SectionCard({ icon, title, children }: any) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/15 relative overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-container opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="flex items-center gap-3 mb-6 border-b border-outline-variant/10 pb-4">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        <h3 className="text-xl font-bold text-on-surface tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StatusRadio({ id, label, checked }: any) {
  return (
    <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${checked ? "border-primary bg-primary/5" : "border-outline-variant/15 hover:bg-surface-container-low"}`}>
      <input 
        name="status" 
        type="radio" 
        defaultChecked={checked} 
        className="text-primary focus:ring-primary h-4 w-4" 
      />
      <span className="ml-3 text-sm font-bold text-on-surface uppercase tracking-wide">{label}</span>
    </label>
  );
}
