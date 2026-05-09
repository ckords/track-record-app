import Link from "next/link";

export default function Nav() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg tracking-tight">
          Track Record
        </Link>
        <nav className="flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/politicians" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Politicians
          </Link>
          <Link href="/contact" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Contact Your Rep
          </Link>
        </nav>
      </div>
    </header>
  );
}
