import { getDb } from "../api/queries/connection";
import { leagues, teams, players, matches, matchEvents } from "./schema";

type Competition = {
  code: string;
  name: string;
  country: string;
  color: string;
};

type CsvRow = Record<string, string>;

const COMPETITIONS: Competition[] = [
  { code: "E0", name: "Premier League", country: "England", color: "#3D195B" },
  { code: "SP1", name: "La Liga", country: "Spain", color: "#FF4B44" },
  { code: "I1", name: "Serie A", country: "Italy", color: "#008FD7" },
  { code: "D1", name: "Bundesliga", country: "Germany", color: "#D20515" },
  { code: "F1", name: "Ligue 1", country: "France", color: "#091C3E" },
];

const HISTORICAL_SEASONS = ["2122", "2223", "2324", "2425", "2526"];
const FUTURE_SEASONS = ["2026/27", "2027/28"];
const SOURCE = "football-data.co.uk";

const TEAM_ALIASES: Record<string, string> = {
  "Ath Madrid": "Atletico Madrid",
  "Betis": "Real Betis",
  "Cadiz": "Cadiz CF",
  "Celta": "Celta Vigo",
  "Espanol": "Espanyol",
  "Granada": "Granada CF",
  "Sociedad": "Real Sociedad",
  "Vallecano": "Rayo Vallecano",
  "Alaves": "Deportivo Alaves",
  "Paris SG": "Paris Saint-Germain",
  "Inter": "Inter Milan",
  "Milan": "AC Milan",
  "Roma": "AS Roma",
  "Lazio": "SS Lazio",
  "Verona": "Hellas Verona",
  "Ein Frankfurt": "Eintracht Frankfurt",
  "Dortmund": "Borussia Dortmund",
  "Bayern Munich": "FC Bayern Munich",
  "Leverkusen": "Bayer Leverkusen",
  "M'gladbach": "Borussia Monchengladbach",
  "Mainz": "Mainz 05",
  "Stuttgart": "VfB Stuttgart",
  "Wolves": "Wolverhampton Wanderers",
  "Man City": "Manchester City",
  "Man United": "Manchester United",
  "Newcastle": "Newcastle United",
  "Nott'm Forest": "Nottingham Forest",
  "Tottenham": "Tottenham Hotspur",
  "West Ham": "West Ham United",
  "Sheffield United": "Sheffield Utd",
};

const KNOWN_LOGOS: Record<string, string> = {
  Arsenal: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/128px-Arsenal_FC.svg.png",
  "Aston Villa": "https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Aston_Villa_logo.svg/128px-Aston_Villa_logo.svg.png",
  Chelsea: "https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/128px-Chelsea_FC.svg.png",
  Liverpool: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/128px-Liverpool_FC.svg.png",
  "Manchester City": "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/128px-Manchester_City_FC_badge.svg.png",
  "Manchester United": "https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/128px-Manchester_United_FC_crest.svg.png",
  "Newcastle United": "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Newcastle_United_Logo.svg/128px-Newcastle_United_Logo.svg.png",
  "Tottenham Hotspur": "https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/128px-Tottenham_Hotspur.svg.png",
  Barcelona: "https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/128px-FC_Barcelona_%28crest%29.svg.png",
  "Real Madrid": "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/128px-Real_Madrid_CF.svg.png",
  "Atletico Madrid": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Atletico_Madrid_2017_logo.svg/128px-Atletico_Madrid_2017_logo.svg.png",
  "Real Sociedad": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/Real_Sociedad_logo.svg/128px-Real_Sociedad_logo.svg.png",
  "Inter Milan": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/128px-FC_Internazionale_Milano_2021.svg.png",
  "AC Milan": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/128px-Logo_of_AC_Milan.svg.png",
  Juventus: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Juventus_FC_2017_logo.svg/128px-Juventus_FC_2017_logo.svg.png",
  Napoli: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/S.S.C._Napoli_logo.svg/128px-S.S.C._Napoli_logo.svg.png",
  "AS Roma": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/AS_Roma_logo_%282017%29.svg/128px-AS_Roma_logo_%282017%29.svg.png",
  "FC Bayern Munich": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/FC_Bayern_M%C3%BCnchen_logo_%282024%29.svg/128px-FC_Bayern_M%C3%BCnchen_logo_%282024%29.svg.png",
  "Borussia Dortmund": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/128px-Borussia_Dortmund_logo.svg.png",
  "Bayer Leverkusen": "https://upload.wikimedia.org/wikipedia/en/thumb/5/59/Bayer_04_Leverkusen_logo.svg/128px-Bayer_04_Leverkusen_logo.svg.png",
  "RB Leipzig": "https://upload.wikimedia.org/wikipedia/en/thumb/0/04/RB_Leipzig_2014_logo.svg/128px-RB_Leipzig_2014_logo.svg.png",
  "Paris Saint-Germain": "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/128px-Paris_Saint-Germain_F.C..svg.png",
  Marseille: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Olympique_Marseille_logo.svg/128px-Olympique_Marseille_logo.svg.png",
  Lyon: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c6/Olympique_Lyonnais.svg/128px-Olympique_Lyonnais.svg.png",
  Monaco: "https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/LogoASMonacoFC2021.svg/128px-LogoASMonacoFC2021.svg.png",
};

const EURO_CLUBS = [
  "Manchester City",
  "Arsenal",
  "Liverpool",
  "Real Madrid",
  "Barcelona",
  "Atletico Madrid",
  "Inter Milan",
  "AC Milan",
  "Juventus",
  "Napoli",
  "FC Bayern Munich",
  "Borussia Dortmund",
  "Bayer Leverkusen",
  "Paris Saint-Germain",
  "Marseille",
  "Monaco",
];

function seasonLabel(code: string) {
  return `20${code.slice(0, 2)}/${code.slice(2)}`;
}

function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && next === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i++;
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  if (current || row.length) {
    row.push(current);
    rows.push(row);
  }

  const headers = rows.shift()?.map((h) => h.trim()) ?? [];
  return rows
    .filter((values) => values.length > 1)
    .map((values) =>
      Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? ""]))
    );
}

function parseDate(date: string, time?: string) {
  const [day, month, year] = date.split("/").map(Number);
  const [hour = 15, minute = 0] = (time || "15:00").split(":").map(Number);
  const fullYear = year < 100 ? 2000 + year : year;
  return new Date(fullYear, month - 1, day, hour, minute);
}

function displayName(name: string) {
  return TEAM_ALIASES[name] ?? name;
}

function shortName(name: string) {
  const parts = name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return parts.map((part) => part[0]).join("").slice(0, 4).toUpperCase();
}

function numberOrNull(value?: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function decimal(value: number) {
  return Math.max(0.15, Math.min(4.5, value)).toFixed(2);
}

function colorFor(name: string, fallback: string) {
  let hash = 0;
  for (const char of name) hash = char.charCodeAt(0) + ((hash << 5) - hash);
  return `#${((hash & 0x00ffffff) | 0x303030).toString(16).slice(-6)}` || fallback;
}

function addFixtureDates(startYear: number, roundIndex: number) {
  const date = new Date(startYear, 7, 16 + roundIndex * 7, 15, 0);
  if (date.getMonth() === 11 && date.getDate() > 20) date.setDate(date.getDate() + 14);
  return date;
}

function generateRoundRobin(teamIds: number[], leagueId: number, startYear: number, source: string) {
  const ids = teamIds.length % 2 === 0 ? [...teamIds] : [...teamIds, -1];
  const rounds = ids.length - 1;
  const half = ids.length / 2;
  const fixtures = [];
  let rotation = [...ids];

  for (let round = 0; round < rounds; round++) {
    const firstLegDate = addFixtureDates(startYear, round);
    const secondLegDate = addFixtureDates(startYear, round + rounds);

    for (let i = 0; i < half; i++) {
      const left = rotation[i];
      const right = rotation[rotation.length - 1 - i];
      if (left === -1 || right === -1) continue;

      const homeFirst = round % 2 === 0 ? left : right;
      const awayFirst = round % 2 === 0 ? right : left;
      fixtures.push({
        homeTeamId: homeFirst,
        awayTeamId: awayFirst,
        leagueId,
        matchDate: firstLegDate,
        homeGoals: 0,
        awayGoals: 0,
        homeXg: "0",
        awayXg: "0",
        status: "SCHEDULED" as const,
        oddsHome: "2.20",
        oddsDraw: "3.30",
        oddsAway: "3.20",
        dataSource: source,
      });
      fixtures.push({
        homeTeamId: awayFirst,
        awayTeamId: homeFirst,
        leagueId,
        matchDate: secondLegDate,
        homeGoals: 0,
        awayGoals: 0,
        homeXg: "0",
        awayXg: "0",
        status: "SCHEDULED" as const,
        oddsHome: "2.20",
        oddsDraw: "3.30",
        oddsAway: "3.20",
        dataSource: source,
      });
    }

    rotation = [rotation[0], rotation[rotation.length - 1], ...rotation.slice(1, -1)];
  }

  return fixtures;
}

async function insertChunks<T extends Record<string, unknown>>(table: any, values: T[], size = 500) {
  const db = getDb();
  const ids: { id: number }[] = [];
  for (let i = 0; i < values.length; i += size) {
    const inserted = (await db.insert(table).values(values.slice(i, i + size)).$returningId()) as {
      id: number;
    }[];
    ids.push(...inserted);
  }
  return ids;
}

async function fetchSeasonRows(season: string, competition: Competition) {
  const url = `https://www.football-data.co.uk/mmz4281/${season}/${competition.code}.csv`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download ${url}: ${response.status}`);
  return parseCsv(await response.text()).filter((row) => row.Date && row.HomeTeam && row.AwayTeam);
}

async function seed() {
  const db = getDb();

  await db.delete(matchEvents);
  await db.delete(players);
  await db.delete(matches);
  await db.delete(teams);
  await db.delete(leagues);

  const latestTeamNamesByCompetition = new Map<string, string[]>();

  for (const season of HISTORICAL_SEASONS) {
    for (const competition of COMPETITIONS) {
      const rows = await fetchSeasonRows(season, competition);
      const leagueIds = await db
        .insert(leagues)
        .values({
          name: competition.name,
          country: competition.country,
          season: seasonLabel(season),
        })
        .$returningId();
      const leagueId = leagueIds[0].id;

      const teamNames = [...new Set(rows.flatMap((row) => [displayName(row.HomeTeam), displayName(row.AwayTeam)]))].sort();
      latestTeamNamesByCompetition.set(competition.code, teamNames);

      const stats = new Map(
        teamNames.map((name) => [
          name,
          {
            played: 0,
            points: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            shotsForHome: 0,
            shotsAgainstHome: 0,
            shotsForAway: 0,
            shotsAgainstAway: 0,
            homeGames: 0,
            awayGames: 0,
          },
        ])
      );

      for (const row of rows) {
        const home = displayName(row.HomeTeam);
        const away = displayName(row.AwayTeam);
        const homeGoals = numberOrNull(row.FTHG);
        const awayGoals = numberOrNull(row.FTAG);
        if (homeGoals === null || awayGoals === null) continue;

        const homeStats = stats.get(home)!;
        const awayStats = stats.get(away)!;
        homeStats.played++;
        awayStats.played++;
        homeStats.homeGames++;
        awayStats.awayGames++;
        homeStats.goalsFor += homeGoals;
        homeStats.goalsAgainst += awayGoals;
        awayStats.goalsFor += awayGoals;
        awayStats.goalsAgainst += homeGoals;
        homeStats.shotsForHome += numberOrNull(row.HS) ?? homeGoals * 4 + 8;
        homeStats.shotsAgainstHome += numberOrNull(row.AS) ?? awayGoals * 4 + 7;
        awayStats.shotsForAway += numberOrNull(row.AS) ?? awayGoals * 4 + 7;
        awayStats.shotsAgainstAway += numberOrNull(row.HS) ?? homeGoals * 4 + 8;

        if (homeGoals > awayGoals) {
          homeStats.points += 3;
          homeStats.wins++;
          awayStats.losses++;
        } else if (homeGoals < awayGoals) {
          awayStats.points += 3;
          awayStats.wins++;
          homeStats.losses++;
        } else {
          homeStats.points++;
          awayStats.points++;
          homeStats.draws++;
          awayStats.draws++;
        }
      }

      const teamIds = await insertChunks(
        teams,
        teamNames.map((name) => {
          const teamStats = stats.get(name)!;
          const homeGames = Math.max(1, teamStats.homeGames);
          const awayGames = Math.max(1, teamStats.awayGames);
          return {
            name,
            shortName: shortName(name),
            leagueId,
            homeXg: decimal(teamStats.shotsForHome / homeGames / 9 + teamStats.goalsFor / Math.max(1, teamStats.played) * 0.2),
            homeXga: decimal(teamStats.shotsAgainstHome / homeGames / 10),
            awayXg: decimal(teamStats.shotsForAway / awayGames / 10 + teamStats.goalsFor / Math.max(1, teamStats.played) * 0.15),
            awayXga: decimal(teamStats.shotsAgainstAway / awayGames / 9),
            fatigueIndex: decimal(0.18 + Math.min(0.55, teamStats.played / 85)),
            color: colorFor(name, competition.color),
            logoUrl: KNOWN_LOGOS[name] ?? null,
            points: teamStats.points,
            wins: teamStats.wins,
            draws: teamStats.draws,
            losses: teamStats.losses,
            goalsFor: teamStats.goalsFor,
            goalsAgainst: teamStats.goalsAgainst,
          };
        })
      );
      const teamIdMap = new Map(teamNames.map((name, index) => [name, teamIds[index].id]));

      await insertChunks(
        matches,
        rows.map((row) => {
          const homeGoals = numberOrNull(row.FTHG);
          const awayGoals = numberOrNull(row.FTAG);
          const finished = homeGoals !== null && awayGoals !== null;
          return {
            homeTeamId: teamIdMap.get(displayName(row.HomeTeam))!,
            awayTeamId: teamIdMap.get(displayName(row.AwayTeam))!,
            leagueId,
            matchDate: parseDate(row.Date, row.Time),
            homeGoals: homeGoals ?? 0,
            awayGoals: awayGoals ?? 0,
            homeXg: finished ? decimal((numberOrNull(row.HS) ?? homeGoals! * 4 + 8) / 9) : "0",
            awayXg: finished ? decimal((numberOrNull(row.AS) ?? awayGoals! * 4 + 7) / 10) : "0",
            status: finished ? ("FINISHED" as const) : ("SCHEDULED" as const),
            oddsHome: row.B365H || row.AvgH || null,
            oddsDraw: row.B365D || row.AvgD || null,
            oddsAway: row.B365A || row.AvgA || null,
            dataSource: SOURCE,
          };
        })
      );

      console.log(`Imported ${competition.name} ${seasonLabel(season)} (${rows.length} matches)`);
    }
  }

  for (const season of FUTURE_SEASONS) {
    const startYear = Number(season.slice(0, 4));
    for (const competition of COMPETITIONS) {
      const teamNames = latestTeamNamesByCompetition.get(competition.code) ?? [];
      const leagueIds = await db
        .insert(leagues)
        .values({ name: competition.name, country: competition.country, season })
        .$returningId();
      const leagueId = leagueIds[0].id;
      const teamIds = await insertChunks(
        teams,
        teamNames.map((name) => ({
          name,
          shortName: shortName(name),
          leagueId,
          homeXg: "1.45",
          homeXga: "1.18",
          awayXg: "1.18",
          awayXga: "1.38",
          fatigueIndex: "0.30",
          color: colorFor(name, competition.color),
          logoUrl: KNOWN_LOGOS[name] ?? null,
          points: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
        }))
      );
      await insertChunks(
        matches,
        generateRoundRobin(
          teamIds.map((team) => team.id),
          leagueId,
          startYear,
          "projected future fixture"
        )
      );
      console.log(`Projected ${competition.name} ${season}`);
    }

    const euroIds = await db
      .insert(leagues)
      .values({ name: "UEFA Club Competitions", country: "Europe", season })
      .$returningId();
    const euroLeagueId = euroIds[0].id;
    const euroTeams = await insertChunks(
      teams,
      EURO_CLUBS.map((name) => ({
        name,
        shortName: shortName(name),
        leagueId: euroLeagueId,
        homeXg: "1.70",
        homeXga: "1.05",
        awayXg: "1.35",
        awayXga: "1.25",
        fatigueIndex: "0.42",
        color: colorFor(name, "#0E1E5B"),
        logoUrl: KNOWN_LOGOS[name] ?? null,
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      }))
    );
    await insertChunks(
      matches,
      generateRoundRobin(
        euroTeams.map((team) => team.id),
        euroLeagueId,
        startYear,
        "projected UEFA fixture"
      ).slice(0, 144)
    );
  }

  console.log("Seed completed with real historical top-5 league data and projected future fixtures.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
