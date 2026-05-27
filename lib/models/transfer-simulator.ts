export interface PlayerTransferSnapshot {
  id: string;
  teamId: string;
  position: string;
  xG90: number;
  minutes: number;
  age: number;
}

export interface TeamTransferSnapshot {
  id: string;
  xGAAway: number;
}

export function simulateTransfer(
  player: PlayerTransferSnapshot,
  fromTeam: TeamTransferSnapshot,
  toTeam: TeamTransferSnapshot,
  allPlayers: PlayerTransferSnapshot[],
): { newTeamXg: number; newTeamXga: number; impact: string } {
  const fromTeamPlayers = allPlayers.filter((p) => p.teamId === fromTeam.id && p.id !== player.id);
  const oldFromXg = fromTeamPlayers.reduce((sum, p) => sum + p.xG90 * (p.minutes / 90), 0);
  void oldFromXg;

  const adaptationFactor = Math.max(0.6, 1 - (player.age - 23) * 0.02);
  const chemistryPenalty = 0.9;
  const newXgContribution = player.xG90 * adaptationFactor * chemistryPenalty * (player.minutes / 90);

  const toTeamPlayers = allPlayers.filter((p) => p.teamId === toTeam.id);
  const newTeamXg = toTeamPlayers.reduce((sum, p) => sum + p.xG90 * (p.minutes / 90), 0) + newXgContribution;

  let defensiveImpact = 0;
  if (player.position === "DF" || player.position === "GK") {
    defensiveImpact = player.xG90 * 0.5;
  }
  const newTeamXga = toTeam.xGAAway * 0.8 + defensiveImpact;

  return {
    newTeamXg,
    newTeamXga,
    impact: newXgContribution > player.xG90 * 0.8 ? "positive" : "neutral",
  };
}
