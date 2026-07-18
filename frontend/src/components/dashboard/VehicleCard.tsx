"use client";

import Link from "next/link";
import { useState } from "react";
import { parsePermitDetails } from "@/types/vehicle";

export interface VehicleCardProps {
  id: string;
  plateNumber: string;
  vehicleType: string;
  driver: {
    name: string;
    phone: string;
    avatar: string;
  } | null;
  compliance: {
    rcExpiry: string;
    rcIssuance?: string;
    insuranceExpiry: string;
    insuranceIssuance?: string;
    pucExpiry: string;
    pucIssuance?: string;
    fitnessExpiry: string;
    fitnessIssuance?: string;
    permitDetails: string;
  };
  gpsActive: boolean;
  emiDate?: string;
  locationState?: "online" | "offline";
  onEdit?: (id: string) => void;
}

export default function VehicleCard({
  id,
  plateNumber,
  vehicleType,
  driver,
  compliance,
  gpsActive,
  emiDate,
  locationState = "online",
  onEdit,
}: VehicleCardProps) {
  const [hovering, setHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const getDaysRemaining = (expiryStr?: string): number => {
    if (!expiryStr) return 999;
    const expiry = new Date(expiryStr);
    if (isNaN(expiry.getTime())) return 999;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const fitDays = getDaysRemaining(compliance.fitnessExpiry);
  const rcDays = getDaysRemaining(compliance.rcExpiry);
  const insDays = getDaysRemaining(compliance.insuranceExpiry);
  const pucDays = getDaysRemaining(compliance.pucExpiry);

  const permitData = parsePermitDetails(compliance.permitDetails);
  const npDays = permitData.hasNational ? getDaysRemaining(permitData.nationalExpiry) : 999;
  
  let spDays = 999;
  if (permitData.hasState && permitData.statePermits && permitData.statePermits.length > 0) {
    spDays = Math.min(...permitData.statePermits.map(sp => getDaysRemaining(sp.expiry)));
  }

  const getDocState = (days: number): "valid" | "expiring" | "invalid" => {
    if (days < 15) return "invalid";
    if (days <= 30) return "expiring";
    return "valid";
  };

  const docs = {
    fit: getDocState(fitDays),
    rc: getDocState(rcDays),
    ins: getDocState(insDays),
    puc: getDocState(pucDays),
    np: permitData.hasNational ? getDocState(npDays) : ("inactive" as const),
    sp: permitData.hasState && permitData.statePermits.length > 0 ? getDocState(spDays) : ("inactive" as const),
  };

  const docConfig = (state: "valid" | "expiring" | "invalid" | "inactive") => {
    switch (state) {
      case "valid":
        return "bg-[#34a853]";
      case "expiring":
        return "bg-[#f59e0b]";
      case "invalid":
        return "bg-[#ef4444]";
      case "inactive":
      default:
        return "bg-slate-300";
    }
  };

  const expiredDocsList: string[] = [];
  const expiringDocsList: string[] = [];

  const checkDocAlert = (name: string, days: number) => {
    if (days < 0) {
      expiredDocsList.push(`${name} expired ${Math.abs(days)} day(s) ago`);
    } else if (days < 15) {
      expiredDocsList.push(`${name} expiring in ${days} day(s)`);
    } else if (days <= 30) {
      expiringDocsList.push(`${name} expiring in ${days} day(s)`);
    }
  };

  checkDocAlert("Fitness Certificate", fitDays);
  checkDocAlert("Registration Certificate (RC)", rcDays);
  checkDocAlert("Insurance", insDays);
  checkDocAlert("PUC", pucDays);
  if (permitData.hasNational) {
    checkDocAlert("National Permit", npDays);
  }
  if (permitData.hasState && permitData.statePermits.length > 0) {
    permitData.statePermits.forEach(sp => {
      const days = getDaysRemaining(sp.expiry);
      checkDocAlert(`State Permit (${sp.name})`, days);
    });
  }

  let overallStatus: "all-good" | "expiring-soon" | "expired-docs" = "all-good";
  let tooltipText = "All documents are up-to-date (expiry > 30 days)";

  if (expiredDocsList.length > 0) {
    overallStatus = "expired-docs";
    tooltipText = `Critical: ${expiredDocsList.join(", ")}`;
  } else if (expiringDocsList.length > 0) {
    overallStatus = "expiring-soon";
    tooltipText = `Warning: ${expiringDocsList.join(", ")}`;
  }

  const cardStyleConfig = {
    "all-good": {
      cardBg: "bg-[#f4fbf7] hover:bg-[#ebf8f0]",
      cardBorder: "border-[#d8ecd8]/70",
      leftBorder: "border-l-4 border-l-[#34a853]",
      badgeBg: "bg-[#e6f6ec] text-[#137333]",
      label: "All Good",
      icon: "check_circle",
    },
    "expiring-soon": {
      cardBg: "bg-[#fffbf0] hover:bg-[#fff7e0]",
      cardBorder: "border-[#fde68a]/50",
      leftBorder: "border-l-4 border-l-[#f59e0b]",
      badgeBg: "bg-[#fef3c7] text-[#b45309]",
      label: "Expiring Soon",
      icon: "warning",
    },
    "expired-docs": {
      cardBg: "bg-[#fff5f5] hover:bg-[#ffebeb]",
      cardBorder: "border-[#fecaca]/50",
      leftBorder: "border-l-4 border-l-[#ef4444]",
      badgeBg: "bg-[#fee2e2] text-[#b91c1c]",
      label: "Expired Docs",
      icon: "error",
    },
  };

  const { cardBg, cardBorder, leftBorder, badgeBg, label, icon } = cardStyleConfig[overallStatus];

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
      className={`group ${cardBg} ${cardBorder} ${leftBorder} rounded-xl p-5 shadow-[0px_20px_40px_rgba(23,28,31,0.06)] border relative overflow-hidden transition-all duration-300 hover:shadow-[0px_30px_50px_rgba(23,28,31,0.1)]`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-on-background tabular-nums">{plateNumber}</h3>
            <span className="bg-surface-container-high text-on-surface-variant text-[0.65rem] uppercase font-bold px-2 py-0.5 rounded-md">
              {vehicleType}
            </span>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${badgeBg}`}>
            <span className="material-symbols-outlined text-[1rem]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {icon}
            </span>
            <span className="text-xs font-bold">{label}</span>
          </div>
        </div>
        <button className="text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>

      {/* Driver Info */}
      <div className="bg-surface-container-low rounded-lg p-3 mb-4 flex items-center gap-3">
        {driver ? (
          <>
            <img
              alt="Driver Avatar"
              className="w-10 h-10 rounded-full object-cover border border-outline-variant/20"
              src={driver.avatar}
            />
            <div>
              <p className="text-sm font-bold text-on-background">{driver.name}</p>
              <p className="text-xs text-on-surface-variant font-medium">{driver.phone}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full border border-dashed border-outline-variant flex items-center justify-center text-on-surface-variant bg-surface">
              <span className="material-symbols-outlined">person_off</span>
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface-variant">Unassigned</p>
              <p className="text-xs text-on-surface-variant/70 font-medium cursor-pointer hover:text-primary transition-colors">Assign driver</p>
            </div>
          </>
        )}
      </div>

      {/* Documents Status */}
      <div className="mb-5">
        <p className="text-[0.7rem] text-on-surface-variant font-bold uppercase tracking-wider mb-2">Documents & Permits</p>
        <div className="flex justify-between items-center px-1 gap-1">
          {[
            { label: "Fit", key: "fit" as const, icon: "verified" },
            { label: "RC", key: "rc" as const, icon: "app_registration" },
            { label: "Ins", key: "ins" as const, icon: "health_and_safety" },
            { label: "PUC", key: "puc" as const, icon: "cloud" },
            { label: "NP", key: "np" as const, icon: "public" },
            { label: "SP", key: "sp" as const, icon: "map" },
          ].map((doc) => (
            <div key={doc.key} className="flex flex-col items-center gap-1">
              <div className="relative w-8 h-8 rounded-full bg-surface flex items-center justify-center border border-outline-variant/15 text-on-surface-variant">
                <span className="material-symbols-outlined text-[1.1rem]">{doc.icon}</span>
                <div
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-surface-container-lowest ${docConfig(
                    docs[doc.key]
                  )}`}
                ></div>
              </div>
              <span className={`text-[0.65rem] font-medium ${docs[doc.key] === "invalid" ? "text-error font-bold" : "text-on-surface-variant"}`}>
                {doc.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Info & Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/15">
        <div className={`flex items-center gap-1.5 ${gpsActive ? "text-tertiary" : "text-on-surface-variant"}`}>
          <span className={`material-symbols-outlined text-[1.1rem] ${gpsActive ? "animate-pulse" : ""}`} style={{ fontVariationSettings: gpsActive ? "'FILL' 1" : "'FILL' 0" }}>
            {gpsActive ? "satellite_alt" : "location_off"}
          </span>
          <span className="text-xs font-bold">{gpsActive ? "GPS Active" : "GPS Offline"}</span>
          {emiDate && <span className="text-[10px] text-on-surface-variant ml-2">EMI: {emiDate}</span>}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit?.(id)}
            className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary-fixed transition-colors border border-outline-variant/15"
          >
            <span className="material-symbols-outlined text-[1.1rem]">edit</span>
          </button>
          <Link 
            href={`/vehicles/${id}`}
            className="px-4 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold text-sm transition-colors"
          >
            Details
          </Link>
        </div>
      </div>

      {/* Dynamic Cursor Tooltip */}
      {hovering && (
        <div
          className="fixed pointer-events-none z-50 px-3 py-2 bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-semibold rounded-lg shadow-xl border border-white/10 max-w-[260px] flex items-center gap-1.5 transition-all duration-100 ease-out"
          style={{
            left: `${mousePos.x + 12}px`,
            top: `${mousePos.y - 36}px`,
          }}
        >
          {overallStatus === "all-good" && (
            <span className="material-symbols-outlined text-[1rem] text-[#34a853]">check_circle</span>
          )}
          {overallStatus === "expiring-soon" && (
            <span className="material-symbols-outlined text-[1rem] text-[#f59e0b]">warning</span>
          )}
          {overallStatus === "expired-docs" && (
            <span className="material-symbols-outlined text-[1rem] text-[#ef4444]">error</span>
          )}
          <span className="leading-tight">{tooltipText}</span>
        </div>
      )}
    </div>
  );
}
