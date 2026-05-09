const BASE_URL = "https://www.opensecrets.org/api/";

export interface CandidateSummary {
  cid: string;
  cycle: string;
  state: string;
  party: string;
  chamber: string;
  first_elected: string;
  exit_code: string;
  total: string;
  spent: string;
  cash_on_hand: string;
  debt: string;
  origin: string;
  source: string;
  last_updated: string;
}

export interface TopContributor {
  org_name: string;
  total: string;
  pacs: string;
  indivs: string;
  cycle: string;
}

export interface DonorIndustry {
  industry_code: string;
  industry_name: string;
  indivs: string;
  pacs: string;
  total: string;
}

async function apiCall<T>(method: string, params: Record<string, string>): Promise<T> {
  const apiKey = process.env.OPENSECRETS_API_KEY;
  if (!apiKey) throw new Error("OPENSECRETS_API_KEY not configured");

  const url = new URL(BASE_URL);
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("output", "json");
  url.searchParams.set("method", method);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`OpenSecrets API ${method} failed: ${res.status}`);
  const json = await res.json();
  return json.response as T;
}

export async function getCandidateSummary(cid: string, cycle: number): Promise<CandidateSummary> {
  const data = await apiCall<{ summary: { "@attributes": CandidateSummary } }>(
    "candSummary",
    { cid, cycle: String(cycle) }
  );
  return data.summary["@attributes"];
}

export async function getTopContributors(cid: string, cycle: number): Promise<TopContributor[]> {
  const data = await apiCall<{
    contributors: { contributor: Array<{ "@attributes": TopContributor }> };
  }>("candContrib", { cid, cycle: String(cycle) });
  return data.contributors.contributor.map((c) => c["@attributes"]);
}

export async function getDonorIndustries(cid: string, cycle: number): Promise<DonorIndustry[]> {
  const data = await apiCall<{
    industries: { industry: Array<{ "@attributes": DonorIndustry }> };
  }>("candIndustry", { cid, cycle: String(cycle) });
  return data.industries.industry.map((i) => i["@attributes"]);
}
