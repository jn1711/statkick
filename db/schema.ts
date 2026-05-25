import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  int,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export const leagues = mysqlTable("leagues", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }),
  season: varchar("season", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const teams = mysqlTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  shortName: varchar("shortName", { length: 10 }),
  leagueId: bigint("leagueId", { mode: "number", unsigned: true }).notNull(),
  homeXg: decimal("homeXg", { precision: 4, scale: 2 }).default("0"),
  homeXga: decimal("homeXga", { precision: 4, scale: 2 }).default("0"),
  awayXg: decimal("awayXg", { precision: 4, scale: 2 }).default("0"),
  awayXga: decimal("awayXga", { precision: 4, scale: 2 }).default("0"),
  fatigueIndex: decimal("fatigueIndex", { precision: 4, scale: 2 }).default("0"),
  color: varchar("color", { length: 7 }).default("#3B82F6"),
  logoUrl: text("logoUrl"),
  points: int("points").default(0),
  wins: int("wins").default(0),
  draws: int("draws").default(0),
  losses: int("losses").default(0),
  goalsFor: int("goalsFor").default(0),
  goalsAgainst: int("goalsAgainst").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const players = mysqlTable("players", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  teamId: bigint("teamId", { mode: "number", unsigned: true }).notNull(),
  position: mysqlEnum("position", ["GK", "DEF", "MID", "FWD"]).notNull(),
  xg: decimal("xg", { precision: 4, scale: 2 }).default("0"),
  xa: decimal("xa", { precision: 4, scale: 2 }).default("0"),
  minutes: int("minutes").default(0),
  appearances: int("appearances").default(0),
  goals: int("goals").default(0),
  assists: int("assists").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const matches = mysqlTable("matches", {
  id: serial("id").primaryKey(),
  homeTeamId: bigint("homeTeamId", { mode: "number", unsigned: true }).notNull(),
  awayTeamId: bigint("awayTeamId", { mode: "number", unsigned: true }).notNull(),
  leagueId: bigint("leagueId", { mode: "number", unsigned: true }).notNull(),
  matchDate: timestamp("matchDate").notNull(),
  homeGoals: int("homeGoals").default(0),
  awayGoals: int("awayGoals").default(0),
  homeXg: decimal("homeXg", { precision: 4, scale: 2 }).default("0"),
  awayXg: decimal("awayXg", { precision: 4, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["SCHEDULED", "LIVE", "FINISHED"]).default("SCHEDULED"),
  oddsHome: decimal("oddsHome", { precision: 4, scale: 2 }),
  oddsDraw: decimal("oddsDraw", { precision: 4, scale: 2 }),
  oddsAway: decimal("oddsAway", { precision: 4, scale: 2 }),
  dataSource: varchar("dataSource", { length: 120 }).default("football-data.co.uk"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const matchEvents = mysqlTable("match_events", {
  id: serial("id").primaryKey(),
  matchId: bigint("matchId", { mode: "number", unsigned: true }).notNull(),
  minute: int("minute").notNull(),
  type: mysqlEnum("type", ["GOAL", "ASSIST", "YELLOW_CARD", "RED_CARD", "SUBSTITUTION"]).notNull(),
  playerName: varchar("playerName", { length: 100 }).notNull(),
  team: mysqlEnum("team", ["HOME", "AWAY"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type League = typeof leagues.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type MatchEvent = typeof matchEvents.$inferSelect;
