import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { Pool } from "pg";
import {
  getCandidateTotals,
  getPrincipalCommitteeId,
  getTopEmployers,
  buildDonorSummary,
} from "../src/lib/fec";

const connectionString = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL!;
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// FEC-confirmed candidate/committee IDs and the cycle that represents their most
// recent (or active) fundraising period. Senators use a 6-year cycle.
const AR_POLITICIANS: Array<{
  slug: string;
  candidateId: string;
  committeeId: string;
  cycle: number;
}> = [
  { slug: "tom-cotton",      candidateId: "S4AR00103", committeeId: "C00499988", cycle: 2026 },
  { slug: "john-boozman",   candidateId: "S0AR00150", committeeId: "C00476317", cycle: 2022 },
  { slug: "french-hill",    candidateId: "H4AR02141", committeeId: "C00551275", cycle: 2024 },
  { slug: "steve-womack",   candidateId: "H0AR03055", committeeId: "C00477745", cycle: 2024 },
  { slug: "rick-crawford",  candidateId: "H0AR01083", committeeId: "C00462374", cycle: 2024 },
  { slug: "bruce-westerman", candidateId: "H4AR04048", committeeId: "C00548180", cycle: 2024 },
];

async function syncOne(config: (typeof AR_POLITICIANS)[number]) {
  const { slug, candidateId, committeeId, cycle } = config;

  const politician = await prisma.politician.findUnique({ where: { slug } });
  if (!politician) throw new Error(`Politician not found: ${slug}`);

  console.log(`\nSyncing ${politician.name} (${candidateId}, cycle ${cycle})…`);

  const [totals, employers] = await Promise.all([
    getCandidateTotals(candidateId, cycle),
    getTopEmployers(committeeId, cycle),
  ]);

  if (!totals) throw new Error(`No FEC totals found for ${candidateId} cycle ${cycle}`);

  const { topDonors, donorIndustries } = buildDonorSummary(employers);

  const totalRaised = totals.receipts;
  const totalSpent = totals.disbursements;
  const cashOnHand = parseFloat(totals.cash_on_hand_end_period);

  console.log(`  Raised: $${totalRaised.toLocaleString()}`);
  console.log(`  Spent:  $${totalSpent.toLocaleString()}`);
  console.log(`  Cash:   $${cashOnHand.toLocaleString()}`);
  console.log(`  Top employers: ${topDonors.slice(0, 3).map((d) => d.name).join(", ")}`);
  console.log(`  Industries: ${donorIndustries.slice(0, 3).map((i) => `${i.industry} (${i.percentage}%)`).join(", ")}`);

  await prisma.financeRecord.upsert({
    where: { politicianId_cycle: { politicianId: politician.id, cycle } },
    create: {
      politicianId: politician.id,
      cycle,
      totalRaised,
      totalSpent,
      cashOnHand,
      topDonors,
      donorIndustries,
      sourceUrl: `https://www.fec.gov/data/candidate/${candidateId}/?cycle=${cycle}`,
      externalId: candidateId,
    },
    update: {
      totalRaised,
      totalSpent,
      cashOnHand,
      topDonors,
      donorIndustries,
      sourceUrl: `https://www.fec.gov/data/candidate/${candidateId}/?cycle=${cycle}`,
      externalId: candidateId,
    },
  });

  // Store FEC IDs so future syncs don't need to re-specify them
  const existingIds = (politician.externalIds as Record<string, string> | null) ?? {};
  await prisma.politician.update({
    where: { id: politician.id },
    data: {
      externalIds: {
        ...existingIds,
        fec_candidate_id: candidateId,
        fec_committee_id: committeeId,
      },
    },
  });

  console.log(`  ✓ Upserted FinanceRecord (cycle ${cycle})`);
}

async function main() {
  console.log("FEC sync for Arkansas delegation…");

  const results = await Promise.allSettled(AR_POLITICIANS.map(syncOne));

  console.log("\n── Summary ──");
  for (let i = 0; i < AR_POLITICIANS.length; i++) {
    const r = results[i];
    if (r.status === "fulfilled") {
      console.log(`  ✓ ${AR_POLITICIANS[i].slug}`);
    } else {
      console.error(`  ✗ ${AR_POLITICIANS[i].slug}: ${r.reason}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
