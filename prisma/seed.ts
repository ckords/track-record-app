import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Federal politicians ---
  const warren = await prisma.politician.upsert({
    where: { slug: "elizabeth-warren" },
    update: {},
    create: {
      name: "Elizabeth Warren",
      slug: "elizabeth-warren",
      level: "FEDERAL",
      chamber: "SENATE",
      party: "DEMOCRAT",
      state: "MA",
      office: "U.S. Senator, Massachusetts",
      bio: "Senior senator from Massachusetts, known for her work on consumer protection and financial regulation.",
      website: "https://www.warren.senate.gov",
      twitter: "SenWarren",
      isActive: true,
    },
  });

  const scott = await prisma.politician.upsert({
    where: { slug: "tim-scott" },
    update: {},
    create: {
      name: "Tim Scott",
      slug: "tim-scott",
      level: "FEDERAL",
      chamber: "SENATE",
      party: "REPUBLICAN",
      state: "SC",
      office: "U.S. Senator, South Carolina",
      bio: "Senator from South Carolina, serving since 2013. Former member of the House of Representatives.",
      website: "https://www.scott.senate.gov",
      twitter: "SenatorTimScott",
      isActive: true,
    },
  });

  // --- State politician ---
  const newsom = await prisma.politician.upsert({
    where: { slug: "gavin-newsom" },
    update: {},
    create: {
      name: "Gavin Newsom",
      slug: "gavin-newsom",
      level: "STATE",
      party: "DEMOCRAT",
      state: "CA",
      office: "Governor, California",
      bio: "37th Governor of California, formerly Mayor of San Francisco and Lieutenant Governor.",
      website: "https://www.gov.ca.gov",
      twitter: "GavinNewsom",
      isActive: true,
    },
  });

  // --- Local politician ---
  const adams = await prisma.politician.upsert({
    where: { slug: "eric-adams" },
    update: {},
    create: {
      name: "Eric Adams",
      slug: "eric-adams",
      level: "LOCAL",
      party: "DEMOCRAT",
      state: "NY",
      city: "New York City",
      office: "Mayor, New York City",
      bio: "110th Mayor of New York City, former Brooklyn Borough President and state senator.",
      website: "https://www.nyc.gov/mayor",
      twitter: "NYCMayor",
      isActive: true,
    },
  });

  // --- Votes for Warren ---
  await prisma.vote.createMany({
    skipDuplicates: true,
    data: [
      {
        politicianId: warren.id,
        billTitle: "Inflation Reduction Act",
        billSummary: "Legislation to reduce the federal deficit, lower prescription drug prices, and invest in domestic energy production.",
        chamber: "SENATE",
        date: new Date("2022-08-07"),
        position: "Yes",
        result: "Passed 51-50",
        category: "Economy",
        externalId: "ira-2022-warren",
      },
      {
        politicianId: warren.id,
        billTitle: "CHIPS and Science Act",
        billSummary: "Funding for domestic semiconductor manufacturing and scientific research.",
        chamber: "SENATE",
        date: new Date("2022-07-27"),
        position: "Yes",
        result: "Passed 64-33",
        category: "Technology",
        externalId: "chips-2022-warren",
      },
      {
        politicianId: warren.id,
        billTitle: "Keystone XL Pipeline Authorization",
        billSummary: "Bill to authorize construction of the Keystone XL oil pipeline.",
        chamber: "SENATE",
        date: new Date("2015-01-29"),
        position: "No",
        result: "Passed 62-36",
        category: "Energy",
        externalId: "keystone-2015-warren",
      },
    ],
  });

  // --- Votes for Scott ---
  await prisma.vote.createMany({
    skipDuplicates: true,
    data: [
      {
        politicianId: scott.id,
        billTitle: "Inflation Reduction Act",
        billSummary: "Legislation to reduce the federal deficit, lower prescription drug prices, and invest in domestic energy production.",
        chamber: "SENATE",
        date: new Date("2022-08-07"),
        position: "No",
        result: "Passed 51-50",
        category: "Economy",
        externalId: "ira-2022-scott",
      },
      {
        politicianId: scott.id,
        billTitle: "CHIPS and Science Act",
        billSummary: "Funding for domestic semiconductor manufacturing and scientific research.",
        chamber: "SENATE",
        date: new Date("2022-07-27"),
        position: "Yes",
        result: "Passed 64-33",
        category: "Technology",
        externalId: "chips-2022-scott",
      },
    ],
  });

  // --- Promises for Warren ---
  await prisma.promise.createMany({
    skipDuplicates: false,
    data: [
      {
        politicianId: warren.id,
        title: "Cancel student debt",
        description: "Push for broad cancellation of federal student loan debt.",
        category: "Education",
        status: "IN_PROGRESS",
        madeAt: new Date("2020-01-01"),
        notes: "Partial cancellations have occurred; broader relief faces legal challenges.",
      },
      {
        politicianId: warren.id,
        title: "Enact a wealth tax",
        description: "Introduce legislation for a 2% annual tax on wealth above $50 million.",
        category: "Economy",
        status: "STALLED",
        madeAt: new Date("2019-01-24"),
        notes: "Ultra-Millionaire Tax Act introduced but has not advanced past committee.",
      },
      {
        politicianId: warren.id,
        title: "Strengthen the Consumer Financial Protection Bureau",
        description: "Protect and strengthen the agency she helped create.",
        category: "Economy",
        status: "KEPT",
        madeAt: new Date("2013-01-01"),
        resolvedAt: new Date("2023-01-01"),
      },
    ],
  });

  // --- Promises for Newsom ---
  await prisma.promise.createMany({
    skipDuplicates: false,
    data: [
      {
        politicianId: newsom.id,
        title: "End street homelessness in California",
        description: "Commit $12 billion to address homelessness across the state.",
        category: "Housing",
        status: "IN_PROGRESS",
        madeAt: new Date("2019-01-07"),
        notes: "Significant funding has been deployed; crisis persists in many cities.",
      },
      {
        politicianId: newsom.id,
        title: "Ban gas-powered car sales by 2035",
        description: "Executive order requiring all new cars sold in CA to be zero-emission by 2035.",
        category: "Environment",
        status: "KEPT",
        madeAt: new Date("2020-09-23"),
        resolvedAt: new Date("2020-09-23"),
        notes: "Signed into executive order; implementation rules are being finalized.",
      },
    ],
  });

  // --- Finance for Warren ---
  await prisma.financeRecord.upsert({
    where: { politicianId_cycle: { politicianId: warren.id, cycle: 2024 } },
    update: {},
    create: {
      politicianId: warren.id,
      cycle: 2024,
      totalRaised: 4_200_000,
      totalSpent: 3_800_000,
      cashOnHand: 1_100_000,
      topDonors: [
        { name: "Alphabet Inc. Employees", amount: 180000, type: "PAC" },
        { name: "Democracy for America", amount: 150000, type: "PAC" },
        { name: "Progressive Change Campaign Committee", amount: 120000, type: "PAC" },
      ],
      donorIndustries: [
        { industry: "Education", amount: 620000, percentage: 14.8 },
        { industry: "Law & Lobbying", amount: 510000, percentage: 12.1 },
        { industry: "Technology", amount: 480000, percentage: 11.4 },
        { industry: "Healthcare", amount: 390000, percentage: 9.3 },
        { industry: "Finance", amount: 310000, percentage: 7.4 },
      ],
    },
  });

  console.log("Seeded:", {
    politicians: [warren.name, scott.name, newsom.name, adams.name],
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
