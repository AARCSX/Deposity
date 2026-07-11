import Link from "next/link";

const links = [
  { label: "Terms", href: "/" },
  { label: "Privacy", href: "/" },
  { label: "Support", href: "/" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="flex flex-col gap-10 border-b border-slate-800 pb-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold text-white">Deposity</p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
              The calm command center for modern fleets, depots, and logistics teams.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            {links.map((link) => (
              <Link key={link.label} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Deposity. All rights reserved.</p>
          <p>Built for modern logistics teams.</p>
        </div>
      </div>
    </footer>
  );
}
