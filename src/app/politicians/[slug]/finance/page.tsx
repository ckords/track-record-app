import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

function formatMoney(n: number | null) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default async function FinancePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const politician = await prisma.politician.findUnique({ where: { slug } });
  if (!politician) notFound();

  const records = await prisma.financeRecord.findMany({
    where: { politicianId: politician.id },
    orderBy: { cycle: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link href={`/politicians/${slug}`} className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          ← {politician.name}
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">Campaign Finance</h1>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">No finance data available yet.</div>
      ) : (
        <div className="space-y-6">
          {records.map((record) => {
            const donors = (record.topDonors as Array<{ name: string; amount: number; type: string }> | null) ?? [];
            const industries = (record.donorIndustries as Array<{ industry: string; amount: number; percentage: number }> | null) ?? [];

            return (
              <div key={record.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                  {record.cycle} Election Cycle
                </h2>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {formatMoney(record.totalRaised)}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">Total Raised</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {formatMoney(record.totalSpent)}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">Total Spent</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {formatMoney(record.cashOnHand)}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">Cash on Hand</div>
                  </div>
                </div>

                {donors.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Top Donors</h3>
                    <div className="space-y-1.5">
                      {donors.slice(0, 5).map((d, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-zinc-700 dark:text-zinc-300">{d.name}</span>
                          <span className="text-zinc-500 font-medium">{formatMoney(d.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {industries.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Donor Industries</h3>
                    <div className="space-y-2">
                      {industries.slice(0, 5).map((ind, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-zinc-600 dark:text-zinc-400">{ind.industry}</span>
                            <span className="text-zinc-500">{ind.percentage.toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${Math.min(100, ind.percentage)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {record.sourceUrl && (
                  <a href={record.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-4 inline-block">
                    Source →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
