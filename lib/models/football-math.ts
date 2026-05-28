export interface TeamMathSnapshot {
  id: string;
  leagueId?: string | null;
  xGHome: number;
  xGAHome: number;
  xGAway: number;
  xGAAway: number;
  homeAdvantage: number;
  homeMatches: Array<{ isPlayed: boolean }>;
  awayMatches: Array<{ isPlayed: boolean }>;
}

export interface MatchMathSnapshot {
  date: Date;
  homeTeamId: string;
  awayTeamId: string;
  isPlayed: boolean;
}

export interface PoissonParams {
  lambdaHome: number;
  lambdaAway: number;
}

const FI_WEIGHT_REST = 0.08;
const FI_WEIGHT_TRAVEL = 0.03;

export interface StandingLine {
  points: number;
  gf: number;
  ga: number;
}

export function calculateLambda(
  homeTeam: TeamMathSnapshot,
  awayTeam: TeamMathSnapshot,
  fatigueHome = 0,
  fatigueAway = 0,
  tacticalHome = 0,
  tacticalAway = 0,
): PoissonParams {
  const homePlayed = homeTeam.homeMatches.filter((m) => m.isPlayed).length || 1;
  const awayPlayed = awayTeam.awayMatches.filter((m) => m.isPlayed).length || 1;

  const homeAttack = homeTeam.xGHome / homePlayed;
  const homeDefense = homeTeam.xGAHome / homePlayed;
  const awayAttack = awayTeam.xGAway / awayPlayed;
  const awayDefense = awayTeam.xGAAway / awayPlayed;

  const leagueAvgHome = 1.5;
  const leagueAvgAway = 1.2;

  const homeAttackStrength = homeAttack / leagueAvgHome;
  const awayDefenseStrength = awayDefense / leagueAvgAway;
  const awayAttackStrength = awayAttack / leagueAvgAway;
  const homeDefenseStrength = homeDefense / leagueAvgHome;

  const tacticalHomeAttackMod = 1 + tacticalHome * 0.05;
  const tacticalHomeDefenseMod = 1 - tacticalHome * 0.03;
  const tacticalAwayAttackMod = 1 + tacticalAway * 0.05;
  const tacticalAwayDefenseMod = 1 - tacticalAway * 0.03;

  const lambdaHome =
    homeAttackStrength *
    awayDefenseStrength *
    leagueAvgHome *
    (1 + homeTeam.homeAdvantage) *
    (1 - fatigueHome) *
    tacticalHomeAttackMod *
    tacticalAwayDefenseMod;
  const lambdaAway =
    awayAttackStrength *
    homeDefenseStrength *
    leagueAvgAway *
    (1 - fatigueAway) *
    tacticalAwayAttackMod *
    tacticalHomeDefenseMod;

  return {
    lambdaHome: Math.max(lambdaHome, 0.1),
    lambdaAway: Math.max(lambdaAway, 0.1),
  };
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i += 1) result *= i;
  return result;
}

function poissonProbability(k: number, lambda: number): number {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

export function poissonRandom(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k += 1;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

export function matchProbabilities(params: PoissonParams) {
  let pHome = 0;
  let pDraw = 0;
  let pAway = 0;

  for (let h = 0; h <= 10; h += 1) {
    for (let a = 0; a <= 10; a += 1) {
      const prob = poissonProbability(h, params.lambdaHome) * poissonProbability(a, params.lambdaAway);
      if (h > a) pHome += prob;
      else if (h === a) pDraw += prob;
      else pAway += prob;
    }
  }

  let maxProb = 0;
  let mostLikelyScore = "1:1";
  for (let h = 0; h <= 5; h += 1) {
    for (let a = 0; a <= 5; a += 1) {
      const prob = poissonProbability(h, params.lambdaHome) * poissonProbability(a, params.lambdaAway);
      if (prob > maxProb) {
        maxProb = prob;
        mostLikelyScore = `${h}:${a}`;
      }
    }
  }

  return {
    pHome,
    pDraw,
    pAway,
    mostLikelyScore,
    expectedHome: params.lambdaHome,
    expectedAway: params.lambdaAway,
  };
}

export function calculateFatigue(team: TeamMathSnapshot, matchDate: Date, matches: MatchMathSnapshot[]): number {
  const recentMatches = matches.filter(
    (m) =>
      m.isPlayed &&
      (m.homeTeamId === team.id || m.awayTeamId === team.id) &&
      m.date >= new Date(matchDate.getTime() - 14 * 24 * 60 * 60 * 1000),
  );

  const lastMatch = [...recentMatches].sort((a, b) => b.date.getTime() - a.date.getTime())[0];
  const daysRest = lastMatch ? (matchDate.getTime() - lastMatch.date.getTime()) / (1000 * 60 * 60 * 24) : 7;

  const restPenalty = daysRest < 4 ? Math.exp(4 - daysRest) * FI_WEIGHT_REST : 0;
  const awayMatches = recentMatches.filter((m) => m.awayTeamId === team.id).length;
  const travelPenalty = awayMatches * FI_WEIGHT_TRAVEL;
  return Math.min(restPenalty + travelPenalty, 0.3);
}

export type ScheduleGame = { homeId: string; awayId: string; matchday: number };

export function simulateSeason(
  teams: TeamMathSnapshot[],
  schedule: ScheduleGame[],
  currentStandings: Record<string, StandingLine>,
  iterations = 10000,
  chunkSize = 1000,
  redisKey?: string,
): Promise<Record<string, number>[]> {
  const results: Record<string, number[]> = {};
  teams.forEach((team) => {
    results[team.id] = new Array(teams.length).fill(0);
  });

  const totalChunks = Math.ceil(iterations / chunkSize);
  for (let chunk = 0; chunk < totalChunks; chunk += 1) {
    const effectiveChunkSize = Math.min(chunkSize, iterations - chunk * chunkSize);
    for (let iter = 0; iter < effectiveChunkSize; iter += 1) {
      const standings: Record<string, StandingLine> = JSON.parse(JSON.stringify(currentStandings)) as Record<
        string,
        StandingLine
      >;

      for (const game of schedule) {
        const home = teams.find((t) => t.id === game.homeId);
        const away = teams.find((t) => t.id === game.awayId);
        if (!home || !away) continue;

        const params = calculateLambda(home, away);
        const homeGoals = poissonRandom(params.lambdaHome);
        const awayGoals = poissonRandom(params.lambdaAway);

        if (!standings[home.id]) standings[home.id] = { points: 0, gf: 0, ga: 0 };
        if (!standings[away.id]) standings[away.id] = { points: 0, gf: 0, ga: 0 };

        standings[home.id].gf += homeGoals;
        standings[home.id].ga += awayGoals;
        standings[away.id].gf += awayGoals;
        standings[away.id].ga += homeGoals;

        if (homeGoals > awayGoals) standings[home.id].points += 3;
        else if (homeGoals === awayGoals) {
          standings[home.id].points += 1;
          standings[away.id].points += 1;
        } else standings[away.id].points += 3;
      }

      const sorted = teams
        .map((team) => ({
          id: team.id,
          points: standings[team.id]?.points ?? 0,
          gd: (standings[team.id]?.gf ?? 0) - (standings[team.id]?.ga ?? 0),
        }))
        .sort((a, b) => b.points - a.points || b.gd - a.gd);

      sorted.forEach((team, idx) => {
        results[team.id][idx] += 1;
      });
    }

    if (redisKey) {
      const { default: redis } = await import("../redis");
      await redis.setex(`${redisKey}:progress`, 300, JSON.stringify({ chunk: chunk + 1, total: totalChunks }));
    }
  }

  const distribution = teams.map((team) => {
    const distribution = results[team.id].reduce<Record<string, number>>((acc, count, idx) => {
      acc[`pos${idx + 1}`] = count / iterations;
      return acc;
    }, {});
    return { teamId: team.id, ...distribution };
  });
  return distribution;
}

export async function simulateTwoSeasons(
  teams: TeamMathSnapshot[],
  scheduleSeason1: ScheduleGame[],
  scheduleSeason2: ScheduleGame[],
  currentStandings: Record<string, StandingLine>,
  iterations = 10000,
): Promise<{
  season1: Record<string, number>[];
  season2: Record<string, number>[];
  finalStandings: Record<string, StandingLine>;
}> {
  const season1 = await simulateSeason(teams, scheduleSeason1, currentStandings, iterations);
  const season1Standings: Record<string, StandingLine> = {};

  const updatedTeams = teams.map((team) => {
    const s1 = season1Standings[team.id] || { points: 50, gf: 0, ga: 0 };
    const modifier = s1.points > 60 ? 1.05 : s1.points < 40 ? 0.95 : 1.0;
    return {
      ...team,
      xGHome: team.xGHome * modifier,
      xGAway: team.xGAway * modifier,
    };
  });

  const season2 = await simulateSeason(updatedTeams, scheduleSeason2, season1Standings, iterations);
  return { season1, season2, finalStandings: season1Standings };
}
