import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const matches = await prisma.match.findMany({
    where: { isPlayed: false },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
    orderBy: { date: 'asc' },
    take: 50,
  });
  return NextResponse.json(matches);
}