"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getOrgNameFromToken, authenticatedFetch } from "@/lib/api";
import { parsePermitDetails } from "@/types/vehicle";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [orgName, setOrgName] = useState("OnWay");
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOrgName(getOrgNameFromToken());

    const handleOrgNameChange = () => {
      setOrgName(getOrgNameFromToken());
    };
    window.addEventListener("deposity_org_name_changed", handleOrgNameChange);
    return () => {
      window.removeEventListener("deposity_org_name_changed", handleOrgNameChange);
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await authenticatedFetch("/vehicles");
      if (res.ok) {
        const vehicles = await res.json();
        const compiledAlerts: any[] = [];
        
        (vehicles || []).forEach((v: any) => {
          const docs = [
            { name: "RC", fullName: "Registration Certificate (RC)", expiry: v.compliance.rcExpiry },
            { name: "Insurance", fullName: "Insurance Policy", expiry: v.compliance.insuranceExpiry },
            { name: "PUC", fullName: "PUC Certificate", expiry: v.compliance.pucExpiry },
            { name: "Fitness", fullName: "Fitness Certificate", expiry: v.compliance.fitnessExpiry },
            { name: "FASTag", fullName: "FASTag Expiry", expiry: v.compliance.fastagExpiry },
          ];
          
          const permit = parsePermitDetails(v.compliance.permitDetails || "");
          if (permit.hasNational) {
            docs.push({ name: "NP", fullName: "National Permit", expiry: permit.nationalExpiry });
          }
          if (permit.hasState && permit.statePermits) {
            permit.statePermits.forEach((sp: any) => {
              docs.push({ name: `SP-${sp.name}`, fullName: `State Permit (${sp.name})`, expiry: sp.expiry });
            });
          }
          
          docs.forEach((doc) => {
            if (doc.expiry) {
              const exp = new Date(doc.expiry);
              const now = new Date();
              if (exp < now) {
                compiledAlerts.push({
                  id: `${v.id}-${doc.name}`,
                  vehicleId: v.id,
                  regNum: v.core.registrationNumber,
                  docName: doc.fullName,
                  status: "Expired",
                  expiryDate: exp,
                });
              } else {
                const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays <= 30) {
                  compiledAlerts.push({
                    id: `${v.id}-${doc.name}`,
                    vehicleId: v.id,
                    regNum: v.core.registrationNumber,
                    docName: doc.fullName,
                    status: "Expiring Soon",
                    daysLeft: diffDays,
                    expiryDate: exp,
                  });
                }
              }
            }
          });
        });
        setAlerts(compiledAlerts);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 600000);
    return () => clearInterval(interval);
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-xl font-inter antialiased tracking-[-0.01em] top-0 sticky z-45 border-b border-outline-variant/10 shadow-[0px_20px_40px_rgba(23,28,31,0.06)] flex justify-between items-center w-full px-6 py-3 h-16">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden text-slate-500 hover:bg-slate-50 rounded-lg p-2 active:scale-[0.98] transition-transform duration-150"
          id="mobile-menu-button"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="text-xl font-bold tracking-tighter text-primary md:hidden">{orgName}</div>

        {/* Search (Web) */}
        <div className="hidden md:flex items-center bg-surface-container-highest rounded-full px-4 py-2 border border-outline-variant/15 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[20px]">search</span>
          <input
            className="bg-transparent border-none outline-none text-sm w-64 text-on-surface placeholder-on-surface-variant focus:ring-0"
            placeholder="Search vehicles, drivers..."
            type="text"
            id="global-search"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 relative">
        {/* Notifications Button */}
        <div ref={popoverRef} className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-full relative transition-all duration-150 active:scale-[0.98] ${
              isOpen ? "bg-slate-100 text-primary" : "text-slate-500 hover:bg-slate-50"
            }`} 
            id="notifications-button"
          >
            <span className="material-symbols-outlined">notifications</span>
            {alerts.length > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-error text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Card */}
          {isOpen && (
            <div className="absolute right-0 mt-2.5 w-80 md:w-96 bg-white border border-outline-variant/15 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest">
                <span className="font-bold text-sm text-on-surface">Compliance Alerts</span>
                {alerts.length > 0 && (
                  <span className="bg-error/10 text-error px-2 py-0.5 rounded text-xs font-bold uppercase">
                    {alerts.length} Warnings
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/10">
                {alerts.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-3xl text-outline mb-1">check_circle</span>
                    <p className="text-xs font-semibold">All documents are up-to-date.</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <Link 
                      key={alert.id}
                      href={`/vehicles/${alert.vehicleId}`}
                      onClick={() => setIsOpen(false)}
                      className="p-4 flex gap-3 hover:bg-slate-50 transition-colors block text-left"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        alert.status === "Expired" ? "bg-error/10 text-error" : "bg-warning/10 text-warning"
                      }`}>
                        <span className="material-symbols-outlined text-[18px]">
                          {alert.status === "Expired" ? "gpp_bad" : "warning"}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-on-surface uppercase tracking-wider font-mono">
                            {alert.regNum}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            alert.status === "Expired" ? "bg-error/10 text-error" : "bg-warning/10 text-warning"
                          }`}>
                            {alert.status}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1">
                          {alert.docName} expires on {alert.expiryDate.toLocaleDateString("en-GB")}.
                        </p>
                        {alert.daysLeft !== undefined && (
                          <p className="text-[10px] font-semibold text-warning mt-0.5">
                            {alert.daysLeft} day(s) remaining
                          </p>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <button className="hidden md:flex bg-gradient-to-br from-primary to-primary-container text-on-primary px-4 py-2 rounded-xl text-sm font-bold items-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]">
          <span className="material-symbols-outlined text-[18px]">bolt</span>
          Quick Action
        </button>

        <div className="relative group cursor-pointer" id="user-menu">
          <img
            alt="User Profile"
            className="w-8 h-8 rounded-full border border-outline-variant/15"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-wxFFyfL7yz0QWI3GLVdCgbJjknC9aXq4SbR-uXTsyOGVAewv91asAaac59YM1AmRcU2gfW0UF_Uj2KdtZITlNszETDGSIBlTa97kyR7XAQEQKL7eC_wHENueajS_IbcGTZdMBbYuLSkXioOwd6PoYiGYQRBt2rohsOuyfX6Txdq0H1ODCyCsvLiUhUxlRUZLNT67AMYWZvhh-Ku3A5L80VpVcokV-6RT5PR3Ls9vNFqblwjtFiZNgg0QULAAHE6SKJIQuhO1NVVl"
          />
        </div>
      </div>
    </header>
  );
}
