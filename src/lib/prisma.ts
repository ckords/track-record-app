import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  // DIRECT_DATABASE_URL is used when DATABASE_URL is a prisma+postgres:// proxy URL
  // (e.g. local Prisma dev server). For Supabase/plain postgres, DATABASE_URL works directly.
  const connectionString = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL!;
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
