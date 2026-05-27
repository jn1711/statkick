"use client";

import { useEffect, useState } from "react";

const LEAGUES = [
  { id: "premier-league", name: "Premier League" },
  { id: "la-liga", name: "La Liga" },
  { id: "bundesliga", name: "Bundesliga" },
  { id: "serie-a", name: "Serie A" },
  { id: "ligue-1", name: "Ligue 1" },
  { id: "champions-league", name: "UCL" },
  { id: "world-cup-2026", name: "World Cup 2026" },
];

interface MatchCard {
  id: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  date: string;
}

export default function HomePage() {
  const [leagueId, setLeagueId] = useState(LEAGUES[0].id);
  const [matches, setMatches] = useState<MatchCard[]>([]);

  useEffect(() => {
    fetch(`/api/league/${leagueId}/matches`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setMatches(Array.isArray(data) ? data : []))
      .catch(() => setMatches([]));
  }, [leagueId]);

  return (
    <main className="min-h-screen bg-[#0B0F19] p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-semibold">StatKick</h1>
        <select
          className="rounded-md border border-slate-700 bg-[#1F2937] p-2"
          value={leagueId}
          onChange={(e) => setLeagueId(e.target.value)}
        >
          {LEAGUES.map((league) => (
            <option key={league.id} value={league.id}>
              {league.name}
            </option>
          ))}
        </select>
        <section className="grid gap-4 md:grid-cols-2">
          {matches.map((match) => (
            <div key={match.id} className="rounded-lg bg-[#1F2937] p-4">
              <p className="text-lg font-medium">
                {match.homeTeam.name} vs {match.awayTeam.name}
              </p>
              <p className="text-sm text-slate-300">{new Date(match.date).toLocaleString()}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
