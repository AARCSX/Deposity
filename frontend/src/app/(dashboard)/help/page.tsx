"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "Technical Issue",
    priority: "Medium",
    description: "",
    email: "",
  });

  const categories = [
    { id: "all", label: "All Topics", icon: "apps" },
    { id: "vehicles", label: "Vehicles & Permits", icon: "local_shipping" },
    { id: "fastag", label: "FASTag & Tolls", icon: "account_balance_wallet" },
    { id: "fuel", label: "Fuel & Expenses", icon: "local_gas_station" },
    { id: "trips", label: "Trips & Billing", icon: "route" },
    { id: "auth", label: "Identity & Access", icon: "shield" },
  ];

  const faqs = [
    {
      category: "vehicles",
      question: "How do dynamic permit and document compliance status dots work?",
      answer: "AARCSX Deposity calculates dynamic compliance statuses based on document expiry dates (National Permit, State Permit, Fitness, PUC, Insurance, FASTag). A green dot indicates valid (>30 days), yellow indicates expiring soon (<=30 days), and red indicates an expired document requiring immediate renewal."
    },
    {
      category: "fastag",
      question: "How do I log and track vehicle FASTag recharges?",
      answer: "Navigate to the vehicle's detail page, click the 'FASTag History' tab, and click '+ Record FASTag Recharge'. Enter the recharged amount, timestamp, and optional reference number. You can audit and delete recharge entries with a complete timestamped log."
    },
    {
      category: "fuel",
      question: "How can I record Diesel and Urea (DEF) refueling entries?",
      answer: "In the vehicle detail dashboard, click the 'Fuel & Urea' tab. Click '+ Record Fuel Entry' to select Diesel or Urea, enter quantity in litres, total cost, and station location. Deposity automatically calculates rate per litre and aggregates overall fuel expenditure."
    },
    {
      category: "trips",
      question: "How does trip dispatching and driver assignment function?",
      answer: "From the 'Trips' page or the 'New Trip' sidebar action, create a trip by assigning an available vehicle, a driver, origin & destination locations, cargo type, and weight. The trip status updates dynamically from Scheduled to In-Transit and Delivered."
    },
    {
      category: "auth",
      question: "What is AARCSX Identity SSO and PKCE OAuth 2.1 integration?",
      answer: "Deposity leverages AARCSX Identity for multi-tenant, enterprise-grade Single Sign-On (SSO) using PKCE OAuth 2.1 authentication flow. All JWT tokens contain tenant_id claims to ensure total multi-tenant data isolation."
    },
    {
      category: "vehicles",
      question: "Can I track vehicle maintenance schedules and EMI installments?",
      answer: "Yes. Each vehicle has dedicated 'EMI Schedule' and 'Maintenance' tabs. You can schedule monthly bank loan EMIs, mark payments as Paid or Pending, and log routine maintenance procedures with cost tracking."
    },
    {
      category: "auth",
      question: "How do I manage multi-branch depot organizations?",
      answer: "You can switch or update organization names in Settings or via organization tokens. Deposity supports multi-branch vehicle allocation and home branch assignments across regional hubs."
    }
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesQuery =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitting(true);
    setTimeout(() => {
      setTicketSubmitting(false);
      setTicketSubmitted(true);
      setTimeout(() => {
        setTicketSubmitted(false);
        setIsTicketModalOpen(false);
        setTicketForm({ subject: "", category: "Technical Issue", priority: "Medium", description: "", email: "" });
      }, 2000);
    }, 1000);
  };

  return (
    <div className="space-y-12">
      {/* Hero Header & Search Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 md:p-12 overflow-hidden text-white shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-tertiary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold text-indigo-200">
            <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
            AARCSX Deposity Customer Support & Help Center
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            How can we help your fleet today?
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Search our knowledge base for operational guides, FASTag & fuel audits, vehicle compliance workflows, and identity platform integration details.
          </p>

          {/* Search Input */}
          <div className="relative max-w-2xl">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
              search
            </span>
            <input
              type="text"
              placeholder="Search guides (e.g. FASTag recharge, Diesel logging, Permits, SSO...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-xl transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs bg-slate-800 p-1 rounded-md"
              >
                Clear
              </button>
            )}
          </div>

          {/* System Status Pill */}
          <div className="flex items-center gap-3 pt-2 text-xs text-slate-300">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-400">All AARCSX Systems Operational</span>
            <span className="text-slate-500">•</span>
            <span>Uptime: 99.98%</span>
            <span className="text-slate-500">•</span>
            <span>Version 2.4.0 (Enterprise)</span>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div>
        <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">explore</span>
          Explore Core Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-6 hover:shadow-lg transition-all group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">local_shipping</span>
            </div>
            <h3 className="font-bold text-base text-on-surface mb-2">Vehicles & Compliance</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              Track National & State permits, RC, Fitness, PUC, and FASTag expiry dates with real-time status dots.
            </p>
            <Link href="/vehicles" className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:underline">
              Manage Fleet <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-6 hover:shadow-lg transition-all group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center mb-4 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">local_gas_station</span>
            </div>
            <h3 className="font-bold text-base text-on-surface mb-2">Fuel & FASTag Audits</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              Record Diesel & Urea refilling logs, calculate average fuel rates, and maintain timestamped FASTag balance audits.
            </p>
            <Link href="/vehicles" className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 group-hover:underline">
              View Fuel Logs <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-6 hover:shadow-lg transition-all group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">shield</span>
            </div>
            <h3 className="font-bold text-base text-on-surface mb-2">AARCSX Identity & SSO</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              Multi-tenant architecture powered by OAuth 2.1 PKCE authorization code flow and strict JWT tenant isolation.
            </p>
            <Link href="/settings" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:underline">
              Security Settings <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ & Knowledge Base Section */}
      <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">quiz</span>
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-on-surface-variant">Find instant solutions to common depot operational queries.</p>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2 text-outline">search_off</span>
              <p className="text-sm font-bold">No matching help articles found</p>
              <p className="text-xs mt-1">Try searching with different terms or select 'All Topics'.</p>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="border border-outline-variant/15 rounded-2xl overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-5 text-left font-bold text-sm text-on-surface flex justify-between items-center gap-4 hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center shrink-0">
                        Q
                      </span>
                      {faq.question}
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant transition-transform duration-200" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                      expand_more
                    </span>
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-xs text-on-surface-variant leading-relaxed bg-surface-container-low/30 border-t border-outline-variant/10 animate-in fade-in duration-150">
                      <div className="pl-9">{faq.answer}</div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Support & Ticket Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl font-bold flex items-center gap-2 justify-center md:justify-start">
            <span className="material-symbols-outlined text-primary text-2xl">headset_mic</span>
            Need Dedicated Technical Assistance?
          </h3>
          <p className="text-slate-300 text-xs max-w-xl">
            Our fleet engineers and enterprise support team are available 24/7. Submit a support ticket or reach out directly to our helpdesk.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            onClick={() => setIsTicketModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-primary text-white text-xs font-bold shadow-lg hover:opacity-90 transition-opacity active:scale-[0.98] flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">confirmation_number</span>
            Submit Support Ticket
          </button>
          <a
            href="mailto:support@aarcsx.com"
            className="px-5 py-3 rounded-xl bg-white/10 border border-white/15 text-white text-xs font-bold hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">mail</span>
            Email Support
          </a>
        </div>
      </div>

      {/* Enterprise Big Company Footer */}
      <footer className="mt-16 border-t border-slate-800 bg-slate-950 text-slate-400 rounded-3xl p-8 md:p-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Column 1: Branding & Intro */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary text-white font-black flex items-center justify-center text-lg shadow-lg shadow-primary/30">
                A
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">AARCSX Deposity</h3>
                <p className="text-[11px] text-slate-500 font-medium">Enterprise SaaS Fleet Infrastructure</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Next-generation automated vehicle management, compliance monitoring, trip dispatching, FASTag balance audit, and fuel telemetry platform built on AARCSX Identity.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                DPDP Act 2023 Compliant
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                ISO 27001 Certified Architecture
              </span>
            </div>
          </div>

          {/* Column 2: Product Modules */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Product Modules</p>
            <ul className="space-y-2 text-xs">
              <li><Link href="/vehicles" className="hover:text-white transition-colors">Vehicle Management</Link></li>
              <li><Link href="/trips" className="hover:text-white transition-colors">Trip Dispatch & Cargo</Link></li>
              <li><Link href="/drivers" className="hover:text-white transition-colors">Driver Rosters</Link></li>
              <li><Link href="/expenses" className="hover:text-white transition-colors">Expense Ledger</Link></li>
              <li><Link href="/maintenance" className="hover:text-white transition-colors">Maintenance Scheduler</Link></li>
              <li><Link href="/reports" className="hover:text-white transition-colors">Analytics & Financials</Link></li>
            </ul>
          </div>

          {/* Column 3: Platform & Security */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Resources & Docs</p>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AARCSX Identity SSO</a></li>
              <li><a href="#" className="hover:text-white transition-colors">System Uptime Status</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FASTag Integration Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Fuel Telemetry Specs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Developer SDK</a></li>
            </ul>
          </div>

          {/* Column 4: Governance & Legal */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Legal & Compliance</p>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">DPDP Data Governance</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Acceptable Use Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Grievance Redressal</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security Disclosures</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Divider & Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} AARCSX Technologies Inc. All rights reserved. AARCSX Deposity is a registered SaaS product of AARCSX Ecosystem.
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Asia-Pacific (Mumbai)
            </span>
            <a href="#" className="hover:text-white transition-colors">Security</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* Support Ticket Modal */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-outline-variant/15">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">confirmation_number</span>
                </div>
                <h3 className="font-bold text-lg text-on-surface">Submit Support Ticket</h3>
              </div>
              <button
                onClick={() => setIsTicketModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface text-sm p-1 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {ticketSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <h4 className="font-bold text-base text-on-surface">Support Ticket Received!</h4>
                <p className="text-xs text-on-surface-variant">Ticket ID: #TK-{Math.floor(100000 + Math.random() * 900000)}. Our technical team will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Issue Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Need assistance with FASTag transaction audit sync"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/20 rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Category</label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                      className="w-full bg-surface border border-outline-variant/20 rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                    >
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="FASTag & Billing">FASTag & Billing</option>
                      <option value="Fuel & Expenses">Fuel & Expenses</option>
                      <option value="AARCSX SSO / Auth">AARCSX SSO / Auth</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Priority</label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                      className="w-full bg-surface border border-outline-variant/20 rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical (Fleet Down)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@depot.com"
                    value={ticketForm.email}
                    onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/20 rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Issue Description</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe what you were trying to do and what issue occurred..."
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/20 rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/15">
                  <button
                    type="button"
                    onClick={() => setIsTicketModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={ticketSubmitting}
                    className="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white shadow-md hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {ticketSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      "Submit Ticket"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
