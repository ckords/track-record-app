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

  const body = await req.json() as { slug?: string; cid?: string; cycle?: number };
  const { slug, cid, cycle } = body;

  if (!slug || !cid) {
    return Response.json({ error: "slug and cid are required" }, { status: 400 });
  }

  const politician = await prisma.politician.findUnique({ where: { slug } });
  if (!politician) {
    return Response.json({ error: "Politician not found" }, { status: 404 });
  }

  const targetCycle = cycle ?? new Date().getFullYear();

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

  const totalIndustryAmount = rawIndustries.reduce((sum, i) => sum + i.amount, 0);
  for (const ind of rawIndustries) {
    ind.percentage = totalIndustryAmount > 0 ? (ind.amount / totalIndustryAmount) * 100 : 0;
  }

  const totalRaised = parseFloat(summary.total) || null;
  const totalSpent = parseFloat(summary.spent) || null;
  const cashOnHand = parseFloat(summary.cash_on_hand) || null;

  const record = await prisma.financeRecord.upsert({
    where: { politicianId_cycle: { politicianId: politician.id, cycle: targetCycle } },
    create: {
      politicianId: politician.id,
      cycle: targetCycle,
      totalRaised,
      totalSpent,
      cashOnHand,
      topDonors,
      donorIndustries: rawIndustries,
      sourceUrl: `https://www.opensecrets.org/members-of-congress/summary?cid=${cid}`,
      externalId: cid,
    },
    update: {
      totalRaised,
      totalSpent,
      cashOnHand,
      topDonors,
      donorIndustries: rawIndustries,
      sourceUrl: `https://www.opensecrets.org/members-of-congress/summary?cid=${cid}`,
      externalId: cid,
    },
  });

  // Store the CID in externalIds so we can sync again later without re-specifying it
  const existingIds = (politician.externalIds as Record<string, string> | null) ?? {};
  await prisma.politician.update({
    where: { id: politician.id },
    data: { externalIds: { ...existingIds, opensecrets_cid: cid } },
  });

  return Response.json({ success: true, cycle: targetCycle, record });
}
