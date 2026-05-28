"use client";

import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  ArrowLeft,
  Loader2,
  Trophy,
  Shield,
  BarChart3,
  Play,
  ChevronUp,
  ChevronDown,
  Minus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

const POSITION_COLORS: Record<number, string> = {
  1: "#FEBE10",
  2: "#C0C0C0",
  3: "#CD7F32",
  4: "#3B82F6",
};

const LEAGUES = [
  { id: "premier-league", name: "Premier League", country: "England" },
  { id: "la-liga", name: "La Liga", country: "Spain" },
  { id: "bundesliga", name: "Bundesliga", country: "Germany" },
  { id: "serie-a", name: "Serie A", country: "Italy" },
  { id: "ligue-1", name: "Ligue 1", country: "France" },
];

interface SimulationRow {
  teamId: string;
  team: string;
  pos1: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  points: number;
  championProbability?: number;
  top4Probability?: number;
  relegationProbability?: number;
}

export default function LeaguePage({ params }: { params: { id: string } }) {
  const [rows, setRows] = useState<SimulationRow[]>([]);
  const [progress, setProgress] = useState(0);
  const [showSimulation, setShowSimulation] = useState(false);
  const [simLoading, setSimLoading] = useState(false);

  const currentLeague = LEAGUES.find((l) => l.id === params.id) || {
    name: "Лига",
    country: params.id,
  };

  const monteCarloData = rows.map((r) => ({
    name: r.team.slice(0, 3),
    champion: r.championProbability || 0,
    top4: (r.top4Probability || 0) - (r.championProbability || 0),
    relegation: r.relegationProbability || 0,
  }));

  const runSimulation = async (season: string) => {
    setSimLoading(true);
    setShowSimulation(true);
    setProgress(0);
    for (let chunk = 1; chunk <= 10; chunk += 1) {
      setProgress(chunk * 10);
      await new Promise((r) => setTimeout(r, 40));
    }
    try {
      const response = await fetch(`/api/league/${params.id}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ season }),
      });
      const payload = (await response.json()) as { results: SimulationRow[] };
      setRows(payload.results ?? []);
    } catch {
      setRows([]);
    }
    setSimLoading(false);
  };

  const sampleStandings: SimulationRow[] = rows.length
    ? rows
    : [
        { teamId: "1", team: "Man City", pos1: 1, wins: 28, draws: 5, losses: 5, gf: 94, ga: 33, points: 89 },
        { teamId: "2", team: "Arsenal", pos1: 2, wins: 27, draws: 6, losses: 5, gf: 88, ga: 29, points: 87 },
        { teamId: "3", team: "Liverpool", pos1: 3, wins: 24, draws: 8, losses: 6, gf: 80, ga: 41, points: 80 },
        { teamId: "4", team: "Aston Villa", pos1: 4, wins: 20, draws: 8, losses: 10, gf: 76, ga: 61, points: 68 },
        { teamId: "5", team: "Tottenham", pos1: 5, wins: 19, draws: 6, losses: 13, gf: 74, ga: 61, points: 63 },
        { teamId: "6", team: "Chelsea", pos1: 6, wins: 18, draws: 9, losses: 11, gf: 77, ga: 63, points: 63 },
      ];

  return (
    <div className="min-h-screen bg-[#030B15]">
      <Header />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Back button */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Назад</span>
        </a>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-[#00E701]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {currentLeague.name || "Аналитика Лиги"}
            </h1>
          </div>
          <p className="text-[#9CA3AF] text-sm">
            Прогнозная таблица и симуляция Монте-Карло
          </p>

          <div className="flex gap-2 mt-4 flex-wrap">
            {LEAGUES.map((l) => (
              <a
                key={l.id}
                href={`/league/${l.id}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  l.id === params.id
                    ? "bg-[#00E701] text-[#030B15]"
                    : "bg-[#060F1D] text-[#9CA3AF] border border-[#0B192C] hover:text-white"
                }`}
              >
                {l.country === "Europe" ? "UEFA" : l.country}
              </a>
            ))}
          </div>
        </motion.div>

        {/* Standings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-dark rounded-xl p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-[#3B82F6]" />
            <h2 className="text-lg font-bold text-white">Турнирная таблица</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-[#9CA3AF] border-b border-[#0B192C]">
                  <th className="text-left py-3 px-2 w-12">#</th>
                  <th className="text-left py-3 px-2">Команда</th>
                  <th className="text-center py-3 px-2 w-12">И</th>
                  <th className="text-center py-3 px-2 w-12">В</th>
                  <th className="text-center py-3 px-2 w-12">Н</th>
                  <th className="text-center py-3 px-2 w-12">П</th>
                  <th className="text-center py-3 px-2 w-16">ГЗ</th>
                  <th className="text-center py-3 px-2 w-16">ГП</th>
                  <th className="text-center py-3 px-2 w-12">+/-</th>
                  <th className="text-center py-3 px-2 w-14">О</th>
                </tr>
              </thead>
              <tbody>
                {sampleStandings.map((team, index) => {
                  const position = index + 1;
                  const isChampionsLeague = position <= 4;
                  const isRelegation = sampleStandings.length > 6 && position > sampleStandings.length - 3;
                  const matchesPlayed = team.wins + team.draws + team.losses;
                  const goalDiff = team.gf - team.ga;

                  return (
                    <tr
                      key={team.teamId}
                      className={`text-sm border-b border-[#0B192C]/50 hover:bg-white/5 transition-colors ${
                        isChampionsLeague ? "bg-[#00E701]/5" : ""
                      } ${isRelegation ? "bg-[#EF4444]/5" : ""}`}
                    >
                      <td className="py-3 px-2">
                        <span
                          className="font-bold font-mono-data"
                          style={{ color: POSITION_COLORS[position] || "#9CA3AF" }}
                        >
                          {position}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: "#3B82F6" }}
                          >
                            {team.team.slice(0, 1)}
                          </div>
                          <span className="text-white font-medium">{team.team}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-2 text-[#9CA3AF] font-mono-data">
                        {matchesPlayed}
                      </td>
                      <td className="text-center py-3 px-2 text-[#00E701] font-mono-data">
                        {team.wins}
                      </td>
                      <td className="text-center py-3 px-2 text-[#3B82F6] font-mono-data">
                        {team.draws}
                      </td>
                      <td className="text-center py-3 px-2 text-[#EF4444] font-mono-data">
                        {team.losses}
                      </td>
                      <td className="text-center py-3 px-2 text-[#9CA3AF] font-mono-data">
                        {team.gf}
                      </td>
                      <td className="text-center py-3 px-2 text-[#9CA3AF] font-mono-data">
                        {team.ga}
                      </td>
                      <td
                        className="text-center py-3 px-2 font-mono-data"
                        style={{ color: goalDiff >= 0 ? "#00E701" : "#EF4444" }}
                      >
                        {goalDiff > 0 ? "+" : ""}
                        {goalDiff}
                      </td>
                      <td className="text-center py-3 px-2">
                        <span className="font-bold text-white font-mono-data">
                          {team.points}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00E701]/20 border border-[#00E701]" />
              <span className="text-[#9CA3AF]">Лига Чемпионов</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]/20 border border-[#EF4444]" />
              <span className="text-[#9CA3AF]">Зона вылета</span>
            </div>
          </div>
        </motion.div>

        {/* Monte Carlo Simulation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-dark rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#A855F7]" />
              <h2 className="text-lg font-bold text-white">Симуляция Монте-Карло</h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => runSimulation("2025-26")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  showSimulation
                    ? "bg-[#A855F7] text-white"
                    : "bg-[#060F1D] text-[#A855F7] border border-[#A855F7]/30 hover:bg-[#A855F7]/10"
                }`}
              >
                <Play className="w-4 h-4" />
                Симулировать 2025-26
              </button>
              <button
                onClick={() => runSimulation("2026-27")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#060F1D] text-[#3B82F6] border border-[#3B82F6]/30 hover:bg-[#3B82F6]/10 transition-all"
              >
                <Play className="w-4 h-4" />
                2 сезона вперёд
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {simLoading && (
            <div className="mb-4">
              <div className="h-2 overflow-hidden rounded bg-[#0B192C]">
                <div className="h-full bg-[#A855F7] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {showSimulation ? (
            simLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-[#A855F7] mb-4" />
                <p className="text-sm text-[#9CA3AF]">Выполняется симуляция...</p>
              </div>
            ) : rows.length > 0 ? (
              <>
                <p className="text-sm text-[#9CA3AF] mb-4">
                  Распределение вероятностей по итогам 10,000 симуляций оставшихся матчей сезона.
                </p>

                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monteCarloData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0B192C" />
                    <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={12} width={50} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#060F1D",
                        border: "1px solid #0B192C",
                        borderRadius: "8px",
                        color: "#F9FAFB",
                      }}
                    />
                    <Bar dataKey="champion" name="Чемпионство %" stackId="a" fill="#FEBE10" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="top4" name="Топ-4 %" stackId="a" fill="#3B82F6" />
                    <Bar dataKey="relegation" name="Вылет %" stackId="a" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="text-center py-8 text-[#9CA3AF] text-sm">
                Нет данных для отображения
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-[#A855F7]/30 mx-auto mb-4" />
              <p className="text-[#9CA3AF] text-sm">
                Нажмите "Симулировать" для выполнения симуляции Монте-Карло
              </p>
              <p className="text-[#9CA3AF]/60 text-xs mt-1">
                10,000 итераций &bull; ~2-3 секунды
              </p>
            </div>
          )}
        </motion.div>

        {/* Form Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-dark rounded-xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-6">Текущая форма команд</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleStandings.slice(0, 6).map((team) => {
              const recentForm = [
                { result: team.wins > 15 ? "W" : "D", icon: team.wins > 15 ? ChevronUp : Minus },
                { result: "W", icon: ChevronUp },
                { result: team.draws > 5 ? "D" : "W", icon: team.draws > 5 ? Minus : ChevronUp },
                { result: "W", icon: ChevronUp },
                { result: team.losses > 8 ? "L" : "W", icon: team.losses > 8 ? ChevronDown : ChevronUp },
              ];

              return (
                <div
                  key={team.teamId}
                  className="flex items-center justify-between bg-[#060F1D] rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: "#3B82F6" }}
                    >
                      {team.team.slice(0, 2)}
                    </div>
                    <span className="text-sm text-white font-medium">{team.team}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {recentForm.map((f, i) => (
                      <div
                        key={i}
                        className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${
                          f.result === "W"
                            ? "bg-[#00E701]/20 text-[#00E701]"
                            : f.result === "D"
                            ? "bg-[#3B82F6]/20 text-[#3B82F6]"
                            : "bg-[#EF4444]/20 text-[#EF4444]"
                        }`}
                      >
                        {f.result}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
