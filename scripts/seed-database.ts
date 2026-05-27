import "dotenv/config";
import { prisma } from "../lib/prisma";

const LEAGUES = [
  { code: "E0", name: "Premier League", country: "England", tier: 1 },
  { code: "E1", name: "Championship", country: "England", tier: 2 },
  { code: "E2", name: "League One", country: "England", tier: 3 },
  { code: "SP1", name: "La Liga", country: "Spain", tier: 1 },
  { code: "D1", name: "Bundesliga", country: "Germany", tier: 1 },
  { code: "I1", name: "Serie A", country: "Italy", tier: 1 },
  { code: "F1", name: "Ligue 1", country: "France", tier: 1 },
] as const;

const SEASONS = ["2021", "2122", "2223", "2324", "2425"] as const;

type CsvRow = Record<string, string>;

function parseDate(value: string): Date | null {
  if (!value) return null;
  const [d, m, y] = value.split("/");
  if (!d || !m || !y) return null;
  const year = y.length === 2 ? Number(`20${y}`) : Number(y);
  const out = new Date(year, Number(m) - 1, Number(d));
  return Number.isNaN(out.getTime()) ? null : out;
}

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function approxXg(shotsOnTarget: number, totalShots: number, corners: number): number {
  return shotsOnTarget * 0.1 + totalShots * 0.03 + corners * 0.02;
}

function parseCsv(csv: string): CsvRow[] {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const header = lines[0]?.split(",") ?? [];
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const values = lines[i].split(",");
    const row: CsvRow = {};
    header.forEach((key, idx) => {
      row[key] = values[idx] ?? "";
    });
    rows.push(row);
  }
  return rows;
}

async function loadSeasonLeague(season: string, leagueCode: (typeof LEAGUES)[number]): Promise<void> {
  const url = `https://www.football-data.co.uk/mmz4281/${season}/${leagueCode.code}.csv`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch ${url}`);
  const text = await resp.text();
  const rows = parseCsv(text);
  const seasonLabel = `${season.slice(0, 2)}${season.slice(2)}`
    .replace("20", "2020-21")
    .replace("2122", "2021-22")
    .replace("2223", "2022-23")
    .replace("2324", "2023-24")
    .replace("2425", "2024-25");

  const league = await prisma.league.upsert({
    where: { name: leagueCode.name },
    update: { season: seasonLabel, country: leagueCode.country, tier: leagueCode.tier },
    create: {
      name: leagueCode.name,
      country: leagueCode.country,
      season: seasonLabel,
      tier: leagueCode.tier,
      isCup: false,
      isInternational: false,
    },
  });

  for (const row of rows) {
    const date = parseDate(row.Date);
    const homeName = row.HomeTeam?.trim();
    const awayName = row.AwayTeam?.trim();
    if (!date || !homeName || !awayName) continue;

    const [homeTeam, awayTeam] = await Promise.all([
      prisma.team.upsert({
        where: { name: homeName },
        update: { leagueId: league.id, country: leagueCode.country },
        create: { name: homeName, country: leagueCode.country, leagueId: league.id },
      }),
      prisma.team.upsert({
        where: { name: awayName },
        update: { leagueId: league.id, country: leagueCode.country },
        create: { name: awayName, country: leagueCode.country, leagueId: league.id },
      }),
    ]);

    const hs = toNumber(row.HS);
    const as = toNumber(row.AS);
    const hst = toNumber(row.HST);
    const ast = toNumber(row.AST);
    const hc = toNumber(row.HC);
    const ac = toNumber(row.AC);

    await prisma.match.create({
      data: {
        date,
        leagueId: league.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        homeGoals: toNumber(row.FTHG),
        awayGoals: toNumber(row.FTAG),
        result: row.FTR || null,
        homeXg: approxXg(hst, hs, hc),
        awayXg: approxXg(ast, as, ac),
        season: seasonLabel,
        matchday: 1,
        isPlayed: true,
        isSimulated: false,
      },
    });
  }
}

async function updateTeamAverages(): Promise<void> {
  const teams = await prisma.team.findMany({
    include: { homeMatches: true, awayMatches: true },
  });
  for (const team of teams) {
    const homePlayed = team.homeMatches.filter((m) => m.isPlayed);
    const awayPlayed = team.awayMatches.filter((m) => m.isPlayed);

    const xGHome = homePlayed.reduce((sum, m) => sum + (m.homeXg ?? 0), 0);
    const xGAHome = homePlayed.reduce((sum, m) => sum + (m.awayXg ?? 0), 0);
    const xGAway = awayPlayed.reduce((sum, m) => sum + (m.awayXg ?? 0), 0);
    const xGAAway = awayPlayed.reduce((sum, m) => sum + (m.homeXg ?? 0), 0);

    await prisma.team.update({
      where: { id: team.id },
      data: { xGHome, xGAHome, xGAway, xGAAway },
    });
  }
}

async function enrichFromStatsBomb(): Promise<void> {
  const base = "https://raw.githubusercontent.com/statsbomb/open-data/master/data";
  const competitionsResp = await fetch(`${base}/competitions.json`);
  if (!competitionsResp.ok) return;
  const competitions = (await competitionsResp.json()) as Array<{ competition_id: number; season_id: number }>;
  const topCompetitions = competitions.slice(0, 3);

  for (const competition of topCompetitions) {
    const matchesResp = await fetch(`${base}/matches/${competition.competition_id}/${competition.season_id}.json`);
    if (!matchesResp.ok) continue;
    const matches = (await matchesResp.json()) as Array<{
      match_id: number;
      match_date: string;
      home_team: { home_team_name: string };
      away_team: { away_team_name: string };
    }>;

    for (const sbMatch of matches.slice(0, 200)) {
      const eventsResp = await fetch(`${base}/events/${sbMatch.match_id}.json`);
      if (!eventsResp.ok) continue;
      const events = (await eventsResp.json()) as Array<{
        team?: { name?: string };
        shot?: { statsbomb_xg?: string | number };
      }>;

      let homeXg = 0;
      let awayXg = 0;
      for (const event of events) {
        const xg = toNumber(String(event.shot?.statsbomb_xg ?? 0));
        if (event.team?.name === sbMatch.home_team.home_team_name) homeXg += xg;
        if (event.team?.name === sbMatch.away_team.away_team_name) awayXg += xg;
      }

      await prisma.match.updateMany({
        where: {
          date: new Date(sbMatch.match_date),
          homeTeam: { name: sbMatch.home_team.home_team_name },
          awayTeam: { name: sbMatch.away_team.away_team_name },
        },
        data: { homeXg, awayXg },
      });
    }
  }
}

async function enrichSquadsFromFootballDataOrg(): Promise<void> {
  const key = process.env.FOOTBALL_DATA_ORG_KEY;
  if (!key) return;
  const leagueMap: Record<string, string> = {
    "Premier League": "PL",
    "La Liga": "PD",
    Bundesliga: "BL1",
    "Serie A": "SA",
    "Ligue 1": "FL1",
  };

  const leagues = await prisma.league.findMany({ where: { name: { in: Object.keys(leagueMap) } } });
  for (const league of leagues) {
    const code = leagueMap[league.name];
    const teamsResp = await fetch(`https://api.football-data.org/v4/competitions/${code}/teams`, {
      headers: { "X-Auth-Token": key },
    });
    if (!teamsResp.ok) continue;
    const payload = (await teamsResp.json()) as {
      teams: Array<{
        name: string;
        squad: Array<{ name: string; position: string; dateOfBirth?: string; marketValue?: number }>;
      }>;
    };

    for (const teamPayload of payload.teams) {
      const team = await prisma.team.findUnique({ where: { name: teamPayload.name } });
      if (!team) continue;

      for (const squadPlayer of teamPayload.squad) {
        const age = squadPlayer.dateOfBirth
          ? Math.floor((Date.now() - new Date(squadPlayer.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : 25;
        await prisma.player.create({
          data: {
            name: squadPlayer.name,
            teamId: team.id,
            position: (squadPlayer.position || "MF").slice(0, 2).toUpperCase(),
            age,
            marketValue: squadPlayer.marketValue ?? 0,
            xG90: 0,
            xA90: 0,
          },
        });
      }
    }
  }
}

async function main(): Promise<void> {
  for (const season of SEASONS) {
    for (const league of LEAGUES) {
      await loadSeasonLeague(season, league);
    }
  }
  await enrichFromStatsBomb();
  await enrichSquadsFromFootballDataOrg();
  await updateTeamAverages();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("StatKick seed completed.");
  })
  .catch(async (err: unknown) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
