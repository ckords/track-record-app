import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const ratingSchema = z.object({
  politicianId: z.string().min(1),
  score: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = ratingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { politicianId, score, comment } = parsed.data;

  const rating = await prisma.rating.upsert({
    where: { politicianId_userId: { politicianId, userId: user.id } },
    create: { politicianId, userId: user.id, score, comment },
    update: { score, comment },
  });

  return NextResponse.json({ rating });
}

export async function GET(request: NextRequest) {
  const politicianId = request.nextUrl.searchParams.get("politicianId");

  if (!politicianId) {
    return NextResponse.json({ error: "politicianId required" }, { status: 400 });
  }

  const [ratings, aggregate] = await Promise.all([
    prisma.rating.findMany({
      where: { politicianId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, score: true, comment: true, createdAt: true, isVerified: true },
    }),
    prisma.rating.aggregate({
      where: { politicianId },
      _avg: { score: true },
      _count: true,
    }),
  ]);

  return NextResponse.json({
    ratings,
    average: aggregate._avg.score,
    total: aggregate._count,
  });
}
