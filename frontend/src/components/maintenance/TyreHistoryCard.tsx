"use client";

import React from "react";

interface TyreHistoryCardProps {
  tyreId: string;
  onClose: () => void;
}

export default function TyreHistoryCard({ tyreId, onClose }: TyreHistoryCardProps) {
  // Generate mock data based on the tyreId for now
  const isFront = tyreId.includes("axle-0");
  const side = tyreId.includes("left") ? "Left" : "Right";
  const position = isFront ? "Front" : "Rear";
  const innerOuter = tyreId.includes("inner") ? " (Inner)" : tyreId.includes("outer") ? " (Outer)" : "";
  
  const displayName = `${position} ${side}${innerOuter}`;
  
  const changes = isFront ? 1 : 2;
  const punctures = isFront ? 0 : 3;

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
      
      <div className="p-4 space-y-4 flex-1">
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
          <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[9px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant/20 before:to-transparent">
            {/* Mock Timeline Items */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-primary bg-surface-container-lowest text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              </div>
              <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-outline-variant/15 bg-surface-container-lowest shadow-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-on-surface text-xs">Puncture Repair</span>
                  <span className="font-semibold text-primary text-[10px]">12 Oct 2025</span>
                </div>
                <div className="text-on-surface-variant text-[11px] leading-relaxed">
                  Nail puncture repaired at Metro Service.
                </div>
              </div>
            </div>
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-outline-variant bg-surface-container-lowest text-outline shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              </div>
              <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-outline-variant/15 bg-surface-container-lowest shadow-sm opacity-70">
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-on-surface text-xs">Tyre Replaced</span>
                  <span className="font-semibold text-on-surface-variant text-[10px]">05 Mar 2024</span>
                </div>
                <div className="text-on-surface-variant text-[11px] leading-relaxed">
                  New MRF tyre installed due to tread wear.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-3 border-t border-outline-variant/10 bg-surface-container-low text-center">
        <button className="text-xs font-bold text-primary hover:text-primary-container transition-colors">
          View Full Log
        </button>
      </div>
    </div>
  );
}
