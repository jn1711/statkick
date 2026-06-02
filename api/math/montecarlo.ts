import { calculateLambda } from "./poisson";

interface TeamStanding {
  teamId: number;
  teamName: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

interface MatchFixture {
  matchId?: number;
  homeTeamId: number;
  awayTeamId: number;
  homeXg: number;
  awayXg: number;
  homeXga: number;
  awayXga: number;
  homeFatigue?: number;
  awayFatigue?: number;
}

interface SimulatedMatchResult {
  matchId?: number;
  homeTeamId: number;
  awayTeamId: number;
  homeGoals: number;
  awayGoals: number;
  homeXg: number;
  awayXg: number;
}

interface MonteCarloResult {
  standings: TeamStanding[];
  matchResults: SimulatedMatchResult[];
  championProbabilities: Record<number, number>;
  top4Probabilities: Record<number, number>;
  relegationProbabilities: Record<number, number>;
}

function samplePoisson(lambda: number): number {
  const safeLambda = Math.max(0.05, lambda);
  const limit = Math.exp(-safeLambda);
  let product = 1;
  let goals = 0;

  do {
    goals++;
    product *= Math.random();
  } while (product > limit);

  return goals - 1;
}

function sortStandings(standings: TeamStanding[]) {
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;

    const aGD = a.goalsFor - a.goalsAgainst;
    const bGD = b.goalsFor - b.goalsAgainst;
    if (bGD !== aGD) return bGD - aGD;

    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

    return a.teamName.localeCompare(b.teamName);
  });

  return standings;
}

export function runMonteCarloSimulation(
  currentStandings: TeamStanding[],
  remainingMatches: MatchFixture[],
  iterations: number = 10000
): MonteCarloResult {
  const championCount: Record<number, number> = {};
  const top4Count: Record<number, number> = {};
  const relegationCount: Record<number, number> = {};
  const safeIterations = Math.max(1, Math.floor(iterations));
  const sampledIteration = Math.floor(Math.random() * safeIterations);
  let sampledStandings = sortStandings(currentStandings.map(s => ({ ...s })));
  let sampledMatchResults: SimulatedMatchResult[] = [];

  // Initialize counters
  for (const team of currentStandings) {
    championCount[team.teamId] = 0;
    top4Count[team.teamId] = 0;
    relegationCount[team.teamId] = 0;
  }

  // Run simulations
  for (let i = 0; i < safeIterations; i++) {
    const standings = currentStandings.map(s => ({ ...s }));
    const matchResults: SimulatedMatchResult[] = [];

    for (const match of remainingMatches) {
      const homeLambda = calculateLambda(
        match.homeXg,
        match.awayXga,
        true,
        match.homeFatigue ?? 0
      );
      const awayLambda = calculateLambda(
        match.awayXg,
        match.homeXga,
        false,
        match.awayFatigue ?? 0
      );
      const homeGoals = samplePoisson(homeLambda);
      const awayGoals = samplePoisson(awayLambda);
      matchResults.push({
        matchId: match.matchId,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        homeGoals,
        awayGoals,
        homeXg: Number(homeLambda.toFixed(2)),
        awayXg: Number(awayLambda.toFixed(2)),
      });

      // Update standings
      const homeTeam = standings.find(s => s.teamId === match.homeTeamId);
      const awayTeam = standings.find(s => s.teamId === match.awayTeamId);

      if (homeTeam && awayTeam) {
        homeTeam.goalsFor += homeGoals;
        homeTeam.goalsAgainst += awayGoals;
        awayTeam.goalsFor += awayGoals;
        awayTeam.goalsAgainst += homeGoals;

        if (homeGoals > awayGoals) {
          homeTeam.points += 3;
          homeTeam.wins += 1;
          awayTeam.losses += 1;
        } else if (homeGoals === awayGoals) {
          homeTeam.points += 1;
          awayTeam.points += 1;
          homeTeam.draws += 1;
          awayTeam.draws += 1;
        } else {
          awayTeam.points += 3;
          awayTeam.wins += 1;
          homeTeam.losses += 1;
        }
      }
    }

    sortStandings(standings);

    if (i === sampledIteration) {
      sampledStandings = standings.map(s => ({ ...s }));
      sampledMatchResults = matchResults;
    }

    // Record outcomes
    championCount[standings[0].teamId]++;
    for (let j = 0; j < Math.min(4, standings.length); j++) {
      top4Count[standings[j].teamId]++;
    }
    for (let j = Math.max(0, standings.length - 3); j < standings.length; j++) {
      relegationCount[standings[j].teamId]++;
    }
  }

  // Calculate probabilities
  const result: MonteCarloResult = {
    standings: sampledStandings,
    matchResults: sampledMatchResults,
    championProbabilities: {},
    top4Probabilities: {},
    relegationProbabilities: {},
  };

  for (const team of currentStandings) {
    result.championProbabilities[team.teamId] = Math.round(
      (championCount[team.teamId] / safeIterations) * 100
    );
    result.top4Probabilities[team.teamId] = Math.round(
      (top4Count[team.teamId] / safeIterations) * 100
    );
    result.relegationProbabilities[team.teamId] = Math.round(
      (relegationCount[team.teamId] / safeIterations) * 100
    );
  }

  return result;
}
