"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export interface Bill {
  billTitle: string;
  chamber: string;
  date: string;
  category: string | null;
  description: string;
  yeas: number;
  nays: number;
}

type UserVote = "Yea" | "Nay" | "Skip";
type UserVotes = Record<string, UserVote>;

const STORAGE_KEY = "track-record-votes";

const categoryColors: Record<string, string> = {
  "Economic Relief": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "Infrastructure": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "Climate & Energy": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  "Healthcare": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  "Tax Policy": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  "Foreign Policy": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  "Oversight & Accountability": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

export default function VotingInterface({ bills }: { bills: Bill[] }) {
  const [index, setIndex] = useState(0);
  const [votes, setVotes] = useState<UserVotes>({});
  const [animating, setAnimating] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setVotes(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  const remainingBills = bills.filter((b) => !(b.billTitle in votes));
  const done = remainingBills.length === 0;

  function cast(vote: UserVote) {
    if (animating || remainingBills.length === 0) return;
    setAnimating(true);
    const bill = remainingBills[0];
    const next = { ...votes, [bill.billTitle]: vote };
    setVotes(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    setTimeout(() => {
      setIndex((i) => i + 1);
      setAnimating(false);
    }, 180);
  }

  const totalCast = Object.keys(votes).length;
  const progress = bills.length > 0 ? totalCast / bills.length : 0;

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-5xl mb-4">🗳️</div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          You&apos;ve weighed in on {totalCast} bill{totalCast !== 1 ? "s" : ""}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm">
          See how your votes compare to every member of Congress.
        </p>
        <Link
          href="/my-record"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-sm hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
        >
          View My Record →
        </Link>
        <button
          onClick={() => {
            try { localStorage.removeItem(STORAGE_KEY); } catch {}
            setVotes({});
            setIndex(0);
          }}
          className="mt-4 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          Start over
        </button>
      </div>
    );
  }

  const bill = remainingBills[0];
  const catClass = bill.category ? (categoryColors[bill.category] ?? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300") : null;
  const yeaPct = bill.yeas + bill.nays > 0 ? Math.round((bill.yeas / (bill.yeas + bill.nays)) * 100) : null;

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
          <span>{totalCast} voted</span>
          <span>{remainingBills.length} remaining</span>
        </div>
        <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        className={`bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm transition-opacity duration-150 ${animating ? "opacity-0" : "opacity-100"}`}
      >
        <div className="flex items-center gap-2 mb-4">
          {catClass && (
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${catClass}`}>
              {bill.category}
            </span>
          )}
          <span className="text-xs text-zinc-400">
            {bill.chamber === "SENATE" ? "Senate" : "House"} · {new Date(bill.date).getFullYear()}
          </span>
        </div>

        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-snug mb-3">
          {bill.billTitle}
        </h2>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
          {bill.description}
        </p>

        {yeaPct !== null && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>Congress voted {yeaPct}% Yes</span>
              <span>{bill.yeas + bill.nays} legislators tracked</span>
            </div>
            <div className="h-1.5 bg-red-200 dark:bg-red-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${yeaPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Vote buttons */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={() => cast("Nay")}
          disabled={animating}
          className="flex-1 py-4 rounded-xl border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-95 transition-all disabled:opacity-50"
        >
          ✗ No
        </button>
        <button
          onClick={() => cast("Skip")}
          disabled={animating}
          className="px-5 py-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-400 font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-95 transition-all disabled:opacity-50"
        >
          Skip
        </button>
        <button
          onClick={() => cast("Yea")}
          disabled={animating}
          className="flex-1 py-4 rounded-xl border-2 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:bg-blue-50 dark:hover:bg-blue-950/30 active:scale-95 transition-all disabled:opacity-50"
        >
          ✓ Yes
        </button>
      </div>

      {totalCast > 0 && (
        <div className="mt-4 text-center">
          <Link href="/my-record" className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            See my record so far →
          </Link>
        </div>
      )}
    </div>
  );
}
