import { calculateOutcomeProbabilities } from "./poisson";

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

interface MonteCarloResult {
  standings: TeamStanding[];
  championProbabilities: Record<number, number>;
  top4Probabilities: Record<number, number>;
  relegationProbabilities: Record<number, number>;
}

export function runMonteCarloSimulation(
  currentStandings: TeamStanding[],
  remainingMatches: Array<{
    homeTeamId: number;
    awayTeamId: number;
    homeXg: number;
    awayXg: number;
    homeXga: number;
    awayXga: number;
  }>,
  iterations: number = 10000
): MonteCarloResult {
  const championCount: Record<number, number> = {};
  const top4Count: Record<number, number> = {};
  const relegationCount: Record<number, number> = {};
  
  // Initialize counters
  for (const team of currentStandings) {
    championCount[team.teamId] = 0;
    top4Count[team.teamId] = 0;
    relegationCount[team.teamId] = 0;
  }
  
  // Run simulations
  for (let i = 0; i < iterations; i++) {
    const standings = currentStandings.map(s => ({ ...s }));
    
    for (const match of remainingMatches) {
      const homeLambda = (match.homeXg + match.awayXga) / 2 + 0.25;
      const awayLambda = (match.awayXg + match.homeXga) / 2;
      
      const probs = calculateOutcomeProbabilities(homeLambda, awayLambda);
      const rand = Math.random() * 100;
      
      let homeGoals = 0;
      let awayGoals = 0;
      
      // Determine result based on probabilities
      if (rand < probs.homeWin) {
        // Home win - generate likely score
        homeGoals = Math.floor(Math.random() * 3) + 1;
        awayGoals = Math.floor(Math.random() * homeGoals);
      } else if (rand < probs.homeWin + probs.draw) {
        // Draw
        homeGoals = Math.floor(Math.random() * 3);
        awayGoals = homeGoals;
      } else {
        // Away win
        awayGoals = Math.floor(Math.random() * 3) + 1;
        homeGoals = Math.floor(Math.random() * awayGoals);
      }
      
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
    
    // Sort by points, then goal difference
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const aGD = a.goalsFor - a.goalsAgainst;
      const bGD = b.goalsFor - b.goalsAgainst;
      return bGD - aGD;
    });
    
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
    standings: currentStandings,
    championProbabilities: {},
    top4Probabilities: {},
    relegationProbabilities: {},
  };
  
  for (const team of currentStandings) {
    result.championProbabilities[team.teamId] = Math.round((championCount[team.teamId] / iterations) * 100);
    result.top4Probabilities[team.teamId] = Math.round((top4Count[team.teamId] / iterations) * 100);
    result.relegationProbabilities[team.teamId] = Math.round((relegationCount[team.teamId] / iterations) * 100);
  }
  
  return result;
}
