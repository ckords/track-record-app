import Link from "next/link";
import type { Politician } from "@/generated/prisma/client";

const partyColors: Record<string, string> = {
  DEMOCRAT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  REPUBLICAN: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  INDEPENDENT: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  GREEN: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  LIBERTARIAN: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  OTHER: "bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200",
};

const levelLabels: Record<string, string> = {
  FEDERAL: "Federal",
  STATE: "State",
  LOCAL: "Local",
};

export default function PoliticianCard({ politician }: { politician: Politician }) {
  const partyClass = partyColors[politician.party] ?? partyColors.OTHER;

  return (
    <Link
      href={`/politicians/${politician.slug}`}
      className="block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">
            {politician.name}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
            {politician.office}
            {politician.state ? ` · ${politician.state}` : ""}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${partyClass}`}>
            {politician.party.charAt(0) + politician.party.slice(1).toLowerCase()}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {levelLabels[politician.level]}
          </span>
        </div>
      </div>
      {!politician.isActive && (
        <p className="mt-2 text-xs text-zinc-400">Inactive</p>
      )}
    </Link>
  );
}
