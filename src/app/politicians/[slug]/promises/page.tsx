import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import PromiseBadge from "@/components/PromiseBadge";
import type { PromiseStatus } from "@/generated/prisma/client";

const STATUSES: Array<{ value: PromiseStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "KEPT", label: "Kept" },
  { value: "BROKEN", label: "Broken" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPROMISED", label: "Compromised" },
  { value: "STALLED", label: "Stalled" },
  { value: "NOT_YET_RATED", label: "Unrated" },
];

export default async function PromisesPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { slug } = await params;
  const { status } = await searchParams;

  const politician = await prisma.politician.findUnique({ where: { slug } });
  if (!politician) notFound();

  const promises = await prisma.promise.findMany({
    where: {
      politicianId: politician.id,
      ...(status && status !== "ALL" ? { status: status as PromiseStatus } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const counts = await prisma.promise.groupBy({
    by: ["status"],
    where: { politicianId: politician.id },
    _count: true,
  });

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link href={`/politicians/${slug}`} className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          ← {politician.name}
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">Promise Tracker</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => {
          const count = s.value === "ALL"
            ? promises.length
            : (countMap[s.value as PromiseStatus] ?? 0);
          const isActive = (status ?? "ALL") === s.value;
          return (
            <Link
              key={s.value}
              href={`?${s.value !== "ALL" ? `status=${s.value}` : ""}`}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                isActive
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {s.label} ({count})
            </Link>
          );
        })}
      </div>

      {promises.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">No promises found.</div>
      ) : (
        <div className="space-y-4">
          {promises.map((promise) => (
            <div
              key={promise.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{promise.title}</h3>
                <PromiseBadge status={promise.status} />
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{promise.description}</p>
              {promise.notes && (
                <p className="text-xs text-zinc-500 mt-2 italic">{promise.notes}</p>
              )}
              <div className="flex gap-4 mt-3 flex-wrap">
                {promise.sourceUrl && (
                  <a href={promise.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                    Source →
                  </a>
                )}
                {promise.evidenceUrl && (
                  <a href={promise.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                    Evidence →
                  </a>
                )}
                {promise.madeAt && (
                  <span className="text-xs text-zinc-400">
                    Made: {new Date(promise.madeAt).toLocaleDateString("en-US")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
