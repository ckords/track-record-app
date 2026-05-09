import { prisma } from "./prisma";

// Maps OpenSecrets industry names to local vote category strings.
// OpenSecrets names are the keys; values are the category strings we use in Vote.category.
const INDUSTRY_VOTE_MAP: Record<string, string[]> = {
  "Health": ["Healthcare", "Health", "Public Health", "Pharmaceuticals", "Medicare", "Medicaid"],
  "Finance/Insurance/Real Est": ["Finance", "Banking", "Housing", "Real Estate", "Financial Services", "Economy"],
  "Energy/Nat Resource": ["Energy", "Environment", "Climate", "Oil & Gas", "Natural Resources"],
  "Defense": ["Defense", "Military", "National Security", "Armed Services", "Veterans"],
  "Transportation": ["Transportation", "Infrastructure", "Aviation", "Highways"],
  "Agribusiness": ["Agriculture", "Food", "Farm", "Agribusiness"],
  "Lawyers & Lobbyists": ["Judiciary", "Legal", "Courts", "Justice"],
  "Technology": ["Technology", "Innovation", "Cybersecurity", "CHIPS"],
  "Communication/Electronics": ["Technology", "Telecommunications", "Media", "Broadband"],
  "Education": ["Education", "Schools", "Higher Education", "Student Loans"],
  "Labor": ["Labor", "Workers", "Employment", "Unions", "Minimum Wage"],
  "Misc Business": ["Business", "Commerce", "Trade", "Economy", "Regulations"],
  "Ideology/Single-Issue": ["Civil Rights", "Gun Control", "Immigration", "Social"],
  "Other": [],
};

export interface DonorVoteCorrelation {
  industry: string;
  donated: number;
  donationShare: number;
  voteCategories: string[];
  voteCount: number;
  voteShare: number;
  overlapScore: number;
}

export async function computeCorrelations(politicianId: string): Promise<DonorVoteCorrelation[]> {
  const [financeRecords, votes] = await Promise.all([
    prisma.financeRecord.findMany({ where: { politicianId } }),
    prisma.vote.findMany({ where: { politicianId }, select: { category: true } }),
  ]);

  // Aggregate donations by industry across all cycles
  const industryTotals = new Map<string, number>();
  for (const record of financeRecords) {
    const industries = record.donorIndustries as Array<{ industry: string; amount: number }> | null;
    if (!industries) continue;
    for (const ind of industries) {
      if (!ind.industry) continue;
      industryTotals.set(ind.industry, (industryTotals.get(ind.industry) ?? 0) + ind.amount);
    }
  }

  if (industryTotals.size === 0) return [];

  const totalDonations = [...industryTotals.values()].reduce((a, b) => a + b, 0);
  const totalVotes = votes.length;

  // Count votes by category
  const categoryVotes = new Map<string, number>();
  for (const vote of votes) {
    if (!vote.category) continue;
    categoryVotes.set(vote.category, (categoryVotes.get(vote.category) ?? 0) + 1);
  }

  const correlations: DonorVoteCorrelation[] = [];

  for (const [industry, donated] of industryTotals) {
    // Case-insensitive partial match against known map keys
    const mapKey = Object.keys(INDUSTRY_VOTE_MAP).find(
      (k) => industry.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(industry.toLowerCase())
    );
    const voteCategories = mapKey ? INDUSTRY_VOTE_MAP[mapKey] : [];

    let voteCount = 0;
    for (const cat of voteCategories) {
      for (const [voteCat, count] of categoryVotes) {
        if (voteCat.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(voteCat.toLowerCase())) {
          voteCount += count;
        }
      }
    }
    // Deduplicate counted votes (same category matched multiple map entries)
    const seenCats = new Set<string>();
    voteCount = 0;
    for (const cat of voteCategories) {
      for (const [voteCat, count] of categoryVotes) {
        if (
          !seenCats.has(voteCat) &&
          (voteCat.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(voteCat.toLowerCase()))
        ) {
          seenCats.add(voteCat);
          voteCount += count;
        }
      }
    }

    const donationShare = totalDonations > 0 ? donated / totalDonations : 0;
    const voteShare = totalVotes > 0 ? voteCount / totalVotes : 0;
    // Geometric mean — high only when BOTH donation share and vote share are significant
    const overlapScore = Math.sqrt(donationShare * voteShare);

    correlations.push({
      industry,
      donated,
      donationShare,
      voteCategories,
      voteCount,
      voteShare,
      overlapScore,
    });
  }

  return correlations.sort((a, b) => b.donated - a.donated);
}
