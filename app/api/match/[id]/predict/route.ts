import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { calculateFatigue, calculateLambda, matchProbabilities } from "../../../../../../lib/models/football-math";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await context.params;
  const url = new URL(_.url);
  const tacticalModifier = Number(url.searchParams.get("tacticalModifier") ?? 0);
  const match = await prisma.match.findUnique({
    where: { id },
    include: { homeTeam: { include: { homeMatches: true, awayMatches: true } }, awayTeam: { include: { homeMatches: true, awayMatches: true } } },
  });

  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  const allLeagueMatches = await prisma.match.findMany({
    where: { leagueId: match.leagueId },
    select: { date: true, homeTeamId: true, awayTeamId: true, isPlayed: true },
  });

  const fatigueHome = calculateFatigue(match.homeTeam, match.date, allLeagueMatches);
  const fatigueAway = calculateFatigue(match.awayTeam, match.date, allLeagueMatches);
  const params = calculateLambda(match.homeTeam, match.awayTeam, fatigueHome, fatigueAway);
  params.lambdaHome *= 1 + tacticalModifier * 0.05;
  const probs = matchProbabilities(params);

  return NextResponse.json({ ...probs, fatigueHome, fatigueAway });
}
