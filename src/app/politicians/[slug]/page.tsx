import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

const partyColors: Record<string, string> = {
  DEMOCRAT: "bg-blue-100 text-blue-800",
  REPUBLICAN: "bg-red-100 text-red-800",
  INDEPENDENT: "bg-purple-100 text-purple-800",
  GREEN: "bg-green-100 text-green-800",
  LIBERTARIAN: "bg-yellow-100 text-yellow-800",
  OTHER: "bg-zinc-100 text-zinc-800",
};

export default async function PoliticianPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const politician = await prisma.politician.findUnique({
    where: { slug },
    include: {
      _count: { select: { votes: true, promises: true, ratings: true } },
    },
  });

  if (!politician) notFound();

  const partyClass = partyColors[politician.party] ?? partyColors.OTHER;
  const avgRating = await prisma.rating.aggregate({
    where: { politicianId: politician.id },
    _avg: { score: true },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {politician.name}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">{politician.office}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${partyClass}`}>
                {politician.party.charAt(0) + politician.party.slice(1).toLowerCase()}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {politician.level.charAt(0) + politician.level.slice(1).toLowerCase()}
              </span>
              {politician.state && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {politician.state}
                </span>
              )}
              {!politician.isActive && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-200 text-zinc-500">
                  Inactive
                </span>
              )}
            </div>
          </div>

          {avgRating._avg.score && (
            <div className="text-center">
              <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {avgRating._avg.score.toFixed(1)}
              </div>
              <div className="text-xs text-zinc-500">
                / 5 · {politician._count.ratings} rating{politician._count.ratings !== 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>

        {politician.bio && (
          <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {politician.bio}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          {politician.website && (
            <a href={politician.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Website
            </a>
          )}
          {politician.email && (
            <a href={`mailto:${politician.email}`} className="text-blue-600 hover:underline">
              Email
            </a>
          )}
          {politician.phone && (
            <a href={`tel:${politician.phone}`} className="text-blue-600 hover:underline">
              {politician.phone}
            </a>
          )}
          {politician.twitter && (
            <a href={`https://twitter.com/${politician.twitter}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              @{politician.twitter}
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href={`/politicians/${slug}/votes`}
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:shadow-md transition-shadow"
        >
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {politician._count.votes}
          </div>
          <div className="text-sm text-zinc-500 mt-0.5">Votes Recorded</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">View voting record →</div>
        </Link>

        <Link
          href={`/politicians/${slug}/promises`}
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:shadow-md transition-shadow"
        >
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {politician._count.promises}
          </div>
          <div className="text-sm text-zinc-500 mt-0.5">Promises Tracked</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">View promises →</div>
        </Link>

        <Link
          href={`/politicians/${slug}/finance`}
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:shadow-md transition-shadow"
        >
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            $
          </div>
          <div className="text-sm text-zinc-500 mt-0.5">Campaign Finance</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">View finance →</div>
        </Link>
      </div>

      <div className="mt-4">
        <Link
          href={`/politicians/${slug}/follow-the-money`}
          className="flex items-center justify-between rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-5 hover:shadow-md transition-shadow"
        >
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Follow the Money</div>
            <div className="text-xs text-zinc-500 mt-0.5">Donor industries mapped to legislative votes</div>
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium shrink-0 ml-4">Explore →</div>
        </Link>
      </div>
    </div>
  );
}
