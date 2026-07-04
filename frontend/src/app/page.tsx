import PremiumNavbar from "@/components/landing/PremiumNavbar";
import PremiumHero from "@/components/landing/PremiumHero";
import PremiumMarquee from "@/components/landing/PremiumMarquee";
import PremiumFeatures from "@/components/landing/PremiumFeatures";
import PremiumShowcase from "@/components/landing/PremiumShowcase";
import PremiumStats from "@/components/landing/PremiumStats";
import PremiumTestimonials from "@/components/landing/PremiumTestimonials";
import PremiumCTA from "@/components/landing/PremiumCTA";
import PremiumFooter from "@/components/landing/PremiumFooter";

export default function Home() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fbff_0%,_#ffffff_45%,_#f8fbff_100%)] text-slate-950">
      <PremiumNavbar />
      <PremiumHero />
      <PremiumMarquee />
      <PremiumFeatures />
      <PremiumShowcase />
      <PremiumStats />
      <PremiumTestimonials />
      <PremiumCTA />
      <PremiumFooter />
    </main>
  );
}