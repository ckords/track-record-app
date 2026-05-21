import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import Link from "next/link";

const categoryColors: Record<string, string> = {
  "Economic Relief": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "Infrastructure": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "Climate & Energy": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  "Healthcare": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  "Tax Policy": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  "Foreign Policy": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  "Oversight & Accountability": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

const partyColors: Record<string, string> = {
  DEMOCRAT: "text-blue-600 dark:text-blue-400",
  REPUBLICAN: "text-red-600 dark:text-red-400",
  INDEPENDENT: "text-purple-600 dark:text-purple-400",
  OTHER: "text-zinc-500",
};

export default async function WhatsHappeningPage() {
  // Get all votes grouped by bill, with politician breakdown
  const votes = await prisma.vote.findMany({
    select: {
      billTitle: true,
      chamber: true,
      date: true,
      position: true,
      category: true,
      politician: {
        select: { name: true, slug: true, party: true, state: true },
      },
    },
    orderBy: { date: "desc" },
  });

  // Group by bill
  type BillEntry = {
    billTitle: string;
    chamber: string;
    date: Date;
    category: string | null;
    yeas: Array<{ name: string; slug: string; party: string; state: string | null }>;
    nays: Array<{ name: string; slug: string; party: string; state: string | null }>;
  };

  const billMap = new Map<string, BillEntry>();
  for (const v of votes) {
    const existing = billMap.get(v.billTitle);
    if (!existing) {
      billMap.set(v.billTitle, {
        billTitle: v.billTitle,
        chamber: v.chamber,
        date: v.date,
        category: v.category,
        yeas: v.position === "Yea" ? [v.politician] : [],
        nays: v.position === "Nay" ? [v.politician] : [],
      });
    } else {
      if (v.position === "Yea") existing.yeas.push(v.politician);
      else if (v.position === "Nay") existing.nays.push(v.politician);
      if (v.date > existing.date) existing.date = v.date;
    }
  }

  const bills = Array.from(billMap.values()).sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
        What&apos;s Happening
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8">
        Bills that have been voted on by tracked politicians — and how they split.
      </p>

      <div className="space-y-6">
        {bills.map((bill) => {
          const total = bill.yeas.length + bill.nays.length;
          const yeaPct = total > 0 ? Math.round((bill.yeas.length / total) * 100) : 0;
          const catClass = bill.category
            ? (categoryColors[bill.category] ?? "bg-zinc-100 text-zinc-700")
            : null;

          return (
            <div
              key={bill.billTitle}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {catClass && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catClass}`}>
                        {bill.category}
                      </span>
                    )}
                    <span className="text-xs text-zinc-400">
                      {bill.chamber === "SENATE" ? "Senate" : "House"} ·{" "}
                      {new Date(bill.date).getFullYear()}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 leading-snug">
                    {bill.billTitle}
                  </h2>
                </div>
              </div>

              {/* Vote split bar */}
              {total > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">{bill.yeas.length} Yes</span>
                    <span className="text-red-600 dark:text-red-400 font-medium">{bill.nays.length} No</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-blue-500 rounded-l-full"
                      style={{ width: `${yeaPct}%` }}
                    />
                    <div
                      className="h-full bg-red-400 rounded-r-full"
                      style={{ width: `${100 - yeaPct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Who voted yes */}
              {bill.yeas.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs font-medium text-zinc-400 mb-1.5">Voted Yes</div>
                  <div className="flex flex-wrap gap-1.5">
                    {bill.yeas.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/politicians/${p.slug}`}
                        className={`text-xs font-medium hover:underline ${partyColors[p.party] ?? partyColors.OTHER}`}
                      >
                        {p.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Who voted no */}
              {bill.nays.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-zinc-400 mb-1.5">Voted No</div>
                  <div className="flex flex-wrap gap-1.5">
                    {bill.nays.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/politicians/${p.slug}`}
                        className={`text-xs font-medium hover:underline ${partyColors[p.party] ?? partyColors.OTHER}`}
                      >
                        {p.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <Link
                  href="/"
                  className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  Vote on this bill yourself →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
