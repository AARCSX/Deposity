"use client";

import LayoutWrapper from "@/components/layout/LayoutWrapper";
import MetricCard from "@/components/dashboard/MetricCard";
import Image from "next/image";

const employeesData = [
  {
    id: "EMP-9021",
    name: "Rajesh Sharma",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6nGhFe5d3IZp04iyETyXIa48rEsE78pMmxzG054NsX0BHr3q9KhlJRyD-n0DUtqKZwQ2q313qIlFe_x7TyEmxEs7TuERCKr43R6h_Wty6UISj06gdekrPXfeGs9Me5O14DP_qTQPmfPodboE0q4zLcR0OzFSggSmxUrR0g7Uf5shCqh77lFsrVsaN8mCl33WmCmqEPKsf1ja0k7Im0EHa1tfZL048Po2rQ4CDcpG3mXKoUnh8jNRxKFkxyAb6NgTPDyt-naJC7B_V",
    phone: "+91 98234 56789",
    contactType: "Direct Line",
    role: "Admin",
    roleColor: "bg-primary/10 text-primary",
    lastLogin: "14/10/2023",
    lastLoginTime: "10:42 AM",
    status: "Active",
    statusColor: "bg-tertiary",
  },
  {
    id: "EMP-8845",
    name: "Anjali Patel",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuOdGwfTsgvwt59hQMvwPYVc76ysE_kovUXroAKXr6WGLapbfrcddSAzjq12gVzHs4zHKW07e_0uXnUx39UBHsuqhAi8IUWoJVs1GcpjT5eo7QzxCbtu_1mdsLgqfddSSVdGoZIa89z20ulloYqWnMJHuJxUdTEl5X7JrXJBI4Db0ImALaN72W2cZCTHNPS658HsGAC8H-avtc2YRx7CXT8X-A9E5jR7vYBn4ZNs3FpA7FmzcDqD8KTAyDgiKGAWH1IepbcUat2zqRC",
    phone: "+91 88776 54321",
    contactType: "Work Mobile",
    role: "Manager",
    roleColor: "bg-secondary-container text-on-secondary-container",
    lastLogin: "14/10/2023",
    lastLoginTime: "09:15 AM",
    status: "Active",
    statusColor: "bg-tertiary",
  },
  {
    id: "EMP-7721",
    name: "Vikram Kumar",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBE-A09siMf97fIM6cfq5f0QyHxj4GDNaSunjiY0H7r0ZJk4IeOw4wxx5Uy39x4BcdZt97C0UIHNBmfEMYKH1qLRHt62l-W_XktLJ67dQkcC3Sbb2nfRrytBNu_qSnWzJssyIh0eP3w73ZyKcsq_ncgUNcJCzCGcZFAdanKe5ddmlmiIGW6Mdvf4cGdEGB-_40pskMG5mCzjB58r6g-uUsWJ6daUmPieBMdraIcweqqegZTQbKU8KWaUwnd-YdUeRPGMH4JIymATMAR",
    phone: "+91 76543 21098",
    contactType: "HQ Desk",
    role: "Data Entry",
    roleColor: "bg-surface-container-highest text-on-surface-variant",
    lastLogin: "13/10/2023",
    lastLoginTime: "06:45 PM",
    status: "Offline",
    statusColor: "bg-outline-variant",
  },
  {
    id: "EMP-4450",
    name: "Suresh Das",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYaiZ2C_qVp_0jwYEoaPT0rwnusDod5LE9mW7-I-OGiVt9zS0wBNt9iW06vYaQIfh7bq1XnM-v_F0V8fFWVKDG_VBxx_xOmvQkTheuoGhS8xOg0hYbioGoi9YK_wy54C4-nx3pHanvESEeU_SX6F6iFGH8bigO5KvOGk6me0Mz1aNP-NllignJycJn9jod0zQGm1taOvjfD-UJAa01dElnUD5tzS4eZH1C0FLacXXQZsmDZq-2IJKsdJh49sozfYRbhU1kyBN296ir",
    phone: "+91 99001 12233",
    contactType: "Mobile",
    role: "Data Entry",
    roleColor: "bg-surface-container-highest text-on-surface-variant",
    lastLogin: "11/10/2023",
    lastLoginTime: "11:10 AM",
    status: "Suspended",
    statusColor: "bg-error",
  },
];

export default function EmployeesPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <nav className="flex items-center gap-2 text-xs font-bold text-primary mb-2 uppercase tracking-widest">
              <span>Organization</span>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <span>Human Resources</span>
            </nav>
            <h1 className="text-[2.75rem] font-black tracking-tighter text-on-surface leading-tight">Team Directory</h1>
            <p className="text-on-surface-variant mt-1 font-medium text-sm">Manage staff roles, access levels, and active sessions across the network.</p>
          </div>
          <button className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all shrink-0 flex items-center gap-2">
            <span className="material-symbols-outlined">person_add</span>
            Add Employee
          </button>
        </div>

        {/* Bento Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard label="Total Staff" value="1,240" trend={{ value: "+12%", isUp: true }} icon="groups" theme="primary" />
          <MetricCard label="Active Now" value="842" subtitle="Real-time session" icon="online_prediction" theme="tertiary" />
          <MetricCard label="Admins" value="14" subtitle="Global Access" icon="admin_panel_settings" theme="secondary" />
          <MetricCard label="Avg. Login" value="08:45" subtitle="AM IST (Standard)" icon="schedule" theme="primary" />
        </div>

        {/* Employee List View */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/10 overflow-hidden">
          <div className="px-8 py-6 bg-surface-container-low/30 border-b border-outline-variant/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="px-5 py-2.5 bg-white text-primary text-xs font-bold rounded-xl shadow-sm border border-outline-variant/20">All Staff</button>
              <button className="px-5 py-2.5 text-on-surface-variant text-xs font-bold hover:bg-white transition-all rounded-xl">Managers</button>
              <button className="px-5 py-2.5 text-on-surface-variant text-xs font-bold hover:bg-white transition-all rounded-xl">Data Entry</button>
            </div>
            <button className="p-2 text-outline hover:text-primary transition-colors">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[0.7rem] font-bold text-outline uppercase tracking-[0.1em] bg-surface-container-low/20">
                  <th className="px-8 py-4">Employee</th>
                  <th className="px-8 py-4">Contact</th>
                  <th className="px-8 py-4">Role</th>
                  <th className="px-8 py-4">Last Login</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {employeesData.map((emp) => (
                  <tr key={emp.id} className="hover:bg-surface-container-low/50 transition-colors group cursor-pointer">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-primary/5 bg-surface-container flex items-center justify-center overflow-hidden shrink-0">
                          <Image src={emp.avatar} alt={emp.name} width={48} height={48} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-on-surface">{emp.name}</div>
                          <div className="text-xs text-outline font-semibold uppercase tracking-tighter">{emp.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="text-sm tabular-nums font-bold text-on-surface leading-none">{emp.phone}</div>
                      <div className="text-[10px] uppercase font-black text-outline-variant mt-1 tracking-widest">{emp.contactType}</div>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${emp.roleColor}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-sm text-on-surface font-bold tabular-nums">{emp.lastLogin}</span>
                      <span className="text-[10px] text-outline font-black ml-2 uppercase">{emp.lastLoginTime}</span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${emp.statusColor} ${emp.status === 'Active' ? 'animate-pulse' : ''}`}></span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${emp.status === 'Suspended' ? 'text-error' : emp.status === 'Active' ? 'text-tertiary' : 'text-outline'}`}>
                          {emp.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button className="p-2 text-outline hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-xl">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-8 py-6 bg-surface-container-low/10 border-t border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[0.7rem] font-bold text-outline uppercase tracking-widest">
            <span>Showing {employeesData.length} of 1,240 employees</span>
            <div className="flex gap-2">
              <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white border border-outline-variant/15 transition-all">
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">1</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white border border-outline-variant/15 transition-all">2</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white border border-outline-variant/15 transition-all">3</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white border border-outline-variant/15 transition-all">
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-gradient-to-br from-primary to-primary-container rounded-3xl p-10 text-white relative overflow-hidden group shadow-2xl shadow-blue-500/10">
            <div className="relative z-10 max-w-sm">
              <h3 className="text-3xl font-black mb-3 tracking-tighter leading-tight">Optimize Team Shift Efficiency</h3>
              <p className="text-white/80 font-medium text-sm mb-8 leading-relaxed">Our data shows that shift overlaps can be reduced by 15% using the new AI-powered Auto-Scheduler.</p>
              <button className="bg-white text-primary px-8 py-3 rounded-xl font-bold text-sm shadow-xl shadow-black/10 hover:bg-surface transition-colors active:scale-95">View Full Analysis</button>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[180px] text-white/10 rotate-12 transition-transform group-hover:rotate-6 duration-700 select-none">query_stats</span>
          </div>
          
          <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">security_update_good</span>
              Security Overview
            </h3>
            <div className="space-y-4">
              <SecurityItem icon="shield" label="2FA Enabled" value="98%" color="text-tertiary" />
              <SecurityItem icon="key" label="Expiring Credentials" value="12" color="text-warning" />
              <SecurityItem icon="history" label="Failed Logins" value="3" color="text-error" />
            </div>
            <button className="w-full mt-8 py-3 rounded-xl border-2 border-outline-variant/30 text-xs font-black uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-all">
              Security Audit Log
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-auto py-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-xs text-on-surface-variant font-medium">© 2026 OnWay Logistics HQ. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="text-xs text-outline hover:text-primary font-bold uppercase tracking-widest transition-colors" href="#">Privacy Policy</a>
            <a className="text-xs text-outline hover:text-primary font-bold uppercase tracking-widest transition-colors" href="#">Support Portal</a>
          </div>
        </footer>
      </div>
    </LayoutWrapper>
  );
}

function SecurityItem({ icon, label, value, color }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/5 shadow-sm hover:translate-x-2 transition-transform cursor-pointer">
      <div className="flex items-center gap-3">
        <span className={`material-symbols-outlined ${color}`}>{icon}</span>
        <span className="text-[0.7rem] font-bold text-on-surface uppercase tracking-tight">{label}</span>
      </div>
      <span className={`text-xs font-black ${color}`}>{value}</span>
    </div>
  );
}
