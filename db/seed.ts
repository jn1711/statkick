import { getDb } from "../api/queries/connection";
import { leagues, teams, players, matches, matchEvents } from "./schema";

async function seed() {
  const db = getDb();

  // Insert Leagues
  const insertedLeagues = await db.insert(leagues).values([
    { name: "Premier League", country: "England", season: "2025/26" },
    { name: "La Liga", country: "Spain", season: "2025/26" },
    { name: "Serie A", country: "Italy", season: "2025/26" },
    { name: "Bundesliga", country: "Germany", season: "2025/26" },
    { name: "Ligue 1", country: "France", season: "2025/26" },
  ]).$returningId();

  const plId = insertedLeagues[0].id;
  const laligaId = insertedLeagues[1].id;
  const serieId = insertedLeagues[2].id;
  const bundesId = insertedLeagues[3].id;
  const ligueId = insertedLeagues[4].id;

  // Insert Teams
  const teamData = [
    // Premier League
    { name: "Manchester City", shortName: "MCI", leagueId: plId, homeXg: "2.1", homeXga: "0.8", awayXg: "1.8", awayXga: "0.9", fatigueIndex: "0.35", color: "#6CABDD", points: 78, wins: 25, draws: 3, losses: 4, goalsFor: 72, goalsAgainst: 28 },
    { name: "Liverpool", shortName: "LIV", leagueId: plId, homeXg: "1.9", homeXga: "0.9", awayXg: "1.7", awayXga: "1.0", fatigueIndex: "0.42", color: "#C8102E", points: 72, wins: 22, draws: 6, losses: 4, goalsFor: 65, goalsAgainst: 32 },
    { name: "Arsenal", shortName: "ARS", leagueId: plId, homeXg: "1.8", homeXga: "0.7", awayXg: "1.6", awayXga: "0.8", fatigueIndex: "0.38", color: "#EF0107", points: 70, wins: 21, draws: 7, losses: 4, goalsFor: 62, goalsAgainst: 26 },
    { name: "Manchester United", shortName: "MUN", leagueId: plId, homeXg: "1.5", homeXga: "1.2", awayXg: "1.3", awayXga: "1.4", fatigueIndex: "0.55", color: "#DA291C", points: 54, wins: 16, draws: 6, losses: 10, goalsFor: 48, goalsAgainst: 42 },
    { name: "Chelsea", shortName: "CHE", leagueId: plId, homeXg: "1.6", homeXga: "1.1", awayXg: "1.4", awayXga: "1.3", fatigueIndex: "0.48", color: "#034694", points: 52, wins: 15, draws: 7, losses: 10, goalsFor: 50, goalsAgainst: 40 },
    { name: "Tottenham", shortName: "TOT", leagueId: plId, homeXg: "1.7", homeXga: "1.3", awayXg: "1.5", awayXga: "1.5", fatigueIndex: "0.50", color: "#132257", points: 50, wins: 15, draws: 5, losses: 12, goalsFor: 55, goalsAgainst: 48 },
    { name: "Newcastle United", shortName: "NEW", leagueId: plId, homeXg: "1.4", homeXga: "1.0", awayXg: "1.2", awayXga: "1.3", fatigueIndex: "0.45", color: "#241F20", points: 48, wins: 14, draws: 6, losses: 12, goalsFor: 45, goalsAgainst: 38 },
    { name: "Aston Villa", shortName: "AVL", leagueId: plId, homeXg: "1.6", homeXga: "1.2", awayXg: "1.1", awayXga: "1.5", fatigueIndex: "0.52", color: "#95BFE5", points: 46, wins: 13, draws: 7, losses: 12, goalsFor: 42, goalsAgainst: 40 },
    // La Liga
    { name: "Real Madrid", shortName: "RMA", leagueId: laligaId, homeXg: "2.0", homeXga: "0.7", awayXg: "1.9", awayXga: "0.8", fatigueIndex: "0.32", color: "#FEBE10", points: 76, wins: 24, draws: 4, losses: 4, goalsFor: 70, goalsAgainst: 25 },
    { name: "Barcelona", shortName: "BAR", leagueId: laligaId, homeXg: "1.9", homeXga: "0.8", awayXg: "1.7", awayXga: "0.9", fatigueIndex: "0.36", color: "#A50044", points: 74, wins: 23, draws: 5, losses: 4, goalsFor: 68, goalsAgainst: 28 },
    { name: "Atletico Madrid", shortName: "ATM", leagueId: laligaId, homeXg: "1.6", homeXga: "0.7", awayXg: "1.3", awayXga: "0.9", fatigueIndex: "0.40", color: "#CB3524", points: 66, wins: 20, draws: 6, losses: 6, goalsFor: 55, goalsAgainst: 24 },
    { name: "Sevilla", shortName: "SEV", leagueId: laligaId, homeXg: "1.4", homeXga: "1.1", awayXg: "1.1", awayXga: "1.3", fatigueIndex: "0.48", color: "#FFFFFF", points: 44, wins: 12, draws: 8, losses: 12, goalsFor: 38, goalsAgainst: 40 },
    // Serie A
    { name: "Inter Milan", shortName: "INT", leagueId: serieId, homeXg: "1.8", homeXga: "0.6", awayXg: "1.6", awayXga: "0.8", fatigueIndex: "0.34", color: "#010E80", points: 75, wins: 23, draws: 6, losses: 3, goalsFor: 68, goalsAgainst: 22 },
    { name: "AC Milan", shortName: "ACM", leagueId: serieId, homeXg: "1.7", homeXga: "0.9", awayXg: "1.5", awayXga: "1.0", fatigueIndex: "0.40", color: "#FB090B", points: 65, wins: 20, draws: 5, losses: 7, goalsFor: 58, goalsAgainst: 32 },
    { name: "Juventus", shortName: "JUV", leagueId: serieId, homeXg: "1.5", homeXga: "0.8", awayXg: "1.3", awayXga: "0.9", fatigueIndex: "0.38", color: "#FFFFFF", points: 62, wins: 18, draws: 8, losses: 6, goalsFor: 48, goalsAgainst: 26 },
    { name: "Napoli", shortName: "NAP", leagueId: serieId, homeXg: "1.6", homeXga: "1.0", awayXg: "1.4", awayXga: "1.2", fatigueIndex: "0.46", color: "#12A0D7", points: 56, wins: 16, draws: 8, losses: 8, goalsFor: 52, goalsAgainst: 35 },
    // Bundesliga
    { name: "Bayern Munich", shortName: "BAY", leagueId: bundesId, homeXg: "2.2", homeXga: "0.6", awayXg: "2.0", awayXga: "0.7", fatigueIndex: "0.30", color: "#DC052D", points: 80, wins: 26, draws: 2, losses: 4, goalsFor: 82, goalsAgainst: 22 },
    { name: "Borussia Dortmund", shortName: "BVB", leagueId: bundesId, homeXg: "1.9", homeXga: "0.9", awayXg: "1.6", awayXga: "1.2", fatigueIndex: "0.44", color: "#FDE100", points: 62, wins: 19, draws: 5, losses: 8, goalsFor: 60, goalsAgainst: 35 },
    { name: "Bayer Leverkusen", shortName: "B04", leagueId: bundesId, homeXg: "1.7", homeXga: "0.9", awayXg: "1.5", awayXga: "1.1", fatigueIndex: "0.41", color: "#E32219", points: 64, wins: 19, draws: 7, losses: 6, goalsFor: 58, goalsAgainst: 30 },
    // Ligue 1
    { name: "Paris Saint-Germain", shortName: "PSG", leagueId: ligueId, homeXg: "2.1", homeXga: "0.7", awayXg: "1.9", awayXga: "0.8", fatigueIndex: "0.33", color: "#004170", points: 78, wins: 25, draws: 3, losses: 4, goalsFor: 75, goalsAgainst: 25 },
    { name: "Marseille", shortName: "OM", leagueId: ligueId, homeXg: "1.5", homeXga: "1.0", awayXg: "1.2", awayXga: "1.3", fatigueIndex: "0.47", color: "#00B9F1", points: 52, wins: 15, draws: 7, losses: 10, goalsFor: 45, goalsAgainst: 38 },
  ];

  const insertedTeams = await db.insert(teams).values(teamData).$returningId();
  const teamIds = insertedTeams.map(t => t.id);

  // Insert Players (top players from each team)
  const playerData = [
    // Man City players
    { name: "Erling Haaland", teamId: teamIds[0], position: "FWD" as const, xg: "0.85", xa: "0.15", minutes: 2520, appearances: 28, goals: 24, assists: 4 },
    { name: "Kevin De Bruyne", teamId: teamIds[0], position: "MID" as const, xg: "0.25", xa: "0.65", minutes: 1980, appearances: 22, goals: 6, assists: 16 },
    { name: "Phil Foden", teamId: teamIds[0], position: "MID" as const, xg: "0.35", xa: "0.35", minutes: 2340, appearances: 26, goals: 10, assists: 8 },
    // Liverpool players
    { name: "Mohamed Salah", teamId: teamIds[1], position: "FWD" as const, xg: "0.60", xa: "0.40", minutes: 2700, appearances: 30, goals: 18, assists: 12 },
    { name: "Darwin Nunez", teamId: teamIds[1], position: "FWD" as const, xg: "0.55", xa: "0.20", minutes: 2160, appearances: 24, goals: 14, assists: 5 },
    { name: "Virgil van Dijk", teamId: teamIds[1], position: "DEF" as const, xg: "0.10", xa: "0.05", minutes: 2700, appearances: 30, goals: 3, assists: 2 },
    // Arsenal players
    { name: "Bukayo Saka", teamId: teamIds[2], position: "FWD" as const, xg: "0.40", xa: "0.45", minutes: 2610, appearances: 29, goals: 12, assists: 13 },
    { name: "Martin Odegaard", teamId: teamIds[2], position: "MID" as const, xg: "0.30", xa: "0.50", minutes: 2520, appearances: 28, goals: 8, assists: 14 },
    { name: "Declan Rice", teamId: teamIds[2], position: "MID" as const, xg: "0.15", xa: "0.15", minutes: 2700, appearances: 30, goals: 5, assists: 5 },
    // Real Madrid players
    { name: "Vinicius Jr", teamId: teamIds[8], position: "FWD" as const, xg: "0.55", xa: "0.50", minutes: 2430, appearances: 27, goals: 16, assists: 14 },
    { name: "Jude Bellingham", teamId: teamIds[8], position: "MID" as const, xg: "0.45", xa: "0.30", minutes: 2520, appearances: 28, goals: 14, assists: 9 },
    { name: "Federico Valverde", teamId: teamIds[8], position: "MID" as const, xg: "0.20", xa: "0.25", minutes: 2610, appearances: 29, goals: 7, assists: 7 },
    // Barcelona players
    { name: "Robert Lewandowski", teamId: teamIds[9], position: "FWD" as const, xg: "0.70", xa: "0.15", minutes: 2340, appearances: 26, goals: 20, assists: 4 },
    { name: "Pedri", teamId: teamIds[9], position: "MID" as const, xg: "0.20", xa: "0.40", minutes: 2250, appearances: 25, goals: 6, assists: 10 },
    { name: "Lamine Yamal", teamId: teamIds[9], position: "FWD" as const, xg: "0.35", xa: "0.45", minutes: 2160, appearances: 24, goals: 9, assists: 12 },
    // Bayern players
    { name: "Harry Kane", teamId: teamIds[16], position: "FWD" as const, xg: "0.80", xa: "0.25", minutes: 2610, appearances: 29, goals: 26, assists: 6 },
    { name: "Jamal Musiala", teamId: teamIds[16], position: "MID" as const, xg: "0.35", xa: "0.40", minutes: 2340, appearances: 26, goals: 10, assists: 10 },
    { name: "Leroy Sane", teamId: teamIds[16], position: "FWD" as const, xg: "0.30", xa: "0.35", minutes: 2160, appearances: 24, goals: 8, assists: 9 },
    // Inter players
    { name: "Lautaro Martinez", teamId: teamIds[12], position: "FWD" as const, xg: "0.65", xa: "0.20", minutes: 2520, appearances: 28, goals: 22, assists: 5 },
    { name: "Nicolo Barella", teamId: teamIds[12], position: "MID" as const, xg: "0.20", xa: "0.35", minutes: 2430, appearances: 27, goals: 6, assists: 10 },
    { name: "Hakan Calhanoglu", teamId: teamIds[12], position: "MID" as const, xg: "0.20", xa: "0.40", minutes: 2520, appearances: 28, goals: 6, assists: 12 },
    // PSG players
    { name: "Kylian Mbappe", teamId: teamIds[19], position: "FWD" as const, xg: "0.75", xa: "0.30", minutes: 2430, appearances: 27, goals: 28, assists: 8 },
    { name: "Ousmane Dembele", teamId: teamIds[19], position: "FWD" as const, xg: "0.35", xa: "0.40", minutes: 2160, appearances: 24, goals: 10, assists: 11 },
    { name: "Vitinha", teamId: teamIds[19], position: "MID" as const, xg: "0.15", xa: "0.30", minutes: 2340, appearances: 26, goals: 5, assists: 9 },
  ];

  await db.insert(players).values(playerData);

  // Insert Matches (mix of scheduled and finished)
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const matchData = [
    // Finished matches
    { homeTeamId: teamIds[0], awayTeamId: teamIds[1], leagueId: plId, matchDate: new Date(now.getTime() - 7 * oneDay), homeGoals: 2, awayGoals: 1, homeXg: "2.1", awayXg: "0.9", status: "FINISHED" as const, oddsHome: "1.80", oddsDraw: "3.60", oddsAway: "4.20" },
    { homeTeamId: teamIds[2], awayTeamId: teamIds[3], leagueId: plId, matchDate: new Date(now.getTime() - 6 * oneDay), homeGoals: 3, awayGoals: 0, homeXg: "2.5", awayXg: "0.5", status: "FINISHED" as const, oddsHome: "1.45", oddsDraw: "4.50", oddsAway: "6.50" },
    { homeTeamId: teamIds[8], awayTeamId: teamIds[9], leagueId: laligaId, matchDate: new Date(now.getTime() - 5 * oneDay), homeGoals: 2, awayGoals: 2, homeXg: "1.8", awayXg: "1.6", status: "FINISHED" as const, oddsHome: "2.10", oddsDraw: "3.40", oddsAway: "3.30" },
    { homeTeamId: teamIds[12], awayTeamId: teamIds[13], leagueId: serieId, matchDate: new Date(now.getTime() - 4 * oneDay), homeGoals: 1, awayGoals: 0, homeXg: "1.5", awayXg: "0.8", status: "FINISHED" as const, oddsHome: "1.75", oddsDraw: "3.60", oddsAway: "4.80" },
    { homeTeamId: teamIds[16], awayTeamId: teamIds[17], leagueId: bundesId, matchDate: new Date(now.getTime() - 3 * oneDay), homeGoals: 4, awayGoals: 1, homeXg: "2.8", awayXg: "0.9", status: "FINISHED" as const, oddsHome: "1.35", oddsDraw: "5.50", oddsAway: "7.00" },
    // Scheduled matches
    { homeTeamId: teamIds[1], awayTeamId: teamIds[2], leagueId: plId, matchDate: new Date(now.getTime() + 1 * oneDay), homeGoals: 0, awayGoals: 0, homeXg: "0", awayXg: "0", status: "SCHEDULED" as const, oddsHome: "2.40", oddsDraw: "3.40", oddsAway: "2.90" },
    { homeTeamId: teamIds[4], awayTeamId: teamIds[5], leagueId: plId, matchDate: new Date(now.getTime() + 1 * oneDay), homeGoals: 0, awayGoals: 0, homeXg: "0", awayXg: "0", status: "SCHEDULED" as const, oddsHome: "2.10", oddsDraw: "3.50", oddsAway: "3.40" },
    { homeTeamId: teamIds[9], awayTeamId: teamIds[10], leagueId: laligaId, matchDate: new Date(now.getTime() + 2 * oneDay), homeGoals: 0, awayGoals: 0, homeXg: "0", awayXg: "0", status: "SCHEDULED" as const, oddsHome: "1.65", oddsDraw: "4.00", oddsAway: "5.20" },
    { homeTeamId: teamIds[13], awayTeamId: teamIds[14], leagueId: serieId, matchDate: new Date(now.getTime() + 2 * oneDay), homeGoals: 0, awayGoals: 0, homeXg: "0", awayXg: "0", status: "SCHEDULED" as const, oddsHome: "2.20", oddsDraw: "3.30", oddsAway: "3.30" },
    { homeTeamId: teamIds[18], awayTeamId: teamIds[16], leagueId: bundesId, matchDate: new Date(now.getTime() + 3 * oneDay), homeGoals: 0, awayGoals: 0, homeXg: "0", awayXg: "0", status: "SCHEDULED" as const, oddsHome: "3.80", oddsDraw: "3.80", oddsAway: "1.85" },
    { homeTeamId: teamIds[19], awayTeamId: teamIds[20], leagueId: ligueId, matchDate: new Date(now.getTime() + 1 * oneDay), homeGoals: 0, awayGoals: 0, homeXg: "0", awayXg: "0", status: "SCHEDULED" as const, oddsHome: "1.30", oddsDraw: "5.50", oddsAway: "9.00" },
    { homeTeamId: teamIds[6], awayTeamId: teamIds[7], leagueId: plId, matchDate: new Date(now.getTime() + 3 * oneDay), homeGoals: 0, awayGoals: 0, homeXg: "0", awayXg: "0", status: "SCHEDULED" as const, oddsHome: "1.95", oddsDraw: "3.50", oddsAway: "3.80" },
    { homeTeamId: teamIds[10], awayTeamId: teamIds[11], leagueId: laligaId, matchDate: new Date(now.getTime() + 4 * oneDay), homeGoals: 0, awayGoals: 0, homeXg: "0", awayXg: "0", status: "SCHEDULED" as const, oddsHome: "1.55", oddsDraw: "4.20", oddsAway: "5.80" },
    { homeTeamId: teamIds[15], awayTeamId: teamIds[12], leagueId: serieId, matchDate: new Date(now.getTime() + 5 * oneDay), homeGoals: 0, awayGoals: 0, homeXg: "0", awayXg: "0", status: "SCHEDULED" as const, oddsHome: "3.40", oddsDraw: "3.50", oddsAway: "2.10" },
    { homeTeamId: teamIds[3], awayTeamId: teamIds[0], leagueId: plId, matchDate: new Date(now.getTime() + 5 * oneDay), homeGoals: 0, awayGoals: 0, homeXg: "0", awayXg: "0", status: "SCHEDULED" as const, oddsHome: "4.50", oddsDraw: "4.00", oddsAway: "1.70" },
    { homeTeamId: teamIds[5], awayTeamId: teamIds[4], leagueId: plId, matchDate: new Date(now.getTime() + 6 * oneDay), homeGoals: 0, awayGoals: 0, homeXg: "0", awayXg: "0", status: "SCHEDULED" as const, oddsHome: "2.60", oddsDraw: "3.40", oddsAway: "2.70" },
    { homeTeamId: teamIds[7], awayTeamId: teamIds[6], leagueId: plId, matchDate: new Date(now.getTime() + 6 * oneDay), homeGoals: 0, awayGoals: 0, homeXg: "0", awayXg: "0", status: "SCHEDULED" as const, oddsHome: "2.30", oddsDraw: "3.40", oddsAway: "3.00" },
    { homeTeamId: teamIds[14], awayTeamId: teamIds[13], leagueId: serieId, matchDate: new Date(now.getTime() + 7 * oneDay), homeGoals: 0, awayGoals: 0, homeXg: "0", awayXg: "0", status: "SCHEDULED" as const, oddsHome: "2.50", oddsDraw: "3.30", oddsAway: "2.80" },
    { homeTeamId: teamIds[11], awayTeamId: teamIds[8], leagueId: laligaId, matchDate: new Date(now.getTime() + 7 * oneDay), homeGoals: 0, awayGoals: 0, homeXg: "0", awayXg: "0", status: "SCHEDULED" as const, oddsHome: "5.50", oddsDraw: "4.20", oddsAway: "1.55" },
    { homeTeamId: teamIds[17], awayTeamId: teamIds[18], leagueId: bundesId, matchDate: new Date(now.getTime() + 7 * oneDay), homeGoals: 0, awayGoals: 0, homeXg: "0", awayXg: "0", status: "SCHEDULED" as const, oddsHome: "2.40", oddsDraw: "3.60", oddsAway: "2.70" },
  ];

  const insertedMatches = await db.insert(matches).values(matchData).$returningId();

  // Insert match events for finished matches
  const eventData = [
    // Man City 2:1 Liverpool
    { matchId: insertedMatches[0].id, minute: 23, type: "GOAL" as const, playerName: "E. Haaland", team: "HOME" as const },
    { matchId: insertedMatches[0].id, minute: 45, type: "GOAL" as const, playerName: "K. De Bruyne", team: "HOME" as const },
    { matchId: insertedMatches[0].id, minute: 67, type: "GOAL" as const, playerName: "M. Salah", team: "AWAY" as const },
    // Arsenal 3:0 Man Utd
    { matchId: insertedMatches[1].id, minute: 15, type: "GOAL" as const, playerName: "B. Saka", team: "HOME" as const },
    { matchId: insertedMatches[1].id, minute: 38, type: "GOAL" as const, playerName: "M. Odegaard", team: "HOME" as const },
    { matchId: insertedMatches[1].id, minute: 72, type: "GOAL" as const, playerName: "G. Jesus", team: "HOME" as const },
    // Real Madrid 2:2 Barcelona
    { matchId: insertedMatches[2].id, minute: 12, type: "GOAL" as const, playerName: "V. Jr", team: "HOME" as const },
    { matchId: insertedMatches[2].id, minute: 34, type: "GOAL" as const, playerName: "R. Lewandowski", team: "AWAY" as const },
    { matchId: insertedMatches[2].id, minute: 56, type: "GOAL" as const, playerName: "J. Bellingham", team: "HOME" as const },
    { matchId: insertedMatches[2].id, minute: 89, type: "GOAL" as const, playerName: "L. Yamal", team: "AWAY" as const },
    // Inter 1:0 AC Milan
    { matchId: insertedMatches[3].id, minute: 67, type: "GOAL" as const, playerName: "L. Martinez", team: "HOME" as const },
    // Bayern 4:1 Dortmund
    { matchId: insertedMatches[4].id, minute: 8, type: "GOAL" as const, playerName: "H. Kane", team: "HOME" as const },
    { matchId: insertedMatches[4].id, minute: 22, type: "GOAL" as const, playerName: "J. Musiala", team: "HOME" as const },
    { matchId: insertedMatches[4].id, minute: 41, type: "GOAL" as const, playerName: "H. Kane", team: "HOME" as const },
    { matchId: insertedMatches[4].id, minute: 55, type: "GOAL" as const, playerName: "L. Sane", team: "HOME" as const },
    { matchId: insertedMatches[4].id, minute: 78, type: "GOAL" as const, playerName: "M. Reus", team: "AWAY" as const },
  ];

  await db.insert(matchEvents).values(eventData);

  console.log("Seed completed successfully!");
}

seed().catch(console.error);
