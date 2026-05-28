"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  ArrowLeft,
  ArrowRightLeft,
  Loader2,
  User,
  Target,
  TrendingUp,
  Shirt,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";

interface SimResult {
  newTeamXg: number;
  newTeamXga: number;
  impact: string;
}

const SAMPLE_PLAYERS = [
  { id: "1", name: "Erling Haaland", team: "Man City", position: "FWD", xg: "0.89", color: "#6CAFE0" },
  { id: "2", name: "Bukayo Saka", team: "Arsenal", position: "MID", xg: "0.52", color: "#EF0107" },
  { id: "3", name: "Mohamed Salah", team: "Liverpool", position: "FWD", xg: "0.68", color: "#C8102E" },
  { id: "4", name: "Phil Foden", team: "Man City", position: "MID", xg: "0.45", color: "#6CAFE0" },
  { id: "5", name: "Ollie Watkins", team: "Aston Villa", position: "FWD", xg: "0.55", color: "#670E36" },
  { id: "6", name: "Virgil van Dijk", team: "Liverpool", position: "DEF", xg: "0.08", color: "#C8102E" },
];

const SAMPLE_TEAMS = [
  { id: "t1", name: "Man City", color: "#6CAFE0" },
  { id: "t2", name: "Arsenal", color: "#EF0107" },
  { id: "t3", name: "Liverpool", color: "#C8102E" },
  { id: "t4", name: "Aston Villa", color: "#670E36" },
  { id: "t5", name: "Tottenham", color: "#132257" },
  { id: "t6", name: "Chelsea", color: "#034694" },
  { id: "t7", name: "Man United", color: "#DA291C" },
  { id: "t8", name: "Newcastle", color: "#241F20" },
];

export default function TransferPage() {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [fromTeam, setFromTeam] = useState<string | null>(null);
  const [toTeam, setToTeam] = useState<string | null>(null);
  const [result, setResult] = useState<SimResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  const selectedPlayerData = SAMPLE_PLAYERS.find((p) => p.id === selectedPlayer);

  const simulate = async () => {
    if (!selectedPlayer || !fromTeam || !toTeam) return;
    setSimLoading(true);
    try {
      const response = await fetch("/api/transfer/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: selectedPlayer, fromTeamId: fromTeam, toTeamId: toTeam }),
      });
      setResult(await response.json());
    } catch {
      setResult(null);
    }
    setSimLoading(false);
  };

  const comparisonData = result
    ? [
        { metric: "xG", before: 1.8, after: result.newTeamXg },
        { metric: "xGA", before: 1.2, after: result.newTeamXga },
      ]
    : [];

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
          <div className="flex items-center gap-3 mb-2">
            <ArrowRightLeft className="w-6 h-6 text-[#A855F7]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Виртуальный трансферный симулятор
            </h1>
          </div>
          <p className="text-[#9CA3AF] text-sm">
            Оцените влияние трансфера игрока на командный потенциал
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-dark rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-[#00E701]" />
              <h2 className="text-lg font-bold text-white">Выбор игрока</h2>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {SAMPLE_PLAYERS.map((player) => (
                <button
                  key={player.id}
                  onClick={() => {
                    setSelectedPlayer(player.id);
                    setFromTeam(player.team);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                    selectedPlayer === player.id
                      ? "bg-[#00E701]/10 border border-[#00E701]/30"
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.position === "FWD" && <Target className="w-4 h-4" />}
                    {player.position === "MID" && <TrendingUp className="w-4 h-4" />}
                    {player.position === "DEF" && <Shirt className="w-4 h-4" />}
                    {player.position === "GK" && <User className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{player.name}</p>
                    <p className="text-xs text-[#9CA3AF]">
                      {player.team} &bull; {player.position} &bull; xG: {player.xg}
                    </p>
                  </div>
                  {selectedPlayer === player.id && (
                    <ChevronRight className="w-4 h-4 text-[#00E701] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Team Selection & Simulation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Target Team Selection */}
            <div className="card-dark rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Команда назначения</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {SAMPLE_TEAMS.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => setToTeam(team.id)}
                    disabled={team.name === fromTeam}
                    className={`p-3 rounded-lg border transition-all text-center ${
                      toTeam === team.id
                        ? "border-[#A855F7] bg-[#A855F7]/10"
                        : team.name === fromTeam
                        ? "border-[#0B192C] opacity-30 cursor-not-allowed"
                        : "border-[#0B192C] hover:border-[#9CA3AF]/30 hover:bg-white/5"
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: team.color }}
                    />
                    <p className="text-xs text-white font-medium truncate">{team.name}</p>
                  </button>
                ))}
              </div>

              {selectedPlayer && toTeam && (
                <button
                  onClick={simulate}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-[#A855F7] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#A855F7]/90 transition-all"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                  Симулировать трансфер
                </button>
              )}
            </div>

            {/* Simulation Result */}
            {(simLoading || result) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card-dark rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <ArrowRightLeft className="w-5 h-5 text-[#A855F7]" />
                  <h2 className="text-lg font-bold text-white">Результат симуляции</h2>
                </div>

                {simLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-[#A855F7]" />
                  </div>
                ) : result ? (
                  <div className="space-y-6">
                    {/* Transfer summary */}
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <div
                          className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold mx-auto mb-2"
                          style={{ backgroundColor: selectedPlayerData?.color || "#3B82F6" }}
                        >
                          {(fromTeam || "?")[0]}
                        </div>
                        <p className="text-sm text-white font-medium">{fromTeam}</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <ArrowRightLeft className="w-6 h-6 text-[#A855F7]" />
                        <span className="text-xs text-[#A855F7] font-medium mt-1">
                          {selectedPlayerData?.name}
                        </span>
                      </div>
                      <div className="text-center">
                        <div
                          className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold mx-auto mb-2"
                          style={{
                            backgroundColor:
                              SAMPLE_TEAMS.find((t) => t.id === toTeam)?.color || "#EF4444",
                          }}
                        >
                          {(SAMPLE_TEAMS.find((t) => t.id === toTeam)?.name || "?")[0]}
                        </div>
                        <p className="text-sm text-white font-medium">
                          {SAMPLE_TEAMS.find((t) => t.id === toTeam)?.name}
                        </p>
                      </div>
                    </div>

                    {/* Impact stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#060F1D] rounded-lg p-4 text-center border border-[#EF4444]/20">
                        <p className="text-xs text-[#9CA3AF] mb-1">Новый xG команды</p>
                        <p className="text-2xl font-bold text-[#00E701] font-mono-data">
                          {result.newTeamXg.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-[#060F1D] rounded-lg p-4 text-center border border-[#00E701]/20">
                        <p className="text-xs text-[#9CA3AF] mb-1">Влияние</p>
                        <p className="text-2xl font-bold text-[#3B82F6] font-mono-data">
                          {result.impact}
                        </p>
                      </div>
                    </div>

                    {/* Comparison chart */}
                    <div>
                      <p className="text-sm text-[#9CA3AF] mb-3">Изменение xG после трансфера</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={comparisonData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#0B192C" />
                          <XAxis dataKey="metric" stroke="#9CA3AF" fontSize={12} />
                          <YAxis stroke="#9CA3AF" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#060F1D",
                              border: "1px solid #0B192C",
                              borderRadius: "8px",
                              color: "#F9FAFB",
                            }}
                          />
                          <Bar dataKey="before" name="До" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="after" name="После" fill="#00E701" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Player skills */}
                    {selectedPlayerData && (
                      <div>
                        <p className="text-sm text-[#9CA3AF] mb-3">Индивидуальные показатели</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-[#9CA3AF] mb-1">xG: {selectedPlayerData.xg}</p>
                            <div className="w-full h-2 bg-[#0B192C] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#00E701] rounded-full"
                                style={{ width: `${Math.min(100, parseFloat(selectedPlayerData.xg) * 100)}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-[#9CA3AF] mb-1">Позиция: {selectedPlayerData.position}</p>
                            <div className="w-full h-2 bg-[#0B192C] rounded-full overflow-hidden">
                              <div className="h-full bg-[#A855F7] rounded-full" style={{ width: "75%" }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
