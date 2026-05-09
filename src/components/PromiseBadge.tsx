import type { PromiseStatus } from "@/generated/prisma/client";

const statusConfig: Record<PromiseStatus, { label: string; className: string }> = {
  KEPT: { label: "Kept", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  BROKEN: { label: "Broken", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  IN_PROGRESS: { label: "In Progress", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  COMPROMISED: { label: "Compromised", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  STALLED: { label: "Stalled", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  NOT_YET_RATED: { label: "Unrated", className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" },
};

export default function PromiseBadge({ status }: { status: PromiseStatus }) {
  const { label, className } = statusConfig[status];
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
}
