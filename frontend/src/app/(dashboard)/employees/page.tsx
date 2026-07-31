"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import EmployeeCard from "@/components/employees/EmployeeCard";
import CreateEmployeeModal from "@/components/employees/CreateEmployeeModal";
import SalaryHistoryModal from "@/components/common/SalaryHistoryModal";
import { EmployeeRecord } from "@/types/employee";
import { authenticatedFetch } from "@/lib/api";

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<EmployeeRecord | null>(null);
  const [salaryHistoryEmployee, setSalaryHistoryEmployee] = useState<EmployeeRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("deposity_token");
      if (!token) {
        router.push("/");
      }
    }
  }, [router]);

  const loadEmployees = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await authenticatedFetch("/employees");
      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
      let localData: EmployeeRecord[] = await response.json();
      if (!Array.isArray(localData)) localData = [];

      // Fetch organization members from AARCSX Identity via Supabase REST API
      const token = typeof window !== "undefined" ? localStorage.getItem("deposity_token") : null;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGRsYW5zcGpxZXd5cXVydnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMDc1ODcsImV4cCI6MjA5ODU4MzU4N30.IiDDORIdoN74WqlJAt4ni4OJyKq2S50Jh24rxBwcW5I";
      let identityMembers: any[] = [];
      if (token) {
        try {
          const supabaseRes = await fetch(
            "https://zrxdlanspjqewyqurvvl.supabase.co/rest/v1/organization_members?select=id,organization_id,user_id,role,status,created_at,profiles(id,email,full_name,avatar_url)",
            {
              headers: {
                Authorization: `Bearer ${token}`,
                apikey: anonKey,
              },
            }
          );
          if (supabaseRes.ok) {
            identityMembers = await supabaseRes.json();
          }
        } catch (e) {
          console.warn("Could not fetch Identity organization members:", e);
        }
      }

      // Sync Identity members into local employees list if not already present
      if (Array.isArray(identityMembers) && identityMembers.length > 0) {
        for (const m of identityMembers) {
          const profile = m.profiles || {};
          const email = profile.email || "";
          const name = profile.full_name || (email ? email.split("@")[0] : "Staff Member");
          const role = m.role || "Employee";
          const avatar = profile.avatar_url || "";

          // Match existing record by email or name
          const existingIndex = localData.findIndex(
            (e) =>
              (email && e.email && e.email.toLowerCase() === email.toLowerCase()) ||
              (e.name && name && e.name.toLowerCase() === name.toLowerCase())
          );

          if (existingIndex >= 0) {
            // Update existing local record with latest real Identity role & name
            localData[existingIndex] = {
              ...localData[existingIndex],
              role: role, // Sync real Identity role (e.g. Employee, Manager, Admin, Owner)
              name: localData[existingIndex].name || name,
              email: localData[existingIndex].email || email,
              avatar: localData[existingIndex].avatar || avatar,
            };
          } else {
            // Auto-create local employee record for newly joined Identity staff
            const newEmpData: EmployeeRecord = {
              name,
              email,
              role,
              phone: profile.phone || "+91 9876543210",
              joiningDate: m.created_at
                ? new Date(m.created_at).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
              baseSalary: role === "Owner" ? 0 : 25000,
              pendingBalance: 0,
              status: m.status === "active" ? "Active" : "Inactive",
              avatar,
            };

            // Post to Deposity backend so it persists
            try {
              const createRes = await authenticatedFetch("/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newEmpData),
              });
              if (createRes.ok) {
                const created = await createRes.json();
                localData.push(created);
              } else {
                localData.push(newEmpData);
              }
            } catch {
              localData.push(newEmpData);
            }
          }
        }
      }

      setEmployees(localData);
    } catch (err: any) {
      setFetchError(err.message || "Failed to load employees");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleCreateOrUpdate = async (data: EmployeeRecord) => {
    const isEdit = !!data.id;
    const url = isEdit ? `/employees/${data.id}` : "/employees";
    const method = isEdit ? "PUT" : "POST";

    const response = await authenticatedFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to ${isEdit ? "update" : "create"} employee`);
    }

    await loadEmployees();
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      const response = await authenticatedFetch(`/employees/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete employee");
      await loadEmployees();
    } catch (err: any) {
      alert(err.message || "Could not delete employee");
    }
  };

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const q = searchQuery.toLowerCase();
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.phone.toLowerCase().includes(q) ||
        (e.email && e.email.toLowerCase().includes(q))
    );
  }, [employees, searchQuery]);

  // Statistics
  const activeCount = employees.filter((e) => e.status === "Active").length;
  const totalBasePayroll = employees.reduce((acc, curr) => acc + (curr.baseSalary || 0), 0);
  const totalPendingSalary = employees.reduce((acc, curr) => acc + (curr.pendingBalance || 0), 0);

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl">badge</span>
              <h1 className="text-3xl font-black text-on-surface tracking-tight">Employees Portal</h1>
            </div>
            <p className="text-sm font-medium text-on-surface-variant mt-1">
              Staff members are synced from AARCSX Identity. Configure Monthly Base Salary, Pending Balances, and Status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://identity.aarcsx.com/organizations"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/15 text-on-surface rounded-2xl font-bold text-sm transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg text-primary">mail</span>
              Invite Staff via Identity
            </a>
          </div>
        </div>

        {/* Metrics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/10 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-outline block">Total Staff</span>
            <span className="text-2xl font-black text-on-surface mt-1 block tabular-nums">{employees.length}</span>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/10 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">Active Employees</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block tabular-nums">{activeCount}</span>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/10 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-outline block">Monthly Payroll</span>
            <span className="text-2xl font-black text-on-surface mt-1 block tabular-nums">
              ₹{totalBasePayroll.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/10 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 block">Pending Salaries</span>
            <span
              className={`text-2xl font-black mt-1 block tabular-nums ${
                totalPendingSalary > 0 ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              ₹{totalPendingSalary.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-surface-container-lowest p-2 rounded-2xl border border-outline-variant/10 shadow-xs flex items-center gap-3 px-4">
          <span className="material-symbols-outlined text-outline">search</span>
          <input
            type="text"
            placeholder="Search employees by name, designation, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-on-surface outline-none font-medium placeholder:text-outline"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-outline hover:text-on-surface font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Employee Cards List */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-full py-16 text-center text-sm font-semibold text-on-surface-variant">
              Loading employee database...
            </div>
          ) : fetchError ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-error/30 bg-error/5 p-6">
              <span className="material-symbols-outlined text-4xl text-error mb-2">cloud_off</span>
              <p className="text-sm font-bold text-error">{fetchError}</p>
              <button
                onClick={loadEmployees}
                className="mt-4 px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:opacity-90"
              >
                Retry
              </button>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-outline-variant/20 bg-surface-container-lowest p-8">
              <span className="material-symbols-outlined text-5xl text-outline mb-3">badge</span>
              <p className="text-base font-bold text-on-surface">No employees registered yet</p>
              <p className="text-xs text-on-surface-variant mt-1 max-w-sm">
                Register your fleet managers, accountants, mechanics, and yard operators to track their salaries and pending balances.
              </p>
              <button
                onClick={() => {
                  setEmployeeToEdit(null);
                  setIsModalOpen(true);
                }}
                className="mt-5 px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md"
              >
                Register Employee
              </button>
            </div>
          ) : (
            filteredEmployees.map((emp) => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                onEdit={() => {
                  setEmployeeToEdit(emp);
                  setIsModalOpen(true);
                }}
                onDelete={() => handleDelete(emp.id)}
                onViewSalaryHistory={() => setSalaryHistoryEmployee(emp)}
              />
            ))
          )}
        </div>

        {/* Modals */}
        <CreateEmployeeModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEmployeeToEdit(null);
          }}
          onSubmit={handleCreateOrUpdate}
          employeeToEdit={employeeToEdit}
        />

        {salaryHistoryEmployee && (
          <SalaryHistoryModal
            isOpen={!!salaryHistoryEmployee}
            onClose={() => setSalaryHistoryEmployee(null)}
            recipientType="employee"
            recipientId={salaryHistoryEmployee.id || ""}
            recipientName={salaryHistoryEmployee.name}
            baseSalary={salaryHistoryEmployee.baseSalary}
            pendingBalance={salaryHistoryEmployee.pendingBalance}
          />
        )}
      </div>
    </>
  );
}
