import { prisma } from "@/lib/prisma";
import { computeCorrelations } from "@/lib/correlation";
import Link from "next/link";
import { notFound } from "next/navigation";

function formatMoney(n: number | null | undefined) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default async function FollowTheMoneyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const politician = await prisma.politician.findUnique({ where: { slug } });
  if (!politician) notFound();

  const [records, correlations, voteTotal] = await Promise.all([
    prisma.financeRecord.findMany({
      where: { politicianId: politician.id },
      orderBy: { cycle: "desc" },
    }),
    computeCorrelations(politician.id),
    prisma.vote.count({ where: { politicianId: politician.id } }),
  ]);

  const allCycles = records.map((r) => r.cycle).sort((a, b) => b - a);
  const totalRaisedAllCycles = records.reduce((sum, r) => sum + (r.totalRaised ?? 0), 0);

  // Aggregate top donors across all cycles
  const donorMap = new Map<string, { amount: number; type: string }>();
  for (const record of records) {
    const donors = (record.topDonors as Array<{ name: string; amount: number; type: string }> | null) ?? [];
    for (const d of donors) {
      const existing = donorMap.get(d.name);
      donorMap.set(d.name, {
        amount: (existing?.amount ?? 0) + d.amount,
        type: d.type,
      });
    }
  }
  const topDonors = [...donorMap.entries()]
    .sort(([, a], [, b]) => b.amount - a.amount)
    .slice(0, 10)
    .map(([name, data]) => ({ name, ...data }));

  const maxDonorAmount = topDonors[0]?.amount ?? 1;

  // Significant correlations: overlap score > 0 and both donated and voted
  const flaggedCorrelations = correlations.filter(
    (c) => c.overlapScore > 0 && c.voteCount > 0
  );

  const maxDonated = correlations[0]?.donated ?? 1;

  const externalIds = (politician.externalIds as Record<string, string> | null) ?? {};
  const openSecretsCid = externalIds.opensecrets_cid;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link
          href={`/politicians/${slug}`}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          ← {politician.name}
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">Follow the Money</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Campaign finance and legislative attention across {allCycles.length} election cycle
          {allCycles.length !== 1 ? "s" : ""}
          {allCycles.length > 0 ? ` (${allCycles[allCycles.length - 1]}–${allCycles[0]})` : ""}
        </p>
      </div>

      {records.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
          <p className="text-zinc-500 mb-3">No campaign finance data available yet.</p>
          {openSecretsCid ? (
            <p className="text-xs text-zinc-400">
              OpenSecrets CID: <code className="font-mono">{openSecretsCid}</code> — sync via{" "}
              <code className="font-mono">POST /api/opensecrets/sync</code>
            </p>
          ) : (
            <p className="text-xs text-zinc-400">
              To import data, sync via <code className="font-mono">POST /api/opensecrets/sync</code> with{" "}
              <code className="font-mono">{`{ "slug": "${slug}", "cid": "<opensecrets_cid>" }`}</code>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* ── Summary row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{formatMoney(totalRaisedAllCycles)}</div>
              <div className="text-xs text-zinc-500 mt-1">Total Raised</div>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{allCycles.length}</div>
              <div className="text-xs text-zinc-500 mt-1">Election Cycles</div>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{topDonors.length}</div>
              <div className="text-xs text-zinc-500 mt-1">Unique Donors</div>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{voteTotal}</div>
              <div className="text-xs text-zinc-500 mt-1">Votes Recorded</div>
            </div>
          </div>

          {/* ── Donor-Vote Correlation ── */}
          {correlations.length > 0 && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                Industry Money vs. Legislative Attention
              </h2>
              <p className="text-xs text-zinc-500 mb-5">
                Bars show donation share. Dot size reflects how many votes fell in related categories.
                Highlighted rows had both significant funding and legislative activity.
              </p>
              <div className="space-y-4">
                {correlations.map((c) => {
                  const isHighlight = c.overlapScore > 0 && c.voteCount > 0;
                  return (
                    <div key={c.industry} className={`rounded-lg p-3 ${isHighlight ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800" : ""}`}>
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          {isHighlight && (
                            <span className="text-amber-500 text-xs shrink-0" title="High overlap">●</span>
                          )}
                          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                            {c.industry}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 text-xs text-zinc-500">
                          <span>{formatMoney(c.donated)}</span>
                          {c.voteCount > 0 && (
                            <span className="text-blue-600 dark:text-blue-400">
                              {c.voteCount} vote{c.voteCount !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isHighlight ? "bg-amber-400" : "bg-blue-400"}`}
                          style={{ width: `${Math.min(100, (c.donated / maxDonated) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Notable overlaps ── */}
          {flaggedCorrelations.length > 0 && (
            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-6">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                Notable Money + Votes Overlaps
              </h2>
              <div className="space-y-3">
                {flaggedCorrelations.slice(0, 5).map((c) => (
                  <div key={c.industry} className="text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="font-medium">{politician.name}</span> received{" "}
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">{formatMoney(c.donated)}</span> from{" "}
                    <span className="font-semibold">{c.industry}</span> donors and cast{" "}
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{c.voteCount} vote{c.voteCount !== 1 ? "s" : ""}</span>{" "}
                    on related legislation ({c.voteCategories.filter((_, i) => i < 3).join(", ")}).
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-400 mt-4">
                Overlap indicates shared domain, not implied quid pro quo. Data shows correlation only.
              </p>
            </div>
          )}

          {/* ── Top donors ── */}
          {topDonors.length > 0 && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Top Donors (All Cycles)</h2>
              <div className="space-y-3">
                {topDonors.map((donor, i) => (
                  <div key={donor.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-zinc-400 w-5 shrink-0">{i + 1}</span>
                        <span className="text-zinc-700 dark:text-zinc-300 truncate">{donor.name}</span>
                        <span className="text-xs text-zinc-400 shrink-0">{donor.type}</span>
                      </div>
                      <span className="font-medium text-zinc-900 dark:text-zinc-50 shrink-0 ml-4">
                        {formatMoney(donor.amount)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, (donor.amount / maxDonorAmount) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Per-cycle breakdown ── */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-4">By Election Cycle</h2>
            <div className="space-y-3">
              {records.map((record) => (
                <div key={record.cycle} className="flex items-center justify-between text-sm border-b border-zinc-100 dark:border-zinc-800 pb-3 last:border-0 last:pb-0">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{record.cycle}</span>
                  <div className="flex gap-6 text-zinc-500">
                    <span>Raised: <span className="text-zinc-900 dark:text-zinc-100">{formatMoney(record.totalRaised)}</span></span>
                    <span>Spent: <span className="text-zinc-900 dark:text-zinc-100">{formatMoney(record.totalSpent)}</span></span>
                    {record.sourceUrl && (
                      <a
                        href={record.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Source →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {openSecretsCid && (
            <p className="text-xs text-zinc-400 text-center">
              Data sourced from{" "}
              <a
                href={`https://www.opensecrets.org/members-of-congress/summary?cid=${openSecretsCid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-zinc-600"
              >
                OpenSecrets
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
