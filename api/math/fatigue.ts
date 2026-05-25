// Calculate Fatigue Index (FI)
// FI = w1 * D + w2 * T
// D = penalty for short rest periods (< 4 days)
// T = total flight distance in thousands of km over last 14 days
// w1, w2 = calibrated weights

const W1 = 0.6; // Weight for rest penalty
const W2 = 0.4; // Weight for travel penalty

export function calculateRestPenalty(daysSinceLastMatch: number): number {
  if (daysSinceLastMatch >= 7) return 0;
  if (daysSinceLastMatch >= 4) return 0.1 * (4 - daysSinceLastMatch) / 4;
  // Exponential penalty for < 4 days
  return 0.1 + 0.9 * Math.exp(-0.5 * daysSinceLastMatch);
}

export function calculateFatigueIndex(
  daysSinceLastMatch: number,
  flightDistanceKm: number
): number {
  const D = calculateRestPenalty(daysSinceLastMatch);
  const T = flightDistanceKm / 1000; // Convert to thousands of km
  
  const fi = W1 * D + W2 * T;
  return Math.min(1, Math.max(0, fi));
}

export function getFatigueDescription(fi: number): string {
  if (fi < 0.2) return "Отличная форма";
  if (fi < 0.35) return "Хорошая форма";
  if (fi < 0.5) return "Средняя усталость";
  if (fi < 0.7) return "Высокая усталость";
  return "Критическая усталость";
}

export function getFatigueColor(fi: number): string {
  if (fi < 0.2) return "#00E701";
  if (fi < 0.35) return "#10B981";
  if (fi < 0.5) return "#3B82F6";
  if (fi < 0.7) return "#F59E0B";
  return "#EF4444";
}
