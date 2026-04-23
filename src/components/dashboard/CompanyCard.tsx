"use client";

import Image from "next/image";

interface CompanyCardProps {
  name: string;
  logo: string;
  status: "Premium Partner" | "Standard Account" | "Critical: Payment Overdue" | "Overdue";
  location: string;
  contactPerson: string;
  phone: string;
  email?: string;
  totalValue: string;
  isPaid?: boolean;
  pendingAmount?: string;
  id: string;
}

export default function CompanyCard({
  name,
  logo,
  status,
  location,
  contactPerson,
  phone,
  email,
  totalValue,
  isPaid,
  pendingAmount,
  id,
}: CompanyCardProps) {
  const isOverdue = status.includes("Overdue");

  return (
    <div className={`bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/10 group ${isOverdue ? "hover:shadow-error/5 ring-1 ring-error/5" : "hover:shadow-primary/5"}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="w-14 h-14 rounded-xl bg-surface-container overflow-hidden flex items-center justify-center p-2">
          <Image
            src={logo}
            alt={name}
            width={56}
            height={56}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-[0.65rem] px-2 py-1 rounded font-bold uppercase tracking-tighter ${isOverdue ? "bg-error-container text-on-error-container" : status === "Premium Partner" ? "bg-tertiary-fixed text-on-tertiary-fixed" : "bg-surface-container-high text-on-surface-variant"}`}>
            {status}
          </span>
          <span className="text-[0.65rem] text-outline mt-1 tabular-nums">ID: {id}</span>
        </div>
      </div>

      <h3 className={`text-xl font-bold tracking-tight text-on-surface transition-colors ${isOverdue ? "group-hover:text-error" : "group-hover:text-primary"}`}>
        {name}
      </h3>
      <p className="text-sm text-on-surface-variant mb-6">{location}</p>

      <div className="space-y-4 mb-8">
        <ContactInfo icon="person" label="Contact Person" value={contactPerson} isOverdue={isOverdue} />
        <ContactInfo icon="call" label="Phone" value={phone} isOverdue={isOverdue} isMono />
        {email && <ContactInfo icon="alternate_email" label="Email" value={email} isOverdue={isOverdue} />}
      </div>

      <div className={`p-4 rounded-xl flex items-center justify-between ${isOverdue ? "bg-error-container/10 border border-error/10" : "bg-surface-container-low"}`}>
        <div>
          <p className={`text-[0.65rem] font-bold uppercase tracking-widest ${isOverdue ? "text-error" : "text-outline"}`}>Total Value</p>
          <p className="text-xl font-black tabular-nums">{totalValue}</p>
        </div>
        <div className="text-right">
          <p className={`text-[0.65rem] font-bold uppercase tracking-widest ${isOverdue ? "text-error" : "text-outline"}`}>
            {isOverdue ? "Pending" : "Status"}
          </p>
          <p className={`text-sm font-black tabular-nums ${isOverdue ? "text-error" : "text-tertiary"}`}>
            {isOverdue ? pendingAmount : "Paid"}
          </p>
        </div>
      </div>
    </div>
  );
}

function ContactInfo({ icon, label, value, isOverdue, isMono }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isOverdue ? "bg-error-container/20 text-error" : "bg-surface-container-low text-primary"}`}>
        <span className="material-symbols-outlined text-lg">{icon}</span>
      </div>
      <div className="flex-grow">
        <p className="text-xs font-bold text-outline uppercase tracking-tighter leading-none">{label}</p>
        <p className={`text-sm font-semibold text-on-surface ${isMono ? "tabular-nums" : ""} truncate`}>{value}</p>
      </div>
    </div>
  );
}
