import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { leagues, teams, matches } from "@db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { runMonteCarloSimulation } from "../math/montecarlo";
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

export const leagueRouter = createRouter({
  list: publicQuery.query(async () => {
    return withFallback(
      async () => {
        const db = getDb();
        return db.select().from(leagues).orderBy(desc(leagues.season), asc(leagues.name));
      },
      async () => {
        const data = await getFallbackFootballData();
        return [...data.leagues].sort((a, b) => b.season.localeCompare(a.season) || a.name.localeCompare(b.name));
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
            .filter((team) => team.leagueId === input.leagueId)
            .sort((a, b) => b.points - a.points || b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst));
        }
      );
      
      return teamsData.map((team, index) => ({
        ...team,
        position: index + 1,
        goalDifference: (team.goalsFor ?? 0) - (team.goalsAgainst ?? 0),
        matchesPlayed: (team.wins ?? 0) + (team.draws ?? 0) + (team.losses ?? 0),
      }));
    }),

  simulate: publicQuery
    .input(z.object({ leagueId: z.number() }))
    .query(async ({ input }) => {
      const { teamsData, remainingMatches } = await withFallback(
        async () => {
          const db = getDb();
          const teamsData = await db.select().from(teams).where(eq(teams.leagueId, input.leagueId));
          const remainingMatches = await db.select().from(matches).where(eq(matches.status, "SCHEDULED"));
          return { teamsData, remainingMatches };
        },
        async () => {
          const data = await getFallbackFootballData();
          return {
            teamsData: data.teams.filter((team) => team.leagueId === input.leagueId),
            remainingMatches: data.matches.filter((match) => match.status === "SCHEDULED"),
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
      
      const matchFixtures = remainingMatches
        .filter(m => teamsData.some(t => t.id === m.homeTeamId) && teamsData.some(t => t.id === m.awayTeamId))
        .map(m => {
          const homeTeam = teamsData.find(t => t.id === m.homeTeamId);
          const awayTeam = teamsData.find(t => t.id === m.awayTeamId);
          return {
            homeTeamId: m.homeTeamId,
            awayTeamId: m.awayTeamId,
            homeXg: parseFloat(String(homeTeam?.homeXg || "0")),
            awayXg: parseFloat(String(awayTeam?.awayXg || "0")),
            homeXga: parseFloat(String(homeTeam?.homeXga || "0")),
            awayXga: parseFloat(String(awayTeam?.awayXga || "0")),
          };
        });
      
      const simulation = runMonteCarloSimulation(currentStandings, matchFixtures, 10000);
      
      return {
        currentStandings: teamsData.map((t, i) => ({
          ...t,
          position: i + 1,
          goalDifference: (t.goalsFor || 0) - (t.goalsAgainst || 0),
          championProbability: simulation.championProbabilities[t.id] || 0,
          top4Probability: simulation.top4Probabilities[t.id] || 0,
          relegationProbability: simulation.relegationProbabilities[t.id] || 0,
        })),
        championProbabilities: simulation.championProbabilities,
        top4Probabilities: simulation.top4Probabilities,
        relegationProbabilities: simulation.relegationProbabilities,
      };
    }),

  trends: publicQuery
    .query(async () => {
      const allMatches = await withFallback(
        async () => {
          const db = getDb();
          return db.select().from(matches).where(eq(matches.status, "FINISHED"));
        },
        async () => {
          const data = await getFallbackFootballData();
          return data.matches.filter((match) => match.status === "FINISHED");
        }
      );
      
      const totalMatches = allMatches.length;
      const homeWins = allMatches.filter(m => (m.homeGoals || 0) > (m.awayGoals || 0)).length;
      const draws = allMatches.filter(m => (m.homeGoals || 0) === (m.awayGoals || 0)).length;
      const cleanSheets = allMatches.filter(m => (m.awayGoals || 0) === 0 || (m.homeGoals || 0) === 0).length;
      const totalGoals = allMatches.reduce((sum, m) => sum + (m.homeGoals || 0) + (m.awayGoals || 0), 0);
      
      return {
        totalMatches,
        homeWinPercentage: totalMatches > 0 ? Math.round((homeWins / totalMatches) * 100) : 0,
        drawPercentage: totalMatches > 0 ? Math.round((draws / totalMatches) * 100) : 0,
        cleanSheetPercentage: totalMatches > 0 ? Math.round((cleanSheets / totalMatches) * 100) : 0,
        avgGoalsPerMatch: totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : "0",
        totalGoals,
      };
    }),
});
