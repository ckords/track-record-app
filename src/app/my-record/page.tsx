"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type UserVote = "Yea" | "Nay" | "Skip";
type UserVotes = Record<string, UserVote>;

interface PoliticianVote {
  billTitle: string;
  position: string;
}

interface Politician {
  id: string;
  name: string;
  slug: string;
  party: string;
  state: string | null;
  office: string;
  votes: PoliticianVote[];
}

interface AlignmentResult {
  politician: Politician;
  alignment: number;
  compared: number;
}

const STORAGE_KEY = "track-record-votes";

const partyColors: Record<string, string> = {
  DEMOCRAT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  REPUBLICAN: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  INDEPENDENT: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  GREEN: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  LIBERTARIAN: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  OTHER: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

function computeAlignment(userVotes: UserVotes, politicianVotes: PoliticianVote[]): { alignment: number; compared: number } | null {
  const comparable = politicianVotes.filter(
    (v) => userVotes[v.billTitle] && userVotes[v.billTitle] !== "Skip"
  );
  if (comparable.length === 0) return null;
  const matching = comparable.filter((v) => v.position === userVotes[v.billTitle]);
  return { alignment: matching.length / comparable.length, compared: comparable.length };
}

function AlignmentBar({ pct }: { pct: number }) {
  const color = pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 w-9 text-right">
        {Math.round(pct)}%
      </span>
    </div>
  );
}

export default function MyRecordPage() {
  const [votes, setVotes] = useState<UserVotes | null>(null);
  const [politicians, setPoliticians] = useState<Politician[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setVotes(stored ? JSON.parse(stored) : {});
    } catch {
      setVotes({});
    }
  }, []);

  useEffect(() => {
    fetch("/api/politician-votes")
      .then((r) => r.json())
      .then(({ politicians }) => setPoliticians(politicians))
      .catch(() => setPoliticians([]))
      .finally(() => setLoading(false));
  }, []);

  if (!votes || loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-300 border-t-zinc-700 animate-spin" />
      </div>
    );
  }

  const realVotes = Object.entries(votes).filter(([, v]) => v !== "Skip");
  const totalVoted = Object.keys(votes).length;

  if (totalVoted === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Your record is empty
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">
          Vote on a few bills to see which politicians align with your positions.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-sm hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
        >
          Start Voting →
        </Link>
      </div>
    );
  }

  // Compute alignment for all politicians
  const results: AlignmentResult[] = [];
  for (const p of politicians ?? []) {
    const result = computeAlignment(votes, p.votes);
    if (result && result.compared >= 1) {
      results.push({ politician: p, ...result });
    }
  }
  results.sort((a, b) => b.alignment - a.alignment);

  const topAligned = results.slice(0, 5);
  const leastAligned = [...results].reverse().slice(0, 5);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">My Record</h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8">
        You&apos;ve voted on {totalVoted} bill{totalVoted !== 1 ? "s" : ""}
        {realVotes.length < totalVoted ? ` (${totalVoted - realVotes.length} skipped)` : ""}.
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-center">
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{totalVoted}</div>
          <div className="text-xs text-zinc-500 mt-0.5">Bills Voted</div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Object.values(votes).filter((v) => v === "Yea").length}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">Yes Votes</div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {Object.values(votes).filter((v) => v === "Nay").length}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">No Votes</div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center text-zinc-400 text-sm mb-10">
          Not enough overlap yet — vote on more bills to see alignment scores.
        </div>
      ) : (
        <>
          {/* Most aligned */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Most aligned with you
            </h2>
            <div className="space-y-3">
              {topAligned.map(({ politician, alignment, compared }) => (
                <Link
                  key={politician.id}
                  href={`/politicians/${politician.slug}`}
                  className="flex items-center gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm truncate">
                        {politician.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${partyColors[politician.party] ?? partyColors.OTHER}`}>
                        {politician.party.charAt(0) + politician.party.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {politician.office}{politician.state ? ` · ${politician.state}` : ""}
                    </p>
                    <AlignmentBar pct={alignment * 100} />
                    <p className="text-xs text-zinc-400 mt-0.5">{compared} bill{compared !== 1 ? "s" : ""} in common</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Least aligned */}
          {leastAligned.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                Least aligned with you
              </h2>
              <div className="space-y-3">
                {leastAligned.map(({ politician, alignment, compared }) => (
                  <Link
                    key={politician.id}
                    href={`/politicians/${politician.slug}`}
                    className="flex items-center gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm truncate">
                          {politician.name}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${partyColors[politician.party] ?? partyColors.OTHER}`}>
                          {politician.party.charAt(0) + politician.party.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        {politician.office}{politician.state ? ` · ${politician.state}` : ""}
                      </p>
                      <AlignmentBar pct={alignment * 100} />
                      <p className="text-xs text-zinc-400 mt-0.5">{compared} bill{compared !== 1 ? "s" : ""} in common</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Full rankings toggle */}
          {results.length > 5 && (
            <section className="mb-10">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors mb-4"
              >
                {showAll ? "Hide full rankings" : `Show all ${results.length} politicians →`}
              </button>
              {showAll && (
                <div className="space-y-2">
                  {results.map(({ politician, alignment, compared }) => (
                    <Link
                      key={politician.id}
                      href={`/politicians/${politician.slug}`}
                      className="flex items-center justify-between rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 hover:shadow-sm transition-shadow"
                    >
                      <div className="min-w-0 flex-1 mr-4">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate block">
                          {politician.name}
                        </span>
                        <span className="text-xs text-zinc-400">{compared} bills</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${partyColors[politician.party] ?? partyColors.OTHER}`}>
                          {politician.party.charAt(0) + politician.party.slice(1).toLowerCase()}
                        </span>
                        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 w-10 text-right">
                          {Math.round(alignment * 100)}%
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* User's vote history */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Your votes</h2>
        <div className="space-y-2">
          {Object.entries(votes).map(([bill, vote]) => (
            <div
              key={bill}
              className="flex items-center justify-between rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3"
            >
              <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1 mr-4 leading-snug">{bill}</span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  vote === "Yea"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : vote === "Nay"
                    ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                }`}
              >
                {vote === "Yea" ? "✓ Yes" : vote === "Nay" ? "✗ No" : "Skip"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 flex gap-3 flex-wrap">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-sm hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
        >
          Vote on more bills
        </Link>
        <button
          onClick={() => {
            try { localStorage.removeItem(STORAGE_KEY); } catch {}
            setVotes({});
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Clear my record
        </button>
      </div>
    </div>
  );
}
