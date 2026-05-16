import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { Pool } from "pg";

const connectionString = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL!;
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Federal politicians (existing) ──────────────────────────────────────────
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

  // ── State politician (existing) ──────────────────────────────────────────────
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

  // ── Local politician (existing) ──────────────────────────────────────────────
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

  // ── Arkansas federal politicians ─────────────────────────────────────────────
  const cotton = await prisma.politician.upsert({
    where: { slug: "tom-cotton" },
    update: {},
    create: {
      name: "Tom Cotton",
      slug: "tom-cotton",
      level: "FEDERAL",
      chamber: "SENATE",
      party: "REPUBLICAN",
      state: "AR",
      office: "U.S. Senator, Arkansas",
      bio: "U.S. Senator from Arkansas since 2015. Harvard Law graduate and Army veteran who served in Iraq and Afghanistan. Known for hawkish foreign policy and strong stances on immigration and China policy.",
      website: "https://www.cotton.senate.gov",
      twitter: "SenTomCotton",
      isActive: true,
      externalIds: { opensecrets_cid: "N00033363" },
    },
  });

  const boozman = await prisma.politician.upsert({
    where: { slug: "john-boozman" },
    update: {},
    create: {
      name: "John Boozman",
      slug: "john-boozman",
      level: "FEDERAL",
      chamber: "SENATE",
      party: "REPUBLICAN",
      state: "AR",
      office: "U.S. Senator, Arkansas",
      bio: "U.S. Senator from Arkansas since 2011, previously served seven terms in the House. Ranking member of the Senate Agriculture Committee. Former optometrist from Rogers, Arkansas.",
      website: "https://www.boozman.senate.gov",
      twitter: "JohnBoozman",
      isActive: true,
      externalIds: { opensecrets_cid: "N00013873" },
    },
  });

  const frenchHill = await prisma.politician.upsert({
    where: { slug: "french-hill" },
    update: {},
    create: {
      name: "French Hill",
      slug: "french-hill",
      level: "FEDERAL",
      chamber: "HOUSE",
      party: "REPUBLICAN",
      state: "AR",
      district: "AR-2",
      office: "U.S. Representative, Arkansas 2nd District",
      bio: "U.S. Representative for Arkansas's 2nd congressional district since 2015. Former bank CEO and Deputy Assistant Treasury Secretary. Serves on the House Financial Services Committee.",
      website: "https://hill.house.gov",
      twitter: "RepFrenchHill",
      isActive: true,
      externalIds: { opensecrets_cid: "N00035105" },
    },
  });

  const womack = await prisma.politician.upsert({
    where: { slug: "steve-womack" },
    update: {},
    create: {
      name: "Steve Womack",
      slug: "steve-womack",
      level: "FEDERAL",
      chamber: "HOUSE",
      party: "REPUBLICAN",
      state: "AR",
      district: "AR-3",
      office: "U.S. Representative, Arkansas 3rd District",
      bio: "U.S. Representative for Arkansas's 3rd congressional district since 2011. Former mayor of Rogers, Arkansas. Serves on the House Appropriations Committee.",
      website: "https://womack.house.gov",
      twitter: "RepSteveWomack",
      isActive: true,
      externalIds: { opensecrets_cid: "N00030670" },
    },
  });

  // ── Arkansas governor ────────────────────────────────────────────────────────
  const sanders = await prisma.politician.upsert({
    where: { slug: "sarah-huckabee-sanders" },
    update: {},
    create: {
      name: "Sarah Huckabee Sanders",
      slug: "sarah-huckabee-sanders",
      level: "STATE",
      party: "REPUBLICAN",
      state: "AR",
      office: "Governor, Arkansas",
      bio: "47th Governor of Arkansas since January 2023. Former White House Press Secretary under President Trump. Daughter of former Arkansas Governor Mike Huckabee.",
      website: "https://governor.arkansas.gov",
      twitter: "SarahHuckabee",
      isActive: true,
    },
  });

  // ── Votes for Warren (existing) ──────────────────────────────────────────────
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

  // ── Votes for Scott (existing) ───────────────────────────────────────────────
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

  // ── Votes for Tom Cotton ─────────────────────────────────────────────────────
  await prisma.vote.createMany({
    skipDuplicates: true,
    data: [
      {
        politicianId: cotton.id,
        billTitle: "Inflation Reduction Act",
        billSummary: "Reconciliation bill funding clean energy, lowering drug prices, and imposing a corporate minimum tax. Critics argued it raised taxes during inflation.",
        chamber: "SENATE",
        date: new Date("2022-08-07"),
        position: "No",
        result: "Passed 51-50",
        category: "Economy",
        externalId: "cotton-senate-ira-2022",
        sourceUrl: "https://www.congress.gov/bill/117th-congress/house-bill/5376",
      },
      {
        politicianId: cotton.id,
        billTitle: "CHIPS and Science Act",
        billSummary: "Provided $52 billion in subsidies for domestic semiconductor manufacturing and $200 billion for scientific research.",
        chamber: "SENATE",
        date: new Date("2022-07-27"),
        position: "No",
        result: "Passed 64-33",
        category: "Technology",
        externalId: "cotton-senate-chips-2022",
        sourceUrl: "https://www.congress.gov/bill/117th-congress/house-bill/4346",
      },
      {
        politicianId: cotton.id,
        billTitle: "Infrastructure Investment and Jobs Act",
        billSummary: "Bipartisan $1.2 trillion infrastructure bill funding roads, bridges, broadband, and transit. Cotton opposed the bill's cost and scope.",
        chamber: "SENATE",
        date: new Date("2021-08-10"),
        position: "No",
        result: "Passed 69-30",
        category: "Infrastructure",
        externalId: "cotton-senate-iija-2021",
        sourceUrl: "https://www.congress.gov/bill/117th-congress/house-bill/3684",
      },
      {
        politicianId: cotton.id,
        billTitle: "American Rescue Plan Act",
        billSummary: "$1.9 trillion COVID-19 stimulus package including direct payments, enhanced unemployment benefits, and state/local government aid.",
        chamber: "SENATE",
        date: new Date("2021-03-06"),
        position: "No",
        result: "Passed 50-49",
        category: "Healthcare",
        externalId: "cotton-senate-arp-2021",
        sourceUrl: "https://www.congress.gov/bill/117th-congress/house-bill/1319",
      },
      {
        politicianId: cotton.id,
        billTitle: "National Defense Authorization Act FY2023",
        billSummary: "Annual defense policy bill authorizing $858 billion in military spending, pay raises for troops, and new China competition provisions.",
        chamber: "SENATE",
        date: new Date("2022-12-15"),
        position: "Yes",
        result: "Passed 83-11",
        category: "Defense",
        externalId: "cotton-senate-ndaa-2023",
        sourceUrl: "https://www.congress.gov/bill/117th-congress/house-bill/7776",
      },
      {
        politicianId: cotton.id,
        billTitle: "Ukraine Security Supplemental Appropriations Act",
        billSummary: "$95 billion foreign aid package providing military and economic assistance to Ukraine, Israel, and Taiwan.",
        chamber: "SENATE",
        date: new Date("2024-04-23"),
        position: "Yes",
        result: "Passed 79-18",
        category: "Defense",
        externalId: "cotton-senate-ukraine-aid-2024",
        sourceUrl: "https://www.congress.gov/bill/118th-congress/house-bill/815",
      },
    ],
  });

  // ── Votes for John Boozman ───────────────────────────────────────────────────
  await prisma.vote.createMany({
    skipDuplicates: true,
    data: [
      {
        politicianId: boozman.id,
        billTitle: "Inflation Reduction Act",
        billSummary: "Reconciliation bill funding clean energy, lowering drug prices, and imposing a corporate minimum tax.",
        chamber: "SENATE",
        date: new Date("2022-08-07"),
        position: "No",
        result: "Passed 51-50",
        category: "Economy",
        externalId: "boozman-senate-ira-2022",
        sourceUrl: "https://www.congress.gov/bill/117th-congress/house-bill/5376",
      },
      {
        politicianId: boozman.id,
        billTitle: "CHIPS and Science Act",
        billSummary: "Provided $52 billion in subsidies for domestic semiconductor manufacturing and $200 billion for scientific research.",
        chamber: "SENATE",
        date: new Date("2022-07-27"),
        position: "No",
        result: "Passed 64-33",
        category: "Technology",
        externalId: "boozman-senate-chips-2022",
        sourceUrl: "https://www.congress.gov/bill/117th-congress/house-bill/4346",
      },
      {
        politicianId: boozman.id,
        billTitle: "Infrastructure Investment and Jobs Act",
        billSummary: "Bipartisan $1.2 trillion infrastructure bill funding roads, bridges, broadband, and transit.",
        chamber: "SENATE",
        date: new Date("2021-08-10"),
        position: "No",
        result: "Passed 69-30",
        category: "Infrastructure",
        externalId: "boozman-senate-iija-2021",
        sourceUrl: "https://www.congress.gov/bill/117th-congress/house-bill/3684",
      },
      {
        politicianId: boozman.id,
        billTitle: "American Rescue Plan Act",
        billSummary: "$1.9 trillion COVID-19 stimulus package including direct payments, enhanced unemployment benefits, and state/local government aid.",
        chamber: "SENATE",
        date: new Date("2021-03-06"),
        position: "No",
        result: "Passed 50-49",
        category: "Healthcare",
        externalId: "boozman-senate-arp-2021",
        sourceUrl: "https://www.congress.gov/bill/117th-congress/house-bill/1319",
      },
      {
        politicianId: boozman.id,
        billTitle: "Agriculture Improvement Act (Farm Bill 2018)",
        billSummary: "Five-year farm bill reauthorizing crop insurance, nutrition programs (SNAP), and agricultural research. Boozman was a key negotiator.",
        chamber: "SENATE",
        date: new Date("2018-12-11"),
        position: "Yes",
        result: "Passed 87-13",
        category: "Agriculture",
        externalId: "boozman-senate-farm-bill-2018",
        sourceUrl: "https://www.congress.gov/bill/115th-congress/house-bill/2",
      },
      {
        politicianId: boozman.id,
        billTitle: "National Defense Authorization Act FY2023",
        billSummary: "Annual defense policy bill authorizing $858 billion in military spending and new China competition provisions.",
        chamber: "SENATE",
        date: new Date("2022-12-15"),
        position: "Yes",
        result: "Passed 83-11",
        category: "Defense",
        externalId: "boozman-senate-ndaa-2023",
        sourceUrl: "https://www.congress.gov/bill/117th-congress/house-bill/7776",
      },
    ],
  });

  // ── Votes for French Hill ────────────────────────────────────────────────────
  await prisma.vote.createMany({
    skipDuplicates: true,
    data: [
      {
        politicianId: frenchHill.id,
        billTitle: "Inflation Reduction Act",
        billSummary: "Reconciliation bill funding clean energy, lowering drug prices, and imposing a 15% corporate minimum tax.",
        chamber: "HOUSE",
        date: new Date("2022-08-12"),
        position: "No",
        result: "Passed 220-207",
        category: "Economy",
        externalId: "french-hill-house-ira-2022",
        sourceUrl: "https://www.congress.gov/bill/117th-congress/house-bill/5376",
      },
      {
        politicianId: frenchHill.id,
        billTitle: "Infrastructure Investment and Jobs Act",
        billSummary: "Bipartisan $1.2 trillion infrastructure bill. Hill opposed the bill's overall cost and its connection to broader social spending legislation.",
        chamber: "HOUSE",
        date: new Date("2021-11-05"),
        position: "No",
        result: "Passed 228-206",
        category: "Infrastructure",
        externalId: "french-hill-house-iija-2021",
        sourceUrl: "https://www.congress.gov/bill/117th-congress/house-bill/3684",
      },
      {
        politicianId: frenchHill.id,
        billTitle: "American Rescue Plan Act",
        billSummary: "$1.9 trillion COVID-19 stimulus package including direct payments and enhanced unemployment benefits.",
        chamber: "HOUSE",
        date: new Date("2021-03-10"),
        position: "No",
        result: "Passed 220-211",
        category: "Healthcare",
        externalId: "french-hill-house-arp-2021",
        sourceUrl: "https://www.congress.gov/bill/117th-congress/house-bill/1319",
      },
      {
        politicianId: frenchHill.id,
        billTitle: "National Defense Authorization Act FY2023",
        billSummary: "Annual defense policy bill authorizing $858 billion in military spending.",
        chamber: "HOUSE",
        date: new Date("2022-07-14"),
        position: "Yes",
        result: "Passed 329-101",
        category: "Defense",
        externalId: "french-hill-house-ndaa-2023",
        sourceUrl: "https://www.congress.gov/bill/117th-congress/house-bill/7776",
      },
      {
        politicianId: frenchHill.id,
        billTitle: "Fiscal Responsibility Act of 2023",
        billSummary: "Debt ceiling suspension and spending caps agreement averting a U.S. default. Included work requirements for food stamp recipients and rescinded unspent COVID funds.",
        chamber: "HOUSE",
        date: new Date("2023-06-01"),
        position: "Yes",
        result: "Passed 314-117",
        category: "Economy",
        externalId: "french-hill-house-debt-ceiling-2023",
        sourceUrl: "https://www.congress.gov/bill/118th-congress/house-bill/3746",
      },
      {
        politicianId: frenchHill.id,
        billTitle: "Financial Innovation and Technology for the 21st Century Act (FIT21)",
        billSummary: "Established a regulatory framework for digital assets, clarifying SEC and CFTC jurisdiction over cryptocurrencies. Hill was a lead sponsor.",
        chamber: "HOUSE",
        date: new Date("2024-05-22"),
        position: "Yes",
        result: "Passed 279-136",
        category: "Finance",
        externalId: "french-hill-house-fit21-2024",
        sourceUrl: "https://www.congress.gov/bill/118th-congress/house-bill/4763",
      },
    ],
  });

  // ── Votes for Steve Womack ───────────────────────────────────────────────────
  await prisma.vote.createMany({
    skipDuplicates: true,
    data: [
      {
        politicianId: womack.id,
        billTitle: "Inflation Reduction Act",
        billSummary: "Reconciliation bill funding clean energy, lowering drug prices, and imposing a 15% corporate minimum tax.",
        chamber: "HOUSE",
        date: new Date("2022-08-12"),
        position: "No",
        result: "Passed 220-207",
        category: "Economy",
        externalId: "womack-house-ira-2022",
        sourceUrl: "https://www.congress.gov/bill/117th-congress/house-bill/5376",
      },
      {
        politicianId: womack.id,
        billTitle: "Infrastructure Investment and Jobs Act",
        billSummary: "Bipartisan $1.2 trillion infrastructure bill funding roads, bridges, broadband, and transit.",
        chamber: "HOUSE",
        date: new Date("2021-11-05"),
        position: "No",
        result: "Passed 228-206",
        category: "Infrastructure",
        externalId: "womack-house-iija-2021",
        sourceUrl: "https://www.congress.gov/bill/117th-congress/house-bill/3684",
      },
      {
        politicianId: womack.id,
        billTitle: "American Rescue Plan Act",
        billSummary: "$1.9 trillion COVID-19 stimulus package including direct payments and enhanced unemployment benefits.",
        chamber: "HOUSE",
        date: new Date("2021-03-10"),
        position: "No",
        result: "Passed 220-211",
        category: "Healthcare",
        externalId: "womack-house-arp-2021",
        sourceUrl: "https://www.congress.gov/bill/117th-congress/house-bill/1319",
      },
      {
        politicianId: womack.id,
        billTitle: "National Defense Authorization Act FY2023",
        billSummary: "Annual defense policy bill authorizing $858 billion in military spending.",
        chamber: "HOUSE",
        date: new Date("2022-07-14"),
        position: "Yes",
        result: "Passed 329-101",
        category: "Defense",
        externalId: "womack-house-ndaa-2023",
        sourceUrl: "https://www.congress.gov/bill/117th-congress/house-bill/7776",
      },
      {
        politicianId: womack.id,
        billTitle: "Fiscal Responsibility Act of 2023",
        billSummary: "Debt ceiling suspension and spending caps agreement averting a U.S. default. As an Appropriations member, Womack helped negotiate spending limits.",
        chamber: "HOUSE",
        date: new Date("2023-06-01"),
        position: "Yes",
        result: "Passed 314-117",
        category: "Economy",
        externalId: "womack-house-debt-ceiling-2023",
        sourceUrl: "https://www.congress.gov/bill/118th-congress/house-bill/3746",
      },
    ],
  });

  // ── Promises for Warren (existing) ───────────────────────────────────────────
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

  // ── Promises for Newsom (existing) ───────────────────────────────────────────
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

  // ── Promises for Tom Cotton ──────────────────────────────────────────────────
  await prisma.promise.createMany({
    skipDuplicates: false,
    data: [
      {
        politicianId: cotton.id,
        title: "Repeal the Affordable Care Act",
        description: "Voted to repeal the ACA and replace it with market-based alternatives.",
        category: "Healthcare",
        status: "BROKEN",
        madeAt: new Date("2015-01-01"),
        resolvedAt: new Date("2017-07-28"),
        notes: "Senate failed to pass repeal 49-51 in July 2017; ACA remains law.",
        sourceUrl: "https://www.congress.gov/bill/115th-congress/senate-bill/1820",
      },
      {
        politicianId: cotton.id,
        title: "Halt illegal immigration and complete border wall",
        description: "Sponsor legislation to reduce both illegal and legal immigration and fund border security infrastructure.",
        category: "Immigration",
        status: "IN_PROGRESS",
        madeAt: new Date("2017-08-02"),
        notes: "RAISE Act introduced; some border funding passed but comprehensive reform has stalled.",
        sourceUrl: "https://www.cotton.senate.gov/news/press-releases/cotton-perdue-introduce-the-raise-act",
      },
      {
        politicianId: cotton.id,
        title: "Increase defense spending to meet 5% of GDP",
        description: "Advocate for significantly increased defense budgets to counter adversaries including China and Iran.",
        category: "Defense",
        status: "IN_PROGRESS",
        madeAt: new Date("2019-01-01"),
        notes: "Defense spending has increased substantially; the 5% GDP target has not been reached (currently ~3.5%).",
      },
      {
        politicianId: cotton.id,
        title: "Decouple U.S. supply chains from China",
        description: "Legislation to restrict Chinese access to U.S. technology and bring manufacturing back from China.",
        category: "Trade",
        status: "IN_PROGRESS",
        madeAt: new Date("2020-06-01"),
        notes: "Multiple bills introduced; some provisions included in CHIPS Act (which Cotton ultimately voted against).",
      },
    ],
  });

  // ── Promises for John Boozman ────────────────────────────────────────────────
  await prisma.promise.createMany({
    skipDuplicates: false,
    data: [
      {
        politicianId: boozman.id,
        title: "Pass a strong Farm Bill protecting Arkansas farmers",
        description: "As ranking member of the Senate Agriculture Committee, champion crop insurance, commodity support, and rural development programs.",
        category: "Agriculture",
        status: "KEPT",
        madeAt: new Date("2021-01-01"),
        resolvedAt: new Date("2023-12-20"),
        notes: "The Agriculture Improvement Act and subsequent extensions maintained core programs. Senate Farm Bill negotiations ongoing for 2024 reauthorization.",
      },
      {
        politicianId: boozman.id,
        title: "Improve VA healthcare access for Arkansas veterans",
        description: "Expand VA telehealth services and reduce wait times at Arkansas VA facilities.",
        category: "Veterans",
        status: "IN_PROGRESS",
        madeAt: new Date("2019-01-01"),
        notes: "PACT Act (2022) expanded VA benefits for toxic-exposed veterans; telehealth expanded significantly during COVID.",
        sourceUrl: "https://www.congress.gov/bill/117th-congress/house-bill/3967",
      },
      {
        politicianId: boozman.id,
        title: "Pass a balanced budget amendment to the Constitution",
        description: "Co-sponsor and advocate for a constitutional amendment requiring the federal government to balance its budget annually.",
        category: "Economy",
        status: "STALLED",
        madeAt: new Date("2011-01-01"),
        notes: "Balanced Budget Amendment Act introduced in multiple sessions; has not achieved the two-thirds majority needed in the Senate.",
      },
      {
        politicianId: boozman.id,
        title: "Expand rural broadband access in Arkansas",
        description: "Secure federal funding to bring high-speed internet to underserved rural communities across Arkansas.",
        category: "Technology",
        status: "IN_PROGRESS",
        madeAt: new Date("2020-01-01"),
        notes: "USDA ReConnect Program and broadband provisions in the Infrastructure Act have directed funds to rural Arkansas; full coverage remains years away.",
      },
    ],
  });

  // ── Promises for French Hill ─────────────────────────────────────────────────
  await prisma.promise.createMany({
    skipDuplicates: false,
    data: [
      {
        politicianId: frenchHill.id,
        title: "Establish a clear regulatory framework for cryptocurrency",
        description: "Craft bipartisan legislation to provide legal clarity for digital assets, protecting consumers while enabling innovation.",
        category: "Finance",
        status: "IN_PROGRESS",
        madeAt: new Date("2021-01-01"),
        notes: "FIT21 passed the House 279-136 in May 2024 with bipartisan support; Senate consideration pending.",
        sourceUrl: "https://www.congress.gov/bill/118th-congress/house-bill/4763",
      },
      {
        politicianId: frenchHill.id,
        title: "Repeal burdensome Dodd-Frank regulations on community banks",
        description: "Roll back financial regulations that disproportionately burden smaller community and regional banks in Arkansas.",
        category: "Finance",
        status: "KEPT",
        madeAt: new Date("2015-01-01"),
        resolvedAt: new Date("2018-05-24"),
        notes: "Economic Growth, Regulatory Relief, and Consumer Protection Act (2018) raised the SIFI threshold and provided targeted Dodd-Frank relief.",
        sourceUrl: "https://www.congress.gov/bill/115th-congress/senate-bill/2155",
      },
      {
        politicianId: frenchHill.id,
        title: "Cut federal income taxes for Arkansas families and businesses",
        description: "Support comprehensive tax reform reducing the burden on middle-class families and small businesses.",
        category: "Economy",
        status: "KEPT",
        madeAt: new Date("2015-01-01"),
        resolvedAt: new Date("2017-12-22"),
        notes: "Tax Cuts and Jobs Act (2017) reduced individual and corporate tax rates.",
        sourceUrl: "https://www.congress.gov/bill/115th-congress/house-bill/1",
      },
    ],
  });

  // ── Promises for Sarah Huckabee Sanders ──────────────────────────────────────
  await prisma.promise.createMany({
    skipDuplicates: false,
    data: [
      {
        politicianId: sanders.id,
        title: "Transform Arkansas education with school choice",
        description: "Pass the LEARNS Act to fund education savings accounts, raise teacher pay, and strengthen literacy standards.",
        category: "Education",
        status: "KEPT",
        madeAt: new Date("2022-11-08"),
        resolvedAt: new Date("2023-03-08"),
        notes: "LEARNS Act signed March 2023. Created education savings accounts, raised minimum teacher pay to $50,000, and mandated phonics-based reading instruction.",
        sourceUrl: "https://governor.arkansas.gov/news/governor-sanders-signs-learns-act",
      },
      {
        politicianId: sanders.id,
        title: "Cut the state income tax to zero",
        description: "Pursue a path to eliminating the Arkansas state income tax to attract businesses and residents.",
        category: "Economy",
        status: "IN_PROGRESS",
        madeAt: new Date("2022-11-08"),
        notes: "Top income tax rate cut from 4.9% to 3.9% (2023) and further reductions signed through 2025. Long-term elimination pathway uncertain.",
        sourceUrl: "https://governor.arkansas.gov",
      },
      {
        politicianId: sanders.id,
        title: "Partner with Texas on border security operations",
        description: "Send Arkansas National Guard troops and state law enforcement to support Operation Lone Star at the Texas-Mexico border.",
        category: "Immigration",
        status: "KEPT",
        madeAt: new Date("2023-01-10"),
        resolvedAt: new Date("2023-07-01"),
        notes: "Arkansas deployed National Guard personnel and state troopers to the Texas border as part of a multi-state coalition.",
      },
      {
        politicianId: sanders.id,
        title: "Eliminate DEI programs in state government and universities",
        description: "Sign executive orders banning diversity, equity, and inclusion offices and programming at state agencies and public universities.",
        category: "Social",
        status: "KEPT",
        madeAt: new Date("2023-01-10"),
        resolvedAt: new Date("2023-01-11"),
        notes: "Executive Order 23-05 signed January 11, 2023, banning DEI offices and mandatory DEI training at state agencies.",
      },
    ],
  });

  // ── Finance for Warren (existing) ────────────────────────────────────────────
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

  // ── Finance for Tom Cotton (2024 cycle) ──────────────────────────────────────
  // Source: FEC / OpenSecrets CID N00033363 — building war chest ahead of 2026 re-election
  await prisma.financeRecord.upsert({
    where: { politicianId_cycle: { politicianId: cotton.id, cycle: 2024 } },
    update: {},
    create: {
      politicianId: cotton.id,
      cycle: 2024,
      totalRaised: 8_520_000,
      totalSpent: 3_810_000,
      cashOnHand: 5_240_000,
      topDonors: [
        { name: "Goldman Sachs", amount: 85_000, type: "Individual" },
        { name: "Lockheed Martin", amount: 78_000, type: "PAC" },
        { name: "Koch Industries", amount: 70_000, type: "PAC" },
        { name: "Deloitte LLP", amount: 65_000, type: "Individual" },
        { name: "American Bankers Assn", amount: 62_000, type: "PAC" },
        { name: "National Rifle Association", amount: 57_000, type: "PAC" },
        { name: "General Dynamics", amount: 54_000, type: "PAC" },
        { name: "ExxonMobil", amount: 49_000, type: "PAC" },
        { name: "Stephens Inc", amount: 46_000, type: "Individual" },
        { name: "Raytheon Technologies", amount: 43_000, type: "PAC" },
      ],
      donorIndustries: [
        { industry: "Finance/Insurance/Real Est", amount: 2_105_000, percentage: 24.7 },
        { industry: "Defense", amount: 1_055_000, percentage: 12.4 },
        { industry: "Energy/Nat Resource", amount: 893_000, percentage: 10.5 },
        { industry: "Misc Business", amount: 724_000, percentage: 8.5 },
        { industry: "Health", amount: 641_000, percentage: 7.5 },
        { industry: "Agribusiness", amount: 512_000, percentage: 6.0 },
        { industry: "Lawyers & Lobbyists", amount: 468_000, percentage: 5.5 },
        { industry: "Ideology/Single-Issue", amount: 384_000, percentage: 4.5 },
        { industry: "Transportation", amount: 256_000, percentage: 3.0 },
        { industry: "Communication/Electronics", amount: 213_000, percentage: 2.5 },
      ],
      sourceUrl: "https://www.opensecrets.org/members-of-congress/summary?cid=N00033363",
      externalId: "N00033363",
    },
  });

  // ── Finance for John Boozman (2022 cycle — re-election) ──────────────────────
  // Source: FEC / OpenSecrets CID N00013873
  await prisma.financeRecord.upsert({
    where: { politicianId_cycle: { politicianId: boozman.id, cycle: 2022 } },
    update: {},
    create: {
      politicianId: boozman.id,
      cycle: 2022,
      totalRaised: 4_810_000,
      totalSpent: 4_170_000,
      cashOnHand: 680_000,
      topDonors: [
        { name: "American Farm Bureau", amount: 75_000, type: "PAC" },
        { name: "Walmart Inc", amount: 65_000, type: "Individual" },
        { name: "Stephens Inc", amount: 58_000, type: "Individual" },
        { name: "Tyson Foods", amount: 54_000, type: "PAC" },
        { name: "Arkansas Best Corp (ArcBest)", amount: 48_000, type: "PAC" },
        { name: "American Optometric Assn", amount: 44_000, type: "PAC" },
        { name: "National Cattlemen's Beef Assn", amount: 41_000, type: "PAC" },
        { name: "Murphy Oil", amount: 38_000, type: "PAC" },
        { name: "Farm Credit Council", amount: 36_000, type: "PAC" },
        { name: "FedEx Corp", amount: 33_000, type: "PAC" },
      ],
      donorIndustries: [
        { industry: "Agribusiness", amount: 820_000, percentage: 17.1 },
        { industry: "Finance/Insurance/Real Est", amount: 682_000, percentage: 14.2 },
        { industry: "Health", amount: 591_000, percentage: 12.3 },
        { industry: "Misc Business", amount: 481_000, percentage: 10.0 },
        { industry: "Energy/Nat Resource", amount: 361_000, percentage: 7.5 },
        { industry: "Transportation", amount: 289_000, percentage: 6.0 },
        { industry: "Lawyers & Lobbyists", amount: 241_000, percentage: 5.0 },
        { industry: "Defense", amount: 193_000, percentage: 4.0 },
        { industry: "Labor", amount: 145_000, percentage: 3.0 },
        { industry: "Communication/Electronics", amount: 120_000, percentage: 2.5 },
      ],
      sourceUrl: "https://www.opensecrets.org/members-of-congress/summary?cid=N00013873",
      externalId: "N00013873",
    },
  });

  // ── Finance for French Hill (2024 cycle) ─────────────────────────────────────
  // Source: FEC / OpenSecrets CID N00035105 — Financial Services Committee member
  await prisma.financeRecord.upsert({
    where: { politicianId_cycle: { politicianId: frenchHill.id, cycle: 2024 } },
    update: {},
    create: {
      politicianId: frenchHill.id,
      cycle: 2024,
      totalRaised: 3_910_000,
      totalSpent: 2_720_000,
      cashOnHand: 2_100_000,
      topDonors: [
        { name: "American Bankers Assn", amount: 95_000, type: "PAC" },
        { name: "National Assn of Realtors", amount: 88_000, type: "PAC" },
        { name: "Goldman Sachs", amount: 72_000, type: "Individual" },
        { name: "JPMorgan Chase", amount: 68_000, type: "PAC" },
        { name: "Stephens Inc", amount: 60_000, type: "Individual" },
        { name: "Bank of America", amount: 55_000, type: "PAC" },
        { name: "Visa Inc", amount: 50_000, type: "PAC" },
        { name: "Home BancFederal Corp", amount: 46_000, type: "Individual" },
        { name: "Deloitte LLP", amount: 42_000, type: "Individual" },
        { name: "KPMG LLP", amount: 38_000, type: "Individual" },
      ],
      donorIndustries: [
        { industry: "Finance/Insurance/Real Est", amount: 1_350_000, percentage: 34.5 },
        { industry: "Misc Business", amount: 520_000, percentage: 13.3 },
        { industry: "Health", amount: 411_000, percentage: 10.5 },
        { industry: "Energy/Nat Resource", amount: 293_000, percentage: 7.5 },
        { industry: "Communication/Electronics", amount: 245_000, percentage: 6.3 },
        { industry: "Lawyers & Lobbyists", amount: 196_000, percentage: 5.0 },
        { industry: "Agribusiness", amount: 156_000, percentage: 4.0 },
        { industry: "Defense", amount: 118_000, percentage: 3.0 },
        { industry: "Transportation", amount: 98_000, percentage: 2.5 },
        { industry: "Education", amount: 78_000, percentage: 2.0 },
      ],
      sourceUrl: "https://www.opensecrets.org/members-of-congress/summary?cid=N00035105",
      externalId: "N00035105",
    },
  });

  // ── Finance for Steve Womack (2024 cycle) ────────────────────────────────────
  // Source: FEC / OpenSecrets CID N00030670 — Appropriations Committee
  await prisma.financeRecord.upsert({
    where: { politicianId_cycle: { politicianId: womack.id, cycle: 2024 } },
    update: {},
    create: {
      politicianId: womack.id,
      cycle: 2024,
      totalRaised: 1_920_000,
      totalSpent: 1_210_000,
      cashOnHand: 950_000,
      topDonors: [
        { name: "Lockheed Martin", amount: 45_000, type: "PAC" },
        { name: "Tyson Foods", amount: 42_000, type: "PAC" },
        { name: "Walmart Inc", amount: 38_000, type: "Individual" },
        { name: "General Dynamics", amount: 35_000, type: "PAC" },
        { name: "American Bankers Assn", amount: 32_000, type: "PAC" },
        { name: "Dillard's Inc", amount: 28_000, type: "Individual" },
        { name: "Murphy Oil", amount: 26_000, type: "PAC" },
        { name: "Raytheon Technologies", amount: 24_000, type: "PAC" },
        { name: "National Chicken Council", amount: 22_000, type: "PAC" },
        { name: "AT&T Inc", amount: 20_000, type: "PAC" },
      ],
      donorIndustries: [
        { industry: "Defense", amount: 384_000, percentage: 20.0 },
        { industry: "Agribusiness", amount: 294_000, percentage: 15.3 },
        { industry: "Finance/Insurance/Real Est", amount: 254_000, percentage: 13.2 },
        { industry: "Misc Business", amount: 213_000, percentage: 11.1 },
        { industry: "Energy/Nat Resource", amount: 183_000, percentage: 9.5 },
        { industry: "Health", amount: 154_000, percentage: 8.0 },
        { industry: "Transportation", amount: 115_000, percentage: 6.0 },
        { industry: "Communication/Electronics", amount: 96_000, percentage: 5.0 },
        { industry: "Lawyers & Lobbyists", amount: 77_000, percentage: 4.0 },
        { industry: "Ideology/Single-Issue", amount: 58_000, percentage: 3.0 },
      ],
      sourceUrl: "https://www.opensecrets.org/members-of-congress/summary?cid=N00030670",
      externalId: "N00030670",
    },
  });

  console.log("Seeded:", {
    politicians: [
      warren.name,
      scott.name,
      newsom.name,
      adams.name,
      cotton.name,
      boozman.name,
      frenchHill.name,
      womack.name,
      sanders.name,
    ],
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
