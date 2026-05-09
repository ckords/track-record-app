import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { GovernmentLevel } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const level = searchParams.get("level");
  const state = searchParams.get("state");
  const q = searchParams.get("q");

  const politicians = await prisma.politician.findMany({
    where: {
      ...(level ? { level: level as GovernmentLevel } : {}),
      ...(state ? { state } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { office: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      level: true,
      party: true,
      office: true,
      state: true,
      isActive: true,
    },
    orderBy: [{ level: "asc" }, { name: "asc" }],
    take: 100,
  });

  return NextResponse.json({ politicians });
}
