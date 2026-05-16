import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCandidateTotals, getTopEmployers, buildDonorSummary } from "@/lib/fec";

export async function POST(req: NextRequest) {
  const adminKey = process.env.ADMIN_API_KEY;
  if (adminKey) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${adminKey}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = await req.json() as { cycle?: number; slugs?: string[] };

  const politicians = await prisma.politician.findMany({
    where: body.slugs ? { slug: { in: body.slugs } } : undefined,
  });

  const withFec = politicians.filter((p) => {
    const ids = p.externalIds as Record<string, string> | null;
    return ids?.fec_candidate_id && ids?.fec_committee_id;
  });

  if (withFec.length === 0) {
    return Response.json({ message: "No politicians with fec_candidate_id + fec_committee_id found", synced: [], errors: [] });
  }

  const synced: string[] = [];
  const errors: Array<{ slug: string; error: string }> = [];

  await Promise.allSettled(
    withFec.map(async (politician) => {
      const ids = politician.externalIds as Record<string, string>;
      const candidateId = ids.fec_candidate_id;
      const committeeId = ids.fec_committee_id;

      // For senators, use the last recorded cycle; for House members, use current year.
      // Caller can override via body.cycle.
      const cycle = body.cycle ?? new Date().getFullYear();

      try {
        const [totals, employers] = await Promise.all([
          getCandidateTotals(candidateId, cycle),
          getTopEmployers(committeeId, cycle),
        ]);

        if (!totals) throw new Error(`No FEC data for cycle ${cycle}`);

        const { topDonors, donorIndustries } = buildDonorSummary(employers);

        await prisma.financeRecord.upsert({
          where: { politicianId_cycle: { politicianId: politician.id, cycle } },
          create: {
            politicianId: politician.id,
            cycle,
            totalRaised: totals.receipts,
            totalSpent: totals.disbursements,
            cashOnHand: parseFloat(totals.cash_on_hand_end_period),
            topDonors,
            donorIndustries,
            sourceUrl: `https://www.fec.gov/data/candidate/${candidateId}/?cycle=${cycle}`,
            externalId: candidateId,
          },
          update: {
            totalRaised: totals.receipts,
            totalSpent: totals.disbursements,
            cashOnHand: parseFloat(totals.cash_on_hand_end_period),
            topDonors,
            donorIndustries,
            sourceUrl: `https://www.fec.gov/data/candidate/${candidateId}/?cycle=${cycle}`,
            externalId: candidateId,
          },
        });

        synced.push(politician.slug);
      } catch (err) {
        errors.push({ slug: politician.slug, error: err instanceof Error ? err.message : String(err) });
      }
    })
  );

  return Response.json({ cycle: body.cycle ?? new Date().getFullYear(), total: withFec.length, synced, errors });
}
