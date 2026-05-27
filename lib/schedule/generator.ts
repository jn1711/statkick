export interface ScheduleTeam {
  id: string;
  leagueId?: string | null;
}

export interface GeneratedMatch {
  id: string;
  date: Date;
  leagueId: string;
  homeTeamId: string;
  awayTeamId: string;
  season: string;
  matchday: number;
  isPlayed: boolean;
  isSimulated: boolean;
}

function isClubOffseason(date: Date): boolean {
  const month = date.getMonth();
  return month === 5 || month === 6;
}

function nextAllowedClubDate(seed: Date): Date {
  const out = new Date(seed);
  while (isClubOffseason(out)) {
    out.setDate(out.getDate() + 7);
  }
  return out;
}

export function generateLeagueSchedule(teams: ScheduleTeam[], season: string, startDate: Date): GeneratedMatch[] {
  const matches: GeneratedMatch[] = [];
  const teamIds = teams.map((t) => t.id);
  if (teamIds.length % 2 !== 0) teamIds.push("BYE");
  const rounds = teamIds.length - 1;
  const matchesPerRound = teamIds.length / 2;
  let rotating = [...teamIds];

  for (let round = 0; round < rounds * 2; round += 1) {
    for (let i = 0; i < matchesPerRound; i += 1) {
      const homeIdx = i;
      const awayIdx = rotating.length - 1 - i;
      if (rotating[homeIdx] === "BYE" || rotating[awayIdx] === "BYE") continue;

      const isFirstHalf = round < rounds;
      const homeTeamId = isFirstHalf ? rotating[homeIdx] : rotating[awayIdx];
      const awayTeamId = isFirstHalf ? rotating[awayIdx] : rotating[homeIdx];

      const date = nextAllowedClubDate(new Date(startDate.getTime() + round * 7 * 24 * 60 * 60 * 1000));
      matches.push({
        id: crypto.randomUUID(),
        date,
        leagueId: teams[0]?.leagueId ?? "unknown-league",
        homeTeamId,
        awayTeamId,
        season,
        matchday: round + 1,
        isPlayed: false,
        isSimulated: true,
      });
    }

    const first = rotating[0];
    const last = rotating[rotating.length - 1];
    rotating = [first, last, ...rotating.slice(1, -1)];
  }

  return matches;
}

export function generateChampionsLeagueSchedule(teams: ScheduleTeam[], season: string): GeneratedMatch[] {
  const matches: GeneratedMatch[] = [];
  const shuffled = [...teams].sort(() => Math.random() - 0.5);

  for (let i = 0; i < teams.length; i += 1) {
    const opponents = shuffled.filter((t) => t.id !== teams[i].id).slice(0, 8);
    opponents.forEach((opp, idx) => {
      const isHome = idx < 4;
      matches.push({
        id: crypto.randomUUID(),
        date: new Date(2025, 8, 17 + idx * 14),
        leagueId: teams[i].leagueId ?? "champions-league",
        homeTeamId: isHome ? teams[i].id : opp.id,
        awayTeamId: isHome ? opp.id : teams[i].id,
        season,
        matchday: idx + 1,
        isPlayed: false,
        isSimulated: true,
      });
    });
  }

  return matches;
}

export function generateWorldCupSchedule(
  teams: ScheduleTeam[],
  season: string,
): { groups: ScheduleTeam[][]; knockouts: GeneratedMatch[] } {
  const groups: ScheduleTeam[][] = [];
  for (let g = 0; g < 12; g += 1) {
    groups.push(teams.slice(g * 4, g * 4 + 4));
  }

  const knockouts: GeneratedMatch[] = [];
  groups.forEach((group, groupIdx) => {
    for (let i = 0; i < group.length; i += 1) {
      for (let j = i + 1; j < group.length; j += 1) {
        knockouts.push({
          id: crypto.randomUUID(),
          date: new Date(2026, 5, 11 + groupIdx * 3),
          leagueId: "world-cup-2026",
          homeTeamId: group[i].id,
          awayTeamId: group[j].id,
          season,
          matchday: 1,
          isPlayed: false,
          isSimulated: true,
        });
      }
    }
  });

  return { groups, knockouts };
}
