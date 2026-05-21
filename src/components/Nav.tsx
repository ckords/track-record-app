"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Vote on Bills", primary: true },
  { href: "/my-record", label: "My Record", primary: false },
  { href: "/whats-happening", label: "What's Happening", primary: false },
  { href: "/politicians", label: "Politicians", primary: false },
  { href: "/contact", label: "Contact Your Rep", primary: false },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-50 shrink-0">
          Track Record
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, primary }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            if (primary) {
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    active
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  {label}
                </Link>
              );
            }
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "text-zinc-900 dark:text-zinc-50 font-medium bg-zinc-100 dark:bg-zinc-800"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile nav — horizontal scroll */}
        <nav className="md:hidden flex items-center gap-1 overflow-x-auto scrollbar-none -mr-4 pr-4">
          {navItems.map(({ href, label, primary }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  active || primary
                    ? active
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
