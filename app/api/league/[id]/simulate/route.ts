import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { simulateSeason, type StandingLine } from "../../../../../../lib/models/football-math";

interface SimulateBody {
  season: string;
  currentStandings?: Record<string, StandingLine>;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await context.params;
  const body = (await request.json()) as SimulateBody;

  const teams = await prisma.team.findMany({
    where: { leagueId: id },
    include: { homeMatches: true, awayMatches: true },
  });
  const schedule = await prisma.match.findMany({
    where: { leagueId: id, season: body.season, isPlayed: false },
    select: { homeTeamId: true, awayTeamId: true, matchday: true },
  });

  const standings: Record<string, StandingLine> = body.currentStandings ?? {};
  const result = simulateSeason(teams, schedule.map((m) => ({ homeId: m.homeTeamId, awayId: m.awayTeamId, matchday: m.matchday })), standings, 10000);

  const simulation = await prisma.seasonSimulation.create({
    data: {
      leagueId: id,
      season: body.season,
      iterations: 10000,
      results: result,
    },
  });

  return NextResponse.json({ simulationId: simulation.id, results: result });
}
