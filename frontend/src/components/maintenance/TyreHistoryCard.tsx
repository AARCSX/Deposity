"use client";

import React from "react";

export interface TyreActivity {
  id: string;
  date: string;
  type: string; // e.g. "Puncture Repair", "Tyre Replacement", "Rotation"
  description: string;
  cost: number;
  serviceCenter: string;
  mechanic: string;
}

interface TyreHistoryCardProps {
  tyreId: string;
  onClose: () => void;
  activities: TyreActivity[];
}

export default function TyreHistoryCard({ tyreId, onClose, activities }: TyreHistoryCardProps) {
  // Parse display name from the tyreId
  const parts = tyreId.split("-");
  const axleIndex = parseInt(parts[1]);
  const side = parts[2] === "left" ? "Left" : "Right";
  const innerOuter = parts[3] ? ` (${parts[3].charAt(0).toUpperCase() + parts[3].slice(1)})` : "";
  
  const position = axleIndex === 0 ? "Front" : `Axle ${axleIndex + 1}`;
  const displayName = `${position} ${side}${innerOuter}`;

  // Calculate stats from dynamic activities
  const changes = activities.filter(a => a.type.toLowerCase().includes("replace") || a.type.toLowerCase().includes("new")).length;
  const punctures = activities.filter(a => a.type.toLowerCase().includes("puncture") || a.type.toLowerCase().includes("repair")).length;

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-lg overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-surface-container-low px-4 py-3 flex justify-between items-center border-b border-outline-variant/10">
        <div>
          <h4 className="font-bold text-on-surface text-sm">Tyre History</h4>
          <p className="text-xs font-semibold text-primary">{displayName}</p>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
      
      <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[350px] custom-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-container-high/50 rounded-xl p-3 text-center">
            <span className="block text-2xl font-black text-on-surface">{changes}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Changes</span>
          </div>
          <div className="bg-surface-container-high/50 rounded-xl p-3 text-center">
            <span className="block text-2xl font-black text-on-surface">{punctures}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Punctures</span>
          </div>
        </div>

        <div>
          <h5 className="text-xs uppercase font-bold tracking-wider text-outline mb-3">Recent Activity</h5>
          {activities.length > 0 ? (
            <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/30">
              {activities.map((act) => {
                const isPuncture = act.type.toLowerCase().includes("puncture") || act.type.toLowerCase().includes("repair");
                return (
                  <div key={act.id} className="relative pl-6 flex flex-col gap-1">
                    {/* Timeline Node */}
                    <div className={`absolute left-0 top-1.5 w-4.5 h-4.5 rounded-full border-2 bg-surface-container-lowest flex items-center justify-center z-10 ${
                      isPuncture ? "border-amber-500" : "border-primary"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isPuncture ? "bg-amber-500" : "bg-primary"}`}></div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-3 rounded-xl border border-outline-variant/15 bg-surface-container-low shadow-xs">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-on-surface text-xs">{act.type}</span>
                        <span className="font-semibold text-primary text-[10px] whitespace-nowrap">{act.date}</span>
                      </div>
                      <p className="text-on-surface-variant text-[11px] leading-relaxed mb-2">
                        {act.description}
                      </p>
                      <div className="flex justify-between items-center text-[10px] font-semibold text-outline">
                        <span>{act.serviceCenter} • {act.mechanic}</span>
                        <span className="text-on-surface">₹{act.cost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center rounded-xl border border-dashed border-outline-variant/20 bg-surface-container-low/50">
              <p className="text-xs text-on-surface-variant">No maintenance history recorded for this tyre position.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-3 border-t border-outline-variant/10 bg-surface-container-low text-center text-xs text-outline font-semibold uppercase tracking-wider">
        Linked to active maintenance logs
      </div>
    </div>
  );
}
