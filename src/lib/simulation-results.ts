const STORAGE_KEY = "statkick:simulated-match-results";

export type StoredSimulatedMatch = {
  matchId: number;
  leagueId: number;
  homeGoals: number;
  awayGoals: number;
  homeXg?: number;
  awayXg?: number;
  runId: number;
  savedAt: string;
};

type StoredSimulationState = Record<string, StoredSimulatedMatch>;

function readState(): StoredSimulationState {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSimulationState) : {};
  } catch {
    return {};
  }
}

function writeState(state: StoredSimulationState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("statkick:simulation-results"));
}

export function getStoredSimulatedMatches() {
  return readState();
}

export function getStoredSimulatedMatch(matchId: number) {
  return readState()[String(matchId)];
}

export function saveSimulatedMatches(
  leagueId: number,
  runId: number,
  matches: Array<{
    matchId?: number;
    homeGoals: number;
    awayGoals: number;
    homeXg?: number;
    awayXg?: number;
  }>
) {
  const state = readState();
  const savedAt = new Date().toISOString();

  for (const match of matches) {
    if (!match.matchId) continue;
    state[String(match.matchId)] = {
      matchId: match.matchId,
      leagueId,
      homeGoals: match.homeGoals,
      awayGoals: match.awayGoals,
      homeXg: match.homeXg,
      awayXg: match.awayXg,
      runId,
      savedAt,
    };
  }

  writeState(state);
}

