import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { leagues, teams, matches } from "@db/schema";
import { and, eq, desc, asc, inArray } from "drizzle-orm";
import { runMonteCarloSimulation } from "../math/montecarlo";
import { env } from "../lib/env";
import { getFallbackFootballData } from "../data/fallback-football";

type LeagueLike = {
  id: number;
  name: string;
  country: string | null;
  season: string | null;
};

type TeamLike = {
  id: number;
  name: string;
  shortName?: string | null;
  leagueId: number;
  homeXg?: unknown;
  homeXga?: unknown;
  awayXg?: unknown;
  awayXga?: unknown;
  fatigueIndex?: unknown;
  points?: number | null;
  wins?: number | null;
  draws?: number | null;
  losses?: number | null;
  goalsFor?: number | null;
  goalsAgainst?: number | null;
};

type MatchLike = {
  homeTeamId: number;
  awayTeamId: number;
  leagueId: number;
  matchDate: Date;
  homeGoals?: number | null;
  awayGoals?: number | null;
  homeXg?: unknown;
  awayXg?: unknown;
  status?: "SCHEDULED" | "LIVE" | "FINISHED" | null;
};

type TeamHistoryProfile = {
  homeAttack: number;
  awayAttack: number;
  homeDefense: number;
  awayDefense: number;
  fatigueIndex: number;
  historyMatches: number;
};

async function withFallback<T>(
  query: () => Promise<T>,
  fallback: () => Promise<T>
) {
  if (!env.databaseUrl) return fallback();
  try {
    const result = await query();
    if (Array.isArray(result) && result.length === 0) return fallback();
    return result;
  } catch {
    return fallback();
  }
}

function toNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

function seasonStart(season: string | null | undefined) {
  const match = season?.match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

function getRelevantLeagueIds(allLeagues: LeagueLike[], currentLeague: LeagueLike | undefined, leagueId: number) {
  if (!currentLeague) return [leagueId];

  const currentSeasonStart = seasonStart(currentLeague.season);
  return allLeagues
    .filter(league => {
      const sameCompetition =
        league.name === currentLeague.name &&
        (league.country ?? "") === (currentLeague.country ?? "");
      if (!sameCompetition) return false;

      const leagueSeasonStart = seasonStart(league.season);
      return !currentSeasonStart || !leagueSeasonStart || leagueSeasonStart <= currentSeasonStart;
    })
    .map(league => league.id);
}

function buildHistoryProfiles(
  currentTeams: TeamLike[],
  historyTeams: TeamLike[],
  historicalMatches: MatchLike[]
) {
  const teamById = new Map(historyTeams.map(team => [team.id, team]));
  const finishedMatches = historicalMatches
    .filter(match => match.status === "FINISHED")
    .sort((a, b) => b.matchDate.getTime() - a.matchDate.getTime());

  const leagueAverages = finishedMatches.reduce(
    (acc, match) => {
      const homeGoals = toNumber(match.homeGoals);
      const awayGoals = toNumber(match.awayGoals);
      acc.homeAttack += toNumber(match.homeXg, homeGoals);
      acc.awayAttack += toNumber(match.awayXg, awayGoals);
      acc.homeDefense += toNumber(match.awayXg, awayGoals);
      acc.awayDefense += toNumber(match.homeXg, homeGoals);
      acc.count += 1;
      return acc;
    },
    { homeAttack: 0, awayAttack: 0, homeDefense: 0, awayDefense: 0, count: 0 }
  );

  const leagueHomeAttack = leagueAverages.count ? leagueAverages.homeAttack / leagueAverages.count : 1.45;
  const leagueAwayAttack = leagueAverages.count ? leagueAverages.awayAttack / leagueAverages.count : 1.15;
  const leagueHomeDefense = leagueAverages.count ? leagueAverages.homeDefense / leagueAverages.count : 1.15;
  const leagueAwayDefense = leagueAverages.count ? leagueAverages.awayDefense / leagueAverages.count : 1.45;

  return new Map(
    currentTeams.map(team => {
      const teamName = normalizeName(team.name);
      const stats = {
        homeAttack: 0,
        awayAttack: 0,
        homeDefense: 0,
        awayDefense: 0,
        homeWeight: 0,
        awayWeight: 0,
        points: 0,
        goalDifference: 0,
        totalWeight: 0,
        matches: 0,
      };

      for (const match of finishedMatches) {
        const homeTeam = teamById.get(match.homeTeamId);
        const awayTeam = teamById.get(match.awayTeamId);
        if (!homeTeam || !awayTeam) continue;

        const isHome = normalizeName(homeTeam.name) === teamName;
        const isAway = normalizeName(awayTeam.name) === teamName;
        if (!isHome && !isAway) continue;

        const homeGoals = toNumber(match.homeGoals);
        const awayGoals = toNumber(match.awayGoals);
        const homeXg = toNumber(match.homeXg, homeGoals * 0.45 + 0.85);
        const awayXg = toNumber(match.awayXg, awayGoals * 0.45 + 0.75);
        const weight = Math.pow(0.94, stats.matches);

        if (isHome) {
          stats.homeAttack += (homeXg * 0.7 + homeGoals * 0.3) * weight;
          stats.homeDefense += (awayXg * 0.7 + awayGoals * 0.3) * weight;
          stats.homeWeight += weight;
          stats.points += (homeGoals > awayGoals ? 3 : homeGoals === awayGoals ? 1 : 0) * weight;
          stats.goalDifference += (homeGoals - awayGoals) * weight;
        } else {
          stats.awayAttack += (awayXg * 0.7 + awayGoals * 0.3) * weight;
          stats.awayDefense += (homeXg * 0.7 + homeGoals * 0.3) * weight;
          stats.awayWeight += weight;
          stats.points += (awayGoals > homeGoals ? 3 : awayGoals === homeGoals ? 1 : 0) * weight;
          stats.goalDifference += (awayGoals - homeGoals) * weight;
        }

        stats.totalWeight += weight;
        stats.matches += 1;
      }

      const historyWeight = clamp(stats.matches / 38, 0, 0.82);
      const pointsPerMatch = stats.totalWeight ? stats.points / stats.totalWeight : 1.25;
      const goalDiffPerMatch = stats.totalWeight ? stats.goalDifference / stats.totalWeight : 0;
      const formMultiplier = clamp(
        0.95 + (pointsPerMatch - 1.35) * 0.08 + goalDiffPerMatch * 0.035,
        0.86,
        1.14
      );
      const defenseMultiplier = clamp(2 - formMultiplier, 0.86, 1.14);

      const baseHomeAttack = toNumber(team.homeXg, leagueHomeAttack);
      const baseAwayAttack = toNumber(team.awayXg, leagueAwayAttack);
      const baseHomeDefense = toNumber(team.homeXga, leagueHomeDefense);
      const baseAwayDefense = toNumber(team.awayXga, leagueAwayDefense);

      const historicalHomeAttack = stats.homeWeight ? stats.homeAttack / stats.homeWeight : leagueHomeAttack;
      const historicalAwayAttack = stats.awayWeight ? stats.awayAttack / stats.awayWeight : leagueAwayAttack;
      const historicalHomeDefense = stats.homeWeight ? stats.homeDefense / stats.homeWeight : leagueHomeDefense;
      const historicalAwayDefense = stats.awayWeight ? stats.awayDefense / stats.awayWeight : leagueAwayDefense;

      const profile: TeamHistoryProfile = {
        homeAttack: clamp((baseHomeAttack * (1 - historyWeight) + historicalHomeAttack * historyWeight) * formMultiplier, 0.35, 3.4),
        awayAttack: clamp((baseAwayAttack * (1 - historyWeight) + historicalAwayAttack * historyWeight) * formMultiplier, 0.25, 3),
        homeDefense: clamp((baseHomeDefense * (1 - historyWeight) + historicalHomeDefense * historyWeight) * defenseMultiplier, 0.25, 3.2),
        awayDefense: clamp((baseAwayDefense * (1 - historyWeight) + historicalAwayDefense * historyWeight) * defenseMultiplier, 0.35, 3.5),
        fatigueIndex: clamp(toNumber(team.fatigueIndex, 0.25), 0, 0.75),
        historyMatches: stats.matches,
      };

      return [team.id, profile] as const;
    })
  );
}

export const leagueRouter = createRouter({
  list: publicQuery.query(async () => {
    return withFallback(
      async () => {
        const db = getDb();
        return db
          .select()
          .from(leagues)
          .orderBy(desc(leagues.season), asc(leagues.name));
      },
      async () => {
        const data = await getFallbackFootballData();
        return [...data.leagues].sort(
          (a, b) =>
            b.season.localeCompare(a.season) || a.name.localeCompare(b.name)
        );
      }
    );
  }),

  standings: publicQuery
    .input(z.object({ leagueId: z.number() }))
    .query(async ({ input }) => {
      const teamsData = await withFallback(
        async () => {
          const db = getDb();
          return db
            .select()
            .from(teams)
            .where(eq(teams.leagueId, input.leagueId))
            .orderBy(desc(teams.points));
        },
        async () => {
          const data = await getFallbackFootballData();
          return data.teams
            .filter(team => team.leagueId === input.leagueId)
            .sort(
              (a, b) =>
                b.points - a.points ||
                b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst)
            );
        }
      );

      return teamsData.map((team, index) => ({
        ...team,
        position: index + 1,
        goalDifference: (team.goalsFor ?? 0) - (team.goalsAgainst ?? 0),
        matchesPlayed:
          (team.wins ?? 0) + (team.draws ?? 0) + (team.losses ?? 0),
      }));
    }),

  simulate: publicQuery
    .input(z.object({ leagueId: z.number(), runId: z.number().optional() }))
    .query(async ({ input }) => {
      const { teamsData, remainingMatches, historyTeams, historicalMatches } = await withFallback(
        async () => {
          const db = getDb();
          const allLeagues = await db.select().from(leagues);
          const currentLeague = allLeagues.find(league => league.id === input.leagueId);
          const relevantLeagueIds = getRelevantLeagueIds(allLeagues, currentLeague, input.leagueId);
          const teamsData = await db
            .select()
            .from(teams)
            .where(eq(teams.leagueId, input.leagueId));
          const remainingMatches = await db
            .select()
            .from(matches)
            .where(and(eq(matches.leagueId, input.leagueId), eq(matches.status, "SCHEDULED")));
          const historyTeams = await db
            .select()
            .from(teams)
            .where(inArray(teams.leagueId, relevantLeagueIds));
          const historicalMatches = await db
            .select()
            .from(matches)
            .where(and(inArray(matches.leagueId, relevantLeagueIds), eq(matches.status, "FINISHED")));
          return { teamsData, remainingMatches, historyTeams, historicalMatches };
        },
        async () => {
          const data = await getFallbackFootballData();
          const currentLeague = data.leagues.find(league => league.id === input.leagueId);
          const relevantLeagueIds = getRelevantLeagueIds(data.leagues, currentLeague, input.leagueId);
          const relevantLeagueIdSet = new Set(relevantLeagueIds);
          return {
            teamsData: data.teams.filter(
              team => team.leagueId === input.leagueId
            ),
            remainingMatches: data.matches.filter(
              match => match.leagueId === input.leagueId && match.status === "SCHEDULED"
            ),
            historyTeams: data.teams.filter(
              team => relevantLeagueIdSet.has(team.leagueId)
            ),
            historicalMatches: data.matches.filter(
              match => relevantLeagueIdSet.has(match.leagueId) && match.status === "FINISHED"
            ),
          };
        }
      );

      const currentStandings = teamsData.map(t => ({
        teamId: t.id,
        teamName: t.name,
        points: t.points || 0,
        wins: t.wins || 0,
        draws: t.draws || 0,
        losses: t.losses || 0,
        goalsFor: t.goalsFor || 0,
        goalsAgainst: t.goalsAgainst || 0,
      }));

      const historyProfiles = buildHistoryProfiles(teamsData, historyTeams, historicalMatches);
      const matchFixtures = remainingMatches
        .filter(
          m =>
            teamsData.some(t => t.id === m.homeTeamId) &&
            teamsData.some(t => t.id === m.awayTeamId)
        )
        .map(m => {
          const homeTeam = teamsData.find(t => t.id === m.homeTeamId);
          const awayTeam = teamsData.find(t => t.id === m.awayTeamId);
          const homeProfile = homeTeam ? historyProfiles.get(homeTeam.id) : undefined;
          const awayProfile = awayTeam ? historyProfiles.get(awayTeam.id) : undefined;

          return {
            matchId: m.id,
            homeTeamId: m.homeTeamId,
            awayTeamId: m.awayTeamId,
            homeXg: homeProfile?.homeAttack ?? toNumber(homeTeam?.homeXg, 1.35),
            awayXg: awayProfile?.awayAttack ?? toNumber(awayTeam?.awayXg, 1.05),
            homeXga: homeProfile?.homeDefense ?? toNumber(homeTeam?.homeXga, 1.1),
            awayXga: awayProfile?.awayDefense ?? toNumber(awayTeam?.awayXga, 1.35),
            homeFatigue: homeProfile?.fatigueIndex ?? toNumber(homeTeam?.fatigueIndex),
            awayFatigue: awayProfile?.fatigueIndex ?? toNumber(awayTeam?.fatigueIndex),
          };
        });

      const simulation = runMonteCarloSimulation(
        currentStandings,
        matchFixtures,
        10000
      );
      const teamsById = new Map(teamsData.map(team => [team.id, team]));

      return {
        currentStandings: simulation.standings.flatMap((standing, index) => {
          const team = teamsById.get(standing.teamId);
          if (!team) return [];

          return [
            {
              ...team,
              position: index + 1,
              points: standing.points,
              wins: standing.wins,
              draws: standing.draws,
              losses: standing.losses,
              goalsFor: standing.goalsFor,
              goalsAgainst: standing.goalsAgainst,
              goalDifference: standing.goalsFor - standing.goalsAgainst,
              historyMatches: historyProfiles.get(team.id)?.historyMatches ?? 0,
              championProbability:
                simulation.championProbabilities[team.id] || 0,
              top4Probability: simulation.top4Probabilities[team.id] || 0,
              relegationProbability:
                simulation.relegationProbabilities[team.id] || 0,
            },
          ];
        }),
        championProbabilities: simulation.championProbabilities,
        top4Probabilities: simulation.top4Probabilities,
        relegationProbabilities: simulation.relegationProbabilities,
        matchResults: simulation.matchResults,
        simulatedMatches: matchFixtures.length,
        historicalMatches: historicalMatches.length,
        runId: input.runId ?? 0,
      };
    }),

  trends: publicQuery.query(async () => {
    const allMatches = await withFallback(
      async () => {
        const db = getDb();
        return db.select().from(matches).where(eq(matches.status, "FINISHED"));
      },
      async () => {
        const data = await getFallbackFootballData();
        return data.matches.filter(match => match.status === "FINISHED");
      }
    );

    const totalMatches = allMatches.length;
    const homeWins = allMatches.filter(
      m => (m.homeGoals || 0) > (m.awayGoals || 0)
    ).length;
    const draws = allMatches.filter(
      m => (m.homeGoals || 0) === (m.awayGoals || 0)
    ).length;
    const cleanSheets = allMatches.filter(
      m => (m.awayGoals || 0) === 0 || (m.homeGoals || 0) === 0
    ).length;
    const totalGoals = allMatches.reduce(
      (sum, m) => sum + (m.homeGoals || 0) + (m.awayGoals || 0),
      0
    );

    return {
      totalMatches,
      homeWinPercentage:
        totalMatches > 0 ? Math.round((homeWins / totalMatches) * 100) : 0,
      drawPercentage:
        totalMatches > 0 ? Math.round((draws / totalMatches) * 100) : 0,
      cleanSheetPercentage:
        totalMatches > 0 ? Math.round((cleanSheets / totalMatches) * 100) : 0,
      avgGoalsPerMatch:
        totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : "0",
      totalGoals,
    };
  }),
});
