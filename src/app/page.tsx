import { prisma } from "@/lib/prisma";

export const revalidate = 3600;
import VotingInterface, { type Bill } from "@/components/VotingInterface";

const BILL_DESCRIPTIONS: Record<string, string> = {
  "American Rescue Plan Act of 2021":
    "$1.9 trillion COVID-19 relief: $1,400 direct payments to most Americans, extended unemployment benefits, $350B for state and local governments, and accelerated vaccine distribution.",
  "Infrastructure Investment and Jobs Act":
    "$1.2 trillion bipartisan bill to rebuild roads, bridges, rail, and ports; expand broadband internet to rural areas; and modernize the power grid and water systems.",
  "Inflation Reduction Act of 2022":
    "The largest US climate investment ever ($369B), allowing Medicare to negotiate prescription drug prices for the first time, and imposing a 15% minimum corporate tax on large companies.",
  "CARES Act":
    "$2.2 trillion emergency relief: $1,200 direct payments, $600/week supplemental unemployment, $500B for corporations, and $130B for hospitals during the COVID-19 pandemic.",
  "Tax Cuts and Jobs Act of 2017":
    "Cut the corporate tax rate from 35% to 21%, nearly doubled the standard deduction, capped the SALT deduction at $10K, and added an estimated $1.5–1.9 trillion to the national deficit over 10 years.",
  "American Health Care Act of 2017":
    "Republican plan to repeal and replace the Affordable Care Act. Would have eliminated the individual mandate, cut Medicaid by $834B, and allowed states to waive protections for pre-existing conditions.",
  "Ukraine Security Supplemental Appropriations Act":
    "$61 billion in military and economic aid for Ukraine's defense against Russia's invasion, including artillery, air defense systems, and humanitarian assistance.",
  "Article of Impeachment Against Donald J. Trump (Second Impeachment)":
    "Charged President Trump with 'incitement of insurrection' for his role in the January 6, 2021 attack on the U.S. Capitol. He was acquitted by the Senate 57-43 — the most bipartisan impeachment vote in history.",
};

export default async function HomePage() {
  const allVotes = await prisma.vote.findMany({
    select: { billTitle: true, position: true, chamber: true, date: true, category: true },
  });

  const billMap = new Map<string, Bill>();

  for (const v of allVotes) {
    const existing = billMap.get(v.billTitle);
    if (!existing) {
      billMap.set(v.billTitle, {
        billTitle: v.billTitle,
        chamber: v.chamber,
        date: v.date.toISOString(),
        category: v.category,
        description: BILL_DESCRIPTIONS[v.billTitle] ?? "",
        yeas: v.position === "Yea" ? 1 : 0,
        nays: v.position === "Nay" ? 1 : 0,
      });
    } else {
      if (v.position === "Yea") existing.yeas++;
      else if (v.position === "Nay") existing.nays++;
    }
  }

  // Bills with descriptions first (most informative), then by date
  const bills = Array.from(billMap.values()).sort((a, b) => {
    const aHasDesc = a.description ? 1 : 0;
    const bHasDesc = b.description ? 1 : 0;
    if (aHasDesc !== bHasDesc) return bHasDesc - aHasDesc;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div>
      <div className="bg-zinc-900 dark:bg-zinc-950 text-white py-8 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-2xl font-bold tracking-tight mb-1">How would you vote?</h1>
          <p className="text-sm text-zinc-400">
            Vote on real bills. See which politicians agree with you.
          </p>
        </div>
      </div>
      <VotingInterface bills={bills} />
    </div>
  );
}
