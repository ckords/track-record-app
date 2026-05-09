import Link from "next/link";

const features = [
  {
    title: "Voting Records",
    description: "See exactly how your representatives vote on every bill — federal, state, and local.",
    href: "/politicians",
    icon: "🗳️",
  },
  {
    title: "Promise Tracker",
    description: "Hold politicians to their campaign promises. Track what was promised and what was delivered.",
    href: "/politicians",
    icon: "📋",
  },
  {
    title: "Campaign Finance",
    description: "Follow the money. Understand who funds your politicians and what industries back them.",
    href: "/politicians",
    icon: "💰",
  },
  {
    title: "Contact Your Rep",
    description: "Find and contact your representatives at every level of government — all in one place.",
    href: "/contact",
    icon: "✉️",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
          Hold Power Accountable
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Track voting records, campaign promises, and campaign finance for politicians
          at every level of government — federal, state, and local.
        </p>
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Link
            href="/politicians"
            className="inline-flex items-center px-6 py-3 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-sm hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
          >
            Browse Politicians
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Contact Your Rep
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {features.map((f) => (
          <Link
            key={f.title}
            href={f.href}
            className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-3">{f.icon}</div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {f.title}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {f.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
