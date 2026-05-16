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

  const body = await req.json() as {
    slug: string;
    candidateId?: string;
    committeeId?: string;
    cycle?: number;
  };

  const { slug } = body;
  if (!slug) return Response.json({ error: "slug is required" }, { status: 400 });

  const politician = await prisma.politician.findUnique({ where: { slug } });
  if (!politician) return Response.json({ error: "Politician not found" }, { status: 404 });

  const ids = (politician.externalIds as Record<string, string> | null) ?? {};
  const candidateId = body.candidateId ?? ids.fec_candidate_id;
  const committeeId = body.committeeId ?? ids.fec_committee_id;

  if (!candidateId || !committeeId) {
    return Response.json(
      { error: "candidateId and committeeId are required (or store fec_candidate_id / fec_committee_id in externalIds)" },
      { status: 400 }
    );
  }

  const cycle = body.cycle ?? new Date().getFullYear();

  const [totals, employers] = await Promise.all([
    getCandidateTotals(candidateId, cycle),
    getTopEmployers(committeeId, cycle),
  ]);

  if (!totals) {
    return Response.json({ error: `No FEC data for ${candidateId} cycle ${cycle}` }, { status: 404 });
  }

  const { topDonors, donorIndustries } = buildDonorSummary(employers);

  const record = await prisma.financeRecord.upsert({
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

  await prisma.politician.update({
    where: { id: politician.id },
    data: {
      externalIds: { ...ids, fec_candidate_id: candidateId, fec_committee_id: committeeId },
    },
  });

  return Response.json({ success: true, cycle, record });
}
