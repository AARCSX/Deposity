"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generatePKCE } from "@/lib/pkce";
import { Layers } from "lucide-react";

type BillingCycle = "monthly" | "quarterly" | "half-yearly" | "yearly";

export default function PublicPricingPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<BillingCycle>("yearly");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [modalType, setModalType] = useState<"consultation" | "sales" | "plan" | null>(null);
  const [selectedPlanName, setSelectedPlanName] = useState<string>("");

  // Modal Form State
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    fleetSize: "10-25",
    message: "",
  });

  const handleSignIn = async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("deposity_token");
    if (token) {
      router.push("/dashboard");
      return;
    }
    const { verifier, challenge, state } = await generatePKCE();
    localStorage.setItem("oauth_code_verifier", verifier);
    localStorage.setItem("oauth_state", state);

    const clientId = "deposity_client";
    const redirectUri = window.location.origin + "/callback";
    const scope = "openid profile email";
    const authUrl = `https://identity.aarcsx.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}&code_challenge_method=S256&code_challenge=${challenge}`;

    window.location.href = authUrl;
  };

  // Calculate pricing metrics based on billing cycle discount multipliers
  const getBillingDetails = (baseMonthly: number) => {
    switch (billing) {
      case "monthly":
        return {
          monthlyEquiv: baseMonthly,
          totalBilled: baseMonthly,
          periodLabel: "/ month",
          billingCycleLabel: "billed monthly",
          savingsLabel: null,
          totalSavings: 0,
        };
      case "quarterly": {
        const discountedMonthly = Math.round(baseMonthly * 0.95);
        const total = discountedMonthly * 3;
        const savings = baseMonthly * 3 - total;
        return {
          monthlyEquiv: discountedMonthly,
          totalBilled: total,
          periodLabel: "/ month",
          billingCycleLabel: `billed quarterly (₹${total.toLocaleString("en-IN")})`,
          savingsLabel: `Save 5% (₹${savings.toLocaleString("en-IN")}/qtr)`,
          totalSavings: savings,
        };
      }
      case "half-yearly": {
        const discountedMonthly = Math.round(baseMonthly * 0.9);
        const total = discountedMonthly * 6;
        const savings = baseMonthly * 6 - total;
        return {
          monthlyEquiv: discountedMonthly,
          totalBilled: total,
          periodLabel: "/ month",
          billingCycleLabel: `billed half-yearly (₹${total.toLocaleString("en-IN")})`,
          savingsLabel: `Save 10% (₹${savings.toLocaleString("en-IN")}/half-yr)`,
          totalSavings: savings,
        };
      }
      case "yearly": {
        const discountedMonthly = Math.round(baseMonthly * 0.8);
        const total = discountedMonthly * 12;
        const savings = baseMonthly * 12 - total;
        return {
          monthlyEquiv: discountedMonthly,
          totalBilled: total,
          periodLabel: "/ month",
          billingCycleLabel: `billed annually (₹${total.toLocaleString("en-IN")})`,
          savingsLabel: `Save 20% (₹${savings.toLocaleString("en-IN")}/yr)`,
          totalSavings: savings,
        };
      }
    }
  };

  const starterPricing = getBillingDetails(3999);
  const growthPricing = getBillingDetails(7999);
  const businessPricing = getBillingDetails(14999);
  const enterprisePricing = getBillingDetails(29999);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setTimeout(() => {
      setFormSubmitting(false);
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setModalType(null);
        setFormData({ name: "", email: "", phone: "", company: "", fleetSize: "10-25", message: "" });
      }, 2000);
    }, 1000);
  };

  const openPlanModal = (planName: string) => {
    setSelectedPlanName(planName);
    setModalType("plan");
  };

  const faqs = [
    {
      q: "Can I upgrade later?",
      a: "Yes, you can upgrade, downgrade, or switch plans at any time. Prorated credit is automatically applied to your account balance for unused days in your current billing cycle.",
    },
    {
      q: "How are vehicles counted?",
      a: "Active vehicles are counted based on registered vehicles managed within your depot dashboard. Archived or decommissioned vehicles do not count toward your tier limits.",
    },
    {
      q: "Can I switch billing cycles?",
      a: "Absolutely. You can switch between Monthly, Quarterly, Half-Yearly, and Yearly cycles whenever you renew. Switching to longer plans unlocks additional savings up to 20%.",
    },
    {
      q: "Do you provide onboarding?",
      a: "Yes! All plans include step-by-step onboarding documentation. Growth, Business, and Enterprise plans receive dedicated 1-on-1 implementation assistance from our fleet engineers.",
    },
    {
      q: "Is there a free trial?",
      a: "Yes, we offer a 14-day risk-free trial with full access to all features so you can test AARCSX Deposity with your fleet before committing.",
    },
    {
      q: "Can I add more users?",
      a: "Yes. Additional user packs can be added to any active subscription for ₹999/month per 10 users without needing to upgrade your overall plan.",
    },
    {
      q: "Can I migrate my existing data?",
      a: "Yes, our data migration specialists provide CSV/Excel bulk import templates and automated data transformation for vehicle RCs, driver rosters, and trip histories.",
    },
    {
      q: "How does enterprise pricing work?",
      a: "Enterprise pricing is tailored based on fleet volume (100+ vehicles), custom API throughput requirements, dedicated SLAs, and specialized ERP integrations (SAP, Tally, Oracle).",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-[#7180B9] selection:text-white">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* PUBLIC HEADER NAVIGATION BAR                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
              <Layers className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-primary transition-colors">
              AARCSX Deposity
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/#platform" className="hover:text-white transition-colors">
              Platform
            </Link>
            <Link href="/#solutions" className="hover:text-white transition-colors">
              Solutions
            </Link>
            <Link href="/pricing" className="text-primary font-bold">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSignIn}
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={handleSignIn}
              className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Wrapper */}
      <main className="pt-28 pb-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-16">
        {/* ───────────────────────────────────────────────────────────── */}
        {/* HERO SECTION                                                  */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 md:p-14 overflow-hidden text-white shadow-2xl border border-slate-800 text-center">
          {/* Floating Ambient Glow Blobs */}
          <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/4 -mb-20 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold text-indigo-200">
              <span className="material-symbols-outlined text-sm text-primary">workspace_premium</span>
              Transparent Enterprise SaaS Pricing
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
              Simple Pricing for <br className="hidden sm:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-primary-container">
                Modern Fleet Operations
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              Choose the plan that fits your fleet today and scale seamlessly as your transportation business grows. Every plan includes enterprise-grade security, multi-tenant architecture, automatic updates, and dedicated support.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setModalType("consultation")}
                className="px-6 py-3.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/30 hover:bg-primary-container transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">calendar_month</span>
                Start Free Consultation
              </button>
              <button
                onClick={() => setModalType("sales")}
                className="px-6 py-3.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md text-white text-sm font-bold hover:bg-white/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">headset_mic</span>
                Contact Sales
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-slate-400 text-xs border-t border-slate-800/80">
              <div className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-base">verified</span>
                <span>14-Day Free Trial</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-base">lock</span>
                <span>DPDP Act Compliant</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-base">credit_score</span>
                <span>No Credit Card Needed</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-base">published_with_changes</span>
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* BILLING TOGGLE SELECTOR                                      */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner flex-wrap justify-center gap-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                billing === "monthly"
                  ? "bg-slate-800 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly
            </button>

            <button
              onClick={() => setBilling("quarterly")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                billing === "quarterly"
                  ? "bg-slate-800 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Quarterly</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase">
                Save 5%
              </span>
            </button>

            <button
              onClick={() => setBilling("half-yearly")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                billing === "half-yearly"
                  ? "bg-slate-800 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Half-Yearly</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase">
                Save 10%
              </span>
            </button>

            <button
              onClick={() => setBilling("yearly")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                billing === "yearly"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Yearly</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-400 text-slate-950 text-[10px] font-black uppercase">
                Save 20%
              </span>
            </button>
          </div>

          {billing !== "monthly" && (
            <p className="text-xs font-semibold text-emerald-400 animate-in fade-in duration-200">
              🎉 You are saving up to 20% with {billing.replace("-", " ")} billing!
            </p>
          )}
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* PRICING CARDS                                                 */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {/* Starter Plan */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-bold text-slate-300">
                  Starter
                </span>
                <span className="material-symbols-outlined text-slate-400">local_shipping</span>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white tracking-tight">
                    ₹{starterPricing.monthlyEquiv.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {starterPricing.periodLabel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  {starterPricing.billingCycleLabel}
                </p>
                {starterPricing.savingsLabel && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    {starterPricing.savingsLabel}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                For small fleet operators beginning their digital transformation.
              </p>

              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                <p className="text-[11px] font-bold text-white uppercase tracking-wider">Features included:</p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span><strong>Up to 10 Vehicles</strong></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span><strong>Up to 5 Users</strong></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Single Branch</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Fleet Management</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Driver Management</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Trip Management</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Fuel Logs</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>FASTag Management</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Maintenance Tracking</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Compliance Monitoring</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Email Notifications</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Dashboard & Basic Reports</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Standard Email Support</li>
                </ul>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => openPlanModal("Starter")}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Start with Starter
              </button>
            </div>
          </div>

          {/* Growth Plan */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-lg bg-indigo-950 text-indigo-300 text-xs font-bold">
                  Growth
                </span>
                <span className="material-symbols-outlined text-indigo-400">trending_up</span>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white tracking-tight">
                    ₹{growthPricing.monthlyEquiv.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {growthPricing.periodLabel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  {growthPricing.billingCycleLabel}
                </p>
                {growthPricing.savingsLabel && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    {growthPricing.savingsLabel}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                For growing transport companies managing multiple teams.
              </p>

              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                <p className="text-[11px] font-bold text-white uppercase tracking-wider">Everything in Starter plus:</p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span><strong>Up to 25 Vehicles</strong></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span><strong>Up to 15 Users</strong></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span><strong>Up to 2 Branches</strong></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Employee Management</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Company Directory</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Advanced Compliance Dashboard</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Advanced Reporting</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Priority Email Support</li>
                </ul>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => openPlanModal("Growth")}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-md cursor-pointer"
              >
                Choose Growth
              </button>
            </div>
          </div>

          {/* Business Plan (MOST POPULAR HIGHLIGHT) */}
          <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 flex flex-col justify-between shadow-2xl border-2 border-primary ring-4 ring-primary/10 hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1 scale-102">
            {/* Popular Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-indigo-600 text-white text-[11px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
              <span>⭐ Most Popular</span>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-lg bg-primary/20 border border-primary/30 text-indigo-300 text-xs font-bold">
                  Business
                </span>
                <span className="material-symbols-outlined text-primary text-xl">stars</span>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white tracking-tight">
                    ₹{businessPricing.monthlyEquiv.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {businessPricing.periodLabel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  {businessPricing.billingCycleLabel}
                </p>
                {businessPricing.savingsLabel && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-400 text-[10px] font-bold">
                    {businessPricing.savingsLabel}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                For established logistics companies looking for intelligent operations.
              </p>

              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                <p className="text-[11px] font-bold text-white uppercase tracking-wider">Everything in Growth plus:</p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span><strong>Up to 50 Vehicles</strong></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span><strong>Up to 35 Users</strong></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span><strong>Up to 5 Branches</strong></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span>AI Insights <span className="text-[10px] bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded font-semibold">Phase 2</span></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span>Predictive Maintenance <span className="text-[10px] bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded font-semibold">Phase 2</span></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span>Driver Performance Analytics <span className="text-[10px] bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded font-semibold">Phase 2</span></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span>Fuel Analytics <span className="text-[10px] bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded font-semibold">Phase 2</span></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span>Executive Dashboard</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span>Phone Support</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span>Quarterly Business Review</li>
                </ul>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => openPlanModal("Business")}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all shadow-lg shadow-primary/30 active:scale-[0.98] cursor-pointer"
              >
                Upgrade to Business
              </button>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-lg bg-slate-800 text-white text-xs font-bold">
                  Enterprise
                </span>
                <span className="material-symbols-outlined text-slate-300">domain</span>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Starting at</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white tracking-tight">
                    ₹{enterprisePricing.monthlyEquiv.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {enterprisePricing.periodLabel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  {enterprisePricing.billingCycleLabel}
                </p>
                {enterprisePricing.savingsLabel && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    {enterprisePricing.savingsLabel}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                For large scale fleet networks needing custom workflows, SLAs, and API integrations.
              </p>

              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                <p className="text-[11px] font-bold text-white uppercase tracking-wider">Everything in Business plus:</p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span><strong>100+ Vehicles</strong></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span><strong>Unlimited Users</strong></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span><strong>Unlimited Branches</strong></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>GPS Tracking <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-semibold">Phase 3</span></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Driver Mobile App <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-semibold">Phase 3</span></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Customer Portal <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-semibold">Phase 3</span></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Public API Access <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-semibold">Phase 3</span></li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>AI Intelligence Suite</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Custom Integrations</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Dedicated Account Manager</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>SLA Support</li>
                </ul>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => setModalType("sales")}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* FEATURE COMPARISON TABLE                                      */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">table_chart</span>
              Detailed Feature Comparison
            </h2>
            <p className="text-xs text-slate-400">Compare capability specifications across all plan tiers.</p>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-bold text-white">
                  <th className="py-4 px-4 w-1/3">Feature</th>
                  <th className="py-4 px-4 text-center">Starter</th>
                  <th className="py-4 px-4 text-center">Growth</th>
                  <th className="py-4 px-4 text-center text-primary font-black bg-primary/10 rounded-t-xl">Business</th>
                  <th className="py-4 px-4 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-800/60">
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">Fleet Management</td>
                  <td className="py-3.5 px-4 text-center text-slate-300 font-medium">Up to 10 Vehicles</td>
                  <td className="py-3.5 px-4 text-center text-slate-300 font-medium">Up to 25 Vehicles</td>
                  <td className="py-3.5 px-4 text-center text-primary font-bold bg-primary/10">Up to 50 Vehicles</td>
                  <td className="py-3.5 px-4 text-center text-slate-200 font-bold">100+ Vehicles</td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">Driver Management</td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-primary bg-primary/10"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">Trip Management</td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-primary bg-primary/10"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">Maintenance Tracking</td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-primary bg-primary/10"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">FASTag Management</td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-primary bg-primary/10"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">Fuel Logs (Diesel/Urea)</td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-primary bg-primary/10"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">Multi-Branch Support</td>
                  <td className="py-3.5 px-4 text-center text-slate-500">Single Branch</td>
                  <td className="py-3.5 px-4 text-center text-slate-300 font-medium">Up to 2 Branches</td>
                  <td className="py-3.5 px-4 text-center text-primary font-bold bg-primary/10">Up to 5 Branches</td>
                  <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">Unlimited</td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">Email Notifications</td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-primary bg-primary/10"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">WhatsApp Notifications <span className="text-[10px] bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded font-semibold ml-1">Phase 2</span></td>
                  <td className="py-3.5 px-4 text-center text-slate-600"><span className="material-symbols-outlined text-base">remove</span></td>
                  <td className="py-3.5 px-4 text-center text-slate-400">Add-on</td>
                  <td className="py-3.5 px-4 text-center text-primary font-bold bg-primary/10">Add-on</td>
                  <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">Included</td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">Invoice Generation <span className="text-[10px] bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded font-semibold ml-1">Phase 2</span></td>
                  <td className="py-3.5 px-4 text-center text-slate-600"><span className="material-symbols-outlined text-base">remove</span></td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-primary bg-primary/10"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">Reports & Analytics</td>
                  <td className="py-3.5 px-4 text-center text-slate-400 font-medium">Basic Reports</td>
                  <td className="py-3.5 px-4 text-center text-slate-300 font-medium">Advanced Reports</td>
                  <td className="py-3.5 px-4 text-center text-primary font-bold bg-primary/10">Executive Dashboard</td>
                  <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">Custom BI Analytics</td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">PDF Export</td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-primary bg-primary/10"><span className="material-symbols-outlined text-base">check_circle</span></td>
                  <td className="py-3.5 px-4 text-center text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span></td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">AI Insights & Anomaly Detection</td>
                  <td className="py-3.5 px-4 text-center text-slate-600"><span className="material-symbols-outlined text-base">remove</span></td>
                  <td className="py-3.5 px-4 text-center text-slate-600"><span className="material-symbols-outlined text-base">remove</span></td>
                  <td className="py-3.5 px-4 text-center text-primary font-bold bg-primary/10">Phase 2 Included</td>
                  <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">Full AI Suite</td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">Predictive Maintenance</td>
                  <td className="py-3.5 px-4 text-center text-slate-600"><span className="material-symbols-outlined text-base">remove</span></td>
                  <td className="py-3.5 px-4 text-center text-slate-600"><span className="material-symbols-outlined text-base">remove</span></td>
                  <td className="py-3.5 px-4 text-center text-primary font-bold bg-primary/10">Phase 2 Included</td>
                  <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">Included</td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">GPS Live Tracking <span className="text-[10px] bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded font-semibold ml-1">Phase 3</span></td>
                  <td className="py-3.5 px-4 text-center text-slate-600"><span className="material-symbols-outlined text-base">remove</span></td>
                  <td className="py-3.5 px-4 text-center text-slate-600"><span className="material-symbols-outlined text-base">remove</span></td>
                  <td className="py-3.5 px-4 text-center text-slate-400 bg-primary/10">Add-on</td>
                  <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">Included</td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">Driver Mobile App <span className="text-[10px] bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded font-semibold ml-1">Phase 3</span></td>
                  <td className="py-3.5 px-4 text-center text-slate-600"><span className="material-symbols-outlined text-base">remove</span></td>
                  <td className="py-3.5 px-4 text-center text-slate-600"><span className="material-symbols-outlined text-base">remove</span></td>
                  <td className="py-3.5 px-4 text-center text-slate-400 bg-primary/10">Phase 3 Included</td>
                  <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">Included</td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">Customer Portal <span className="text-[10px] bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded font-semibold ml-1">Phase 3</span></td>
                  <td className="py-3.5 px-4 text-center text-slate-600"><span className="material-symbols-outlined text-base">remove</span></td>
                  <td className="py-3.5 px-4 text-center text-slate-600"><span className="material-symbols-outlined text-base">remove</span></td>
                  <td className="py-3.5 px-4 text-center text-slate-400 bg-primary/10">Phase 3 Included</td>
                  <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">Included</td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">Public REST & gRPC APIs</td>
                  <td className="py-3.5 px-4 text-center text-slate-600"><span className="material-symbols-outlined text-base">remove</span></td>
                  <td className="py-3.5 px-4 text-center text-slate-600"><span className="material-symbols-outlined text-base">remove</span></td>
                  <td className="py-3.5 px-4 text-center text-slate-600 bg-primary/10"><span className="material-symbols-outlined text-base">remove</span></td>
                  <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">Unlimited API Access</td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">Dedicated Support & SLA</td>
                  <td className="py-3.5 px-4 text-center text-slate-400">Email Support</td>
                  <td className="py-3.5 px-4 text-center text-slate-300 font-medium">Priority Email</td>
                  <td className="py-3.5 px-4 text-center text-primary font-bold bg-primary/10">Phone + QBR</td>
                  <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">Dedicated Manager + SLA</td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">Custom ERP Integrations</td>
                  <td className="py-3.5 px-4 text-center text-slate-600"><span className="material-symbols-outlined text-base">remove</span></td>
                  <td className="py-3.5 px-4 text-center text-slate-600"><span className="material-symbols-outlined text-base">remove</span></td>
                  <td className="py-3.5 px-4 text-center text-slate-600 bg-primary/10"><span className="material-symbols-outlined text-base">remove</span></td>
                  <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">Included (SAP, Tally)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* ADD-ONS SECTION                                               */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-primary/20 text-indigo-300 text-xs font-bold border border-primary/30">
              Modular Extensions
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Expand Your Platform</h2>
            <p className="text-xs text-slate-400">Add specialized capabilities tailored to your operational requirements.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <span className="text-sm font-black text-white">₹2,999<span className="text-xs font-normal text-slate-400">/month</span></span>
              </div>
              <h3 className="font-bold text-base text-white mb-1">AI Intelligence Pack</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Includes predictive maintenance, operational insights, AI reports, and anomaly detection.
              </p>
              <button
                onClick={() => setModalType("consultation")}
                className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1 cursor-pointer"
              >
                Add Extension <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md">Custom Setup</span>
              </div>
              <h3 className="font-bold text-base text-white mb-1">GPS Integration</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Vehicle tracking, route playback, geofencing, speed monitoring, and telemetry.
              </p>
              <button
                onClick={() => setModalType("consultation")}
                className="text-xs font-bold text-cyan-400 group-hover:underline flex items-center gap-1 cursor-pointer"
              >
                Add Extension <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined">chat</span>
                </div>
                <span className="text-sm font-black text-white">₹999<span className="text-xs font-normal text-slate-400">/mo + usage</span></span>
              </div>
              <h3 className="font-bold text-base text-white mb-1">WhatsApp Notifications</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Compliance reminders, trip alerts, and automated operational notifications.
              </p>
              <button
                onClick={() => setModalType("consultation")}
                className="text-xs font-bold text-emerald-400 group-hover:underline flex items-center gap-1 cursor-pointer"
              >
                Add Extension <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {/* Card 4 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <span className="material-symbols-outlined">group_add</span>
                </div>
                <span className="text-sm font-black text-white">₹999<span className="text-xs font-normal text-slate-400">/month</span></span>
              </div>
              <h3 className="font-bold text-base text-white mb-1">Additional Users</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Every additional pack includes 10 users.
              </p>
              <button
                onClick={() => setModalType("consultation")}
                className="text-xs font-bold text-purple-400 group-hover:underline flex items-center gap-1 cursor-pointer"
              >
                Add Extension <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {/* Card 5 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <span className="material-symbols-outlined">store</span>
                </div>
                <span className="text-sm font-black text-white">₹999<span className="text-xs font-normal text-slate-400">/month</span></span>
              </div>
              <h3 className="font-bold text-base text-white mb-1">Additional Branch</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Scale your operations without changing plans.
              </p>
              <button
                onClick={() => setModalType("consultation")}
                className="text-xs font-bold text-amber-400 group-hover:underline flex items-center gap-1 cursor-pointer"
              >
                Add Extension <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {/* Card 6 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <span className="material-symbols-outlined">support_agent</span>
                </div>
                <span className="text-sm font-black text-white">₹2,999<span className="text-xs font-normal text-slate-400">/month</span></span>
              </div>
              <h3 className="font-bold text-base text-white mb-1">Priority Support</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Faster response times and direct access to our support team.
              </p>
              <button
                onClick={() => setModalType("consultation")}
                className="text-xs font-bold text-rose-400 group-hover:underline flex items-center gap-1 cursor-pointer"
              >
                Add Extension <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* ENTERPRISE SERVICES                                           */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 space-y-8 border border-slate-800 shadow-xl">
          <div className="max-w-2xl space-y-2">
            <span className="px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold">
              Dedicated Engineering
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">Professional Services</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Tailored implementation solutions delivered by our experienced logistics technology consultants.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-primary text-2xl mb-2">database</span>
              <h3 className="font-bold text-sm text-white mb-1">Data Migration</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamless legacy data import for vehicles, drivers, and historical logs.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-primary text-2xl mb-2">school</span>
              <h3 className="font-bold text-sm text-white mb-1">Staff Training</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hands-on training sessions for depot managers and operational staff.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-primary text-2xl mb-2">api</span>
              <h3 className="font-bold text-sm text-white mb-1">Custom Integrations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct API bridges connecting Deposity with SAP, Tally, and custom ERPs.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-primary text-2xl mb-2">cloud_sync</span>
              <h3 className="font-bold text-sm text-white mb-1">Deployment Assistance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Private cloud setup and SOC2 security configuration assistance.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-primary text-2xl mb-2">verified_user</span>
              <h3 className="font-bold text-sm text-white mb-1">Dedicated Onboarding</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                1-on-1 implementation manager assisting with initial fleet setup.
              </p>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* ROADMAP SECTION                                               */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-primary/20 text-indigo-300 text-xs font-bold border border-primary/30">
              Continuous Evolution
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Included Today. More Tomorrow.</h2>
            <p className="text-xs text-slate-400">Our engineering roadmap ensures your platform continually gains capabilities.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Phase 1 */}
            <div className="bg-slate-900/90 border-2 border-emerald-500/30 rounded-3xl p-6 space-y-4 shadow-sm relative overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-black text-xs flex items-center justify-center">
                P1
              </div>
              <div>
                <div className="inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold mb-1">
                  Active Today
                </div>
                <h3 className="font-bold text-base text-white">Phase 1</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Fleet Management</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Trips & Cargo</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Driver Rosters</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Maintenance Scheduler</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Permit Compliance</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>Fuel & Urea Logs</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>FASTag Audits</li>
              </ul>
            </div>

            {/* Phase 2 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                P2
              </div>
              <div>
                <div className="inline-block px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] font-bold mb-1">
                  Coming Soon
                </div>
                <h3 className="font-bold text-base text-white">Phase 2</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-indigo-400 text-sm">schedule</span>AI Insights</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-indigo-400 text-sm">schedule</span>Invoices</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-indigo-400 text-sm">schedule</span>Advanced Analytics</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-indigo-400 text-sm">schedule</span>PDF Reports</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-indigo-400 text-sm">schedule</span>WhatsApp Notifications</li>
              </ul>
            </div>

            {/* Phase 3 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white font-black text-xs flex items-center justify-center">
                P3
              </div>
              <div>
                <div className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold mb-1">
                  In Development
                </div>
                <h3 className="font-bold text-base text-white">Phase 3</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-slate-400 text-sm">construction</span>GPS Live Tracking</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-slate-400 text-sm">construction</span>Driver Mobile App</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-slate-400 text-sm">construction</span>Customer Portal</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-slate-400 text-sm">construction</span>Public APIs</li>
              </ul>
            </div>

            {/* Phase 4 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-900 text-white font-black text-xs flex items-center justify-center">
                P4
              </div>
              <div>
                <div className="inline-block px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-bold mb-1">
                  Future Vision
                </div>
                <h3 className="font-bold text-base text-white">Phase 4</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-purple-400 text-sm">auto_awesome</span>Enterprise AI Suite</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-purple-400 text-sm">auto_awesome</span>IoT Telemetry Integration</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-purple-400 text-sm">auto_awesome</span>Advanced BI Engine</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-purple-400 text-sm">auto_awesome</span>ERP Native Connectors</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* FAQ SECTION                                                   */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">quiz</span>
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-400">Everything you need to know about plans, billing, and onboarding.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-800 rounded-2xl overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-bold text-sm text-white flex justify-between items-center gap-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-black flex items-center justify-center shrink-0">
                        Q
                      </span>
                      {faq.q}
                    </span>
                    <span
                      className="material-symbols-outlined text-slate-400 transition-transform duration-200"
                      style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    >
                      expand_more
                    </span>
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-xs text-slate-300 leading-relaxed bg-slate-950/40 border-t border-slate-800/50 animate-in fade-in duration-150">
                      <div className="pl-9">{faq.a}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* BOTTOM CTA BANNER                                             */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 p-8 sm:p-14 text-white text-center border border-slate-800 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-24 w-[600px] h-[300px] bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Ready to Modernize Your Fleet Operations?
            </h2>

            <p className="text-slate-300 text-xs sm:text-base leading-relaxed max-w-xl mx-auto">
              Join the next generation of logistics companies using AARCSX Deposity to simplify operations, reduce costs, and scale with confidence.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setModalType("consultation")}
                className="px-8 py-4 rounded-xl bg-primary text-white text-sm font-bold shadow-xl shadow-primary/30 hover:bg-primary-container transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">rocket_launch</span>
                Start Your Journey
              </button>
              <button
                onClick={() => setModalType("sales")}
                className="px-8 py-4 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md text-white text-sm font-bold hover:bg-white/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">headset_mic</span>
                Talk to Sales
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ENTERPRISE FOOTER                                             */}
      {/* ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 p-8 md:p-12 space-y-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
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
              <li><Link href="/#platform" className="hover:text-white transition-colors">Vehicle Management</Link></li>
              <li><Link href="/#platform" className="hover:text-white transition-colors">Trip Dispatch & Cargo</Link></li>
              <li><Link href="/#platform" className="hover:text-white transition-colors">Driver Rosters</Link></li>
              <li><Link href="/#platform" className="hover:text-white transition-colors">Expense Ledger</Link></li>
              <li><Link href="/#platform" className="hover:text-white transition-colors">Maintenance Scheduler</Link></li>
              <li><Link href="/#platform" className="hover:text-white transition-colors">Analytics & Financials</Link></li>
            </ul>
          </div>

          {/* Column 3: Platform & Security */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Resources & Docs</p>
            <ul className="space-y-2 text-xs">
              <li><Link href="/pricing" className="text-primary font-bold hover:underline">Pricing Plans</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Help & Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AARCSX Identity SSO</a></li>
              <li><a href="#" className="hover:text-white transition-colors">System Uptime Status</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FASTag Audit Guide</a></li>
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
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
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

      {/* ───────────────────────────────────────────────────────────── */}
      {/* INTERACTIVE MODAL (Consultation / Sales / Plan Selection)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">
                    {modalType === "consultation" ? "calendar_month" : modalType === "sales" ? "headset_mic" : "shopping_cart"}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-white">
                  {modalType === "consultation"
                    ? "Schedule Free Consultation"
                    : modalType === "sales"
                    ? "Contact Sales Team"
                    : `Subscribe to ${selectedPlanName} Plan`}
                </h3>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-white text-sm p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {formSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <h4 className="font-bold text-base text-white">Request Received!</h4>
                <p className="text-xs text-slate-300">
                  Our fleet architecture specialist will reach out to you within 2 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Rajesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="OnWay Logistics"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Work Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="rajesh@onway.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Fleet Size (Vehicles)
                  </label>
                  <select
                    value={formData.fleetSize}
                    onChange={(e) => setFormData({ ...formData, fleetSize: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                  >
                    <option value="1-10">1 - 10 Vehicles (Starter)</option>
                    <option value="11-25">11 - 25 Vehicles (Growth)</option>
                    <option value="26-50">26 - 50 Vehicles (Business)</option>
                    <option value="50+">50+ Vehicles (Enterprise)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Operational Requirements / Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your fleet setup, branches, or key operational challenges..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-white shadow-md hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {formSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      "Submit Request"
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
