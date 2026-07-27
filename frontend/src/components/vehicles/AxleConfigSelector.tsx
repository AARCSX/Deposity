"use client";

import React, { useState, useEffect } from "react";
import { parseAxleConfig, serializeAxleConfig, AxleConfigData } from "@/types/axle";

interface AxleConfigSelectorProps {
  value: string;
  onChange: (newValue: string) => void;
}

export default function AxleConfigSelector({ value, onChange }: AxleConfigSelectorProps) {
  const [axleData, setAxleData] = useState<AxleConfigData>(() => parseAxleConfig(value));

  // Sync internal state if external value changes drastically
  useEffect(() => {
    const parsed = parseAxleConfig(value);
    setAxleData(parsed);
  }, [value]);

  const updateConfig = (newData: AxleConfigData) => {
    setAxleData(newData);
    const serialized = serializeAxleConfig(newData);
    onChange(serialized);
  };

  const handleNumAxlesChange = (num: number) => {
    let newTyres = [...axleData.axleTyres];
    if (num > newTyres.length) {
      while (newTyres.length < num) {
        newTyres.push(4); // Default 4 tyres for newly added drive/rear axles
      }
    } else if (num < newTyres.length) {
      newTyres = newTyres.slice(0, num);
    }
    updateConfig({ numAxles: num, axleTyres: newTyres });
  };

  const handleTyresPerAxleChange = (axleIndex: number, tyreCount: number) => {
    const newTyres = [...axleData.axleTyres];
    newTyres[axleIndex] = tyreCount;
    updateConfig({ numAxles: axleData.numAxles, axleTyres: newTyres });
  };

  const totalTyres = axleData.axleTyres.reduce((sum, n) => sum + n, 0);

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/15">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-outline uppercase tracking-wider">
          Axle &amp; Tyre Configuration
        </label>
        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20">
          {totalTyres} Wheeler ({axleData.numAxles} Axles)
        </span>
      </div>

      {/* Number of Axles Selection */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-on-surface-variant">Select Number of Axles:</span>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleNumAxlesChange(num)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                axleData.numAxles === num
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-surface-container-lowest text-on-surface hover:bg-surface-container border-outline-variant/20"
              }`}
            >
              {num} Axles
            </button>
          ))}
        </div>
      </div>

      {/* Per-Axle Tyre Count Selector */}
      <div className="space-y-2.5 pt-2 border-t border-outline-variant/10">
        <span className="text-xs font-semibold text-on-surface-variant">Configure Tyres per Axle:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {axleData.axleTyres.map((tyreCount, index) => {
            const isSteering = index === 0;
            const axleLabel = isSteering ? `Axle ${index + 1} (Front Steer)` : `Axle ${index + 1} (Drive / Rear)`;

            return (
              <div
                key={index}
                className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/15 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center text-xs font-bold text-on-surface">
                  <span>{axleLabel}</span>
                  <span className="text-primary font-mono">{tyreCount} Tyres</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTyresPerAxleChange(index, 2)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                      tyreCount === 2
                        ? "bg-secondary text-white border-secondary"
                        : "bg-surface-container text-on-surface-variant border-transparent hover:bg-surface-container-high"
                    }`}
                  >
                    2 Tyres (Single)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTyresPerAxleChange(index, 4)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                      tyreCount === 4
                        ? "bg-secondary text-white border-secondary"
                        : "bg-surface-container text-on-surface-variant border-transparent hover:bg-surface-container-high"
                    }`}
                  >
                    4 Tyres (Dual)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Axle Preview Diagram */}
      <div className="mt-3 p-3 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/10 flex items-center justify-between text-xs font-medium text-on-surface-variant">
        <span className="font-bold text-on-surface">Serialized Notation:</span>
        <span className="font-mono text-primary font-bold">{serializeAxleConfig(axleData)}</span>
      </div>
    </div>
  );
}
