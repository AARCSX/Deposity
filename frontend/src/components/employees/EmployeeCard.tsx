"use client";

import React from "react";
import Image from "next/image";
import { EmployeeRecord } from "@/types/employee";

interface EmployeeCardProps {
  employee: EmployeeRecord;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewSalaryHistory?: () => void;
}

export default function EmployeeCard({
  employee,
  onEdit,
  onDelete,
  onViewSalaryHistory,
}: EmployeeCardProps) {
  const {
    name,
    role,
    phone,
    email,
    joiningDate,
    baseSalary,
    pendingBalance,
    status,
    avatar,
  } = employee;

  const statusColors: Record<string, string> = {
    Active: "bg-tertiary-fixed text-on-tertiary-fixed",
    "On Leave": "bg-warning-container text-on-warning-container",
    Inactive: "bg-surface-container-highest text-on-surface-variant",
  };

  return (
    <div className="group bg-surface-container-lowest rounded-[2rem] p-1 border border-outline-variant/10 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md h-fit">
      <div className="flex flex-col md:flex-row items-center p-3 gap-6">
        {/* Avatar Section */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface shadow-inner">
            {avatar && avatar.trim().length > 0 ? (
              <Image
                src={avatar}
                alt={name}
                width={96}
                height={96}
                className={`w-full h-full object-cover ${status === "Inactive" ? "grayscale" : ""}`}
              />
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center bg-surface-container-high text-primary ${
                  status === "Inactive" ? "grayscale" : ""
                }`}
              >
                <span className="material-symbols-outlined text-4xl">badge</span>
              </div>
            )}
          </div>
          <div
            className={`absolute bottom-1 right-1 w-6 h-6 border-4 border-surface rounded-full shadow-sm ${
              status === "Active" ? "bg-tertiary-fixed" : "bg-outline-variant"
            }`}
          ></div>
        </div>

        {/* Content Section */}
        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 py-2 w-full">
          {/* Identity & Role */}
          <div className="md:col-span-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-on-surface tracking-tight">{name}</h3>
              <span
                className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter rounded-md ${
                  statusColors[status] || "bg-outline-variant"
                }`}
              >
                {status}
              </span>
              {pendingBalance > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter rounded-md bg-rose-100 text-rose-700 border border-rose-200">
                  Pending: ₹{pendingBalance.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <p className="text-xs font-extrabold text-primary uppercase tracking-wider mt-1">
              {role || "Staff Member"}
            </p>
            <div className="mt-3 flex items-center gap-2 flex-wrap justify-center md:justify-start">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded-full text-xs font-semibold text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">phone</span>
                {phone}
              </div>
              {onViewSalaryHistory && (
                <button
                  onClick={onViewSalaryHistory}
                  className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">history</span>
                  Salary History
                </button>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center space-y-2 text-center md:text-left">
            <div>
              <p className="text-[10px] uppercase font-bold text-outline tracking-wider">Email Address</p>
              <p className="text-sm font-bold text-on-surface-variant truncate">{email || "N/A"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-outline tracking-wider">Joining Date</p>
              <p className="text-sm font-bold text-tertiary tabular-nums">{joiningDate || "N/A"}</p>
            </div>
          </div>

          {/* Financials */}
          <div className="flex flex-col justify-center bg-surface-container-low/50 px-6 py-4 rounded-[1.5rem] text-center md:text-left">
            <div>
              <p className="text-[10px] uppercase font-bold text-outline tracking-wider">Monthly Base Salary</p>
              <p className="text-lg font-black text-on-surface tabular-nums">
                ₹{baseSalary.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="mt-1">
              <p className="text-[10px] uppercase font-bold text-outline tracking-wider">Pending Balance</p>
              <p
                className={`text-sm font-bold tabular-nums ${
                  pendingBalance > 0 ? "text-rose-600 font-extrabold" : "text-emerald-600"
                }`}
              >
                {pendingBalance > 0 ? `₹${pendingBalance.toLocaleString("en-IN")}` : "Fully Paid ✓"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex md:flex-col gap-2 mr-2 flex-shrink-0">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 text-outline hover:text-primary hover:bg-primary/10 rounded-full transition-all cursor-pointer"
              title="Edit Employee"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete ${name}?`)) {
                  onDelete();
                }
              }}
              className="p-2 text-outline hover:text-error hover:bg-error/10 rounded-full transition-all cursor-pointer"
              title="Delete Employee"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
