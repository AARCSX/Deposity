import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import FleetMetrics from "@/components/landing/FleetMetrics";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="bg-white text-slate-950">
      <Navbar />
      <Hero />
      <Features />
      <FleetMetrics />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}