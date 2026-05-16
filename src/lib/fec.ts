const BASE_URL = "https://api.open.fec.gov/v1";

// Employer names reported to the FEC that carry no industry signal
const GENERIC_EMPLOYERS = new Set([
  "RETIRED", "SELF-EMPLOYED", "HOMEMAKER", "NULL", "SELF",
  "NOT EMPLOYED", "INFORMATION REQUESTED PER BEST EFFORTS",
  "NONE", "N/A", "INFORMATION REQUESTED", "SELF EMPLOYED",
  "ENTREPRENEUR", "UNEMPLOYED", "HOME", "HOUSEWIFE", "STUDENT",
  "NOT EMPLOYED/NONE", "INFORMATION REQUESTED BY FILER",
]);

// Government-employee entries have no useful industry signal — skip them.
function isGovernmentEmployer(employer: string): boolean {
  const u = employer.toUpperCase().trim();
  return (
    u.startsWith("STATE OF ") ||
    u.startsWith("U.S. ") ||
    u.startsWith("US ") ||
    u === "FEDERAL GOVERNMENT" ||
    u === "CONGRESS" ||
    u === "U.S. GOVERNMENT"
  );
}

// Ordered: first match wins. Mirrors OpenSecrets industry category names used by the correlation engine.
const INDUSTRY_PATTERNS: Array<[RegExp, string]> = [
  // ── Defense ──────────────────────────────────────────────────────────────────
  [/lockheed|boeing|raytheon|\brtx\b|general dynamics|northrop|l3 tech|l3harris|bae systems|huntington ingalls|leidos|saic|booz allen|general atomics|textron|harris corp|oshkosh|palantir|anduril|kiewit sons|peter kiewit|cubic corp|vectrus|amentum|esi engineering/i, "Defense"],

  // ── Energy / Natural Resources ────────────────────────────────────────────────
  [/exxon|chevron|conocophillips|\bbp\b|shell |marathon oil|valero|halliburton|schlumberger|baker hughes|pioneer natural|devon energy|entergy|dominion energy|nextera|duke energy|southern company|xcel energy|sempra|exelon|constellation energy|evergy|firstenergy|pacific gas|\boil\b|petroleum|pipeline|refinery|natural gas|flywheel energy|exploration[s]?|oilfield|ross explorations|kaitar resources|energy llc|energy corp/i, "Energy/Nat Resource"],

  // ── Agribusiness ─────────────────────────────────────────────────────────────
  [/tyson|cargill|archer daniels|bunge|corteva|john deere|monsanto|agco|farm bureau|farm credit|land o'lakes|smithfield|perdue|pilgrim|mountaire|mckee foods|little debbie|\bchicken\b|\bcattle\b|\bsoybean\b|\bdairy\b|\bgrain\b|\blivestock\b|\bpoultry\b|\bfarmer\b|\bhog\b|aquaculture|timber|lumber|sawmill|sierra pacific industries|anthony timberlands/i, "Agribusiness"],

  // ── Health ────────────────────────────────────────────────────────────────────
  [/pfizer|merck|abbott|johnson &|unitedhealth|cigna|aetna|humana|mckesson|amerisource|cardinal health|biogen|amgen|gilead|regeneron|moderna|hospital|clinic|health system|health initiative|medical center|st\. vincent|physician|pharma|biotech|biohaven|starkey|catholic health|health care/i, "Health"],

  // ── Lawyers & Lobbyists ───────────────────────────────────────────────────────
  // Named DC lobbying shops + any firm with LLP suffix or "law firm" in name
  [/kirkland|skadden|latham & watkins|latham and watkins|jones day|sidley|weil gotshal|paul weiss|simpson thacher|milbank|davis polk|sullivan &|cleary|akin gump|gibson dunn|brownstein hyatt|harbinger strategies|ballard partners|fierce government|mehlman castagnetti|hohlt group|rich feuer anderson|\binvariant\b|\bclearpath\b|clear path|roosevelt group|lieblong|mckinley assoc|s-3 group|bell legal|cornerstone government|van scoyoc|bgr group|capitol counsel|cassidy & associates|russell group|icebreaker strategies|government relations|government affairs|public affairs|lobbying|\bllp\b|law group|law firm|legal group|attorneys at law/i, "Lawyers & Lobbyists"],

  // ── Communication / Electronics ───────────────────────────────────────────────
  // Tech and software companies (crypto finance goes to Finance below)
  [/anthropic|openai|solana labs|google|alphabet|microsoft|apple|meta|facebook|netflix|intel|qualcomm|nvidia|amd|salesforce|oracle|adobe|cisco|vmware|andreessen|a16z|software|ats communications|fareharbor|\binkit\b/i, "Communication/Electronics"],
  [/at&t|verizon|comcast|charter|\bcox\b|sprint|t-mobile|dish network|media|broadcast|cable|telecom|nbc|cbs|\babc\b|\bfox\b|disney|warner|discovery/i, "Communication/Electronics"],

  // ── Education ─────────────────────────────────────────────────────────────────
  [/university|college|school district|academy|\bprofessor\b|\bteacher\b/i, "Education"],

  // ── Transportation ────────────────────────────────────────────────────────────
  [/fedex|united parcel|\bups\b|delta air|american airlines|southwest air|united airlines|alaska air|railroad|norfolk southern|union pacific|\bcsx\b|bnsf|trucking|shipping|logistics|freight/i, "Transportation"],

  // ── Agribusiness (food manufacturing) ────────────────────────────────────────
  [/florida crystals|mclane group/i, "Agribusiness"],

  // ── Finance / Insurance / Real Estate ────────────────────────────────────────
  // Named firms first, then broad keyword patterns.
  // Crypto exchanges and funds belong here (financial instruments, not tech).
  [/goldman|jpmorgan|morgan stanley|merrill|fidelity|schwab|blackrock|blackstone|kkr|apollo|carlyle|bain capital|castle harlan|crow holdings|hudson bay capital|golub capital|cantor fitzgerald|berenson|audax group|capital group|capital funding|fisher investments|bluff point|simmons first|saracen development|cumberland development|kalshi|\bftx\b|coinbase|coinflip|paxos|multicoin|distributed capital|necessity ventures|necesssity ventures|winklevoss|paradigm/i, "Finance/Insurance/Real Est"],
  [/\bbank\b|financial|insurance|mortgage|capital management|capital partners|capital advisors|wealth management|investment management|private credit|private equity|hedge fund|asset management|securities|brokerage|\bbnp\b|\bubs\b|\bciti\b|wells fargo|bny mellon|\bbny\b|american express|\bvisa\b|mastercard|new york life|prudential|metlife|berkshire|aflac|allstate|nationwide|real estate|realty|realtor|lennar|pulte|dr horton|stephens/i, "Finance/Insurance/Real Est"],
];

export function classifyEmployer(employer: string): string {
  for (const [pattern, industry] of INDUSTRY_PATTERNS) {
    if (pattern.test(employer)) return industry;
  }
  return "Misc Business";
}

export function isGenericEmployer(employer: string): boolean {
  return GENERIC_EMPLOYERS.has(employer.toUpperCase().trim()) || isGovernmentEmployer(employer);
}

export interface FecCandidateTotals {
  candidate_id: string;
  cycle: number;
  receipts: number;
  disbursements: number;
  cash_on_hand_end_period: string;
  coverage_end_date: string;
  coverage_start_date: string;
  individual_itemized_contributions: number;
  other_political_committee_contributions: number;
  debts_owed_by_committee: string;
}

export interface FecEmployerAggregate {
  employer: string;
  total: number;
  count: number;
  committee_id: string;
  cycle: number;
}

export interface FecCandidate {
  candidate_id: string;
  name: string;
  office: string;
  state: string;
  party: string;
  election_years: number[];
  cycles: number[];
  principal_committees: Array<{ committee_id: string; name: string }>;
}

async function apiGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const apiKey = process.env.FEC_API_KEY;
  if (!apiKey) throw new Error("FEC_API_KEY not configured");

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("api_key", apiKey);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`FEC API ${path} failed (${res.status}): ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export async function searchCandidates(
  q: string,
  state: string,
  office: "S" | "H" | "P"
): Promise<FecCandidate[]> {
  const data = await apiGet<{ results: FecCandidate[] }>("/candidates/", {
    q,
    state,
    office,
    per_page: "5",
  });
  return data.results;
}

export async function getCandidateTotals(
  candidateId: string,
  cycle: number
): Promise<FecCandidateTotals | null> {
  const data = await apiGet<{ results: FecCandidateTotals[] }>("/candidates/totals/", {
    candidate_id: candidateId,
    cycle: String(cycle),
    per_page: "1",
  });
  return data.results[0] ?? null;
}

export async function getPrincipalCommitteeId(candidateId: string): Promise<string | null> {
  const data = await apiGet<{ results: Array<{ committee_id: string }> }>(
    `/candidate/${candidateId}/committees/`,
    { designation: "P" }
  );
  return data.results[0]?.committee_id ?? null;
}

export async function getTopEmployers(
  committeeId: string,
  cycle: number,
  limit = 50
): Promise<FecEmployerAggregate[]> {
  const data = await apiGet<{ results: FecEmployerAggregate[] }>(
    "/schedules/schedule_a/by_employer/",
    {
      committee_id: committeeId,
      cycle: String(cycle),
      sort: "-total",
      per_page: String(limit),
    }
  );
  return data.results;
}

export interface DonorIndustrySummary {
  topDonors: Array<{ name: string; amount: number; type: "Individual"; count: number }>;
  donorIndustries: Array<{ industry: string; amount: number; percentage: number }>;
}

export function buildDonorSummary(employers: FecEmployerAggregate[]): DonorIndustrySummary {
  const real = employers.filter((e) => !isGenericEmployer(e.employer));

  const topDonors = real.slice(0, 10).map((e) => ({
    name: e.employer
      .split(" ")
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(" "),
    amount: Math.round(e.total),
    type: "Individual" as const,
    count: e.count,
  }));

  // Aggregate by industry
  const industryMap = new Map<string, number>();
  for (const e of real) {
    const ind = classifyEmployer(e.employer);
    industryMap.set(ind, (industryMap.get(ind) ?? 0) + e.total);
  }

  const total = [...industryMap.values()].reduce((a, b) => a + b, 0);
  const donorIndustries = [...industryMap.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([industry, amount]) => ({
      industry,
      amount: Math.round(amount),
      percentage: total > 0 ? Math.round((amount / total) * 1000) / 10 : 0,
    }));

  return { topDonors, donorIndustries };
}
