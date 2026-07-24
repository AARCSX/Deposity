"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getOrgNameFromToken } from "@/lib/api";

const navItems = [
  { label: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { label: "Vehicles", icon: "local_shipping", href: "/vehicles" },
  { label: "Drivers", icon: "person", href: "/drivers" },
  { label: "Employees", icon: "badge", href: "/employees" },
  { label: "Companies", icon: "business", href: "/companies" },
  { label: "Trips", icon: "route", href: "/trips" },
  { label: "Expenses", icon: "payments", href: "/expenses" },
  { label: "Maintenance", icon: "build", href: "/maintenance" },
  { label: "Reports", icon: "assessment", href: "/reports" },
  { label: "Activity Logs", icon: "history", href: "/activity-logs" },
  { label: "Settings", icon: "settings", href: "/settings" },
];

const footerItems = [
  { name: "Help", href: "/help", icon: "help" },
  { name: "Logout", href: "/logout", icon: "logout" },
];

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const [orgName, setOrgName] = useState("OnWay");

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

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <nav
        className={`bg-slate-950 font-inter text-sm font-medium tracking-tight h-screen w-64 fixed left-0 top-0 overflow-y-auto shadow-2xl shadow-black/20 flex flex-col gap-1 py-6 z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="px-6 pb-6">
          <Link href="/dashboard" className="block group">
            <h1 className="text-2xl font-black tracking-tighter text-white group-hover:text-primary transition-colors">{orgName}</h1>
            <p className="text-slate-400 text-xs">AARCSX Deposity</p>
          </Link>
        </div>


        <div className="px-4 mb-4">
          <Link 
            href="/trips?create=true"
            className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Trip
          </Link>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mx-2 border-r-4 transition-all duration-300 hover:translate-x-1 ${
                  isActive
                    ? "bg-primary/10 text-primary border-primary"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border-transparent"
                }`}
                onClick={onClose}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto flex flex-col gap-1 border-t border-slate-800 pt-4 px-2">
          {footerItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mx-2 border-r-4 transition-all duration-300 hover:translate-x-1 ${
                  isActive
                    ? "bg-primary/10 text-primary border-primary font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border-transparent"
                }`}
                onClick={onClose}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
