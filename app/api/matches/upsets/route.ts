import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateLambda, matchProbabilities } from '@/lib/models/football-math';

export async function GET() {
  const upcomingMatches = await prisma.match.findMany({
    where: { isPlayed: false },
    include: {
      homeTeam: {
        include: {
          homeMatches: { where: { isPlayed: true }, select: { isPlayed: true } },
          awayMatches: { where: { isPlayed: true }, select: { isPlayed: true } },
        },
      },
      awayTeam: {
        include: {
          homeMatches: { where: { isPlayed: true }, select: { isPlayed: true } },
          awayMatches: { where: { isPlayed: true }, select: { isPlayed: true } },
        },
      },
    },
    take: 20,
  });

  const upsets = [];
  for (const match of upcomingMatches) {
    const params = calculateLambda(match.homeTeam, match.awayTeam);
    const probs = matchProbabilities(params);
    
    const underdogProb = Math.min(probs.pHome, probs.pAway);
    const favoriteProb = Math.max(probs.pHome, probs.pAway);
    
    if (underdogProb > favoriteProb * 0.15 && underdogProb > 0.2) {
      upsets.push({
        ...match,
        underdogProbability: underdogProb,
        favoriteProbability: favoriteProb,
      });
    }
  }

  return NextResponse.json(upsets.slice(0, 3));
}