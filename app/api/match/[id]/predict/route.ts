import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateFatigue, calculateLambda, matchProbabilities } from "@/lib/models/football-math";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const tacticalHome = Number(searchParams.get("tacticalHome") || 0);
  const tacticalAway = Number(searchParams.get("tacticalAway") || 0);

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      homeTeam: { include: { homeMatches: true, awayMatches: true } },
      awayTeam: { include: { homeMatches: true, awayMatches: true } },
    },
  });

  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  const recentMatches = await prisma.match.findMany({
    where: {
      date: { gte: new Date(match.date.getTime() - 14 * 24 * 60 * 60 * 1000) },
      isPlayed: true,
    },
    select: { date: true, homeTeamId: true, awayTeamId: true, isPlayed: true },
  });

  const fatigueHome = calculateFatigue(match.homeTeam, match.date, recentMatches);
  const fatigueAway = calculateFatigue(match.awayTeam, match.date, recentMatches);
  const paramsMath = calculateLambda(
    match.homeTeam,
    match.awayTeam,
    fatigueHome,
    fatigueAway,
    tacticalHome,
    tacticalAway,
  );
  const probs = matchProbabilities(paramsMath);

  return NextResponse.json({
    ...probs,
    fatigueHome,
    fatigueAway,
    tacticalHome,
    tacticalAway,
    dataSource: match.homeXg ? "StatsBomb/Football-Data" : "approximated",
  });
}
