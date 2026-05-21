import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const politicians = await prisma.politician.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      party: true,
      state: true,
      office: true,
      votes: {
        select: { billTitle: true, position: true },
      },
    },
    where: { votes: { some: {} } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ politicians });
}
