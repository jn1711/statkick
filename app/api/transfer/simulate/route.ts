import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { simulateTransfer } from "../../../../../lib/models/transfer-simulator";

interface TransferBody {
  playerId: string;
  fromTeamId: string;
  toTeamId: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as TransferBody;
  const [player, fromTeam, toTeam, allPlayers] = await Promise.all([
    prisma.player.findUnique({ where: { id: body.playerId } }),
    prisma.team.findUnique({ where: { id: body.fromTeamId } }),
    prisma.team.findUnique({ where: { id: body.toTeamId } }),
    prisma.player.findMany(),
  ]);

  if (!player || !fromTeam || !toTeam) {
    return NextResponse.json({ error: "Invalid transfer payload" }, { status: 400 });
  }

  return NextResponse.json(simulateTransfer(player, fromTeam, toTeam, allPlayers));
}
