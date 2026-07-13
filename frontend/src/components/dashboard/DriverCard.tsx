"use client";

import Image from "next/image";

interface DriverCardProps {
  name: string;
  avatar: string;
  status: "Active" | "Inactive" | "On Break";
  phone: string;
  vehicle: string;
  licenseNumber: string;
  licenseExpiry: string;
  salary: string;
  pendingBalance: string;
  isStatusWarning?: boolean;
}

export default function DriverCard({
  name,
  avatar,
  status,
  phone,
  vehicle,
  licenseNumber,
  licenseExpiry,
  salary,
  pendingBalance,
  isStatusWarning,
}: DriverCardProps) {
  const statusColors = {
    Active: "bg-tertiary-fixed text-on-tertiary-fixed",
    Inactive: "bg-surface-container-highest text-on-surface-variant",
    "On Break": "bg-warning-container text-on-warning-container",
  };

  return (
    <div className="group bg-surface-container-lowest rounded-[2rem] p-1 border border-outline-variant/10 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md h-fit">
      <div className="flex flex-col md:flex-row items-center p-3 gap-6">
        {/* Avatar Section */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface shadow-inner">
            {avatar && typeof avatar === "string" && avatar.trim().length > 0 ? (
              <Image
                src={avatar}
                alt={name}
                width={96}
                height={96}
                className={`w-full h-full object-cover ${status === "Inactive" ? "grayscale" : ""}`}
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center bg-surface-container-high text-primary ${status === "Inactive" ? "grayscale" : ""}`}>
                <span className="material-symbols-outlined text-4xl">person</span>
              </div>
            )}
          </div>
          <div className={`absolute bottom-1 right-1 w-6 h-6 border-4 border-surface rounded-full shadow-sm ${status === "Active" ? "bg-tertiary-fixed" : "bg-outline-variant"}`}></div>
        </div>

        {/* Content Section */}
        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 py-2 w-full">
          {/* Identity & Status */}
          <div className="md:col-span-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h3 className="text-lg font-bold text-on-surface tracking-tight">{name}</h3>
              <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter rounded-md ${statusColors[status]}`}>
                {status}
              </span>
            </div>
            <p className="text-sm font-medium text-on-surface-variant flex items-center justify-center md:justify-start gap-1 mt-1">
              <span className="material-symbols-outlined text-sm">phone</span>
              {phone}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-secondary-container/30 rounded-full border border-secondary-container/50">
              <span className="material-symbols-outlined text-sm text-secondary">local_shipping</span>
              <span className="text-xs font-bold text-on-secondary-container uppercase tracking-tight">{vehicle}</span>
            </div>
          </div>

          {/* Documents */}
          <div className="flex flex-col justify-center space-y-2 text-center md:text-left">
            <div>
              <p className="text-[10px] uppercase font-bold text-outline tracking-wider">License Number</p>
              <p className="text-sm font-bold text-on-surface-variant">{licenseNumber}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-outline tracking-wider">Expiry Date</p>
              <p className={`text-sm font-bold tabular-nums ${isStatusWarning ? "text-error" : "text-tertiary"}`}>
                {licenseExpiry}
              </p>
            </div>
          </div>

          {/* Financials */}
          <div className="flex flex-col justify-center bg-surface-container-low/50 px-6 py-4 rounded-[1.5rem] text-center md:text-left">
            <div>
              <p className="text-[10px] uppercase font-bold text-outline tracking-wider">Salary</p>
              <p className="text-lg font-black text-on-surface tabular-nums">{salary}</p>
            </div>
            <div className="mt-1">
              <p className="text-[10px] uppercase font-bold text-outline tracking-wider">Pending Balance</p>
              <p className={`text-sm font-bold tabular-nums ${parseFloat(pendingBalance.replace(/[^0-9.]/g, "")) > 0 ? "text-error" : "text-on-surface-variant"}`}>
                {pendingBalance}
              </p>
            </div>
          </div>
        </div>

        {/* Action */}
        <button className="mr-4 p-2 text-outline hover:text-primary hover:bg-primary/10 rounded-full transition-all group-hover:translate-x-1">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
