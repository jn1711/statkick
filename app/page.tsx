import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getLeagues() {
  return prisma.league.findMany({
    orderBy: [{ tier: 'asc' }, { name: 'asc' }],
  });
}

async function getUpcomingMatches() {
  return prisma.match.findMany({
    where: { isPlayed: false },
    include: { homeTeam: true, awayTeam: true, league: true },
    orderBy: { date: 'asc' },
    take: 5,
  });
}

export default async function HomePage() {
  const [leagues, upcomingMatches] = await Promise.all([
    getLeagues(),
    getUpcomingMatches(),
  ]);

  return (
    <main className="min-h-screen bg-[#0B0F19] text-[#F9FAFB]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0B0F19] via-[#1F2937] to-[#0B0F19] py-16 px-6">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#10B981_0%,transparent_50%)]" />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#10B981] via-[#3B82F6] to-[#10B981] bg-clip-text text-transparent">
            StatKick
          </h1>
          <p className="text-xl text-[#9CA3AF] max-w-2xl mx-auto">
            AI-powered football analytics. Predictions, simulations, and tactical insights.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/transfer" className="px-6 py-3 rounded-lg bg-[#10B981] text-white font-medium hover:bg-[#059669] transition-all hover:scale-105">
              Transfer Simulator
            </Link>
            <Link href="/tournaments" className="px-6 py-3 rounded-lg bg-[#3B82F6] text-white font-medium hover:bg-[#2563EB] transition-all hover:scale-105">
              Tournaments
            </Link>
          </div>
        </div>
      </div>

      {/* Leagues Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6 text-[#F9FAFB]">Top Leagues</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagues.map((league) => (
            <Link
              key={league.id}
              href={`/league/${league.id}`}
              className="group relative p-6 rounded-xl bg-gradient-to-br from-[#1F2937] to-[#111827] border border-[#374151] hover:border-[#10B981] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#10B981]/10"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#10B981]/10 to-transparent rounded-bl-full" />
              <h3 className="text-xl font-bold text-[#10B981] group-hover:text-[#34D399] transition-colors">
                {league.name}
              </h3>
              <p className="text-[#9CA3AF] mt-2">
                {league.country} • {league.season}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="px-3 py-1 text-xs rounded-full bg-[#3B82F6]/20 text-[#3B82F6]">
                  {league.isCup ? 'Cup' : league.isInternational ? 'International' : 'League'}
                </span>
                <span className="text-[#9CA3AF] text-sm group-hover:text-[#F9FAFB] transition-colors">
                  View →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming Matches */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <h2 className="text-2xl font-bold mb-6 text-[#F9FAFB]">Upcoming Matches</h2>
        <div className="space-y-4">
          {upcomingMatches.map((match) => (
            <Link
              key={match.id}
              href={`/match/${match.id}`}
              className="flex items-center justify-between p-4 rounded-lg bg-[#1F2937] hover:bg-[#374151] transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">
                <div className="text-sm text-[#9CA3AF]">
                  {match.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{match.homeTeam.name}</span>
                  <span className="text-[#9CA3AF]">vs</span>
                  <span className="font-semibold">{match.awayTeam.name}</span>
                </div>
              </div>
              <div className="text-sm text-[#3B82F6]">
                {match.league.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}