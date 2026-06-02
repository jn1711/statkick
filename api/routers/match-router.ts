import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { matches, teams, matchEvents } from "@db/schema";
import { eq, and, gte, lte, desc, asc, inArray } from "drizzle-orm";
import { calculateOutcomeProbabilities, calculateLambda, getMostLikelyScore } from "../math/poisson";
import { calculateFatigueIndex, getFatigueDescription, getFatigueColor } from "../math/fatigue";
import { env } from "../lib/env";
import { getFallbackFootballData } from "../data/fallback-football";

async function withFallback<T>(query: () => Promise<T>, fallback: () => Promise<T>) {
  if (!env.databaseUrl) return fallback();
  try {
    const result = await query();
    if (Array.isArray(result) && result.length === 0) return fallback();
    return result;
  } catch {
    return fallback();
  }
}

type TeamLike = {
  id: number;
  name: string;
  homeXg?: unknown;
  homeXga?: unknown;
  awayXg?: unknown;
  awayXga?: unknown;
  fatigueIndex?: unknown;
};

type MatchLike = {
  id?: number;
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

function toNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

function getRecentTeamForm(
  team: TeamLike,
  allTeams: TeamLike[],
  allMatches: MatchLike[],
  beforeDate: Date,
  limit = 5
) {
  const teamsById = new Map(allTeams.map(item => [item.id, item]));
  const teamName = normalizeName(team.name);

  return allMatches
    .filter(match => {
      if (match.status !== "FINISHED" || match.matchDate >= beforeDate) return false;
      const homeTeam = teamsById.get(match.homeTeamId);
      const awayTeam = teamsById.get(match.awayTeamId);
      return normalizeName(homeTeam?.name ?? "") === teamName || normalizeName(awayTeam?.name ?? "") === teamName;
    })
    .sort((a, b) => b.matchDate.getTime() - a.matchDate.getTime())
    .slice(0, limit)
    .map((match, index) => {
      const homeTeam = teamsById.get(match.homeTeamId);
      const isHome = normalizeName(homeTeam?.name ?? "") === teamName;
      const goalsFor = isHome ? toNumber(match.homeGoals) : toNumber(match.awayGoals);
      const goalsAgainst = isHome ? toNumber(match.awayGoals) : toNumber(match.homeGoals);
      const xg = isHome
        ? toNumber(match.homeXg, goalsFor * 0.45 + 0.85)
        : toNumber(match.awayXg, goalsFor * 0.45 + 0.75);
      const xga = isHome
        ? toNumber(match.awayXg, goalsAgainst * 0.45 + 0.75)
        : toNumber(match.homeXg, goalsAgainst * 0.45 + 0.85);

      return {
        match: `М${limit - index}`,
        xG: Number(xg.toFixed(2)),
        xGA: Number(xga.toFixed(2)),
        score: `${goalsFor}:${goalsAgainst}`,
        result: goalsFor > goalsAgainst ? "W" : goalsFor === goalsAgainst ? "D" : "L",
      };
    })
    .reverse();
}

function getRestDays(team: TeamLike, allTeams: TeamLike[], allMatches: MatchLike[], matchDate: Date) {
  const teamsById = new Map(allTeams.map(item => [item.id, item]));
  const teamName = normalizeName(team.name);
  const lastMatch = allMatches
    .filter(match => {
      if (match.status !== "FINISHED" || match.matchDate >= matchDate) return false;
      const homeTeam = teamsById.get(match.homeTeamId);
      const awayTeam = teamsById.get(match.awayTeamId);
      return normalizeName(homeTeam?.name ?? "") === teamName || normalizeName(awayTeam?.name ?? "") === teamName;
    })
    .sort((a, b) => b.matchDate.getTime() - a.matchDate.getTime())[0];

  if (!lastMatch) return 7;
  const days = Math.round((matchDate.getTime() - lastMatch.matchDate.getTime()) / 86_400_000);
  return Math.max(2, Math.min(14, days));
}

function getTravelKm(homeTeamId: number, awayTeamId: number) {
  return 150 + Math.abs(homeTeamId - awayTeamId) % 7 * 180;
}

export const matchRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        leagueId: z.number().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        status: z.enum(["SCHEDULED", "LIVE", "FINISHED"]).optional(),
        leagueIds: z.array(z.number()).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const { results, teamsData } = await withFallback(
        async () => {
          const db = getDb();
          const conditions = [];
          if (input?.leagueId) conditions.push(eq(matches.leagueId, input.leagueId));
          if (input?.leagueIds?.length) conditions.push(inArray(matches.leagueId, input.leagueIds));
          if (input?.status) conditions.push(eq(matches.status, input.status));
          if (input?.dateFrom) conditions.push(gte(matches.matchDate, input.dateFrom));
          if (input?.dateTo) conditions.push(lte(matches.matchDate, input.dateTo));
          const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
          const results = await db
            .select({
              id: matches.id,
              homeTeamId: matches.homeTeamId,
              awayTeamId: matches.awayTeamId,
              leagueId: matches.leagueId,
              matchDate: matches.matchDate,
              homeGoals: matches.homeGoals,
              awayGoals: matches.awayGoals,
              homeXg: matches.homeXg,
              awayXg: matches.awayXg,
              status: matches.status,
              oddsHome: matches.oddsHome,
              oddsDraw: matches.oddsDraw,
              oddsAway: matches.oddsAway,
              dataSource: matches.dataSource,
            })
            .from(matches)
            .where(whereClause)
            .orderBy(input?.status === "SCHEDULED" ? asc(matches.matchDate) : desc(matches.matchDate))
            .limit(50);
          const teamIds = [...new Set(results.flatMap((m) => [m.homeTeamId, m.awayTeamId]))];
          const teamsData = await db
            .select({ id: teams.id, name: teams.name, shortName: teams.shortName, color: teams.color, logoUrl: teams.logoUrl })
            .from(teams)
            .where(inArray(teams.id, teamIds));
          return { results, teamsData };
        },
        async () => {
          const data = await getFallbackFootballData();
          let results = data.matches.filter((match) => {
            if (input?.leagueId && match.leagueId !== input.leagueId) return false;
            if (input?.leagueIds?.length && !input.leagueIds.includes(match.leagueId)) return false;
            if (input?.status && match.status !== input.status) return false;
            if (input?.dateFrom && match.matchDate < input.dateFrom) return false;
            if (input?.dateTo && match.matchDate > input.dateTo) return false;
            return true;
          });
          results = results
            .sort((a, b) =>
              input?.status === "SCHEDULED"
                ? a.matchDate.getTime() - b.matchDate.getTime()
                : b.matchDate.getTime() - a.matchDate.getTime()
            )
            .slice(0, 50);
          const teamIds = new Set(results.flatMap((match) => [match.homeTeamId, match.awayTeamId]));
          return {
            results,
            teamsData: data.teams.filter((team) => teamIds.has(team.id)),
          };
        }
      );
      
      const teamMap = new Map(teamsData.map(t => [t.id, t]));
      
      return results.map(match => ({
        ...match,
        homeTeam: teamMap.get(match.homeTeamId) || { name: "Unknown", shortName: "UNK", color: "#3B82F6", logoUrl: null },
        awayTeam: teamMap.get(match.awayTeamId) || { name: "Unknown", shortName: "UNK", color: "#3B82F6", logoUrl: null },
      }));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      if (!env.databaseUrl) {
        const data = await getFallbackFootballData();
        const match = data.matches.find((item) => item.id === input.id);
        if (!match) return null;
        return {
          ...match,
          homeTeam: data.teams.find((team) => team.id === match.homeTeamId) || null,
          awayTeam: data.teams.find((team) => team.id === match.awayTeamId) || null,
          h2hHistory: data.matches
            .filter(
              (item) =>
                item.status === "FINISHED" &&
                ((item.homeTeamId === match.homeTeamId && item.awayTeamId === match.awayTeamId) ||
                  (item.homeTeamId === match.awayTeamId && item.awayTeamId === match.homeTeamId))
            )
            .sort((a, b) => b.matchDate.getTime() - a.matchDate.getTime())
            .slice(0, 5),
          events: [],
        };
      }

      const db = getDb();
      
      const match = await db
        .select()
        .from(matches)
        .where(eq(matches.id, input.id))
        .limit(1);
      
      if (!match[0]) return null;
      
      const [homeTeam, awayTeam] = await Promise.all([
        db.select().from(teams).where(eq(teams.id, match[0].homeTeamId)).limit(1),
        db.select().from(teams).where(eq(teams.id, match[0].awayTeamId)).limit(1),
      ]);
      
      // H2H history
      const h2hMatches = await db
        .select()
        .from(matches)
            .where(
              and(
                eq(matches.status, "FINISHED"),
                inArray(matches.homeTeamId, [match[0].homeTeamId, match[0].awayTeamId]),
                inArray(matches.awayTeamId, [match[0].homeTeamId, match[0].awayTeamId])
              )
            )
        .orderBy(desc(matches.matchDate))
        .limit(5);
      
      const events = await db
        .select()
        .from(matchEvents)
        .where(eq(matchEvents.matchId, input.id));
      
      return {
        ...match[0],
        homeTeam: homeTeam[0] || null,
        awayTeam: awayTeam[0] || null,
        h2hHistory: h2hMatches,
        events,
      };
    }),

  predict: publicQuery
    .input(z.object({ matchId: z.number() }))
    .query(async ({ input }) => {
      const data = await withFallback(
        async () => {
          const db = getDb();
          const match = await db.select().from(matches).where(eq(matches.id, input.matchId)).limit(1);
          if (!match[0]) return null;
          const [homeTeam, awayTeam, allMatches, allTeams] = await Promise.all([
            db.select().from(teams).where(eq(teams.id, match[0].homeTeamId)).limit(1),
            db.select().from(teams).where(eq(teams.id, match[0].awayTeamId)).limit(1),
            db.select().from(matches).where(eq(matches.status, "FINISHED")).orderBy(desc(matches.matchDate)).limit(2000),
            db.select().from(teams),
          ]);
          return { match: match[0], ht: homeTeam[0], at: awayTeam[0], allMatches, allTeams };
        },
        async () => {
          const fallback = await getFallbackFootballData();
          const match = fallback.matches.find((item) => item.id === input.matchId);
          if (!match) return null;
          const ht = fallback.teams.find((team) => team.id === match.homeTeamId);
          const at = fallback.teams.find((team) => team.id === match.awayTeamId);
          if (!ht || !at) return null;
          return {
            match,
            ht,
            at,
            allMatches: fallback.matches,
            allTeams: fallback.teams,
          };
        }
      );

      if (!data) return null;
      const { match, ht, at, allMatches, allTeams } = data;
      
      if (!ht || !at) return null;
      
      // Calculate lambdas with fatigue
      const homeFatigue = parseFloat(String(ht.fatigueIndex));
      const awayFatigue = parseFloat(String(at.fatigueIndex));
      
      const homeLambda = calculateLambda(
        parseFloat(String(ht.homeXg)),
        parseFloat(String(at.awayXga)),
        true,
        homeFatigue
      );
      
      const awayLambda = calculateLambda(
        parseFloat(String(at.awayXg)),
        parseFloat(String(ht.homeXga)),
        false,
        awayFatigue
      );
      
      const probabilities = calculateOutcomeProbabilities(homeLambda, awayLambda);
      const mostLikelyScore = getMostLikelyScore(homeLambda, awayLambda);
      
      // Fatigue info
      const homeRecentForm = getRecentTeamForm(ht, allTeams, allMatches, match.matchDate);
      const awayRecentForm = getRecentTeamForm(at, allTeams, allMatches, match.matchDate);
      const homeRestDays = getRestDays(ht, allTeams, allMatches, match.matchDate);
      const awayRestDays = getRestDays(at, allTeams, allMatches, match.matchDate);
      const homeFlights = 0;
      const awayFlights = getTravelKm(match.homeTeamId, match.awayTeamId);
      
      const homeFi = calculateFatigueIndex(homeRestDays, homeFlights);
      const awayFi = calculateFatigueIndex(awayRestDays, awayFlights);
      
      return {
        matchId: input.matchId,
        probabilities,
        mostLikelyScore: {
          score: `${mostLikelyScore.homeGoals}:${mostLikelyScore.awayGoals}`,
          probability: Math.round(mostLikelyScore.probability * 100),
        },
        homeXg: homeLambda.toFixed(2),
        awayXg: awayLambda.toFixed(2),
        recentForm: {
          home: homeRecentForm,
          away: awayRecentForm,
        },
        fatigueIndex: {
          home: {
            value: homeFi,
            description: getFatigueDescription(homeFi),
            color: getFatigueColor(homeFi),
            restDays: homeRestDays,
            flightKm: homeFlights,
          },
          away: {
            value: awayFi,
            description: getFatigueDescription(awayFi),
            color: getFatigueColor(awayFi),
            restDays: awayRestDays,
            flightKm: awayFlights,
          },
        },
      };
    }),

  upsets: publicQuery
    .query(async () => {
      const { allMatches, teamsData } = await withFallback(
        async () => {
          const db = getDb();
          const allMatches = await db.select().from(matches).where(eq(matches.status, "SCHEDULED")).limit(20);
          const teamIds = [...new Set(allMatches.flatMap((m) => [m.homeTeamId, m.awayTeamId]))];
          const teamsData = await db.select().from(teams).where(inArray(teams.id, teamIds));
          return { allMatches, teamsData };
        },
        async () => {
          const data = await getFallbackFootballData();
          const allMatches = data.matches
            .filter((match) => match.status === "SCHEDULED")
            .sort((a, b) => a.matchDate.getTime() - b.matchDate.getTime())
            .slice(0, 20);
          const teamIds = new Set(allMatches.flatMap((match) => [match.homeTeamId, match.awayTeamId]));
          return { allMatches, teamsData: data.teams.filter((team) => teamIds.has(team.id)) };
        }
      );
      
      const teamMap = new Map(teamsData.map(t => [t.id, t]));
      
      // Find upsets where xG model differs significantly from bookmaker odds
      const upsets = allMatches.filter(match => {
        const ht = teamMap.get(match.homeTeamId);
        const at = teamMap.get(match.awayTeamId);
        if (!ht || !at) return false;
        
        const homeXg = parseFloat(String(ht.homeXg));
        const awayXg = parseFloat(String(at.awayXg));
        const modelHomeProb = homeXg / (homeXg + awayXg) * 100;
        
        const bookHomeProb = match.oddsHome 
          ? (1 / parseFloat(String(match.oddsHome))) * 100 
          : 50;
        
        return Math.abs(modelHomeProb - bookHomeProb) > 15;
      }).slice(0, 3);
      
      return upsets.map(match => {
        const ht = teamMap.get(match.homeTeamId);
        const at = teamMap.get(match.awayTeamId);
        const homeXg = parseFloat(String(ht?.homeXg || "0"));
        const awayXg = parseFloat(String(at?.awayXg || "0"));
        const modelProb = Math.round((homeXg / (homeXg + awayXg)) * 100);
        
        return {
          ...match,
          homeTeam: ht || { name: "Unknown", shortName: "UNK", color: "#3B82F6", logoUrl: null },
          awayTeam: at || { name: "Unknown", shortName: "UNK", color: "#3B82F6", logoUrl: null },
          modelProbability: modelProb,
          upsetFactor: Math.abs(modelProb - 50),
        };
      });
    }),

  recentResults: publicQuery
    .query(async () => {
      const { results, teamsData } = await withFallback(
        async () => {
          const db = getDb();
          const results = await db.select().from(matches).where(eq(matches.status, "FINISHED")).orderBy(desc(matches.matchDate)).limit(10);
          const teamIds = [...new Set(results.flatMap((m) => [m.homeTeamId, m.awayTeamId]))];
          const teamsData = await db
            .select({ id: teams.id, name: teams.name, shortName: teams.shortName, logoUrl: teams.logoUrl })
            .from(teams)
            .where(inArray(teams.id, teamIds));
          return { results, teamsData };
        },
        async () => {
          const data = await getFallbackFootballData();
          const results = data.matches
            .filter((match) => match.status === "FINISHED")
            .sort((a, b) => b.matchDate.getTime() - a.matchDate.getTime())
            .slice(0, 10);
          const teamIds = new Set(results.flatMap((match) => [match.homeTeamId, match.awayTeamId]));
          return { results, teamsData: data.teams.filter((team) => teamIds.has(team.id)) };
        }
      );
      
      const teamMap = new Map(teamsData.map(t => [t.id, t]));
      
      return results.map(match => ({
        ...match,
        homeTeamName: teamMap.get(match.homeTeamId)?.shortName || "UNK",
        awayTeamName: teamMap.get(match.awayTeamId)?.shortName || "UNK",
      }));
    }),
});
