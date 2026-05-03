"use client";

import LayoutWrapper from "@/components/layout/LayoutWrapper";
import DriverCard from "@/components/dashboard/DriverCard";

const driversData = [
  {
    name: "Rajesh Kumar",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCddAC3OuJEI7x8z6rXmwXYGXQWB_1nxC_AIefK-Mkpumm4p87uhzDBzMZ2FsO1ABvFfiRLYV5AylMlMwxZ2gQhu-M8aUDvxy5QcrGeC1Nn0kSoNzvv8pAzGJzukHgZqIy1N4QXzryvm6jIr9ScORqMWrQGwpKWKUjF9NZ4R_B2Jl11VMKUEx0d2la9UxV_KMZ2LrJL8x6L1nEhxFgpiK9IGvAmB7eZ9PFVF4db4g5MVIiIRi3LMxQSSJjLNoXgqMd3A4NLLHPMlUuU",
    status: "Active" as const,
    phone: "+91 98765 43210",
    vehicle: "MH12AB1234",
    licenseNumber: "DL-142021005678",
    licenseExpiry: "24/11/2026",
    salary: "₹25,000",
    pendingBalance: "₹1,240",
  },
  {
    name: "Sunita Sharma",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUR83SIXxtssMneOy7qF4Ba9BtlYrLP58wJ2DzQTs4x2lSjlzXuExEWuZMUsI9wl-pEISxeBhDQnLPW6InKb9Tf4nR503eqm4Ruxbdz5jOHTVpWF9yR4GebixIBm_1OPT216v2ip-aO9BqNHn_qtEoIZKkLb3ZGLGz3rrSEYnmzpZaPnrOtDpT775xqBf98bjdFnYeunTFAbw4DcbYMXUjIMVKH-OxBvuIw72uRD9zuz5V-ur8D3b7XRYZJ4FPw54fnOR31VS5Pery",
    status: "Active" as const,
    phone: "+91 99223 34455",
    vehicle: "KA01EH4590",
    licenseNumber: "DL-222019001234",
    licenseExpiry: "15/02/2024",
    salary: "₹28,500",
    pendingBalance: "₹0.00",
    isStatusWarning: true,
  },
  {
    name: "Amit Patel",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuArY52g9FsWiyJaIj6JeMgsUvgXTAcZOfdodBxzikvMh172ZLIF7_EBsTS7LpNlMrN4N5AVMdBp7MVp8dwhIJANUZz458AEUOS5BEAlemLcB6lWtcePF_cR1HEiWMyGkoAZ3SXiCjv-NrRVbJER7FlBiNiNFiFtdO9auz7E-fmaSi89RbNBPRjTNwkJq105i8W8k8a0G5zZtuJkA06oDVc018Hu3_ef5SyRpM_6_TgTomDVNUc3lmRog9SdTZscoJDpT6MMGCXfE7Pp",
    status: "Inactive" as const,
    phone: "+91 77665 54433",
    vehicle: "GJ05BT9988",
    licenseNumber: "DL-052015009988",
    licenseExpiry: "09/08/2025",
    salary: "₹25,000",
    pendingBalance: "₹0.00",
  },
  {
    name: "Vikram Singh",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_Dbg8idKgbU2T9rpP0Wr9mUw7XUlSUP8G9OFXj4kyA1G2spldn6MrApn-0TTrAg3Hyh5EwgJZThPdyjmNSWtHV3d6LR_XBipt_hLX4hDoR5GY3xpxpF2XeME2RRWoeOzWKO5T8q8J1-tqCjaep_jFZhBRxaUcJde40KYufyKsscIpwPuHC3-mCB1uikREmKRkn6lld4t7pO3xVjD6qwxLe1yyZencC8mwgREBprYbXRNpq7dRCksRypZhXP3ezi1KZv050SgdQLOD",
    status: "Active" as const,
    phone: "+91 88990 01122",
    vehicle: "MH04CD5678",
    licenseNumber: "DL-042022003322",
    licenseExpiry: "12/01/2025",
    salary: "₹26,000",
    pendingBalance: "₹4,500",
  },
];

export default function DriversPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div>
            <h2 className="text-[2.75rem] font-black text-on-surface leading-tight tracking-tight">Driver Fleet</h2>
            <p className="text-on-surface-variant font-medium mt-1">Managing 142 Active Personnel</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high hover:bg-surface-container-highest transition-all rounded-full font-bold text-sm text-on-surface-variant active:scale-95">
              <span className="material-symbols-outlined text-lg">filter_list</span>
              Filters
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 duration-150 transition-all">
              <span className="material-symbols-outlined text-lg">add</span>
              Register Driver
            </button>
          </div>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface-container-lowest p-5 rounded-full border border-outline-variant/10 shadow-sm flex flex-col items-center">
            <p className="text-[0.7rem] uppercase tracking-widest font-bold text-on-surface-variant">Total Drivers</p>
            <p className="text-3xl font-black mt-1 tabular-nums">158</p>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-full border border-outline-variant/10 shadow-sm flex flex-col items-center">
            <p className="text-[0.7rem] uppercase tracking-widest font-bold text-tertiary">On Duty</p>
            <p className="text-3xl font-black mt-1 tabular-nums">124</p>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-full border border-outline-variant/10 shadow-sm flex flex-col items-center">
            <p className="text-[0.7rem] uppercase tracking-widest font-bold text-error">Expiring Licenses</p>
            <p className="text-3xl font-black mt-1 tabular-nums">04</p>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-full border border-outline-variant/10 shadow-sm flex flex-col items-center">
            <p className="text-[0.7rem] uppercase tracking-widest font-bold text-primary">Fleet Compliance</p>
            <p className="text-3xl font-black mt-1 tabular-nums">98%</p>
          </div>
        </div>

        {/* Drivers Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {driversData.map((driver) => (
            <DriverCard key={driver.phone} {...driver} />
          ))}
        </div>

        {/* Pagination/Load More */}
        <div className="pt-8 flex justify-center pb-12">
          <button className="px-10 py-3 bg-surface-container-high hover:bg-primary hover:text-white transition-all duration-300 rounded-full font-bold text-sm tracking-tight text-on-surface-variant flex items-center gap-2 group shadow-sm active:scale-95">
            Show Next 20 Drivers
            <span className="material-symbols-outlined text-lg group-hover:translate-y-1 transition-transform">keyboard_arrow_down</span>
          </button>
        </div>
      </div>
    </LayoutWrapper>
  );
}
