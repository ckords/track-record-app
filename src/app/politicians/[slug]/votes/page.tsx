import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

const positionColors: Record<string, string> = {
  Yes: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  No: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  Abstain: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  "Not Voting": "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  Present: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
};

export default async function VotesPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { slug } = await params;
  const { category, page } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1", 10));
  const pageSize = 25;

  const politician = await prisma.politician.findUnique({ where: { slug } });
  if (!politician) notFound();

  const [votes, total] = await Promise.all([
    prisma.vote.findMany({
      where: {
        politicianId: politician.id,
        ...(category ? { category } : {}),
      },
      orderBy: { date: "desc" },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    }),
    prisma.vote.count({
      where: {
        politicianId: politician.id,
        ...(category ? { category } : {}),
      },
    }),
  ]);

  const categories = await prisma.vote.findMany({
    where: { politicianId: politician.id, category: { not: null } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link href={`/politicians/${slug}`} className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          ← {politician.name}
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">Voting Record</h1>
      </div>

      <form method="GET" className="flex gap-3 mb-6 flex-wrap">
        <select
          name="category"
          defaultValue={category ?? ""}
          className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.category} value={c.category!}>
              {c.category}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors">
          Filter
        </button>
      </form>

      <div className="text-sm text-zinc-500 mb-4">{total} votes total</div>

      {votes.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">No votes found.</div>
      ) : (
        <div className="space-y-3">
          {votes.map((vote) => {
            const posClass = positionColors[vote.position] ?? positionColors.Abstain;
            return (
              <div
                key={vote.id}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-900 dark:text-zinc-50 text-sm">{vote.billTitle}</p>
                    {vote.billSummary && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{vote.billSummary}</p>
                    )}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {vote.category && (
                        <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded">
                          {vote.category}
                        </span>
                      )}
                      {vote.result && (
                        <span className="text-xs text-zinc-400">{vote.result}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${posClass}`}>
                      {vote.position}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {new Date(vote.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
                {vote.sourceUrl && (
                  <a href={vote.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                    Source →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {pageNum > 1 && (
            <Link
              href={`?${new URLSearchParams({ ...(category ? { category } : {}), page: String(pageNum - 1) })}`}
              className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Previous
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-zinc-500">
            Page {pageNum} of {totalPages}
          </span>
          {pageNum < totalPages && (
            <Link
              href={`?${new URLSearchParams({ ...(category ? { category } : {}), page: String(pageNum + 1) })}`}
              className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
