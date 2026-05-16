import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCandidateSummary, getTopContributors, getDonorIndustries } from "@/lib/opensecrets";

export async function POST(req: NextRequest) {
  const adminKey = process.env.ADMIN_API_KEY;
  if (adminKey) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${adminKey}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = await req.json() as { cycle?: number; slugs?: string[] };
  const targetCycle = body.cycle ?? new Date().getFullYear();

  const politicians = await prisma.politician.findMany({
    where: body.slugs ? { slug: { in: body.slugs } } : undefined,
  });

  const withCid = politicians.filter((p) => {
    const ids = p.externalIds as Record<string, string> | null;
    return ids?.opensecrets_cid;
  });

  if (withCid.length === 0) {
    return Response.json({ message: "No politicians with an opensecrets_cid found", synced: [], errors: [] });
  }

  const synced: string[] = [];
  const errors: Array<{ slug: string; error: string }> = [];

  await Promise.allSettled(
    withCid.map(async (politician) => {
      const cid = (politician.externalIds as Record<string, string>).opensecrets_cid;
      try {
        const [summary, contributors, industries] = await Promise.all([
          getCandidateSummary(cid, targetCycle),
          getTopContributors(cid, targetCycle),
          getDonorIndustries(cid, targetCycle),
        ]);

        const topDonors = contributors.map((c) => ({
          name: c.org_name,
          amount: parseFloat(c.total) || 0,
          type: parseFloat(c.pacs) >= parseFloat(c.indivs) ? "PAC" : "Individual",
        }));

        const rawIndustries = industries.map((ind) => ({
          industry: ind.industry_name,
          amount: parseFloat(ind.total) || 0,
          percentage: 0,
        }));
        const totalIndustryAmount = rawIndustries.reduce((s, i) => s + i.amount, 0);
        for (const ind of rawIndustries) {
          ind.percentage = totalIndustryAmount > 0 ? (ind.amount / totalIndustryAmount) * 100 : 0;
        }

        await prisma.financeRecord.upsert({
          where: { politicianId_cycle: { politicianId: politician.id, cycle: targetCycle } },
          create: {
            politicianId: politician.id,
            cycle: targetCycle,
            totalRaised: parseFloat(summary.total) || null,
            totalSpent: parseFloat(summary.spent) || null,
            cashOnHand: parseFloat(summary.cash_on_hand) || null,
            topDonors,
            donorIndustries: rawIndustries,
            sourceUrl: `https://www.opensecrets.org/members-of-congress/summary?cid=${cid}`,
            externalId: cid,
          },
          update: {
            totalRaised: parseFloat(summary.total) || null,
            totalSpent: parseFloat(summary.spent) || null,
            cashOnHand: parseFloat(summary.cash_on_hand) || null,
            topDonors,
            donorIndustries: rawIndustries,
            sourceUrl: `https://www.opensecrets.org/members-of-congress/summary?cid=${cid}`,
            externalId: cid,
          },
        });

        synced.push(politician.slug);
      } catch (err) {
        errors.push({
          slug: politician.slug,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    })
  );

  return Response.json({
    cycle: targetCycle,
    total: withCid.length,
    synced,
    errors,
  });
}
