import "dotenv/config";
import { getTopEmployers, classifyEmployer, isGenericEmployer } from "../src/lib/fec";

const committees = [
  { name: "Cotton 2026",      id: "C00499988", cycle: 2026 },
  { name: "Boozman 2022",     id: "C00476317", cycle: 2022 },
  { name: "French Hill 2024", id: "C00551275", cycle: 2024 },
  { name: "Womack 2024",      id: "C00477745", cycle: 2024 },
];

async function main() {
  for (const c of committees) {
    const employers = await getTopEmployers(c.id, c.cycle, 50);
    const real = employers.filter((e) => !isGenericEmployer(e.employer));
    const misc = real.filter((e) => classifyEmployer(e.employer) === "Misc Business");
    console.log(`\n=== ${c.name} — Misc Business (${misc.length} of ${real.length} real employers) ===`);
    for (const e of misc.slice(0, 20)) {
      console.log(`  ${e.employer}: $${Math.round(e.total).toLocaleString()}`);
    }
  }
}

main().catch(console.error);
