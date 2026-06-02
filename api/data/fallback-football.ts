type Status = "SCHEDULED" | "LIVE" | "FINISHED";

type CsvRow = Record<string, string>;

type FallbackLeague = {
  id: number;
  name: string;
  country: string;
  season: string;
  createdAt: Date;
};

type FallbackTeam = {
  id: number;
  name: string;
  shortName: string;
  leagueId: number;
  homeXg: string;
  homeXga: string;
  awayXg: string;
  awayXga: string;
  fatigueIndex: string;
  color: string;
  logoUrl: string | null;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  createdAt: Date;
};

type FallbackMatch = {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  leagueId: number;
  matchDate: Date;
  homeGoals: number;
  awayGoals: number;
  homeXg: string;
  awayXg: string;
  status: Status;
  oddsHome: string | null;
  oddsDraw: string | null;
  oddsAway: string | null;
  dataSource: string;
  createdAt: Date;
};

type FallbackPlayer = {
  id: number;
  name: string;
  teamId: number;
  position: "GK" | "DEF" | "MID" | "FWD";
  xg: string;
  xa: string;
  minutes: number;
  appearances: number;
  goals: number;
  assists: number;
  createdAt: Date;
};

const COMPETITIONS = [
  { code: "E0", name: "Premier League", country: "England", color: "#3D195B" },
  { code: "SP1", name: "La Liga", country: "Spain", color: "#FF4B44" },
  { code: "I1", name: "Serie A", country: "Italy", color: "#008FD7" },
  { code: "D1", name: "Bundesliga", country: "Germany", color: "#D20515" },
  { code: "F1", name: "Ligue 1", country: "France", color: "#091C3E" },
];

const HISTORICAL_SEASONS = ["2122", "2223", "2324", "2425", "2526"];
const FUTURE_SEASONS = ["2026/27", "2027/28"];

const TEAM_ALIASES: Record<string, string> = {
  "Ath Madrid": "Atletico Madrid",
  Betis: "Real Betis",
  Celta: "Celta Vigo",
  Espanol: "Espanyol",
  Sociedad: "Real Sociedad",
  Vallecano: "Rayo Vallecano",
  "Paris SG": "Paris Saint-Germain",
  Inter: "Inter Milan",
  Milan: "AC Milan",
  Roma: "AS Roma",
  Lazio: "SS Lazio",
  "Ein Frankfurt": "Eintracht Frankfurt",
  Dortmund: "Borussia Dortmund",
  "Bayern Munich": "FC Bayern Munich",
  Leverkusen: "Bayer Leverkusen",
  "M'gladbach": "Borussia Monchengladbach",
  Mainz: "Mainz 05",
  Wolves: "Wolverhampton Wanderers",
  "Man City": "Manchester City",
  "Man United": "Manchester United",
  Newcastle: "Newcastle United",
  "Nott'm Forest": "Nottingham Forest",
  Tottenham: "Tottenham Hotspur",
  "West Ham": "West Ham United",
};

const LOGOS: Record<string, string> = {
  Arsenal: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/128px-Arsenal_FC.svg.png",
  Chelsea: "https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/128px-Chelsea_FC.svg.png",
  Liverpool: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/128px-Liverpool_FC.svg.png",
  "Manchester City": "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/128px-Manchester_City_FC_badge.svg.png",
  "Manchester United": "https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/128px-Manchester_United_FC_crest.svg.png",
  "Newcastle United": "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Newcastle_United_Logo.svg/128px-Newcastle_United_Logo.svg.png",
  "Tottenham Hotspur": "https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/128px-Tottenham_Hotspur.svg.png",
  Barcelona: "https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/128px-FC_Barcelona_%28crest%29.svg.png",
  "Real Madrid": "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/128px-Real_Madrid_CF.svg.png",
  "Atletico Madrid": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Atletico_Madrid_2017_logo.svg/128px-Atletico_Madrid_2017_logo.svg.png",
  "Inter Milan": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/128px-FC_Internazionale_Milano_2021.svg.png",
  "AC Milan": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/128px-Logo_of_AC_Milan.svg.png",
  Juventus: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Juventus_FC_2017_logo.svg/128px-Juventus_FC_2017_logo.svg.png",
  Napoli: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/S.S.C._Napoli_logo.svg/128px-S.S.C._Napoli_logo.svg.png",
  "FC Bayern Munich": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/FC_Bayern_M%C3%BCnchen_logo_%282024%29.svg/128px-FC_Bayern_M%C3%BCnchen_logo_%282024%29.svg.png",
  "Borussia Dortmund": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/128px-Borussia_Dortmund_logo.svg.png",
  "Bayer Leverkusen": "https://upload.wikimedia.org/wikipedia/en/thumb/5/59/Bayer_04_Leverkusen_logo.svg/128px-Bayer_04_Leverkusen_logo.svg.png",
  "Paris Saint-Germain": "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/128px-Paris_Saint-Germain_F.C..svg.png",
  Marseille: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Olympique_Marseille_logo.svg/128px-Olympique_Marseille_logo.svg.png",
};

const KNOWN_PLAYERS: Record<string, Array<{ name: string; position: FallbackPlayer["position"] }>> = {
  Arsenal: [
    { name: "Bukayo Saka", position: "FWD" },
    { name: "Martin Odegaard", position: "MID" },
    { name: "Declan Rice", position: "MID" },
  ],
  Liverpool: [
    { name: "Mohamed Salah", position: "FWD" },
    { name: "Luis Diaz", position: "FWD" },
    { name: "Virgil van Dijk", position: "DEF" },
  ],
  "Manchester City": [
    { name: "Erling Haaland", position: "FWD" },
    { name: "Phil Foden", position: "MID" },
    { name: "Rodri", position: "MID" },
  ],
  Chelsea: [
    { name: "Cole Palmer", position: "MID" },
    { name: "Enzo Fernandez", position: "MID" },
    { name: "Reece James", position: "DEF" },
  ],
  "Real Madrid": [
    { name: "Vinicius Junior", position: "FWD" },
    { name: "Jude Bellingham", position: "MID" },
    { name: "Kylian Mbappe", position: "FWD" },
  ],
  Barcelona: [
    { name: "Lamine Yamal", position: "FWD" },
    { name: "Pedri", position: "MID" },
    { name: "Robert Lewandowski", position: "FWD" },
  ],
  "Atletico Madrid": [
    { name: "Antoine Griezmann", position: "FWD" },
    { name: "Julian Alvarez", position: "FWD" },
    { name: "Jan Oblak", position: "GK" },
  ],
  "Inter Milan": [
    { name: "Lautaro Martinez", position: "FWD" },
    { name: "Nicolo Barella", position: "MID" },
    { name: "Hakan Calhanoglu", position: "MID" },
  ],
  "AC Milan": [
    { name: "Rafael Leao", position: "FWD" },
    { name: "Christian Pulisic", position: "FWD" },
    { name: "Mike Maignan", position: "GK" },
  ],
  Juventus: [
    { name: "Dusan Vlahovic", position: "FWD" },
    { name: "Federico Chiesa", position: "FWD" },
    { name: "Gleison Bremer", position: "DEF" },
  ],
  Napoli: [
    { name: "Victor Osimhen", position: "FWD" },
    { name: "Khvicha Kvaratskhelia", position: "FWD" },
    { name: "Stanislav Lobotka", position: "MID" },
  ],
  "FC Bayern Munich": [
    { name: "Harry Kane", position: "FWD" },
    { name: "Jamal Musiala", position: "MID" },
    { name: "Joshua Kimmich", position: "MID" },
  ],
  "Borussia Dortmund": [
    { name: "Julian Brandt", position: "MID" },
    { name: "Karim Adeyemi", position: "FWD" },
    { name: "Nico Schlotterbeck", position: "DEF" },
  ],
  "Bayer Leverkusen": [
    { name: "Florian Wirtz", position: "MID" },
    { name: "Patrik Schick", position: "FWD" },
    { name: "Granit Xhaka", position: "MID" },
  ],
  "Paris Saint-Germain": [
    { name: "Ousmane Dembele", position: "FWD" },
    { name: "Vitinha", position: "MID" },
    { name: "Achraf Hakimi", position: "DEF" },
  ],
  Marseille: [
    { name: "Pierre-Emerick Aubameyang", position: "FWD" },
    { name: "Amine Harit", position: "MID" },
    { name: "Leonardo Balerdi", position: "DEF" },
  ],
};

const SQUAD_TEMPLATES: Array<{ suffix: string; position: FallbackPlayer["position"]; weight: number }> = [
  { suffix: "shot stopper", position: "GK", weight: 0.16 },
  { suffix: "sweeper keeper", position: "GK", weight: 0.13 },
  { suffix: "right back", position: "DEF", weight: 0.2 },
  { suffix: "centre back", position: "DEF", weight: 0.24 },
  { suffix: "left back", position: "DEF", weight: 0.18 },
  { suffix: "holding midfielder", position: "MID", weight: 0.3 },
  { suffix: "box to box midfielder", position: "MID", weight: 0.38 },
  { suffix: "creative midfielder", position: "MID", weight: 0.48 },
  { suffix: "right winger", position: "FWD", weight: 0.62 },
  { suffix: "left winger", position: "FWD", weight: 0.58 },
  { suffix: "centre forward", position: "FWD", weight: 0.78 },
  { suffix: "pressing forward", position: "FWD", weight: 0.52 },
];

const REAL_PLAYER_POOL: Record<FallbackPlayer["position"], string[]> = {
  GK: [
    "David Raya",
    "Alisson Becker",
    "Gianluigi Donnarumma",
    "Mike Maignan",
    "Jan Oblak",
    "Thibaut Courtois",
    "Marc-Andre ter Stegen",
    "Gregor Kobel",
    "Manuel Neuer",
    "Guglielmo Vicario",
    "Emiliano Martinez",
    "Andre Onana",
    "Diogo Costa",
    "Yann Sommer",
    "Lucas Chevalier",
    "Giorgi Mamardashvili",
    "Wojciech Szczesny",
    "Alex Meret",
    "Nick Pope",
    "Kepa Arrizabalaga",
    "Ederson",
    "Stefan Ortega",
    "Robert Sanchez",
    "Bart Verbruggen",
    "Jordan Pickford",
    "Dean Henderson",
    "Bernd Leno",
    "Mark Flekken",
    "Matz Sels",
    "Oliver Baumann",
    "Alexander Nubel",
    "Peter Gulacsi",
    "Kevin Trapp",
    "Noah Atubolu",
    "Alex Remiro",
    "Unai Simon",
    "Rui Silva",
    "Paulo Gazzaniga",
    "Ivan Provedel",
    "Marco Carnesecchi",
    "Michele Di Gregorio",
    "Vanja Milinkovic-Savic",
    "Brice Samba",
    "Lucas Perri",
    "Marcin Bulka",
    "Guillaume Restes",
    "Walter Benitez",
    "Andriy Lunin",
    "Juan Musso",
    "Predrag Rajkovic",
  ],
  DEF: [
    "William Saliba",
    "Virgil van Dijk",
    "Ruben Dias",
    "Gabriel Magalhaes",
    "Achraf Hakimi",
    "Alessandro Bastoni",
    "Theo Hernandez",
    "Antonio Rudiger",
    "Jules Kounde",
    "Dayot Upamecano",
    "Pau Cubarsi",
    "Marc Guehi",
    "Micky van de Ven",
    "Denzel Dumfries",
    "Federico Dimarco",
    "Nico Schlotterbeck",
    "Jonathan Tah",
    "Robin Le Normand",
    "Piero Hincapie",
    "Ben White",
    "Reece James",
    "Trent Alexander-Arnold",
    "Andrew Robertson",
    "Lisandro Martinez",
    "Matthijs de Ligt",
    "Kalidou Koulibaly",
    "Ronald Araujo",
    "Eder Militao",
    "Ferland Mendy",
    "Marquinhos",
    "Josko Gvardiol",
    "Nathan Ake",
    "Manuel Akanji",
    "Ibrahima Konate",
    "Milos Kerkez",
    "Pedro Porro",
    "Cristian Romero",
    "Destiny Udogie",
    "Ezri Konsa",
    "Pau Torres",
    "Jarrad Branthwaite",
    "Lewis Hall",
    "Dan Burn",
    "Tino Livramento",
    "Marc Cucurella",
    "Levi Colwill",
    "Wesley Fofana",
    "Alejandro Balde",
    "Dani Carvajal",
    "David Alaba",
    "Min-Jae Kim",
    "Alphonso Davies",
    "Jeremie Frimpong",
    "Edmond Tapsoba",
    "Willi Orban",
    "Mats Hummels",
    "Bremer",
    "Federico Gatti",
    "Giovanni Di Lorenzo",
    "Amir Rrahmani",
  ],
  MID: [
    "Jude Bellingham",
    "Rodri",
    "Martin Odegaard",
    "Pedri",
    "Jamal Musiala",
    "Florian Wirtz",
    "Federico Valverde",
    "Declan Rice",
    "Nicolo Barella",
    "Vitinha",
    "Bruno Fernandes",
    "Kevin De Bruyne",
    "Bernardo Silva",
    "Alexis Mac Allister",
    "Dominik Szoboszlai",
    "Enzo Fernandez",
    "Moises Caicedo",
    "Aurelien Tchouameni",
    "Eduardo Camavinga",
    "Frenkie de Jong",
    "Joshua Kimmich",
    "Granit Xhaka",
    "Hakan Calhanoglu",
    "Teun Koopmeiners",
    "Sandro Tonali",
    "Bruno Guimaraes",
    "Joao Neves",
    "Warren Zaire-Emery",
    "Xavi Simons",
    "Cole Palmer",
    "Mikel Merino",
    "Kai Havertz",
    "Curtis Jones",
    "Ryan Gravenberch",
    "Ilkay Gundogan",
    "Mateo Kovacic",
    "Mason Mount",
    "Kobbie Mainoo",
    "James Maddison",
    "Yves Bissouma",
    "Morgan Rogers",
    "Youri Tielemans",
    "Morgan Gibbs-White",
    "Martin Zubimendi",
    "Gavi",
    "Dani Olmo",
    "Fermin Lopez",
    "Leon Goretzka",
    "Konrad Laimer",
    "Aleix Garcia",
    "Exequiel Palacios",
    "Adrien Rabiot",
    "Manuel Locatelli",
    "Scott McTominay",
    "Fabian Ruiz",
    "Khephren Thuram",
    "Angel Gomes",
    "Maghnes Akliouche",
    "Edon Zhegrova",
  ],
  FWD: [
    "Erling Haaland",
    "Kylian Mbappe",
    "Mohamed Salah",
    "Vinicius Junior",
    "Bukayo Saka",
    "Harry Kane",
    "Lamine Yamal",
    "Robert Lewandowski",
    "Lautaro Martinez",
    "Victor Osimhen",
    "Khvicha Kvaratskhelia",
    "Rafael Leao",
    "Ousmane Dembele",
    "Phil Foden",
    "Luis Diaz",
    "Julian Alvarez",
    "Antoine Griezmann",
    "Rodrygo",
    "Raphinha",
    "Nico Williams",
    "Alexander Isak",
    "Ollie Watkins",
    "Viktor Gyokeres",
    "Benjamin Sesko",
    "Dusan Vlahovic",
    "Marcus Thuram",
    "Christian Pulisic",
    "Karim Adeyemi",
    "Bradley Barcola",
    "Serhou Guirassy",
    "Gabriel Martinelli",
    "Gabriel Jesus",
    "Darwin Nunez",
    "Cody Gakpo",
    "Diogo Jota",
    "Jeremy Doku",
    "Jack Grealish",
    "Savinho",
    "Nicolas Jackson",
    "Noni Madueke",
    "Christopher Nkunku",
    "Marcus Rashford",
    "Rasmus Hojlund",
    "Son Heung-min",
    "Brennan Johnson",
    "Dominic Solanke",
    "Anthony Gordon",
    "Bryan Mbeumo",
    "Jarrod Bowen",
    "Takefusa Kubo",
    "Ferran Torres",
    "Goncalo Ramos",
    "Desire Doue",
    "Jonathan David",
    "Jonathan Burkardt",
    "Lois Openda",
    "Victor Boniface",
    "Michael Olise",
    "Leroy Sane",
    "Kingsley Coman",
  ],
};

let cache:
  | {
      leagues: FallbackLeague[];
      teams: FallbackTeam[];
      matches: FallbackMatch[];
      players: FallbackPlayer[];
    }
  | undefined;

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift()?.split(",") ?? [];
  return lines.map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? ""]));
  });
}

function seasonLabel(code: string) {
  return `20${code.slice(0, 2)}/${code.slice(2)}`;
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

function colorFor(name: string, fallback: string) {
  let hash = 0;
  for (const char of name) hash = char.charCodeAt(0) + ((hash << 5) - hash);
  return `#${((hash & 0x00ffffff) | 0x303030).toString(16).slice(-6)}` || fallback;
}

function num(value?: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function decimal(value: number) {
  return Math.max(0.15, Math.min(4.5, value)).toFixed(2);
}

function parseDate(date: string, time?: string) {
  const [day, month, year] = date.split("/").map(Number);
  const [hour = 15, minute = 0] = (time || "15:00").split(":").map(Number);
  return new Date(year < 100 ? 2000 + year : year, month - 1, day, hour, minute);
}

function fixtureDate(startYear: number, round: number) {
  const date = new Date(startYear, 7, 16 + round * 7, 15, 0);
  if (date.getMonth() === 11 && date.getDate() > 20) date.setDate(date.getDate() + 14);
  return date;
}

function generateFixtures(teamIds: number[], leagueId: number, startYear: number, nextId: () => number) {
  const ids = teamIds.length % 2 === 0 ? [...teamIds] : [...teamIds, -1];
  const rounds = ids.length - 1;
  const half = ids.length / 2;
  const fixtures: FallbackMatch[] = [];
  let rotation = [...ids];

  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < half; i++) {
      const left = rotation[i];
      const right = rotation[rotation.length - 1 - i];
      if (left === -1 || right === -1) continue;
      const home = round % 2 === 0 ? left : right;
      const away = round % 2 === 0 ? right : left;
      for (const [h, a, leg] of [
        [home, away, 0],
        [away, home, rounds],
      ] as const) {
        fixtures.push({
          id: nextId(),
          homeTeamId: h,
          awayTeamId: a,
          leagueId,
          matchDate: fixtureDate(startYear, round + leg),
          homeGoals: 0,
          awayGoals: 0,
          homeXg: "0",
          awayXg: "0",
          status: "SCHEDULED",
          oddsHome: "2.20",
          oddsDraw: "3.30",
          oddsAway: "3.20",
          dataSource: "projected future fixture",
          createdAt: new Date(),
        });
      }
    }
    rotation = [rotation[0], rotation[rotation.length - 1], ...rotation.slice(1, -1)];
  }
  return fixtures;
}

async function fetchRows(season: string, code: string) {
  const response = await fetch(`https://www.football-data.co.uk/mmz4281/${season}/${code}.csv`);
  if (!response.ok) return [];
  return parseCsv(await response.text()).filter((row) => row.Date && row.HomeTeam && row.AwayTeam);
}

async function buildFallbackData() {
  let leagueId = 1;
  let teamId = 1;
  let matchId = 1;
  const leagues: FallbackLeague[] = [];
  const teams: FallbackTeam[] = [];
  const matches: FallbackMatch[] = [];
  const players: FallbackPlayer[] = [];
  let playerId = 1;
  const latestTeams = new Map<string, string[]>();
  const nextMatchId = () => matchId++;
  const realPlayerName = (
    team: FallbackTeam,
    position: FallbackPlayer["position"],
    index: number,
    reservedNames: Set<string>
  ) => {
    const pool = REAL_PLAYER_POOL[position];
    const start = (team.id * 7 + index * 11) % pool.length;

    for (let offset = 0; offset < pool.length; offset++) {
      const candidate = pool[(start + offset) % pool.length];
      if (!reservedNames.has(candidate)) return candidate;
    }

    return pool[start];
  };

  const addPlayers = (team: FallbackTeam) => {
    const knownRoster = KNOWN_PLAYERS[team.name] ?? [];
    const knownNames = new Set(knownRoster.map(player => player.name));
    const roster = [
      ...knownRoster.map((player, index) => ({
        ...player,
        weight:
          player.position === "FWD"
            ? 0.82 - index * 0.08
            : player.position === "MID"
              ? 0.58 - index * 0.06
              : player.position === "GK"
                ? 0.18
                : 0.32,
      })),
      ...SQUAD_TEMPLATES.map(profile => ({
        name: realPlayerName(team, profile.position, profile.weight * 100, knownNames),
        position: profile.position,
        weight: profile.weight,
      })),
    ].slice(0, 14);
    const teamAttack = Number(team.homeXg) + Number(team.awayXg);
    const teamDefense = Number(team.homeXga) + Number(team.awayXga);
    const teamStrength = Math.max(0.65, Math.min(1.45, (teamAttack + 3.2 - teamDefense) / 3.2));

    roster.forEach((profile, index) => {
      const isForward = profile.position === "FWD";
      const isMid = profile.position === "MID";
      const isDef = profile.position === "DEF";
      const isGk = profile.position === "GK";
      const variation = 0.82 + ((team.id * 17 + index * 23) % 34) / 100;
      const minutes = Math.round((isGk ? 1700 : 900) + profile.weight * 2100 * variation);
      const appearances = Math.max(8, Math.min(38, Math.round(minutes / 92)));
      const xgValue =
        teamAttack *
        profile.weight *
        variation *
        (isForward ? 0.27 : isMid ? 0.15 : isDef ? 0.06 : 0.01);
      const xaValue =
        teamAttack *
        profile.weight *
        (1.08 - Math.abs(1 - variation)) *
        (isMid ? 0.24 : isForward ? 0.13 : isDef ? 0.09 : 0.02);

      players.push({
        id: playerId++,
        name: profile.name,
        teamId: team.id,
        position: profile.position,
        xg: decimal(xgValue),
        xa: decimal(xaValue),
        minutes,
        appearances,
        goals: Math.max(0, Math.round((xgValue * 8.5 + (isForward ? 4 : isMid ? 2 : 0)) * teamStrength)),
        assists: Math.max(0, Math.round((xaValue * 8 + (isMid ? 4 : isForward ? 2 : isDef ? 1 : 0)) * teamStrength)),
        createdAt: new Date(),
      });
    });
  };

  for (const season of HISTORICAL_SEASONS) {
    for (const competition of COMPETITIONS) {
      const rows = await fetchRows(season, competition.code);
      if (!rows.length) continue;

      const currentLeagueId = leagueId++;
      leagues.push({
        id: currentLeagueId,
        name: competition.name,
        country: competition.country,
        season: seasonLabel(season),
        createdAt: new Date(),
      });

      const names = [...new Set(rows.flatMap((row) => [displayName(row.HomeTeam), displayName(row.AwayTeam)]))].sort();
      latestTeams.set(competition.code, names);
      const stats = new Map(
        names.map((name) => [
          name,
          {
            points: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            homeShots: 0,
            awayShots: 0,
            homeAgainst: 0,
            awayAgainst: 0,
            homeGames: 0,
            awayGames: 0,
          },
        ])
      );

      for (const row of rows) {
        const home = displayName(row.HomeTeam);
        const away = displayName(row.AwayTeam);
        const homeGoals = num(row.FTHG);
        const awayGoals = num(row.FTAG);
        if (homeGoals === null || awayGoals === null) continue;

        const homeStats = stats.get(home)!;
        const awayStats = stats.get(away)!;
        homeStats.homeGames++;
        awayStats.awayGames++;
        homeStats.goalsFor += homeGoals;
        homeStats.goalsAgainst += awayGoals;
        awayStats.goalsFor += awayGoals;
        awayStats.goalsAgainst += homeGoals;
        homeStats.homeShots += num(row.HS) ?? homeGoals * 4 + 8;
        homeStats.homeAgainst += num(row.AS) ?? awayGoals * 4 + 7;
        awayStats.awayShots += num(row.AS) ?? awayGoals * 4 + 7;
        awayStats.awayAgainst += num(row.HS) ?? homeGoals * 4 + 8;

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

      const ids = new Map<string, number>();
      for (const name of names) {
        const currentTeamId = teamId++;
        ids.set(name, currentTeamId);
        const s = stats.get(name)!;
        const played = s.wins + s.draws + s.losses;
        const team: FallbackTeam = {
          id: currentTeamId,
          name,
          shortName: shortName(name),
          leagueId: currentLeagueId,
          homeXg: decimal(s.homeShots / Math.max(1, s.homeGames) / 9),
          homeXga: decimal(s.homeAgainst / Math.max(1, s.homeGames) / 10),
          awayXg: decimal(s.awayShots / Math.max(1, s.awayGames) / 10),
          awayXga: decimal(s.awayAgainst / Math.max(1, s.awayGames) / 9),
          fatigueIndex: decimal(0.18 + Math.min(0.55, played / 85)),
          color: colorFor(name, competition.color),
          logoUrl: LOGOS[name] ?? null,
          points: s.points,
          wins: s.wins,
          draws: s.draws,
          losses: s.losses,
          goalsFor: s.goalsFor,
          goalsAgainst: s.goalsAgainst,
          createdAt: new Date(),
        };
        teams.push(team);
        if (season === "2526") addPlayers(team);
      }

      for (const row of rows) {
        const homeGoals = num(row.FTHG);
        const awayGoals = num(row.FTAG);
        const finished = homeGoals !== null && awayGoals !== null;
        matches.push({
          id: nextMatchId(),
          homeTeamId: ids.get(displayName(row.HomeTeam))!,
          awayTeamId: ids.get(displayName(row.AwayTeam))!,
          leagueId: currentLeagueId,
          matchDate: parseDate(row.Date, row.Time),
          homeGoals: homeGoals ?? 0,
          awayGoals: awayGoals ?? 0,
          homeXg: finished ? decimal((num(row.HS) ?? homeGoals! * 4 + 8) / 9) : "0",
          awayXg: finished ? decimal((num(row.AS) ?? awayGoals! * 4 + 7) / 10) : "0",
          status: finished ? "FINISHED" : "SCHEDULED",
          oddsHome: row.B365H || row.AvgH || null,
          oddsDraw: row.B365D || row.AvgD || null,
          oddsAway: row.B365A || row.AvgA || null,
          dataSource: "football-data.co.uk",
          createdAt: new Date(),
        });
      }
    }
  }

  for (const season of FUTURE_SEASONS) {
    for (const competition of COMPETITIONS) {
      const currentLeagueId = leagueId++;
      const startYear = Number(season.slice(0, 4));
      leagues.push({ id: currentLeagueId, name: competition.name, country: competition.country, season, createdAt: new Date() });
      const ids: number[] = [];
      for (const name of latestTeams.get(competition.code) ?? []) {
        const currentTeamId = teamId++;
        ids.push(currentTeamId);
        const team: FallbackTeam = {
          id: currentTeamId,
          name,
          shortName: shortName(name),
          leagueId: currentLeagueId,
          homeXg: "1.45",
          homeXga: "1.18",
          awayXg: "1.18",
          awayXga: "1.38",
          fatigueIndex: "0.30",
          color: colorFor(name, competition.color),
          logoUrl: LOGOS[name] ?? null,
          points: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          createdAt: new Date(),
        };
        teams.push(team);
        addPlayers(team);
      }
      matches.push(...generateFixtures(ids, currentLeagueId, startYear, nextMatchId));
    }
  }

  return { leagues, teams, matches, players };
}

export async function getFallbackFootballData() {
  cache ??= await buildFallbackData();
  return cache;
}
