import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import {
  generateChampionsLeagueSchedule,
  generateLeagueSchedule,
  generateWorldCupSchedule,
  type ScheduleTeam,
} from "../../../../../lib/schedule/generator";

interface Body {
  leagueId: string;
  season: string;
  teams: ScheduleTeam[];
  type: "league" | "ucl" | "worldcup";
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as Body;
  let generated;
  if (body.type === "league") {
    generated = generateLeagueSchedule(body.teams, body.season, new Date());
  } else if (body.type === "ucl") {
    generated = generateChampionsLeagueSchedule(body.teams, body.season);
  } else {
    generated = generateWorldCupSchedule(body.teams, body.season).knockouts;
  }

  await prisma.match.createMany({
    data: generated.map((m) => ({
      date: m.date,
      leagueId: body.leagueId,
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      season: m.season,
      matchday: m.matchday,
      isPlayed: m.isPlayed,
      isSimulated: true,
    })),
  });

  return NextResponse.json({ count: generated.length });
}
