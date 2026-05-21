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

interface VoteData {
  externalId: string;
  billTitle: string;
  chamber: string;
  date: Date;
  position: string;
  category?: string;
  sourceUrl?: string;
}

interface PoliticianConfig {
  slug: string;
  name: string;
  party: string;
  state: string;
  level: string;
  chamber?: string;
  district?: string;
  office: string;
  candidateId?: string;
  committeeId?: string;
  cycle?: number;
  skipFinance?: boolean;
  votes: VoteData[];
}

const POLITICIANS: PoliticianConfig[] = [
  // ── Democrats ──────────────────────────────────────────────────────────────
  {
    slug: "alexandria-ocasio-cortez",
    name: "Alexandria Ocasio-Cortez",
    party: "DEMOCRAT",
    state: "NY",
    level: "FEDERAL",
    chamber: "HOUSE",
    district: "14",
    office: "U.S. Representative",
    candidateId: "H8NY15148",
    committeeId: "C00639591",
    cycle: 2026,
    votes: [
      {
        externalId: "national-aoc-HR1319",
        billTitle: "American Rescue Plan Act of 2021",
        chamber: "HOUSE",
        date: new Date("2021-02-27"),
        position: "Yea",
        category: "Economic Relief",
        sourceUrl: "https://clerk.house.gov/evs/2021/roll049.xml",
      },
      {
        externalId: "national-aoc-HR3684",
        billTitle: "Infrastructure Investment and Jobs Act",
        chamber: "HOUSE",
        date: new Date("2021-11-05"),
        position: "Nay",
        category: "Infrastructure",
        sourceUrl: "https://clerk.house.gov/evs/2021/roll369.xml",
      },
      {
        externalId: "national-aoc-HR5376",
        billTitle: "Inflation Reduction Act of 2022",
        chamber: "HOUSE",
        date: new Date("2022-08-12"),
        position: "Yea",
        category: "Climate & Energy",
        sourceUrl: "https://clerk.house.gov/evs/2022/roll420.xml",
      },
    ],
  },
  {
    slug: "bernie-sanders",
    name: "Bernie Sanders",
    party: "INDEPENDENT",
    state: "VT",
    level: "FEDERAL",
    chamber: "SENATE",
    office: "U.S. Senator",
    candidateId: "S4VT00033",
    committeeId: "C00411330",
    cycle: 2024,
    votes: [
      {
        externalId: "national-sanders-HR1319",
        billTitle: "American Rescue Plan Act of 2021",
        chamber: "SENATE",
        date: new Date("2021-03-06"),
        position: "Yea",
        category: "Economic Relief",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1171/vote_117_1_00083.htm",
      },
      {
        externalId: "national-sanders-HR3684",
        billTitle: "Infrastructure Investment and Jobs Act",
        chamber: "SENATE",
        date: new Date("2021-08-10"),
        position: "Yea",
        category: "Infrastructure",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1171/vote_117_1_00334.htm",
      },
      {
        externalId: "national-sanders-HR5376",
        billTitle: "Inflation Reduction Act of 2022",
        chamber: "SENATE",
        date: new Date("2022-08-07"),
        position: "Yea",
        category: "Climate & Energy",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1172/vote_117_2_00325.htm",
      },
    ],
  },
  {
    slug: "chuck-schumer",
    name: "Chuck Schumer",
    party: "DEMOCRAT",
    state: "NY",
    level: "FEDERAL",
    chamber: "SENATE",
    office: "U.S. Senator",
    candidateId: "S8NY00082",
    committeeId: "C00346312",
    cycle: 2022,
    votes: [
      {
        externalId: "national-schumer-HR1319",
        billTitle: "American Rescue Plan Act of 2021",
        chamber: "SENATE",
        date: new Date("2021-03-06"),
        position: "Yea",
        category: "Economic Relief",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1171/vote_117_1_00083.htm",
      },
      {
        externalId: "national-schumer-HR3684",
        billTitle: "Infrastructure Investment and Jobs Act",
        chamber: "SENATE",
        date: new Date("2021-08-10"),
        position: "Yea",
        category: "Infrastructure",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1171/vote_117_1_00334.htm",
      },
      {
        externalId: "national-schumer-HR5376",
        billTitle: "Inflation Reduction Act of 2022",
        chamber: "SENATE",
        date: new Date("2022-08-07"),
        position: "Yea",
        category: "Climate & Energy",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1172/vote_117_2_00325.htm",
      },
    ],
  },
  {
    slug: "nancy-pelosi",
    name: "Nancy Pelosi",
    party: "DEMOCRAT",
    state: "CA",
    level: "FEDERAL",
    chamber: "HOUSE",
    district: "11",
    office: "U.S. Representative",
    candidateId: "H8CA05035",
    committeeId: "C00213512",
    cycle: 2026,
    votes: [
      {
        externalId: "national-pelosi-HR1319",
        billTitle: "American Rescue Plan Act of 2021",
        chamber: "HOUSE",
        date: new Date("2021-02-27"),
        position: "Yea",
        category: "Economic Relief",
        sourceUrl: "https://clerk.house.gov/evs/2021/roll049.xml",
      },
      {
        externalId: "national-pelosi-HR3684",
        billTitle: "Infrastructure Investment and Jobs Act",
        chamber: "HOUSE",
        date: new Date("2021-11-05"),
        position: "Yea",
        category: "Infrastructure",
        sourceUrl: "https://clerk.house.gov/evs/2021/roll369.xml",
      },
      {
        externalId: "national-pelosi-HR5376",
        billTitle: "Inflation Reduction Act of 2022",
        chamber: "HOUSE",
        date: new Date("2022-08-12"),
        position: "Yea",
        category: "Climate & Energy",
        sourceUrl: "https://clerk.house.gov/evs/2022/roll420.xml",
      },
    ],
  },
  {
    slug: "kamala-harris",
    name: "Kamala Harris",
    party: "DEMOCRAT",
    state: "CA",
    level: "FEDERAL",
    office: "Former U.S. Vice President",
    candidateId: "S6CA00584",
    committeeId: "C00571919",
    cycle: 2016,
    votes: [
      {
        externalId: "national-harris-HR748",
        billTitle: "CARES Act",
        chamber: "SENATE",
        date: new Date("2020-03-25"),
        position: "Yea",
        category: "Economic Relief",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1161/vote_116_1_00079.htm",
      },
    ],
  },
  {
    slug: "pete-buttigieg",
    name: "Pete Buttigieg",
    party: "DEMOCRAT",
    state: "IN",
    level: "FEDERAL",
    office: "Former Secretary of Transportation",
    skipFinance: true,
    votes: [],
  },
  // ── Republicans ────────────────────────────────────────────────────────────
  {
    slug: "donald-trump",
    name: "Donald Trump",
    party: "REPUBLICAN",
    state: "FL",
    level: "FEDERAL",
    office: "U.S. President",
    candidateId: "P80001571",
    committeeId: "C00580100",
    cycle: 2020,
    votes: [],
  },
  {
    slug: "ron-desantis",
    name: "Ron DeSantis",
    party: "REPUBLICAN",
    state: "FL",
    level: "STATE",
    office: "Governor of Florida",
    skipFinance: true,
    votes: [
      {
        externalId: "national-desantis-HR1628",
        billTitle: "American Health Care Act of 2017",
        chamber: "HOUSE",
        date: new Date("2017-05-04"),
        position: "Yea",
        category: "Healthcare",
        sourceUrl: "https://clerk.house.gov/evs/2017/roll256.xml",
      },
      {
        externalId: "national-desantis-HR1-2017",
        billTitle: "Tax Cuts and Jobs Act of 2017",
        chamber: "HOUSE",
        date: new Date("2017-11-16"),
        position: "Yea",
        category: "Tax Policy",
        sourceUrl: "https://clerk.house.gov/evs/2017/roll637.xml",
      },
    ],
  },
  {
    slug: "ted-cruz",
    name: "Ted Cruz",
    party: "REPUBLICAN",
    state: "TX",
    level: "FEDERAL",
    chamber: "SENATE",
    office: "U.S. Senator",
    candidateId: "S2TX00312",
    committeeId: "C00492785",
    cycle: 2024,
    votes: [
      {
        externalId: "national-cruz-HR1319",
        billTitle: "American Rescue Plan Act of 2021",
        chamber: "SENATE",
        date: new Date("2021-03-06"),
        position: "Nay",
        category: "Economic Relief",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1171/vote_117_1_00083.htm",
      },
      {
        externalId: "national-cruz-HR3684",
        billTitle: "Infrastructure Investment and Jobs Act",
        chamber: "SENATE",
        date: new Date("2021-08-10"),
        position: "Nay",
        category: "Infrastructure",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1171/vote_117_1_00334.htm",
      },
      {
        externalId: "national-cruz-HR5376",
        billTitle: "Inflation Reduction Act of 2022",
        chamber: "SENATE",
        date: new Date("2022-08-07"),
        position: "Nay",
        category: "Climate & Energy",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1172/vote_117_2_00325.htm",
      },
      {
        externalId: "national-cruz-HR748",
        billTitle: "CARES Act",
        chamber: "SENATE",
        date: new Date("2020-03-25"),
        position: "Yea",
        category: "Economic Relief",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1161/vote_116_1_00079.htm",
      },
      {
        externalId: "national-cruz-HR1-2017",
        billTitle: "Tax Cuts and Jobs Act of 2017",
        chamber: "SENATE",
        date: new Date("2017-12-20"),
        position: "Yea",
        category: "Tax Policy",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1151/vote_115_1_00323.htm",
      },
    ],
  },
  {
    slug: "marco-rubio",
    name: "Marco Rubio",
    party: "REPUBLICAN",
    state: "FL",
    level: "FEDERAL",
    chamber: "SENATE",
    office: "U.S. Senator",
    candidateId: "S0FL00338",
    committeeId: "C00458844",
    cycle: 2022,
    votes: [
      {
        externalId: "national-rubio-HR1319",
        billTitle: "American Rescue Plan Act of 2021",
        chamber: "SENATE",
        date: new Date("2021-03-06"),
        position: "Nay",
        category: "Economic Relief",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1171/vote_117_1_00083.htm",
      },
      {
        externalId: "national-rubio-HR3684",
        billTitle: "Infrastructure Investment and Jobs Act",
        chamber: "SENATE",
        date: new Date("2021-08-10"),
        position: "Nay",
        category: "Infrastructure",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1171/vote_117_1_00334.htm",
      },
      {
        externalId: "national-rubio-HR5376",
        billTitle: "Inflation Reduction Act of 2022",
        chamber: "SENATE",
        date: new Date("2022-08-07"),
        position: "Nay",
        category: "Climate & Energy",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1172/vote_117_2_00325.htm",
      },
      {
        externalId: "national-rubio-HR748",
        billTitle: "CARES Act",
        chamber: "SENATE",
        date: new Date("2020-03-25"),
        position: "Yea",
        category: "Economic Relief",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1161/vote_116_1_00079.htm",
      },
      {
        externalId: "national-rubio-HR1-2017",
        billTitle: "Tax Cuts and Jobs Act of 2017",
        chamber: "SENATE",
        date: new Date("2017-12-20"),
        position: "Yea",
        category: "Tax Policy",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1151/vote_115_1_00323.htm",
      },
    ],
  },
  {
    slug: "mitch-mcconnell",
    name: "Mitch McConnell",
    party: "REPUBLICAN",
    state: "KY",
    level: "FEDERAL",
    chamber: "SENATE",
    office: "U.S. Senator",
    candidateId: "S2KY00012",
    committeeId: "C00193342",
    cycle: 2020,
    votes: [
      {
        externalId: "national-mcconnell-HR1319",
        billTitle: "American Rescue Plan Act of 2021",
        chamber: "SENATE",
        date: new Date("2021-03-06"),
        position: "Nay",
        category: "Economic Relief",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1171/vote_117_1_00083.htm",
      },
      {
        externalId: "national-mcconnell-HR3684",
        billTitle: "Infrastructure Investment and Jobs Act",
        chamber: "SENATE",
        date: new Date("2021-08-10"),
        position: "Yea",
        category: "Infrastructure",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1171/vote_117_1_00334.htm",
      },
      {
        externalId: "national-mcconnell-HR5376",
        billTitle: "Inflation Reduction Act of 2022",
        chamber: "SENATE",
        date: new Date("2022-08-07"),
        position: "Nay",
        category: "Climate & Energy",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1172/vote_117_2_00325.htm",
      },
      {
        externalId: "national-mcconnell-HR748",
        billTitle: "CARES Act",
        chamber: "SENATE",
        date: new Date("2020-03-25"),
        position: "Yea",
        category: "Economic Relief",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1161/vote_116_1_00079.htm",
      },
      {
        externalId: "national-mcconnell-HR1-2017",
        billTitle: "Tax Cuts and Jobs Act of 2017",
        chamber: "SENATE",
        date: new Date("2017-12-20"),
        position: "Yea",
        category: "Tax Policy",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1151/vote_115_1_00323.htm",
      },
    ],
  },
  {
    slug: "mike-johnson",
    name: "Mike Johnson",
    party: "REPUBLICAN",
    state: "LA",
    level: "FEDERAL",
    chamber: "HOUSE",
    district: "4",
    office: "U.S. Representative",
    candidateId: "H6LA04138",
    committeeId: "C00608695",
    cycle: 2024,
    votes: [
      {
        externalId: "national-johnson-HR1319",
        billTitle: "American Rescue Plan Act of 2021",
        chamber: "HOUSE",
        date: new Date("2021-02-27"),
        position: "Nay",
        category: "Economic Relief",
        sourceUrl: "https://clerk.house.gov/evs/2021/roll049.xml",
      },
      {
        externalId: "national-johnson-HR3684",
        billTitle: "Infrastructure Investment and Jobs Act",
        chamber: "HOUSE",
        date: new Date("2021-11-05"),
        position: "Nay",
        category: "Infrastructure",
        sourceUrl: "https://clerk.house.gov/evs/2021/roll369.xml",
      },
      {
        externalId: "national-johnson-HR5376",
        billTitle: "Inflation Reduction Act of 2022",
        chamber: "HOUSE",
        date: new Date("2022-08-12"),
        position: "Nay",
        category: "Climate & Energy",
        sourceUrl: "https://clerk.house.gov/evs/2022/roll420.xml",
      },
      {
        externalId: "national-johnson-HR8035",
        billTitle: "Ukraine Security Supplemental Appropriations Act",
        chamber: "HOUSE",
        date: new Date("2024-04-20"),
        position: "Yea",
        category: "Foreign Policy",
        sourceUrl: "https://clerk.house.gov/evs/2024/roll132.xml",
      },
    ],
  },
  {
    slug: "marjorie-taylor-greene",
    name: "Marjorie Taylor Greene",
    party: "REPUBLICAN",
    state: "GA",
    level: "FEDERAL",
    chamber: "HOUSE",
    district: "14",
    office: "U.S. Representative",
    candidateId: "H0GA06192",
    cycle: 2024,
    votes: [
      {
        externalId: "national-mtg-HR1319",
        billTitle: "American Rescue Plan Act of 2021",
        chamber: "HOUSE",
        date: new Date("2021-02-27"),
        position: "Nay",
        category: "Economic Relief",
        sourceUrl: "https://clerk.house.gov/evs/2021/roll049.xml",
      },
      {
        externalId: "national-mtg-HR3684",
        billTitle: "Infrastructure Investment and Jobs Act",
        chamber: "HOUSE",
        date: new Date("2021-11-05"),
        position: "Nay",
        category: "Infrastructure",
        sourceUrl: "https://clerk.house.gov/evs/2021/roll369.xml",
      },
      {
        externalId: "national-mtg-HR5376",
        billTitle: "Inflation Reduction Act of 2022",
        chamber: "HOUSE",
        date: new Date("2022-08-12"),
        position: "Nay",
        category: "Climate & Energy",
        sourceUrl: "https://clerk.house.gov/evs/2022/roll420.xml",
      },
      {
        externalId: "national-mtg-HR8035",
        billTitle: "Ukraine Security Supplemental Appropriations Act",
        chamber: "HOUSE",
        date: new Date("2024-04-20"),
        position: "Nay",
        category: "Foreign Policy",
        sourceUrl: "https://clerk.house.gov/evs/2024/roll132.xml",
      },
    ],
  },
  {
    slug: "nikki-haley",
    name: "Nikki Haley",
    party: "REPUBLICAN",
    state: "SC",
    level: "FEDERAL",
    office: "Former U.S. Ambassador to the United Nations",
    skipFinance: true,
    votes: [],
  },
  // ── Moderates ──────────────────────────────────────────────────────────────
  {
    slug: "joe-manchin",
    name: "Joe Manchin",
    party: "INDEPENDENT",
    state: "WV",
    level: "FEDERAL",
    chamber: "SENATE",
    office: "Former U.S. Senator",
    candidateId: "S0WV00090",
    committeeId: "C00674473",
    cycle: 2018,
    votes: [
      {
        externalId: "national-manchin-HR1319",
        billTitle: "American Rescue Plan Act of 2021",
        chamber: "SENATE",
        date: new Date("2021-03-06"),
        position: "Yea",
        category: "Economic Relief",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1171/vote_117_1_00083.htm",
      },
      {
        externalId: "national-manchin-HR3684",
        billTitle: "Infrastructure Investment and Jobs Act",
        chamber: "SENATE",
        date: new Date("2021-08-10"),
        position: "Yea",
        category: "Infrastructure",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1171/vote_117_1_00334.htm",
      },
      {
        externalId: "national-manchin-HR5376",
        billTitle: "Inflation Reduction Act of 2022",
        chamber: "SENATE",
        date: new Date("2022-08-07"),
        position: "Yea",
        category: "Climate & Energy",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1172/vote_117_2_00325.htm",
      },
      {
        externalId: "national-manchin-HR1-2017",
        billTitle: "Tax Cuts and Jobs Act of 2017",
        chamber: "SENATE",
        date: new Date("2017-12-20"),
        position: "Nay",
        category: "Tax Policy",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1151/vote_115_1_00323.htm",
      },
    ],
  },
  {
    slug: "kyrsten-sinema",
    name: "Kyrsten Sinema",
    party: "INDEPENDENT",
    state: "AZ",
    level: "FEDERAL",
    chamber: "SENATE",
    office: "Former U.S. Senator",
    candidateId: "S8AZ00197",
    committeeId: "C00508804",
    cycle: 2024,
    votes: [
      {
        externalId: "national-sinema-HR1319",
        billTitle: "American Rescue Plan Act of 2021",
        chamber: "SENATE",
        date: new Date("2021-03-06"),
        position: "Yea",
        category: "Economic Relief",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1171/vote_117_1_00083.htm",
      },
      {
        externalId: "national-sinema-HR3684",
        billTitle: "Infrastructure Investment and Jobs Act",
        chamber: "SENATE",
        date: new Date("2021-08-10"),
        position: "Yea",
        category: "Infrastructure",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1171/vote_117_1_00334.htm",
      },
      {
        externalId: "national-sinema-HR5376",
        billTitle: "Inflation Reduction Act of 2022",
        chamber: "SENATE",
        date: new Date("2022-08-07"),
        position: "Yea",
        category: "Climate & Energy",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1172/vote_117_2_00325.htm",
      },
    ],
  },
  {
    slug: "susan-collins",
    name: "Susan Collins",
    party: "REPUBLICAN",
    state: "ME",
    level: "FEDERAL",
    chamber: "SENATE",
    office: "U.S. Senator",
    candidateId: "S6ME00159",
    committeeId: "C00314575",
    cycle: 2026,
    votes: [
      {
        externalId: "national-collins-HR1319",
        billTitle: "American Rescue Plan Act of 2021",
        chamber: "SENATE",
        date: new Date("2021-03-06"),
        position: "Nay",
        category: "Economic Relief",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1171/vote_117_1_00083.htm",
      },
      {
        externalId: "national-collins-HR3684",
        billTitle: "Infrastructure Investment and Jobs Act",
        chamber: "SENATE",
        date: new Date("2021-08-10"),
        position: "Yea",
        category: "Infrastructure",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1171/vote_117_1_00334.htm",
      },
      {
        externalId: "national-collins-HR5376",
        billTitle: "Inflation Reduction Act of 2022",
        chamber: "SENATE",
        date: new Date("2022-08-07"),
        position: "Nay",
        category: "Climate & Energy",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1172/vote_117_2_00325.htm",
      },
      {
        externalId: "national-collins-HR748",
        billTitle: "CARES Act",
        chamber: "SENATE",
        date: new Date("2020-03-25"),
        position: "Yea",
        category: "Economic Relief",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1161/vote_116_1_00079.htm",
      },
    ],
  },
  {
    slug: "lisa-murkowski",
    name: "Lisa Murkowski",
    party: "REPUBLICAN",
    state: "AK",
    level: "FEDERAL",
    chamber: "SENATE",
    office: "U.S. Senator",
    candidateId: "S4AK00099",
    committeeId: "C00384529",
    cycle: 2022,
    votes: [
      {
        externalId: "national-murkowski-HR1319",
        billTitle: "American Rescue Plan Act of 2021",
        chamber: "SENATE",
        date: new Date("2021-03-06"),
        position: "Nay",
        category: "Economic Relief",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1171/vote_117_1_00083.htm",
      },
      {
        externalId: "national-murkowski-HR3684",
        billTitle: "Infrastructure Investment and Jobs Act",
        chamber: "SENATE",
        date: new Date("2021-08-10"),
        position: "Yea",
        category: "Infrastructure",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1171/vote_117_1_00334.htm",
      },
      {
        externalId: "national-murkowski-HR5376",
        billTitle: "Inflation Reduction Act of 2022",
        chamber: "SENATE",
        date: new Date("2022-08-07"),
        position: "Nay",
        category: "Climate & Energy",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1172/vote_117_2_00325.htm",
      },
      {
        externalId: "national-murkowski-HR748",
        billTitle: "CARES Act",
        chamber: "SENATE",
        date: new Date("2020-03-25"),
        position: "Yea",
        category: "Economic Relief",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1161/vote_116_1_00079.htm",
      },
      {
        externalId: "national-murkowski-impeach2021",
        billTitle: "Article of Impeachment Against Donald J. Trump (Second Impeachment)",
        chamber: "SENATE",
        date: new Date("2021-02-13"),
        position: "Yea",
        category: "Oversight & Accountability",
        sourceUrl: "https://www.senate.gov/legislative/LIS/roll_call_votes/vote1171/vote_117_1_00057.htm",
      },
    ],
  },
];

async function syncPolitician(config: PoliticianConfig) {
  const {
    slug, name, party, state, level, chamber, district, office,
    candidateId, committeeId, cycle, skipFinance, votes,
  } = config;

  console.log(`\nSeeding ${name}…`);

  const politician = await prisma.politician.upsert({
    where: { slug },
    create: {
      slug,
      name,
      party,
      state,
      level,
      chamber: chamber ?? null,
      district: district ?? null,
      office,
      externalIds: candidateId
        ? { fec_candidate_id: candidateId, ...(committeeId ? { fec_committee_id: committeeId } : {}) }
        : undefined,
    },
    update: {
      name,
      party,
      state,
      level,
      chamber: chamber ?? null,
      district: district ?? null,
      office,
    },
  });

  if (votes.length > 0) {
    await prisma.vote.createMany({
      data: votes.map((v) => ({ ...v, politicianId: politician.id })),
      skipDuplicates: true,
    });
    console.log(`  ✓ ${votes.length} votes`);
  }

  if (!skipFinance && candidateId && cycle) {
    const totals = await getCandidateTotals(candidateId, cycle);
    if (!totals) {
      console.log(`  ⚠ No FEC totals for ${candidateId} cycle ${cycle}`);
      return;
    }

    let topDonors: unknown[] = [];
    let donorIndustries: unknown[] = [];

    const effectiveCommitteeId = committeeId ?? (await getPrincipalCommitteeId(candidateId, cycle));
    if (effectiveCommitteeId) {
      try {
        const employers = await getTopEmployers(effectiveCommitteeId, cycle);
        const summary = buildDonorSummary(employers);
        topDonors = summary.topDonors;
        donorIndustries = summary.donorIndustries;
      } catch (err) {
        console.log(`  ⚠ Could not fetch employer data: ${err}`);
      }
    }

    const totalRaised = totals.receipts;
    const totalSpent = totals.disbursements;
    const cashOnHand = parseFloat(totals.cash_on_hand_end_period);

    console.log(`  Raised: $${totalRaised.toLocaleString()}`);
    console.log(`  Spent:  $${totalSpent.toLocaleString()}`);
    console.log(`  Cash:   $${cashOnHand.toLocaleString()}`);
    if (topDonors.length > 0) {
      const donors = topDonors as Array<{ name: string }>;
      console.log(`  Top employers: ${donors.slice(0, 3).map((d) => d.name).join(", ")}`);
    }

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
    console.log(`  ✓ Finance record (cycle ${cycle})`);
  }

  console.log(`  ✓ ${name} done`);
}

async function main() {
  console.log("Seeding national politicians…\n");

  const results = await Promise.allSettled(POLITICIANS.map(syncPolitician));

  console.log("\n── Summary ──");
  for (let i = 0; i < POLITICIANS.length; i++) {
    const r = results[i];
    if (r.status === "fulfilled") {
      console.log(`  ✓ ${POLITICIANS[i].slug}`);
    } else {
      console.error(`  ✗ ${POLITICIANS[i].slug}: ${r.reason}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
