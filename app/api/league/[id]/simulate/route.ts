import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCache, setCache } from "@/lib/redis";
import { simulateSeason, simulateTwoSeasons, type StandingLine } from "@/lib/models/football-math";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await params;
  const body = (await request.json()) as { season: string; twoSeasons?: boolean; iterations?: number };
  const { season, twoSeasons = false, iterations = 10000 } = body;

  const cacheKey = `sim:${id}:${season}:${String(twoSeasons)}:${String(iterations)}`;
  const cached = await getCache<unknown>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const teams = await prisma.team.findMany({
    where: { leagueId: id },
    include: { homeMatches: true, awayMatches: true },
  });

  const schedule = await prisma.match.findMany({
    where: { leagueId: id, season, isPlayed: false },
    select: { homeTeamId: true, awayTeamId: true, matchday: true },
  });

  const currentStandings: Record<string, StandingLine> = {};
  const playedMatches = await prisma.match.findMany({
    where: { leagueId: id, season, isPlayed: true },
  });

  for (const m of playedMatches) {
    if (!currentStandings[m.homeTeamId]) currentStandings[m.homeTeamId] = { points: 0, gf: 0, ga: 0 };
    if (!currentStandings[m.awayTeamId]) currentStandings[m.awayTeamId] = { points: 0, gf: 0, ga: 0 };

    currentStandings[m.homeTeamId].gf += m.homeGoals || 0;
    currentStandings[m.homeTeamId].ga += m.awayGoals || 0;
    currentStandings[m.awayTeamId].gf += m.awayGoals || 0;
    currentStandings[m.awayTeamId].ga += m.homeGoals || 0;

    if ((m.homeGoals || 0) > (m.awayGoals || 0)) currentStandings[m.homeTeamId].points += 3;
    else if (m.homeGoals === m.awayGoals) {
      currentStandings[m.homeTeamId].points += 1;
      currentStandings[m.awayTeamId].points += 1;
    } else currentStandings[m.awayTeamId].points += 3;
  }

  let result: unknown;
  if (twoSeasons) {
    const [startYear, endYear] = season.split("-").map((s) => Number(s));
    const season2 = `${String(startYear + 1)}-${String(endYear + 1).padStart(2, "0")}`;

    const schedule2 = await prisma.match.findMany({
      where: { leagueId: id, season: season2, isPlayed: false },
      select: { homeTeamId: true, awayTeamId: true, matchday: true },
    });

    result = await simulateTwoSeasons(
      teams,
      schedule.map((m) => ({ homeId: m.homeTeamId, awayId: m.awayTeamId, matchday: m.matchday })),
      schedule2.map((m) => ({ homeId: m.homeTeamId, awayId: m.awayTeamId, matchday: m.matchday })),
      currentStandings,
      iterations,
    );
  } else {
    const distribution = await simulateSeason(
      teams,
      schedule.map((m) => ({ homeId: m.homeTeamId, awayId: m.awayTeamId, matchday: m.matchday })),
      currentStandings,
      iterations,
      1000,
      cacheKey,
    );
    result = { distribution };
  }

  await prisma.seasonSimulation.create({
    data: {
      leagueId: id,
      season: twoSeasons ? `${season}+next` : season,
      iterations,
      results: result as object,
    },
  });

  await setCache(cacheKey, result, 3600);
  return NextResponse.json(result);
}
