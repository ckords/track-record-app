import { prisma } from "@/lib/prisma";
import PoliticianCard from "@/components/PoliticianCard";
import type { GovernmentLevel } from "@/generated/prisma/client";

const LEVELS: Array<{ value: GovernmentLevel | "ALL"; label: string }> = [
  { value: "ALL", label: "All Levels" },
  { value: "FEDERAL", label: "Federal" },
  { value: "STATE", label: "State" },
  { value: "LOCAL", label: "Local" },
];

export default async function PoliticiansPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; state?: string; q?: string }>;
}) {
  const { level, state, q } = await searchParams;

  const politicians = await prisma.politician.findMany({
    where: {
      ...(level && level !== "ALL" ? { level: level as GovernmentLevel } : {}),
      ...(state ? { state } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { office: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ level: "asc" }, { name: "asc" }],
    take: 100,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Politicians</h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8">
        Search and filter representatives at every level of government.
      </p>

      <form method="GET" className="flex flex-wrap gap-3 mb-8">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or office..."
          className="flex-1 min-w-48 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
        <select
          name="level"
          defaultValue={level ?? "ALL"}
          className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
        >
          {LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <input
          name="state"
          defaultValue={state}
          placeholder="State (e.g. CA)"
          maxLength={2}
          className="w-28 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
        >
          Search
        </button>
      </form>

      {politicians.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          No politicians found. Try adjusting your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {politicians.map((p) => (
            <PoliticianCard key={p.id} politician={p} />
          ))}
        </div>
      )}
    </div>
  );
}
