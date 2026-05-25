import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { players, teams } from "@db/schema";
import { eq, inArray, desc } from "drizzle-orm";
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

export const playerRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        teamId: z.number().optional(),
        leagueId: z.number().optional(),
        position: z.enum(["GK", "DEF", "MID", "FWD"]).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const { results, teamsData } = await withFallback(
        async () => {
          const db = getDb();
          let teamIds: number[] = [];
          if (input?.teamId) {
            teamIds = [input.teamId];
          } else if (input?.leagueId) {
            const teamsData = await db.select({ id: teams.id }).from(teams).where(eq(teams.leagueId, input.leagueId));
            teamIds = teamsData.map((t) => t.id);
          }
          let query = db.select().from(players);
          if (teamIds.length > 0) query = query.where(inArray(players.teamId, teamIds)) as typeof query;
          if (input?.position) query = query.where(eq(players.position, input.position)) as typeof query;
          const results = await query.orderBy(desc(players.xg)).limit(100);
          const allTeamIds = [...new Set(results.map((p) => p.teamId))];
          const teamsData = await db.select({ id: teams.id, name: teams.name, color: teams.color, logoUrl: teams.logoUrl }).from(teams).where(inArray(teams.id, allTeamIds));
          return { results, teamsData };
        },
        async () => {
          const data = await getFallbackFootballData();
          const allowedTeamIds = input?.teamId
            ? new Set([input.teamId])
            : input?.leagueId
            ? new Set(data.teams.filter((team) => team.leagueId === input.leagueId).map((team) => team.id))
            : undefined;
          const results = data.players
            .filter((player) => !allowedTeamIds || allowedTeamIds.has(player.teamId))
            .filter((player) => !input?.position || player.position === input.position)
            .sort((a, b) => Number(b.xg) - Number(a.xg))
            .slice(0, 100);
          const allTeamIds = new Set(results.map((player) => player.teamId));
          const teamsData = data.teams.filter((team) => allTeamIds.has(team.id));
          return { results, teamsData };
        }
      );
      
      const teamMap = new Map(teamsData.map(t => [t.id, t]));
      
      return results.map(player => ({
        ...player,
        team: teamMap.get(player.teamId) || { name: "Unknown", color: "#3B82F6", logoUrl: null },
      }));
    }),

  transferSimulate: publicQuery
    .input(
      z.object({
        playerId: z.number(),
        fromTeamId: z.number(),
        toTeamId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const loadFallback = async () => {
        const fallback = await getFallbackFootballData();
        return {
          p: fallback.players.find((player) => player.id === input.playerId) ?? null,
          ft: fallback.teams.find((team) => team.id === input.fromTeamId) ?? null,
          tt: fallback.teams.find((team) => team.id === input.toTeamId) ?? null,
        };
      };

      const data = !env.databaseUrl
        ? await loadFallback()
        : await (async () => {
          try {
          const db = getDb();
          const [player, fromTeam, toTeam] = await Promise.all([
            db.select().from(players).where(eq(players.id, input.playerId)).limit(1),
            db.select().from(teams).where(eq(teams.id, input.fromTeamId)).limit(1),
            db.select().from(teams).where(eq(teams.id, input.toTeamId)).limit(1),
          ]);
          const data = { p: player[0] ?? null, ft: fromTeam[0] ?? null, tt: toTeam[0] ?? null };
          if (!data.p || !data.ft || !data.tt) return loadFallback();
          return data;
          } catch {
            return loadFallback();
          }
        })();

      const { p, ft, tt } = data;
      
      if (!p || !ft || !tt) return null;
      
      const playerXg = parseFloat(String(p.xg));
      
      // Calculate impact
      const fromTeamTotalXg = parseFloat(String(ft.homeXg)) + parseFloat(String(ft.awayXg));
      const toTeamTotalXg = parseFloat(String(tt.homeXg)) + parseFloat(String(tt.awayXg));
      
      const xgContribution = playerXg / Math.max(fromTeamTotalXg, 0.1);
      const adaptationFactor = 0.8; // Player needs time to adapt
      
      const fromTeamNewXg = fromTeamTotalXg - playerXg;
      const toTeamNewXg = toTeamTotalXg + playerXg * adaptationFactor;
      
      return {
        player: p,
        fromTeam: ft,
        toTeam: tt,
        impact: {
          xgContribution: Math.round(xgContribution * 100),
          fromTeamXgChange: (fromTeamNewXg - fromTeamTotalXg).toFixed(2),
          toTeamXgChange: (toTeamNewXg - toTeamTotalXg).toFixed(2),
          fromTeamNewXg: fromTeamNewXg.toFixed(2),
          toTeamNewXg: toTeamNewXg.toFixed(2),
          adaptationFactor,
        },
      };
    }),
});
