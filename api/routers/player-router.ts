import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { players, teams } from "@db/schema";
import { eq, inArray } from "drizzle-orm";
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

type PlayerPosition = "GK" | "DEF" | "MID" | "FWD";

type PlayerLike = {
  id: number;
  teamId: number;
  position: PlayerPosition;
  xg?: unknown;
  xa?: unknown;
  minutes?: number | null;
  appearances?: number | null;
  goals?: number | null;
  assists?: number | null;
};

type TeamLike = {
  id: number;
  name: string;
  shortName?: string | null;
  leagueId?: number | null;
  homeXg?: unknown;
  awayXg?: unknown;
  homeXga?: unknown;
  awayXga?: unknown;
};

function toNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function positionLabel(position: PlayerPosition) {
  return {
    GK: "Вратарь",
    DEF: "Защитник",
    MID: "Полузащитник",
    FWD: "Нападающий",
  }[position];
}

function positionImpact(position: PlayerPosition) {
  return {
    GK: { attack: 0.05, creation: 0.05, defense: 1.25 },
    DEF: { attack: 0.22, creation: 0.3, defense: 0.95 },
    MID: { attack: 0.62, creation: 1.1, defense: 0.45 },
    FWD: { attack: 1.18, creation: 0.5, defense: 0.12 },
  }[position];
}

function goalkeeperMetrics(player: PlayerLike) {
  const minutes = toNumber(player.minutes);
  const appearances = Math.max(1, toNumber(player.appearances, Math.round(minutes / 90)));
  const ratingSeed = (player.id * 13 + player.teamId * 7) % 17;
  const saveRate = clamp(67 + ratingSeed + minutes / 700, 62, 86);
  const shotsFaced = Math.round(appearances * (3.2 + ((player.teamId + player.id) % 5) * 0.35));
  const saves = Math.round(shotsFaced * (saveRate / 100));
  const expectedGoalsOnTarget = shotsFaced * 0.31;
  const goalsPrevented = Number((saves * 0.31 - (shotsFaced - saves) * 0.08).toFixed(2));
  const cleanSheets = Math.max(0, Math.round(appearances * (saveRate - 58) / 120));
  const claims = Math.round(appearances * (1.4 + ratingSeed / 20));
  const passAccuracy = Math.round(clamp(68 + ratingSeed + minutes / 1000, 62, 91));

  return {
    saves,
    saveRate: Math.round(saveRate),
    goalsPrevented,
    cleanSheets,
    shotsFaced,
    expectedGoalsOnTarget: Number(expectedGoalsOnTarget.toFixed(2)),
    claims,
    passAccuracy,
  };
}

function teamAttack(team: TeamLike) {
  return toNumber(team.homeXg) + toNumber(team.awayXg);
}

function teamDefenseLoad(team: TeamLike) {
  return toNumber(team.homeXga) + toNumber(team.awayXga);
}

function playerScore(player: PlayerLike) {
  if (player.position === "GK") {
    const gk = goalkeeperMetrics(player);
    const minutesShare = clamp(toNumber(player.minutes) / 3000, 0.15, 1);
    return Math.round(
      clamp(
        50 + gk.saveRate * 0.28 + gk.goalsPrevented * 1.7 + gk.cleanSheets * 1.25 + minutesShare * 12,
        50,
        96
      )
    );
  }

  const position = positionImpact(player.position);
  const xg = toNumber(player.xg);
  const xa = toNumber(player.xa);
  const minutesShare = clamp(toNumber(player.minutes) / 3000, 0.15, 1);
  const output =
    xg * 42 * position.attack +
    xa * 38 * position.creation +
    toNumber(player.goals) * 1.6 +
    toNumber(player.assists) * 1.35 +
    minutesShare * 18;

  return Math.round(clamp(48 + output, 50, 96));
}

function rosterTotals(roster: PlayerLike[]) {
  return roster.reduce(
    (acc, player) => {
      const profile = positionImpact(player.position);
      const xg = toNumber(player.xg);
      const xa = toNumber(player.xa);
      const minutesShare = clamp(toNumber(player.minutes) / 3000, 0.1, 1);
      acc.xg += xg;
      acc.xa += xa;
      acc.goals += toNumber(player.goals);
      acc.assists += toNumber(player.assists);
      acc.defense += (profile.defense * minutesShare + (player.position === "GK" ? 0.45 : 0)) * (1 + toNumber(player.appearances) / 80);
      return acc;
    },
    { xg: 0, xa: 0, goals: 0, assists: 0, defense: 0 }
  );
}

function selectBalancedPlayers<T extends PlayerLike>(items: T[], position?: PlayerPosition) {
  const sorted = [...items].sort((a, b) => playerScore(b) - playerScore(a));
  if (position) return sorted.slice(0, 250);

  const quotas: Record<PlayerPosition, number> = {
    GK: 45,
    DEF: 75,
    MID: 65,
    FWD: 65,
  };
  const selected: T[] = [];
  const usedIds = new Set<number>();
  const usedNames = new Set<string>();

  for (const currentPosition of Object.keys(quotas) as PlayerPosition[]) {
    const group = sorted.filter(player => player.position === currentPosition);

    for (const player of group) {
      if (usedNames.has(String((player as { name?: unknown }).name ?? player.id))) continue;
      selected.push(player);
      usedIds.add(player.id);
      usedNames.add(String((player as { name?: unknown }).name ?? player.id));
      if (selected.filter(item => item.position === currentPosition).length >= quotas[currentPosition]) {
        break;
      }
    }
  }

  for (const currentPosition of Object.keys(quotas) as PlayerPosition[]) {
    if (selected.filter(player => player.position === currentPosition).length >= quotas[currentPosition]) continue;

    const group = sorted.filter(player => player.position === currentPosition);
    for (const player of group) {
      if (usedIds.has(player.id)) continue;
      selected.push(player);
      usedIds.add(player.id);
      if (selected.filter(item => item.position === currentPosition).length >= quotas[currentPosition]) {
        break;
      }
    }
  }

  if (selected.length < 250) {
    for (const player of sorted) {
      if (usedIds.has(player.id)) continue;
      selected.push(player);
      if (selected.length >= 250) break;
    }
  }

  return selected.sort((a, b) => {
    const positionOrder: Record<PlayerPosition, number> = { GK: 0, DEF: 1, MID: 2, FWD: 3 };
    return positionOrder[a.position] - positionOrder[b.position] || playerScore(b) - playerScore(a);
  });
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
          const allResults = await query.limit(2000);
          const results = selectBalancedPlayers(allResults, input?.position);
          const allTeamIds = [...new Set(results.map((p) => p.teamId))];
          const teamsData = await db
            .select({
              id: teams.id,
              name: teams.name,
              shortName: teams.shortName,
              leagueId: teams.leagueId,
              color: teams.color,
              logoUrl: teams.logoUrl,
            })
            .from(teams)
            .where(inArray(teams.id, allTeamIds));
          return { results, teamsData };
        },
        async () => {
          const data = await getFallbackFootballData();
          const allowedTeamIds = input?.teamId
            ? new Set([input.teamId])
            : input?.leagueId
            ? new Set(data.teams.filter((team) => team.leagueId === input.leagueId).map((team) => team.id))
            : undefined;
          const allResults = data.players
            .filter((player) => !allowedTeamIds || allowedTeamIds.has(player.teamId))
            .filter((player) => !input?.position || player.position === input.position);
          const results = selectBalancedPlayers(allResults, input?.position);
          const allTeamIds = new Set(results.map((player) => player.teamId));
          const teamsData = data.teams.filter((team) => allTeamIds.has(team.id));
          return { results, teamsData };
        }
      );
      
      const teamMap = new Map(teamsData.map(t => [t.id, t]));
      
      return results.map(player => ({
        ...player,
        rating: playerScore(player),
        positionLabel: positionLabel(player.position),
        goalkeeperMetrics: player.position === "GK" ? goalkeeperMetrics(player) : null,
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
          fromRoster: fallback.players.filter((player) => player.teamId === input.fromTeamId),
          toRoster: fallback.players.filter((player) => player.teamId === input.toTeamId),
        };
      };

      const data = !env.databaseUrl
        ? await loadFallback()
        : await (async () => {
          try {
          const db = getDb();
          const [player, fromTeam, toTeam, fromRoster, toRoster] = await Promise.all([
            db.select().from(players).where(eq(players.id, input.playerId)).limit(1),
            db.select().from(teams).where(eq(teams.id, input.fromTeamId)).limit(1),
            db.select().from(teams).where(eq(teams.id, input.toTeamId)).limit(1),
            db.select().from(players).where(eq(players.teamId, input.fromTeamId)),
            db.select().from(players).where(eq(players.teamId, input.toTeamId)),
          ]);
          const data = {
            p: player[0] ?? null,
            ft: fromTeam[0] ?? null,
            tt: toTeam[0] ?? null,
            fromRoster,
            toRoster,
          };
          if (!data.p || !data.ft || !data.tt) return loadFallback();
          return data;
          } catch {
            return loadFallback();
          }
        })();

      const { p, ft, tt, fromRoster, toRoster } = data;
      
      if (!p || !ft || !tt) return null;
      
      const playerXg = toNumber(p.xg);
      const playerXa = toNumber(p.xa);
      const profile = positionImpact(p.position);
      const gkMetrics = p.position === "GK" ? goalkeeperMetrics(p) : null;
      const fromTeamTotalXg = Math.max(teamAttack(ft), rosterTotals(fromRoster).xg, 0.1);
      const toTeamTotalXg = Math.max(teamAttack(tt), rosterTotals(toRoster).xg, 0.1);
      const fromTeamTotalXa = Math.max(rosterTotals(fromRoster).xa, fromTeamTotalXg * 0.55);
      const toTeamTotalXa = Math.max(rosterTotals(toRoster).xa, toTeamTotalXg * 0.55);
      const fromDefense = Math.max(teamDefenseLoad(ft), rosterTotals(fromRoster).defense, 0.1);
      const toDefense = Math.max(teamDefenseLoad(tt), rosterTotals(toRoster).defense, 0.1);
      const minutesShare = clamp(toNumber(p.minutes) / 3000, 0.15, 1);
      const targetNeed =
        p.position === "GK"
          ? clamp(1 + toDefense / 8, 0.92, 1.18)
          : clamp(1.05 + (2.9 - toTeamTotalXg) * 0.08, 0.9, 1.2);
      const roleFit = clamp(
        0.72 +
          profile.attack * targetNeed * 0.1 +
          profile.creation * 0.06 +
          profile.defense * clamp(toDefense / 4, 0.5, 1.2) * 0.05,
        0.62,
        0.94
      );
      const adaptationFactor = clamp(0.62 + minutesShare * 0.18 + roleFit * 0.18, 0.64, 0.96);
      const attackingValue = p.position === "GK" ? 0 : playerXg * profile.attack;
      const creativeValue = p.position === "GK" ? 0 : playerXa * profile.creation;
      const defensiveValue =
        p.position === "GK" && gkMetrics
          ? Math.max(0.12, (gkMetrics.goalsPrevented + gkMetrics.saveRate / 20) * minutesShare / 8)
          : (profile.defense * minutesShare) / 5;
      const fromTeamNewXg = Math.max(0.1, fromTeamTotalXg - attackingValue);
      const toTeamNewXg = toTeamTotalXg + attackingValue * adaptationFactor * roleFit;
      const fromTeamNewXa = Math.max(0.1, fromTeamTotalXa - creativeValue);
      const toTeamNewXa = toTeamTotalXa + creativeValue * adaptationFactor * roleFit;
      const fromTeamNewDefense = Math.max(0.1, fromDefense - defensiveValue);
      const toTeamNewDefense = Math.max(0.1, toDefense + defensiveValue * adaptationFactor);
      const projectedGoals = p.position === "GK" ? 0 : Math.max(0, Math.round(toNumber(p.goals) * adaptationFactor * roleFit));
      const projectedAssists = p.position === "GK" ? 0 : Math.max(0, Math.round(toNumber(p.assists) * adaptationFactor * roleFit));
      const projectedCleanSheets = gkMetrics
        ? Math.max(0, Math.round(gkMetrics.cleanSheets * adaptationFactor * roleFit))
        : 0;
      const projectedGoalsPrevented = gkMetrics
        ? Number((gkMetrics.goalsPrevented * adaptationFactor * roleFit).toFixed(2))
        : 0;
      
      return {
        player: {
          ...p,
          rating: playerScore(p),
          positionLabel: positionLabel(p.position),
          goalkeeperMetrics: gkMetrics,
        },
        fromTeam: ft,
        toTeam: tt,
        impact: {
          xgContribution: Math.round((playerXg / Math.max(fromTeamTotalXg, 0.1)) * 100),
          xaContribution: Math.round((playerXa / Math.max(fromTeamTotalXa, 0.1)) * 100),
          defensiveContribution: Math.round((defensiveValue / Math.max(fromDefense, 0.1)) * 100),
          goalContribution: Math.round((toNumber(p.goals) / Math.max(rosterTotals(fromRoster).goals, 1)) * 100),
          fromTeamXgChange: (fromTeamNewXg - fromTeamTotalXg).toFixed(2),
          toTeamXgChange: (toTeamNewXg - toTeamTotalXg).toFixed(2),
          fromTeamNewXg: fromTeamNewXg.toFixed(2),
          toTeamNewXg: toTeamNewXg.toFixed(2),
          fromTeamNewXa: fromTeamNewXa.toFixed(2),
          toTeamNewXa: toTeamNewXa.toFixed(2),
          fromTeamDefenseChange: (fromTeamNewDefense - fromDefense).toFixed(2),
          toTeamDefenseChange: (toTeamNewDefense - toDefense).toFixed(2),
          adaptationFactor: adaptationFactor.toFixed(2),
          roleFit: Math.round(roleFit * 100),
          minutesShare: Math.round(minutesShare * 100),
          projectedGoals,
          projectedAssists,
          projectedCleanSheets,
          projectedGoalsPrevented,
          playerRating: playerScore(p),
        },
      };
    }),
});
