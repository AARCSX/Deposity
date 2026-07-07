"use client";

const logos = ["FedEx", "DHL", "Maersk", "UPS", "Blue Dart", "CEVA", "DP World", "Hellmann"];

export default function PremiumMarquee() {
  return (
    <section className="border-y border-slate-200/70 bg-white/70 py-8 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-6 text-center text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">
          Trusted by global freight leaders
        </p>
        <div className="relative overflow-hidden">
          <div className="flex w-max animate-[marquee_24s_linear_infinite] gap-10 whitespace-nowrap text-slate-500">
            {[...logos, ...logos].map((logo, index) => (
              <div key={`${logo}-${index}`} className="text-xl font-semibold tracking-[0.2em] text-slate-500/90">
                {logo}
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
