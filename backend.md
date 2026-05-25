# StatKick Backend Design

## Database Schema

### leagues
- id: serial PK
- name: varchar(100) not null
- country: varchar(100)
- logo: text
- season: varchar(20)

### teams
- id: serial PK
- name: varchar(100) not null
- shortName: varchar(10)
- leagueId: bigint unsigned FK → leagues.id
- homeXg: decimal(4,2) default 0
- homeXga: decimal(4,2) default 0
- awayXg: decimal(4,2) default 0
- awayXga: decimal(4,2) default 0
- fatigueIndex: decimal(4,2) default 0
- color: varchar(7) default '#3B82F6'

### players
- id: serial PK
- name: varchar(100) not null
- teamId: bigint unsigned FK → teams.id
- position: enum('GK','DEF','MID','FWD')
- xg: decimal(4,2) default 0
- xa: decimal(4,2) default 0
- minutes: int default 0
- appearances: int default 0

### matches
- id: serial PK
- homeTeamId: bigint unsigned FK → teams.id
- awayTeamId: bigint unsigned FK → teams.id
- leagueId: bigint unsigned FK → leagues.id
- matchDate: timestamp
- homeGoals: int default 0
- awayGoals: int default 0
- homeXg: decimal(4,2) default 0
- awayXg: decimal(4,2) default 0
- status: enum('SCHEDULED','LIVE','FINISHED') default 'SCHEDULED'
- oddsHome: decimal(4,2)
- oddsDraw: decimal(4,2)
- oddsAway: decimal(4,2)

### match_events
- id: serial PK
- matchId: bigint unsigned FK → matches.id
- minute: int
- type: enum('GOAL','ASSIST','YELLOW_CARD','RED_CARD','SUBSTITUTION')
- playerName: varchar(100)
- team: enum('HOME','AWAY')

## API Design (tRPC Routers)

### matchRouter
- match.list — список матчей с фильтром по лиге и дате
  Input: { leagueId?: number, dateFrom?: Date, dateTo?: Date }
  Output: Match[]

- match.getById — детали матча
  Input: { id: number }
  Output: Match with teams, H2H history

- match.predict — прогноз на матч (Пуассон + Fatigue Index)
  Input: { matchId: number }
  Output: { probabilities: { homeWin, draw, awayWin }, mostLikelyScore, homeXg, awayXg }

- match.upsets — детектор сенсаций
  Input: {}
  Output: Match[] where underdog probability > bookmaker expectation by 15%

### leagueRouter
- league.list — список лиг
  Output: League[]

- league.simulate — симуляция Монте-Карло
  Input: { leagueId: number }
  Output: { standings: TeamStanding[], championProbabilities: Record<number, number> }

- league.standings — текущая таблица
  Input: { leagueId: number }
  Output: Standing[]

### playerRouter
- player.list — список игроков
  Input: { teamId?: number, leagueId?: number }
  Output: Player[]

- player.transferSimulate — симуляция трансфера
  Input: { playerId: number, fromTeamId: number, toTeamId: number }
  Output: { newTeamXg, impactPercentage }

### methodologyRouter (public, no auth)
- methodology.get — описание методологии
  Output: { sections: MethodologySection[] }

## Data Flow

1. Frontend calls tRPC queries
2. Backend uses Drizzle ORM to query MySQL
3. Math calculations (Poisson, Monte Carlo) happen in API layer
4. Results returned via superjson

## Seed Data

- 5 leagues: Premier League, La Liga, Serie A, Bundesliga, Ligue 1
- 20 teams per league (top teams from each)
- ~200 players across teams
- ~50 matches (mix of scheduled and finished)
- Match events for finished games
