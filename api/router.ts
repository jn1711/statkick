import { authRouter } from "./auth-router";
import { matchRouter } from "./routers/match-router";
import { leagueRouter } from "./routers/league-router";
import { playerRouter } from "./routers/player-router";
import { methodologyRouter } from "./routers/methodology-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  match: matchRouter,
  league: leagueRouter,
  player: playerRouter,
  methodology: methodologyRouter,
});

export type AppRouter = typeof appRouter;
