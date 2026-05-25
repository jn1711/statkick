// Factorial function
function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Poisson probability: P(k) = (lambda^k * e^(-lambda)) / k!
export function poissonProbability(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

// Calculate lambda for a team considering home/away advantage
export function calculateLambda(
  attackXg: number,
  defenseXga: number,
  isHome: boolean,
  fatigueIndex: number = 0,
  tacticalFactor: number = 0
): number {
  const homeAdvantage = isHome ? 0.25 : 0;
  const fatiguePenalty = fatigueIndex * 0.3;
  const tacticalBonus = tacticalFactor * 0.2;
  
  const baseLambda = (attackXg + defenseXga) / 2 + homeAdvantage;
  const adjustedLambda = baseLambda * (1 - fatiguePenalty) * (1 + tacticalBonus);
  
  return Math.max(0.1, adjustedLambda);
}

// Calculate exact score probabilities
export function calculateScoreProbabilities(
  homeLambda: number,
  awayLambda: number,
  maxGoals: number = 6
): Array<{ homeGoals: number; awayGoals: number; probability: number }> {
  const probabilities: Array<{ homeGoals: number; awayGoals: number; probability: number }> = [];
  
  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const probability = poissonProbability(homeLambda, h) * poissonProbability(awayLambda, a);
      probabilities.push({ homeGoals: h, awayGoals: a, probability });
    }
  }
  
  return probabilities.sort((a, b) => b.probability - a.probability);
}

// Calculate match outcome probabilities
export function calculateOutcomeProbabilities(
  homeLambda: number,
  awayLambda: number
): { homeWin: number; draw: number; awayWin: number } {
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  
  for (let h = 0; h <= 10; h++) {
    for (let a = 0; a <= 10; a++) {
      const prob = poissonProbability(homeLambda, h) * poissonProbability(awayLambda, a);
      if (h > a) homeWin += prob;
      else if (h === a) draw += prob;
      else awayWin += prob;
    }
  }
  
  return {
    homeWin: Math.round(homeWin * 100),
    draw: Math.round(draw * 100),
    awayWin: Math.round(awayWin * 100),
  };
}

// Most likely score
export function getMostLikelyScore(
  homeLambda: number,
  awayLambda: number
): { homeGoals: number; awayGoals: number; probability: number } {
  const scores = calculateScoreProbabilities(homeLambda, awayLambda);
  return scores[0];
}
