"use client";

import { useState, useEffect } from "react";
import { fetchActivityLogs, fetchActivityStats } from "@/lib/api";

interface ActivityLog {
  id: string;
  tenant_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: string;
  category: string;
  entity_type: string;
  entity_id: string;
  description: string;
  metadata: Record<string, any>;
  ip_address: string;
  created_at: string;
}

interface ActivityStats {
  total_actions_24h: number;
  active_staff_count: number;
  category_breakdown: Record<string, number>;
  top_staff_member: string;
  high_severity_count: number;
}

const CATEGORIES = [
  { id: "ALL", label: "All Activities", icon: "select_all" },
  { id: "TRIPS", label: "Trips & Routes", icon: "route" },
  { id: "VEHICLES", label: "Fleet & FASTag", icon: "local_shipping" },
  { id: "DRIVERS", label: "Drivers & Staff", icon: "badge" },
  { id: "MAINTENANCE", label: "Repairs & Fuel", icon: "build" },
  { id: "COMPANIES", label: "Parties & Clients", icon: "business" },
  { id: "SETTINGS", label: "Settings", icon: "settings" },
  { id: "SECURITY", label: "Security & Audits", icon: "shield" },
];

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination State
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<"ALL" | "TODAY" | "7DAYS" | "30DAYS">("ALL");

  // Load stats once
  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchActivityStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load activity stats:", err);
      }
    }
    loadStats();
  }, []);

  // Load logs on filter / page change
  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      setError(null);

      try {
        let startDate = "";
        let endDate = "";
        const now = new Date();

        if (dateFilter === "TODAY") {
          const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          startDate = start.toISOString();
        } else if (dateFilter === "7DAYS") {
          const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          startDate = start.toISOString();
        } else if (dateFilter === "30DAYS") {
          const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          startDate = start.toISOString();
        }

        const response = await fetchActivityLogs({
          page,
          limit: 15,
          category: selectedCategory,
          search: searchQuery.trim(),
          start_date: startDate,
          end_date: endDate,
        });

        setLogs(response.data || []);
        setTotalPages(response.total_pages || 1);
        setTotalRecords(response.total || 0);
      } catch (err: any) {
        setError(err.message || "Unable to load activity logs");
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(loadLogs, 300);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, page, dateFilter]);

  // Helper badge styling matching Deposity theme
  const getActionBadge = (action: string) => {
    if (action.startsWith("CREATE")) {
      return { label: "CREATED", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    if (action.startsWith("UPDATE")) {
      return { label: "UPDATED", bg: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    if (action.startsWith("DELETE") || action.startsWith("PURGE")) {
      return { label: "DELETED", bg: "bg-rose-50 text-rose-700 border-rose-200" };
    }
    return { label: action, bg: "bg-blue-50 text-blue-700 border-blue-200" };
  };

  // Time Formatter
  const formatTimeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  };

  // CSV Export Handler
  const exportCSV = () => {
    if (!logs.length) return;
    const headers = ["Timestamp", "User Name", "User Role", "Action", "Category", "Description", "IP Address"];
    const rows = logs.map((l) => [
      `"${new Date(l.created_at).toLocaleString()}"`,
      `"${l.user_name || "System"}"`,
      `"${l.user_role || "Staff"}"`,
      `"${l.action}"`,
      `"${l.category}"`,
      `"${l.description.replace(/"/g, '""')}"`,
      `"${l.ip_address}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Deposity_Activity_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 font-inter">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[2.5rem] font-bold text-on-surface leading-tight tracking-[-0.02em] flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-4xl">history</span>
            Activity Audit Logs
          </h1>
          <p className="text-on-surface-variant mt-1 font-medium text-sm">
            Real-time accountability ledger tracking staff mutations, trip dispatches, fuel logs, and system operations.
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={logs.length === 0}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 self-start md:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Audit Trail (CSV)
        </button>
      </div>

      {/* Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Actions (24 Hours)</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-lg">bolt</span>
            </div>
          </div>
          <div className="text-3xl font-black text-on-surface">{stats ? stats.total_actions_24h : 0}</div>
          <p className="text-[11px] text-primary font-medium mt-1">System mutations logged today</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Staff (7 Days)</span>
            <div className="w-8 h-8 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">group</span>
            </div>
          </div>
          <div className="text-3xl font-black text-on-surface">{stats ? stats.active_staff_count : 0}</div>
          <p className="text-[11px] text-on-surface-variant mt-1">Unique operators logged</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Top Contributor</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined text-lg">verified_user</span>
            </div>
          </div>
          <div className="text-lg font-black text-on-surface truncate">
            {stats ? stats.top_staff_member : "Loading..."}
          </div>
          <p className="text-[11px] text-on-surface-variant mt-1">Most operational actions</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">High-Severity Audits</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
              <span className="material-symbols-outlined text-lg">warning</span>
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600">{stats ? stats.high_severity_count : 0}</div>
          <p className="text-[11px] text-rose-500 font-medium mt-1">Deletions & purge events</p>
        </div>
      </div>

      {/* Filters Container */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 space-y-4 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-outline-variant/20 font-semibold"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search Input & Date Range Quick Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-outline-variant/20">
          <div className="sm:col-span-8 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Search by staff name, action description, vehicle number, or trip ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
            />
          </div>

          <div className="sm:col-span-4 flex items-center gap-2">
            <select
              value={dateFilter}
              onChange={(e: any) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary font-medium"
            >
              <option value="ALL">📅 All Time History</option>
              <option value="TODAY">🕒 Today's Actions</option>
              <option value="7DAYS">📆 Last 7 Days</option>
              <option value="30DAYS">🗓️ Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-on-surface-variant space-y-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold">Loading system audit records...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-xs font-bold">{error}</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant space-y-2">
            <span className="material-symbols-outlined text-4xl text-outline">history_toggle_off</span>
            <p className="text-sm font-bold text-on-surface">No activity logs recorded matching criteria</p>
            <p className="text-xs text-on-surface-variant">Staff actions on trips, vehicles, fuel, and drivers will appear here automatically.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/20">
            {logs.map((log) => {
              const badge = getActionBadge(log.action);
              const isExpanded = expandedLogId === log.id;

              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-surface-container-low/60 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: User Avatar & Action Description */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Staff Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0 uppercase shadow-sm">
                        {log.user_name ? log.user_name.charAt(0) : "S"}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-on-surface truncate">{log.user_name || "System Actor"}</span>
                          <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant text-[10px] font-mono border border-outline-variant/30">
                            {log.user_role || "Staff"}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant text-[10px] uppercase tracking-wider border border-outline-variant/20 font-mono">
                            {log.category}
                          </span>
                        </div>

                        <p className="text-xs text-on-surface font-medium leading-relaxed">
                          {log.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Timestamp & IP */}
                    <div className="flex items-center gap-3 text-right text-[11px] text-on-surface-variant shrink-0 self-end sm:self-center">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-on-surface">{formatTimeAgo(log.created_at)}</div>
                        <div className="text-[10px] text-on-surface-variant/80 font-mono">IP: {log.ip_address || "Internal"}</div>
                      </div>

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer border border-outline-variant/20"
                          title="Toggle Details"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isExpanded ? "expand_less" : "unfold_more"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable JSON Metadata Diff */}
                  {isExpanded && log.metadata && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-sans font-bold block mb-1">
                        Action Payload Snapshot
                      </span>
                      <pre className="overflow-x-auto text-emerald-400/90 whitespace-pre-wrap">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
            <div>
              Page <strong className="text-on-surface">{page}</strong> of <strong className="text-on-surface">{totalPages}</strong> ({totalRecords} records)
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface disabled:opacity-40 hover:bg-surface-container cursor-pointer font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface disabled:opacity-40 hover:bg-surface-container cursor-pointer font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
