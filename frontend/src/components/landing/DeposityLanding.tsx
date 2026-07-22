"use client";

import { motion, type Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { generatePKCE } from '@/lib/pkce';
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  Layers,
  LayoutDashboard,
  Map,
  ShieldCheck,
  Truck,
  Users,
} from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

export default function DeposityLanding() {
  const router = useRouter();

  const handleSignIn = async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('deposity_token');
    if (token) {
      router.push('/dashboard');
      return;
    }
    const { verifier, challenge, state } = await generatePKCE();
    localStorage.setItem('oauth_code_verifier', verifier);
    localStorage.setItem('oauth_state', state);

    const clientId = 'deposity_client';
    const redirectUri = window.location.origin + '/callback';
    const scope = 'openid profile email';
    const authUrl = `https://identity.aarcsx.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}&code_challenge_method=S256&code_challenge=${challenge}`;

    window.location.href = authUrl;
  };

  return (
    <div className="min-h-[100dvh] bg-white text-[#0B132B] font-sans overflow-x-hidden selection:bg-[#7180B9] selection:text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#9DB4C0]/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7180B9] flex items-center justify-center">
              <Layers className="text-white w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-[#0B132B]">
              AARCSX Deposity
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#0B132B]/70">
            <a href="#platform" className="hover:text-[#7180B9] transition-colors">
              Platform
            </a>
            <a href="#solutions" className="hover:text-[#7180B9] transition-colors">
              Solutions
            </a>
            <a href="#metrics" className="hover:text-[#7180B9] transition-colors">
              Metrics
            </a>
            <a href="/pricing" className="hover:text-[#7180B9] transition-colors">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={handleSignIn} className="text-sm font-medium text-[#0B132B]/70 hover:text-[#7180B9] transition-colors hidden sm:block">
              Sign In
            </button>
            <button onClick={handleSignIn} className="bg-[#7180B9] hover:bg-[#5a6797] text-white px-5 py-2.5 rounded-md text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-95">
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20">
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#E0FBFC]/50 to-white -z-10" />
          <div className="absolute top-20 -right-20 w-[500px] h-[500px] bg-[#DFF3E4]/30 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 -left-20 w-[600px] h-[600px] bg-[#E0FBFC]/50 rounded-full blur-3xl -z-10" />

          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-2xl">
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7180B9]/10 text-[#7180B9] text-xs font-semibold uppercase tracking-wider mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7180B9] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7180B9]" />
                </span>
                The Modern Control Tower
              </motion.div>
              <motion.h1 variants={itemVariants} className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6 text-[#0B132B]">
                Command your fleet with <span className="text-[#7180B9]">precision</span>.
              </motion.h1>
              <motion.p variants={itemVariants} className="text-lg md:text-xl text-[#0B132B]/70 mb-10 leading-relaxed max-w-xl">
                Replace spreadsheets and manual workflows. Manage vehicles, drivers, trips, expenses, and compliance from a single intelligent dashboard.
              </motion.p>
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4">
                <button onClick={handleSignIn} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#7180B9] hover:bg-[#5a6797] text-white px-8 py-4 rounded-md text-base font-medium transition-all shadow-lg hover:shadow-xl active:scale-95 group">
                  Start Your Free Trial
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-[#9DB4C0]/40 hover:border-[#7180B9] text-[#0B132B] hover:text-[#7180B9] px-8 py-4 rounded-md text-base font-medium transition-all shadow-sm hover:shadow-md active:scale-95">
                  Book a Demo
                </button>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2, type: 'spring' }} className="relative">
              <div className="relative rounded-2xl border border-[#9DB4C0]/20 bg-white shadow-2xl overflow-hidden aspect-[4/3] flex flex-col">
                <div className="h-12 border-b border-[#9DB4C0]/20 flex items-center px-4 bg-[#E0FBFC]/30">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#9DB4C0]/40" />
                    <div className="w-3 h-3 rounded-full bg-[#9DB4C0]/40" />
                    <div className="w-3 h-3 rounded-full bg-[#9DB4C0]/40" />
                  </div>
                </div>
                <div className="flex-1 p-6 grid grid-cols-12 gap-6 bg-[#E0FBFC]/10">
                  <div className="col-span-3 space-y-4">
                    <div className="h-8 bg-[#E0FBFC] rounded w-3/4 mb-8" />
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-4 bg-[#9DB4C0]/20 rounded w-full" />
                    ))}
                  </div>
                  <div className="col-span-9 space-y-6">
                    <div className="flex gap-4">
                      <div className="flex-1 h-24 bg-white border border-[#9DB4C0]/20 rounded-xl shadow-sm p-4 flex flex-col justify-between">
                        <div className="w-8 h-8 rounded bg-[#E0FBFC] text-[#7180B9] flex items-center justify-center">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div className="h-3 bg-[#9DB4C0]/20 rounded w-1/2" />
                      </div>
                      <div className="flex-1 h-24 bg-[#7180B9] rounded-xl shadow-sm p-4 flex flex-col justify-between">
                        <div className="w-8 h-8 rounded bg-white/20 text-white flex items-center justify-center">
                          <Map className="w-4 h-4" />
                        </div>
                        <div className="h-3 bg-white/50 rounded w-2/3" />
                      </div>
                      <div className="flex-1 h-24 bg-white border border-[#9DB4C0]/20 rounded-xl shadow-sm p-4 flex flex-col justify-between">
                        <div className="w-8 h-8 rounded bg-[#DFF3E4] text-[#7180B9] flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="h-3 bg-[#9DB4C0]/20 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-48 bg-white border border-[#9DB4C0]/20 rounded-xl shadow-sm p-4">
                      <div className="h-4 w-1/4 bg-[#9DB4C0]/20 rounded mb-6" />
                      <div className="flex items-end gap-2 h-28">
                        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                          <div key={i} className="flex-1 bg-[#E0FBFC] rounded-t-sm relative group cursor-pointer hover:bg-[#7180B9] transition-colors" style={{ height: `${h}%` }}>
                            {i === 3 && (
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0B132B] text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-100">
                                Peak Load
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }} className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-[#9DB4C0]/10 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#DFF3E4] rounded-full flex items-center justify-center text-[#7180B9]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0B132B]">System Optimal</div>
                  <div className="text-xs text-[#0B132B]/60">99.9% Uptime SLA</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="py-10 border-y border-[#9DB4C0]/20 bg-[#E0FBFC]/10">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-sm font-medium text-[#0B132B]/50 mb-6">TRUSTED BY MODERN LOGISTICS TEAMS</p>
            <div className="flex flex-wrap justify-center gap-12 opacity-60 grayscale">
              {['Nexus Freight', 'Apex Logistics', 'Global Transit', 'Swift Routes', 'Velocity Line'].map((name) => (
                <div key={name} className="font-display text-xl font-bold tracking-tight text-[#0B132B] flex items-center gap-2">
                  <div className="w-6 h-6 rounded-sm bg-[#9DB4C0]" />
                  {name}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="platform" className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-[#0B132B]">Everything in one place.</h2>
              <p className="text-[#0B132B]/70 text-lg">
                Deposity unifies every aspect of your fleet operations. Stop fighting with fragmented tools and start running your business.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Truck,
                  title: 'Vehicle Management',
                  desc: 'Track entire fleet inventory, asset lifecycle, assignments, and utilization metrics in real-time.',
                  color: 'bg-[#E0FBFC]',
                  text: 'text-[#7180B9]',
                },
                {
                  icon: Users,
                  title: 'Driver Management',
                  desc: 'Maintain digital records, track performance, manage schedules, and monitor safety scoring.',
                  color: 'bg-[#DFF3E4]',
                  text: 'text-[#7180B9]',
                },
                {
                  icon: Map,
                  title: 'Trip Tracking',
                  desc: 'Live visibility into active routes, ETAs, delays, and proof of delivery capture.',
                  color: 'bg-[#7180B9]/10',
                  text: 'text-[#7180B9]',
                },
                {
                  icon: CreditCard,
                  title: 'Expense Management',
                  desc: 'Automate fuel card imports, toll tracking, and receipt capture for instant profitability analysis.',
                  color: 'bg-[#7180B9]/10',
                  text: 'text-[#7180B9]',
                },
                {
                  icon: CalendarCheck,
                  title: 'Maintenance Scheduling',
                  desc: 'Preventative alerts, service history, work orders, and parts inventory control.',
                  color: 'bg-[#E0FBFC]',
                  text: 'text-[#7180B9]',
                },
                {
                  icon: ShieldCheck,
                  title: 'Compliance Tracking',
                  desc: 'Automated alerts for license renewals, DOT physicals, insurance, and inspections.',
                  color: 'bg-[#DFF3E4]',
                  text: 'text-[#7180B9]',
                },
              ].map((feature, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={feature.title}
                  className="p-8 rounded-2xl border border-[#9DB4C0]/20 bg-white hover:border-[#7180B9]/50 hover:shadow-lg transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 ${feature.text}`} />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-3 text-[#0B132B]">{feature.title}</h3>
                  <p className="text-[#0B132B]/70 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="solutions" className="py-24 bg-[#E0FBFC]/10">
          <div className="max-w-7xl mx-auto px-6 space-y-32">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1 relative"
              >
                <div className="absolute inset-0 bg-[#E0FBFC] rounded-3xl rotate-3 scale-[1.02] -z-10" />
                <div className="bg-white rounded-3xl border border-[#9DB4C0]/20 p-6 shadow-xl relative z-10 overflow-hidden">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#9DB4C0]/10">
                    <div className="font-semibold">Active Fleet Status</div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-[#DFF3E4] text-[#7180B9] text-xs rounded-full font-medium">42 Active</span>
                      <span className="px-2 py-1 bg-[#E0FBFC] text-[#9DB4C0] text-xs rounded-full font-medium">3 Maintenance</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#E0FBFC]/20 transition-colors border border-transparent hover:border-[#9DB4C0]/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-[#7180B9]/10 flex items-center justify-center text-[#7180B9]">
                            <Truck className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-medium text-[#0B132B] text-sm">Unit #{2040 + item}</div>
                            <div className="text-xs text-[#0B132B]/50">En route to Chicago, IL</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-[#0B132B]">ETA: 14:30</div>
                          <div className="text-xs text-[#7180B9]">On Time</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
              <div className="order-1 lg:order-2">
                <div className="w-12 h-12 bg-[#E0FBFC] rounded-xl flex items-center justify-center text-[#0B132B] mb-6">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-[#0B132B]">Real-time operational visibility</h2>
                <p className="text-[#0B132B]/70 text-lg mb-8 leading-relaxed">
                  Know exactly where your assets are, who is driving them, and when they will arrive. Our intelligent dispatch board eliminates phone calls and guess-work.
                </p>
                <ul className="space-y-4">
                  {['Live GPS tracking integration', 'Automated ETA calculations', 'Driver hours-of-service sync'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[#0B132B]">
                      <CheckCircle2 className="w-5 h-5 text-[#7180B9]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="w-12 h-12 bg-[#DFF3E4] rounded-xl flex items-center justify-center text-[#7180B9] mb-6">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-[#0B132B]">Uncover hidden profit margins</h2>
                <p className="text-[#0B132B]/70 text-lg mb-8 leading-relaxed">
                  Automatically match fuel expenses and tolls to specific trips. Generate instant profit & loss statements per truck, per driver, or per customer.
                </p>
                <ul className="space-y-4">
                  {['Automated expense reconciliation', 'Revenue per mile tracking', 'Maintenance cost analysis'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[#0B132B]">
                      <CheckCircle2 className="w-5 h-5 text-[#7180B9]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
                <div className="absolute inset-0 bg-[#DFF3E4] rounded-3xl -rotate-3 scale-[1.02] -z-10" />
                <div className="bg-white rounded-3xl border border-[#9DB4C0]/20 p-8 shadow-xl relative z-10">
                  <div className="mb-8">
                    <div className="text-sm font-medium text-[#0B132B]/50 mb-1">Total Revenue (MTD)</div>
                    <div className="text-4xl font-display font-bold text-[#0B132B]">$142,850.00</div>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <span className="text-[#7180B9] bg-[#DFF3E4]/30 px-2 py-0.5 rounded font-medium">+12.5%</span>
                      <span className="text-[#0B132B]/50">vs last month</span>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Profit Margin</span>
                        <span className="font-bold">24.2%</span>
                      </div>
                      <div className="w-full bg-[#E0FBFC]/10 rounded-full h-3 border border-[#9DB4C0]/10 overflow-hidden">
                        <div className="bg-[#7180B9] h-3 rounded-full" style={{ width: '24.2%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Fleet Utilization</span>
                        <span className="font-bold">88.5%</span>
                      </div>
                      <div className="w-full bg-[#E0FBFC]/10 rounded-full h-3 border border-[#9DB4C0]/10 overflow-hidden">
                        <div className="bg-[#DFF3E4]/300 h-3 rounded-full" style={{ width: '88.5%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="metrics" className="py-24 bg-[#0B132B] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#7180B9]/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                { label: 'Vehicles Managed', value: '15,000+', suffix: '' },
                { label: 'Trips Tracked', value: '2.5M', suffix: '+' },
                { label: 'System Uptime', value: '99.99', suffix: '%' },
                { label: 'Admin Hours Saved', value: '40', suffix: 'hrs/mo' },
              ].map((stat, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={stat.label}
                  className="text-center md:text-left"
                >
                  <div className="font-display text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight">
                    {stat.value}
                    <span className="text-[#7180B9] text-3xl md:text-4xl ml-1">{stat.suffix}</span>
                  </div>
                  <div className="text-[#9DB4C0] font-medium tracking-wide uppercase text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="mb-8 inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E0FBFC] text-[#0B132B]">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl md:text-4xl font-medium leading-relaxed text-[#0B132B] mb-8">
              "Before Deposity, we ran a 50-truck operation on Google Sheets and group texts. Now, we have total visibility into our margins and asset locations. It feels like we finally have a real operating system for our business."
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-[#9DB4C0]/30 rounded-full" />
              <div className="text-left">
                <div className="font-bold text-[#0B132B]">Marcus Vance</div>
                <div className="text-sm text-[#0B132B]/60">VP of Operations, Nexus Freight</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#E0FBFC] -z-20" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#7180B9]/10 to-transparent -z-10" />
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-[#0B132B]">Ready to take control?</h2>
            <p className="text-xl text-[#0B132B]/70 mb-10 max-w-2xl mx-auto">
              Join hundreds of logistics companies running smarter, more profitable operations with Deposity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={handleSignIn} className="w-full sm:w-auto bg-[#7180B9] hover:bg-[#5a6797] text-white px-8 py-4 rounded-md text-base font-medium transition-all shadow-lg hover:shadow-xl active:scale-95">
                Start Your Free Trial
              </button>
              <button className="w-full sm:w-auto bg-white border border-[#9DB4C0]/40 hover:border-[#7180B9] text-[#0B132B] hover:text-[#7180B9] px-8 py-4 rounded-md text-base font-medium transition-all">
                Talk to Sales
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-[#9DB4C0]/20 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded bg-[#7180B9] flex items-center justify-center">
                  <Layers className="text-white w-3 h-3" />
                </div>
                <span className="font-display font-bold text-lg text-[#0B132B]">Deposity</span>
              </div>
              <p className="text-[#0B132B]/60 text-sm max-w-sm mb-6">
                The cloud-native logistics platform built for the modern supply chain. Replace spreadsheets with certainty.
              </p>
              <div className="flex gap-4">
                <button aria-label="Social link" className="w-8 h-8 rounded-full bg-[#E0FBFC]/40 border border-[#9DB4C0]/20 flex items-center justify-center text-[#9DB4C0] hover:text-[#7180B9] hover:border-[#7180B9] transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </button>
                <button aria-label="Social link" className="w-8 h-8 rounded-full bg-[#E0FBFC]/40 border border-[#9DB4C0]/20 flex items-center justify-center text-[#9DB4C0] hover:text-[#7180B9] hover:border-[#7180B9] transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </button>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-[#0B132B] mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-[#0B132B]/60">
                <li><a href="#" className="hover:text-[#7180B9] transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[#7180B9] transition-colors">Integrations</a></li>
                <li><a href="/pricing" className="hover:text-[#7180B9] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[#7180B9] transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#0B132B] mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-[#0B132B]/60">
                <li><a href="#" className="hover:text-[#7180B9] transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-[#7180B9] transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-[#7180B9] transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-[#7180B9] transition-colors">Case Studies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#0B132B] mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-[#0B132B]/60">
                <li><a href="#" className="hover:text-[#7180B9] transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[#7180B9] transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-[#7180B9] transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-[#7180B9] transition-colors">Partners</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#9DB4C0]/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-[#0B132B]/50">© {new Date().getFullYear()} AARCSX Deposity. All rights reserved.</div>
            <div className="flex gap-6 text-sm text-[#0B132B]/50">
              <a href="#" className="hover:text-[#7180B9] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#7180B9] transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
