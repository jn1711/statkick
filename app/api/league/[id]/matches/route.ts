import { NextResponse } from "next/server";
import { prisma } from "../../../../../../../lib/prisma";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await context.params;
  const matches = await prisma.match.findMany({
    where: { leagueId: id },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { date: "asc" },
    take: 12,
  });
  return NextResponse.json(matches);
}
