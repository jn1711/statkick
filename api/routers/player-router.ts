import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { players, teams } from "@db/schema";
import { eq, inArray, desc } from "drizzle-orm";

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
      const db = getDb();
      
      let teamIds: number[] = [];
      
      if (input?.teamId) {
        teamIds = [input.teamId];
      } else if (input?.leagueId) {
        const teamsData = await db
          .select({ id: teams.id })
          .from(teams)
          .where(eq(teams.leagueId, input.leagueId));
        teamIds = teamsData.map(t => t.id);
      }
      
      let query = db.select().from(players);
      
      if (teamIds.length > 0) {
        query = query.where(inArray(players.teamId, teamIds)) as typeof query;
      }
      
      if (input?.position) {
        query = query.where(eq(players.position, input.position)) as typeof query;
      }
      
      const results = await query.orderBy(desc(players.xg)).limit(100);
      
      const allTeamIds = [...new Set(results.map(p => p.teamId))];
      const teamsData = await db
        .select({ id: teams.id, name: teams.name, color: teams.color })
        .from(teams)
        .where(inArray(teams.id, allTeamIds));
      
      const teamMap = new Map(teamsData.map(t => [t.id, t]));
      
      return results.map(player => ({
        ...player,
        team: teamMap.get(player.teamId) || { name: "Unknown", color: "#3B82F6" },
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
      const db = getDb();
      
      const [player, fromTeam, toTeam] = await Promise.all([
        db.select().from(players).where(eq(players.id, input.playerId)).limit(1),
        db.select().from(teams).where(eq(teams.id, input.fromTeamId)).limit(1),
        db.select().from(teams).where(eq(teams.id, input.toTeamId)).limit(1),
      ]);
      
      const p = player[0];
      const ft = fromTeam[0];
      const tt = toTeam[0];
      
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
